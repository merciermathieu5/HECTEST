# Legatus — Gouverner au nom de Rome

Jeu sérieux pour le premier cycle du secondaire (Histoire et éducation à la
citoyenneté). Le joueur incarne le pouvoir de Rome dans une province de Gaule et
prend **20 décisions**, réparties en **cinq actes**, qui traversent tout l'arc de
l'Empire d'Occident — de l'implantation de Rome jusqu'au tournant chrétien.

## Lancer le jeu

Double-clique `index.html` — aucun serveur requis, fonctionne hors-ligne. Une partie
enchaîne les 20 décisions et se termine par un bilan. Plusieurs trajectoires, donc
plusieurs fins.

> **Affichage** : l'interface est conçue pour tenir dans un écran d'ordinateur
> (testée à 1366 × 768) sans avoir à faire défiler la page, écran après écran.

## Page d'accueil

Au lancement, une **page d'accueil illustrée** présente l'activité : une **bannière façon bande dessinée** (le décor du forum en fond, un personnage romain en toge, le titre « Legatus » sous une couronne de laurier, et l'accroche sur un bandeau lisible), un **bandeau des 4 jauges** aux couleurs du tableau de bord, puis **deux colonnes** — « Comment ça marche » et « Contexte pédagogique » (Histoire et éducation à la citoyenneté, 1re secondaire ; réalités sociales : la romanisation et la christianisation de l'Occident) — et enfin le **choix du niveau**. L'ensemble tient dans un écran d'ordinateur sans défilement. Tout le contenu est éditable dans l'objet `accueil` de `legatus-data.js`.

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

## Deux documents à confronter avant chaque décision

Avant de choisir, l'élève lit **deux documents affichés à droite du personnage** :
**Document 1** appuie un point de vue (ex. Tacite : le latin fait la « civilisation »)
et **Document 2** présente un **avis divergent**, dans un encadré
distinct (bleuté), pour **croiser les sources** — Irénée de Lyon (les langues locales
résistent), Sénèque sur la cruauté des jeux, Pline le Jeune sur un aqueduc qui ruine
une cité, l'opposition du Sénat aux Gaulois (Tacite, *Annales* XI), le chef breton
Calgacus, Tertullien, Symmaque, Libanios, etc. Les images réelles (carte de l'Empire,
curie, cirque) restent en vignette dans la case ; sur mobile, les documents passent
**sous** la case.

> **Important — sources :** les textes sont des **adaptations de classe rédigées
> pour le jeu** (résumés en mots simples, attribués à l'auteur et à l'œuvre), et
> **non des citations de traductions existantes**. Le champ `ref` donne l'œuvre et la
> date. **À vérifier et à ajuster** avant usage en évaluation. Tout se modifie dans
> les champs `source` (Document 1) et `source2` (Document 2) de chaque étape
> (`legatus-data.js`).

### Délai de lecture avant les choix

Pour forcer la **lecture des documents**, les options de réponse sont **désactivées
pendant 10 secondes** : un bandeau affiche un compte à rebours et une barre qui se
remplit, puis les choix s'ouvrent. Les options déjà bloquées faute de trésor le
restent.

Le délai est **paramétrable** sans toucher au moteur :

- **Pour tout le jeu** — ajoute `delaiLecture: 10` (en secondes) à l'objet
  `window.LEGATUS` de `legatus-data.js`. Mets `0` pour désactiver le verrou.
- **Pour une étape précise** — ajoute `delaiLecture: 15` (par exemple) dans cette
  étape ; cette valeur a priorité sur la valeur globale.

### Conséquences en fenêtre surgissante

Après chaque décision, les **conséquences s'affichent dans un pop-up** par-dessus la
scène : la **réaction du personnage** (portrait + description textuelle), l'**impact
sur les jauges** (pastilles colorées : +/− Romanisation, Stabilité, Faveur, Trésor,
avec le bilan financier du tour), un encadré **« Pourquoi ? »**, et le bouton
**Continuer**. Pendant ce temps, le tableau de bord en haut se met à jour. La touche
*Échap* équivaut à *Continuer*.

## Perdre en négligeant la romanisation

Romaniser n'est pas optionnel : c'est la **mission**. Aux entrées des actes III, IV
et V, **Rome contrôle tes progrès** (champ `controleRome`) :

- si la Romanisation est **sous le seuil de rappel** (16 / 32 / 48), c'est la
  **défaite immédiate** : « *Rappelé : la mission de Rome trahie* » ;
- si elle est seulement **basse** (sous 32 / 50 / 65), la **Faveur chute** et un
  avertissement s'affiche.

De plus, **faire passer la province avant Rome coûte cher en Faveur** : respecter
les langues, laisser les cultes locaux, baisser les impôts, verser un tribut,
refuser de persécuter, s'opposer à la citoyenneté… toutes ces options pèsent
lourdement sur la faveur de l'empereur (jusqu'à −13). À force, c'est la
**destitution**. Bref, deux façons de perdre par mauvaise romanisation : le
**rappel** (progrès de romanisation insuffisants) et la **destitution** par l'empereur. À chaque **revue d'acte** (actes III, IV, V), si la **Faveur de Rome** est trop basse (sous **22**, puis **30**, puis **38** — les attentes de Rome montent), le gouverneur est **rappelé**. Un avertissement prévient quand la faveur approche du seuil. La faveur à 0 met fin au mandat immédiatement.

## Impact financier durable des choix

Les choix ne pèsent plus seulement sur le tour courant : beaucoup laissent une
**rente récurrente** appliquée **à chaque tour** (champ `persistant:{ tresor:±N }`).

- **Commerce et routes** font **croître le revenu** (grande voie +6 / tour, forum
  monumental +5, « favoriser le commerce » +8, citoyenneté élargie +3…).
- **Infrastructures** coûtent leur **entretien** (grands thermes −3, grand aqueduc
  −3, grands jeux −4… *panem et circenses* coûte cher).
- **Armée et garnisons** pèsent durablement (légions d'Italie −5, limes −5,
  mobilisation −5, tribut −3…).
- **L'armée coûte cher**, en ponctuel **et** en entretien récurrent : lever des
  auxiliaires (−25 d. puis −5 / tour), faire venir des légions (−45 puis −8),
  verser un tribut (−35 puis −5), mobiliser tout l'Empire (−50 puis −8), tenir
  le limes (−45 puis −8). Une province militarisée voit son **revenu fondre**.

Le **revenu net par tour** s'affiche sous le Trésor : `impôts + commerce −
entretien`. Il **baisse quand la province est instable** (impôts réduits) et, en
**révolte**, les impôts et le commerce tombent à zéro tandis que l'entretien continue
de peser — le revenu peut alors devenir **négatif** (affiché en rouge). Il faut donc
financer les chantiers et l'armée par un **commerce qui se développe**, pas seulement
par le trésor de départ. Les valeurs sont dans le champ `persistant` des options
(`legatus-data.js`).



Les réglages sont **durcis** pour sanctionner les choix faibles :

- **Bilans plus stricts** — l'Apogée exige romanisation ≥ 85, stabilité ≥ 65 et
  faveur ≥ 55 ; un héritage « durable » exige 62 / 48 / 40 ; en deçà, « inachevée »
  puis « effacée ».
- **Pression d'acte accrue** — chaque nouvel acte (III, IV, V) entame la stabilité
  (jusqu'à −18) et la faveur.
- **Économie serrée** — chantiers chers (grand aqueduc 80 d., thermes 70 d., forum
  75 d.), **revenu de base volontairement bas** (≈ 12 / 4 d. par tour) : sans commerce, on ne finance presque rien et
  **passivité pénalisée** : ne rien bâtir coûte un peu de stabilité ou de faveur.

Tous ces réglages (`bilans`, `controleRome`, `acteMalus`, `cout`, `revenu`) vivent
dans `legatus-data.js` et sont **à ajuster** selon tes groupes.



Tout le contenu vit dans `assets/js/legatus-data.js` : chaque décision, ses options,
leurs effets sur les jauges, la conséquence affichée et le **« pourquoi »** historique.
Les effets sont des hypothèses pédagogiques — **à valider et ajuster selon ton jugement**.
Le dossier `outils/` contient le générateur des personnages (`gen.py`).

## Validation

20 décisions, 5 actes, intermèdes, effet conditionnel de la curie, conséquence
différée d'une répression jusqu'à l'acte chrétien, fins multiples et fins d'échec :
le tout vérifié automatiquement (17 contrôles).

## Trame sonore (en boucle)

Une **musique de fond en boucle** accompagne la partie : une pièce de cuivres
romaine d'environ 38 s, montée à partir de tes deux extraits
(`190029` cuivres, puis `190028` cuivres + tambours), avec des fondus aux
jonctions et un **fondu de boucle** pour que la fin se raccorde au début sans
couture. Le fichier est `assets/audio/legatus-trame.mp3` ; le lecteur est dans
`assets/js/legatus-audio.js`.

- **Constante, sans variation d'intensité** : un fond stable, qui tourne en boucle.
- **Démarrage** au premier clic (choix du niveau), comme l'exigent les navigateurs.
- **Bouton haut-parleur** en bas à gauche pour couper/activer ; choix mémorisé.

## Mise en page compacte

L'écran de décision (jauges + scène + documents + boutons) est calibré pour
**tenir dans une fenêtre d'ordinateur sans défiler** : la case BD est plafonnée
à ~24 vh, les jauges et les blocs sont resserrés, et la colonne de documents
prend la hauteur de son contenu (plus de barre de défilement interne).
