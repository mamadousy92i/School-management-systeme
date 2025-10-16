import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { eleveService, classeService, periodeService, moyenneService } from '../services/api';
import { CheckCircle, XCircle, Award, AlertCircle, Users, TrendingUp, TrendingDown, Zap, Filter, Search } from 'lucide-react';

const PassageClasseAmeliore = () => {
  const { isAdmin } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [eleves, setEleves] = useState([]);
  const [elevesWithMoyennes, setElevesWithMoyennes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodes, setPeriodes] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [moyenneMinimale, setMoyenneMinimale] = useState(5);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      loadElevesWithMoyennes();
    }
  }, [selectedClasse]);

  const loadData = async () => {
    try {
      const [classesData, periodesData] = await Promise.all([
        classeService.getAll(),
        periodeService.getAll()
      ]);
      
      setClasses(Array.isArray(classesData) ? classesData : []);
      setPeriodes(Array.isArray(periodesData) ? periodesData : []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setClasses([]);
      setPeriodes([]);
      setLoading(false);
    }
  };

  const loadElevesWithMoyennes = async () => {
    try {
      setLoading(true);
      // Passer statut='tous' pour récupérer TOUS les élèves (actifs, admis, redoublants, etc.)
      const elevesData = await eleveService.getAll({ 
        classe: selectedClasse,
        statut: 'tous'
      });
      const elevesArray = Array.isArray(elevesData) ? elevesData : [];
      
      // Charger les moyennes pour chaque trimestre
      const elevesAvecMoyennes = await Promise.all(
        elevesArray.map(async (eleve) => {
          const moyennesParPeriode = {};
          
          for (const periode of periodes) {
            try {
              const moyennesData = await moyenneService.getAll({
                eleve: eleve.id,
                periode: periode.id
              });
              
              if (Array.isArray(moyennesData) && moyennesData.length > 0) {
                // Calculer la moyenne générale
                const somme = moyennesData.reduce((acc, m) => acc + parseFloat(m.moyenne || 0), 0);
                moyennesParPeriode[periode.id] = {
                  nom: periode.nom,
                  moyenne: moyennesData.length > 0 ? (somme / moyennesData.length).toFixed(2) : '-'
                };
              } else {
                moyennesParPeriode[periode.id] = {
                  nom: periode.nom,
                  moyenne: '-'
                };
              }
            } catch (err) {
              moyennesParPeriode[periode.id] = {
                nom: periode.nom,
                moyenne: '-'
              };
            }
          }
          
          // Calculer la moyenne annuelle
          const moyennesValides = Object.values(moyennesParPeriode)
            .map(m => parseFloat(m.moyenne))
            .filter(m => !isNaN(m));
          
          const moyenneAnnuelle = moyennesValides.length > 0
            ? (moyennesValides.reduce((a, b) => a + b, 0) / moyennesValides.length).toFixed(2)
            : '-';
          
          return {
            ...eleve,
            moyennesParPeriode,
            moyenneAnnuelle
          };
        })
      );
      
      setElevesWithMoyennes(elevesAvecMoyennes);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error);
      setElevesWithMoyennes([]);
      setLoading(false);
    }
  };

  const handleProposerPassage = async (eleveId, statut) => {
    try {
      const result = await eleveService.proposerPassage(eleveId, statut);
      console.log('Statut changé:', result);
      
      // Attendre un peu puis recharger
      await new Promise(resolve => setTimeout(resolve, 300));
      await loadElevesWithMoyennes();
      
      alert(`Statut changé en "${statut}" avec succès !`);
    } catch (error) {
      console.error('Erreur complète:', error);
      alert('Erreur lors du changement de statut: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAdmissionAutomatique = async () => {
    if (!moyenneMinimale || moyenneMinimale < 0 || moyenneMinimale > 10) {
      alert('Veuillez entrer une moyenne valide entre 0 et 10');
      return;
    }

    const elevesAAdmettre = elevesWithMoyennes.filter(
      e => parseFloat(e.moyenneAnnuelle) >= parseFloat(moyenneMinimale) && 
           e.statut !== 'admis'
    );

    if (elevesAAdmettre.length === 0) {
      alert('Aucun élève ne correspond aux critères');
      return;
    }

    const confirmation = window.confirm(
      `Vous allez marquer ${elevesAAdmettre.length} élève(s) comme "admis" (moyenne ≥ ${moyenneMinimale}).\n\nContinuer ?`
    );

    if (!confirmation) return;

    try {
      setLoading(true);
      for (const eleve of elevesAAdmettre) {
        await eleveService.proposerPassage(eleve.id, 'admis');
      }
      alert(`${elevesAAdmettre.length} élève(s) marqué(s) comme admis !`);
      loadElevesWithMoyennes();
      setShowAdmissionModal(false);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'admission automatique');
      setLoading(false);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      actif: { color: 'bg-blue-100 text-blue-800', icon: Users, label: 'Actif' },
      admis: { color: 'bg-green-100 text-green-800', icon: Award, label: 'Admis' },
      redouble: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Redouble' },
    };
    
    const badge = badges[statut] || badges.actif;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  // Filtrer les élèves selon le statut sélectionné et la recherche
  const elevesFiltres = elevesWithMoyennes
    .filter(e => filtreStatut === 'tous' || e.statut === filtreStatut)
    .filter(e => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        e.nom?.toLowerCase().includes(search) ||
        e.prenom?.toLowerCase().includes(search) ||
        e.matricule?.toLowerCase().includes(search)
      );
    });

  const stats = {
    total: elevesWithMoyennes.length,
    actifs: elevesWithMoyennes.filter(e => e.statut === 'actif').length,
    admis: elevesWithMoyennes.filter(e => e.statut === 'admis').length,
    redoublants: elevesWithMoyennes.filter(e => e.statut === 'redouble').length
  };

  if (loading && !selectedClasse) {
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Passages de Classe</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin() 
              ? 'Validez les propositions et effectuez les passages de classe' 
              : 'Proposez le passage ou le redoublement de vos élèves'}
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">✨ Nouveau : Admission automatique</h3>
              <p className="text-sm text-blue-800 mt-1">
                Marquez automatiquement comme "admis" tous les élèves ayant une moyenne supérieure ou égale à un seuil défini.
              </p>
            </div>
          </div>
        </div>

        {/* Sélection de classe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner une classe
          </label>
          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choisir une classe --</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom} ({classe.niveau})
              </option>
            ))}
          </select>
        </div>

        {/* Statistiques et filtres */}
        {selectedClasse && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Élèves</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Actifs</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.actifs}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Admis</p>
                    <p className="text-2xl font-bold text-green-600">{stats.admis}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Redoublants</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.redoublants}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Bouton d'action principal */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-purple-600" />
                    Admission Automatique par Moyenne
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Marquez automatiquement comme "admis" tous les élèves ayant une moyenne ≥ au seuil défini
                  </p>
                </div>
                <button
                  onClick={() => setShowAdmissionModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-lg hover:shadow-xl font-semibold text-base"
                >
                  <Zap className="h-5 w-5" />
                  <span>Lancer l'Admission</span>
                </button>
              </div>
            </div>

            {/* Filtres et Recherche */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={filtreStatut}
                    onChange={(e) => setFiltreStatut(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="tous">Tous les statuts</option>
                    <option value="actif">Actifs uniquement</option>
                    <option value="admis">Admis uniquement</option>
                    <option value="redouble">Redoublants uniquement</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    {elevesFiltres.length} élève(s) affiché(s)
                  </span>
                </div>
                
                <div className="relative flex-1 md:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, prénom ou matricule..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Liste des élèves */}
        {selectedClasse && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : elevesFiltres.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun élève trouvé avec ce filtre</p>
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
                        Nom & Prénom
                      </th>
                      {periodes.slice(0, 3).map(periode => (
                        <th key={periode.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {periode.nom}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Moy. Annuelle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {elevesFiltres.map((eleve) => (
                      <tr key={eleve.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {eleve.matricule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {eleve.nom} {eleve.prenom}
                          </div>
                          <div className="text-sm text-gray-500">{eleve.age} ans</div>
                        </td>
                        {periodes.slice(0, 3).map(periode => (
                          <td key={periode.id} className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`text-sm font-semibold ${
                              eleve.moyennesParPeriode[periode.id]?.moyenne !== '-' &&
                              parseFloat(eleve.moyennesParPeriode[periode.id]?.moyenne) >= 5
                                ? 'text-green-600'
                                : eleve.moyennesParPeriode[periode.id]?.moyenne !== '-'
                                ? 'text-red-600'
                                : 'text-gray-400'
                            }`}>
                              {eleve.moyennesParPeriode[periode.id]?.moyenne || '-'}
                            </span>
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-sm font-bold ${
                            eleve.moyenneAnnuelle !== '-' && parseFloat(eleve.moyenneAnnuelle) >= 5
                              ? 'text-green-600'
                              : eleve.moyenneAnnuelle !== '-'
                              ? 'text-red-600'
                              : 'text-gray-400'
                          }`}>
                            {eleve.moyenneAnnuelle}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatutBadge(eleve.statut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleProposerPassage(eleve.id, 'admis')}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                              title="Marquer comme admis"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Admis
                            </button>
                            <button
                              onClick={() => handleProposerPassage(eleve.id, 'redouble')}
                              className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                              title="Marquer comme redoublant"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Redouble
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Admission Automatique */}
      {showAdmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admission Automatique</h2>
            <p className="text-gray-600 mb-6">
              Tous les élèves ayant une moyenne annuelle supérieure ou égale au seuil seront marqués comme "admis".
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moyenne minimale (sur 10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={moyenneMinimale}
                onChange={(e) => setMoyenneMinimale(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: 5"
              />
              <p className="text-xs text-gray-500 mt-1">
                {elevesWithMoyennes.filter(e => parseFloat(e.moyenneAnnuelle) >= parseFloat(moyenneMinimale || 0)).length} élève(s) concerné(s)
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAdmissionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleAdmissionAutomatique}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PassageClasseAmeliore;
