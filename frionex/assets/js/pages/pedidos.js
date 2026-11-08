/* =========================================================
   FRIONEX · Meus pedidos
   ========================================================= */
(function () {
  'use strict';

  const API = window.FrionexAPI;
  const UI = window.FrionexUI;
  const Store = window.FrionexStore;

  const session = Store.Auth.require('pedidos.html');
  if (!session) return;

  const root = document.getElementById('ordersRoot');
  let pedidos = [];
  let filtro = 'todos';

  const FLUXO = ['Aguardando pagamento', 'Em preparo', 'Enviado', 'Entregue'];

  const statusClass = (status) => {
    const mapa = {
      'Entregue': 'status-entregue',
      'Enviado': 'status-enviado',
      'Em preparo': 'status-preparo',
      'Aguardando pagamento': 'status-aguardando',
      'Cancelado': 'status-cancelado'
    };
    return mapa[status] || 'status-preparo';
  };

  const dataBR = (iso) => {
    if (!iso) return '—';
    const d = new Date(`${iso}T12:00:00`);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  function filtrados() {
    if (filtro === 'andamento') return pedidos.filter((p) => p.status !== 'Entregue' && p.status !== 'Cancelado');
    if (filtro === 'entregues') return pedidos.filter((p) => p.status === 'Entregue');
    if (filtro === 'cancelados') return pedidos.filter((p) => p.status === 'Cancelado');
    return pedidos;
  }

  function orderHTML(pedido) {
    const vendedor = pedido.itens[0]?.produto?.vendedor;
    return `
      <article class="card order-card">
        <div class="order-head">
          <span class="order-id">Pedido #${pedido.id}</span>
          <span class="order-date">${dataBR(pedido.data)}</span>
          <span class="status ${statusClass(pedido.status)}">${UI.esc(pedido.status)}</span>
          <span style="margin-left:auto;font-size:11.5px;color:var(--muted)">
            ${UI.icon('card')} ${UI.esc(pedido.pagamento)}
          </span>
        </div>
        <div class="order-body">
          ${pedido.itens.map((item) => `
            <div class="order-item">
              <a href="produto.html?id=${item.id_produto}">
                <img src="${item.produto ? item.produto.foto : 'assets/img/produtos/box.svg'}" alt="">
              </a>
              <div class="order-item-info">
                <strong><a href="produto.html?id=${item.id_produto}">${UI.esc(item.produto ? item.produto.nome : 'Produto')}</a></strong>
                <span>Qtd. ${item.quantidade} · ${UI.money(item.preco_unitario)} cada${vendedor ? ` · ${UI.esc(vendedor.nome_loja)}` : ''}</span>
              </div>
              <span class="order-item-price">${UI.money(item.valor_total)}</span>
            </div>`).join('')}
        </div>
        <div class="order-foot">
          <span class="order-total">Total <strong>${UI.money(pedido.total)}</strong></span>
          <div class="order-actions">
            ${pedido.status !== 'Cancelado' ? `
              <button class="btn btn-outline btn-sm" type="button" data-track="${pedido.id}">
                ${UI.icon('truck')} Acompanhar
              </button>` : ''}
            ${pedido.status === 'Entregue' ? `
              <a class="btn btn-soft btn-sm" href="produto.html?id=${pedido.itens[0]?.id_produto || 2}#avaliacoes">
                ${UI.icon('star')} Avaliar
              </a>` : ''}
            <button class="btn btn-soft btn-sm" type="button" data-rebuy="${pedido.id}">
              ${UI.icon('cart')} Comprar novamente
            </button>
          </div>
        </div>
      </article>`;
  }

  function render() {
    if (!root) return;
    const lista = filtrados();
    const emAndamento = pedidos.filter((p) => p.status !== 'Entregue' && p.status !== 'Cancelado').length;
    const totalGasto = pedidos.reduce((soma, p) => soma + Number(p.total || 0), 0);

    root.innerHTML = `
      <div class="section-head" style="margin-bottom:18px">
        <div>
          <h1 class="page-title">Meus pedidos</h1>
          <p>${pedidos.length ? `${pedidos.length} ${pedidos.length === 1 ? 'pedido realizado' : 'pedidos realizados'} · ${emAndamento} em andamento` : 'Acompanhe suas compras e entregas.'}</p>
        </div>
        <a class="btn btn-outline" href="index.html">${UI.icon('store')} Continuar comprando</a>
      </div>

      ${pedidos.length ? `
        <div class="card card-pad" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:18px">
          <div class="store-stat"><strong>${pedidos.length}</strong><span>pedidos realizados</span></div>
          <div class="store-stat"><strong>${emAndamento}</strong><span>em andamento</span></div>
          <div class="store-stat"><strong>${UI.money(totalGasto)}</strong><span>total investido</span></div>
        </div>

        <div class="store-tabs" role="tablist" aria-label="Filtrar pedidos">
          <button class="store-tab ${filtro === 'todos' ? 'is-active' : ''}" type="button" data-filter="todos" role="tab">Todos</button>
          <button class="store-tab ${filtro === 'andamento' ? 'is-active' : ''}" type="button" data-filter="andamento" role="tab">Em andamento</button>
          <button class="store-tab ${filtro === 'entregues' ? 'is-active' : ''}" type="button" data-filter="entregues" role="tab">Entregues</button>
          <button class="store-tab ${filtro === 'cancelados' ? 'is-active' : ''}" type="button" data-filter="cancelados" role="tab">Cancelados</button>
        </div>

        <div class="orders-list">
          ${lista.length ? lista.map(orderHTML).join('') : `
            <div class="empty-state">
              <span class="empty-ico">${UI.icon('package')}</span>
              <h3>Nenhum pedido nesta seção</h3>
              <p>Troque o filtro para ver outros pedidos da sua conta.</p>
              <button class="btn btn-outline" type="button" data-filter="todos">Ver todos os pedidos</button>
            </div>`}
        </div>` : `
        <div class="empty-state">
          <span class="empty-ico">${UI.icon('package')}</span>
          <h3>Você ainda não tem pedidos</h3>
          <p>Quando finalizar sua primeira compra, o acompanhamento aparecerá aqui.</p>
          <a class="btn btn-grad" href="index.html">${UI.icon('store')} Explorar catálogo</a>
        </div>`}`;
    UI.hydrateIcons(root);
  }

  function abrirRastreio(pedido) {
    const idx = FLUXO.indexOf(pedido.status);
    const linhas = FLUXO.map((etapa, i) => {
      const feito = idx >= i;
      const atual = idx === i;
      return `
        <div class="settings-row">
          <div>
            <strong>${etapa}${atual ? ' · atual' : ''}</strong>
            <span>${feito ? (atual ? 'Em andamento agora' : 'Concluído') : 'Aguardando'}</span>
          </div>
          <span class="status ${feito ? 'status-entregue' : 'status-aguardando'}">${feito ? 'OK' : '—'}</span>
        </div>`;
    }).join('');

    UI.modal(`Acompanhar pedido #${pedido.id}`, `
      <div class="summary-row"><span>Status atual</span><strong>${UI.esc(pedido.status)}</strong></div>
      <div class="summary-row"><span>Pagamento</span><strong>${UI.esc(pedido.pagamento)}</strong></div>
      <div class="summary-row"><span>Data do pedido</span><strong>${dataBR(pedido.data)}</strong></div>
      <div class="settings-list" style="margin-top:14px">${linhas}</div>
      <div class="summary-note">${UI.icon('truck')} O código de rastreio é enviado por e-mail assim que o pedido é despachado.</div>
    `, {
      footer: `<button class="btn btn-outline btn-sm" type="button" data-modal-close>Fechar</button>`
    });
  }

  async function carregar() {
    pedidos = await API.pedidos(session.id);
    render();
  }

  function bind() {
    document.addEventListener('click', (e) => {
      const filter = e.target.closest('[data-filter]');
      if (filter) {
        filtro = filter.dataset.filter;
        render();
        return;
      }

      const track = e.target.closest('[data-track]');
      if (track) {
        const pedido = pedidos.find((p) => Number(p.id) === Number(track.dataset.track));
        if (pedido) abrirRastreio(pedido);
        return;
      }

      const rebuy = e.target.closest('[data-rebuy]');
      if (rebuy) {
        const pedido = pedidos.find((p) => Number(p.id) === Number(rebuy.dataset.rebuy));
        if (!pedido) return;
        pedido.itens.forEach((item) => Store.Cart.add(item.id_produto, item.quantidade));
        UI.toast('Itens adicionados ao carrinho. Redirecionando…');
        setTimeout(() => { location.href = 'carrinho.html'; }, 800);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    bind();
    try {
      await carregar();
    } catch (err) {
      root.innerHTML = `
        <div class="empty-state">
          <span class="empty-ico">${UI.icon('package')}</span>
          <h3>Não foi possível carregar seus pedidos</h3>
          <p>${UI.esc(err.message)}</p>
          <a class="btn btn-grad" href="index.html">Voltar ao início</a>
        </div>`;
      UI.hydrateIcons(root);
    }
  });
})();
