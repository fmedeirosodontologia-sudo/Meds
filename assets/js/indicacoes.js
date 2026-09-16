/* Gracie Barra Itaguaí — página "Indique e Ganhe" */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

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

  /* ---------- amigos indicados: adicionar/remover linhas ---------- */
  const indicadosList = $('#indicadosList');
  const indicadoTemplate = $('#indicadoTemplate');
  const addIndicado = $('#addIndicado');

  const atualizarRemover = () => {
    const linhas = $$('.indicado', indicadosList);
    linhas.forEach((linha) => {
      linha.querySelector('.indicado__remover').hidden = linhas.length < 2;
    });
  };

  if (indicadosList && indicadoTemplate && addIndicado) {
    addIndicado.addEventListener('click', () => {
      indicadosList.appendChild(indicadoTemplate.content.cloneNode(true));
      atualizarRemover();
      $$('.rIndicadoNome', indicadosList).pop().focus();
    });

    indicadosList.addEventListener('click', (e) => {
      const botao = e.target.closest('.indicado__remover');
      if (!botao) return;
      botao.closest('.indicado').remove();
      atualizarRemover();
    });
  }

  /* ---------- formulário: monta a mensagem e abre o WhatsApp ----------
     Mesmo caminho do formulário da home: sem backend, o WhatsApp em si é
     o registro da indicação — a equipe recebe a conversa e depois atualiza
     o ranking à mão. */
  const form = $('#refForm');
  const aviso = $('#refFormNote');
  if (form && aviso) {
    const linkBase = $('.footer__links a[href*="wa.me"]');
    const numero = linkBase ? (linkBase.href.match(/wa\.me\/(\d+)/) || [])[1] : '';

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const alunoNome = $('#rAlunoNome').value.trim();
      const alunoWhats = $('#rAlunoWhats').value.trim();
      const obs = $('#rObs').value.trim();

      const linhas = $$('.indicado', indicadosList).map((linha) => ({
        nome: linha.querySelector('.rIndicadoNome').value.trim(),
        whats: linha.querySelector('.rIndicadoWhats').value.trim(),
      }));
      const preenchidas = linhas.filter((l) => l.nome || l.whats);
      const completas = preenchidas.filter((l) => l.nome && l.whats);

      aviso.style.color = '';
      if (!alunoNome || !alunoWhats) {
        aviso.textContent = 'Preencha seu nome e WhatsApp.';
        return;
      }
      if (!preenchidas.length) {
        aviso.textContent = 'Preencha o nome e o WhatsApp de pelo menos um amigo indicado.';
        return;
      }
      if (completas.length < preenchidas.length) {
        aviso.textContent = 'Falta o nome ou o WhatsApp de um dos amigos — complete ou remova a linha.';
        return;
      }

      const partes = [`Olá! Sou aluno(a) da Gracie Barra Itaguaí: ${alunoNome} (${alunoWhats}).`];
      if (completas.length === 1) {
        partes.push(`Quero indicar ${completas[0].nome} (${completas[0].whats}) para a disputa Indique e Ganhe.`);
      } else {
        partes.push('Quero indicar estes amigos para a disputa Indique e Ganhe:');
        completas.forEach((l, i) => partes.push(`${i + 1}) ${l.nome} (${l.whats})`));
      }
      if (obs) partes.push(obs);

      const url = `https://wa.me/${numero}?text=${encodeURIComponent(partes.join('\n'))}`;
      aviso.style.color = '#1a7f37';
      aviso.textContent = 'Abrindo o WhatsApp com a sua indicação…';
      window.open(url, '_blank', 'noopener');
      form.reset();

      $$('.indicado', indicadosList).slice(1).forEach((linha) => linha.remove());
      atualizarRemover();
    });
  }
})();
