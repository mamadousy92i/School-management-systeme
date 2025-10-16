import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { eleveService, classeService, periodeService } from '../services/api';
import { CheckCircle, XCircle, Award, AlertCircle, Users, TrendingUp, TrendingDown } from 'lucide-react';

const PassageClasse = () => {
  const { isAdmin } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodes, setPeriodes] = useState([]);
  const [anneeScolaireActive, setAnneeScolaireActive] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      loadEleves();
    }
  }, [selectedClasse]);

  const loadData = async () => {
    try {
      const [classesData, periodesData] = await Promise.all([
        classeService.getAll(),
        periodeService.getAll()
      ]);
      
      // S'assurer que ce sont des tableaux
      setClasses(Array.isArray(classesData) ? classesData : []);
      setPeriodes(Array.isArray(periodesData) ? periodesData : []);
      
      // Trouver la période active
      if (Array.isArray(periodesData)) {
        const periodeActive = periodesData.find(p => p.is_active);
        if (periodeActive) {
          setAnneeScolaireActive(periodeActive.annee_scolaire);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setClasses([]);
      setPeriodes([]);
      setLoading(false);
    }
  };

  const loadEleves = async () => {
    try {
      setLoading(true);
      // Passer statut='tous' pour récupérer TOUS les élèves
      const data = await eleveService.getAll({ 
        classe: selectedClasse,
        statut: 'tous'
      });
      setEleves(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error);
      setEleves([]);
      setLoading(false);
    }
  };

  const handleProposerPassage = async (eleveId, statut) => {
    try {
      await eleveService.proposerPassage(eleveId, statut);
      alert(`Statut changé en "${statut}" avec succès !`);
      loadEleves(); // Recharger pour voir le changement
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du changement de statut');
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      actif: { color: 'bg-blue-100 text-blue-800', icon: Users, label: 'Actif' },
      admis: { color: 'bg-green-100 text-green-800', icon: Award, label: 'Admis' },
      redouble: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Redouble' },
      transfere: { color: 'bg-gray-100 text-gray-800', icon: TrendingUp, label: 'Transféré' },
      abandonne: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Abandonné' },
      diplome: { color: 'bg-purple-100 text-purple-800', icon: Award, label: 'Diplômé' },
    };
    
    const badge = badges[statut] || badges.actif;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const stats = {
    total: eleves.length,
    actifs: eleves.filter(e => e.statut === 'actif').length,
    admis: eleves.filter(e => e.statut === 'admis').length,
    redoublants: eleves.filter(e => e.statut === 'redouble').length
  };

  if (loading && !selectedClasse) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Passages de Classe</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin() 
              ? 'Validez les propositions et effectuez les passages de classe' 
              : 'Proposez le passage ou le redoublement de vos élèves'}
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Comment ça marche ?</h3>
              <p className="text-sm text-blue-800 mt-1">
                {isAdmin() 
                  ? 'Vérifiez les propositions des enseignants, puis validez ou ajustez les statuts. Utilisez ensuite la fonction de passage en masse pour changer les classes.'
                  : 'Marquez vos élèves comme "Admis" (passage en classe supérieure) ou "Redouble" (reste dans la même classe). L\'administrateur validera ensuite.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sélection de classe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner une classe
          </label>
          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choisir une classe --</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom} ({classe.niveau}) - {classe.eleves_count || 0} élèves
              </option>
            ))}
          </select>
        </div>

        {/* Statistiques */}
        {selectedClasse && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Élèves</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.actifs}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admis</p>
                  <p className="text-2xl font-bold text-green-600">{stats.admis}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Redoublants</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.redoublants}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>
        )}

        {/* Liste des élèves */}
        {selectedClasse && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : eleves.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun élève dans cette classe</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom & Prénom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut Actuel
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eleves.map((eleve) => (
                      <tr key={eleve.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {eleve.matricule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {eleve.nom} {eleve.prenom}
                          </div>
                          <div className="text-sm text-gray-500">{eleve.age} ans</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatutBadge(eleve.statut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleProposerPassage(eleve.id, 'admis')}
                              className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                              title="Marquer comme admis"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Admis
                            </button>
                            <button
                              onClick={() => handleProposerPassage(eleve.id, 'redouble')}
                              className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                              title="Marquer comme redoublant"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Redouble
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PassageClasse;
