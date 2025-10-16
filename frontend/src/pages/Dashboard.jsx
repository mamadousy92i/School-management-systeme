import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import {
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  UserPlus,
  Plus,
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';
import { eleveService, classeService, matiereService, professeurService } from '../services/api';

const Dashboard = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    eleves: 0,
    classes: 0,
    professeurs: 0,
    matieres: 0,
  });
  const [profStats, setProfStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (isAdmin()) {
        // Stats pour admin
        const [elevesData, classesData, matieresData, professeursData] = await Promise.all([
          eleveService.getAll(),
          classeService.getAll(),
          matiereService.getAll(),
          professeurService.getAll().catch(() => ({ results: [] }))
        ]);

        setStats({
          eleves: elevesData.results?.length || elevesData.length || 0,
          classes: classesData.results?.length || classesData.length || 0,
          professeurs: professeursData.results?.length || professeursData.length || 0,
          matieres: matieresData.results?.length || matieresData.length || 0,
        });
      } else {
        // Stats pour professeur
        const profilData = await professeurService.getProfilComplet();
        setProfStats(profilData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsCards = () => {
    if (isAdmin()) {
      return [
        {
          title: 'Total Élèves',
          value: stats.eleves,
          icon: Users,
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700',
        },
        {
          title: 'Classes',
          value: stats.classes,
          icon: BookOpen,
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700',
        },
        {
          title: 'Enseignants',
          value: stats.professeurs,
          icon: Users,
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700',
        },
        {
          title: 'Matières',
          value: stats.matieres,
          icon: ClipboardList,
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700',
        },
      ];
    } else {
      // Stats professeur
      return [
        {
          title: 'Mes Classes',
          value: profStats?.statistiques?.nombre_classes_enseignees || 0,
          icon: BookOpen,
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700',
        },
        {
          title: 'Matières Enseignées',
          value: profStats?.statistiques?.nombre_matieres || 0,
          icon: ClipboardList,
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700',
        },
        {
          title: 'Classes Principales',
          value: profStats?.statistiques?.nombre_classes_principales || 0,
          icon: Award,
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700',
        },
        {
          title: 'Matricule',
          value: profStats?.professeur?.matricule || '-',
          icon: Users,
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-700',
          isText: true
        },
      ];
    }
  };

  const statsCards = getStatsCards();

  return (
    <Layout>
          {/* Welcome Card - Redesign élégant */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Bienvenue, {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-gray-600">
                  {isAdmin()
                    ? 'Gérez votre établissement scolaire'
                    : 'Tableau de bord - Vue d\'ensemble de votre activité'}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-gray-50 rounded-full p-4">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              statsCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className={`grid grid-cols-1 gap-4 ${isAdmin() ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
              {isAdmin() ? (
                <>
                  <button 
                    onClick={() => navigate('/eleves')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
                  >
                    <UserPlus className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Ajouter un élève
                    </span>
                  </button>
                  <button 
                    onClick={() => navigate('/classes')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
                  >
                    <Plus className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Créer une classe
                    </span>
                  </button>
                  <button 
                    onClick={() => navigate('/professeurs')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
                  >
                    <UserPlus className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Ajouter un enseignant
                    </span>
                  </button>
                  <button 
                    onClick={() => navigate('/consultation-notes')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
                  >
                    <ClipboardList className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Consulter les notes
                    </span>
                  </button>
                  <button 
                    onClick={() => navigate('/bulletins')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
                  >
                    <FileText className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Voir les bulletins
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/eleves')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
                  >
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Voir mes élèves
                    </span>
                  </button>
                  <button 
                    onClick={() => navigate('/notes')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
                  >
                    <ClipboardList className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Saisir des notes
                    </span>
                  </button>
                  <button 
                    onClick={() => navigate('/bulletins')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
                  >
                    <FileText className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Voir les bulletins
                    </span>
                  </button>
                  <button 
                    onClick={() => navigate('/parametres')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50 hover:bg-white"
                  >
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Mon profil
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
    </Layout>
  );
};

export default Dashboard;
