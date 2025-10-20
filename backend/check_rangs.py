"""
Script pour vérifier le classement et les ex-aequo
Exécuter avec: python manage.py shell < check_rangs.py
"""

from academic.models import Classe, Eleve
from grades.models import Periode, Note, MoyenneEleve

# Paramètres à ajuster
CLASSE_ID = 7  # ID de la classe à vérifier (6ème A)
PERIODE_ID = 1  # ID de la période à vérifier (Trimestre 1)

print("\n" + "="*80)
print("VÉRIFICATION DU CLASSEMENT")
print("="*80 + "\n")

try:
    classe = Classe.objects.get(id=CLASSE_ID)
    periode = Periode.objects.get(id=PERIODE_ID)
    
    print(f"📚 Classe: {classe.nom}")
    print(f"📅 Période: {periode.get_nom_display()}")
    print(f"👥 Effectif: {classe.eleves.filter(statut='actif').count()} élèves\n")
    
    # Récupérer tous les élèves avec leurs moyennes
    eleves = Eleve.objects.filter(classe=classe, statut='actif')
    
    resultats = []
    for eleve in eleves:
        # Calculer la moyenne générale
        moyenne_gen = MoyenneEleve.calculer_moyenne_generale(eleve, periode)
        
        if moyenne_gen is not None:
            resultats.append({
                'id': eleve.id,
                'nom': eleve.nom,
                'prenom': eleve.prenom,
                'matricule': eleve.matricule,
                'moyenne': round(moyenne_gen, 2)
            })
    
    # Trier par moyenne décroissante
    resultats_tries = sorted(resultats, key=lambda x: x['moyenne'], reverse=True)
    
    # Calculer les rangs
    rang_actuel = 0
    moyenne_precedente = None
    
    for i, eleve in enumerate(resultats_tries):
        # Si la moyenne est différente de la précédente, nouveau rang
        if i == 0 or eleve['moyenne'] != moyenne_precedente:
            rang_actuel = i + 1
        
        eleve['rang'] = rang_actuel
        moyenne_precedente = eleve['moyenne']
    
    # Détecter les ex-aequo
    rangs_count = {}
    for eleve in resultats_tries:
        rang = eleve['rang']
        if rang in rangs_count:
            rangs_count[rang] += 1
        else:
            rangs_count[rang] = 1
    
    # Afficher les résultats
    print("="*80)
    print(f"{'Rang':<8} {'Matricule':<12} {'Nom':<20} {'Prénom':<15} {'Moyenne':<10} {'Ex-æquo'}")
    print("="*80)
    
    for eleve in resultats_tries:
        rang = eleve['rang']
        is_exaequo = rangs_count[rang] > 1
        exaequo_marker = "✓ OUI" if is_exaequo else ""
        
        # Médaille pour les 3 premiers
        if rang == 1:
            rang_display = f"🥇 {rang}°"
        elif rang == 2:
            rang_display = f"🥈 {rang}°"
        elif rang == 3:
            rang_display = f"🥉 {rang}°"
        else:
            rang_display = f"   {rang}°"
        
        print(f"{rang_display:<8} {eleve['matricule']:<12} {eleve['nom']:<20} {eleve['prenom']:<15} {eleve['moyenne']:<10.2f} {exaequo_marker}")
    
    print("="*80)
    print(f"\n📊 Total: {len(resultats_tries)} élèves avec notes")
    
    # Afficher les statistiques ex-aequo
    print("\n📈 STATISTIQUES EX-AEQUO:")
    print("-"*40)
    for rang in sorted(rangs_count.keys()):
        count = rangs_count[rang]
        if count > 1:
            eleves_rang = [e for e in resultats_tries if e['rang'] == rang]
            moyenne_commune = eleves_rang[0]['moyenne']
            print(f"   Rang {rang}° : {count} élèves (moyenne {moyenne_commune})")
    
    # Vérifier les sauts de rangs
    print("\n🔍 VÉRIFICATION DES SAUTS:")
    print("-"*40)
    rangs_existants = sorted(set([e['rang'] for e in resultats_tries]))
    for i in range(len(rangs_existants) - 1):
        rang_actuel = rangs_existants[i]
        rang_suivant = rangs_existants[i + 1]
        saut = rang_suivant - rang_actuel
        
        if saut > 1:
            nb_exaequo = rangs_count[rang_actuel]
            print(f"   Saut de {rang_actuel}° à {rang_suivant}° (écart: {saut})")
            print(f"   → Normal: {nb_exaequo} élève(s) au rang {rang_actuel}° (saut attendu: {nb_exaequo})")
            if saut == nb_exaequo:
                print(f"   ✓ Saut correct!")
            else:
                print(f"   ⚠️ ATTENTION: Saut incorrect! Attendu {nb_exaequo}, obtenu {saut}")

except Classe.DoesNotExist:
    print(f"❌ Erreur: Classe avec ID {CLASSE_ID} introuvable")
    print("\n📋 Classes disponibles:")
    for classe in Classe.objects.all()[:10]:
        print(f"   - ID {classe.id}: {classe.nom}")

except Periode.DoesNotExist:
    print(f"❌ Erreur: Période avec ID {PERIODE_ID} introuvable")
    print("\n📋 Périodes disponibles:")
    for periode in Periode.objects.all():
        print(f"   - ID {periode.id}: {periode.get_nom_display()}")

except Exception as e:
    print(f"❌ Erreur: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*80 + "\n")
