/* =========================================================
   FRIONEX · Mensagens (chat comprador ↔ vendedor)
   As conversas ficam salvas no navegador. Entrando com a conta
   do comprador e depois com a do vendedor (ou em duas abas),
   dá para ver a conversa dos dois lados.
   ========================================================= */
(function () {
  'use strict';

  const API = window.FrionexAPI;
  const UI = window.FrionexUI;
  const Store = window.FrionexStore;
  const R = window.FrionexRegiao;

  const session = Store.Auth.require('mensagens.html' + location.search);
  if (!session) return;

  const root = document.getElementById('chatRoot');
  const { icon, esc, money } = UI;
  const params = new URLSearchParams(location.search);
  let ativa = null;      // id da conversa aberta
  let ultimoHash = '';   // evita redesenhar sem mudanças

  const hora = (iso) => {
    const d = new Date(iso);
    const hoje = new Date();
    return d.toDateString() === hoje.toDateString()
      ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  /* abre (ou cria) a conversa pedida na URL */
  try {
    if (params.get('vendedor') || params.get('comprador')) {
      ativa = API.abrirConversa(session.id, {
        vendedor: params.get('vendedor'),
        comprador: params.get('comprador'),
        produto: params.get('produto'),
        pedido: params.get('pedido')
      });
      history.replaceState({}, '', `mensagens.html?c=${ativa}`);
    } else if (params.get('c')) {
      ativa = Number(params.get('c'));
    }
  } catch (err) {
    UI.toast(err.message, 'error');
  }

  function listaHTML(conversas) {
    return `
      <aside class="card chat-list">
        <div class="chat-list-head">
          <h1>Mensagens</h1>
          <span>${session.tipo === 'vendedor' ? 'Conversas com compradores' : 'Conversas com lojas'}</span>
        </div>
        ${conversas.length ? conversas.map((c) => `
          <button type="button" class="chat-item ${c.id === ativa ? 'is-active' : ''}" data-conversa="${c.id}">
            <span class="avatar">${c.eu === 'comprador' && c.loja ? `<img src="${esc(c.loja.foto)}" alt="">` : esc(UI.initials(c.titulo))}</span>
            <span class="chat-item-info">
              <strong>${esc(c.titulo)}</strong>
              <small>${c.ultima ? `${c.ultima.de === c.eu ? 'Você: ' : ''}${esc(c.ultima.texto)}` : 'Nova conversa'}</small>
            </span>
            <span class="chat-item-meta">
              ${c.ultima ? `<small>${hora(c.ultima.data)}</small>` : ''}
              ${c.naoLidas ? `<b class="chat-badge">${c.naoLidas}</b>` : ''}
            </span>
          </button>`).join('') : `
          <div class="chat-empty-list">
            ${icon('chat')}
            <p>${session.tipo === 'vendedor'
              ? 'Quando um comprador falar com a sua loja, a conversa aparece aqui.'
              : 'Abra um produto e toque em <strong>Conversar</strong> para falar com a loja.'}</p>
          </div>`}
      </aside>`;
  }

  function contextoHTML(c) {
    const partes = [];
    if (c.produto) {
      const d = R ? R.distanciaProduto(c.produto) : null;
      partes.push(`
        <a class="chat-context" href="produto.html?id=${c.produto.id}">
          <img src="${esc(c.produto.foto)}" alt="">
          <span><strong>${esc(c.produto.nome)}</strong>
          <small>${money(c.produto.preco)}${d != null && c.eu === 'comprador' ? ` · ${R.formatarKm(d)}` : ''}</small></span>
        </a>`);
    }
    if (c.id_pedido) {
      partes.push(`<a class="chat-context chat-context-order" href="${c.eu === 'vendedor' ? 'vender.html#vendas' : 'pedidos.html'}">${icon('package')}<span><strong>Pedido #${c.id_pedido}</strong><small>ver detalhes</small></span></a>`);
    }
    return partes.join('');
  }

  function threadHTML(c) {
    if (!c) {
      return `
        <section class="card chat-thread chat-thread-empty">
          ${icon('chat')}
          <h2>Escolha uma conversa</h2>
          <p>Tire dúvidas sobre peças, compatibilidade, frete e retirada direto com quem vende.</p>
        </section>`;
    }
    const cidadeLoja = R && c.loja ? R.cidadeDoVendedor(c.loja) : null;
    return `
      <section class="card chat-thread">
        <header class="chat-thread-head">
          <button type="button" class="icon-btn chat-back" data-voltar aria-label="Voltar para a lista">${icon('chevron')}</button>
          <span class="avatar">${c.eu === 'comprador' && c.loja ? `<img src="${esc(c.loja.foto)}" alt="">` : esc(UI.initials(c.titulo))}</span>
          <span class="chat-thread-title">
            <strong>${esc(c.titulo)}</strong>
            <small>${c.eu === 'comprador'
              ? `${cidadeLoja ? `${icon('pin')} ${esc(cidadeLoja.nome)}/${cidadeLoja.uf} · ` : ''}responde ${c.loja && c.loja.taxa_resposta >= 80 ? 'rápido' : 'em algumas horas'}`
              : 'Comprador'}</small>
          </span>
          ${c.eu === 'comprador' && c.loja ? `<a class="btn btn-soft btn-sm" href="loja.html?id=${c.loja.id}">Ver loja</a>` : ''}
        </header>
        <div class="chat-contexts">${contextoHTML(c)}</div>
        <div class="chat-messages" id="chatMessages">
          ${c.mensagens.length ? c.mensagens.map((m) => `
            <div class="msg ${m.de === c.eu ? 'is-mine' : ''}">
              <p>${esc(m.texto)}</p>
              <small>${hora(m.data)}${m.auto ? ' · resposta automática' : ''}${m.de === c.eu ? ` · ${m.lida ? 'lida' : 'enviada'}` : ''}</small>
            </div>`).join('') : `
            <div class="chat-hint">Diga olá! Pergunte sobre a peça, compatibilidade, prazo de entrega ou retirada na loja.</div>`}
        </div>
        <div class="chat-quick">
          ${(c.eu === 'comprador'
            ? ['Ainda tem em estoque?', 'Serve no meu modelo?', 'Posso retirar na loja?', 'Qual o prazo de entrega?']
            : ['Temos sim, em estoque!', 'Pode retirar hoje na loja.', 'Já foi enviado, segue o rastreio.', 'Me passa o modelo do seu aparelho?']
          ).map((t) => `<button type="button" class="chip-btn" data-rapida="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
        <form class="chat-form" data-chat-form>
          <input type="text" name="texto" placeholder="Escreva uma mensagem…" autocomplete="off" maxlength="1000" aria-label="Mensagem">
          <button class="btn btn-buy" type="submit" aria-label="Enviar">${icon('arrow')}</button>
        </form>
      </section>`;
  }

  function render(forcar) {
    const conversas = API.conversasSync(session.id);
    if (ativa && !conversas.some((c) => c.id === ativa)) ativa = null;
    const atual = conversas.find((c) => c.id === ativa) || null;
    if (atual) API.marcarLidas(session.id, atual.id);
    const hash = JSON.stringify(conversas.map((c) => [c.id, c.mensagens.length, c.naoLidas])) + ativa;
    if (!forcar && hash === ultimoHash) return;
    ultimoHash = hash;

    const rascunho = root.querySelector('[data-chat-form] input')?.value || '';
    root.classList.toggle('has-active', !!atual);
    root.innerHTML = listaHTML(API.conversasSync(session.id)) + threadHTML(atual);
    UI.hydrateIcons(root);
    const input = root.querySelector('[data-chat-form] input');
    if (input) { input.value = rascunho; }
    const box = document.getElementById('chatMessages');
    if (box) box.scrollTop = box.scrollHeight;
    UI.updateChatBadge?.();
  }

  function enviar(texto) {
    if (!ativa) return;
    try {
      const conversa = API.enviarMensagem(session.id, ativa, texto);
      render(true);
      root.querySelector('[data-chat-form] input')?.focus();
      // primeira mensagem do comprador: a loja responde automaticamente (protótipo)
      if (session.tipo !== 'vendedor' && !conversa.mensagens.some((m) => m.de === 'vendedor')) {
        setTimeout(() => { if (API.respostaAutomatica(conversa.id)) render(true); }, 1600);
      }
    } catch (err) { UI.toast(err.message, 'error'); }
  }

  root.addEventListener('click', (e) => {
    const item = e.target.closest('[data-conversa]');
    if (item) {
      ativa = Number(item.dataset.conversa);
      history.replaceState({}, '', `mensagens.html?c=${ativa}`);
      render(true);
      setTimeout(() => root.querySelector('[data-chat-form] input')?.focus(), 30);
      return;
    }
    if (e.target.closest('[data-voltar]')) {
      ativa = null;
      history.replaceState({}, '', 'mensagens.html');
      render(true);
      return;
    }
    const rapida = e.target.closest('[data-rapida]');
    if (rapida) enviar(rapida.dataset.rapida);
  });

  root.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-chat-form]');
    if (!form) return;
    e.preventDefault();
    const input = form.querySelector('input');
    const texto = input.value;
    if (!texto.trim()) return;
    input.value = '';
    enviar(texto);
  });

  // mensagens chegando de outra aba (ex.: vendedor logado em outra janela)
  window.addEventListener('storage', (e) => { if (e.key === 'frionex:mensagens') render(); });
  setInterval(() => render(), 2500);

  document.addEventListener('DOMContentLoaded', () => render(true));
})();
