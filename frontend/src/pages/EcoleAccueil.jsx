import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  School, 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { 
  eleveService, 
  classeService, 
  professeurService, 
  anneeScolaireService 
} from '../services/api';

const EcoleAccueil = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalEleves: 0,
    totalClasses: 0,
    totalProfesseurs: 0,
    anneeScolaire: null
  });
  const [loading, setLoading] = useState(true);

  // Informations de l'école (à adapter selon vos besoins)
  const ecoleInfo = {
    nom: "École Primaire Sénégalaise",
    directrice: "Mme Fatou SARR",
    adresse: "Dakar, Sénégal",
    telephone: "+221 33 XXX XX XX",
    email: "contact@ecole.sn",
    devise: "Excellence, Discipline, Réussite"
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [eleves, classes, professeurs, annees] = await Promise.all([
        eleveService.getAll({ statut: 'tous' }),
        classeService.getAll(),
        professeurService.getAll(),
        anneeScolaireService.getAll()
      ]);

      const elevesArray = Array.isArray(eleves) ? eleves : [];
      const classesArray = Array.isArray(classes) ? classes : [];
      const professeursArray = Array.isArray(professeurs) ? professeurs : [];
      const anneesArray = Array.isArray(annees) ? annees : [];
      
      const anneeCourante = anneesArray.find(a => a.en_cours) || anneesArray[0];

      setStats({
        totalEleves: elevesArray.length,
        totalClasses: classesArray.length,
        totalProfesseurs: professeursArray.length,
        anneeScolaire: anneeCourante
      });
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <School className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{ecoleInfo.nom}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bonjour, {user?.first_name || user?.username}</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative px-8 py-12 md:py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
                <School className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {ecoleInfo.nom}
              </h1>
              <p className="text-xl text-blue-100 mb-2">
                {ecoleInfo.devise}
              </p>
              <p className="text-lg text-blue-200">
                Année Scolaire: {stats.anneeScolaire?.nom || '2024-2025'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Élèves</p>
                <p className="text-4xl font-bold">{stats.totalEleves}</p>
              </div>
              <Users className="h-16 w-16 text-blue-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Classes</p>
                <p className="text-4xl font-bold">{stats.totalClasses}</p>
              </div>
              <BookOpen className="h-16 w-16 text-green-200 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Enseignants</p>
                <p className="text-4xl font-bold">{stats.totalProfesseurs}</p>
              </div>
              <GraduationCap className="h-16 w-16 text-purple-200 opacity-80" />
            </div>
          </div>
        </div>

        {/* Informations de l'École */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Administration */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="h-6 w-6 mr-2 text-yellow-500" />
              Administration
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <GraduationCap className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Directrice</p>
                  <p className="font-semibold text-gray-900">{ecoleInfo.directrice}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Année Scolaire</p>
                  <p className="font-semibold text-gray-900">
                    {stats.anneeScolaire?.nom || '2024-2025'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Phone className="h-6 w-6 mr-2 text-blue-500" />
              Contact
            </h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-semibold text-gray-900">{ecoleInfo.adresse}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-semibold text-gray-900">{ecoleInfo.telephone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{ecoleInfo.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Niveaux Disponibles */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-green-500" />
            Niveaux Disponibles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'].map((niveau) => (
              <div 
                key={niveau}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition"
              >
                <p className="text-2xl font-bold text-gray-900">{niveau}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton d'Action */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Prêt à Commencer ?
          </h3>
          <p className="text-gray-600 mb-6">
            Accédez au tableau de bord pour gérer votre école
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl font-semibold text-lg"
          >
            Accéder au Dashboard
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EcoleAccueil;
