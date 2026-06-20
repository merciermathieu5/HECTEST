# Legatus — Gouverner au nom de Rome

Jeu sérieux pour le premier cycle du secondaire (Histoire et éducation à la
citoyenneté). Le joueur incarne le pouvoir de Rome dans une province de Gaule et
prend **20 décisions**, réparties en **cinq actes**, qui traversent tout l'arc de
l'Empire d'Occident — de l'implantation de Rome jusqu'au tournant chrétien.

## Lancer le jeu

Double-clique `index.html` — aucun serveur requis, fonctionne hors-ligne. Une partie
enchaîne les 20 décisions et se termine par un bilan. Plusieurs trajectoires, donc
plusieurs fins.

## Les cinq actes

1. **Implanter Rome** — la langue, le droit, la voie romaine (les fondations).
2. **Bâtir la cité romaine** — les thermes, l'aqueduc, le forum et la curie,
   l'amphithéâtre et les jeux (chaque infrastructure et sa fonction).
3. **Vivre en Romain** — le commerce, le culte impérial, l'éducation des élites,
   la citoyenneté (l'édit de Caracalla).
4. **Tenir l'Empire** — la révolte, les frontières, la crise du IIIᵉ siècle, le
   fardeau de l'armée et de l'inflation, un empire trop vaste (la tétrarchie) :
   la difficulté de protéger l'Empire.
5. **Le tournant chrétien** — une religion nouvelle, les persécutions, l'Édit de
   Milan (313), le christianisme religion d'État (Théodose, 380).

Entre les actes, un **intermède** marque le saut dans le temps. En entrant dans les
actes IV et V, l'Empire encaisse une **tension** (perte de stabilité) : la difficulté
n'est plus de romaniser, mais de *tenir* la province à travers les crises et les
bouleversements.

## Deux réalités sociales en un seul jeu

Le jeu relie volontairement deux réalités sociales du programme : **la romanisation
de l'Occident** (actes I à III) et **la christianisation de l'Occident** (acte V).
Les actes télescopent près de quatre siècles : c'est une abstraction assumée pour
faire vivre l'arc complet de l'Empire. À adapter selon ton intention pédagogique.

## Les quatre jauges

- **Romanisation** — l'enracinement de la culture, du droit et des villes de Rome.
- **Stabilité** — la paix sociale ; à 0, c'est la révolte totale et le rappel en disgrâce.
- **Faveur de Rome** — la confiance de l'empereur ; à 0, c'est la destitution.
  Attention : ses exigences *changent* avec le temps (après l'Édit de Milan,
  soutenir les chrétiens rapporte de la faveur — l'inverse d'avant).
- **Trésor** — finance les chantiers (actes I-II) puis les armées (acte IV).
  Le **revenu par tour** est affiché sous la jauge (« +X d. / tour ») : il dépend
  de la Stabilité (impôts rentrant mieux quand la province est calme) et tombe à
  **0 pendant une révolte**.

## Niveaux de difficulté et révolte des provinces

Au lancement, on choisit un niveau : **Apprenti**, **Légat** ou **Imperator**. Le
niveau fixe le **seuil de révolte** : si la Stabilité descend sous ce seuil
(20 / 30 / 40), une province se soulève.

Tant qu'une province est en révolte :
- les gains de **Romanisation** et de **Faveur** sont **freinés** (on ne romanise
  pas une province en feu) ;
- les **impôts ne rentrent plus** (aucun revenu) ;
- la Stabilité **s'érode** un peu chaque tour.

Pour en sortir, il faut **rétablir l'ordre** : remonter la Stabilité au-dessus du
seuil de pacification (la Stabilité, elle, n'est pas freinée — c'est ton levier pour
t'en sortir, afin d'éviter une situation sans issue). Le niveau ajuste aussi la
sévérité du freinage, les impôts et la pression des actes IV-V. Tous ces réglages
vivent dans `difficultes` (dans `legatus-data.js`) et sont **à ajuster** selon tes
classes.

## Peut-on atteindre 100 % ?

Oui — la Romanisation peut atteindre 100 %. Mais c'est **comment** on romanise qui
compte. Pousser Rome par la force (imposer la langue, le droit, le culte) fragilise
la stabilité ; arrivé aux crises des actes IV-V, l'édifice vacille et la partie se
termine « inachevée », même à 100 % de romanisation. La fin la plus haute, l'**Apogée**,
exige de romaniser **par l'intégration** (la curie, la citoyenneté, le mélange des
cultes) tout en tenant la province et Rome jusqu'au bout. L'équilibre, pas le score
brut, récompense la maîtrise — et c'est exactement le message historique : la
romanisation a duré là où elle a intégré, non là où elle s'est seulement imposée.

## Le document à consulter avant chaque décision

Avant de choisir, l'élève lit un **document** présenté dans un panneau « 📜 Document
à consulter ». Chaque décision s'appuie sur une **vraie source antique** : Tacite
(*Agricola*, *Annales*, *Germanie*), Frontin sur les aqueducs, Juvénal (« du pain et
des jeux »), Pline le Jeune et la réponse de Trajan sur les chrétiens, l'édit de
Caracalla (212), l'Édit de Milan (313), l'édit de Thessalonique (380), etc. Les
images réelles déjà dans le jeu (carte de l'Empire, curie, cirque) restent en
vignette sur les décisions concernées.

> **Important — sources :** les textes sont des **adaptations de classe rédigées
> pour le jeu** (résumés en mots simples, attribués à l'auteur et à l'œuvre), et
> **non des citations de traductions existantes**. Le champ `ref` donne l'œuvre et la
> date. **À vérifier et à ajuster** avant usage en évaluation. Tout se modifie dans
> le champ `source` de chaque étape (`legatus-data.js`).

## Perdre en négligeant la romanisation

Romaniser n'est pas optionnel : c'est la **mission**. Aux entrées des actes III, IV
et V, **Rome contrôle tes progrès** (champ `controleRome`) :

- si la Romanisation est **sous le seuil de rappel** (12 / 25 / 38), c'est la
  **défaite immédiate** : « *Rappelé : la mission de Rome trahie* » ;
- si elle est seulement **basse** (sous 25 / 42 / 55), la **Faveur chute** et un
  avertissement s'affiche.

De plus, **faire passer la province avant Rome coûte cher en Faveur** : respecter
les langues, laisser les cultes locaux, baisser les impôts, verser un tribut,
refuser de persécuter, s'opposer à la citoyenneté… toutes ces options pèsent
lourdement sur la faveur de l'empereur (jusqu'à −13). À force, c'est la
**destitution**. Bref, deux façons de perdre par mauvaise romanisation : le
**rappel** (progrès insuffisants) et la **destitution** (Rome lâchée trop souvent).

## Une économie plus serrée

Les chantiers **coûtent plus cher** (un grand aqueduc 80 d., de grands thermes
70 d., un forum monumental 75 d., etc.) et le **revenu par tour est visible** : il
faut désormais **prioriser** les investissements plutôt que tout bâtir. Les coûts
sont dans le champ `cout` des options et le revenu dans `revenu` (`legatus-data.js`).



Tout le contenu vit dans `assets/js/legatus-data.js` : chaque décision, ses options,
leurs effets sur les jauges, la conséquence affichée et le **« pourquoi »** historique.
Les effets sont des hypothèses pédagogiques — **à valider et ajuster selon ton jugement**.
Le dossier `outils/` contient le générateur des personnages (`gen.py`).

## Validation

20 décisions, 5 actes, intermèdes, effet conditionnel de la curie, conséquence
différée d'une répression jusqu'à l'acte chrétien, fins multiples et fins d'échec :
le tout vérifié automatiquement (17 contrôles).
