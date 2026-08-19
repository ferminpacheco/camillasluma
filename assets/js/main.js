/* =============================================
   LUMA — JavaScript global
   Migrado de main.js (one-page original).
   ============================================= */

/* ── Preferencia de movimiento reducido ───────── */
// Se consulta en vivo (no se cachea): el usuario puede cambiarla
// desde el sistema operativo con la página abierta.
const motionReducida = window.matchMedia('(prefers-reduced-motion: reduce)');
const sinMovimiento = () => motionReducida.matches;

/* ── Menú mobile ──────────────────────────────── */
function sincronizarMenu(abierto) {
  const toggle = document.querySelector('.menu-toggle');
  if (!toggle) return;

  toggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');

  const icono = toggle.querySelector('i');
  if (!icono) return;
  icono.classList.toggle('fa-bars', !abierto);
  icono.classList.toggle('fa-xmark', abierto);
}

function toggleMenu() {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;
  sincronizarMenu(nav.classList.toggle('active'));
}

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    const nav = document.querySelector('.main-nav');
    if (nav) nav.classList.remove('active');
    sincronizarMenu(false);
  });
});

// El toggle es un <div role="button">: el teclado no lo activa solo.
document.querySelectorAll('.menu-toggle').forEach(toggle => {
  toggle.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleMenu();
  });
});

/* ── Header con estado de scroll ──────────────
   Un centinela de 1px arriba de todo: cuando deja de estar en pantalla,
   la página está scrolleada. Sale más barato que un listener de scroll
   porque el navegador no ejecuta nada mientras no cruza el umbral. */
(function headerConScroll() {
  const centinela = document.querySelector('.header-sentinel');
  if (!centinela) return;

  new IntersectionObserver(([entrada]) => {
    document.documentElement.toggleAttribute('data-scrolled', !entrada.isIntersecting);
  }).observe(centinela);
})();

/* ── Dropdowns instantáneos entre vecinos ─────
   Con un menú ya abierto, pasar al de al lado abre sin animación.
   La ventana de gracia evita que el modo instantáneo quede activo
   cuando el usuario simplemente salió del header. */
(function dropdownsInstantaneos() {
  const dropdowns = document.querySelectorAll('.main-nav .dropdown');
  if (!dropdowns.length) return;

  const GRACIA_MS = 150;
  let hayMenuAbierto = false;
  let temporizador = null;

  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('mouseenter', () => {
      clearTimeout(temporizador);
      if (hayMenuAbierto) {
        document.documentElement.setAttribute('data-menu-instantaneo', '');
      }
      hayMenuAbierto = true;
    });

    dropdown.addEventListener('mouseleave', () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => {
        hayMenuAbierto = false;
        document.documentElement.removeAttribute('data-menu-instantaneo');
      }, GRACIA_MS);
    });
  });
})();

/* ── Transiciones entre páginas: elemento compartido ──
   La ficha de producto ya marca su imagen activa desde CSS. Acá se marca
   la contraparte en el origen — la card clickeada — para que el navegador
   entienda que son la misma cosa y la mueva en vez de fundirla.
   Solo un elemento por documento puede llevar el nombre, así que se limpia
   el anterior antes de asignar. */
(function imagenCompartidaEntrePaginas() {
  if (!document.startViewTransition) return;

  const NOMBRE = 'luma-producto-imagen';
  const enlaces = document.querySelectorAll('.hub-producto-card a, .relacionado-card');
  if (!enlaces.length) return;

  let marcada = null;

  function limpiar() {
    if (marcada) marcada.style.viewTransitionName = '';
    marcada = null;
  }

  enlaces.forEach(enlace => {
    enlace.addEventListener('click', () => {
      limpiar();
      if (sinMovimiento()) return;
      const imagen = enlace.querySelector('img');
      if (!imagen) return;
      imagen.style.viewTransitionName = NOMBRE;
      marcada = imagen;
    });
  });

  // Al volver con el botón atrás la página se restaura desde bfcache:
  // sin esto la imagen quedaría marcada y chocaría en la próxima transición.
  window.addEventListener('pagehide', limpiar);
  window.addEventListener('pageshow', limpiar);
})();

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

/* ── Animaciones de entrada (IntersectionObserver) ──
   Superficie de marketing: se dispara una sola vez por carga.
   Los estilos (opacidad/desplazamiento) los aplican los atributos
   data-reveal / data-reveal-group, que se agregan desde acá: si el JS
   no corre, la página se ve completa. */

// Bloques que entran como una pieza.
const REVEAL_BLOQUES = [
  '.nosotros-card',
  '.producto-ficha',
  '.bloque-reviews',
  '.bloque-garantia',
  '.bloque-showroom',
  '.home-showroom-inner',
  '.hub-seccion',
  '.nosotros-seccion',
  '.producto-seccion',
  '.faq-seccion',
  '.post-faq',
  '.testimonio-producto',
  '.cta-producto-cierre',
  '.cta-final',
  '.gracias-card'
].join(', ');

// Grillas cuyos hijos entran escalonados.
const REVEAL_GRILLAS = [
  '.valores-grid',
  '.lineas-grid',
  '.hub-productos-grid',
  '.relacionados-grid',
  '.material-cards-grid',
  '.beneficios-grid',
  '.cuidado-grid',
  '.showroom-grid',
  '.blog-grid'
].join(', ');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    // Compatibilidad con las clases .reveal / .reveal-left del markup heredado.
    entry.target.classList.add('active');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.05, rootMargin: '0px 0px -80px 0px' });

(function registrarReveals() {
  if (sinMovimiento()) return;

  const registrados = [];

  function registrar(el, atributo) {
    if (!el || el.hasAttribute('data-reveal') || el.hasAttribute('data-reveal-group')) return;

    // Lo que ya está en pantalla al cargar no se anima: esconder algo que el
    // navegador acaba de pintar produce un parpadeo, no una entrada.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    // Un bloque que contiene (o está dentro de) otro ya registrado se saltea,
    // para que nada se funda dos veces.
    if (registrados.some(otro => otro.contains(el) || el.contains(otro))) return;

    el.setAttribute(atributo, '');
    registrados.push(el);
    revealObserver.observe(el);
  }

  // Las grillas primero: tienen prioridad sobre la sección que las envuelve.
  document.querySelectorAll(REVEAL_GRILLAS).forEach(el => {
    if (el.children.length) registrar(el, 'data-reveal-group');
  });
  document.querySelectorAll(REVEAL_BLOQUES).forEach(el => registrar(el, 'data-reveal'));
})();

// Markup heredado que ya trae la clase en el HTML.
document.querySelectorAll('.reveal, .reveal-left').forEach(el => revealObserver.observe(el));

/* ── Scroll: botón "Volver arriba" ───────────── */
// Estado por clase, no por style.display: así puede animar. El listener es
// pasivo y escribe una sola vez por frame en lugar de en cada evento.
const topBtn = document.getElementById('backToTop');

if (topBtn) {
  let pendiente = false;

  const actualizarTopBtn = () => {
    topBtn.classList.toggle('is-visible', window.scrollY > 600);
    pendiente = false;
  };

  window.addEventListener('scroll', () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(actualizarTopBtn);
  }, { passive: true });

  actualizarTopBtn();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: sinMovimiento() ? 'auto' : 'smooth' });
}

/* ── FAQ / acordeón ───────────────────────────
   <details> abre y cierra de golpe. Se anima la altura con WAAPI
   (hardware-accelerated, interrumpible, sin dependencias). La altura es
   la única propiedad de layout que se anima en todo el sitio: es la
   excepción del acordeón, donde no hay equivalente con transform. */

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const DUR_ACORDEON = 240;

document.querySelectorAll('.faq-item').forEach(item => {
  const summary = item.querySelector('summary');
  const panel = item.querySelector('.faq-respuesta');
  if (!summary || !panel) return;

  let animacion = null;

  summary.addEventListener('click', (event) => {
    // Con movimiento reducido se deja el comportamiento nativo del <details>.
    if (sinMovimiento()) return;

    event.preventDefault();

    // Si hay una animación en curso, se retoma desde la altura actual
    // en lugar de reiniciar desde cero.
    const alturaActual = animacion ? panel.getBoundingClientRect().height : null;
    if (animacion) {
      animacion.onfinish = null;
      animacion.cancel();
      animacion = null;
    }

    const estilos = getComputedStyle(panel);
    const padTop = estilos.paddingTop;
    const padBottom = estilos.paddingBottom;

    // `item.open` sigue en true durante todo el cierre (se apaga recién en
    // onfinish), así que sin consultar data-closing un click a mitad del
    // cierre repetiría el cierre en vez de revertirlo.
    const cerrandose = item.hasAttribute('data-closing');
    const abriendo = cerrandose ? true : !item.open;
    if (abriendo) item.open = true;

    const cerrado = { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 };
    const abierto = {
      height: panel.scrollHeight + 'px',
      paddingTop: padTop,
      paddingBottom: padBottom,
      opacity: 1
    };
    const desde = alturaActual === null
      ? (abriendo ? cerrado : abierto)
      : { height: alturaActual + 'px', paddingTop: padTop, paddingBottom: padBottom, opacity: 1 };

    panel.style.overflow = 'hidden';
    item.toggleAttribute('data-closing', !abriendo);

    // fill: 'forwards' sostiene el estado final hasta que se cierra el
    // <details>. Sin eso el panel vuelve a su altura natural un frame antes
    // de desaparecer, y el cierre pega un salto.
    const propia = panel.animate([desde, abriendo ? abierto : cerrado], {
      duration: DUR_ACORDEON,
      easing: EASE_OUT,
      fill: 'forwards'
    });
    animacion = propia;

    propia.onfinish = () => {
      // Si otro click ya arrancó otra animación, este finish es viejo.
      if (animacion !== propia) return;
      if (!abriendo) item.open = false;
      item.removeAttribute('data-closing');
      panel.style.overflow = '';
      animacion = null;
      propia.cancel(); // libera el fill una vez aplicado el estado real
    };
  });
});

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

  // Desplazamiento lateral de la transición direccional, en % del ancho.
  const DESPLAZAMIENTO = 2.5;

  // `direccion`: +1 avanza (la entrante llega desde la derecha),
  // -1 retrocede. Da sentido de recorrido a lo que antes era un fundido plano.
  function goTo(index, direccion) {
    const siguiente = (index + slides.length) % slides.length;
    if (siguiente === current) return;

    const entrante = slides[siguiente];
    const saliente = slides[current];
    const dir = direccion === undefined ? (siguiente > current ? 1 : -1) : direccion;

    if (!sinMovimiento()) {
      // La entrante se posiciona del lado correcto sin transición: está en
      // opacity 0, así que el salto de posición no se ve.
      entrante.style.transition = 'none';
      entrante.style.transform = `translateX(${dir * DESPLAZAMIENTO}%)`;
      entrante.offsetHeight; // fuerza el reflow antes de volver a animar
      entrante.style.transition = '';
      saliente.style.transform = `translateX(${-dir * DESPLAZAMIENTO}%)`;
    }
    entrante.style.transform = 'translateX(0)';

    current = siguiente;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    swatches.forEach((swatch, i) => swatch.classList.toggle('is-active', i === current));
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1, -1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1, 1));
  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.carouselGoto, 10)));
  });
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => goTo(parseInt(swatch.dataset.colorGoto, 10)));
  });

  // Movimiento constante y no solicitado: no arranca con reduced-motion.
  const arrancarAutoplay = () => sinMovimiento()
    ? null
    : setInterval(() => goTo(current + 1, 1), 5000);

  let autoplay = arrancarAutoplay();
  carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
  carousel.addEventListener('mouseleave', () => {
    clearInterval(autoplay);
    autoplay = arrancarAutoplay();
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
    track.style.transition = withTransition ? `transform ${TRANSITION_MS}ms ${EASE_OUT}` : 'none';
    track.style.transform = `translateX(-${current * (100 / visible)}%)`;
  }

  // El reset se agenda por tiempo (no por "transitionend"): en pestañas en
  // segundo plano o desenfocadas Chrome puede no disparar ese evento nunca,
  // dejando el índice crecer sin límite hasta mostrar espacio vacío.
  function next() {
    clearTimeout(resetTimer);

    // Si venimos de un ciclo ya completado, normalizamos sin animar ANTES de
    // avanzar. Sin esto `current` crece sin tope cuando los clicks llegan más
    // rápido que el reset, y termina pidiendo índices que no existen en el
    // track clonado: la última columna queda vacía.
    if (current >= total) {
      current -= total;
      update(false);
      track.offsetHeight; // reflow para que el salto no se anime
    }

    current++;
    update(true);

    if (current >= total) {
      resetTimer = setTimeout(() => {
        // Restar `total` y no ir a 0: en el set clonado la posición `current`
        // es visualmente idéntica a `current - total`, así que el salto es
        // invisible. Ir a 0 haría retroceder el carrusel.
        current -= total;
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
  // Movimiento constante y no solicitado: no arranca con reduced-motion.
  let autoplay = sinMovimiento() ? null : setInterval(next, AUTOPLAY_MS);

  function restartAutoplay() {
    clearInterval(autoplay);
    autoplay = sinMovimiento() ? null : setInterval(next, AUTOPLAY_MS);
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
