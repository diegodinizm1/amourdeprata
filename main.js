// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Scroll-triggered fade-up animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

[
  '.hero-copy .eyebrow',
  '.hero-copy h1',
  '.hero-copy .lead',
  '.hero-actions',
  '.hero-meta',
  '.about-photo',
  '.about-copy .eyebrow',
  '.about-copy h2',
  '.about-copy p',
  '.about-values',
  '.about-cta',
  '.ig-head',
  '.section-head',
].forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    el.classList.add('anim');
    observer.observe(el);
  });
});

['.product', '.review'].forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('anim');
    el.style.transitionDelay = `${i * 0.1}s`;
    observer.observe(el);
  });
});

// Respeita usuários que pedem menos movimento
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Count-up for hero stats
function countUp(el, target) {
  if (reduceMotion) { el.textContent = target.toLocaleString('pt-BR'); return; }
  const duration = 1600;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.num em').forEach(em => {
      const target = parseInt(em.textContent.replace(/\D/g, ''), 10);
      if (!isNaN(target)) countUp(em, target);
    });
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const heroMeta = document.querySelector('.hero-meta');
if (heroMeta) statsObserver.observe(heroMeta);

// ============================================================
// Catalog Modal
// ============================================================
const WA = 'https://wa.me/5584998287232?text='
const WA_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><use href="#i-wa"/></svg>`;

// Catálogo: fonte única de dados em products.json.
// Obs.: requer servidor http (em file:// o navegador bloqueia o fetch).
let catalog = {};
// Reaproveita o fetch iniciado cedo no <head> (window.__catalog); senão, busca aqui.
const catalogReady = (window.__catalog || fetch('products.json').then(r => r.json()))
  .then(data => { catalog = data; })
  .catch(err => console.error("Não foi possível carregar products.json:", err));

// Build modal DOM
const modal = document.createElement('div');
modal.id = 'catalog-modal';
modal.setAttribute('role', 'dialog');
modal.setAttribute('aria-modal', 'true');
modal.setAttribute('aria-label', 'Catálogo de peças');
modal.innerHTML = `
  <div class="catalog-backdrop"></div>
  <div class="catalog-sheet">
    <div class="catalog-handle"></div>
    <div class="catalog-header">
      <h3 class="catalog-title"></h3>
      <button class="catalog-close" aria-label="Fechar catálogo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="catalog-body">
      <div class="catalog-grid"></div>
    </div>
  </div>
`;
document.body.appendChild(modal);

const catalogTitle = modal.querySelector('.catalog-title');
const catalogGrid  = modal.querySelector('.catalog-grid');
const catalogBody  = modal.querySelector('.catalog-body');

const NAMORO_CAT = 'Presentes de Namorados';
const PUBS = [['tudo', 'Tudo'], ['ela', 'Para ela'], ['ele', 'Para ele'], ['dois', 'Para os dois']];
let namoroTabs = null;
let activeTab = 'tudo';

const fmtBRL = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function priceHTML(item) {
  if (item.preco == null) return '';
  const pre = item.aPartir ? 'a partir de ' : '';
  const promo = item.preco * 0.85; // 15% off à vista
  return `
          <div class="catalog-price">
            <div class="price-row">
              <span class="price-now">${pre}R$ ${fmtBRL(promo)}</span>
              <span class="price-tag">à vista · 15% OFF</span>
            </div>
            <span class="price-card">no cartão ${pre}R$ ${fmtBRL(item.preco)}</span>
          </div>`;
}

function catalogItemHTML(item, namoroMode) {
  // URL absoluta da foto → o WhatsApp gera o preview da imagem na conversa
  const imgUrl = new URL(item.src, location.href).href;
  const msg = namoroMode
    ? `Olá Maria! 💝 Quero esta peça de presente de Dia dos Namorados (vi que está com 15% off à vista, e quero saber sobre incluir um buquê 🌹). Me ajuda?\n\n*${item.name}*\n${imgUrl}`
    : `Olá Maria! 💎 Tenho interesse nesta peça:\n\n*${item.name}*\n${imgUrl}`;
  return `
        <div class="catalog-item">
          <div class="catalog-img">
            <img src="${item.src}" alt="${item.name}" loading="lazy" decoding="async" />
            ${item.namorados ? '<span class="cat-selo"><svg class="ico-heart" aria-hidden="true" viewBox="0 0 24 24"><use href="#i-heart"/></svg></span>' : ''}
          </div>
          <span class="catalog-item-name">${item.name}</span>
          ${priceHTML(item)}
          <a class="catalog-wa-btn"
             href="${WA}${encodeURIComponent(msg)}"
             target="_blank" rel="noopener">
            ${WA_ICON} Pedir
          </a>
        </div>`;
}

function renderGrid(items, namoroMode) {
  catalogGrid.innerHTML = items.length
    ? items.map(i => catalogItemHTML(i, namoroMode)).join('')
    : `<p class="catalog-empty">Em breve mais peças nessa categoria!</p>`;
}

function buildNamoroTabs(items) {
  activeTab = 'tudo';
  const count = pub => pub === 'tudo' ? items.length : items.filter(i => i.publico === pub).length;
  namoroTabs = document.createElement('div');
  namoroTabs.className = 'catalog-tabs';
  namoroTabs.innerHTML = PUBS.filter(([k]) => count(k) > 0)
    .map(([k, label], i) => `<button type="button" data-pub="${k}" class="${i === 0 ? 'active' : ''}">${label}</button>`)
    .join('');
  catalogBody.insertBefore(namoroTabs, catalogGrid);
  namoroTabs.addEventListener('click', e => {
    const b = e.target.closest('button[data-pub]');
    if (!b) return;
    activeTab = b.dataset.pub;
    namoroTabs.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    renderGrid(activeTab === 'tudo' ? items : items.filter(i => i.publico === activeTab), true);
    catalogBody.scrollTop = 0;
  });
}

function openCatalog(category) {
  currentCategory = category;
  if (typeof window.va === 'function') window.va('event', { name: 'category_open', category });
  const items = catalog[category] || [];
  const namoroMode = category === NAMORO_CAT;
  modal.classList.toggle('namoro', namoroMode);   // palco minimalista da campanha
  catalogTitle.innerHTML = `<em>${category}</em>`;
  if (namoroTabs) { namoroTabs.remove(); namoroTabs = null; }
  if (namoroMode) buildNamoroTabs(items);
  renderGrid(items, namoroMode);

  lastFocused = document.activeElement;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    modal.classList.add('open');
    closeBtn.focus();
  });
}

function closeCatalog() {
  currentCategory = null;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

let lastFocused = null;
let currentCategory = null;
const closeBtn = modal.querySelector('.catalog-close');

// ---- Lightbox: zoom da foto do catálogo ----
const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
lightbox.setAttribute('aria-hidden', 'true');
lightbox.innerHTML = `<button class="lightbox-close" aria-label="Fechar">&times;</button><img alt="" />`;
document.body.appendChild(lightbox);
const lightboxImg = lightbox.querySelector('img');
function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.removeAttribute('src');
}
lightbox.addEventListener('click', closeLightbox);
catalogGrid.addEventListener('click', e => {
  const img = e.target.closest('.catalog-img img');
  if (img) openLightbox(img.getAttribute('src'), img.getAttribute('alt'));
});

// ---- Deep-link de categoria + botão voltar fecha o modal (history API) ----
const slugify = (s) => s.toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
let slugToCat = {};
const catFromHash = () => slugToCat[decodeURIComponent(location.hash.replace(/^#/, ''))];
function navOpenCatalog(category) {
  history.pushState({ cat: category }, '', '#' + slugify(category));
  openCatalog(category);
}
function closeViaHistory() {
  if (history.state && history.state.cat) {
    history.back();                       // X / voltar removem a entrada → popstate fecha
  } else {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    closeCatalog();
  }
}
window.addEventListener('popstate', () => {
  const cat = catFromHash();
  if (cat) { if (currentCategory !== cat) openCatalog(cat); }
  else if (modal.classList.contains('open')) closeCatalog();
});
catalogReady.then(() => {
  // Coleção virtual de Namorados (peças marcadas com namorados:true)
  const namoro = Object.values(catalog).flat().filter(i => i && i.namorados);
  if (namoro.length) catalog['Presentes de Namorados'] = namoro;
  slugToCat = {};
  for (const c of Object.keys(catalog)) slugToCat[slugify(c)] = c;
  const cat = catFromHash();                // deep-link: #aneis abre a categoria
  if (cat) { history.replaceState(null, '', '#' + slugify(cat)); openCatalog(cat); }
});

closeBtn.addEventListener('click', closeViaHistory);
modal.querySelector('.catalog-backdrop').addEventListener('click', closeViaHistory);
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (lightbox.classList.contains('open')) { closeLightbox(); return; }
  if (modal.classList.contains('open')) closeViaHistory();
});

// Focus trap enquanto o catálogo está aberto
modal.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || !modal.classList.contains('open')) return;
  const focusables = modal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
});

// Swipe-down to close
const sheet = modal.querySelector('.catalog-sheet');
let dragStart = 0;
let dragging = false;

sheet.addEventListener('pointerdown', e => {
  if (e.target.closest('.catalog-body') || e.target.closest('.catalog-close')) return;
  dragging = true;
  dragStart = e.clientY;
  sheet.style.transition = 'none';
  sheet.setPointerCapture(e.pointerId);
});

sheet.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dy = Math.max(0, e.clientY - dragStart);
  sheet.style.transform = `translateY(${dy}px)`;
});

sheet.addEventListener('pointerup', e => {
  if (!dragging) return;
  dragging = false;
  sheet.style.transition = '';
  const dy = e.clientY - dragStart;
  if (dy > 120) {
    closeViaHistory();
    sheet.style.transform = '';
  } else {
    sheet.style.transform = '';
  }
});

sheet.addEventListener('pointercancel', () => {
  dragging = false;
  sheet.style.transition = '';
  sheet.style.transform = '';
});

document.querySelectorAll('.cat').forEach(cat => {
  cat.addEventListener('click', async e => {
    e.preventDefault();
    const category = cat.querySelector('.cat-name')?.textContent.trim();
    if (!category) return;
    await catalogReady;            // garante que products.json carregou
    if (catalog[category]) navOpenCatalog(category);
  });
});

// ============================================================
// Mobile menu
// ============================================================
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (navToggle && mobileMenu) {
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  navToggle.addEventListener('click', () =>
    setMenu(!document.body.classList.contains('menu-open')));
  mobileMenu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setMenu(false);
  });
}

// ============================================================
// Footer "Coleções" → abre o catálogo da categoria
// ============================================================
document.querySelectorAll('[data-cat]').forEach(link => {
  link.addEventListener('click', async e => {
    const category = link.getAttribute('data-cat');
    e.preventDefault();
    await catalogReady;            // garante que products.json carregou
    if (catalog[category]) navOpenCatalog(category);
  });
});

// ============================================================
// Rastreio de cliques no WhatsApp (Vercel Analytics)
// ============================================================
document.addEventListener('click', e => {
  const wa = e.target.closest('a[href*="wa.me"]');
  if (!wa || typeof window.va !== 'function') return;
  let where = 'outro';
  if (wa.closest('.whatsapp-fab')) where = 'botao-flutuante';
  else if (wa.closest('.mobile-menu')) where = 'menu-mobile';
  else if (wa.closest('.catalog-sheet')) where = 'catalogo';
  else if (wa.closest('.cta-band')) where = 'cta-contato';
  else if (wa.closest('.about')) where = 'sobre';
  else if (wa.closest('footer')) where = 'rodape';
  const payload = { name: 'whatsapp_click', location: where };
  if (where === 'catalogo') {
    const p = wa.closest('.catalog-item')?.querySelector('.catalog-item-name')?.textContent.trim();
    if (p) payload.product = p;     // qual peça gerou o pedido
  }
  window.va('event', payload);
});

// ============================================================
// Countdown — Dia dos Namorados (12/06)
// ============================================================
(function namoroCountdown() {
  const bar = document.getElementById('namoroCount');        // tarja do topo (texto)
  const boxes = document.querySelectorAll('.namoro-count');  // seção + modal (caixas)
  if (!bar && !boxes.length) return;
  const target = new Date(2026, 5, 12, 23, 59, 59).getTime(); // 12/06/2026 23h59
  const pad = n => String(n).padStart(2, '0');
  const set = (u, v) => boxes.forEach(b => { const el = b.querySelector(`[data-u="${u}"]`); if (el) el.textContent = pad(v); });
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      if (bar) bar.innerHTML = 'É hoje! <svg class="ico-heart" aria-hidden="true" viewBox="0 0 24 24"><use href="#i-heart"/></svg>';
      boxes.forEach(b => { b.innerHTML = '<span class="nc-today">Chegou o Dia dos Namorados 💝</span>'; });
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (bar) bar.textContent = `faltam ${d}d ${h}h ${m}m ${s}s`;
    set('d', d); set('h', h); set('m', m); set('s', s);
    setTimeout(tick, 1000);
  };
  tick();
})();

// ============================================================
// Modal de boas-vindas da campanha (1x por sessão, atraso de 1,5s)
// ============================================================
(function promoModal() {
  const m = document.getElementById('promoModal');
  if (!m) return;
  const KEY = 'promo-namoro-seen';
  let lastFocus = null;
  const open = () => {
    lastFocus = document.activeElement;
    m.classList.add('open');
    m.setAttribute('aria-hidden', 'false');
    m.querySelector('.promo-close').focus();
  };
  const close = () => {
    m.classList.remove('open');
    m.setAttribute('aria-hidden', 'true');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  };
  m.querySelector('.promo-close').addEventListener('click', close);
  m.querySelector('.promo-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && m.classList.contains('open')) close();
  });
  // qualquer ação do modal fecha ele (o data-cat abre a coleção por baixo)
  m.querySelectorAll('.promo-cta, a[href]').forEach(b => b.addEventListener('click', close));

  if (!sessionStorage.getItem(KEY)) {
    setTimeout(() => { open(); sessionStorage.setItem(KEY, '1'); }, 1500);
  }
})();
