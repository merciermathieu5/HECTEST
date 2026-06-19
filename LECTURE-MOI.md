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
- **Stabilité** — la paix sociale ; à 0, c'est la révolte et le rappel en disgrâce.
- **Faveur de Rome** — la confiance de l'empereur ; à 0, c'est la destitution.
  Attention : ses exigences *changent* avec le temps (après l'Édit de Milan,
  soutenir les chrétiens rapporte de la faveur — l'inverse d'avant).
- **Trésor** — finance les chantiers (actes I-II) puis les armées (acte IV).

## Peut-on atteindre 100 % ?

Oui — la Romanisation peut atteindre 100 %. Mais c'est **comment** on romanise qui
compte. Pousser Rome par la force (imposer la langue, le droit, le culte) fragilise
la stabilité ; arrivé aux crises des actes IV-V, l'édifice vacille et la partie se
termine « inachevée », même à 100 % de romanisation. La fin la plus haute, l'**Apogée**,
exige de romaniser **par l'intégration** (la curie, la citoyenneté, le mélange des
cultes) tout en tenant la province et Rome jusqu'au bout. L'équilibre, pas le score
brut, récompense la maîtrise — et c'est exactement le message historique : la
romanisation a duré là où elle a intégré, non là où elle s'est seulement imposée.

## Modifier le contenu

Tout le contenu vit dans `assets/js/legatus-data.js` : chaque décision, ses options,
leurs effets sur les jauges, la conséquence affichée et le **« pourquoi »** historique.
Les effets sont des hypothèses pédagogiques — **à valider et ajuster selon ton jugement**.
Le dossier `outils/` contient le générateur des personnages (`gen.py`).

## Validation

20 décisions, 5 actes, intermèdes, effet conditionnel de la curie, conséquence
différée d'une répression jusqu'à l'acte chrétien, fins multiples et fins d'échec :
le tout vérifié automatiquement (17 contrôles).
