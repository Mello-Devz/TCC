/* =========================================================
   FRIONEX · Carrinho
   ========================================================= */
(function () {
  'use strict';

  const UI = window.FrionexUI;
  const Store = window.FrionexStore;
  const root = document.getElementById('cartRoot');

  const money = UI.money;

  function itemHTML(item) {
    const p = item.produto;
    return `
      <div class="cart-item" data-item="${p.id}">
        <a class="cart-thumb" href="produto.html?id=${p.id}">
          <img src="${p.foto}" alt="${UI.esc(p.nome)}">
        </a>
        <div class="cart-info">
          <span class="cart-brand">${UI.esc(p.marca)}${p.btu ? ` · ${p.btu} BTUs` : ''} · ${UI.esc(p.estado)}</span>
          <h3><a href="produto.html?id=${p.id}">${UI.esc(p.nome)}</a></h3>
          <div class="cart-price">${money(p.preco)}</div>
          <div class="cart-actions">
            <div class="qty">
              <button type="button" data-cart-minus="${p.id}" aria-label="Diminuir quantidade">${UI.icon('minus')}</button>
              <input type="text" inputmode="numeric" value="${item.quantidade}" data-cart-input="${p.id}" aria-label="Quantidade de ${UI.esc(p.nome)}">
              <button type="button" data-cart-plus="${p.id}" aria-label="Aumentar quantidade">${UI.icon('plus')}</button>
            </div>
            <button class="cart-remove" type="button" data-cart-remove="${p.id}">
              ${UI.icon('trash')} Remover
            </button>
          </div>
        </div>
        <div class="cart-total">${money(item.total)}</div>
      </div>`;
  }

  function summaryHTML() {
    const s = Store.Cart.summary();
    const calc = Store.Cupom.calcular(s.subtotal, s.frete);
    const total = Math.max(0, s.subtotal + calc.frete - calc.desconto);
    const totalPix = Math.max(0, s.pix + calc.frete - calc.desconto);
    const faltam = 300 - s.subtotal;

    return `
      <aside class="summary-card">
        <h2>Resumo do pedido</h2>
        <div class="summary-row"><span>Subtotal (${Store.Cart.count()} ${Store.Cart.count() === 1 ? 'item' : 'itens'})</span><strong>${money(s.subtotal)}</strong></div>
        <div class="summary-row">
          <span>Frete</span>
          <strong>${calc.frete === 0 ? 'Grátis' : money(calc.frete)}</strong>
        </div>
        ${calc.desconto > 0 ? `<div class="summary-row discount"><span>Cupom ${UI.esc(calc.cupom.codigo)}</span><strong>- ${money(calc.desconto)}</strong></div>` : ''}
        <div class="summary-total"><span>Total</span><strong>${money(total)}</strong></div>
        <div class="summary-pix">
          <span>${UI.icon('pix')} No PIX (7% OFF)</span>
          <strong>${money(totalPix)}</strong>
        </div>

        <form class="coupon" data-coupon-form>
          <input type="text" name="cupom" placeholder="Cupom de desconto" aria-label="Cupom de desconto" value="${calc.cupom ? UI.esc(calc.cupom.codigo) : ''}" ${calc.cupom ? 'readonly' : ''}>
          ${calc.cupom
            ? '<button class="btn btn-ghost btn-sm" type="button" data-coupon-remove>Remover</button>'
            : '<button class="btn btn-outline btn-sm" type="submit">Aplicar</button>'}
        </form>
        ${calc.cupom ? `<div class="summary-row discount" style="padding-top:2px"><span>${UI.esc(calc.cupom.label)}</span><strong>ativo</strong></div>` : ''}

        ${faltam > 0 && calc.frete > 0 ? `
          <div class="summary-note">${UI.icon('truck')} Faltam <strong style="color:var(--ink-2)">${money(faltam)}</strong> para ganhar frete grátis.</div>` : ''}

        <a class="btn btn-buy btn-block" href="checkout.html">${UI.icon('check')} Finalizar compra</a>
        <a class="btn btn-ghost btn-block" href="index.html">Continuar comprando</a>

        <div class="summary-note">${UI.icon('shield')} Compra protegida: seu pagamento só é liberado após a entrega.</div>
        <div class="summary-note">${UI.icon('card')} Até 8x sem juros no cartão de crédito.</div>
      </aside>`;
  }

  function emptyHTML() {
    return `
      <div class="empty-state" style="margin-top:10px">
        <span class="empty-ico">${UI.icon('cart')}</span>
        <h3>Seu carrinho está vazio</h3>
        <p>Explore peças, equipamentos e ferramentas de climatização e adicione seus favoritos ao carrinho.</p>
        <a class="btn btn-grad" href="index.html">${UI.icon('store')} Ir às compras</a>
      </div>`;
  }

  function render() {
    if (!root) return;
    const s = Store.Cart.summary();

    if (!s.itens.length) {
      root.innerHTML = emptyHTML();
      UI.hydrateIcons(root);
      return;
    }

    root.innerHTML = `
      <div class="cart-layout">
        <div>
          <div class="card cart-list">
            ${s.itens.map(itemHTML).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px">
            <a class="btn btn-ghost" href="index.html">${UI.icon('arrow')} Continuar comprando</a>
            <button class="btn btn-danger-ghost btn-sm" type="button" data-cart-clear>${UI.icon('trash')} Limpar carrinho</button>
          </div>

          <div class="card card-pad" style="margin-top:18px">
            <div class="card-head" style="margin-bottom:10px">
              <div>
                <h2 style="font-size:16px">Frete e prazos</h2>
                <p>Calcule o frete para o seu CEP antes de finalizar.</p>
              </div>
            </div>
            <form class="shipping-box" data-cart-shipping style="max-width:420px">
              <input type="text" inputmode="numeric" maxlength="9" placeholder="Digite seu CEP" aria-label="Calcular frete" data-cep>
              <button class="btn btn-outline btn-sm" type="submit">Calcular</button>
            </form>
            <div class="shipping-result" data-shipping-result></div>
          </div>
        </div>
        ${summaryHTML()}
      </div>`;
    UI.hydrateIcons(root);
  }

  function mostrarFrete(cepDigitado) {
    const result = document.querySelector('[data-shipping-result]');
    if (!result) return;
    const cep = String(cepDigitado).replace(/\D/g, '');
    if (cep.length !== 8) {
      result.innerHTML = '<span style="color:var(--danger)">Informe um CEP válido com 8 dígitos.</span>';
      return;
    }
    const local = cep.startsWith('88');
    result.innerHTML = local
      ? '<strong>Frete grátis</strong> · entrega em 1 a 3 dias úteis para a região de Sombrio/SC.'
      : '<strong>R$ 29,90</strong> · entrega em 3 a 7 dias úteis para todo o Brasil.';
  }

  function bind() {
    document.addEventListener('click', (e) => {
      const minus = e.target.closest('[data-cart-minus]');
      if (minus) {
        const id = Number(minus.dataset.cartMinus);
        const item = Store.Cart.raw().find((i) => Number(i.id_produto) === id);
        if (item) {
          Store.Cart.setQty(id, item.quantidade - 1);
          render();
        }
        return;
      }

      const plus = e.target.closest('[data-cart-plus]');
      if (plus) {
        const id = Number(plus.dataset.cartPlus);
        const item = Store.Cart.raw().find((i) => Number(i.id_produto) === id);
        if (item) {
          Store.Cart.setQty(id, item.quantidade + 1);
          render();
        }
        return;
      }

      const remove = e.target.closest('[data-cart-remove]');
      if (remove) {
        Store.Cart.remove(Number(remove.dataset.cartRemove));
        UI.toast('Item removido do carrinho.', 'info');
        render();
        return;
      }

      if (e.target.closest('[data-cart-clear]')) {
        Store.Cart.clear();
        Store.Cupom.clear();
        UI.toast('Carrinho esvaziado.', 'info');
        render();
        return;
      }

      if (e.target.closest('[data-coupon-remove]')) {
        Store.Cupom.clear();
        UI.toast('Cupom removido.', 'info');
        render();
      }
    });

    document.addEventListener('input', (e) => {
      const input = e.target.closest('[data-cart-input]');
      if (!input) return;
      const id = Number(input.dataset.cartInput);
      const qtd = Math.max(1, Number(input.value) || 1);
      Store.Cart.setQty(id, qtd);
      // Atualiza apenas o total do item e o resumo, mantendo o foco no input.
      const item = Store.Cart.detailed().find((i) => i.produto.id === id);
      const row = input.closest('.cart-item');
      if (row && item) {
        const totalEl = row.querySelector('.cart-total');
        if (totalEl) totalEl.textContent = money(item.total);
      }
      const s = Store.Cart.summary();
      const calc = Store.Cupom.calcular(s.subtotal, s.frete);
      const total = Math.max(0, s.subtotal + calc.frete - calc.desconto);
      const totalPix = Math.max(0, s.pix + calc.frete - calc.desconto);
      const side = document.querySelector('.summary-card');
      if (side) {
        const rows = side.querySelectorAll('.summary-row strong');
        if (rows[0]) rows[0].textContent = money(s.subtotal);
        const totalEl = side.querySelector('.summary-total strong');
        if (totalEl) totalEl.textContent = money(total);
        const pixEl = side.querySelector('.summary-pix strong');
        if (pixEl) pixEl.textContent = money(totalPix);
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target.matches('[data-coupon-form]')) {
        e.preventDefault();
        const input = e.target.querySelector('input[name="cupom"]');
        if (!input || !input.value.trim()) {
          UI.toast('Digite um cupom para aplicar.', 'error');
          return;
        }
        const res = Store.Cupom.apply(input.value);
        if (!res.ok) {
          UI.toast(res.erro, 'error');
          return;
        }
        UI.toast(`Cupom ${res.cupom.codigo} aplicado: ${res.cupom.label}.`);
        render();
        return;
      }

      if (e.target.matches('[data-cart-shipping]')) {
        e.preventDefault();
        const input = e.target.querySelector('[data-cep]');
        mostrarFrete(input ? input.value : '');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    render();
  });
})();
