/* =========================================================
   FRIONEX · Regionalização
   Descobre a cidade do comprador (CEP, endereço ou escolha
   manual), calcula a distância até cada vendedor e o frete
   por distância. É o que liga o comprador às peças mais
   próximas dele.
   ========================================================= */
(function () {
  'use strict';

  const KEY = 'frionex:regiao';

  /* Cidades atendidas no protótipo: coordenadas e faixa de CEP. */
  const CIDADES = [
    { id: 'sombrio', nome: 'Sombrio', uf: 'SC', lat: -29.1047, lon: -49.6290, cep: [88960, 88969] },
    { id: 'ararangua', nome: 'Araranguá', uf: 'SC', lat: -28.9356, lon: -49.4918, cep: [88900, 88909] },
    { id: 'santa-rosa-do-sul', nome: 'Santa Rosa do Sul', uf: 'SC', lat: -29.1300, lon: -49.7100, cep: [88965, 88965] },
    { id: 'criciuma', nome: 'Criciúma', uf: 'SC', lat: -28.6775, lon: -49.3697, cep: [88800, 88819] },
    { id: 'tubarao', nome: 'Tubarão', uf: 'SC', lat: -28.4713, lon: -49.0144, cep: [88700, 88709] },
    { id: 'florianopolis', nome: 'Florianópolis', uf: 'SC', lat: -27.5954, lon: -48.5480, cep: [88000, 88099] },
    { id: 'lages', nome: 'Lages', uf: 'SC', lat: -27.8150, lon: -50.3259, cep: [88500, 88529] },
    { id: 'blumenau', nome: 'Blumenau', uf: 'SC', lat: -26.9194, lon: -49.0661, cep: [89000, 89099] },
    { id: 'joinville', nome: 'Joinville', uf: 'SC', lat: -26.3045, lon: -48.8487, cep: [89200, 89239] },
    { id: 'chapeco', nome: 'Chapecó', uf: 'SC', lat: -27.1004, lon: -52.6152, cep: [89800, 89816] },
    { id: 'torres', nome: 'Torres', uf: 'RS', lat: -29.3334, lon: -49.7333, cep: [95560, 95569] },
    { id: 'porto-alegre', nome: 'Porto Alegre', uf: 'RS', lat: -30.0346, lon: -51.2177, cep: [90000, 91999] },
    { id: 'caxias-do-sul', nome: 'Caxias do Sul', uf: 'RS', lat: -29.1678, lon: -51.1794, cep: [95000, 95129] },
    { id: 'passo-fundo', nome: 'Passo Fundo', uf: 'RS', lat: -28.2576, lon: -52.4091, cep: [99000, 99099] },
    { id: 'pelotas', nome: 'Pelotas', uf: 'RS', lat: -31.7654, lon: -52.3376, cep: [96000, 96099] },
    { id: 'curitiba', nome: 'Curitiba', uf: 'PR', lat: -25.4284, lon: -49.2733, cep: [80000, 82999] },
    { id: 'londrina', nome: 'Londrina', uf: 'PR', lat: -23.3045, lon: -51.1696, cep: [86000, 86099] },
    { id: 'maringa', nome: 'Maringá', uf: 'PR', lat: -23.4205, lon: -51.9333, cep: [87000, 87099] },
    { id: 'sao-paulo', nome: 'São Paulo', uf: 'SP', lat: -23.5505, lon: -46.6333, cep: [1000, 5999] },
    { id: 'campinas', nome: 'Campinas', uf: 'SP', lat: -22.9099, lon: -47.0626, cep: [13000, 13139] },
    { id: 'rio-de-janeiro', nome: 'Rio de Janeiro', uf: 'RJ', lat: -22.9068, lon: -43.1729, cep: [20000, 23799] },
    { id: 'belo-horizonte', nome: 'Belo Horizonte', uf: 'MG', lat: -19.9167, lon: -43.9345, cep: [30000, 31999] }
  ];

  /* CEP fora da lista: usa o estado (coordenadas da capital). */
  const ESTADOS = [
    { uf: 'SP', cep: [1000, 19999], lat: -23.5505, lon: -46.6333 },
    { uf: 'RJ', cep: [20000, 28999], lat: -22.9068, lon: -43.1729 },
    { uf: 'ES', cep: [29000, 29999], lat: -20.3155, lon: -40.3128 },
    { uf: 'MG', cep: [30000, 39999], lat: -19.9167, lon: -43.9345 },
    { uf: 'BA', cep: [40000, 48999], lat: -12.9777, lon: -38.5016 },
    { uf: 'SE', cep: [49000, 49999], lat: -10.9472, lon: -37.0731 },
    { uf: 'PE', cep: [50000, 56999], lat: -8.0476, lon: -34.8770 },
    { uf: 'AL', cep: [57000, 57999], lat: -9.6498, lon: -35.7089 },
    { uf: 'PB', cep: [58000, 58999], lat: -7.1195, lon: -34.8450 },
    { uf: 'RN', cep: [59000, 59999], lat: -5.7945, lon: -35.2110 },
    { uf: 'CE', cep: [60000, 63999], lat: -3.7319, lon: -38.5267 },
    { uf: 'PI', cep: [64000, 64999], lat: -5.0919, lon: -42.8034 },
    { uf: 'MA', cep: [65000, 65999], lat: -2.5307, lon: -44.3068 },
    { uf: 'PA', cep: [66000, 68899], lat: -1.4558, lon: -48.4902 },
    { uf: 'AP', cep: [68900, 68999], lat: 0.0349, lon: -51.0694 },
    { uf: 'AM', cep: [69000, 69299], lat: -3.1190, lon: -60.0217 },
    { uf: 'RR', cep: [69300, 69399], lat: 2.8235, lon: -60.6758 },
    { uf: 'AC', cep: [69900, 69999], lat: -9.9754, lon: -67.8249 },
    { uf: 'DF', cep: [70000, 73699], lat: -15.7939, lon: -47.8828 },
    { uf: 'GO', cep: [72800, 76799], lat: -16.6869, lon: -49.2648 },
    { uf: 'TO', cep: [77000, 77999], lat: -10.1689, lon: -48.3317 },
    { uf: 'MT', cep: [78000, 78899], lat: -15.6014, lon: -56.0979 },
    { uf: 'RO', cep: [76800, 76999], lat: -8.7612, lon: -63.9004 },
    { uf: 'MS', cep: [79000, 79999], lat: -20.4697, lon: -54.6201 },
    { uf: 'PR', cep: [80000, 87999], lat: -25.4284, lon: -49.2733 },
    { uf: 'SC', cep: [88000, 89999], lat: -27.5954, lon: -48.5480 },
    { uf: 'RS', cep: [90000, 99999], lat: -30.0346, lon: -51.2177 }
  ];

  const SUL = ['SC', 'RS', 'PR'];

  const cidadePorId = (id) => CIDADES.find((c) => c.id === id) || null;

  /* CEP (8 dígitos) → cidade da lista, ou estado aproximado */
  function localPorCep(cepDigitado) {
    const cep = String(cepDigitado || '').replace(/\D/g, '');
    if (cep.length !== 8) return null;
    const prefixo = Number(cep.slice(0, 5));
    const cidade = CIDADES.find((c) => prefixo >= c.cep[0] && prefixo <= c.cep[1]);
    if (cidade) return { ...cidade, cepInformado: cep };
    const estado = ESTADOS.find((e) => prefixo >= e.cep[0] && prefixo <= e.cep[1]);
    if (!estado) return null;
    return { id: `uf-${estado.uf.toLowerCase()}`, nome: `Interior de ${estado.uf}`, uf: estado.uf, lat: estado.lat, lon: estado.lon, aproximado: true, cepInformado: cep };
  }

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }

  /* Região atual: escolhida pelo usuário, ou o CEP do endereço da conta */
  function atual() {
    const salvo = read();
    if (salvo) {
      if (salvo.cep) return localPorCep(salvo.cep);
      if (salvo.cidade) return cidadePorId(salvo.cidade);
    }
    try {
      const API = window.FrionexAPI;
      const sessao = API && API.sessao();
      if (sessao && API.getUsuariosSync) {
        const u = API.getUsuariosSync().find((x) => Number(x.id) === Number(sessao.id));
        const ends = API.getEnderecosSync ? API.getEnderecosSync().filter((e) => Number(e.usuario_id) === Number(sessao.id)) : [];
        const end = ends.find((e) => u && e.id === u.endereco_id) || ends[0];
        if (end && end.cep) return localPorCep(end.cep);
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  function definir({ cep, cidade }) {
    const valor = cep ? { cep: String(cep).replace(/\D/g, '') } : { cidade };
    const local = valor.cep ? localPorCep(valor.cep) : cidadePorId(valor.cidade);
    if (!local) return null;
    try { localStorage.setItem(KEY, JSON.stringify(valor)); } catch (e) { /* ignore */ }
    window.dispatchEvent(new CustomEvent('regiao:change', { detail: local }));
    return local;
  }

  function limpar() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    window.dispatchEvent(new CustomEvent('regiao:change', { detail: null }));
  }

  /* Distância rodoviária estimada (linha reta × 1,25) */
  function distanciaKm(a, b) {
    if (!a || !b) return null;
    const R = 6371;
    const rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    const reta = 2 * R * Math.asin(Math.sqrt(h));
    return Math.round(reta * 1.25);
  }

  const cidadeDoVendedor = (v) => (v && v.cidade ? cidadePorId(v.cidade) : null);

  /* Distância do comprador até o vendedor de um produto (ou null) */
  function distanciaProduto(produto, origem) {
    const local = origem === undefined ? atual() : origem;
    return distanciaKm(local, cidadeDoVendedor(produto && produto.vendedor));
  }

  /* Faixas usadas nos filtros e etiquetas */
  const FAIXAS = [
    { id: 'cidade', label: 'Na minha cidade', teste: (d, a, b) => d != null && (a.id === b.id || d <= 15) },
    { id: '100', label: 'Até 100 km', teste: (d) => d != null && d <= 100 },
    { id: '300', label: 'Até 300 km', teste: (d) => d != null && d <= 300 },
    { id: 'estado', label: 'No meu estado', teste: (d, a, b) => !!a && !!b && a.uf === b.uf },
    { id: 'sul', label: 'Região Sul', teste: (d, a, b) => !!b && SUL.includes(b.uf) }
  ];

  function dentroDaFaixa(produto, faixaId, origem) {
    const faixa = FAIXAS.find((f) => f.id === faixaId);
    if (!faixa) return true;
    const a = origem === undefined ? atual() : origem;
    const b = cidadeDoVendedor(produto.vendedor);
    return faixa.teste(distanciaKm(a, b), a, b);
  }

  /* Frete por distância (protótipo). Grátis acima de R$ 300 até 600 km. */
  function cotarFrete(distancia, subtotal) {
    const valor = Number(subtotal) || 0;
    if (distancia == null) return { valor: valor >= 300 ? 0 : 29.90, prazo: '3 a 7 dias úteis', tipo: 'padrao', estimado: false };
    let base; let prazo;
    if (distancia <= 15) { base = 0; prazo = 'no mesmo dia ou em 1 dia útil'; }
    else if (distancia <= 100) { base = 9.90; prazo = '1 dia útil'; }
    else if (distancia <= 300) { base = 19.90; prazo = '1 a 2 dias úteis'; }
    else if (distancia <= 600) { base = 29.90; prazo = '2 a 4 dias úteis'; }
    else if (distancia <= 1200) { base = 44.90; prazo = '4 a 7 dias úteis'; }
    else { base = 64.90; prazo = '6 a 10 dias úteis'; }
    const gratis = distancia <= 15 || (valor >= 300 && distancia <= 600) || (valor >= 150 && distancia <= 100);
    return { valor: gratis ? 0 : base, prazo, tipo: distancia <= 15 ? 'local' : 'padrao', estimado: true, retirada: distancia <= 30 };
  }

  /* Frete do carrinho: um envio por vendedor */
  function freteCarrinho(itens) {
    const local = atual();
    const porVendedor = new Map();
    itens.forEach((i) => {
      const v = i.produto.vendedor || { id: 0 };
      const grupo = porVendedor.get(v.id) || { vendedor: v, subtotal: 0 };
      grupo.subtotal += i.total;
      porVendedor.set(v.id, grupo);
    });
    const envios = [...porVendedor.values()].map((g) => {
      const distancia = distanciaKm(local, cidadeDoVendedor(g.vendedor));
      return { ...g, distancia, ...cotarFrete(distancia, g.subtotal) };
    });
    const total = Number(envios.reduce((s, e) => s + e.valor, 0).toFixed(2));
    return { envios, total, local };
  }

  const nomeLocal = (l) => (l ? (l.aproximado ? l.nome : `${l.nome}/${l.uf}`) : '');
  const formatarKm = (d) => (d == null ? '' : d <= 15 ? 'na sua cidade' : `a ${d.toLocaleString('pt-BR')} km`);

  window.FrionexRegiao = {
    CIDADES, FAIXAS, SUL,
    atual, definir, limpar, localPorCep, cidadePorId,
    distanciaKm, distanciaProduto, dentroDaFaixa, cidadeDoVendedor,
    cotarFrete, freteCarrinho, nomeLocal, formatarKm
  };
})();
