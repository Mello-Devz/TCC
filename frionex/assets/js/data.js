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

  /* Fotos reais (Wikimedia Commons, licenças livres — créditos no README),
     salvas dentro do projeto para funcionar sem internet. */
  const foto = {
    splitBranco: img('split-branco.jpg'),
    splitParede: img('split-parede.jpg'),
    condensadora: img('condensadora.jpg'),
    controle: img('controle.jpg'),
    placa: img('placa.jpg'),
    manifold: img('manifold.jpg'),
    bomba: img('bomba.jpg'),
    cobre: img('cobre.jpg'),
    filtro: img('filtro.webp')
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
    { id: 3, nome: 'Unidades condensadoras', id_categoria: 2 },
    { id: 4, nome: 'Placas eletrônicas', id_categoria: 2 },
    { id: 7, nome: 'Controles remotos', id_categoria: 2 },
    { id: 5, nome: 'Medição e manifold', id_categoria: 3 },
    { id: 8, nome: 'Vácuo e recolhimento', id_categoria: 3 },
    { id: 6, nome: 'Kits de instalação', id_categoria: 4 },
    { id: 9, nome: 'Filtros', id_categoria: 4 }
  ];

  const enderecos = [
    { id: 1, usuario_id: 1, rua: 'Rua das Palmeiras', numero: '245', bairro: 'Centro', cidade: 'Sombrio', uf: 'SC', cep: '88960000' },
    { id: 2, usuario_id: 2, rua: 'Av. Getúlio Vargas', numero: '1180', bairro: 'Jardim América', cidade: 'Sombrio', uf: 'SC', cep: '88965000' }
  ];

  const usuarios = [
    {
      id: 1, nome: 'Miguel Paulo de Mello', nome_usuario: 'miguelmello', email: 'comprador@frionex.com',
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
    },
    /* contas dos outros vendedores (todas com a senha 12345678) */
    { id: 10, nome: 'Rafael Costa', nome_usuario: 'climasul', email: 'climasul@frionex.com', senha: '12345678', cpf: '555.666.777-88', telefone: '(48) 99555-0010', data_nasc: '1990-06-14', foto: null, historico: 'Clima Sul Refrigeração · Criciúma/SC', tipo: 'vendedor', endereco_id: null, verificado: true, criado_em: '2027-01-20' },
    { id: 11, nome: 'Patrícia Becker', nome_usuario: 'gauchaar', email: 'gaucha@frionex.com', senha: '12345678', cpf: '666.777.888-99', telefone: '(51) 99666-0011', data_nasc: '1988-03-09', foto: null, historico: 'Gaúcha Ar & Peças · Porto Alegre/RS', tipo: 'vendedor', endereco_id: null, verificado: true, criado_em: '2027-02-02' },
    { id: 12, nome: 'Eduardo Kowalski', nome_usuario: 'paranaclima', email: 'parana@frionex.com', senha: '12345678', cpf: '777.888.999-00', telefone: '(41) 99777-0012', data_nasc: '1992-12-01', foto: null, historico: 'Paraná Climatização · Curitiba/PR', tipo: 'vendedor', endereco_id: null, verificado: true, criado_em: '2027-03-10' },
    { id: 13, nome: 'Marcos Tanaka', nome_usuario: 'friopaulista', email: 'friopaulista@frionex.com', senha: '12345678', cpf: '888.999.000-11', telefone: '(11) 99888-0013', data_nasc: '1983-08-22', foto: null, historico: 'Frio Paulista Distribuidora · São Paulo/SP', tipo: 'vendedor', endereco_id: null, verificado: true, criado_em: '2027-01-05' }
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
      localizacao: 'Sombrio · SC', cidade: 'sombrio'
    },
    {
      id: 2, id_usuario: 10, nome_loja: 'Clima Sul Refrigeração',
      descricao: 'Distribuidora de peças e equipamentos de refrigeração no sul catarinense. Retirada no balcão em Criciúma.',
      foto: 'assets/img/avatar-loja.svg', verificado: true, criado_em: '2027-01-20',
      ultimo_login: 'há 1 hora', taxa_resposta: 92, avaliacoes: 48, produtos: 120,
      localizacao: 'Criciúma · SC', cidade: 'criciuma'
    },
    {
      id: 3, id_usuario: 11, nome_loja: 'Gaúcha Ar & Peças',
      descricao: 'Peças originais e paralelas para split, com envio rápido para todo o Rio Grande do Sul.',
      foto: 'assets/img/avatar-loja.svg', verificado: true, criado_em: '2027-02-02',
      ultimo_login: 'há 5 horas', taxa_resposta: 85, avaliacoes: 31, produtos: 74,
      localizacao: 'Porto Alegre · RS', cidade: 'porto-alegre'
    },
    {
      id: 4, id_usuario: 12, nome_loja: 'Paraná Climatização',
      descricao: 'Ferramentas profissionais e kits de instalação para técnicos de refrigeração.',
      foto: 'assets/img/avatar-loja.svg', verificado: false, criado_em: '2027-03-10',
      ultimo_login: 'ontem', taxa_resposta: 74, avaliacoes: 12, produtos: 38,
      localizacao: 'Curitiba · PR', cidade: 'curitiba'
    },
    {
      id: 5, id_usuario: 13, nome_loja: 'Frio Paulista Distribuidora',
      descricao: 'Grande estoque de peças e acessórios de climatização com envio para todo o Brasil.',
      foto: 'assets/img/avatar-loja.svg', verificado: true, criado_em: '2027-01-05',
      ultimo_login: 'há 2 horas', taxa_resposta: 96, avaliacoes: 210, produtos: 540,
      localizacao: 'São Paulo · SP', cidade: 'sao-paulo'
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
      tecnologia: 'Inverter', ciclo: 'Frio/Calor', id_categoria: 1, id_subcategoria: 1, id_vendedor: 3,
      foto: foto.splitParede, fotos: [foto.splitParede, foto.condensadora, foto.controle],
      destaque: true, estoque: 5, garantia: '12 meses', avaliacoes: 28, nota: 4.7, vendidos: 84,
      criado_em: '2026-09-22'
    },
    {
      id: 4,
      nome: 'Unidade Condensadora Externa 12000 BTUs Philco 220V',
      descricao: 'Condensadora de reposição compatível com splits convencionais de 12000 BTUs. Estrutura reforçada contra maresia, indicada para regiões litorâneas.',
      preco: 1149.90, preco_antigo: 1349.00, estado: 'Novo', marca: 'Philco', btu: 12000,
      tecnologia: 'Convencional', ciclo: 'Só Frio', id_categoria: 2, id_subcategoria: 3, id_vendedor: 2,
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
      tecnologia: 'Universal', ciclo: '-', id_categoria: 2, id_subcategoria: 7, id_vendedor: 1,
      foto: foto.controle, fotos: [foto.controle, foto.splitBranco],
      destaque: true, estoque: 48, garantia: '3 meses', avaliacoes: 156, nota: 4.8, vendidos: 890,
      criado_em: '2026-07-14'
    },
    {
      id: 7,
      nome: 'Manifold Digital 2 Válvulas com Mangueiras 1,5m',
      descricao: 'Manifold digital de alta precisão para carga e leitura de pressão em sistemas R-32, R-410A e R-22. Acompanha três mangueiras.',
      preco: 449.90, preco_antigo: 519.90, estado: 'Novo', marca: 'ToolPro', btu: null,
      tecnologia: 'Digital', ciclo: '-', id_categoria: 3, id_subcategoria: 5, id_vendedor: 4,
      foto: foto.manifold, fotos: [foto.manifold, foto.bomba],
      destaque: true, estoque: 11, garantia: '6 meses', avaliacoes: 23, nota: 4.9, vendidos: 76,
      criado_em: '2026-10-10'
    },
    {
      id: 8,
      nome: 'Bomba de Vácuo 5 CFM 1/4 HP 220V para Instalação de Split',
      descricao: 'Bomba de vácuo robusta para evacuação de linhas de refrigeração. Corpo em alumínio, motor de 1/4 HP e retorno automático.',
      preco: 699.00, preco_antigo: 799.00, estado: 'Novo', marca: 'ToolPro', btu: null,
      tecnologia: 'Rotativa', ciclo: '-', id_categoria: 3, id_subcategoria: 8, id_vendedor: 5,
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
      tecnologia: 'Antibacteriano', ciclo: '-', id_categoria: 4, id_subcategoria: 9, id_vendedor: 1,
      foto: foto.filtro, fotos: [foto.filtro, foto.splitBranco],
      destaque: true, estoque: 120, garantia: '3 meses', avaliacoes: 210, nota: 4.8, vendidos: 1220,
      criado_em: '2026-05-19'
    },
    /* Mesmos itens em outras regiões: dá para comparar preço × distância */
    {
      id: 11,
      nome: 'Controle Remoto Universal para Ar-Condicionado Split com Display',
      descricao: 'Controle universal compatível com as principais marcas de split. Vem com pilhas e suporte de parede.',
      preco: 49.90, preco_antigo: 64.90, estado: 'Novo', marca: 'Gaúcha Parts', btu: null,
      tecnologia: 'Universal', ciclo: '-', id_categoria: 2, id_subcategoria: 7, id_vendedor: 3,
      foto: foto.controle, fotos: [foto.controle],
      destaque: false, estoque: 60, garantia: '3 meses', avaliacoes: 22, nota: 4.5, vendidos: 340,
      criado_em: '2026-10-28'
    },
    {
      id: 12,
      nome: 'Kit de Instalação para Split 9000 a 12000 BTUs – 3 metros (cobre 1/4 e 3/8)',
      descricao: 'Tubos de cobre isolados, cabo PP, fita e suporte. Pronto para instalação de split até 12000 BTUs.',
      preco: 319.90, preco_antigo: 379.90, estado: 'Novo', marca: 'ToolPro', btu: 12000,
      tecnologia: 'Kit', ciclo: '-', id_categoria: 4, id_subcategoria: 6, id_vendedor: 4,
      foto: foto.cobre, fotos: [foto.cobre],
      destaque: false, estoque: 25, garantia: '3 meses', avaliacoes: 9, nota: 4.6, vendidos: 61,
      criado_em: '2026-10-15'
    },
    {
      id: 13,
      nome: 'Filtro de Ar Antibacteriano para Split – Par (tamanho universal)',
      descricao: 'Par de filtros laváveis com tratamento antibacteriano. Recortável para várias marcas de split.',
      preco: 34.90, preco_antigo: 44.90, estado: 'Novo', marca: 'Frio Paulista', btu: null,
      tecnologia: 'Antibacteriano', ciclo: '-', id_categoria: 4, id_subcategoria: 9, id_vendedor: 5,
      foto: foto.filtro, fotos: [foto.filtro],
      destaque: false, estoque: 300, garantia: '3 meses', avaliacoes: 88, nota: 4.4, vendidos: 1210,
      criado_em: '2026-09-30'
    },
    {
      id: 14,
      nome: 'Ar-Condicionado Split Inverter 12000 BTUs Gree G-Top Frio/Calor 220V',
      descricao: 'Split inverter de 12000 BTUs com ciclo frio/calor, filtro de alta densidade e modo econômico. Retirada disponível em Criciúma.',
      preco: 2249.90, preco_antigo: 2599.90, estado: 'Novo', marca: 'Gree', btu: 12000,
      tecnologia: 'Inverter', ciclo: 'Frio/Calor', id_categoria: 1, id_subcategoria: 1, id_vendedor: 2,
      foto: foto.splitParede, fotos: [foto.splitParede, foto.condensadora],
      destaque: false, estoque: 8, garantia: '12 meses', avaliacoes: 14, nota: 4.7, vendidos: 37,
      criado_em: '2026-10-25'
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
    { id: 1, id_usuario: 1, bandeira: 'Visa', final: '4242', nome: 'MIGUEL PAULO DE MELLO', validade: '09/29', principal: true },
    { id: 2, id_usuario: 1, bandeira: 'Mastercard', final: '8871', nome: 'MIGUEL PAULO DE MELLO', validade: '03/28', principal: false }
  ];

  window.FrionexData = {
    usuarios, compradores, vendedores, enderecos,
    categorias, subcategorias, produtos, avaliacoes,
    pedidos, cartoes
  };
})();
