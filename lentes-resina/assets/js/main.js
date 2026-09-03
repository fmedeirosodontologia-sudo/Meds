/* Art Barra — Lentes em Resina Estratificada: interações da página */
(() => {
  'use strict';

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

  /* ---------- barra fixa do WhatsApp (rola até as unidades) ---------- */
  const barra = $('#waBar');
  const hero = $('.hero');
  if (barra && hero && 'IntersectionObserver' in window) {
    let passouHero = false;
    const concorrentes = ['#unidades', '#contato', '.footer'].map((s) => $(s)).filter(Boolean);
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

  /* ---------- formulário: escolhe o WhatsApp certo pela unidade ---------- */
  const form = $('#waForm');
  const aviso = $('#formNote');
  if (form && aviso) {
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

      const unidadeSelect = $('#fUnidade');
      const numero = unidadeSelect.value;
      const unidadeNome = unidadeSelect.options[unidadeSelect.selectedIndex].text;
      const obs = $('#fObs').value.trim();
      const partes = [
        `Olá! Meu nome é ${nome}.`,
        `Quero agendar uma avaliação para Lentes em Resina Estratificada na unidade ${unidadeNome}.`,
        `Melhor horário para contato: ${$('#fPeriodo').value}.`,
      ];
      if (obs) partes.push(obs);

      const url = `https://wa.me/${numero}?text=${encodeURIComponent(partes.join(' '))}`;
      aviso.style.color = '#1a7f37';
      aviso.textContent = 'Abrindo o WhatsApp com a sua mensagem…';
      window.open(url, '_blank', 'noopener');
    });
  }
})();
