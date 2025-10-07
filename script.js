// script.js — Sidekick Sites (remodelled)
document.addEventListener("DOMContentLoaded", () => {
  /* -------------------- Helpers -------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* -------------------- Smooth scroll -------------------- */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* -------------------- Active nav highlight -------------------- */
  const navLinks = $$(".nav a[href^='#']");
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
      });
    }, { rootMargin: '-55% 0px -40% 0px', threshold: 0 });
    sections.forEach(sec => io.observe(sec));
  }

  /* -------------------- Hero laptop animation -------------------- */
  const heroLaptop = document.querySelector('[data-laptop]');
  const screenImages = $$('.screen-track img');
  const laptopFrame = heroLaptop ? heroLaptop.querySelector('.laptop') : null;
  const laptopGif = laptopFrame ? laptopFrame.querySelector('.laptop-gif') : null;
  const metricEls = $$('.metric-value');
  const counted = new Set();
  let screenTimer = null;

  function animateCount(el){
    const target = parseFloat(el.dataset.count || '0');
    if (Number.isNaN(target)) return;
    const duration = 1800;
    const start = performance.now();
    const decimals = target % 1 !== 0 ? 1 : 0;
    const from = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const value = from + (target - from) * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const startScreenCarousel = () => {
    if (screenImages.length <= 1 || screenTimer) return;
    let index = 0;
    screenImages.forEach((img, i) => img.classList.toggle('is-active', i === index));
    screenTimer = setInterval(() => {
      index = (index + 1) % screenImages.length;
      screenImages.forEach((img, i) => img.classList.toggle('is-active', i === index));
    }, 5000);
  };

  if (heroLaptop) {
    const openHero = () => {
      if (heroLaptop.classList.contains('is-open')) return;
      heroLaptop.classList.add('is-open');
      metricEls.forEach(el => {
        if (counted.has(el)) return;
        counted.add(el);
        animateCount(el);
      });
      const delay = parseFloat(laptopGif?.dataset.duration || '5') * 1000;
      if (laptopFrame && laptopGif) {
        setTimeout(() => {
          laptopFrame.classList.add('is-ready');
          startScreenCarousel();
        }, delay);
      } else {
        laptopFrame?.classList.add('is-ready');
        startScreenCarousel();
      }
    };

    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          openHero();
          heroObserver.disconnect();
        });
      }, { threshold: 0.35 });
      heroObserver.observe(heroLaptop);
    }
    // Fallback: ensure animation still runs after load
    setTimeout(openHero, 800);
  }

  /* -------------------- Work laptop animation -------------------- */
  const workLaptop = document.querySelector('[data-laptop-preview]');
  if (workLaptop && 'IntersectionObserver' in window) {
    const workObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          workLaptop.classList.add('is-active');
          workObserver.disconnect();
        }
      });
    }, { threshold: 0.35 });
    workObserver.observe(workLaptop);
  }

  /* -------------------- Footer year -------------------- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------- Form handling -------------------- */
  const form = $('#lead-form') || $('#contactForm');
  const feedback = $('#formFeedback');
  if (!form) return;

  const host = location.hostname;
  const IS_DEV = /^(localhost|127\.0\.0\.1|::1|0\.0\.0\.0)$/.test(host) || host.endsWith('.local') || host === '';
  const DEMO = new URLSearchParams(location.search).get('demo') === '1';
  const nameInput = form.querySelector('#name');
  const emailInput = form.querySelector('#email');
  if ((IS_DEV || DEMO) && nameInput && !nameInput.value) nameInput.value = 'Zane McDermott';
  if ((IS_DEV || DEMO) && emailInput && !emailInput.value) emailInput.value = 'zanemc@ymail.com';

  const qs = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(key => {
    const el = document.getElementById(key);
    if (el) el.value = qs.get(key) || '';
  });
  const siteUrl = $('#site_url');
  if (siteUrl) siteUrl.value = location.href;

  $$('.choose-plan').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.dataset.plan || btn.textContent.trim();
      const planField = $('#plan'); if (planField) planField.value = plan;
      const service = $('#service'); if (service) service.value = 'Managed service (ongoing)';
      const budget = $('#budget'); if (budget && budget.value === 'under-1k') budget.value = '1-2k';
      window.plausible && plausible('Choose Plan', { props: { plan } });
      const contact = $('#contact');
      if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { $('#name')?.focus(); }, 450);
    });
  });

  $$('[data-checklist]').forEach(btn => {
    btn.addEventListener('click', () => {
      const contact = $('#contact');
      if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { $('#email')?.focus(); }, 450);
      const planField = $('#plan'); if (planField) planField.value = 'Checklist';
      const message = $('#message'); if (message && !message.value) message.value = 'Please send the Site & Ads Launch Checklist.';
      window.plausible && plausible('Checklist CTA');
    });
  });

  const mobileCTA = document.querySelector('.mobile-cta .btn');
  if (mobileCTA) {
    mobileCTA.addEventListener('click', () => {
      const planField = $('#plan'); if (planField) planField.value = 'Mobile CTA';
      window.plausible && plausible('Mobile CTA Click');
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (feedback) { feedback.textContent = 'Sending…'; feedback.style.color = '#94a3b8'; }

    try {
      let submittedAt = document.getElementById('submitted_at');
      if (!submittedAt) {
        submittedAt = document.createElement('input');
        submittedAt.type = 'hidden';
        submittedAt.name = 'submitted_at';
        submittedAt.id = 'submitted_at';
        form.appendChild(submittedAt);
      }
      submittedAt.value = new Date().toISOString();

      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        window.plausible && plausible('Lead Submit');
        if (feedback) { feedback.textContent = 'Thanks! We’ll be in touch shortly.'; feedback.style.color = '#22c55e'; }
        form.reset();
        if ((IS_DEV || DEMO) && nameInput) nameInput.value = 'Zane McDermott';
        if ((IS_DEV || DEMO) && emailInput) emailInput.value = 'zanemc@ymail.com';
        const redirect = form.getAttribute('data-thanks');
        if (redirect) location.href = redirect;
      } else {
        let message = 'Something went wrong. Please try again.';
        try { const data = await res.json(); message = data?.errors?.[0]?.message || message; } catch {}
        if (feedback) { feedback.textContent = message; feedback.style.color = '#ef4444'; }
      }
    } catch (err) {
      if (feedback) { feedback.textContent = 'Network error. Please try again.'; feedback.style.color = '#ef4444'; }
    }
  });
});
