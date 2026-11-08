/* =========================================================
   FRIONEX · Dados de demonstração
   Estrutura espelhada no modelo lógico (usuario, comprador,
   vendedor, endereco, categoria, subcategoria, produto,
   pedido, item_pedido, avaliacao).
   Quando o banco de dados entrar, este arquivo será
   substituído pelas respostas da API.
   ========================================================= */
(function () {
  'use strict';

  const img = (file) => `assets/img/produtos/${file}`;

  /* Fotos reais (Wikimedia Commons, licenças livres — créditos no README). */
  const WM = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
  const foto = {
    splitBranco: WM + 'c/c5/Panasonic_AIR_CONDITIONER_INDOOR_UNIT_CS-R13KR10.jpg/960px-Panasonic_AIR_CONDITIONER_INDOOR_UNIT_CS-R13KR10.jpg',
    splitParede: WM + '4/45/Panasonic_AIR_CONDITIONER_INDOOR_UNIT_CS-C10KJ2.jpg/960px-Panasonic_AIR_CONDITIONER_INDOOR_UNIT_CS-C10KJ2.jpg',
    condensadora: WM + '6/69/SHARP_air_conditioner_outdoor_unit_20201003.jpg/960px-SHARP_air_conditioner_outdoor_unit_20201003.jpg',
    controle: WM + '0/0d/A.c_remote.jpg/960px-A.c_remote.jpg',
    placa: WM + '3/3b/Close-up_view_of_a_circuit_board_being_held_near_an_air_conditioning_unit_in_a_contemporary_indoor_environment.jpg/960px-Close-up_view_of_a_circuit_board_being_held_near_an_air_conditioning_unit_in_a_contemporary_indoor_environment.jpg',
    manifold: WM + '1/1d/332nd_Expeditionary_CE_Squadron_HVAC-R_operations_%289305714%29.jpg/960px-332nd_Expeditionary_CE_Squadron_HVAC-R_operations_%289305714%29.jpg',
    bomba: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Edwards_E2M2_2-Stage_Rotary_Vane_Vacuum_Pump_%2815957733526%29.jpg',
    cobre: WM + 'd/d3/Copper_pipe_8072.JPG/960px-Copper_pipe_8072.JPG',
    filtro: WM + '5/54/HVAC_air_filter.webp/960px-HVAC_air_filter.webp'
  };

  const categorias = [
    { id: 1, nome: 'Ar-Condicionado', slug: 'ar-condicionado', icone: 'wind' },
    { id: 2, nome: 'Peças', slug: 'pecas', icone: 'chip' },
    { id: 3, nome: 'Ferramentas', slug: 'ferramentas', icone: 'tool' },
    { id: 4, nome: 'Acessórios', slug: 'acessorios', icone: 'box' }
  ];

  const subcategorias = [
    { id: 1, nome: 'Split Inverter', id_categoria: 1 },
    { id: 2, nome: 'Split Convencional', id_categoria: 1 },
    { id: 3, nome: 'Peças de reposição', id_categoria: 2 },
    { id: 4, nome: 'Placas eletrônicas', id_categoria: 2 },
    { id: 5, nome: 'Ferramentas de instalação', id_categoria: 3 },
    { id: 6, nome: 'Kits e acessórios', id_categoria: 4 }
  ];

  const enderecos = [
    { id: 1, usuario_id: 1, rua: 'Rua das Palmeiras', numero: '245', bairro: 'Centro', cidade: 'Sombrio', uf: 'SC', cep: '88960000' },
    { id: 2, usuario_id: 2, rua: 'Av. Getúlio Vargas', numero: '1180', bairro: 'Jardim América', cidade: 'Sombrio', uf: 'SC', cep: '88965000' }
  ];

  const usuarios = [
    {
      id: 1, nome: 'Miguel Mello', nome_usuario: 'miguelmello', email: 'comprador@frionex.com',
      senha: '12345678', cpf: '123.456.789-69', telefone: '(48) 99999-0067', data_nasc: '2008-04-12',
      foto: null, historico: 'Comprador verificado da região de Sombrio.', tipo: 'comprador',
      endereco_id: 1, verificado: true, criado_em: '2027-01-12'
    },
    {
      id: 2, nome: 'Maxwell Gonçalves Vieira Fernandes', nome_usuario: 'vendoac', email: 'vendedor@frionex.com',
      senha: '12345678', cpf: '987.654.321-00', telefone: '(48) 98888-0042', data_nasc: '2007-09-21',
      foto: 'assets/img/avatar-loja.svg', historico: 'Especialista em climatização e peças originais.', tipo: 'vendedor',
      endereco_id: 2, verificado: true, criado_em: '2027-01-01'
    },
    {
      id: 3, nome: 'Ana Souza', nome_usuario: 'anasouza', email: 'ana@exemplo.com', senha: '12345678',
      cpf: '111.222.333-44', telefone: '(48) 99111-2233', data_nasc: '1994-02-18', foto: null,
      historico: '', tipo: 'comprador', endereco_id: 1, verificado: true, criado_em: '2027-02-03'
    },
    {
      id: 4, nome: 'Carlos Lima', nome_usuario: 'carloslima', email: 'carlos@exemplo.com', senha: '12345678',
      cpf: '222.333.444-55', telefone: '(48) 99222-3344', data_nasc: '1989-11-02', foto: null,
      historico: '', tipo: 'comprador', endereco_id: 1, verificado: true, criado_em: '2027-02-11'
    },
    {
      id: 5, nome: 'Juliana Alves', nome_usuario: 'jualves', email: 'juliana@exemplo.com', senha: '12345678',
      cpf: '333.444.555-66', telefone: '(48) 99333-4455', data_nasc: '1997-07-25', foto: null,
      historico: '', tipo: 'comprador', endereco_id: 2, verificado: true, criado_em: '2027-03-04'
    },
    {
      id: 6, nome: 'Roberto Nunes', nome_usuario: 'betonunes', email: 'roberto@exemplo.com', senha: '12345678',
      cpf: '444.555.666-77', telefone: '(48) 99444-5566', data_nasc: '1985-05-30', foto: null,
      historico: '', tipo: 'comprador', endereco_id: 2, verificado: true, criado_em: '2027-03-19'
    }
  ];

  const compradores = [
    { id: 1, id_usuario: 1, forma_pagamento: 'PIX' },
    { id: 2, id_usuario: 3, forma_pagamento: 'Cartão de crédito' },
    { id: 3, id_usuario: 4, forma_pagamento: 'PIX' },
    { id: 4, id_usuario: 5, forma_pagamento: 'Boleto' },
    { id: 5, id_usuario: 6, forma_pagamento: 'Cartão de crédito' }
  ];

  const vendedores = [
    {
      id: 1, id_usuario: 2, nome_loja: 'Vendo Ar-Condicionado',
      descricao: 'Peças, equipamentos e ferramentas para climatização. Atendemos toda a região sul de Santa Catarina com envio para todo o Brasil.',
      foto: 'assets/img/avatar-loja.svg', verificado: true, criado_em: '2027-01-01',
      ultimo_login: 'há 3 horas', taxa_resposta: 67, avaliacoes: 20, produtos: 69,
      localizacao: 'Sombrio · SC'
    }
  ];

  const produtos = [
    {
      id: 1,
      nome: 'Ar-Condicionado Split Inverter 9000 BTUs LG +AI Dual Inverter Só Frio 220V',
      descricao: 'Split inverter de 9000 BTUs com tecnologia Dual Inverter e inteligência artificial. Ideal para ambientes de até 15 m², oferece baixo consumo e refrigeração rápida.',
      preco: 1699.90, preco_antigo: 2099.00, estado: 'Novo', marca: 'LG', btu: 9000,
      tecnologia: 'Dual Inverter', ciclo: 'Só Frio', id_categoria: 1, id_subcategoria: 1, id_vendedor: 1,
      foto: foto.splitBranco, fotos: [foto.splitBranco, foto.condensadora, foto.controle],
      destaque: false, estoque: 14, garantia: '12 meses', avaliacoes: 42, nota: 4.8, vendidos: 128,
      criado_em: '2026-10-02'
    },
    {
      id: 2,
      nome: 'Ar-Condicionado Split Inverter 12000 BTUs Samsung WindFree AI Wi-Fi High Wall Só Frio AR12DYFAAWKNAZ/AR12DYFAAWKXAZ 220V',
      descricao: 'O ar-condicionado Samsung WindFree AI proporciona refrigeração sem vento direto, com 23.000 micro furos que distribuem o ar suavemente pelo ambiente. Conectividade Wi-Fi, modo AI Energy e filtro antibacteriano. Ideal para salas e quartos de até 20 m².',
      preco: 1988.99, preco_antigo: 2599.90, estado: 'Novo', marca: 'Samsung', btu: 12000,
      tecnologia: 'WindFree AI', ciclo: 'Só Frio', id_categoria: 1, id_subcategoria: 1, id_vendedor: 1,
      foto: img('produto-samsung.png'), fotos: [img('produto-samsung.png'), foto.splitParede, foto.condensadora, foto.splitBranco],
      destaque: true, estoque: 7, garantia: '12 meses', avaliacoes: 67, nota: 5.0, vendidos: 341,
      criado_em: '2026-10-18', modelo: 'AR12DYFAAWKNAZ/AR12DYFAAWKXAZ', voltagem: '220V',
      dimensoes: 'Unidade interna: 82 x 27,5 x 21,5 cm', peso: '9,4 kg'
    },
    {
      id: 3,
      nome: 'Ar-Condicionado Split Inverter 18000 BTUs Midea Xtreme Save Connect Wi-Fi Frio/Calor',
      descricao: 'Alta performance para ambientes grandes. Tecnologia Inverter, função quente/frio e controle pelo aplicativo. Gás ecológico R-32.',
      preco: 2499.00, preco_antigo: 2899.00, estado: 'Novo', marca: 'Midea', btu: 18000,
      tecnologia: 'Inverter', ciclo: 'Frio/Calor', id_categoria: 1, id_subcategoria: 1, id_vendedor: 1,
      foto: foto.splitParede, fotos: [foto.splitParede, foto.condensadora, foto.controle],
      destaque: true, estoque: 5, garantia: '12 meses', avaliacoes: 28, nota: 4.7, vendidos: 84,
      criado_em: '2026-09-22'
    },
    {
      id: 4,
      nome: 'Unidade Condensadora Externa 12000 BTUs Philco 220V',
      descricao: 'Condensadora de reposição compatível com splits convencionais de 12000 BTUs. Estrutura reforçada contra maresia, indicada para regiões litorâneas.',
      preco: 1149.90, preco_antigo: 1349.00, estado: 'Novo', marca: 'Philco', btu: 12000,
      tecnologia: 'Convencional', ciclo: 'Só Frio', id_categoria: 2, id_subcategoria: 3, id_vendedor: 1,
      foto: foto.condensadora, fotos: [foto.condensadora, foto.splitBranco],
      destaque: false, estoque: 9, garantia: '6 meses', avaliacoes: 19, nota: 4.6, vendidos: 57,
      criado_em: '2026-08-30'
    },
    {
      id: 5,
      nome: 'Placa Eletrônica Universal para Split Inverter 220V',
      descricao: 'Placa de controle universal compatível com as principais marcas de split inverter. Acompanha manual de ligação e sensores.',
      preco: 289.90, preco_antigo: 349.90, estado: 'Novo', marca: 'Frionex Parts', btu: null,
      tecnologia: 'Inverter', ciclo: 'Só Frio', id_categoria: 2, id_subcategoria: 4, id_vendedor: 1,
      foto: foto.placa, fotos: [foto.placa, foto.controle],
      destaque: false, estoque: 23, garantia: '3 meses', avaliacoes: 31, nota: 4.9, vendidos: 210,
      criado_em: '2026-11-01'
    },
    {
      id: 6,
      nome: 'Controle Remoto Universal para Ar-Condicionado com Display',
      descricao: 'Controle universal com display LCD, compatível com mais de 1.000 modelos. Aprende funções do controle original.',
      preco: 59.90, preco_antigo: 79.90, estado: 'Novo', marca: 'Frionex Parts', btu: null,
      tecnologia: 'Universal', ciclo: '-', id_categoria: 2, id_subcategoria: 3, id_vendedor: 1,
      foto: foto.controle, fotos: [foto.controle, foto.splitBranco],
      destaque: true, estoque: 48, garantia: '3 meses', avaliacoes: 156, nota: 4.8, vendidos: 890,
      criado_em: '2026-07-14'
    },
    {
      id: 7,
      nome: 'Manifold Digital 2 Válvulas com Mangueiras 1,5m',
      descricao: 'Manifold digital de alta precisão para carga e leitura de pressão em sistemas R-32, R-410A e R-22. Acompanha três mangueiras.',
      preco: 449.90, preco_antigo: 519.90, estado: 'Novo', marca: 'ToolPro', btu: null,
      tecnologia: 'Digital', ciclo: '-', id_categoria: 3, id_subcategoria: 5, id_vendedor: 1,
      foto: foto.manifold, fotos: [foto.manifold, foto.bomba],
      destaque: true, estoque: 11, garantia: '6 meses', avaliacoes: 23, nota: 4.9, vendidos: 76,
      criado_em: '2026-10-10'
    },
    {
      id: 8,
      nome: 'Bomba de Vácuo 5 CFM 1/4 HP 220V para Instalação de Split',
      descricao: 'Bomba de vácuo robusta para evacuação de linhas de refrigeração. Corpo em alumínio, motor de 1/4 HP e retorno automático.',
      preco: 699.00, preco_antigo: 799.00, estado: 'Novo', marca: 'ToolPro', btu: null,
      tecnologia: 'Rotativa', ciclo: '-', id_categoria: 3, id_subcategoria: 5, id_vendedor: 1,
      foto: foto.bomba, fotos: [foto.bomba, foto.manifold],
      destaque: false, estoque: 8, garantia: '6 meses', avaliacoes: 18, nota: 4.7, vendidos: 49,
      criado_em: '2026-09-03'
    },
    {
      id: 9,
      nome: 'Kit de Instalação para Split 9000 a 12000 BTUs – 3 metros',
      descricao: 'Kit completo com 3 metros de tubulação em cobre, cabos, fita de vedação, suportes e conectores. Pronto para instalação.',
      preco: 349.90, preco_antigo: 419.90, estado: 'Novo', marca: 'Frionex Parts', btu: null,
      tecnologia: 'Kit', ciclo: '-', id_categoria: 4, id_subcategoria: 6, id_vendedor: 1,
      foto: foto.cobre, fotos: [foto.cobre, foto.splitBranco],
      destaque: false, estoque: 17, garantia: '3 meses', avaliacoes: 64, nota: 4.9, vendidos: 301,
      criado_em: '2026-06-28'
    },
    {
      id: 10,
      nome: 'Filtro de Ar Antibacteriano para Split – Par',
      descricao: 'Par de filtros laváveis com proteção antibacteriana. Reduz odores e melhora a qualidade do ar. Compatível com a maioria dos splits.',
      preco: 39.90, preco_antigo: 54.90, estado: 'Novo', marca: 'Frionex Parts', btu: null,
      tecnologia: 'Antibacteriano', ciclo: '-', id_categoria: 4, id_subcategoria: 6, id_vendedor: 1,
      foto: foto.filtro, fotos: [foto.filtro, foto.splitBranco],
      destaque: true, estoque: 120, garantia: '3 meses', avaliacoes: 210, nota: 4.8, vendidos: 1220,
      criado_em: '2026-05-19'
    }
  ];

  const avaliacoes = [
    { id: 1, id_produto: 2, id_comprador: 1, nota: 5, data: '2026-10-28', descricao: 'Chegou antes do prazo e muito bem embalado. O WindFree é silencioso de verdade, recomendo.', foto: null },
    { id: 2, id_produto: 2, id_comprador: 2, nota: 5, data: '2026-10-22', descricao: 'Loja respondeu rápido no chat e tirou todas as dúvidas sobre a instalação.', foto: null },
    { id: 3, id_produto: 2, id_comprador: 3, nota: 4, data: '2026-10-15', descricao: 'Produto excelente. Só demorou um dia a mais que o previsto, mas valeu a pena.', foto: null },
    { id: 4, id_produto: 2, id_comprador: 4, nota: 5, data: '2026-10-04', descricao: 'Instalei em um quarto de 18 m² e gela muito rápido. Consumo baixo.', foto: null },
    { id: 5, id_produto: 2, id_comprador: 1, nota: 5, data: '2026-09-19', descricao: 'Segundo aparelho que compro com o vendedor. Sempre bem atendido.', foto: null },
    { id: 6, id_produto: 2, id_comprador: 5, nota: 4, data: '2026-09-02', descricao: 'Bom custo-benefício. O aplicativo poderia ser mais intuitivo.', foto: null },
    { id: 7, id_produto: 1, id_comprador: 2, nota: 5, data: '2026-10-11', descricao: 'Ideal para o meu escritório. Muito silencioso.', foto: null },
    { id: 8, id_produto: 6, id_comprador: 3, nota: 5, data: '2026-10-08', descricao: 'Funcionou no meu split antigo de primeira.', foto: null },
    { id: 9, id_produto: 7, id_comprador: 4, nota: 5, data: '2026-09-27', descricao: 'Manifold preciso e bem acabado.', foto: null },
    { id: 10, id_produto: 10, id_comprador: 5, nota: 4, data: '2026-09-15', descricao: 'Bom filtro, encaixou perfeitamente.', foto: null }
  ];

  const pedidos = [
    {
      id: 1001, id_comprador: 1, data: '2026-10-21', pagamento: 'PIX', status: 'Entregue',
      itens: [
        { id_produto: 6, quantidade: 1, preco_unitario: 59.90, valor_total: 59.90 },
        { id_produto: 10, quantidade: 2, preco_unitario: 39.90, valor_total: 79.80 }
      ]
    },
    {
      id: 1002, id_comprador: 1, data: '2026-11-02', pagamento: 'Cartão de crédito', status: 'Enviado',
      itens: [
        { id_produto: 2, quantidade: 1, preco_unitario: 1988.99, valor_total: 1988.99 }
      ]
    }
  ];

  const cartoes = [
    { id: 1, id_usuario: 1, bandeira: 'Visa', final: '4242', nome: 'MIGUEL MELLO', validade: '09/29', principal: true },
    { id: 2, id_usuario: 1, bandeira: 'Mastercard', final: '8871', nome: 'MIGUEL MELLO', validade: '03/28', principal: false }
  ];

  window.FrionexData = {
    usuarios, compradores, vendedores, enderecos,
    categorias, subcategorias, produtos, avaliacoes,
    pedidos, cartoes
  };
})();
