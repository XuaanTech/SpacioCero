/**
 * legal-script.js - Script para páginas legales
 * Funcionalidad: menú hamburguesa y año dinámico en footer.
 */

document.addEventListener('DOMContentLoaded', function () {

    // =============================================
    // 1. MENÚ HAMBURGUESA
    // =============================================
    const toggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', nav.classList.contains('open'));
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target) && !toggle.contains(e.target)) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // =============================================
    // 2. AÑO DINÁMICO EN FOOTER
    // =============================================
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        const añoActual = new Date().getFullYear();
        footerYear.innerHTML = `&copy; ${añoActual} · Spaciocero`;
    }

});