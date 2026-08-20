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
// El mismo breakpoint que usa el CSS para pasar al menú desplegable.
// Todo lo que sigue distingue mobile de desktop a partir de acá.
const menuMobile = window.matchMedia('(max-width: 768px)');

// Un dropdown abierto en mobile es estado de la página, no del hover:
// se marca con la clase `is-open` sobre el <li class="dropdown">.
function cerrarDropdowns() {
  document.querySelectorAll('.main-nav .dropdown.is-open').forEach(dropdown => {
    dropdown.classList.remove('is-open');
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
}

function sincronizarMenu(abierto) {
  // Los botones flotantes se esconden con el menú abierto: si no, el de
  // WhatsApp queda flotando por encima del panel y tapa la última opción.
  document.documentElement.toggleAttribute('data-menu-abierto', abierto);
  if (!abierto) cerrarDropdowns();

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

// Un toggle de dropdown en mobile, todavía cerrado, despliega en vez de
// navegar: por eso no cierra el menú entero.
function despliegaSubmenu(link) {
  return (
    menuMobile.matches &&
    link.classList.contains('dropdown-toggle') &&
    link.parentElement &&
    !link.parentElement.classList.contains('is-open')
  );
}

/* La decisión se toma una sola vez por click, en fase de captura, antes de
   que ningún listener toque el DOM. Si cada uno la evaluara por su cuenta,
   el que cierra el menú borraría `is-open` primero y el segundo toque
   volvería a abrir el submenú en lugar de navegar. */
let toqueDespliega = false;

document.addEventListener('click', (evento) => {
  const link = evento.target.closest ? evento.target.closest('.main-nav a') : null;
  toqueDespliega = !!link && despliegaSubmenu(link);
}, true);

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (toqueDespliega) return;
    const nav = document.querySelector('.main-nav');
    if (nav) nav.classList.remove('active');
    sincronizarMenu(false);
  });
});

/* ── Dropdowns del menú mobile ────────────────
   En una pantalla táctil no hay hover: sin esto, tocar "Camillas" navega
   directo al hub y el submenú (Premium / One / Ginecológica) no se llega
   a ver nunca, aunque el chevron prometa que se despliega.
   Primer toque: abre. Segundo toque sobre el mismo link: navega. */
document.querySelectorAll('.main-nav .dropdown > .dropdown-toggle').forEach(toggle => {
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', (evento) => {
    if (!toqueDespliega) return;
    evento.preventDefault();

    // Uno solo abierto por vez: dos submenús desplegados no entran en pantalla.
    cerrarDropdowns();
    toggle.parentElement.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  });
});

// Al pasar a desktop el hover vuelve a mandar: el estado táctil sobra.
menuMobile.addEventListener('change', (evento) => {
  if (!evento.matches) cerrarDropdowns();
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

/* ── Carrusel de track deslizante (reutilizable) ──
   Usado por el carrusel de testimonios (loop infinito + autoplay) y por el
   de reels de Instagram (finito, sin autoplay). Antes esta lógica vivía
   duplicada; ahora se configura por opciones.

   config = {
     trackSelector, prevSelector, nextSelector,
     visibleCount: (anchoVentana) => n,
     loop: bool,        // clona el set completo para avanzar sin fin
     autoplayMs: 0      // 0 = sin autoplay
   }
*/
function initTrackCarousel(carousel, config) {
  const track = carousel.querySelector(config.trackSelector);
  if (!track) return;

  const originalSlides = Array.from(track.children);
  const total = originalSlides.length;
  if (total < 2) return;

  const loop = config.loop !== false;
  const autoplayMs = config.autoplayMs || 0;

  // En modo loop clonamos el set completo y lo agregamos al final: permite
  // avanzar indefinidamente hacia adelante y, al pasar el set clonado,
  // resetear la posición sin transición para simular un loop infinito.
  //
  // El carrusel de reels NO clona: cada clon sería otro iframe de Instagram
  // cargándose de nuevo, duplicando el peso de la página.
  if (loop) {
    originalSlides.forEach(slide => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  const getVisibleCount = () => config.visibleCount(window.innerWidth);

  let visible = getVisibleCount();
  let current = 0;
  const TRANSITION_MS = 600;
  let resetTimer = null;

  const prevBtn = carousel.querySelector(config.prevSelector);
  const nextBtn = carousel.querySelector(config.nextSelector);

  // Sin loop hay principio y fin: las flechas se apagan en los extremos.
  function maxIndex() {
    return Math.max(0, total - visible);
  }

  function sincronizarFlechas() {
    if (loop) return;
    // Si entran todas las slides a la vez no hay nada que navegar: se
    // esconden las flechas y las tarjetas se centran en vez de quedar
    // pegadas a la izquierda con una columna vacia al lado.
    carousel.classList.toggle('sin-navegacion', total <= visible);
    prevBtn && prevBtn.setAttribute('aria-disabled', current <= 0 ? 'true' : 'false');
    nextBtn && nextBtn.setAttribute('aria-disabled', current >= maxIndex() ? 'true' : 'false');
  }

  function update(withTransition) {
    track.style.transition = withTransition ? `transform ${TRANSITION_MS}ms ${EASE_OUT}` : 'none';
    track.style.transform = `translateX(-${current * (100 / visible)}%)`;
    sincronizarFlechas();
  }

  // El reset se agenda por tiempo (no por "transitionend"): en pestañas en
  // segundo plano o desenfocadas Chrome puede no disparar ese evento nunca,
  // dejando el índice crecer sin límite hasta mostrar espacio vacío.
  function next() {
    if (!loop) {
      if (current >= maxIndex()) return;
      current++;
      update(true);
      return;
    }

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
    if (!loop) {
      if (current <= 0) return;
      current--;
      update(true);
      return;
    }

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

  // Movimiento constante y no solicitado: no arranca con reduced-motion.
  const puedeAutoplay = () => autoplayMs > 0 && !sinMovimiento();
  let autoplay = puedeAutoplay() ? setInterval(next, autoplayMs) : null;

  function restartAutoplay() {
    clearInterval(autoplay);
    autoplay = puedeAutoplay() ? setInterval(next, autoplayMs) : null;
  }

  if (autoplayMs > 0) {
    carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
    carousel.addEventListener('mouseleave', restartAutoplay);
  }

  prevBtn && prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });
  nextBtn && nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });

  // Swipe tactil y drag de mouse. Es opt-in porque el track se mueve por
  // transform y no por scroll nativo: el gesto hay que cablearlo a mano, y
  // los carruseles que embeben iframes (reels) no lo quieren, ahi el gesto
  // pertenece al contenido de adentro.
  if (config.swipe) {
    const UMBRAL = 40; // px de desplazamiento antes de contar como swipe
    let inicioX = 0;
    let inicioY = 0;
    let activo = false;

    track.addEventListener('pointerdown', e => {
      // Solo boton primario del mouse; el resto abre menues contextuales.
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      inicioX = e.clientX;
      inicioY = e.clientY;
      activo = true;
    });

    track.addEventListener('pointerup', e => {
      if (!activo) return;
      activo = false;

      const dx = e.clientX - inicioX;
      const dy = e.clientY - inicioY;

      // Si el gesto fue mas vertical que horizontal es un scroll de pagina,
      // no un swipe: no se toca el carrusel ni se cancela el scroll.
      if (Math.abs(dx) < UMBRAL || Math.abs(dx) <= Math.abs(dy)) return;

      dx < 0 ? next() : prev();
      restartAutoplay();
    });

    track.addEventListener('pointercancel', () => { activo = false; });
  }

  window.addEventListener('resize', () => {
    const newVisible = getVisibleCount();
    if (newVisible !== visible) {
      visible = newVisible;
      if (!loop && current > maxIndex()) current = maxIndex();
      update(false);
    }
  });
}

/* ── Carrusel de testimonios (loop infinito, 3 tarjetas) ── */
document.querySelectorAll('[data-testimonio-carousel]').forEach(carousel => {
  initTrackCarousel(carousel, {
    trackSelector: '.testimonio-carousel-track',
    prevSelector: '[data-testimonio-prev]',
    nextSelector: '[data-testimonio-next]',
    visibleCount: w => (w <= 768 ? 1 : w <= 900 ? 2 : 3),
    loop: true,
    autoplayMs: 4500,
  });
});

/* ── Carrusel de reels de Instagram ──────────── */
// Finito y sin autoplay: son videos embebidos, moverlos solos mientras
// alguien mira uno es molesto, y clonar slides duplicaría los iframes.
document.querySelectorAll('[data-reels-carousel]').forEach(carousel => {
  initTrackCarousel(carousel, {
    trackSelector: '.reels-track',
    prevSelector: '[data-reels-prev]',
    nextSelector: '[data-reels-next]',
    visibleCount: w => (w <= 700 ? 1 : w <= 1024 ? 2 : 3),
    loop: false,
    autoplayMs: 0,
  });
});

/* Los reels ya no usan embed.js: cada tarjeta es un <iframe> de
   instagram.com/.../embed/ recortado por CSS, con loading="lazy" nativo.
   Eso saca ~150 kB de JS de terceros de la pagina. */

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
  };

  const hash = window.location.hash;
  if (hash && redirects[hash]) {
    window.location.replace(redirects[hash]);
  }
})();
