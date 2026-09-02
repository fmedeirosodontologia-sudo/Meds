/* Smile Makers — interações da página */
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

  /* ---------- vídeo do hero ----------
     Carrega só depois do primeiro paint, e nunca em conexão limitada,
     em economia de dados ou com "reduzir movimento" ligado.               */
  const video = $('#heroVideo');
  if (video && !semMovimento) {
    const conexao = navigator.connection || {};
    const conexaoLenta = conexao.saveData === true ||
                         /(^|-)2g$/.test(conexao.effectiveType || '');
    if (!conexaoLenta) {
      // só observa a visibilidade depois que o vídeo já engatou, senão o
      // pause() inicial aborta o download e o vídeo nunca começa
      const economizarBateria = () => {
        const secaoHero = $('.hero');
        if (!secaoHero || !('IntersectionObserver' in window)) return;
        new IntersectionObserver((entradas) => {
          entradas.forEach((e) => {
            if (e.isIntersecting) video.play().catch(() => {});
            else video.pause();
          });
        }, { threshold: 0.05 }).observe(secaoHero);
      };

      const iniciar = () => {
        video.load(); // as <source> já estão no HTML; preload="none" segura até aqui
        const tocar = video.play();
        if (tocar && tocar.then) {
          tocar.then(() => { video.classList.add('is-playing'); economizarBateria(); })
               .catch(() => {}); // autoplay bloqueado: fica no poster
        } else {
          video.classList.add('is-playing');
          economizarBateria();
        }
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(iniciar, { timeout: 2500 });
      } else {
        window.addEventListener('load', () => setTimeout(iniciar, 400));
      }
    }
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
    // esconde a barra onde já existe um CTA equivalente na tela
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

  /* ---------- formulário: monta a mensagem e abre o WhatsApp ---------- */
  const form = $('#waForm');
  const aviso = $('#formNote');
  if (form && aviso) {
    // o número vem do próprio link do rodapé — assim existe um só lugar para trocar
    const linkBase = $('.footer__links a[href*="wa.me"]');
    const numero = linkBase ? (linkBase.href.match(/wa\.me\/(\d+)/) || [])[1] : '';

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

      const cidade = $('#fCidade').value.trim();
      const obs = $('#fObs').value.trim();
      const partes = [
        `Olá! Meu nome é ${nome}.`,
        cidade ? `Atuo em ${cidade}.` : null,
        `Sobre resina composta: ${$('#fNivel').value}.`,
        `Melhor horário para contato: ${$('#fPeriodo').value}.`,
        'Quero saber mais sobre a mentoria Smile Makers.',
      ].filter(Boolean);
      if (obs) partes.push(obs);

      const url = `https://wa.me/${numero}?text=${encodeURIComponent(partes.join(' '))}`;
      aviso.style.color = '#1a7f37';
      aviso.textContent = 'Abrindo o WhatsApp com a sua mensagem…';
      window.open(url, '_blank', 'noopener');
    });
  }
})();
