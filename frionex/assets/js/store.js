/* =========================================================
   FRIONEX · Estado do cliente
   Carrinho, favoritos e sessão persistidos no localStorage.
   ========================================================= */
(function () {
  'use strict';

  const API = window.FrionexAPI;
  const CART_KEY = 'frionex:carrinho';
  const FAV_KEY = 'frionex:favoritos';

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    return value;
  };
  const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

  const Cart = {
    raw() { return read(CART_KEY, []); },

    count() {
      return this.raw().reduce((total, item) => total + Number(item.quantidade || 0), 0);
    },

    add(idProduto, quantidade = 1) {
      const items = this.raw();
      const existente = items.find((i) => Number(i.id_produto) === Number(idProduto));
      if (existente) existente.quantidade += Number(quantidade);
      else items.push({ id_produto: Number(idProduto), quantidade: Number(quantidade) });
      write(CART_KEY, items);
      emit('cart:change', { count: this.count() });
      return items;
    },

    setQty(idProduto, quantidade) {
      let items = this.raw();
      const qtd = Math.max(1, Number(quantidade) || 1);
      items = items.map((i) => Number(i.id_produto) === Number(idProduto) ? { ...i, quantidade: qtd } : i);
      write(CART_KEY, items);
      emit('cart:change', { count: this.count() });
    },

    remove(idProduto) {
      const items = this.raw().filter((i) => Number(i.id_produto) !== Number(idProduto));
      write(CART_KEY, items);
      emit('cart:change', { count: this.count() });
    },

    clear() {
      write(CART_KEY, []);
      emit('cart:change', { count: 0 });
    },

    detailed() {
      const produtos = API.getProdutosSync();
      return this.raw().map((item) => {
        const produto = produtos.find((p) => p.id === Number(item.id_produto));
        if (!produto) return null;
        return {
          ...item,
          produto,
          total: Number((produto.preco * item.quantidade).toFixed(2)),
          total_pix: Number((produto.pix * item.quantidade).toFixed(2))
        };
      }).filter(Boolean);
    },

    summary() {
      const itens = this.detailed();
      const subtotal = itens.reduce((soma, i) => soma + i.total, 0);
      const pix = itens.reduce((soma, i) => soma + i.total_pix, 0);
      const frete = subtotal > 0 && subtotal < 300 ? 29.90 : 0;
      return {
        itens,
        subtotal: Number(subtotal.toFixed(2)),
        pix: Number(pix.toFixed(2)),
        economia: Number((subtotal - pix).toFixed(2)),
        frete,
        total: Number((subtotal + frete).toFixed(2))
      };
    }
  };

  const Favoritos = {
    raw() { return read(FAV_KEY, []); },
    has(id) { return this.raw().some((x) => Number(x) === Number(id)); },
    toggle(id) {
      const atual = this.raw();
      const existe = atual.some((x) => Number(x) === Number(id));
      const lista = existe ? atual.filter((x) => Number(x) !== Number(id)) : atual.concat(Number(id));
      write(FAV_KEY, lista);
      emit('favoritos:change', { lista });
      return !existe;
    },
    count() { return this.raw().length; }
  };

  const Auth = {
    session() { return API.sessao(); },
    isLogged() { return !!API.sessao(); },
    set(session) { write('frionex:sessao', session); emit('auth:change', session); },
    logout() {
      API.logout();
      emit('auth:change', null);
    },
    require(next) {
      const session = this.session();
      if (!session) {
        const destino = encodeURIComponent(next || (location.pathname.split('/').pop() + location.search));
        location.href = `login.html?next=${destino}`;
        return null;
      }
      return session;
    },
    firstName() {
      const s = this.session();
      return s ? String(s.nome || '').split(' ')[0] : '';
    }
  };

  /* ---------------- cupons ---------------- */
  const CUPONS = {
    FRIONEX10: { codigo: 'FRIONEX10', tipo: 'percent', valor: 10, label: '10% de desconto' },
    FRETEGRATIS: { codigo: 'FRETEGRATIS', tipo: 'frete', valor: 0, label: 'Frete grátis' },
    BEMVINDO15: { codigo: 'BEMVINDO15', tipo: 'fixo', valor: 15, label: 'R$ 15 de desconto' }
  };

  const Cupom = {
    get() { return read('frionex:cupom', null); },

    apply(codigo) {
      const chave = String(codigo || '').trim().toUpperCase();
      const cupom = CUPONS[chave];
      if (!cupom) return { ok: false, erro: 'Cupom inválido ou expirado.' };
      write('frionex:cupom', cupom);
      return { ok: true, cupom };
    },

    clear() {
      try { localStorage.removeItem('frionex:cupom'); } catch (e) { /* ignore */ }
      return true;
    },

    calcular(subtotal, frete) {
      const cupom = this.get();
      let desconto = 0;
      let freteFinal = Number(frete) || 0;

      if (cupom) {
        if (cupom.tipo === 'percent') desconto = subtotal * (cupom.valor / 100);
        else if (cupom.tipo === 'fixo') desconto = Math.min(cupom.valor, subtotal);
        else if (cupom.tipo === 'frete') freteFinal = 0;
      }

      return {
        cupom,
        desconto: Number(desconto.toFixed(2)),
        frete: Number(freteFinal.toFixed(2))
      };
    }
  };

  window.FrionexStore = { Cart, Favoritos, Auth, Cupom };
})();
