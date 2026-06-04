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
const WA = 'https://wa.me/5584998287232?text='
const WA_ICON = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>`;

const catalog = {
  'Anéis': [
    { src: 'assets/photos/IMG_8731.jpg', name: 'Anéis Solitário Colorido' },
    { src: 'assets/photos/IMG_8733.jpg', name: 'Anel Triplo Cristal' },
    { src: 'assets/photos/IMG_8735.jpg', name: 'Anel Solitário' },
    { src: 'assets/photos/IMG_8738.jpg', name: 'Anel Solitário Cristal' },
    { src: 'assets/photos/IMG_8740.jpg', name: 'Anéis Band' },
    { src: 'assets/photos/IMG_8742.jpg', name: 'Anel Esmeralda' },
    { src: 'assets/photos/IMG_8743.jpg', name: 'Anel Flor de Cristal' },
    { src: 'assets/photos/aneis.png',    name: 'Anéis Coloridos' },
  ],
  'Colares': [
    { src: 'assets/photos/IMG_8791.jpg', name: 'Colar Coração Rubi' },
    { src: 'assets/photos/IMG_8793.jpg', name: 'Colar Mamãe' },
    { src: 'assets/photos/IMG_8794.jpg', name: 'Terço Colorido' },
    { src: 'assets/photos/IMG_8799.jpg', name: 'Terço Prata' },
  ],
  'Brincos': [
    { src: 'assets/photos/IMG_8522.jpg', name: 'Brincos Coloridos' },
    { src: 'assets/photos/IMG_8525.jpg', name: 'Brincos Cristal' },
    { src: 'assets/photos/IMG_8883.jpg', name: 'Brincos Flor Cristal' },
    { src: 'assets/photos/IMG_8886.jpg', name: 'Brincos Princess' },
    { src: 'assets/photos/IMG_8889.jpg', name: 'Brincos Round Cristal' },
    { src: 'assets/photos/IMG_8890.jpg', name: 'Brincos Gota Cristal' },
    { src: 'assets/photos/IMG_8891.jpg', name: 'Brincos Sortidos' },
    { src: 'assets/photos/brincos-cristal.jpeg', name: 'Brincos Cristal Princess' },
    { src: 'assets/photos/brincos-coloridos.jpeg', name: 'Brincos Coloridos Tray' },
  ],
  'Pulseiras': [
    { src: 'assets/photos/IMG_8596.jpg', name: 'Pulseira Trevo Azul' },
    { src: 'assets/photos/IMG_8598.jpg', name: 'Pulseira Trevo Verde' },
    { src: 'assets/photos/IMG_8600.jpg', name: 'Pulseira Pedras Azuis' },
    { src: 'assets/photos/IMG_8606.jpg', name: 'Pulseira Pedras Verdes' },
    { src: 'assets/photos/IMG_8607.jpg', name: 'Pulseira Borboleta' },
    { src: 'assets/photos/IMG_8610.jpg', name: 'Pulseira Corações' },
    { src: 'assets/photos/IMG_8611.jpg', name: 'Pulseira Cristais' },
    { src: 'assets/photos/IMG_8826.jpg', name: 'Bracelete Rígido' },
    { src: 'assets/photos/IMG_8833.jpg', name: 'Pulseira Pedras Verdes' },
    { src: 'assets/photos/IMG_8844.jpg', name: 'Pulseiras Borboleta' },
    { src: 'assets/photos/IMG_8856.jpg', name: 'Pulseira Marquesas Azuis' },
    { src: 'assets/photos/IMG_8858.jpg', name: 'Pulseira Safiras' },
    { src: 'assets/photos/IMG_8864.jpg', name: 'Pulseira Tartarugas' },
    { src: 'assets/photos/IMG_8865.jpg', name: 'Pulseira Sol e Lua' },
    { src: 'assets/photos/IMG_8867.jpg', name: 'Pulseira Flores Coloridas' },
    { src: 'assets/photos/pulseira-coracao.jpeg', name: 'Pulseira Pandora' },
    { src: 'assets/photos/pulseiras-borboleta.jpeg', name: 'Pulseiras Borboleta Coloridas' },
    { src: 'assets/photos/pulseira-charms.jpeg', name: 'Pulseira Charms' },
    { src: 'assets/photos/IMG_8829.jpg', name: 'Pulseira Trevo' },
    { src: 'assets/photos/IMG_8835.jpg', name: 'Pulseira Corações Azuis' },
    { src: 'assets/photos/IMG_8838.jpg', name: 'Pulseira Cristal Coração' },
    { src: 'assets/photos/IMG_8840.jpg', name: 'Pulseira Corações Abertos' },
    { src: 'assets/photos/IMG_8843.jpg', name: 'Pulseira Olho Grego' },
    { src: 'assets/photos/IMG_8860.jpg', name: 'Pulseira Charms Coloridos' },
    { src: 'assets/photos/IMG_8868.jpg', name: 'Pulseira Bolinhas' },
    { src: 'assets/photos/IMG_8869.jpg', name: 'Pulseira Corações' },
    { src: 'assets/photos/IMG_8873.jpg', name: 'Pulseira Pingente Cristal' },
    { src: 'assets/photos/colar-bolinhas.jpeg', name: 'Pulseira Bolinhas Prata' },
    { src: 'assets/photos/IMG_8900.jpg', name: 'Pulseira Masculina' },
  ],
  'Pingentes': [
    { src: 'assets/photos/IMG_8531.jpg', name: 'Pingentes Prata' },
    { src: 'assets/photos/IMG_8896.jpg', name: 'Pingentes Temáticos' },
    { src: 'assets/photos/IMG_8898.jpg', name: 'Pingentes Religiosos' },
    { src: 'assets/photos/pingentes.jpeg', name: 'Pingentes' },
    { src: 'assets/photos/IMG_8533.jpg', name: 'Pingentes Prata Sortidos' },
  ],
  'Cordões': [
    { src: 'assets/photos/IMG_8787.jpg', name: 'Cordão Trançado' },
    { src: 'assets/photos/IMG_8818.jpg', name: 'Cordão Chapado' },
    { src: 'assets/photos/IMG_8819.jpg', name: 'Cordão Cobra' },
    { src: 'assets/photos/IMG_8822.jpg', name: 'Cordão Duplo' },
    { src: 'assets/photos/IMG_8904.jpg', name: 'Cordão Elo' },
    { src: 'assets/photos/cordao-elo.jpeg', name: 'Cordão Elo Veneziano' },
  ],
  'Berloques': [
    { src: 'assets/photos/IMG_8875.jpg', name: 'Berloques Coloridos' },
    { src: 'assets/photos/IMG_8877.jpg', name: 'Berloques Temáticos' },
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

// Swipe-down to close
const sheet = modal.querySelector('.catalog-sheet');
let dragStart = 0;
let dragging = false;

sheet.addEventListener('pointerdown', e => {
  if (e.target.closest('.catalog-body')) return;
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
  cat.addEventListener('click', e => {
    e.preventDefault();
    const category = cat.querySelector('.cat-name')?.textContent.trim();
    if (category && catalog[category]) openCatalog(category);
  });
});
