import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { eleveService, classeService } from '../services/api';
import { Plus, Edit2, Trash2, Search, Upload, Download, X, User, Phone, Users, Eye, Calendar, MapPin, Mail, List, Grid } from 'lucide-react';

const Eleves = () => {
  const { isAdmin } = useAuth();
  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [editingEleve, setEditingEleve] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importClasse, setImportClasse] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'

  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    lieu_naissance: '',
    telephone_eleve: '',
    email: '',
    adresse: '',
    nom_pere: '',
    telephone_pere: '',
    nom_mere: '',
    telephone_mere: '',
    classe_id: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedClasse]);

  const loadData = async () => {
    try {
      const params = { 
        statut: 'tous',
        ...(selectedClasse && { classe: selectedClasse })
      };
      const [elevesData, classesData] = await Promise.all([
        eleveService.getAll(params),
        classeService.getAll()
      ]);
      
      console.log('Élèves chargés:', elevesData);
      console.log('Classes chargées:', classesData);
      
      setEleves(elevesData.results || elevesData);
      setClasses(classesData.results || classesData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      alert('Erreur: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si pas à la dernière étape, passer à la suivante
    if (currentStep < totalSteps) {
      handleNext();
      return;
    }
    
    // Dernière étape : soumettre le formulaire
    try {
      if (editingEleve) {
        await eleveService.update(editingEleve.id, formData);
      } else {
        await eleveService.create(formData);
      }
      loadData();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'élève');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      try {
        await eleveService.delete(id);
        loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'élève');
      }
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile || !importClasse) {
      alert('Veuillez sélectionner un fichier et une classe');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('classe_id', importClasse);

    try {
      const result = await eleveService.importCSV(formData);
      alert(`Import réussi: ${result.imported} élève(s) importé(s)`);
      if (result.errors.length > 0) {
        console.error('Erreurs d\'import:', result.errors);
      }
      loadData();
      closeImportModal();
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      alert('Erreur lors de l\'import du fichier');
    }
  };

  const handleDownloadTemplate = async (format = 'csv') => {
    try {
      const blob = format === 'excel' 
        ? await eleveService.getTemplateExcel()
        : await eleveService.getTemplateCSV();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'excel' ? 'template_eleves.xlsx' : 'template_eleves.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement du template:', error);
      alert('Erreur lors du téléchargement du template');
    }
  };

  const openEditModal = (eleve) => {
    setEditingEleve(eleve);
    setFormData({
      matricule: eleve.matricule,
      nom: eleve.nom,
      prenom: eleve.prenom,
      sexe: eleve.sexe,
      date_naissance: eleve.date_naissance,
      lieu_naissance: eleve.lieu_naissance,
      telephone_eleve: eleve.telephone_eleve || '',
      email: eleve.email || '',
      adresse: eleve.adresse,
      nom_pere: eleve.nom_pere || '',
      telephone_pere: eleve.telephone_pere || '',
      nom_mere: eleve.nom_mere || '',
      telephone_mere: eleve.telephone_mere || '',
      classe_id: eleve.classe,
    });
    setShowModal(true);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEleve(null);
    setCurrentStep(1);
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      sexe: 'M',
      date_naissance: '',
      lieu_naissance: '',
      telephone_eleve: '',
      email: '',
      adresse: '',
      nom_pere: '',
      telephone_pere: '',
      nom_mere: '',
      telephone_mere: '',
      classe_id: '',
    });
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportClasse('');
  };

  const filteredEleves = eleves.filter(eleve =>
    eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eleve.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredEleves.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEleves = filteredEleves.slice(startIndex, endIndex);

  // Reset page when search or classe changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClasse]);

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
            <h1 className="text-3xl font-bold text-gray-900">Élèves</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin() 
                ? `${eleves.length} élève(s) au total` 
                : `${eleves.length} élève(s) dans votre classe`}
            </p>
          </div>
          {isAdmin() && (
            <div className="flex space-x-3">
              <button
                onClick={() => handleDownloadTemplate('csv')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                title="Télécharger le template CSV"
              >
                <Download className="h-5 w-5" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleDownloadTemplate('excel')}
                className="flex items-center space-x-2 px-4 py-2 border border-green-500 text-green-700 rounded-lg hover:bg-green-50 transition"
                title="Télécharger le template Excel"
              >
                <Download className="h-5 w-5" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Upload className="h-5 w-5" />
                <span>Importer</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-5 w-5" />
                <span>Nouvel élève</span>
              </button>
              
              {/* Toggle Vue Liste/Grille */}
              <div className="flex items-center border-l pl-4 ml-4 space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Vue liste"
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Vue grille"
                >
                  <Grid className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <User className="w-6 h-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Élèves</p>
                <p className="text-2xl font-bold text-gray-900">{eleves.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <User className="w-6 h-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Garçons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {eleves.filter(e => e.sexe === 'M').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <User className="w-6 h-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Filles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {eleves.filter(e => e.sexe === 'F').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info pour enseignant */}
        {!isAdmin() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Consultation uniquement :</strong> Vous consultez les élèves de vos classes. 
              Utilisez le filtre ci-dessous pour sélectionner une classe spécifique.
              Seul l'administrateur peut ajouter, modifier ou supprimer des élèves.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtre par classe - Disponible pour admins ET enseignants */}
          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{isAdmin() ? 'Toutes les classes' : 'Toutes mes classes'}</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Vue Liste */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sexe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Âge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classe
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
                {currentEleves.map((eleve) => (
                  <tr key={eleve.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {eleve.matricule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {eleve.photo ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={eleve.photo} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {eleve.nom} {eleve.prenom}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eleve.age} ans
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eleve.classe_nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        eleve.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {eleve.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => { setSelectedEleve(eleve); setShowDetailsModal(true); }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {isAdmin() && (
                          <>
                            <button
                              onClick={() => openEditModal(eleve)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Modifier"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(eleve.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Vue Grille */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentEleves.map((eleve) => (
              <div key={eleve.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-md transition">
                {/* Header de la carte sobre */}
                <div className="bg-gray-50 p-5 text-center border-b border-gray-200">
                  <div className="relative inline-block">
                    {eleve.photo ? (
                      <img className="h-20 w-20 rounded-full object-cover border-2 border-gray-300" src={eleve.photo} alt="" />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                        <User className="h-10 w-10 text-gray-500" />
                      </div>
                    )}
                    <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                      eleve.statut === 'actif' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                  <h3 className="mt-3 font-semibold text-gray-900 text-base">{eleve.prenom} {eleve.nom}</h3>
                  <p className="text-gray-500 text-xs mt-1">{eleve.matricule}</p>
                </div>

                {/* Informations */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="bg-blue-50 p-2 rounded-lg mr-3">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs">Sexe</span>
                      <p className="font-medium text-gray-900">{eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <div className="bg-purple-50 p-2 rounded-lg mr-3">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs">Âge</span>
                      <p className="font-medium text-gray-900">{eleve.age} ans</p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm">
                    <div className="bg-green-50 p-2 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs">Classe</span>
                      <p className="font-medium text-gray-900">{eleve.classe_nom}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <button
                      onClick={() => { setSelectedEleve(eleve); setShowDetailsModal(true); }}
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Détails</span>
                    </button>
                    
                    {isAdmin() && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditModal(eleve)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(eleve.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination commune */}
        {filteredEleves.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
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

      {/* Modal Ajout/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingEleve ? 'Modifier l\'élève' : 'Nouvel élève'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Étape {currentStep} sur {totalSteps}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Stepper */}
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                        step < currentStep ? 'bg-green-500 text-white' :
                        step === currentStep ? 'bg-blue-600 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {step < currentStep ? '✓' : step}
                      </div>
                      <span className={`ml-2 text-xs font-medium ${
                        step === currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step === 1 ? 'Identité' : step === 2 ? 'Contact' : 'Famille'}
                      </span>
                    </div>
                    {step < totalSteps && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto">
              <div className="p-6">
                {/* Étape 1: Identité */}
                {currentStep === 1 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-blue-600 p-1.5 rounded-lg">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">Informations d'identité</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Matricule</label>
                    <input
                      type="text"
                      required
                      value={formData.matricule}
                      onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="EL00001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
                    <select
                      required
                      value={formData.classe_id}
                      onChange={(e) => setFormData({ ...formData, classe_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input
                      type="text"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
                    <select
                      required
                      value={formData.sexe}
                      onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                    <input
                      type="date"
                      required
                      value={formData.date_naissance}
                      onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
                    <input
                      type="text"
                      required
                      value={formData.lieu_naissance}
                      onChange={(e) => setFormData({ ...formData, lieu_naissance: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Étape 2: Contact */}
              {currentStep === 2 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-600 p-1.5 rounded-lg">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Informations de contact</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.telephone_eleve}
                      onChange={(e) => setFormData({ ...formData, telephone_eleve: e.target.value })}
                      placeholder="ex: +221 77 123 45 67"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ex: eleve@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      placeholder="Adresse complète de résidence"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>
              )}

              {/* Étape 3: Famille */}
              {currentStep === 3 && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-purple-600 p-1.5 rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Informations des parents</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom du père</label>
                    <input
                      type="text"
                      value={formData.nom_pere}
                      onChange={(e) => setFormData({ ...formData, nom_pere: e.target.value })}
                      placeholder="Nom complet du père"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone du père</label>
                    <input
                      type="tel"
                      value={formData.telephone_pere}
                      onChange={(e) => setFormData({ ...formData, telephone_pere: e.target.value })}
                      placeholder="ex: +221 77 456 78 90"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la mère</label>
                    <input
                      type="text"
                      value={formData.nom_mere}
                      onChange={(e) => setFormData({ ...formData, nom_mere: e.target.value })}
                      placeholder="Nom complet de la mère"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone de la mère</label>
                    <input
                      type="tel"
                      value={formData.telephone_mere}
                      onChange={(e) => setFormData({ ...formData, telephone_mere: e.target.value })}
                      placeholder="ex: +221 77 987 65 43"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    />
                  </div>
                </div>
              </div>
              )}

              </div>
            </form>

            {/* Footer Actions - Sticky */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition font-medium"
                  >
                    ← Précédent
                  </button>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition font-medium"
                >
                  Annuler
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                  >
                    {editingEleve ? '✓ Modifier' : '+ Créer'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Importer des élèves</h2>
              <button onClick={closeImportModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classe de destination
                </label>
                <select
                  required
                  value={importClasse}
                  onChange={(e) => setImportClasse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  Fichier CSV ou Excel
                </label>
                <input
                  type="file"
                  required
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Formats acceptés: CSV, Excel (.xlsx, .xls)
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Importer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Détails Élève */}
      {showDetailsModal && selectedEleve && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header sobre */}
            <div className="relative bg-gray-50 border-b border-gray-200 px-6 py-5">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-200 rounded-lg transition text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="bg-gray-200 p-3 rounded-lg">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEleve.prenom} {selectedEleve.nom}</h2>
                  <p className="text-gray-600 text-sm mt-0.5">Matricule: {selectedEleve.matricule} • {selectedEleve.classe_nom}</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                  selectedEleve.statut === 'actif' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {selectedEleve.statut}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)] bg-gray-50">
                {/* Sections simplifiées */}
                <div className="space-y-5">
                  {/* Informations Personnelles */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Informations Personnelles
                      </h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-start">
                        <div className="bg-blue-50 p-2 rounded-lg mr-3 flex-shrink-0">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Sexe</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedEleve.sexe === 'M' ? 'Masculin' : 'Féminin'}
                          </p>
                        </div>
                      </div>
                        
                      <div className="flex items-start">
                        <div className="bg-purple-50 p-2 rounded-lg mr-3 flex-shrink-0">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Âge</p>
                          <p className="text-sm font-medium text-gray-900">{selectedEleve.age} ans</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-pink-50 p-2 rounded-lg mr-3 flex-shrink-0">
                          <Calendar className="h-4 w-4 text-pink-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Date de Naissance</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedEleve.date_naissance ? new Date(selectedEleve.date_naissance).toLocaleDateString('fr-FR', { 
                              year: 'numeric', month: 'long', day: 'numeric' 
                            }) : '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-amber-50 p-2 rounded-lg mr-3 flex-shrink-0">
                          <MapPin className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Lieu de Naissance</p>
                          <p className="text-sm font-medium text-gray-900">{selectedEleve.lieu_naissance || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-start">
                        <div className="bg-green-50 p-2 rounded-lg mr-3 flex-shrink-0">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                          <p className="text-sm font-medium text-gray-900">{selectedEleve.telephone_eleve || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-blue-50 p-2 rounded-lg mr-3 flex-shrink-0">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Email</p>
                          <p className="text-sm font-medium text-gray-900 break-all">{selectedEleve.email || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="bg-orange-50 p-2 rounded-lg mr-3 flex-shrink-0">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Adresse</p>
                          <p className="text-sm font-medium text-gray-900">{selectedEleve.adresse || '-'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parents/Tuteurs */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Parents / Tuteurs
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Père */}
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-3 pb-2 border-b">👨 Père</p>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <div className="bg-indigo-50 p-2 rounded-lg mr-2 flex-shrink-0">
                                <User className="h-3.5 w-3.5 text-indigo-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Nom</p>
                                <p className="text-sm font-medium text-gray-900">{selectedEleve.nom_pere || '-'}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="bg-purple-50 p-2 rounded-lg mr-2 flex-shrink-0">
                                <Phone className="h-3.5 w-3.5 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                                <p className="text-sm font-medium text-gray-900">{selectedEleve.telephone_pere || '-'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mère */}
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-3 pb-2 border-b">👩 Mère</p>
                          <div className="space-y-3">
                            <div className="flex items-start">
                              <div className="bg-pink-50 p-2 rounded-lg mr-2 flex-shrink-0">
                                <User className="h-3.5 w-3.5 text-pink-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Nom</p>
                                <p className="text-sm font-medium text-gray-900">{selectedEleve.nom_mere || '-'}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <div className="bg-rose-50 p-2 rounded-lg mr-2 flex-shrink-0">
                                <Phone className="h-3.5 w-3.5 text-rose-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                                <p className="text-sm font-medium text-gray-900">{selectedEleve.telephone_mere || '-'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Eleves;
