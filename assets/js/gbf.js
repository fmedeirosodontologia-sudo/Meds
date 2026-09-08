/* GBF — vídeo com som sob demanda + formulário para o WhatsApp */
(() => {
  'use strict';
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  /* ---------- vídeo do hero: autoplay mudo, som com um toque ---------- */
  const video = $('#gbfVideo');
  const unmuteBtn = $('#gbfUnmute');
  if (video) {
    video.play().catch(() => {}); // garante o autoplay mesmo se o atributo falhar
  }
  if (video && unmuteBtn) {
    unmuteBtn.addEventListener('click', () => {
      video.muted = false;
      video.play().catch(() => {});
      unmuteBtn.hidden = true;
    });
    video.addEventListener('volumechange', () => {
      if (!video.muted) unmuteBtn.hidden = true;
    });
  }

  /* ---------- formulário: monta a mensagem e abre o WhatsApp ---------- */
  const numero = '5521986282251'; // mesmo WhatsApp da Gracie Barra Itaguaí
  const form = $('#gbfForm');
  const aviso = $('#gFormNote');
  if (form && aviso) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nomeEl = $('#gNome');
      const nome = nomeEl.value.trim();
      if (!nome) {
        nomeEl.setAttribute('aria-invalid', 'true');
        nomeEl.focus();
        aviso.style.color = '';
        aviso.textContent = 'Falta só o seu nome para montar a mensagem.';
        return;
      }
      nomeEl.removeAttribute('aria-invalid');

      const obs = $('#gObs').value.trim();
      const partes = [
        `Olá! Meu nome é ${nome}.`,
        `${$('#gInteresse').value}.`,
      ];
      if (obs) partes.push(obs);

      const url = `https://wa.me/${numero}?text=${encodeURIComponent(partes.join(' '))}`;
      aviso.style.color = '#1a7f37';
      aviso.textContent = 'Abrindo o WhatsApp com a sua mensagem…';
      window.open(url, '_blank', 'noopener');
    });
  }
})();
