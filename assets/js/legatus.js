/* =========================================================================
   LEGATUS, moteur de simulation, scène « bande dessinée »
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

  var etat, flags, persistants, idx, enRevolte, DIFF;
  var GEN_VERROU=0;   // jeton de génération : invalide un compte à rebours quand la scène change

  // pont vers la trame sonore (sans planter si l'audio est indisponible)
  function son(m,a,b){ try{ var A=window.AudioLegatus; if(A&&A[m]) A[m](a,b); }catch(e){} }
  function etatSonore(){ return { enRevolte:enRevolte, idx:idx, total:(G.etapes?G.etapes.length:1) }; }

  function diffDefaut(){
    return (G.difficultes && G.difficultes[G.difficultes.defaut||"legat"]) ||
           { nom:"Légat", seuilRevolte:30, seuilPaix:42, attenuation:0.5, bleed:2, revenuMod:1, malusActeMod:1 };
  }
  function init(){ etat=Object.assign({},G.etatInitial); flags={}; persistants=[]; idx=0; enRevolte=false; if(!DIFF)DIFF=diffDefaut(); }

  function el(s){ return document.querySelector(s); }
  function creer(t,c,h){ var n=document.createElement(t); if(c)n.className=c; if(h!=null)n.innerHTML=h; return n; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];}); }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function classeSeuil(v){ return v>=50?"ok":(v>=25?"moyen":"bas"); }
  function persoSrc(role,expr){ return "assets/img/perso/"+role+"-"+expr+".svg"; }
  function docSrc(d){ return "assets/img/"+d+".png"; }
  var DOCLEG = { empire:"Carte de l'Empire", curie:"La curie", cirque:"Les jeux du cirque" };

  function bilanRevenu(){
    var commerce=0, entretien=0;
    persistants.forEach(function(p){ var v=(p&&p.tresor)||0; if(v>=0) commerce+=v; else entretien+=v; });
    var base = enRevolte ? 0 : Math.round(((etat.stabilite>=G.revenu.seuil)?G.revenu.haut:G.revenu.bas)*(DIFF.revenuMod||1));
    if(enRevolte) commerce=0;            // commerce paralysé par la révolte ; l'entretien continue de peser
    return { base:base, commerce:commerce, entretien:entretien, net:base+commerce+entretien };
  }
  function revenuActuel(){ if(!DIFF) return 0; return bilanRevenu().net; }

  /* ---------- jauges ---------- */
  function rendreJauges(deltas){
    var b=el("#jauges"); b.innerHTML="";
    if(enRevolte) b.appendChild(creer("div","revolte-banner","\u2694 Province en révolte, progrès entravés, impôts suspendus"));
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
      if(j.id==="tresor"){
        var r=revenuActuel();
        var txt=(r>=0?"+"+r:""+r)+" d. / tour"+(enRevolte?" (révolte)":"");
        corps.appendChild(creer("div","jauge-revenu"+(r<=0?" nul":""), txt));
      }
      carte.appendChild(corps); b.appendChild(carte);
    });
  }

  /* ---------- effets ---------- */
  function appliquer(eff){ var d={}; Object.keys(eff||{}).forEach(function(k){ var a=etat[k];
    etat[k]=(k==="tresor")?Math.max(0,etat[k]+eff[k]):clamp(etat[k]+eff[k],0,100); d[k]=etat[k]-a; }); return d; }
  function fusion(a,b){ var r=Object.assign({},a); Object.keys(b||{}).forEach(function(k){ r[k]=(r[k]||0)+b[k]; }); return r; }
  function gameOver(){ if(etat.stabilite<=0)return "stabilite"; if(etat.faveur<=0)return "faveur"; return null; }
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
      enRevolte=true; ajoute(deltas, appliquer({faveur:-5}));
      return "\u2694 Une province se soulève ! Tant qu'elle gronde, les progrès de la Romanisation et de la Faveur sont freinés et les impôts ne rentrent plus. Rétablis la stabilité (\u2265 "+DIFF.seuilPaix+") pour la pacifier.";
    }
    if(enRevolte && etat.stabilite >= DIFF.seuilPaix){
      enRevolte=false; return "\u2714 La province est pacifiée : l'ordre revient et les progrès reprennent.";
    }
    if(enRevolte){
      ajoute(deltas, appliquer({stabilite:-(DIFF.bleed||0)}));
      return "\u2694 La révolte couve toujours… Rétablis l'ordre (stabilité \u2265 "+DIFF.seuilPaix+") pour y mettre fin.";
    }
    return "";
  }

  /* ---------- scène (case BD) ---------- */
  function rendreScene(o){
    // o : {perso, expr, ambiance, nom, texte, alerte, document, docs[], html}
    var scene=el("#scene"); scene.innerHTML="";
    var row=creer("div","scene-doc");
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
        src.appendChild(creer("div","src-ref",esc(d.ref)));
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
      box.appendChild(creer("div","diff-intro","Plus le niveau est élevé, plus une province se soulève tôt. Une révolte freine la Romanisation et la Faveur et suspend les impôts : il faut rétablir l'ordre avant tout."));
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
    window.scrollTo({top:0,behavior:"smooth"});
  }

  /* ---------- intro ---------- */
  function intro(){
    init(); rendreJauges();
    var I=G.intro;
    var bas=creer("div","intro-bas");
    bas.appendChild(creer("div","kicker","An de Rome \u00b7 Mandat I"));
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
        avert="Rome juge tes progrès de romanisation insuffisants : la faveur de l'empereur chute. Romanise la province, ou tu seras rappelé.";
      }
      if(e.controleRome.faveurRappel!==undefined){
        if(etat.faveur < e.controleRome.faveurRappel) return finEchec("faveur");
        if(etat.faveur < e.controleRome.faveurRappel+10){
          var w="L'empereur s'impatiente : ta faveur est dangereusement basse. Remonte-la, ou Rome te rappellera.";
          avert = avert ? (avert+" "+w) : w;
        }
      }
    }
    var go=gameOver(); if(go) return finEchec(go);
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
      if(opt.cout>0) t.appendChild(creer("span","cout","− "+opt.cout+" d."));
      b.appendChild(t);
      var dispo=!(opt.cout>0 && etat.tresor<opt.cout);
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
    var noms={romanisation:"Romanisation",stabilite:"Stabilité",faveur:"Faveur de Rome",tresor:"Trésor"};
    var wrap=creer("div","modal-deltas"); var any=false;
    ["romanisation","stabilite","faveur","tresor"].forEach(function(k){
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
    if(opt.flag) flags[opt.flag]=true;
    if(opt.persistant) persistants.push(opt.persistant);
    var revenuTxt="";
    if(e.revenuApres){
      var rb=bilanRevenu();
      if(rb.net) deltas=fusion(deltas,appliquer({tresor:rb.net}));
      if(enRevolte){
        revenuTxt = "Impôts suspendus (révolte)"+(rb.entretien?" · entretien "+rb.entretien+" d.":"")+" → "+(rb.net>=0?"+":"")+rb.net+" d. ce tour.";
      } else {
        var pcs=["impôts +"+rb.base+" d."];
        if(rb.commerce) pcs.push("commerce +"+rb.commerce+" d.");
        if(rb.entretien) pcs.push("entretien "+rb.entretien+" d.");
        revenuTxt = G.revenu.texte+" : "+pcs.join(" · ")+" → "+(rb.net>=0?"+":"")+rb.net+" d. ce tour"+(etat.stabilite<G.revenu.seuil?" (impôts réduits, province instable)":"")+".";
      }
    }
    var revolteTxt = majRevolte(deltas);
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

    // explication pédagogique
    var pq=creer("div","pourquoi");
    pq.innerHTML='<span class="pq-tete">Pourquoi&nbsp;?</span> '+esc(opt.pourquoi);
    carte.appendChild(pq);

    // action : poursuivre
    var act=creer("div","actions modal-actions");
    var b=creer("button","btn btn-primaire",(idx<G.etapes.length-1)?"Continuer":"Fin du mandat");
    b.addEventListener("click",function(){ fermerModale(); continuer(); });
    act.appendChild(b); carte.appendChild(act);

    ouvrirModale(carte);
    son("evenement","choix"); son("refleter", etat, etatSonore());
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
    son("evenement","echec");
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
    son("evenement", (etat.romanisation>=70 && etat.faveur>=55 && etat.stabilite>=45) ? "triomphe" : "fin");
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
  window.__LEGATUS_TEST={ get etat(){return etat;}, get flags(){return flags;}, get idx(){return idx;},
    get enRevolte(){return enRevolte;}, get diff(){return DIFF;},
    intro:intro, choisirDifficulte:choisirDifficulte, etape:etape, interlude:interlude,
    setDiff:function(k){ DIFF=(G.difficultes&&G.difficultes[k])||DIFF; },
    _set:function(o){Object.assign(etat,o);} };
})();
