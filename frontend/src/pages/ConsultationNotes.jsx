import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
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
  Search, Filter, Eye, TrendingUp, User, BookOpen, Award
} from 'lucide-react';

const ConsultationNotes = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Rediriger si pas admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);
  
  const [loading, setLoading] = useState(true);
  
  // Données
  const [periodes, setPeriodes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [elevesWithNotes, setElevesWithNotes] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [notes, setNotes] = useState([]);
  
  // Filtres
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      const [periodesData, classesData, matieresData] = await Promise.all([
        periodeService.getAll(),
        classeService.getAll(),
        matiereService.getAll()
      ]);

      const periodesArray = periodesData.results || periodesData || [];
      const classesArray = classesData.results || classesData || [];
      
      setPeriodes(periodesArray);
      setClasses(classesArray);
      setMatieres(matieresData.results || matieresData || []);
      
      // Présélectionner automatiquement les premiers éléments
      if (periodesArray.length > 0) {
        setSelectedPeriode(periodesArray[0].id);
      }
      
      if (classesArray.length > 0) {
        setSelectedClasse(classesArray[0].id);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadElevesAndNotes = async () => {
    if (!selectedPeriode || !selectedClasse) {
      return;
    }
    
    try {
      // Charger les moyennes par classe
      const moyennesData = await moyenneService.getClasseMoyennes({
        classe: selectedClasse,
        periode: selectedPeriode
      });
      
      if (moyennesData.eleves) {
        setElevesWithNotes(moyennesData.eleves);
      }
      
    } catch (error) {
      console.error('Erreur:', error);
    }
  };


  const filteredEleves = elevesWithNotes.filter(eleve =>
    eleve.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eleve.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredEleves.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEleves = filteredEleves.slice(startIndex, endIndex);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClasse, selectedPeriode]);

  const getEleveNotes = (eleveId) => {
    return notes.filter(note => note.eleve === eleveId);
  };

  const getStatutNote = (moyenne) => {
    if (!moyenne) return { label: 'Non noté', color: 'gray' };
    if (moyenne >= 8) return { label: 'Très Bien', color: 'green' };
    if (moyenne >= 7) return { label: 'Bien', color: 'blue' };
    if (moyenne >= 6) return { label: 'Assez Bien', color: 'indigo' };
    if (moyenne >= 5) return { label: 'Passable', color: 'yellow' };
    return { label: 'Insuffisant', color: 'red' };
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Consultation des Notes</h1>
            <p className="text-gray-600 mt-1">Visualisation en lecture seule des notes et moyennes des élèves</p>
          </div>
        </div>

        {/* Message Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 font-medium">Mode consultation uniquement</p>
              <p className="text-sm text-blue-700 mt-1">
                Vous pouvez consulter les notes des élèves mais pas les modifier. 
                Seuls les enseignants peuvent saisir et modifier les notes.
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période *
              </label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="">Sélectionner une période</option>
                {periodes.map((periode) => (
                  <option key={periode.id} value={periode.id}>
                    {periode.nom_display || periode.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe *
              </label>
              <select
                value={selectedClasse}
                onChange={(e) => setSelectedClasse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="">Sélectionner une classe</option>
                {classes.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nom ou matricule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {selectedClasse && selectedPeriode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <User className="w-6 h-6 text-gray-700" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Élèves</p>
                  <p className="text-2xl font-bold text-gray-900">{elevesWithNotes.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-gray-700" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Avec notes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {elevesWithNotes.filter(e => e.has_notes).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-gray-700" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Moyenne classe</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {elevesWithNotes.length > 0 
                      ? (elevesWithNotes.reduce((acc, e) => acc + (e.moyenne_generale || 0), 0) / elevesWithNotes.filter(e => e.moyenne_generale).length).toFixed(2)
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des élèves avec moyennes */}
        {selectedClasse && selectedPeriode ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredEleves.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Aucun élève trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Élève
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Moyenne Générale
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appréciation
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentEleves.map((eleve) => {
                      const statut = getStatutNote(eleve.moyenne_generale);
                      return (
                        <tr key={eleve.eleve_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {eleve.matricule}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {eleve.nom_complet}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {eleve.notes_count || 0} note(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {eleve.moyenne_generale ? eleve.moyenne_generale.toFixed(2) : '-'} / 10
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${statut.color}-100 text-${statut.color}-800`}>
                              {statut.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => navigate(`/notes/eleve/${eleve.eleve_id}?readonly=true`)}
                              className="text-gray-600 hover:text-gray-900 flex items-center gap-1 ml-auto"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Voir détails</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {filteredEleves.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-700">
                      Affichage de {startIndex + 1} à {Math.min(endIndex, filteredEleves.length)} sur {filteredEleves.length} élèves
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Par page:</label>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={9999}>Tous</option>
                      </select>
                    </div>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Précédent
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 border rounded-lg text-sm ${
                              currentPage === pageNum
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Suivant
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Sélectionnez une période et une classe pour voir les notes
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConsultationNotes;
