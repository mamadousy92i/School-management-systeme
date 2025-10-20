import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Toaster from './components/Toaster';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Matieres from './pages/Matieres';
import Eleves from './pages/Eleves';
import Notes from './pages/Notes';
import EleveNotes from './pages/EleveNotes';
import Bulletins from './pages/Bulletins';
import Parametres from './pages/Parametres';
import AdminProfil from './pages/AdminProfil';
import Professeurs from './pages/Professeurs';
import ConsultationNotes from './pages/ConsultationNotes';
import PassageClasseAmeliore from './pages/PassageClasseAmeliore';
import PassageClasseAdmin from './pages/PassageClasseAdmin';
import EcoleAccueil from './pages/EcoleAccueil';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Toaster />
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/accueil"
            element={
              <ProtectedRoute>
                <EcoleAccueil />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/classes"
            element={
              <ProtectedRoute adminOnly={true}>
                <Classes />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/matieres"
            element={
              <ProtectedRoute adminOnly={true}>
                <Matieres />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/eleves"
            element={
              <ProtectedRoute>
                <Eleves />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/notes/eleve/:eleveId"
            element={
              <ProtectedRoute>
                <EleveNotes />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/bulletins"
            element={
              <ProtectedRoute>
                <Bulletins />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/parametres"
            element={
              <ProtectedRoute>
                <Parametres />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/professeurs"
            element={
              <ProtectedRoute adminOnly={true}>
                <Professeurs />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profil-admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminProfil />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/consultation-notes"
            element={
              <ProtectedRoute adminOnly={true}>
                <ConsultationNotes />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/passage-classe"
            element={
              <ProtectedRoute>
                <PassageClasseAmeliore />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/passage-classe-admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <PassageClasseAdmin />
              </ProtectedRoute>
            }
          />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/accueil" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/accueil" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
