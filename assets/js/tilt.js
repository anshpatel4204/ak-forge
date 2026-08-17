/* ===================================================================
   AK Forge — tilt.js
   Subtle mouse-driven 3D tilt for cards, giving the "dev portfolio"
   feel without a heavy library. Skips itself on touch devices and
   when the user prefers reduced motion.
=================================================================== */
(function () {
  "use strict";

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if ("ontouchstart" in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)) return;

  var SELECTOR = ".service-card, .mini-card, .step-card, .contact-tile, .strip-item";
  var MAX_TILT = 7; // degrees

  function attach(card) {
    var frame = null;

    function onMove(e) {
      var rect = card.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      var rotY = (px - 0.5) * MAX_TILT * 2;
      var rotX = (0.5 - py) * MAX_TILT * 2;

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        card.style.transform =
          "perspective(800px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg) translateY(-4px)";
      });
    }

    function onLeave() {
      if (frame) cancelAnimationFrame(frame);
      card.style.transform = "";
    }

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
  }

  function init() {
    var cards = document.querySelectorAll(SELECTOR);
    cards.forEach(attach);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
