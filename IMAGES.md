# Images réelles — guide de dépôt

Le jeu peut afficher de **vrais artéfacts mésopotamiens** dans « Consulter la source »,
à la place des illustrations SVG. Le principe est simple et sans risque :

- Dépose un fichier JPEG portant le **nom exact** indiqué ci-dessous dans le dossier `images/`.
- S'il est présent, la photo s'affiche, avec son crédit, sa licence et un lien « voir l'original »,
  et un clic l'agrandit.
- S'il est absent, le jeu **retombe automatiquement** sur l'illustration SVG. Rien ne casse.

Tu peux donc en ajouter une à la fois, à ton rythme.

## Règle d'honnêteté (importante)

Une vraie photo de musée est une **source authentique** : parfaite ici. Une image générée
par IA ne doit **jamais** se faire passer pour un artéfact réel ; si tu en ajoutes pour
l'ambiance, étiquette-la « illustration · reconstitution ». Le crédit affiché sous chaque
photo enseigne d'ailleurs aux élèves d'où vient la source.

## Licences, en bref

- **The Met (Open Access)** : domaine public **CC0**. Aucune permission, aucune attribution
  exigée (on la met quand même, par bonne pratique). Le plus simple.
- **Wikimedia Commons** : licences **mixtes**. Vérifie la page de **chaque** fichier : privilégie
  « domaine public », « CC0 », « CC BY » ou « CC BY-SA », et recopie le crédit demandé.
- **British Museum** : souvent **CC BY-NC-SA** (non commercial, attribution, partage à l'identique).
  Convient à un jeu de classe gratuit, avec attribution.

Pour télécharger au Met : ouvre la page, clique **« Download »** (les fichiers CC0 sont des JPEG haute résolution).

## Optimisation (pour le web)

Avant de déposer : redimensionne le côté le plus long à environ **1200 px** et compresse en
JPEG qualité ~80. Une source = ~150–300 Ko, suffisant à l'écran et léger pour GitHub Pages.

## La liste (nom de fichier → artéfact recommandé)

| Fichier à déposer | Artéfact | Musée · licence | Page |
|---|---|---|---|
| `images/ecriture-tablette.jpg` | Tablette cunéiforme, compte d'orge et d'épeautre (Uruk) | The Met · CC0 | metmuseum.org/art/collection/search/327384 |
| `images/grenier-tablette.jpg` | Tablette, compte administratif de grains | The Met · CC0 | metmuseum.org/art/collection/search/327385 |
| `images/cadastre-stele.jpg` | Stèle d'Ushumgal, acte sur des terres | The Met · CC0 | metmuseum.org/art/collection/search/329079 |
| `images/sceau-cylindre.jpg` | Sceau-cylindre et son empreinte | The Met · CC0 | metmuseum.org — chercher « cylinder seal », filtre Open Access |
| `images/code-hammurabi.jpg` | Stèle du Code d'Hammurabi (Louvre) | Commons · domaine public | commons.wikimedia.org/wiki/Category:Code_of_Hammurabi |
| `images/gilgamesh.jpg` | Héros maîtrisant un lion (Khorsabad, Louvre) | Commons · domaine public | commons.wikimedia.org — « Hero mastering a lion Louvre » |
| `images/ziggourat-ur.jpg` | Grande ziggourat d'Ur (restaurée) | Commons · vérifier la licence | commons.wikimedia.org/wiki/Category:Ziggurat_of_Ur |
| `images/etendard-ur.jpg` | Étendard d'Ur (guerre et paix) | British Museum · vérifier | commons.wikimedia.org/wiki/Category:Standard_of_Ur |
| `images/porte-ishtar.jpg` | Porte d'Ishtar (reconstruction, Berlin) | Commons · vérifier | commons.wikimedia.org/wiki/Category:Ishtar_Gate_in_Pergamon_Museum |
| `images/tablette-deluge.jpg` | Tablette du Déluge (Gilgamesh XI) | British Museum · vérifier | commons.wikimedia.org/wiki/Category:Flood_tablet |

`code-hammurabi.jpg` sert à deux sources (la stèle et le texte de loi).

## Changer un crédit affiché

Le texte du crédit et le lien sont dans `index.html`, dans l'objet `PHOTOS` (en haut du script).
Ajuste-y le crédit pour qu'il corresponde au fichier exact que tu as choisi (auteur, licence).

## Ambiance (option 2)

Les scènes d'ambiance (la bannière d'accueil, par exemple) sont des **SVG originaux** dessinés
pour le jeu : hors-ligne, sans droits, honnêtes. Si tu veux un jour des scènes peintes par IA,
garde-les pour l'ambiance seulement, jamais comme source, et étiquette-les « reconstitution ».
