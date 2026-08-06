// ============================================================
// script.js - Frontend completo con contraseña, modal, recuerdos
//           y reproductor de música personalizado (con shuffle y repeat)
// ============================================================

// ------------------------------------------------------------
// 0. CONTRASEÑA (persistente en localStorage)
// ------------------------------------------------------------
const PASSWORD = 'losgutierrez'; // Cambia esta clave por la que quieras
const overlay = document.getElementById('passwordOverlay');
const mainContent = document.getElementById('mainContent');
const passwordInput = document.getElementById('passwordInput');
const passwordBtn = document.getElementById('passwordBtn');
const passwordError = document.getElementById('passwordError');

// Comprobar si ya ha introducido la contraseña antes
if (localStorage.getItem('auth_mama') === 'true') {
    overlay.style.display = 'none';
    mainContent.style.display = 'block';
} else {
    overlay.style.display = 'flex';
    mainContent.style.display = 'none';
}

function verificarContraseña() {
    const input = passwordInput.value.trim();
    if (input === PASSWORD) {
        localStorage.setItem('auth_mama', 'true');
        overlay.style.display = 'none';
        mainContent.style.display = 'block';
        passwordError.style.display = 'none';
        // Inicializar todo después de autenticar
        iniciarApp();
    } else {
        passwordError.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

passwordBtn.addEventListener('click', verificarContraseña);
passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verificarContraseña();
});

// ------------------------------------------------------------
// 1. SOBRE Y CARTA (toggle abrir/cerrar)
// ------------------------------------------------------------
const envelopeWrapper = document.getElementById('envelopeWrapper');
const flap = document.getElementById('flap');
const letter = document.getElementById('letter');
const envelopeText = document.getElementById('envelopeText');
let isOpen = false;

envelopeWrapper.addEventListener('click', () => {
    if (isOpen) {
        flap.classList.remove('open');
        letter.classList.remove('show');
        envelopeText.textContent = '💌 Toca para abrir';
        isOpen = false;
    } else {
        flap.classList.add('open');
        letter.classList.add('show');
        envelopeText.textContent = '💌 Toca para cerrar';
        isOpen = true;
    }
});

// ------------------------------------------------------------
// 2. POLAROIDS: rotación aleatoria + clic para abrir modal
// ------------------------------------------------------------
document.querySelectorAll('.polaroid').forEach(p => {
    const rot = (Math.random() * 8 - 4).toFixed(1);
    p.style.setProperty('--rot', rot + 'deg');
    // Añadir evento de clic a la polaroid (no solo a la imagen)
    p.addEventListener('click', function(e) {
        // Evitar que el clic en la imagen se propague dos veces
        e.stopPropagation();
        const img = this.querySelector('img');
        if (img) {
            const caption = this.querySelector('.caption')?.textContent || '';
            abrirModal(img.src, caption);
        }
    });
});

// ------------------------------------------------------------
// 3. BOTÓN DE ABRAZOS (con contador en la nube)
// ------------------------------------------------------------
const hugBtn = document.getElementById('hugBtn');
const hugCount = document.getElementById('hugCount');
const heartRain = document.getElementById('heartRain');

async function obtenerAbrazos() {
    try {
        const res = await fetch('/api/abrazos');
        if (!res.ok) throw new Error('Error al obtener abrazos');
        const data = await res.json();
        hugCount.textContent = data.total;
    } catch (error) {
        console.error('Error obteniendo abrazos:', error);
        hugCount.textContent = '0';
    }
}

async function incrementarAbrazos() {
    try {
        const res = await fetch('/api/abrazos', { method: 'POST' });
        if (!res.ok) throw new Error('Error al incrementar');
        const data = await res.json();
        hugCount.textContent = data.total;
    } catch (error) {
        console.error('Error incrementando abrazos:', error);
    }
}

hugBtn.addEventListener('click', () => {
    incrementarAbrazos();
    const heartEmojis = ['❤️', '🧡', '💛', '💚', '💙', '💜', '💖', '💗', '💓', '💘', '💝'];
    for (let i = 0; i < 30; i++) {
        const span = document.createElement('span');
        span.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        const x = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const size = 1.2 + Math.random() * 2.0;
        span.style.left = x + '%';
        span.style.fontSize = size + 'rem';
        span.style.animationDuration = (2 + Math.random() * 3) + 's';
        span.style.animationDelay = delay + 's';
        heartRain.appendChild(span);
        setTimeout(() => span.remove(), 6000);
    }
});

// ------------------------------------------------------------
// 4. MODAL DE IMAGEN (para polaroids y recuerdos)
// ------------------------------------------------------------
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const modalClose = document.getElementById('modalClose');

function abrirModal(src, caption = '') {
    modalImg.src = src;
    modalCaption.textContent = caption;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden'; // evitar scroll
}

function cerrarModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', cerrarModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
});

// ------------------------------------------------------------
// 5. ADMIN: Recuerdos (con subida integrada a Cloudinary)
// ------------------------------------------------------------
const adminToggle = document.getElementById('adminToggle');
const adminPanel = document.getElementById('adminPanel');
const cerrarAdmin = document.getElementById('cerrarAdmin');
const guardarBtn = document.getElementById('guardarRecuerdo');
const recTitulo = document.getElementById('recTitulo');
const recTexto = document.getElementById('recTexto');
const recImagenFile = document.getElementById('recImagenFile');
const recuerdosGrid = document.getElementById('recuerdosGrid');
const noRecuerdos = document.getElementById('noRecuerdos');
const adminListaRecuerdos = document.getElementById('adminListaRecuerdos');

const API_URL = '/api/recuerdos';

adminToggle.addEventListener('click', (e) => {
    e.preventDefault();
    adminPanel.classList.toggle('open');
    if (adminPanel.classList.contains('open')) {
        cargarRecuerdosAdmin();
    }
});

cerrarAdmin.addEventListener('click', () => {
    adminPanel.classList.remove('open');
});

// --- Cargar recuerdos (vista principal) ---
async function cargarRecuerdos() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al cargar recuerdos');
        const recuerdos = await res.json();
        recuerdosGrid.innerHTML = '';
        if (recuerdos.length === 0) {
            noRecuerdos.style.display = 'block';
            return;
        }
        noRecuerdos.style.display = 'none';
        recuerdos.forEach((r) => {
            const card = document.createElement('div');
            card.className = 'recuerdo-card';
            // Al hacer clic en el recuerdo, abrir modal con la imagen (si tiene)
            card.addEventListener('click', () => {
                if (r.imagen) {
                    abrirModal(r.imagen, r.titulo + ' - ' + r.texto);
                } else {
                    alert('Este recuerdo no tiene imagen para mostrar en grande.');
                }
            });
            card.innerHTML = `
                ${r.imagen ? `<img src="${r.imagen}" alt="${r.titulo}" />` : '<div style="width:100%;aspect-ratio:1/1;background:#f0e3db;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:3rem;">📷</div>'}
                <h4>${r.titulo}</h4>
                <p>${r.texto}</p>
            `;
            recuerdosGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error cargando recuerdos:', error);
        recuerdosGrid.innerHTML = '<p style="text-align:center;color:#a07a6a;">Error al cargar los recuerdos.</p>';
    }
}

// --- Cargar recuerdos (panel admin) ---
async function cargarRecuerdosAdmin() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al cargar');
        const recuerdos = await res.json();
        adminListaRecuerdos.innerHTML = '';
        if (recuerdos.length === 0) {
            adminListaRecuerdos.innerHTML = '<p style="text-align:center;color:#a07a6a;">No hay recuerdos aún.</p>';
            return;
        }
        recuerdos.forEach((r) => {
            const div = document.createElement('div');
            div.className = 'admin-recuerdo-item';
            div.innerHTML = `
                <span><strong>${r.titulo}</strong> - ${r.texto.substring(0, 40)}${r.texto.length > 40 ? '...' : ''}</span>
                <button onclick="eliminarRecuerdo(${r.id})">🗑️ Eliminar</button>
            `;
            adminListaRecuerdos.appendChild(div);
        });
    } catch (error) {
        console.error('Error cargando lista admin:', error);
        adminListaRecuerdos.innerHTML = '<p style="text-align:center;color:#a07a6a;">Error al cargar la lista.</p>';
    }
}

// --- GUARDAR RECUERDO (con subida DIRECTA a Cloudinary) ---
guardarBtn.addEventListener('click', async () => {
    console.log('🔵 Botón "Guardar recuerdo" presionado');

    const titulo = recTitulo.value.trim();
    const texto = recTexto.value.trim();
    const file = recImagenFile.files[0];

    if (!titulo || !texto) {
        alert('Por favor, escribe al menos un título y un texto.');
        return;
    }

    let imagenUrl = '';

    if (file) {
        console.log('⬆️ Subiendo imagen a Cloudinary...');
        try {
            const cloudinaryFormData = new FormData();
            cloudinaryFormData.append('file', file);
            cloudinaryFormData.append('upload_preset', 'recuerdos_ysa'); // ← TU PRESET

            const res = await fetch('https://api.cloudinary.com/v1_1/fusmqsuy/image/upload', {
                method: 'POST',
                body: cloudinaryFormData
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('❌ Error de Cloudinary:', errorData);
                throw new Error(errorData.error?.message || 'Error al subir imagen');
            }

            const data = await res.json();
            console.log('✅ Imagen subida correctamente. URL:', data.secure_url);
            imagenUrl = data.secure_url;

        } catch (error) {
            console.error('❌ Error subiendo imagen:', error);
            alert('Error al subir la imagen: ' + error.message);
            return;
        }
    } else {
        console.log('ℹ️ No hay imagen, se guardará sin ella.');
    }

    try {
        console.log('💾 Guardando recuerdo en D1...');
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, texto, imagen: imagenUrl })
        });

        if (!res.ok) {
            const errorData = await res.json();
            console.error('❌ Error de D1:', errorData);
            throw new Error(errorData.error || 'Error al guardar');
        }

        console.log('✅ Recuerdo guardado correctamente.');
        recTitulo.value = '';
        recTexto.value = '';
        recImagenFile.value = '';
        await cargarRecuerdos();
        await cargarRecuerdosAdmin();
        alert('¡Recuerdo guardado correctamente!');
    } catch (error) {
        console.error('❌ Error guardando recuerdo:', error);
        alert('Error al guardar el recuerdo: ' + error.message);
    }
});

// --- Eliminar recuerdo ---
window.eliminarRecuerdo = async function(id) {
    if (!confirm('¿Seguro que quieres eliminar este recuerdo?')) return;
    try {
        const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al eliminar');
        await cargarRecuerdos();
        await cargarRecuerdosAdmin();
    } catch (error) {
        console.error('Error eliminando:', error);
        alert('Error al eliminar el recuerdo.');
    }
};

// ------------------------------------------------------------
// 6. REPRODUCTOR DE MÚSICA PERSONALIZADO (con shuffle y repeat)
// ------------------------------------------------------------
function initMusicPlayer() {
    // ---------- CONFIGURACIÓN: tus canciones ----------
    // Cambia las rutas y títulos por los tuyos.
    // Coloca tus archivos de música en una carpeta, por ejemplo /music/
    const playlist = [
        { title: 'A sangre fría - Parrita', src: './assets/music/a_sangre_fria.mp3' },
        { title: 'Barry Ryan - Eloise', src: './assets/music/Barry_Ryan_Eloise.mp3' },
        { title: 'Chayanne - Torero', src: './assets/music/Chayanne_Torero.mp3' },
        { title: 'David Civera - Que La Detengan', src: './assets/music/David_Civera_Que_La_Detengan.mp3' },
        { title: 'El Último De La Fila - La Piedra Redonda', src: './assets/music/El_ultimo_De_La_Fila_La_piedra_redonda.mp3' },
        { title: 'Julio Iglesias - Quiero', src: './assets/music/Julio_Iglesias_Quiero.mp3' },
        { title: 'Julio Iglesias - Quijote', src: './assets/music/Julio_Iglesias_Quijote.mp3' },
        { title: 'Me quedo contigo - Los Chunguitos', src: './assets/music/Me_quedo_contigo.mp3' },
        { title: 'Rosana - Aquel Corazon', src: './assets/music/Rosana_Aquel_Corazon.mp3' },
        { title: 'Selena Y Los Dinos - Como La Flor', src: './assets/music/Selena_Y_Los_Dinos_Como_La_Flor.mp3' },
        { title: 'Vuela Más Alto Que Tú - Parrita', src: './assets/music/Vuela_Más_Alto_Que_Tu.mp3' },
    ];

    // Si no hay canciones, no inicializar
    if (!playlist.length) return;

    // ---------- Elementos del DOM ----------
    const audio = new Audio();
    audio.preload = 'metadata';

    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const volumeToggle = document.getElementById('volumeToggle');
    const volumeSlider = document.getElementById('volumeSlider');
    const progressSlider = document.getElementById('progressSlider');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const currentSongTitle = document.getElementById('currentSongTitle');
    const playlistContainer = document.getElementById('playlistItems');

    let currentIndex = 0;
    let isPlaying = false;
    let isMuted = false;
    let autoplayAttempted = false;

    // ----- Nuevas variables para shuffle y repeat -----
    let shuffle = false;
    let repeatMode = 'none'; // 'none', 'one', 'all'

    // ---------- Funciones auxiliares ----------
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Obtener el siguiente índice según shuffle y repeat
    function getNextIndex(currentIdx) {
        if (playlist.length === 1) return 0; // si solo hay una canción

        if (repeatMode === 'one') {
            return currentIdx; // repetir la misma
        }

        if (shuffle) {
            // Elegir un índice aleatorio diferente al actual (si es posible)
            let newIdx;
            do {
                newIdx = Math.floor(Math.random() * playlist.length);
            } while (newIdx === currentIdx && playlist.length > 1);
            return newIdx;
        }

        // Modo secuencial normal
        if (repeatMode === 'all') {
            return (currentIdx + 1) % playlist.length;
        } else {
            // 'none': si es la última, devolvemos -1 para indicar que no hay siguiente
            return (currentIdx + 1 < playlist.length) ? currentIdx + 1 : -1;
        }
    }

    function loadSong(index) {
        if (index < 0 || index >= playlist.length) {
            // Si no hay canción válida, pausar
            audio.pause();
            isPlaying = false;
            playBtn.textContent = '▶';
            return;
        }
        currentIndex = index;
        const song = playlist[currentIndex];
        audio.src = song.src;
        audio.load();
        currentSongTitle.textContent = `🎵 ${song.title}`;
        // Actualizar lista activa
        document.querySelectorAll('#playlistItems li').forEach((li, i) => {
            li.classList.toggle('active', i === currentIndex);
        });
        // Reiniciar barra de progreso
        progressSlider.value = 0;
        currentTimeEl.textContent = '0:00';
        durationEl.textContent = '0:00';
        // Si estaba reproduciendo, seguir reproduciendo
        if (isPlaying) {
            audio.play().catch(() => { isPlaying = false; playBtn.textContent = '▶'; });
        }
    }

    function togglePlay() {
        if (audio.paused) {
            audio.play().then(() => {
                isPlaying = true;
                playBtn.textContent = '⏸';
            }).catch(() => {
                isPlaying = false;
                playBtn.textContent = '▶';
                alert('No se pudo reproducir el audio. Puede que el navegador requiera interacción manual.');
            });
        } else {
            audio.pause();
            isPlaying = false;
            playBtn.textContent = '▶';
        }
    }

    // Nueva función para manejar el final de la canción
    function handleSongEnd() {
        if (repeatMode === 'one') {
            // Repetir la misma canción
            audio.currentTime = 0;
            audio.play().catch(() => {});
            return;
        }

        const nextIdx = getNextIndex(currentIndex);
        if (nextIdx === -1) {
            // No hay siguiente canción (modo none y última)
            audio.pause();
            isPlaying = false;
            playBtn.textContent = '▶';
            return;
        }
        loadSong(nextIdx);
        if (isPlaying) {
            audio.play().catch(() => {});
        }
    }

    function nextSong() {
        if (playlist.length === 0) return;
        const nextIdx = getNextIndex(currentIndex);
        if (nextIdx === -1) {
            // Si no hay siguiente, no hacemos nada (o podemos reiniciar la lista)
            return;
        }
        loadSong(nextIdx);
        if (isPlaying) {
            audio.play().catch(() => {});
        }
    }

    function prevSong() {
        if (playlist.length === 0) return;
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }
        // Si estamos en la primera, ir a la última (modo secuencial, no shuffle)
        let prevIdx = currentIndex - 1;
        if (prevIdx < 0) prevIdx = playlist.length - 1;
        loadSong(prevIdx);
        if (isPlaying) {
            audio.play().catch(() => {});
        }
    }

    // ---------- Eventos del reproductor ----------
    playBtn.addEventListener('click', togglePlay);

    prevBtn.addEventListener('click', prevSong);

    nextBtn.addEventListener('click', nextSong);

    // Volumen
    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
        isMuted = audio.volume === 0;
        volumeToggle.textContent = isMuted ? '🔇' : '🔊';
    });

    volumeToggle.addEventListener('click', () => {
        if (isMuted) {
            audio.volume = volumeSlider.value || 0.8;
            volumeSlider.value = audio.volume;
            isMuted = false;
            volumeToggle.textContent = '🔊';
        } else {
            audio.volume = 0;
            volumeSlider.value = 0;
            isMuted = true;
            volumeToggle.textContent = '🔇';
        }
    });

    // Progreso
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressSlider.value = percent;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    progressSlider.addEventListener('input', () => {
        if (audio.duration) {
            const time = (progressSlider.value / 100) * audio.duration;
            audio.currentTime = time;
        }
    });

    // Cuando termina una canción, manejamos con nuestra función
    audio.addEventListener('ended', handleSongEnd);

    // ---------- Shuffle y Repeat ----------
    shuffleBtn.addEventListener('click', () => {
        shuffle = !shuffle;
        shuffleBtn.classList.toggle('active', shuffle);
        // Si activamos shuffle, podemos resetear el orden, pero no es necesario
    });

    repeatBtn.addEventListener('click', () => {
        // Ciclar: none -> one -> all -> none
        if (repeatMode === 'none') {
            repeatMode = 'one';
            repeatBtn.textContent = '🔂';
            repeatBtn.classList.add('active');
        } else if (repeatMode === 'one') {
            repeatMode = 'all';
            repeatBtn.textContent = '🔁';
            repeatBtn.classList.add('active');
        } else {
            repeatMode = 'none';
            repeatBtn.textContent = '🔁';
            repeatBtn.classList.remove('active');
        }
        // Actualizar tooltip o estilo
    });

    // ---------- Rellenar lista de reproducción ----------
    playlist.forEach((song, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><span class="index">${index + 1}</span> ${song.title}</span>
            ${index === currentIndex ? '<span class="now-playing">▶</span>' : ''}
        `;
        li.addEventListener('click', () => {
            loadSong(index);
            if (!isPlaying) {
                togglePlay(); // iniciar reproducción al seleccionar
            } else {
                audio.play().catch(() => {});
            }
        });
        playlistContainer.appendChild(li);
    });

    // Cargar primera canción
    loadSong(0);

    // ---------- Intento de reproducción automática ----------
    function attemptAutoplay() {
        if (autoplayAttempted) return;
        autoplayAttempted = true;
        audio.volume = 0.01;
        audio.play().then(() => {
            audio.volume = volumeSlider.value;
            isPlaying = true;
            playBtn.textContent = '⏸';
        }).catch(() => {
            currentSongTitle.textContent = '🎵 Haz clic en ▶ para escuchar';
            playBtn.textContent = '▶';
            isPlaying = false;
            audio.volume = volumeSlider.value;
        });
    }

    document.addEventListener('click', function autoplayHandler() {
        attemptAutoplay();
        document.removeEventListener('click', autoplayHandler);
    }, { once: true });

    window.addEventListener('load', () => {
        setTimeout(attemptAutoplay, 500);
    });

    console.log('🎵 Reproductor personalizado inicializado (con shuffle y repeat)');
}

// ------------------------------------------------------------
// 7. INICIALIZAR (se ejecuta solo si la contraseña es correcta)
// ------------------------------------------------------------
function iniciarApp() {
    cargarRecuerdos();
    obtenerAbrazos();
    initMusicPlayer();
    console.log('💖 Página cargada con cariño para tu mamá.');
}

// Si ya estaba autenticado al cargar la página, inicializamos
if (localStorage.getItem('auth_mama') === 'true') {
    iniciarApp();
}