/* =========================================================
   FRIONEX · Página da loja
   ========================================================= */
(function () {
  'use strict';

  const API = window.FrionexAPI;
  const UI = window.FrionexUI;

  const storeId = Number(new URLSearchParams(location.search).get('id') || 1);
  let vendedor = null;
  let aba = 'todos';

  const secao = document.getElementById('storeGridWrap');
  const sobre = document.getElementById('storeAbout');
  const grid = document.getElementById('storeGrid');

  /* ---------------- render ---------------- */
  function preencherCabecalho(v) {
    const lojaNome = v.nome_loja;
    document.title = `${lojaNome} · Frionex`;

    const h1 = document.querySelector('.store-id h1');
    if (h1) {
      h1.innerHTML = `${UI.esc(lojaNome)} <span class="badge-verified">${UI.icon('verified')} Verificado</span>`;
    }
    const desc = document.querySelector('.store-id p');
    if (desc) desc.textContent = v.descricao;

    const avatar = document.querySelector('.store-avatar img');
    if (avatar) {
      avatar.src = v.foto || 'assets/img/avatar-loja.svg';
      avatar.alt = `Logo da loja ${lojaNome}`;
    }
    const capaLabel = document.querySelector('.store-cover-label');
    if (capaLabel) capaLabel.textContent = `Loja oficial · ${v.localizacao}`;

    const meta = document.querySelector('.store-meta');
    if (meta) {
      meta.innerHTML = `
        <span>${UI.icon('pin')} ${UI.esc(v.localizacao)}</span>
        <span>${UI.icon('clock')} Último acesso ${UI.esc(v.ultimo_login)}</span>
        <span>${UI.icon('chat')} Responde ${v.taxa_resposta}% das mensagens</span>
        <span>${UI.icon('truck')} Envio em até 24h</span>`;
    }

    const produtos = Array.isArray(v.produtos) ? v.produtos : [];
    const totalProdutos = produtos.length || Number(v.produtos) || 0;
    const totalVendidos = produtos.reduce((soma, p) => soma + Number(p.vendidos || 0), 0);

    const stats = {
      statProdutos: totalProdutos,
      statAvaliacoes: v.avaliacoes,
      statNota: v.avaliacoes ? '4,9' : '—',
      statVendidos: totalVendidos
    };
    Object.entries(stats).forEach(([id, valor]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = valor;
    });

    const nav = document.querySelector('.breadcrumb .current');
    if (nav) nav.textContent = lojaNome;
  }

  function listaFiltrada() {
    const produtos = (vendedor && vendedor.produtos) || [];
    if (aba === 'avaliados') {
      return produtos.slice().sort((a, b) => b.nota - a.nota || b.avaliacoes - a.avaliacoes);
    }
    if (aba === 'ofertas') {
      return produtos
        .filter((p) => p.preco_antigo > p.preco)
        .sort((a, b) => (b.preco_antigo - b.preco) - (a.preco_antigo - a.preco));
    }
    return produtos.slice().sort((a, b) => (b.destaque - a.destaque) || (b.vendidos - a.vendidos));
  }

  function renderProdutos() {
    if (!grid) return;
    const lista = listaFiltrada();
    if (!lista.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <span class="empty-ico">${UI.icon('box')}</span>
          <h3>Nenhum produto nesta seção</h3>
          <p>Esta loja ainda não publicou produtos com esse filtro. Veja todos os itens disponíveis.</p>
          <button class="btn btn-outline" type="button" data-store-tab="todos">Ver todos os produtos</button>
        </div>`;
      return;
    }
    grid.innerHTML = lista.map(UI.productCard).join('');
    UI.syncFavButtons();
    UI.hydrateIcons(grid);
  }

  function trocarAba(nome) {
    aba = nome;
    document.querySelectorAll('[data-store-tab]').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.storeTab === nome);
    });
    const mostrarSobre = nome === 'sobre';
    if (secao) secao.hidden = mostrarSobre;
    if (sobre) sobre.hidden = !mostrarSobre;
    if (!mostrarSobre) renderProdutos();
  }

  async function carregar() {
    try {
      vendedor = await API.vendedor(storeId);
      preencherCabecalho(vendedor);
      renderProdutos();
    } catch (err) {
      const view = document.getElementById('storeView');
      if (view) {
        view.innerHTML = `
          <div class="empty-state">
            <span class="empty-ico">${UI.icon('store')}</span>
            <h3>Loja não encontrada</h3>
            <p>${UI.esc(err.message)}</p>
            <a class="btn btn-grad" href="index.html">Voltar ao catálogo</a>
          </div>`;
      }
    }
  }

  /* ---------------- eventos ---------------- */
  function bind() {
    document.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-store-tab]');
      if (tab) { trocarAba(tab.dataset.storeTab); return; }

      if (e.target.closest('[data-follow-store]')) {
        const btn = e.target.closest('[data-follow-store]');
        const seguindo = btn.dataset.seguindo === '1';
        btn.dataset.seguindo = seguindo ? '0' : '1';
        btn.classList.toggle('btn-grad', !seguindo);
        btn.classList.toggle('btn-outline', seguindo);
        btn.innerHTML = seguindo
          ? `${UI.icon('heart')} Seguir loja`
          : `${UI.icon('check')} Seguindo`;
        UI.toast(seguindo ? 'Você deixou de seguir a loja.' : 'Você está seguindo a loja. Avisaremos das novidades.', 'info');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    carregar();
  });
})();
