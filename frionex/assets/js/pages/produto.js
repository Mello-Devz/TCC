/* =========================================================
   FRIONEX · Detalhe do produto
   ========================================================= */
(function () {
  'use strict';

  const API = window.FrionexAPI;
  const UI = window.FrionexUI;
  const Store = window.FrionexStore;

  const productId = Number(new URLSearchParams(location.search).get('id') || 2);
  let product = null;
  let quantity = 1;
  let notaSelecionada = 0;
  const R = window.FrionexRegiao;

  const dataBR = (iso) => {
    if (!iso) return '';
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  /* ---------------- blocos de HTML ---------------- */
  function galleryHTML(p) {
    const fotos = Array.from(new Set(p.fotos && p.fotos.length ? p.fotos : [p.foto]));
    const off = UI.discount(p);
    return `
      <div class="gallery">
        <div class="gallery-main">
          ${off ? `<span class="gallery-tag">-${off}%</span>` : ''}
          <img id="galleryMain" src="${fotos[0]}" alt="${UI.esc(p.nome)}">
        </div>
        <div class="gallery-thumbs">
          ${fotos.map((foto, i) => `
            <button class="gallery-thumb ${i === 0 ? 'is-active' : ''}" type="button" data-gallery="${foto}" aria-label="Ver imagem ${i + 1}">
              <img src="${foto}" alt="">
            </button>`).join('')}
        </div>
      </div>`;
  }

  function sellerHTML(p) {
    const v = p.vendedor;
    if (!v) return '';
    const cidade = R ? R.cidadeDoVendedor(v) : null;
    const d = R ? R.distanciaProduto(p) : null;
    return `
      <div class="seller-inline">
        <span class="avatar"><img src="${v.foto}" alt=""></span>
        <span>
          <strong>${UI.esc(v.nome_loja)}</strong>
          <small>${UI.icon('pin')} ${cidade ? `${UI.esc(cidade.nome)}/${cidade.uf}` : UI.esc(v.localizacao || '')}${d != null ? ` · <b class="dist-tag ${d <= 100 ? 'is-near' : ''}">${d <= 15 ? 'na sua cidade' : `${R.formatarKm(d)} de você`}</b>` : ''}</small>
        </span>
        ${v.verificado ? `<span class="badge-verified">${UI.icon('verified')} Verificado</span>` : ''}
        <a class="btn btn-soft btn-sm" href="mensagens.html?vendedor=${v.id}&produto=${p.id}">${UI.icon('chat')} Conversar</a>
        <a class="btn btn-soft btn-sm" href="loja.html?id=${v.id}">Ver loja</a>
      </div>`;
  }

  /* Frete estimado para a região do comprador */
  function freteResumoHTML(p) {
    const local = R ? R.atual() : null;
    if (!local) {
      return `${UI.icon('truck')} <span>Frete calculado pela distância até o vendedor · <button type="button" class="link-btn" data-regiao-open>informe sua cidade</button></span>`;
    }
    const d = R.distanciaProduto(p, local);
    const f = R.cotarFrete(d, p.preco);
    return `${UI.icon('truck')} <span>Para <strong>${UI.esc(R.nomeLocal(local))}</strong>: ${f.valor === 0 ? '<strong class="txt-ok">Frete grátis</strong>' : `<strong>${UI.money(f.valor)}</strong>`} · chega em ${f.prazo}${f.retirada ? ' · <strong>retirada na loja disponível</strong>' : ''}</span>`;
  }

  /* Mesmo tipo de peça em outros vendedores, do mais perto ao mais longe */
  function alternativasHTML(p) {
    const local = R ? R.atual() : null;
    const outros = API.getProdutosSync()
      .filter((x) => x.id !== p.id && x.id_subcategoria === p.id_subcategoria && x.id_vendedor !== p.id_vendedor)
      .map((x) => ({ x, d: R ? R.distanciaProduto(x, local) : null }))
      .sort((a, b) => (a.d ?? 1e9) - (b.d ?? 1e9) || a.x.preco - b.x.preco)
      .slice(0, 3);
    if (!outros.length) return '';
    return `
      <div class="alt-offers">
        <h3>${UI.icon('pin')} Também vendido ${local ? 'perto de você' : 'por outros vendedores'}</h3>
        ${outros.map(({ x, d }) => {
          const c = R ? R.cidadeDoVendedor(x.vendedor) : null;
          const f = R ? R.cotarFrete(d, x.preco) : null;
          return `
            <a class="alt-offer" href="produto.html?id=${x.id}">
              <img src="${x.foto}" alt="">
              <span class="alt-info">
                <strong>${UI.esc(x.vendedor ? x.vendedor.nome_loja : '')}</strong>
                <small>${c ? `${UI.esc(c.nome)}/${c.uf}` : ''}${d != null ? ` · ${R.formatarKm(d)}` : ''}${f && d != null ? ` · ${f.valor === 0 ? 'frete grátis' : `frete ${UI.money(f.valor)}`}` : ''}</small>
              </span>
              <span class="alt-price">${UI.money(x.preco)}</span>
            </a>`;
        }).join('')}
      </div>`;
  }

  function detailHTML(p) {
    const off = UI.discount(p);
    return `
      ${galleryHTML(p)}
      <div class="product-info">
        <span class="product-brand">${UI.esc(p.marca)}${p.btu ? ` · ${Number(p.btu).toLocaleString('pt-BR')} BTUs` : ''} · ${UI.esc(p.estado)}</span>
        <h1>${UI.esc(p.nome)}</h1>

        <div class="product-meta">
          ${UI.stars(p.nota, true)}
          <a class="meta-link" href="#" data-goto-tab="avaliacoes">${p.avaliacoes} avaliações</a>
          <span class="pill-tag">${UI.icon('package')} ${p.vendidos} vendidos</span>
          <span class="pill-tag">${UI.icon('shield')} Garantia ${UI.esc(p.garantia)}</span>
        </div>

        ${sellerHTML(p)}

        <div class="price-box">
          ${p.preco_antigo ? `<span class="price-old">${UI.money(p.preco_antigo)}${off ? ` · -${off}%` : ''}</span>` : ''}
          <div class="price-main"><span>R$</span> ${UI.money(p.preco).replace('R$', '').trim()}</div>
          <span class="price-pix">${UI.money(p.pix)} à vista com <strong>7% OFF</strong> no PIX</span>
          <span class="price-installments">ou ${UI.money(p.preco)} em até ${p.parcelas}x de ${UI.money(p.parcela_valor)} sem juros</span>
          <div class="price-extra" data-frete-resumo>${freteResumoHTML(p)}</div>
        </div>

        <div class="qty-row">
          <span class="qty-label">Quantidade</span>
          <div class="qty">
            <button type="button" data-qty="-1" aria-label="Diminuir quantidade">${UI.icon('minus')}</button>
            <input id="qtyInput" type="text" inputmode="numeric" value="1" aria-label="Quantidade">
            <button type="button" data-qty="1" aria-label="Aumentar quantidade">${UI.icon('plus')}</button>
          </div>
          <span class="stock-note"><span class="stock-dot"></span> ${p.estoque} unidades disponíveis</span>
        </div>

        <div class="buy-row">
          <button class="btn btn-outline btn-lg" type="button" data-add-cart>${UI.icon('cart')} Adicionar ao carrinho</button>
          <button class="btn btn-buy btn-lg" type="button" data-buy-now>${UI.icon('check')} Comprar agora</button>
        </div>

        <form class="shipping-box" data-shipping>
          <input type="text" inputmode="numeric" maxlength="9" placeholder="Digite seu CEP" aria-label="Calcular frete" data-cep>
          <button class="btn btn-outline btn-sm" type="submit">Calcular frete</button>
        </form>
        <div class="shipping-result" data-shipping-result></div>

        ${alternativasHTML(p)}

        <div class="product-benefits">
          <div class="benefit">${UI.icon('shield')}<span><strong>Compra protegida</strong>Seu pagamento só é liberado após a entrega.</span></div>
          <div class="benefit">${UI.icon('truck')}<span><strong>Envio regional</strong>Frete e prazo pela distância até você.</span></div>
          <div class="benefit">${UI.icon('card')}<span><strong>Parcele sem juros</strong>Até ${p.parcelas}x no cartão.</span></div>
          <div class="benefit">${UI.icon('chat')}<span><strong>Fale com a loja</strong>Tire dúvidas antes de comprar.</span></div>
        </div>
      </div>`;
  }

  function specsHTML(p) {
    const rows = [
      ['Marca', p.marca],
      ['Modelo', p.modelo || '—'],
      ['BTUs', p.btu ? `${Number(p.btu).toLocaleString('pt-BR')} BTUs` : '—'],
      ['Tecnologia', p.tecnologia],
      ['Ciclo', p.ciclo],
      ['Voltagem', p.voltagem || '220V'],
      ['Dimensões', p.dimensoes || '—'],
      ['Peso', p.peso || '—'],
      ['Garantia', p.garantia],
      ['Estado', p.estado],
      ['Categoria', p.categoria ? p.categoria.nome : '—'],
      ['Subcategoria', p.subcategoria ? p.subcategoria.nome : '—'],
      ['Vendedor', p.vendedor ? p.vendedor.nome_loja : 'Frionex']
    ];
    return `<table class="spec-table"><tbody>
      ${rows.map(([k, v]) => `<tr><th>${UI.esc(k)}</th><td>${UI.esc(v)}</td></tr>`).join('')}
    </tbody></table>`;
  }

  function reviewsHTML(p) {
    const lista = p.avaliacoes_detalhe || [];
    const total = lista.length;
    const media = total ? lista.reduce((s, r) => s + Number(r.nota), 0) / total : Number(p.nota);
    const contagem = [5, 4, 3, 2, 1].map((nota) => ({
      nota,
      qtd: lista.filter((r) => Number(r.nota) === nota).length
    }));

    const session = Store.Auth.session();
    const formHTML = session ? `
      <form class="review-form" data-review-form>
        <h4>Avalie este produto</h4>
        <p class="text-muted" style="font-size:12px">Conte como foi sua experiência com a compra.</p>
        <div class="star-input" data-star-input aria-label="Nota de 1 a 5">
          ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" aria-label="${n} estrelas">${UI.icon('star')}</button>`).join('')}
        </div>
        <textarea name="descricao" rows="3" required placeholder="O produto atendeu suas expectativas? Como foi a entrega?" aria-label="Sua avaliação"></textarea>
        <div style="display:flex;justify-content:flex-end;margin-top:10px">
          <button class="btn btn-primary" type="submit">${UI.icon('star')} Publicar avaliação</button>
        </div>
      </form>` : `
      <div class="review-form">
        <h4>Compre e avalie</h4>
        <p class="text-muted" style="font-size:12.5px">Entre na sua conta para publicar uma avaliação deste produto.</p>
        <a class="btn btn-grad" style="margin-top:10px" href="login.html?next=${encodeURIComponent(`produto.html?id=${p.id}`)}">${UI.icon('user')} Entrar para avaliar</a>
      </div>`;

    return `
      <div class="reviews-wrap">
        <aside class="reviews-summary">
          <div class="reviews-score">${Number(media).toFixed(1).replace('.', ',')}</div>
          ${UI.stars(media)}
          <p>${total ? `${total} avaliações de compradores` : 'Ainda sem avaliações'}</p>
          <div class="rating-bars">
            ${contagem.map((c) => {
              const pct = total ? Math.round((c.qtd / total) * 100) : 0;
              return `<div class="rating-bar"><span>${c.nota}★</span><span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span><span>${c.qtd}</span></div>`;
            }).join('')}
          </div>
        </aside>
        <div>
          <div class="reviews-list">
            ${lista.length ? lista.map((r) => `
              <article class="review-item">
                <div class="review-head">
                  <span class="avatar">${UI.initials(r.autor)}</span>
                  <span><strong>${UI.esc(r.autor)}</strong><small>${dataBR(r.data)} · compra verificada</small></span>
                  ${UI.stars(r.nota)}
                </div>
                <p>${UI.esc(r.descricao)}</p>
              </article>`).join('') : '<p class="text-muted">Este produto ainda não recebeu avaliações.</p>'}
          </div>
          ${formHTML}
        </div>
      </div>`;
  }

  function tabsHTML(p) {
    return `
      <div class="tabs-head" role="tablist">
        <button class="tab-btn is-active" type="button" data-tab="descricao" role="tab">Descrição</button>
        <button class="tab-btn" type="button" data-tab="especificacoes" role="tab">Especificações</button>
        <button class="tab-btn" type="button" data-tab="avaliacoes" role="tab">Avaliações (${p.avaliacoes})</button>
      </div>
      <div class="tab-panel is-active" data-panel="descricao" role="tabpanel">
        <h3>Sobre o produto</h3>
        <p>${UI.esc(p.descricao)}</p>
        <div class="product-benefits" style="margin-top:18px">
          <div class="benefit">${UI.icon('wind')}<span><strong>${UI.esc(p.tecnologia)}</strong>${p.btu ? `Capacidade de ${Number(p.btu).toLocaleString('pt-BR')} BTUs` : 'Tecnologia de climatização'}</span></div>
          <div class="benefit">${UI.icon('shield')}<span><strong>Garantia ${UI.esc(p.garantia)}</strong>Produto novo com nota fiscal.</span></div>
          <div class="benefit">${UI.icon('box')}<span><strong>${UI.esc(p.estado)}</strong>Embalagem original e completa.</span></div>
          <div class="benefit">${UI.icon('store')}<span><strong>${UI.esc(p.vendedor ? p.vendedor.nome_loja : 'Frionex')}</strong>Vendedor verificado pela plataforma.</span></div>
        </div>
      </div>
      <div class="tab-panel" data-panel="especificacoes" role="tabpanel">
        <h3>Especificações técnicas</h3>
        ${specsHTML(p)}
      </div>
      <div class="tab-panel" data-panel="avaliacoes" role="tabpanel">
        <h3>Avaliações</h3>
        ${reviewsHTML(p)}
      </div>`;
  }

  function breadcrumbHTML(p) {
    return `
      <a href="index.html">Início</a>
      ${UI.icon('chevron', 'chevron')}
      <a href="index.html?categoria=${p.categoria ? p.categoria.slug : ''}">${UI.esc(p.categoria ? p.categoria.nome : 'Catálogo')}</a>
      ${UI.icon('chevron', 'chevron')}
      <a href="index.html?categoria=${p.categoria ? p.categoria.slug : ''}">${UI.esc(p.subcategoria ? p.subcategoria.nome : 'Produtos')}</a>
      ${UI.icon('chevron', 'chevron')}
      <span class="current">${UI.esc(p.nome.slice(0, 46))}${p.nome.length > 46 ? '…' : ''}</span>`;
  }

  function openTab(name) {
    document.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === name));
    document.querySelectorAll('[data-panel]').forEach((p) => p.classList.toggle('is-active', p.dataset.panel === name));
    const tabsCard = document.getElementById('tabsCard');
    const panel = document.querySelector(`[data-panel="${name}"]`);
    if (name === 'avaliacoes' && tabsCard && panel) {
      const top = tabsCard.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  /* ---------------- render ---------------- */
  function render(p) {
    product = p;
    document.title = `${p.nome} · Frionex`;
    const detail = document.getElementById('productDetail');
    const breadcrumb = document.getElementById('breadcrumb');
    const tabsCard = document.getElementById('tabsCard');
    if (detail) detail.innerHTML = detailHTML(p);
    if (breadcrumb) breadcrumb.innerHTML = breadcrumbHTML(p);
    if (tabsCard) {
      tabsCard.hidden = false;
      tabsCard.innerHTML = tabsHTML(p);
    }
    UI.hydrateIcons(detail || document);
    UI.hydrateIcons(tabsCard || document);
    quantity = 1;
    notaSelecionada = 0;
    loadRelated(p);
  }

  async function loadRelated(p) {
    const section = document.getElementById('relatedSection');
    const rail = document.getElementById('relatedRail');
    if (!section || !rail) return;
    let lista = await API.produtos({ categoria: p.categoria ? p.categoria.slug : undefined, ordenacao: 'avaliacao' });
    lista = lista.filter((x) => x.id !== p.id);
    if (lista.length < 4) {
      const todos = await API.produtos({ ordenacao: 'avaliacao' });
      const extras = todos.filter((x) => x.id !== p.id && !lista.some((l) => l.id === x.id));
      lista = lista.concat(extras);
    }
    lista = lista.slice(0, 6);
    if (!lista.length) return;
    section.hidden = false;
    rail.innerHTML = lista.map(UI.productCard).join('');
    UI.syncFavButtons();
    UI.hydrateIcons(rail);
  }

  /* ---------------- ações ---------------- */
  function currentQty() {
    const input = document.getElementById('qtyInput');
    let value = Number(input ? input.value : quantity) || 1;
    if (product) value = Math.min(Math.max(1, value), Math.max(1, product.estoque));
    if (input) input.value = value;
    quantity = value;
    return value;
  }

  function payShipping(event) {
    event.preventDefault();
    const input = event.target.querySelector('[data-cep]');
    const result = document.querySelector('[data-shipping-result]');
    if (!input || !result) return;
    const cep = input.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      result.innerHTML = '<span style="color:var(--danger)">Informe um CEP válido com 8 dígitos.</span>';
      return;
    }
    if (!R || !product) return;
    const destino = R.localPorCep(cep);
    if (!destino) {
      result.innerHTML = '<span style="color:var(--danger)">Não reconhecemos esse CEP.</span>';
      return;
    }
    const origem = R.cidadeDoVendedor(product.vendedor);
    const d = R.distanciaKm(destino, origem);
    const f = R.cotarFrete(d, product.preco * currentQty());
    result.innerHTML = `
      ${f.valor === 0 ? '<strong>Frete grátis</strong>' : `<strong>${UI.money(f.valor)}</strong>`} · chega em ${f.prazo}
      <small style="display:block;margin-top:3px;color:var(--muted)">De ${origem ? `${UI.esc(origem.nome)}/${origem.uf}` : 'vendedor'} para ${UI.esc(R.nomeLocal(destino))}${d != null ? ` · cerca de ${d.toLocaleString('pt-BR')} km` : ''}${f.retirada ? ' · ou retire na loja' : ''}</small>`;
    // guarda como região do comprador
    R.definir({ cep });
    const resumo = document.querySelector('[data-frete-resumo]');
    if (resumo) { resumo.innerHTML = freteResumoHTML(product); UI.hydrateIcons(resumo); }
  }

  function paintStars(value) {
    document.querySelectorAll('[data-star]').forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.star) <= value);
    });
  }

  async function submitReview(form) {
    const descricao = form.querySelector('textarea').value.trim();
    if (!notaSelecionada) {
      UI.toast('Escolha uma nota de 1 a 5 estrelas.', 'error');
      return;
    }
    if (descricao.length < 5) {
      UI.toast('Escreva um comentário com pelo menos 5 caracteres.', 'error');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await API.adicionarAvaliacao({ id_produto: product.id, nota: notaSelecionada, descricao });
      UI.toast('Avaliação publicada. Obrigado por compartilhar!');
      const atualizado = await API.produto(product.id);
      render(atualizado);
      openTab('avaliacoes');
    } catch (err) {
      UI.toast(err.message, 'error');
      if (btn) btn.disabled = false;
    }
  }

  function bind() {
    document.addEventListener('click', (e) => {
      const thumb = e.target.closest('[data-gallery]');
      if (thumb) {
        const main = document.getElementById('galleryMain');
        if (main) main.src = thumb.dataset.gallery;
        document.querySelectorAll('[data-gallery]').forEach((t) => t.classList.toggle('is-active', t === thumb));
        return;
      }

      const qtyBtn = e.target.closest('[data-qty]');
      if (qtyBtn) {
        const delta = Number(qtyBtn.dataset.qty);
        const input = document.getElementById('qtyInput');
        if (input) input.value = Math.max(1, (Number(input.value) || 1) + delta);
        currentQty();
        return;
      }

      if (e.target.closest('[data-add-cart]')) {
        Store.Cart.add(product.id, currentQty());
        UI.toast('Produto adicionado ao carrinho.');
        return;
      }

      if (e.target.closest('[data-buy-now]')) {
        Store.Cart.add(product.id, currentQty());
        location.href = 'carrinho.html';
        return;
      }

      const tabBtn = e.target.closest('[data-tab]');
      if (tabBtn) { openTab(tabBtn.dataset.tab); return; }

      const goto = e.target.closest('[data-goto-tab]');
      if (goto) {
        e.preventDefault();
        openTab(goto.dataset.gotoTab);
        return;
      }

      const star = e.target.closest('[data-star]');
      if (star) {
        notaSelecionada = Number(star.dataset.star);
        paintStars(notaSelecionada);
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.id === 'qtyInput') currentQty();
    });

    document.addEventListener('submit', (e) => {
      if (e.target.matches('[data-shipping]')) { payShipping(e); return; }
      if (e.target.matches('[data-review-form]')) {
        e.preventDefault();
        submitReview(e.target);
      }
    });
  }

  async function load() {
    try {
      const p = await API.produto(productId);
      render(p);
    } catch (err) {
      document.getElementById('productDetail').innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <span class="empty-ico">${UI.icon('box')}</span>
          <h3>Produto não encontrado</h3>
          <p>${UI.esc(err.message)}</p>
          <a class="btn btn-grad" href="index.html">Voltar ao catálogo</a>
        </div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    load();
  });
})();
