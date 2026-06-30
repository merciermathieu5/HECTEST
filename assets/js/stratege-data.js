/* =========================================================================
   DEMOKRATIA — Gouverner Athènes au nom du peuple
   JEU COMPLET : 24 décisions en 5 actes, de la naissance de la démocratie
   (Clisthène) à la fin de l'hégémonie athénienne (404-403 av. J.-C.).
   Réalité sociale : « Une première expérience de démocratie » (HEC, 1re sec.).
   Langage volontairement simple (élèves de 12-13 ans). Les textes des
   documents sont des ADAPTATIONS inspirées du corpus HEC et du
   site muniverssocial.ca — À VÉRIFIER ET AJUSTER avant une évaluation.
   Les effets sur les jauges sont des hypothèses pédagogiques, À AJUSTER.

   Note technique : les identifiants internes des jauges restent
   « romanisation / stabilite / faveur / tresor » (pour réutiliser le moteur),
   mais s'affichent « Démocratie / Paix sociale / Soutien du peuple / Trésor ».
   ========================================================================= */
window.STRATEGE = {
  titre:"Demokratia", sousTitre:"Gouverner Athènes au nom du peuple",
  delaiLecture:6,
  etatInitial:{ romanisation:8, stabilite:60, faveur:60, tresor:100, liberte:55, pressionSparte:0 },

  jauges:[
    { id:"romanisation", nom:"Démocratie",       icone:"temple",  type:"pct", couleur:"pourpre" },
    { id:"stabilite",    nom:"Paix sociale",      icone:"bouclier",type:"pct", couleur:"seuil" },
    { id:"faveur",       nom:"Soutien du peuple", icone:"laurier", type:"pct", couleur:"seuil" },
    { id:"tresor",       nom:"Trésor de la cité", icone:"piece",   type:"res", couleur:"bronze" }
  ],

  accueil:{
    titre:"Demokratia", sousTitre:"Gouverner Athènes au nom du peuple",
    accroche:"Tu diriges Athènes au 5ᵉ siècle avant notre ère. Vas-tu réussir à donner le pouvoir au peuple tout en gardant la cité en paix ?",
    commentTitre:"Comment ça marche",
    jaugesAide:[
      { icone:"temple",   nom:"Démocratie",       txt:"ta mission : donner le pouvoir au peuple" },
      { icone:"bouclier", nom:"Paix sociale",     txt:"l'entente entre les habitants de la cité" },
      { icone:"laurier",  nom:"Soutien du peuple",txt:"la confiance des citoyens en toi" },
      { icone:"piece",    nom:"Trésor de la cité",txt:"l'argent : la flotte, la guerre, les chantiers" }
    ],
    etapesAide:[
      "Avant chaque décision, lis les DEUX documents à droite : un point de vue, puis un autre.",
      "Chaque choix fait avancer (ou reculer) la démocratie, la paix dans la cité, le soutien du peuple et l'argent.",
      "24 décisions en 5 actes : la naissance de la démocratie, les guerres médiques, l'âge d'or de Périclès, la guerre du Péloponnèse, puis la fin de l'hégémonie."
    ],
    pedagoTitre:"Contexte pédagogique",
    pedago:[
      "Histoire et éducation à la citoyenneté, 1ʳᵉ secondaire.",
      "Réalité sociale : « Une première expérience de démocratie »."
    ],
    diffTitre:"Choisis ton niveau pour commencer"
  },

  intro:{
    perso:"conseiller", expr:"neutre", ambiance:"jour", document:"acropole",
    nom:"Démos, ton conseiller", acte:"Acte I : Donner le pouvoir au peuple",
    titre:"Te voilà à la tête d'Athènes",
    texte:"Au début, Athènes est dirigée par quelques familles riches : c'est l'oligarchie, le pouvoir de quelques-uns. Peu à peu, tu vas donner le pouvoir à tous les citoyens. C'est la naissance de la démocratie : le pouvoir du peuple. Avance, une décision à la fois.",
    bouton:"Commencer"
  },

  etapes:[
    /* ============ ACTE I — DONNER LE POUVOIR AU PEUPLE ============ */
    {
      type:"evenement", id:"dettes", acte:"Acte I : Donner le pouvoir au peuple",
      perso:"paysan", expr:"inquiet", ambiance:"jour", nom:"Un paysan d'Athènes", document:"pnyx",
      titre:"Les paysans croulent sous les dettes",
      source:{ texte:"Au début du 6ᵉ siècle avant notre ère, le réformateur Solon interdit de rendre un citoyen esclave parce qu'il a des dettes. Il libère ainsi les paysans pauvres de leur dépendance envers les riches." },
      source2:{ texte:"Mais les grandes familles riches prêtent l'argent et possèdent presque toutes les terres. Pour elles, effacer les dettes, c'est perdre leur pouvoir sur les pauvres." },
      contexte:"Stratège, des paysans pauvres sont devenus esclaves parce qu'ils ne pouvaient pas rembourser leurs dettes aux riches. Que fais-tu ?",
      revenuApres:true,
      options:[
        { label:"Interdire de rendre un citoyen esclave pour ses dettes", effets:{ romanisation:9, stabilite:-4, faveur:7 },
          consequence:"Les paysans pauvres sont libérés : le peuple te soutient. Mais les riches, qui perdaient leur emprise sur eux, sont mécontents.",
          pourquoi:"En libérant les pauvres, Solon pose une première pierre de la démocratie : tous les citoyens, riches ou pauvres, comptent." },
        { label:"Un compromis : alléger les dettes, sans tout effacer", effets:{ romanisation:4, stabilite:2, faveur:1 },
          consequence:"Tu allèges le fardeau des pauvres sans trop froisser les riches. Un demi-pas.",
          pourquoi:"Un compromis calme la cité, mais avance plus lentement vers l'égalité des citoyens." },
        { label:"Ne rien changer et protéger les riches", effets:{ romanisation:-2, stabilite:-8, faveur:-9 },
          consequence:"Les pauvres restent écrasés par les dettes. La colère monte dans la cité.",
          pourquoi:"Tant que les pauvres dépendent des riches, le pouvoir reste à quelques-uns : pas de démocratie possible." }
      ]
    },
    {
      type:"evenement", id:"vote", acte:"Acte I : Donner le pouvoir au peuple",
      perso:"conseiller", expr:"neutre", ambiance:"jour", nom:"Démos, ton conseiller", document:"pnyx",
      titre:"Qui peut participer aux décisions ?",
      source:{ texte:"À Athènes, on appelle citoyens les hommes libres, nés de parents athéniens, âgés de plus de 18 ans et ayant fait leur service militaire. Eux seuls peuvent participer à la vie politique." },
      source2:{ texte:"Dans les faits, seuls ceux qui sont assez à l'aise pour quitter leur travail viennent voter. La plupart des citoyens sont des paysans qui peuvent difficilement laisser leurs terres." },
      contexte:"Tu veux que les citoyens décident ensemble. Mais à qui donner ce droit : à tous les citoyens, ou seulement aux plus riches ?",
      revenuApres:true,
      options:[
        { label:"Donner le droit de décider à tous les citoyens, riches comme pauvres", effets:{ romanisation:10, stabilite:-5, faveur:6 },
          consequence:"Tous les citoyens peuvent maintenant voter : le peuple gagne du pouvoir. Mais les grandes familles, qui perdent de l'influence, grognent.",
          pourquoi:"Donner la parole à tous les citoyens, et pas seulement aux riches, est le cœur de la démocratie athénienne." },
        { label:"Réserver les décisions aux citoyens qui possèdent des terres", effets:{ romanisation:3, stabilite:2, faveur:-2 },
          consequence:"Seuls les propriétaires décident. C'est plus large qu'avant, mais les pauvres restent à l'écart.",
          pourquoi:"Limiter le vote aux propriétaires laisse une partie du peuple sans voix : la démocratie reste incomplète." },
        { label:"Garder les décisions pour les quelques familles riches", effets:{ romanisation:-3, stabilite:-5, faveur:-8 },
          consequence:"Le pouvoir reste aux mains des grandes familles. Le peuple est déçu.",
          pourquoi:"Réserver le pouvoir à quelques familles, c'est l'oligarchie — le contraire de la démocratie." }
      ]
    },
    {
      type:"evenement", id:"clisthene", acte:"Acte I : Donner le pouvoir au peuple",
      perso:"conseiller", expr:"content", ambiance:"jour", nom:"Démos, ton conseiller", document:"pnyx",
      titre:"Mélanger les citoyens (la réforme de Clisthène)",
      source:{ texte:"À la fin du 6ᵉ siècle avant notre ère, Clisthène répartit les citoyens en 10 groupes (des tribus) qui mélangent les habitants de différents quartiers. Riches et pauvres se retrouvent dans le même groupe." },
      source2:{ texte:"Cette réforme affaiblit le pouvoir des vieilles familles riches. Désormais, tous les citoyens sont égaux devant la loi, qu'ils soient riches ou pauvres." },
      contexte:"Les grandes familles riches contrôlent des régions entières. Clisthène propose de regrouper les citoyens autrement, en mélangeant les gens des différents quartiers. Qu'en penses-tu ?",
      revenuApres:true,
      options:[
        { label:"Adopter la réforme : mélanger les citoyens, tous égaux devant la loi", effets:{ romanisation:12, stabilite:-6, faveur:6 },
          consequence:"Les vieilles familles perdent leur emprise : la démocratie naît vraiment. Mais, mécontentes, elles fragilisent la paix dans la cité.",
          pourquoi:"En cassant le pouvoir des grandes familles et en rendant les citoyens égaux devant la loi, Clisthène fait naître la démocratie athénienne." },
        { label:"Une version douce, sans trop déranger les familles", effets:{ romanisation:5, stabilite:3, faveur:1 },
          consequence:"Tu changes un peu les choses, mais les grandes familles gardent de l'influence.",
          pourquoi:"Une réforme timide avance moins vite vers l'égalité des citoyens." },
        { label:"Refuser : garder le système des grandes familles", effets:{ romanisation:-4, stabilite:-4, faveur:-7 },
          consequence:"Rien ne change. Les familles riches restent au-dessus des autres.",
          pourquoi:"Sans la réforme de Clisthène, le pouvoir reste à quelques familles : la démocratie ne peut pas naître." }
      ]
    },
    {
      type:"evenement", id:"ecclesia", acte:"Acte I : Donner le pouvoir au peuple",
      perso:"citoyen", expr:"neutre", ambiance:"jour", nom:"Un citoyen à l'assemblée", document:"pnyx",
      titre:"Où se prennent les grandes décisions ?",
      source:{ texte:"L'assemblée du peuple (l'ecclésia) réunit les citoyens. Elle décide de la paix et de la guerre, vote les lois et choisit les chefs de la cité. Les citoyens votent à main levée." },
      source2:{ texte:"Les citoyens jugent aussi les procès dans un grand tribunal (l'Héliée). Les juges y sont tirés au sort, et non choisis selon leur richesse." },
      contexte:"La guerre, la paix, les lois : qui doit décider de tout cela pour Athènes ?",
      revenuApres:true,
      options:[
        { label:"Donner le dernier mot à l'assemblée du peuple", effets:{ romanisation:11, stabilite:-5, faveur:7 },
          consequence:"C'est l'assemblée des citoyens qui décide de tout : le peuple tient le pouvoir. Les familles riches, écartées, l'acceptent mal.",
          pourquoi:"Quand l'assemblée du peuple décide elle-même de la guerre, de la paix et des lois, c'est une démocratie directe : les citoyens décident eux-mêmes." },
        { label:"Laisser un petit conseil décider ; l'assemblée approuve ensuite", effets:{ romanisation:4, stabilite:3, faveur:0 },
          consequence:"Un conseil prépare tout ; l'assemblée ne fait qu'approuver. Le peuple a moins de pouvoir réel.",
          pourquoi:"Si un petit groupe décide à la place du peuple, on s'éloigne de la démocratie." },
        { label:"Garder les décisions pour les familles riches, comme avant", effets:{ romanisation:-4, stabilite:-5, faveur:-8 },
          consequence:"Les grandes familles décident encore de tout. Le peuple n'a pas son mot à dire.",
          pourquoi:"Sans assemblée souveraine, le pouvoir reste à quelques-uns : c'est encore l'oligarchie." }
      ]
    },
    /* ============ ACTE II — AFFRONTER LES PERSES ============ */
    {
      type:"evenement", id:"marathon", acte:"Acte II : Affronter les Perses",
      acteIntro:"La démocratie est en marche. Mais au loin, le puissant empire perse prépare une invasion. La cité va devoir se défendre.",
      acteMalus:{ stabilite:-5 }, acteMalusNote:"Les Perses approchent : la peur gagne la cité (paix sociale −5).",
      controleRome:{ seuil:18, rappel:8, malus:6, faveurRappel:12 },
      perso:"stratege", expr:"severe", ambiance:"danger", nom:"Le stratège militaire", document:"marathon",
      titre:"Les Perses débarquent à Marathon",
      source:{ texte:"L'armée du roi perse Darius traverse la mer pour envahir l'Attique, la région d'Athènes. Elle compte des dizaines de milliers de soldats : c'est énorme pour l'époque." },
      source2:{ texte:"Athènes peut compter sur environ 10 000 hoplites : des citoyens-soldats lourdement armés qui combattent côte à côte. Ce sont les citoyens eux-mêmes qui défendent la cité." },
      contexte:"L'armée du roi perse Darius débarque à Marathon, tout près d'Athènes. Que décides-tu ?",
      revenuApres:true,
      options:[
        { label:"Envoyer les hoplites citoyens affronter les Perses à Marathon", effets:{ romanisation:7, stabilite:4, faveur:9, liberte:10 },
          consequence:"Les citoyens-soldats repoussent les Perses à Marathon. La cité est fière et soudée.",
          pourquoi:"À Marathon, ce sont les citoyens-soldats (hoplites) qui sauvent la cité. Celui qui défend Athènes, c'est aussi celui qui vote : le citoyen." },
        { label:"Attendre derrière les murs, sans risquer la bataille", effets:{ romanisation:0, stabilite:-6, faveur:-6, liberte:-4 },
          consequence:"Tu restes prudent, mais les Perses ravagent la campagne. Le peuple te trouve faible.",
          pourquoi:"Ne pas défendre la cité fait douter le peuple : un chef doit protéger Athènes et ses citoyens." },
        { label:"Négocier et se soumettre au roi perse", effets:{ romanisation:-8, stabilite:-4, faveur:-12, liberte:-30 }, finImposee:"soumission",
          consequence:"Tu plies devant les Perses. Athènes perd sa liberté — et la démocratie avec elle.",
          pourquoi:"Se soumettre à un roi étranger, c'est renoncer à la liberté des citoyens, donc à la démocratie." }
      ]
    },
    {
      type:"construction", revenuApres:true, id:"flotte", acte:"Acte II : Affronter les Perses",
      perso:"stratege", expr:"neutre", ambiance:"jour", nom:"Le stratège militaire", document:"mines",
      titre:"Construire une flotte de navires de guerre",
      source:{ texte:"La cité possède des mines d'argent (à Laurion). Thémistocle propose d'utiliser cet argent pour construire une flotte de navires de guerre, les trières." },
      source2:{ texte:"Les rameurs de ces navires sont les citoyens les plus pauvres. En devenant indispensables pour défendre la cité, ils prennent de l'importance dans la vie politique." },
      contexte:"Les Perses reviendront, plus nombreux. On vient de trouver beaucoup d'argent dans les mines. Thémistocle propose d'en faire une grande flotte. Mais c'est très cher.",
      options:[
        { label:"Construire une grande flotte de trières", cout:55, effets:{ romanisation:9, stabilite:3, faveur:5, liberte:6 }, persistant:{ tresor:4 }, flag:"flotte",
          consequence:"Athènes devient une grande puissance sur mer. Les pauvres, devenus rameurs, comptent davantage dans la cité.",
          pourquoi:"La flotte, ramée par les plus pauvres, leur donne de l'importance : elle renforce la démocratie et fait d'Athènes une grande puissance." },
        { label:"Construire seulement quelques navires", cout:25, effets:{ romanisation:3, stabilite:1 },
          consequence:"Une petite flotte, prudente. Athènes reste surtout une puissance de terre.",
          pourquoi:"Une flotte modeste protège un peu, mais donne moins de poids aux citoyens pauvres." },
        { label:"Garder l'argent et renforcer les murs de la ville", cout:15, effets:{ romanisation:-2, stabilite:4, faveur:-2 }, persistant:{ tresor:-1 },
          consequence:"Tu mises sur la défense de terre. Mais sans flotte, Athènes restera plus faible face aux Perses.",
          pourquoi:"Sans flotte, les citoyens pauvres restent à l'écart, et la cité est moins forte sur mer." }
      ]
    },
    {
      type:"evenement", id:"salamine", acte:"Acte II : Affronter les Perses",
      perso:"conseiller", expr:"inquiet", ambiance:"danger", nom:"Démos, ton conseiller",
      titre:"Le roi perse Xerxès marche sur Athènes",
      source:{ texte:"Thémistocle propose d'évacuer la ville et de combattre les Perses sur mer, dans le détroit de Salamine, où les navires grecs seront plus habiles." },
      source2:{ texte:"Abandonner la ville est un déchirement : les Perses la brûleront. Mais plusieurs cités grecques, dont Sparte, acceptent de s'unir pour combattre ensemble." },
      contexte:"Le nouveau roi perse, Xerxès, arrive avec une armée immense et va prendre la ville. Que fais-tu ?",
      revenuApres:true,
      options:[
        { label:"Évacuer la ville et affronter les Perses sur mer à Salamine", effets:{ romanisation:6, stabilite:4, faveur:9, liberte:10 },
          consequence:"La flotte grecque écrase les Perses à Salamine. Athènes est sauvée, et l'union des Grecs triomphe.",
          pourquoi:"À Salamine, la flotte et l'union des cités grecques repoussent les Perses : la liberté des cités est sauvée." },
        { label:"Défendre les murs de la ville coûte que coûte", effets:{ romanisation:-3, stabilite:-7, faveur:-7 },
          consequence:"La ville résiste mal et subit de lourdes pertes. Le peuple doute de toi.",
          pourquoi:"Sans la flotte et sans l'union des Grecs, la défense de terre seule était trop faible face aux Perses." },
        { label:"Demander la paix à Xerxès pour épargner la ville", effets:{ romanisation:-9, stabilite:-3, faveur:-12, liberte:-30 }, finImposee:"soumission",
          consequence:"Tu te soumets pour sauver les murs. Mais Athènes perd sa liberté et son honneur.",
          pourquoi:"Se soumettre, c'est perdre la liberté des citoyens — donc renoncer à la démocratie." }
      ]
    },
    {
      type:"evenement", id:"delos", acte:"Acte II : Affronter les Perses",
      perso:"stratege", expr:"content", ambiance:"jour", nom:"Le stratège militaire", document:"delos",
      titre:"Une alliance des cités grecques",
      source:{ texte:"En 477 avant notre ère, des centaines de cités grecques forment une alliance, la Ligue de Délos. Son but : se défendre ensemble contre l'empire perse. Athènes en prend la tête." },
      source2:{ texte:"Mais Athènes, la plus forte, pourrait transformer cette alliance en empire et commander aux autres cités. Cela risquerait un jour de fâcher Sparte et ses alliés." },
      contexte:"Après la victoire, les cités grecques veulent rester unies contre les Perses. Comment organises-tu cette alliance ?",
      revenuApres:true,
      options:[
        { label:"Une alliance d'égaux : chaque cité reste libre", effets:{ romanisation:6, stabilite:5, faveur:4, liberte:5 }, persistant:{ tresor:3 },
          consequence:"Les cités s'unissent en confiance. L'alliance est solide et la paix règne entre les Grecs.",
          pourquoi:"Une alliance qui respecte les autres cités est plus durable et évite la guerre entre Grecs." },
        { label:"Athènes dirige et reçoit l'argent des alliés", effets:{ romanisation:4, stabilite:-4, faveur:6, liberte:-3 }, persistant:{ tresor:8 },
          consequence:"Athènes devient riche et puissante grâce à l'argent des alliés. Mais certaines cités se sentent dominées.",
          pourquoi:"L'argent des alliés enrichit Athènes (et, plus tard, sa démocratie), mais transformer l'alliance en empire prépare la guerre du Péloponnèse." },
        { label:"Refuser l'alliance : Athènes se débrouille seule", effets:{ romanisation:0, stabilite:2, faveur:-5 },
          consequence:"Athènes reste seule. Sans alliés, elle est plus faible face aux Perses.",
          pourquoi:"Sans alliance, Athènes perd l'occasion de devenir une grande puissance protectrice des Grecs." }
      ]
    },
    /* ============ ACTE III — L'ÂGE D'OR DE PÉRICLÈS ============ */
    {
      type:"evenement", id:"misthos", acte:"Acte III : L'âge d'or de Périclès",
      acteIntro:"Les Perses sont repoussés. Sous la conduite de Périclès, Athènes connaît son âge d'or : la démocratie s'approfondit, les arts brillent. Mais l'argent des cités alliées finance cette splendeur…",
      acteMalus:{ stabilite:-4 }, acteMalusNote:"Les cités alliées commencent à se plaindre de la domination d'Athènes (paix sociale −4).",
      controleRome:{ seuil:30, rappel:18, malus:7, faveurRappel:15 },
      perso:"stratege", expr:"neutre", ambiance:"jour", nom:"Périclès, le stratège", document:"pnyx",
      titre:"Payer les citoyens pour qu'ils participent",
      source:{ texte:"La plupart des citoyens sont des paysans. Seuls les plus à l'aise peuvent quitter leur travail pour aller voter ou juger. Les pauvres, eux, en sont souvent empêchés." },
      source2:{ texte:"Périclès fait voter une petite somme (le misthos) versée aux citoyens qui siègent. Désormais, même un pauvre peut prendre part aux décisions et à la justice." },
      contexte:"Les citoyens pauvres ne peuvent pas quitter leur travail pour siéger à l'assemblée ou juger les procès. Périclès propose de les payer pour le faire.",
      revenuApres:true,
      options:[
        { label:"Payer tous les citoyens qui siègent, même les plus pauvres", effets:{ romanisation:11, stabilite:1, faveur:8 }, persistant:{ tresor:-4 },
          consequence:"Même les pauvres peuvent désormais participer. La démocratie devient bien plus réelle — mais cela coûte cher chaque année.",
          pourquoi:"En payant les citoyens, Périclès permet aux pauvres de participer vraiment : c'est l'un des sommets de la démocratie athénienne." },
        { label:"Une petite indemnité, seulement pour les juges", effets:{ romanisation:5, faveur:3 }, persistant:{ tresor:-2 },
          consequence:"Un pas mesuré : au moins la justice s'ouvre à tous.",
          pourquoi:"Payer seulement les juges aide un peu, mais laisse beaucoup de pauvres loin de l'assemblée." },
        { label:"Ne rien payer : la politique reste pour ceux qui en ont les moyens", effets:{ romanisation:-3, stabilite:1, faveur:-6 },
          consequence:"Sans indemnité, les pauvres restent à l'écart. Dans les faits, ce sont surtout les riches qui décident.",
          pourquoi:"Sans le misthos, la démocratie reste théorique : les pauvres ne peuvent pas exercer leurs droits." }
      ]
    },
    {
      type:"construction", revenuApres:true, id:"parthenon", acte:"Acte III : L'âge d'or de Périclès",
      perso:"stratege", expr:"content", ambiance:"jour", nom:"Périclès, le stratège", document:"acropole",
      titre:"Bâtir le Parthénon",
      source:{ texte:"Le grand chantier de l'Acropole emploie des milliers d'ouvriers et d'artistes. Athènes devient la plus belle cité grecque, admirée de tous." },
      source2:{ texte:"Pour payer ces travaux, Athènes utilise l'argent que les cités alliées versent pour la défense commune. Beaucoup d'alliés trouvent injuste de financer la gloire d'Athènes." },
      contexte:"Périclès veut couvrir l'Acropole de temples magnifiques, dont le Parthénon : du travail pour des milliers d'Athéniens et la gloire pour la cité. Mais avec quel argent ?",
      options:[
        { label:"Financer le Parthénon avec l'argent des alliés", cout:15, effets:{ romanisation:6, stabilite:-7, faveur:9 }, persistant:{ tresor:-2 },
          consequence:"L'Acropole resplendit, les Athéniens ont du travail et sont fiers. Mais les alliés, dépouillés, en gardent une rancune profonde.",
          pourquoi:"Le programme de Périclès fait la gloire d'Athènes, mais détourner l'argent des alliés transforme l'alliance en empire et prépare la guerre." },
        { label:"Bâtir plus modestement, avec l'argent d'Athènes", cout:65, effets:{ romanisation:3, stabilite:1, faveur:4 },
          consequence:"Des temples plus simples, payés par la cité. Moins de gloire, mais les alliés ne sont pas lésés.",
          pourquoi:"Construire avec ses propres moyens évite de fâcher les alliés, mais Athènes brille moins." },
        { label:"Renoncer aux grands travaux", effets:{ romanisation:-2, stabilite:2, faveur:-5 },
          consequence:"Pas de grands monuments. Le peuple, privé de travail et de fierté, est déçu.",
          pourquoi:"Sans le grand chantier, Athènes manque son âge d'or culturel." }
      ]
    },
    {
      type:"construction", revenuApres:true, id:"propylees", acte:"Acte III : L'âge d'or de Périclès",
      perso:"stratege", expr:"content", ambiance:"jour", nom:"Périclès, le stratège", document:"acropole",
      titre:"Embellir l'Acropole (les Propylées)",
      source:{ texte:"Les Propylées forment une entrée de marbre majestueuse. Avec ses temples, l'Acropole devient la plus belle colline sacrée de toute la Grèce." },
      source2:{ texte:"Ces chantiers donnent du travail à des milliers d'Athéniens et d'artisans, mais ils coûtent très cher au trésor de la cité." },
      contexte:"Après le Parthénon, Périclès veut achever l'Acropole : une entrée monumentale en marbre (les Propylées) et d'autres temples. C'est magnifique, mais cher.",
      options:[
        { label:"Achever l'Acropole : Propylées et nouveaux temples", cout:90, effets:{ romanisation:4, stabilite:1, faveur:7 },
          consequence:"L'Acropole est achevée, splendide. Les Athéniens ont du travail et une immense fierté.",
          pourquoi:"Les grands travaux de Périclès emploient le peuple et font rayonner Athènes : c'est le cœur de son âge d'or." },
        { label:"Quelques embellissements modestes", cout:40, effets:{ romanisation:2, faveur:3 },
          consequence:"Des travaux plus modestes. L'Acropole gagne un peu en beauté.",
          pourquoi:"Embellir un peu suffit à la fierté de la cité, sans vider le trésor." },
        { label:"Laisser l'Acropole telle quelle", effets:{ romanisation:-1, stabilite:1, faveur:-4 },
          consequence:"Pas de nouveaux travaux. Le peuple, privé d'emploi et de fierté, est déçu.",
          pourquoi:"Renoncer aux grands travaux, c'est manquer l'âge d'or culturel d'Athènes." }
      ]
    },
    {
      type:"construction", revenuApres:true, id:"sculpteurs", acte:"Acte III : L'âge d'or de Périclès",
      perso:"marchand", expr:"content", ambiance:"jour", nom:"Un sculpteur métèque", document:"sculpteurs",
      titre:"Le quartier des sculpteurs",
      source:{ texte:"Les sculpteurs, souvent des métèques, créent des statues admirées dans toute la Grèce. Leurs ateliers emploient beaucoup d'artisans." },
      source2:{ texte:"L'art glorifie la cité et les dieux. Mais certains disent que cet argent pourrait plutôt nourrir les pauvres." },
      contexte:"Athènes attire les meilleurs sculpteurs de Grèce, comme Phidias. Tu peux financer tout un quartier d'ateliers pour orner la cité de statues.",
      options:[
        { label:"Financer un grand quartier d'ateliers", cout:65, effets:{ romanisation:3, stabilite:1, faveur:6 }, persistant:{ tresor:1 },
          consequence:"Les ateliers bourdonnent. Athènes se couvre de statues admirées partout, et les artisans prospèrent.",
          pourquoi:"En soutenant les arts, Athènes rayonne et fait vivre ses artisans, dont beaucoup de métèques." },
        { label:"Commander seulement quelques statues", cout:35, effets:{ romanisation:1, faveur:3 },
          consequence:"Quelques belles statues ornent la cité. Un effort mesuré.",
          pourquoi:"Commander quelques œuvres embellit la cité sans grande dépense." },
        { label:"Ne rien dépenser pour l'art", effets:{ romanisation:-1, faveur:-3 },
          consequence:"Pas de nouvelles œuvres. Athènes reste moins éclatante que ses rivales.",
          pourquoi:"Sans soutien aux arts, Athènes perd une part de son prestige." }
      ]
    },
    {
      type:"construction", revenuApres:true, id:"agora", acte:"Acte III : L'âge d'or de Périclès",
      perso:"citoyen", expr:"neutre", ambiance:"jour", nom:"Un citoyen d'Athènes", document:"agora",
      titre:"Améliorer l'Agora",
      source:{ texte:"L'Agora est le centre de la vie publique : on y fait le marché, on y rend la justice, on y discute des affaires de la cité." },
      source2:{ texte:"L'embellir de galeries couvertes (les stoas) et de fontaines rend la vie commune plus agréable et plus active — mais cela demande de l'argent." },
      contexte:"L'Agora est le cœur d'Athènes : marché, tribunaux, lieu de rencontre des citoyens. Tu peux la rénover avec des galeries, des fontaines et de nouveaux bâtiments publics.",
      options:[
        { label:"Grande rénovation : stoas, fontaines, tribunaux", cout:75, effets:{ romanisation:4, stabilite:2, faveur:5 }, persistant:{ tresor:2 },
          consequence:"L'Agora rénovée déborde de vie : marché, débats, justice. La cité respire et commerce mieux.",
          pourquoi:"Une Agora vivante, c'est le cœur de la vie démocratique et du commerce d'Athènes." },
        { label:"Quelques réparations utiles", cout:35, effets:{ romanisation:1, stabilite:1 }, persistant:{ tresor:1 },
          consequence:"L'Agora est entretenue, sans plus. La vie publique continue.",
          pourquoi:"Entretenir l'Agora suffit au quotidien, mais sans en faire un grand lieu." },
        { label:"Laisser l'Agora se dégrader", effets:{ romanisation:-2, stabilite:-1, faveur:-2 },
          consequence:"L'Agora vieillit et se vide peu à peu. La vie publique en souffre.",
          pourquoi:"Négliger l'Agora, c'est négliger le lieu même où vit la démocratie." }
      ]
    },
    {
      type:"construction", revenuApres:true, id:"longs_murs", acte:"Acte III : L'âge d'or de Périclès",
      perso:"stratege", expr:"neutre", ambiance:"jour", nom:"Périclès, le stratège", document:"remparts",
      titre:"Les Longs Murs jusqu'au Pirée",
      source:{ texte:"Les Longs Murs relient la ville au Pirée. Même assiégée sur terre, Athènes reste nourrie et approvisionnée par sa flotte." },
      source2:{ texte:"Ce mur géant repose sur la marine — c'est-à-dire sur les rameurs, souvent les plus pauvres. Il renforce la puissance navale et le rôle du peuple." },
      contexte:"Périclès propose de relier Athènes à son port, le Pirée, par deux longues murailles fortifiées : même encerclée, la cité pourrait toujours être ravitaillée par la mer. C'est un chantier énorme.",
      options:[
        { label:"Construire les deux Longs Murs jusqu'au Pirée", cout:100, effets:{ romanisation:5, stabilite:6, faveur:4 },
          consequence:"Athènes et son port ne font plus qu'un. La cité est imprenable tant que sa flotte tient la mer.",
          pourquoi:"Les Longs Murs lient la cité à sa flotte : ils protègent Athènes et renforcent le rôle des plus pauvres, qui rament sur les navires." },
        { label:"Un seul mur, plus court", cout:55, effets:{ romanisation:2, stabilite:3, faveur:2 },
          consequence:"Une muraille protège en partie la route du port. Mieux que rien.",
          pourquoi:"Un mur partiel offre une protection limitée, à moindre coût." },
        { label:"Ne pas construire de murailles", effets:{ romanisation:-1, stabilite:-4, faveur:-2 },
          consequence:"Sans Longs Murs, un siège pourrait couper Athènes de son port et l'affamer.",
          pourquoi:"Sans lien fortifié vers le Pirée, Athènes reste vulnérable à un blocus terrestre." }
      ]
    },
    {
      type:"evenement", id:"piree", acte:"Acte III : L'âge d'or de Périclès",
      perso:"marchand", expr:"neutre", ambiance:"jour", nom:"Un marchand métèque", document:"commerce",
      titre:"Le port du Pirée et les étrangers",
      source:{ texte:"Les métèques sont des étrangers installés à Athènes. Artisans et commerçants, ils font la richesse de la cité. Ils paient des impôts et font le service militaire." },
      source2:{ texte:"Mais les métèques n'ont aucun droit politique et ne peuvent pas posséder de terre. Ils participent à la richesse d'Athènes sans participer à ses décisions." },
      contexte:"Le Pirée, le port d'Athènes, est devenu le plus grand marché de la Méditerranée. Beaucoup d'étrangers (les métèques) y vivent et y commercent. Quelle place leur donner ?",
      revenuApres:true,
      options:[
        { label:"Accueillir largement les métèques et développer le commerce", effets:{ romanisation:2, stabilite:2, faveur:2 }, persistant:{ tresor:4 },
          consequence:"Le Pirée déborde d'activité. Athènes s'enrichit grâce aux étrangers. La cité prospère.",
          pourquoi:"Les métèques font la prospérité d'Athènes. Mais, exclus de la vie politique, ils montrent une limite de la démocratie." },
        { label:"Les accepter, sans toucher aux privilèges des citoyens", effets:{ romanisation:1, stabilite:1 }, persistant:{ tresor:3 },
          consequence:"Les métèques travaillent et paient, mais restent à l'écart. Un compromis prudent.",
          pourquoi:"Garder les métèques à l'écart protège les privilèges des citoyens, mais limite l'ouverture de la cité." },
        { label:"Limiter le nombre d'étrangers dans la cité", effets:{ romanisation:-1, stabilite:-2, faveur:-1 }, persistant:{ tresor:-3 },
          consequence:"Moins d'étrangers, moins de commerce. La richesse du Pirée s'étiole.",
          pourquoi:"Chasser les étrangers prive Athènes de la richesse qui faisait sa force." }
      ]
    },
    {
      type:"evenement", id:"ostracisme", acte:"Acte III : L'âge d'or de Périclès",
      perso:"citoyen", expr:"neutre", ambiance:"jour", nom:"Un citoyen à l'assemblée", document:"ostracisme",
      titre:"L'ostracisme : bannir un citoyen",
      source:{ texte:"Chaque année, les citoyens peuvent voter pour bannir l'un des leurs pendant 10 ans. Ils écrivent son nom sur un morceau de poterie (un ostrakon). C'est une décision prise par tout le peuple." },
      source2:{ texte:"L'ostracisme protège la cité contre ceux qui voudraient devenir tyrans. Mais il peut aussi servir à se débarrasser d'un rival, même honnête." },
      contexte:"Un citoyen devient si puissant qu'on le soupçonne de vouloir s'emparer du pouvoir. Le peuple peut voter pour le bannir 10 ans. Que fais-tu de cet outil ?",
      revenuApres:true,
      options:[
        { label:"L'utiliser pour protéger la cité de la tyrannie", effets:{ romanisation:7, stabilite:4, faveur:3 },
          consequence:"Le peuple écarte un ambitieux dangereux. La démocratie se protège elle-même.",
          pourquoi:"Bien utilisé, l'ostracisme est un outil démocratique : c'est le peuple qui se défend contre la tyrannie." },
        { label:"Ne l'utiliser qu'avec prudence, en dernier recours", effets:{ romanisation:3, stabilite:2 },
          consequence:"Tu réserves l'ostracisme aux vrais dangers. Un usage mesuré.",
          pourquoi:"Utilisé avec prudence, l'ostracisme reste un garde-fou sans devenir une arme." },
        { label:"S'en servir pour bannir tes adversaires politiques", effets:{ romanisation:-5, stabilite:-5, faveur:2 },
          consequence:"Tu élimines tes rivaux par le vote. Pratique pour toi, mais la confiance se fissure.",
          pourquoi:"Détourner l'ostracisme pour écarter ses rivaux abîme la démocratie : l'outil se retourne contre elle." }
      ]
    },
    /* ============ ACTE IV — TENIR L'EMPIRE, LA MARCHE VERS LA GUERRE ============ */
    {
      type:"evenement", id:"revolte_alliee", acte:"Acte IV : Tenir l'empire",
      acteIntro:"L'âge d'or brille, mais la domination d'Athènes sur ses alliés pèse de plus en plus. Sparte, inquiète de la puissance d'Athènes, n'est pas loin. Il va falloir tenir l'empire — et bientôt faire la guerre.",
      acteMalus:{ stabilite:-6 }, acteMalusNote:"Les tensions avec les autres cités grecques s'aggravent (paix sociale −6).",
      pressionActe:30,
      controleRome:{ seuil:42, rappel:26, malus:8, faveurRappel:18 },
      perso:"stratege", expr:"severe", ambiance:"danger", nom:"Périclès, le stratège", document:"delos",
      titre:"Une cité alliée se révolte",
      source:{ texte:"L'alliance de Délos est devenue un empire : Athènes commande, perçoit l'argent, et punit les cités qui désobéissent." },
      source2:{ texte:"Écraser une cité révoltée maintient la domination d'Athènes, mais nourrit la haine des autres alliés et inquiète Sparte." },
      contexte:"Lasse de payer et d'obéir, une cité alliée (comme Samos) se révolte contre Athènes. Que fais-tu ?",
      revenuApres:true,
      options:[
        { label:"Écraser la révolte par la force pour tenir l'empire", effets:{ romanisation:-3, stabilite:-8, faveur:5, liberte:-3 }, persistant:{ tresor:4 },
          consequence:"La cité révoltée est matée. L'empire tient et l'argent rentre — mais la peur et la rancune grandissent partout.",
          pourquoi:"Mater les alliés conserve l'empire et ses revenus, mais transforme l'alliance en domination détestée : un pas de plus vers la guerre." },
        { label:"Négocier un accord, en gardant l'alliance", effets:{ romanisation:1, stabilite:3, faveur:-1 }, persistant:{ tresor:-1 },
          consequence:"Tu trouves un compromis. L'alliance survit, plus respectueuse, mais Athènes y perd un peu.",
          pourquoi:"Respecter davantage les alliés apaise les tensions, mais affaiblit la domination (et les revenus) d'Athènes." },
        { label:"Laisser la cité partir librement", effets:{ romanisation:0, stabilite:5, faveur:-6 }, persistant:{ tresor:-5 },
          consequence:"La cité quitte l'alliance. Les tensions baissent, mais d'autres pourraient suivre, et les revenus chutent.",
          pourquoi:"Laisser partir les alliés apaise, mais fait fondre la puissance et les revenus d'Athènes." }
      ]
    },
    {
      type:"evenement", id:"megare", acte:"Acte IV : Tenir l'empire",
      perso:"spartiate", expr:"severe", ambiance:"danger", nom:"Un envoyé de Sparte", document:"sparte",
      titre:"Les tensions avec Sparte",
      source:{ texte:"Athènes peut interdire à la cité de Mégare, alliée de Sparte, de commercer dans tous ses ports. Une façon de montrer sa puissance." },
      source2:{ texte:"Mais Sparte voit dans la puissance grandissante d'Athènes une menace pour toute la Grèce. C'est la vraie cause de la guerre qui vient." },
      contexte:"Sparte et ses alliés voient grandir la puissance d'Athènes avec inquiétude. Athènes pourrait bloquer le commerce d'une cité rivale (Mégare) pour montrer sa force. Que fais-tu ?",
      revenuApres:true,
      options:[
        { label:"Bloquer le commerce de Mégare pour montrer sa force", pression:12, effets:{ romanisation:0, stabilite:-9, faveur:4 },
          consequence:"Athènes étouffe sa rivale. Mais Sparte et ses alliés y voient une provocation : la guerre se rapproche.",
          pourquoi:"Humilier une alliée de Sparte montre la force d'Athènes, mais précipite la guerre du Péloponnèse." },
        { label:"Chercher un compromis avec Sparte", pression:-10, effets:{ romanisation:0, stabilite:6, faveur:-2 },
          consequence:"Tu apaises les tensions. La paix tient encore, au prix d'un peu de fierté.",
          pourquoi:"Négocier avec Sparte retarde la guerre, mais demande à Athènes de modérer son ambition." },
        { label:"Provoquer Sparte ouvertement", pression:22, effets:{ romanisation:0, stabilite:-12, faveur:3 },
          consequence:"Tu défies Sparte. La guerre devient inévitable, et Athènes n'est pas prête à tout encaisser.",
          pourquoi:"Chercher l'affrontement avec la plus grande puissance militaire grecque est imprudent : la guerre éclatera dans les pires conditions." }
      ]
    },
    {
      type:"evenement", id:"guerre", acte:"Acte IV : Tenir l'empire",
      perso:"stratege", expr:"severe", ambiance:"danger", nom:"Périclès, le stratège", document:"sparte",
      titre:"La guerre du Péloponnèse éclate",
      source:{ texte:"Périclès conseille d'éviter la bataille sur terre, où Sparte est invincible. Athènes se protège derrière ses Longs Murs et frappe par la mer." },
      source2:{ texte:"Mais cette stratégie oblige les paysans à abandonner leurs champs et à s'entasser dans la ville. Beaucoup enragent de voir Sparte brûler leurs terres sans réagir." },
      contexte:"La guerre commence (431 av. J.-C.). Sparte a la meilleure armée de terre, Athènes la meilleure flotte. Périclès propose de se protéger derrière les Longs Murs et de compter sur la mer. Acceptes-tu ?",
      revenuApres:true,
      options:[
        { label:"Suivre la stratégie de Périclès : se protéger et compter sur la flotte", pression:6, effets:{ romanisation:2, stabilite:-10, faveur:2, liberte:2 }, persistant:{ tresor:-5 },
          consequence:"Athènes frappe par la mer et évite la bataille terrestre. Mais entasser toute la population derrière les Longs Murs crée une promiscuité dangereuse : la maladie couve.",
          pourquoi:"La stratégie de Périclès protège des Spartiates, mais réfugier toute l'Attique dans la ville surpeuplée provoque bientôt une terrible épidémie de peste : la paix sociale en souffre lourdement." },
        { label:"Affronter Sparte sur terre pour défendre les champs", pression:10, effets:{ romanisation:0, stabilite:-2, faveur:5, liberte:-3 }, persistant:{ tresor:-3 },
          consequence:"Tes hoplites affrontent l'armée spartiate… et sont battus. Le peuple est content d'avoir résisté, mais l'armée souffre.",
          pourquoi:"Affronter Sparte sur son terrain, c'est se mesurer à la meilleure armée grecque : un choix populaire mais dangereux." },
        { label:"Chercher tout de suite une paix avec Sparte", pression:-12, effets:{ romanisation:-2, stabilite:4, faveur:-7, liberte:-5 },
          consequence:"Tu demandes la paix dès le début. La cité est épargnée, mais le peuple crie à la lâcheté.",
          pourquoi:"Demander la paix trop tôt épargne la cité, mais le peuple, fier et belliqueux, n'accepte pas de plier." }
      ]
    },
    {
      type:"evenement", id:"demagogues", acte:"Acte IV : Tenir l'empire",
      perso:"citoyen", expr:"severe", ambiance:"danger", nom:"Un meneur du peuple", document:"pnyx",
      titre:"La peste et les nouveaux meneurs",
      source:{ texte:"Entassée derrière ses murs, la ville est ravagée par une épidémie. Périclès lui-même en meurt. Athènes perd son guide le plus sage." },
      source2:{ texte:"De nouveaux meneurs se font applaudir en promettant la victoire totale et en réclamant des mesures dures. Ils suivent l'humeur de la foule plus que l'intérêt de la cité." },
      contexte:"Une terrible maladie frappe la ville surpeuplée et emporte Périclès. De nouveaux meneurs prennent sa place : des orateurs qui flattent le peuple pour gagner du pouvoir. Comment gouvernes-tu ?",
      revenuApres:true,
      options:[
        { label:"Garder une ligne prudente malgré la colère du peuple", effets:{ romanisation:5, stabilite:3, faveur:-5 },
          consequence:"Tu refuses la surenchère. La cité reste raisonnable, mais le peuple, enragé, te le reproche.",
          pourquoi:"Résister à la flatterie des meneurs protège la cité, mais déçoit un peuple qui veut des victoires immédiates." },
        { label:"Suivre en partie les meneurs pour calmer la foule", effets:{ romanisation:-4, stabilite:-2, faveur:3 },
          consequence:"Tu cèdes un peu à la pression populaire. La foule est contente, la cité un peu moins sage.",
          pourquoi:"Suivre l'humeur de la foule gagne en popularité, mais éloigne des décisions réfléchies." },
        { label:"Flatter le peuple et promettre la victoire totale", pression:8, effets:{ romanisation:-12, stabilite:-4, faveur:7, liberte:-2 },
          consequence:"Tu dis au peuple ce qu'il veut entendre. Il t'acclame — mais la cité fonce vers des décisions dangereuses.",
          pourquoi:"La démagogie — flatter le peuple pour le pouvoir — détourne la démocratie de la raison et prépare les catastrophes." }
      ]
    },
    /* ============ ACTE V — LA CRISE DE LA DÉMOCRATIE ET LA FIN DE L'HÉGÉMONIE ============ */
    {
      type:"evenement", id:"sicile", acte:"Acte V : La fin de l'hégémonie",
      acteIntro:"La guerre s'éternise. Le peuple, fatigué et excité par ses meneurs, est prêt aux paris les plus risqués. La démocratie va vivre sa plus grande épreuve.",
      acteMalus:{ stabilite:-6, faveur:-3 }, acteMalusNote:"La guerre épuise la cité (paix sociale −6, soutien −3).",
      pressionActe:80,
      controleRome:{ seuil:50, rappel:34, malus:9, faveurRappel:22 },
      perso:"citoyen", expr:"content", ambiance:"danger", nom:"Un meneur du peuple",
      titre:"La grande expédition de Sicile",
      source:{ texte:"Des orateurs promettent que la conquête de la lointaine Sicile rendra Athènes maîtresse de toute la Méditerranée. La foule, enthousiaste, rêve de gloire et de butin." },
      source2:{ texte:"D'autres avertissent : la Sicile est très loin, l'expédition coûtera une flotte énorme, et un échec serait désastreux pour Athènes." },
      contexte:"Des meneurs enflamment le peuple : pourquoi ne pas conquérir la riche Sicile ? Gloire et richesses promises… mais c'est loin et risqué. L'assemblée doit décider.",
      revenuApres:true,
      options:[
        { label:"Refuser : c'est trop loin et trop risqué", effets:{ romanisation:6, stabilite:5, faveur:-6 },
          consequence:"Tu retiens la cité. Le peuple, privé de son rêve, est déçu — mais Athènes garde ses forces.",
          pourquoi:"Renoncer à une aventure démesurée est sage : Athènes conserve sa flotte et ses hommes pour la vraie guerre." },
        { label:"Envoyer une expédition prudente et limitée", effets:{ romanisation:1, stabilite:-3, faveur:2 }, persistant:{ tresor:-6 },
          consequence:"Une expédition mesurée part pour la Sicile. Le risque est réel, mais limité.",
          pourquoi:"Une expédition limitée ménage les forces d'Athènes, mais s'engage tout de même dans une aventure lointaine." },
        { label:"Lancer une immense expédition pour conquérir la Sicile", cout:60, pression:12, effets:{ romanisation:-12, stabilite:-16, faveur:6, liberte:-4 }, flag:"desastre_sicile",
          consequence:"Une flotte gigantesque part vers la Sicile… et y est entièrement détruite. Athènes perd des milliers d'hommes et ses navires. Un désastre.",
          pourquoi:"L'expédition de Sicile, poussée par l'orgueil et la flatterie, fut une catastrophe qui brisa la puissance d'Athènes." }
      ]
    },
    {
      type:"evenement", id:"coup", acte:"Acte V : La fin de l'hégémonie",
      perso:"conseiller", expr:"severe", ambiance:"danger", nom:"Démos, ton conseiller", document:"oligarchie",
      titre:"Les riches veulent renverser la démocratie",
      source:{ texte:"Profitant des malheurs de la guerre, des riches s'emparent du pouvoir et suppriment l'assemblée du peuple. Quelques centaines d'hommes décident désormais pour tous." },
      source2:{ texte:"Mais les marins de la flotte, des citoyens pauvres, refusent l'oligarchie et restent fidèles à la démocratie." },
      contexte:"Après le désastre de Sicile, des familles riches profitent du chaos : elles veulent supprimer la démocratie et confier le pouvoir à quelques centaines d'hommes seulement. Que fais-tu ?",
      revenuApres:true,
      options:[
        { label:"Résister et défendre la démocratie", effets:{ romanisation:10, stabilite:-4, faveur:6, liberte:6 },
          consequence:"Avec les marins et le peuple, tu fais échouer le coup. La démocratie est sauvée, mais la cité reste déchirée.",
          pourquoi:"Résister au coup des riches sauve la démocratie : le pouvoir du peuple ne se laisse pas confisquer sans combattre." },
        { label:"Accepter un pouvoir partagé, le temps de la guerre", effets:{ romanisation:-10, stabilite:1, faveur:-4 },
          consequence:"Tu acceptes que quelques-uns décident, « le temps de la guerre ». La démocratie recule.",
          pourquoi:"Confier le pouvoir à quelques-uns, même « temporairement », ouvre la porte à la fin de la démocratie." },
        { label:"Se rallier aux riches et supprimer la démocratie", effets:{ romanisation:-22, stabilite:0, faveur:-10, liberte:-8 },
          consequence:"Tu abandonnes le pouvoir du peuple aux quelques familles riches. L'oligarchie l'emporte.",
          pourquoi:"Supprimer la démocratie pour rejoindre les riches, c'est trahir tout ce que la cité a construit depuis Clisthène." }
      ]
    },
    {
      type:"evenement", id:"defaite", acte:"Acte V : La fin de l'hégémonie",
      perso:"spartiate", expr:"severe", ambiance:"solennel", nom:"Le vainqueur spartiate", document:"sparte",
      titre:"La défaite face à Sparte",
      source:{ texte:"Après des années de guerre, la flotte d'Athènes est détruite. Sparte bloque la ville, où la faim s'installe." },
      source2:{ texte:"Sparte impose ses conditions : abattre les Longs Murs et accepter un gouvernement de quelques hommes, les Trente, soumis à Sparte." },
      contexte:"Épuisée, Athènes a perdu sa dernière flotte. Sparte assiège la ville affamée. Se battre jusqu'au bout, ou se rendre ?",
      revenuApres:true,
      options:[
        { label:"Se rendre pour épargner la population, en gardant l'espoir", effets:{ romanisation:-3, stabilite:4, faveur:0, liberte:-8 },
          consequence:"Athènes se rend. C'est la fin de sa domination. Mais la cité et son peuple survivent — l'avenir reste ouvert.",
          pourquoi:"Se rendre pour sauver la population met fin à l'hégémonie d'Athènes, mais préserve la cité et la possibilité d'un retour." },
        { label:"Résister jusqu'au dernier, malgré la faim", effets:{ romanisation:-3, stabilite:-16, faveur:-7, liberte:-2 },
          consequence:"La ville résiste dans la famine et la souffrance. La reddition n'en sera que plus dure.",
          pourquoi:"Résister sans flotte ni vivres ne fait qu'aggraver les souffrances : la défaite est inévitable." },
        { label:"Tout accepter de Sparte sans condition", effets:{ romanisation:-16, stabilite:1, faveur:-7, liberte:-25 }, finImposee:"soumission",
          consequence:"Tu acceptes tout, même les Trente Tyrans imposés par Sparte. La démocratie est abolie.",
          pourquoi:"Accepter sans réserve le gouvernement imposé par Sparte, c'est laisser écraser la démocratie." }
      ]
    },
    {
      type:"evenement", id:"restauration", acte:"Acte V : La fin de l'hégémonie",
      perso:"citoyen", expr:"severe", ambiance:"solennel", nom:"Un citoyen d'Athènes", document:"pnyx",
      titre:"Rétablir la démocratie",
      source:{ texte:"Les Trente, soutenus par Sparte, gouvernent par la violence et tuent leurs adversaires. Beaucoup d'Athéniens fuient en exil." },
      source2:{ texte:"Des exilés démocrates reviennent en armes, renversent les Trente et rétablissent la démocratie dès l'année suivante. L'idée du pouvoir du peuple survit à la défaite." },
      contexte:"Sparte a imposé un gouvernement de quelques hommes, les Trente, qui gouvernent par la peur. Des Athéniens en exil veulent les renverser et rétablir la démocratie. Les soutiens-tu ?",
      revenuApres:true,
      options:[
        { label:"Renverser les Trente et rétablir la démocratie", effets:{ romanisation:14, stabilite:6, faveur:8, liberte:14 },
          consequence:"Le peuple chasse les Trente et rétablit la démocratie. Athènes a perdu son empire, mais pas son idéal : le pouvoir du peuple renaît.",
          pourquoi:"Même vaincue militairement, Athènes rétablit sa démocratie : l'expérience devient un modèle qui traversera les siècles." },
        { label:"Accepter un régime mixte, prudent", effets:{ romanisation:4, stabilite:4, faveur:1 },
          consequence:"Un compromis : un peu de démocratie, un peu de prudence. La cité se relève doucement.",
          pourquoi:"Un régime prudent ramène l'ordre, mais sans retrouver toute la force de la démocratie d'avant." },
        { label:"Laisser les Trente au pouvoir pour éviter de nouveaux troubles", effets:{ romanisation:-18, stabilite:-6, faveur:-11, liberte:-12 },
          consequence:"Tu laisses les Trente écraser la cité. La démocratie athénienne s'éteint.",
          pourquoi:"Renoncer à rétablir la démocratie, c'est laisser mourir la première grande expérience démocratique de l'histoire." }
      ]
    }
  ],

  revenu:{ socle:8, parRomanisation:0.18, seuil:45, facteurInstable:0.5, texte:"L'argent de la cité" },

  /* Choix qui ne respectent pas l'information des documents : { idÉtape : { indiceOption : note } }.
     PREMIÈRE PASSE — à réviser selon ton jugement. */
  docAlerts:{
    dettes:{ 2:"Le document montrait que libérer les pauvres de leurs dettes (Solon) a aidé à faire naître la démocratie : tout laisser comme avant allait à l'encontre de cela." },
    vote:{ 2:"Le document rappelait que la démocratie donne la parole aux citoyens : garder le pouvoir aux familles riches, c'était l'oligarchie." },
    clisthene:{ 2:"Le document montrait que la réforme de Clisthène a fait naître la démocratie : la refuser empêchait le pouvoir du peuple." },
    ecclesia:{ 2:"Le document montrait que c'est l'assemblée du peuple qui décide dans une démocratie : laisser les familles riches décider allait à l'encontre de cela." },
    marathon:{ 2:"Le document montrait des citoyens-soldats prêts à défendre Athènes : se soumettre aux Perses, c'était abandonner leur liberté." },
    flotte:{ 2:"Les documents montraient que la flotte, ramée par les pauvres, renforçait la cité et la démocratie : y renoncer affaiblissait Athènes." },
    salamine:{ 2:"Le document montrait que la flotte et l'union des Grecs sauvaient la cité : se soumettre, c'était perdre la liberté." },
    delos:{ 1:"Le second document avertissait qu'une alliance transformée en empire fâcherait Sparte et mènerait un jour à la guerre." },
    misthos:{ 2:"Le document montrait que sans indemnité les pauvres ne peuvent pas participer : ne rien payer gardait la démocratie réservée aux riches." },
    parthenon:{ 0:"Le second document avertissait que prendre l'argent des alliés les révolterait : financer la gloire d'Athènes avec leur tribut préparait la guerre." },
    propylees:{ 2:"Le document montrait que ces grands travaux emploient le peuple et font la gloire d'Athènes : ne rien faire privait la cité de son âge d'or." },
    sculpteurs:{ 2:"Le document montrait que les arts font rayonner Athènes et vivre ses artisans : ne rien dépenser pour l'art lui faisait perdre son prestige." },
    agora:{ 2:"Le document montrait que l'Agora est le cœur de la vie publique : la laisser se dégrader nuisait à la démocratie et au commerce." },
    longs_murs:{ 2:"Le document avertissait que sans lien fortifié vers le Pirée, un siège pouvait affamer Athènes : ne rien construire la laissait vulnérable." },
    piree:{ 2:"Les documents montraient que les métèques font la richesse d'Athènes : limiter les étrangers privait la cité de cette prospérité." },
    ostracisme:{ 2:"Le document avertissait que l'ostracisme peut servir à éliminer des rivaux honnêtes : t'en servir contre tes adversaires en abusait." },
    revolte_alliee:{ 0:"Les documents montraient qu'écraser les alliés nourrit la haine et inquiète Sparte : la force seule préparait la guerre." },
    megare:{ 0:"Le document de Thucydide montrait que provoquer Sparte précipitait la guerre : bloquer Mégare allait dans ce sens.", 2:"Provoquer Sparte ouvertement, c'était foncer vers la guerre que les documents annonçaient." },
    guerre:{ 1:"Le document montrait que Sparte était invincible sur terre : l'affronter en bataille rangée menait à la défaite." },
    demagogues:{ 2:"Le document avertissait que les meneurs suivaient l'humeur de la foule plus que l'intérêt de la cité : les flatter détournait la démocratie." },
    sicile:{ 2:"Le second document avertissait qu'une expédition lointaine et démesurée serait un désastre : la lancer en grand ignorait cet avertissement." },
    coup:{ 1:"Confier le pouvoir à quelques-uns, même « temporairement », allait vers la fin de la démocratie que défendait le document.", 2:"Le document montrait que les marins du peuple refusaient l'oligarchie : t'y rallier trahissait la démocratie." },
    defaite:{ 1:"Le document montrait qu'Athènes n'avait plus de flotte ni de vivres : résister jusqu'au bout n'aggravait que les souffrances.", 2:"Le second document montrait que Sparte voulait abolir la démocratie : tout accepter sans réserve la laissait écraser." },
    restauration:{ 2:"Le second document montrait que les démocrates renversèrent les Trente et rétablirent la démocratie : laisser les Trente au pouvoir éteignait cette renaissance." }
  },

  /* Niveaux de difficulté. seuilRevolte = paix sociale sous laquelle la cité se déchire ;
     seuilPaix = paix à retrouver pour la calmer. À AJUSTER selon tes groupes. */
  difficultes:{
    defaut:"stratege", ordre:["apprenti","stratege","pericles"],
    apprenti:{ nom:"Apprenti", sous:"Pour découvrir, grande marge d'erreur",
      seuilRevolte:12, seuilPaix:28, attenuation:0.8, bleed:0, revenuMod:1.2, malusActeMod:0.5 },
    stratege:{ nom:"Stratège", sous:"L'expérience équilibrée",
      seuilRevolte:22, seuilPaix:40, attenuation:0.6, bleed:1, revenuMod:1, malusActeMod:1 },
    pericles:{ nom:"Périclès", sous:"Pour les plus aguerris",
      seuilRevolte:34, seuilPaix:50, attenuation:0.4, bleed:2, revenuMod:0.8, malusActeMod:1.3 }
  },

  echecs:{
    stabilite:{ perso:"citoyen", expr:"severe", ambiance:"danger", titre:"La cité se déchire", rang:{ niveau:"sombre", nom:"Cité déchirée" },
      texte:"La paix entre les habitants s'est effondrée : la cité sombre dans la révolte et la violence. Gouverner Athènes, c'est d'abord éviter que la cité ne se déchire." },
    romanisation:{ perso:"stratege", expr:"severe", ambiance:"solennel", titre:"Le retour de l'oligarchie", rang:{ niveau:"sombre", nom:"Retour de l'oligarchie" },
      texte:"Tu n'as pas assez donné de pouvoir au peuple. Quelques familles riches reprennent le contrôle d'Athènes : la démocratie n'a pas pris. Ta mission était de bâtir le pouvoir du peuple." },
    faveur:{ perso:"citoyen", expr:"severe", ambiance:"solennel", titre:"Chassé par le peuple", rang:{ niveau:"sombre", nom:"Stratège déchu" },
      texte:"Les citoyens n'ont plus confiance en toi. Le peuple te retire le pouvoir et te chasse de la cité. À Athènes, c'est le peuple qui décide — même de ton sort." },
    tresor:{ perso:"stratege", expr:"severe", ambiance:"danger", titre:"Athènes ruinée", rang:{ niveau:"sombre", nom:"Cité ruinée" },
      texte:"Le trésor est vide. Sans argent, Athènes ne peut plus payer les rameurs de sa flotte, acheter du grain ni défendre ses murs : privée de moyens, la cité s'effondre. À Athènes, la puissance — et la démocratie qu'elle nourrissait — reposaient sur les ressources de la cité et de son empire." },
    soumission:{ perso:"stratege", expr:"severe", ambiance:"solennel", titre:"Athènes soumise", rang:{ niveau:"sombre", nom:"Cité soumise" },
      texte:"En se soumettant à une puissance étrangère, Athènes renonce à sa liberté. Or la démocratie repose sur des citoyens libres : sans indépendance, il n'y a plus de pouvoir du peuple. La cité-État libre cesse d'exister, et la partie s'arrête là." }
  },

  bilans:[
    { si:{ romanisation:82, stabilite:48, faveur:48 }, perso:"stratege", expr:"content", ambiance:"solennel",
      rang:{ niveau:"or", nom:"Modèle démocratique" },
      titre:"La démocratie modèle, un héritage pour les siècles",
      texte:"Tu as donné le pouvoir au peuple, traversé les guerres et la crise sans laisser mourir la démocratie. Vaincue ou non sur les champs de bataille, Athènes lègue au monde sa grande invention : le pouvoir du peuple. Ton nom restera." },
    { si:{ romanisation:60, stabilite:38, faveur:38 }, perso:"conseiller", expr:"content", ambiance:"jour",
      rang:{ niveau:"argent", nom:"Démocratie accomplie" },
      titre:"Une expérience qui marque l'histoire",
      texte:"La démocratie athénienne a fleuri et, malgré les épreuves et la défaite, l'idée du pouvoir du peuple survit. Quelques fractures demeurent, mais l'essentiel a tenu." },
    { si:{ romanisation:36 }, perso:"conseiller", expr:"neutre", ambiance:"jour",
      rang:{ niveau:"bronze", nom:"Démocratie fragile" },
      titre:"Une démocratie fragile",
      texte:"Le peuple a goûté au pouvoir, mais l'expérience est restée fragile : tu as parfois reculé, cédé à la démagogie et laissé la cité se déchirer." },
    { si:{}, perso:"citoyen", expr:"severe", ambiance:"jour",
      rang:{ niveau:"sombre", nom:"L'oligarchie l'emporte" },
      titre:"L'oligarchie l'emporte",
      texte:"Le pouvoir du peuple n'a pas tenu. Écrasée par la guerre et reprise par quelques familles riches, la démocratie athénienne s'est éteinte." }
  ]
};
