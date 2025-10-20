import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { eleveService, classeService } from '../services/api';
import { ArrowRight, CheckSquare, Square, Users, AlertTriangle, Search } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const PassageClasseAdmin = () => {
  const { isAdmin } = useAuth();
  const toast = useToast();
  
  // Vérification admin dès le début
  if (!isAdmin()) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-900 mb-2">Accès Refusé</h2>
          <p className="text-red-700">Cette fonctionnalité est réservée aux administrateurs.</p>
        </div>
      </Layout>
    );
  }
  
  const [classes, setClasses] = useState([]);
  const [selectedClasseOrigine, setSelectedClasseOrigine] = useState('');
  const [selectedClasseDestination, setSelectedClasseDestination] = useState('');
  const [eleves, setEleves] = useState([]);
  const [selectedEleves, setSelectedEleves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClasseOrigine) {
      loadEleves();
    } else {
      setEleves([]);
      setSelectedEleves([]);
    }
  }, [selectedClasseOrigine]);

  const loadClasses = async () => {
    try {
      const data = await classeService.getAll();
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      setClasses([]);
    }
  };

  const loadEleves = async () => {
    try {
      setLoading(true);
      // Passer statut='tous' pour récupérer TOUS les élèves (actifs, admis, redoublants, etc.)
      const data = await eleveService.getAll({ 
        classe: selectedClasseOrigine,
        statut: 'tous'
      });
      const elevesArray = Array.isArray(data) ? data : [];
      
      // Filtrer les élèves admis par défaut
      const elevesAdmis = elevesArray.filter(e => e.statut === 'admis');
      setEleves(elevesArray);
      setSelectedEleves(elevesAdmis.map(e => e.id));
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error);
      setEleves([]);
      setSelectedEleves([]);
      setLoading(false);
    }
  };

  const toggleEleve = (eleveId) => {
    setSelectedEleves(prev => 
      prev.includes(eleveId) 
        ? prev.filter(id => id !== eleveId)
        : [...prev, eleveId]
    );
  };

  const toggleAll = () => {
    if (selectedEleves.length === eleves.length) {
      setSelectedEleves([]);
    } else {
      setSelectedEleves(eleves.map(e => e.id));
    }
  };

  const selectAdmisOnly = () => {
    const elevesAdmis = eleves.filter(e => e.statut === 'admis');
    setSelectedEleves(elevesAdmis.map(e => e.id));
  };

  // Définir l'ordre des niveaux du primaire
  const niveauxPrimaire = {
    'CI': 1,
    'CP': 2,
    'CE1': 3,
    'CE2': 4,
    'CM1': 5,
    'CM2': 6
  };

  // Extraire le niveau d'une classe (CI, CP, CE1, CE2, CM1, CM2)
  const extraireNiveau = (nomClasse) => {
    if (!nomClasse) return 0;
    
    // Chercher CI, CP, CE1, CE2, CM1, CM2 dans le nom
    for (const [niveau, ordre] of Object.entries(niveauxPrimaire)) {
      if (nomClasse.toUpperCase().includes(niveau)) {
        return ordre;
      }
    }
    return 0;
  };

  const handlePassageClasse = async () => {
    if (!selectedClasseDestination) {
      toast.error('Veuillez sélectionner une classe de destination');
      return;
    }

    if (selectedEleves.length === 0) {
      toast.error('Veuillez sélectionner au moins un élève');
      return;
    }

    const classeOrigine = classes.find(c => c.id === parseInt(selectedClasseOrigine));
    const classeDestination = classes.find(c => c.id === parseInt(selectedClasseDestination));

    // Vérifier que la classe de destination est de niveau supérieur
    const niveauOrigine = extraireNiveau(classeOrigine?.nom);
    const niveauDestination = extraireNiveau(classeDestination?.nom);

    // Trouver le nom du niveau
    const getNomNiveau = (ordre) => {
      return Object.keys(niveauxPrimaire).find(key => niveauxPrimaire[key] === ordre) || 'Inconnu';
    };

    if (niveauDestination <= niveauOrigine) {
      toast.error('Passage invalide: la classe de destination doit être de niveau supérieur.');
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment déplacer ${selectedEleves.length} élève(s) de "${classeOrigine?.nom}" vers "${classeDestination?.nom}" ?\n\nCette action changera leur classe et remettra leur statut à "actif".`
    );

    if (!confirmation) return;

    try {
      setLoading(true);
      const result = await eleveService.passageClasse(
        selectedEleves,
        parseInt(selectedClasseDestination),
        'actif'
      );
      
      toast.success(result.message || 'Passage effectué avec succès !');
      
      // Recharger les données
      loadEleves();
      setSelectedClasseDestination('');
    } catch (error) {
      console.error('Erreur lors du passage:', error);
      toast.error('Erreur lors du passage de classe');
      setLoading(false);
    }
  };

  const getStatutBadge = (statut) => {
    const colors = {
      actif: 'bg-blue-100 text-blue-800',
      admis: 'bg-green-100 text-green-800',
      redouble: 'bg-orange-100 text-orange-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  // Filtrer les élèves selon la recherche
  const elevesFiltres = eleves.filter(e => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      e.nom?.toLowerCase().includes(search) ||
      e.prenom?.toLowerCase().includes(search) ||
      e.matricule?.toLowerCase().includes(search)
    );
  });

  const elevesAdmis = elevesFiltres.filter(e => e.statut === 'admis');
  const elevesRedoublants = elevesFiltres.filter(e => e.statut === 'redouble');
  const elevesAutres = elevesFiltres.filter(e => !['admis', 'redouble', 'actif'].includes(e.statut));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Passage de Classe en Masse</h1>
          <p className="text-gray-600 mt-1">
            Déplacez plusieurs élèves d'une classe à une autre en une seule opération
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-900">⚠️ Important</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Cette action est irréversible. Assurez-vous d'avoir sélectionné la bonne classe de destination avant de confirmer.
              </p>
            </div>
          </div>
        </div>

        {/* Sélection des classes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe d'origine
            </label>
            <select
              value={selectedClasseOrigine}
              onChange={(e) => setSelectedClasseOrigine(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Sélectionner --</option>
              {classes.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRight className="h-8 w-8 text-gray-400" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe de destination
            </label>
            <select
              value={selectedClasseDestination}
              onChange={(e) => setSelectedClasseDestination(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!selectedClasseOrigine}
            >
              <option value="">-- Sélectionner --</option>
              {classes
                .filter(c => c.id !== parseInt(selectedClasseOrigine))
                .map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Bouton d'action principal */}
        {selectedClasseOrigine && selectedClasseDestination && selectedEleves.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border-2 border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ArrowRight className="h-6 w-6 text-blue-600" />
                  Prêt à Effectuer le Passage
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedEleves.length} élève{selectedEleves.length > 1 ? 's' : ''} sélectionné{selectedEleves.length > 1 ? 's' : ''} pour le passage de classe
                </p>
              </div>
              <button
                onClick={handlePassageClasse}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl font-semibold text-base disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Passage en cours...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-5 w-5" />
                    Effectuer le Passage ({selectedEleves.length})
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Statistiques */}
        {selectedClasseOrigine && eleves.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{eleves.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
              <p className="text-sm text-gray-600">Admis</p>
              <p className="text-2xl font-bold text-green-600">{elevesAdmis.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-4">
              <p className="text-sm text-gray-600">Redoublants</p>
              <p className="text-2xl font-bold text-orange-600">{elevesRedoublants.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
              <p className="text-sm text-gray-600">Sélectionnés</p>
              <p className="text-2xl font-bold text-blue-600">{selectedEleves.length}</p>
            </div>
          </div>
        )}

        {/* Recherche */}
        {selectedClasseOrigine && eleves.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        )}

        {/* Liste des élèves */}
        {selectedClasseOrigine && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : eleves.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun élève dans cette classe</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleAll}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {selectedEleves.length === eleves.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                    <button
                      onClick={selectAdmisOnly}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Sélectionner admis uniquement
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedEleves.length} élève(s) sélectionné(s)
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedEleves.length === eleves.length}
                            onChange={toggleAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Matricule
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Nom & Prénom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {elevesFiltres.map((eleve) => (
                        <tr
                          key={eleve.id}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedEleves.includes(eleve.id) ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => toggleEleve(eleve.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedEleves.includes(eleve.id)}
                              onChange={() => toggleEleve(eleve.id)}
                              className="rounded border-gray-300"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {eleve.matricule}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {eleve.nom} {eleve.prenom}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutBadge(eleve.statut)}`}>
                              {eleve.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {searchTerm && elevesFiltres.length === 0 && (
                  <div className="text-center py-8 bg-gray-50">
                    <p className="text-gray-500">Aucun élève trouvé pour "{searchTerm}"</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PassageClasseAdmin;
