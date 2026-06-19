/* =========================================================================
   LEGATUS — moteur de simulation (vanilla JS, sans dépendance)
   Boucle : événement → décision → conséquences (les jauges bougent) → suite.
   ========================================================================= */
(function(){
  "use strict";
  var G = window.LEGATUS;

  var etat, flags, persistants, idx;

  function init(){
    etat = Object.assign({}, G.etatInitial);
    flags = {};
    persistants = [];
    idx = 0;
  }

  /* ---------- utilitaires ---------- */
  function el(s){ return document.querySelector(s); }
  function creer(t,c,h){ var n=document.createElement(t); if(c)n.className=c; if(h!=null)n.innerHTML=h; return n; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];}); }
  function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }
  function classeSeuil(v){ return v>=50?"ok":(v>=25?"moyen":"bas"); }

  /* ---------- bandeau de jauges ---------- */
  function rendreJauges(deltas){
    var b = el("#jauges"); b.innerHTML="";
    G.jauges.forEach(function(j){
      var v = etat[j.id];
      var carte = creer("div","jauge");
      var pastille = creer("div","pastille "+j.couleur, esc(j.lettre));
      var corps = creer("div","jauge-corps");
      var haut = creer("div","jauge-haut");
      haut.appendChild(creer("span","jauge-nom",esc(j.nom)));
      var valTxt = (j.type==="res") ? (v+" deniers") : (v+" / 100");
      var spanVal = creer("span","jauge-val",esc(valTxt));
      if(deltas && deltas[j.id]!=null && deltas[j.id]!==0){
        var d=deltas[j.id]; spanVal.appendChild(creer("span","delta "+(d>0?"plus":"moins"), (d>0?"+":"")+d));
      }
      haut.appendChild(spanVal);
      corps.appendChild(haut);
      var rail = creer("div","rail");
      var fill = creer("div","fill");
      var pct = (j.type==="res") ? clamp(v/200*100,0,100) : v;
      fill.style.width = pct+"%";
      fill.classList.add(j.couleur==="seuil" ? classeSeuil(v) : j.couleur);
      rail.appendChild(fill);
      corps.appendChild(rail);
      carte.appendChild(pastille); carte.appendChild(corps);
      carte.title = j.aide;
      b.appendChild(carte);
    });
  }

  /* ---------- application d'effets ---------- */
  function appliquer(effets){
    var deltas={};
    Object.keys(effets||{}).forEach(function(k){
      var av=etat[k];
      etat[k] = (k==="tresor") ? Math.max(0, etat[k]+effets[k]) : clamp(etat[k]+effets[k],0,100);
      deltas[k]=etat[k]-av;
    });
    return deltas;
  }
  function fusion(a,b){ var r=Object.assign({},a); Object.keys(b||{}).forEach(function(k){ r[k]=(r[k]||0)+b[k]; }); return r; }

  function gameOver(){
    if(etat.stabilite<=0) return "stabilite";
    if(etat.faveur<=0) return "faveur";
    return null;
  }

  /* ---------- scènes ---------- */
  function montrerScene(html){ var s=el("#scene"); s.innerHTML=""; s.appendChild(html); window.scrollTo({top:0,behavior:"smooth"}); }

  function intro(){
    init();
    rendreJauges();
    var c = creer("div","carte-scene");
    if(G.intro.image){ var im=document.createElement("img"); im.className="illu"; im.src=G.intro.image; im.alt=""; c.appendChild(im); }
    c.appendChild(creer("div","kicker","An de Rome · Mandat I"));
    c.appendChild(creer("h2","scene-titre",esc(G.intro.titre)));
    c.appendChild(creer("p","scene-texte",esc(G.intro.texte)));
    var act=creer("div","actions");
    var b=creer("button","btn btn-primaire",esc(G.intro.bouton));
    b.addEventListener("click",function(){ etape(0); });
    act.appendChild(b); c.appendChild(act);
    montrerScene(c);
  }

  function etape(i){
    idx=i;
    var e = G.etapes[i];
    // malus de contexte conditionnel (conséquence d'un choix passé)
    var malusContexte=null, ajoutContexte="";
    if(e.contexteSi && flags[e.contexteSi.flag]){
      ajoutContexte = e.contexteSi.ajout||"";
      if(e.contexteSi.malus){ malusContexte = appliquer(e.contexteSi.malus); }
    }

    var c = creer("div","carte-scene");
    if(e.image){ var im=document.createElement("img"); im.className="illu"; im.src=e.image; im.alt=""; c.appendChild(im); }
    c.appendChild(creer("div","kicker", (e.type==="construction"?"Chantier":"Événement") + " · Mandat "+roman(i+1)));
    c.appendChild(creer("h2","scene-titre",esc(e.titre)));

    var contexte = e.contexte;
    if(e.contexteGrave && etat.stabilite < (e.seuilGrave||0)) contexte = e.contexteGrave;
    c.appendChild(creer("p","scene-texte", esc(contexte)+ (ajoutContexte?'<span class="alerte"> '+esc(ajoutContexte)+'</span>':"")));

    if(malusContexte){
      rendreJauges(malusContexte);
      var go=gameOver(); if(go){ c.appendChild(noteMalus(malusContexte)); }
    } else {
      rendreJauges();
    }

    var liste = creer("div","options");
    e.options.forEach(function(opt){
      var carte=creer("button","option");
      carte.type="button";
      var titre=creer("div","option-titre",esc(opt.label));
      if(opt.cout!=null && opt.cout>0) titre.appendChild(creer("span","cout","− "+opt.cout+" deniers"));
      carte.appendChild(titre);
      // aperçu : pas de chiffres révélés (le joueur découvre les conséquences)
      var dispo = !(opt.cout>0 && etat.tresor<opt.cout);
      if(!dispo){ carte.classList.add("indispo"); carte.disabled=true; carte.appendChild(creer("div","option-sous","Trésor insuffisant")); }
      carte.addEventListener("click", function(){ if(dispo) choisir(e,opt); });
      liste.appendChild(carte);
    });
    c.appendChild(liste);
    montrerScene(c);
  }

  function noteMalus(deltas){
    var n=creer("div","retro faux montre");
    n.innerHTML="<strong>Conséquence de la répression.</strong> "+ listeDeltas(deltas);
    return n;
  }

  function choisir(e, opt){
    var effets = Object.assign({}, opt.effets||{});
    var note="";
    if(opt.effetsSi && flags[opt.effetsSi.flag]){ effets = Object.assign({}, opt.effetsSi.effets); note = opt.effetsSi.note||""; }

    var deltas = {};
    // coût de construction
    if(opt.cout){ var dc=appliquer({tresor:-opt.cout}); deltas=fusion(deltas,dc); }
    // effets principaux
    deltas = fusion(deltas, appliquer(effets));
    // flag + persistant
    if(opt.flag) flags[opt.flag]=true;
    if(opt.persistant) persistants.push(opt.persistant);
    // revenu d'impôts après un événement
    var revenuTxt="";
    if(e.revenuApres){
      var r = (etat.stabilite>=G.revenu.seuil) ? G.revenu.haut : G.revenu.bas;
      var dr = appliquer({tresor:r}); deltas=fusion(deltas,dr);
      revenuTxt = G.revenu.texte+" : +"+r+" deniers"+(etat.stabilite<G.revenu.seuil?" (réduits — province instable)":"")+".";
      // effets persistants (ex. commerce d'une voie)
      persistants.forEach(function(p){ var dp=appliquer(p); deltas=fusion(deltas,dp); });
    }

    rendreJauges(deltas);

    var c = creer("div","carte-scene");
    c.appendChild(creer("div","kicker","Conséquences"));
    c.appendChild(creer("h2","scene-titre",esc(opt.label)));
    c.appendChild(creer("p","scene-texte",esc(opt.consequence)+(note?' <em>'+esc(note)+'</em>':"")));
    var bilanD = creer("div","retro montre "+(estPositif(deltas)?"juste":"faux"));
    bilanD.innerHTML = listeDeltas(deltas) + (revenuTxt?'<div class="corr">'+esc(revenuTxt)+'</div>':"");
    c.appendChild(bilanD);
    var pq = creer("div","pourquoi");
    pq.innerHTML = '<span class="pq-tete">Pourquoi&nbsp;?</span> '+esc(opt.pourquoi);
    c.appendChild(pq);

    var act=creer("div","actions");
    var b=creer("button","btn btn-primaire", (idx < G.etapes.length-1) ? "Continuer" : "Fin du mandat");
    b.addEventListener("click", continuer);
    act.appendChild(b); c.appendChild(act);
    montrerScene(c);
  }

  function estPositif(d){ var s=0; Object.keys(d).forEach(function(k){ if(k!=="tresor") s+=d[k]; }); return s>=0; }

  function listeDeltas(deltas){
    var noms={romanisation:"Romanisation",stabilite:"Stabilité",faveur:"Faveur de Rome",tresor:"Trésor"};
    var parts=[];
    ["romanisation","stabilite","faveur","tresor"].forEach(function(k){
      if(deltas[k]!=null && deltas[k]!==0){
        var d=deltas[k]; parts.push('<span class="d-'+(d>0?"plus":"moins")+'">'+(d>0?"+":"")+d+' '+noms[k]+'</span>');
      }
    });
    return parts.length? parts.join(" · ") : "Aucun changement.";
  }

  function continuer(){
    var go = gameOver();
    if(go) return finEchec(go);
    if(idx < G.etapes.length-1) etape(idx+1);
    else bilan();
  }

  /* ---------- fins ---------- */
  function finEchec(type){
    var info = G.echecs[type];
    rendreJauges();
    var c=creer("div","carte-scene fin echec");
    c.appendChild(creer("div","kicker","Fin du mandat"));
    c.appendChild(creer("h2","scene-titre",esc(info.titre)));
    c.appendChild(creer("p","scene-texte",esc(info.texte)));
    c.appendChild(bilanJauges());
    c.appendChild(boutonRejouer());
    montrerScene(c);
  }

  function bilan(){
    var choisi = G.bilans[G.bilans.length-1];
    for(var i=0;i<G.bilans.length;i++){
      var cond=G.bilans[i].si, ok=true;
      Object.keys(cond).forEach(function(k){ if(etat[k] < cond[k]) ok=false; });
      if(ok){ choisi=G.bilans[i]; break; }
    }
    rendreJauges();
    var c=creer("div","carte-scene fin");
    c.appendChild(creer("div","kicker","Fin du mandat · Bilan"));
    c.appendChild(creer("h2","scene-titre",esc(choisi.titre)));
    c.appendChild(creer("p","scene-texte",esc(choisi.texte)));
    c.appendChild(bilanJauges());
    c.appendChild(boutonRejouer());
    montrerScene(c);
  }

  function bilanJauges(){
    var box=creer("div","bilan-jauges");
    G.jauges.forEach(function(j){
      var v=etat[j.id];
      var l=creer("div","bilan-ligne");
      l.innerHTML='<span>'+esc(j.nom)+'</span><span class="bilan-v">'+v+(j.type==="res"?" deniers":" / 100")+'</span>';
      box.appendChild(l);
    });
    return box;
  }

  function boutonRejouer(){
    var act=creer("div","actions"); act.style.justifyContent="center";
    var b=creer("button","btn btn-primaire","Reprendre un nouveau mandat");
    b.addEventListener("click", intro);
    act.appendChild(b);
    return act;
  }

  /* ---------- chiffres romains (année de mandat) ---------- */
  function roman(n){ if(!n||n<=0)return "—"; var m=[[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]],r=""; for(var k=0;k<m.length;k++){while(n>=m[k][0]){r+=m[k][1];n-=m[k][0];}} return r; }

  /* ---------- démarrage ---------- */
  document.addEventListener("DOMContentLoaded", intro);
  // exposé pour la validation
  window.__LEGATUS_TEST = {
    get etat(){ return etat; }, get flags(){ return flags; }, get idx(){ return idx; },
    intro: intro, _set:function(o){ Object.assign(etat,o); }
  };
})();
