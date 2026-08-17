/**
 * AK Forge — shared site behaviour.
 * Renders dynamic sections from site-data.js, handles the mobile nav,
 * and wires the contact/onboarding forms to the Apps Script backend.
 */

// ⚠️ Set this to your deployed Google Apps Script Web App URL.
// See /apps-script/README.md for step-by-step setup instructions.
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbzJCkmghrsa0QyWkIzMloZamx9xhp3IpKj4968U5S-uqO7NWVPRXneXhzf3TmHDgatrQQ/exec";

document.addEventListener("DOMContentLoaded", () => {
  const D = window.SITE_DATA;

  // ---------- Mobile nav ----------
  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
      mobileMenu.style.display = mobileMenu.classList.contains("open") ? "flex" : "none";
    });
  }

  // ---------- Footer year ----------
  document.querySelectorAll(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));

  // ---------- WhatsApp links ----------
  document.querySelectorAll("[data-wa-text]").forEach((el) => {
    const text = encodeURIComponent(el.getAttribute("data-wa-text"));
    el.href = `https://wa.me/${D.business.whatsapp}?text=${text}`;
    el.target = "_blank";
    el.rel = "noopener";
  });

  // ---------- Contact tiles / phone-email fill-ins ----------
  document.querySelectorAll("[data-fill]").forEach((el) => {
    const key = el.getAttribute("data-fill");
    if (D.business[key] !== undefined) el.textContent = D.business[key];
  });
  document.querySelectorAll("[data-fill-href]").forEach((el) => {
    const [attr, key] = el.getAttribute("data-fill-href").split(":");
    if (D.business[key] !== undefined) el.setAttribute(attr, D.business[key]);
  });

  // ---------- Stats row ----------
  const statsEl = document.querySelector("[data-stats]");
  if (statsEl) {
    statsEl.innerHTML = D.stats
      .map(
        (s) => `
        <div class="stat">
          <div class="num">${s.num}</div>
          <div class="lbl">${s.label}</div>
        </div>`
      )
      .join("");
  }

  // ---------- Mini services (home page) ----------
  const miniEl = document.querySelector("[data-services-mini]");
  if (miniEl) {
    miniEl.innerHTML = D.services
      .map(
        (s) => `
        <div class="mini-card">
          <div class="service-icon">${icon(s.id)}</div>
          <h4>${s.title}</h4>
          <p>${s.short}</p>
          <a class="card-link" href="services.html#${s.id}">Learn more ${arrowIcon()}</a>
        </div>`
      )
      .join("");
  }

  // ---------- Full service cards (services page) ----------
  const fullEl = document.querySelector("[data-services-full]");
  if (fullEl) {
    fullEl.innerHTML = D.services
      .map(
        (s) => `
        <div class="service-card" id="${s.id}">
          <span class="service-num">${s.num}</span>
          <div class="service-icon">${icon(s.id)}</div>
          <h3>${s.title}</h3>
          <p class="desc">${s.desc}</p>
          <ul class="feat">${s.features.map((f) => `<li>${f}</li>`).join("")}</ul>
          <a class="card-link" href="contact.html?service=${encodeURIComponent(s.title)}">Get Started ${arrowIcon()}</a>
        </div>`
      )
      .join("");
  }

  // ---------- Process steps ----------
  const processEl = document.querySelector("[data-process]");
  if (processEl) {
    processEl.innerHTML = D.process
      .map(
        (p) => `
        <div class="step-card">
          <div class="step-num">${p.num}</div>
          <div class="step-icon">${stepIcon(p.num)}</div>
          <h4>${p.title}</h4>
          <p>${p.desc}</p>
          <ul>${p.points.map((pt) => `<li>${pt}</li>`).join("")}</ul>
        </div>`
      )
      .join("");
  }

  // ---------- Projects (work page + home featured) ----------
  const projectsEl = document.querySelector("[data-projects]");
  if (projectsEl) {
    if (D.projects.length === 0) {
      projectsEl.innerHTML = "";
    } else {
      projectsEl.innerHTML = D.projects.map(projectCard).join("");
    }
  }
  const featuredEl = document.querySelector("[data-projects-featured]");
  if (featuredEl && D.projects.length) {
    featuredEl.innerHTML = D.projects.slice(0, 3).map(projectCard).join("");
  }

  // ---------- Service dropdown pre-fill on contact page ----------
  const serviceSelect = document.querySelector('select[name="service"]');
  if (serviceSelect) {
    const params = new URLSearchParams(window.location.search);
    const svc = params.get("service");
    if (svc) {
      [...serviceSelect.options].forEach((opt) => {
        if (opt.value === svc || opt.textContent.trim() === svc) opt.selected = true;
      });
    }
  }

  // ---------- Forms ----------
  wireForm("contact-form", "New website inquiry");
  wireForm("onboarding-form", "New client onboarding submission");
});

function wireForm(formId, subjectPrefix) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = form.querySelector(".form-status");
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.innerHTML : "";

    if (FORM_ENDPOINT.includes("PASTE_YOUR")) {
      showStatus(statusEl, "err", "Form isn't connected yet — see apps-script/README.md to finish setup.");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data._form = formId;
    data._subject = `${subjectPrefix} — ${data.name || data.clientName || "AK Forge"}`;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Sending…";
    }

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight to Apps Script
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({ ok: true }));
      if (result.ok === false) throw new Error(result.error || "Something went wrong");

      form.reset();
      showStatus(
        statusEl,
        "ok",
        "Thanks! Your message is on its way — we usually reply within 24 hours. Check your email for a confirmation."
      );
      const nextStepId = form.getAttribute("data-success-next");
      if (nextStepId) {
        const el = document.getElementById(nextStepId);
        if (el) el.style.display = "block";
      }
    } catch (err) {
      showStatus(statusEl, "err", "Couldn't send right now — please WhatsApp us instead, or try again in a moment.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
      }
    }
  });
}

function showStatus(el, type, msg) {
  if (!el) return;
  el.className = `form-status ${type}`;
  el.textContent = msg;
  el.style.display = "block";
}

function projectCard(p) {
  return `
    <div class="project-card">
      <div class="project-thumb">
        <div class="fallback">
          ${icon("web")}
          <span>${p.industry}</span>
        </div>
      </div>
      <div class="project-body">
        <span class="project-tag">${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="tag-row">${p.tags.map((t) => `<span class="tag-chip">${t}</span>`).join("")}</div>
      </div>
      <div class="project-meta">
        <div class="meta-row">
          <div class="ic">${miniIcon("industry")}</div>
          <div><div class="lbl">Industry</div><div class="val">${p.industry}</div></div>
        </div>
        <div class="meta-row">
          <div class="ic">${miniIcon("role")}</div>
          <div><div class="lbl">My Role</div><div class="val">${p.role}</div></div>
        </div>
        ${
          p.link
            ? `<div class="meta-row"><div class="ic">${miniIcon("link")}</div><div><div class="lbl">Live Project</div><div class="val"><a href="${p.link}" target="_blank" rel="noopener">${p.linkLabel || "View"}</a></div></div></div>`
            : ""
        }
      </div>
    </div>`;
}

function arrowIcon() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`;
}

function icon(id) {
  const icons = {
    web: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 4v5"/></svg>`,
    branding: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
    gbp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    social: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8"/></svg>`,
  };
  return icons[id] || icons.web;
}

function miniIcon(kind) {
  const icons = {
    industry: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l7-4v16M14 21V13l7-4v12"/><path d="M3 21h18"/></svg>`,
    role: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/></svg>`,
  };
  return icons[kind] || "";
}

function stepIcon(num) {
  const icons = {
    "01": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>`,
    "02": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 10h8M8 14h5"/></svg>`,
    "03": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>`,
    "04": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>`,
    "05": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 016-10.8 22 22 0 0110.8-6L14 12"/></svg>`,
  };
  return icons[num] || icons["01"];
}
