/* =========================================================================
   LEGATUS, moteur de simulation, scène « bande dessinée »
   Boucle : un personnage présente une situation (bulle) → tu décides →
   il réagit, les jauges bougent → suite. Sans dépendance.
   ========================================================================= */
(function(){
  "use strict";
  var G = window.STRATEGE;

  // icônes des jauges (SVG inline)
  var ICONES = {
    temple:'<g fill="#3A2E26"><path d="M2.5 9 L12 3 L21.5 9 Z"/><rect x="3.5" y="9.4" width="17" height="2.2"/><rect x="4.5" y="12" width="2.4" height="6.6"/><rect x="8.6" y="12" width="2.4" height="6.6"/><rect x="13" y="12" width="2.4" height="6.6"/><rect x="17.1" y="12" width="2.4" height="6.6"/><rect x="3" y="18.8" width="18" height="2.4"/></g>',
    bouclier:'<path d="M6 3 H18 Q19 3 19 5 V13 Q19 18 12 21 Q5 18 5 13 V5 Q5 3 6 3 Z" fill="#3A2E26"/><circle cx="12" cy="12" r="2.6" fill="#F2E7CF"/><path d="M12 5 V19 M6 12 H18" stroke="#F2E7CF" stroke-width="1.1"/>',
    laurier:'<g fill="#3A2E26"><path d="M12 22 C9 19 7.5 14 8 8" stroke="#3A2E26" stroke-width="1.4" fill="none"/><path d="M12 22 C15 19 16.5 14 16 8" stroke="#3A2E26" stroke-width="1.4" fill="none"/><ellipse cx="7" cy="9" rx="2.6" ry="1.4" transform="rotate(-50 7 9)"/><ellipse cx="7.4" cy="12.5" rx="2.6" ry="1.4" transform="rotate(-40 7.4 12.5)"/><ellipse cx="8.6" cy="16" rx="2.6" ry="1.4" transform="rotate(-32 8.6 16)"/><ellipse cx="10" cy="19" rx="2.6" ry="1.4" transform="rotate(-26 10 19)"/><ellipse cx="17" cy="9" rx="2.6" ry="1.4" transform="rotate(50 17 9)"/><ellipse cx="16.6" cy="12.5" rx="2.6" ry="1.4" transform="rotate(40 16.6 12.5)"/><ellipse cx="15.4" cy="16" rx="2.6" ry="1.4" transform="rotate(32 15.4 16)"/><ellipse cx="14" cy="19" rx="2.6" ry="1.4" transform="rotate(26 14 19)"/><circle cx="12" cy="6.5" r="1.7"/></g>',
    piece:'<circle cx="12" cy="12" r="9" fill="#3A2E26"/><circle cx="12" cy="12" r="6.4" fill="none" stroke="#F2E7CF" stroke-width="1.1"/><path d="M13.5 8.5 C10 8 9.5 11 12 11.6 C14.5 12.2 14 15.4 10.6 15" fill="none" stroke="#F2E7CF" stroke-width="1.3" stroke-linecap="round"/>'
  };

  var etat, flags, persistants, idx, enRevolte, criseTresor, faillite, finForcee, axesPrec, finie, DIFF;
  var GEN_VERROU=0;   // jeton de génération : invalide un compte à rebours quand la scène change
  var journal=[];     // journal du mandat : une entrée par décision (pour le bilan de fin)
  var aConnuRevolte=false;  // au moins une révolte a éclaté durant le mandat ?

  // pont vers la trame sonore (sans planter si l'audio est indisponible)
  function son(m,a,b){ try{ var A=window.AudioStratege; if(A&&A[m]) A[m](a,b); }catch(e){} }
  function etatSonore(){ return { enRevolte:enRevolte, idx:idx, total:(G.etapes?G.etapes.length:1) }; }

  function diffDefaut(){
    return (G.difficultes && G.difficultes[G.difficultes.defaut||"legat"]) ||
           { nom:"Légat", seuilRevolte:30, seuilPaix:42, attenuation:0.5, bleed:2, revenuMod:1, malusActeMod:1 };
  }
  function init(){ etat=Object.assign({},G.etatInitial); flags={}; persistants=[]; idx=0; enRevolte=false; criseTresor=false; faillite=false; finForcee=null; axesPrec=null; finie=false; journal=[]; aConnuRevolte=false; if(!DIFF)DIFF=diffDefaut(); }

  function el(s){ return document.querySelector(s); }
  function creer(t,c,h){ var n=document.createElement(t); if(c)n.className=c; if(h!=null)n.innerHTML=h; return n; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];}); }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function classeSeuil(v){ return v>=50?"ok":(v>=25?"moyen":"bas"); }
  function persoSrc(role,expr){ return "assets/img/perso/"+role+"-"+expr+".svg"; }
  function docSrc(d){ return "assets/img/"+d+".svg"; }
  var DOCLEG = { acropole:"L'Acropole d'Athènes", pnyx:"L'assemblée du peuple", mines:"Les mines d'argent du Laurion", marathon:"La bataille de Marathon", delos:"L'alliance des cités", commerce:"Le commerce au Pirée", ostracisme:"L'ostracisme", sparte:"Sparte et ses alliés", oligarchie:"Le pouvoir de quelques-uns", remparts:"Les Longs Murs vers le Pirée", agora:"L'Agora d'Athènes", sculpteurs:"Les sculpteurs d'Athènes" };

  function bilanRevenu(){
    var commerce=0, entretien=0;
    persistants.forEach(function(p){ var v=(p&&p.tresor)||0; if(v>=0) commerce+=v; else entretien+=v; });
    // Impôts : l'assiette croît avec la romanisation (province urbanisée, monétarisée) ;
    // la stabilité fait office de facteur de perception. Révolte = impôts suspendus.
    var base;
    if(enRevolte){ base=0; }
    else {
      var assiette = (G.revenu.socle||0) + etat.romanisation*(G.revenu.parRomanisation||0);
      var facteur = (etat.stabilite>=G.revenu.seuil) ? 1 : (G.revenu.facteurInstable!=null?G.revenu.facteurInstable:0.5);
      base = Math.round(assiette*facteur*(DIFF.revenuMod||1));
    }
    if(enRevolte) commerce=0;            // commerce paralysé par la révolte ; l'entretien continue de peser
    return { base:base, commerce:commerce, entretien:entretien, net:base+commerce+entretien };
  }
  function revenuActuel(){ if(!DIFF) return 0; return bilanRevenu().net; }

  /* ---------- jauges ---------- */
  function rendreJauges(deltas){
    var b=el("#jauges"); b.innerHTML="";
    if(enRevolte) b.appendChild(creer("div","revolte-banner","\u2694 La cité est déchirée : les progrès s'arrêtent et l'argent ne rentre plus"));
    if(criseTresor) b.appendChild(creer("div","revolte-banner","\u26A0 Trésor vide : la cité ne peut plus payer sa flotte ni son grain"));
    if(!finie && etat.pressionSparte>0) b.appendChild(banniereSparte(etat.pressionSparte));
    G.jauges.forEach(function(j){
      var v=etat[j.id];
      var carte=creer("div","jauge");
      carte.appendChild(creer("div","ic",'<svg viewBox="0 0 24 24">'+(ICONES[j.icone]||"")+'</svg>'));
      var corps=creer("div","jauge-corps");
      var haut=creer("div","jauge-haut");
      haut.appendChild(creer("span","jauge-nom",esc(j.nom)));
      var val=creer("span","jauge-val",esc(j.type==="res"?(v+" dr."):(v)));
      if(deltas&&deltas[j.id]){ var d=deltas[j.id]; val.appendChild(creer("span","delta "+(d>0?"plus":"moins"),(d>0?"+":"")+d)); }
      haut.appendChild(val); corps.appendChild(haut);
      var rail=creer("div","rail"); var fill=creer("div","fill");
      fill.style.width=(j.type==="res"?clamp(v/300*100,0,100):v)+"%";
      fill.classList.add(j.couleur==="seuil"?classeSeuil(v):j.couleur);
      rail.appendChild(fill); corps.appendChild(rail);
      if(j.id==="tresor"){
        var r=revenuActuel();
        var txt=(r>=0?"+"+r:""+r)+" dr. / tour"+(enRevolte?" (crise)":"");
        corps.appendChild(creer("div","jauge-revenu"+(r<=0?" nul":""), txt));
      }
      carte.appendChild(corps); b.appendChild(carte);
    });
  }

  /* ---------- pression de Sparte (climax des actes IV-V) ---------- */
  function banniereSparte(p){
    p=clamp(p,0,100);
    var niv = p>=78 ? "haut" : (p>=45 ? "moyen" : "bas");
    var note = niv==="haut" ? "Sparte est aux portes d'Athènes — l'assaut est imminent"
             : niv==="moyen" ? "La guerre du Péloponnèse fait rage"
             : "Sparte surveille la puissance d'Athènes";
    var box=creer("div","menace-sparte niv-"+niv);
    var tete=creer("div","menace-tete");
    tete.appendChild(creer("span","menace-ic","\u039B"));
    tete.appendChild(creer("span","menace-titre","Pression de Sparte"));
    tete.appendChild(creer("span","menace-pct",Math.round(p)+" %"));
    box.appendChild(tete);
    var rail=creer("div","menace-rail"); var fill=creer("div","menace-fill"); fill.style.width=p+"%";
    rail.appendChild(fill); box.appendChild(rail);
    box.appendChild(creer("div","menace-note",esc(note)));
    return box;
  }

  /* ---------- indicateurs de trajectoire (sous les décisions) ---------- */
  // Deux axes de lecture : régime (oligarchie ↔ démocratie) et indépendance (soumission ↔ liberté).
  function unAxe(gauche, droite, valStart, cls){
    var a=creer("div","axe");
    var poles=creer("div","axe-poles");
    poles.appendChild(creer("span","axe-pole-g",esc(gauche)));
    poles.appendChild(creer("span","axe-pole-d",esc(droite)));
    a.appendChild(poles);
    var rail=creer("div","axe-rail "+cls);
    var marq=creer("div","axe-marqueur");
    marq.style.transition="none";                 // on anime en JS, pas par transition CSS
    marq.style.left=clamp(valStart,0,100)+"%";
    rail.appendChild(marq); a.appendChild(rail);
    return { node:a, marq:marq };
  }
  // Glissement maison, image par image : indépendant des transitions CSS
  // (donc insensible au réglage « réduire les animations » qui désactive les transitions).
  function glisser(marq, from, to, duree){
    from=clamp(from,0,100); to=clamp(to,0,100);
    marq.style.left=from+"%";
    var t0=null;
    function step(ts){
      if(!marq.isConnected) return;               // marqueur remplacé par une nouvelle décision
      if(t0===null) t0=ts;
      var p=Math.min(1,(ts-t0)/duree);
      marq.style.left=(from+(to-from)*p).toFixed(2)+"%";
      if(p<1) requestAnimationFrame(step);
    }
    // court délai pour que la décision s'affiche, puis glissement sur toute la durée de lecture
    setTimeout(function(){ requestAnimationFrame(step); }, 180);
  }
  function rendreAxes(ms){
    var curRom=etat.romanisation, curLib=(etat.liberte!=null?etat.liberte:50);
    // départ à la dernière position affichée, pour que le curseur glisse jusqu'à la nouvelle
    var startRom=axesPrec?axesPrec.rom:curRom, startLib=axesPrec?axesPrec.lib:curLib;
    var box=creer("div","axes");
    box.appendChild(creer("div","axes-tete","Où mène ton gouvernement ?"));
    var d=unAxe("Oligarchie","Démocratie", startRom, "dem");
    var l=unAxe("Soumission","Liberté", startLib, "lib");
    box.appendChild(d.node); box.appendChild(l.node);
    var duree=(typeof ms==="number" && ms>0) ? ms : 0;
    if(duree>0 && startRom!==curRom) glisser(d.marq, startRom, curRom, duree);
    else d.marq.style.left=clamp(curRom,0,100)+"%";
    if(duree>0 && startLib!==curLib) glisser(l.marq, startLib, curLib, duree);
    else l.marq.style.left=clamp(curLib,0,100)+"%";
    axesPrec={ rom:curRom, lib:curLib };
    return box;
  }

  /* ---------- effets ---------- */
  function appliquer(eff){ var d={}; Object.keys(eff||{}).forEach(function(k){ var a=etat[k];
    etat[k]=(k==="tresor")?Math.max(0,etat[k]+eff[k]):clamp(etat[k]+eff[k],0,100); d[k]=etat[k]-a; }); return d; }
  function fusion(a,b){ var r=Object.assign({},a); Object.keys(b||{}).forEach(function(k){ r[k]=(r[k]||0)+b[k]; }); return r; }
  function gameOver(){ if(faillite)return "tresor"; if(etat.stabilite<=0)return "stabilite"; if(etat.faveur<=0)return "faveur"; if(etat.romanisation<=0)return "romanisation"; if(etat.liberte<=0)return "soumission"; return null; }
  function estPositif(d){ var s=0; Object.keys(d).forEach(function(k){ if(k!=="tresor")s+=d[k]; }); return s>=0; }

  /* ---------- révolte (niveau de difficulté) ---------- */
  // Une province en révolte freine les gains de Romanisation et de Faveur.
  // La Stabilité reste pleinement réactive : c'est le levier pour sortir de la révolte.
  function attenuer(eff){
    var r=Object.assign({},eff);
    ["romanisation","faveur"].forEach(function(k){ if(r[k]>0) r[k]=Math.round(r[k]*DIFF.attenuation); });
    return r;
  }
  function scaleMalus(m){ var r={}; Object.keys(m||{}).forEach(function(k){ r[k]=Math.round(m[k]*(DIFF.malusActeMod||1)); }); return r; }
  function ajoute(deltas,d){ Object.keys(d).forEach(function(k){ deltas[k]=(deltas[k]||0)+d[k]; }); }
  // Met à jour l'état de révolte d'après la stabilité courante ; renvoie le message à afficher.
  function majRevolte(deltas){
    if(!enRevolte && etat.stabilite < DIFF.seuilRevolte){
      enRevolte=true; aConnuRevolte=true; ajoute(deltas, appliquer({faveur:-5}));
      return "\u2694 La cité se déchire ! Tant que dure la crise, la démocratie et le soutien du peuple n'avancent plus et l'argent ne rentre plus. Ramène la paix (\u2265 "+DIFF.seuilPaix+") pour calmer la cité.";
    }
    if(enRevolte && etat.stabilite >= DIFF.seuilPaix){
      enRevolte=false; return "\u2714 La paix revient dans la cité : tout repart.";
    }
    if(enRevolte){
      ajoute(deltas, appliquer({stabilite:-(DIFF.bleed||0)}));
      return "\u2694 La cité gronde encore… Ramène la paix (\u2265 "+DIFF.seuilPaix+") pour l'apaiser.";
    }
    return "";
  }

  // Met à jour la crise du trésor d'après le trésor courant ; renvoie le message à afficher.
  // Trésor vide = la cité ne peut plus payer ses rameurs ni acheter du grain : choc immédiat,
  // puis effondrement (faillite) si elle ne se renfloue pas au tour suivant.
  function majTresor(deltas){
    if(etat.tresor<=0){
      if(!criseTresor){
        criseTresor=true;
        ajoute(deltas, appliquer({stabilite:-12, faveur:-8}));
        return "\u26A0 Le tr\u00e9sor est vide : la cit\u00e9 ne peut plus payer ses rameurs ni acheter de grain. Renfloue-le, sinon Ath\u00e8nes s'effondrera.";
      }
      faillite=true;
      return "\u2716 Ruin\u00e9e, Ath\u00e8nes ne peut plus se d\u00e9fendre ni se nourrir : la cit\u00e9 s'effondre.";
    }
    if(criseTresor){
      criseTresor=false;
      return "\u2714 Le tr\u00e9sor se renfloue : la cit\u00e9 \u00e9carte la faillite.";
    }
    return "";
  }
  function rendreScene(o){
    // o : {perso, expr, ambiance, nom, texte, alerte, document, docs[], html}
    var scene=el("#scene"); scene.innerHTML="";
    var row=creer("div","scene-doc");
    var sc=creer("div","case "+(o.ambiance||"jour"));
    sc.style.backgroundImage="url('assets/img/decor-agora.svg')";
    var img=document.createElement("img"); img.className="perso entre"; img.alt=o.nom||"";
    img.src=persoSrc(o.perso||"conseiller", o.expr||"neutre");
    sc.appendChild(img);
    var bulle=creer("div","bulle");
    if(o.nom) bulle.appendChild(creer("div","qui",esc(o.nom)));
    bulle.appendChild(creer("div","dit", esc(o.texte)+(o.alerte?'<span class="alerte"> '+esc(o.alerte)+'</span>':"")));
    sc.appendChild(bulle);
    if(o.document){
      sc.classList.add("avec-vignette");
      var dv=creer("div","doc-vignette");
      dv.innerHTML='<img src="'+docSrc(o.document)+'" alt=""><div class="leg">'+esc(DOCLEG[o.document]||"")+'</div>';
      sc.appendChild(dv);
    }
    row.appendChild(sc);
    if(o.docs && o.docs.length){
      var col=creer("div","docs");
      col.appendChild(creer("div","docs-tete","\uD83D\uDCDC Documents \u00e0 consulter"));
      o.docs.forEach(function(d,k){
        var src=creer("div","source");
        src.appendChild(creer("div","src-tete",(d.tete||("Document "+(k+1)))));
        src.appendChild(creer("div","src-txt",esc(d.texte)));
        if(d.ref) src.appendChild(creer("div","src-ref",esc(d.ref)));
        col.appendChild(src);
      });
      row.appendChild(col);
    }
    scene.appendChild(row);
    if(o.html) scene.appendChild(o.html);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  /* ---------- couronne de laurier (pleine) ---------- */
  function couronne(){
    var cx=75, cy=64, R=52, n=11, s='<svg viewBox="0 0 150 132" class="couronne" aria-hidden="true">';
    for(var side=-1; side<=1; side+=2){
      for(var i=0;i<n;i++){
        var deg=205-i*(130/(n-1)), rad=deg*Math.PI/180;
        var lx=cx+side*Math.cos(rad)*R, ly=cy-Math.sin(rad)*R;
        var ang=(side===1)?(deg-90):(90-deg);
        s+='<ellipse cx="'+lx.toFixed(1)+'" cy="'+ly.toFixed(1)+'" rx="11" ry="4.6" fill="#cdb24e" stroke="#9a7d2e" stroke-width="1" transform="rotate('+ang.toFixed(0)+' '+lx.toFixed(1)+' '+ly.toFixed(1)+')"/>';
        if(i%3===1){ var bx=cx+side*Math.cos(rad)*(R-12), by=cy-Math.sin(rad)*(R-12); s+='<circle cx="'+bx.toFixed(1)+'" cy="'+by.toFixed(1)+'" r="2.4" fill="#E8C766"/>'; }
      }
    }
    s+='<path d="M'+(cx-20)+' '+(cy+R-6)+' C'+(cx-8)+' '+(cy+R+6)+' '+(cx+8)+' '+(cy+R+6)+' '+(cx+20)+' '+(cy+R-6)+'" fill="none" stroke="#cdb24e" stroke-width="3.5" stroke-linecap="round"/>';
    return s+'</svg>';
  }
  var COUL_JAUGE={ temple:"pourpre", bouclier:"olive", laurier:"bronze", piece:"tresor" };

  /* ---------- accueil : présentation + difficulté ---------- */
  function choisirDifficulte(){
    el("#jauges").innerHTML="";
    var scene=el("#scene"); scene.innerHTML="";
    var A=G.accueil||{};
    var page=creer("div","accueil");

    // hero illustré (bannière façon bande dessinée)
    var hero=creer("div","acc-hero");
    hero.innerHTML=
      '<img class="acc-perso" src="assets/img/perso/conseiller-neutre.svg" alt="">'+
      '<div class="acc-titrebloc">'+
        '<div class="acc-couronne">'+couronne()+'</div>'+
        '<h1 class="acc-titre">'+esc(A.titre||G.titre||"Legatus")+'</h1>'+
        '<div class="acc-regle"></div>'+
        '<div class="acc-plaque">'+
          (A.sousTitre?'<div class="acc-sous">'+esc(A.sousTitre)+'</div>':'')+
          (A.accroche?'<p class="acc-accroche">'+esc(A.accroche)+'</p>':'')+
        '</div>'+
      '</div>';
    page.appendChild(hero);

    // bandeau des jauges (aperçu du tableau de bord)
    if(A.jaugesAide){
      var hud=creer("div","acc-hud");
      A.jaugesAide.forEach(function(j){
        var t=creer("div","acc-tuile "+(COUL_JAUGE[j.icone]||"bronze"));
        t.innerHTML='<span class="acc-tic"><svg viewBox="0 0 24 24">'+(ICONES[j.icone]||"")+'</svg></span>'+
          '<span class="acc-tt"><strong>'+esc(j.nom)+'</strong><span>'+esc(j.txt)+'</span></span>';
        hud.appendChild(t);
      });
      page.appendChild(hud);
    }

    // comment ça marche + contexte pédagogique (deux colonnes)
    var cols=creer("div","acc-cols");
    if(A.etapesAide){
      var sec=creer("div","acc-section");
      sec.appendChild(creer("div","acc-sec-titre",esc(A.commentTitre||"Comment ça marche")));
      var corps=creer("div","acc-corps");
      var ul=creer("ul","acc-liste");
      A.etapesAide.forEach(function(s){ var li=document.createElement("li"); li.textContent=s; ul.appendChild(li); });
      corps.appendChild(ul); sec.appendChild(corps);
      cols.appendChild(sec);
    }
    if(A.pedago){
      var sp=creer("div","acc-section acc-pedago");
      sp.appendChild(creer("div","acc-sec-titre",esc(A.pedagoTitre||"Contexte pédagogique")));
      var corpsp=creer("div","acc-corps");
      var ulp=creer("ul","acc-liste");
      A.pedago.forEach(function(s){ var li=document.createElement("li"); li.textContent=s; ulp.appendChild(li); });
      corpsp.appendChild(ulp); sp.appendChild(corpsp);
      cols.appendChild(sp);
    }
    if(cols.childNodes.length) page.appendChild(cols);

    // difficulté
    if(G.difficultes){
      var box=creer("div","difficulte");
      box.appendChild(creer("div","diff-titre",esc(A.diffTitre||"Choisis ton niveau de difficulté")));
      box.appendChild(creer("div","diff-intro","Plus le niveau est élevé, plus la cité se déchire tôt. Une crise freine la démocratie et le soutien du peuple et coupe les rentrées d'argent : il faut ramener la paix avant tout."));
      var grille=creer("div","diff-grille");
      (G.difficultes.ordre||["legat"]).forEach(function(key){
        var dd=G.difficultes[key]; if(!dd)return;
        var c=creer("button","diff-carte"); c.type="button";
        c.innerHTML='<div class="diff-nom">'+esc(dd.nom)+'</div>'+
                    '<div class="diff-sous">'+esc(dd.sous||"")+'</div>'+
                    '<div class="diff-detail">Révolte sous '+dd.seuilRevolte+' de stabilité</div>';
        c.addEventListener("click",function(){ DIFF=dd; son("demarrer"); intro(); });
        grille.appendChild(c);
      });
      box.appendChild(grille);
      page.appendChild(box);
    } else {
      var act=creer("div","actions"); act.style.justifyContent="center";
      var b=creer("button","btn btn-primaire","Commencer"); b.addEventListener("click",function(){ son("demarrer"); intro(); });
      act.appendChild(b); page.appendChild(act);
    }

    scene.appendChild(page);
    document.body.classList.add("ecran-depart");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  /* ---------- intro ---------- */
  function intro(){
    document.body.classList.remove("ecran-depart");
    init(); rendreJauges();
    var I=G.intro;
    var bas=creer("div","intro-bas");
    bas.appendChild(creer("div","kicker","Ath\u00e8nes \u00b7 au nom du peuple"));
    bas.appendChild(creer("div","titre-acte",esc(I.titre)));
    var act=creer("div","actions");
    var b=creer("button","btn btn-primaire",esc(I.bouton));
    b.addEventListener("click",function(){ etape(0); });
    act.appendChild(b); bas.appendChild(act);
    rendreScene({ perso:I.perso, expr:I.expr, ambiance:I.ambiance, nom:I.nom, texte:I.texte, document:I.document, html:bas });
    son("refleter", etat, etatSonore());
  }

  /* ---------- intermède d'acte (saut de temps) ---------- */
  function interlude(i){
    var e=G.etapes[i];
    var deltas = e.acteMalus ? appliquer(scaleMalus(e.acteMalus)) : null;
    var avert="";
    if(e.controleRome){
      if(etat.romanisation < e.controleRome.rappel) return finEchec("romanisation");
      if(etat.romanisation < e.controleRome.seuil){
        var dm=appliquer({faveur:-(e.controleRome.malus||10)});
        deltas = deltas?fusion(deltas,dm):dm;
        avert="Le peuple juge que la démocratie n'avance pas assez : ton soutien chute. Donne plus de pouvoir au peuple, ou tu seras chassé.";
      }
      if(e.controleRome.faveurRappel!==undefined){
        if(etat.faveur < e.controleRome.faveurRappel) return finEchec("faveur");
        if(etat.faveur < e.controleRome.faveurRappel+10){
          var w="Le peuple s'impatiente : ton soutien est dangereusement bas. Remonte-le, ou tu seras chassé du pouvoir.";
          avert = avert ? (avert+" "+w) : w;
        }
      }
    }
    var go=gameOver(); if(go) return finEchec(go);
    if(e.pressionActe) etat.pressionSparte = Math.max(etat.pressionSparte||0, e.pressionActe);
    son("evenement","acte"); son("refleter", etat, etatSonore());
    rendreJauges(deltas);
    var scene=el("#scene"); scene.innerHTML="";
    var box=creer("div","interlude "+(e.ambiance||"jour"));
    box.appendChild(creer("div","int-acte",esc(e.acte)));
    box.appendChild(creer("div","int-texte",esc(e.acteIntro)));
    if(e.acteMalusNote) box.appendChild(creer("div","int-strain",esc(e.acteMalusNote)));
    if(avert) box.appendChild(creer("div","int-avert",esc(avert)));
    var act=creer("div","actions"); act.style.justifyContent="center";
    var b=creer("button","btn btn-primaire","Poursuivre");
    b.addEventListener("click",function(){ etape(i,true); });
    act.appendChild(b); box.appendChild(act);
    scene.appendChild(box);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  /* ---------- étape ---------- */
  function etape(i, fromIntro){
    idx=i; var e=G.etapes[i];
    if(e.acteIntro && !fromIntro) return interlude(i);
    var malus=null, alerte="";
    if(e.contexteSi && flags[e.contexteSi.flag]){ alerte=e.contexteSi.ajout||""; if(e.contexteSi.malus) malus=appliquer(e.contexteSi.malus); }
    var contexte=e.contexte;
    if(e.contexteGrave && etat.stabilite<(e.seuilGrave||0)) contexte=e.contexteGrave;

    var bas=creer("div");
    bas.appendChild(barreProgression(i));
    bas.appendChild(creer("div","kicker",(e.type==="construction"?"Chantier":"Événement")));
    bas.appendChild(creer("div","titre-acte",esc(e.titre)));
    var docs=[];
    if(e.source)  docs.push({tete:"Document 1",                texte:e.source.texte,  ref:e.source.ref});
    if(e.source2) docs.push({tete:"Document 2", texte:e.source2.texte, ref:e.source2.ref});
    var liste=creer("div","options");
    var boutonsChoix=[];
    e.options.forEach(function(opt){
      var b=creer("button","option"); b.type="button";
      var t=creer("div","option-titre",esc(opt.label));
      // coût immédiat réel = coût explicite + dépense cachée dans les effets (tribut, armée…)
      var effActifs=(opt.effetsSi && flags[opt.effetsSi.flag]) ? (opt.effetsSi.effets||{}) : (opt.effets||{});
      var coutImmediat=(opt.cout||0)+Math.max(0,-(effActifs.tresor||0));
      if(coutImmediat>0) t.appendChild(creer("span","cout","− "+coutImmediat+" dr."));
      b.appendChild(t);
      var dispo=etat.tresor>=coutImmediat;
      if(!dispo){ b.classList.add("indispo"); b.disabled=true; b.appendChild(creer("div","option-sous","Trésor insuffisant")); }
      b.addEventListener("click",function(){ if(dispo) choisir(e,opt); });
      boutonsChoix.push({ btn:b, dispo:dispo });
      liste.appendChild(b);
    });

    // verrou de lecture : laisse le temps de lire les documents avant d'ouvrir les choix
    var ms=delaiLecture(e);
    var verrou=ms>0 ? noteDeLecture(ms) : null;
    if(verrou) bas.appendChild(verrou);
    bas.appendChild(liste);
    bas.appendChild(rendreAxes(ms));

    rendreJauges(malus);
    rendreScene({ perso:e.perso, expr:e.expr, ambiance:e.ambiance, nom:e.nom,
                  texte:contexte, alerte:alerte, document:e.document, docs:docs, html:bas });
    if(verrou) verrouillerChoix(boutonsChoix, verrou, ms);
    son("refleter", etat, etatSonore());
  }

  /* ---------- verrou de lecture : on ouvre les choix après un délai ---------- */
  // Durée paramétrable : e.delaiLecture (par étape) ou G.delaiLecture (global), sinon 10 s.
  function delaiLecture(e){
    if(e && typeof e.delaiLecture==="number") return e.delaiLecture*1000;
    var d=(typeof G.delaiLecture==="number")?G.delaiLecture:10;
    return d*1000;
  }
  function noteDeLecture(ms){
    var sec=Math.round(ms/1000);
    var n=creer("div","lecture-verrou");
    n.innerHTML=
      '<div class="lv-tete"><span class="lv-ic">\uD83D\uDCDC</span>'+
      '<span class="lv-txt">Prends le temps de lire les documents. Les choix s\u2019ouvrent dans '+
      '<b class="lv-sec">'+sec+'</b>\u2009s.</span></div>'+
      '<div class="lv-jauge"><i></i></div>';
    return n;
  }
  function verrouillerChoix(boutons, notice, ms){
    GEN_VERROU++; var moi=GEN_VERROU;
    boutons.forEach(function(o){ if(o.dispo){ o.btn.disabled=true; o.btn.classList.add("verrou"); } });
    var bar=notice.querySelector(".lv-jauge > i");
    var sec=notice.querySelector(".lv-sec");
    var fin=Date.now()+ms;
    function tick(){
      if(moi!==GEN_VERROU) return;                 // la scène a changé : on abandonne
      var reste=Math.max(0, fin-Date.now());
      if(sec) sec.textContent=Math.ceil(reste/1000);
      if(bar) bar.style.width=(100*(1-reste/ms)).toFixed(1)+"%";
      if(reste<=0){
        boutons.forEach(function(o){ if(o.dispo){ o.btn.disabled=false; o.btn.classList.remove("verrou"); o.btn.classList.add("ouvre"); } });
        notice.classList.add("ouvert");
        var txt=notice.querySelector(".lv-txt"); if(txt) txt.innerHTML="\u00C0 toi de jouer : choisis ton action.";
        return;
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------- pop-up des conséquences ---------- */
  function _modalEsc(ev){ if(ev.key==="Escape"){ var b=document.querySelector(".modal-fond .btn-primaire"); if(b) b.click(); } }
  function fermerModale(){
    var f=document.querySelector(".modal-fond");
    if(f && f.parentNode) f.parentNode.removeChild(f);
    document.removeEventListener("keydown", _modalEsc, true);
  }
  function ouvrirModale(carte){
    fermerModale();
    var fond=creer("div","modal-fond");
    fond.appendChild(carte);
    document.body.appendChild(fond);
    document.addEventListener("keydown", _modalEsc, true);
    var b=carte.querySelector(".btn-primaire");
    if(b) setTimeout(function(){ try{ b.focus(); }catch(e){} }, 30);
  }
  function chipsDeltas(deltas){
    var noms={romanisation:"Démocratie",stabilite:"Paix sociale",faveur:"Soutien du peuple",tresor:"Trésor de la cité",liberte:"Liberté"};
    var wrap=creer("div","modal-deltas"); var any=false;
    ["romanisation","stabilite","faveur","tresor","liberte"].forEach(function(k){
      if(deltas[k]){ any=true;
        wrap.appendChild(creer("span","chip "+(deltas[k]>0?"d-plus":"d-moins"),(deltas[k]>0?"+":"")+deltas[k]+" "+noms[k])); }
    });
    if(!any) wrap.appendChild(creer("span","chip neutre","Aucun changement"));
    return wrap;
  }

  /* ---------- décision → conséquence ---------- */
  function choisir(e,opt){
    var eff=Object.assign({},opt.effets||{}); var note="";
    if(opt.effetsSi && flags[opt.effetsSi.flag]){ eff=Object.assign({},opt.effetsSi.effets); note=opt.effetsSi.note||""; }
    if(enRevolte) eff=attenuer(eff);            // province en révolte : progrès freinés
    var deltas={};
    if(opt.cout) deltas=fusion(deltas,appliquer({tresor:-opt.cout}));
    deltas=fusion(deltas,appliquer(eff));
    // journal du mandat : impact propre de la décision (coût + effets), hors revenu passif
    var ci=e.options.indexOf(opt);
    var dAlerte=(G.docAlerts && G.docAlerts[e.id] && G.docAlerts[e.id][ci]) || null;
    journal.push({ acte:e.acte||"", titre:e.titre||"", label:opt.label,
                   consequence:opt.consequence+(note?" "+note:""), deltas:Object.assign({},deltas), contreDoc:dAlerte });
    if(opt.flag) flags[opt.flag]=true;
    if(opt.finImposee) finForcee=opt.finImposee;
    if(opt.pression) etat.pressionSparte = clamp((etat.pressionSparte||0)+opt.pression, 0, 100);
    if(opt.persistant) persistants.push(opt.persistant);
    var revenuTxt="";
    if(e.revenuApres){
      var rb=bilanRevenu();
      if(rb.net) deltas=fusion(deltas,appliquer({tresor:rb.net}));
      if(enRevolte){
        revenuTxt = "L'argent ne rentre plus (crise)"+(rb.entretien?" · entretien "+rb.entretien+" dr.":"")+" → "+(rb.net>=0?"+":"")+rb.net+" dr. ce tour.";
      } else {
        var pcs=["impôts +"+rb.base+" dr."];
        if(rb.commerce) pcs.push("commerce +"+rb.commerce+" dr.");
        if(rb.entretien) pcs.push("entretien "+rb.entretien+" dr.");
        revenuTxt = G.revenu.texte+" : "+pcs.join(" · ")+" → "+(rb.net>=0?"+":"")+rb.net+" dr. ce tour"+(etat.stabilite<G.revenu.seuil?" (impôts réduits, cité instable)":"")+".";
      }
    }
    var revolteTxt = majRevolte(deltas);
    var tresorTxt = majTresor(deltas);
    var positif=estPositif(deltas);
    var expr=positif?"content":"inquiet";

    // tableau de bord mis à jour (jauges animées en haut)
    rendreJauges(deltas);

    // pop-up des conséquences : réaction + description + impact sur les jauges + explication
    var carte=creer("div","modal-carte");
    carte.setAttribute("role","dialog");
    carte.setAttribute("aria-modal","true");
    carte.setAttribute("aria-label","Conséquences de ta décision");

    var tete=creer("div","modal-tete");
    var av=document.createElement("img"); av.className="modal-perso"; av.alt="";
    av.src=persoSrc(e.perso||"conseiller", expr);
    tete.appendChild(av);
    var tt=creer("div","modal-tete-txt");
    tt.appendChild(creer("div","modal-kicker","Conséquences"));
    if(e.nom) tt.appendChild(creer("div","modal-qui",esc(e.nom)));
    tete.appendChild(tt);
    carte.appendChild(tete);

    // description textuelle de la réaction
    carte.appendChild(creer("div","modal-dit", esc(opt.consequence+(note?" "+note:""))));

    // impact sur les jauges
    var imp=creer("div","modal-impact "+(positif?"juste":"faux"));
    imp.appendChild(creer("div","modal-impact-tete","Impact sur les jauges"));
    imp.appendChild(chipsDeltas(deltas));
    if(revenuTxt) imp.appendChild(creer("div","corr",esc(revenuTxt)));
    carte.appendChild(imp);
    if(revolteTxt) carte.appendChild(creer("div","note-revolte",esc(revolteTxt)));
    if(tresorTxt) carte.appendChild(creer("div","note-revolte",esc(tresorTxt)));

    // explication pédagogique
    var pq=creer("div","pourquoi");
    pq.innerHTML='<span class="pq-tete">Pourquoi&nbsp;?</span> '+esc(opt.pourquoi);
    carte.appendChild(pq);

    // action : poursuivre
    var act=creer("div","actions modal-actions");
    var b=creer("button","btn btn-primaire",(finForcee||idx>=G.etapes.length-1)?"Fin du mandat":"Continuer");
    b.addEventListener("click",function(){ fermerModale(); continuer(); });
    act.appendChild(b); carte.appendChild(act);

    ouvrirModale(carte);
    son("evenement","choix"); son("refleter", etat, etatSonore());
  }

  function listeDeltas(deltas){
    var noms={romanisation:"Démocratie",stabilite:"Paix sociale",faveur:"Soutien du peuple",tresor:"Trésor de la cité",liberte:"Liberté"};
    var p=[];
    ["romanisation","stabilite","faveur","tresor","liberte"].forEach(function(k){
      if(deltas[k]) p.push('<span class="d-'+(deltas[k]>0?"plus":"moins")+'">'+(deltas[k]>0?"+":"")+deltas[k]+' '+noms[k]+'</span>'); });
    return p.length?p.join(" · "):"Aucun changement.";
  }

  function continuer(){
    if(finForcee){ var ff=finForcee; finForcee=null; return finEchec(ff); }
    var go=gameOver(); if(go) return finEchec(go);
    if(idx<G.etapes.length-1) etape(idx+1); else bilan();
  }

  /* ---------- fins ---------- */
  function finEchec(type){
    finie=true;
    var f=G.echecs[type]; rendreJauges();
    son("evenement","echec");
    var bas=ecranBilan(f, "Fin du mandat");
    rendreScene({ perso:f.perso, expr:f.expr, ambiance:f.ambiance, nom:f.titre, texte:f.texte, html:bas });
  }
  function bilan(){
    finie=true;
    var c=G.bilans[G.bilans.length-1];
    for(var i=0;i<G.bilans.length;i++){ var cond=G.bilans[i].si, ok=true;
      Object.keys(cond).forEach(function(k){ if(etat[k]<cond[k]) ok=false; }); if(ok){ c=G.bilans[i]; break; } }
    rendreJauges();
    son("evenement", (etat.romanisation>=70 && etat.faveur>=55 && etat.stabilite>=45) ? "triomphe" : "fin");
    var bas=ecranBilan(c, "Fin du mandat · Bilan");
    rendreScene({ perso:c.perso, expr:c.expr, ambiance:c.ambiance, nom:"Bilan de ton mandat", texte:c.texte, html:bas });
  }

  // Médaille de fin : emblème colonne (debout = la démocratie tient, brisée = elle tombe)
  function svgMedaille(niv){
    var centre = (niv==="sombre")
      ? '<rect x="31" y="38" width="10" height="8" fill="currentColor"/><rect x="27" y="46" width="18" height="4" fill="currentColor"/><path d="M31 38l3-4 3 4 3-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>'
      : '<rect x="31" y="27" width="10" height="19" fill="currentColor"/><rect x="27" y="23" width="18" height="4.5" fill="currentColor"/><rect x="27" y="46" width="18" height="4.5" fill="currentColor"/><path d="M33 27v19M37 27v19" stroke="#fff" stroke-width="1" opacity=".45"/>';
    return '<svg viewBox="0 0 72 72" aria-hidden="true">'
      + '<circle cx="36" cy="36" r="22" fill="currentColor" opacity=".12"/>'
      + '<circle cx="36" cy="36" r="22" fill="none" stroke="currentColor" stroke-width="3"/>'
      + '<path d="M14 51C8 41 9 28 18 21" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>'
      + '<path d="M14 46l-5-1M13 41l-5-2M14 36l-5-2M16 31l-5-3M19 26l-4-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M58 51c6-10 5-23-4-30" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>'
      + '<path d="M58 46l5-1M59 41l5-2M58 36l5-2M56 31l5-3M53 26l4-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + centre + '</svg>';
  }
  function badgeRang(rang){
    if(!rang) return null;
    var niv=rang.niveau||"sombre";
    var libelle={or:"Médaille d'or",argent:"Médaille d'argent",bronze:"Médaille de bronze",sombre:"Fin du mandat"}[niv]||"";
    var box=creer("div","badge-rang badge-"+niv);
    var med=creer("div","badge-medaille"); med.innerHTML=svgMedaille(niv); box.appendChild(med);
    var txt=creer("div","badge-txt");
    if(libelle) txt.appendChild(creer("div","badge-niveau",esc(libelle)));
    txt.appendChild(creer("div","badge-nom",esc(rang.nom)));
    box.appendChild(txt);
    return box;
  }

  // contenu commun des écrans de fin : en-tête d'impression, verdict, trajectoire, journal, actions
  function ecranBilan(verdict, kicker){
    var bas=creer("div","bilan-bas");
    bas.appendChild(enteteImpression(verdict.titre));        // visible à l'impression seulement
    var tete=creer("div","bilan-entete");
    tete.appendChild(creer("div","kicker",kicker));
    if(DIFF && DIFF.nom) tete.appendChild(creer("div","bilan-niveau","Niveau : "+esc(DIFF.nom)));
    bas.appendChild(tete);
    var bg=badgeRang(verdict.rang); if(bg) bas.appendChild(bg);
    bas.appendChild(creer("div","titre-acte",esc(verdict.titre)));
    bas.appendChild(creer("p","verdict-print",esc(verdict.texte)));   // doublon du verdict, imprimé seulement
    var grille=creer("div","bilan-grille");
    grille.appendChild(trajectoireJauges());
    grille.appendChild(journalMandat());
    bas.appendChild(grille);
    bas.appendChild(pointsFortsBloc());
    bas.appendChild(sourcesNegligeesBloc());
    var act=rejouer(); act.classList.add("bilan-actions"); act.appendChild(boutonImprimer());
    bas.appendChild(act);
    return bas;
  }

  /* ---------- bilan : trajectoire des jauges (départ → fin) ---------- */
  function railPct(j,v){ return (j.type==="res") ? clamp(v/200*100,0,100) : clamp(v,0,100); }
  function couleurFill(j,v){ return j.couleur==="seuil" ? classeSeuil(v) : j.couleur; }
  function trajectoireJauges(){
    var box=creer("div","bilan-traj");
    box.appendChild(creer("div","bilan-sous-tete","Trajectoire des jauges"));
    G.jauges.forEach(function(j){
      var s=G.etatInitial[j.id], e=etat[j.id], d=e-s, unite=(j.type==="res")?" dr.":"";
      var ligne=creer("div","traj-ligne");
      var haut=creer("div","traj-haut");
      haut.appendChild(creer("div","traj-nom",'<span class="traj-ic"><svg viewBox="0 0 24 24">'+(ICONES[j.icone]||"")+'</svg></span>'+esc(j.nom)));
      var val=creer("div","traj-val");
      val.appendChild(creer("span","traj-chiffres",esc(s+" \u2192 "+e+unite)));
      val.appendChild(creer("span","chip-traj "+(d>0?"plus":(d<0?"moins":"nul")),(d>0?"+":"")+(d!==0?d:"\u00b10")));
      haut.appendChild(val); ligne.appendChild(haut);
      var rail=creer("div","rail traj-rail");
      var fill=creer("div","fill "+couleurFill(j,e)); fill.style.width=railPct(j,e)+"%";
      var dep=creer("span","traj-depart"); dep.style.left=railPct(j,s)+"%";
      rail.appendChild(fill); rail.appendChild(dep); ligne.appendChild(rail);
      box.appendChild(ligne);
    });
    box.appendChild(creer("div","traj-legende","Le trait marque la valeur de départ ; la barre, la valeur finale."));
    return box;
  }

  /* ---------- bilan : journal du mandat (repliable par acte) ---------- */
  function miniChips(deltas){
    var ab={romanisation:"Démo.",stabilite:"Paix",faveur:"Soutien",tresor:"Trésor"};
    var wrap=creer("div","jrow-chips"); var any=false;
    ["romanisation","stabilite","faveur","tresor"].forEach(function(k){
      if(deltas && deltas[k]){ any=true;
        wrap.appendChild(creer("span","mini-chip "+(deltas[k]>0?"plus":"moins"),ab[k]+" "+(deltas[k]>0?"+":"")+deltas[k])); }
    });
    return any?wrap:null;
  }
  var CHEVRON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l8 7-8 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function journalMandat(){
    var box=creer("div","bilan-journal");
    box.appendChild(creer("div","bilan-sous-tete","Journal du mandat"));
    if(!journal.length){ box.appendChild(creer("div","journal-vide","Aucune décision enregistrée.")); return box; }
    var groupes=[], cur=null;
    journal.forEach(function(en){
      if(!cur || cur.acte!==en.acte){ cur={ acte:en.acte, items:[] }; groupes.push(cur); }
      cur.items.push(en);
    });
    groupes.forEach(function(g,gi){
      var ouvertParDefaut = (gi===0);
      var grp=creer("div","jacte"+(ouvertParDefaut?" ouvert":""));
      var tete=creer("button","jacte-tete"); tete.type="button";
      tete.setAttribute("aria-expanded", ouvertParDefaut?"true":"false");
      tete.innerHTML='<span class="jacte-chev">'+CHEVRON+'</span>'+
                     '<span class="jacte-nom">'+esc(g.acte)+'</span>'+
                     '<span class="jacte-compte">'+g.items.length+(g.items.length>1?" décisions":" décision")+'</span>';
      var corps=creer("div","jacte-corps");
      g.items.forEach(function(en){
        var row=creer("div","jrow2");
        row.appendChild(creer("div","jrow-titre",esc(en.label)));
        var basr=creer("div","jrow-bas");
        basr.appendChild(creer("span","jrow-cons",esc(en.consequence)));
        var ch=miniChips(en.deltas); if(ch) basr.appendChild(ch);
        row.appendChild(basr); corps.appendChild(row);
      });
      tete.addEventListener("click",function(){
        var o=grp.classList.toggle("ouvert");
        tete.setAttribute("aria-expanded", o?"true":"false");
      });
      grp.appendChild(tete); grp.appendChild(corps);
      box.appendChild(grp);
    });
    return box;
  }

  /* ---------- bilan : points forts + documents négligés ---------- */
  function pointsForts(){
    var s=etat, pts=[];
    var cand=[
      { v:s.romanisation, t: s.romanisation>=70?"Tu as donné une vraie place au peuple : une démocratie bien enracinée.":(s.romanisation>=50?"Le pouvoir du peuple a pris dans la cité.":null) },
      { v:s.stabilite,    t: s.stabilite>=60?"La cité est restée en paix d'un bout à l'autre.":(s.stabilite>=45?"La paix a tenu malgré les crises.":null) },
      { v:s.faveur,       t: s.faveur>=55?"Le peuple t'a soutenu d'un bout à l'autre.":(s.faveur>=42?"Le soutien du peuple a tenu.":null) },
      { v:s.tresor,       t: s.tresor>=180?"Finances saines : un trésor solide en fin de mandat.":(s.tresor>=120?"Finances bien gérées.":null) }
    ];
    cand.filter(function(c){return c.t;}).sort(function(a,b){return b.v-a.v;}).slice(0,3).forEach(function(c){ pts.push(c.t); });
    if(!aConnuRevolte) pts.push("La cité est restée en paix tout au long.");
    var ign=journal.filter(function(j){return j.contreDoc;}).length;
    if(ign===0) pts.push("Tu as tenu compte des documents à chaque décision.");
    else if(ign<=2) pts.push("Tu as presque toujours suivi les documents (seulement "+ign+" écart"+(ign>1?"s":"")+").");
    if(!pts.length) pts.push("Tu as mené ton mandat jusqu'au bout malgré l'adversité.");
    return pts.slice(0,4);
  }
  function pointsFortsBloc(){
    var box=creer("div","bilan-forts");
    box.appendChild(creer("div","bilan-sous-tete","Points forts"));
    var ul=creer("ul","forts-liste");
    pointsForts().forEach(function(t){ var li=document.createElement("li"); li.textContent=t; ul.appendChild(li); });
    box.appendChild(ul);
    return box;
  }
  function sourcesNegligeesBloc(){
    var liste=journal.filter(function(j){ return j.contreDoc; });
    var box=creer("div","bilan-negligees");
    box.appendChild(creer("div","bilan-sous-tete","Décisions à revoir \u2014 documents négligés"));
    if(!liste.length){ box.appendChild(creer("div","negligees-vide","Aucune : à chaque décision, ton choix tenait compte des documents. Beau travail de lecture des sources.")); return box; }
    box.appendChild(creer("div","negligees-intro","Lors de ces décisions, ton choix est allé à l'encontre de ce que les documents indiquaient :"));
    liste.forEach(function(j){
      var item=creer("div","neg-item");
      item.appendChild(creer("div","neg-titre",esc(j.titre)+" \u2014 "+esc(j.label)));
      item.appendChild(creer("div","neg-note",esc(j.contreDoc)));
      box.appendChild(item);
    });
    return box;
  }

  /* ---------- bilan : impression (window.print + feuille @media print) ---------- */
  function boutonImprimer(){
    var b=creer("button","btn btn-second btn-imprimer"); b.type="button";
    b.innerHTML='<svg viewBox="0 0 24 24" class="ic-print" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v6H8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>Imprimer le bilan';
    b.addEventListener("click",function(){ try{ window.print(); }catch(e){} });
    return b;
  }
  function enteteImpression(titre){
    var d=new Date(), date;
    try{ date=d.toLocaleDateString("fr-CA"); }
    catch(e){ date=d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
    var box=creer("div","print-entete");
    box.innerHTML=
      '<div class="pe-haut"><span class="pe-titre">Bilan de mandat — Demokratia</span>'+
      '<span class="pe-niveau">Niveau : '+esc((DIFF&&DIFF.nom)||"")+'</span></div>'+
      '<div class="pe-ligne"><span>Nom : ______________________________</span>'+
      '<span>Date : '+esc(date)+'</span></div>';
    return box;
  }

  function rejouer(){
    var act=creer("div","actions"); act.style.justifyContent="center";
    var b=creer("button","btn btn-primaire","Reprendre un nouveau mandat");
    b.addEventListener("click",intro); act.appendChild(b); return act;
  }

  function roman(n){ if(!n||n<=0)return ""; var m=[[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]],r=""; for(var k=0;k<m.length;k++){while(n>=m[k][0]){r+=m[k][1];n-=m[k][0];}} return r; }

  function barreProgression(i){
    var e=G.etapes[i]||{};
    var box=creer("div","progression");
    box.appendChild(creer("div","prog-acte",esc(e.acte||"")));
    var seg=creer("div","prog-seg");
    for(var k=0;k<G.etapes.length;k++) seg.appendChild(creer("span","dot"+(k<i?" passe":"")+(k===i?" actuel":"")));
    box.appendChild(seg);
    return box;
  }

  document.addEventListener("DOMContentLoaded",choisirDifficulte);
  window.__STRATEGE_TEST={ get etat(){return etat;}, get flags(){return flags;}, get idx(){return idx;},
    get enRevolte(){return enRevolte;}, get diff(){return DIFF;},
    intro:intro, choisirDifficulte:choisirDifficulte, etape:etape, interlude:interlude,
    setDiff:function(k){ DIFF=(G.difficultes&&G.difficultes[k])||DIFF; },
    _set:function(o){Object.assign(etat,o);} };
})();
