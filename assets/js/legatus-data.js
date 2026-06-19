/* =========================================================================
   LEGATUS — Gouverner la Gaule romaine
   Progression en quatre actes (dix décisions). Effets sur les jauges =
   logiques historiques de la romanisation (PFEQ, Secondaire 1) ; à valider
   et ajuster par l'enseignant.
   Principe d'équilibrage : l'option qui romanise le plus coûte presque
   toujours de la stabilité, du trésor ou de la faveur. On NE PEUT donc PAS
   tout maximiser : atteindre une romanisation très élevée force à fragiliser
   le reste. La maîtrise, c'est l'équilibre.
   Champs de mise en scène : acte, an, perso, expr, ambiance, document.
   ========================================================================= */
window.LEGATUS = {
  titre:"Legatus", sousTitre:"Gouverner la Gaule romaine",
  etatInitial:{ romanisation:12, stabilite:58, faveur:60, tresor:100 },

  jauges:[
    { id:"romanisation", nom:"Romanisation", icone:"temple", type:"pct", couleur:"pourpre" },
    { id:"stabilite",    nom:"Stabilité",     icone:"bouclier",type:"pct", couleur:"seuil" },
    { id:"faveur",       nom:"Faveur de Rome", icone:"laurier",type:"pct", couleur:"seuil" },
    { id:"tresor",       nom:"Trésor",         icone:"piece",  type:"res", couleur:"bronze" }
  ],

  intro:{
    perso:"conseiller", expr:"neutre", ambiance:"jour", document:"empire",
    nom:"Marcus, ton conseiller", acte:"Avant-propos",
    titre:"Te voilà Legatus de la Gaule",
    texte:"L'empereur t'a confié cette province, légat. Notre tâche s'étalera sur plusieurs années : enraciner Rome — sa langue, son droit, ses mœurs — sans que la Gaule ne se révolte, ni que l'empereur ne te rappelle. Avance pas à pas : les fondations d'abord, l'essor ensuite, puis les épreuves.",
    bouton:"Prendre mes fonctions"
  },

  /* PROGRESSION EN QUATRE ACTES */
  etapes:[
    /* ---------- ACTE I — PRENDRE SES FONCTIONS (fondations) ---------- */
    {
      type:"evenement", id:"langue", acte:"Acte I — Prendre ses fonctions", an:"I",
      perso:"conseiller", expr:"neutre", ambiance:"jour",
      nom:"Marcus, ton conseiller",
      titre:"La langue de l'administration",
      contexte:"Les cités gauloises nous écrivent dans dix langues, légat. Par quoi commencer ?",
      revenuApres:true,
      options:[
        { label:"Imposer le latin partout, sans délai", effets:{ romanisation:12, stabilite:-12, faveur:6 },
          consequence:"Édits, tribunaux, écoles : tout passe au latin. Les notables romanisés applaudissent ; le peuple se braque.",
          pourquoi:"Le latin est le premier vecteur de la romanisation. Imposé trop vite, il heurte les identités locales et nourrit la rancœur." },
        { label:"Latin pour l'administration, tolérer les langues locales", effets:{ romanisation:6, stabilite:1, faveur:2 },
          consequence:"Le latin devient la langue du pouvoir ; les parlers gaulois demeurent au village. La transition se fait sans heurt.",
          pourquoi:"La voie habituelle de Rome : une romanisation par le haut, progressive, qui dure parce qu'elle ne s'impose pas par la seule force." },
        { label:"Respecter les langues gauloises, ne rien brusquer", effets:{ romanisation:1, stabilite:6, faveur:-5 },
          consequence:"Tu gouvernes dans les langues du pays. La paix règne, mais la province reste profondément gauloise.",
          pourquoi:"La paix sociale est préservée, mais Rome attend de son légat des résultats, pas le statu quo." }
      ]
    },
    {
      type:"construction", id:"chantier", acte:"Acte I — Prendre ses fonctions", an:"I",
      perso:"conseiller", expr:"neutre", ambiance:"jour", document:"curie",
      nom:"Marcus, ton conseiller",
      titre:"Le premier chantier",
      contexte:"Le trésor permet un grand chantier, légat. Bien choisi, il transforme la province pour des générations.",
      options:[
        { label:"Une voie romaine", cout:50, effets:{ romanisation:8 }, persistant:{ tresor:15 }, flag:"voie",
          consequence:"La route relie la province à l'Empire : marchands, soldats et lois y circulent — et le commerce gonflera tes recettes.",
          pourquoi:"Les routes tissent la province à Rome et stimulent durablement le commerce." },
        { label:"Des thermes", cout:60, effets:{ romanisation:10, stabilite:4 },
          consequence:"On vient s'y baigner, discuter, faire affaire. Le mode de vie romain entre dans les habitudes.",
          pourquoi:"Les thermes diffusent la culture du quotidien : on y adopte les manières et la langue de Rome." },
        { label:"Une curie pour le conseil provincial", cout:65, flag:"curie", effets:{ romanisation:6, stabilite:2 },
          consequence:"Le siège du conseil permet d'associer des notables gaulois à l'administration romaine.",
          pourquoi:"En intégrant les élites locales, Rome s'en fait des alliés — la clé d'une romanisation profonde (utile face à la révolte qui vient)." },
        { label:"Épargner le trésor", cout:0, effets:{},
          consequence:"Tu renonces à bâtir cette année et conserves tes réserves.",
          pourquoi:"Garder des deniers peut être sage avant les temps difficiles — mais rien ne romanise tout seul." }
      ]
    },
    /* ---------- ACTE II — DÉVELOPPER LA PROVINCE (essor) ---------- */
    {
      type:"evenement", id:"droit", acte:"Acte II — Développer la province", an:"II",
      perso:"conseiller", expr:"neutre", ambiance:"jour",
      nom:"Marcus, ton conseiller",
      titre:"Le droit romain",
      contexte:"Faut-il imposer le droit de Rome dans les tribunaux de la province, légat ?",
      revenuApres:true,
      options:[
        { label:"Imposer le droit romain partout", effets:{ romanisation:12, stabilite:-10, faveur:4 },
          consequence:"Le droit romain règle désormais tout litige. C'est un puissant ciment — mais les coutumes ancestrales bafouées font grincer des dents.",
          pourquoi:"Le droit est l'un des grands vecteurs de la romanisation ; imposé d'un coup, il déracine et provoque des résistances." },
        { label:"Droit romain, mais coutumes locales reconnues", effets:{ romanisation:7, stabilite:1 },
          consequence:"Les tribunaux appliquent le droit romain tout en respectant certains usages gaulois. L'adoption se fait en douceur.",
          pourquoi:"Reconnaître les coutumes locales tout en avançant le droit romain : une intégration juridique durable." },
        { label:"Laisser les coutumes gauloises", effets:{ romanisation:1, stabilite:5, faveur:-4 },
          consequence:"La justice reste coutumière. Personne n'est froissé, mais Rome n'a guère avancé.",
          pourquoi:"La paix est préservée, mais le droit — donc la romanisation — n'a pas progressé." }
      ]
    },
    {
      type:"evenement", id:"commerce", acte:"Acte II — Développer la province", an:"II",
      perso:"marchand", expr:"neutre", ambiance:"jour",
      nom:"Quintus, un marchand",
      titre:"Les marchands de la voie",
      contexte:"Légat ! Nous voulons commercer le long de tes routes. Quelle politique nous réserves-tu ?",
      revenuApres:true,
      options:[
        { label:"Taxer lourdement les échanges", effets:{ tresor:30, stabilite:-6, romanisation:1 },
          consequence:"Tes caisses se remplissent vite. Mais les marchands rechignent et les cités murmurent contre l'impôt.",
          pourquoi:"Le commerce remplit le trésor ; trop taxé, il s'étiole et irrite la province." },
        { label:"Favoriser le commerce, péages légers", effets:{ romanisation:7, stabilite:1, tresor:8 },
          consequence:"Les marchés se multiplient. Avec les marchandises voyagent la monnaie, la langue et les usages de Rome.",
          pourquoi:"Le commerce le long des voies diffuse la culture de Rome : il romanise en douceur." },
        { label:"Réserver le grand commerce aux citoyens romains", effets:{ romanisation:4, faveur:5, stabilite:-5 },
          consequence:"Les citoyens prospèrent et Rome apprécie. Les marchands gaulois, eux, se sentent lésés.",
          pourquoi:"Favoriser les citoyens renforce le prestige de Rome, mais frustre une partie de la population." }
      ]
    },
    {
      type:"evenement", id:"culte", acte:"Acte II — Développer la province", an:"III",
      perso:"conseiller", expr:"neutre", ambiance:"jour",
      nom:"Marcus, ton conseiller",
      titre:"Le culte impérial",
      contexte:"Rome veut qu'on honore l'empereur comme un dieu, légat. Faut-il l'imposer aux Gaulois ?",
      revenuApres:true,
      options:[
        { label:"Imposer le culte de Rome et de l'empereur", effets:{ romanisation:10, stabilite:-12, faveur:8 },
          consequence:"Des autels à l'empereur s'élèvent partout. Rome est ravie ; les fidèles des dieux gaulois, beaucoup moins.",
          pourquoi:"Le culte impérial soude l'Empire autour de l'empereur, mais imposé de force il heurte les croyances locales." },
        { label:"Encourager le mélange des dieux romains et gaulois", effets:{ romanisation:7, stabilite:2 },
          consequence:"On associe Mercure à un dieu gaulois, on partage les temples. Les Gaulois adoptent Rome sans renier les leurs.",
          pourquoi:"Rome a souvent fondu ses dieux avec ceux des peuples conquis (l'interpretatio romana) : une romanisation respectueuse et durable." },
        { label:"Laisser librement les cultes locaux", effets:{ stabilite:6, faveur:-4 },
          consequence:"Chacun prie ses dieux. La paix religieuse règne, mais Rome n'a guère avancé.",
          pourquoi:"La liberté religieuse préserve la paix, mais ne fait pas progresser la romanisation." }
      ]
    },
    {
      type:"evenement", id:"ecole", acte:"Acte II — Développer la province", an:"III",
      perso:"conseiller", expr:"neutre", ambiance:"jour",
      nom:"Marcus, ton conseiller",
      titre:"L'éducation des fils de notables",
      contexte:"Et si nous formions à la romaine les fils de l'aristocratie gauloise, légat ?",
      revenuApres:true,
      options:[
        { label:"Ouvrir une école latine pour les élites", effets:{ romanisation:12, stabilite:-2, faveur:3 }, cout:15,
          consequence:"Les fils des chefs gaulois apprennent le latin, la rhétorique et l'histoire de Rome. Demain, ils gouverneront en Romains.",
          pourquoi:"Éduquer les élites locales à la romaine, c'est romaniser la génération qui dirigera : un investissement profond et durable." },
        { label:"Des précepteurs ouverts à tous les notables", effets:{ romanisation:8, stabilite:2 }, cout:10,
          consequence:"Plus de familles accèdent à la culture latine. La diffusion est plus large, plus lente, plus paisible.",
          pourquoi:"Élargir l'accès à la culture latine romanise en profondeur et sans heurt, mais demande du temps." },
        { label:"Ne rien financer pour l'instant", effets:{ stabilite:1 },
          consequence:"Tu réserves le trésor à d'autres priorités.",
          pourquoi:"L'éducation est un levier puissant de romanisation ; y renoncer, c'est laisser passer une occasion." }
      ]
    },
    /* ---------- ACTE III — LES ÉPREUVES (crises) ---------- */
    {
      type:"evenement", id:"revolte", acte:"Acte III — Les épreuves", an:"IV",
      perso:"gaulois", expr:"severe", ambiance:"danger",
      nom:"Diviciacos, chef éduen",
      titre:"La révolte des Éduens",
      contexte:"Romain ! Tes impôts nous étranglent et ton autorité nous humilie. Les Éduens ont pris les armes !",
      contexteGrave:"Romain ! Tes lois, tes dieux, tes impôts : tu veux nous effacer. La révolte gagne toute la Gaule — et c'est ta faute !",
      seuilGrave:42, revenuApres:true,
      options:[
        { label:"Réprimer par les légions", flag:"repression", effets:{ stabilite:15, romanisation:-8, faveur:6 },
          consequence:"Les légions écrasent la révolte. L'ordre revient vite — mais la province se tait par crainte, non par adhésion.",
          pourquoi:"La force rétablit l'ordre, mais la soumission n'est pas l'adhésion : la rancœur couve et la romanisation recule." },
        { label:"Négocier et accorder la citoyenneté aux élites éduennes", effets:{ stabilite:10, romanisation:10, faveur:-5, tresor:-20 },
          effetsSi:{ flag:"curie", effets:{ stabilite:12, romanisation:14, faveur:-2, tresor:-20 }, note:"Grâce à ta curie, l'intégration des notables se fait sans heurt." },
          consequence:"Les chefs éduens, devenus citoyens romains, déposent les armes : ils ont désormais tout à gagner de Rome.",
          pourquoi:"Rome a bâti son empire en intégrant les élites locales : la citoyenneté en fit des alliés (jusqu'à des sénateurs gaulois). Les conservateurs romains s'en méfient." },
        { label:"Baisser les impôts pour apaiser", effets:{ stabilite:8, romanisation:2, tresor:-30 },
          consequence:"Le soulagement fiscal calme la colère. La révolte s'éteint, mais tes caisses en souffrent.",
          pourquoi:"Apaiser par l'argent évite l'affrontement, mais vide le trésor et ne romanise guère." }
      ]
    },
    {
      type:"evenement", id:"frontiere", acte:"Acte III — Les épreuves", an:"V",
      perso:"centurion", expr:"severe", ambiance:"danger",
      nom:"Aulus, centurion",
      titre:"Les frontières menacées",
      contexte:"Légat ! Des bandes germaniques ont franchi le Rhin et pillent nos confins. Tes ordres ?",
      revenuApres:true,
      options:[
        { label:"Lever des auxiliaires gaulois pour défendre la frontière", effets:{ romanisation:8, stabilite:4, faveur:4, tresor:-20 },
          consequence:"Des Gaulois prennent les armes sous l'aigle romaine. En servant Rome, ils s'y attachent — et la citoyenneté récompensera leur fidélité.",
          pourquoi:"Enrôler les Gaulois dans l'armée les intègre à Rome : le service militaire, récompensé par la citoyenneté, fut un puissant moteur de romanisation." },
        { label:"Faire venir des légions d'Italie", effets:{ stabilite:10, faveur:-4, tresor:-30 },
          consequence:"Les légions repoussent l'envahisseur — au prix fort, et sans rien changer aux cœurs gaulois.",
          pourquoi:"Les légions sécurisent vite, mais coûtent cher et n'intègrent pas la population." },
        { label:"Négocier et verser un tribut aux chefs germains", effets:{ tresor:-30, stabilite:4, faveur:-6 },
          consequence:"L'or achète la paix sur le Rhin. La frontière se calme, mais Rome juge le procédé indigne.",
          pourquoi:"Acheter la paix évite la guerre, mais affaiblit le prestige de Rome." }
      ]
    },
    /* ---------- ACTE IV — L'HÉRITAGE ---------- */
    {
      type:"evenement", id:"colonie", acte:"Acte IV — L'héritage", an:"VI",
      perso:"conseiller", expr:"neutre", ambiance:"jour",
      nom:"Marcus, ton conseiller",
      titre:"Asseoir l'héritage de Rome",
      contexte:"Ton mandat s'achève bientôt, légat. Comment marquer durablement la province de l'empreinte de Rome ?",
      revenuApres:true,
      options:[
        { label:"Fonder une colonie de vétérans romains", effets:{ romanisation:12, stabilite:-5, faveur:6, tresor:-25 },
          consequence:"Des légionnaires retraités s'installent et bâtissent une ville romaine. Un îlot de Rome en pleine Gaule — qui bouscule les habitants.",
          pourquoi:"Les colonies de vétérans diffusaient le modèle urbain romain ; implantées de force, elles pouvaient froisser les populations locales." },
        { label:"Élever une cité gauloise au rang de municipe (droit latin)", effets:{ romanisation:14, stabilite:5, faveur:-2, tresor:-20 },
          consequence:"Une grande cité gauloise obtient le droit latin : ses magistrats deviennent citoyens romains. La Gaule se romanise d'elle-même.",
          pourquoi:"Donner le statut municipal aux cités gauloises les romanisait en profondeur, par l'intérieur, en faisant de leurs élites des citoyens." },
        { label:"Rien de spectaculaire, consolider l'existant", effets:{ stabilite:4, romanisation:2 },
          consequence:"Tu préfères affermir ce qui existe plutôt que d'entreprendre. Sage, mais peu marquant.",
          pourquoi:"Consolider est prudent, mais l'héritage durable se bâtit par des actes structurants." }
      ]
    },
    {
      type:"evenement", id:"visite", acte:"Acte IV — L'héritage", an:"VI",
      perso:"empereur", expr:"neutre", ambiance:"solennel", document:"cirque",
      nom:"L'empereur en personne",
      titre:"La visite de l'empereur",
      contexte:"Legatus, je viens juger de ton œuvre en Gaule. Montre-moi ce que vaut ton gouvernement.",
      contexteSi:{ flag:"repression", ajout:" Des inscriptions hostiles à Rome maculent encore les murs depuis ta répression.", malus:{ stabilite:-8 } },
      options:[
        { label:"Offrir des jeux fastueux au cirque", cout:40, effets:{ faveur:12, stabilite:6 },
          consequence:"Courses de chars et largesses : la foule acclame Rome, et l'empereur repart conquis — mais le trésor est entamé.",
          pourquoi:"« Du pain et des jeux » : la générosité publique séduit le peuple et impressionne l'empereur, à grands frais." },
        { label:"Présenter sobrement les comptes et les progrès", effets:{ faveur:5, romanisation:3 },
          consequence:"Tu exposes routes, recettes et avancées. L'empereur apprécie un gouvernement sérieux, sans dépense ostentatoire.",
          pourquoi:"Un gouvernement rigoureux rassure Rome sur le long terme, sans dilapider les deniers de la province." }
      ]
    }
  ],

  revenu:{ haut:30, bas:16, seuil:42, texte:"Récolte des impôts" },

  echecs:{
    stabilite:{ perso:"gaulois", expr:"severe", ambiance:"danger", titre:"La province s'embrase",
      texte:"La stabilité s'est effondrée : la Gaule entière se soulève. Incapable de tenir la province, tu es rappelé à Rome en disgrâce. La conquête sans intégration mène à la révolte." },
    faveur:{ perso:"empereur", expr:"severe", ambiance:"solennel", titre:"Destitué par l'empereur",
      texte:"L'empereur a perdu confiance en toi : tu es relevé de tes fonctions. Gouverner une province, c'est aussi savoir conserver l'appui de Rome." }
  },

  /* Bilans (premier seuil atteint, dans l'ordre).
     Apogée = romanisation très haute ET province tenue : la vraie maîtrise. */
  bilans:[
    { si:{ romanisation:85, stabilite:55, faveur:45 }, perso:"empereur", expr:"content", ambiance:"solennel",
      titre:"Apogée : une Gaule pleinement romaine",
      texte:"Tu as réussi l'exploit rare : romaniser la province presque entièrement tout en la gardant stable et fidèle à Rome. Langue, droit, cités, citoyens — la Gaule est devenue romaine sans cesser d'être tenue. Ton nom restera celui d'un grand gouverneur." },
    { si:{ romanisation:60, stabilite:48 }, perso:"empereur", expr:"content", ambiance:"solennel",
      titre:"Province romaine et paisible",
      texte:"La Gaule parle latin, vit à la romaine et reste fidèle à Rome. Ton mandat laisse un héritage durable : routes, droit, citoyens. La romanisation a réussi — non par la seule conquête, mais par l'intégration." },
    { si:{ romanisation:38 }, perso:"conseiller", expr:"neutre", ambiance:"jour",
      titre:"Romanisation engagée mais fragile",
      texte:"Rome a pris pied, mais l'enracinement reste superficiel — ou bien tu as romanisé si fort que la province a vacillé. Sans davantage d'équilibre, ton œuvre pourrait ne pas survivre à ton successeur." },
    { si:{}, perso:"gaulois", expr:"neutre", ambiance:"jour",
      titre:"Province à peine romanisée",
      texte:"La Gaule demeure gauloise. La conquête militaire n'a pas suffi : sans langue, droit et infrastructures partagés, il n'y a pas de véritable romanisation." }
  ]
};
