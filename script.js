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
    const texto = encodeURIComponent('Ven a Spaciocero, el mejor centro de yoga y pilates en Villaviciosa. ¡Relájate y recarga energías!');

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
    // 7. BANNER DE COOKIES
    // =============================================
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const rejectBtn = document.getElementById('rejectCookies');

    if (cookieBanner && acceptBtn && rejectBtn) {
        const cookiePreference = localStorage.getItem('cookiesPreference');
        if (!cookiePreference) {
            cookieBanner.style.display = 'flex';
        }

        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesPreference', 'accepted');
            cookieBanner.style.display = 'none';
        });

        rejectBtn.addEventListener('click', function() {
            localStorage.setItem('cookiesPreference', 'rejected');
            cookieBanner.style.display = 'none';
        });
    }

    // =============================================
    // 8. ANIMACIONES FADE-IN AL HACER SCROLL
    // =============================================
    const fadeElements = document.querySelectorAll('.section, .clase-card, .equipo-card, .ideal-item, .galeria-item, .primera-clase-content, .yoga-local-content');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // =============================================
    // 9. MODAL "MÁS INFO" DE CLASES
    // =============================================
    const modalOverlay = document.getElementById('modalInfo');
    const modalTitle = document.getElementById('modalTitle');
    const modalText = document.getElementById('modalText');
    const modalClose = document.getElementById('modalClose');
    const modalAction = document.getElementById('modalAction');

    function abrirModal(clase) {
        let nombreClase = clase.charAt(0).toUpperCase() + clase.slice(1);
        const nombres = {
            'hatha': 'Hatha Yoga',
            'vinyasa': 'Vinyasa Flow',
            'yin': 'Yin Yoga',
            'pilates': 'Pilates',
            'barre': 'Barre',
            'tratamiento': 'Tratamiento'
        };
        nombreClase = nombres[clase] || nombreClase;

        modalTitle.textContent = `🧘 ${nombreClase}`;
        modalText.textContent = `Información detallada de ${nombreClase} (próximamente). Puedes reservar directamente por WhatsApp.`;
        const mensajeWhatsApp = encodeURIComponent(`Hola, me gustaría reservar ${nombreClase}`);
        modalAction.href = `https://wa.me/34656167226?text=${mensajeWhatsApp}`;
        modalAction.target = '_blank';
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function cerrarModal() {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.btn-info').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const clase = this.dataset.clase || 'clase';
            abrirModal(clase);
        });
    });

    modalClose.addEventListener('click', cerrarModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) cerrarModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
            cerrarModal();
        }
    });

    // =============================================
    // 10. BOTÓN FLOTANTE DE WHATSAPP → COMPARTIR
    // =============================================
    const floatWhatsApp = document.querySelector('.float-btn.whatsapp-btn');
    if (floatWhatsApp) {
        // Eliminamos el href original para que no abra el chat de reserva
        floatWhatsApp.removeAttribute('href');
        // Lo convertimos en un botón (pero manteniendo estilos)
        floatWhatsApp.style.cursor = 'pointer';
        // Al hacer clic, ejecutamos la acción de compartir
        floatWhatsApp.addEventListener('click', function(e) {
            e.preventDefault();
            acciones.whatsapp();
        });
    }

});