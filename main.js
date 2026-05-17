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

// Count-up for hero stats
function countUp(el, target) {
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
const WA = 'https://wa.me/5584998287232?text=';
const WA_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>`;

const catalog = {
  'Anéis': [
    { src: 'assets/photos/aneis.png', name: 'Anéis' },
  ],
  'Colares': [
    { src: 'assets/photos/cordao-elo.jpeg', name: 'Cordão Elo Veneziano' },
    { src: 'assets/photos/colar-bolinhas.jpeg', name: 'Colar Bolinhas' },
  ],
  'Brincos': [
    { src: 'assets/photos/brincos-cristal.jpeg', name: 'Cristal Princess' },
    { src: 'assets/photos/brincos.png', name: 'Brincos' },
    { src: 'assets/photos/brincos-coloridos.jpeg', name: 'Brincos Coloridos' },
  ],
  'Pulseiras': [
    { src: 'assets/photos/pulseira-coracao.jpeg', name: 'Pulseira Coração' },
    { src: 'assets/photos/pulseiras-borboleta.jpeg', name: 'Pulseira Borboleta' },
    { src: 'assets/photos/pulseira-charms.jpeg', name: 'Pulseira Charms' },
  ],
  'Pingentes': [
    { src: 'assets/photos/pingentes.jpeg', name: 'Pingentes' },
  ],
  'Cordões': [
    { src: 'assets/photos/cordao-elo.jpeg', name: 'Cordão Elo' },
    { src: 'assets/photos/colar-bolinhas.jpeg', name: 'Colar Bolinhas' },
  ],
  'Berloques': [
    { src: 'assets/photos/pingentes.jpeg', name: 'Berloques' },
    { src: 'assets/photos/pulseira-charms.jpeg', name: 'Charms Coloridos' },
  ],
};

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
            <img src="${item.src}" alt="${item.name}" loading="lazy" />
          </div>
          <span class="catalog-item-name">${item.name}</span>
          <a class="catalog-wa-btn"
             href="${WA}${encodeURIComponent(`Olá Maria! Tenho interesse em ${item.name} 💎`)}"
             target="_blank" rel="noopener">
            ${WA_ICON} Pedir
          </a>
        </div>`).join('')
    : `<p class="catalog-empty">Em breve mais peças nessa categoria!</p>`;

  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeCatalog() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

modal.querySelector('.catalog-close').addEventListener('click', closeCatalog);
modal.querySelector('.catalog-backdrop').addEventListener('click', closeCatalog);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCatalog(); });

document.querySelectorAll('.cat').forEach(cat => {
  cat.addEventListener('click', e => {
    e.preventDefault();
    const category = cat.querySelector('.cat-name')?.textContent.trim();
    if (category && catalog[category]) openCatalog(category);
  });
});
