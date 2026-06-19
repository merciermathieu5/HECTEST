/* =========================================================================
   LEGATUS — Gouverner la Gaule romaine
   Contenu de jeu (game design). Conçu à partir du savoir disciplinaire de la
   romanisation (PFEQ, Secondaire 1). Les effets sur les jauges encodent des
   logiques historiques réelles ; à valider/ajuster par l'enseignant.
   ========================================================================= */
window.LEGATUS = {
  titre: "Legatus",
  sousTitre: "Gouverner la Gaule romaine",

  etatInitial: { romanisation: 15, stabilite: 55, faveur: 60, tresor: 100 },

  jauges: [
    { id:"romanisation", nom:"Romanisation", lettre:"R", type:"pct", couleur:"pourpre", aide:"Adoption de la langue, du droit et du mode de vie romains." },
    { id:"stabilite",    nom:"Stabilité",    lettre:"S", type:"pct", couleur:"seuil",   aide:"Paix sociale. À zéro, la province se révolte." },
    { id:"faveur",       nom:"Faveur de Rome",lettre:"F",type:"pct", couleur:"seuil",   aide:"Confiance de l'empereur. À zéro, tu es destitué." },
    { id:"tresor",       nom:"Trésor",        lettre:"T", type:"res", couleur:"bronze",  aide:"Deniers disponibles pour bâtir." }
  ],

  intro: {
    image:"assets/img/empire.png",
    titre:"Tu es nommé Legatus de la Gaule",
    texte:"L'empereur te confie le gouvernement de la Gaule, province récemment soumise. Ta mission : y enraciner Rome — sa langue, son droit, son mode de vie — sans que la province ne se soulève, ni que l'empereur ne te rappelle. Tu disposes du trésor provincial et de ton jugement.",
    bouton:"Prendre mes fonctions"
  },

  // Séquence du mandat
  etapes: [
    {
      type:"evenement",
      id:"langue",
      titre:"La langue de l'administration",
      contexte:"Les cités gauloises t'adressent leurs requêtes dans une dizaine de langues. Comment organises-tu l'administration de la province ?",
      revenuApres:true,
      options:[
        { label:"Imposer le latin partout, sans délai",
          effets:{ romanisation:12, stabilite:-12, faveur:6 },
          consequence:"Édits, tribunaux, écoles : tout passe au latin. Les notables romanisés applaudissent, mais beaucoup de Gaulois se sentent dépossédés.",
          pourquoi:"Le latin est le premier vecteur de la romanisation. Imposé brutalement, toutefois, il heurte les identités locales et nourrit la rancœur." },
        { label:"Latin pour l'administration, tolérer les langues locales au quotidien",
          effets:{ romanisation:6, stabilite:3, faveur:2 },
          consequence:"Le latin devient la langue du pouvoir et du droit ; les langues gauloises subsistent dans les villages. La transition se fait sans heurt.",
          pourquoi:"C'est souvent la voie de Rome : une romanisation par le haut, progressive, qui dure justement parce qu'elle ne repose pas sur la seule contrainte." },
        { label:"Respecter les langues gauloises, ne rien brusquer",
          effets:{ romanisation:1, stabilite:6, faveur:-5 },
          consequence:"Tu gouvernes dans les langues du pays. La paix règne, mais la province reste profondément gauloise.",
          pourquoi:"La paix sociale est préservée, mais Rome attend de son légat des résultats, pas seulement le statu quo." }
      ]
    },
    {
      type:"construction",
      id:"chantier",
      titre:"Bâtir pour romaniser",
      contexte:"Le trésor te permet un grand chantier. Une infrastructure bien choisie transforme durablement la province.",
      options:[
        { label:"Une voie romaine", cout:50,
          effets:{ romanisation:8 }, persistant:{ tresor:15 }, flag:"voie",
          consequence:"La route relie la province au reste de l'Empire. Marchands, soldats et lois y circulent désormais — et le commerce gonflera tes recettes.",
          pourquoi:"Les routes tissent la province à Rome : elles diffusent le droit, les marchandises et l'armée, et stimulent durablement le commerce." },
        { label:"Des thermes", cout:60,
          effets:{ romanisation:10, stabilite:4 },
          consequence:"On vient s'y baigner, discuter, faire affaire. Le mode de vie romain s'installe dans les habitudes.",
          pourquoi:"Les thermes diffusent la culture romaine du quotidien : on y adopte les manières, la langue et les codes de Rome." },
        { label:"Une curie (siège de l'administration)", cout:65, image:"assets/img/curie.png",
          effets:{ romanisation:6, stabilite:2 }, flag:"curie",
          consequence:"Le nouveau siège du conseil provincial permet d'associer des notables gaulois à l'administration romaine.",
          pourquoi:"En intégrant les élites locales au pouvoir, Rome s'en fait des alliés — c'est la clé d'une romanisation profonde et durable." },
        { label:"Épargner le trésor", cout:0,
          effets:{},
          consequence:"Tu renonces à bâtir cette année et conserves tes réserves.",
          pourquoi:"Garder des deniers de côté peut s'avérer sage avant les temps difficiles — mais rien ne romanise tout seul." }
      ]
    },
    {
      type:"evenement",
      id:"revolte",
      titre:"La révolte des Éduens",
      contexte:"Lassés des impôts et de l'autorité romaine, les Éduens prennent les armes.",
      contexteGrave:"Lassés des impôts et de l'autorité romaine, les Éduens prennent les armes — et plusieurs cités voisines les rejoignent. La situation est grave.",
      seuilGrave:40,
      revenuApres:true,
      options:[
        { label:"Réprimer par les légions",
          effets:{ stabilite:15, romanisation:-8, faveur:6 }, flag:"repression",
          consequence:"Les légions écrasent la révolte. L'ordre revient vite — mais la province se tait par crainte, non par adhésion.",
          pourquoi:"La force rétablit l'ordre rapidement. Or la soumission n'est pas l'adhésion : la rancœur couve et la romanisation recule." },
        { label:"Négocier et accorder la citoyenneté aux élites éduennes",
          effets:{ stabilite:10, romanisation:10, faveur:-5, tresor:-20 },
          effetsSi:{ flag:"curie", effets:{ stabilite:12, romanisation:14, faveur:-2, tresor:-20 }, note:"Grâce à ta curie, l'intégration des notables se fait sans heurt." },
          consequence:"Les chefs éduens, devenus citoyens romains, déposent les armes : ils ont désormais tout à gagner de Rome.",
          pourquoi:"Rome a bâti son empire en intégrant les élites locales : la citoyenneté offerte aux notables gaulois en a fait des alliés (on verra des sénateurs gaulois à Rome). Les conservateurs romains, eux, s'en méfient." },
        { label:"Baisser les impôts pour apaiser",
          effets:{ stabilite:8, romanisation:2, tresor:-30 },
          consequence:"Le soulagement fiscal calme la colère. La révolte s'éteint, mais tes caisses en souffrent.",
          pourquoi:"Apaiser par l'argent évite l'affrontement, mais vide le trésor et ne romanise guère la province." }
      ]
    },
    {
      type:"evenement",
      id:"visite",
      titre:"La visite de l'empereur",
      contexte:"L'empereur en personne vient inspecter ta province.",
      contexteSi:{ flag:"repression", ajout:" Des inscriptions hostiles à Rome maculent encore les murs depuis la répression.", malus:{ stabilite:-8 } },
      image:"assets/img/cirque.png",
      options:[
        { label:"Offrir des jeux fastueux au cirque", cout:40,
          effets:{ faveur:12, stabilite:6 },
          consequence:"Courses de chars et largesses : la foule acclame Rome, et l'empereur repart conquis — mais le trésor est entamé.",
          pourquoi:"« Du pain et des jeux » : la générosité publique séduit le peuple et impressionne l'empereur, à grands frais." },
        { label:"Présenter sobrement les comptes et les progrès",
          effets:{ faveur:5, romanisation:3 },
          consequence:"Tu exposes routes, recettes et avancées. L'empereur apprécie un gouvernement sérieux, sans dépense ostentatoire.",
          pourquoi:"Un gouvernement rigoureux rassure Rome sur le long terme, sans dilapider les deniers de la province." }
      ]
    }
  ],

  revenu: { haut:40, bas:20, seuil:40, texte:"Récolte des impôts" },

  // Fins d'échec immédiat
  echecs: {
    stabilite:{ titre:"La province s'embrase", texte:"La stabilité s'est effondrée : la Gaule entière se soulève. Incapable de tenir la province, tu es rappelé à Rome en disgrâce. La conquête sans intégration mène à la révolte." },
    faveur:{ titre:"Destitué par l'empereur", texte:"L'empereur a perdu confiance en toi : tu es relevé de tes fonctions. Gouverner une province, c'est aussi savoir conserver l'appui de Rome." }
  },

  // Bilan de fin de mandat (premier seuil atteint, dans l'ordre)
  bilans: [
    { si:{ romanisation:45, stabilite:50 }, titre:"Province romaine et paisible",
      texte:"La Gaule parle latin, vit à la romaine et reste fidèle à Rome. Ton mandat laisse un héritage durable : routes, droit, citoyens. Voilà la romanisation réussie — non par la seule conquête, mais par l'intégration." },
    { si:{ romanisation:30 }, titre:"Romanisation engagée mais fragile",
      texte:"Rome a pris pied, mais l'enracinement reste superficiel. Sans une intégration plus profonde, ton œuvre pourrait ne pas survivre à ton successeur." },
    { si:{}, titre:"Province à peine romanisée",
      texte:"La Gaule demeure gauloise. La conquête militaire n'a pas suffi : sans langue, droit et infrastructures partagés, il n'y a pas de véritable romanisation." }
  ]
};
