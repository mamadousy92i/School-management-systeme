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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-900 rounded-md">
                <School className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">{ecoleInfo.nom}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bonjour, {user?.first_name || user?.username}</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition"
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-8 py-12 md:py-14">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-md mb-5">
                <School className="h-9 w-9 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
                {ecoleInfo.nom}
              </h1>
              <p className="text-base text-gray-600 mb-1">
                {ecoleInfo.devise}
              </p>
              <p className="text-sm text-gray-500">
                Année scolaire: {stats.anneeScolaire?.nom || '2024-2025'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total élèves</p>
                <p className="text-4xl font-semibold text-gray-900">{stats.totalEleves}</p>
              </div>
              <Users className="h-10 w-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Classes</p>
                <p className="text-4xl font-semibold text-gray-900">{stats.totalClasses}</p>
              </div>
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Enseignants</p>
                <p className="text-4xl font-semibold text-gray-900">{stats.totalProfesseurs}</p>
              </div>
              <GraduationCap className="h-10 w-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Informations de l'École */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Administration */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="h-6 w-6 mr-2 text-gray-400" />
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
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Phone className="h-6 w-6 mr-2 text-gray-400" />
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
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-gray-400" />
            Niveaux Disponibles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'].map((niveau) => (
              <div 
                key={niveau}
                className="bg-white rounded-lg p-4 text-center border border-gray-200 hover:border-gray-400 transition"
              >
                <p className="text-2xl font-bold text-gray-900">{niveau}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton d'Action */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Prêt à Commencer ?
          </h3>
          <p className="text-gray-600 mb-6">
            Accédez au tableau de bord pour gérer votre école
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-8 py-3 bg-gray-900 text-white rounded-md hover:bg-black transition font-semibold text-lg"
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
