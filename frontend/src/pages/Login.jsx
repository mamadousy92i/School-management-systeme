import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, AlertCircle, GraduationCap } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(credentials);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 min-h-screen">
      <div className="space-y-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center bg-blue-600 mx-auto rounded-full w-16 h-16">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h2 className="mt-6 font-extrabold text-gray-900 text-3xl">
            Système de Gestion Scolaire
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow-xl p-8 rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 p-4 border-red-500 border-l-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 w-5 h-5 text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block mb-2 font-medium text-gray-700 text-sm">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="block py-3 pr-3 pl-10 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full transition"
                  placeholder="Entrez votre nom d'utilisateur"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
                Mot de passe
              </label>
              <div className="relative">
                <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="block py-3 pr-3 pl-10 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full transition"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm px-4 py-3 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full font-medium text-white text-sm transition disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="mr-2 border-white border-b-2 rounded-full w-5 h-5 animate-spin"></div>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>

            {/* Inscription supprimée: les comptes sont créés par un administrateur */}
          </form>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-xs text-center">
          © 2025 Système de Gestion Scolaire. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default Login;
