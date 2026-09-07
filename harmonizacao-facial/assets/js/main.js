/* Dra. Nathalia Gomes — Harmonização Orofacial — interações do site */
(() => {
  'use strict';

  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- ano no rodapé ---------- */
  const ano = $('#year');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- navegação ---------- */
  const nav = $('#nav');
  const marcarNav = () => nav && nav.classList.toggle('is-solid', window.scrollY > 24);
  marcarNav();
  window.addEventListener('scroll', marcarNav, { passive: true });

  const toggle = $('#navToggle');
  const sheet = $('#navSheet');
  if (toggle && sheet) {
    const fechar = () => {
      sheet.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      setTimeout(() => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 300);
    };
    toggle.addEventListener('click', () => {
      const abrindo = sheet.hidden || !sheet.classList.contains('is-open');
      if (abrindo) {
        sheet.hidden = false;
        requestAnimationFrame(() => sheet.classList.add('is-open'));
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        fechar();
      }
    });
    $$('a', sheet).forEach((a) => a.addEventListener('click', fechar));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar(); });
  }

  /* ---------- parallax suave do hero ---------- */
  const heroContent = $('#heroContent');
  const hero = $('.hero');
  if (heroContent && hero && !semMovimento) {
    let agendado = false;
    const atualizar = () => {
      const altura = hero.offsetHeight || 1;
      const p = Math.min(Math.max(window.scrollY / altura, 0), 1);
      heroContent.style.transform = `translate3d(0, ${p * -46}px, 0) scale(${1 - p * 0.06})`;
      heroContent.style.opacity = String(Math.max(1 - p * 1.5, 0));
      agendado = false;
    };
    window.addEventListener('scroll', () => {
      if (!agendado) { requestAnimationFrame(atualizar); agendado = true; }
    }, { passive: true });
    atualizar();
  }

  /* ---------- revelar ao rolar ---------- */
  const reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => obs.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- protocolo: troca a foto conforme o texto passa ---------- */
  const passos = $$('.story__step');
  const quadros = $$('.story__frame');
  if ('IntersectionObserver' in window && passos.length && quadros.length) {
    const ativar = (i) => {
      passos.forEach((p) => p.classList.toggle('is-active', p.dataset.step === i));
      quadros.forEach((q) => q.classList.toggle('is-active', q.dataset.frame === i));
    };

    const naFaixa = new Set();
    const escolher = () => {
      if (!naFaixa.size) return;
      const centro = window.innerHeight / 2;
      let alvo = null, menor = Infinity;
      naFaixa.forEach((p) => {
        const r = p.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - centro);
        if (d < menor) { menor = d; alvo = p; }
      });
      if (alvo) ativar(alvo.dataset.step);
    };

    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) naFaixa.add(e.target); else naFaixa.delete(e.target);
      });
      escolher();
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
    passos.forEach((p) => obs.observe(p));
  }

  /* ---------- galeria: destaca a foto mais próxima do centro ---------- */
  const trilho = $('#galleryTrack');
  if (trilho) {
    const fotos = $$('.shot', trilho);
    const destacar = () => {
      const r = trilho.getBoundingClientRect();
      const centro = r.left + r.width / 2;
      let alvo = null, menor = Infinity;
      fotos.forEach((f) => {
        const fr = f.getBoundingClientRect();
        const d = Math.abs(fr.left + fr.width / 2 - centro);
        if (d < menor) { menor = d; alvo = f; }
      });
      fotos.forEach((f) => f.classList.toggle('is-focused', f === alvo));
    };
    let agendado = false;
    trilho.addEventListener('scroll', () => {
      if (!agendado) { requestAnimationFrame(() => { destacar(); agendado = false; }); agendado = true; }
    }, { passive: true });
    window.addEventListener('resize', destacar);
    destacar();
  }

  /* ---------- barra fixa do WhatsApp (aparece depois do hero) ---------- */
  const barra = $('#waBar');
  if (barra && hero && 'IntersectionObserver' in window) {
    let passouHero = false;
    const concorrentes = ['#contato', '.footer'].map((s) => $(s)).filter(Boolean);
    const visiveis = new Set();
    const sincronizar = () => barra.classList.toggle('is-visible', passouHero && visiveis.size === 0);

    new IntersectionObserver(([e]) => { passouHero = !e.isIntersecting; sincronizar(); },
      { threshold: 0.2 }).observe(hero);

    const obsConcorrente = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) visiveis.add(e.target); else visiveis.delete(e.target);
      });
      sincronizar();
    }, { threshold: 0.12 });
    concorrentes.forEach((el) => obsConcorrente.observe(el));
  }

  /* ---------- formulário: monta a mensagem e abre o WhatsApp já preenchido ---------- */
  const form = $('#waForm');
  const aviso = $('#formNote');
  const linkWa = $('#waLink');
  if (form && aviso && linkWa) {
    // o número vem do próprio link base — assim existe um só lugar para trocar
    const numero = (linkWa.href.match(/wa\.me\/(\d+)/) || [])[1];

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nome = $('#fNome').value.trim();
      if (!nome) {
        $('#fNome').setAttribute('aria-invalid', 'true');
        $('#fNome').focus();
        aviso.style.color = '';
        aviso.textContent = 'Falta só o seu nome para montar a mensagem.';
        return;
      }
      $('#fNome').removeAttribute('aria-invalid');

      const obs = $('#fObs').value.trim();
      const partes = [
        `Olá, Dra. Nathalia! Meu nome é ${nome}.`,
        `Tenho interesse em: ${$('#fServico').value}.`,
        `Prefiro atendimento em: ${$('#fLocal').value}.`,
      ];
      if (obs) partes.push(obs);
      const mensagem = partes.join(' ');

      aviso.style.color = '#8a6238';
      aviso.textContent = 'Abrindo o WhatsApp com a sua mensagem…';
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
    });
  }
})();
