/* =========================================================
   FRIONEX · Painel do vendedor
   Anunciar, editar, excluir produtos e editar dados da loja.
   Tudo é salvo no navegador pela API simulada (api.js).
   ========================================================= */
(function () {
  'use strict';

  const API = window.FrionexAPI;
  const UI = window.FrionexUI;
  const Store = window.FrionexStore;

  const session = Store.Auth.require('vender.html');
  if (!session) return;

  const root = document.getElementById('sellerRoot');
  const { icon, esc, money } = UI;
  const categorias = API.getCategoriasSync();

  let loja = null;
  let busca = '';
  let editando = null;   // produto em edição (ou null para novo)
  let fotoAtual = '';    // dataURL ou URL da foto escolhida
  let aba = location.hash === '#vendas' ? 'vendas' : 'anuncios';
  let vendas = [];
  let filtroVendas = 'todas';
  const R = window.FrionexRegiao;
  const FLUXO = ['Aguardando pagamento', 'Em preparo', 'Enviado', 'Entregue'];
  const statusClass = (st) => ({ 'Entregue': 'status-entregue', 'Enviado': 'status-enviado', 'Em preparo': 'status-preparo', 'Aguardando pagamento': 'status-aguardando', 'Cancelado': 'status-cancelado' }[st] || 'status-preparo');
  const dataBR = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

  /* ---------- conta de comprador ---------- */
  if (session.tipo !== 'vendedor') {
    root.innerHTML = `
      <div class="card empty-state">
        <span class="empty-ico">${icon('store')}</span>
        <h3>Esta área é para vendedores</h3>
        <p>Você está usando uma conta de comprador. Para anunciar produtos, crie uma conta de vendedor.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <a class="btn btn-grad" href="cadastro.html?tipo=vendedor">Criar conta de vendedor</a>
          <a class="btn btn-outline" href="index.html">Voltar às compras</a>
        </div>
      </div>`;
    return;
  }

  /* ---------- helpers ---------- */
  const catNome = (id) => (categorias.find((c) => c.id === Number(id)) || {}).nome || '—';

  function stats(produtos) {
    const ativos = produtos.length;
    const estoque = produtos.reduce((t, p) => t + (Number(p.estoque) || 0), 0);
    const vendidos = produtos.reduce((t, p) => t + (Number(p.vendidos) || 0), 0);
    const valor = produtos.reduce((t, p) => t + (Number(p.estoque) || 0) * Number(p.preco), 0);
    return [
      { ico: 'package', label: 'Anúncios ativos', valor: ativos },
      { ico: 'box', label: 'Itens em estoque', valor: estoque },
      { ico: 'cart', label: 'Unidades vendidas', valor: vendidos },
      { ico: 'card', label: 'Valor em estoque', valor: money(valor) }
    ];
  }

  function subcatOptions(idCategoria, selecionada) {
    const cat = categorias.find((c) => c.id === Number(idCategoria));
    const subs = cat ? cat.subcategorias : [];
    return subs.map((s) => `<option value="${s.id}" ${Number(selecionada) === s.id ? 'selected' : ''}>${esc(s.nome)}</option>`).join('');
  }

  /* ---------- render ---------- */
  function render() {
    const produtos = loja.produtos.filter((p) =>
      !busca || p.nome.toLowerCase().includes(busca.toLowerCase()));

    root.innerHTML = `
      <section class="card seller-hero">
        <img class="seller-hero-avatar" src="${esc(loja.foto || 'assets/img/avatar-loja.svg')}" alt="">
        <div class="seller-hero-info">
          <span class="seller-hero-kicker">Painel do vendedor</span>
          <h1>${esc(loja.nome_loja)}</h1>
          <p>${esc(loja.usuario.nome)} · ${esc(loja.localizacao || '')}</p>
        </div>
        <div class="seller-hero-actions">
          <a class="btn btn-outline" href="loja.html?id=${loja.id}">${icon('store')} Ver minha loja</a>
          <button class="btn btn-outline" type="button" data-edit-store>${icon('edit')} Editar loja</button>
          <button class="btn btn-buy" type="button" data-new>${icon('plus')} Novo anúncio</button>
        </div>
      </section>

      <section class="seller-stats">
        ${stats(loja.produtos).map((s) => `
          <div class="card seller-stat">
            <span class="seller-stat-ico">${icon(s.ico)}</span>
            <div><strong>${s.valor}</strong><span>${s.label}</span></div>
          </div>`).join('')}
      </section>

      <nav class="seller-tabs" role="tablist">
        <button type="button" role="tab" class="${aba === 'anuncios' ? 'is-active' : ''}" data-aba="anuncios">${icon('package')} Meus anúncios <span>${loja.produtos.length}</span></button>
        <button type="button" role="tab" class="${aba === 'vendas' ? 'is-active' : ''}" data-aba="vendas">${icon('cart')} Vendas <span>${vendas.length}</span>${pendentes() ? `<b class="tab-alert">${pendentes()} a enviar</b>` : ''}</button>
        <a role="tab" href="mensagens.html">${icon('chat')} Mensagens</a>
      </nav>

      ${aba === 'vendas' ? vendasHTML() : `
      <section class="card card-pad seller-form-card" id="sellerForm" ${editando === undefined ? 'hidden' : ''}></section>

      <section class="card card-pad">
        <div class="card-head">
          <div>
            <h2>Meus anúncios</h2>
            <p>${loja.produtos.length} produto(s) publicados na Frionex.</p>
          </div>
          <label class="seller-search">
            ${icon('search')}
            <input type="search" placeholder="Buscar anúncio..." value="${esc(busca)}" data-search aria-label="Buscar anúncio">
          </label>
        </div>
        ${produtos.length ? `
          <div class="seller-table" role="table">
            <div class="seller-row seller-row-head" role="row">
              <span>Produto</span><span>Preço</span><span>Estoque</span><span>Vendidos</span><span></span>
            </div>
            ${produtos.map((p) => `
              <div class="seller-row" role="row">
                <a class="seller-prod" href="produto.html?id=${p.id}">
                  <img src="${esc(p.foto)}" alt="">
                  <span><strong>${esc(p.nome)}</strong><small>${esc(catNome(p.id_categoria))} · ${esc(p.marca)} · ${esc(p.estado || 'Novo')}</small></span>
                </a>
                <span class="seller-price">${money(p.preco)}${p.preco_antigo ? `<s>${money(p.preco_antigo)}</s>` : ''}</span>
                <span>${Number(p.estoque) <= 5
                  ? `<span class="status status-aguardando">${p.estoque} un.</span>`
                  : `<span class="status status-entregue">${p.estoque} un.</span>`}</span>
                <span>${p.vendidos || 0}</span>
                <span class="seller-actions">
                  <button class="btn btn-soft btn-sm" type="button" data-edit="${p.id}">${icon('edit')} Editar</button>
                  <button class="btn btn-danger-ghost btn-sm" type="button" data-remove="${p.id}" aria-label="Excluir ${esc(p.nome)}">${icon('trash')}</button>
                </span>
              </div>`).join('')}
          </div>` : `
          <div class="empty-state" style="box-shadow:none;border:0">
            <span class="empty-ico">${icon('package')}</span>
            <h3>${busca ? 'Nenhum anúncio encontrado' : 'Você ainda não tem anúncios'}</h3>
            <p>${busca ? 'Tente outro termo de busca.' : 'Clique em "Novo anúncio" para publicar o seu primeiro produto.'}</p>
          </div>`}
      </section>`}`;

    if (aba === 'anuncios' && editando !== undefined) renderForm();
  }

  /* ---------- vendas ---------- */
  const pendentes = () => vendas.filter((v) => v.status === 'Aguardando pagamento' || v.status === 'Em preparo').length;

  function proximaAcao(v) {
    if (v.status === 'Aguardando pagamento') return { status: 'Em preparo', label: 'Confirmar pagamento', ico: 'check' };
    if (v.status === 'Em preparo') return v.retirada
      ? { status: 'Enviado', label: 'Pronto para retirada', ico: 'store' }
      : { status: 'Enviado', label: 'Marcar como enviado', ico: 'truck' };
    if (v.status === 'Enviado') return { status: 'Entregue', label: v.retirada ? 'Confirmar retirada' : 'Confirmar entrega', ico: 'check' };
    return null;
  }

  function vendasHTML() {
    const filtros = {
      todas: () => true,
      enviar: (v) => v.status === 'Aguardando pagamento' || v.status === 'Em preparo',
      enviadas: (v) => v.status === 'Enviado',
      concluidas: (v) => v.status === 'Entregue' || v.status === 'Cancelado'
    };
    const lista = vendas.filter(filtros[filtroVendas]);
    const faturado = vendas.filter((v) => v.status !== 'Cancelado').reduce((t, v) => t + v.subtotal_loja, 0);
    return `
      <section class="card card-pad">
        <div class="card-head">
          <div>
            <h2>Vendas recebidas</h2>
            <p>${vendas.length} pedido(s) · ${money(faturado)} em vendas</p>
          </div>
          <div class="seller-chips">
            ${[['todas', 'Todas'], ['enviar', 'A enviar'], ['enviadas', 'Enviadas'], ['concluidas', 'Concluídas']].map(([id, label]) => `
              <button type="button" class="chip-btn ${filtroVendas === id ? 'is-active' : ''}" data-filtro-venda="${id}">${label} <span>${vendas.filter(filtros[id]).length}</span></button>`).join('')}
          </div>
        </div>
        ${lista.length ? lista.map(vendaHTML).join('') : `
          <div class="empty-state" style="box-shadow:none;border:0">
            <span class="empty-ico">${icon('cart')}</span>
            <h3>${vendas.length ? 'Nada por aqui' : 'Você ainda não recebeu pedidos'}</h3>
            <p>${vendas.length ? 'Não há vendas neste filtro.' : 'Quando alguém comprar um anúncio seu, o pedido aparece aqui para você preparar e enviar.'}</p>
          </div>`}
      </section>`;
  }

  function vendaHTML(v) {
    const acao = proximaAcao(v);
    const destino = v.endereco && R ? R.localPorCep(v.endereco.cep) : null;
    const origem = R ? R.cidadeDoVendedor(loja) : null;
    const d = R && destino && origem ? R.distanciaKm(origem, destino) : null;
    const passo = v.status === 'Cancelado' ? -1 : FLUXO.indexOf(v.status);
    return `
      <article class="venda">
        <div class="venda-head">
          <strong>Pedido #${v.id}</strong>
          <span>${dataBR(v.data)}</span>
          <span class="status ${statusClass(v.status)}">${esc(v.status)}</span>
          <span class="venda-total">${money(v.subtotal_loja)}</span>
        </div>
        <div class="venda-body">
          <div class="venda-itens">
            ${v.itens.map((i) => `
              <div class="venda-item">
                <img src="${esc(i.produto.foto)}" alt="">
                <span><strong>${esc(i.produto.nome)}</strong><small>Qtd. ${i.quantidade} · ${money(i.preco_unitario)} cada</small></span>
              </div>`).join('')}
          </div>
          <div class="venda-cliente">
            <span class="venda-label">Comprador</span>
            <strong>${esc(v.comprador ? v.comprador.nome : 'Cliente')}</strong>
            ${v.retirada
              ? `<small>${icon('store')} Retira na loja</small>`
              : v.endereco
                ? `<small>${icon('pin')} ${esc(v.endereco.rua)}, ${esc(v.endereco.numero)} · ${esc(v.endereco.cidade)}/${esc(v.endereco.uf)}${d != null ? ` · ${R.formatarKm(d)}` : ''}</small>`
                : ''}
            <small>${icon('card')} ${esc(v.pagamento)}</small>
            ${v.rastreio ? `<small>${icon('truck')} Rastreio: <b>${esc(v.rastreio)}</b></small>` : ''}
          </div>
        </div>
        <div class="venda-steps">
          ${FLUXO.map((st, i) => `<span class="${passo >= i ? 'is-done' : ''}">${esc(st)}</span>`).join('')}
        </div>
        <div class="venda-actions">
          ${v.comprador ? `<a class="btn btn-soft btn-sm" href="mensagens.html?comprador=${v.comprador.id}&pedido=${v.id}">${icon('chat')} Falar com o comprador</a>` : ''}
          ${v.status !== 'Entregue' && v.status !== 'Cancelado' ? `<button class="btn btn-ghost btn-sm" type="button" data-cancelar-venda="${v.id}">Cancelar</button>` : ''}
          ${acao ? `<button class="btn btn-buy btn-sm" type="button" data-avancar="${v.id}" data-status="${acao.status}">${icon(acao.ico)} ${acao.label}</button>` : ''}
        </div>
      </article>`;
  }

  async function atualizarVenda(id, dados) {
    try {
      await API.atualizarVenda(session.id, id, dados);
      vendas = await API.vendas(session.id);
      render();
      UI.toast(`Pedido #${id}: ${dados.status}.`);
    } catch (err) { UI.toast(err.message, 'error'); }
  }

  function renderForm() {
    const box = document.getElementById('sellerForm');
    if (!box) return;
    const p = editando || {};
    const catId = p.id_categoria || categorias[0].id;
    fotoAtual = p.foto || '';
    box.hidden = false;
    box.innerHTML = `
      <div class="card-head">
        <div>
          <h2>${editando ? 'Editar anúncio' : 'Novo anúncio'}</h2>
          <p>${editando ? 'Altere os dados e salve para atualizar o produto na loja.' : 'Preencha os dados do produto. Ele aparece no catálogo assim que for publicado.'}</p>
        </div>
        <button class="icon-btn" type="button" data-cancel aria-label="Fechar formulário">${icon('close')}</button>
      </div>
      <form class="seller-form" data-product-form novalidate>
        <div class="seller-photo">
          <div class="seller-photo-preview" data-photo-preview>
            ${fotoAtual ? `<img src="${esc(fotoAtual)}" alt="">` : `<span>${icon('package')}<small>Sem foto</small></span>`}
          </div>
          <label class="btn btn-outline btn-sm btn-block">
            ${icon('plus')} Enviar foto
            <input type="file" accept="image/*" data-photo-file hidden>
          </label>
          <div class="field">
            <label for="pFotoUrl">ou cole o link da imagem</label>
            <input id="pFotoUrl" type="url" placeholder="https://..." value="${fotoAtual && !fotoAtual.startsWith('data:') ? esc(fotoAtual) : ''}" data-photo-url>
          </div>
        </div>

        <div class="form-grid">
          <div class="field full">
            <label for="pNome">Nome do produto *</label>
            <input id="pNome" name="nome" required minlength="5" value="${esc(p.nome || '')}" placeholder="Ex.: Ar-Condicionado Split Inverter 12000 BTUs">
          </div>
          <div class="field">
            <label for="pCat">Categoria *</label>
            <select id="pCat" name="id_categoria" data-cat>
              ${categorias.map((c) => `<option value="${c.id}" ${c.id === Number(catId) ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="pSub">Subcategoria</label>
            <select id="pSub" name="id_subcategoria" data-sub>${subcatOptions(catId, p.id_subcategoria)}</select>
          </div>
          <div class="field">
            <label for="pMarca">Marca</label>
            <input id="pMarca" name="marca" value="${esc(p.marca || '')}" placeholder="Ex.: Samsung">
          </div>
          <div class="field">
            <label for="pEstado">Condição</label>
            <select id="pEstado" name="estado">
              ${['Novo', 'Usado', 'Recondicionado'].map((e) => `<option ${p.estado === e ? 'selected' : ''}>${e}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="pPreco">Preço de venda (R$) *</label>
            <input id="pPreco" name="preco" type="number" min="0.01" step="0.01" required value="${p.preco ?? ''}" placeholder="0,00">
          </div>
          <div class="field">
            <label for="pPrecoAntigo">Preço "de" (R$) · opcional</label>
            <input id="pPrecoAntigo" name="preco_antigo" type="number" min="0" step="0.01" value="${p.preco_antigo ?? ''}" placeholder="Para mostrar desconto">
          </div>
          <div class="field">
            <label for="pEstoque">Estoque (unidades) *</label>
            <input id="pEstoque" name="estoque" type="number" min="0" step="1" required value="${p.estoque ?? 1}">
          </div>
          <div class="field">
            <label for="pGarantia">Garantia</label>
            <select id="pGarantia" name="garantia">
              ${['Sem garantia', '3 meses', '6 meses', '12 meses', '24 meses'].map((g) => `<option ${(p.garantia || '3 meses') === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="pBtu">BTUs</label>
            <select id="pBtu" name="btu">
              <option value="">Não se aplica</option>
              ${[7000, 9000, 12000, 18000, 24000, 30000, 36000].map((b) => `<option value="${b}" ${Number(p.btu) === b ? 'selected' : ''}>${b.toLocaleString('pt-BR')} BTUs</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="pCiclo">Ciclo</label>
            <select id="pCiclo" name="ciclo">
              ${['-', 'Só Frio', 'Frio/Calor'].map((c) => `<option value="${c}" ${(p.ciclo || '-') === c ? 'selected' : ''}>${c === '-' ? 'Não se aplica' : c}</option>`).join('')}
            </select>
          </div>
          <div class="field full">
            <label for="pTec">Tecnologia</label>
            <input id="pTec" name="tecnologia" value="${esc(p.tecnologia && p.tecnologia !== '-' ? p.tecnologia : '')}" placeholder="Ex.: Inverter, Convencional, Digital">
          </div>
          <div class="field full">
            <label for="pDesc">Descrição</label>
            <textarea id="pDesc" name="descricao" rows="4" placeholder="Conte os detalhes, compatibilidade e o que acompanha o produto.">${esc(p.descricao || '')}</textarea>
          </div>
          <div class="form-actions full" style="grid-column:1/-1">
            <button class="btn btn-outline" type="button" data-cancel>Cancelar</button>
            <button class="btn btn-buy btn-save" type="submit">${icon('check')} ${editando ? 'Salvar alterações' : 'Publicar anúncio'}</button>
          </div>
        </div>
      </form>`;
  }

  /* ---------- foto: redimensiona para caber no localStorage ---------- */
  function lerFoto(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) return reject(new Error('Escolha um arquivo de imagem.'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Imagem inválida.'));
        img.onload = () => {
          const max = 800;
          const escala = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * escala);
          canvas.height = Math.round(img.height * escala);
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function setPreview(src) {
    fotoAtual = src;
    const prev = root.querySelector('[data-photo-preview]');
    if (prev) prev.innerHTML = src ? `<img src="${esc(src)}" alt="">` : `<span>${icon('package')}<small>Sem foto</small></span>`;
  }

  function abrirForm(produto) {
    editando = produto || null;
    render();
    document.getElementById('sellerForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => document.getElementById('pNome')?.focus(), 350);
  }

  function fecharForm() {
    editando = undefined;
    render();
  }

  async function recarregar() {
    loja = await API.minhaLoja(session.id);
    vendas = await API.vendas(session.id);
  }

  /* ---------- eventos ---------- */
  root.addEventListener('click', async (e) => {
    const tab = e.target.closest('[data-aba]');
    if (tab) {
      aba = tab.dataset.aba;
      history.replaceState({}, '', aba === 'vendas' ? '#vendas' : location.pathname);
      render();
      return;
    }
    const fv = e.target.closest('[data-filtro-venda]');
    if (fv) { filtroVendas = fv.dataset.filtroVenda; render(); return; }

    const av = e.target.closest('[data-avancar]');
    if (av) {
      const id = Number(av.dataset.avancar);
      const status = av.dataset.status;
      const venda = vendas.find((v) => v.id === id);
      if (status === 'Enviado' && venda && !venda.retirada) {
        const m = UI.modal(`Enviar pedido #${id}`, `
          <div class="field">
            <label for="rastreio">Código de rastreio</label>
            <input id="rastreio" placeholder="Ex.: BR123456789SC" value="${esc(venda.rastreio || '')}" style="text-transform:uppercase">
            <small style="color:var(--muted);font-size:11.5px">O comprador vê o código em "Meus pedidos".</small>
          </div>`, {
          footer: `<button class="btn btn-outline" type="button" data-modal-close>Cancelar</button>
                   <button class="btn btn-buy" type="button" data-confirm-envio>${icon('truck')} Marcar como enviado</button>`
        });
        const input = m.querySelector('#rastreio');
        setTimeout(() => input.focus(), 50);
        m.querySelector('[data-confirm-envio]').addEventListener('click', async () => {
          if (input.value.trim().length < 6) { UI.toast('Informe um código de rastreio válido.', 'error'); return; }
          UI.closeModal();
          await atualizarVenda(id, { status, rastreio: input.value });
        });
        return;
      }
      await atualizarVenda(id, { status });
      return;
    }
    const cv = e.target.closest('[data-cancelar-venda]');
    if (cv) {
      const id = Number(cv.dataset.cancelarVenda);
      const m = UI.modal(`Cancelar pedido #${id}?`, '<p style="font-size:14px">O comprador será avisado e o pedido não poderá mais ser enviado.</p>', {
        footer: `<button class="btn btn-outline" type="button" data-modal-close>Voltar</button>
                 <button class="btn btn-grad" type="button" data-confirm-cancel>Cancelar pedido</button>`
      });
      m.querySelector('[data-confirm-cancel]').addEventListener('click', async () => {
        UI.closeModal();
        await atualizarVenda(id, { status: 'Cancelado' });
      });
      return;
    }

    if (e.target.closest('[data-new]')) { aba = 'anuncios'; return abrirForm(null); }
    if (e.target.closest('[data-cancel]')) return fecharForm();

    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) {
      const p = loja.produtos.find((x) => x.id === Number(editBtn.dataset.edit));
      return abrirForm(p);
    }

    const rmBtn = e.target.closest('[data-remove]');
    if (rmBtn) {
      const p = loja.produtos.find((x) => x.id === Number(rmBtn.dataset.remove));
      if (!p) return;
      const m = UI.modal('Excluir anúncio', `
        <p style="font-size:14px">Tem certeza que deseja excluir <strong>${esc(p.nome)}</strong>? O produto deixa de aparecer na loja e no catálogo.</p>`, {
        footer: `<button class="btn btn-outline" type="button" data-modal-close>Cancelar</button>
                 <button class="btn btn-grad" type="button" data-confirm-remove>${icon('trash')} Excluir</button>`
      });
      m.querySelector('[data-confirm-remove]').addEventListener('click', async () => {
        try {
          await API.removerProduto(session.id, p.id);
          UI.closeModal();
          await recarregar();
          if (editando && editando.id === p.id) editando = undefined;
          render();
          UI.toast('Anúncio excluído.');
        } catch (err) { UI.toast(err.message, 'error'); }
      });
      return;
    }

    if (e.target.closest('[data-edit-store]')) {
      const m = UI.modal('Editar loja', `
        <form class="form-grid" data-store-form style="grid-template-columns:1fr">
          <div class="field"><label for="sNome">Nome da loja</label><input id="sNome" name="nome_loja" required value="${esc(loja.nome_loja)}"></div>
          <div class="field"><label for="sLocal">Cidade da loja</label>
            <select id="sLocal" name="cidade">
              ${(window.FrionexRegiao ? window.FrionexRegiao.CIDADES : []).map((c) => `<option value="${c.id}" ${loja.cidade === c.id ? 'selected' : ''}>${esc(c.nome)} · ${c.uf}</option>`).join('')}
            </select>
            <small style="color:var(--muted);font-size:11.5px">Usada para mostrar a sua loja aos compradores mais próximos e calcular o frete.</small>
          </div>
          <div class="field"><label for="sDesc">Descrição</label><textarea id="sDesc" name="descricao" rows="3">${esc(loja.descricao || '')}</textarea></div>
        </form>`, {
        footer: `<button class="btn btn-outline" type="button" data-modal-close>Cancelar</button>
                 <button class="btn btn-buy" type="button" data-save-store>${icon('check')} Salvar</button>`
      });
      m.querySelector('[data-save-store]').addEventListener('click', async () => {
        const f = new FormData(m.querySelector('[data-store-form]'));
        const nome = String(f.get('nome_loja') || '').trim();
        if (nome.length < 3) return UI.toast('Informe o nome da loja.', 'error');
        try {
          await API.salvarLoja(session.id, { nome_loja: nome, cidade: f.get('cidade'), descricao: f.get('descricao') });
          UI.closeModal();
          await recarregar();
          render();
          UI.toast('Dados da loja atualizados.');
        } catch (err) { UI.toast(err.message, 'error'); }
      });
    }
  });

  root.addEventListener('input', (e) => {
    if (e.target.matches('[data-search]')) {
      busca = e.target.value;
      const pos = e.target.selectionStart;
      render();
      const input = root.querySelector('[data-search]');
      input.focus();
      input.setSelectionRange(pos, pos);
    }
    if (e.target.matches('[data-photo-url]')) setPreview(e.target.value.trim());
  });

  root.addEventListener('change', async (e) => {
    if (e.target.matches('[data-cat]')) {
      root.querySelector('[data-sub]').innerHTML = subcatOptions(e.target.value);
    }
    if (e.target.matches('[data-photo-file]') && e.target.files[0]) {
      try {
        setPreview(await lerFoto(e.target.files[0]));
        const url = root.querySelector('[data-photo-url]');
        if (url) url.value = '';
      } catch (err) { UI.toast(err.message, 'error'); }
    }
  });

  root.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-product-form]');
    if (!form) return;
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(form).entries());
    dados.foto = fotoAtual;
    if (editando) dados.id = editando.id;
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    try {
      const salvo = await API.salvarProduto(session.id, dados);
      const novo = !editando;
      editando = undefined;
      await recarregar();
      render();
      UI.toast(novo ? 'Anúncio publicado!' : 'Anúncio atualizado.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (novo) setTimeout(() => UI.toast(`"${salvo.nome}" já aparece no catálogo.`, 'info'), 600);
    } catch (err) {
      UI.toast(err.message.includes('quota') ? 'A foto é grande demais para salvar no navegador. Tente outra.' : err.message, 'error');
      btn.disabled = false;
    }
  });

  /* ---------- início ---------- */
  editando = undefined;
  recarregar()
    .then(render)
    .catch((err) => {
      root.innerHTML = `<div class="card empty-state"><span class="empty-ico">${icon('close')}</span><h3>Não foi possível abrir o painel</h3><p>${esc(err.message)}</p></div>`;
    });
})();
