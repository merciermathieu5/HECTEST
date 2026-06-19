/* =========================================================================
   ATELIER DE L'HISTORIEN — moteur (vanilla JS, sans dépendance)
   Lit window.ATELIER (assets/js/atelier-data.js).
   Mécaniques : carte/frise/grille/qcm (auto, données réelles)
                tri/comparateur/chaîne (drag, gabarits à valider)
   ========================================================================= */
(function(){
  "use strict";
  var A = window.ATELIER;
  var STORE = "atelier." + A.realiteSociale + ".v1";

  /* -------- état persistant -------- */
  function lire(){ try{ return JSON.parse(localStorage.getItem(STORE)) || {}; }catch(e){ return {}; } }
  function ecrire(s){ try{ localStorage.setItem(STORE, JSON.stringify(s)); }catch(e){} }
  var progres = lire();

  /* -------- utilitaires -------- */
  function el(sel){ return document.querySelector(sel); }
  function creer(tag, cls, html){ var n=document.createElement(tag); if(cls)n.className=cls; if(html!=null)n.innerHTML=html; return n; }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];}); }
  function melange(arr){ var a=arr.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
  function toRoman(n){ if(!n||n<=0) return "—"; var m=[[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]],r=""; for(var k=0;k<m.length;k++){ while(n>=m[k][0]){ r+=m[k][1]; n-=m[k][0]; } } return r; }
  function instrParId(id){ for(var i=0;i<A.instruments.length;i++) if(A.instruments[i].id===id) return A.instruments[i]; return null; }

  /* -------- classification d'une question réelle -------- */
  // renvoie { mode, ... } ou null si non auto-corrigeable
  var estEtiquette = function(v){ v=String(v).trim(); return /^[A-Za-z]$/.test(v) || /^\d{1,2}$/.test(v) || /^Document\s+\d+$/i.test(v); };
  function numDoc(v){ var m=String(v).match(/\d+/); return m?m[0]:String(v); }

  function classer(q){
    var c = (q.corrige||[])[0];
    if(!c) return null;
    if(c.kind==="cases") return { type:"grille" };
    if(c.kind==="avant_apres") return { type:"axe" };
    if(c.kind==="lettres"){
      var vals = c.valeurs||[];
      if(!vals.length || !vals.every(estEtiquette)) return null; // « lettres » mais texte déguisé
      var alpha = vals.some(function(v){ return /^[A-Za-z]$/.test(String(v).trim()); });
      return { type:"assoc", mode: alpha ? "alpha" : "num" };
    }
    return null; // texte
  }

  // Liste des questions jouables d'un instrument (ou null)
  function questionsJouables(instr){
    if(!instr.auto) return null;
    var qs = A.questions.filter(function(q){ return q.operation===instr.op; });
    var ok=[]; qs.forEach(function(q){ var cl=classer(q); if(cl){ q._cl=cl; ok.push(q); } });
    return ok;
  }

  /* =========================================================================
     ACCUEIL
     ========================================================================= */
  function scoreTotal(){ var t=0; Object.keys(progres).forEach(function(k){ t+=(progres[k].points||0); }); return t; }

  function vueAccueil(){
    var v = el("#vue-accueil"); v.innerHTML="";
    var sc = creer("div"); sc.style.textAlign="center"; sc.style.margin="0 0 6px";
    sc.innerHTML = '<span class="score-imperial"><span class="label">Points d\'historien</span>'+
                   '<span class="val">'+toRoman(scoreTotal())+'</span></span>';
    v.appendChild(sc);

    var p = creer("p"); p.style.textAlign="center"; p.style.color="var(--encre-doux)"; p.style.maxWidth="640px"; p.style.margin="16px auto 0";
    p.textContent = "Choisis un instrument d'historien. Chaque instrument entraîne une opération intellectuelle du programme. Les points valent I, II ou III selon la difficulté de l'opération.";
    v.appendChild(p);

    var grille = creer("div","instruments");
    A.instruments.forEach(function(instr){
      var carte = creer("button","carte-instr");
      carte.type="button";
      var pr = progres[instr.id];
      var fait = pr && pr.fait;
      if(fait) carte.classList.add("fait");

      // badge : gabarit (drag) ou à encoder
      var estDrag = ["tri","comparateur","chaine"].indexOf(instr.mecanique)>=0;
      var jouables = questionsJouables(instr);
      var aEncoder = instr.auto && jouables && jouables.length===0;
      if(estDrag) carte.appendChild(creer("span","badge-gab","Gabarit"));
      else if(aEncoder) carte.appendChild(creer("span","badge-gab","À encoder"));

      carte.appendChild(creer("span","latin",esc(instr.latin)));
      carte.appendChild(creer("span","nom",esc(instr.nom)));
      carte.appendChild(creer("span","oi",esc(instr.sous)));

      var pied = creer("div","pied");
      var nb;
      if(estDrag) nb = "1 défi";
      else if(aEncoder) nb = "contenu à venir";
      else nb = jouables.length + (jouables.length>1?" questions":" question");
      var gnb = creer("span","nb", (fait?'<span class="coche-fait">✓ </span>':'') + esc(nb));
      pied.appendChild(gnb);
      pied.appendChild(creer("span","puce-pts", toRoman(instr.points || A.ponderation[instr.op] || 1)));
      carte.appendChild(pied);

      carte.addEventListener("click", function(){ ouvrirInstrument(instr.id); });
      grille.appendChild(carte);
    });
    v.appendChild(grille);

    var resetWrap = creer("div"); resetWrap.style.textAlign="center"; resetWrap.style.marginTop="26px";
    var reset = creer("button","btn btn-second","Réinitialiser ma progression");
    reset.addEventListener("click", function(){ if(confirm("Effacer ta progression et tes points ?")){ progres={}; ecrire(progres); vueAccueil(); } });
    resetWrap.appendChild(reset);
    v.appendChild(resetWrap);

    montrer("accueil");
  }

  /* =========================================================================
     INSTRUMENT
     ========================================================================= */
  var ctx = null; // contexte de session pour l'instrument courant

  function ouvrirInstrument(id){
    var instr = instrParId(id);
    var estDrag = ["tri","comparateur","chaine"].indexOf(instr.mecanique)>=0;
    var jouables = estDrag ? null : questionsJouables(instr);

    ctx = { instr:instr, estDrag:estDrag, index:0, points:0, max:0, etats:[] };

    if(estDrag){
      ctx.defis = [ A.drag[instr.id] ];   // un gabarit
    } else if(jouables.length===0){
      return vueAEncoder(instr);          // « Établir des faits » : rien d'auto
    } else {
      ctx.defis = jouables;
    }
    rendreDefi();
  }

  function vueAEncoder(instr){
    var v = el("#vue-instrument"); v.innerHTML="";
    v.appendChild(teteInstrument(instr));
    var c = creer("div","q-carte");
    c.innerHTML = '<p class="q-prompt">Cet instrument est prêt, mais le contenu reste à encoder.</p>'+
      '<p style="color:var(--encre-doux)">Dans ta banque, l\'opération « '+esc(instr.op)+' » pour la romanisation ne contient que des réponses ouvertes (corrigés <code>texte</code>). '+
      'Le moteur du jeu attend, pour cet instrument, soit des questions à corrigé <code>lettres</code>/<code>cases</code>, soit un bloc <code>drag</code> comme pour les autres instruments à gabarit. '+
      'Une fois ce contenu encodé dans <code>questions.json</code>, l\'instrument deviendra jouable automatiquement.</p>';
    v.appendChild(c);
    var act = creer("div","actions");
    var retour = creer("button","btn btn-second","← Retour aux instruments");
    retour.addEventListener("click", vueAccueil);
    act.appendChild(retour);
    v.appendChild(act);
    montrer("instrument");
  }

  function teteInstrument(instr){
    var t = creer("div","instr-tete");
    t.innerHTML = '<div class="titre"><div class="latin">'+esc(instr.latin)+'</div>'+
                  '<h2>'+esc(instr.nom)+'</h2><div class="oi">'+esc(instr.sous)+
                  ' · vaut '+toRoman(instr.points||A.ponderation[instr.op]||1)+' point(s)</div></div>';
    var btn = creer("button","btn btn-second","← Instruments");
    btn.addEventListener("click", vueAccueil);
    t.appendChild(btn);
    return t;
  }

  function rendreVoie(){
    var voie = creer("div","voie");
    for(var i=0;i<ctx.defis.length;i++){
      var b = creer("span","borne");
      if(i<ctx.index) b.classList.add(ctx.etats[i] ? "ok":"ko");
      else if(i===ctx.index) b.classList.add("active");
      voie.appendChild(b);
    }
    voie.appendChild(creer("span","voie-txt","Étape "+(ctx.index+1)+" / "+ctx.defis.length));
    return voie;
  }

  function rendreDefi(){
    var v = el("#vue-instrument"); v.innerHTML="";
    var instr = ctx.instr;
    v.appendChild(teteInstrument(instr));
    v.appendChild(rendreVoie());

    var defi = ctx.defis[ctx.index];
    var carte = creer("div","q-carte");

    var corps; // objet mécanique avec .corriger() -> {bon,total}
    if(ctx.estDrag){
      if(defi._gabarit){
        carte.appendChild(bandeauGabarit(defi));
      }
      carte.appendChild(creer("p","q-prompt",esc(defi.prompt)));
      if(defi.type==="chaine") corps = mecChaine(carte, defi);
      else corps = mecTri(carte, defi); // tri & comparateur
    } else {
      var q = defi;
      carte.appendChild(creer("p","q-prompt",esc(q.questionBody.prompt)));
      if(q.questionBody.bullets && q.questionBody.bullets.length){
        var ul=creer("ul","q-bullets"); q.questionBody.bullets.forEach(function(b){ ul.appendChild(creer("li",null,esc(b))); }); carte.appendChild(ul);
      }
      carte.appendChild(rendreDocuments(q));
      if(q._cl.type==="grille") corps = mecGrille(carte, q);
      else if(q._cl.type==="axe") corps = mecAxe(carte, q);
      else corps = mecAssoc(carte, q);
    }

    var retro = creer("div","retro"); retro.id="retro";
    carte.appendChild(retro);

    var act = creer("div","actions");
    var verifier = creer("button","btn btn-primaire","Vérifier");
    var suivant = creer("button","btn btn-second", (ctx.index < ctx.defis.length-1) ? "Suivant →" : "Terminer ✓");
    suivant.disabled = true;
    act.appendChild(verifier); act.appendChild(suivant);
    carte.appendChild(act);
    v.appendChild(carte);

    verifier.addEventListener("click", function(){
      var r = corps.corriger();
      var pts = Math.round((instr.points||A.ponderation[instr.op]||1) * (r.total ? r.bon/r.total : 0));
      var juste = r.bon===r.total;
      ctx.etats[ctx.index] = juste;
      ctx.points += pts; ctx.max += (instr.points||A.ponderation[instr.op]||1);
      afficherRetro(retro, juste, r, pts);
      verifier.disabled = true;
      suivant.disabled = false;
      // rafraîchir la voie
      var old = v.querySelector(".voie"); if(old){ old.replaceWith(rendreVoie()); }
    });

    suivant.addEventListener("click", function(){
      if(ctx.index < ctx.defis.length-1){ ctx.index++; rendreDefi(); }
      else { finInstrument(); }
    });

    montrer("instrument");
  }

  function bandeauGabarit(defi){
    var b = creer("div","bandeau-gab");
    b.innerHTML = '<span>▲</span><span><b>Gabarit à valider.</b> La mécanique est réelle, mais les éléments à classer sont une proposition'+
      (defi.ancre? ' ancrée sur ta question <code>'+esc(defi.ancre)+'</code>' : '')+
      '. Remplace-les par ton contenu validé dans le bloc <code>drag</code> de <code>atelier-data.js</code>.</span>';
    return b;
  }

  function afficherRetro(node, juste, r, pts){
    node.className = "retro montre " + (juste?"juste":"faux");
    var t = juste ? "Juste ! " : "Presque. ";
    var d = "<strong>"+t+"</strong>" + r.bon + " / " + r.total + " élément(s) correct(s) — "+toRoman(pts)+" point(s).";
    if(r.corr) d += '<div class="corr">'+r.corr+'</div>';
    node.innerHTML = d;
  }

  function finInstrument(){
    var instr = ctx.instr;
    progres[instr.id] = { fait:true, points: Math.max((progres[instr.id]&&progres[instr.id].points)||0, ctx.points), max: ctx.max };
    ecrire(progres);
    vueSynthese(instr, ctx.points, ctx.max);
  }

  /* =========================================================================
     MÉCANIQUE : ASSOC (associer chaque item à un document / une lettre)
     ========================================================================= */
  function mecAssoc(carte, q){
    var rs = q.questionBody.responseSpace[0];
    var items = (rs && rs.items) || [];
    var vals = q.corrige[0].valeurs;
    var mode = q._cl.mode;
    var options;
    if(mode==="alpha"){
      var maxL = 65; vals.forEach(function(v){ var ch=String(v).trim().toUpperCase().charCodeAt(0); if(ch>maxL) maxL=ch; });
      options=[]; for(var c=65;c<=Math.max(maxL,67);c++) options.push(String.fromCharCode(c)); // au moins A,B,C
    } else {
      var n = q.documents.length || vals.length;
      options=[]; for(var i=1;i<=n;i++) options.push(String(i));
    }
    var rep = new Array(items.length).fill(null);
    var wrap = creer("div");
    items.forEach(function(it, idx){
      var ligne = creer("div","assoc-ligne");
      ligne.appendChild(creer("span","assoc-label",esc(it)));
      var ch = creer("div","choix");
      options.forEach(function(op){
        var b = creer("button","opt"); b.type="button"; b.textContent=op;
        b.addEventListener("click", function(){
          rep[idx]=op;
          ch.querySelectorAll(".opt").forEach(function(x){ x.classList.remove("sel"); });
          b.classList.add("sel");
        });
        ch.appendChild(b);
      });
      ligne.appendChild(ch);
      wrap.appendChild(ligne);
    });
    carte.appendChild(wrap);
    return { corriger:function(){
      var bon=0; var bonnes=[];
      vals.forEach(function(v,i){ var attendu=numDocOuLettre(v,mode); bonnes.push(attendu); if(rep[i]!=null && String(rep[i])===attendu) bon++; });
      return { bon:bon, total:vals.length, corr:"Bonnes réponses : "+bonnes.map(esc).join(", ") };
    }};
  }
  function numDocOuLettre(v,mode){ if(mode==="alpha") return String(v).trim().toUpperCase(); return numDoc(v); }

  /* =========================================================================
     MÉCANIQUE : AXE (avant / après un pivot)
     ========================================================================= */
  function mecAxe(carte, q){
    var rs = q.questionBody.responseSpace[0];
    var corr = q.corrige[0];
    var libelles = {}; // "Document N" -> avant|apres attendu
    (corr.avant||[]).forEach(function(t){ libelles[t]="avant"; });
    (corr.apres||[]).forEach(function(t){ libelles[t]="apres"; });

    var axe = creer("div","axe");
    var zAv = creer("div","axe-zone"); zAv.innerHTML='<h4>'+esc(rs.beforeLabel||"Avant")+'</h4>';
    var piv = creer("div","axe-pivot",esc(rs.pivot||"Pivot"));
    var zAp = creer("div","axe-zone"); zAp.innerHTML='<h4>'+esc(rs.afterLabel||"Après")+'</h4>';
    axe.appendChild(zAv); axe.appendChild(piv); axe.appendChild(zAp);
    carte.appendChild(axe);

    var rep = {};
    Object.keys(libelles).forEach(function(lib){
      var jeton = creer("div","jeton");
      jeton.innerHTML = esc(lib);
      var bAv=creer("button","opt"); bAv.type="button"; bAv.textContent="◀ Avant";
      var bAp=creer("button","opt"); bAp.type="button"; bAp.textContent="Après ▶";
      function maj(sel){ rep[lib]=sel; bAv.classList.toggle("sel",sel==="avant"); bAp.classList.toggle("sel",sel==="apres"); }
      bAv.addEventListener("click",function(){maj("avant");});
      bAp.addEventListener("click",function(){maj("apres");});
      var ctr=creer("span","fleches"); ctr.appendChild(bAv); ctr.appendChild(bAp);
      jeton.appendChild(ctr);
      carte.appendChild(jeton);
    });

    return { corriger:function(){
      var bon=0,total=0,corrTxt=[];
      Object.keys(libelles).forEach(function(lib){ total++; if(rep[lib]===libelles[lib]) bon++; corrTxt.push(esc(lib)+" : "+(libelles[lib]==="avant"?"avant":"après")); });
      return { bon:bon, total:total, corr:"Placement attendu — "+corrTxt.join(" ; ") };
    }};
  }

  /* =========================================================================
     MÉCANIQUE : GRILLE (tableau à cocher)
     ========================================================================= */
  function mecGrille(carte, q){
    var rs = q.questionBody.responseSpace[0];
    var cols = rs.columns||[], rows = rs.rows||[];
    var corr = q.corrige[0].lignes||[];
    var t = creer("table","grille");
    var thead = creer("thead"); var trh=creer("tr"); trh.appendChild(creer("th",null,""));
    cols.forEach(function(c){ trh.appendChild(creer("th",null,esc(c))); }); thead.appendChild(trh); t.appendChild(thead);
    var tbody=creer("tbody");
    var boites=[];
    rows.forEach(function(r,ri){
      var tr=creer("tr"); tr.appendChild(creer("th",null,esc(r)));
      boites[ri]=[];
      cols.forEach(function(c,ci){
        var td=creer("td"); var cb=document.createElement("input"); cb.type="checkbox";
        cb.setAttribute("aria-label",esc(r)+" — "+esc(c));
        boites[ri][ci]=cb; td.appendChild(cb); tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    t.appendChild(tbody); carte.appendChild(t);

    return { corriger:function(){
      var bon=0,total=0;
      for(var ri=0;ri<rows.length;ri++){ for(var ci=0;ci<cols.length;ci++){
        total++; var attendu = !!(corr[ri]&&corr[ri].cochees&&corr[ri].cochees[ci]&&corr[ri].cochees[ci].coche);
        if(boites[ri][ci].checked===attendu) bon++;
      }}
      return { bon:bon, total:total, corr:"Coche uniquement la bonne correspondance sur chaque ligne." };
    }};
  }

  /* =========================================================================
     MÉCANIQUE : TRI / COMPARATEUR (glisser-déposer, clic-pour-placer accessible)
     ========================================================================= */
  function mecTri(carte, defi){
    var zonesDef = defi.zones;
    var items = melange(defi.items);
    var placement = {}; // itemId -> zoneId (ou null = réserve)
    items.forEach(function(it){ placement[it.id]=null; });
    var selId = null;

    var aide = creer("p"); aide.style.fontSize="13.5px"; aide.style.color="var(--encre-doux)";
    aide.textContent = "Glisse chaque étiquette dans une zone — ou clique une étiquette puis une zone.";
    carte.appendChild(aide);

    var reserve = creer("div","reserve");
    var conteneurZones = creer("div","zones");
    var zonesEls = {};
    zonesDef.forEach(function(z){
      var box = creer("div","zone"); box.innerHTML='<h4>'+esc(z.label)+'</h4>';
      box.dataset.zone = z.id;
      brancherZone(box, z.id);
      conteneurZones.appendChild(box);
      zonesEls[z.id]=box;
    });
    carte.appendChild(reserve);
    carte.appendChild(conteneurZones);
    brancherZone(reserve, null);

    function tuileEl(it){
      var t = creer("div","tuile"); t.textContent=it.texte; t.dataset.id=it.id;
      t.setAttribute("draggable","true"); t.tabIndex=0;
      t.addEventListener("dragstart", function(e){ e.dataTransfer.setData("text/plain", it.id); });
      t.addEventListener("click", function(){ selId = (selId===it.id?null:it.id); rendre(); });
      t.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); selId=(selId===it.id?null:it.id); rendre(); } });
      if(selId===it.id) t.style.outline="3px solid var(--pourpre)";
      return t;
    }
    function brancherZone(box, zoneId){
      box.addEventListener("dragover", function(e){ e.preventDefault(); box.classList.add("survol"); });
      box.addEventListener("dragleave", function(){ box.classList.remove("survol"); });
      box.addEventListener("drop", function(e){ e.preventDefault(); box.classList.remove("survol"); var id=e.dataTransfer.getData("text/plain"); if(id){ placement[id]=zoneId; selId=null; rendre(); } });
      box.addEventListener("click", function(e){ if(e.target!==box && e.target.tagName!=="H4") return; if(selId){ placement[selId]=zoneId; selId=null; rendre(); } });
    }
    function rendre(){
      reserve.querySelectorAll(".tuile").forEach(function(n){n.remove();});
      Object.keys(zonesEls).forEach(function(z){ zonesEls[z].querySelectorAll(".tuile").forEach(function(n){n.remove();}); });
      items.forEach(function(it){
        var cible = placement[it.id]===null ? reserve : zonesEls[placement[it.id]];
        cible.appendChild(tuileEl(it));
      });
    }
    rendre();

    return { corriger:function(){
      var bon=0;
      defi.items.forEach(function(it){ if(placement[it.id]===it.zone) bon++; });
      // marquage visuel
      items.forEach(function(it){
        var n = (placement[it.id]===null?reserve:zonesEls[placement[it.id]]).querySelector('.tuile[data-id="'+it.id+'"]');
        if(n) n.classList.add(placement[it.id]===it.zone?"ok":"ko");
      });
      var legende = zonesDef.map(function(z){ return esc(z.label); }).join(" · ");
      return { bon:bon, total:defi.items.length, corr:"Zones : "+legende };
    }};
  }

  /* =========================================================================
     MÉCANIQUE : CHAÎNE (ordonner les maillons)
     ========================================================================= */
  function mecChaine(carte, defi){
    var ordre = melange(defi.items).map(function(i){return i.id;});
    var parId={}; defi.items.forEach(function(i){ parId[i.id]=i; });

    var aide = creer("p"); aide.style.fontSize="13.5px"; aide.style.color="var(--encre-doux)";
    aide.textContent = "Ordonne les maillons du premier (cause initiale) au dernier (impact). Utilise les flèches ▲ ▼.";
    carte.appendChild(aide);

    var liste = creer("div","chaine");
    carte.appendChild(liste);
    function rendre(){
      liste.innerHTML="";
      ordre.forEach(function(id, i){
        var m = creer("div","maillon");
        m.appendChild(creer("span","rang",toRoman(i+1)));
        m.appendChild(creer("span",null,esc(parId[id].texte)));
        var ctr=creer("span"); ctr.style.marginLeft="auto"; ctr.style.display="flex"; ctr.style.gap="6px";
        var up=creer("button","opt"); up.type="button"; up.textContent="▲"; up.setAttribute("aria-label","Monter"); up.disabled=(i===0);
        var dn=creer("button","opt"); dn.type="button"; dn.textContent="▼"; dn.setAttribute("aria-label","Descendre"); dn.disabled=(i===ordre.length-1);
        up.addEventListener("click",function(){ var t=ordre[i-1];ordre[i-1]=ordre[i];ordre[i]=t; rendre(); });
        dn.addEventListener("click",function(){ var t=ordre[i+1];ordre[i+1]=ordre[i];ordre[i]=t; rendre(); });
        ctr.appendChild(up); ctr.appendChild(dn);
        m.appendChild(ctr);
        m.dataset.id=id;
        liste.appendChild(m);
      });
    }
    rendre();

    return { corriger:function(){
      var bon=0;
      ordre.forEach(function(id,i){ if(defi.ordre[i]===id) bon++; });
      liste.querySelectorAll(".maillon").forEach(function(n,i){ n.classList.add(defi.ordre[i]===n.dataset.id?"ok":"ko"); });
      var bonneSuite = defi.ordre.map(function(id,i){ return toRoman(i+1)+". "+esc(parId[id].texte); }).join("  →  ");
      return { bon:bon, total:defi.ordre.length, corr:"Ordre attendu : "+bonneSuite };
    }};
  }

  /* =========================================================================
     DOCUMENTS
     ========================================================================= */
  function rendreDocuments(q){
    var box = creer("div","docs");
    (q.documents||[]).forEach(function(d){
      var dv = creer("div","doc");
      if(d.title) dv.appendChild(creer("div","doc-tete",esc(d.title)));
      if(d.imageUrl){ var img=document.createElement("img"); img.src=d.imageUrl; img.alt=d.title||"Document"; img.loading="lazy"; dv.appendChild(img); }
      if(d.text) dv.appendChild(creer("div","doc-txt",esc(d.text)));
      if(d.sources && d.sources.length) dv.appendChild(creer("div","doc-src",esc(d.sources.join(" "))));
      box.appendChild(dv);
    });
    return box;
  }

  /* =========================================================================
     SYNTHÈSE
     ========================================================================= */
  function vueSynthese(instr, pts, max){
    var v = el("#vue-synthese"); v.innerHTML="";
    var s = creer("div","synthese");
    s.innerHTML = '<h2>'+esc(instr.nom)+'</h2>'+
      '<div class="oi" style="color:var(--encre-doux)">'+esc(instr.sous)+'</div>'+
      '<div class="grand">'+toRoman(pts)+'</div>'+
      '<div style="color:var(--encre-doux)">soit '+pts+' / '+max+' points pour cet instrument</div>';

    // récap global
    var recap = creer("div","recap");
    A.instruments.forEach(function(it){
      var pr = progres[it.id]; if(!pr || !pr.fait) return;
      var ratio = pr.max ? Math.round(100*pr.points/pr.max) : 0;
      var ligne = creer("div","recap-ligne");
      ligne.innerHTML = '<span class="oi-nom">'+esc(it.nom)+'</span>'+
        '<span class="barre"><i style="width:'+ratio+'%"></i></span>'+
        '<span class="oi-sc">'+toRoman(pr.points)+'</span>';
      recap.appendChild(ligne);
    });
    if(recap.children.length){ s.appendChild(creer("h3",null,"")); s.appendChild(recap); }

    var act = creer("div","actions"); act.style.justifyContent="center"; act.style.marginTop="24px";
    var rejouer = creer("button","btn btn-second","Rejouer cet instrument");
    rejouer.addEventListener("click", function(){ ouvrirInstrument(instr.id); });
    var retour = creer("button","btn btn-primaire","Tous les instruments");
    retour.addEventListener("click", vueAccueil);
    act.appendChild(rejouer); act.appendChild(retour);
    s.appendChild(act);
    v.appendChild(s);
    montrer("synthese");
  }

  /* =========================================================================
     NAVIGATION DE VUES
     ========================================================================= */
  function montrer(nom){
    ["accueil","instrument","synthese"].forEach(function(n){
      el("#vue-"+n).classList.toggle("hidden", n!==nom);
    });
    window.scrollTo({top:0, behavior:"smooth"});
  }

  /* -------- démarrage -------- */
  document.addEventListener("DOMContentLoaded", vueAccueil);
})();
