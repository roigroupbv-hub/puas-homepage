// Simple password screen in front of the whole site (loaded in <head> on every page).
// Client-side only: it keeps casual visitors and search engines out, it is not real security.
// Only a SHA-256 fingerprint of the password is stored here, never the password itself.
(function () {
  const KEY = 'puas-toegang';
  const HASH = '0fca7246d4de6bc379760b35b64022fb283135f67492431c59ac03742f235005';

  let open = false;
  try { open = localStorage.getItem(KEY) === HASH; } catch { /* storage blocked: ask every time */ }
  if (open) return;

  document.documentElement.classList.add('is-locked');
  const style = document.createElement('style');
  style.textContent = `
    html.is-locked body > *:not(.gate) { display: none !important; }
    html.is-locked body { background: #1F1A16; }
    .gate {
      position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px;
      background: linear-gradient(rgba(31,26,22,.5), rgba(31,26,22,.5)), url('img/batik-kawung.webp') center / cover no-repeat, #1F1A16;
      font-family: 'Jost', sans-serif; color: #F4EFE6; -webkit-font-smoothing: antialiased;
    }
    .gate__box { width: min(420px, 100%); text-align: center; }
    .gate__logo { height: 72px; width: auto; margin: 0 auto 28px; display: block; }
    .gate h1 { margin: 0 0 10px; font: 700 28px/1.2 'Philosopher', sans-serif; }
    .gate p { margin: 0 0 28px; font-size: 15px; line-height: 1.6; color: #D9CFC0; }
    .gate form { display: flex; gap: 0; }
    .gate input {
      flex: 1; min-width: 0; height: 52px; padding: 0 16px; border: 1px solid #4A413A; border-right: 0;
      border-radius: 8px 0 0 8px; background: transparent; color: #F4EFE6; font: 15px 'Jost', sans-serif; outline: none;
    }
    .gate input:focus { border-color: #F5841F; }
    .gate button {
      height: 52px; padding: 0 22px; border: 0; border-radius: 0 8px 8px 0; background: #F5841F; color: #1F1A16;
      font: 600 13px 'Jost', sans-serif; letter-spacing: .14em; text-transform: uppercase; cursor: pointer;
    }
    .gate button:hover { background: #FF9A3D; }
    .gate__error { min-height: 22px; margin-top: 12px; font-size: 14px; color: #F5841F; }
    .gate.is-wrong form { animation: gate-shake .4s; }
    @keyframes gate-shake { 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }
    @media (prefers-reduced-motion: reduce) { .gate.is-wrong form { animation: none; } }
  `;
  document.head.appendChild(style);

  async function fingerprint(text) {
    const bytes = new TextEncoder().encode(text.trim().toLowerCase());
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const gate = document.createElement('div');
    gate.className = 'gate';
    gate.innerHTML = `<div class="gate__box">
      <img class="gate__logo" src="img/puas-logo.png" alt="PUAS">
      <h1>Nog even geduld</h1>
      <p>Deze site is nog niet openbaar. Heb je het wachtwoord gekregen? Vul het hieronder in.</p>
      <form novalidate>
        <input type="password" placeholder="Wachtwoord" aria-label="Wachtwoord" autocomplete="current-password" autofocus>
        <button type="submit">Openen</button>
      </form>
      <div class="gate__error" role="status"></div>
    </div>`;
    document.body.appendChild(gate);
    const input = gate.querySelector('input');
    input.focus();

    gate.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (await fingerprint(input.value) === HASH) {
        try { localStorage.setItem(KEY, HASH); } catch { /* not remembered, still let in */ }
        document.documentElement.classList.remove('is-locked');
        gate.remove();
        return;
      }
      gate.classList.remove('is-wrong');
      void gate.offsetWidth; // restart the shake
      gate.classList.add('is-wrong');
      gate.querySelector('.gate__error').textContent = 'Dat wachtwoord klopt niet.';
      input.select();
    });
  });
})();
