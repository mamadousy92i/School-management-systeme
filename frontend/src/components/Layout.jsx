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
  ChevronRight,
  GitBranch,
  ArrowRightLeft
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
    { icon: Home, label: 'Accueil École', path: '/accueil' },
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Élèves', path: '/eleves' },
    { icon: BookOpen, label: 'Classes', path: '/classes', adminOnly: true },
    { icon: BookOpen, label: 'Matières', path: '/matieres', adminOnly: true },
    { icon: ClipboardList, label: 'Saisir Notes', path: '/notes', teacherOnly: true },
    { icon: ClipboardList, label: 'Consulter Notes', path: '/consultation-notes', adminOnly: true },
    { icon: FileText, label: 'Bulletins', path: '/bulletins' },
    { icon: Users, label: 'Enseignants', path: '/professeurs', adminOnly: true },
    { icon: Settings, label: 'Mon Profil', path: '/parametres', teacherOnly: true },
    { icon: GitBranch, label: 'Passages Classe', path: '/passage-classe' },
    { icon: ArrowRightLeft, label: 'Passages (Admin)', path: '/passage-classe-admin', adminOnly: true },
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
    <div className="bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex justify-between items-center px-6 border-gray-200 border-b h-16">
          <div className="flex items-center space-x-2">
            <div className="flex justify-center items-center bg-blue-600 rounded-lg w-10 h-10">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-xl">SGS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
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
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="right-0 bottom-0 left-0 absolute p-4 border-gray-200 border-t">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-10 h-10">
              <span className="font-bold text-white text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-gray-500 text-xs truncate">
                {user?.role === 'admin' ? 'Administrateur' : 'Professeur'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex justify-center items-center space-x-2 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg w-full text-red-600 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="flex items-center bg-white shadow-sm px-6 h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden z-40 fixed inset-0 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
