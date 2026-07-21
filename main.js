function cambiarColor(color) {
    const imagen = document.getElementById('img-luminaria');
    const dots = document.querySelectorAll('.color-dot');

    if (color === 'negro') {
        imagen.src = 'images/Luma_luminaria.png';
    } else if (color === 'blanco') {
        imagen.src = 'images/Luma_luminaria_blanca.png';
    }

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

document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.main-nav').classList.remove('active');
    });
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1 
});

document.querySelectorAll('.reveal, .reveal-left').forEach((el) => observer.observe(el));
const topBtn = document.getElementById("backToTop");


window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    if (document.body.scrollTop > 600 || document.documentElement.scrollTop > 600) {
        topBtn.style.display = "block";
    } else {
        topBtn.style.display = "none";
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}