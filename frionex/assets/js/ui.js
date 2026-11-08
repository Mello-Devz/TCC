/* =========================================================
   FRIONEX · Componentes de interface compartilhados
   ========================================================= */
(function () {
  'use strict';

  const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
  const esc = (text) => String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    cart: '<path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>',
    heart: '<path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    chat: '<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H4l2.2-3.2A8.5 8.5 0 1 1 21 12Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    store: '<path d="M4 9h16v11H4zM4 9l2-4h12l2 4M9 20v-5h6v5"/>',
    pin: '<path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    shield: '<path d="M12 3 5 6v6c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
    pix: '<path d="m12 3 4 4-4 4-4-4 4-4ZM3 12l4-4 4 4-4 4-4-4Zm18 0-4-4-4 4 4 4 4-4ZM12 13l4 4-4 4-4-4 4-4Z"/>',
    boleto: '<path d="M4 5v14M7 5v14M11 5v14M14 5v14M17 5v14M20 5v14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    verified: '<path d="m12 3 2.3 2.2 3.2-.2.3 3.2 2.7 1.7-1.4 2.9 1.4 2.9-2.7 1.7-.3 3.2-3.2-.2L12 21l-2.3-2.6-3.2.2-.3-3.2L3.5 13.7 4.9 10.8 3.5 7.9l2.7-1.7.3-3.2 3.2.2L12 3Z"/><path d="m9 12 2 2 4-4"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    package: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    wind: '<path d="M4 8h10a3 3 0 1 0-3-3M4 12h14a2.5 2.5 0 1 1-2.5 2.5M4 16h7"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    tool: '<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5L15 13l-2-2 4.5-4.5a4 4 0 0 0-3-1Z"/>',
    box: '<path d="M4 8h16v11H4zM4 8l2-4h12l2 4M9 12h6"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1"/>',
    whatsapp: '<path d="M20 11.5A8.5 8.5 0 0 1 7.5 19L3 21l1.6-4.4A8.5 8.5 0 1 1 20 11.5Z"/><path d="M8.5 8.5c.5 3 2.5 5 5.5 5.5l1-1.5-2-1-.8.8a6 6 0 0 1-2.5-2.5l.8-.8-1-2-1 1.5Z"/>',
    logout: '<path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13 7 4 4"/>',
    location: '<path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
  };

  function icon(name, cls) {
    const path = ICONS[name] || ICONS.box;
    return `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  const initials = (nome) => String(nome || 'U').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  function stars(nota, showValue = false, count) {
    const rounded = Math.round(Number(nota) || 0);
    let html = '<span class="stars" aria-label="' + (nota || 0) + ' de 5 estrelas">';
    for (let i = 1; i <= 5; i++) {
      html += `<svg class="star ${i <= rounded ? 'is-filled' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>`;
    }
    html += '</span>';
    if (showValue) {
      html += `<span class="rating-value">${Number(nota || 0).toFixed(1).replace('.', ',')}</span>`;
    }
    if (count != null) {
      html += `<span class="rating-count">(${count})</span>`;
    }
    return `<div class="rating">${html}</div>`;
  }

  function discount(p) {
    if (!p.preco_antigo || p.preco_antigo <= p.preco) return 0;
    return Math.round((1 - p.preco / p.preco_antigo) * 100);
  }

  function priceBlock(p) {
    return `
      <div class="price-block">
        ${p.preco_antigo ? `<span class="price-old">${money(p.preco_antigo)}</span>` : ''}
        <div class="price-main"><span>R$</span> ${money(p.preco).replace('R$', '').trim()}</div>
        <span class="price-pix">${money(p.pix)} à vista com <strong>7% OFF</strong> no PIX</span>
        <span class="price-installments">ou ${p.parcelas}x de ${money(p.parcela_valor)} sem juros</span>
      </div>`;
  }

  /* ---------- regionalização ---------- */
  function regiaoChip() {
    const R = window.FrionexRegiao;
    const local = R ? R.atual() : null;
    return `<button type="button" class="regiao-chip" data-regiao-open>
        ${icon('pin')} ${local ? `Enviar para <strong>${esc(R.nomeLocal(local))}</strong>` : '<strong>Informe sua cidade</strong> e veja vendedores perto de você'}
        ${icon('chevron', 'chevron')}
      </button>`;
  }

  function localProduto(p) {
    const R = window.FrionexRegiao;
    if (!R || !p.vendedor) return '';
    const cidade = R.cidadeDoVendedor(p.vendedor);
    if (!cidade) return '';
    const d = R.distanciaProduto(p);
    return `<span class="product-local ${d != null && d <= 100 ? 'is-near' : ''}">${icon('pin')} ${esc(cidade.nome)}/${cidade.uf}${d != null ? ` · ${R.formatarKm(d)}` : ''}</span>`;
  }

  function abrirRegiao() {
    const R = window.FrionexRegiao;
    if (!R) return;
    const atual = R.atual();
    const porUf = {};
    R.CIDADES.forEach((c) => { (porUf[c.uf] = porUf[c.uf] || []).push(c); });
    const m = modal('Onde você está?', `
      <p style="font-size:13.5px;color:var(--muted);margin-bottom:14px">
        Usamos a sua cidade para mostrar vendedores próximos, calcular a distância e o frete de cada peça.
      </p>
      <form class="regiao-form" data-regiao-form>
        <div class="field">
          <label for="regCep">CEP</label>
          <input id="regCep" inputmode="numeric" maxlength="9" placeholder="00000-000" value="${atual && atual.cepInformado ? atual.cepInformado.replace(/(\d{5})(\d{3})/, '$1-$2') : ''}">
        </div>
        <div class="regiao-ou"><span>ou escolha a cidade</span></div>
        <div class="field">
          <label for="regCidade">Cidade</label>
          <select id="regCidade">
            <option value="">Selecione…</option>
            ${Object.entries(porUf).map(([uf, lista]) => `
              <optgroup label="${uf}">
                ${lista.map((c) => `<option value="${c.id}" ${atual && atual.id === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}
              </optgroup>`).join('')}
          </select>
        </div>
      </form>`, {
      footer: `${atual ? '<button class="btn btn-outline" type="button" data-regiao-clear>Limpar</button>' : ''}
               <button class="btn btn-buy" type="button" data-regiao-save>${icon('pin')} Usar esta região</button>`
    });
    const cep = m.querySelector('#regCep');
    const cidade = m.querySelector('#regCidade');
    cep.addEventListener('input', () => {
      const d = cep.value.replace(/\D/g, '').slice(0, 8);
      cep.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
      const local = R.localPorCep(d);
      if (local && !local.aproximado) cidade.value = local.id;
    });
    cidade.addEventListener('change', () => { if (cidade.value) cep.value = ''; });
    m.querySelector('[data-regiao-clear]')?.addEventListener('click', () => {
      R.limpar();
      closeModal();
      location.reload();
    });
    m.querySelector('[data-regiao-save]').addEventListener('click', () => {
      const digitos = cep.value.replace(/\D/g, '');
      let local = null;
      if (digitos.length === 8) local = R.definir({ cep: digitos });
      else if (cidade.value) local = R.definir({ cidade: cidade.value });
      if (!local) { toast('Informe um CEP válido ou escolha uma cidade.', 'error'); return; }
      closeModal();
      toast(`Mostrando vendedores perto de ${R.nomeLocal(local)}.`);
      setTimeout(() => location.reload(), 500);
    });
    setTimeout(() => cep.focus(), 50);
  }

  function productCard(p) {
    const off = discount(p);
    const badge = p.destaque ? 'Destaque' : off >= 10 ? `-${off}%` : '';
    return `
      <article class="product-card" data-product="${p.id}">
        <div class="product-media">
          ${badge ? `<span class="product-badge ${p.destaque ? 'is-featured' : 'is-off'}">${badge}</span>` : ''}
          <button class="fav-btn" type="button" data-fav="${p.id}" aria-label="Favoritar ${esc(p.nome)}" aria-pressed="false">
            ${icon('heart')}
          </button>
          <a href="produto.html?id=${p.id}" aria-label="Ver ${esc(p.nome)}">
            <img src="${p.foto}" alt="${esc(p.nome)}" loading="lazy">
          </a>
        </div>
        <div class="product-body">
          <span class="product-brand">${esc(p.marca)}${p.btu ? ` · ${p.btu} BTUs` : ''}</span>
          ${localProduto(p)}
          <h3 class="product-title"><a href="produto.html?id=${p.id}">${esc(p.nome)}</a></h3>
          ${stars(p.nota, true, p.avaliacoes)}
          ${priceBlock(p)}
          <div class="product-foot">
            <span class="product-seller">${icon('store')} ${esc(p.vendedor ? p.vendedor.nome_loja : 'Frionex')}</span>
            <button class="btn btn-soft btn-sm" type="button" data-add="${p.id}">
              ${icon('cart')} Adicionar
            </button>
          </div>
        </div>
      </article>`;
  }

  /* ---------------- header / footer ---------------- */
  function headerHTML() {
    const session = window.FrionexStore ? window.FrionexStore.Auth.session() : null;
    const count = window.FrionexStore ? window.FrionexStore.Cart.count() : 0;
    const favs = window.FrionexStore ? window.FrionexStore.Favoritos.count() : 0;
    const cats = window.FrionexAPI.getCategoriasSync();

    return `
      <div class="top-strip">
        <div class="container top-strip-inner">
          ${regiaoChip()}
          <span class="top-strip-right">${icon('truck')} Frete grátis acima de R$ 300 em até 600 km de você</span>
        </div>
      </div>
      <header class="site-header" id="siteHeader">
        <div class="container header-top">
          <button class="icon-btn menu-toggle" type="button" aria-label="Abrir menu" data-menu-toggle>${icon('menu')}</button>
          <a class="brand" href="index.html" aria-label="Frionex — página inicial">
            <img src="assets/img/logo-white.svg" alt="Frionex" class="brand-logo">
          </a>
          <form class="search" role="search" data-search-form>
            ${icon('search')}
            <input type="search" name="q" placeholder="Busque por peças, marcas e modelos..." aria-label="Buscar produtos" autocomplete="off">
            <button type="submit" class="search-btn">Buscar</button>
          </form>
          <div class="header-actions">
            <a class="icon-btn header-action" href="index.html?favoritos=1" aria-label="Favoritos">
              ${icon('heart')}<span class="action-label">Favoritos</span>
              <span class="mini-badge" data-fav-count ${favs ? '' : 'hidden'}>${favs}</span>
            </a>
            <button class="icon-btn header-action" type="button" data-chat aria-label="Mensagens">
              ${icon('chat')}<span class="action-label">Chat</span><span class="mini-badge chat-count" data-chat-count hidden>0</span>
            </button>
            ${!session
              ? `<a class="header-action sell-link" href="cadastro.html?tipo=vendedor">${icon('store')}<span class="action-label">Vender</span></a>`
              : session.tipo === 'vendedor'
                ? `<a class="header-action sell-link" href="vender.html">${icon('store')}<span class="action-label">Vender</span></a>`
                : ''}
            ${session ? `
              <div class="account-menu">
                <button class="account-btn" type="button" data-account-toggle aria-haspopup="true" aria-expanded="false">
                  <span class="avatar avatar-sm">${initials(session.nome)}</span>
                  <span class="account-name">${esc(String(session.nome).split(' ')[0])}</span>
                  ${icon('chevron', 'chevron')}
                </button>
                <div class="account-dropdown" data-account-dropdown>
                  <div class="account-dropdown-head">
                    <strong>${esc(session.nome)}</strong>
                    <span>${esc(session.email)}</span>
                  </div>
                  ${session.tipo === 'vendedor' ? `<a href="vender.html">${icon('store')} Painel do vendedor</a>` : ''}
                  <a href="perfil.html">${icon('user')} Meu perfil</a>
                  <a href="pedidos.html">${icon('package')} Meus pedidos</a>
                  <a href="mensagens.html">${icon('chat')} Mensagens <span class="mini-badge chat-count" data-chat-count hidden>0</span></a>
                  <a href="perfil.html#enderecos">${icon('location')} Endereços</a>
                  <button type="button" data-logout>${icon('logout')} Sair</button>
                </div>
              </div>` : `
              <a class="header-action login-link" href="login.html">${icon('user')}<span class="action-label">Entrar</span></a>`}
            <a class="icon-btn header-action cart-link" href="carrinho.html" aria-label="Carrinho">
              ${icon('cart')}<span class="action-label">Carrinho</span>
              <span class="mini-badge" data-cart-count ${count ? '' : 'hidden'}>${count}</span>
            </a>
          </div>
        </div>
        <nav class="header-nav" aria-label="Categorias e seções">
          <div class="container nav-inner">
            <div class="nav-dropdown">
              <button type="button" class="nav-link nav-dropdown-btn" data-cat-toggle aria-expanded="false">
                ${icon('menu', 'menu-ico')} Categorias ${icon('chevron', 'chevron')}
              </button>
              <div class="nav-dropdown-panel">
                <div class="cat-tree">
                  <div class="cat-tree-list" role="menu">
                    ${cats.map((c, i) => `
                      <a class="cat-tree-item ${i === 0 ? 'is-active' : ''}" href="index.html?categoria=${c.slug}" data-cat-branch="${c.slug}" role="menuitem">
                        <span class="cat-ico">${icon(c.icone)}</span>
                        <strong>${c.nome}</strong>
                        ${icon('chevron', 'cat-tree-arrow')}
                      </a>`).join('')}
                  </div>
                  ${cats.map((c, i) => `
                    <div class="cat-tree-branch" data-branch="${c.slug}" ${i === 0 ? '' : 'hidden'}>
                      <span class="cat-tree-title">${c.nome}</span>
                      ${c.subcategorias.map((s) => `<a href="index.html?categoria=${c.slug}&sub=${s.id}">${s.nome}</a>`).join('')}
                      <a class="cat-tree-all" href="index.html?categoria=${c.slug}">Ver tudo em ${c.nome} ${icon('arrow')}</a>
                    </div>`).join('')}
                </div>
              </div>
            </div>
            <a class="nav-link" href="index.html?oferta=1">Ofertas do dia</a>
            <a class="nav-link" href="index.html?categoria=pecas">Peças</a>
            <a class="nav-link" href="index.html?categoria=ferramentas">Ferramentas</a>
            <a class="nav-link nav-link-perto" href="index.html?perto=1#catalogo">${icon('pin')} Perto de você</a>
            <a class="nav-link nav-link-help" href="#atendimento">Atendimento ao Cliente</a>
          </div>
        </nav>
        <div class="mobile-drawer" data-mobile-drawer>
          <div class="mobile-drawer-head">
            <img src="assets/img/logo.svg" alt="Frionex" class="brand-logo">
            <button class="icon-btn" type="button" data-menu-close aria-label="Fechar menu">${icon('close')}</button>
          </div>
          <div class="mobile-search">
            <form class="search" role="search" data-search-form>
              ${icon('search')}
              <input type="search" name="q" placeholder="O que você procura?" aria-label="Buscar produtos">
              <button type="submit" class="search-btn">Buscar</button>
            </form>
          </div>
          <nav class="mobile-nav">
            <span class="mobile-label">Categorias</span>
            ${cats.map((c) => `<a href="index.html?categoria=${c.slug}">${icon(c.icone)} ${c.nome}</a>`).join('')}
            <span class="mobile-label">Atalhos</span>
            <a href="index.html?oferta=1">${icon('star')} Ofertas do dia</a>
            <a href="index.html?favoritos=1">${icon('heart')} Favoritos</a>
            <a href="carrinho.html">${icon('cart')} Carrinho</a>
            <a href="${session ? 'perfil.html' : 'login.html'}">${icon('user')} ${session ? 'Meu perfil' : 'Entrar / Cadastrar'}</a>
            ${!session ? `<a href="cadastro.html?tipo=vendedor">${icon('store')} Quero vender</a>`
              : session.tipo === 'vendedor' ? `<a href="vender.html">${icon('store')} Painel do vendedor</a>` : ''}
            ${session ? `<a href="mensagens.html">${icon('chat')} Mensagens <span class="mini-badge chat-count" data-chat-count hidden>0</span></a>` : ''}
            <a href="#atendimento">${icon('chat')} Atendimento ao cliente</a>
          </nav>
        </div>
        <div class="drawer-scrim" data-drawer-scrim></div>
      </header>`;
  }

  function footerHTML() {
    return `
      <footer class="site-footer" id="atendimento">
        <div class="container footer-cta">
          <div>
            <h2>Receba ofertas e novidades de climatização</h2>
            <p>Cadastre seu e-mail e seja avisado quando chegarem peças e equipamentos com desconto.</p>
          </div>
          <form class="newsletter" data-newsletter>
            <input type="email" required placeholder="seu@email.com" aria-label="Seu e-mail">
            <button class="btn btn-grad" type="submit">Quero receber ${icon('arrow')}</button>
          </form>
        </div>
        <div class="container footer-grid">
          <div class="footer-brand">
            <img src="assets/img/logo-white.svg" alt="Frionex" class="footer-logo">
            <p>O marketplace especializado em ar-condicionado, peças e ferramentas. Conectamos instaladores, técnicos e clientes de todo o Brasil.</p>
            <div class="footer-socials">
              <a href="#" aria-label="Instagram" data-social="Instagram">${icon('instagram')}</a>
              <a href="#" aria-label="WhatsApp" data-social="WhatsApp">${icon('whatsapp')}</a>
              <a href="#" aria-label="Chat" data-chat>${icon('chat')}</a>
            </div>
          </div>
          <div class="footer-col">
            <h3>Institucional</h3>
            <a href="#" data-info="Sobre a Frionex">Sobre a Frionex</a>
            <a href="#" data-info="Como funciona">Como funciona</a>
            <a href="#" data-info="Trabalhe conosco">Trabalhe conosco</a>
            <a href="#" data-info="Seja um vendedor">Seja um vendedor</a>
          </div>
          <div class="footer-col">
            <h3>Ajuda</h3>
            <a href="#" data-info="Central de atendimento">Central de atendimento</a>
            <a href="#" data-info="Prazos e entregas">Prazos e entregas</a>
            <a href="#" data-info="Trocas e devoluções">Trocas e devoluções</a>
            <a href="#" data-info="Compra segura">Compra segura</a>
          </div>
          <div class="footer-col">
            <h3>Categorias</h3>
            <a href="index.html?categoria=ar-condicionado">Ar-Condicionado</a>
            <a href="index.html?categoria=pecas">Peças</a>
            <a href="index.html?categoria=ferramentas">Ferramentas</a>
            <a href="index.html?categoria=acessorios">Acessórios</a>
          </div>
          <div class="footer-col">
            <h3>Atendimento</h3>
            <span class="footer-info">${icon('chat')} Chat online<br><small>Seg. a sáb., 8h às 18h</small></span>
            <span class="footer-info">${icon('mail')} atendimento@frionex.com</span>
            <span class="footer-info">${icon('pin')} Sombrio · Santa Catarina</span>
          </div>
        </div>
        <div class="container footer-bottom">
          <p>© 2026 Frionex · Projeto Integrador IFC Sombrio · Miguel Paulo de Mello e Maxwell Gonçalves Vieira Fernandes</p>
          <div class="footer-legal">
            <a href="#" data-info="Termos de uso">Termos de uso</a>
            <a href="#" data-info="Política de privacidade">Privacidade</a>
          </div>
          <div class="payment-badges" aria-label="Formas de pagamento">
            <span>${icon('pix')} PIX</span>
            <span>${icon('card')} Crédito</span>
            <span>${icon('boleto')} Boleto</span>
          </div>
        </div>
      </footer>`;
  }

  /* ---------------- toast / modal ---------------- */
  function ensureToastRoot() {
    let root = document.getElementById('toastRoot');
    if (!root) {
      root = document.createElement('div');
      root.id = 'toastRoot';
      root.className = 'toast-root';
      document.body.appendChild(root);
    }
    return root;
  }

  function toast(message, type = 'success') {
    const root = ensureToastRoot();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-ico">${icon(type === 'error' ? 'close' : type === 'info' ? 'chat' : 'check')}</span>
      <span class="toast-msg">${esc(message)}</span>
      <button type="button" class="toast-close" aria-label="Fechar">${icon('close')}</button>`;
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-visible'));
    const dismiss = () => {
      el.classList.remove('is-visible');
      setTimeout(() => el.remove(), 260);
    };
    el.querySelector('.toast-close').addEventListener('click', dismiss);
    setTimeout(dismiss, 4200);
  }

  function modal(title, bodyHTML, options = {}) {
    closeModal();
    const root = document.createElement('div');
    root.className = 'modal-root';
    root.id = 'modalRoot';
    root.innerHTML = `
      <div class="modal-scrim" data-modal-close></div>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-head">
          <h2 id="modalTitle">${esc(title)}</h2>
          <button type="button" class="icon-btn" data-modal-close aria-label="Fechar">${icon('close')}</button>
        </div>
        <div class="modal-body">${bodyHTML}</div>
        ${options.footer ? `<div class="modal-foot">${options.footer}</div>` : ''}
      </div>`;
    document.body.appendChild(root);
    document.body.classList.add('has-modal');
    requestAnimationFrame(() => root.classList.add('is-visible'));
    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-modal-close]')) closeModal();
    });
    return root;
  }

  function closeModal() {
    const root = document.getElementById('modalRoot');
    if (!root) return;
    root.classList.remove('is-visible');
    document.body.classList.remove('has-modal');
    setTimeout(() => root.remove(), 200);
  }

  /* ---------------- global behaviors ---------------- */
  function updateCartBadge() {
    const count = window.FrionexStore ? window.FrionexStore.Cart.count() : 0;
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
    document.querySelectorAll('[data-fav-count]').forEach((el) => {
      const favs = window.FrionexStore ? window.FrionexStore.Favoritos.count() : 0;
      el.textContent = favs;
      el.hidden = favs === 0;
    });
  }

  function syncFavButtons() {
    if (!window.FrionexStore) return;
    document.querySelectorAll('[data-fav]').forEach((btn) => {
      const active = window.FrionexStore.Favoritos.has(btn.dataset.fav);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function bindGlobal() {
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) {
        const id = Number(add.dataset.add);
        window.FrionexStore.Cart.add(id, 1);
        const produto = window.FrionexAPI.getProdutosSync().find((p) => p.id === id);
        toast(`${produto ? produto.nome.slice(0, 42) + '…' : 'Produto'} adicionado ao carrinho.`);
        return;
      }

      const fav = e.target.closest('[data-fav]');
      if (fav) {
        const ativo = window.FrionexStore.Favoritos.toggle(fav.dataset.fav);
        fav.classList.toggle('is-active', ativo);
        fav.setAttribute('aria-pressed', ativo ? 'true' : 'false');
        toast(ativo ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.', 'info');
        updateCartBadge();
        return;
      }

      const chat = e.target.closest('[data-chat]');
      if (chat) {
        e.preventDefault();
        const naLoja = /loja\.html$/.test(location.pathname);
        const vendedor = chat.dataset.vendedor || (naLoja ? (new URLSearchParams(location.search).get('id') || 1) : null);
        location.href = vendedor ? `mensagens.html?vendedor=${vendedor}` : 'mensagens.html';
        return;
      }

      const info = e.target.closest('[data-info]');
      if (info) {
        e.preventDefault();
        toast(`${info.dataset.info} · conteúdo em construção no protótipo.`, 'info');
        return;
      }

      const social = e.target.closest('[data-social]');
      if (social) {
        e.preventDefault();
        toast(`${social.dataset.social} da Frionex · em breve.`, 'info');
        return;
      }

      const logout = e.target.closest('[data-logout]');
      if (logout) {
        window.FrionexStore.Auth.logout();
        toast('Você saiu da sua conta.', 'info');
        setTimeout(() => location.href = 'index.html', 500);
        return;
      }

      if (e.target.closest('[data-menu-toggle]')) {
        document.body.classList.add('menu-open');
        return;
      }
      if (e.target.closest('[data-regiao-open]')) { e.preventDefault(); abrirRegiao(); return; }
      if (e.target.closest('[data-menu-close]') || e.target.closest('[data-drawer-scrim]')) {
        document.body.classList.remove('menu-open');
        return;
      }

      const catBtn = e.target.closest('[data-cat-toggle]');
      if (catBtn) {
        e.preventDefault();
        const open = catBtn.getAttribute('aria-expanded') === 'true';
        catBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
        catBtn.closest('.nav-dropdown').classList.toggle('is-open', !open);
        return;
      }

      const accountBtn = e.target.closest('[data-account-toggle]');
      if (accountBtn) {
        const open = accountBtn.getAttribute('aria-expanded') === 'true';
        accountBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
        accountBtn.closest('.account-menu').classList.toggle('is-open', !open);
        return;
      }

      if (!e.target.closest('.account-menu')) {
        document.querySelectorAll('.account-menu.is-open').forEach((m) => m.classList.remove('is-open'));
      }
      if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.nav-dropdown.is-open').forEach((m) => m.classList.remove('is-open'));
        document.querySelectorAll('[data-cat-toggle]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
      }
    });

    document.addEventListener('submit', (e) => {
      const search = e.target.closest('[data-search-form]');
      if (search) {
        e.preventDefault();
        const term = search.querySelector('input').value.trim();
        location.href = term ? `index.html?q=${encodeURIComponent(term)}` : 'index.html';
        return;
      }
      const news = e.target.closest('[data-newsletter]');
      if (news) {
        e.preventDefault();
        toast('Cadastro realizado! Você receberá nossas ofertas por e-mail.');
        news.reset();
      }
    });

    window.addEventListener('cart:change', updateCartBadge);
    window.addEventListener('favoritos:change', updateCartBadge);
    window.addEventListener('storage', updateCartBadge);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.classList.remove('menu-open');
        closeModal();
      }
    });
  }

  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach((el) => {
      el.innerHTML = icon(el.dataset.icon);
      el.removeAttribute('data-icon');
      el.classList.add('icon-slot');
    });
  }

  // atualiza o "Enviar para" do topo quando a região muda sem recarregar
  window.addEventListener('regiao:change', () => {
    document.querySelectorAll('.regiao-chip').forEach((el) => { el.outerHTML = regiaoChip(); });
  });

  function bindCatTree() {
    const ativar = (item) => {
      const tree = item.closest('.cat-tree');
      if (!tree) return;
      tree.querySelectorAll('[data-cat-branch]').forEach((a) => a.classList.toggle('is-active', a === item));
      tree.querySelectorAll('[data-branch]').forEach((b) => { b.hidden = b.dataset.branch !== item.dataset.catBranch; });
    };
    document.addEventListener('mouseover', (e) => {
      const item = e.target.closest('[data-cat-branch]');
      if (item) ativar(item);
    });
    document.addEventListener('focusin', (e) => {
      const item = e.target.closest('[data-cat-branch]');
      if (item) ativar(item);
    });
  }

  function updateChatBadge() {
    const API = window.FrionexAPI;
    const sessao = API && API.sessao();
    const total = sessao && API.naoLidasSync ? API.naoLidasSync(sessao.id) : 0;
    document.querySelectorAll('[data-chat-count]').forEach((el) => {
      el.textContent = total > 9 ? '9+' : String(total);
      el.hidden = !total;
    });
  }

  function init() {
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    if (header) {
      header.innerHTML = headerHTML();
      // topo fixo ao rolar: a faixa preta de cima sai da tela, o resto fica
      const fixar = () => {
        const faixa = header.querySelector('.top-strip');
        const h = faixa ? faixa.offsetHeight : 0;
        header.style.top = `-${h}px`;
        document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight - h}px`);
      };
      fixar();
      window.addEventListener('resize', fixar);
    }
    if (footer) footer.innerHTML = footerHTML();
    updateCartBadge();
    updateChatBadge();
    window.addEventListener('storage', (e) => { if (e.key === 'frionex:mensagens') updateChatBadge(); });
    syncFavButtons();
    bindGlobal();
    bindCatTree();
    hydrateIcons(document);
    document.documentElement.classList.add('js-ready');
  }

  window.FrionexUI = {
    abrirRegiao, localProduto, updateChatBadge,
    init, icon, stars, money, esc, initials, discount, priceBlock, productCard,
    toast, modal, closeModal, updateCartBadge, syncFavButtons, hydrateIcons
  };

  document.addEventListener('DOMContentLoaded', init);
})();
