import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { professeurService, userService } from '../services/api';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Users, Award, Building2, Briefcase, ExternalLink, ClipboardList, FileText } from 'lucide-react';

export default function Parametres() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profil');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfilComplet();
  }, []);

  const fetchProfilComplet = async () => {
    try {
      setLoading(true);
      const data = await professeurService.getProfilComplet();
      setProfil(data);
      setFormData({
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        email: data.user.email,
        telephone: data.user.telephone,
        adresse: data.user.adresse,
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.update(user.id, formData);
      await fetchProfilComplet();
      setEditing(false);
      alert('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du profil');
    }
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

  if (!profil) {
    return (
      <Layout>
        <div className="text-center text-gray-600 py-12">
          Profil introuvable
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-6">
            <div className="bg-white rounded-full p-4">
              <User className="w-16 h-16 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {profil.user.first_name} {profil.user.last_name}
              </h1>
              <p className="text-blue-100 mt-1">
                {profil.professeur.specialite || 'Professeur'} • Matricule: {profil.professeur.matricule}
              </p>
              {profil.user.ecole && (
                <p className="text-blue-200 mt-2 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  {profil.user.ecole}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Classes enseignées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profil.statistiques.nombre_classes_enseignees}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Matières</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profil.statistiques.nombre_matieres}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Classes principales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profil.statistiques.nombre_classes_principales}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profil')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profil'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="w-5 h-5 inline mr-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab('classes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'classes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Mes Classes
              </button>
              <button
                onClick={() => setActiveTab('matieres')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'matieres'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="w-5 h-5 inline mr-2" />
                Matières Enseignées
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Onglet Profil */}
            {activeTab === 'profil' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Modifier
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          name="telephone"
                          value={formData.telephone || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse
                        </label>
                        <textarea
                          name="adresse"
                          value={formData.adresse || ''}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Sauvegarder
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{profil.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium text-gray-900">{profil.user.telephone || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Spécialité</p>
                        <p className="font-medium text-gray-900">{profil.professeur.specialite || 'Non renseignée'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Date d'embauche</p>
                        <p className="font-medium text-gray-900">
                          {profil.professeur.date_embauche 
                            ? new Date(profil.professeur.date_embauche).toLocaleDateString('fr-FR')
                            : 'Non renseignée'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 md:col-span-2">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Adresse</p>
                        <p className="font-medium text-gray-900">{profil.user.adresse || 'Non renseignée'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Classes */}
            {activeTab === 'classes' && (
              <div className="space-y-6">
                {profil.classes_principales.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Classes principales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profil.classes_principales.map((classe) => (
                        <div key={classe.id} className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-purple-900">{classe.nom}</h4>
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                              Principal
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Effectif: {classe.effectif_actuel}/{classe.effectif_max}</p>
                          <p className="text-sm text-gray-600 mb-3">Année: {classe.annee_scolaire.libelle}</p>
                          
                          {/* Boutons d'action */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => navigate(`/eleves?classe=${classe.id}`)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                            >
                              <Users className="w-3 h-3" />
                              Élèves
                            </button>
                            <button
                              onClick={() => navigate(`/notes?classe=${classe.id}`)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                            >
                              <ClipboardList className="w-3 h-3" />
                              Notes
                            </button>
                            <button
                              onClick={() => navigate(`/bulletins?classe=${classe.id}`)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition"
                            >
                              <FileText className="w-3 h-3" />
                              Bulletins
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profil.toutes_classes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Toutes mes classes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profil.toutes_classes.map((classe) => (
                        <div key={classe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{classe.nom}</h4>
                          <p className="text-sm text-gray-600 mb-1">Effectif: {classe.effectif_actuel}/{classe.effectif_max}</p>
                          <p className="text-sm text-gray-600 mb-3">Année: {classe.annee_scolaire.libelle}</p>
                          
                          {/* Boutons d'action */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => navigate(`/eleves?classe=${classe.id}`)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                            >
                              <Users className="w-3 h-3" />
                              Élèves
                            </button>
                            <button
                              onClick={() => navigate(`/notes?classe=${classe.id}`)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                            >
                              <ClipboardList className="w-3 h-3" />
                              Notes
                            </button>
                            <button
                              onClick={() => navigate(`/bulletins?classe=${classe.id}`)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition"
                            >
                              <FileText className="w-3 h-3" />
                              Bulletins
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profil.classes_principales.length === 0 && profil.toutes_classes.length === 0 && (
                  <div className="text-center text-gray-600 py-12">
                    Aucune classe assignée
                  </div>
                )}
              </div>
            )}

            {/* Onglet Matières */}
            {activeTab === 'matieres' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Matières enseignées ({profil.matieres_enseignees.length})
                </h3>
                
                {profil.matieres_enseignees.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Matière
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Classe
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Coefficient
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profil.matieres_enseignees.map((mc) => (
                          <tr key={mc.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="font-medium text-gray-900">{mc.matiere.nom}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {mc.matiere.code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {mc.classe.nom}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {mc.matiere.coefficient}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-600 py-12">
                    Aucune matière assignée
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
