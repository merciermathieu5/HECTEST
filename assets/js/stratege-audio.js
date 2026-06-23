/* =========================================================================
   STRATÈGE — trame sonore en boucle
   Lecture en boucle d'un extrait de lyre grecque (~50 s, jonction fondue de 3 s
   pour une boucle sans coupure). Fond constant. Démarre au premier clic (règles
   des navigateurs) ; bouton muet.
   Musique : « The Lyre of Classical Antiquity », Michael Levy.
   ⚠ Vérifier les droits d'utilisation avant toute diffusion publique du jeu.
   ========================================================================= */
window.AudioStratege = (function(){
  "use strict";
  var URL_TRAME="assets/audio/stratege-trame.mp3";
  var VOL=0.42;                       // volume de fond, adapté à une classe
  var audio=null, muet=false;

  function lire(){ try{ return localStorage.getItem("stratege-muet")==="1"; }catch(e){ return false; } }
  function ecrire(v){ try{ localStorage.setItem("stratege-muet", v?"1":"0"); }catch(e){} }

  function creer(){
    if(audio) return;
    try{
      audio=document.createElement("audio");
      audio.src=URL_TRAME; audio.loop=true; audio.preload="auto"; audio.volume=VOL;
      audio.setAttribute("aria-hidden","true");
      document.body.appendChild(audio);
    }catch(e){ audio=null; }
  }
  function jouer(){
    creer(); if(!audio) return;
    try{ var p=audio.play(); if(p&&p.catch) p.catch(function(){}); }catch(e){}
  }
  function demarrer(){            // appelé au premier clic (choix du niveau)
    creer(); if(!muet) jouer();
  }
  function basculerMuet(){
    creer(); muet=!muet; ecrire(muet);
    if(audio){ if(muet) audio.pause(); else jouer(); }
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
    muet=lire(); creer();           // précharge la trame, sans jouer (pas encore de geste)
    var b=document.getElementById("son-toggle");
    if(b){ b.addEventListener("click", basculerMuet); majBouton(); }
  });

  return { demarrer:demarrer, basculerMuet:basculerMuet, estMuet:estMuet };
})();
