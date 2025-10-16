# -*- coding: utf-8 -*-
"""
Script pour verifier le classement et les ex-aequo
"""

from academic.models import Classe, Eleve
from grades.models import Periode, MoyenneEleve

# Parametres
CLASSE_ID = 12  # 3eme A
PERIODE_ID = 1  # Trimestre 1

print("\n" + "="*80)
print("VERIFICATION DU CLASSEMENT")
print("="*80 + "\n")

try:
    classe = Classe.objects.get(id=CLASSE_ID)
    periode = Periode.objects.get(id=PERIODE_ID)
    
    print(f"Classe: {classe.nom}")
    print(f"Periode: {periode.get_nom_display()}")
    
    # Recuperer tous les eleves avec leurs moyennes
    eleves = Eleve.objects.filter(classe=classe, statut='actif')
    print(f"Effectif: {eleves.count()} eleves\n")
    
    resultats = []
    for eleve in eleves:
        moyenne_gen = MoyenneEleve.calculer_moyenne_generale(eleve, periode)
        
        if moyenne_gen is not None:
            resultats.append({
                'id': eleve.id,
                'nom': eleve.nom,
                'prenom': eleve.prenom,
                'matricule': eleve.matricule,
                'moyenne': round(moyenne_gen, 2)
            })
    
    # Trier par moyenne decroissante
    resultats_tries = sorted(resultats, key=lambda x: x['moyenne'], reverse=True)
    
    # Calculer les rangs
    rang_actuel = 0
    moyenne_precedente = None
    
    for i, eleve in enumerate(resultats_tries):
        if i == 0 or eleve['moyenne'] != moyenne_precedente:
            rang_actuel = i + 1
        
        eleve['rang'] = rang_actuel
        moyenne_precedente = eleve['moyenne']
    
    # Detecter les ex-aequo
    rangs_count = {}
    for eleve in resultats_tries:
        rang = eleve['rang']
        rangs_count[rang] = rangs_count.get(rang, 0) + 1
    
    # Afficher les resultats
    print("="*80)
    print(f"{'Rang':<8} {'Matricule':<12} {'Nom':<20} {'Prenom':<15} {'Moyenne':<10} {'Ex-aequo'}")
    print("="*80)
    
    for eleve in resultats_tries:
        rang = eleve['rang']
        is_exaequo = rangs_count[rang] > 1
        exaequo_marker = "OUI" if is_exaequo else ""
        
        if rang == 1:
            rang_display = f"1er"
        else:
            rang_display = f"{rang}e"
        
        print(f"{rang_display:<8} {eleve['matricule']:<12} {eleve['nom']:<20} {eleve['prenom']:<15} {eleve['moyenne']:<10.2f} {exaequo_marker}")
    
    print("="*80)
    print(f"\nTotal: {len(resultats_tries)} eleves avec notes")
    
    # Statistiques ex-aequo
    print("\nSTATISTIQUES EX-AEQUO:")
    print("-"*40)
    exaequo_found = False
    for rang in sorted(rangs_count.keys()):
        count = rangs_count[rang]
        if count > 1:
            exaequo_found = True
            eleves_rang = [e for e in resultats_tries if e['rang'] == rang]
            moyenne_commune = eleves_rang[0]['moyenne']
            print(f"Rang {rang}: {count} eleves (moyenne {moyenne_commune})")
    
    if not exaequo_found:
        print("Aucun ex-aequo detecte")
    
    # Verification des sauts
    print("\nVERIFICATION DES SAUTS:")
    print("-"*40)
    rangs_existants = sorted(set([e['rang'] for e in resultats_tries]))
    
    sauts_incorrects = 0
    for i in range(len(rangs_existants) - 1):
        rang_act = rangs_existants[i]
        rang_suiv = rangs_existants[i + 1]
        saut = rang_suiv - rang_act
        
        if saut > 1:
            nb_exaequo = rangs_count[rang_act]
            print(f"Saut de {rang_act} a {rang_suiv} (ecart: {saut})")
            print(f"  {nb_exaequo} eleve(s) au rang {rang_act}")
            
            if saut == nb_exaequo:
                print(f"  => Saut CORRECT")
            else:
                print(f"  => ERREUR: saut attendu {nb_exaequo}, obtenu {saut}")
                sauts_incorrects += 1
    
    if sauts_incorrects == 0:
        print("Tous les sauts sont corrects!")
    else:
        print(f"\nATTENTION: {sauts_incorrects} saut(s) incorrect(s) detecte(s)")

except Classe.DoesNotExist:
    print(f"Erreur: Classe {CLASSE_ID} introuvable")

except Periode.DoesNotExist:
    print(f"Erreur: Periode {PERIODE_ID} introuvable")

except Exception as e:
    print(f"Erreur: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*80 + "\n")
