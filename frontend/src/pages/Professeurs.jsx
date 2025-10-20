import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { professeurService, userService } from '../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  User, 
  Mail, 
  Phone, 
  BookOpen,
  Calendar,
  Award
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Professeurs() {
  const toast = useToast();
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProf, setEditingProf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    telephone: '',
    matricule: '',
    specialite: '',
    diplome: '',
    date_embauche: ''
  });

  useEffect(() => {
    loadProfesseurs();
  }, []);

  const loadProfesseurs = async () => {
    try {
      setLoading(true);
      const data = await professeurService.getAll();
      setProfesseurs(data.results || data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des enseignants');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si pas à la dernière étape, passer à la suivante
    if (currentStep < totalSteps) {
      handleNext();
      return;
    }
    
    // Dernière étape : soumettre le formulaire
    try {
      if (editingProf) {
        await professeurService.update(editingProf.id, formData);
        toast.success('Enseignant modifié avec succès');
      } else {
        await professeurService.create(formData);
        toast.success('Enseignant créé avec succès');
      }
      
      setShowModal(false);
      resetForm();
      loadProfesseurs();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (prof) => {
    setEditingProf(prof);
    setFormData({
      username: prof.user.username,
      email: prof.user.email,
      first_name: prof.user.first_name,
      last_name: prof.user.last_name,
      password: '',
      telephone: prof.user.telephone || '',
      matricule: prof.matricule,
      specialite: prof.specialite || '',
      diplome: prof.diplome || '',
      date_embauche: prof.date_embauche || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      return;
    }

    try {
      await professeurService.delete(id);
      toast.success('Enseignant supprimé avec succès');
      loadProfesseurs();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setEditingProf(null);
    setCurrentStep(1);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      telephone: '',
      matricule: '',
      specialite: '',
      diplome: '',
      date_embauche: ''
    });
  };

  const filteredProfesseurs = professeurs.filter(prof =>
    prof.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prof.specialite && prof.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredProfesseurs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfesseurs = filteredProfesseurs.slice(startIndex, endIndex);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Gestion des Enseignants</h1>
              <p className="text-gray-600 mt-1">Gérez les professeurs de votre établissement</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <Plus className="w-5 h-5" />
              Nouvel enseignant
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <User className="w-6 h-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Enseignants</p>
                <p className="text-2xl font-bold text-gray-900">{professeurs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Spécialités</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(professeurs.filter(p => p.specialite).map(p => p.specialite)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <Award className="w-6 h-6 text-gray-700" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {professeurs.filter(p => p.user.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un enseignant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Liste des professeurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredProfesseurs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun enseignant trouvé
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matricule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spécialité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Embauche
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProfesseurs.map((prof) => (
                    <tr key={prof.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {prof.user.first_name} {prof.user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{prof.user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {prof.matricule}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{prof.user.email}</div>
                        <div className="text-sm text-gray-500">{prof.user.telephone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                          {prof.specialite || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {prof.date_embauche ? new Date(prof.date_embauche).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(prof)}
                          className="text-gray-600 hover:text-gray-900 mr-3"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prof.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {filteredProfesseurs.length > itemsPerPage && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredProfesseurs.length)} sur {filteredProfesseurs.length} enseignants
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded-lg text-sm ${
                        currentPage === page
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
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

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingProf ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Étape {currentStep} sur {totalSteps}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
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
                        step === currentStep ? 'bg-gray-900 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {step < currentStep ? '✓' : step}
                      </div>
                      <span className={`ml-2 text-xs font-medium ${
                        step === currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step === 1 ? 'Compte' : step === 2 ? 'Personnel' : 'Professionnel'}
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

            {/* Form Content - Scrollable */}
            <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto">
              <div className="p-6">
                {/* Étape 1: Compte utilisateur */}
                {currentStep === 1 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-gray-900 p-1.5 rounded-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Compte utilisateur</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom d'utilisateur <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        disabled={editingProf}
                        placeholder="ex: jdupont"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="ex: jean.dupont@ecole.sn"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
                      />
                    </div>
                    
                    {!editingProf && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mot de passe <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!editingProf}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
                        />
                      </div>
                    )}
                  </div>
                </div>
                )}

                {/* Étape 2: Informations personnelles */}
                {currentStep === 2 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Informations personnelles</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        placeholder="ex: Jean"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        placeholder="ex: Dupont"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        placeholder="ex: +221 77 123 45 67"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Matricule <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="matricule"
                        value={formData.matricule}
                        onChange={handleInputChange}
                        required
                        placeholder="ex: PROF001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
                )}

                {/* Étape 3: Informations professionnelles */}
                {currentStep === 3 && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-600 p-1.5 rounded-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Informations professionnelles</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Spécialité
                      </label>
                      <input
                        type="text"
                        name="specialite"
                        value={formData.specialite}
                        onChange={handleInputChange}
                        placeholder="ex: Mathématiques"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diplôme
                      </label>
                      <input
                        type="text"
                        name="diplome"
                        value={formData.diplome}
                        onChange={handleInputChange}
                        placeholder="ex: Licence en Mathématiques"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date d'embauche
                      </label>
                      <input
                        type="date"
                        name="date_embauche"
                        value={formData.date_embauche}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
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
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition font-medium"
                >
                  Annuler
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium shadow-sm"
                  >
                    Suivant →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium shadow-sm"
                  >
                    {editingProf ? '✓ Modifier' : '+ Créer'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
