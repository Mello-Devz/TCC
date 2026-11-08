/* =========================================================
   FRIONEX · Checkout
   ========================================================= */
(function () {
  'use strict';

  const API = window.FrionexAPI;
  const UI = window.FrionexUI;
  const Store = window.FrionexStore;

  const session = Store.Auth.require('checkout.html');
  if (!session) return;

  const root = document.getElementById('checkoutRoot');

  const estado = {
    entrega: 'envio',
    pagamento: 'PIX',
    enderecoId: null
  };

  let enderecos = [];

  const money = UI.money;

  const entregaLabel = {
    envio: 'Envio padrão',
    retirada: 'Retirada na loja'
  };

  /* ---------------- cálculos ---------------- */
  function calcular() {
    const s = Store.Cart.summary();
    const freteBase = estado.entrega === 'retirada' ? 0 : s.frete;
    const calc = Store.Cupom.calcular(s.subtotal, freteBase);
    const totalCartao = Math.max(0, s.subtotal + calc.frete - calc.desconto);
    const totalPix = Math.max(0, s.pix + calc.frete - calc.desconto);
    return {
      itens: s.itens,
      subtotal: s.subtotal,
      frete: calc.frete,
      descontoCupom: calc.desconto,
      cupom: calc.cupom,
      economiaPix: s.economia,
      totalCartao,
      totalPix,
      total: estado.pagamento === 'PIX' ? totalPix : totalCartao
    };
  }

  /* ---------------- html ---------------- */
  function addressOptionsHTML() {
    if (!enderecos.length) {
      return `
        <div class="empty-state" style="padding:28px 18px">
          <span class="empty-ico">${UI.icon('location')}</span>
          <h3>Nenhum endereço cadastrado</h3>
          <p>Cadastre um endereço de entrega para continuar com a compra.</p>
          <button class="btn btn-grad" type="button" data-add-checkout-address>${UI.icon('plus')} Adicionar endereço</button>
        </div>`;
    }
    return enderecos.map((e, i) => `
      <label class="option-card ${i === 0 ? 'is-selected' : ''}">
        <input type="radio" name="endereco" value="${e.id}" ${i === 0 ? 'checked' : ''}>
        <span>
          <strong>${UI.esc(e.rua)}, ${UI.esc(e.numero)}</strong>
          <span>${UI.esc(e.bairro)} · ${UI.esc(e.cidade)}/${UI.esc(e.uf)} · CEP ${UI.esc(String(e.cep || '').replace(/(\d{5})(\d{3})/, '$1-$2'))}</span>
        </span>
        ${i === 0 ? '<span class="chip option-tag">Principal</span>' : ''}
      </label>`).join('') + `
      <button class="btn btn-outline btn-sm" type="button" data-add-checkout-address style="margin-top:12px">${UI.icon('plus')} Adicionar outro endereço</button>`;
  }

  function reviewHTML(itens) {
    return itens.map((item) => `
      <div class="order-item">
        <img src="${item.produto.foto}" alt="">
        <div class="order-item-info">
          <strong>${UI.esc(item.produto.nome)}</strong>
          <span>Qtd. ${item.quantidade} · ${money(item.produto.preco)} cada</span>
        </div>
        <span class="order-item-price">${money(item.total)}</span>
      </div>`).join('');
  }

  function summaryHTML() {
    const c = calcular();
    return `
      <h2>Resumo do pedido</h2>
      <div class="summary-row"><span>Subtotal (${Store.Cart.count()} ${Store.Cart.count() === 1 ? 'item' : 'itens'})</span><strong>${money(c.subtotal)}</strong></div>
      <div class="summary-row"><span>${entregaLabel[estado.entrega]}</span><strong>${c.frete === 0 ? 'Grátis' : money(c.frete)}</strong></div>
      ${c.descontoCupom > 0 ? `<div class="summary-row discount"><span>Cupom ${UI.esc(c.cupom.codigo)}</span><strong>- ${money(c.descontoCupom)}</strong></div>` : ''}
      ${estado.pagamento === 'PIX' ? `<div class="summary-row discount"><span>Desconto no PIX (7%)</span><strong>- ${money(c.economiaPix)}</strong></div>` : ''}
      <div class="summary-total"><span>Total</span><strong>${money(c.total)}</strong></div>
      ${estado.pagamento === 'Cartão de crédito' ? `
        <div class="summary-row" style="padding-top:4px"><span>Parcelamento</span><strong>8x de ${money(c.total / 8)} sem juros</strong></div>` : ''}
      ${estado.pagamento === 'PIX' ? `
        <div class="summary-pix"><span>${UI.icon('pix')} À vista no PIX</span><strong>${money(c.totalPix)}</strong></div>` : ''}
      <button class="btn btn-buy btn-block" type="button" data-place-order>
        ${UI.icon('shield')} Confirmar pedido
      </button>
      <a class="btn btn-ghost btn-block" href="carrinho.html">Voltar ao carrinho</a>
      <div class="summary-note">${UI.icon('shield')} Ao confirmar, você aceita os termos de compra da Frionex. O pagamento fica retido até a entrega.</div>
      <div class="summary-note">${UI.icon('lock')} Ambiente de protótipo: nenhum pagamento real será processado.</div>`;
  }

  function layoutHTML() {
    const c = calcular();
    return `
      <div class="checkout-layout">
        <div>
          <section class="card card-pad checkout-section">
            <div class="card-head">
              <div>
                <h2>1. Endereço de entrega</h2>
                <p>Escolha onde você quer receber o pedido.</p>
              </div>
              <a class="btn btn-ghost btn-sm" href="perfil.html#enderecos">Gerenciar</a>
            </div>
            <div id="addressOptions">${addressOptionsHTML()}</div>
          </section>

          <section class="card card-pad checkout-section">
            <div class="card-head">
              <div>
                <h2>2. Forma de entrega</h2>
                <p>Enviamos para todo o Brasil ou você pode retirar na loja.</p>
              </div>
            </div>
            <label class="option-card is-selected">
              <input type="radio" name="entrega" value="envio" checked>
              <span>
                <strong>Envio padrão</strong>
                <span>${c.frete === 0 ? 'Frete grátis' : 'Frete calculado no resumo'} · 3 a 7 dias úteis</span>
              </span>
              <span class="chip option-tag">${c.frete === 0 ? 'Grátis' : money(Store.Cart.summary().frete)}</span>
            </label>
            <label class="option-card">
              <input type="radio" name="entrega" value="retirada">
              <span>
                <strong>Retirar na loja</strong>
                <span>Vendo Ar-Condicionado · Rua das Palmeiras, 245 · Sombrio/SC</span>
              </span>
              <span class="chip option-tag">Grátis</span>
            </label>
          </section>

          <section class="card card-pad checkout-section">
            <div class="card-head">
              <div>
                <h2>3. Forma de pagamento</h2>
                <p>Escolha como quer pagar. O PIX tem 7% de desconto.</p>
              </div>
            </div>
            <label class="option-card is-selected">
              <input type="radio" name="pagamento" value="PIX" checked>
              <span><strong>PIX</strong><span>${money(c.totalPix)} à vista · aprovação imediata</span></span>
              <span class="chip option-tag">-7%</span>
            </label>
            <label class="option-card">
              <input type="radio" name="pagamento" value="Cartão de crédito">
              <span><strong>Cartão de crédito</strong><span>Até 8x sem juros · ${money(c.totalCartao / 8)} por parcela</span></span>
              <span class="option-tag">${UI.icon('card')}</span>
            </label>
            <label class="option-card">
              <input type="radio" name="pagamento" value="Boleto">
              <span><strong>Boleto bancário</strong><span>Vencimento em 3 dias úteis · aprovação em até 2 dias</span></span>
              <span class="option-tag">${UI.icon('boleto')}</span>
            </label>

            <div id="cardFields" hidden style="margin-top:14px">
              <div class="form-grid">
                <div class="field full">
                  <label for="coNome">Nome impresso no cartão</label>
                  <input id="coNome" type="text" placeholder="SR BIGODES" autocomplete="cc-name">
                </div>
                <div class="field full">
                  <label for="coNumero">Número do cartão</label>
                  <input id="coNumero" type="text" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" autocomplete="cc-number">
                </div>
                <div class="field">
                  <label for="coValidade">Validade</label>
                  <input id="coValidade" type="text" maxlength="5" placeholder="MM/AA" autocomplete="cc-exp">
                </div>
                <div class="field">
                  <label for="coCvv">CVV</label>
                  <input id="coCvv" type="text" inputmode="numeric" maxlength="4" placeholder="123" autocomplete="cc-csc">
                </div>
              </div>
            </div>

            <div id="boletoNote" hidden class="summary-note" style="margin-top:14px">
              ${UI.icon('boleto')} O boleto será gerado após a confirmação do pedido e enviado para ${UI.esc(session.email)}.
            </div>
          </section>

          <section class="card card-pad checkout-section" style="margin-bottom:0">
            <div class="card-head">
              <div>
                <h2>4. Revise seu pedido</h2>
                <p>${Store.Cart.count()} ${Store.Cart.count() === 1 ? 'item' : 'itens'} no carrinho.</p>
              </div>
              <a class="btn btn-ghost btn-sm" href="carrinho.html">Editar carrinho</a>
            </div>
            <div class="order-body" style="padding:0">${reviewHTML(c.itens)}</div>
          </section>
        </div>

        <aside class="summary-card" id="checkoutSummary">${summaryHTML()}</aside>
      </div>`;
  }

  /* ---------------- atualizações ---------------- */
  function updateSummary() {
    const side = document.getElementById('checkoutSummary');
    if (side) {
      side.innerHTML = summaryHTML();
      UI.hydrateIcons(side);
    }
    const cardFields = document.getElementById('cardFields');
    if (cardFields) cardFields.hidden = estado.pagamento !== 'Cartão de crédito';
    const boletoNote = document.getElementById('boletoNote');
    if (boletoNote) boletoNote.hidden = estado.pagamento !== 'Boleto';

    document.querySelectorAll('.option-card').forEach((card) => {
      const input = card.querySelector('input');
      if (input && (input.name === 'entrega' || input.name === 'pagamento')) {
        card.classList.toggle('is-selected', input.checked);
      }
    });
  }

  /* ---------------- novo endereço ---------------- */
  function abrirFormEndereco() {
    const modal = UI.modal('Adicionar endereço de entrega', `
      <form data-checkout-address-form class="form-grid" autocomplete="off">
        <div class="field">
          <label for="coCep">CEP</label>
          <input id="coCep" name="cep" inputmode="numeric" maxlength="9" placeholder="00000-000" required>
        </div>
        <div class="field">
          <label for="coNumeroEnd">Número</label>
          <input id="coNumeroEnd" name="numero" type="text" placeholder="245" required>
        </div>
        <div class="field full">
          <label for="coRua">Rua / Avenida</label>
          <input id="coRua" name="rua" type="text" placeholder="Rua das Palmeiras" required>
        </div>
        <div class="field">
          <label for="coBairro">Bairro</label>
          <input id="coBairro" name="bairro" type="text" placeholder="Centro" required>
        </div>
        <div class="field">
          <label for="coCidade">Cidade</label>
          <input id="coCidade" name="cidade" type="text" value="Sombrio" required>
        </div>
        <div class="field">
          <label for="coUf">UF</label>
          <input id="coUf" name="uf" type="text" maxlength="2" value="SC" required>
        </div>
        <div class="form-actions" style="grid-column:1/-1">
          <button class="btn btn-ghost" type="button" data-modal-close>Cancelar</button>
          <button class="btn btn-grad" type="submit">${UI.icon('check')} Salvar endereço</button>
        </div>
      </form>`);
    modal.querySelector('input[name="cep"]')?.focus();
  }

  /* ---------------- confirmação ---------------- */
  async function confirmarPedido(btn) {
    if (!Store.Cart.count()) {
      UI.toast('Seu carrinho está vazio.', 'error');
      return;
    }
    if (estado.entrega === 'envio' && !estado.enderecoId) {
      UI.toast('Escolha ou cadastre um endereço de entrega.', 'error');
      return;
    }
    if (estado.pagamento === 'Cartão de crédito') {
      const num = document.getElementById('coNumero');
      if (num && String(num.value).replace(/\D/g, '').length < 13) {
        UI.toast('Informe um número de cartão válido (protótipo).', 'error');
        num.focus();
        return;
      }
    }

    const itens = Store.Cart.detailed().map((i) => ({
      id_produto: i.produto.id,
      quantidade: i.quantidade,
      preco_unitario: i.produto.preco
    }));

    const c = calcular();
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Processando…';
    }

    try {
      const pedido = await API.criarPedido({
        id_comprador: session.id,
        itens,
        pagamento: estado.pagamento,
        endereco_id: estado.entrega === 'retirada' ? null : estado.enderecoId,
        frete: c.frete,
        desconto: Number((c.subtotal + c.frete - c.total).toFixed(2)),
        total: c.total
      });
      Store.Cart.clear();
      Store.Cupom.clear();
      renderSucesso(pedido, c);
    } catch (err) {
      UI.toast(err.message, 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `${UI.icon('shield')} Confirmar pedido`;
      }
    }
  }

  function renderSucesso(pedido, c) {
    const steps = document.querySelector('.steps');
    if (steps) {
      steps.innerHTML = `
        <span class="step is-done"><span class="step-index">${UI.icon('check')}</span> Carrinho</span>
        <span class="step-line"></span>
        <span class="step is-done"><span class="step-index">${UI.icon('check')}</span> Entrega e pagamento</span>
        <span class="step-line"></span>
        <span class="step is-active"><span class="step-index">3</span> Confirmação</span>`;
    }

    root.innerHTML = `
      <div class="card card-pad" style="max-width:680px;margin:10px auto;text-align:center">
        <div class="empty-ico" style="margin:0 auto 14px;background:var(--teal-soft);color:#007a5c">${UI.icon('check')}</div>
        <h1 class="page-title">Pedido confirmado!</h1>
        <p class="text-muted" style="margin-top:6px">Obrigado por comprar na Frionex. Enviamos os detalhes para <strong>${UI.esc(session.email)}</strong>.</p>

        <div style="max-width:420px;margin:24px auto 0;text-align:left">
          <div class="summary-row"><span>Pedido</span><strong>#${pedido.id}</strong></div>
          <div class="summary-row"><span>Pagamento</span><strong>${UI.esc(pedido.pagamento)}</strong></div>
          <div class="summary-row"><span>Entrega</span><strong>${entregaLabel[estado.entrega]}</strong></div>
          <div class="summary-row"><span>Status</span><strong>${UI.esc(pedido.status)}</strong></div>
          <div class="summary-total"><span>Total</span><strong>${money(c.total)}</strong></div>
        </div>

        ${estado.pagamento === 'PIX' ? `
          <div class="summary-pix" style="max-width:420px;margin:16px auto 0;text-align:left">
            <span>${UI.icon('pix')} Pague via PIX para liberar o envio</span>
            <strong>${money(c.totalPix)}</strong>
          </div>` : ''}

        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:26px">
          <a class="btn btn-grad" href="pedidos.html">${UI.icon('package')} Ver meus pedidos</a>
          <a class="btn btn-outline" href="index.html">Continuar comprando</a>
        </div>
      </div>`;
    UI.hydrateIcons(root);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    UI.toast('Pedido criado com sucesso!');
  }

  /* ---------------- eventos ---------------- */
  function bind() {
    document.addEventListener('change', (e) => {
      if (e.target.name === 'endereco') {
        estado.enderecoId = Number(e.target.value);
        updateSummary();
        return;
      }
      if (e.target.name === 'entrega') {
        estado.entrega = e.target.value;
        updateSummary();
        return;
      }
      if (e.target.name === 'pagamento') {
        estado.pagamento = e.target.value;
        updateSummary();
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.id === 'coNumero') {
        const d = e.target.value.replace(/\D/g, '').slice(0, 16);
        e.target.value = d.replace(/(\d{4})(?=\d)/g, '$1 ');
      }
      if (e.target.id === 'coValidade') {
        const d = e.target.value.replace(/\D/g, '').slice(0, 4);
        e.target.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
      }
      if (e.target.id === 'coCvv') {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
      }
      if (e.target.name === 'cep') {
        const d = e.target.value.replace(/\D/g, '').slice(0, 8);
        e.target.value = d.replace(/^(\d{5})(\d)/, '$1-$2');
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-add-checkout-address]')) {
        abrirFormEndereco();
        return;
      }
      if (e.target.closest('[data-place-order]')) {
        confirmarPedido(e.target.closest('[data-place-order]'));
      }
    });

    document.addEventListener('submit', async (e) => {
      if (!e.target.matches('[data-checkout-address-form]')) return;
      e.preventDefault();
      const form = e.target;
      const dados = Object.fromEntries(new FormData(form).entries());
      dados.cep = String(dados.cep).replace(/\D/g, '');
      dados.usuario_id = Number(session.id);
      if (dados.cep.length !== 8) {
        UI.toast('Informe um CEP com 8 dígitos.', 'error');
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        const novo = await API.salvarEndereco(dados);
        enderecos = await API.enderecos(session.id);
        estado.enderecoId = novo.id;
        const wrap = document.getElementById('addressOptions');
        if (wrap) {
          wrap.innerHTML = addressOptionsHTML();
          wrap.querySelectorAll('input[name="endereco"]').forEach((input) => {
            input.checked = Number(input.value) === Number(novo.id);
            input.closest('.option-card')?.classList.toggle('is-selected', input.checked);
          });
          UI.hydrateIcons(wrap);
        }
        UI.closeModal();
        UI.toast('Endereço salvo e selecionado.');
        updateSummary();
      } catch (err) {
        UI.toast(err.message, 'error');
        if (btn) btn.disabled = false;
      }
    });
  }

  /* ---------------- carga ---------------- */
  async function carregar() {
    const summary = Store.Cart.summary();
    if (!summary.itens.length) {
      root.innerHTML = `
        <div class="empty-state">
          <span class="empty-ico">${UI.icon('cart')}</span>
          <h3>Seu carrinho está vazio</h3>
          <p>Adicione produtos ao carrinho antes de finalizar a compra.</p>
          <a class="btn btn-grad" href="index.html">Explorar catálogo</a>
        </div>`;
      UI.hydrateIcons(root);
      return;
    }

    enderecos = await API.enderecos(session.id);
    estado.enderecoId = enderecos.length ? Number(enderecos[0].id) : null;

    root.innerHTML = layoutHTML();
    UI.hydrateIcons(root);
    updateSummary();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    bind();
    try {
      await carregar();
    } catch (err) {
      root.innerHTML = `
        <div class="empty-state">
          <span class="empty-ico">${UI.icon('card')}</span>
          <h3>Não foi possível abrir o checkout</h3>
          <p>${UI.esc(err.message)}</p>
          <a class="btn btn-grad" href="carrinho.html">Voltar ao carrinho</a>
        </div>`;
      UI.hydrateIcons(root);
    }
  });
})();
