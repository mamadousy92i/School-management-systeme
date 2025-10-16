import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import NotesImportModal from '../components/NotesImportModal';
import {
  periodeService,
  classeService,
  eleveService,
  noteService,
  moyenneService,
  matiereService,
  typeEvaluationService
} from '../services/api';
import { 
  Grid, List, Search, Filter, Eye, TrendingUp, User, Upload, Download, X, AlertCircle, CheckCircle 
} from 'lucide-react';

const Notes = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Bloquer l'accès aux administrateurs
  useEffect(() => {
    if (isAdmin()) {
      alert('La saisie de notes est réservée aux enseignants. Les administrateurs peuvent consulter les notes dans le panneau d\'administration Django.');
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);
  
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'
  
  // Données
  const [periodes, setPeriodes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [elevesWithNotes, setElevesWithNotes] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [typesEval, setTypesEval] = useState([]);
  
  // Filtres
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'with_notes', 'without_notes'
  
  // Import CSV
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClasse && selectedPeriode) {
      loadElevesAndNotes();
    } else {
      setEleves([]);
      setElevesWithNotes([]);
    }
  }, [selectedClasse, selectedPeriode]);

  const loadData = async () => {
    try {
      const [periodesData, classesData, matieresData, typesData] = await Promise.all([
        periodeService.getAll(),
        classeService.getAll(),
        matiereService.getAll(),
        typeEvaluationService.getAll()
      ]);

      setPeriodes(periodesData.results || periodesData || []);
      setClasses(classesData.results || classesData || []);
      setMatieres(matieresData.results || matieresData || []);
      setTypesEval(typesData.results || typesData || []);
      
      // Auto-sélectionner pour les enseignants (première classe si plusieurs)
      if (!isAdmin()) {
        const classes = classesData.results || classesData || [];
        if (classes.length > 0) {
          setSelectedClasse(classes[0].id);
        }
      }
      
      // Auto-sélectionner la première période
      if (periodesData.results?.length > 0 || periodesData?.length > 0) {
        const firstPeriode = periodesData.results?.[0] || periodesData[0];
        setSelectedPeriode(firstPeriode.id);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadElevesAndNotes = async () => {
    if (!selectedPeriode || !selectedClasse) {
      console.log('Période ou classe non sélectionnée');
      return;
    }
    
    try {
      console.log('Chargement des élèves et moyennes pour classe:', selectedClasse, 'période:', selectedPeriode);
      
      // Charger les élèves ET les moyennes en parallèle
      const [elevesData, moyennesResponse] = await Promise.all([
        eleveService.getAll({ classe: selectedClasse }),
        moyenneService.getClasseMoyennes({
          classe: selectedClasse,
          periode: selectedPeriode
        })
      ]);
      
      const elevesListe = elevesData.results || elevesData || [];
      setEleves(elevesListe);
      
      console.log('Élèves chargés:', elevesListe.length);
      console.log('Données moyennes reçues:', moyennesResponse);
      
      // Enrichir les élèves avec les données de moyennes du backend
      const elevesEnriched = elevesListe.map(eleve => {
        // Trouver les données de cet élève dans la réponse backend
        const eleveData = moyennesResponse.eleves?.find(e => e.eleve_id === eleve.id);
        
        if (eleveData) {
          console.log(`${eleve.nom} ${eleve.prenom}: ${eleveData.notes_count} notes, moyenne ${eleveData.moyenne_generale}`);
          
          return {
            ...eleve,
            notesCount: eleveData.notes_count,
            moyenneGenerale: eleveData.moyenne_generale ? eleveData.moyenne_generale.toFixed(2) : null,
            hasNotes: eleveData.has_notes,
            nombreMatieres: eleveData.nombre_matieres
          };
        }
        
        // Si pas de données pour cet élève
        return {
          ...eleve,
          notesCount: 0,
          moyenneGenerale: null,
          hasNotes: false,
          nombreMatieres: 0
        };
      });
      
      console.log('Total élèves enrichis:', elevesEnriched.length);
      setElevesWithNotes(elevesEnriched);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setElevesWithNotes([]);
    }
  };

  const filteredEleves = elevesWithNotes.filter(eleve => {
    // Filtre de recherche
    const matchesSearch = 
      eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre de statut
    let matchesStatus = true;
    if (filterStatus === 'with_notes') {
      matchesStatus = eleve.hasNotes;
    } else if (filterStatus === 'without_notes') {
      matchesStatus = !eleve.hasNotes;
    }
    
    return matchesSearch && matchesStatus;
  });

  console.log('Élèves avec notes:', elevesWithNotes.length);
  console.log('Élèves filtrés:', filteredEleves.length);
  console.log('Premier élève filtré:', filteredEleves[0]);

  const getMention = (moyenne) => {
    if (!moyenne) return { text: '-', color: 'text-gray-400' };
    const avg = parseFloat(moyenne);
    if (avg >= 8) return { text: 'Très Bien', color: 'text-green-600' };
    if (avg >= 7) return { text: 'Bien', color: 'text-blue-600' };
    if (avg >= 6) return { text: 'Assez Bien', color: 'text-yellow-600' };
    if (avg >= 5) return { text: 'Passable', color: 'text-orange-600' };
    return { text: 'Insuffisant', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Notes</h1>
            <p className="text-gray-600 mt-1">
              Consultez et saisissez les notes des élèves
            </p>
          </div>
          {selectedPeriode && selectedClasse && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Upload className="h-5 w-5" />
              <span>Importer CSV</span>
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner</option>
                {periodes.map(p => (
                  <option key={p.id} value={p.id}>{p.nom_display}</option>
                ))}
              </select>
            </div>

            {/* Classe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe {!isAdmin() && classes.length > 1 && '(Vos classes)'}
              </label>
              <select
                value={selectedClasse}
                onChange={(e) => setSelectedClasse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
              {!isAdmin() && classes.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {classes.length} classe(s) assignée(s)
                </p>
              )}
            </div>

            {/* Filtre statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="h-4 w-4 inline mr-1" />
                Statut
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les élèves</option>
                <option value="with_notes">Avec notes</option>
                <option value="without_notes">Sans notes</option>
              </select>
            </div>

            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom, prénom..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Mode d'affichage */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-600">
              {filteredEleves.length} élève(s) affiché(s)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Affichage Liste */}
        {viewMode === 'list' && filteredEleves.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Matricule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nom & Prénom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nombre de notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Moyenne Générale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mention
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEleves.map((eleve) => (
                    <tr key={eleve.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {eleve.matricule}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {eleve.nom} {eleve.prenom}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {eleve.notesCount} note(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {eleve.moyenneGenerale ? (
                          <span className="text-lg font-bold text-blue-600">
                            {eleve.moyenneGenerale}/10
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${getMention(eleve.moyenneGenerale).color}`}>
                          {getMention(eleve.moyenneGenerale).text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/notes/eleve/${eleve.id}`)}
                          className="flex items-center space-x-1 ml-auto px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Détails</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Affichage Grille */}
        {viewMode === 'grid' && filteredEleves.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEleves.map((eleve) => (
              <div key={eleve.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  {eleve.moyenneGenerale && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {eleve.moyenneGenerale}
                      </div>
                      <div className="text-xs text-gray-500">/10</div>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {eleve.nom} {eleve.prenom}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{eleve.matricule}</p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-600">{eleve.notesCount} note(s)</span>
                  <span className={`font-semibold ${getMention(eleve.moyenneGenerale).color}`}>
                    {getMention(eleve.moyenneGenerale).text}
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/notes/eleve/${eleve.id}`)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Eye className="h-4 w-4" />
                  <span>Voir les notes</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Message si aucun élève */}
        {filteredEleves.length === 0 && selectedClasse && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
            <TrendingUp className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <p className="text-yellow-800 font-medium">
              {filterStatus === 'with_notes' && 'Aucun élève avec des notes pour cette période'}
              {filterStatus === 'without_notes' && 'Tous les élèves ont des notes'}
              {filterStatus === 'all' && !searchTerm && 'Aucun élève trouvé'}
              {searchTerm && 'Aucun élève ne correspond à votre recherche'}
            </p>
          </div>
        )}

        {!selectedClasse && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
            <Filter className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <p className="text-blue-800 font-medium">
              Sélectionnez une période et une classe pour voir les notes des élèves
            </p>
          </div>
        )}
      </div>

      {/* Modal d'import CSV */}
      <NotesImportModal
        show={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportFile(null);
          setImportResult(null);
        }}
        selectedPeriode={selectedPeriode}
        selectedClasse={selectedClasse}
        matieres={matieres}
        typesEval={typesEval}
        onImportSuccess={() => {
          loadElevesAndNotes();
          setShowImportModal(false);
        }}
      />
    </Layout>
  );
};

export default Notes;
