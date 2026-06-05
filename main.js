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

function openCatalog(category) {
  currentCategory = category;
  if (typeof window.va === 'function') window.va('event', { name: 'category_open', category });
  const items = catalog[category] || [];
  catalogTitle.innerHTML = `<em>${category}</em>`;
  catalogGrid.innerHTML = items.length
    ? items.map(item => {
        // URL absoluta da foto → o WhatsApp gera o preview da imagem na conversa
        const imgUrl = new URL(item.src, location.href).href;
        const msg = `Olá Maria! 💎 Tenho interesse nesta peça:\n\n*${item.name}*\n${imgUrl}`;
        return `
        <div class="catalog-item">
          <div class="catalog-img">
            <img src="${item.src}" alt="${item.name}" loading="lazy" decoding="async" />
          </div>
          <span class="catalog-item-name">${item.name}</span>
          <a class="catalog-wa-btn"
             href="${WA}${encodeURIComponent(msg)}"
             target="_blank" rel="noopener">
            ${WA_ICON} Pedir
          </a>
        </div>`;
      }).join('')
    : `<p class="catalog-empty">Em breve mais peças nessa categoria!</p>`;

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
// Brilho ao inclinar / mover (protótipo no hero)
// ============================================================
(function shineEffect() {
  if (reduceMotion) return;
  const heroImg = document.querySelector('.hero-image');
  const card = heroImg?.querySelector('.photo');
  if (!card) return;

  heroImg.classList.add('shine');
  const sheen = document.createElement('span');
  sheen.className = 'sheen';
  card.appendChild(sheen);

  const AMP = 12; // graus de inclinação do tilt 3D
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const set = (px, py, active) => {
    px = clamp01(px); py = clamp01(py);
    card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    card.style.setProperty('--tiltY', ((px - 0.5) * -AMP).toFixed(2) + 'deg');
    card.style.setProperty('--tiltX', ((py - 0.5) *  AMP).toFixed(2) + 'deg');
    card.style.setProperty('--shine', active ? '1' : '0');
  };
  set(0.5, 0.5, false);

  // Desktop: segue o mouse
  heroImg.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const r = card.getBoundingClientRect();
    set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, true);
  });
  heroImg.addEventListener('pointerleave', () => set(0.5, 0.5, false));

  // Mobile: segue a inclinação do aparelho
  const onTilt = e => {
    if (e.gamma == null) return;
    set(0.5 + Math.max(-30, Math.min(30, e.gamma)) / 60,
        0.5 + Math.max(-30, Math.min(30, (e.beta ?? 90) - 90)) / 60,
        true);
  };
  const startTilt = () => window.addEventListener('deviceorientation', onTilt);

  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    // iOS 13+: precisa de um toque para pedir permissão de movimento
    const hint = document.createElement('button');
    hint.type = 'button';
    hint.className = 'shine-hint';
    hint.textContent = '✨ Incline para ver brilhar';
    heroImg.appendChild(hint);
    hint.addEventListener('click', () => {
      DeviceOrientationEvent.requestPermission()
        .then(s => { if (s === 'granted') startTilt(); })
        .catch(() => {})
        .finally(() => hint.remove());
    });
  } else if (window.DeviceOrientationEvent) {
    startTilt(); // Android e afins: direto
  }
})();
