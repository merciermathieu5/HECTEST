# Demokratia — Gouverner Athènes au nom du peuple

Jeu sérieux pour le premier cycle du secondaire (Histoire et éducation à la
citoyenneté, 1ʳᵉ secondaire). Réalité sociale : **« Une première expérience de
démocratie »** (Athènes, 5ᵉ siècle av. J.-C.).

Le joueur dirige Athènes et prend des décisions qui font (ou défont) la
démocratie. Même mécanique que *Legatus* — mais le sens politique est **inversé** :
dans Legatus, le pouvoir vient d'en haut (l'empereur peut te rappeler) ; ici, il
vient **d'en bas** (le peuple peut te chasser du pouvoir).

> **Jeu complet : 24 décisions en 5 actes**, de la naissance de la démocratie
> (Clisthène) à la fin de l'hégémonie athénienne (404-403 av. J.-C.), en passant
> par les guerres médiques, l'âge d'or de Périclès et la guerre du Péloponnèse.

## Lancer le jeu

Double-clique `index.html` — aucun serveur requis, fonctionne hors-ligne.

## Les quatre jauges

- **Démocratie** — *ta mission* : donner le pouvoir au peuple (le contraire de
  l'oligarchie). À surveiller : si elle reste trop basse, les familles riches
  reprennent le contrôle (fin « retour de l'oligarchie »).
- **Paix sociale** — l'entente entre les habitants de la cité. À 0, la cité se
  déchire (révolte, guerre civile).
- **Soutien du peuple** — la confiance des citoyens en toi. À 0, le peuple te
  chasse du pouvoir.
- **Trésor de la cité** — l'argent (la flotte, la guerre, les chantiers). Le
  revenu par tour s'affiche en drachmes (« dr. »).

Comme dans Legatus, **l'option qui fait le plus avancer une jauge coûte presque
toujours ailleurs**. On ne maximise pas tout : la maîtrise, c'est l'équilibre.

## Les cinq actes (24 décisions)

**Acte I — Donner le pouvoir au peuple** : les dettes des paysans (Solon) · qui
peut voter · la réforme de Clisthène · l'assemblée du peuple (l'ecclésia).

**Acte II — Affronter les Perses** : Marathon (Darius) · construire une flotte de
trières (Thémistocle, financée par les mines du Laurion) · Salamine (Xerxès) ·
fonder la Ligue de Délos.

**Acte III — L'âge d'or de Périclès** : payer les citoyens pour qu'ils participent
(le misthos) · bâtir le Parthénon · embellir l'Acropole (les Propylées) · le
quartier des sculpteurs · améliorer l'Agora · les Longs Murs jusqu'au Pirée · le
port du Pirée et les métèques · l'ostracisme. *(C'est l'acte des grands travaux :
la plupart de ces décisions coûtent de l'argent — le trésor se gagne par l'empire
et le commerce, et se dépense ici en culture et en infrastructures.)*

**Acte IV — Tenir l'empire** : une cité alliée se révolte (Samos) · les tensions
avec Sparte (Mégare) · la guerre du Péloponnèse éclate (431) · la peste et les
meneurs démagogues (mort de Périclès).

**Acte V — La fin de l'hégémonie** : la grande expédition de Sicile (415) · le coup
oligarchique des Quatre-Cents (411) · la défaite face à Sparte (404) · le
rétablissement de la démocratie (403).

Au début de chaque acte (II à V), un **intermède** marque le passage du temps, un
**malus** traduit la pression de l'époque (guerre, tensions impériales), et le
peuple **juge tes progrès démocratiques** : si la démocratie est trop faible, il te
chasse.

### Note d'équilibre

Les grandes avancées démocratiques (libérer les pauvres, le vote pour tous, les
tribus de Clisthène, l'assemblée souveraine) **mécontentent les familles riches** et
coûtent de la *Paix sociale* : pousser la démocratie **et** l'empire sans ménager
alliés et citoyens mène à la crise oligarchique (411, 404). Le niveau **Périclès**
est exigeant : seul un jeu équilibré y atteint l'apogée.

## Deux documents à confronter

Avant chaque décision, l'élève lit **deux documents** : un point de vue, puis un
autre. Ils sont inspirés du **corpus HEC** de la réalité sociale et du site
muniverssocial.ca.

> **Sources :** les textes sont des **adaptations** rédigées en mots
> simples pour des élèves de 12-13 ans — **et non des citations exactes**. Pour
> cette raison, **aucune source n'est affichée** dans le jeu : il vaut mieux pas
> de référence qu'une fausse. Si tu en as besoin pour une évaluation, ajoute les
> **vraies sources** de ton corpus en remettant un champ `ref:"…"` dans `source`
> (Document 1) et `source2` (Document 2) de chaque étape, dans
> `assets/js/stratege-data.js` (le jeu l'affichera automatiquement).

Un **délai de lecture** (6 s par défaut, réglable via `delaiLecture`) force la
lecture des documents avant d'ouvrir les choix.

## Niveaux et fins

Trois niveaux (**Apprenti / Stratège / Périclès**) règlent le seuil à partir
duquel la cité se déchire. La partie se termine par un **bilan** (trajectoire des
jauges, journal des décisions, points forts, documents négligés) ou par une **fin
d'échec** (la cité se déchire · le retour de l'oligarchie · chassé par le peuple).

## Où ajuster (tout est dans `assets/js/stratege-data.js`)

- `etapes[]` : chaque décision, ses options, leurs `effets` sur les jauges, la
  `consequence` affichée et le **« pourquoi »** historique.
- `bilans`, `echecs`, `difficultes`, `revenu`, `docAlerts` : réglages du jeu.
- Les **effets sur les jauges sont des hypothèses pédagogiques — à valider et
  ajuster selon ton jugement.**

## Personnages et images

Le dossier `outils/gen-grec.py` génère les personnages SVG (6 rôles × 4
expressions) : `python3 gen-grec.py export ../assets/img/perso`. Les vignettes
(carte de la Grèce, l'assemblée, la trière, Marathon, l'alliance) et le décor de
l'agora sont dans `assets/img/`.

## Trame sonore

Le fichier `assets/audio/stratege-trame.mp3` est, **pour l'instant, la trame de
cuivres de Legatus** (placeholder). À remplacer par une pièce grecque (lyre/aulos)
si tu veux ; le lecteur est dans `assets/js/stratege-audio.js`.

## Validation

Le jeu complet a été vérifié par un harnais jsdom qui joue des parties entières
(jeu sage, imprudent, timide, mauvais) sur les **trois niveaux** : amorçage, 20
décisions, intermèdes et malus d'acte, conséquences, bilans et fins d'échec, sans
erreur d'exécution.
