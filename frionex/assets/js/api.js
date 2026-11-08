/* =========================================================
   FRIONEX · Camada de acesso a dados (API simulada)
   ---------------------------------------------------------
   Todas as funções são assíncronas de propósito: quando o
   banco de dados entrar, basta trocar o corpo de cada método
   por uma chamada fetch() para o backend, mantendo o mesmo
   contrato usado pelas telas.
   ========================================================= */
(function () {
  'use strict';

  const D = window.FrionexData;
  const KEYS = {
    usuarios: 'frionex:usuarios',
    enderecos: 'frionex:enderecos',
    pedidos: 'frionex:pedidos',
    pedidosStatus: 'frionex:pedidos-status',
    mensagens: 'frionex:mensagens',
    avaliacoes: 'frionex:avaliacoes',
    cartoes: 'frionex:cartoes',
    sessao: 'frionex:sessao',
    carrinho: 'frionex:carrinho',
    favoritos: 'frionex:favoritos',
    prefs: 'frionex:prefs',
    produtos: 'frionex:produtos',
    produtosRemovidos: 'frionex:produtos-removidos',
    vendedores: 'frionex:vendedores'
  };

  const delay = (ms = 140) => new Promise((r) => setTimeout(r, ms));

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* modo privado */ }
    return value;
  }
  function nextId(list) {
    return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
  }
  function normalize(text) {
    return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  /* ---------- migração de dados locais ----------
     Quando os dados-base mudam (ex.: nomes dos usuários demo), limpa
     overrides antigos salvos no navegador e atualiza a sessão. */
  const DATA_VERSION = '3';
  (function migrar() {
    try {
      if (localStorage.getItem('frionex:versao') === DATA_VERSION) return;
      const baseIds = new Set(D.usuarios.map((u) => u.id));
      const extras = read(KEYS.usuarios, []).map((e) => {
        if (!baseIds.has(e.id)) return e;
        const { nome, nome_usuario, ...resto } = e;
        return resto;
      });
      write(KEYS.usuarios, extras);
      const sessao = read(KEYS.sessao, null);
      if (sessao && baseIds.has(sessao.id)) {
        const base = D.usuarios.find((u) => u.id === sessao.id);
        write(KEYS.sessao, { ...sessao, nome: base.nome, nome_usuario: base.nome_usuario });
      }
      localStorage.setItem('frionex:versao', DATA_VERSION);
    } catch (e) { /* ignore */ }
  })();

  /* ---------- usuarios ---------- */
  function getUsuarios() {
    const extras = read(KEYS.usuarios, []);
    const base = D.usuarios.map((u) => {
      const override = extras.find((e) => e.id === u.id);
      return override ? { ...u, ...override } : u;
    });
    const baseIds = new Set(D.usuarios.map((u) => u.id));
    return base.concat(extras.filter((e) => !baseIds.has(e.id)));
  }

  function publicUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      nome: user.nome,
      nome_usuario: user.nome_usuario,
      email: user.email,
      telefone: user.telefone,
      cpf: user.cpf,
      data_nasc: user.data_nasc,
      foto: user.foto,
      tipo: user.tipo || 'comprador',
      verificado: !!user.verificado,
      endereco_id: user.endereco_id,
      criado_em: user.criado_em,
      historico: user.historico || ''
    };
  }

  function buildSession(user) {
    const session = publicUser(user);
    write(KEYS.sessao, session);
    return session;
  }

  /* ---------- categorias ---------- */
  function getCategorias() {
    return D.categorias.map((c) => ({
      ...c,
      subcategorias: D.subcategorias.filter((s) => s.id_categoria === c.id)
    }));
  }

  /* ---------- pedidos (com status atualizado pelo vendedor) ---------- */
  function getPedidos() {
    const overrides = read(KEYS.pedidosStatus, {});
    return D.pedidos.concat(read(KEYS.pedidos, [])).map((p) => {
      const o = overrides[p.id];
      return o ? { ...p, ...o } : p;
    });
  }

  /* ---------- conversas (chat) ---------- */
  function getConversas() {
    const salvas = read(KEYS.mensagens, null);
    if (salvas) return salvas;
    // conversa de exemplo entre o comprador demo e a loja do Maxwell
    return [{
      id: 1, id_vendedor: 1, id_comprador: 1, id_produto: 2, id_pedido: null,
      mensagens: [
        { de: 'comprador', texto: 'Boa tarde! O Samsung WindFree 12000 vem com o kit de instalação?', data: '2026-11-05T14:12:00', lida: true },
        { de: 'vendedor', texto: 'Boa tarde, Miguel! Não vem, mas temos o kit de 3 metros aqui na loja. Se comprar os dois, entregamos juntos em Sombrio sem frete.', data: '2026-11-05T14:20:00', lida: false }
      ]
    }];
  }

  /* ---------- vendedores ---------- */
  function getVendedores() {
    const extras = read(KEYS.vendedores, []);
    const baseIds = new Set(D.vendedores.map((v) => v.id));
    return D.vendedores
      .map((v) => ({ ...v, ...(extras.find((e) => e.id === v.id) || {}) }))
      .concat(extras.filter((e) => !baseIds.has(e.id)));
  }

  /* ---------- produtos ----------
     Produtos-base vêm de data.js; os anunciados/editados pelo vendedor
     ficam no localStorage (frionex:produtos) e os excluídos em
     frionex:produtos-removidos. */
  function getProdutos() {
    const extras = read(KEYS.produtos, []);
    const removidos = new Set(read(KEYS.produtosRemovidos, []).map(Number));
    const baseIds = new Set(D.produtos.map((p) => p.id));
    return D.produtos
      .map((p) => ({ ...p, ...(extras.find((e) => e.id === p.id) || {}) }))
      .concat(extras.filter((e) => !baseIds.has(e.id)))
      .filter((p) => !removidos.has(Number(p.id)));
  }

  function enrichProduto(p) {
    const vendedor = getVendedores().find((v) => v.id === p.id_vendedor);
    const categoria = D.categorias.find((c) => c.id === p.id_categoria);
    const subcategoria = D.subcategorias.find((s) => s.id === p.id_subcategoria);
    return {
      ...p,
      pix: Number((p.preco * 0.93).toFixed(2)),
      parcelas: 8,
      parcela_valor: Number((p.preco / 8).toFixed(2)),
      vendedor,
      categoria,
      subcategoria
    };
  }

  function filtrarProdutos(filtros = {}) {
    let lista = getProdutos();

    if (filtros.categoria) {
      const cat = D.categorias.find((c) => c.slug === filtros.categoria);
      if (cat) lista = lista.filter((p) => p.id_categoria === cat.id);
    }
    if (filtros.subcategoria) {
      lista = lista.filter((p) => p.id_subcategoria === Number(filtros.subcategoria));
    }
    if (filtros.subcategorias && filtros.subcategorias.length) {
      lista = lista.filter((p) => filtros.subcategorias.map(Number).includes(Number(p.id_subcategoria)));
    }
    if (filtros.q) {
      const termo = normalize(filtros.q);
      lista = lista.filter((p) =>
        normalize(p.nome + ' ' + p.descricao + ' ' + p.marca + ' ' + p.tecnologia).includes(termo)
      );
    }
    if (filtros.marcas && filtros.marcas.length) {
      lista = lista.filter((p) => filtros.marcas.map(normalize).includes(normalize(p.marca)));
    }
    if (filtros.btus && filtros.btus.length) {
      lista = lista.filter((p) => filtros.btus.map(Number).includes(Number(p.btu)));
    }
    if (filtros.tecnologias && filtros.tecnologias.length) {
      lista = lista.filter((p) => filtros.tecnologias.map(normalize).includes(normalize(p.tecnologia)));
    }
    if (filtros.ciclos && filtros.ciclos.length) {
      lista = lista.filter((p) => filtros.ciclos.map(normalize).includes(normalize(p.ciclo)));
    }
    if (filtros.estados && filtros.estados.length) {
      lista = lista.filter((p) => filtros.estados.map(normalize).includes(normalize(p.estado)));
    }
    if (filtros.precoMin != null) lista = lista.filter((p) => p.preco >= Number(filtros.precoMin));
    if (filtros.precoMax != null) lista = lista.filter((p) => p.preco <= Number(filtros.precoMax));
    if (filtros.oferta) lista = lista.filter((p) => p.destaque || p.preco_antigo > p.preco);

    const ordenacao = filtros.ordenacao || 'relevancia';
    const sorters = {
      relevancia: (a, b) => (b.destaque - a.destaque) || (b.vendidos - a.vendidos),
      'menor-preco': (a, b) => a.preco - b.preco,
      'maior-preco': (a, b) => b.preco - a.preco,
      recentes: (a, b) => new Date(b.criado_em) - new Date(a.criado_em),
      avaliacao: (a, b) => b.nota - a.nota
    };
    lista.sort(sorters[ordenacao] || sorters.relevancia);
    return lista.map(enrichProduto);
  }

  /**
   * No modelo lógico o pedido/avaliação aponta para `comprador.id`.
   * A sessão do protótipo guarda `usuario.id`, então esta função faz a ponte.
   * Quando existir banco de dados, essa resolução passa a ser feita no backend.
   */
  function resolveCompradorId(idUsuario) {
    const comprador = D.compradores.find((c) => Number(c.id_usuario) === Number(idUsuario));
    return comprador ? comprador.id : Number(idUsuario);
  }

  function getAvaliacoes(idProduto) {
    const extras = read(KEYS.avaliacoes, []);
    return D.avaliacoes
      .concat(extras)
      .filter((a) => Number(a.id_produto) === Number(idProduto))
      .map((a) => {
        const comprador = D.compradores.find((c) => c.id === a.id_comprador);
        const usuario = comprador
          ? D.usuarios.find((u) => u.id === comprador.id_usuario)
          : D.usuarios.find((u) => u.id === a.id_comprador);
        return { ...a, autor: usuario ? usuario.nome : 'Comprador Frionex' };
      })
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  /* ---------- API pública ---------- */
  const api = {
    KEYS,

    /* -------- catálogo -------- */
    async categorias() {
      await delay();
      return getCategorias();
    },

    async produtos(filtros = {}) {
      await delay();
      return filtrarProdutos(filtros);
    },

    async produto(id) {
      await delay();
      const p = getProdutos().find((x) => Number(x.id) === Number(id));
      if (!p) throw new Error('Produto não encontrado');
      const produto = enrichProduto(p);
      return {
        ...produto,
        avaliacoes_detalhe: getAvaliacoes(p.id)
      };
    },

    async vendedor(id) {
      await delay();
      const v = getVendedores().find((x) => Number(x.id) === Number(id));
      if (!v) throw new Error('Vendedor não encontrado');
      const usuario = D.usuarios.find((u) => u.id === v.id_usuario);
      const produtos = getProdutos().filter((p) => p.id_vendedor === v.id).map(enrichProduto);
      return { ...v, usuario, produtos };
    },

    /* -------- área do vendedor -------- */
    async minhaLoja(idUsuario) {
      await delay();
      const usuario = getUsuarios().find((u) => Number(u.id) === Number(idUsuario));
      if (!usuario || usuario.tipo !== 'vendedor') throw new Error('Esta área é exclusiva para contas de vendedor.');
      let loja = getVendedores().find((v) => Number(v.id_usuario) === Number(idUsuario));
      if (!loja) {
        const extras = read(KEYS.vendedores, []);
        loja = {
          id: nextId(getVendedores()),
          id_usuario: usuario.id,
          nome_loja: `Loja ${String(usuario.nome).split(' ')[0]}`,
          descricao: 'Peças e equipamentos de climatização.',
          foto: 'assets/img/avatar-loja.svg',
          verificado: false,
          criado_em: new Date().toISOString().slice(0, 10),
          ultimo_login: 'agora', taxa_resposta: 100, avaliacoes: 0, produtos: 0,
          localizacao: 'Sombrio · SC', cidade: 'sombrio'
        };
        extras.push(loja);
        write(KEYS.vendedores, extras);
      }
      const produtos = getProdutos().filter((p) => p.id_vendedor === loja.id).map(enrichProduto);
      return { ...loja, usuario: publicUser(usuario), produtos };
    },

    async salvarLoja(idUsuario, dados) {
      await delay(200);
      const loja = await api.minhaLoja(idUsuario);
      const extras = read(KEYS.vendedores, []);
      const R = window.FrionexRegiao;
      const cidade = dados.cidade && R ? R.cidadePorId(dados.cidade) : null;
      const campos = {
        nome_loja: dados.nome_loja,
        descricao: dados.descricao,
        cidade: cidade ? cidade.id : loja.cidade,
        localizacao: cidade ? `${cidade.nome} · ${cidade.uf}` : loja.localizacao
      };
      const idx = extras.findIndex((v) => v.id === loja.id);
      if (idx >= 0) extras[idx] = { ...extras[idx], ...campos };
      else extras.push({ id: loja.id, ...campos });
      write(KEYS.vendedores, extras);
      return { ...loja, ...campos };
    },

    async salvarProduto(idUsuario, dados) {
      await delay(260);
      const loja = await api.minhaLoja(idUsuario);
      const nome = String(dados.nome || '').trim();
      const preco = Number(dados.preco);
      const precoAntigo = dados.preco_antigo ? Number(dados.preco_antigo) : null;
      const estoque = Math.max(0, Math.floor(Number(dados.estoque) || 0));
      if (nome.length < 5) throw new Error('Informe um nome com pelo menos 5 caracteres.');
      if (!(preco > 0)) throw new Error('Informe um preço válido.');
      if (precoAntigo != null && !(precoAntigo > preco)) throw new Error('O preço "de" precisa ser maior que o preço de venda.');

      const extras = read(KEYS.produtos, []);
      const todos = getProdutos();
      const atual = dados.id ? todos.find((p) => Number(p.id) === Number(dados.id)) : null;
      if (atual && atual.id_vendedor !== loja.id) throw new Error('Você só pode editar os seus próprios anúncios.');

      const campos = {
        nome,
        descricao: String(dados.descricao || '').trim(),
        preco,
        preco_antigo: precoAntigo,
        estado: dados.estado || 'Novo',
        marca: String(dados.marca || '').trim() || 'Sem marca',
        btu: dados.btu ? Number(dados.btu) : null,
        tecnologia: String(dados.tecnologia || '').trim() || '-',
        ciclo: dados.ciclo || '-',
        id_categoria: Number(dados.id_categoria),
        id_subcategoria: Number(dados.id_subcategoria) || null,
        estoque,
        garantia: dados.garantia || '3 meses',
        foto: dados.foto || (atual && atual.foto) || 'assets/img/produtos/sem-foto.svg'
      };
      campos.fotos = atual && atual.foto === campos.foto && atual.fotos ? atual.fotos : [campos.foto];

      let salvo;
      if (atual) {
        salvo = { ...atual, ...campos };
        const idx = extras.findIndex((e) => e.id === atual.id);
        if (idx >= 0) extras[idx] = { ...extras[idx], ...campos, fotos: campos.fotos };
        else extras.push({ id: atual.id, ...campos });
      } else {
        salvo = {
          id: Math.max(100, nextId(todos.concat(extras))),
          ...campos,
          id_vendedor: loja.id,
          destaque: false, avaliacoes: 0, nota: 0, vendidos: 0,
          criado_em: new Date().toISOString().slice(0, 10)
        };
        extras.push(salvo);
      }
      write(KEYS.produtos, extras);
      return enrichProduto(salvo);
    },

    async removerProduto(idUsuario, idProduto) {
      await delay(200);
      const loja = await api.minhaLoja(idUsuario);
      const produto = getProdutos().find((p) => Number(p.id) === Number(idProduto));
      if (!produto || produto.id_vendedor !== loja.id) throw new Error('Anúncio não encontrado.');
      const removidos = read(KEYS.produtosRemovidos, []);
      if (!removidos.includes(Number(idProduto))) removidos.push(Number(idProduto));
      write(KEYS.produtosRemovidos, removidos);
      return true;
    },

    /* -------- vendas recebidas pelo vendedor -------- */
    async vendas(idUsuario) {
      await delay();
      const loja = await api.minhaLoja(idUsuario);
      const produtos = getProdutos();
      const usuarios = getUsuarios();
      const enderecos = D.enderecos.concat(read(KEYS.enderecos, []));
      return getPedidos()
        .map((p) => {
          const itens = p.itens
            .map((i) => ({ ...i, produto: produtos.find((x) => x.id === Number(i.id_produto)) }))
            .filter((i) => i.produto && i.produto.id_vendedor === loja.id);
          if (!itens.length) return null;
          const comprador = D.compradores.find((c) => c.id === Number(p.id_comprador));
          const usuario = usuarios.find((u) => Number(u.id) === Number(comprador ? comprador.id_usuario : p.id_comprador));
          const endereco = enderecos.find((e) => Number(e.id) === Number(p.endereco_id))
            || enderecos.find((e) => usuario && Number(e.usuario_id) === Number(usuario.id));
          return {
            ...p,
            itens,
            subtotal_loja: Number(itens.reduce((t, i) => t + Number(i.valor_total), 0).toFixed(2)),
            comprador: usuario ? { id: usuario.id, nome: usuario.nome, telefone: usuario.telefone } : null,
            endereco: endereco || null,
            retirada: p.entrega === 'retirada'
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.id - a.id);
    },

    async atualizarVenda(idUsuario, idPedido, dados) {
      await delay(200);
      const vendas = await api.vendas(idUsuario);
      const venda = vendas.find((v) => Number(v.id) === Number(idPedido));
      if (!venda) throw new Error('Venda não encontrada.');
      const FLUXO = ['Aguardando pagamento', 'Em preparo', 'Enviado', 'Entregue'];
      if (dados.status && dados.status !== 'Cancelado' && !FLUXO.includes(dados.status)) throw new Error('Status inválido.');
      if (dados.status === 'Enviado' && !String(dados.rastreio || venda.rastreio || '').trim() && !venda.retirada) {
        throw new Error('Informe o código de rastreio para marcar como enviado.');
      }
      const overrides = read(KEYS.pedidosStatus, {});
      const atual = overrides[idPedido] || {};
      const historico = (atual.historico || venda.historico || []).concat({ status: dados.status, data: new Date().toISOString() });
      overrides[idPedido] = {
        ...atual,
        status: dados.status || venda.status,
        rastreio: dados.rastreio != null ? String(dados.rastreio).trim().toUpperCase() : (atual.rastreio || venda.rastreio || ''),
        historico
      };
      write(KEYS.pedidosStatus, overrides);
      return overrides[idPedido];
    },

    /* -------- chat comprador ↔ vendedor -------- */
    conversasSync(idUsuario) {
      const usuario = getUsuarios().find((u) => Number(u.id) === Number(idUsuario));
      if (!usuario) return [];
      const lojas = getVendedores();
      const minhaLoja = usuario.tipo === 'vendedor' ? lojas.find((v) => Number(v.id_usuario) === Number(idUsuario)) : null;
      const souVendedor = !!minhaLoja;
      return getConversas()
        .filter((c) => (souVendedor ? c.id_vendedor === minhaLoja.id : Number(c.id_comprador) === Number(idUsuario)))
        .map((c) => {
          const loja = lojas.find((v) => v.id === c.id_vendedor);
          const comprador = getUsuarios().find((u) => Number(u.id) === Number(c.id_comprador));
          const produto = c.id_produto ? getProdutos().find((p) => p.id === Number(c.id_produto)) : null;
          const ultima = c.mensagens[c.mensagens.length - 1];
          const eu = souVendedor ? 'vendedor' : 'comprador';
          return {
            ...c,
            eu,
            loja,
            comprador: comprador ? { id: comprador.id, nome: comprador.nome } : null,
            produto: produto ? enrichProduto(produto) : null,
            titulo: souVendedor ? (comprador ? comprador.nome : 'Comprador') : (loja ? loja.nome_loja : 'Loja'),
            ultima,
            naoLidas: c.mensagens.filter((m) => m.de !== eu && !m.lida).length
          };
        })
        .sort((a, b) => new Date(b.ultima ? b.ultima.data : 0) - new Date(a.ultima ? a.ultima.data : 0));
    },

    naoLidasSync(idUsuario) {
      return api.conversasSync(idUsuario).reduce((t, c) => t + c.naoLidas, 0);
    },

    abrirConversa(idUsuario, { vendedor, comprador, produto, pedido }) {
      const usuario = getUsuarios().find((u) => Number(u.id) === Number(idUsuario));
      if (!usuario) throw new Error('Entre na sua conta para conversar.');
      const lojas = getVendedores();
      let idVendedor; let idComprador;
      if (usuario.tipo === 'vendedor' && comprador) {
        const loja = lojas.find((v) => Number(v.id_usuario) === Number(idUsuario));
        if (!loja) throw new Error('Loja não encontrada.');
        idVendedor = loja.id;
        idComprador = Number(comprador);
      } else {
        idVendedor = Number(vendedor);
        idComprador = Number(idUsuario);
        const loja = lojas.find((v) => v.id === idVendedor);
        if (!loja) throw new Error('Loja não encontrada.');
        if (Number(loja.id_usuario) === Number(idUsuario)) throw new Error('Esta é a sua própria loja.');
      }
      const todas = read(KEYS.mensagens, null) || getConversas();
      let conversa = todas.find((c) => c.id_vendedor === idVendedor && Number(c.id_comprador) === idComprador);
      if (!conversa) {
        conversa = {
          id: nextId(todas), id_vendedor: idVendedor, id_comprador: idComprador,
          id_produto: produto ? Number(produto) : null, id_pedido: pedido ? Number(pedido) : null,
          mensagens: []
        };
        todas.push(conversa);
      } else {
        if (produto) conversa.id_produto = Number(produto);
        if (pedido) conversa.id_pedido = Number(pedido);
      }
      write(KEYS.mensagens, todas);
      return conversa.id;
    },

    enviarMensagem(idUsuario, idConversa, texto) {
      const limpo = String(texto || '').trim().slice(0, 1000);
      if (!limpo) throw new Error('Escreva uma mensagem.');
      const todas = read(KEYS.mensagens, null) || getConversas();
      const conversa = todas.find((c) => c.id === Number(idConversa));
      if (!conversa) throw new Error('Conversa não encontrada.');
      const loja = getVendedores().find((v) => v.id === conversa.id_vendedor);
      const de = loja && Number(loja.id_usuario) === Number(idUsuario) ? 'vendedor' : 'comprador';
      conversa.mensagens.push({ de, texto: limpo, data: new Date().toISOString(), lida: false });
      write(KEYS.mensagens, todas);
      return conversa;
    },

    /* Resposta automática da loja (protótipo): só na primeira mensagem do comprador */
    respostaAutomatica(idConversa) {
      const todas = read(KEYS.mensagens, null) || getConversas();
      const conversa = todas.find((c) => c.id === Number(idConversa));
      if (!conversa || conversa.mensagens.some((m) => m.de === 'vendedor')) return false;
      const loja = getVendedores().find((v) => v.id === conversa.id_vendedor);
      const produto = conversa.id_produto ? getProdutos().find((p) => p.id === conversa.id_produto) : null;
      conversa.mensagens.push({
        de: 'vendedor',
        auto: true,
        texto: `Olá! Aqui é da ${loja ? loja.nome_loja : 'loja'}. Recebemos sua mensagem${produto ? ` sobre "${produto.nome.split(' ').slice(0, 5).join(' ')}…"` : ''} e respondemos em instantes. 😊`,
        data: new Date().toISOString(),
        lida: false
      });
      write(KEYS.mensagens, todas);
      return true;
    },

    marcarLidas(idUsuario, idConversa) {
      const todas = read(KEYS.mensagens, null) || getConversas();
      const conversa = todas.find((c) => c.id === Number(idConversa));
      if (!conversa) return;
      const loja = getVendedores().find((v) => v.id === conversa.id_vendedor);
      const eu = loja && Number(loja.id_usuario) === Number(idUsuario) ? 'vendedor' : 'comprador';
      let mudou = false;
      conversa.mensagens.forEach((m) => { if (m.de !== eu && !m.lida) { m.lida = true; mudou = true; } });
      if (mudou) write(KEYS.mensagens, todas);
    },

    async avaliacoes(idProduto) {
      await delay();
      return getAvaliacoes(idProduto);
    },

    /* -------- conta -------- */
    async login(email, senha) {
      await delay(320);
      const usuarios = getUsuarios();
      const user = usuarios.find(
        (u) => normalize(u.email) === normalize(email) && String(u.senha) === String(senha)
      );
      if (!user) throw new Error('E-mail ou senha inválidos. Confira os dados e tente novamente.');
      return buildSession(user);
    },

    /* -------- recuperação de senha (protótipo: o "e-mail" aparece na tela) -------- */
    async solicitarCodigo(email) {
      await delay(400);
      const user = getUsuarios().find((u) => normalize(u.email) === normalize(email));
      if (!user) throw new Error('Não encontramos uma conta com esse e-mail.');
      const codigo = String(Math.floor(100000 + Math.random() * 900000));
      write('frionex:reset', { email: user.email, codigo, expira: Date.now() + 10 * 60 * 1000 });
      return { email: user.email, codigo };
    },

    async redefinirSenha(email, codigo, novaSenha) {
      await delay(400);
      const pedido = read('frionex:reset', null);
      if (!pedido || normalize(pedido.email) !== normalize(email)) throw new Error('Solicite um novo código.');
      if (Date.now() > pedido.expira) throw new Error('O código expirou. Solicite outro.');
      if (String(codigo).trim() !== pedido.codigo) throw new Error('Código incorreto.');
      if (String(novaSenha).length < 8) throw new Error('A nova senha precisa ter pelo menos 8 caracteres.');
      const user = getUsuarios().find((u) => normalize(u.email) === normalize(email));
      const extras = read(KEYS.usuarios, []);
      const idx = extras.findIndex((u) => Number(u.id) === Number(user.id));
      if (idx >= 0) extras[idx] = { ...extras[idx], senha: String(novaSenha) };
      else extras.push({ id: user.id, senha: String(novaSenha) });
      write(KEYS.usuarios, extras);
      try { localStorage.removeItem('frionex:reset'); } catch (e) { /* ignore */ }
      return true;
    },

    async cadastrar(dados) {
      await delay(380);
      const usuarios = getUsuarios();
      if (usuarios.some((u) => normalize(u.email) === normalize(dados.email))) {
        throw new Error('Já existe uma conta com este e-mail.');
      }
      if (usuarios.some((u) => normalize(u.nome_usuario) === normalize(dados.nome_usuario))) {
        throw new Error('Este nome de usuário já está em uso.');
      }
      if (!dados.senha || dados.senha.length < 8) {
        throw new Error('A senha deve ter pelo menos 8 caracteres.');
      }
      const extras = read(KEYS.usuarios, []);
      const novo = {
        id: nextId(usuarios.concat(extras)),
        nome: dados.nome,
        nome_usuario: dados.nome_usuario,
        email: dados.email,
        senha: dados.senha,
        cpf: dados.cpf || '',
        telefone: dados.telefone || '',
        data_nasc: dados.data_nasc || '',
        foto: null,
        historico: '',
        tipo: dados.tipo || 'comprador',
        endereco_id: null,
        verificado: false,
        criado_em: new Date().toISOString().slice(0, 10)
      };
      extras.push(novo);
      write(KEYS.usuarios, extras);

      if (dados.cep) {
        const endereco = await api.salvarEndereco({
          usuario_id: novo.id,
          cep: dados.cep,
          rua: dados.rua,
          numero: dados.numero,
          bairro: dados.bairro,
          cidade: dados.cidade,
          uf: dados.uf
        });
        novo.endereco_id = endereco.id;
        const idx = extras.findIndex((u) => Number(u.id) === Number(novo.id));
        if (idx >= 0) extras[idx].endereco_id = endereco.id;
        write(KEYS.usuarios, extras);
      }
      return buildSession(novo);
    },

    async atualizarPerfil(id, dados) {
      await delay(260);
      const extras = read(KEYS.usuarios, []);
      const atual = getUsuarios().find((u) => Number(u.id) === Number(id));
      if (!atual) throw new Error('Usuário não encontrado');
      const atualizado = { ...atual, ...dados, id: atual.id };
      const idx = extras.findIndex((u) => Number(u.id) === Number(atual.id));
      if (idx >= 0) extras[idx] = { ...extras[idx], ...dados };
      else extras.push(atualizado);
      write(KEYS.usuarios, extras);
      return buildSession({ ...atual, ...dados });
    },

    async usuario(id) {
      await delay();
      const user = getUsuarios().find((u) => Number(u.id) === Number(id));
      return user ? publicUser(user) : null;
    },

    sessao() {
      const sessao = read(KEYS.sessao, null);
      if (!sessao) return null;
      const atual = getUsuarios().find((u) => Number(u.id) === Number(sessao.id));
      return atual ? { ...sessao, nome: atual.nome, nome_usuario: atual.nome_usuario } : sessao;
    },

    logout() {
      localStorage.removeItem(KEYS.sessao);
    },

    /* -------- endereços -------- */
    async enderecos(idUsuario) {
      await delay();
      const extras = read(KEYS.enderecos, []);
      return D.enderecos
        .concat(extras)
        .filter((e) => Number(e.usuario_id) === Number(idUsuario));
    },

    async salvarEndereco(dados) {
      await delay(200);
      const extras = read(KEYS.enderecos, []);
      const todos = D.enderecos.concat(extras);
      const novo = { ...dados, id: nextId(todos) };
      extras.push(novo);
      write(KEYS.enderecos, extras);
      return novo;
    },

    async removerEndereco(id) {
      await delay(160);
      const extras = read(KEYS.enderecos, []);
      write(KEYS.enderecos, extras.filter((e) => Number(e.id) !== Number(id)));
      return true;
    },

    /* -------- cartões -------- */
    async cartoes(idUsuario) {
      await delay();
      return D.cartoes.concat(read(KEYS.cartoes, [])).filter((c) => Number(c.id_usuario) === Number(idUsuario));
    },

    async salvarCartao(dados) {
      await delay(200);
      const extras = read(KEYS.cartoes, []);
      const novo = { ...dados, id: nextId(D.cartoes.concat(extras)) };
      extras.push(novo);
      write(KEYS.cartoes, extras);
      return novo;
    },

    /* -------- pedidos -------- */
    async pedidos(idUsuario) {
      await delay();
      const compradorId = resolveCompradorId(idUsuario);
      return getPedidos()
        .filter((p) => Number(p.id_comprador) === Number(compradorId))
        .map((p) => ({
          ...p,
          itens: p.itens.map((i) => {
            const produto = getProdutos().find((x) => x.id === i.id_produto);
            return { ...i, produto };
          }),
          total: p.total != null
            ? Number(p.total)
            : p.itens.reduce((soma, i) => soma + Number(i.valor_total), 0)
        }))
        .sort((a, b) => new Date(b.data) - new Date(a.data));
    },

    async criarPedido({ id_comprador, itens, pagamento, endereco_id, frete, desconto, total }) {
      await delay(500);
      if (!itens || !itens.length) throw new Error('Carrinho vazio');
      const extras = read(KEYS.pedidos, []);
      const numero = 1000 + D.pedidos.length + extras.length + 1;
      const itensPedido = itens.map((i) => {
        const produto = getProdutos().find((p) => p.id === Number(i.id_produto));
        const preco = i.preco_unitario != null ? i.preco_unitario : produto.preco;
        return {
          id_produto: Number(i.id_produto),
          quantidade: Number(i.quantidade),
          preco_unitario: preco,
          valor_total: Number((preco * Number(i.quantidade)).toFixed(2))
        };
      });
      const totalItens = Number(itensPedido.reduce((soma, i) => soma + i.valor_total, 0).toFixed(2));
      const pedido = {
        id: numero,
        id_comprador: resolveCompradorId(id_comprador),
        data: new Date().toISOString().slice(0, 10),
        pagamento,
        endereco_id: endereco_id || null,
        entrega: endereco_id ? 'envio' : 'retirada',
        status: pagamento === 'PIX' ? 'Aguardando pagamento' : 'Em preparo',
        /* Campos extras do protótipo: guardam o valor efetivamente pago. */
        frete: Number(frete || 0),
        desconto: Number(desconto || 0),
        total: total != null ? Number(total) : totalItens,
        itens: itensPedido
      };
      extras.push(pedido);
      write(KEYS.pedidos, extras);
      return pedido;
    },

    async adicionarAvaliacao({ id_produto, nota, descricao, foto }) {
      await delay(320);
      const session = api.sessao();
      if (!session) throw new Error('Entre na sua conta para avaliar.');
      const extras = read(KEYS.avaliacoes, []);
      const nova = {
        id: nextId(D.avaliacoes.concat(extras)),
        id_produto: Number(id_produto),
        id_comprador: resolveCompradorId(session.id),
        nota: Number(nota),
        descricao,
        data: new Date().toISOString().slice(0, 10),
        foto: foto || null
      };
      extras.push(nova);
      write(KEYS.avaliacoes, extras);
      return nova;
    },

    /* -------- preferências -------- */
    prefs() {
      return read(KEYS.prefs, {
        cookies_analiticos: true,
        cookies_marketing: false,
        perfil_publico: true,
        mostrar_telefone: false,
        notificacoes_email: true
      });
    },

    salvarPrefs(prefs) {
      return write(KEYS.prefs, { ...api.prefs(), ...prefs });
    },

    /* -------- auxiliares -------- */
    getCategoriasSync() { return getCategorias(); },
    getProdutosSync() { return getProdutos().map(enrichProduto); },
    getVendedoresSync() { return getVendedores(); },
    getUsuariosSync() { return getUsuarios(); },
    getEnderecosSync() { return D.enderecos.concat(read(KEYS.enderecos, [])); },
    normalize
  };

  window.FrionexAPI = api;
})();
