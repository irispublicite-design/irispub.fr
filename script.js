/* =========================================================
   Clichy Conduite — Compte à rebours "Site en construction"
   Cible : 11 octobre 2026, 21h55, heure de Paris
   ========================================================= */

(function () {
  "use strict";

  // Date cible exprimée avec le décalage horaire explicite de Paris
  // (+02:00, heure d'été en vigueur le 11 octobre). L'offset étant fixé
  // dans la chaîne ISO, l'instant visé reste correct quel que soit le
  // fuseau horaire du visiteur.
  var TARGET_DATE = new Date("2026-10-11T21:55:00+02:00");

  var els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    minutes: document.getElementById("cd-minutes"),
    seconds: document.getElementById("cd-seconds"),
    srStatus: document.getElementById("countdown-sr-status")
  };

  var lastValues = { days: null, hours: null, minutes: null, seconds: null };
  var timerId = null;
  var srUpdateCounter = 0;

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function setValue(el, key, value) {
    var formatted = pad(value);
    if (el.textContent !== formatted) {
      el.textContent = formatted;
      if (lastValues[key] !== null) {
        // Petite animation d'incrément, sans rien casser si l'utilisateur
        // préfère des animations réduites (géré en CSS).
        el.classList.remove("is-ticking");
        // force reflow pour pouvoir rejouer l'animation
        void el.offsetWidth;
        el.classList.add("is-ticking");
      }
      lastValues[key] = value;
    }
  }

  function render(days, hours, minutes, seconds) {
    setValue(els.days, "days", days);
    setValue(els.hours, "hours", hours);
    setValue(els.minutes, "minutes", minutes);
    setValue(els.seconds, "seconds", seconds);

    // Statut pour lecteurs d'écran : mis à jour une fois par minute
    // seulement, pour ne pas spammer l'utilisateur à chaque seconde.
    srUpdateCounter++;
    if (srUpdateCounter % 60 === 1 && els.srStatus) {
      els.srStatus.textContent =
        "Il reste " + days + " jours, " + hours + " heures et " + minutes +
        " minutes avant la mise en ligne du nouveau site, prévue le 11 octobre 2026 à 21h55.";
    }
  }

  function showFinished() {
    render(0, 0, 0, 0);
    if (els.srStatus) {
      els.srStatus.textContent = "Le nouveau site de Clichy Conduite est disponible.";
    }
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function tick() {
    var now = new Date();
    var diff = TARGET_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      showFinished();
      return;
    }

    var SECOND = 1000;
    var MINUTE = 60 * SECOND;
    var HOUR = 60 * MINUTE;
    var DAY = 24 * HOUR;

    var days = Math.floor(diff / DAY);
    var hours = Math.floor((diff % DAY) / HOUR);
    var minutes = Math.floor((diff % HOUR) / MINUTE);
    var seconds = Math.floor((diff % MINUTE) / SECOND);

    render(days, hours, minutes, seconds);
  }

  function start() {
    if (!els.days || !els.hours || !els.minutes || !els.seconds) {
      return;
    }
    tick();
    timerId = setInterval(tick, 1000);
  }

  // Met en pause le timer quand l'onglet n'est pas visible (perf),
  // et rattrape immédiatement l'affichage au retour.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    } else if (!timerId) {
      tick();
      timerId = setInterval(tick, 1000);
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    start();

    var yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    // Respecte "réduire les animations" : on garde la photo statique
    // (poster) plutôt que de lancer la vidéo en boucle.
    var prefersReducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var heroVideo = document.querySelector(".hero-media__video");
    if (prefersReducedMotion && heroVideo) {
      heroVideo.pause();
      heroVideo.removeAttribute("autoplay");
    }
  });
})();
