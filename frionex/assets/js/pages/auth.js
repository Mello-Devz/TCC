/* =========================================================
   FRIONEX · Login e cadastro
   ========================================================= */
(function () {
  'use strict';

  const API = window.FrionexAPI;
  const UI = window.FrionexUI;
  const Store = window.FrionexStore;

  const params = new URLSearchParams(location.search);

  function destinoSeguro() {
    const raw = params.get('next');
    if (raw && /^[a-zA-Z0-9._-]+\.html(\?[^#]*)?$/.test(raw)) return raw;
    return 'index.html';
  }

  /* ---------------- máscaras ---------------- */
  const onlyDigits = (v) => String(v || '').replace(/\D/g, '');

  function maskCpf(value) {
    const d = onlyDigits(value).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }

  function maskPhone(value) {
    const d = onlyDigits(value).slice(0, 11);
    if (d.length <= 10) {
      return d
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return d
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }

  function maskCep(value) {
    const d = onlyDigits(value).slice(0, 8);
    return d.replace(/^(\d{5})(\d)/, '$1-$2');
  }

  const MASKS = { cpf: maskCpf, phone: maskPhone, cep: maskCep };

  function bindMasks() {
    document.querySelectorAll('[data-mask]').forEach((input) => {
      const fn = MASKS[input.dataset.mask];
      if (!fn) return;
      input.addEventListener('input', () => {
        input.value = fn(input.value);
      });
    });
  }

  /* ---------------- mostrar / ocultar senha ---------------- */
  function bindPasswordToggles() {
    document.querySelectorAll('[data-toggle-pass]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.togglePass);
        if (!input) return;
        const oculta = input.type === 'password';
        input.type = oculta ? 'text' : 'password';
        btn.setAttribute('aria-label', oculta ? 'Ocultar senha' : 'Mostrar senha');
        btn.classList.toggle('is-active', oculta);
      });
    });
  }

  /* ---------------- recuperar senha ----------------
     1) informa o e-mail → 2) recebe um código (aqui mostrado num "e-mail" simulado)
     3) digita o código e a nova senha. */
  function abrirRecuperacao(emailInicial, aoConcluir) {
    const m = UI.modal('Recuperar senha', `
      <div data-step="1">
        <p style="font-size:13.5px;color:var(--muted);margin-bottom:12px">Informe o e-mail da sua conta. Enviaremos um código de 6 dígitos para criar uma nova senha.</p>
        <div class="field">
          <label for="recEmail">E-mail</label>
          <input id="recEmail" type="email" placeholder="seu@email.com" value="${UI.esc(emailInicial || '')}">
        </div>
      </div>
      <div data-step="2" hidden>
        <div class="fake-mail">
          <span>${UI.icon('mail')} <strong>E-mail recebido</strong> · Frionex</span>
          <p>Seu código para redefinir a senha é <b data-codigo></b>. Ele vale por 10 minutos.</p>
          <small>Protótipo: o e-mail é simulado aqui na tela.</small>
        </div>
        <div class="field">
          <label for="recCodigo">Código</label>
          <input id="recCodigo" inputmode="numeric" maxlength="6" placeholder="000000">
        </div>
        <div class="field">
          <label for="recSenha">Nova senha</label>
          <input id="recSenha" type="password" placeholder="Mínimo 8 caracteres" autocomplete="new-password">
        </div>
      </div>`, {
      footer: `<button class="btn btn-outline" type="button" data-modal-close>Cancelar</button>
               <button class="btn btn-grad" type="button" data-rec-next>${UI.icon('mail')} Enviar código</button>`
    });
    const btn = m.querySelector('[data-rec-next]');
    let etapa = 1;
    let emailConta = '';
    setTimeout(() => m.querySelector('#recEmail').focus(), 50);
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        if (etapa === 1) {
          const r = await API.solicitarCodigo(m.querySelector('#recEmail').value);
          emailConta = r.email;
          m.querySelector('[data-codigo]').textContent = r.codigo;
          m.querySelector('[data-step="1"]').hidden = true;
          m.querySelector('[data-step="2"]').hidden = false;
          btn.innerHTML = `${UI.icon('check')} Salvar nova senha`;
          etapa = 2;
          setTimeout(() => m.querySelector('#recCodigo').focus(), 50);
        } else {
          await API.redefinirSenha(emailConta, m.querySelector('#recCodigo').value, m.querySelector('#recSenha').value);
          UI.closeModal();
          UI.toast('Senha alterada! Entre com a nova senha.');
          aoConcluir(emailConta);
        }
      } catch (err) {
        UI.toast(err.message, 'error');
      }
      btn.disabled = false;
    });
  }

  /* ---------------- login ---------------- */
  function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const email = form.querySelector('[name="email"]');
    const senha = form.querySelector('[name="senha"]');
    const submit = form.querySelector('button[type="submit"]');

    if (params.get('cadastro') === '1') {
      UI.toast('Conta criada! Agora entre com seu e-mail e senha.', 'info');
    }

    document.querySelectorAll('[data-demo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tipo = btn.dataset.demo;
        email.value = tipo === 'vendedor' ? 'vendedor@frionex.com' : 'comprador@frionex.com';
        senha.value = '12345678';
        UI.toast(`Credenciais de ${tipo} preenchidas. Clique em "Entrar na minha conta".`, 'info');
        submit.focus();
      });
    });

    document.querySelector('[data-forgot]')?.addEventListener('click', (e) => {
      e.preventDefault();
      abrirRecuperacao(email.value.trim(), (emailOk) => {
        email.value = emailOk;
        senha.value = '';
        senha.focus();
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailVal = email.value.trim();
      const senhaVal = senha.value;
      if (!emailVal || !senhaVal) {
        UI.toast('Informe e-mail e senha.', 'error');
        return;
      }
      submit.disabled = true;
      const original = submit.innerHTML;
      submit.innerHTML = 'Entrando…';
      try {
        const session = await API.login(emailVal, senhaVal);
        Store.Auth.set(session);
        UI.toast(`Bem-vindo(a), ${String(session.nome).split(' ')[0]}!`);
        setTimeout(() => { location.href = destinoSeguro(); }, 700);
      } catch (err) {
        UI.toast(err.message, 'error');
        submit.disabled = false;
        submit.innerHTML = original;
        senha.select();
      }
    });
  }

  /* ---------------- cadastro ---------------- */
  function initCadastro() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const tipoInput = document.getElementById('tipoConta');
    const sellerNote = document.getElementById('sellerNote');
    const addressNote = document.getElementById('addressNote');
    const submit = form.querySelector('button[type="submit"]');

    function setTipo(tipo) {
      const vendedor = tipo === 'vendedor';
      tipoInput.value = vendedor ? 'vendedor' : 'comprador';
      document.querySelectorAll('[data-tipo]').forEach((b) => {
        b.classList.toggle('is-active', b.dataset.tipo === tipoInput.value);
      });
      if (sellerNote) sellerNote.hidden = !vendedor;
      if (addressNote) addressNote.hidden = vendedor;
    }

    document.querySelectorAll('[data-tipo]').forEach((btn) => {
      btn.addEventListener('click', () => setTipo(btn.dataset.tipo));
    });

    const tipoParam = params.get('tipo');
    if (tipoParam === 'vendedor') setTipo('vendedor');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dados = Object.fromEntries(new FormData(form).entries());
      const erro = (msg) => {
        UI.toast(msg, 'error');
        return false;
      };

      if (!String(dados.nome).trim()) return erro('Informe seu nome completo.');
      if (!String(dados.nome_usuario).trim()) return erro('Escolha um nome de usuário.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(dados.email).trim())) return erro('Informe um e-mail válido.');
      if (String(dados.senha).length < 8) return erro('A senha deve ter pelo menos 8 caracteres.');
      if (dados.senha !== dados.senha_confirma) return erro('As senhas não coincidem.');
      if (!form.querySelector('[name="termos"]').checked) return erro('Aceite os termos de uso para continuar.');
      if (dados.cep && onlyDigits(dados.cep).length !== 8) return erro('Informe um CEP com 8 dígitos.');

      submit.disabled = true;
      const original = submit.innerHTML;
      submit.innerHTML = 'Criando conta…';

      try {
        const session = await API.cadastrar({
          ...dados,
          email: String(dados.email).trim(),
          nome: String(dados.nome).trim(),
          nome_usuario: String(dados.nome_usuario).trim(),
          cep: dados.cep ? onlyDigits(dados.cep) : null,
          senha_confirma: undefined,
          termos: undefined
        });
        Store.Auth.set(session);
        UI.toast('Conta criada com sucesso! Bem-vindo(a) à Frionex.');
        setTimeout(() => { location.href = destinoSeguro(); }, 800);
      } catch (err) {
        UI.toast(err.message, 'error');
        submit.disabled = false;
        submit.innerHTML = original;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindMasks();
    bindPasswordToggles();
    initLogin();
    initCadastro();
  });
})();
