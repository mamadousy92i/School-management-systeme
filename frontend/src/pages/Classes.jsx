import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { classeService, anneeScolaireService } from '../services/api';
import { Plus, Edit2, Trash2, Users, Search, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Classes = () => {
  const toast = useToast();
  const [classes, setClasses] = useState([]);
  const [anneeScolaire, setAnneeScolaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClasse, setEditingClasse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    niveau: 'ci',
    section: '',
    effectif_max: 40,
    annee_scolaire_id: '',
  });

  const niveaux = [
    { value: 'ci', label: 'CI - Cours d\'Initiation' },
    { value: 'cp', label: 'CP - Cours Préparatoire' },
    { value: 'ce1', label: 'CE1 - Cours Élémentaire 1' },
    { value: 'ce2', label: 'CE2 - Cours Élémentaire 2' },
    { value: 'cm1', label: 'CM1 - Cours Moyen 1' },
    { value: 'cm2', label: 'CM2 - Cours Moyen 2' },
  ];

  // Générer le nom de la classe à partir du niveau et de la section
  const getGeneratedClassName = () => {
    const niveauLabel = niveaux.find(n => n.value === formData.niveau)?.label.split(' - ')[0] || '';
    return formData.section ? `${niveauLabel}-${formData.section}` : niveauLabel;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesData, anneeData] = await Promise.all([
        classeService.getAll(),
        anneeScolaireService.getActive()
      ]);
      
      setClasses(classesData.results || classesData);
      setAnneeScolaire(anneeData);
      setFormData(prev => ({ ...prev, annee_scolaire_id: anneeData.id }));
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClasse) {
        await classeService.update(editingClasse.id, formData);
      } else {
        await classeService.create(formData);
      }
      loadData();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la classe');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      try {
        await classeService.delete(id);
        loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de la classe');
      }
    }
  };

  const openEditModal = (classe) => {
    setEditingClasse(classe);
    setFormData({
      niveau: classe.niveau,
      section: classe.section || '',
      effectif_max: classe.effectif_max,
      annee_scolaire_id: classe.annee_scolaire.id,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClasse(null);
    setFormData({
      niveau: 'ci',
      section: '',
      effectif_max: 40,
      annee_scolaire_id: anneeScolaire?.id || '',
    });
  };

  const filteredClasses = classes.filter(classe =>
    classe.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classe.niveau.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
            <p className="text-gray-600 mt-1">
              Année scolaire: {anneeScolaire?.libelle || 'Non définie'}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Nouvelle classe</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une classe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classe) => (
            <div
              key={classe.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{classe.nom}</h3>
                  <p className="text-sm text-gray-600">Niveau: {classe.niveau}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(classe)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(classe.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Effectif:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {classe.effectif_actuel} / {classe.effectif_max}
                    </span>
                  </div>
                </div>

                {classe.professeur_principal && (
                  <div className="text-sm">
                    <span className="text-gray-600">Prof. Principal:</span>
                    <span className="ml-2 font-medium">
                      {classe.professeur_principal.user.first_name} {classe.professeur_principal.user.last_name}
                    </span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {classe.matieres_enseignees?.length || 0} matière(s)
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2 ml-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((classe.effectif_actuel / classe.effectif_max) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune classe trouvée
            </h3>
            <p className="text-gray-600">
              Commencez par créer votre première classe
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingClasse ? 'Modifier la classe' : 'Nouvelle classe'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {niveaux.map((niveau) => (
                    <option key={niveau.value} value={niveau.value}>
                      {niveau.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A, B, C..."
                  maxLength="10"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Laissez vide si une seule classe par niveau
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nom généré :</strong> <span className="font-mono font-bold">{getGeneratedClassName()}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effectif maximum
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.effectif_max}
                  onChange={(e) => setFormData({ ...formData, effectif_max: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  {editingClasse ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Classes;
