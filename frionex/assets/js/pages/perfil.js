/* =========================================================
   FRIONEX · Minha conta
   ========================================================= */
(function () {
  'use strict';

  const API = window.FrionexAPI;
  const UI = window.FrionexUI;
  const Store = window.FrionexStore;

  const session = Store.Auth.require('perfil.html');
  if (!session) return;

  const root = document.getElementById('profileRoot');
  const PANELS = ['perfil', 'enderecos', 'cartoes', 'seguranca', 'preferencias', 'pedidos'];

  let usuario = null;
  let enderecos = [];
  let cartoes = [];
  let pedidos = [];

  const dataBR = (iso) => {
    if (!iso) return '—';
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const dataCurta = (iso) => {
    if (!iso) return '—';
    const d = new Date(`${iso}T12:00:00`);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
  };

  const statusClass = (status) => {
    const mapa = {
      'Entregue': 'status-entregue',
      'Enviado': 'status-enviado',
      'Em preparo': 'status-preparo',
      'Aguardando pagamento': 'status-aguardando',
      'Cancelado': 'status-cancelado'
    };
    return mapa[status] || 'status-preparo';
  };

  const tipoLabel = (tipo) => (tipo === 'vendedor' ? 'Vendedor' : 'Comprador');

  /* ---------------- estrutura ---------------- */
  function layoutHTML() {
    return `
      <div class="profile-layout">
        <aside class="profile-nav" aria-label="Seções da conta">
          <a href="#perfil" data-panel-link="perfil" class="is-active">${UI.icon('user')} Meu perfil</a>
          <a href="#enderecos" data-panel-link="enderecos">${UI.icon('location')} Endereços</a>
          <a href="#cartoes" data-panel-link="cartoes">${UI.icon('card')} Cartões</a>
          <a href="#seguranca" data-panel-link="seguranca">${UI.icon('lock')} Segurança</a>
          <a href="#preferencias" data-panel-link="preferencias">${UI.icon('shield')} Preferências</a>
          <a href="#pedidos" data-panel-link="pedidos">${UI.icon('package')} Meus pedidos</a>
          <div class="nav-sep"></div>
          <a href="pedidos.html">${UI.icon('truck')} Acompanhar entregas</a>
          <button type="button" data-logout>${UI.icon('logout')} Sair da conta</button>
        </aside>

        <div>
          <section class="profile-panel is-active" data-panel="perfil" id="painelPerfil"></section>
          <section class="profile-panel" data-panel="enderecos" id="painelEnderecos"></section>
          <section class="profile-panel" data-panel="cartoes" id="painelCartoes"></section>
          <section class="profile-panel" data-panel="seguranca" id="painelSeguranca"></section>
          <section class="profile-panel" data-panel="preferencias" id="painelPreferencias"></section>
          <section class="profile-panel" data-panel="pedidos" id="painelPedidos"></section>
        </div>
      </div>`;
  }

  /* ---------------- painel: perfil ---------------- */
  function renderPerfil() {
    const el = document.getElementById('painelPerfil');
    if (!el || !usuario) return;
    el.innerHTML = `
      <div class="card card-pad">
        <div class="profile-hero">
          <span class="avatar avatar-xl">${usuario.foto ? `<img src="${usuario.foto}" alt="">` : UI.initials(usuario.nome)}</span>
          <div>
            <h2>
              ${UI.esc(usuario.nome)}
              ${usuario.verificado ? `<span class="badge-verified">${UI.icon('verified')} Verificado</span>` : ''}
            </h2>
            <p>${UI.esc(usuario.email)} · ${tipoLabel(usuario.tipo)} desde ${dataCurta(usuario.criado_em)}</p>
          </div>
          <button class="btn btn-outline" type="button" data-edit-profile>${UI.icon('edit')} Editar dados</button>
        </div>

        <form class="form-grid" data-profile-form autocomplete="off">
          <div class="field">
            <label for="pfNome">Nome completo</label>
            <input id="pfNome" name="nome" type="text" value="${UI.esc(usuario.nome)}" required>
          </div>
          <div class="field">
            <label for="pfUsuario">Nome de usuário</label>
            <input id="pfUsuario" name="nome_usuario" type="text" value="${UI.esc(usuario.nome_usuario || '')}" required>
          </div>
          <div class="field">
            <label for="pfEmail">E-mail</label>
            <input id="pfEmail" name="email" type="email" value="${UI.esc(usuario.email)}" required>
          </div>
          <div class="field">
            <label for="pfTelefone">Telefone</label>
            <input id="pfTelefone" name="telefone" type="tel" value="${UI.esc(usuario.telefone || '')}" placeholder="(48) 99999-0000">
          </div>
          <div class="field">
            <label for="pfCpf">CPF</label>
            <input id="pfCpf" name="cpf" type="text" value="${UI.esc(usuario.cpf || '')}" placeholder="000.000.000-00">
          </div>
          <div class="field">
            <label for="pfNasc">Data de nascimento</label>
            <input id="pfNasc" name="data_nasc" type="date" value="${UI.esc(usuario.data_nasc || '')}">
          </div>
          <div class="field full">
            <label for="pfHistorico">Sobre você</label>
            <textarea id="pfHistorico" name="historico" rows="3" placeholder="Conte um pouco sobre você ou sobre a sua loja.">${UI.esc(usuario.historico || '')}</textarea>
            <small>Essas informações aparecem no seu perfil público.</small>
          </div>
          <div class="form-actions" style="grid-column:1/-1">
            <button class="btn btn-ghost" type="reset">Descartar</button>
            <button class="btn btn-grad btn-save" type="submit">${UI.icon('check')} Salvar alterações</button>
          </div>
        </form>
      </div>`;
    UI.hydrateIcons(el);
  }

  /* ---------------- painel: endereços ---------------- */
  function renderEnderecos() {
    const el = document.getElementById('painelEnderecos');
    if (!el) return;
    const baseIds = (window.FrionexData?.enderecos || []).map((e) => e.id);
    el.innerHTML = `
      <div class="card card-pad">
        <div class="card-head">
          <div>
            <h2>Endereços de entrega</h2>
            <p>Cadastre os locais onde você costuma receber suas compras.</p>
          </div>
          <button class="btn btn-grad" type="button" data-add-address>${UI.icon('plus')} Novo endereço</button>
        </div>
        <div class="address-grid">
          ${enderecos.length ? enderecos.map((e, i) => `
            <article class="address-card ${i === 0 ? 'is-principal' : ''}">
              ${i === 0 ? '<span class="badge-principal">Principal</span>' : ''}
              <h3>${UI.esc(e.rua)}, ${UI.esc(e.numero)}</h3>
              <p>${UI.esc(e.bairro)} · ${UI.esc(e.cidade)}/${UI.esc(e.uf)}<br>CEP ${UI.esc(String(e.cep || '').replace(/(\d{5})(\d{3})/, '$1-$2'))}</p>
              <div class="card-actions">
                ${baseIds.includes(e.id)
                  ? '<span class="text-muted" style="font-size:11px">Endereço do cadastro</span>'
                  : `<button class="btn btn-danger-ghost btn-sm" type="button" data-remove-address="${e.id}">${UI.icon('trash')} Remover</button>`}
              </div>
            </article>`).join('') : `
            <div class="empty-state" style="grid-column:1/-1">
              <span class="empty-ico">${UI.icon('location')}</span>
              <h3>Nenhum endereço cadastrado</h3>
              <p>Adicione um endereço para agilizar o cálculo do frete no checkout.</p>
            </div>`}
        </div>
      </div>`;
    UI.hydrateIcons(el);
  }

  function abrirFormEndereco() {
    const root = UI.modal('Novo endereço', `
      <form data-address-form class="form-grid" autocomplete="off">
        <div class="field">
          <label for="adCep">CEP</label>
          <input id="adCep" name="cep" inputmode="numeric" maxlength="9" placeholder="00000-000" required>
        </div>
        <div class="field">
          <label for="adNumero">Número</label>
          <input id="adNumero" name="numero" type="text" placeholder="245" required>
        </div>
        <div class="field full">
          <label for="adRua">Rua / Avenida</label>
          <input id="adRua" name="rua" type="text" placeholder="Rua das Palmeiras" required>
        </div>
        <div class="field">
          <label for="adBairro">Bairro</label>
          <input id="adBairro" name="bairro" type="text" placeholder="Centro" required>
        </div>
        <div class="field">
          <label for="adCidade">Cidade</label>
          <input id="adCidade" name="cidade" type="text" value="Sombrio" required>
        </div>
        <div class="field">
          <label for="adUf">UF</label>
          <input id="adUf" name="uf" type="text" maxlength="2" value="SC" required>
        </div>
        <div class="field full">
          <small>Este é um protótipo: o endereço é salvo apenas neste navegador.</small>
        </div>
        <div class="form-actions" style="grid-column:1/-1">
          <button class="btn btn-ghost" type="button" data-modal-close>Cancelar</button>
          <button class="btn btn-grad" type="submit">${UI.icon('check')} Salvar endereço</button>
        </div>
      </form>`);
    root.querySelector('input[name="cep"]')?.focus();
  }

  /* ---------------- painel: cartões ---------------- */
  function renderCartoes() {
    const el = document.getElementById('painelCartoes');
    if (!el) return;
    el.innerHTML = `
      <div class="card card-pad">
        <div class="card-head">
          <div>
            <h2>Cartões e pagamentos</h2>
            <p>Seus cartões ficam salvos para agilizar as próximas compras.</p>
          </div>
          <button class="btn btn-grad" type="button" data-add-card>${UI.icon('plus')} Novo cartão</button>
        </div>
        <div class="cards-grid">
          ${cartoes.length ? cartoes.map((c) => `
            <article class="payment-card">
              ${c.principal ? '<span class="badge-principal">Principal</span>' : ''}
              <div class="card-brand"><span>${UI.esc(c.bandeira)}</span>${UI.icon('card')}</div>
              <div>
                <div class="card-number">•••• •••• •••• ${UI.esc(c.final)}</div>
                <div class="card-foot">
                  <span>${UI.esc(c.nome)}</span>
                  <span>Validade ${UI.esc(c.validade)}</span>
                </div>
              </div>
            </article>`).join('') : `
            <div class="empty-state" style="grid-column:1/-1">
              <span class="empty-ico">${UI.icon('card')}</span>
              <h3>Nenhum cartão salvo</h3>
              <p>Você ainda pode pagar com PIX ou boleto no checkout.</p>
            </div>`}
        </div>
      </div>`;
    UI.hydrateIcons(el);
  }

  function abrirFormCartao() {
    const root = UI.modal('Novo cartão', `
      <form data-card-form class="form-grid" autocomplete="off">
        <div class="field full">
          <label for="ccNome">Nome impresso no cartão</label>
          <input id="ccNome" name="nome" type="text" placeholder="SR BIGODES" required>
        </div>
        <div class="field">
          <label for="ccBandeira">Bandeira</label>
          <select id="ccBandeira" name="bandeira">
            <option>Visa</option>
            <option>Mastercard</option>
            <option>Elo</option>
            <option>Hipercard</option>
          </select>
        </div>
        <div class="field">
          <label for="ccFinal">Final do cartão</label>
          <input id="ccFinal" name="final" inputmode="numeric" maxlength="4" pattern="\\d{4}" placeholder="4242" required>
        </div>
        <div class="field">
          <label for="ccValidade">Validade</label>
          <input id="ccValidade" name="validade" type="text" maxlength="5" placeholder="09/29" required>
        </div>
        <div class="field full">
          <small>Protótipo: nenhum dado real de cartão é armazenado ou enviado.</small>
        </div>
        <div class="form-actions" style="grid-column:1/-1">
          <button class="btn btn-ghost" type="button" data-modal-close>Cancelar</button>
          <button class="btn btn-grad" type="submit">${UI.icon('check')} Salvar cartão</button>
        </div>
      </form>`);
    root.querySelector('input[name="nome"]')?.focus();
  }

  /* ---------------- painel: segurança ---------------- */
  function renderSeguranca() {
    const el = document.getElementById('painelSeguranca');
    if (!el) return;
    el.innerHTML = `
      <div class="card card-pad">
        <div class="card-head">
          <div>
            <h2>Segurança da conta</h2>
            <p>Altere sua senha e revise os acessos recentes.</p>
          </div>
          <span class="badge-verified">${UI.icon('shield')} Conta protegida</span>
        </div>
        <form class="form-grid" data-password-form autocomplete="off">
          <div class="field full">
            <label for="pwAtual">Senha atual</label>
            <input id="pwAtual" name="senha_atual" type="password" required placeholder="••••••••">
          </div>
          <div class="field">
            <label for="pwNova">Nova senha</label>
            <input id="pwNova" name="senha" type="password" minlength="8" required placeholder="Mínimo de 8 caracteres">
          </div>
          <div class="field">
            <label for="pwConfirma">Confirmar nova senha</label>
            <input id="pwConfirma" name="senha_confirma" type="password" minlength="8" required placeholder="Repita a nova senha">
          </div>
          <div class="form-actions" style="grid-column:1/-1">
            <button class="btn btn-grad" type="submit">${UI.icon('lock')} Atualizar senha</button>
          </div>
        </form>

        <div class="settings-list" style="margin-top:6px">
          <div class="settings-row">
            <div><strong>Verificação em duas etapas</strong><span>Adicione uma camada extra de proteção ao entrar.</span></div>
            <button class="btn btn-outline btn-sm" type="button" data-info="Verificação em duas etapas">Ativar</button>
          </div>
          <div class="settings-row">
            <div><strong>Sessões ativas</strong><span>Este navegador · Sombrio/SC · agora</span></div>
            <button class="btn btn-danger-ghost btn-sm" type="button" data-info="Encerrar outras sessões">Encerrar outras</button>
          </div>
          <div class="settings-row">
            <div><strong>Histórico de acessos</strong><span>Último login registrado em ${dataBR(new Date().toISOString().slice(0, 10))}.</span></div>
            <button class="btn btn-ghost btn-sm" type="button" data-info="Histórico de acessos">Ver histórico</button>
          </div>
        </div>
      </div>`;
    UI.hydrateIcons(el);
  }

  /* ---------------- painel: preferências ---------------- */
  function renderPreferencias() {
    const el = document.getElementById('painelPreferencias');
    if (!el) return;
    const p = API.prefs();
    const linhas = [
      ['cookies_analiticos', 'Cookies analíticos', 'Ajudam a entender como você usa a Frionex para melhorar a experiência.'],
      ['cookies_marketing', 'Cookies de marketing', 'Permitem mostrar ofertas de peças e equipamentos do seu interesse.'],
      ['perfil_publico', 'Perfil público', 'Exibe seu nome e histórico de compras na plataforma.'],
      ['mostrar_telefone', 'Mostrar telefone', 'Permite que vendedores vejam seu telefone para tirar dúvidas.'],
      ['notificacoes_email', 'Notificações por e-mail', 'Avisos de pedidos, ofertas e novidades de climatização.']
    ];
    el.innerHTML = `
      <div class="card card-pad">
        <div class="card-head">
          <div>
            <h2>Preferências</h2>
            <p>Escolha como seus dados são usados e como você quer ser avisado.</p>
          </div>
        </div>
        <div class="settings-list">
          ${linhas.map(([key, titulo, desc]) => `
            <div class="settings-row">
              <div><strong>${UI.esc(titulo)}</strong><span>${UI.esc(desc)}</span></div>
              <label class="switch">
                <input type="checkbox" data-pref="${key}" ${p[key] ? 'checked' : ''} aria-label="${UI.esc(titulo)}">
                <span></span>
              </label>
            </div>`).join('')}
        </div>
        <div class="form-actions">
          <button class="btn btn-outline" type="button" data-reset-prefs>Restaurar padrão</button>
          <button class="btn btn-grad" type="button" data-save-prefs>${UI.icon('check')} Salvar preferências</button>
        </div>
      </div>`;
    UI.hydrateIcons(el);
  }

  /* ---------------- painel: pedidos ---------------- */
  function orderCardHTML(pedido, resumido) {
    return `
      <article class="card order-card">
        <div class="order-head">
          <span class="order-id">Pedido #${pedido.id}</span>
          <span class="order-date">${dataBR(pedido.data)}</span>
          <span class="status ${statusClass(pedido.status)}">${UI.esc(pedido.status)}</span>
          <span style="margin-left:auto;font-size:11.5px;color:var(--muted)">${UI.icon('card')} ${UI.esc(pedido.pagamento)}</span>
        </div>
        <div class="order-body">
          ${pedido.itens.map((item) => `
            <div class="order-item">
              <img src="${item.produto ? item.produto.foto : 'assets/img/produtos/box.svg'}" alt="">
              <div class="order-item-info">
                <strong>${UI.esc(item.produto ? item.produto.nome : 'Produto')}</strong>
                <span>Qtd. ${item.quantidade} · ${UI.money(item.preco_unitario)} cada</span>
              </div>
              <span class="order-item-price">${UI.money(item.valor_total)}</span>
            </div>`).join('')}
        </div>
        <div class="order-foot">
          <span class="order-total">Total <strong>${UI.money(pedido.total)}</strong></span>
          <div class="order-actions">
            ${resumido ? `<a class="btn btn-outline btn-sm" href="pedidos.html">Acompanhar</a>` : ''}
            <a class="btn btn-soft btn-sm" href="produto.html?id=${pedido.itens[0]?.id_produto || 2}">Comprar novamente</a>
          </div>
        </div>
      </article>`;
  }

  function renderPedidos() {
    const el = document.getElementById('painelPedidos');
    if (!el) return;
    el.innerHTML = `
      <div class="card card-pad">
        <div class="card-head">
          <div>
            <h2>Pedidos recentes</h2>
            <p>Acompanhe entregas e repita compras anteriores.</p>
          </div>
          <a class="btn btn-outline btn-sm" href="pedidos.html">Ver todos ${UI.icon('arrow')}</a>
        </div>
        <div class="orders-list">
          ${pedidos.length
            ? pedidos.slice(0, 3).map((p) => orderCardHTML(p, true)).join('')
            : `<div class="empty-state">
                 <span class="empty-ico">${UI.icon('package')}</span>
                 <h3>Você ainda não tem pedidos</h3>
                 <p>Quando finalizar sua primeira compra, ela aparecerá aqui.</p>
                 <a class="btn btn-grad" href="index.html">Explorar catálogo</a>
               </div>`}
        </div>
      </div>`;
    UI.hydrateIcons(el);
  }

  /* ---------------- navegação entre painéis ---------------- */
  function ativarPainel(nome) {
    if (!PANELS.includes(nome)) nome = 'perfil';
    document.querySelectorAll('[data-panel]').forEach((p) => {
      p.classList.toggle('is-active', p.dataset.panel === nome);
    });
    document.querySelectorAll('[data-panel-link]').forEach((l) => {
      l.classList.toggle('is-active', l.dataset.panelLink === nome);
    });
    history.replaceState({}, '', `#${nome}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------------- carga ---------------- */
  async function carregarTudo() {
    const [u, e, c, ped] = await Promise.all([
      API.usuario(session.id),
      API.enderecos(session.id),
      API.cartoes(session.id),
      API.pedidos(session.id)
    ]);
    usuario = u || session;
    enderecos = e;
    cartoes = c;
    pedidos = ped;

    gridRender();
    const hash = (location.hash || '#perfil').replace('#', '');
    ativarPainel(hash);
  }

  function gridRender() {
    renderPerfil();
    renderEnderecos();
    renderCartoes();
    renderSeguranca();
    renderPreferencias();
    renderPedidos();
  }

  /* ---------------- eventos ---------------- */
  function bind() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-panel-link]');
      if (link) {
        e.preventDefault();
        ativarPainel(link.dataset.panelLink);
        return;
      }

      if (e.target.closest('[data-edit-profile]')) {
        ativarPainel('perfil');
        setTimeout(() => document.getElementById('pfNome')?.focus(), 250);
        return;
      }

      if (e.target.closest('[data-add-address]')) { abrirFormEndereco(); return; }
      if (e.target.closest('[data-add-card]')) { abrirFormCartao(); return; }

      const del = e.target.closest('[data-remove-address]');
      if (del) {
        const id = Number(del.dataset.removeAddress);
        del.disabled = true;
        API.removerEndereco(id).then(async () => {
          enderecos = await API.enderecos(session.id);
          renderEnderecos();
          UI.toast('Endereço removido.', 'info');
        }).catch((err) => UI.toast(err.message, 'error'));
        return;
      }

      if (e.target.closest('[data-save-prefs]')) {
        salvarPrefs();
        return;
      }

      if (e.target.closest('[data-reset-prefs]')) {
        API.salvarPrefs({
          cookies_analiticos: true, cookies_marketing: false, perfil_publico: true,
          mostrar_telefone: false, notificacoes_email: true
        });
        renderPreferencias();
        UI.toast('Preferências restauradas para o padrão.', 'info');
        return;
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-pref]')) {
        API.salvarPrefs({ [e.target.dataset.pref]: e.target.checked });
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target.matches('[data-profile-form]')) {
        e.preventDefault();
        salvarPerfil(e.target);
        return;
      }
      if (e.target.matches('[data-address-form]')) {
        e.preventDefault();
        salvarEndereco(e.target);
        return;
      }
      if (e.target.matches('[data-card-form]')) {
        e.preventDefault();
        salvarCartao(e.target);
        return;
      }
      if (e.target.matches('[data-password-form]')) {
        e.preventDefault();
        salvarSenha(e.target);
      }
    });
  }

  async function salvarPerfil(form) {
    const dados = Object.fromEntries(new FormData(form).entries());
    if (!dados.nome.trim() || !dados.email.trim()) {
      UI.toast('Preencha nome e e-mail.', 'error');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await API.atualizarPerfil(session.id, dados);
      UI.toast('Dados atualizados com sucesso.');
      setTimeout(() => { location.hash = '#perfil'; location.reload(); }, 800);
    } catch (err) {
      UI.toast(err.message, 'error');
      if (btn) btn.disabled = false;
    }
  }

  async function salvarEndereco(form) {
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
      await API.salvarEndereco(dados);
      enderecos = await API.enderecos(session.id);
      renderEnderecos();
      UI.closeModal();
      UI.toast('Endereço adicionado.');
    } catch (err) {
      UI.toast(err.message, 'error');
      if (btn) btn.disabled = false;
    }
  }

  async function salvarCartao(form) {
    const dados = Object.fromEntries(new FormData(form).entries());
    dados.id_usuario = Number(session.id);
    dados.principal = cartoes.length === 0;
    if (!/^\d{4}$/.test(dados.final)) {
      UI.toast('Informe os 4 últimos dígitos do cartão.', 'error');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(dados.validade)) {
      UI.toast('Informe a validade no formato MM/AA.', 'error');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await API.salvarCartao(dados);
      cartoes = await API.cartoes(session.id);
      renderCartoes();
      UI.closeModal();
      UI.toast('Cartão adicionado.');
    } catch (err) {
      UI.toast(err.message, 'error');
      if (btn) btn.disabled = false;
    }
  }

  async function salvarSenha(form) {
    const dados = Object.fromEntries(new FormData(form).entries());
    if (dados.senha !== dados.senha_confirma) {
      UI.toast('As novas senhas não coincidem.', 'error');
      return;
    }
    if (String(dados.senha).length < 8) {
      UI.toast('A nova senha deve ter pelo menos 8 caracteres.', 'error');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await API.login(usuario.email, dados.senha_atual);
      await API.atualizarPerfil(session.id, { senha: dados.senha });
      form.reset();
      UI.toast('Senha atualizada com sucesso.');
    } catch (err) {
      UI.toast('Senha atual incorreta. Tente novamente.', 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function salvarPrefs() {
    const prefs = {};
    document.querySelectorAll('[data-pref]').forEach((input) => {
      prefs[input.dataset.pref] = input.checked;
    });
    API.salvarPrefs(prefs);
    UI.toast('Preferências salvas.');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (!root) return;
    root.innerHTML = layoutHTML();
    bind();
    try {
      await carregarTudo();
    } catch (err) {
      root.innerHTML = `
        <div class="empty-state">
          <span class="empty-ico">${UI.icon('user')}</span>
          <h3>Não foi possível carregar sua conta</h3>
          <p>${UI.esc(err.message)}</p>
          <a class="btn btn-grad" href="index.html">Voltar ao início</a>
        </div>`;
    }
  });
})();
