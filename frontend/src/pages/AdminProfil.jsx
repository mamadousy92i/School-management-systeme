import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { authService, userService } from '../services/api';
import { User, Building2, Mail, Phone, MapPin, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminProfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [pwd, setPwd] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    loadProfil();
  }, []);

  const loadProfil = async () => {
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfil(data);
      setFormData({
        first_name: data.user.first_name || '',
        last_name: data.user.last_name || '',
        email: data.user.email || '',
        telephone: data.user.telephone || '',
        adresse: data.user.adresse || '',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.update(user.id, formData);
      await loadProfil();
      setEditing(false);
      toast.success('Profil mis à jour');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!pwd.old_password) {
      toast.error("Veuillez saisir l'ancien mot de passe");
      return;
    }
    if (!pwd.new_password || pwd.new_password.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (pwd.new_password !== pwd.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      setPwdLoading(true);
      await authService.changePassword({ old_password: pwd.old_password, new_password: pwd.new_password });
      setPwd({ old_password: '', new_password: '', confirm_password: '' });
      toast.success('Mot de passe mis à jour');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail ?? "Erreur lors de la mise à jour du mot de passe";
      toast.error(msg);
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
        </div>
      </Layout>
    );
  }

  if (!profil) {
    return (
      <Layout>
        <div className="text-center text-gray-600 py-12">Profil admin introuvable</div>
      </Layout>
    );
  }

  const u = profil.user || {};
  const a = profil.profile || {}; // Admin profile if present

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-md bg-gray-900 flex items-center justify-center">
              <User className="w-9 h-9 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}
              </h1>
              <div className="mt-1 text-sm text-gray-600 flex items-center gap-3 flex-wrap">
                {u.ecole_nom && (
                  <span className="inline-flex items-center gap-1"><Building2 className="w-4 h-4 text-gray-400" />{u.ecole_nom}</span>
                )}
                {u.role && <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">{u.role}</span>}
                {a.fonction && <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-800">{a.fonction}</span>}
              </div>
            </div>
            <button
              onClick={() => setEditing((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-black"
            >
              <Settings className="w-4 h-4" />
              {editing ? 'Fermer' : 'Modifier'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Prénom</label>
                  <input name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Nom</label>
                  <input name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Téléphone</label>
                  <input name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Adresse</label>
                  <textarea name="adresse" rows={3} value={formData.adresse} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-5 py-2 bg-gray-900 text-white rounded-md hover:bg-black">Sauvegarder</button>
                <button type="button" onClick={() => setEditing(false)} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annuler</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{u.email || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">{u.telephone || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="font-medium text-gray-900">{u.adresse || 'Non renseignée'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Changer le mot de passe */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sécurité • Changer le mot de passe</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Ancien mot de passe</label>
              <input
                type="password"
                value={pwd.old_password}
                onChange={(e) => setPwd(p => ({ ...p, old_password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={pwd.new_password}
                onChange={(e) => setPwd(p => ({ ...p, new_password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Au moins 8 caractères"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                value={pwd.confirm_password}
                onChange={(e) => setPwd(p => ({ ...p, confirm_password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-5 py-2 bg-gray-900 text-white rounded-md hover:bg-black disabled:opacity-50"
            >
              {pwdLoading ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
