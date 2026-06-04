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
const catalogReady = fetch("products.json")
  .then(r => r.json())
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
  const items = catalog[category] || [];
  catalogTitle.innerHTML = `<em>${category}</em>`;
  catalogGrid.innerHTML = items.length
    ? items.map(item => `
        <div class="catalog-item">
          <div class="catalog-img">
            <img src="${item.src}" alt="${item.name}" loading="lazy" decoding="async" />
          </div>
          <span class="catalog-item-name">${item.name}</span>
          <a class="catalog-wa-btn"
             href="${WA}${encodeURIComponent(`Olá Maria! Tenho interesse em ${item.name} 💎`)}"
             target="_blank" rel="noopener">
            ${WA_ICON} Pedir
          </a>
        </div>`).join('')
    : `<p class="catalog-empty">Em breve mais peças nessa categoria!</p>`;

  lastFocused = document.activeElement;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => {
    modal.classList.add('open');
    closeBtn.focus();
  });
}

function closeCatalog() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}

let lastFocused = null;
const closeBtn = modal.querySelector('.catalog-close');

closeBtn.addEventListener('click', closeCatalog);
modal.querySelector('.catalog-backdrop').addEventListener('click', closeCatalog);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCatalog(); });

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
    closeCatalog();
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
    if (catalog[category]) openCatalog(category);
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
    if (catalog[category]) openCatalog(category);
  });
});

// ============================================================
// Rastreio de cliques no WhatsApp (Vercel Analytics)
// ============================================================
document.addEventListener('click', e => {
  const wa = e.target.closest('a[href*="wa.me"]');
  if (!wa || typeof window.va !== 'function') return;
  let location = 'outro';
  if (wa.closest('.whatsapp-fab')) location = 'botao-flutuante';
  else if (wa.closest('.mobile-menu')) location = 'menu-mobile';
  else if (wa.closest('.catalog-sheet')) location = 'catalogo';
  else if (wa.closest('.cta-band')) location = 'cta-contato';
  else if (wa.closest('.about')) location = 'sobre';
  else if (wa.closest('footer')) location = 'rodape';
  window.va('event', { name: 'whatsapp_click', location });
});
