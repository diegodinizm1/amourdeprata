# Amour de Prata — Landing Page

**PT-BR** | [EN](#english)

---

## Português

Landing page oficial da **Amour de Prata**, loja virtual de joias em prata 925 gerenciada pela Maria Eduarda. As vendas são realizadas diretamente pelo Instagram e WhatsApp.

**Site:** [amourdeprata.vercel.app](https://amourdeprata.vercel.app) &nbsp;|&nbsp; **Instagram:** [@amour_de_prata](https://www.instagram.com/amour_de_prata/)

### Funcionalidades

- **Catálogo interativo** — modal com +130 fotos reais de produto organizadas por categoria (anéis, colares, brincos, pulseiras, pingentes, cordões e berloques), com gesto de arrastar para fechar
- **Feed do Instagram** — posts reais integrados via [Behold.so](https://behold.so)
- **WhatsApp integrado** — botão flutuante e CTA em cada produto abrem conversa no WhatsApp com mensagem pré-preenchida
- **Animações de scroll** — entradas suaves via `IntersectionObserver`, hero flutuante e contadores animados
- **100% responsivo** — funciona em mobile e desktop sem nenhum framework CSS

### Tecnologias

| Camada | Escolha |
|---|---|
| Marcação | HTML5 semântico |
| Estilos | CSS3 — custom properties, clamp(), grid, animações |
| Lógica | JavaScript vanilla — IntersectionObserver, Pointer Events, rAF |
| Feed Instagram | Behold.so embed |
| Fontes | Google Fonts — Manrope + Italiana |
| Hospedagem | Vercel |

### Estrutura

```
amourdeprata/
├── index.html        # Marcação
├── style.css         # Estilos
├── main.js           # Animações, catálogo, gestos
└── assets/
    ├── logo.png
    └── photos/       # +130 fotos de produto
```

### Rodar localmente

Nenhum passo de build necessário. Basta abrir o `index.html` no browser ou usar um servidor estático:

```bash
npx serve .
```

---

## English

<a name="english"></a>

Official landing page for **Amour de Prata**, a silver jewelry store (prata 925) run by Maria Eduarda. Sales are handled directly through Instagram and WhatsApp.

**Site:** [amourdeprata.vercel.app](https://amourdeprata.vercel.app) &nbsp;|&nbsp; **Instagram:** [@amour_de_prata](https://www.instagram.com/amour_de_prata/)

### Features

- **Interactive catalog** — bottom-sheet modal with 130+ real product photos organized by category (rings, necklaces, earrings, bracelets, pendants, chains, charms), with swipe-down-to-close gesture
- **Live Instagram feed** — real posts embedded via [Behold.so](https://behold.so)
- **WhatsApp integration** — floating action button and per-product CTAs open a WhatsApp chat with a pre-filled message
- **Scroll animations** — smooth fade-up entrances via `IntersectionObserver`, floating hero image, animated counters
- **Fully responsive** — works on mobile and desktop with no CSS framework

### Stack

| Layer | Choice |
|---|---|
| Markup | Semantic HTML5 |
| Styles | CSS3 — custom properties, clamp(), grid, animations |
| Logic | Vanilla JavaScript — IntersectionObserver, Pointer Events, rAF |
| Instagram feed | Behold.so embed |
| Fonts | Google Fonts — Manrope + Italiana |
| Hosting | Vercel |

### Structure

```
amourdeprata/
├── index.html        # Markup
├── style.css         # Styles
├── main.js           # Animations, catalog modal, swipe gesture
└── assets/
    ├── logo.png
    └── photos/       # 130+ product photos
```

### Running locally

No build step required. Open `index.html` directly or use any static server:

```bash
npx serve .
```
