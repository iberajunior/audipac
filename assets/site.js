/* Audipac · script do site (KROMA) */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Cabeçalho: transparente sobre o topo escuro, branco depois da rolagem */
  const onScroll = () => document.body.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, {passive: true});

  /* Item do menu ativo conforme a página */
  function markNav() {
    const p = document.body.dataset.section || '';
    $$('.hdr nav a, .mnav nav a').forEach(a => a.classList.toggle('on', a.dataset.s === p));
  }

  /* Menu do celular */
  const m = $('#mnav'), b = $('#burger'), c = $('#mclose');
  const setMenu = open => { m.classList.toggle('open', open); m.setAttribute('aria-hidden', String(!open)); b.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; if (open) c.focus(); };
  b.addEventListener('click', () => setMenu(true));
  c.addEventListener('click', () => setMenu(false));
  $$('a', m).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && m.classList.contains('open')) { setMenu(false); b.focus(); } });

  function initPage(root = document) {
    $$('[data-scroll]', root).forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = $(a.dataset.scroll, root); if (t) t.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'}); }));
    /* Título do topo entra palavra por palavra */
    const h = $('#h1', root);
    if (h && !h.dataset.done) {
      h.dataset.done = '1'; let i = 0;
      $$(':scope > span', h).forEach(part => { part.innerHTML = part.textContent.split(' ').map(w => `<span class="w" style="animation-delay:${150 + (i++) * 55}ms">${w}</span>`).join(' '); });
    }
    /* Vídeo do topo: pausa fora da tela e respeita "reduzir movimento" */
    const v = $('#hv', root);
    if (v) {
      if (reduce) { v.removeAttribute('autoplay'); v.pause(); }
      else { v.play().catch(() => {}); new IntersectionObserver(e => { e[0].isIntersecting ? v.play().catch(() => {}) : v.pause(); }).observe(v); }
    }
    /* Etapas: uma aberta por vez */
    const ds = $$('#steps details', root);
    ds.forEach(d => d.addEventListener('toggle', () => { if (d.open) ds.forEach(o => { if (o !== d) o.open = false; }); }));
    /* Insights: busca e filtro por categoria */
    const list = $('#ilist', root);
    if (list) {
      const q = $('#iq', root), btns = $$('.chipsf button', root), cards = $$('.icard', list), empty = $('#iempty', root);
      let cat = '';
      const run = () => {
        const t = q.value.trim().toLocaleLowerCase('pt-BR'); let n = 0;
        cards.forEach(cd => { const ok = (!cat || cd.dataset.cat === cat) && cd.textContent.toLocaleLowerCase('pt-BR').includes(t); cd.hidden = !ok; if (ok) n++; });
        empty.hidden = n > 0;
      };
      q.addEventListener('input', run);
      btns.forEach(bt => bt.addEventListener('click', () => { cat = bt.dataset.cat; btns.forEach(x => x.setAttribute('aria-pressed', String(x === bt))); run(); }));
    }
    /* Formulários: validação na página (protótipo, sem envio) */
    $$('form[data-validate]', root).forEach(f => {
      f.addEventListener('submit', e => {
        e.preventDefault(); let first = null;
        $$('input[id]:not([type=radio]):not([type=checkbox]), select[id], textarea[id]', f).forEach(i => {
          const err = i.parentElement.querySelector('.err'); if (!err) return;
          let msg = ''; const v = i.value.trim();
          if (i.required && !v) msg = i.tagName === 'SELECT' ? 'Escolha uma opção.' : 'Preencha este campo.';
          else if (i.type === 'tel' && v && v.replace(/\D/g, '').length < 10) msg = 'Informe o DDD e o número.';
          else if (i.type === 'email' && v && !/^\S+@\S+\.\S+$/.test(v)) msg = 'Confira o e-mail.';
          err.textContent = msg; i.setAttribute('aria-invalid', msg ? 'true' : 'false');
          if (msg && !first) first = i;
        });
        const cs = $('input[type=checkbox][required]', f);
        if (cs && !cs.checked) { const er = $('#consent-err', f); if (er) er.textContent = 'Confirme para continuar.'; if (!first) first = cs; }
        if (first) { first.focus(); return; }
        $('.fwrap', f).hidden = true; $('.ok', f).hidden = false;
      });
      $$('input, select, textarea', f).forEach(i => i.addEventListener('input', () => { if (i.getAttribute('aria-invalid') === 'true') { i.setAttribute('aria-invalid', 'false'); const er = i.parentElement.querySelector('.err'); if (er) er.textContent = ''; } }));
    });
    /* Pré-seleciona serviço vindo do link (?servico=) */
    const sel = $('#servico', root);
    if (sel) { const want = new URLSearchParams(location.search).get('servico') || (location.hash.split('servico=')[1] || ''); if (want) { const o = $$('option', sel).find(o => o.value === decodeURIComponent(want)); if (o) sel.value = o.value; } }
  }

  /* Modo prévia: todas as páginas num arquivo só, navegação por #pagina */
  const tpl = id => document.getElementById('p-' + id);
  if (document.body.dataset.spa) {
    const main = $('#main');
    const go = () => {
      const raw = (location.hash.slice(1) || 'index').split('?')[0].split('&')[0];
      const id = tpl(raw) ? raw : 'index';
      const t = tpl(id);
      main.innerHTML = t.innerHTML;
      document.body.dataset.section = t.dataset.section || '';
      document.title = t.dataset.title || 'Audipac';
      markNav(); initPage(main);
      document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); document.documentElement.style.scrollBehavior = '';
      onScroll();
    };
    addEventListener('hashchange', go); go();
  } else { markNav(); initPage(); onScroll(); }
})();
