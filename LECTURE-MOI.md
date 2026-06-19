# Atelier de l'historien — Romanisation (prototype)

Jeu sérieux pour le **Premier cycle du secondaire** (Histoire et éducation à la citoyenneté).
L'élève devient un apprenti historien : chaque **instrument** entraîne une **opération
intellectuelle** du programme, sur la réalité sociale de la **romanisation**.

Ce prototype démontre **un seul moteur réutilisable**, destiné à être réhabillé pour les
dix autres réalités sociales du premier cycle.

---

## 1. Ouvrir le jeu

Double-clique `index.html` — aucun serveur requis. Les données et les images sont
embarquées, donc le jeu fonctionne hors-ligne (utile en classe). Sur GitHub Pages,
dépose le dossier tel quel et ouvre son `index.html`.

La progression et les points sont sauvegardés dans le `localStorage` du navigateur
(clé `atelier.romanisation.v1`), comme dans ton `exercicesOI`.

---

## 2. Ce qui est RÉEL vs GABARIT vs À ENCODER

| Instrument | Opération intellectuelle | Mécanique | Statut |
|---|---|---|---|
| La carte | Situer dans l'espace | association (lettre/n° doc) | **réel — 4 questions** |
| La frise | Situer dans le temps | association + avant/après | **réel — 4 questions** |
| La grille | Mettre en relation des faits | tableau à cocher + association | **réel — 4 questions** |
| Causes & effets | Causes et conséquences | QCM (association) | **réel — 1 question** |
| Le relevé de faits | Établir des faits | QCM | **à encoder** (rien d'auto) |
| Le comparateur | Différences et similitudes | glisser-déposer (3 zones) | **gabarit à valider** |
| Le trieur | Changements et continuités | glisser-déposer (2 zones) | **gabarit à valider** |
| La chaîne causale | Liens de causalité | ordonnancement | **gabarit à valider** |

**13 questions sont corrigées automatiquement à partir de ton vrai `questions.json`.**
Les trois mécaniques de glisser-déposer affichent un **gabarit** (badge « Gabarit ») : la
mécanique est réelle, mais les étiquettes à classer sont une proposition de ma part,
ancrée sur tes vraies questions. Tu les remplaces par ton contenu validé (voir §4).

---

## 3. ⚠️ Incohérences de données détectées (à corriger dans ta banque)

Trois questions de romanisation portent `corrige.kind: "lettres"` alors que leurs valeurs
sont en réalité des **réponses rédigées** (phrases complètes). Elles ne sont donc pas
auto-corrigeables, et le moteur les écarte volontairement :

- `q-rom-faits-7`
- `q-rom-causes-4`
- `q-rom-differences-2`

Le `kind` devrait être `texte` (ou les valeurs devraient devenir de vraies étiquettes).
Bon candidat pour une règle de ton `lint-questions.js` : *si `kind === "lettres"`, chaque
valeur doit être une étiquette courte (`^[A-Za-z]$`, `^\d{1,2}$` ou `^Document \d+$`).*

C'est aussi la raison pour laquelle « Le relevé de faits » n'a aucune question auto :
sa seule question `lettres` est en fait du texte. Une fois encodée correctement (ou
remplacée par un vrai QCM / un bloc `drag`), l'instrument deviendra jouable tout seul.

---

## 4. Le schéma `drag` (ré-encodage en items glissables)

Les gabarits vivent dans `assets/js/atelier-data.js`, sous `window.ATELIER.drag`.
Remplace simplement le contenu par tes éléments validés — le moteur fait le reste.

**Trieur (2 zones) et comparateur (n zones)** — `type: "tri"` :
```js
chang: {
  type: "tri",
  ancre: "q-rom-...",            // id de la vraie question source (référence)
  prompt: "Consigne affichée à l'élève.",
  zones: [ {id:"chgt", label:"Changement"}, {id:"cont", label:"Continuité"} ],
  items: [
    { id:"i1", texte:"…", zone:"chgt" },   // zone = id de la bonne zone
    { id:"i2", texte:"…", zone:"cont" }
  ]
  // retire la clé "_gabarit": true quand le contenu est validé → le badge disparaît
}
```

**Chaîne causale** — `type: "chaine"` :
```js
causalite: {
  type: "chaine",
  ancre: "q-rom-...",
  prompt: "Ordonne les maillons, de la cause initiale à l'impact.",
  items: [ {id:"c1", texte:"…"}, {id:"c2", texte:"…"}, {id:"c3", texte:"…"} ],
  ordre: ["c1","c2","c3"]        // l'ordre attendu
}
```

Le badge « Gabarit » s'affiche tant que `_gabarit: true` est présent. Supprime cette clé
une fois ton contenu validé.

---

## 5. Brancher sur le vrai `questions.json` (intégration au dépôt)

Le prototype embarque une copie des données pour fonctionner en autonomie. Pour
l'intégrer à ta plateforme HEC et puiser dans la source unique de vérité, remplace le
chargement de `atelier-data.js` par un `fetch` filtré. Esquisse :

```js
const REALITE = "romanisation";
const data = await (await fetch("../assets/data/questions.json")).json();
const questions = data.questions.filter(q => q.realite_sociale_id === REALITE);
// applique la pondération + le bloc drag, puis : window.ATELIER = { … questions … };
```

Place alors le dossier du jeu à la racine du dépôt (à côté de `assets/`) pour que les
`imageUrl` (`assets/img/…`) se résolvent sans modification. La pondération des points et
les blocs `drag` peuvent rester dans un petit fichier de configuration par réalité sociale.

---

## 6. Pondération des points (par complexité de l'opération)

Affichée en chiffres romains, comme repère pour les élèves (et clin d'œil à la période) :

- **I** : Situer dans le temps · Situer dans l'espace · Établir des faits
- **II** : Différences et similitudes · Mettre en relation · Changements et continuités
- **III** : Causes et conséquences · Liens de causalité

Modifiable dans `window.ATELIER.ponderation`.

---

## 7. Réhabiller pour une autre réalité sociale

Le moteur (`assets/js/atelier.js`) et le style (`assets/css/atelier.css`) sont **agnostiques
de la réalité sociale**. Pour produire une autre variante :

1. Régénère un `atelier-data.js` filtré sur le nouveau `realite_sociale_id`.
2. Adapte la palette (variables CSS en tête de `atelier.css`) et le titre dans `index.html`.
3. Encode les blocs `drag` propres à la réalité sociale.

Rappel : « Reconnaissance des libertés et des droits civils » ne contient que 8 questions
dans ta banque — à étoffer (≈ 35, couvrant les 8 opérations) avant d'en faire une variante.

---

## 8. Validation

Logique validée avec jsdom (`test-atelier.js`, hors livrable) : chargement sans erreur,
les 8 instruments rendus, les 13 questions réelles corrigées juste, les 3 gabarits drag
placés et corrigés, l'instrument « à encoder » détecté, correction discriminante (une
mauvaise réponse est bien refusée), et progression persistée.
