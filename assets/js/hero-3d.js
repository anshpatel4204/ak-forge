/* ===================================================================
   AK Forge — hero-3d.js
   Lightweight Three.js scene mounter for [data-hero3d] containers.
   Degrades gracefully: if Three.js failed to load, WebGL isn't
   supported, the user prefers reduced motion, or the container is
   too small, the original CSS/image fallback content stays visible.
=================================================================== */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function hasWebGL() {
    try {
      var canvas = document.createElement("canvas");
      return !!(window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }

  function isTouchDevice() {
    return "ontouchstart" in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  }

  // Brand palette sampled from the real AK Forge logo.
  var COLORS = {
    navy: 0x102441,
    slate: 0x8fa3c4,
    accent: 0x5b8cff,
    ice: 0xeef2f8
  };

  function buildClusterGroup(THREE) {
    var group = new THREE.Group();

    var core = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.72, 0.22, 160, 20),
      new THREE.MeshPhysicalMaterial({
        color: COLORS.accent,
        metalness: 0.55,
        roughness: 0.25,
        clearcoat: 0.6,
        clearcoatRoughness: 0.3,
        envMapIntensity: 0.8
      })
    );
    group.add(core);

    var ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 0),
      new THREE.MeshPhysicalMaterial({ color: COLORS.ice, metalness: 0.2, roughness: 0.35, clearcoat: 0.4 })
    );
    ico.position.set(1.7, 0.9, -0.6);
    group.add(ico);

    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.MeshPhysicalMaterial({ color: COLORS.slate, metalness: 0.4, roughness: 0.4 })
    );
    sphere.position.set(-1.6, -0.7, 0.4);
    group.add(sphere);

    var box = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshPhysicalMaterial({ color: COLORS.navy, metalness: 0.3, roughness: 0.5, clearcoat: 0.5 })
    );
    box.position.set(-1.1, 1.15, -0.3);
    box.rotation.set(0.6, 0.4, 0.2);
    group.add(box);

    var ringGeo = new THREE.TorusGeometry(2.3, 0.006, 8, 120);
    var ringMat = new THREE.MeshBasicMaterial({ color: COLORS.accent, transparent: true, opacity: 0.35 });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    group.add(ring);

    return { group: group, spin: [core, ico, sphere, box] };
  }

  function buildAccentGroup(THREE, variant) {
    var group = new THREE.Group();
    var geo = variant === "torus"
      ? new THREE.TorusGeometry(0.85, 0.28, 32, 100)
      : new THREE.IcosahedronGeometry(0.95, 0);
    var mesh = new THREE.Mesh(
      geo,
      new THREE.MeshPhysicalMaterial({
        color: COLORS.accent,
        metalness: 0.5,
        roughness: 0.3,
        clearcoat: 0.5,
        clearcoatRoughness: 0.35
      })
    );
    group.add(mesh);

    var wireGeo = variant === "torus"
      ? new THREE.TorusGeometry(0.85, 0.28, 12, 48)
      : new THREE.IcosahedronGeometry(1.18, 0);
    var wire = new THREE.Mesh(
      wireGeo,
      new THREE.MeshBasicMaterial({ color: COLORS.slate, wireframe: true, transparent: true, opacity: 0.25 })
    );
    group.add(wire);

    return { group: group, spin: [mesh, wire] };
  }

  function mount(el) {
    var THREE = window.THREE;
    if (!THREE || !hasWebGL()) return;
    if (el.offsetWidth < 40 || el.offsetHeight < 40) return;

    var variant = el.getAttribute("data-hero3d") || "cluster";
    var reduced = prefersReducedMotion();
    var touch = isTouchDevice();

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, el.offsetWidth / el.offsetHeight, 0.1, 100);
    camera.position.set(0, 0, variant === "cluster" ? 6.4 : 4.4);

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch (e) {
      return;
    }
    renderer.setSize(el.offsetWidth, el.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
    renderer.domElement.className = "hero3d-canvas";
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 4, 5);
    scene.add(key);
    var rim1 = new THREE.PointLight(COLORS.accent, 6, 12);
    rim1.position.set(-3, -2, 2);
    scene.add(rim1);
    var rim2 = new THREE.PointLight(COLORS.ice, 3, 12);
    rim2.position.set(2, 3, -2);
    scene.add(rim2);

    var built = variant === "cluster" ? buildClusterGroup(THREE) : buildAccentGroup(THREE, variant);
    scene.add(built.group);

    var targetX = 0, targetY = 0, curX = 0, curY = 0;
    function onPointerMove(evt) {
      var rect = el.getBoundingClientRect();
      var px = (evt.clientX - rect.left) / rect.width - 0.5;
      var py = (evt.clientY - rect.top) / rect.height - 0.5;
      targetY = px * 0.6;
      targetX = py * 0.4;
    }
    if (!touch && !reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    function onResize() {
      if (!el.offsetWidth || !el.offsetHeight) return;
      camera.aspect = el.offsetWidth / el.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.offsetWidth, el.offsetHeight);
    }
    window.addEventListener("resize", onResize);

    var clock = new THREE.Clock();
    var frameId;
    var destroyed = false;

    function tick() {
      if (destroyed) return;
      frameId = requestAnimationFrame(tick);
      var dt = clock.getDelta();

      if (!reduced) {
        curX += (targetX - curX) * 0.04;
        curY += (targetY - curY) * 0.04;
        built.group.rotation.x = curX;
        built.group.rotation.y = curY + clock.elapsedTime * 0.12;
        built.spin.forEach(function (mesh, i) {
          mesh.rotation.x += dt * (0.08 + i * 0.02);
          mesh.rotation.y += dt * (0.1 + i * 0.015);
        });
      } else {
        built.group.rotation.y = 0.4;
        built.group.rotation.x = 0.15;
      }

      renderer.render(scene, camera);
    }
    tick();

    // fade fallback out / canvas in once first frame is painted
    requestAnimationFrame(function () {
      el.classList.add("is-mounted");
    });

    // Pause rendering when off-screen to save battery/CPU.
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!frameId) tick();
          } else if (frameId) {
            cancelAnimationFrame(frameId);
            frameId = null;
          }
        });
      }, { threshold: 0.05 });
      io.observe(el);
    }
  }

  function init() {
    var targets = document.querySelectorAll("[data-hero3d]");
    if (!targets.length) return;
    targets.forEach(mount);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
