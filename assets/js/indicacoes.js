/* Gracie Barra Itaguaí — página "Indique e Ganhe" */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  /* metas bônus: vale a maior faixa já atingida, independente da posição */
  const METAS = [
    { min: 40, texto: '🥋 Kimono Lutador' },
    { min: 25, texto: '🎒 Mochila' },
    { min: 10, texto: '🧴 Garrafa' },
  ];
  const metaAtingida = (n) => {
    const meta = METAS.find((m) => (n || 0) >= m.min);
    return meta ? `<span class="ranking__badge">${meta.texto}</span>` : '';
  };

  /* ---------- ranking ----------
     Lido de assets/data/ranking-indicacoes.json. A equipe atualiza esse
     arquivo (campo "ranking": [{ "nome": "...", "matriculas": N }, ...])
     conforme as indicações fecham matrícula; não há backend automático. */
  const lista = $('#rankingList');
  const dataInfo = $('#rankingData');

  if (lista) {
    fetch('assets/data/ranking-indicacoes.json', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        const ranking = Array.isArray(json.ranking) ? json.ranking.slice() : [];
        ranking.sort((a, b) => (b.matriculas || 0) - (a.matriculas || 0));

        if (!ranking.length) {
          lista.innerHTML = '<li class="ranking__vazio">A disputa começou! Assim que as primeiras indicações fecharem matrícula, o ranking aparece aqui.</li>';
        } else {
          lista.innerHTML = ranking.slice(0, 10).map((item, i) => `
            <li class="ranking__item">
              <span class="ranking__pos">${i + 1}º</span>
              <span class="ranking__nome">${escapeHtml(item.nome || '—')}</span>
              ${metaAtingida(item.matriculas)}
              <span class="ranking__pontos"><strong>${item.matriculas || 0}</strong>${item.matriculas === 1 ? 'matrícula' : 'matrículas'}</span>
            </li>
          `).join('');
        }

        if (dataInfo && json.atualizadoEm) {
          dataInfo.textContent = `Última atualização: ${json.atualizadoEm}`;
        }
      })
      .catch(() => {
        lista.innerHTML = '<li class="ranking__vazio">Não foi possível carregar o ranking agora. Tente novamente em instantes.</li>';
      });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  /* ---------- formulário: envia para o Netlify Forms e avisa no WhatsApp ---------- */
  const form = $('#refForm');
  const aviso = $('#refFormNote');
  if (form && aviso) {
    const linkBase = $('.footer__links a[href*="wa.me"]');
    const numero = linkBase ? (linkBase.href.match(/wa\.me\/(\d+)/) || [])[1] : '';

    const encode = (data) => Object.keys(data)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
      .join('&');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const alunoNome = $('#rAlunoNome').value.trim();
      const alunoWhats = $('#rAlunoWhats').value.trim();
      const indicadoNome = $('#rIndicadoNome').value.trim();
      const indicadoWhats = $('#rIndicadoWhats').value.trim();
      const obs = $('#rObs').value.trim();

      if (!alunoNome || !alunoWhats || !indicadoNome || !indicadoWhats) {
        aviso.style.color = '';
        aviso.textContent = 'Preencha seu nome e WhatsApp, e o nome e WhatsApp do amigo indicado.';
        return;
      }

      const dados = {
        'form-name': 'indicacoes',
        aluno_nome: alunoNome,
        aluno_whatsapp: alunoWhats,
        indicado_nome: indicadoNome,
        indicado_whatsapp: indicadoWhats,
        obs,
      };

      aviso.style.color = '';
      aviso.textContent = 'Enviando sua indicação…';

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(dados),
      })
        .then(() => avisarSucesso())
        .catch(() => avisarSucesso()); // mesmo se a rede falhar, o WhatsApp garante o contato

      function avisarSucesso() {
        aviso.style.color = '#1a7f37';
        aviso.textContent = 'Indicação enviada! Abrindo o WhatsApp para confirmar com a gente…';
        form.reset();

        const partes = [
          `Olá! Sou aluno(a) da Gracie Barra Itaguaí: ${alunoNome} (${alunoWhats}).`,
          `Quero indicar ${indicadoNome} (${indicadoWhats}) para a disputa Indique e Ganhe.`,
        ];
        if (obs) partes.push(obs);
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(partes.join(' '))}`;
        window.open(url, '_blank', 'noopener');
      }
    });
  }
})();
