/* =========================================================================
   LEGATUS — trame sonore générative (Web Audio API, sans fichier audio)
   Un fond modal « antique » qui respire ; un cœur/tambour qui s'accélère et
   une dissonance qui monte quand la province vacille ; des accents ponctuels
   (révolte, triomphe, destitution, changement d'acte). Tout est synthétisé.
   API : AudioLegatus.demarrer() · refleter(etat,info) · evenement(type)
         · basculerMuet() · estMuet()
   ========================================================================= */
window.AudioLegatus = (function(){
  "use strict";
  var ctx=null, master=null, dispo=true, demarre=false, muet=false;
  var padFiltre=null, lfo=null, lfoGain=null, sousGain=null, airGain=null, dissGain=null;
  var voixMin=null, voixMaj=null, voix=[];
  var cible={ inten:0.10, majeur:false }, courant={ inten:0.10 };
  var airBase=0.015, revolteAvant=false, arpPos=0, prochain=0, pas=0, horloge=null;

  var R=146.83;                                  // Ré3, fondamentale modale
  function n(s){ return R*Math.pow(2, s/12); }
  // gammes pentatoniques pour l'arpège (mineur antique / clair)
  var GAMME_MIN=[n(0),n(3),n(5),n(7),n(10),n(12),n(15),n(19)];
  var GAMME_MAJ=[n(0),n(2),n(4),n(7),n(9),n(12),n(16),n(19)];
  var MOTIF=[0,2,4,2,5,3,1,3,4,6,4,2];           // marche mélodique douce

  function lire(){ try{ return localStorage.getItem("legatus-muet")==="1"; }catch(e){ return false; } }
  function ecrire(v){ try{ localStorage.setItem("legatus-muet", v?"1":"0"); }catch(e){} }

  /* ---------- briques sonores ---------- */
  function voixPad(freq, gain, type, dest){
    var o=ctx.createOscillator(); o.type=type||"sine"; o.frequency.value=freq;
    o.detune.value=(Math.random()*7-3.5);
    var g=ctx.createGain(); g.gain.value=0;
    o.connect(g); g.connect(dest||padFiltre); o.start();
    g.gain.setTargetAtTime(gain, ctx.currentTime, 1.6);
    return { o:o, g:g, base:gain };
  }
  function frappe(t, force, grave){               // tambour / cœur
    var o=ctx.createOscillator(), g=ctx.createGain();
    o.type="sine"; o.connect(g); g.connect(master);
    o.frequency.setValueAtTime(grave?96:140, t);
    o.frequency.exponentialRampToValueAtTime(grave?34:46, t+0.16);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(force, t+0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t+(grave?0.5:0.32));
    o.start(t); o.stop(t+(grave?0.55:0.36));
  }
  function pince(t, freq, force, doux){            // note d'arpège / mélodie
    var o=ctx.createOscillator(), g=ctx.createGain(), f=ctx.createBiquadFilter();
    o.type=doux?"sine":"triangle"; f.type="lowpass"; f.frequency.value=1700;
    o.connect(f); f.connect(g); g.connect(master); o.frequency.value=freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(force, t+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t+(doux?1.6:0.95));
    o.start(t); o.stop(t+(doux?1.7:1.0));
  }

  /* ---------- montage ---------- */
  function init(){
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){ dispo=false; return; }
    ctx=new AC();
    master=ctx.createGain(); master.gain.value=0; master.connect(ctx.destination);
    padFiltre=ctx.createBiquadFilter(); padFiltre.type="lowpass";
    padFiltre.frequency.value=720; padFiltre.Q.value=0.7; padFiltre.connect(master);
    lfo=ctx.createOscillator(); lfo.frequency.value=0.06;
    lfoGain=ctx.createGain(); lfoGain.gain.value=170;
    lfo.connect(lfoGain); lfoGain.connect(padFiltre.frequency); lfo.start();

    // accord de base (toujours présent)
    voix.push(voixPad(n(0),  0.075, "sine"));      // fondamentale Ré
    voix.push(voixPad(n(7),  0.060, "sine"));      // quinte La
    voix.push(voixPad(n(12), 0.034, "triangle"));  // octave Ré
    voixMin=voixPad(n(3), 0.066, "sine");          // tierce mineure (mode sombre)
    voixMaj=voixPad(n(4), 0.060, "sine"); voixMaj.g.gain.value=0; // tierce majeure (mode clair)

    // sub grave (poids / menace), dissonance (tritone), souffle aigu (sacré)
    var s=voixPad(n(-12), 0.0, "sine", master); sousGain=s.g; s.base=0.18;
    var d=voixPad(n(6),   0.0, "sine");          dissGain=d.g; d.base=0.14;  // Ab : tension
    var a=voixPad(n(24),  0.0, "sine", master);  airGain=a.g;  a.base=0.05;  // Ré5 chatoyant

    prochain=ctx.currentTime+0.1; pas=0;
    horloge=setInterval(boucle, 60);
  }

  function appliquerAccord(){
    if(!ctx) return; var t=ctx.currentTime;
    voixMin.g.gain.setTargetAtTime(cible.majeur?0:voixMin.base, t, 1.3);
    voixMaj.g.gain.setTargetAtTime(cible.majeur?voixMaj.base:0, t, 1.3);
  }
  function appliquerTimbre(){                       // appelé sur changement d'état
    if(!ctx) return; var t=ctx.currentTime, i=cible.inten;
    master.gain.setTargetAtTime(muet?0:(0.12+0.085*i), t, 0.5);
    padFiltre.frequency.setTargetAtTime(cible.majeur?1020:(740-i*330), t, 0.9);
    sousGain.gain.setTargetAtTime(muet?0:(0.04+0.13*i), t, 0.9);
    dissGain.gain.setTargetAtTime(muet?0:(Math.max(0,i-0.42)*0.16), t, 0.9);
  }

  /* ---------- séquenceur (cœur + arpège) ---------- */
  function jouerPas(p, t){
    var i=courant.inten;
    if(i>0.16){
      frappe(t, 0.09+i*0.30);
      if(i>0.62) frappe(t + 0.5*(60/(48+i*66))/1, 0.05+i*0.13); // contretemps sous forte tension
    }
    var espace = i<0.30?4 : (i<0.60?2:1);
    if(p % espace === 0 && Math.random()>0.18){
      var gamme = cible.majeur?GAMME_MAJ:GAMME_MIN;
      var f = gamme[ MOTIF[arpPos % MOTIF.length] % gamme.length ]; arpPos++;
      pince(t, f, 0.045 + i*0.02, i<0.5);
    }
  }
  function boucle(){
    if(!ctx) return;
    courant.inten += (cible.inten - courant.inten)*0.07;
    var t=ctx.currentTime;
    while(prochain < t+0.25){
      jouerPas(pas, prochain);
      prochain += 60/(48 + courant.inten*66);     // 48→114 bpm
      pas++;
    }
  }

  /* ---------- accents ponctuels ---------- */
  function rouleau(t){                              // entrée en révolte
    for(var k=0;k<6;k++) frappe(t+k*0.12, 0.14+(k>3?0.07:0));
    frappe(t, 0.22, true);
    dissGain.gain.cancelScheduledValues(t);
    dissGain.gain.setTargetAtTime(0.13, t, 0.05);
    dissGain.gain.setTargetAtTime(Math.max(0,cible.inten-0.42)*0.16, t+1.7, 0.9);
    padFiltre.frequency.setTargetAtTime(360, t, 0.1);
    padFiltre.frequency.setTargetAtTime(740-cible.inten*330, t+1.8, 1.0);
  }
  function triomphe(t){
    cible.majeur=true; appliquerAccord();
    [n(0),n(4),n(7),n(12),n(16),n(19)].forEach(function(f,k){
      pince(t+k*0.17, f, 0.07); pince(t+k*0.17, f*2, 0.035, true);
    });
    airGain.gain.setTargetAtTime(muet?0:0.11, t, 0.5);
    airGain.gain.setTargetAtTime(muet?0:airBase, t+4, 2);
    padFiltre.frequency.setTargetAtTime(1200, t, 0.6);
    master.gain.setTargetAtTime(muet?0:0.2, t, 0.5);
  }
  function chute(t){                                // destitution / embrasement
    cible.majeur=false; appliquerAccord(); cible.inten=0.16;
    [n(7),n(3),n(0),n(-5),n(-12)].forEach(function(f,k){ pince(t+k*0.30, f, 0.06, true); });
    sousGain.gain.setTargetAtTime(muet?0:0.19, t, 0.6);
    dissGain.gain.setTargetAtTime(muet?0:0.05, t+0.6, 0.9);
    padFiltre.frequency.setTargetAtTime(290, t, 0.9);
    master.gain.setTargetAtTime(muet?0:0.14, t, 0.8);
  }
  function acte(t){                                 // bascule d'acte (saut de temps)
    frappe(t, 0.15, true);
    pince(t+0.18, n(0), 0.05, true); pince(t+0.55, n(7), 0.045, true);
    airGain.gain.setTargetAtTime(muet?0:0.07, t, 0.5);
    airGain.gain.setTargetAtTime(muet?0:airBase, t+2.6, 1.6);
  }

  /* ---------- API publique ---------- */
  function demarrer(){
    if(!dispo) return; if(!ctx) init(); if(!ctx) return;
    if(ctx.state==="suspended") ctx.resume();
    if(!demarre){ demarre=true; appliquerAccord(); appliquerTimbre(); }
  }
  function refleter(etat, info){
    if(!ctx || !etat) return;
    info=info||{};
    var ts=Math.max(0,(55-etat.stabilite))/55, tf=Math.max(0,(45-etat.faveur))/45;
    var tt=(etat.tresor<8)?0.14:0;
    var i=Math.min(1, ts*0.55 + tf*0.35 + tt);
    if(info.enRevolte) i=Math.max(i,0.82);
    cible.inten=i;
    var maj=(etat.stabilite>=62 && etat.faveur>=64 && !info.enRevolte);
    if(maj!==cible.majeur){ cible.majeur=maj; appliquerAccord(); }
    var phase=(info.total? (info.idx||0)/info.total : 0);
    airBase=0.015 + phase*0.03;                     // souffle « sacré » qui croît vers la christianisation
    airGain.gain.setTargetAtTime(muet?0:airBase, ctx.currentTime, 2.2);
    appliquerTimbre();
    if(info.enRevolte && !revolteAvant) rouleau(ctx.currentTime);
    revolteAvant=!!info.enRevolte;
  }
  function evenement(type){
    if(!ctx) return; var t=ctx.currentTime;
    if(type==="choix"){ pince(t, n(7), 0.045, true); pince(t+0.07, n(12), 0.035, true); }
    else if(type==="acte"){ acte(t); }
    else if(type==="revolte"){ rouleau(t); }
    else if(type==="triomphe"){ triomphe(t); }
    else if(type==="echec"){ chute(t); }
    else if(type==="fin"){ [n(0),n(7),n(12)].forEach(function(f,k){ pince(t+k*0.18, f, 0.05, true); }); }
  }
  function basculerMuet(){
    if(!dispo) return muet;
    if(!ctx){ init(); demarre=true; if(ctx&&ctx.state==="suspended") ctx.resume(); if(ctx){ appliquerAccord(); } }
    muet=!muet; ecrire(muet);
    if(ctx) master.gain.setTargetAtTime(muet?0:(0.12+0.085*courant.inten), ctx.currentTime, 0.25);
    majBouton();
    return muet;
  }
  function estMuet(){ return muet; }

  /* ---------- bouton de contrôle ---------- */
  function majBouton(){
    var b=document.getElementById("son-toggle"); if(!b) return;
    b.setAttribute("aria-pressed", muet?"true":"false");
    b.title = muet?"Activer la musique":"Couper la musique";
    b.innerHTML = muet ? ICONE_OFF : ICONE_ON;
    b.classList.toggle("muet", muet);
  }
  var ICONE_ON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a4 4 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18.5 6a7 7 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var ICONE_OFF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  document.addEventListener("DOMContentLoaded", function(){
    muet=lire();
    var b=document.getElementById("son-toggle");
    if(b){ b.addEventListener("click", basculerMuet); majBouton(); }
  });

  return { demarrer:demarrer, refleter:refleter, evenement:evenement,
           basculerMuet:basculerMuet, estMuet:estMuet };
})();
