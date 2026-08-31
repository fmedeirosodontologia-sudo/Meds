(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: blur on scroll ---------- */
  const nav = document.getElementById('nav');
  const onNavScroll = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  onNavScroll();
  window.addEventListener('scroll', onNavScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navSheet = document.getElementById('navSheet');
  if (navToggle && navSheet) {
    const closeSheet = () => {
      navSheet.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };
    navToggle.addEventListener('click', () => {
      const open = navSheet.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    navSheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeSheet));
  }

  /* ---------- Hero parallax (rAF-throttled, iOS-friendly) ---------- */
  const heroBg = document.getElementById('heroBg');
  const heroContent = document.getElementById('heroContent');
  const hero = document.querySelector('.hero');

  if (!reduceMotion && heroBg && heroContent && hero) {
    let ticking = false;
    const update = () => {
      const h = hero.offsetHeight || 1;
      const progress = Math.min(Math.max(window.scrollY / h, 0), 1.2);
      heroBg.style.transform = `translate3d(0, ${progress * 60}px, 0)`;
      heroContent.style.transform = `translate3d(0, ${progress * -40}px, 0) scale(${1 - progress * 0.08})`;
      heroContent.style.opacity = String(Math.max(1 - progress * 1.6, 0));
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ---------- Reveal-on-scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Story scrollytelling: crossfade images tied to text steps ---------- */
  const steps = document.querySelectorAll('.story__step');
  const frames = document.querySelectorAll('.story__frame');
  if ('IntersectionObserver' in window && steps.length && frames.length) {
    const activate = (index) => {
      steps.forEach((s) => s.classList.toggle('is-active', s.dataset.step === String(index)));
      frames.forEach((f) => f.classList.toggle('is-active', f.dataset.frame === String(index)));
    };
    const storyIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activate(entry.target.dataset.step);
        }
      });
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => storyIO.observe(s));
  }

  /* ---------- Gallery: focus item nearest center while scrolling ---------- */
  const galleryTrack = document.getElementById('galleryTrack');
  if (galleryTrack) {
    const items = Array.from(galleryTrack.querySelectorAll('.gallery__item'));
    const focusNearest = () => {
      const trackRect = galleryTrack.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let closest = null;
      let closestDist = Infinity;
      items.forEach((item) => {
        const r = item.getBoundingClientRect();
        const itemCenter = r.left + r.width / 2;
        const dist = Math.abs(itemCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = item;
        }
      });
      items.forEach((item) => item.classList.toggle('is-focused', item === closest));
    };
    let galleryTicking = false;
    galleryTrack.addEventListener('scroll', () => {
      if (!galleryTicking) {
        requestAnimationFrame(() => {
          focusNearest();
          galleryTicking = false;
        });
        galleryTicking = true;
      }
    }, { passive: true });
    focusNearest();
    window.addEventListener('resize', focusNearest);
  }

  /* ---------- Contact form (client-side only, no backend wired yet) ---------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (form && formNote) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      const telefone = form.telefone.value.trim();
      if (!nome || !telefone) {
        formNote.textContent = 'Preencha nome e WhatsApp para continuar.';
        return;
      }
      formNote.style.color = '#1a7f37';
      formNote.textContent = `Obrigado, ${nome.split(' ')[0]}! Recebemos seus dados — em breve entraremos em contato pelo WhatsApp.`;
      form.reset();
    });
  }
})();
