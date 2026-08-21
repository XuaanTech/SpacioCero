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
    // 7. AVISO DE SEPTIEMBRE CERRADO (DINÁMICO)
    // =============================================
    function gestionarAvisoSeptiembre() {
        const aviso = document.getElementById('aviso-septiembre');
        if (!aviso) return;
        const mesActual = new Date().getMonth();
        if (mesActual === 7 || mesActual === 8) {
            aviso.style.display = 'block';
        } else {
            aviso.style.display = 'none';
        }
    }
    gestionarAvisoSeptiembre();

    // =============================================
    // 8. SISTEMA DE CONSENTIMIENTO DE COOKIES
    // =============================================
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const rejectBtn = document.getElementById('rejectCookies');
    const configBtn = document.getElementById('configurar-cookies');

    const mapContainer = document.getElementById('google-map-container');
    const loadMapBtn = document.getElementById('load-map-btn');
    const grContainer = document.getElementById('gr-widget-container');

    function forzarCentradoGRWidget() {
        const container = document.getElementById('gr-widget-container');
        if (!container) return;
        const widget = container.querySelector('.grwidget-embed');
        if (!widget) return;
        widget.style.display = 'flex';
        widget.style.flexDirection = 'column';
        widget.style.alignItems = 'center';
        widget.style.justifyContent = 'center';
        widget.style.width = '100%';
        widget.style.maxWidth = '800px';
        widget.style.margin = '0 auto';
        widget.style.textAlign = 'center';
        const allChildren = widget.querySelectorAll('*');
        allChildren.forEach(function(el) {
            el.style.marginLeft = 'auto';
            el.style.marginRight = 'auto';
            el.style.textAlign = 'center';
            el.style.display = 'block';
            el.style.float = 'none';
            el.style.clear = 'both';
        });
        const lists = widget.querySelectorAll('ul, li');
        lists.forEach(function(el) {
            el.style.listStyle = 'none';
            el.style.padding = '0';
            el.style.margin = '0 auto';
            el.style.textAlign = 'center';
            el.style.display = 'flex';
            el.style.flexDirection = 'column';
            el.style.alignItems = 'center';
        });
    }

    function cargarGRWidget() {
        if (!grContainer) return;
        const key = grContainer.dataset.grwidgetKey;
        grContainer.classList.remove('third-party-placeholder');
        grContainer.innerHTML = `<div class="grwidget-embed" data-grwidget-key="${key}"></div>`;
        const script = document.createElement('script');
        script.src = 'https://grwidget.com/v1/grwidget.js';
        script.async = true;
        script.defer = true;
        script.onload = function() {
            setTimeout(forzarCentradoGRWidget, 500);
        };
        document.body.appendChild(script);
        const observer = new MutationObserver(function(mutations) {
            const widget = grContainer.querySelector('.grwidget-embed');
            if (widget) {
                forzarCentradoGRWidget();
                observer.disconnect();
            }
        });
        observer.observe(grContainer, { childList: true, subtree: true });
    }

    function cargarGoogleMaps() {
        if (!mapContainer) return;
        const mapUrl = mapContainer.dataset.mapUrl;
        mapContainer.classList.remove('third-party-placeholder');
        mapContainer.innerHTML = `<iframe src="${mapUrl}" width="100%" height="220" style="border:0; border-radius:20px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Ubicación de Spaciocero"></iframe>`;
    }

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
        cargarGoogleMaps();
        cargarGRWidget();
        loadFontAwesome();
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

    const cookiePreference = localStorage.getItem('cookiesPreference');
    if (cookiePreference === 'accepted') {
        aceptarCookies();
    } else if (cookiePreference === 'rejected') {
        rechazarCookies();
    } else {
        mostrarBanner();
    }

    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const pref = localStorage.getItem('cookiesPreference');
            if (pref !== 'accepted') {
                mostrarBanner();
                alert('Por favor, acepta las cookies de terceros para ver el mapa.');
                return;
            }
            cargarGoogleMaps();
        });
    }

    // =============================================
    // 9. ANIMACIONES FADE-IN
    // =============================================
    const fadeElements = document.querySelectorAll('.section, .clase-card, .equipo-card, .ideal-item, .galeria-item, .primera-clase-content, .yoga-local-content');
    const observer2 = new IntersectionObserver((entries) => {
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
        observer2.observe(el);
    });

    // =============================================
    // 10. MODAL "MÁS INFO"
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
        modalAction.href = `https://wa.me/34661545051?text=${mensajeWhatsApp}`;
        modalAction.target = '_blank';
        modalAction.rel = 'noopener noreferrer';
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
    // 11. BOTÓN FLOTANTE DE WHATSAPP → COMPARTIR
    // =============================================
    const floatWhatsApp = document.querySelector('.float-btn.whatsapp-btn');
    if (floatWhatsApp) {
        floatWhatsApp.removeAttribute('href');
        floatWhatsApp.style.cursor = 'pointer';
        floatWhatsApp.addEventListener('click', function(e) {
            e.preventDefault();
            acciones.whatsapp();
        });
    }

});