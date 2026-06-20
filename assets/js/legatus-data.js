/* =========================================================================
   LEGATUS, Gouverner au nom de Rome
   Vingt décisions en cinq actes, traversant l'arc de l'Empire d'Occident :
   de l'implantation de Rome (romanisation) jusqu'au tournant chrétien
   (christianisation, Édit de Milan). Sauts de temps assumés entre les actes.
   Effets sur les jauges = logiques historiques ; À VALIDER ET AJUSTER PAR
   L'ENSEIGNANT. Principe : l'option qui fait le plus avancer une jauge coûte
   presque toujours ailleurs. On ne maximise pas tout : la maîtrise, c'est
   l'équilibre, et tenir l'Empire dans la durée.
   ========================================================================= */
window.LEGATUS = {
  titre:"Legatus", sousTitre:"Gouverner une province romaine",
  etatInitial:{ romanisation:10, stabilite:58, faveur:60, tresor:100 },

  jauges:[
    { id:"romanisation", nom:"Romanisation", icone:"temple", type:"pct", couleur:"pourpre" },
    { id:"stabilite",    nom:"Stabilité",     icone:"bouclier",type:"pct", couleur:"seuil" },
    { id:"faveur",       nom:"Faveur de Rome", icone:"laurier",type:"pct", couleur:"seuil" },
    { id:"tresor",       nom:"Trésor",         icone:"piece",  type:"res", couleur:"bronze" }
  ],

  accueil:{
    titre:"Legatus", sousTitre:"Gouverner une province romaine",
    accroche:"Tu gouvernes une province romaine pendant près de quatre siècles. Sauras-tu l'enraciner dans Rome sans embraser la province ?",
    commentTitre:"Comment ça marche",
    jaugesAide:[
      { icone:"temple",   nom:"Romanisation",   txt:"ta mission : enraciner Rome" },
      { icone:"bouclier", nom:"Stabilité",      txt:"la paix sociale de la province" },
      { icone:"laurier",  nom:"Faveur de Rome", txt:"la confiance de l'empereur" },
      { icone:"piece",    nom:"Trésor",         txt:"chantiers, armées, revenu net/tour" }
    ],
    etapesAide:[
      "Avant chaque décision, lis les DEUX documents affichés à droite : un point de vue, puis un avis divergent.",
      "Chaque choix a un coût immédiat ET un impact durable sur les finances : entretien des infrastructures, essor du commerce, entretien de l'armée.",
      "20 décisions en 5 actes, de la conquête jusqu'à la christianisation. Trois fins possibles selon ton héritage."
    ],
    pedagoTitre:"Contexte pédagogique",
    pedago:[
      "Histoire et éducation à la citoyenneté, 1re secondaire.",
      "Réalités sociales : la romanisation et la christianisation de l'Occident."
    ],
    diffTitre:"Choisis ton niveau pour commencer"
  },

  intro:{
    perso:"conseiller", expr:"neutre", ambiance:"jour", document:"empire",
    nom:"Marcus, ton conseiller", acte:"Acte I : Implanter Rome",
    titre:"Te voilà au service de Rome",
    texte:"Pendant des générations, tu incarneras le pouvoir de Rome dans cette province de Gaule. D'abord l'enraciner (langue, droit, villes) puis tenir l'Empire à travers les épreuves, jusqu'à la grande transformation qui vient. Avance acte par acte.",
    bouton:"Prendre mes fonctions"
  },

  etapes:[
    /* ============ ACTE I, IMPLANTER ROME ============ */
    {
      type:"evenement", id:"langue", acte:"Acte I : Implanter Rome",
      perso:"conseiller", expr:"neutre", ambiance:"jour", nom:"Marcus, ton conseiller",
      titre:"La langue de l'administration",
      source:{ texte:"L’historien Tacite raconte comment le gouverneur Agricola, en Bretagne, poussa les notables à apprendre le latin et à adopter le mode de vie romain (toge, banquets). Ce que les vaincus prenaient pour un progrès, note-t-il, n’était qu’un aspect de leur soumission.", ref:"D’après Tacite, Vie d’Agricola, ch. 21 (Ier s.), adaptation" },
      source2:{ texte:"Pourtant, les langues locales résistèrent longtemps. Au IIe siècle, l’évêque Irénée, à Lyon, dit devoir souvent employer la langue celtique pour se faire comprendre du peuple.", ref:"D’après Irénée de Lyon, Contre les hérésies (IIe s.), adaptation" },
      contexte:"Les cités gauloises nous écrivent dans dix langues, légat. Par quoi commencer ?",
      revenuApres:true,
      options:[
        { label:"Imposer le latin partout, sans délai", effets:{ romanisation:12, stabilite:-12, faveur:6 },
          consequence:"Tout passe au latin. Les notables romanisés applaudissent ; le peuple se braque.",
          pourquoi:"Le latin est le premier vecteur de la romanisation. Imposé trop vite, il heurte les identités locales." },
        { label:"Latin pour l'administration, tolérer les langues locales", effets:{ romanisation:6, stabilite:1, faveur:2 },
          consequence:"Le latin devient la langue du pouvoir ; les parlers gaulois demeurent au village.",
          pourquoi:"La voie habituelle de Rome : une romanisation progressive, qui dure parce qu'elle ne s'impose pas par la seule force." },
        { label:"Respecter les langues gauloises, ne rien brusquer", effets:{ romanisation:1, stabilite:6, faveur:-11 },
          consequence:"Tu gouvernes dans les langues du pays. La paix règne, mais la province reste gauloise.",
          pourquoi:"La paix est préservée, mais Rome attend de son légat des résultats." }
      ]
    },
    {
      type:"evenement", id:"droit", acte:"Acte I : Implanter Rome",
      perso:"conseiller", expr:"neutre", ambiance:"jour", nom:"Marcus, ton conseiller",
      titre:"Le droit romain",
      source:{ texte:"Pour Cicéron, la véritable loi est une règle de raison, la même pour tous, qui fonde la communauté des citoyens. Étendre le droit romain, c’est faire entrer les peuples dans un ordre juridique commun.", ref:"D’après Cicéron, Des lois (Ier s. av. J.-C.), adaptation" },
      source2:{ texte:"En pratique, Rome laissait souvent les cités garder leurs propres lois et coutumes. Le droit romain pur ne s’appliquait d’abord qu’aux citoyens romains : un droit à plusieurs vitesses.", ref:"D’après les juristes romains (le Digeste), adaptation" },
      contexte:"Faut-il imposer le droit de Rome dans les tribunaux, légat ?",
      revenuApres:true,
      options:[
        { label:"Imposer le droit romain partout", effets:{ romanisation:12, stabilite:-10, faveur:4 },
          consequence:"Le droit romain règle tout litige. Un puissant ciment, mais les coutumes bafouées font grincer des dents.",
          pourquoi:"Le droit est l'un des grands vecteurs de romanisation ; imposé d'un coup, il déracine et provoque des résistances." },
        { label:"Droit romain, mais coutumes locales reconnues", effets:{ romanisation:7, stabilite:1 },
          consequence:"Les tribunaux appliquent le droit romain en respectant certains usages gaulois.",
          pourquoi:"Reconnaître les coutumes tout en avançant le droit romain : une intégration juridique durable." },
        { label:"Laisser les coutumes gauloises", effets:{ romanisation:1, stabilite:5, faveur:-10 },
          consequence:"La justice reste coutumière. Personne n'est froissé, mais Rome n'a guère avancé.",
          pourquoi:"La paix est préservée, mais le droit (donc la romanisation) n'a pas progressé." }
      ]
    },
    {
      type:"construction", revenuApres:true, id:"voie", acte:"Acte I : Implanter Rome",
      perso:"conseiller", expr:"neutre", ambiance:"jour", nom:"Marcus, ton conseiller",
      titre:"La voie romaine",
      source:{ texte:"Le géographe Strabon décrit le grand réseau de routes tracé à travers la Gaule à partir de Lyon, reliant l’Océan, le Rhin et la Méditerranée. Ces voies servaient d’abord les armées et l’administration, puis le commerce.", ref:"D’après Strabon, Géographie, livre IV (Ier s.), adaptation" },
      source2:{ texte:"Mais la voie a un coût pour les habitants : entretien par corvée, obligation de loger et de transporter soldats et courriers impériaux. Des édits durent limiter ces réquisitions abusives.", ref:"D’après les édits sur les réquisitions (Ier-IIe s.), adaptation" },
      contexte:"Bâtissons une voie romaine, légat. Mais pour qui d'abord : les légions, ou le commerce ?",
      options:[
        { label:"Un grand axe pour le commerce et les cités", cout:60, effets:{ romanisation:9 }, persistant:{ tresor:6 }, flag:"voie",
          consequence:"Marchands et marchandises affluent. Avec eux voyagent la monnaie, la langue et les usages de Rome, et tes recettes montent.",
          pourquoi:"Les voies diffusent Rome et stimulent durablement le commerce : une route civile romanise en profondeur." },
        { label:"Des voies stratégiques pour les légions", cout:50, effets:{ stabilite:5, faveur:3, romanisation:3 }, persistant:{ tresor:3 },
          consequence:"Tes troupes se déplacent vite d'un bout à l'autre de la province. L'ordre est mieux tenu.",
          pourquoi:"À l'origine, les voies romaines servaient surtout l'armée et l'administration : elles tenaient l'Empire." },
        { label:"Réparer les pistes existantes, sans grands travaux", cout:15, effets:{ romanisation:2, stabilite:1 }, persistant:{ tresor:1 },
          consequence:"Tu relies l'essentiel à moindre coût. Modeste, mais le trésor est ménagé.",
          pourquoi:"Un réseau partiel romanise peu, mais évite d'épuiser les ressources." }
      ]
    },
    /* ============ ACTE II, BÂTIR LA CITÉ ROMAINE ============ */
    {
      type:"construction", revenuApres:true, id:"thermes", acte:"Acte II : Bâtir la cité romaine",
      acteIntro:"Les premières années ont enraciné Rome. Les cités veulent désormais des monuments dignes de l'Empire, et c'est là que se forge, jour après jour, l'art de vivre romain.",
      perso:"conseiller", expr:"neutre", ambiance:"jour", nom:"Marcus, ton conseiller",
      titre:"Les thermes",
      source:{ texte:"Sénèque, logé au-dessus de thermes, décrit le vacarme des baigneurs, des marchands et des joueurs : preuve que les bains étaient un lieu de vie sociale intense, bien plus qu’un simple lieu d’hygiène.", ref:"D’après Sénèque, Lettres à Lucilius, 56 (Ier s.), adaptation" },
      source2:{ texte:"Pour les moralistes, au contraire, les thermes étaient des lieux d’oisiveté et de dépenses, où le luxe amollissait les vieilles mœurs romaines.", ref:"D’après les moralistes romains (Sénèque, Pline), adaptation" },
      contexte:"Bâtir des thermes, légat ? On y fait bien plus que se laver.",
      options:[
        { label:"De grands thermes publics, ouverts à tous", cout:70, effets:{ romanisation:11, stabilite:3, faveur:2 }, persistant:{ tresor:-3 },
          consequence:"On vient s'y baigner, discuter, faire affaire et se montrer. Le mode de vie romain entre dans les habitudes.",
          pourquoi:"Les thermes étaient le cœur de la vie sociale romaine : on y adoptait la langue, les manières et les codes de Rome." },
        { label:"Des thermes modestes pour la cité", cout:35, effets:{ romanisation:5, stabilite:2 }, persistant:{ tresor:-1 },
          consequence:"Des bains plus simples, mais déjà un lieu de sociabilité romaine.",
          pourquoi:"Même modestes, les thermes diffusent les usages romains." },
        { label:"Pas de thermes pour l'instant", effets:{ stabilite:-3 },
          consequence:"Tu réserves le trésor à d'autres priorités.",
          pourquoi:"Sans lieux de la vie romaine, les habitudes locales perdurent." }
      ]
    },
    {
      type:"construction", revenuApres:true, id:"aqueduc", acte:"Acte II : Bâtir la cité romaine",
      perso:"conseiller", expr:"neutre", ambiance:"jour", nom:"Marcus, ton conseiller",
      titre:"L'aqueduc",
      source:{ texte:"Frontin, responsable des eaux de Rome, vante l’utilité des aqueducs pour la salubrité de la ville. À côté de tant d’ouvrages utiles, lance-t-il, les pyramides d’Égypte « ne servent à rien ».", ref:"D’après Frontin, Les Aqueducs de Rome (vers 98), adaptation" },
      source2:{ texte:"Mais ces chantiers pouvaient ruiner les cités. Pline le Jeune écrit à Trajan que Nicomédie a englouti des sommes énormes dans un aqueduc jamais terminé.", ref:"D’après Pline le Jeune, Lettres, X, 37 (vers 111), adaptation" },
      contexte:"La cité manque d'eau saine, légat. Un aqueduc changerait tout, mais c'est un chantier colossal.",
      options:[
        { label:"Un grand aqueduc de pierre", cout:80, effets:{ romanisation:8, stabilite:5, faveur:2 }, persistant:{ tresor:-3 },
          consequence:"L'eau courante arrive : fontaines, thermes, latrines. Santé, confort, et l'image éclatante du génie de Rome.",
          pourquoi:"L'aqueduc apportait l'eau saine (santé publique) et affichait la puissance technique de Rome : prestige et bien-être." },
        { label:"Des puits et des citernes", cout:30, effets:{ stabilite:3 }, persistant:{ tresor:-1 },
          consequence:"Une solution modeste qui soulage la cité, sans la splendeur d'un aqueduc.",
          pourquoi:"Faute d'aqueduc, on se contente de l'eau de pluie et des nappes : moins de prestige, moins de salubrité." },
        { label:"Rien pour l'instant", effets:{ stabilite:-3 },
          consequence:"La cité continue de puiser l'eau comme avant.",
          pourquoi:"Sans grands travaux hydrauliques, la vie urbaine reste limitée." }
      ]
    },
    {
      type:"construction", revenuApres:true, id:"forum", acte:"Acte II : Bâtir la cité romaine", document:"curie",
      perso:"conseiller", expr:"neutre", ambiance:"jour", nom:"Marcus, ton conseiller",
      titre:"Le forum et la curie",
      source:{ texte:"Dans un discours gravé sur bronze à Lyon, l’empereur Claude défend l’admission de notables gaulois au Sénat, rappelant que Rome s’est toujours renforcée en intégrant les peuples vaincus.", ref:"D’après la Table claudienne de Lyon (48), adaptation" },
      source2:{ texte:"Au Sénat, beaucoup s’opposèrent à l’entrée des Gaulois : ces anciens ennemis, disaient-ils, allaient envahir Rome et évincer ses vieilles familles.", ref:"D’après Tacite, Annales, XI, 23, adaptation" },
      contexte:"Donnons à la cité un vrai centre, légat : un forum, et une curie pour le conseil des notables.",
      options:[
        { label:"Un forum monumental avec curie", cout:75, effets:{ romanisation:7, stabilite:2, faveur:2 }, persistant:{ tresor:4 }, flag:"curie",
          consequence:"Place publique, temples, basilique et siège du conseil : le cœur civique de la cité bat à la romaine, et des notables gaulois y siègent.",
          pourquoi:"Le forum était le centre politique et social ; la curie y associait les élites locales au pouvoir, clé d'une romanisation durable (et précieuse face à la révolte)." },
        { label:"Une simple place de marché", cout:30, effets:{ romanisation:3, stabilite:1 }, persistant:{ tresor:3 },
          consequence:"Un lieu d'échange, sans la dimension politique d'un vrai forum.",
          pourquoi:"Sans curie, les notables gaulois restent à l'écart du pouvoir romain." },
        { label:"Rien de monumental", effets:{ faveur:-3 },
          consequence:"La cité s'organise sans centre romain affirmé.",
          pourquoi:"Sans forum, l'identité civique romaine s'enracine mal." }
      ]
    },
    {
      type:"construction", revenuApres:true, id:"jeux", acte:"Acte II : Bâtir la cité romaine", document:"cirque",
      perso:"marchand", expr:"neutre", ambiance:"jour", nom:"Quintus, organisateur de jeux",
      titre:"L'amphithéâtre et les jeux",
      source:{ texte:"Le poète Juvénal raille un peuple romain qui, ayant renoncé à la politique, ne réclame plus que deux choses : « du pain et des jeux ». Distraire la foule était devenu un instrument de pouvoir.", ref:"D’après Juvénal, Satires, X (début IIe s.), adaptation" },
      source2:{ texte:"Sénèque, lui, sort écœuré de l’arène : ce ne sont plus des combats mais des meurtres, et la foule réclame du sang. Distraire le peuple, oui, mais à quel prix moral ?", ref:"D’après Sénèque, Lettres à Lucilius, 7, adaptation" },
      contexte:"Offrons des jeux au peuple, légat ! Courses, combats, spectacles : rien ne tient mieux une foule.",
      options:[
        { label:"De grands jeux réguliers dans un amphithéâtre", cout:65, effets:{ stabilite:6, faveur:5, romanisation:3 }, persistant:{ tresor:-4 },
          consequence:"Le peuple se presse aux gradins et acclame Rome. On oublie les soucis, on se sent romain le temps d'un spectacle.",
          pourquoi:"« Du pain et des jeux » : les jeux fédéraient la population, la divertissaient de ses misères et affichaient la générosité du pouvoir, un puissant outil de contrôle social et de romanisation des loisirs." },
        { label:"Des jeux modestes et occasionnels", cout:30, effets:{ stabilite:4, romanisation:1 }, persistant:{ tresor:-1 },
          consequence:"Quelques fêtes contentent la cité sans ruiner le trésor.",
          pourquoi:"Même modestes, les jeux entretiennent le lien entre le peuple et le pouvoir romain." },
        { label:"Pas de jeux, économiser", effets:{ stabilite:-5, faveur:-2 },
          consequence:"Tu gardes l'argent, mais le peuple te trouve avare et lointain.",
          pourquoi:"Priver le peuple de jeux, c'était risquer son mécontentement : les jeux étaient une attente politique." }
      ]
    },
    /* ============ ACTE III, VIVRE EN ROMAIN ============ */
    {
      type:"evenement", id:"commerce", acte:"Acte III : Vivre en Romain",
      acteIntro:"Une génération a passé. Les villes prospèrent, hérissées de monuments. Reste à gagner les cœurs et les esprits : la culture, la foi, le droit de cité.",
      controleRome:{ seuil:32, rappel:16, malus:12, faveurRappel:22 },
      acteMalus:{ stabilite:-10 }, acteMalusNote:"Le temps passe : tenir les acquis devient plus dur (stabilité −10).",
      perso:"marchand", expr:"neutre", ambiance:"jour", nom:"Quintus, un marchand",
      titre:"Les marchands de la voie",
      source:{ texte:"L’orateur grec Aelius Aristide s’émerveille que les marchandises du monde entier affluent à Rome par mer et par route : le commerce tisse l’unité de l’Empire et diffuse partout ses usages.", ref:"D’après Aelius Aristide, Éloge de Rome (vers 143), adaptation" },
      source2:{ texte:"Pour le chef breton Calgacus, les Romains sont des pillards : ils dépouillent le monde et, là où ils font un désert, disent avoir apporté la paix. L’impôt enrichit surtout Rome.", ref:"D’après le discours de Calgacus dans Tacite, Agricola, 30, adaptation" },
      contexte:"Légat ! Quelle politique pour le commerce le long de tes routes ?",
      revenuApres:true,
      options:[
        { label:"Taxer lourdement les échanges", effets:{ tresor:30, stabilite:-6, romanisation:1 }, persistant:{ tresor:-2 },
          consequence:"Tes caisses se remplissent vite, mais les marchands rechignent et les cités murmurent.",
          pourquoi:"Le commerce remplit le trésor ; trop taxé, il s'étiole et irrite la province." },
        { label:"Favoriser le commerce, péages légers", effets:{ romanisation:7, stabilite:1, tresor:8 }, persistant:{ tresor:6 },
          consequence:"Les marchés se multiplient. Avec les marchandises voyagent la monnaie et les usages de Rome.",
          pourquoi:"Le commerce diffuse la culture de Rome : il romanise en douceur." },
        { label:"Réserver le grand commerce aux citoyens romains", effets:{ romanisation:4, faveur:5, stabilite:-5 }, persistant:{ tresor:2 },
          consequence:"Les citoyens prospèrent et Rome apprécie. Les marchands gaulois se sentent lésés.",
          pourquoi:"Favoriser les citoyens renforce le prestige de Rome, mais frustre une partie de la population." }
      ]
    },
    {
      type:"evenement", id:"culte", acte:"Acte III : Vivre en Romain",
      perso:"conseiller", expr:"neutre", ambiance:"jour", nom:"Marcus, ton conseiller",
      titre:"Le culte impérial",
      source:{ texte:"Chaque année, les délégués des cités gauloises se réunissaient à l’autel de Rome et d’Auguste, à Lyon, pour honorer l’empereur. Ce culte commun soudait la province à l’Empire.", ref:"D’après la dédicace de l’autel de Lugdunum (Lyon, 12 av. J.-C.), adaptation" },
      source2:{ texte:"Mais Juifs et chrétiens refusaient de sacrifier à l’empereur, y voyant une idolâtrie. Pour eux, ce culte commun n’unissait pas : il opprimait les consciences.", ref:"D’après Flavius Josèphe et les Actes des martyrs, adaptation" },
      contexte:"Rome veut qu'on honore l'empereur comme un dieu, légat. L'imposer aux Gaulois ?",
      revenuApres:true,
      options:[
        { label:"Imposer le culte de Rome et de l'empereur", effets:{ romanisation:10, stabilite:-12, faveur:8 },
          consequence:"Des autels à l'empereur s'élèvent partout. Rome est ravie ; les fidèles des dieux gaulois, beaucoup moins.",
          pourquoi:"Le culte impérial soudait l'Empire autour de l'empereur, mais imposé de force il heurtait les croyances locales." },
        { label:"Encourager le mélange des dieux romains et gaulois", effets:{ romanisation:7, stabilite:2 },
          consequence:"On associe Mercure à un dieu gaulois, on partage les temples. Les Gaulois adoptent Rome sans renier les leurs.",
          pourquoi:"Rome fondait souvent ses dieux avec ceux des peuples conquis (l'interpretatio romana) : une romanisation respectueuse." },
        { label:"Laisser librement les cultes locaux", effets:{ stabilite:6, faveur:-11 },
          consequence:"Chacun prie ses dieux. La paix religieuse règne, mais Rome n'avance pas.",
          pourquoi:"La liberté religieuse préserve la paix, mais ne fait pas progresser la romanisation." }
      ]
    },
    {
      type:"evenement", id:"ecole", acte:"Acte III : Vivre en Romain",
      perso:"conseiller", expr:"neutre", ambiance:"jour", nom:"Marcus, ton conseiller",
      titre:"L'éducation des fils de notables",
      source:{ texte:"Le rhéteur gaulois Eumène plaide pour rebâtir les écoles d’Autun, où les fils des notables gaulois apprenaient le latin et la culture romaine, formant les futurs cadres de l’Empire.", ref:"D’après Eumène, Pour la restauration des écoles d’Autun (vers 298), adaptation" },
      source2:{ texte:"Cette école ne touchait que les fils de notables. Le petit peuple des campagnes en restait exclu, ce qui creusait l’écart entre une élite romanisée et une Gaule restée celtique.", ref:"D’après les historiens de l’éducation romaine" },
      contexte:"Et si nous formions à la romaine les fils de l'aristocratie gauloise, légat ?",
      revenuApres:true,
      options:[
        { label:"Ouvrir une école latine pour les élites", effets:{ romanisation:12, stabilite:-2, faveur:3 }, cout:25,
          consequence:"Les fils des chefs apprennent le latin, la rhétorique, l'histoire de Rome. Demain, ils gouverneront en Romains.",
          pourquoi:"Éduquer les élites à la romaine, c'est romaniser la génération dirigeante : un investissement profond et durable." },
        { label:"Des précepteurs ouverts à tous les notables", effets:{ romanisation:8, stabilite:2 }, cout:18,
          consequence:"Plus de familles accèdent à la culture latine. Diffusion plus large, plus lente, plus paisible.",
          pourquoi:"Élargir l'accès à la culture latine romanise en profondeur et sans heurt, mais demande du temps." },
        { label:"Ne rien financer pour l'instant", effets:{ faveur:-3, romanisation:-1 },
          consequence:"Tu réserves le trésor à d'autres priorités.",
          pourquoi:"L'éducation est un levier puissant de romanisation ; y renoncer, c'est manquer une occasion." }
      ]
    },
    {
      type:"evenement", id:"citoyennete", acte:"Acte III : Vivre en Romain",
      perso:"empereur", expr:"neutre", ambiance:"solennel", nom:"Édit de l'empereur",
      titre:"La citoyenneté pour tous ?",
      source:{ texte:"En 212, l’empereur Caracalla accorde la citoyenneté romaine à presque tous les habitants libres de l’Empire, aboutissement de siècles d’intégration. L’historien Dion Cassius y voit aussi un moyen d’élargir l’impôt.", ref:"D’après la Constitution antoninienne (212) et Dion Cassius, adaptation" },
      source2:{ texte:"Une fois tous citoyens, une autre inégalité apparut : les honestiores (les riches) et les humiliores (les pauvres) ne furent plus jugés ni punis de la même façon.", ref:"D’après les juristes du IIIe siècle, adaptation" },
      contexte:"Legatus, je songe à faire de tous les hommes libres de l'Empire des citoyens romains. M'appuieras-tu ?",
      revenuApres:true,
      options:[
        { label:"Soutenir la citoyenneté pour tous les hommes libres", effets:{ romanisation:14, stabilite:6, faveur:-3, tresor:10 }, persistant:{ tresor:2 },
          consequence:"Des millions de provinciaux deviennent citoyens romains. La Gaule se sent pleinement de l'Empire, et paie l'impôt des citoyens.",
          pourquoi:"L'édit de Caracalla (212) fit de presque tous les habitants libres des citoyens romains : l'aboutissement de l'intégration (et une nouvelle assiette fiscale)." },
        { label:"L'élargir aux seules élites méritantes", effets:{ romanisation:7, stabilite:2, faveur:2 }, persistant:{ tresor:1 },
          consequence:"Les notables fidèles deviennent citoyens. L'intégration avance, prudente.",
          pourquoi:"Récompenser les élites par la citoyenneté liait leur sort à celui de Rome." },
        { label:"S'opposer : garder la citoyenneté rare", effets:{ faveur:-8, stabilite:-4, romanisation:-2 },
          consequence:"La citoyenneté reste un privilège jalousement gardé. Beaucoup de provinciaux s'en sentent exclus.",
          pourquoi:"Restreindre la citoyenneté entretenait le prestige romain, mais freinait l'intégration des peuples." }
      ]
    },
    /* ============ ACTE IV, TENIR L'EMPIRE ============ */
    {
      type:"evenement", id:"revolte", acte:"Acte IV : Tenir l'Empire",
      acteIntro:"Les décennies filent. L'Empire est à son apogée, mais sa grandeur même devient un fardeau. Des fissures apparaissent, au-dedans comme aux frontières.",
      controleRome:{ seuil:50, rappel:32, malus:15, faveurRappel:30 },
      acteMalus:{ stabilite:-18 }, acteMalusNote:"La pression des crises ébranle la province (stabilité −18).",
      perso:"gaulois", expr:"severe", ambiance:"danger", nom:"Diviciacos, chef éduen",
      titre:"La révolte des Éduens",
      source:{ texte:"En l’an 21, deux notables gaulois pourtant romanisés et citoyens romains, l’Éduen Julius Sacrovir et le Trévire Julius Florus, soulèvent leurs cités écrasées de dettes et d’impôts. Les légions de Germanie matent la révolte.", ref:"D’après Tacite, Annales, livre III (révolte de 21), adaptation" },
      source2:{ texte:"Pour Velleius Paterculus, favorable à Rome, la révolte fut vite écrasée et sans gravité : la fermeté des légions suffit. Injustice fiscale ou simple agitation matée ? Les sources divergent.", ref:"D’après Velleius Paterculus, Histoire romaine, II, adaptation" },
      contexte:"Romain ! Tes impôts nous étranglent et ton autorité nous humilie. Les Éduens ont pris les armes !",
      contexteGrave:"Romain ! Tes lois, tes dieux, tes impôts : tu veux nous effacer. La révolte gagne toute la Gaule !",
      seuilGrave:42, revenuApres:true,
      options:[
        { label:"Réprimer par les légions", flag:"repression", effets:{ stabilite:15, romanisation:-8, faveur:6 }, persistant:{ tresor:-3 },
          consequence:"Les légions écrasent la révolte. L'ordre revient, mais la province se tait par crainte, non par adhésion.",
          pourquoi:"La force rétablit l'ordre, mais la soumission n'est pas l'adhésion : la rancœur couve et la romanisation recule." },
        { label:"Négocier et accorder la citoyenneté aux élites éduennes", effets:{ stabilite:10, romanisation:10, faveur:-5, tresor:-20 },
          effetsSi:{ flag:"curie", effets:{ stabilite:12, romanisation:14, faveur:-2, tresor:-20 }, note:"Grâce à ta curie, l'intégration des notables se fait sans heurt." },
          consequence:"Les chefs éduens, devenus citoyens, déposent les armes : ils ont désormais tout à gagner de Rome.",
          pourquoi:"Rome bâtit son empire en intégrant les élites locales : la citoyenneté en fit des alliés. Les conservateurs s'en méfiaient." },
        { label:"Baisser les impôts pour apaiser", effets:{ stabilite:8, romanisation:2, faveur:-7, tresor:-30 },
          consequence:"Le soulagement fiscal calme la colère, mais tes caisses en souffrent.",
          pourquoi:"Apaiser par l'argent évite l'affrontement, mais vide le trésor et ne romanise guère." }
      ]
    },
    {
      type:"evenement", id:"frontiere", acte:"Acte IV : Tenir l'Empire",
      perso:"centurion", expr:"severe", ambiance:"danger", nom:"Aulus, centurion",
      titre:"Les frontières menacées",
      source:{ texte:"Tacite décrit les peuples germains au-delà du Rhin : guerriers redoutables, jamais vraiment soumis, que Rome doit sans cesse contenir le long d’une frontière difficile à défendre.", ref:"D’après Tacite, La Germanie (98), adaptation" },
      source2:{ texte:"La frontière n’était pas qu’un mur. Rome y commerçait avec les Germains et en recrutait beaucoup dans ses armées. Pour certains, mieux valait intégrer les barbares que les combattre sans fin.", ref:"D’après les historiens du limes" },
      contexte:"Légat ! Des bandes germaniques ont franchi le Rhin et pillent nos confins. Tes ordres ?",
      revenuApres:true,
      options:[
        { label:"Lever des auxiliaires gaulois pour défendre la frontière", effets:{ romanisation:8, stabilite:4, faveur:4, tresor:-25 }, persistant:{ tresor:-5 },
          consequence:"Des Gaulois prennent les armes sous l'aigle romaine. En servant Rome, ils s'y attachent.",
          pourquoi:"Enrôler les Gaulois dans l'armée les intégrait à Rome : le service militaire, récompensé par la citoyenneté, romanisait." },
        { label:"Faire venir des légions d'Italie", effets:{ stabilite:10, faveur:-4, tresor:-45 }, persistant:{ tresor:-8 },
          consequence:"Les légions repoussent l'envahisseur, au prix fort, et sans rien changer aux cœurs gaulois.",
          pourquoi:"Les légions sécurisaient vite, mais coûtaient cher et n'intégraient pas la population." },
        { label:"Négocier et verser un tribut aux chefs germains", effets:{ tresor:-35, stabilite:4, faveur:-10 }, persistant:{ tresor:-5 },
          consequence:"L'or achète la paix sur le Rhin. La frontière se calme, mais Rome juge le procédé indigne.",
          pourquoi:"Acheter la paix évitait la guerre, mais affaiblissait le prestige de Rome." }
      ]
    },
    {
      type:"evenement", id:"crise3e", acte:"Acte IV : Tenir l'Empire",
      perso:"centurion", expr:"severe", ambiance:"danger", nom:"Aulus, centurion",
      titre:"La crise du IIIᵉ siècle",
      source:{ texte:"L’historien Hérodien, témoin de l’époque, décrit des empereurs renversés et assassinés les uns après les autres, tandis que les invasions se multiplient : l’Empire vacille.", ref:"D’après Hérodien, Histoire des empereurs romains (IIIe s.), adaptation" },
      source2:{ texte:"Tout ne fut pas que déclin. Des empereurs-soldats comme Aurélien réunifièrent l’Empire et furent salués comme ses restaurateurs. La crise força aussi de profondes réformes.", ref:"D’après les éloges de l’empereur Aurélien, adaptation" },
      contexte:"Légat, tout vacille à la fois : invasions sur tous les fronts, empereurs assassinés, monnaie sans valeur. L'Empire manque de sombrer.",
      revenuApres:true,
      options:[
        { label:"Mobiliser toutes les forces pour sauver l'Empire", effets:{ stabilite:9, faveur:3, tresor:-50 }, persistant:{ tresor:-8 },
          consequence:"À force d'efforts et de dépenses, tu tiens. L'Empire survit, exsangue mais debout.",
          pourquoi:"La crise du IIIᵉ siècle (invasions, anarchie militaire) faillit emporter Rome ; la sauver exigea des sacrifices énormes." },
        { label:"Te replier sur la défense des cités", effets:{ stabilite:3, romanisation:-4, faveur:-3, tresor:-15 }, persistant:{ tresor:-2 },
          consequence:"Tu sauves les villes en abandonnant des campagnes. On survit, mais on recule.",
          pourquoi:"Faute de moyens, Rome dut parfois sacrifier des territoires pour tenir l'essentiel." },
        { label:"Espérer que la tempête passe d'elle-même", effets:{ stabilite:-14, faveur:-6 },
          consequence:"Sans réaction ferme, les provinces sont ravagées et la confiance s'effondre.",
          pourquoi:"Devant des menaces simultanées, l'inaction précipitait l'effondrement." }
      ]
    },
    {
      type:"evenement", id:"armee", acte:"Acte IV : Tenir l'Empire",
      perso:"conseiller", expr:"inquiet", ambiance:"jour", nom:"Marcus, ton conseiller",
      titre:"Le fardeau de l'armée",
      source:{ texte:"Pour enrayer la flambée des prix qui ruine soldats et sujets, l’empereur Dioclétien fixe par édit des prix maximums, preuve d’une inflation galopante née du coût de l’armée et de la monnaie dévaluée.", ref:"D’après l’Édit du Maximum de Dioclétien (301), adaptation" },
      source2:{ texte:"L’édit échoua. Lactance rapporte qu’en fixant les prix, on provoqua pénuries et marché noir : les marchandises disparurent, et il fallut l’abandonner.", ref:"D’après Lactance, De la mort des persécuteurs, 7, adaptation" },
      contexte:"L'armée dévore le trésor, légat. Défendre un empire aussi vaste coûte plus que tout le reste. Comment payer ?",
      revenuApres:true,
      options:[
        { label:"Lever de lourds impôts pour financer l'armée", effets:{ tresor:35, stabilite:-10 }, persistant:{ tresor:4 },
          consequence:"L'armée est payée, les frontières tiennent. Mais le poids fiscal écrase le peuple, qui gronde.",
          pourquoi:"Défendre l'Empire imposait des impôts écrasants, l'une des grandes sources de mécontentement et de déclin." },
        { label:"Rogner l'argent de la monnaie", effets:{ tresor:20, stabilite:-6, faveur:-3, romanisation:-2 }, persistant:{ tresor:2 },
          consequence:"Tu paies en pièces dévaluées. Les prix s'envolent, la confiance dans Rome s'effrite.",
          pourquoi:"Dévaluer la monnaie pour financer l'armée provoqua une inflation qui ruina l'économie de l'Empire." },
        { label:"Réduire l'armée pour souffler", effets:{ tresor:10, stabilite:-3, faveur:-6 }, persistant:{ tresor:3 },
          consequence:"Le trésor respire, mais les frontières se dégarnissent, un pari dangereux.",
          pourquoi:"Réduire l'armée soulageait les finances, mais exposait l'Empire aux invasions." }
      ]
    },
    {
      type:"evenement", id:"vaste", acte:"Acte IV : Tenir l'Empire",
      perso:"empereur", expr:"neutre", ambiance:"solennel", nom:"L'empereur Dioclétien",
      titre:"Un empire trop vaste",
      source:{ texte:"Lactance rapporte que Dioclétien, jugeant l’Empire trop vaste pour un seul homme, en partagea le gouvernement entre plusieurs chefs (la Tétrarchie), au prix, déplore-t-il, d’une administration et d’impôts alourdis.", ref:"D’après Lactance, De la mort des persécuteurs (vers 315), adaptation" },
      source2:{ texte:"Au début, la Tétrarchie parut réussir. Les orateurs officiels célébraient quatre chefs unis défendant mieux un immense empire et ramenant la paix aux frontières.", ref:"D’après les Panégyriques latins (vers 289-307), adaptation" },
      contexte:"Legatus, l'Empire est devenu trop grand pour un seul maître. Faut-il en partager le gouvernement pour mieux le défendre ?",
      revenuApres:true,
      options:[
        { label:"Partager le pouvoir entre plusieurs chefs (la tétrarchie)", effets:{ stabilite:10, faveur:4, romanisation:-2, tresor:-15 }, persistant:{ tresor:-6 },
          consequence:"Plusieurs empereurs se partagent l'Empire : chacun défend sa part. Mieux gardé, mais l'unité se fissure.",
          pourquoi:"Face à l'immensité et aux invasions, Dioclétien partagea le pouvoir (la tétrarchie) pour mieux défendre l'Empire, au risque de la division." },
        { label:"Hérisser la frontière de forts et de garnisons (le limes)", cout:45, effets:{ stabilite:8, romanisation:1 }, persistant:{ tresor:-8 },
          consequence:"Tu fortifies le limes. Les incursions ralentissent, à grands frais.",
          pourquoi:"Fortifier la frontière (le limes) ralentissait les invasions, mais coûtait cher et figeait l'armée sur la défensive." },
        { label:"Tout gouverner seul depuis le centre", effets:{ stabilite:-8, faveur:2 }, persistant:{ tresor:-2 },
          consequence:"Tu refuses de partager le pouvoir. Mais un seul homme ne peut surveiller des frontières si lointaines.",
          pourquoi:"Gouverner seul un empire aussi vaste devint presque impossible : les distances et les menaces multiples le débordaient." }
      ]
    },
    /* ============ ACTE V, LE TOURNANT CHRÉTIEN ============ */
    {
      type:"evenement", id:"religion", acte:"Acte V : Le tournant chrétien",
      acteIntro:"Près de deux siècles ont passé. L'Empire que tu sers a changé de visage : une foi venue d'Orient gagne les villes et bouleverse l'ordre romain. Rien ne sera plus comme avant.",
      controleRome:{ seuil:65, rappel:48, malus:15, faveurRappel:38 },
      acteMalus:{ stabilite:-16, faveur:-8 }, acteMalusNote:"Le grand bouleversement religieux secoue l'Empire (stabilité −16, faveur −8).",
      perso:"conseiller", expr:"inquiet", ambiance:"jour", nom:"Marcus, ton conseiller",
      titre:"Une religion nouvelle",
      source:{ texte:"Gouverneur en Asie, Pline le Jeune écrit à l’empereur Trajan pour savoir comment juger les chrétiens : ils refusent de sacrifier à l’empereur, mais se réunissent paisiblement avant l’aube pour chanter leur dieu.", ref:"D’après Pline le Jeune, Lettres, X, 96 (vers 112), adaptation" },
      source2:{ texte:"Pour d’autres Romains, le christianisme était une superstition funeste. Tacite rapporte que Néron fit accuser les chrétiens de l’incendie de Rome : une secte à réprimer, jugeaient-ils.", ref:"D’après Tacite, Annales, XV, 44, adaptation" },
      contexte:"Légat, les chrétiens se multiplient. Ils refusent d'honorer l'empereur et nos dieux, un défi ouvert à l'ordre de Rome.",
      revenuApres:true,
      options:[
        { label:"Exiger qu'ils sacrifient à l'empereur", effets:{ faveur:6, stabilite:-6 },
          consequence:"Beaucoup refusent, au péril de leur vie. La tension monte dans les cités.",
          pourquoi:"Les chrétiens refusaient le culte impérial, perçu comme une menace pour l'unité religieuse de l'Empire." },
        { label:"Les surveiller sans sévir", effets:{ stabilite:2, faveur:-2 },
          consequence:"Tu temporises. Les chrétiens prient discrètement, sans heurt majeur.",
          pourquoi:"Beaucoup de gouverneurs tolérèrent d'abord les chrétiens par pragmatisme." },
        { label:"Les laisser pratiquer librement", effets:{ stabilite:5, faveur:-11 },
          consequence:"La paix règne dans les cités, mais Rome juge ta mollesse avec sévérité.",
          pourquoi:"Tolérer une foi qui rejetait le culte impérial heurtait frontalement les autorités." }
      ]
    },
    {
      type:"evenement", id:"persecution", acte:"Acte V : Le tournant chrétien",
      perso:"empereur", expr:"severe", ambiance:"danger", nom:"Édit de l'empereur",
      titre:"Persécuter ou tolérer ?",
      source:{ texte:"Trajan répond à Pline qu’il ne faut pas rechercher les chrétiens, mais punir ceux qui sont dénoncés et refusent de se rétracter, une politique ambiguë, entre tolérance et répression.", ref:"D’après la réponse de Trajan à Pline, Lettres, X, 97 (vers 112), adaptation" },
      source2:{ texte:"Le chrétien Tertullien dénonce des persécutions absurdes : on punit un simple nom, sans crime. Et il prévient : le sang des martyrs est une semence : réprimer fait grandir l’Église.", ref:"D’après Tertullien, Apologétique (vers 197), adaptation" },
      contexte:"L'empereur ordonne de réprimer les chrétiens dans tout l'Empire, legatus. Appliques-tu l'édit de persécution ?",
      revenuApres:true,
      options:[
        { label:"Persécuter durement les chrétiens", flag:"persecution", effets:{ faveur:8, stabilite:-12 },
          consequence:"Arrestations, procès, martyrs. Pourtant, plus tu frappes, plus la foi gagne en ferveur et en sympathie.",
          pourquoi:"Les grandes persécutions (Dèce, Dioclétien) firent des martyrs sans enrayer l'essor du christianisme, souvent l'inverse." },
        { label:"Appliquer mollement, fermer les yeux", effets:{ faveur:-3, stabilite:4 },
          consequence:"Tu sauves les apparences sans déchaîner la violence. Les cités restent calmes.",
          pourquoi:"Appliquer mollement les édits limitait les troubles, au risque de déplaire à l'empereur." },
        { label:"Refuser de persécuter", effets:{ faveur:-13, stabilite:7 },
          consequence:"Tu épargnes les chrétiens. La paix locale est préservée, mais tu défies ouvertement Rome.",
          pourquoi:"Refuser la persécution préservait la paix, mais c'était défier l'autorité impériale." }
      ]
    },
    {
      type:"evenement", id:"milan", acte:"Acte V : Le tournant chrétien",
      perso:"empereur", expr:"neutre", ambiance:"solennel", nom:"L'empereur Constantin",
      titre:"L'Édit de Milan (313)",
      source:{ texte:"En 313, Constantin et Licinius accordent à chacun la liberté de suivre la religion de son choix, chrétiens compris, et ordonnent de restituer aux Églises les biens confisqués.", ref:"D’après l’Édit de Milan (313), rapporté par Lactance, adaptation" },
      source2:{ texte:"La tolérance fit débat. Plus tard, le sénateur païen Symmaque suppliait qu’on laisse vivre aussi l’ancienne religion : on n’atteint pas un si grand mystère par une seule voie.", ref:"D’après Symmaque, Sur l’autel de la Victoire (384), adaptation" },
      contexte:"Moi, Constantin, j'ai vaincu sous un signe nouveau. Je proclame la liberté de culte pour tous, chrétiens compris. Appliqueras-tu mon édit, legatus ?",
      revenuApres:true,
      options:[
        { label:"Appliquer pleinement l'Édit de Milan", flag:"milan", effets:{ stabilite:10, faveur:8, romanisation:4 },
          consequence:"Les persécutions cessent, les chrétiens sortent de l'ombre, leurs biens sont rendus. L'empereur lui-même les protège.",
          pourquoi:"L'édit de Milan (313) accorda la liberté de culte et mit fin aux persécutions : avec Constantin, l'Empire bascule du côté du christianisme." },
        { label:"Tolérer, mais sans favoriser personne", flag:"milan", effets:{ stabilite:5, faveur:2 },
          consequence:"Tu garantis la liberté de culte sans privilégier les chrétiens. Une neutralité prudente.",
          pourquoi:"Une tolérance mesurée respectait l'édit sans heurter les fidèles des anciens dieux." },
        { label:"Traîner les pieds, résister au changement", effets:{ stabilite:-8, faveur:-10 },
          consequence:"Tu freines l'application de l'édit. Mais s'opposer à Constantin est une faute lourde.",
          pourquoi:"Résister à la nouvelle politique impériale, c'était défier l'empereur, et l'histoire en marche." }
      ]
    },
    {
      type:"evenement", id:"etat", acte:"Acte V : Le tournant chrétien",
      perso:"empereur", expr:"neutre", ambiance:"solennel", nom:"L'empereur Théodose",
      titre:"Le christianisme, religion de l'Empire",
      source:{ texte:"En 380, l’empereur Théodose ordonne à tous ses sujets de suivre le christianisme de Nicée, faisant de cette foi la religion officielle de l’Empire et interdisant peu à peu les anciens cultes.", ref:"D’après l’Édit de Thessalonique (380, Code Théodosien), adaptation" },
      source2:{ texte:"Faire d’une seule foi la loi de tous ne se fit pas sans violence. Le rhéteur païen Libanius supplie l’empereur d’épargner les temples : les détruire, c’est ruiner des chefs-d’œuvre.", ref:"D’après Libanius, Pour les temples (vers 386), adaptation" },
      contexte:"Le christianisme triomphe, legatus. Dois-je en faire la seule religion de l'Empire et fermer les temples des dieux anciens ?",
      contexteSi:{ flag:"repression", ajout:" Des inscriptions hostiles à Rome maculent encore les murs depuis ta vieille répression.", malus:{ stabilite:-6 } },
      revenuApres:true,
      options:[
        { label:"Faire du christianisme la religion officielle de l'État", effets:{ stabilite:6, faveur:10, romanisation:4 },
          consequence:"Les temples païens ferment, le christianisme règne sans partage. L'Empire romain est devenu chrétien.",
          pourquoi:"Théodose fit du christianisme la religion officielle (380, édit de Thessalonique), interdisant les autres cultes : l'Empire romain devint chrétien." },
        { label:"Favoriser l'Église sans interdire les autres cultes", effets:{ stabilite:8, faveur:5 },
          consequence:"Le christianisme domine, mais on laisse vivre les anciens cultes. La transition se fait sans déchirure.",
          pourquoi:"Une transition graduelle ménageait les fidèles des cultes traditionnels et préservait la paix." },
        { label:"Maintenir l'équilibre entre tous les cultes", effets:{ stabilite:2, faveur:-10, romanisation:-2 },
          consequence:"Tu défends la coexistence des religions, à contre-courant de l'époque. Rome te trouve dépassé.",
          pourquoi:"À la fin du IVᵉ siècle, le christianisme l'emportait : le freiner allait à contre-courant de l'histoire." }
      ]
    }
  ],

  revenu:{ haut:12, bas:4, seuil:45, texte:"Récolte des impôts" },

  /* Niveaux de difficulté. seuilRevolte = stabilité sous laquelle une province se
     soulève ; seuilPaix = stabilité à retrouver pour la pacifier (bande d'hystérésis).
     attenuation = facteur appliqué aux gains de Romanisation/Faveur pendant la révolte ;
     bleed = stabilité perdue par tour tant que la révolte dure ; revenuMod = facteur sur
     les impôts ; malusActeMod = facteur sur la pression des actes IV-V. À AJUSTER. */
  difficultes:{
    defaut:"legat", ordre:["apprenti","legat","imperator"],
    apprenti:{ nom:"Apprenti", sous:"Pour découvrir, marge d'erreur large",
      seuilRevolte:20, seuilPaix:30, attenuation:0.7, bleed:1, revenuMod:1.2, malusActeMod:0.5 },
    legat:{ nom:"Légat", sous:"L'expérience équilibrée",
      seuilRevolte:30, seuilPaix:42, attenuation:0.5, bleed:2, revenuMod:1, malusActeMod:1 },
    imperator:{ nom:"Imperator", sous:"Pour les stratèges aguerris",
      seuilRevolte:40, seuilPaix:50, attenuation:0.35, bleed:3, revenuMod:0.85, malusActeMod:1.4 }
  },

  echecs:{
    stabilite:{ perso:"gaulois", expr:"severe", ambiance:"danger", titre:"L'Empire s'embrase",
      texte:"La stabilité s'est effondrée : révoltes et invasions emportent la province. Rome te rappelle en disgrâce. Tenir un empire, c'est d'abord ne pas le laisser se déchirer." },
    romanisation:{ perso:"empereur", expr:"severe", ambiance:"solennel", titre:"Rappelé : la mission de Rome trahie",
      texte:"La province est restée trop peu romanisée. En faisant passer ses intérêts avant ceux de Rome, tu as failli à ta mission : romaniser n'était pas une option, c'était ta charge. L'empereur te rappelle et te remplace." },
    faveur:{ perso:"empereur", expr:"severe", ambiance:"solennel", titre:"Destitué par l'empereur",
      texte:"L'empereur a perdu toute confiance en toi : tu es relevé de tes fonctions. Servir Rome, c'est aussi savoir épouser ses volontés, fussent-elles changeantes." }
  },

  bilans:[
    { si:{ romanisation:85, stabilite:65, faveur:55 }, perso:"empereur", expr:"content", ambiance:"solennel",
      titre:"Apogée : une œuvre pour les siècles",
      texte:"Tu as romanisé la province en profondeur, traversé les pires crises sans la laisser sombrer, et accompagné le grand basculement chrétien sans déchirer l'Empire. Peu de gouverneurs auront tenu pareil équilibre sur une si longue durée. Ton nom restera." },
    { si:{ romanisation:62, stabilite:48, faveur:40 }, perso:"empereur", expr:"content", ambiance:"solennel",
      titre:"Un héritage romain durable",
      texte:"La Gaule est devenue romaine (langue, droit, villes, citoyens) et chrétienne avec l'Empire. Quelques secousses, mais l'essentiel tient. La romanisation a réussi, par l'intégration plus que par la conquête." },
    { si:{ romanisation:42, stabilite:28 }, perso:"conseiller", expr:"neutre", ambiance:"jour",
      titre:"Une romanisation inachevée",
      texte:"Rome a laissé son empreinte, mais l'enracinement reste fragile, ou bien tu as poussé si fort qu'à force de crises l'édifice a vacillé. L'équilibre, sur la durée, t'a manqué." },
    { si:{}, perso:"gaulois", expr:"neutre", ambiance:"jour",
      titre:"L'empreinte de Rome s'efface",
      texte:"Faute d'avoir su l'enraciner et la tenir, l'œuvre de Rome n'a pas pris. La conquête militaire ne suffisait pas : sans langue, droit, villes et adhésion partagés, il n'y a pas de romanisation durable." }
  ]
};
