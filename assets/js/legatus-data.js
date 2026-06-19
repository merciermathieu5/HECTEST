/* =========================================================================
   LEGATUS — Gouverner la Gaule romaine
   Contenu de jeu étendu. Effets sur les jauges = logiques historiques de la
   romanisation (PFEQ, Secondaire 1) ; à valider/ajuster par l'enseignant.
   Champs de mise en scène : perso (rôle), expr (expression), ambiance, document.
   ========================================================================= */
window.LEGATUS = {
  titre:"Legatus", sousTitre:"Gouverner la Gaule romaine",
  etatInitial:{ romanisation:15, stabilite:55, faveur:60, tresor:100 },

  jauges:[
    { id:"romanisation", nom:"Romanisation", icone:"temple", type:"pct", couleur:"pourpre" },
    { id:"stabilite",    nom:"Stabilité",     icone:"bouclier",type:"pct", couleur:"seuil" },
    { id:"faveur",       nom:"Faveur de Rome", icone:"laurier",type:"pct", couleur:"seuil" },
    { id:"tresor",       nom:"Trésor",         icone:"piece",  type:"res", couleur:"bronze" }
  ],

  intro:{
    perso:"conseiller", expr:"neutre", ambiance:"jour", document:"empire",
    nom:"Marcus, ton conseiller",
    titre:"Te voilà Legatus de la Gaule",
    texte:"L'empereur t'a confié cette province, légat. Notre mission : y enraciner Rome — sa langue, son droit, ses mœurs — sans que la Gaule ne se révolte, ni que l'empereur ne te rappelle. Le trésor provincial et ton jugement, voilà tes seules armes.",
    bouton:"Prendre mes fonctions"
  },

  etapes:[
    {
      type:"evenement", id:"langue", perso:"conseiller", expr:"neutre", ambiance:"jour",
      nom:"Marcus, ton conseiller",
      titre:"La langue de l'administration",
      contexte:"Les cités gauloises nous écrivent dans dix langues, légat. Comment veux-tu organiser l'administration ?",
      revenuApres:true,
      options:[
        { label:"Imposer le latin partout, sans délai",
          effets:{ romanisation:12, stabilite:-12, faveur:6 },
          consequence:"Édits, tribunaux, écoles : tout passe au latin. Les notables romanisés applaudissent ; le peuple, lui, se braque.",
          pourquoi:"Le latin est le premier vecteur de la romanisation. Imposé trop vite, il heurte les identités locales et nourrit la rancœur." },
        { label:"Latin pour l'administration, tolérer les langues locales",
          effets:{ romanisation:6, stabilite:3, faveur:2 },
          consequence:"Le latin devient la langue du pouvoir et du droit ; les parlers gaulois demeurent au village. La transition se fait sans heurt.",
          pourquoi:"C'est souvent la voie de Rome : une romanisation par le haut, progressive, qui dure parce qu'elle ne s'impose pas par la seule contrainte." },
        { label:"Respecter les langues gauloises, ne rien brusquer",
          effets:{ romanisation:1, stabilite:6, faveur:-5 },
          consequence:"Tu gouvernes dans les langues du pays. La paix règne, mais la province reste profondément gauloise.",
          pourquoi:"La paix sociale est préservée, mais Rome attend de son légat des résultats, pas le statu quo." }
      ]
    },
    {
      type:"construction", id:"chantier", perso:"conseiller", expr:"neutre", ambiance:"jour", document:"curie",
      nom:"Marcus, ton conseiller",
      titre:"Bâtir pour romaniser",
      contexte:"Le trésor permet un grand chantier, légat. Bien choisi, il transforme la province pour des générations.",
      options:[
        { label:"Une voie romaine", cout:50, effets:{ romanisation:8 }, persistant:{ tresor:15 }, flag:"voie",
          consequence:"La route relie la province à l'Empire : marchands, soldats et lois y circulent — et le commerce gonflera tes recettes.",
          pourquoi:"Les routes tissent la province à Rome : elles diffusent le droit, les marchandises et l'armée, et stimulent durablement le commerce." },
        { label:"Des thermes", cout:60, effets:{ romanisation:10, stabilite:4 },
          consequence:"On vient s'y baigner, discuter, faire affaire. Le mode de vie romain entre dans les habitudes.",
          pourquoi:"Les thermes diffusent la culture du quotidien : on y adopte les manières, la langue et les codes de Rome." },
        { label:"Une curie pour le conseil provincial", cout:65, flag:"curie", effets:{ romanisation:6, stabilite:2 },
          consequence:"Le nouveau siège du conseil permet d'associer des notables gaulois à l'administration romaine.",
          pourquoi:"En intégrant les élites locales au pouvoir, Rome s'en fait des alliés — la clé d'une romanisation profonde et durable." },
        { label:"Épargner le trésor", cout:0, effets:{},
          consequence:"Tu renonces à bâtir cette année et conserves tes réserves.",
          pourquoi:"Garder des deniers peut être sage avant les temps difficiles — mais rien ne romanise tout seul." }
      ]
    },
    {
      type:"evenement", id:"commerce", perso:"marchand", expr:"neutre", ambiance:"jour",
      nom:"Quintus, un marchand",
      titre:"Les marchands de la voie",
      contexte:"Légat ! Nous, marchands, voulons commercer le long de tes routes. Quelle politique nous réserves-tu ?",
      revenuApres:true,
      options:[
        { label:"Taxer lourdement les échanges",
          effets:{ tresor:30, stabilite:-6, romanisation:1 },
          consequence:"Tes caisses se remplissent vite. Mais les marchands rechignent et certaines cités murmurent contre la pression fiscale.",
          pourquoi:"Le commerce remplit le trésor, mais une fiscalité trop lourde décourage l'activité et irrite la province." },
        { label:"Favoriser le commerce, péages légers",
          effets:{ romanisation:8, stabilite:4, tresor:10 },
          consequence:"Les marchés se multiplient le long des voies. Avec les marchandises voyagent la monnaie, la langue et les usages de Rome.",
          pourquoi:"Le commerce le long des voies romaines diffuse la monnaie et la culture de Rome : il romanise en douceur." },
        { label:"Réserver le grand commerce aux citoyens romains",
          effets:{ romanisation:4, faveur:5, stabilite:-5 },
          consequence:"Les citoyens romains prospèrent et Rome apprécie. Les marchands gaulois, eux, se sentent lésés.",
          pourquoi:"Favoriser les citoyens renforce le prestige de Rome, mais frustre une partie de la population." }
      ]
    },
    {
      type:"evenement", id:"culte", perso:"conseiller", expr:"neutre", ambiance:"jour",
      nom:"Marcus, ton conseiller",
      titre:"Le culte impérial",
      contexte:"Rome souhaite qu'on honore l'empereur comme un dieu, légat. Faut-il l'imposer aux Gaulois ?",
      revenuApres:true,
      options:[
        { label:"Imposer le culte de Rome et de l'empereur",
          effets:{ romanisation:10, stabilite:-10, faveur:8 },
          consequence:"Des autels à l'empereur s'élèvent dans chaque cité. Rome est ravie ; les fidèles des dieux gaulois, beaucoup moins.",
          pourquoi:"Le culte impérial soude l'Empire autour de l'empereur, mais imposé de force il heurte les croyances locales." },
        { label:"Encourager le mélange des dieux romains et gaulois",
          effets:{ romanisation:8, stabilite:5 },
          consequence:"On associe Mercure à un dieu gaulois, on partage les temples. Les Gaulois adoptent Rome sans renier les leurs.",
          pourquoi:"Rome a souvent fondu ses dieux avec ceux des peuples conquis (l'interpretatio romana) : une romanisation respectueuse et durable." },
        { label:"Laisser librement les cultes locaux",
          effets:{ stabilite:6, faveur:-4 },
          consequence:"Chacun prie ses dieux. La paix religieuse règne, mais Rome n'a guère avancé ses pions.",
          pourquoi:"La liberté religieuse préserve la paix, mais ne fait pas progresser la romanisation." }
      ]
    },
    {
      type:"evenement", id:"revolte", perso:"gaulois", expr:"severe", ambiance:"danger",
      nom:"Diviciacos, chef éduen",
      titre:"La révolte des Éduens",
      contexte:"Romain ! Tes impôts nous étranglent et ton autorité nous humilie. Les Éduens ont pris les armes !",
      contexteGrave:"Romain ! Tes impôts nous étranglent et ton autorité nous humilie. Les Éduens ont pris les armes — et d'autres cités nous rejoignent. La Gaule s'embrase !",
      seuilGrave:40, revenuApres:true,
      options:[
        { label:"Réprimer par les légions", flag:"repression",
          effets:{ stabilite:15, romanisation:-8, faveur:6 },
          consequence:"Les légions écrasent la révolte. L'ordre revient vite — mais la province se tait par crainte, non par adhésion.",
          pourquoi:"La force rétablit l'ordre rapidement. Or la soumission n'est pas l'adhésion : la rancœur couve et la romanisation recule." },
        { label:"Négocier et accorder la citoyenneté aux élites éduennes",
          effets:{ stabilite:10, romanisation:10, faveur:-5, tresor:-20 },
          effetsSi:{ flag:"curie", effets:{ stabilite:12, romanisation:14, faveur:-2, tresor:-20 }, note:"Grâce à ta curie, l'intégration des notables se fait sans heurt." },
          consequence:"Les chefs éduens, devenus citoyens romains, déposent les armes : ils ont désormais tout à gagner de Rome.",
          pourquoi:"Rome a bâti son empire en intégrant les élites locales : la citoyenneté offerte aux notables en fit des alliés (on verra des sénateurs gaulois à Rome). Les conservateurs romains, eux, s'en méfient." },
        { label:"Baisser les impôts pour apaiser",
          effets:{ stabilite:8, romanisation:2, tresor:-30 },
          consequence:"Le soulagement fiscal calme la colère. La révolte s'éteint, mais tes caisses en souffrent.",
          pourquoi:"Apaiser par l'argent évite l'affrontement, mais vide le trésor et ne romanise guère." }
      ]
    },
    {
      type:"evenement", id:"frontiere", perso:"centurion", expr:"severe", ambiance:"danger",
      nom:"Aulus, centurion",
      titre:"Les frontières menacées",
      contexte:"Légat ! Des bandes germaniques ont franchi le Rhin et pillent nos confins. Quels sont tes ordres ?",
      revenuApres:true,
      options:[
        { label:"Lever des auxiliaires gaulois pour défendre la frontière",
          effets:{ romanisation:8, stabilite:4, faveur:4, tresor:-20 },
          consequence:"Des Gaulois prennent les armes sous l'aigle romaine. En servant Rome, ils s'y attachent — et la citoyenneté récompensera leur fidélité.",
          pourquoi:"Enrôler les Gaulois dans l'armée les intègre à Rome : le service militaire, récompensé par la citoyenneté, fut un puissant moteur de romanisation." },
        { label:"Faire venir des légions d'Italie",
          effets:{ stabilite:10, faveur:-4, tresor:-30 },
          consequence:"Les légions repoussent l'envahisseur et sécurisent la frontière — au prix fort, et sans rien changer aux cœurs gaulois.",
          pourquoi:"Les légions sécurisent vite, mais coûtent cher et n'intègrent pas la population locale." },
        { label:"Négocier et verser un tribut aux chefs germains",
          effets:{ tresor:-30, stabilite:4, faveur:-6 },
          consequence:"L'or achète la paix sur le Rhin. La frontière se calme, mais Rome juge le procédé indigne de sa grandeur.",
          pourquoi:"Acheter la paix évite la guerre, mais affaiblit le prestige de Rome." }
      ]
    },
    {
      type:"evenement", id:"visite", perso:"empereur", expr:"neutre", ambiance:"solennel", document:"cirque",
      nom:"L'empereur en personne",
      titre:"La visite de l'empereur",
      contexte:"Legatus, je viens juger de ton œuvre en Gaule. Montre-moi ce que vaut ton gouvernement.",
      contexteSi:{ flag:"repression", ajout:" Des inscriptions hostiles à Rome maculent encore les murs depuis ta répression.", malus:{ stabilite:-8 } },
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

  revenu:{ haut:35, bas:18, seuil:40, texte:"Récolte des impôts" },

  echecs:{
    stabilite:{ perso:"gaulois", expr:"severe", ambiance:"danger", titre:"La province s'embrase",
      texte:"La stabilité s'est effondrée : la Gaule entière se soulève. Incapable de tenir la province, tu es rappelé à Rome en disgrâce. La conquête sans intégration mène à la révolte." },
    faveur:{ perso:"empereur", expr:"severe", ambiance:"solennel", titre:"Destitué par l'empereur",
      texte:"L'empereur a perdu confiance en toi : tu es relevé de tes fonctions. Gouverner une province, c'est aussi savoir conserver l'appui de Rome." }
  },

  bilans:[
    { si:{ romanisation:55, stabilite:50 }, perso:"empereur", expr:"content", ambiance:"solennel",
      titre:"Province romaine et paisible",
      texte:"La Gaule parle latin, vit à la romaine et reste fidèle à Rome. Ton mandat laisse un héritage durable : routes, droit, citoyens. Voilà la romanisation réussie — non par la seule conquête, mais par l'intégration." },
    { si:{ romanisation:35 }, perso:"conseiller", expr:"neutre", ambiance:"jour",
      titre:"Romanisation engagée mais fragile",
      texte:"Rome a pris pied, mais l'enracinement reste superficiel. Sans une intégration plus profonde, ton œuvre pourrait ne pas survivre à ton successeur." },
    { si:{}, perso:"gaulois", expr:"neutre", ambiance:"jour",
      titre:"Province à peine romanisée",
      texte:"La Gaule demeure gauloise. La conquête militaire n'a pas suffi : sans langue, droit et infrastructures partagés, il n'y a pas de véritable romanisation." }
  ]
};
