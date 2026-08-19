/* =============================================
   LUMA — JavaScript global
   Migrado de main.js (one-page original).
   ============================================= */

/* ── Menú mobile ──────────────────────────────── */
function toggleMenu() {
  const nav = document.querySelector('.main-nav');
  if (nav) nav.classList.toggle('active');
}

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    const nav = document.querySelector('.main-nav');
    if (nav) nav.classList.remove('active');
  });
});

/* ── Selector de color (luminaria) ───────────── */
function cambiarColor(color) {
  const imagen = document.getElementById('img-luminaria');
  if (!imagen) return;

  const dots = document.querySelectorAll('.color-dot');

  if (color === 'negro') {
    imagen.src = '/assets/img/luma-luminaria.webp';
    // fallback mientras se migran las imágenes:
    imagen.onerror = () => { imagen.src = '/images/luma_luminaria.png'; };
  } else if (color === 'blanco') {
    imagen.src = '/assets/img/luma-luminaria-blanca.webp';
    imagen.onerror = () => { imagen.src = '/images/luma_luminaria_blanca.png'; };
  }

  dots.forEach(dot => {
    dot.classList.remove('active');
    if (color === 'negro' && dot.classList.contains('black')) dot.classList.add('active');
    if (color === 'blanco' && dot.classList.contains('white')) dot.classList.add('active');
  });
}

/* ── Animaciones de entrada (IntersectionObserver) ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .reveal-left').forEach(el => revealObserver.observe(el));

/* ── Scroll: botón "Volver arriba" ───────────── */
const topBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (!topBtn) return;
  topBtn.style.display =
    (document.body.scrollTop > 600 || document.documentElement.scrollTop > 600)
      ? 'block'
      : 'none';
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Tracking de conversión (Fase 5: GA4/GTM) ── */
// Los eventos se cablean en la Fase 5 una vez instalado GTM.
// Estructura preparada:
//
// document.querySelectorAll('[data-track="whatsapp_click"]').forEach(el => {
//   el.addEventListener('click', () => {
//     if (typeof gtag !== 'undefined') {
//       gtag('event', 'whatsapp_click', { event_category: 'conversion' });
//     }
//   });
// });

/* ── Carrusel de imágenes (hero de producto) ─── */
document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const dots = Array.from(carousel.querySelectorAll('[data-carousel-goto]'));
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  if (slides.length < 2) return;

  // Color picker opcional asociado al mismo hero (puede estar fuera de la columna de imagen)
  const heroSection = carousel.closest('.producto-hero') || carousel.closest('.producto-hero-inner') || carousel.parentElement;
  const colorPicker = heroSection ? heroSection.querySelector('[data-color-picker]') : null;
  const swatches = colorPicker ? Array.from(colorPicker.querySelectorAll('[data-color-goto]')) : [];

  let current = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    swatches.forEach((swatch, i) => swatch.classList.toggle('is-active', i === current));
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.carouselGoto, 10)));
  });
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => goTo(parseInt(swatch.dataset.colorGoto, 10)));
  });

  let autoplay = setInterval(() => goTo(current + 1), 5000);
  carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
  carousel.addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(current + 1), 5000);
  });
});

/* ── Carrusel de testimonios (loop infinito, 3 tarjetas) ── */
document.querySelectorAll('[data-testimonio-carousel]').forEach(carousel => {
  const track = carousel.querySelector('.testimonio-carousel-track');
  if (!track) return;

  const originalSlides = Array.from(track.children);
  const total = originalSlides.length;
  if (total < 2) return;

  // Clonamos el set completo y lo agregamos al final: permite avanzar
  // indefinidamente hacia adelante y, al pasar el set clonado, resetear
  // la posición sin transición para simular un loop infinito.
  originalSlides.forEach(slide => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  function getVisibleCount() {
    const w = window.innerWidth;
    if (w <= 768) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  let visible = getVisibleCount();
  let current = 0;
  const TRANSITION_MS = 600;
  let resetTimer = null;

  function update(withTransition) {
    track.style.transition = withTransition ? `transform ${TRANSITION_MS}ms ease` : 'none';
    track.style.transform = `translateX(-${current * (100 / visible)}%)`;
  }

  // El reset se agenda por tiempo (no por "transitionend"): en pestañas en
  // segundo plano o desenfocadas Chrome puede no disparar ese evento nunca,
  // dejando el índice crecer sin límite hasta mostrar espacio vacío.
  function next() {
    clearTimeout(resetTimer);
    current++;
    update(true);
    if (current >= total) {
      resetTimer = setTimeout(() => {
        current = 0;
        update(false);
      }, TRANSITION_MS + 50);
    }
  }

  function prev() {
    clearTimeout(resetTimer);
    if (current === 0) {
      current = total;
      update(false);
      track.offsetHeight; // forzar reflow antes de animar
      current = total - 1;
      update(true);
    } else {
      current--;
      update(true);
    }
  }

  update(false);

  const AUTOPLAY_MS = 4500;
  let autoplay = setInterval(next, AUTOPLAY_MS);

  function restartAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(next, AUTOPLAY_MS);
  }

  carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
  carousel.addEventListener('mouseleave', restartAutoplay);

  const prevBtn = carousel.querySelector('[data-testimonio-prev]');
  const nextBtn = carousel.querySelector('[data-testimonio-next]');
  prevBtn && prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });
  nextBtn && nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });

  window.addEventListener('resize', () => {
    const newVisible = getVisibleCount();
    if (newVisible !== visible) {
      visible = newVisible;
      update(false);
    }
  });
});

/* ── Redirect de anclas legadas ──────────────── */
// Redirige URLs viejas con hash (#premium, #ginecologica, etc.)
// a las nuevas URLs de la arquitectura.
(function () {
  const redirects = {
    '#premium':     '/camillas-electricas/premium/',
    '#ginecologica':'/camillas-electricas/ginecologica/',
    '#accesorios':  '/carritos-auxiliares/luma-cart/',
    '#tech':        '/carritos-auxiliares/luma-tech/',
    '#luminaria':   '/luminarias/',
    '#nosotros':    '/nosotros/',
    '#contacto':    '/contacto/',
  };

  const hash = window.location.hash;
  if (hash && redirects[hash]) {
    window.location.replace(redirects[hash]);
  }
})();
