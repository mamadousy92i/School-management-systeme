import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  periodeService,
  typeEvaluationService,
  noteService,
  eleveService,
  matiereService,
  moyenneService
} from '../services/api';
import { ArrowLeft, Save, Plus, Trash2, Edit2, TrendingUp, Grid, List, Filter } from 'lucide-react';

const EleveNotes = () => {
  const { eleveId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReadOnly = searchParams.get('readonly') === 'true';
  
  const [loading, setLoading] = useState(true);
  const [eleve, setEleve] = useState(null);
  const [periodes, setPeriodes] = useState([]);
  const [typesEval, setTypesEval] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [notes, setNotes] = useState([]);
  const [moyennes, setMoyennes] = useState(null);
  
  // Filtres et vue
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'
  const [filterMatiere, setFilterMatiere] = useState('');
  const [filterTypeEval, setFilterTypeEval] = useState('');
  
  // Modal de saisie
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    matiere_id: '',
    type_evaluation_id: '',
    valeur: '',
    date_evaluation: '',
    commentaire: ''
  });

  useEffect(() => {
    loadData();
  }, [eleveId]);

  useEffect(() => {
    if (selectedPeriode && eleveId) {
      loadNotes();
      loadMoyennes();
    }
  }, [selectedPeriode]);

  const loadData = async () => {
    try {
      const [eleveData, periodesData, typesData, matieresData] = await Promise.all([
        eleveService.getById(eleveId),
        periodeService.getAll(),
        typeEvaluationService.getAll(),
        matiereService.getAll()
      ]);

      setEleve(eleveData);
      setPeriodes(periodesData.results || periodesData || []);
      setTypesEval(typesData.results || typesData || []);
      setMatieres(matieresData.results || matieresData || []);
      
      // Auto-sélectionner la première période
      if (periodesData.results?.length > 0 || periodesData?.length > 0) {
        const firstPeriode = periodesData.results?.[0] || periodesData[0];
        setSelectedPeriode(firstPeriode.id);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const notesData = await noteService.getAll({
        eleve: eleveId,
        periode: selectedPeriode
      });
      setNotes(notesData.results || notesData || []);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const loadMoyennes = async () => {
    try {
      const moyennesData = await moyenneService.getMoyenneGenerale(eleveId, selectedPeriode);
      setMoyennes(moyennesData);
    } catch (error) {
      setMoyennes(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        eleve_id: parseInt(eleveId),
        periode_id: parseInt(selectedPeriode),
        matiere_id: parseInt(formData.matiere_id),
        type_evaluation_id: parseInt(formData.type_evaluation_id),
        valeur: parseFloat(formData.valeur)
      };

      if (editingNote) {
        await noteService.update(editingNote.id, data);
      } else {
        await noteService.create(data);
      }

      setShowModal(false);
      setEditingNote(null);
      setFormData({
        matiere_id: '',
        type_evaluation_id: '',
        valeur: '',
        date_evaluation: '',
        commentaire: ''
      });
      
      await loadNotes();
      await loadMoyennes();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      matiere_id: note.matiere,
      type_evaluation_id: note.type_evaluation,
      valeur: note.valeur,
      date_evaluation: note.date_evaluation,
      commentaire: note.commentaire || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Supprimer cette note ?')) return;
    
    try {
      await noteService.delete(noteId);
      await loadNotes();
      await loadMoyennes();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getMention = (moyenne) => {
    if (moyenne >= 8) return { text: 'Très Bien', color: 'text-green-600 bg-green-100' };
    if (moyenne >= 7) return { text: 'Bien', color: 'text-blue-600 bg-blue-100' };
    if (moyenne >= 6) return { text: 'Assez Bien', color: 'text-yellow-600 bg-yellow-100' };
    if (moyenne >= 5) return { text: 'Passable', color: 'text-orange-600 bg-orange-100' };
    return { text: 'Insuffisant', color: 'text-red-600 bg-red-100' };
  };

  if (loading) {
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
        {/* Message lecture seule */}
        {isReadOnly && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Filter className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium">Mode consultation uniquement</p>
                <p className="text-sm text-blue-700 mt-1">
                  Vous consultez les notes en lecture seule. Seuls les enseignants peuvent modifier les notes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(isReadOnly ? '/consultation-notes' : '/notes')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {eleve?.nom} {eleve?.prenom}
              </h1>
              <p className="text-gray-600 mt-1">
                {eleve?.classe_nom} - Matricule: {eleve?.matricule}
              </p>
            </div>
          </div>
          
          {!isReadOnly && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Ajouter une note</span>
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {periodes.map(periode => (
                  <option key={periode.id} value={periode.id}>
                    {periode.nom_display}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Matière */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="h-4 w-4 inline mr-1" />
                Matière
              </label>
              <select
                value={filterMatiere}
                onChange={(e) => setFilterMatiere(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les matières</option>
                {matieres.map(m => (
                  <option key={m.id} value={m.id}>{m.nom}</option>
                ))}
              </select>
            </div>

            {/* Filtre Type d'évaluation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="h-4 w-4 inline mr-1" />
                Type
              </label>
              <select
                value={filterTypeEval}
                onChange={(e) => setFilterTypeEval(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                {typesEval.map(t => (
                  <option key={t.id} value={t.id}>{t.nom_display}</option>
                ))}
              </select>
            </div>

            {/* Mode d'affichage */}
            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Affichage
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-2 rounded-lg transition ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <List className="h-5 w-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 rounded-lg transition ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Grid className="h-5 w-5 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Moyennes */}
        {moyennes && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Moyenne Générale</h2>
                <p className="text-blue-100">{moyennes.periode_nom}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{moyennes.moyenne_generale.toFixed(2)}</div>
                <div className="text-blue-100 text-sm">/ 10</div>
                <div className={`mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getMention(moyennes.moyenne_generale).color}`}>
                  {getMention(moyennes.moyenne_generale).text}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes filtrées */}
        {(() => {
          const filteredNotes = notes.filter(note => {
            if (filterMatiere && note.matiere !== parseInt(filterMatiere)) return false;
            if (filterTypeEval && note.type_evaluation !== parseInt(filterTypeEval)) return false;
            return true;
          });

          return (
            <div>
              {/* Vue Liste */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">
                      Notes ({filteredNotes.length})
                    </h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Matière
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Note
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Commentaire
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredNotes.map((note) => (
                          <tr key={note.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {note.matiere_info?.nom}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {note.type_evaluation_info?.nom_display}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-lg font-bold text-blue-600">
                                {note.valeur}/10
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(note.date_evaluation).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {note.commentaire || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {!isReadOnly ? (
                                <>
                                  <button
                                    onClick={() => handleEdit(note)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition mr-2"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(note.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-400 text-xs italic">Lecture seule</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredNotes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      {notes.length === 0 ? 'Aucune note pour cette période' : 'Aucune note ne correspond aux filtres'}
                    </div>
                  )}
                </div>
              )}

              {/* Vue Grille */}
              {viewMode === 'grid' && (
                <div>
                  <div className="mb-4 text-sm text-gray-600">
                    {filteredNotes.length} note(s)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotes.map((note) => (
                      <div key={note.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {note.matiere_info?.nom}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {note.type_evaluation_info?.nom_display}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">
                              {note.valeur}
                            </div>
                            <div className="text-xs text-gray-500">/10</div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">Date:</span>
                            <span className="ml-2">
                              {new Date(note.date_evaluation).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {note.commentaire && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Commentaire:</span>
                              <p className="mt-1 text-gray-500 italic">{note.commentaire}</p>
                            </div>
                          )}
                        </div>

                        {!isReadOnly && (
                          <div className="flex space-x-2 pt-4 border-t">
                            <button
                              onClick={() => handleEdit(note)}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span>Modifier</span>
                            </button>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {filteredNotes.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                      {notes.length === 0 ? 'Aucune note pour cette période' : 'Aucune note ne correspond aux filtres'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Modal de saisie */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingNote ? 'Modifier la note' : 'Ajouter une note'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matière *
                  </label>
                  <select
                    value={formData.matiere_id}
                    onChange={(e) => setFormData({...formData, matiere_id: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionner</option>
                    {matieres.map(m => (
                      <option key={m.id} value={m.id}>{m.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'évaluation *
                  </label>
                  <select
                    value={formData.type_evaluation_id}
                    onChange={(e) => setFormData({...formData, type_evaluation_id: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sélectionner</option>
                    {typesEval.map(t => (
                      <option key={t.id} value={t.id}>{t.nom_display}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note /10 *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.25"
                    value={formData.valeur}
                    onChange={(e) => setFormData({...formData, valeur: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date_evaluation}
                    onChange={(e) => setFormData({...formData, date_evaluation: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire
                </label>
                <textarea
                  value={formData.commentaire}
                  onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Commentaire optionnel..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingNote(null);
                    setFormData({
                      matiere_id: '',
                      type_evaluation_id: '',
                      valeur: '',
                      date_evaluation: '',
                      commentaire: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="h-5 w-5" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EleveNotes;
