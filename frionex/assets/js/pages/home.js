/* =========================================================
   FRIONEX · Home / catálogo
   ========================================================= */
(function () {
  'use strict';

  const API = window.FrionexAPI;
  const UI = window.FrionexUI;
  const Store = window.FrionexStore;
  const params = new URLSearchParams(location.search);

  const state = {
    q: params.get('q') || '',
    categoria: params.get('categoria') || '',
    // filtros do "ramo" da categoria escolhida
    sel: { subcategorias: params.get('sub') ? [params.get('sub')] : [], btus: [], tecnologias: [], ciclos: [], marcas: [], estados: [] },
    oferta: params.get('oferta') === '1',
    favoritos: params.get('favoritos') === '1',
    distancia: params.get('perto') === '1' ? '100' : (params.get('dist') || ''),
    ordenacao: 'relevancia',
    precoMin: null,
    precoMax: null
  };

  const CAT_LABEL = {
    'ar-condicionado': 'Ar-Condicionado',
    pecas: 'Peças',
    ferramentas: 'Ferramentas',
    acessorios: 'Acessórios'
  };

  /* ---------------- hero ---------------- */
  function initHero() {
    const slides = Array.from(document.querySelectorAll('#heroSlides .hero-slide'));
    const dotsWrap = document.getElementById('heroDots');
    if (!slides.length || !dotsWrap) return;

    let index = 0;
    let timer = null;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Destaque ${i + 1}`);
      dot.className = i === 0 ? 'is-active' : '';
      dot.addEventListener('click', () => { go(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function go(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }
    function restart() {
      if (timer) clearInterval(timer);
      if (!reduce) timer = setInterval(() => go(index + 1), 6500);
    }

    document.querySelector('[data-hero-next]')?.addEventListener('click', () => { go(index + 1); restart(); });
    document.querySelector('[data-hero-prev]')?.addEventListener('click', () => { go(index - 1); restart(); });

    const hero = document.querySelector('.hero');
    hero?.addEventListener('mouseenter', () => timer && clearInterval(timer));
    hero?.addEventListener('mouseleave', restart);

    go(0);
    restart();
  }

  /* ---------------- filtros em árvore ----------------
     Nível 1: categoria. Ao escolher, abre o "ramo" com os filtros
     específicos daquele nicho (tipo, BTUs, tecnologia, marca...). */
  const CATEGORIAS = API.getCategoriasSync();
  const R = window.FrionexRegiao;
  const regiao = R ? R.atual() : null;
  const distDe = (p) => (R ? R.distanciaProduto(p, regiao) : null);
  const naFaixa = (p, faixa) => !faixa || !R || !regiao || R.dentroDaFaixa(p, faixa, regiao);

  // Filtros de cada nicho: [chave, título]
  const FACETS = {
    'ar-condicionado': [['subcategorias', 'Tipo'], ['btus', 'Capacidade'], ['tecnologias', 'Tecnologia'], ['ciclos', 'Ciclo'], ['marcas', 'Marca'], ['estados', 'Condição']],
    pecas: [['subcategorias', 'Tipo de peça'], ['btus', 'Compatível com'], ['tecnologias', 'Tecnologia'], ['marcas', 'Marca'], ['estados', 'Condição']],
    ferramentas: [['subcategorias', 'Tipo de ferramenta'], ['tecnologias', 'Modelo'], ['marcas', 'Marca'], ['estados', 'Condição']],
    acessorios: [['subcategorias', 'Tipo'], ['btus', 'Compatível com'], ['tecnologias', 'Característica'], ['marcas', 'Marca'], ['estados', 'Condição']],
    '': [['marcas', 'Marca']]
  };

  const valorDe = {
    subcategorias: (p) => (p.id_subcategoria != null ? String(p.id_subcategoria) : null),
    btus: (p) => (p.btu ? String(p.btu) : null),
    tecnologias: (p) => (p.tecnologia && p.tecnologia !== '-' ? p.tecnologia : null),
    ciclos: (p) => (p.ciclo && p.ciclo !== '-' ? p.ciclo : null),
    marcas: (p) => p.marca || null,
    estados: (p) => p.estado || 'Novo'
  };

  const rotulo = {
    subcategorias: (v) => (API.getCategoriasSync().flatMap((c) => c.subcategorias).find((s) => String(s.id) === String(v)) || {}).nome || v,
    btus: (v) => `${Number(v).toLocaleString('pt-BR')} BTUs`
  };
  const labelDe = (chave, v) => (rotulo[chave] ? rotulo[chave](v) : v);

  const catAtual = () => CATEGORIAS.find((c) => c.slug === state.categoria) || null;

  function limparRamo() {
    Object.keys(state.sel).forEach((k) => { state.sel[k] = []; });
  }

  // Produtos que passam pela categoria + busca + todos os filtros, exceto `ignorar`
  function baseProdutos(ignorar) {
    const cat = catAtual();
    const termo = API.normalize(state.q || '');
    return API.getProdutosSync().filter((p) => {
      if (cat && p.id_categoria !== cat.id) return false;
      if (termo && !API.normalize(`${p.nome} ${p.descricao} ${p.marca} ${p.tecnologia}`).includes(termo)) return false;
      if (state.oferta && !(p.destaque || p.preco_antigo > p.preco)) return false;
      if (ignorar !== 'distancia' && !naFaixa(p, state.distancia)) return false;
      return Object.entries(state.sel).every(([k, vals]) => {
        if (k === ignorar || !vals.length) return true;
        const v = valorDe[k](p);
        return v != null && vals.map(API.normalize).includes(API.normalize(v));
      });
    });
  }

  function opcoesFacet(chave) {
    const lista = baseProdutos(chave);
    const contagem = new Map();
    lista.forEach((p) => {
      const v = valorDe[chave](p);
      if (v != null) contagem.set(v, (contagem.get(v) || 0) + 1);
    });
    let opcoes = [...contagem.entries()].map(([valor, total]) => ({ valor, total }));
    // "Tipo" mostra todas as subcategorias do nicho, mesmo sem produto no momento
    if (chave === 'subcategorias' && catAtual()) {
      opcoes = catAtual().subcategorias.map((s) => ({ valor: String(s.id), total: contagem.get(String(s.id)) || 0 }));
    }
    if (chave === 'btus') opcoes.sort((a, b) => Number(a.valor) - Number(b.valor));
    else if (chave !== 'subcategorias') opcoes.sort((a, b) => b.total - a.total || String(a.valor).localeCompare(String(b.valor)));
    // mantém visível o que já está marcado
    state.sel[chave].forEach((v) => {
      if (!opcoes.some((o) => API.normalize(o.valor) === API.normalize(v))) opcoes.push({ valor: v, total: 0 });
    });
    return opcoes;
  }

  /* Grupo "Distância de você": vem antes das categorias */
  function distanciaHTML() {
    if (!R) return '';
    if (!regiao) {
      return `
        <div class="filter-group dist-group">
          <h3>${UI.icon('pin')} Distância de você</h3>
          <p class="tree-hint">Informe sua cidade para ver os vendedores mais próximos e o frete de cada peça.</p>
          <button type="button" class="btn btn-soft btn-sm" data-regiao-open style="width:100%;justify-content:center">${UI.icon('pin')} Informar minha cidade</button>
        </div>`;
    }
    const base = baseProdutos('distancia');
    const opcoes = [{ id: '', label: 'Qualquer distância', total: base.length }]
      .concat(R.FAIXAS.map((f) => ({ id: f.id, label: f.label, total: base.filter((p) => naFaixa(p, f.id)).length })));
    return `
      <div class="filter-group dist-group">
        <h3>${UI.icon('pin')} Distância de você</h3>
        <button type="button" class="dist-origem" data-regiao-open>Saindo de <strong>${UI.esc(R.nomeLocal(regiao))}</strong> · alterar</button>
        ${opcoes.map((o) => `
          <label class="filter-option ${o.total || state.distancia === o.id ? '' : 'is-empty'}">
            <input type="radio" name="distancia" data-dist value="${o.id}" ${state.distancia === o.id ? 'checked' : ''}>
            ${o.label} <span class="count">(${o.total})</span>
          </label>`).join('')}
      </div>`;
  }

  function renderFilterTree() {
    const box = document.getElementById('filterTree');
    if (!box) return;
    const cat = catAtual();
    const todos = API.getProdutosSync();

    if (!cat) {
      box.innerHTML = `${distanciaHTML()}
        <div class="filter-group">
          <h3>Categorias</h3>
          <p class="tree-hint">Escolha uma categoria para ver filtros específicos.</p>
          <div class="tree-cats">
            ${CATEGORIAS.map((c) => {
              const total = todos.filter((p) => p.id_categoria === c.id).length;
              return `
                <button type="button" class="tree-cat" data-tree-cat="${c.slug}">
                  <span class="tree-cat-ico">${UI.icon(c.icone)}</span>
                  <span class="tree-cat-name">${UI.esc(c.nome)}<small>${c.subcategorias.length} tipos</small></span>
                  <span class="count">${total}</span>
                  ${UI.icon('chevron', 'tree-chevron')}
                </button>`;
            }).join('')}
          </div>
        </div>
        ${facetsHTML('')}`;
      return;
    }

    const totalCat = todos.filter((p) => p.id_categoria === cat.id).length;
    box.innerHTML = `${distanciaHTML()}
      <div class="filter-group tree-open">
        <button type="button" class="tree-back" data-tree-back>${UI.icon('chevron', 'tree-back-ico')} Todas as categorias</button>
        <div class="tree-current">
          <span class="tree-cat-ico">${UI.icon(cat.icone)}</span>
          <span class="tree-cat-name">${UI.esc(cat.nome)}<small>${totalCat} produto(s) neste nicho</small></span>
        </div>
        <div class="tree-branch">${facetsHTML(cat.slug)}</div>
      </div>`;
  }

  function facetsHTML(slug) {
    return (FACETS[slug] || []).map(([chave, titulo]) => {
      const opcoes = opcoesFacet(chave);
      if (!opcoes.length) return '';
      const marcado = (v) => state.sel[chave].some((x) => API.normalize(x) === API.normalize(v));
      // "Tipo" em chips (é o próximo nível da árvore); o resto em checkbox
      if (chave === 'subcategorias') {
        return `
          <div class="tree-facet">
            <h4>${titulo}</h4>
            <div class="tree-chips">
              ${opcoes.map((o) => `
                <label class="tree-chip ${marcado(o.valor) ? 'is-on' : ''} ${o.total ? '' : 'is-empty'}">
                  <input type="checkbox" data-facet="${chave}" value="${UI.esc(o.valor)}" ${marcado(o.valor) ? 'checked' : ''} ${o.total || marcado(o.valor) ? '' : 'disabled'}>
                  ${UI.esc(labelDe(chave, o.valor))} <span>${o.total}</span>
                </label>`).join('')}
            </div>
          </div>`;
      }
      return `
        <div class="tree-facet">
          <h4>${titulo}</h4>
          ${opcoes.map((o) => `
            <label class="filter-option ${o.total || marcado(o.valor) ? '' : 'is-empty'}">
              <input type="checkbox" data-facet="${chave}" value="${UI.esc(o.valor)}" ${marcado(o.valor) ? 'checked' : ''}>
              ${UI.esc(labelDe(chave, o.valor))} <span class="count">(${o.total})</span>
            </label>`).join('')}
        </div>`;
    }).join('');
  }

  function readFilters() {
    return {
      q: state.q || undefined,
      categoria: state.categoria || undefined,
      subcategorias: state.sel.subcategorias,
      marcas: state.sel.marcas,
      btus: state.sel.btus,
      tecnologias: state.sel.tecnologias,
      ciclos: state.sel.ciclos,
      estados: state.sel.estados,
      oferta: state.oferta || undefined,
      precoMin: state.precoMin,
      precoMax: state.precoMax,
      ordenacao: state.ordenacao === 'proximos' ? 'relevancia' : state.ordenacao
    };
  }

  function activeFilterChips() {
    const chips = [];
    const push = (tipo, valor, label) => chips.push({ tipo, valor, label });

    if (state.q) push('q', state.q, `Busca: "${state.q}"`);
    if (state.oferta) push('oferta', '1', 'Ofertas do dia');
    if (state.favoritos) push('favoritos', '1', 'Meus favoritos');

    if (state.distancia && R && regiao) {
      const f = R.FAIXAS.find((x) => x.id === state.distancia);
      if (f) push('distancia', state.distancia, f.label);
    }
    if (state.categoria) push('categoria', state.categoria, CAT_LABEL[state.categoria] || state.categoria);
    Object.entries(state.sel).forEach(([k, vals]) => vals.forEach((v) => push(k, v, labelDe(k, v))));

    if (state.precoMin != null || state.precoMax != null) {
      const min = state.precoMin != null ? UI.money(state.precoMin) : 'R$ 0';
      const max = state.precoMax != null ? UI.money(state.precoMax) : 'sem limite';
      push('preco', 'preco', `${min} – ${max}`);
    }
    return chips;
  }

  function renderActiveFilters() {
    const wrap = document.getElementById('activeFilters');
    if (!wrap) return;
    const chips = activeFilterChips();
    wrap.innerHTML = chips.map((c) => `
      <span class="active-filter">
        ${UI.esc(c.label)}
        <button type="button" data-remove="${c.tipo}" data-value="${UI.esc(c.valor)}" aria-label="Remover filtro ${UI.esc(c.label)}">
          ${UI.icon('close')}
        </button>
      </span>`).join('');
  }

  function updateHeading(total) {
    const title = document.getElementById('resultTitle');
    const sub = document.getElementById('shopSubtitle');
    const count = document.getElementById('shopCount');
    const shopTitle = document.getElementById('shopTitle');

    if (state.favoritos) {
      if (shopTitle) shopTitle.textContent = 'Meus favoritos';
      if (title) title.textContent = 'Produtos salvos';
      if (sub) sub.textContent = 'Os itens que você marcou com o coração.';
    } else if (state.q) {
      if (shopTitle) shopTitle.textContent = `Busca por "${state.q}"`;
      if (title) title.textContent = 'Resultados da busca';
      if (sub) sub.textContent = 'Refine os resultados com os filtros ao lado.';
    } else if (state.distancia && !state.categoria && R && regiao) {
      const f = R.FAIXAS.find((x) => x.id === state.distancia);
      if (shopTitle) shopTitle.textContent = 'Perto de você';
      if (title) title.textContent = f ? f.label : 'Perto de você';
      if (sub) sub.textContent = `Vendedores próximos de ${R.nomeLocal(regiao)}, do mais perto para o mais longe.`;
    } else if (state.oferta) {
      if (shopTitle) shopTitle.textContent = 'Ofertas do dia';
      if (title) title.textContent = 'Ofertas selecionadas';
      if (sub) sub.textContent = 'Produtos com desconto por tempo limitado.';
    } else {
      const subs = state.sel.subcategorias;
      const nome = subs.length === 1 ? labelDe('subcategorias', subs[0])
        : state.categoria ? CAT_LABEL[state.categoria] : 'Todos os produtos';
      if (shopTitle) shopTitle.textContent = nome;
      if (title) title.textContent = nome;
      if (sub) sub.textContent = 'Peças, equipamentos e ferramentas de climatização.';
    }

    if (count) count.textContent = `${total} ${total === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
  }

  function emptyState() {
    if (state.favoritos) {
      return `
        <div class="empty-state" style="grid-column:1/-1">
          <span class="empty-ico">${UI.icon('heart')}</span>
          <h3>Você ainda não tem favoritos</h3>
          <p>Toque no coração dos produtos que quiser acompanhar. Eles ficam salvos aqui neste navegador.</p>
          <a class="btn btn-grad" href="index.html">Explorar catálogo</a>
        </div>`;
    }
    return `
      <div class="empty-state" style="grid-column:1/-1">
        <span class="empty-ico">${UI.icon('search')}</span>
        <h3>Nenhum produto encontrado</h3>
        <p>Tente remover alguns filtros ou buscar por outro termo, marca ou modelo.</p>
        <button class="btn btn-outline" type="button" data-clear-filters>Limpar filtros</button>
      </div>`;
  }

  async function load(delayRender) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    if (!delayRender) {
      grid.innerHTML = '<div class="skeleton" style="height:380px"></div><div class="skeleton" style="height:380px"></div><div class="skeleton" style="height:380px"></div>';
    }

    try {
      let lista = await API.produtos(readFilters());
      if (state.favoritos) {
        lista = lista.filter((p) => Store.Favoritos.has(p.id));
      }
      if (state.distancia) lista = lista.filter((p) => naFaixa(p, state.distancia));
      if (state.ordenacao === 'proximos') {
        lista.sort((a, b) => (distDe(a) ?? 1e9) - (distDe(b) ?? 1e9) || a.preco - b.preco);
      }
      updateHeading(lista.length);
      renderFilterTree();
      renderActiveFilters();
      grid.innerHTML = lista.length ? lista.map(UI.productCard).join('') : emptyState();
      UI.syncFavButtons();
      UI.hydrateIcons(grid);
    } catch (err) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Não foi possível carregar</h3><p>${UI.esc(err.message)}</p></div>`;
    }
  }

  async function loadPerto() {
    const rail = document.getElementById('pertoRail');
    if (!rail) return;
    const titulo = document.getElementById('pertoTitle');
    const sub = document.getElementById('pertoSub');
    if (!R || !regiao) {
      if (titulo) titulo.textContent = 'Peças perto de você';
      if (sub) sub.textContent = 'Comprando de quem está perto, a peça chega mais rápido e o frete fica mais barato.';
      rail.innerHTML = `
        <div class="perto-cta">
          <span class="perto-cta-ico">${UI.icon('pin')}</span>
          <div>
            <strong>Onde você está?</strong>
            <p>Informe seu CEP ou cidade e mostramos os vendedores mais próximos, com distância e frete de cada peça.</p>
          </div>
          <button class="btn btn-buy" type="button" data-regiao-open>${UI.icon('pin')} Informar minha cidade</button>
        </div>`;
      return;
    }
    if (titulo) titulo.textContent = `Perto de você · ${R.nomeLocal(regiao)}`;
    const lista = (await API.produtos({ ordenacao: 'relevancia' }))
      .map((p) => ({ p, d: distDe(p) }))
      .filter((x) => x.d != null && x.d <= 300)
      .sort((a, b) => a.d - b.d || b.p.vendidos - a.p.vendidos)
      .slice(0, 8)
      .map((x) => x.p);
    rail.innerHTML = lista.length
      ? lista.map(UI.productCard).join('')
      : `<div class="perto-cta"><span class="perto-cta-ico">${UI.icon('pin')}</span><div><strong>Ainda não há vendedores a até 300 km de ${UI.esc(R.nomeLocal(regiao))}</strong><p>Veja todos os produtos abaixo — o frete é calculado pela distância.</p></div></div>`;
    UI.syncFavButtons();
    UI.hydrateIcons(rail);
  }

  async function loadOfertas() {
    const rail = document.getElementById('ofertasRail');
    if (!rail) return;
    const lista = (await API.produtos({ oferta: true, ordenacao: 'relevancia' })).slice(0, 6);
    rail.innerHTML = lista.map(UI.productCard).join('');
    UI.syncFavButtons();
    UI.hydrateIcons(rail);
  }

  function clearAll() {
    state.q = '';
    state.oferta = false;
    state.favoritos = false;
    state.precoMin = null;
    state.precoMax = null;
    state.ordenacao = 'relevancia';
    state.categoria = '';
    state.distancia = '';
    limparRamo();
    const min = document.getElementById('precoMin');
    const max = document.getElementById('precoMax');
    const sort = document.getElementById('sortSelect');
    if (min) min.value = '';
    if (max) max.value = '';
    if (sort) sort.value = 'relevancia';
    document.querySelectorAll('[data-search-form] input[name="q"]').forEach((i) => { i.value = ''; });
    history.replaceState({}, '', 'index.html');
    load();
  }

  function bind() {
    document.getElementById('sortSelect')?.addEventListener('change', (e) => {
      state.ordenacao = e.target.value;
      load();
    });

    document.getElementById('filtersCard')?.addEventListener('change', (e) => {
      if (e.target.matches('[data-dist]')) {
        state.distancia = e.target.value;
        if (state.distancia && state.ordenacao === 'relevancia') {
          state.ordenacao = 'proximos';
          const sort = document.getElementById('sortSelect');
          if (sort) sort.value = 'proximos';
        }
        syncUrl();
        load(true);
        return;
      }
      const input = e.target.closest('[data-facet]');
      if (!input) return;
      const lista = state.sel[input.dataset.facet];
      const i = lista.findIndex((v) => API.normalize(v) === API.normalize(input.value));
      if (input.checked && i < 0) lista.push(input.value);
      if (!input.checked && i >= 0) lista.splice(i, 1);
      syncUrl();
      load(true);
    });

    // navegação na árvore de categorias
    document.getElementById('filtersCard')?.addEventListener('click', (e) => {
      const pick = e.target.closest('[data-tree-cat]');
      if (pick) { escolherCategoria(pick.dataset.treeCat); return; }
      if (e.target.closest('[data-tree-back]')) { escolherCategoria(''); }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear-filters]')) { clearAll(); return; }

      // Links de categoria (atalhos, menu, banners): filtra aqui mesmo e desce até os produtos
      const catLink = e.target.closest('a[href^="index.html?categoria="]');
      if (catLink && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
        const url = new URL(catLink.href);
        const slug = url.searchParams.get('categoria');
        if (slug && CATEGORIAS.some((c) => c.slug === slug)) {
          e.preventDefault();
          document.querySelector('[data-menu-close]')?.click();
          document.querySelector('.nav-dropdown.is-open')?.classList.remove('is-open');
          filtrarCategoria(slug, url.searchParams.get('sub'));
          return;
        }
      }

      if (e.target.closest('[data-apply-price]')) {
        const min = document.getElementById('precoMin');
        const max = document.getElementById('precoMax');
        state.precoMin = min && min.value !== '' ? Number(min.value) : null;
        state.precoMax = max && max.value !== '' ? Number(max.value) : null;
        load();
        return;
      }

      if (e.target.closest('[data-filters-toggle]')) {
        document.getElementById('filtersCard')?.classList.toggle('is-open');
        return;
      }

      const remove = e.target.closest('[data-remove]');
      if (remove) {
        const tipo = remove.dataset.remove;
        const valor = remove.dataset.value;
        if (tipo === 'q') {
          state.q = '';
          document.querySelectorAll('[data-search-form] input[name="q"]').forEach((i) => { i.value = ''; });
        } else if (tipo === 'oferta') {
          state.oferta = false;
        } else if (tipo === 'favoritos') {
          state.favoritos = false;
        } else if (tipo === 'preco') {
          state.precoMin = null;
          state.precoMax = null;
          const min = document.getElementById('precoMin');
          const max = document.getElementById('precoMax');
          if (min) min.value = '';
          if (max) max.value = '';
        } else if (tipo === 'distancia') {
          state.distancia = '';
        } else if (tipo === 'categoria') {
          state.categoria = '';
          limparRamo();
        } else if (state.sel[tipo]) {
          state.sel[tipo] = state.sel[tipo].filter((v) => API.normalize(v) !== API.normalize(valor));
        }
        syncUrl();
        load(true);
      }
    });
  }

  /* Rola até a lista de produtos, descontando o header fixo. */
  function scrollToCatalogo() {
    const alvo = document.getElementById('catalogo');
    if (!alvo) return;
    // se algum header ficar fixo no topo, desconta a altura dele
    const fixo = [...document.querySelectorAll('#site-header, .site-header')].find((el) => {
      const pos = getComputedStyle(el).position;
      return (pos === 'fixed' || pos === 'sticky') && el.parentElement && el.parentElement.offsetHeight > el.offsetHeight + 50;
    });
    const visivel = fixo ? fixo.getBoundingClientRect().height + (parseFloat(getComputedStyle(fixo).top) || 0) : 0;
    const offset = visivel + 16;
    const top = alvo.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  function syncUrl() {
    const qs = new URLSearchParams();
    if (state.q) qs.set('q', state.q);
    if (state.categoria) qs.set('categoria', state.categoria);
    if (state.sel.subcategorias.length === 1) qs.set('sub', state.sel.subcategorias[0]);
    if (state.oferta) qs.set('oferta', '1');
    if (state.distancia) qs.set('dist', state.distancia);
    const str = qs.toString();
    history.replaceState({}, '', `index.html${str ? `?${str}` : ''}#catalogo`);
  }

  function marcarAtalhos() {
    document.querySelectorAll('.quick-cat').forEach((a) => {
      a.classList.toggle('is-active', !!state.categoria && new URL(a.href).searchParams.get('categoria') === state.categoria);
    });
  }

  // Troca a categoria pela árvore (sem rolar a página)
  function escolherCategoria(slug, sub) {
    state.categoria = slug;
    limparRamo();
    if (sub) state.sel.subcategorias = [String(sub)];
    marcarAtalhos();
    syncUrl();
    load(true);
  }

  /* Escolhe uma categoria (atalhos, menu, banners), filtra e desce até os produtos. */
  async function filtrarCategoria(slug, sub) {
    state.q = '';
    state.oferta = false;
    state.favoritos = false;
    document.querySelectorAll('[data-search-form] input[name="q"]').forEach((i) => { i.value = ''; });
    escolherCategoria(slug, sub);
    scrollToCatalogo();
  }

  function syncFromParams() {
    document.querySelectorAll('[data-search-form] input[name="q"]').forEach((i) => { i.value = state.q; });
    marcarAtalhos();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHero();
    syncFromParams();
    bind();
    loadOfertas();
    loadPerto();
    if (state.distancia && regiao) {
      state.ordenacao = 'proximos';
      const sort = document.getElementById('sortSelect');
      if (sort) sort.value = 'proximos';
    }
    // Veio de outra página com uma categoria/busca? Mostra os produtos já filtrados.
    const deveRolar = state.categoria || state.q || state.distancia || location.hash === '#catalogo';
    load().then(() => { if (deveRolar) setTimeout(scrollToCatalogo, 80); });
  });
})();
