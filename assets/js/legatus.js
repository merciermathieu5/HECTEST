/* =========================================================================
   LEGATUS — moteur de simulation, scène « bande dessinée »
   Boucle : un personnage présente une situation (bulle) → tu décides →
   il réagit, les jauges bougent → suite. Sans dépendance.
   ========================================================================= */
(function(){
  "use strict";
  var G = window.LEGATUS;

  // icônes des jauges (SVG inline)
  var ICONES = {
    temple:'<g fill="#3A2E26"><path d="M2.5 9 L12 3 L21.5 9 Z"/><rect x="3.5" y="9.4" width="17" height="2.2"/><rect x="4.5" y="12" width="2.4" height="6.6"/><rect x="8.6" y="12" width="2.4" height="6.6"/><rect x="13" y="12" width="2.4" height="6.6"/><rect x="17.1" y="12" width="2.4" height="6.6"/><rect x="3" y="18.8" width="18" height="2.4"/></g>',
    bouclier:'<path d="M6 3 H18 Q19 3 19 5 V13 Q19 18 12 21 Q5 18 5 13 V5 Q5 3 6 3 Z" fill="#3A2E26"/><circle cx="12" cy="12" r="2.6" fill="#F2E7CF"/><path d="M12 5 V19 M6 12 H18" stroke="#F2E7CF" stroke-width="1.1"/>',
    laurier:'<g fill="#3A2E26"><path d="M12 22 C9 19 7.5 14 8 8" stroke="#3A2E26" stroke-width="1.4" fill="none"/><path d="M12 22 C15 19 16.5 14 16 8" stroke="#3A2E26" stroke-width="1.4" fill="none"/><ellipse cx="7" cy="9" rx="2.6" ry="1.4" transform="rotate(-50 7 9)"/><ellipse cx="7.4" cy="12.5" rx="2.6" ry="1.4" transform="rotate(-40 7.4 12.5)"/><ellipse cx="8.6" cy="16" rx="2.6" ry="1.4" transform="rotate(-32 8.6 16)"/><ellipse cx="10" cy="19" rx="2.6" ry="1.4" transform="rotate(-26 10 19)"/><ellipse cx="17" cy="9" rx="2.6" ry="1.4" transform="rotate(50 17 9)"/><ellipse cx="16.6" cy="12.5" rx="2.6" ry="1.4" transform="rotate(40 16.6 12.5)"/><ellipse cx="15.4" cy="16" rx="2.6" ry="1.4" transform="rotate(32 15.4 16)"/><ellipse cx="14" cy="19" rx="2.6" ry="1.4" transform="rotate(26 14 19)"/><circle cx="12" cy="6.5" r="1.7"/></g>',
    piece:'<circle cx="12" cy="12" r="9" fill="#3A2E26"/><circle cx="12" cy="12" r="6.4" fill="none" stroke="#F2E7CF" stroke-width="1.1"/><path d="M13.5 8.5 C10 8 9.5 11 12 11.6 C14.5 12.2 14 15.4 10.6 15" fill="none" stroke="#F2E7CF" stroke-width="1.3" stroke-linecap="round"/>'
  };

  var etat, flags, persistants, idx;

  function init(){ etat=Object.assign({},G.etatInitial); flags={}; persistants=[]; idx=0; }

  function el(s){ return document.querySelector(s); }
  function creer(t,c,h){ var n=document.createElement(t); if(c)n.className=c; if(h!=null)n.innerHTML=h; return n; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];}); }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function classeSeuil(v){ return v>=50?"ok":(v>=25?"moyen":"bas"); }
  function persoSrc(role,expr){ return "assets/img/perso/"+role+"-"+expr+".svg"; }
  function docSrc(d){ return "assets/img/"+d+".png"; }
  var DOCLEG = { empire:"Carte de l'Empire", curie:"La curie", cirque:"Les jeux du cirque" };

  /* ---------- jauges ---------- */
  function rendreJauges(deltas){
    var b=el("#jauges"); b.innerHTML="";
    G.jauges.forEach(function(j){
      var v=etat[j.id];
      var carte=creer("div","jauge");
      carte.appendChild(creer("div","ic",'<svg viewBox="0 0 24 24">'+(ICONES[j.icone]||"")+'</svg>'));
      var corps=creer("div","jauge-corps");
      var haut=creer("div","jauge-haut");
      haut.appendChild(creer("span","jauge-nom",esc(j.nom)));
      var val=creer("span","jauge-val",esc(j.type==="res"?(v+" d."):(v)));
      if(deltas&&deltas[j.id]){ var d=deltas[j.id]; val.appendChild(creer("span","delta "+(d>0?"plus":"moins"),(d>0?"+":"")+d)); }
      haut.appendChild(val); corps.appendChild(haut);
      var rail=creer("div","rail"); var fill=creer("div","fill");
      fill.style.width=(j.type==="res"?clamp(v/200*100,0,100):v)+"%";
      fill.classList.add(j.couleur==="seuil"?classeSeuil(v):j.couleur);
      rail.appendChild(fill); corps.appendChild(rail);
      carte.appendChild(corps); b.appendChild(carte);
    });
  }

  /* ---------- effets ---------- */
  function appliquer(eff){ var d={}; Object.keys(eff||{}).forEach(function(k){ var a=etat[k];
    etat[k]=(k==="tresor")?Math.max(0,etat[k]+eff[k]):clamp(etat[k]+eff[k],0,100); d[k]=etat[k]-a; }); return d; }
  function fusion(a,b){ var r=Object.assign({},a); Object.keys(b||{}).forEach(function(k){ r[k]=(r[k]||0)+b[k]; }); return r; }
  function gameOver(){ if(etat.stabilite<=0)return "stabilite"; if(etat.faveur<=0)return "faveur"; return null; }
  function estPositif(d){ var s=0; Object.keys(d).forEach(function(k){ if(k!=="tresor")s+=d[k]; }); return s>=0; }

  /* ---------- scène (case BD) ---------- */
  function rendreScene(o){
    // o : {perso, expr, ambiance, nom, texte, alerte, document, html}  html = contenu sous la case
    var scene=el("#scene"); scene.innerHTML="";
    var sc=creer("div","case "+(o.ambiance||"jour"));
    sc.style.backgroundImage="url('assets/img/decor-forum.svg')";
    var img=document.createElement("img"); img.className="perso entre"; img.alt=o.nom||"";
    img.src=persoSrc(o.perso||"conseiller", o.expr||"neutre");
    sc.appendChild(img);
    var bulle=creer("div","bulle");
    if(o.nom) bulle.appendChild(creer("div","qui",esc(o.nom)));
    bulle.appendChild(creer("div","dit", esc(o.texte)+(o.alerte?'<span class="alerte"> '+esc(o.alerte)+'</span>':"")));
    sc.appendChild(bulle);
    if(o.document){
      var dv=creer("div","doc-vignette");
      dv.innerHTML='<img src="'+docSrc(o.document)+'" alt=""><div class="leg">'+esc(DOCLEG[o.document]||"")+'</div>';
      sc.appendChild(dv);
    }
    scene.appendChild(sc);
    if(o.html) scene.appendChild(o.html);
    window.scrollTo({top:0,behavior:"smooth"});
  }

  /* ---------- intro ---------- */
  function intro(){
    init(); rendreJauges();
    var I=G.intro;
    var bas=creer("div");
    bas.appendChild(creer("div","kicker","An de Rome · Mandat I"));
    bas.appendChild(creer("div","titre-acte",esc(I.titre)));
    var act=creer("div","actions");
    var b=creer("button","btn btn-primaire",esc(I.bouton));
    b.addEventListener("click",function(){ etape(0); });
    act.appendChild(b); bas.appendChild(act);
    rendreScene({ perso:I.perso, expr:I.expr, ambiance:I.ambiance, nom:I.nom, texte:I.texte, document:I.document, html:bas });
  }

  /* ---------- intermède d'acte (saut de temps) ---------- */
  function interlude(i){
    var e=G.etapes[i];
    var deltas = e.acteMalus ? appliquer(e.acteMalus) : null;
    rendreJauges(deltas);
    var scene=el("#scene"); scene.innerHTML="";
    var box=creer("div","interlude "+(e.ambiance||"jour"));
    box.appendChild(creer("div","int-acte",esc(e.acte)));
    box.appendChild(creer("div","int-texte",esc(e.acteIntro)));
    if(e.acteMalusNote) box.appendChild(creer("div","int-strain",esc(e.acteMalusNote)));
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
    var liste=creer("div","options");
    e.options.forEach(function(opt){
      var b=creer("button","option"); b.type="button";
      var t=creer("div","option-titre",esc(opt.label));
      if(opt.cout>0) t.appendChild(creer("span","cout","− "+opt.cout+" d."));
      b.appendChild(t);
      var dispo=!(opt.cout>0 && etat.tresor<opt.cout);
      if(!dispo){ b.classList.add("indispo"); b.disabled=true; b.appendChild(creer("div","option-sous","Trésor insuffisant")); }
      b.addEventListener("click",function(){ if(dispo) choisir(e,opt); });
      liste.appendChild(b);
    });
    bas.appendChild(liste);

    rendreJauges(malus);
    rendreScene({ perso:e.perso, expr:e.expr, ambiance:e.ambiance, nom:e.nom,
                  texte:contexte, alerte:alerte, document:e.document, html:bas });
  }

  /* ---------- décision → conséquence ---------- */
  function choisir(e,opt){
    var eff=Object.assign({},opt.effets||{}); var note="";
    if(opt.effetsSi && flags[opt.effetsSi.flag]){ eff=Object.assign({},opt.effetsSi.effets); note=opt.effetsSi.note||""; }
    var deltas={};
    if(opt.cout) deltas=fusion(deltas,appliquer({tresor:-opt.cout}));
    deltas=fusion(deltas,appliquer(eff));
    if(opt.flag) flags[opt.flag]=true;
    if(opt.persistant) persistants.push(opt.persistant);
    var revenuTxt="";
    if(e.revenuApres){
      var r=(etat.stabilite>=G.revenu.seuil)?G.revenu.haut:G.revenu.bas;
      deltas=fusion(deltas,appliquer({tresor:r}));
      revenuTxt=G.revenu.texte+" : +"+r+" d."+(etat.stabilite<G.revenu.seuil?" (réduits — province instable)":"")+".";
      persistants.forEach(function(p){ deltas=fusion(deltas,appliquer(p)); });
    }
    var positif=estPositif(deltas);
    var expr=positif?"content":"inquiet";

    var bas=creer("div");
    bas.appendChild(barreProgression(idx));
    bas.appendChild(creer("div","kicker","Conséquences"));
    var d=creer("div","deltas "+(positif?"juste":"faux"));
    d.innerHTML=listeDeltas(deltas)+(revenuTxt?'<div class="corr">'+esc(revenuTxt)+'</div>':"");
    bas.appendChild(d);
    var pq=creer("div","pourquoi");
    pq.innerHTML='<span class="pq-tete">Pourquoi&nbsp;?</span> '+esc(opt.pourquoi);
    bas.appendChild(pq);
    var act=creer("div","actions");
    var b=creer("button","btn btn-primaire",(idx<G.etapes.length-1)?"Continuer":"Fin du mandat");
    b.addEventListener("click",continuer);
    act.appendChild(b); bas.appendChild(act);

    rendreJauges(deltas);
    rendreScene({ perso:e.perso, expr:expr, ambiance:e.ambiance, nom:e.nom,
                  texte:opt.consequence+(note?" "+note:""), document:e.document, html:bas });
  }

  function listeDeltas(deltas){
    var noms={romanisation:"Romanisation",stabilite:"Stabilité",faveur:"Faveur de Rome",tresor:"Trésor"};
    var p=[];
    ["romanisation","stabilite","faveur","tresor"].forEach(function(k){
      if(deltas[k]) p.push('<span class="d-'+(deltas[k]>0?"plus":"moins")+'">'+(deltas[k]>0?"+":"")+deltas[k]+' '+noms[k]+'</span>'); });
    return p.length?p.join(" · "):"Aucun changement.";
  }

  function continuer(){
    var go=gameOver(); if(go) return finEchec(go);
    if(idx<G.etapes.length-1) etape(idx+1); else bilan();
  }

  /* ---------- fins ---------- */
  function finEchec(type){
    var f=G.echecs[type]; rendreJauges();
    var bas=creer("div");
    bas.appendChild(creer("div","kicker","Fin du mandat"));
    bas.appendChild(creer("div","titre-acte",esc(f.titre)));
    bas.appendChild(bilanJauges());
    bas.appendChild(rejouer());
    rendreScene({ perso:f.perso, expr:f.expr, ambiance:f.ambiance, nom:f.titre, texte:f.texte, html:bas });
  }
  function bilan(){
    var c=G.bilans[G.bilans.length-1];
    for(var i=0;i<G.bilans.length;i++){ var cond=G.bilans[i].si, ok=true;
      Object.keys(cond).forEach(function(k){ if(etat[k]<cond[k]) ok=false; }); if(ok){ c=G.bilans[i]; break; } }
    rendreJauges();
    var bas=creer("div");
    bas.appendChild(creer("div","kicker","Fin du mandat · Bilan"));
    bas.appendChild(creer("div","titre-acte",esc(c.titre)));
    bas.appendChild(bilanJauges());
    bas.appendChild(rejouer());
    rendreScene({ perso:c.perso, expr:c.expr, ambiance:c.ambiance, nom:"Bilan de ton mandat", texte:c.texte, html:bas });
  }
  function bilanJauges(){
    var box=creer("div","bilan-jauges");
    G.jauges.forEach(function(j){ var v=etat[j.id]; var l=creer("div","bilan-ligne");
      l.innerHTML='<span>'+esc(j.nom)+'</span><span class="bilan-v">'+v+(j.type==="res"?" deniers":" / 100")+'</span>'; box.appendChild(l); });
    return box;
  }
  function rejouer(){
    var act=creer("div","actions"); act.style.justifyContent="center";
    var b=creer("button","btn btn-primaire","Reprendre un nouveau mandat");
    b.addEventListener("click",intro); act.appendChild(b); return act;
  }

  function roman(n){ if(!n||n<=0)return "—"; var m=[[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]],r=""; for(var k=0;k<m.length;k++){while(n>=m[k][0]){r+=m[k][1];n-=m[k][0];}} return r; }

  function barreProgression(i){
    var e=G.etapes[i]||{};
    var box=creer("div","progression");
    box.appendChild(creer("div","prog-acte",esc(e.acte||"")));
    var seg=creer("div","prog-seg");
    for(var k=0;k<G.etapes.length;k++) seg.appendChild(creer("span","dot"+(k<i?" passe":"")+(k===i?" actuel":"")));
    box.appendChild(seg);
    return box;
  }

  document.addEventListener("DOMContentLoaded",intro);
  window.__LEGATUS_TEST={ get etat(){return etat;}, get flags(){return flags;}, get idx(){return idx;}, intro:intro, _set:function(o){Object.assign(etat,o);} };
})();
