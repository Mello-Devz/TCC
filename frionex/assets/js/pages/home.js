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
    oferta: params.get('oferta') === '1',
    favoritos: params.get('favoritos') === '1',
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

  /* ---------------- filtros ---------------- */
  function hydrateCounts() {
    const produtos = API.getProdutosSync();
    document.querySelectorAll('[data-count]').forEach((el) => {
      const [tipo, valor] = el.dataset.count.split(':');
      let total = 0;
      if (tipo === 'categoria') {
        const cat = API.getCategoriasSync().find((c) => c.slug === valor);
        total = cat ? produtos.filter((p) => p.id_categoria === cat.id).length : 0;
      } else if (tipo === 'btus') {
        total = produtos.filter((p) => Number(p.btu) === Number(valor)).length;
      } else if (tipo === 'marca') {
        total = produtos.filter((p) => API.normalize(p.marca) === API.normalize(valor)).length;
      } else if (tipo === 'tecnologia') {
        total = produtos.filter((p) => API.normalize(p.tecnologia) === API.normalize(valor)).length;
      } else if (tipo === 'ciclo') {
        total = produtos.filter((p) => API.normalize(p.ciclo) === API.normalize(valor)).length;
      }
      el.textContent = total ? `(${total})` : '(0)';
    });
  }

  function checkedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((i) => i.value);
  }

  function readFilters() {
    return {
      q: state.q || undefined,
      categoria: checkedValues('categoria')[0] || undefined,
      marcas: checkedValues('marcas'),
      btus: checkedValues('btus'),
      tecnologias: checkedValues('tecnologias'),
      ciclos: checkedValues('ciclos'),
      oferta: state.oferta || undefined,
      precoMin: state.precoMin,
      precoMax: state.precoMax,
      ordenacao: state.ordenacao
    };
  }

  function activeFilterChips() {
    const chips = [];
    const push = (tipo, valor, label) => chips.push({ tipo, valor, label });

    if (state.q) push('q', state.q, `Busca: "${state.q}"`);
    if (state.oferta) push('oferta', '1', 'Ofertas do dia');
    if (state.favoritos) push('favoritos', '1', 'Meus favoritos');

    const categoria = checkedValues('categoria')[0];
    if (categoria) push('categoria', categoria, CAT_LABEL[categoria] || categoria);

    checkedValues('marcas').forEach((v) => push('marcas', v, `Marca: ${v}`));
    checkedValues('btus').forEach((v) => push('btus', v, `${Number(v).toLocaleString('pt-BR')} BTUs`));
    checkedValues('tecnologias').forEach((v) => push('tecnologias', v, v));
    checkedValues('ciclos').forEach((v) => push('ciclos', v, v));

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
    } else if (state.oferta) {
      if (shopTitle) shopTitle.textContent = 'Ofertas do dia';
      if (title) title.textContent = 'Ofertas selecionadas';
      if (sub) sub.textContent = 'Produtos com desconto por tempo limitado.';
    } else {
      const categoria = checkedValues('categoria')[0];
      const nome = categoria ? CAT_LABEL[categoria] : 'Todos os produtos';
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
      updateHeading(lista.length);
      renderActiveFilters();
      grid.innerHTML = lista.length ? lista.map(UI.productCard).join('') : emptyState();
      UI.syncFavButtons();
      UI.hydrateIcons(grid);
    } catch (err) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Não foi possível carregar</h3><p>${UI.esc(err.message)}</p></div>`;
    }
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
    document.querySelectorAll('#filtersCard input[type="checkbox"]').forEach((i) => { i.checked = false; });
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
      const input = e.target;
      if (!input.matches('input[type="checkbox"]')) return;
      if (input.name === 'categoria' && input.checked) {
        document.querySelectorAll('input[name="categoria"]').forEach((i) => {
          if (i !== input) i.checked = false;
        });
      }
      load();
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear-filters]')) { clearAll(); return; }

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
        } else {
          const input = document.querySelector(`input[name="${tipo}"][value="${CSS.escape(valor)}"]`);
          if (input) input.checked = false;
        }
        load();
      }
    });
  }

  function syncFromParams() {
    const categoriaBox = document.querySelector(`input[name="categoria"][value="${state.categoria}"]`);
    if (categoriaBox) categoriaBox.checked = true;
    document.querySelectorAll('[data-search-form] input[name="q"]').forEach((i) => { i.value = state.q; });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHero();
    hydrateCounts();
    syncFromParams();
    bind();
    loadOfertas();
    load();
  });
})();
