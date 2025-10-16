import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { eleveService, classeService } from '../services/api';
import { Plus, Edit2, Trash2, Search, Upload, Download, X, User } from 'lucide-react';

const Eleves = () => {
  const { isAdmin } = useAuth();
  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingEleve, setEditingEleve] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importClasse, setImportClasse] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      const params = selectedClasse ? { classe: selectedClasse } : {};
      const [elevesData, classesData] = await Promise.all([
        eleveService.getAll(params),
        classeService.getAll()
      ]);
      
      setEleves(elevesData.results || elevesData);
      setClasses(classesData.results || classesData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const handleDownloadTemplate = async () => {
    try {
      const blob = await eleveService.getTemplateCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_eleves.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
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

  const closeModal = () => {
    setShowModal(false);
    setEditingEleve(null);
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
                onClick={handleDownloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <Download className="h-5 w-5" />
                <span>Template CSV</span>
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
              <strong>Consultation uniquement :</strong> Vous consultez les élèves de votre classe. 
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
          {isAdmin() && (
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les classes</option>
              {classes.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Table */}
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
                      {isAdmin() ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(eleve)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(eleve.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Consultation uniquement</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredEleves.length > itemsPerPage && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredEleves.length)} sur {filteredEleves.length} élèves
                </div>
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajout/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEleve ? 'Modifier l\'élève' : 'Nouvel élève'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations personnelles */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.telephone_eleve}
                      onChange={(e) => setFormData({ ...formData, telephone_eleve: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    <textarea
                      required
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Informations parentales */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations des parents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom du père</label>
                    <input
                      type="text"
                      value={formData.nom_pere}
                      onChange={(e) => setFormData({ ...formData, nom_pere: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone du père</label>
                    <input
                      type="tel"
                      value={formData.telephone_pere}
                      onChange={(e) => setFormData({ ...formData, telephone_pere: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la mère</label>
                    <input
                      type="text"
                      value={formData.nom_mere}
                      onChange={(e) => setFormData({ ...formData, nom_mere: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone de la mère</label>
                    <input
                      type="tel"
                      value={formData.telephone_mere}
                      onChange={(e) => setFormData({ ...formData, telephone_mere: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingEleve ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
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
    </Layout>
  );
};

export default Eleves;
