import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  Menu,
  X,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  Home,
  Settings,
  ChevronRight
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Users, label: 'Élèves', path: '/eleves' },
    { icon: BookOpen, label: 'Classes', path: '/classes', adminOnly: true },
    { icon: BookOpen, label: 'Matières', path: '/matieres', adminOnly: true },
    { icon: ClipboardList, label: 'Saisir Notes', path: '/notes', teacherOnly: true },
    { icon: ClipboardList, label: 'Consulter Notes', path: '/consultation-notes', adminOnly: true },
    { icon: FileText, label: 'Bulletins', path: '/bulletins' },
    { icon: Users, label: 'Enseignants', path: '/professeurs', adminOnly: true },
    { icon: Settings, label: 'Mon Profil', path: '/parametres', teacherOnly: true },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    // Si l'item est réservé aux admins, vérifier que c'est un admin
    if (item.adminOnly) {
      return isAdmin();
    }
    // Si l'item est réservé aux enseignants, vérifier que ce n'est PAS un admin
    if (item.teacherOnly) {
      return !isAdmin();
    }
    // Sinon, afficher pour tout le monde
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">SGS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {filteredMenuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={index}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === 'admin' ? 'Administrateur' : 'Professeur'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-white shadow-sm flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
