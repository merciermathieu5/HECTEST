# Legatus — Gouverner la Gaule romaine (jeu sérieux, version BD)

Tu es nommé *legatus* (gouverneur) d'une province récemment conquise. Ta mission :
**romaniser durablement la Gaule** par tes décisions, sans qu'elle se révolte ni que
l'empereur te destitue. Chaque situation t'est présentée par un personnage romain, en
bande dessinée ; tu réponds, et la province réagit.

Ouvre `apercu.png` pour voir une image de la scène.

---

## 1. Jouer

Double-clique `index.html` — aucun serveur requis, fonctionne hors-ligne. Un mandat
enchaîne sept décisions et se termine par un bilan. Plusieurs trajectoires, donc
plusieurs fins.

---

## 2. Ce que tu vois à l'écran

- **Le tableau de bord des jauges** (en haut, toujours visible) : Romanisation (temple),
  Stabilité (bouclier), Faveur de Rome (laurier), Trésor (pièce). Les barres bougent et
  changent de couleur en temps réel ; le gain ou la perte s'affiche après chaque choix.
- **La case de bande dessinée** : un décor de forum romain, un **personnage** qui te parle
  dans une **bulle de dialogue**, et parfois un **document** épinglé (une de tes images).
- **Les décisions**, en cartes, sous la case.

Après chaque choix, le personnage **change d'expression** selon que ta décision a aidé ou
nui, les jauges s'animent, et un encart **« Pourquoi ? »** explique le ressort historique.

---

## 3. Les personnages

Cinq personnages, **dessinés à la main en vectoriel** (SVG, pas des photos), avec quatre
expressions chacun (neutre, satisfait, inquiet, sévère) :

- **Marcus**, ton conseiller — la langue, les chantiers, le culte impérial.
- **Quintus**, un marchand — le commerce le long des voies.
- **Diviciacos**, chef éduen — la révolte (sur fond d'alerte rouge).
- **Aulus**, centurion — la menace aux frontières.
- **L'empereur** — sa visite, et les bilans.

Comme ils sont vectoriels, ils restent nets à toute taille et se déclinent facilement
(le générateur `outils/gen.py`, fourni à part, produit n'importe quel rôle × expression).

---

## 4. Le système (ce qui en fait un jeu, pas un quiz)

Quatre jauges en tension permanente : aucune décision ne les fait toutes monter.

- **Romanisation** — l'objectif (langue, droit, mode de vie romains).
- **Stabilité** — paix sociale ; à zéro, la province se révolte (fin d'échec).
- **Faveur de Rome** — confiance de l'empereur ; à zéro, tu es destitué (fin d'échec).
- **Trésor** — deniers, qui financent les chantiers.

Boucle : un personnage présente une situation → tu décides → les jauges bougent → l'état
de la province change, et certains choix se répercutent plus tard. Quelques mécaniques :

- **Arbitrages réels.** Imposer le latin de force romanise vite mais déstabilise ;
  progressivement, c'est plus lent mais durable.
- **Effet conditionnel.** Si tu as bâti une *curie*, négocier la citoyenneté lors de la
  révolte est bien plus efficace (intégration facilitée des notables).
- **Conséquence différée.** Réprimer par la force laisse un ressentiment qui refait surface
  — et coûte de la stabilité — lors de la visite de l'empereur.
- **Effet persistant.** Une voie romaine rapporte des recettes à chaque rentrée d'impôts.
- **Sept événements** : la langue, un chantier, les marchands, le culte impérial, la
  révolte des Éduens, les frontières menacées, la visite impériale.
- **Fins multiples** selon les jauges finales, plus deux fins d'échec.

---

## 5. Le savoir encodé — à valider par toi

Les effets des décisions traduisent des **logiques historiques** de la romanisation
(la langue comme vecteur, l'intégration des élites par la citoyenneté, le rôle de l'armée
et des infrastructures, l'équilibre conquête/adhésion). Je les ai calibrés à partir du
programme, **mais l'équilibrage et les formulations sont à valider et à ajuster par toi**.
Tout est centralisé et lisible dans `assets/js/legatus-data.js` : chaque option a ses
`effets`, son texte de `consequence` et son champ `pourquoi`. Tu modifies chiffres et
textes sans toucher au moteur.

---

## 6. Ta banque comme source

Trois de tes documents de romanisation servent d'illustrations : la **carte de l'Empire**
(ouverture), la **curie** (le chantier d'administration) et le **cirque** (la visite
impériale), affichés en vignette « document » dans la case. Dans un jeu sérieux, ta banque
devient une réserve de documents et de situations qui nourrit la fiction.

---

## 7. Architecture

- `assets/js/legatus.js` — le **moteur** : jauges, scène (personnage + bulle + décor),
  effets conditionnels/différés/persistants, fins. Agnostique du contenu.
- `assets/js/legatus-data.js` — le **contenu** : état initial, jauges, sept étapes (chacune
  avec son personnage, son expression, son ambiance, son document), seuils des fins.
- `assets/css/legatus.css` — l'habillage BD (case, bulle, jauges).
- `assets/img/perso/` — les 20 personnages (5 rôles × 4 expressions).
- `assets/img/decor-forum.svg` — le décor. `empire/curie/cirque.png` — tes documents.

**Ajouter un événement** : pousse un objet dans `etapes` avec `perso`, `expr`, `ambiance`,
`contexte` et ses `options`. Le moteur s'occupe du reste.

---

## 8. Validation

Logique validée avec jsdom (19 vérifications) : chargement sans erreur, présence du
personnage / de la bulle / des quatre jauges à icônes, quatre parties complètes jouées de
bout en bout, apparition du bon personnage et de la bonne ambiance à chaque événement,
effet conditionnel de la curie (+14 romanisation), conséquence différée de la répression,
seuils de bilan et fin d'échec. Le rendu graphique (personnages, décor, icônes, scène
complète) a été vérifié par rasterisation — voir `apercu.png`.
