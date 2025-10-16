import { useState } from 'react';
import { X, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { noteService } from '../services/api';

const NotesImportModal = ({ 
  show, 
  onClose, 
  selectedPeriode, 
  selectedClasse, 
  matieres, 
  typesEval,
  onImportSuccess 
}) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Veuillez sélectionner un fichier CSV');
    }
  };

  const handleDownloadTemplate = () => {
    const template = `matricule,matiere,type_evaluation,note,date_evaluation,commentaire
EL00001,Mathématiques,Devoir,7.75,2024-10-15,Très bon travail
EL00002,Français,Contrôle,6,2024-10-16,Bien
EL00003,Anglais,Composition,9,2024-10-17,Excellent`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_notes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    return data;
  };

  const handleImport = async () => {
    if (!file || !selectedPeriode || !selectedClasse) {
      alert('Veuillez sélectionner une période, une classe et un fichier CSV');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);

      if (parsedData.length === 0) {
        alert('Le fichier CSV est vide');
        setImporting(false);
        return;
      }

      // Grouper les notes par matière et type d'évaluation
      const groupedNotes = {};

      for (const row of parsedData) {
        // Trouver la matière
        const matiere = matieres.find(m => 
          m.nom.toLowerCase() === row.matiere.toLowerCase() ||
          m.code.toLowerCase() === row.matiere.toLowerCase()
        );

        if (!matiere) {
          console.warn(`Matière non trouvée: ${row.matiere}`);
          continue;
        }

        // Trouver le type d'évaluation
        const typeEval = typesEval.find(t => 
          t.nom.toLowerCase() === row.type_evaluation.toLowerCase() ||
          t.nom_display?.toLowerCase() === row.type_evaluation.toLowerCase()
        );

        if (!typeEval) {
          console.warn(`Type d'évaluation non trouvé: ${row.type_evaluation}`);
          continue;
        }

        const key = `${matiere.id}_${typeEval.id}_${row.date_evaluation}`;
        
        if (!groupedNotes[key]) {
          groupedNotes[key] = {
            matiere_id: matiere.id,
            periode_id: selectedPeriode,
            type_evaluation_id: typeEval.id,
            date_evaluation: row.date_evaluation,
            notes: []
          };
        }

        groupedNotes[key].notes.push({
          matricule: row.matricule,
          valeur: parseFloat(row.note),
          commentaire: row.commentaire || ''
        });
      }

      // Convertir les matricules en IDs d'élèves
      const { eleveService } = await import('../services/api');
      const elevesData = await eleveService.getAll({ classe: selectedClasse });
      const elevesMap = {};
      (elevesData.results || elevesData).forEach(eleve => {
        elevesMap[eleve.matricule] = eleve.id;
      });

      // Importer chaque groupe de notes
      let totalImported = 0;
      const errors = [];

      for (const key in groupedNotes) {
        const group = groupedNotes[key];
        
        // Convertir matricules en IDs
        const notesWithIds = group.notes
          .map(note => {
            const eleveId = elevesMap[note.matricule];
            if (!eleveId) {
              errors.push(`Matricule non trouvé: ${note.matricule}`);
              return null;
            }
            return {
              eleve_id: eleveId,
              valeur: note.valeur,
              commentaire: note.commentaire
            };
          })
          .filter(n => n !== null);

        if (notesWithIds.length > 0) {
          try {
            await noteService.saisieRapide({
              matiere_id: group.matiere_id,
              periode_id: group.periode_id,
              type_evaluation_id: group.type_evaluation_id,
              date_evaluation: group.date_evaluation,
              notes: notesWithIds
            });
            totalImported += notesWithIds.length;
          } catch (error) {
            console.error('Erreur import:', error);
            errors.push(`Erreur lors de l'import d'un groupe de notes`);
          }
        }
      }

      setResult({
        success: true,
        total: parsedData.length,
        imported: totalImported,
        errors
      });

      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('Erreur:', error);
      setResult({
        success: false,
        message: 'Erreur lors de l\'import du fichier'
      });
    } finally {
      setImporting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Importer des notes (CSV)</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Format du fichier CSV</h3>
            <p className="text-sm text-blue-800 mb-2">
              Le fichier doit contenir les colonnes suivantes :
            </p>
            <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
              <li><strong>matricule</strong> : Matricule de l'élève (ex: EL00001)</li>
              <li><strong>matiere</strong> : Nom ou code de la matière (ex: Mathématiques ou MATH)</li>
              <li><strong>type_evaluation</strong> : Devoir, Contrôle ou Composition</li>
              <li><strong>note</strong> : Note sur 10 (ex: 7.5, 8.25)</li>
              <li><strong>date_evaluation</strong> : Date au format AAAA-MM-JJ (ex: 2024-10-15)</li>
              <li><strong>commentaire</strong> : Commentaire optionnel</li>
            </ul>
          </div>

          {/* Bouton template */}
          <button
            onClick={handleDownloadTemplate}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download className="h-5 w-5" />
            <span>Télécharger le modèle CSV</span>
          </button>

          {/* Sélection fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            {file && (
              <p className="text-sm text-green-600 mt-2">
                Fichier sélectionné : {file.name}
              </p>
            )}
          </div>

          {/* Résultat */}
          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start space-x-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  {result.success ? (
                    <>
                      <p className="font-semibold text-green-900">
                        Import réussi !
                      </p>
                      <p className="text-sm text-green-800 mt-1">
                        {result.imported} / {result.total} note(s) importée(s)
                      </p>
                      {result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-yellow-800">Avertissements :</p>
                          <ul className="text-sm text-yellow-700 list-disc list-inside">
                            {result.errors.slice(0, 5).map((err, idx) => (
                              <li key={idx}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-red-900">{result.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Fermer
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                file && !importing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Upload className="h-5 w-5" />
              <span>{importing ? 'Import en cours...' : 'Importer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesImportModal;
