(async function () {
  'use strict';

  if (window.__operaAuthLoaded) return;
  window.__operaAuthLoaded = true;

  const CONFIG_URL = './api/supabase-config';
  const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

  const state = {
    client: null,
    session: null,
    user: null
  };

  window.operaAuthState = state;

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[ch]));

  const ensureOverlay = () => {
    if (document.getElementById('opera-auth-gate')) return document.getElementById('opera-auth-gate');
    const el = document.createElement('div');
    el.id = 'opera-auth-gate';
    el.innerHTML = `
      <style>
        #opera-auth-gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:#071a39;font-family:Arial,sans-serif}
        #opera-auth-card{width:min(420px,100%);box-sizing:border-box;background:#fff;border-radius:22px;padding:30px;box-shadow:0 24px 70px rgba(0,0,0,.28)}
        #opera-auth-card h1{margin:0 0 8px;font-size:28px;color:#071a39;letter-spacing:.5px}
        #opera-auth-card p{margin:0 0 24px;color:#64748b;line-height:1.45}
        #opera-auth-card label{display:block;margin:14px 0 6px;font-size:13px;font-weight:700;color:#334155}
        #opera-auth-card input{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #cbd5e1;border-radius:12px;font-size:16px;outline:none}
        #opera-auth-card input:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}
        #opera-auth-submit{width:100%;margin-top:20px;border:0;border-radius:12px;padding:14px;background:#071a39;color:#fff;font-size:16px;font-weight:700;cursor:pointer}
        #opera-auth-submit:disabled{opacity:.6;cursor:wait}
        #opera-auth-message{min-height:20px;margin-top:14px;font-size:13px;line-height:1.4;color:#b91c1c}
        #opera-auth-status{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483646;background:#fff;border-radius:12px;padding:12px 14px;box-shadow:0 10px 30px rgba(0,0,0,.18);font:13px Arial,sans-serif;color:#334155}
      </style>
      <div id="opera-auth-card">
        <h1>OPERA ONE</h1>
        <p>Acesso seguro ao sistema operacional.</p>
        <form id="opera-auth-form" autocomplete="on">
          <label for="opera-auth-email">E-mail</label>
          <input id="opera-auth-email" name="email" type="email" autocomplete="username" required placeholder="seu@email.com">
          <label for="opera-auth-password">Senha</label>
          <input id="opera-auth-password" name="password" type="password" autocomplete="current-password" required placeholder="Sua senha">
          <button id="opera-auth-submit" type="submit">Entrar</button>
          <div id="opera-auth-message" role="alert" aria-live="polite"></div>
        </form>
      </div>`;
    document.body.appendChild(el);
    return el;
  };

  const showGate = (message = '') => {
    const gate = ensureOverlay();
    gate.style.display = 'flex';
    const msg = document.getElementById('opera-auth-message');
    if (msg) msg.textContent = message;
  };

  const hideGate = () => {
    const gate = document.getElementById('opera-auth-gate');
    if (gate) gate.remove();
  };

  const loadScript = src => new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-opera-supabase]');
    if (existing) {
      if (window.supabase) return resolve();
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.operaSupabase = '1';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Não foi possível carregar o cliente Supabase.'));
    document.head.appendChild(script);
  });

  const fetchConfig = async () => {
    const response = await fetch(CONFIG_URL + '?v=1', { cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url || !data.publishableKey) {
      throw new Error(data.error || 'Supabase ainda não configurado.');
    }
    return data;
  };

  const setMessage = text => {
    const msg = document.getElementById('opera-auth-message');
    if (msg) msg.textContent = text || '';
  };

  const bindLogin = () => {
    const form = document.getElementById('opera-auth-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = '1';
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = document.getElementById('opera-auth-submit');
      const email = document.getElementById('opera-auth-email')?.value.trim();
      const password = document.getElementById('opera-auth-password')?.value;
      if (!email || !password) return;
      button.disabled = true;
      setMessage('Validando acesso…');
      try {
        const { data, error } = await state.client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        state.session = data.session;
        state.user = data.user;
        hideGate();
        window.dispatchEvent(new CustomEvent('opera-auth-ready', { detail: state.user }));
      } catch (error) {
        setMessage('Não foi possível entrar. Verifique e-mail e senha.');
      } finally {
        button.disabled = false;
      }
    });
  };

  const init = async () => {
    showGate('Inicializando segurança…');
    await loadScript(SUPABASE_CDN);
    const config = await fetchConfig();
    state.client = window.supabase.createClient(config.url, config.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    window.operaSupabase = state.client;

    const { data: sessionData } = await state.client.auth.getSession();
    state.session = sessionData?.session || null;
    state.user = state.session?.user || null;

    state.client.auth.onAuthStateChange((event, session) => {
      state.session = session || null;
      state.user = session?.user || null;
      if (event === 'SIGNED_OUT') {
        window.location.reload();
        return;
      }
      if (session && document.getElementById('opera-auth-gate')) {
        hideGate();
        window.dispatchEvent(new CustomEvent('opera-auth-ready', { detail: state.user }));
      }
    });

    if (!state.session) {
      showGate('Faça login para continuar.');
      bindLogin();
      return;
    }

    hideGate();
    window.dispatchEvent(new CustomEvent('opera-auth-ready', { detail: state.user }));
  };

  window.operaAuthReady = init().catch(error => {
    console.error('OPERA ONE auth error:', error);
    showGate(error.message || 'Falha ao inicializar a autenticação.');
    bindLogin();
    throw error;
  });
})();
