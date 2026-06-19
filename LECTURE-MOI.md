# Legatus — Gouverner la Gaule romaine (prototype de jeu sérieux)

Tu es nommé *legatus* (gouverneur) d'une province récemment conquise. Ta mission :
**romaniser durablement la Gaule** par tes décisions, sans qu'elle se révolte ni que
l'empereur te destitue. Ce n'est pas un questionnaire : c'est une **simulation** où le
savoir disciplinaire est encodé dans les règles du jeu.

---

## 1. Jouer

Double-clique `index.html` — aucun serveur requis, fonctionne hors-ligne. Une partie
(un mandat) dure quatre étapes et se termine par un bilan. Plusieurs trajectoires, donc
plusieurs fins.

---

## 2. La différence avec une interface de questions

| Interface de questions | Jeu sérieux (celui-ci) |
|---|---|
| Question → réponse → correction | Décision → conséquence → l'état change |
| Une bonne réponse | Des arbitrages, pas de réponse parfaite |
| Le savoir est *testé* | Le savoir est *le système qu'on manipule* |
| L'élève répond | L'élève gouverne |

On comprend la romanisation **en la faisant** : en arbitrant entre contrainte et
adhésion, en bâtissant des infrastructures, en intégrant ou en réprimant les élites
locales — et en vivant les conséquences.

---

## 3. Le système

Quatre jauges en tension permanente (aucune décision ne les fait toutes monter) :

- **Romanisation** — adoption de la langue, du droit, du mode de vie romains (l'objectif).
- **Stabilité** — paix sociale ; à zéro, la province se révolte (fin d'échec).
- **Faveur de Rome** — confiance de l'empereur ; à zéro, tu es destitué (fin d'échec).
- **Trésor** — deniers, qui financent les chantiers.

La boucle : un **événement** se présente → tu **décides** → les **jauges bougent** → l'état
de la province change, et certains choix se répercutent plus tard.

Exemples de mécaniques systémiques déjà en place dans le prototype :

- **Arbitrages réels.** Imposer le latin de force fait monter la romanisation mais chuter
  la stabilité ; le latin progressif romanise plus lentement mais durablement.
- **Effet conditionnel.** Si tu as bâti une *curie*, négocier la citoyenneté lors de la
  révolte est nettement plus efficace (intégration facilitée des notables).
- **Conséquence différée.** Réprimer la révolte par la force laisse un ressentiment qui
  refait surface — et coûte de la stabilité — lors de la visite de l'empereur.
- **Effet persistant.** Une voie romaine rapporte des recettes commerciales à chaque
  rentrée d'impôts.
- **Fins multiples** selon les jauges finales (province romaine et paisible / romanisation
  fragile / à peine romanisée), plus deux fins d'échec.

Après chaque décision, un encart **« Pourquoi ? »** explicite le lien historique. C'est de
la rétroaction formative, pas une note.

---

## 4. Le savoir encodé — à valider par toi

Les effets des décisions sur les jauges traduisent des **logiques historiques** de la
romanisation (la langue comme vecteur, l'intégration des élites par la citoyenneté, le rôle
des infrastructures, l'équilibre conquête/adhésion). Je les ai calibrés à partir du
programme, **mais l'équilibrage et les formulations sont à valider et à ajuster par toi** —
c'est ton expertise de contenu, pas la mienne. Tout est centralisé et lisible dans
`assets/js/legatus-data.js` : chaque option a ses `effets`, son texte de `consequence` et
son champ `pourquoi`. Tu modifies les chiffres et les textes sans toucher au moteur.

---

## 5. Ta banque comme source (pas comme squelette)

Trois illustrations du jeu proviennent directement de tes documents de romanisation :
la **carte de l'Empire** (écran d'ouverture), le **cirque** (la visite impériale) et la
**curie** (le chantier d'administration). C'est le nouveau rôle de ta banque dans un jeu
sérieux : une **réserve de documents, de faits et de situations** qui nourrit les
événements. Tes questions auto-corrigeables (le prototype précédent) peuvent aussi
devenir des **épreuves ponctuelles** intégrées à la fiction — par exemple, réussir une
lecture de carte pour débloquer la meilleure option de décision.

---

## 6. Architecture (réutilisable)

- `assets/js/legatus.js` — le **moteur de simulation** : jauges, application des effets,
  effets conditionnels/différés/persistants, fins. **Agnostique du contenu.**
- `assets/js/legatus-data.js` — le **contenu du mandat** : état initial, jauges, étapes
  (événements et chantiers), seuils des fins. C'est ici qu'on conçoit le jeu.
- `assets/css/legatus.css` — l'habillage (palette romaine, tableau de bord des jauges).

Pour **ajouter une étape** : pousse un objet dans `etapes` (`type:"evenement"` ou
`"construction"`) avec ses `options` et leurs `effets`. Le moteur la prend en charge.

---

## 7. « Un moteur, onze peaux » — version simulation

Le moteur de jauges/événements/décisions est réutilisable pour les autres réalités
sociales : il suffit de concevoir un nouveau `…-data.js` avec des jauges et des événements
propres à la période. Quelques pistes :

- **Sédentarisation** — jauges Nourriture / Population / Savoir-faire ; décisions sur la
  domestication, le stockage, le passage à la vie sédentaire.
- **Première démocratie (Athènes)** — jauges Participation / Cohésion / Puissance ;
  décisions sur l'inclusion ou l'exclusion (femmes, métèques, esclaves), les réformes,
  la guerre.
- **Industrialisation** — jauges Production / Conditions ouvrières / Capital ; gérer une
  usine et une ville industrielle.

C'est plus de conception par réalité sociale qu'un simple réhabillage — chaque période a
son propre système — mais c'est ce qui sépare un jeu sérieux d'un exerciseur.

---

## 8. Validation

Logique validée avec jsdom (`test-legatus.js`, hors livrable) : chargement sans erreur,
quatre parties complètes jouées de bout en bout, vérification de l'effet conditionnel de
la curie, de la conséquence différée de la répression, des seuils de bilan, et du
déclenchement d'une fin d'échec.
