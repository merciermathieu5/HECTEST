# Maquette · Option C — Édition des questions par CMS (Sveltia)

Cette tranche de validation ajoute un **CMS git-based** (Sveltia, compatible
Decap) pour éditer les questions depuis une interface web, sans serveur, en
restant sur GitHub Pages. **20 questions** ont été migrées en JSON éditable
(couvrant toutes les formes : 8 opérations, 5 types de réponse, réglettes
simple + complexe, 3 dispositions de document, 4 formes de corrigé, les 10
réalités sociales).

Rien n'est cassé côté élève : si `questions.json` est absent ou illisible,
l'app retombe automatiquement sur les données héritées de `data.js`.

## Fichiers de cette maquette

| Fichier | Rôle | Statut |
|---|---|---|
| `assets/data/questions.json` | Les 20 questions éditables par le CMS | **nouveau** |
| `assets/js/cms-adapter.js` | Convertit la forme CMS ⇄ la forme attendue par l'app | **nouveau** |
| `admin/index.html` | Charge Sveltia CMS | **nouveau** |
| `admin/config.yml` | Schéma d'édition (structure d'une question) | **nouveau** |
| `tools/migrate.js` | Régénère `questions.json` depuis `data.js` (script Node) | **nouveau** |
| `index.html` | Ajout d'une ligne `<script>` (adaptateur) | *modifié* |
| `assets/js/app.js` | Bloc « BOOT » : charge + fusionne `questions.json` | *modifié* |

Dépose ces fichiers dans ton dossier `v2/` (en conservant l'arborescence).

## Tester en local

```bash
cd v2
python3 -m http.server 8000
```

- App élève : http://localhost:8000/ — fonctionne comme avant ; la console
  affiche `[CMS] questions.json : 20 remplacée(s)…`.
- Éditeur : http://localhost:8000/admin/ — sur un navigateur Chromium, clique
  **« Work with Local Repository »** et choisis le dossier `v2/`. Tu peux alors
  éditer une question ; Sveltia réécrit `assets/data/questions.json`. Recharge
  l'app pour voir la modification se répercuter dans le cahier généré.

## Passer en production (GitHub Pages)

1. Dans `admin/config.yml`, remplace `OWNER/REPO` par `ton-compte/ton-depot`
   (et ajuste `branch:` si besoin).
2. Authentification la plus simple pour un mainteneur unique : **jeton d'accès
   personnel (PAT)**. Sur la page `/admin/`, clique « Se connecter avec un
   jeton » ; Sveltia ouvre directement la page GitHub de création du jeton avec
   les permissions pré-cochées. Aucun serveur OAuth à installer.
   (Pour plusieurs éditeurs ou un confort « Se connecter avec GitHub » en un
   clic, on pourra ajouter plus tard l'authentificateur Cloudflare Workers de
   Sveltia.)
3. Édite dans `/admin/` → Sveltia commit dans le dépôt → GitHub Pages republie.

## Étendre / régénérer

Pour changer le nombre de questions migrées, modifie `TARGET` dans
`tools/migrate.js`, puis, depuis `v2/` :

```bash
node tools/migrate.js
```

Le script : (1) lit `data.js`, (2) sélectionne les questions en couvrant toutes
les formes, (3) **teste l'aller-retour sans perte** `CMS → runtime`, (4) n'écrit
`questions.json` que si le test passe à 100 %.

## Limites assumées de la maquette (à trancher pour le déploiement complet)

- **Un seul fichier JSON** édité comme une liste : simple et sans étape de build,
  mais un peu lourd au-delà de ~50 questions. Pour les 354, une *collection
  dossier* (un fichier par question, liste cherchable) offre une bien meilleure
  ergonomie — au prix d'un petit script (ou GitHub Action) qui recompile un
  index. À évaluer après ce test d'ergonomie.
- **`imageUrl` saisi comme texte** (chemin). On pourra passer au widget `image`
  de Sveltia (sélection/upload depuis `assets/img`) une fois le modèle validé.
- **PAT à renouveler** selon son échéance ; l'option OAuth « un clic » reste
  disponible si tu veux l'éviter.
