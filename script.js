// script.js — Sidekick Sites (clean)
document.addEventListener("DOMContentLoaded", () => {
  /* -------------------- Helpers -------------------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* -------------------- Smooth scroll for in-page anchors -------------------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        document.querySelector(id).scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* -------------------- Active nav highlight on scroll -------------------- */
  const navLinks  = $$(".nav a[href^='#']");
  const sections  = navLinks.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id   = "#" + entry.target.id;
        const link = navLinks.find(a => a.getAttribute("href") === id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove("active"));
          link.classList.add("active");
        }
      });
    }, { rootMargin: "-50% 0px -45% 0px", threshold: 0 });
    sections.forEach(sec => io.observe(sec));
  }

  /* -------------------- Footer year -------------------- */
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  /* -------------------- Form handling (index + contact) -------------------- */
  const form     = $("#lead-form") || $("#contactForm");
  const feedback = $("#formFeedback");
  if (!form) return;

  // Dev/demo prefill (local hosts or ?demo=1 only)
  const host  = location.hostname;
  const IS_DEV = /^(localhost|127\.0\.0\.1|::1|0\.0\.0\.0)$/.test(host) || host.endsWith(".local") || host === "";
  const DEMO  = new URLSearchParams(location.search).get("demo") === "1";
  const nameInput  = form.querySelector("#name");
  const emailInput = form.querySelector("#email");
  if ((IS_DEV || DEMO) && nameInput  && !nameInput.value)  nameInput.value  = "Zane McDermott";
  if ((IS_DEV || DEMO) && emailInput && !emailInput.value) emailInput.value = "zanemc@ymail.com";

  // Hidden fields (UTMs + site URL)
  const qs = new URLSearchParams(location.search);
  ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach(k => {
    const el = document.getElementById(k);
    if (el) el.value = qs.get(k) || "";
  });
  const siteUrl = $("#site_url"); if (siteUrl) siteUrl.value = location.href;

  // Plans → prefill plan + service and scroll to contact
  $$(".choose-plan").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const plan = btn.dataset.plan || btn.textContent.trim();
      const planField = $("#plan"); if (planField) planField.value = plan;
      const service = $("#service"); if (service) service.value = "Managed service (ongoing)";

      // Analytics
      window.plausible && plausible("Choose Plan", { props: { plan } });

      // Scroll & focus
      const contact = $("#contact");
      if (contact) contact.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { $("#name")?.focus(); }, 450);
    });
  });

  // Submit → Formspree (AJAX, no reload)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (feedback) { feedback.textContent = "Sending…"; feedback.style.color = "#6b7280"; }

    try {
      // Add timestamp
      let t = document.getElementById("submitted_at");
      if (!t) { t = document.createElement("input"); t.type = "hidden"; t.name = "submitted_at"; t.id = "submitted_at"; form.appendChild(t); }
      t.value = new Date().toISOString();

      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });

      if (res.ok) {
        window.plausible && plausible("Lead Submit");
        if (feedback) { feedback.textContent = "Thanks! We’ll be in touch shortly."; feedback.style.color = "#16a34a"; }
        form.reset();
        if ((IS_DEV || DEMO) && nameInput)  nameInput.value  = "Zane McDermott";
        if ((IS_DEV || DEMO) && emailInput) emailInput.value = "zanemc@ymail.com";

        const redirect = form.getAttribute("data-thanks");
        if (redirect) location.href = redirect;
      } else {
        let msg = "Something went wrong. Please try again.";
        try { const r = await res.json(); msg = r?.errors?.[0]?.message || msg; } catch {}
        if (feedback) { feedback.textContent = msg; feedback.style.color = "#ef4444"; }
      }
    } catch {
      if (feedback) { feedback.textContent = "Network error. Please try again."; feedback.style.color = "#ef4444"; }
    }
  });
});
