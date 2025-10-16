import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Matieres from './pages/Matieres';
import Eleves from './pages/Eleves';
import Notes from './pages/Notes';
import EleveNotes from './pages/EleveNotes';
import Bulletins from './pages/Bulletins';
import Parametres from './pages/Parametres';
import Professeurs from './pages/Professeurs';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
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
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
