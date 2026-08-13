/**
 * Spaciocero - Script principal
 * Funcionalidad: menú hamburguesa, dropdown compartir, acordeón FAQ,
 * estado de apertura dinámico, año dinámico y banner de cookies (con Aceptar/Rechazar).
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
    // 2. DROPDOWN COMPARTIR
    // =============================================
    const btnCompartir = document.querySelector('.btn-compartir');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (btnCompartir && dropdownMenu) {
        function toggleDropdown(open) {
            if (open === undefined) {
                open = !dropdownMenu.classList.contains('open');
            }
            if (open) {
                dropdownMenu.classList.add('open');
                dropdownMenu.style.display = 'block';
                dropdownMenu.style.opacity = '1';
                dropdownMenu.style.visibility = 'visible';
                btnCompartir.setAttribute('aria-expanded', 'true');
            } else {
                dropdownMenu.classList.remove('open');
                dropdownMenu.style.display = 'none';
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.visibility = 'hidden';
                btnCompartir.setAttribute('aria-expanded', 'false');
            }
        }

        btnCompartir.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleDropdown();
        });

        document.addEventListener('click', function (e) {
            if (!btnCompartir.contains(e.target) && !dropdownMenu.contains(e.target)) {
                if (dropdownMenu.classList.contains('open')) toggleDropdown(false);
            }
        });

        dropdownMenu.querySelectorAll('.dropdown-item').forEach(function (item) {
            item.addEventListener('click', function () {
                setTimeout(function () { toggleDropdown(false); }, 300);
            });
        });
    }

    // =============================================
    // 3. ACCIONES DE COMPARTIR (URL limpia)
    // =============================================
    const url = encodeURIComponent(window.location.href.split('#')[0]);
    const titulo = encodeURIComponent('Spaciocero · Yoga y Bienestar en Villaviciosa');
    const texto = encodeURIComponent('Descubre Spaciocero, un espacio de yoga y bienestar en Villaviciosa.');

    const acciones = {
        whatsapp: () => window.open(`https://wa.me/?text=${texto}%20${url}`, '_blank'),
        twitter: () => window.open(`https://twitter.com/intent/tweet?text=${texto}&url=${url}`, '_blank'),
        telegram: () => window.open(`https://t.me/share/url?url=${url}&text=${texto}`, '_blank'),
        facebook: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank'),
        email: () => window.open(`mailto:?subject=${titulo}&body=${texto}%20${url}`, '_blank'),
        copiar: () => {
            const enlace = window.location.href.split('#')[0];
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(enlace).then(() => mostrarMensaje());
            } else {
                const input = document.createElement('input');
                input.value = enlace;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                mostrarMensaje();
            }
        }
    };

    function mostrarMensaje() {
        const mensaje = document.createElement('span');
        mensaje.className = 'copiar-mensaje';
        mensaje.textContent = '✅ Enlace copiado';
        const dropdown = document.querySelector('.dropdown-menu');
        if (dropdown) {
            const anterior = dropdown.querySelector('.copiar-mensaje');
            if (anterior) anterior.remove();
            dropdown.appendChild(mensaje);
            setTimeout(() => mensaje.classList.add('visible'), 50);
            setTimeout(() => {
                mensaje.classList.remove('visible');
                setTimeout(() => mensaje.remove(), 400);
            }, 2000);
        } else {
            alert('Enlace copiado al portapapeles');
        }
    }

    document.querySelectorAll('[data-share]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            const accion = this.dataset.share;
            if (accion && acciones[accion]) acciones[accion]();
        });
    });

    // =============================================
    // 4. ACORDEÓN FAQ
    // =============================================
    const preguntas = document.querySelectorAll('.faq-pregunta');

    preguntas.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const isOpen = this.getAttribute('aria-expanded') === 'true';
            preguntas.forEach(function (b) {
                if (b !== btn && b.getAttribute('aria-expanded') === 'true') {
                    b.setAttribute('aria-expanded', 'false');
                    b.nextElementSibling.classList.remove('open');
                }
            });
            this.setAttribute('aria-expanded', !isOpen);
            this.nextElementSibling.classList.toggle('open');
        });
    });

    // =============================================
    // 5. ESTADO DE APERTURA DINÁMICO
    // =============================================
    function actualizarEstadoApertura() {
        const ahora = new Date();
        const dia = ahora.getDay();
        const hora = ahora.getHours();
        const minutos = ahora.getMinutes();
        const horaMin = hora + minutos / 60;

        const horario = {
            1: { abrir: 8, cerrar: 21 },
            2: { abrir: 8, cerrar: 21 },
            3: { abrir: 8, cerrar: 21 },
            4: { abrir: 9, cerrar: 21 }
        };

        const hoy = horario[dia];
        const indicador = document.querySelector('.estado-indicador');
        const textoEstado = document.querySelector('.horario-estado');

        if (!indicador || !textoEstado) return;

        let abierto = false;
        let mensaje = '';

        if (hoy) {
            abierto = (horaMin >= hoy.abrir && horaMin < hoy.cerrar);
            mensaje = abierto 
                ? `Abierto ahora · cierra a las ${hoy.cerrar}:00` 
                : `Cerrado · abre a las ${hoy.abrir}:00`;
        } else {
            mensaje = 'Cerrado · abre el lunes a las 8:00';
        }

        textoEstado.innerHTML = `<span class="estado-indicador ${abierto ? 'abierto' : 'cerrado'}"></span> ${mensaje}`;
    }

    actualizarEstadoApertura();
    setInterval(actualizarEstadoApertura, 60000);

    // =============================================
    // 6. AÑO DINÁMICO EN FOOTER
    // =============================================
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        const añoActual = new Date().getFullYear();
        footerYear.innerHTML = `&copy; ${añoActual} · Spaciocero`;
    }

    // =============================================
    // 7. BANNER DE COOKIES (CON ACEPTAR Y RECHAZAR)
    // =============================================
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const rejectBtn = document.getElementById('rejectCookies');

    if (cookieBanner && acceptBtn && rejectBtn) {
        // Comprobar si ya se ha tomado una decisión
        const cookiePreference = localStorage.getItem('cookiesPreference');
        if (!cookiePreference) {
            cookieBanner.style.display = 'flex';
        }

        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesPreference', 'accepted');
            cookieBanner.style.display = 'none';
            // Aquí podrías cargar scripts de terceros si los hubiera
        });

        rejectBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesPreference', 'rejected');
            cookieBanner.style.display = 'none';
            // Si quisieras, podrías deshabilitar cookies de terceros
        });
    }

});