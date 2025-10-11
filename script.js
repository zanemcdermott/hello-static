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

  /* -------------------- Hero showcase -------------------- */
  const heroShowcase = document.querySelector('.hero-showcase');
  if (heroShowcase) {
    const SLIDE_MS = 4000;
    const sources = {
      laptop: Array.from({ length: 6 }, (_, i) => `images/screen/laptop${i + 1}.png`),
      phone: Array.from({ length: 6 }, (_, i) => `images/screen/phone${i + 1}.png`)
    };
    const frameCount = sources.laptop.length;
    const stages = new Map();

    heroShowcase.querySelectorAll('.stage').forEach(stage => {
      const role = stage.dataset.role;
      const slides = Array.from(stage.querySelectorAll('.slide'));
      if (!role || slides.length < 2) return;
      stages.set(role, { stage, slides, active: 0 });
    });

    if (frameCount && stages.size === 2) {
      const loadImage = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error(`Failed to load ${src}`));
        img.src = src;
      });

      const preloadAll = () => {
        const assets = [...sources.laptop, ...sources.phone];
        return Promise.all(assets.map(loadImage));
      };

      const clampIndex = (index) => {
        const mod = index % frameCount;
        return mod < 0 ? mod + frameCount : mod;
      };

      let currentIndex = 0;
      let timer = null;
      let playing = false;

      const showFrame = (index, instant = false) => {
        const normalized = clampIndex(index);
        stages.forEach((config, role) => {
          const deviceSources = sources[role];
          if (!deviceSources || !deviceSources.length) return;

          const nextSlot = instant ? config.active : config.active ^ 1;
          const nextImg = config.slides[nextSlot];
          if (!nextImg) return;
          nextImg.src = deviceSources[normalized];

          if (instant) {
            config.slides.forEach((img, idx) => {
              const isActive = idx === nextSlot;
              img.style.transition = 'none';
              img.style.opacity = isActive ? '1' : '0';
              img.classList.toggle('is-active', isActive);
            });
            requestAnimationFrame(() => {
              config.slides.forEach(img => {
                img.style.transition = '';
                img.style.opacity = '';
              });
            });
          } else {
            const current = config.slides[config.active];
            nextImg.classList.add('is-active');
            if (current && current !== nextImg) current.classList.remove('is-active');
          }

          config.active = nextSlot;
        });
        currentIndex = normalized;
      };

      const schedule = () => {
        clearTimeout(timer);
        if (!playing) return;
        timer = window.setTimeout(() => {
          showFrame(currentIndex + 1);
          schedule();
        }, SLIDE_MS);
      };

      const play = () => {
        if (playing) return;
        playing = true;
        schedule();
      };

      const pause = () => {
        if (!playing) return;
        playing = false;
        clearTimeout(timer);
      };

      const goto = (index) => {
        showFrame(index);
        if (playing) schedule();
      };

      const enableShowcase = () => {
        showFrame(0, true);
        heroShowcase.classList.add('is-ready');

        playing = true;
        schedule();
        window.slideshow = Object.assign({}, window.slideshow, { play, pause, goto });
      };

      preloadAll().then(enableShowcase).catch(err => {
        console.warn(err);
        enableShowcase();
      });
    } else {
      heroShowcase.classList.add('is-ready');
    }
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

  /* -------------------- Possibility demos -------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  $$('[data-theme-switch]').forEach(lab => {
    const buttons = $$('[data-theme]', lab);
    const stage = lab.querySelector('[data-theme-panel]');
    if (!buttons.length || !stage) return;

    const bg = stage.querySelector('.cta-stage__bg');
    const tag = stage.querySelector('.cta-tag');
    const headline = stage.querySelector('.cta-headline');
    const list = stage.querySelector('.cta-points');
    const ctaBtn = stage.querySelector('.btn');

    const THEMES = {
      strategy: {
        tag: 'Strategy Call',
        headline: 'Map every touchpoint in 25 minutes.',
        points: [
          'Identify friction in your funnel',
          'Plot ad + landing page sync',
          'Walk away with a 90-day roadmap'
        ],
        gradient: 'linear-gradient(150deg,rgba(56,189,248,0.32),rgba(99,102,241,0.18))',
        button: 'Reserve a slot'
      },
      audit: {
        tag: 'Ad Account Audit',
        headline: 'Dissect your Meta & Google campaigns live.',
        points: [
          'Heatmap the winning audiences',
          'Campaign hygiene checklist',
          'Copy & creative punch-ups in session'
        ],
        gradient: 'linear-gradient(160deg,rgba(251,191,36,0.32),rgba(249,115,22,0.2))',
        button: 'Book my audit'
      },
      launch: {
        tag: 'Launch Accelerator',
        headline: 'Deploy a full funnel in fourteen days.',
        points: [
          'Hero, offer, and proof blocks for each service',
          'Marketing automation wiring & notifications',
          'Ads + landing pairings ready for scale'
        ],
        gradient: 'linear-gradient(155deg,rgba(34,197,94,0.3),rgba(59,130,246,0.22))',
        button: 'Start the build'
      }
    };

    const applyTheme = (key) => {
      const theme = THEMES[key];
      if (!theme) return;
      buttons.forEach(btn => {
        const isActive = btn.dataset.theme === key;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });
      if (bg) bg.style.background = theme.gradient;
      if (tag) tag.textContent = theme.tag;
      if (headline) headline.textContent = theme.headline;
      if (list) {
        list.innerHTML = '';
        theme.points.forEach(point => {
          const li = document.createElement('li');
          li.textContent = point;
          list.appendChild(li);
        });
      }
      if (ctaBtn) ctaBtn.textContent = theme.button;
    };

    buttons.forEach(btn => {
      btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
      btn.addEventListener('keydown', (event) => {
        if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
        event.preventDefault();
        const index = buttons.indexOf(btn);
        const nextIndex = event.key === 'ArrowRight'
          ? (index + 1) % buttons.length
          : (index - 1 + buttons.length) % buttons.length;
        buttons[nextIndex].focus();
        applyTheme(buttons[nextIndex].dataset.theme);
      });
    });

    applyTheme(buttons[0].dataset.theme);
  });

  $$('[data-comparison]').forEach(block => {
    const stage = block.querySelector('.comparison-stage');
    const slider = block.querySelector('input[type="range"]');
    if (!stage || !slider) return;

    const setReveal = (value) => {
      const pct = Math.min(100, Math.max(0, Number(value)));
      stage.style.setProperty('--reveal', `${pct}%`);
    };

    slider.addEventListener('input', () => setReveal(parseFloat(slider.value)));
    setReveal(parseFloat(slider.value));

    let dragging = false;
    const updateFromPointer = (event) => {
      const rect = stage.getBoundingClientRect();
      const x = event.clientX ?? 0;
      const pct = ((x - rect.left) / rect.width) * 100;
      const clamped = Math.min(100, Math.max(0, pct));
      setReveal(clamped);
      slider.value = clamped.toFixed(1);
    };

    stage.addEventListener('pointerdown', (event) => {
      dragging = true;
      stage.setPointerCapture(event.pointerId);
      event.preventDefault();
      updateFromPointer(event);
    });

    stage.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      updateFromPointer(event);
    });

    const stopDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      try { stage.releasePointerCapture(event.pointerId); } catch {}
    };

    stage.addEventListener('pointerup', stopDrag);
    stage.addEventListener('pointercancel', stopDrag);
    stage.addEventListener('lostpointercapture', () => { dragging = false; });
  });

  $$('[data-marquee]').forEach(wrapper => {
    const track = wrapper.querySelector('.ticker-track');
    if (!track) return;
    const originals = Array.from(track.children);
    if (!originals.length) return;

    const ensureFill = () => {
      const wrapperWidth = Math.max(wrapper.getBoundingClientRect().width, 1);
      let iterations = 0;
      while (track.scrollWidth < wrapperWidth * 2 && iterations < 6) {
        originals.forEach(card => track.appendChild(card.cloneNode(true)));
        iterations += 1;
      }
    };
    ensureFill();

    if (prefersReducedMotion) return;

    let gap = 0;
    const updateGap = () => {
      const styles = getComputedStyle(track);
      gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    };

    const getFirstWidth = () => {
      const first = track.firstElementChild;
      if (!first) return 0;
      return first.getBoundingClientRect().width + gap;
    };

    const getLastWidth = () => {
      const last = track.lastElementChild;
      if (!last) return 0;
      return last.getBoundingClientRect().width + gap;
    };

    const direction = wrapper.dataset.direction === 'reverse' ? 1 : -1;
    const baseSpeed = Math.max(parseFloat(wrapper.dataset.speed || '48'), 1);
    let targetSpeed = baseSpeed;
    let currentSpeed = baseSpeed;
    let offset = 0;
    let lastTime = null;
    let rafId = null;

    const tick = (time) => {
      if (lastTime === null) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;

      const easing = Math.min(1, delta / 240);
      currentSpeed += (targetSpeed - currentSpeed) * easing;

      offset += direction * (currentSpeed * delta) / 1000;

      if (direction === -1) {
        let firstWidth = getFirstWidth();
        while (firstWidth && offset <= -firstWidth) {
          offset += firstWidth;
          track.appendChild(track.firstElementChild);
          firstWidth = getFirstWidth();
        }
      } else {
        while (offset >= 0) {
          const lastWidth = getLastWidth();
          if (!lastWidth) break;
          offset -= lastWidth;
          track.insertBefore(track.lastElementChild, track.firstElementChild);
        }
      }

      track.style.transform = `translateX(${offset}px)`;
      rafId = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafId) cancelAnimationFrame(rafId);
      updateGap();
      offset = direction === -1 ? 0 : -getLastWidth();
      lastTime = null;
      currentSpeed = baseSpeed;
      targetSpeed = baseSpeed;
      track.style.transform = `translateX(${offset}px)`;
      rafId = requestAnimationFrame(tick);
    };

    const slow = () => { targetSpeed = baseSpeed * 0.35; };
    const resume = () => { targetSpeed = baseSpeed; };

    wrapper.addEventListener('pointerenter', slow);
    wrapper.addEventListener('pointerleave', resume);
    wrapper.addEventListener('pointerdown', slow);
    wrapper.addEventListener('pointerup', resume);
    wrapper.addEventListener('pointercancel', resume);
    wrapper.addEventListener('focusin', slow);
    wrapper.addEventListener('focusout', resume);

    const ro = new ResizeObserver(() => {
      ensureFill();
      start();
    });
    ro.observe(wrapper);

    requestAnimationFrame(start);
  });

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
