function cambiarColor(color) {
    const imagen = document.getElementById('img-luminaria');
    const dots = document.querySelectorAll('.color-dot');

    // Cambiar la ruta de la imagen según el color elegido
    if (color === 'negro') {
        imagen.src = 'images/Luma_luminaria.png';
    } else if (color === 'blanco') {
        imagen.src = 'images/Luma_luminaria_blanca.png';
    }

    // Actualizar visualmente qué círculo está seleccionado
    dots.forEach(dot => {
        dot.classList.remove('active');
        if (color === 'negro' && dot.classList.contains('black')) dot.classList.add('active');
        if (color === 'blanco' && dot.classList.contains('white')) dot.classList.add('active');
    });
}
function toggleMenu() {
    const nav = document.querySelector('.main-nav');
    nav.classList.toggle('active');
}

// Cerrar el menú automáticamente al hacer clic en una opción (opcional)
document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.main-nav').classList.remove('active');
    });
});
// Función para detectar el scroll y activar animaciones
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1 // Se activa cuando se ve el 10% del bloque
});

// Seleccionamos todos los elementos que queremos animar
document.querySelectorAll('.reveal, .reveal-left').forEach((el) => observer.observe(el));
// Obtener el botón
const topBtn = document.getElementById("backToTop");

// Mostrar el botón cuando se baja 200px
window.onscroll = function() {
    scrollFunction();
    // Aquí podés mantener también la función de la barra de progreso que vimos antes
};

function scrollFunction() {
    if (document.body.scrollTop > 600 || document.documentElement.scrollTop > 600) {
        topBtn.style.display = "block";
    } else {
        topBtn.style.display = "none";
    }
}

// Función para volver arriba suavemente
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}