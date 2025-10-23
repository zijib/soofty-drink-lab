# Soofty Drink Lab

Un petit laboratoire (100% statique) pour composer des boissons gazeuses: créez une bibliothèque d'ingrédients, assemblez une recette par volumes (ml) et obtenez automatiquement sucre, calories, caféine et coût — par 100 ml et au total.

## Démarrage rapide
- Ouvrez `index.html` dans un navigateur moderne (Chrome, Firefox, Edge).
- Aucune installation ni build requis. Optionnel: servez le dossier avec un serveur statique.

```bash
# Optionnel: serveur local dans /workspace
python3 -m http.server 8000
# puis ouvrez http://localhost:8000
```

## Utilisation
- Bibliothèque d'ingrédients:
  - Bouton « Ajouter ingrédient » pour créer un ingrédient (nom, catégorie, couleur, sucre g/100 ml, calories/100 ml, caféine mg/100 ml, coût €/L).
  - Bouton « Charger les préréglages » pour insérer des exemples utiles (Eau, Sirop sucre 50%, etc.).
  - Bouton « Utiliser » ajoute l'ingrédient à la recette (par défaut 100 ml).
  - « Supprimer » retire l'ingrédient (et ses usages dans la recette).
- Recette:
  - Bouton « Ajouter un composant » ajoute une ligne (ingrédient + volume en ml).
  - Ajustez les volumes; les stats se recalculent automatiquement.
- Statistiques: affichage du volume total, du sucre, des calories, de la caféine et du coût — par 100 ml et totaux.
- Sauvegarde/partage:
  - « Nouvelle recette » vide la recette actuelle.
  - « Exporter » télécharge un fichier JSON.
  - « Importer » charge un JSON exporté précédemment.

Les données sont sauvegardées automatiquement dans votre navigateur (localStorage).

## Fichiers
- `index.html` — structure et templates de l'UI.
- `style.css` — styles, thème sombre moderne.
- `app.js` — logique: état, calculs, rendu, import/export, persistance.

## Remarques
- Les calories peuvent être dérivées du sucre si non renseignées (≈ 4 kcal/g), sinon la valeur calories/100 ml saisie est utilisée.
- Les coûts sont en euros: coût total et coût/100 ml sont affichés.
- Ce projet est purement local et éducatif; vérifiez les réglementations si vous formulez des produits réels.
