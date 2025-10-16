import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import {
  periodeService,
  moyenneService,
  classeService,
  eleveService
} from '../services/api';
import { FileText, Download, Eye, Search, Users, Filter, Award, TrendingUp, List, Grid } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const Bulletins = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Données
  const [periodes, setPeriodes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  
  // Sélections
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  
  // Recherche et filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [elevesWithMoyennes, setElevesWithMoyennes] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'
  
  // Prévisualisation
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const bulletinRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClasse && selectedPeriode) {
      loadElevesAndMoyennes();
    } else {
      setEleves([]);
      setElevesWithMoyennes([]);
    }
  }, [selectedClasse, selectedPeriode]);

  const loadData = async () => {
    try {
      const [periodesData, classesData] = await Promise.all([
        periodeService.getAll(),
        classeService.getAll()
      ]);

      const periodesArray = periodesData.results || periodesData || [];
      const classesArray = classesData.results || classesData || [];

      setPeriodes(periodesArray);
      setClasses(classesArray);
      
      // Présélectionner automatiquement les premiers éléments
      if (periodesArray.length > 0 && !selectedPeriode) {
        setSelectedPeriode(periodesArray[0].id);
      }
      
      if (classesArray.length > 0 && !selectedClasse) {
        setSelectedClasse(classesArray[0].id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadElevesAndMoyennes = async () => {
    if (!selectedPeriode || !selectedClasse) return;
    
    setLoading(true);
    try {
      // Charger élèves et moyennes en parallèle
      const [elevesData, moyennesResponse] = await Promise.all([
        eleveService.getAll({ classe: selectedClasse }),
        moyenneService.getClasseMoyennes({
          classe: selectedClasse,
          periode: selectedPeriode
        })
      ]);
      
      const elevesListe = elevesData.results || elevesData || [];
      setEleves(elevesListe);
      
      // Enrichir avec les moyennes
      const elevesEnriched = elevesListe.map(eleve => {
        const eleveData = moyennesResponse.eleves?.find(e => e.eleve_id === eleve.id);
        return {
          ...eleve,
          notesCount: eleveData?.notes_count || 0,
          moyenneGenerale: eleveData?.moyenne_generale || null,
          hasNotes: eleveData?.has_notes || false,
          nombreMatieres: eleveData?.nombre_matieres || 0
        };
      });
      
      setElevesWithMoyennes(elevesEnriched);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewBulletin = async (eleve) => {
    setLoadingPreview(true);
    setShowPreview(true);
    try {
      const data = await moyenneService.getMoyenneGenerale(eleve.id, selectedPeriode);
      setPreviewData({ ...data, eleve });
    } catch (error) {
      console.error('Erreur:', error);
      setPreviewData(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownloadBulletin = async (eleve) => {
    if (!previewData && !eleve) return;
    
    try {
      // Si on est dans la preview, utiliser previewData, sinon charger les données
      let dataToExport = previewData;
      
      if (!dataToExport) {
        const data = await moyenneService.getMoyenneGenerale(eleve.id, selectedPeriode);
        dataToExport = { ...data, eleve };
      }
      
      // Créer un élément temporaire pour le PDF
      const element = document.createElement('div');
      element.innerHTML = generateBulletinHTML(dataToExport);
      element.style.width = '210mm'; // Format A4
      element.style.padding = '20mm';
      element.style.backgroundColor = 'white';
      element.style.webkitFontSmoothing = 'antialiased';
      element.style.mozOsxFontSmoothing = 'grayscale';
      
      // Options pour html2pdf - optimisé pour 1 page avec qualité maximale
      const options = {
        margin: [8, 8, 8, 8], // Marges réduites
        filename: `Bulletin_${dataToExport.eleve.nom}_${dataToExport.eleve.prenom}_${dataToExport.periode_nom.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 3, // Haute résolution
          useCORS: true, 
          letterRendering: true,
          dpi: 300, // Qualité d'impression professionnelle
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // Générer le PDF
      await html2pdf().set(options).from(element).save();
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  // Fonction pour générer le HTML du bulletin - OPTIMISÉ POUR 1 PAGE A4
  const generateBulletinHTML = (data) => {
    const mention = getMention(data.moyenne_generale);
    
    return `
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 11px; line-height: 1.4; color: #000;">
        <!-- En-tête officiel - COMPACT -->
        <div style="border: 3px solid #1e3a8a; padding: 10px; margin-bottom: 10px; text-align: center;">
          <h1 style="font-size: 18px; font-weight: bold; color: #1e3a8a; margin: 0 0 2px 0; text-transform: uppercase;">${data.ecole?.nom || 'ÉCOLE PRIMAIRE'}</h1>
          ${data.ecole?.devise ? `<p style="font-size: 9px; color: #6b7280; margin: 0 0 4px 0; font-style: italic;">${data.ecole.devise}</p>` : ''}
          <p style="font-size: 10px; color: #6b7280; margin: 0;">Année Scolaire ${data.annee_scolaire || '2024-2025'}</p>
          <div style="width: 80px; height: 2px; background-color: #1e3a8a; margin: 6px auto;"></div>
          <h2 style="font-size: 15px; font-weight: bold; color: #374151; margin: 0; text-transform: uppercase;">BULLETIN DE NOTES</h2>
          <p style="font-size: 13px; font-weight: 600; color: #4b5563; margin-top: 4px;">${data.periode_nom}</p>
        </div>

        <!-- Informations élève - COMPACT -->
        <table style="width: 100%; margin-bottom: 10px; border: 1px solid #d1d5db; border-collapse: collapse; font-size: 10px;">
          <tr style="background-color: #f9fafb;">
            <td style="padding: 6px 8px; border: 1px solid #d1d5db; width: 50%;">
              <span style="color: #6b7280;">Nom et Prénom: </span>
              <strong>${data.eleve.nom} ${data.eleve.prenom}</strong>
            </td>
            <td style="padding: 6px 8px; border: 1px solid #d1d5db;">
              <span style="color: #6b7280;">Matricule: </span>
              <strong>${data.eleve.matricule}</strong>
            </td>
          </tr>
          <tr style="background-color: #f9fafb;">
            <td style="padding: 6px 8px; border: 1px solid #d1d5db;">
              <span style="color: #6b7280;">Classe: </span>
              <strong>${data.eleve.classe_nom || 'N/A'}</strong>
            </td>
            <td style="padding: 6px 8px; border: 1px solid #d1d5db;">
              <span style="color: #6b7280;">Sexe: </span>
              <strong>${data.eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}</strong>
            </td>
          </tr>
        </table>

        <!-- Tableau des notes - COMPACT -->
        <div style="margin-bottom: 10px;">
          <h3 style="background-color: #1e3a8a; color: white; padding: 6px 10px; margin: 0; font-size: 12px; font-weight: bold;">RÉSULTATS PAR MATIÈRE</h3>
          <table style="width: 100%; border-collapse: collapse; border: 2px solid #d1d5db; font-size: 10px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="border: 1px solid #d1d5db; padding: 4px 6px; text-align: left; font-size: 10px; font-weight: bold;">MATIÈRES</th>
                <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center; font-size: 10px; font-weight: bold; width: 50px;">COEF.</th>
                <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center; font-size: 10px; font-weight: bold; width: 60px;">MOY./10</th>
                <th style="border: 1px solid #d1d5db; padding: 4px 6px; text-align: center; font-size: 10px; font-weight: bold; width: 90px;">APPRÉCIATION</th>
              </tr>
            </thead>
            <tbody>
              ${data.moyennes_par_matiere.map((moy, index) => {
                const mMention = getMention(parseFloat(moy.moyenne));
                return `
                  <tr style="background-color: ${index % 2 === 0 ? 'white' : '#f9fafb'};">
                    <td style="border: 1px solid #d1d5db; padding: 4px 6px; font-weight: 600;">${moy.matiere_info.nom}</td>
                    <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">${moy.matiere_info.coefficient}</td>
                    <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center; font-weight: bold; color: #2563eb; font-size: 12px;">${parseFloat(moy.moyenne).toFixed(2)}</td>
                    <td style="border: 1px solid #d1d5db; padding: 4px 6px; text-align: center; font-weight: bold; font-size: 9px;">${mMention.text}</td>
                  </tr>
                `;
              }).join('')}
              <tr style="background-color: #1e3a8a; color: white; font-weight: bold;">
                <td colspan="2" style="border: 1px solid #d1d5db; padding: 6px 8px; font-size: 11px;">MOYENNE GÉNÉRALE</td>
                <td style="border: 1px solid #d1d5db; padding: 6px; text-align: center; font-size: 15px;">${data.moyenne_generale.toFixed(2)}</td>
                <td style="border: 1px solid #d1d5db; padding: 6px; text-align: center; font-size: 11px;">${mention.text}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Statistiques - COMPACT -->
        <table style="width: 100%; margin-bottom: 8px; border-collapse: collapse; font-size: 9px;">
          <tr>
            <td style="width: 33.33%; padding: 4px 6px; border: 1px solid #d1d5db; background-color: #eff6ff; text-align: center;">
              <div style="color: #6b7280;">Rang</div>
              <div style="font-weight: bold; color: #1e3a8a; font-size: 14px;">${data.rang || '-'}/${data.total_eleves || '-'}</div>
            </td>
            <td style="width: 33.33%; padding: 4px 6px; border: 1px solid #d1d5db; background-color: #fef3c7; text-align: center;">
              <div style="color: #6b7280;">Moyenne Classe</div>
              <div style="font-weight: bold; color: #92400e; font-size: 14px;">${data.moyenne_classe ? data.moyenne_classe.toFixed(2) : '-'}/10</div>
            </td>
            <td style="width: 33.33%; padding: 4px 6px; border: 1px solid #d1d5db; background-color: #f0fdf4; text-align: center;">
              <div style="color: #6b7280;">Total Coef.</div>
              <div style="font-weight: bold; color: #166534; font-size: 14px;">${data.moyennes_par_matiere.reduce((sum, m) => sum + parseFloat(m.matiere_info.coefficient || 0), 0)}</div>
            </td>
          </tr>
        </table>

        <!-- Appréciations - COMPACT -->
        <div style="margin-bottom: 8px;">
          <h3 style="background-color: #e5e7eb; padding: 4px 8px; margin: 0; font-size: 10px; font-weight: bold; border: 1px solid #d1d5db;">APPRÉCIATIONS DU CONSEIL DE CLASSE</h3>
          <div style="border: 1px solid #d1d5db; border-top: 0; padding: 8px; min-height: 40px; background-color: #f9fafb;">
            <p style="font-size: 10px; font-style: italic; margin: 0; line-height: 1.3;">
              ${data.moyenne_generale >= 8 ? 
                "Excellent travail. Élève sérieux et appliqué. Continuez ainsi." :
              data.moyenne_generale >= 7 ?
                "Bon travail dans l'ensemble. Peut encore progresser avec plus d'efforts." :
              data.moyenne_generale >= 6 ?
                "Résultats corrects mais irréguliers. Doit fournir plus d'efforts." :
              data.moyenne_generale >= 5 ?
                "Résultats insuffisants. Doit redoubler d'efforts et de sérieux." :
                "Résultats très insuffisants. Un travail régulier est nécessaire."}
            </p>
          </div>
        </div>

        <!-- Signatures - COMPACT -->
        <table style="width: 100%; margin-bottom: 8px; text-align: center; font-size: 9px;">
          <tr>
            <td style="width: 33.33%; padding: 4px; border-top: 2px solid #9ca3af;">
              <p style="font-weight: 600; margin: 0 0 35px 0;">Le Directeur</p>
              <p style="font-size: 8px; color: #6b7280; margin: 0;">Signature et cachet</p>
            </td>
            <td style="width: 33.33%; padding: 4px; border-top: 2px solid #9ca3af;">
              <p style="font-weight: 600; margin: 0 0 35px 0;">Le Professeur Principal</p>
              <p style="font-size: 8px; color: #6b7280; margin: 0;">Signature</p>
            </td>
            <td style="width: 33.33%; padding: 4px; border-top: 2px solid #9ca3af;">
              <p style="font-weight: 600; margin: 0 0 35px 0;">Le Parent/Tuteur</p>
              <p style="font-size: 8px; color: #6b7280; margin: 0;">Signature</p>
            </td>
          </tr>
        </table>

        <!-- Pied de page - COMPACT -->
        <div style="text-align: center; font-size: 8px; color: #6b7280; border-top: 1px solid #d1d5db; padding-top: 6px;">
          <p style="margin: 0;">Document édité le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} - Document officiel à conserver</p>
        </div>
      </div>
    `;
  };

  const filteredEleves = elevesWithMoyennes.filter(eleve => {
    const matchesSearch = 
      eleve.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eleve.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulletins de Notes</h1>
            <p className="text-gray-600 mt-1">
              Générez et consultez les bulletins des élèves
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Période */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période *
              </label>
              <select
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une période</option>
                {periodes.map(periode => (
                  <option key={periode.id} value={periode.id}>
                    {periode.nom_display}
                  </option>
                ))}
              </select>
            </div>

            {/* Classe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe *
              </label>
              <select
                value={selectedClasse}
                onChange={(e) => setSelectedClasse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(classe => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Barre de recherche */}
          {selectedClasse && selectedPeriode && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un élève
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom, prénom ou matricule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Toggle vue + compteur */}
        {selectedClasse && selectedPeriode && filteredEleves.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {filteredEleves.length} élève(s)
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vue Liste */}
        {selectedClasse && selectedPeriode && filteredEleves.length > 0 && viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-700">
                Vue liste
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredEleves.map((eleve) => {
                const mention = eleve.moyenneGenerale ? getMention(parseFloat(eleve.moyenneGenerale)) : null;
                
                return (
                  <div key={eleve.id} className="px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-gray-900">
                              {eleve.nom} {eleve.prenom}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Matricule: {eleve.matricule}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            {/* Nombre de notes */}
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Notes</div>
                              <div className="text-lg font-bold text-gray-900">{eleve.notesCount}</div>
                            </div>
                            
                            {/* Moyenne */}
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Moyenne</div>
                              {eleve.moyenneGenerale ? (
                                <div className="text-2xl font-bold text-blue-600">
                                  {eleve.moyenneGenerale}/10
                                </div>
                              ) : (
                                <div className="text-lg text-gray-400">-</div>
                              )}
                            </div>
                            
                            {/* Mention */}
                            <div className="text-center min-w-[100px]">
                              <div className="text-sm text-gray-500 mb-1">Mention</div>
                              {mention ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${mention.color}`}>
                                  {mention.text}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Boutons d'action */}
                      <div className="flex items-center space-x-2 ml-6">
                        <button
                          onClick={() => handlePreviewBulletin(eleve)}
                          disabled={!eleve.hasNotes}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Voir bulletin</span>
                        </button>
                        <button
                          onClick={() => handleDownloadBulletin(eleve)}
                          disabled={!eleve.hasNotes}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <Download className="h-4 w-4" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vue Grille */}
        {selectedClasse && selectedPeriode && filteredEleves.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEleves.map((eleve) => {
              const mention = eleve.moyenneGenerale ? getMention(parseFloat(eleve.moyenneGenerale)) : null;
              
              return (
                <div key={eleve.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900">
                        {eleve.nom} {eleve.prenom}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {eleve.matricule}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="space-y-3 mb-4">
                    {/* Moyenne */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Moyenne générale</div>
                      {eleve.moyenneGenerale ? (
                        <div className="flex items-end justify-between">
                          <span className="text-3xl font-bold text-blue-600">
                            {eleve.moyenneGenerale}
                          </span>
                          <span className="text-lg text-gray-500 mb-1">/10</span>
                        </div>
                      ) : (
                        <div className="text-2xl text-gray-400">-</div>
                      )}
                    </div>

                    {/* Mention et notes */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Notes</div>
                        <div className="text-xl font-bold text-gray-900">{eleve.notesCount}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Matières</div>
                        <div className="text-xl font-bold text-gray-900">{eleve.nombreMatieres || 0}</div>
                      </div>
                    </div>

                    {/* Mention */}
                    {mention && (
                      <div className="text-center">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${mention.color}`}>
                          {mention.text}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handlePreviewBulletin(eleve)}
                      disabled={!eleve.hasNotes}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Voir le bulletin</span>
                    </button>
                    <button
                      onClick={() => handleDownloadBulletin(eleve)}
                      disabled={!eleve.hasNotes}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Download className="h-4 w-4" />
                      <span>Télécharger PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Message si aucun élève */}
        {selectedClasse && selectedPeriode && filteredEleves.length === 0 && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
            <FileText className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <p className="text-yellow-800 font-medium">
              Aucun élève trouvé
            </p>
          </div>
        )}

        {/* Message sélection */}
        {(!selectedClasse || !selectedPeriode) && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
            <Award className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <p className="text-blue-800 font-medium">
              Sélectionnez une période et une classe pour voir les bulletins
            </p>
          </div>
        )}

        {/* Modal de prévisualisation - Bulletin Professionnel */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Barre d'actions en haut */}
              <div className="sticky top-0 bg-gray-100 border-b border-gray-300 px-6 py-3 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-gray-700">
                  Aperçu du bulletin scolaire
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadBulletin(previewData?.eleve)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Télécharger PDF</span>
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
              </div>

              {/* Contenu du bulletin */}
              <div className="p-8 bg-white">
                {loadingPreview && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {!loadingPreview && previewData && (
                  <div className="max-w-3xl mx-auto">
                    {/* En-tête officiel */}
                    <div className="border-4 border-blue-900 p-6 mb-6">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-blue-900 mb-1 uppercase">
                          {previewData.ecole?.nom || 'ÉCOLE PRIMAIRE'}
                        </h1>
                        {previewData.ecole?.devise && (
                          <p className="text-xs text-gray-500 italic mb-1">{previewData.ecole.devise}</p>
                        )}
                        <p className="text-sm text-gray-600 mb-1">
                          Année Scolaire {previewData.annee_scolaire || '2024-2025'}
                        </p>
                        <div className="w-32 h-1 bg-blue-900 mx-auto my-3"></div>
                        <h2 className="text-xl font-bold text-gray-800 uppercase">BULLETIN DE NOTES</h2>
                        <p className="text-lg font-semibold text-gray-700 mt-2">{previewData.periode_nom}</p>
                      </div>
                    </div>

                    {/* Informations de l'élève */}
                    <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 border border-gray-300">
                      <div>
                        <p className="text-sm text-gray-600">Nom et Prénom</p>
                        <p className="font-bold text-gray-900">{previewData.eleve.nom} {previewData.eleve.prenom}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Matricule</p>
                        <p className="font-bold text-gray-900">{previewData.eleve.matricule}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Classe</p>
                        <p className="font-bold text-gray-900">{previewData.eleve.classe_nom}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sexe</p>
                        <p className="font-bold text-gray-900">{previewData.eleve.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                      </div>
                    </div>

                    {/* Tableau des notes */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 bg-blue-900 text-white px-4 py-2 mb-0">
                        RÉSULTATS PAR MATIÈRE
                      </h3>
                      <table className="w-full border-collapse border-2 border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-bold text-gray-700">MATIÈRES</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700">COEF.</th>
                            <th className="border border-gray-300 px-3 py-2 text-center text-sm font-bold text-gray-700">MOYENNE /10</th>
                            <th className="border border-gray-300 px-4 py-2 text-center text-sm font-bold text-gray-700">APPRÉCIATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.moyennes_par_matiere.map((moy, index) => {
                            const mMention = getMention(parseFloat(moy.moyenne));
                            return (
                              <tr key={moy.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 px-4 py-2 font-semibold text-gray-900">
                                  {moy.matiere_info.nom}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center text-gray-700">
                                  {moy.matiere_info.coefficient}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  <span className="font-bold text-blue-600 text-lg">
                                    {parseFloat(moy.moyenne).toFixed(2)}
                                  </span>
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  <span className={`px-3 py-1 rounded text-xs font-bold ${mMention.color}`}>
                                    {mMention.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {/* Ligne de moyenne générale */}
                          <tr className="bg-blue-900 text-white font-bold">
                            <td className="border border-gray-300 px-4 py-3" colSpan="2">
                              MOYENNE GÉNÉRALE
                            </td>
                            <td className="border border-gray-300 px-3 py-3 text-center text-2xl">
                              {previewData.moyenne_generale.toFixed(2)}
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-center text-lg">
                              {getMention(previewData.moyenne_generale).text}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      <div className="border border-gray-300 p-3 text-center bg-blue-50">
                        <p className="text-xs text-gray-600 mb-1">Total Coef.</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {previewData.moyennes_par_matiere.reduce((sum, m) => sum + parseFloat(m.matiere_info.coefficient || 0), 0)}
                        </p>
                      </div>
                      <div className="border border-gray-300 p-3 text-center bg-green-50">
                        <p className="text-xs text-gray-600 mb-1">Matières</p>
                        <p className="text-2xl font-bold text-green-900">{previewData.nombre_matieres}</p>
                      </div>
                      <div className="border border-gray-300 p-3 text-center bg-purple-50">
                        <p className="text-xs text-gray-600 mb-1">Rang</p>
                        <p className="text-2xl font-bold text-purple-900">{previewData.rang}/{previewData.total_eleves}</p>
                      </div>
                      <div className="border border-gray-300 p-3 text-center bg-orange-50">
                        <p className="text-xs text-gray-600 mb-1">Moy. Classe</p>
                        <p className="text-2xl font-bold text-orange-900">{previewData.moyenne_classe ? previewData.moyenne_classe.toFixed(2) : '-'}/10</p>
                      </div>
                    </div>

                    {/* Appréciations */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-900 bg-gray-200 px-4 py-2 border border-gray-300">
                        APPRÉCIATIONS DU CONSEIL DE CLASSE
                      </h3>
                      <div className="border border-gray-300 border-t-0 p-4 min-h-[80px] bg-gray-50">
                        <p className="text-sm text-gray-700 italic">
                          {previewData.moyenne_generale >= 8 ? 
                            "Excellent travail. Élève sérieux et appliqué. Continuez ainsi." :
                          previewData.moyenne_generale >= 7 ?
                            "Bon travail dans l'ensemble. Peut encore progresser avec plus d'efforts." :
                          previewData.moyenne_generale >= 6 ?
                            "Résultats corrects mais irréguliers. Doit fournir plus d'efforts." :
                          previewData.moyenne_generale >= 5 ?
                            "Résultats insuffisants. Doit redoubler d'efforts et de sérieux." :
                            "Résultats très insuffisants. Un travail régulier est nécessaire."}
                        </p>
                      </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-3 gap-6 mb-6 text-center text-sm">
                      <div className="border-t-2 border-gray-400 pt-2">
                        <p className="font-semibold text-gray-700">Le Directeur</p>
                        <div className="h-16"></div>
                        <p className="text-xs text-gray-500">Signature et cachet</p>
                      </div>
                      <div className="border-t-2 border-gray-400 pt-2">
                        <p className="font-semibold text-gray-700">Le Professeur Principal</p>
                        <div className="h-16"></div>
                        <p className="text-xs text-gray-500">Signature</p>
                      </div>
                      <div className="border-t-2 border-gray-400 pt-2">
                        <p className="font-semibold text-gray-700">Le Parent/Tuteur</p>
                        <div className="h-16"></div>
                        <p className="text-xs text-gray-500">Signature</p>
                      </div>
                    </div>

                    {/* Pied de page */}
                    <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
                      <p>Document édité le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      <p className="mt-1">Ce bulletin est un document officiel à conserver.</p>
                    </div>
                  </div>
                )}

                {!loadingPreview && !previewData && (
                  <div className="text-center py-12">
                    <p className="text-red-600">Erreur lors du chargement du bulletin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Bulletins;
