/**
 * legal-script.js - Script para páginas legales
 * Funcionalidad: menú hamburguesa, año dinámico, carga de Font Awesome según consentimiento,
 * y sistema completo de gestión de cookies (banner, aceptar/rechazar, botón configurar).
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

    // =============================================
    // 3. SISTEMA DE CONSENTIMIENTO DE COOKIES
    // =============================================
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const rejectBtn = document.getElementById('rejectCookies');
    const configBtn = document.getElementById('configurar-cookies');

    // Carga de Font Awesome (solo si aceptado)
    function loadFontAwesome() {
        if (document.querySelector('link[href*="font-awesome"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
        document.head.appendChild(link);
    }

    function aceptarCookies() {
        localStorage.setItem('cookiesPreference', 'accepted');
        cookieBanner.style.display = 'none';
        loadFontAwesome();
        // Aquí podrías añadir lógica para cargar otros servicios de terceros si los hubiera en legales
    }

    function rechazarCookies() {
        localStorage.setItem('cookiesPreference', 'rejected');
        cookieBanner.style.display = 'none';
    }

    function mostrarBanner() {
        cookieBanner.style.display = 'flex';
    }

    function resetearConsentimiento() {
        localStorage.removeItem('cookiesPreference');
        window.location.reload();
    }

    if (acceptBtn) acceptBtn.addEventListener('click', aceptarCookies);
    if (rejectBtn) rejectBtn.addEventListener('click', rechazarCookies);
    if (configBtn) configBtn.addEventListener('click', resetearConsentimiento);

    // Comprobar preferencia al cargar
    const cookiePreference = localStorage.getItem('cookiesPreference');
    if (cookiePreference === 'accepted') {
        aceptarCookies();  // oculta banner y carga Font Awesome
    } else if (cookiePreference === 'rejected') {
        rechazarCookies(); // solo oculta banner
    } else {
        mostrarBanner();   // sin preferencia, mostrar banner
    }

});