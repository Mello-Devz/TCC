# Frionex · Protótipo do marketplace

Protótipo web do **Frionex**, um marketplace de compra e venda de ar-condicionado, peças, ferramentas e acessórios de climatização. O projeto foi construído em **HTML, CSS e JavaScript puro**, sem backend e sem banco de dados, a partir da prototipação em PDF e da modelagem lógica do TCC.

O objetivo desta etapa é validar telas, navegação e fluxos de compra. A camada de dados foi isolada para que, quando o banco entrar, apenas o corpo dos métodos da API precise ser trocado por chamadas ao backend.

---

## Como rodar

### Opção 1 · Servidor incluído (Windows, sem instalar nada)

```powershell
cd C:\Users\migue\Documents\IFC\TCC\frionex
powershell -ExecutionPolicy Bypass -File server.ps1
```

Depois abra **http://localhost:8765/**.

Para usar outra porta:

```powershell
powershell -ExecutionPolicy Bypass -File server.ps1 -Port 3000
```

### Opção 2 · VS Code Live Server

Abra a pasta do projeto no VS Code, clique com o botão direito em `index.html` e escolha **Open with Live Server**.

### Opção 3 · Abrir o arquivo direto

Também é possível abrir `index.html` no navegador (`file://`), mas recomenda-se um servidor local para que o `localStorage` e os caminhos dos assets se comportem da mesma forma em todos os navegadores.

> Não há dependências de Node.js, Python ou gerenciador de pacotes.

---

## Credenciais de demonstração

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Comprador (Sombrio/SC) | `comprador@frionex.com` | `12345678` |
| Vendedor · Vendo Ar-Condicionado (Sombrio/SC) | `vendedor@frionex.com` | `12345678` |
| Vendedor · Clima Sul Refrigeração (Criciúma/SC) | `climasul@frionex.com` | `12345678` |
| Vendedor · Gaúcha Ar & Peças (Porto Alegre/RS) | `gaucha@frionex.com` | `12345678` |
| Vendedor · Paraná Climatização (Curitiba/PR) | `parana@frionex.com` | `12345678` |
| Vendedor · Frio Paulista Distribuidora (São Paulo/SP) | `friopaulista@frionex.com` | `12345678` |

"Esqueci minha senha" funciona: o código de 6 dígitos aparece num e-mail simulado na própria tela.

A tela de login tem botões que preenchem essas credenciais automaticamente. Também é possível criar uma conta nova em `cadastro.html`.

---

## Cupons de desconto

| Cupom | Efeito |
| --- | --- |
| `FRIONEX10` | 10% de desconto no subtotal |
| `FRETEGRATIS` | Zera o frete |
| `BEMVINDO15` | R$ 15,00 de desconto |

Regras do protótipo: **7% de desconto no PIX** e frete calculado pela distância (veja "Regionalização").

---

## Regionalização (o diferencial do Frionex)

O objetivo do sistema é aproximar quem compra de quem vende peças na mesma região. Isso aparece em todo o site (`assets/js/regiao.js`):

- **Região do comprador**: "Enviar para…" no topo. Vem do CEP do endereço da conta ou é escolhida pelo usuário (CEP ou cidade). Fica salva em `frionex:regiao`.
- **Distância até cada vendedor**: cada loja tem uma cidade; a distância é a linha reta entre as cidades × 1,25 (estimativa de estrada). Aparece nos cards ("Criciúma/SC · a 67 km"), na página do produto e na loja.
- **Filtro "Distância de você"** no catálogo (na minha cidade, até 100 km, até 300 km, no meu estado, Região Sul), ordenação **"Mais próximos de mim"** e a seção **Perto de você** na home (`index.html?perto=1`).
- **Frete por distância**, um envio por vendedor:

| Distância | Frete | Prazo |
| --- | --- | --- |
| até 15 km (mesma cidade) | grátis · retirada na loja | mesmo dia / 1 dia útil |
| até 100 km | R$ 9,90 (grátis acima de R$ 150) | 1 dia útil |
| até 300 km | R$ 19,90 (grátis acima de R$ 300) | 1 a 2 dias úteis |
| até 600 km | R$ 29,90 (grátis acima de R$ 300) | 2 a 4 dias úteis |
| até 1.200 km | R$ 44,90 | 4 a 7 dias úteis |
| acima | R$ 64,90 | 6 a 10 dias úteis |

- **"Também vendido perto de você"**: na página do produto, o mesmo tipo de peça em outros vendedores, do mais perto para o mais longe — dá para comparar preço × distância × frete.
- **Retirada na loja** no checkout só aparece quando todos os vendedores do carrinho estão a até 30 km.

---

## Telas

| Arquivo | Tela | Principais recursos |
| --- | --- | --- |
| `index.html` | Home / catálogo | Carrossel, categorias, ofertas, busca, filtros, ordenação, favoritos |
| `produto.html?id=2` | Detalhe do produto | Galeria, preço/PIX, quantidade, frete por CEP, abas, avaliações, relacionados |
| `loja.html?id=1` | Página da loja | Capa, dados do vendedor, estatísticas, abas, seguir loja, grade de produtos |
| `login.html` | Entrar | Login, contas demo, `?next=` para voltar à página protegida |
| `cadastro.html` | Criar conta | Comprador/vendedor, máscaras, validações, endereço opcional |
| `perfil.html` | Minha conta | Perfil, endereços, cartões, segurança, preferências e pedidos recentes |
| `carrinho.html` | Carrinho | Quantidades, remoção, cupom, frete por CEP, resumo |
| `checkout.html` | Checkout | Endereço, envio/retirada, PIX/cartão/boleto, revisão e confirmação |
| `pedidos.html` | Meus pedidos | Filtros, rastreio em modal, "comprar novamente" |
| `vender.html` | Painel do vendedor | Só para contas de vendedor. **Anúncios**: anunciar (com foto), editar, excluir, cidade da loja. **Vendas**: pedidos recebidos, confirmar pagamento, enviar com código de rastreio, confirmar entrega, cancelar |
| `mensagens.html` | Mensagens | Chat comprador ↔ vendedor ligado ao produto ou pedido, respostas rápidas, contador de não lidas no topo |

O botão **Vender** do topo aparece para visitantes (leva ao cadastro de vendedor) e para vendedores (abre o painel); para compradores logados ele some. Os produtos anunciados ficam salvos no navegador (`frionex:produtos`) e já aparecem no catálogo, na busca e na página da loja.

O carrinho funciona sem login. As páginas `perfil`, `checkout` e `pedidos` usam `Store.Auth.require(next)` e redirecionam para o login quando não há sessão, voltando à página original depois da autenticação.

---

## Estrutura do projeto

```text
frionex/
├── index.html
├── produto.html
├── loja.html
├── login.html
├── cadastro.html
├── perfil.html
├── carrinho.html
├── checkout.html
├── pedidos.html
├── server.ps1
├── README.md
└── assets/
    ├── css/
    │   └── styles.css          # design system, componentes e responsivo
    ├── img/
    │   ├── logo.svg            # logo colorida (fundo claro)
    │   ├── logo-white.svg      # logo colorida (fundo escuro / header)
    │   ├── logo.png / logo-white.png
    │   ├── avatar-loja.svg
    │   ├── favicon.svg
    │   └── produtos/           # foto do Samsung (as demais vêm do Wikimedia Commons)
    └── js/
        ├── data.js             # dados demo espelhando o modelo lógico
        ├── api.js              # API simulada (contrato pronto para fetch)
        ├── store.js            # carrinho, favoritos, sessão, cupons
        ├── ui.js               # header/footer, cards, ícones, toast e modal
        └── pages/
            ├── home.js
            ├── produto.js
            ├── loja.js
            ├── auth.js
            ├── perfil.js
            ├── carrinho.js
            ├── checkout.js
            └── pedidos.js
```

### Camadas

1. **`data.js`** — dados de demonstração com a mesma nomenclatura das tabelas do modelo lógico.
2. **`api.js`** — todos os métodos são assíncronos e devolvem promessas. As telas nunca leem `data.js` diretamente para regras de negócio.
3. **`store.js`** — estado do cliente persistido no navegador (carrinho, favoritos, sessão, cupom, preferências).
4. **`ui.js`** — componentes compartilhados (header, footer, cards de produto, ícones SVG, toast e modal).
5. **`pages/*.js`** — comportamento específico de cada tela.

---

## Persistência no navegador

Enquanto não há banco, os dados do usuário ficam no `localStorage`:

| Chave | Conteúdo |
| --- | --- |
| `frionex:sessao` | Sessão do usuário logado (sem senha) |
| `frionex:usuarios` | Usuários criados/editados no protótipo |
| `frionex:enderecos` | Endereços adicionados |
| `frionex:cartoes` | Cartões adicionados (bandeira, final, validade) |
| `frionex:pedidos` | Pedidos criados no checkout |
| `frionex:avaliacoes` | Avaliações criadas |
| `frionex:carrinho` | Itens do carrinho (`id_produto`, `quantidade`) |
| `frionex:favoritos` | IDs de produtos favoritados |
| `frionex:cupom` | Cupom aplicado |
| `frionex:prefs` | Preferências de privacidade/notificações |
| `frionex:regiao` | CEP ou cidade escolhida pelo comprador |
| `frionex:produtos` / `frionex:produtos-removidos` | Anúncios criados/editados/excluídos pelos vendedores |
| `frionex:vendedores` | Lojas criadas/editadas (nome, cidade, descrição) |
| `frionex:pedidos-status` | Status e código de rastreio atualizados pelo vendedor |
| `frionex:mensagens` | Conversas do chat |

Para reiniciar a demonstração, limpe os dados do site no navegador ou execute `localStorage.clear()` no console.

---

## Mapeamento com o modelo lógico

| Modelo lógico | Implementação no protótipo |
| --- | --- |
| `usuario` | `data.usuarios` + `frionex:usuarios`; sessão em `frionex:sessao` |
| `comprador` | `data.compradores`; vínculo usuário → comprador em `resolveCompradorId()` |
| `vendedor` | `data.vendedores`; usado por `loja.html` e pelos produtos |
| `endereco` | `data.enderecos` + `frionex:enderecos`; CRUD em `API.enderecos` |
| `categoria` / `subcategoria` | `data.categorias` e `data.subcategorias` |
| `produto` | `data.produtos`; filtros em `API.produtos()` |
| `pedido` | `data.pedidos` + `frionex:pedidos`; criado por `API.criarPedido()` |
| `item_pedido` | Array `pedido.itens` (produto, quantidade, preço unitário e total) |
| `avaliacao` | `data.avaliacoes` + `frionex:avaliacoes`; lida por `API.avaliacoes()` |
| `cartao` (apoio) | `data.cartoes` + `frionex:cartoes` |
| `conversas` / chat | Botões de conversa exibem aviso de protótipo; sem tela de mensagens |
| Cupons | `Store.Cupom`, com os códigos listados acima |

### Decisões e campos extras do protótipo

- No modelo lógico, pedidos e avaliações apontam para `comprador.id`. A sessão guarda `usuario.id`; a ponte é feita por `resolveCompradorId()` e, no futuro, deve ser resolvida no backend.
- O pedido grava os campos extras `frete`, `desconto` e `total` para refletir exatamente o valor pago (cupom + desconto PIX). Esses campos podem virar colunas em `pedido` ou ser recalculados a partir de `item_pedido`.
- O cadastro de vendedor cria apenas o `usuario` com `tipo = 'vendedor'`; ainda não cria o registro correspondente em `vendedor` nem um painel de anúncios. Essa é a principal limitação atual do protótipo.
- Senhas ficam em texto puro no `localStorage` apenas para viabilizar a demonstração. No backend, devem ser armazenadas com hash (bcrypt/argon2).
- Nenhum dado real de cartão é armazenado: o protótipo guarda somente bandeira, 4 últimos dígitos e validade.
- Nenhum pagamento é processado de verdade. PIX, cartão e boleto são apenas simulações de fluxo.

---

## Como substituir a API simulada pelo banco

O contrato usado pelas telas já é assíncrono. Para integrar, troque o corpo dos métodos de `assets/js/api.js` por `fetch()`, por exemplo:

```js
async produtos(filtros = {}) {
  const qs = new URLSearchParams(filtros).toString();
  const resposta = await fetch(`/api/produtos?${qs}`);
  if (!resposta.ok) throw new Error('Não foi possível carregar os produtos.');
  return resposta.json();
}
```

Sugestão de endpoints:

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/api/categorias` | Categorias e subcategorias |
| GET | `/api/produtos` | Listagem com filtros e ordenação |
| GET | `/api/produtos/:id` | Detalhe + avaliações |
| GET | `/api/vendedores/:id` | Página da loja |
| POST | `/api/auth/login` | Autenticação |
| POST | `/api/auth/cadastro` | Cadastro de comprador/vendedor |
| GET/PUT | `/api/usuarios/:id` | Perfil |
| GET/POST/DELETE | `/api/enderecos` | Endereços |
| GET/POST | `/api/cartoes` | Cartões |
| GET/POST | `/api/pedidos` | Histórico e criação de pedido |
| PATCH | `/api/pedidos/:id/status` | Rastreio/atualização de status |
| POST | `/api/avaliacoes` | Nova avaliação |
| GET/PUT | `/api/prefs` | Preferências |

Pontos de atenção na integração:

- Recalcular frete, cupom, desconto PIX e total **no servidor** para não confiar apenas no cliente.
- Validar estoque e preço no momento de criar o pedido.
- Resolver `usuario.id` → `comprador.id` no backend.
- Proteger rotas e dados por sessão/autenticação real.
- Paginar catálogo, pedidos e avaliações quando o volume crescer.

---

## Próximos passos sugeridos

1. Trocar a tabela de cidades por uma API de CEP (ex.: ViaCEP) e coordenadas reais, e o frete estimado por uma cotação real (Correios/transportadoras).
2. Implementar avaliação real a partir de pedidos entregues.
3. Notificações (e-mail/push) para novas vendas e mensagens.
4. Criar painel administrativo (aprovação de vendedores, mediação, categorias).
5. Integrar gateway de pagamento e cálculo real de frete.
6. Modelar e criar o banco de dados a partir do modelo lógico, usando os contratos de `api.js` como referência.
7. Adicionar testes automatizados de fluxo (login, carrinho, checkout e pedidos).

---

## Testes já realizados no protótipo

- Navegação entre todas as telas e verificação de erros no console (nenhum erro encontrado).
- Login com as duas contas demo, cadastro de comprador (com endereço) e de vendedor.
- Busca, filtros, favoritos e abertura de produto/loja.
- Carrinho: quantidade, remoção, limpar, cupom e cálculo de frete.
- Checkout: endereço, envio/retirada, PIX/cartão/boleto, criação do pedido e persistência do total pago.
- Perfil: edição de dados, inclusão de endereço e cartão, troca de senha e preferências.
- Pedidos: filtros, rastreio em modal e "comprar novamente".
- Verificação de imagens quebradas e overflow horizontal em todas as páginas.

---

## Identidade visual

Cores tiradas da prototipação (`_proto.pdf`):

| Uso | Cor |
| --- | --- |
| Header / fundo da marca | `#000000` |
| Barra de navegação | `#414443` |
| Azul (carrossel, links, "F" da logo) | `#0E6AE8` · `#1766D3` · `#2173F0` |
| Verde (destaques, "N" da logo) | `#01C78C` · `#10A976` |
| Cinzas de fundo | `#F4F4F4` · `#F1F1F1` · `#D9D9D9` |
| Botão "Comprar" | gradiente `#069AAD → #78D65B` |
| Botões "Entrar" / "Registrar" | gradiente `#5ADBE4 → #0553B0` |

## Créditos das fotos

As fotos dos produtos foram baixadas do Wikimedia Commons e ficam em `assets/img/produtos/` (o site funciona sem internet). Créditos e licenças:

| Produto | Arquivo | Autor | Licença |
| --- | --- | --- | --- |
| Split (LG) | [Panasonic CS-R13KR10](https://commons.wikimedia.org/wiki/File:Panasonic_AIR_CONDITIONER_INDOOR_UNIT_CS-R13KR10.jpg) | Dinkun Chen | CC BY-SA 4.0 |
| Split (Midea) | [Panasonic CS-C10KJ2](https://commons.wikimedia.org/wiki/File:Panasonic_AIR_CONDITIONER_INDOOR_UNIT_CS-C10KJ2.jpg) | Dinkun Chen | CC BY-SA 4.0 |
| Condensadora | [SHARP outdoor unit](https://commons.wikimedia.org/wiki/File:SHARP_air_conditioner_outdoor_unit_20201003.jpg) | 円周率３パーセント | CC BY-SA 4.0 |
| Controle remoto | [Electrolux A.C remote](https://commons.wikimedia.org/wiki/File:A.c_remote.jpg) | Pramodkumartk | CC BY-SA 4.0 |
| Placa eletrônica | [Circuit board](https://commons.wikimedia.org/wiki/File:Close-up_view_of_a_circuit_board_being_held_near_an_air_conditioning_unit_in_a_contemporary_indoor_environment.jpg) | Shixart1985 | CC BY 2.0 |
| Manifold | [HVAC-R operations](https://commons.wikimedia.org/wiki/File:332nd_Expeditionary_CE_Squadron_HVAC-R_operations_(9305714).jpg) | U.S. Air Force | Domínio público |
| Bomba de vácuo | [Edwards E2M2](https://commons.wikimedia.org/wiki/File:Edwards_E2M2_2-Stage_Rotary_Vane_Vacuum_Pump_(15957733526).jpg) | Kitmondo Marketplace | CC BY 2.0 |
| Kit de instalação | [Copper pipe](https://commons.wikimedia.org/wiki/File:Copper_pipe_8072.JPG) | Myke2020 | Domínio público |
| Filtro | [HVAC air filter](https://commons.wikimedia.org/wiki/File:HVAC_air_filter.webp) | Wikideas1 | CC0 |

