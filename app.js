// Global function: load a YouTube video inline when play button is clicked
window.loadYTVideo = function(videoId) {
    const card = document.getElementById('yt-card-' + videoId);
    if (!card) return;
    const currentHeight = card.offsetHeight;
    card.style.height = currentHeight + 'px';
    card.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;border-radius:12px;">
        </iframe>`;
    card.style.height = '';
};

// ---- ARRANQUE EXTRAS: countdowns + second set of charts ----
const PLAZOS = [
    { id: 'ejecutivo',   dias: 30,  color: '#f59e0b', meta: 50   },
    { id: 'coordinador', dias: 90,  color: '#6366f1', meta: 500  },
    { id: 'director',    dias: 365, color: '#eab308', meta: 5000 },
];

let arranqueCharts = {};

function diasRestantes(fechaInicioStr, plazo) {
    if (!fechaInicioStr) return null;
    const inicio = new Date(fechaInicioStr);
    const meta   = new Date(inicio);
    meta.setDate(meta.getDate() + plazo);
    const hoy    = new Date();
    hoy.setHours(0,0,0,0);
    meta.setHours(0,0,0,0);
    return Math.round((meta - hoy) / 86400000);
}

function actualizarCountdowns(fechaStr) {
    PLAZOS.forEach(p => {
        const numEl   = document.getElementById('countdown-' + p.id);
        const fechaEl = document.getElementById('countdown-' + p.id + '-fecha');
        const numElB  = document.getElementById('bienvenida-countdown-' + p.id);
        const fechaElB = document.getElementById('bienvenida-countdown-' + p.id + '-fecha');

        if (numEl) numEl.className = 'countdown-number';
        if (numElB) numElB.className = 'countdown-number';
        
        if (!fechaStr) { 
            if(numEl) numEl.textContent = '—'; 
            if(fechaEl) fechaEl.textContent = ''; 
            if(numElB) numElB.textContent = '—';
            if(fechaElB) fechaElB.textContent = '';
            return; 
        }

        const inicio = new Date(fechaStr);
        const meta   = new Date(inicio);
        meta.setDate(meta.getDate() + p.dias);
        const restantes = diasRestantes(fechaStr, p.dias);

        const fechaFormato = meta.toLocaleDateString('es-ES', {day:'2-digit', month:'long', year:'numeric'});

        if (restantes > 0) {
            if(numEl) numEl.textContent = restantes;
            if(numElB) numElB.textContent = restantes;
            if(fechaEl) fechaEl.textContent = `Fecha límite: ${fechaFormato}`;
            if(fechaElB) fechaElB.textContent = `Fecha límite: ${fechaFormato}`;
        } else if (restantes === 0) {
            if(numEl) { numEl.textContent = '¡HOY!'; numEl.classList.add('conseguido'); }
            if(numElB){ numElB.textContent = '¡HOY!'; numElB.classList.add('conseguido'); }
            if(fechaEl) fechaEl.textContent = `Fecha límite: ${fechaFormato}`;
            if(fechaElB) fechaElB.textContent = `Fecha límite: ${fechaFormato}`;
        } else {
            if(numEl) { numEl.textContent = `${Math.abs(restantes)}d expirado`; numEl.classList.add('vencido'); }
            if(numElB) { numElB.textContent = `${Math.abs(restantes)}d expirado`; numElB.classList.add('vencido'); }
            if(fechaEl) fechaEl.textContent = `Fecha límite: ${fechaFormato}`;
            if(fechaElB) fechaElB.textContent = `Fecha límite: ${fechaFormato}`;
        }
    });
}

function inicializarArranqueCharts() {
    const contratosArr = JSON.parse(localStorage.getItem('contratos_puntos')) || [];
    const totalPts = contratosArr.reduce((s, c) => s + c.puntos, 0);

    PLAZOS.forEach(p => {
        const ctx = document.getElementById('chart2' + p.id.charAt(0).toUpperCase() + p.id.slice(1));
        if (!ctx) return;

        const completado = Math.min(totalPts, p.meta);
        const pendiente  = Math.max(0, p.meta - completado);
        const pct        = Math.min(100, Math.round((totalPts / p.meta) * 100));
        const conseguido = totalPts >= p.meta;

        if (!arranqueCharts[p.id]) {
            arranqueCharts[p.id] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [{ data: [completado, pendiente], backgroundColor: [p.color, '#e2e8f0'], borderWidth: 0 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '72%',
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    animation: { animateRotate: true, duration: 700 }
                }
            });
        } else {
            arranqueCharts[p.id].data.datasets[0].data = conseguido ? [p.meta, 0] : [completado, pendiente];
            arranqueCharts[p.id].data.datasets[0].backgroundColor = conseguido ? [p.color, p.color] : [p.color, '#e2e8f0'];
            arranqueCharts[p.id].update();
        }

        const pctEl   = document.getElementById('pct2-' + p.id);
        const ptsEl   = document.getElementById('pts2-' + p.id);
        const badgeEl = document.getElementById('badge2-' + p.id);
        if (pctEl)   pctEl.textContent   = pct + '%';
        if (ptsEl)   ptsEl.textContent   = Math.min(totalPts, p.meta).toLocaleString('es-ES');
        if (badgeEl) { if(conseguido) badgeEl.classList.remove('hidden'); else badgeEl.classList.add('hidden'); }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DEL DOM ---
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    const loginForm = document.getElementById('login-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const displayUsername = document.getElementById('display-username');
    const logoutBtn = document.getElementById('logout-btn');
    const mainChatbotWidget = document.getElementById('main-chatbot-widget');
    
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('section-title');
    const goNextBtns = document.querySelectorAll('.go-next');

    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotPanel = document.getElementById('chatbot-panel');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatInput = document.querySelector('.chatbot-footer input');
    const chatSendBtn = document.querySelector('.send-btn');
    const chatBody = document.querySelector('.chatbot-body');

    // --- LÓGICA DE LOGIN ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simulación de validación (acepta cualquier cosa para demo)
        if (username.length > 2 && password.length > 2) {
            // Animación de salida del login
            loginScreen.style.opacity = '0';
            loginScreen.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                appScreen.classList.remove('hidden');
                displayUsername.textContent = username;
            }, 500);
        } else {
            alert("Por favor, introduce usuario y contraseña válidos.");
        }
    });

    // --- LÓGICA DE LOGIN CON GOOGLE ---
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            // Simular proceso de OAuth con Google y verificación de autorización
            const simularCorreo = prompt("Simulador de Google: Introduce tu cuenta de correo de Google autorizada (ejemplo@gmail.com):", "distribuidor@gmail.com");
            
            if (simularCorreo && simularCorreo.includes('@')) {
                // Animación de salida del login
                loginScreen.style.opacity = '0';
                loginScreen.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    loginScreen.classList.add('hidden');
                    appScreen.classList.remove('hidden');
                    if (mainChatbotWidget) mainChatbotWidget.classList.remove('hidden');
                    displayUsername.textContent = simularCorreo.split('@')[0]; // Usa el nombre del correo
                }, 500);
            } else if (simularCorreo) {
                alert("La cuenta de Google introducida no está registrada en el sistema.");
            }
        });
    }

    // Logout
    logoutBtn.addEventListener('click', () => {
        appScreen.classList.add('hidden');
        if (mainChatbotWidget) mainChatbotWidget.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        loginScreen.style.opacity = '1';
        document.getElementById('password').value = '';
    });

    // --- LÓGICA DE NAVEGACIÓN ---
    function switchSection(targetId, title) {
        // Remover active de todos los nav items
        navItems.forEach(item => item.classList.remove('active'));
        
        // Agregar active al item seleccionado
        const targetNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (targetNav) targetNav.classList.add('active');

        // Ocultar todas las secciones
        contentSections.forEach(section => {
            section.classList.remove('active');
            // Removemos el hidden con un pequeño delay o display nativo manejado por CSS
            section.classList.add('hidden');
        });

        // Mostrar sección destino
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            // Pequeño timeout para reiniciar animación CSS
            setTimeout(() => {
                 targetSection.classList.add('active');
            }, 10);
        }

        // Actualizar título
        if (title) {
            sectionTitle.textContent = title;
        } else if (targetNav) {
            sectionTitle.textContent = targetNav.textContent.trim();
        }
    }
    
    // Exportamos a window para poder usarlo en onclicks dinámicos (ej: submenú Libros)
    window.switchSection = switchSection;

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            switchSection(targetId, item.textContent.trim());

            // Show/hide arranque extras
            const extras = document.getElementById('arranque-extras');
            if (extras) {
                if (targetId === 'plan-arranque') {
                    extras.classList.remove('hidden');
                    const fechaGuardada = localStorage.getItem('fecha_inicio_negocio') || '';
                    if (fechaGuardada) {
                        const fi = document.getElementById('fecha-inicio-negocio');
                        if (fi) fi.value = fechaGuardada;
                        actualizarCountdowns(fechaGuardada);
                    }
                    setTimeout(inicializarArranqueCharts, 100);
                } else {
                    extras.classList.add('hidden');
                }
            }
        });
    });

    // Fecha inicio negocio global
    const guardarFechaData = (value) => {
        if (!value) { alert('Por favor selecciona una fecha.'); return; }
        localStorage.setItem('fecha_inicio_negocio', value);
        const fi = document.getElementById('fecha-inicio-negocio');
        const fiB = document.getElementById('bienvenida-fecha-inicio-negocio');
        if (fi) fi.value = value;
        if (fiB) fiB.value = value;
        actualizarCountdowns(value);
        alert('Configuración guardada. Cuentas atrás actualizadas.');
    };

    const guardarFechaBtn = document.getElementById('guardar-fecha-inicio-btn');
    if (guardarFechaBtn) {
        guardarFechaBtn.addEventListener('click', () => {
            const fi = document.getElementById('fecha-inicio-negocio');
            guardarFechaData(fi ? fi.value : null);
        });
    }

    const guardarFechaBtnB = document.getElementById('bienvenida-guardar-fecha-inicio-btn');
    if (guardarFechaBtnB) {
        guardarFechaBtnB.addEventListener('click', () => {
            const fi = document.getElementById('bienvenida-fecha-inicio-negocio');
            guardarFechaData(fi ? fi.value : null);
        });
    }

    // Inicializar fechas globalmente
    const fechaGuardadaGlobal = localStorage.getItem('fecha_inicio_negocio') || '';
    if (fechaGuardadaGlobal) {
        const fi = document.getElementById('fecha-inicio-negocio');
        const fiB = document.getElementById('bienvenida-fecha-inicio-negocio');
        if (fi) fi.value = fechaGuardadaGlobal;
        if (fiB) fiB.value = fechaGuardadaGlobal;
        actualizarCountdowns(fechaGuardadaGlobal);
    }

    // Botones de siguiente sección dentro del contenido
    goNextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextId = btn.getAttribute('data-next');
            switchSection(nextId);
        });
    });

    // --- LÓGICA DEL CHATBOT ---
    function toggleChatbot() {
        chatbotPanel.classList.toggle('hidden');
    }

    chatbotToggle.addEventListener('click', toggleChatbot);
    chatbotClose.addEventListener('click', toggleChatbot);

    // Enviar mensaje en el chat
    function sendMessage() {
        const text = chatInput.value.trim();
        if (text === '') return;

        // Mensaje del Usuario
        const userMsg = document.createElement('div');
        userMsg.classList.add('chat-message', 'user-message');
        userMsg.textContent = text;
        chatBody.appendChild(userMsg);
        
        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        // Simular "Escribiendo..." del Bot (Para que luego lo conectes a la API real de GPT)
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.classList.add('chat-message', 'bot-message');
            botMsg.textContent = "Estoy procesando tu consulta con mi API de OpenAI. (Este es un mensaje automático de demostración).";
            chatBody.appendChild(botMsg);
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
    }

    chatSendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // --- LÓGICA DE SEGUIMIENTO DE OBJETIVOS ---
    const motivoForm = document.getElementById('motivo-form');
    const motivoInput = document.getElementById('motivo-input');
    const motivosListContainer = document.getElementById('motivos-list-container');
    const bienvenidaMotivosContainer = document.getElementById('bienvenida-motivos-container');
    const bienvenidaMotivosList = document.getElementById('bienvenida-motivos-list');
    
    const objetivoForm = document.getElementById('objetivo-form');
    const objetivosList = document.getElementById('objetivos-list');
    
    // Estado
    let motivosArray = [];
    try {
        const stored = localStorage.getItem('motivos_negocio');
        if (stored) {
            if (stored.startsWith('[')) {
                motivosArray = JSON.parse(stored);
            } else {
                // Migración de string viejo a array
                if (stored.trim() !== '') {
                    motivosArray = [{ id: Date.now(), texto: stored }];
                    localStorage.setItem('motivos_negocio', JSON.stringify(motivosArray));
                }
            }
        }
    } catch(e) {
        console.error("Error parseando motivos", e);
    }
    
    let objetivos = JSON.parse(localStorage.getItem('objetivos_distribuidor')) || [];
    let objetivosChartInstance = null;

    function renderMotivos() {
        if (!motivosListContainer) return;
        
        motivosListContainer.innerHTML = '';
        if (bienvenidaMotivosList) bienvenidaMotivosList.innerHTML = '';
        
        if (motivosArray.length === 0) {
            motivosListContainer.innerHTML = '<p class="text-muted" style="color: var(--text-secondary); font-style: italic;">Aún no has definido ningún motivo.</p>';
            if (bienvenidaMotivosContainer) bienvenidaMotivosContainer.classList.add('hidden');
            return;
        }

        if (bienvenidaMotivosContainer) bienvenidaMotivosContainer.classList.remove('hidden');

        motivosArray.forEach((motivo, index) => {
            // Render en Seguimiento de Objetivos
            const item = document.createElement('div');
            item.className = 'objetivo-item';
            item.innerHTML = `
                <div class="objetivo-header" style="margin-bottom: 0;">
                    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                        <span style="font-weight: 700; color: var(--primary-blue); font-size: 1.2rem;">${index + 1}.</span>
                        <input type="text" value="${motivo.texto}" class="motivo-edit-input" style="flex: 1; border: 1px solid transparent; background: transparent; font-size: 1rem; color: var(--text-dark); padding: 5px; outline: none; transition: 0.3s;" readonly>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn-icon btn-editar-motivo" style="color: var(--primary-blue); font-size: 1.2rem;" title="Editar"><i class='bx bx-edit'></i></button>
                        <button class="btn-icon" onclick="eliminarMotivo(${motivo.id})" style="color: #ef4444; font-size: 1.2rem;" title="Eliminar"><i class='bx bx-trash'></i></button>
                    </div>
                </div>
            `;
            
            const inputField = item.querySelector('.motivo-edit-input');
            const btnEditar = item.querySelector('.btn-editar-motivo');
            
            btnEditar.addEventListener('click', () => {
                if (inputField.readOnly) {
                    inputField.readOnly = false;
                    inputField.style.border = '1px solid var(--primary-blue-light)';
                    inputField.style.background = 'white';
                    inputField.style.borderRadius = '5px';
                    inputField.focus();
                    btnEditar.innerHTML = "<i class='bx bx-save'></i>";
                    btnEditar.title = "Guardar";
                } else {
                    motivo.texto = inputField.value.trim();
                    localStorage.setItem('motivos_negocio', JSON.stringify(motivosArray));
                    renderMotivos();
                }
            });

            motivosListContainer.appendChild(item);

            // Render en Bienvenida
            if (bienvenidaMotivosList) {
                const li = document.createElement('li');
                li.style.marginBottom = '10px';
                li.textContent = motivo.texto;
                bienvenidaMotivosList.appendChild(li);
            }
        });
    }

    window.eliminarMotivo = function(id) {
        if(confirm('¿Estás seguro de que deseas eliminar este motivo?')) {
            motivosArray = motivosArray.filter(m => m.id !== id);
            localStorage.setItem('motivos_negocio', JSON.stringify(motivosArray));
            renderMotivos();
        }
    };

    renderMotivos();

    if (motivoForm) {
        motivoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = motivoInput.value.trim();
            if (val) {
                motivosArray.push({ id: Date.now(), texto: val });
                localStorage.setItem('motivos_negocio', JSON.stringify(motivosArray));
                motivoInput.value = '';
                renderMotivos();
            }
        });
    }

    if (objetivoForm) {
        objetivoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nuevoObjetivo = {
                id: Date.now(),
                nombre: document.getElementById('obj-nombre').value,
                cantidadTotal: parseInt(document.getElementById('obj-cantidad').value),
                cantidadActual: 0,
                periodicidad: document.getElementById('obj-periodicidad').value,
                fechaFinal: document.getElementById('obj-fecha').value
            };

            objetivos.push(nuevoObjetivo);
            guardarYRenderizarObjetivos();
            objetivoForm.reset();
        });
    }

    function guardarYRenderizarObjetivos() {
        localStorage.setItem('objetivos_distribuidor', JSON.stringify(objetivos));
        renderObjetivos();
        actualizarGrafico();
    }

    function actualizarProgreso(id, incremento) {
        const index = objetivos.findIndex(obj => obj.id === id);
        if (index !== -1) {
            let nuevaCantidad = objetivos[index].cantidadActual + incremento;
            if (nuevaCantidad < 0) nuevaCantidad = 0;
            if(nuevaCantidad > objetivos[index].cantidadTotal) nuevaCantidad = objetivos[index].cantidadTotal;
            
            objetivos[index].cantidadActual = nuevaCantidad;
            guardarYRenderizarObjetivos();
        }
    }

    // Exponer globalmente para los botones generados
    window.actualizarProgreso = actualizarProgreso;
    window.eliminarObjetivo = function(id) {
        if(confirm('¿Estás seguro de que deseas eliminar este objetivo?')) {
            objetivos = objetivos.filter(obj => obj.id !== id);
            guardarYRenderizarObjetivos();
        }
    };

    function renderObjetivos() {
        if (!objetivosList) return;

        if (objetivos.length === 0) {
            objetivosList.innerHTML = '<p class="text-muted" style="color: var(--text-secondary);">Aún no hay objetivos definidos.</p>';
            return;
        }

        objetivosList.innerHTML = '';
        
        objetivos.forEach(obj => {
            const porcentaje = Math.min(100, Math.round((obj.cantidadActual / obj.cantidadTotal) * 100)) || 0;
            
            const item = document.createElement('div');
            item.className = 'objetivo-item';
            
            item.innerHTML = `
                <div class="objetivo-header">
                    <h4>${obj.nombre}</h4>
                    <button class="btn-icon" onclick="eliminarObjetivo(${obj.id})" style="font-size:1.2rem; color:#ef4444;" title="Eliminar"><i class='bx bx-trash'></i></button>
                </div>
                <div class="objetivo-meta">
                    <span><i class='bx bx-time'></i> ${obj.periodicidad}</span>
                    <span><i class='bx bx-calendar'></i> Fecha final: ${obj.fechaFinal}</span>
                </div>
                <div class="objetivo-progress-container">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${porcentaje}%;"></div>
                    </div>
                    <div class="progress-numbers">${obj.cantidadActual} / ${obj.cantidadTotal}</div>
                    <div class="progress-controls">
                        <button class="btn-small" onclick="actualizarProgreso(${obj.id}, -1)"><i class='bx bx-minus'></i></button>
                        <button class="btn-small" onclick="actualizarProgreso(${obj.id}, 1)"><i class='bx bx-plus'></i></button>
                    </div>
                </div>
            `;
            
            objetivosList.appendChild(item);
        });
    }

    function actualizarGrafico() {
        const ctx = document.getElementById('objetivosChart');
        if (!ctx) return;

        let totalObjetivos = 0;
        let totalCompletado = 0;

        objetivos.forEach(obj => {
            totalObjetivos += obj.cantidadTotal;
            totalCompletado += obj.cantidadActual;
        });

        let totalPendiente = totalObjetivos - totalCompletado;
        if (totalPendiente < 0) totalPendiente = 0;

        const datos = totalObjetivos === 0 ? [0, 1] : [totalCompletado, totalPendiente];
        const bgColors = totalObjetivos === 0 ? ['#e2e8f0', '#e2e8f0'] : ['#3b82f6', '#94a3b8'];

        if (objetivosChartInstance) {
            objetivosChartInstance.data.datasets[0].data = datos;
            objetivosChartInstance.data.datasets[0].backgroundColor = bgColors;
            objetivosChartInstance.update();
        } else {
            if (typeof Chart !== 'undefined') {
                objetivosChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Completado', 'Pendiente'],
                        datasets: [{
                            data: datos,
                            backgroundColor: bgColors,
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    font: { family: "'Outfit', sans-serif" }
                                }
                            }
                        },
                        cutout: '70%'
                    }
                });
            }
        }
    }

    setTimeout(() => {
        if(objetivosList && objetivos.length >= 0) {
            renderObjetivos();
            actualizarGrafico();
        }
        inicializarPosicionCharts();
        renderContratosHistorico();
    }, 500);

    // --- LÓGICA DE PUNTOS DE POSICIÓN ---
    const POSICIONES = [
        { id: 'ejecutivo',    meta: 50,   color: '#f59e0b', colorFondo: '#fef3c7', label: 'Ejecutivo' },
        { id: 'coordinador',  meta: 500,  color: '#6366f1', colorFondo: '#ede9fe', label: 'Coordinador' },
        { id: 'director',     meta: 5000, color: '#eab308', colorFondo: '#fefce8', label: 'Director' },
    ];

    let contratos = JSON.parse(localStorage.getItem('contratos_puntos')) || [];
    let posicionCharts = {};
    let bienvenidaPosicionCharts = {}; // NUEVO

    function totalPuntos() {
        return contratos.reduce((sum, c) => sum + c.puntos, 0);
    }

    function inicializarPosicionCharts() {
        POSICIONES.forEach(pos => {
            const config = {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [0, pos.meta],
                        backgroundColor: [pos.color, '#e2e8f0'],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '72%',
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    animation: { animateRotate: true, duration: 700 }
                }
            };
            
            const ctx = document.getElementById('chart' + capitalizar(pos.id));
            if (ctx && !posicionCharts[pos.id]) {
                posicionCharts[pos.id] = window.Chart ? new Chart(ctx, JSON.parse(JSON.stringify(config))) : null;
            }

            const ctxB = document.getElementById('bienvenida-chart' + capitalizar(pos.id));
            if (ctxB && !bienvenidaPosicionCharts[pos.id]) {
                bienvenidaPosicionCharts[pos.id] = window.Chart ? new Chart(ctxB, JSON.parse(JSON.stringify(config))) : null;
            }
        });
        actualizarPosicionCharts();
    }

    function capitalizar(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function actualizarPosicionCharts() {
        const total = totalPuntos();
        const displayEl = document.getElementById('puntos-total-display');
        const bienvenidaDisplayEl = document.getElementById('bienvenida-puntos-total-display');
        
        if (displayEl) displayEl.textContent = total.toLocaleString('es-ES');
        if (bienvenidaDisplayEl) bienvenidaDisplayEl.textContent = total.toLocaleString('es-ES');

        const containerB = document.getElementById('bienvenida-posicion-container');
        if (containerB) {
            containerB.classList.remove('hidden');
        }

        POSICIONES.forEach(pos => {
            const completado = Math.min(total, pos.meta);
            const pendiente = Math.max(0, pos.meta - completado);
            const pct = Math.min(100, Math.round((total / pos.meta) * 100));
            const conseguido = total >= pos.meta;

            const updateChartUI = (chartMap, prefix) => {
                const chart = chartMap[pos.id];
                if (chart) {
                    chart.data.datasets[0].data = conseguido ? [pos.meta, 0] : [completado, pendiente];
                    chart.data.datasets[0].backgroundColor = conseguido
                        ? [pos.color, pos.color]
                        : [pos.color, '#e2e8f0'];
                    chart.update();
                }

                const pctEl = document.getElementById(prefix + 'pct-' + pos.id);
                const ptsEl = document.getElementById(prefix + 'pts-' + pos.id);
                const badgeEl = document.getElementById(prefix + 'badge-' + pos.id);

                if (pctEl) pctEl.textContent = pct + '%';
                if (ptsEl) ptsEl.textContent = Math.min(total, pos.meta).toLocaleString('es-ES');
                if (badgeEl) {
                    if (conseguido) badgeEl.classList.remove('hidden');
                    else badgeEl.classList.add('hidden');
                }
            };

            updateChartUI(posicionCharts, '');
            updateChartUI(bienvenidaPosicionCharts, 'bienvenida-');
        });
    }

    function renderContratosHistorico() {
        const hist = document.getElementById('contratos-historico');
        if (!hist) return;
        if (contratos.length === 0) {
            hist.innerHTML = '<p style="color:var(--text-secondary); font-size:0.9rem;">Aún no hay contratos registrados.</p>';
            return;
        }
        hist.innerHTML = [...contratos].reverse().map(c => `
            <div class="contrato-item">
                <span>${c.desc}</span>
                <span class="contrato-pts-badge">+${c.puntos} pts</span>
            </div>
        `).join('');
    }

    const contratoForm = document.getElementById('contrato-form');
    const resetPuntosBtn = document.getElementById('reset-puntos-btn');

    if (contratoForm) {
        contratoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const desc = document.getElementById('contrato-desc').value.trim();
            const puntos = parseInt(document.getElementById('contrato-puntos').value);
            if (!desc || !puntos || puntos < 1) return;
            contratos.push({ desc, puntos, fecha: new Date().toLocaleDateString('es-ES') });
            localStorage.setItem('contratos_puntos', JSON.stringify(contratos));
            contratoForm.reset();
            actualizarPosicionCharts();
            renderContratosHistorico();
        });
    }

    if (resetPuntosBtn) {
        resetPuntosBtn.addEventListener('click', () => {
            if (confirm('¿Seguro que quieres reiniciar todos los puntos y contratos?')) {
                contratos = [];
                localStorage.removeItem('contratos_puntos');
                actualizarPosicionCharts();
                renderContratosHistorico();
            }
        });
    }

    // ================================================================
    // CALCULADORA COMPARADORA DE ELECTRICIDAD
    // ================================================================

    // ── Rate database for the 6 offer companies ──────────────────────
    const COMPANY_RATES = {
        endesa: {
            label: 'Endesa',
            tarifas: {
                'plana': {
                    label: 'Mío Luz Plana (tarifa plana)',
                    p1Pot: 0.110200, p2Pot: 0.043700,
                    p1Cons: 0.189500, p2Cons: 0.189500, p3Cons: 0.189500,
                    discPot: 0, discCons: 0
                },
                'control': {
                    label: 'Mío Luz Control (3 periodos)',
                    p1Pot: 0.109600, p2Pot: 0.043500,
                    p1Cons: 0.165000, p2Cons: 0.135000, p3Cons: 0.098000,
                    discPot: 0, discCons: 0
                },
                'noche': {
                    label: 'Mío Luz Noche (descuento Valle)',
                    p1Pot: 0.108900, p2Pot: 0.043200,
                    p1Cons: 0.192000, p2Cons: 0.155000, p3Cons: 0.065000,
                    discPot: 0, discCons: 0
                }
            }
        },
        alumbra: {
            label: 'Alumbra',
            tarifas: {
                'estandar': {
                    label: 'Tarifa Estándar (plana)',
                    p1Pot: 0.108500, p2Pot: 0.043000,
                    p1Cons: 0.184000, p2Cons: 0.184000, p3Cons: 0.184000,
                    discPot: 0, discCons: 0
                },
                'plus': {
                    label: 'Tarifa Plus (3 periodos)',
                    p1Pot: 0.107800, p2Pot: 0.042800,
                    p1Cons: 0.168000, p2Cons: 0.142000, p3Cons: 0.095000,
                    discPot: 0, discCons: 0
                }
            }
        },
        logos: {
            label: 'Logos Energía',
            tarifas: {
                'basica': {
                    label: 'Tarifa Básica (plana)',
                    p1Pot: 0.107100, p2Pot: 0.042500,
                    p1Cons: 0.182500, p2Cons: 0.182500, p3Cons: 0.182500,
                    discPot: 0, discCons: 0
                },
                'pro': {
                    label: 'Tarifa Pro (3 periodos)',
                    p1Pot: 0.106300, p2Pot: 0.042200,
                    p1Cons: 0.176000, p2Cons: 0.149000, p3Cons: 0.102000,
                    discPot: 0, discCons: 0
                }
            }
        },
        'gana-energia': {
            label: 'Gana Energía',
            tarifas: {
                'gana': {
                    label: 'Tarifa Gana (plana)',
                    p1Pot: 0.105500, p2Pot: 0.041800,
                    p1Cons: 0.181500, p2Cons: 0.181500, p3Cons: 0.181500,
                    discPot: 0, discCons: 0
                },
                'gana-plus': {
                    label: 'Gana Plus (3 periodos)',
                    p1Pot: 0.104800, p2Pot: 0.041500,
                    p1Cons: 0.174000, p2Cons: 0.146000, p3Cons: 0.099500,
                    discPot: 0, discCons: 0
                },
                'gana-noche': {
                    label: 'Gana Noche (Valle reducido)',
                    p1Pot: 0.104200, p2Pot: 0.041200,
                    p1Cons: 0.186000, p2Cons: 0.152000, p3Cons: 0.062000,
                    discPot: 0, discCons: 0
                }
            }
        },
        plenitude: {
            label: 'Plenitude',
            tarifas: {
                'eco': {
                    label: 'Plenitude Eco (plana)',
                    p1Pot: 0.112000, p2Pot: 0.044500,
                    p1Cons: 0.187000, p2Cons: 0.187000, p3Cons: 0.187000,
                    discPot: 0, discCons: 0
                },
                'smart': {
                    label: 'Plenitude Smart (3 periodos)',
                    p1Pot: 0.111200, p2Pot: 0.044100,
                    p1Cons: 0.181000, p2Cons: 0.155000, p3Cons: 0.105000,
                    discPot: 0, discCons: 0
                }
            }
        },
        nordy: {
            label: 'Nordy',
            tarifas: {
                'base': {
                    label: 'Tarifa Base (plana)',
                    p1Pot: 0.104500, p2Pot: 0.041400,
                    p1Cons: 0.180000, p2Cons: 0.180000, p3Cons: 0.180000,
                    discPot: 0, discCons: 0
                },
                'flex': {
                    label: 'Tarifa Flex (3 periodos)',
                    p1Pot: 0.103800, p2Pot: 0.041100,
                    p1Cons: 0.172000, p2Cons: 0.143000, p3Cons: 0.098000,
                    discPot: 0, discCons: 0
                }
            }
        }
    };

    // Current selected offer data (defaults to nothing — will fallback to a neutral calculation)
    let selectedOfferData = null;
    let selectedOfferLabel = 'Empresa Oferta';

    // ── Offer company selector logic ──────────────────────────────────
    const offerCompanySelect = document.getElementById('offer-company-select');
    const offerTarifaSelect  = document.getElementById('offer-tarifa-select');
    const offerTarifaWrapper = document.getElementById('offer-tarifa-wrapper');
    const offerRatesPreview  = document.getElementById('offer-rates-preview');

    function renderOfferRates(rates) {
        if (!rates) return;
        document.getElementById('off-p1-pot').textContent  = rates.p1Pot.toFixed(6)  + ' €/kW día';
        document.getElementById('off-p2-pot').textContent  = rates.p2Pot.toFixed(6)  + ' €/kW día';
        document.getElementById('off-p1-cons').textContent = rates.p1Cons.toFixed(6) + ' €/kWh';
        document.getElementById('off-p2-cons').textContent = rates.p2Cons.toFixed(6) + ' €/kWh';
        document.getElementById('off-p3-cons').textContent = rates.p3Cons.toFixed(6) + ' €/kWh';
    }

    if (offerCompanySelect) {
        offerCompanySelect.addEventListener('change', () => {
            const key = offerCompanySelect.value;
            selectedOfferData  = null;
            selectedOfferLabel = 'Empresa Oferta';

            // Reset tariff dropdown
            offerTarifaSelect.innerHTML = '<option value="">-- Selecciona tarifa --</option>';
            if (offerRatesPreview) offerRatesPreview.classList.add('hidden');

            if (!key || !COMPANY_RATES[key]) {
                if (offerTarifaWrapper) offerTarifaWrapper.classList.add('hidden');
                return;
            }

            const company = COMPANY_RATES[key];
            selectedOfferLabel = company.label;

            // Populate tariff options
            Object.entries(company.tarifas).forEach(([tKey, t]) => {
                const opt = document.createElement('option');
                opt.value       = tKey;
                opt.textContent = t.label;
                offerTarifaSelect.appendChild(opt);
            });

            if (offerTarifaWrapper) offerTarifaWrapper.classList.remove('hidden');
        });
    }

    if (offerTarifaSelect) {
        offerTarifaSelect.addEventListener('change', () => {
            const compKey  = offerCompanySelect ? offerCompanySelect.value : '';
            const tarifKey = offerTarifaSelect.value;

            if (!compKey || !tarifKey || !COMPANY_RATES[compKey]) {
                selectedOfferData = null;
                if (offerRatesPreview) offerRatesPreview.classList.add('hidden');
                return;
            }

            const rates = COMPANY_RATES[compKey].tarifas[tarifKey];
            selectedOfferData  = rates;
            selectedOfferLabel = COMPANY_RATES[compKey].label + ' — ' + rates.label;

            renderOfferRates(rates);
            if (offerRatesPreview) offerRatesPreview.classList.remove('hidden');
        });
    }

    // --- Sync días P2 display when días input changes ---
    const calcDiasInput    = document.getElementById('calc-dias');
    const calcDiasP2Display = document.getElementById('calc-dias-p2-display');
    if (calcDiasInput && calcDiasP2Display) {
        calcDiasInput.addEventListener('input', () => {
            calcDiasP2Display.textContent = calcDiasInput.value ? calcDiasInput.value + ' d' : '—';
        });
    }

    // Sync compañía field (yellow → red input)
    const companiaCli = document.getElementById('calc-compania-cliente');
    const companyName = document.getElementById('calc-company-name');
    if (companiaCli && companyName) {
        companiaCli.addEventListener('input', () => { companyName.value = companiaCli.value; });
        companyName.addEventListener('input', () => { companiaCli.value = companyName.value; });
    }

    // --- Helpers ---
    function fmtEur(n)  { return n.toFixed(2) + ' €'; }
    function fmtRate(n, dec) { return n.toFixed(dec || 6); }
    function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
    function getVal(id, fallback) { const el = document.getElementById(id); return el ? el.value.trim() : (fallback || ''); }

    // ── Main calculation function ──────────────────────────────────────
    function calcularComparativa() {
        const BONO_SOCIAL = 0.54;
        const ALQUILER    = 1.25;
        const IMP_ELEC    = 0.0511;
        const IVA         = 0.21;

        // Client data
        const titular   = getVal('calc-titular');
        const direccion = getVal('calc-direccion');
        const cups      = getVal('calc-cups');
        const company   = getVal('calc-compania-cliente') || getVal('calc-company-name') || 'Cía. Actual';
        if (companyName && company) companyName.value = company;

        // Consumption inputs
        const p1kw  = parseFloat(document.getElementById('calc-p1-kw').value)  || 0;
        const p2kw  = parseFloat(document.getElementById('calc-p2-kw').value)  || 0;
        const dias  = parseInt(document.getElementById('calc-dias').value)      || 0;
        const p1kwh = parseFloat(document.getElementById('calc-p1-kwh').value)  || 0;
        const p2kwh = parseFloat(document.getElementById('calc-p2-kwh').value)  || 0;
        const p3kwh = parseFloat(document.getElementById('calc-p3-kwh').value)  || 0;
        const reactiva  = parseFloat(document.getElementById('calc-gastos-reactiva').value) || 0;

        // Current company rates (manual red inputs)
        const p1PotRate  = parseFloat(document.getElementById('calc-p1-pot-rate').value)  || 0;
        const p2PotRate  = parseFloat(document.getElementById('calc-p2-pot-rate').value)  || 0;
        const p1ConsRate = parseFloat(document.getElementById('calc-p1-cons-rate').value) || 0;
        const p2ConsRate = parseFloat(document.getElementById('calc-p2-cons-rate').value) || 0;
        const p3ConsRate = parseFloat(document.getElementById('calc-p3-cons-rate').value) || 0;
        const discPot    = parseFloat(document.getElementById('calc-disc-pot').value)     || 0;
        const discCons   = parseFloat(document.getElementById('calc-disc-cons').value)    || 0;

        if (dias === 0 || (p1kw === 0 && p2kw === 0)) {
            alert('Introduce al menos los kW contratados y los días de facturación.');
            return;
        }
        if (!selectedOfferData) {
            alert('Selecciona la comercializadora de oferta y su tarifa para poder calcular la comparativa.');
            return;
        }

        const discPotF  = 1 - discPot  / 100;
        const discConsF = 1 - discCons / 100;

        // ---- COMPAÑÍA ACTUAL ----
        const p1PotImpA  = p1kw  * dias * p1PotRate  * discPotF;
        const p2PotImpA  = p2kw  * dias * p2PotRate  * discPotF;
        const totalPotA  = p1PotImpA + p2PotImpA;
        const p1ConsImpA = p1kwh * p1ConsRate * discConsF;
        const p2ConsImpA = p2kwh * p2ConsRate * discConsF;
        const p3ConsImpA = p3kwh * p3ConsRate * discConsF;
        const totalConsA = p1ConsImpA + p2ConsImpA + p3ConsImpA;
        const subtotalA  = totalPotA + totalConsA + reactiva + BONO_SOCIAL;
        const impuestoA  = subtotalA * IMP_ELEC;
        const baseIvaA   = subtotalA + impuestoA + ALQUILER;
        const ivaA       = baseIvaA * IVA;
        const totalA     = baseIvaA + ivaA;

        // ---- EMPRESA OFERTA (dinámica) ----
        const OFR = selectedOfferData;
        const offerDiscPotF  = 1 - (OFR.discPot  || 0) / 100;
        const offerDiscConsF = 1 - (OFR.discCons || 0) / 100;
        const p1PotImpE  = p1kw  * dias * OFR.p1Pot  * offerDiscPotF;
        const p2PotImpE  = p2kw  * dias * OFR.p2Pot  * offerDiscPotF;
        const totalPotE  = p1PotImpE + p2PotImpE;
        const p1ConsImpE = p1kwh * OFR.p1Cons * offerDiscConsF;
        const p2ConsImpE = p2kwh * OFR.p2Cons * offerDiscConsF;
        const p3ConsImpE = p3kwh * OFR.p3Cons * offerDiscConsF;
        const totalConsE = p1ConsImpE + p2ConsImpE + p3ConsImpE;
        const subtotalE  = totalPotE + totalConsE + reactiva + BONO_SOCIAL;
        const impuestoE  = subtotalE * IMP_ELEC;
        const baseIvaE   = subtotalE + impuestoE + ALQUILER;
        const ivaE       = baseIvaE * IVA;
        const totalE     = baseIvaE + ivaE;

        // ---- AHORRO ----
        const ahorroPeriodo = totalA - totalE;
        const ahorroAnual   = dias > 0 ? (ahorroPeriodo / dias) * 365 : 0;
        const ahorroPct     = totalA > 0 ? (ahorroPeriodo / totalA) * 100 : 0;

        // ---- STORE FOR PDF ----
        window.calcData = {
            titular, direccion, cups, company, dias, reactiva,
            p1kw, p2kw, p1kwh, p2kwh, p3kwh,
            p1PotRate, p2PotRate, p1ConsRate, p2ConsRate, p3ConsRate,
            discPot, discCons,
            p1PotImpA, p2PotImpA, totalPotA,
            p1ConsImpA, p2ConsImpA, p3ConsImpA, totalConsA,
            subtotalA, impuestoA, baseIvaA, ivaA, totalA,
            // Offer company
            offerLabel: selectedOfferLabel,
            OFR,
            p1PotImpE, p2PotImpE, totalPotE,
            p1ConsImpE, p2ConsImpE, p3ConsImpE, totalConsE,
            subtotalE, impuestoE, baseIvaE, ivaE, totalE,
            ahorroPeriodo, ahorroAnual, ahorroPct,
            BONO_SOCIAL, ALQUILER
        };

        // ---- UPDATE COMPARISON TABLE ----
        const offerShortLabel = (offerCompanySelect && offerCompanySelect.value)
            ? (COMPANY_RATES[offerCompanySelect.value]?.label || selectedOfferLabel)
            : selectedOfferLabel;
        setText('comp-company-title', company.toUpperCase());

        // Update "EKYNER" header in comp table to offer company name
        const ekynerTitle = document.querySelector('.ekyner-title');
        if (ekynerTitle) ekynerTitle.textContent = offerShortLabel.split(' —')[0].toUpperCase();

        // Potencia
        setText('r-p1-pot-rate-a', fmtRate(p1PotRate));
        setText('r-p1-pot-imp-a',  fmtEur(p1PotImpA));
        setText('r-p1-pot-imp-e',  fmtEur(p1PotImpE));
        setText('r-p2-pot-rate-a', fmtRate(p2PotRate));
        setText('r-p2-pot-imp-a',  fmtEur(p2PotImpA));
        setText('r-p2-pot-imp-e',  fmtEur(p2PotImpE));
        setText('r-disc-pot-a',    discPot > 0 ? discPot + '%' : '—');
        setText('r-total-pot-a',   fmtEur(totalPotA));
        setText('r-total-pot-e',   fmtEur(totalPotE));

        // Update static rates in comp table headers
        document.querySelectorAll('.comp-rate.ekyner-val').forEach((el, i) => {
            const vals = [OFR.p1Pot.toFixed(6), OFR.p2Pot.toFixed(6), '—',
                          OFR.p1Cons.toFixed(6), OFR.p2Cons.toFixed(6), OFR.p3Cons.toFixed(6), '—'];
            if (vals[i] !== undefined) el.textContent = vals[i];
        });

        // Consumo
        setText('r-p1-cons-rate-a', fmtRate(p1ConsRate));
        setText('r-p1-cons-imp-a',  fmtEur(p1ConsImpA));
        setText('r-p1-cons-imp-e',  fmtEur(p1ConsImpE));
        setText('r-p2-cons-rate-a', fmtRate(p2ConsRate));
        setText('r-p2-cons-imp-a',  fmtEur(p2ConsImpA));
        setText('r-p2-cons-imp-e',  fmtEur(p2ConsImpE));
        setText('r-p3-cons-rate-a', fmtRate(p3ConsRate));
        setText('r-p3-cons-imp-a',  fmtEur(p3ConsImpA));
        setText('r-p3-cons-imp-e',  fmtEur(p3ConsImpE));
        setText('r-disc-cons-a',    discCons > 0 ? discCons + '%' : '—');
        setText('r-total-cons-a',   fmtEur(totalConsA));
        setText('r-total-cons-e',   fmtEur(totalConsE));

        // Otros cargos
        setText('r-reactiva-a',   fmtEur(reactiva));
        setText('r-reactiva-e',   fmtEur(reactiva));
        setText('r-subtotal-a',   fmtEur(subtotalA));
        setText('r-subtotal-e',   fmtEur(subtotalE));
        setText('r-impuesto-a',   fmtEur(impuestoA));
        setText('r-impuesto-e',   fmtEur(impuestoE));
        setText('r-base-iva-a',   fmtEur(baseIvaA));
        setText('r-base-iva-e',   fmtEur(baseIvaE));
        setText('r-iva-a',        fmtEur(ivaA));
        setText('r-iva-e',        fmtEur(ivaE));
        setText('r-total-a',      fmtEur(totalA));
        setText('r-total-e',      fmtEur(totalE));

        // Savings cards
        setText('save-company',   company);
        setText('save-total-act', fmtEur(totalA));
        setText('save-total-eky', fmtEur(totalE));
        setText('save-dias',      dias);
        setText('save-period',    fmtEur(ahorroPeriodo));
        setText('save-annual',    fmtEur(ahorroAnual));
        setText('save-percent',   Math.round(ahorroPct) + '%');

        // Update savings card label "Con Ekyner" → offer company
        const ekynerLabel = document.querySelector('.ekyner-company-card .saving-label strong');
        if (ekynerLabel) ekynerLabel.textContent = offerShortLabel.split(' —')[0];

        // Show results & enable PDF button
        const resultsEl = document.getElementById('calc-results');
        if (resultsEl) {
            resultsEl.classList.remove('hidden');
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        const btnPdf = document.getElementById('btn-descargar-pdf');
        if (btnPdf) btnPdf.disabled = false;
    }

    // Calculate button
    const calcBtn = document.getElementById('calc-calcular-btn');
    if (calcBtn) calcBtn.addEventListener('click', calcularComparativa);



    // ================================================================
    // GENERAR PDF — SIMULADOR FACTURA Eléctrica
    // ================================================================
    function generatePDF() {
        if (!window.calcData) {
            alert('Primero debes calcular la comparativa para generar el PDF.');
            return;
        }
        const d = window.calcData;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        const W   = 210;
        const M   = 14;
        const CW  = W - M * 2; // 182mm content width
        let   y   = 14;

        const BLUE       = [0, 51, 153];
        const BLUE_LIGHT = [0, 102, 204];
        const HDR_BG     = [173, 216, 230];
        const ORANGE     = [204, 85, 0];
        const GREEN      = [0, 128, 0];

        // ── helper: draw a filled+bordered rect with centred text ──
        function hdrCell(txt, x, cy, w, h, bg, textColor) {
            doc.setFillColor(...bg);
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(0.2);
            doc.rect(x, cy, w, h, 'FD');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(...textColor);
            doc.text(txt, x + w / 2, cy + h / 2 + 2.2, { align: 'center' });
        }

        function dataCell(txt, x, cy, w, h, align, bold, color) {
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(150, 150, 150);
            doc.setLineWidth(0.15);
            doc.rect(x, cy, w, h, 'D');
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...(color || [0, 0, 0]));
            const px = align === 'right' ? x + w - 2 : x + 2;
            doc.text(String(txt), px, cy + h / 2 + 2.2, { align: align || 'left' });
        }

        function sectionTitle(num, text, cy, company) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...BLUE);
            const base = `${num}. ${text}`;
            doc.text(base, M, cy);
            if (company) {
                const bw = doc.getTextWidth(base + ' ');
                doc.setTextColor(...ORANGE);
                doc.text(company.toUpperCase(), M + bw, cy);
            }
        }

        // ╔══════════════════════════════════════════════════╗
        // ║  CABECERA                                        ║
        // ╚══════════════════════════════════════════════════╝
        const today = new Date().toLocaleDateString('es-ES');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(today, M, y);

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BLUE);
        doc.text('SIMULADOR', W / 2, y,      { align: 'center' });
        doc.text('FACTURA',   W / 2, y + 5,  { align: 'center' });
        doc.text('ELÉCTRICA 2.0', W / 2, y + 10, { align: 'center' });

        y += 18;

        // Blue separator
        doc.setDrawColor(...BLUE);
        doc.setLineWidth(0.6);
        doc.line(M, y, W - M, y);
        y += 4;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...BLUE);
        doc.text('Datos Confidenciales', W - M, y, { align: 'right' });

        y += 9;

        // ╔══════════════════════════════════════════════════╗
        // ║  1. DATOS DEL PUNTO DE SUMINISTRO Y CLIENTE     ║
        // ╚══════════════════════════════════════════════════╝
        sectionTitle('1', 'DATOS DEL PUNTO DE SUMINISTRO Y CLIENTE', y);
        y += 7;

        const clienteRows = [
            ['Nombre/Razón Social', d.titular || '—'],
            ['CUPS',               d.cups     || '—'],
            ['DIRECCIÓN',          d.direccion|| '—'],
        ];
        clienteRows.forEach(([lbl, val]) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text(lbl, M, y);
            doc.setFont('helvetica', 'normal');
            doc.text(String(val), M + 36, y);
            y += 5.5;
        });

        y += 4;

        // ═══════════════════════════════════════════════════════════════
        // Helper: draw a potencia+consumo+totals section (actual or ekyner)
        // ═══════════════════════════════════════════════════════════════
        function drawBillingSection(isEkyner, startY) {
            let sy = startY;
            const RH = 6.2; // row height

            // Section title
            sectionTitle(isEkyner ? '3' : '2',
                         isEkyner ? 'SIMULACIÓN CON' : 'FACTURA ACTUAL CON',
                         sy,
                         isEkyner ? (d.offerLabel ? d.offerLabel.split(' —')[0] : 'EMPRESA OFERTA') : d.company);

            if (!isEkyner) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(0, 0, 0);
                doc.text(`Nº DIAS  ${d.dias}`, W - M, sy, { align: 'right' });
            }
            sy += 7;

            // Column widths: [concept 43] [kw/kwh 28] [tarifa-lbl 40] [tarifa-val 26] [importe 25]  total ≈ 162
            const cw = [43, 28, 40, 26, 25];
            const cx = [M, M+43, M+71, M+111, M+137];

            // ─ POTENCIA header ─
            hdrCell('POTENCIA CONTRATADA',  cx[0], sy, cw[0]+cw[1], RH, HDR_BG, BLUE);
            hdrCell('TARIFA',               cx[2], sy, cw[2]+cw[3], RH, HDR_BG, BLUE);
            hdrCell('IMPORTE (€)',          cx[4], sy, cw[4],        RH, HDR_BG, BLUE);
            sy += RH;

            // P1 potencia
            const p1kw_d   = isEkyner ? d.p1kw : d.p1kw;
            const p2kw_d   = isEkyner ? d.p2kw : d.p2kw;
            const p1PotRte = isEkyner ? (d.OFR ? d.OFR.p1Pot : 0) : d.p1PotRate;
            const p2PotRte = isEkyner ? (d.OFR ? d.OFR.p2Pot : 0) : d.p2PotRate;
            const p1PotImp = isEkyner ? d.p1PotImpE : d.p1PotImpA;
            const p2PotImp = isEkyner ? d.p2PotImpE : d.p2PotImpA;
            const discP    = isEkyner ? 0 : d.discPot;

            dataCell(`P1(PUNTA)(kw)`, cx[0], sy, cw[0], RH, 'left');
            dataCell(p1kw_d.toFixed(2),  cx[1], sy, cw[1], RH, 'right');
            dataCell('P1(PUNTA)(€/kw día)',  cx[2], sy, cw[2], RH, 'left');
            dataCell(p1PotRte.toFixed(4),    cx[3], sy, cw[3], RH, 'right');
            dataCell(p1PotImp.toFixed(2),    cx[4], sy, cw[4], RH, 'right', false, isEkyner ? GREEN : null);
            sy += RH;

            dataCell(`P2(VALLE)(kw)`, cx[0], sy, cw[0], RH, 'left');
            dataCell(p2kw_d.toFixed(2),  cx[1], sy, cw[1], RH, 'right');
            dataCell('P2(VALLE)(€/kw día)', cx[2], sy, cw[2], RH, 'left');
            dataCell(isEkyner ? (d.OFR ? d.OFR.p2Pot.toFixed(6) : '0') : d.p2PotRate.toFixed(6), cx[3], sy, cw[3], RH, 'right');
            dataCell(p2PotImp.toFixed(2),    cx[4], sy, cw[4], RH, 'right', false, isEkyner ? GREEN : null);
            sy += RH;

            // Descuento potencia row
            dataCell('Descuento%', cx[0], sy, cw[0]+cw[1], RH, 'left', false, [120,120,120]);
            dataCell(`${discP}%`,  cx[2], sy, cw[2]+cw[3], RH, 'right', false, [120,120,120]);
            dataCell('—',          cx[4], sy, cw[4], RH, 'center', false, [120,120,120]);
            sy += RH + 2;

            // ─ CONSUMO header ─
            hdrCell('CONSUMO',     cx[0], sy, cw[0]+cw[1], RH, HDR_BG, BLUE);
            hdrCell('TARIFA',      cx[2], sy, cw[2]+cw[3], RH, HDR_BG, BLUE);
            hdrCell('IMPORTE (€)', cx[4], sy, cw[4],        RH, HDR_BG, BLUE);
            sy += RH;

            const consData = [
                ['P1 (KW)', d.p1kwh, isEkyner ? (d.OFR ? d.OFR.p1Cons : 0) : d.p1ConsRate, isEkyner ? d.p1ConsImpE : d.p1ConsImpA],
                ['P2 (KW)', d.p2kwh, isEkyner ? (d.OFR ? d.OFR.p2Cons : 0) : d.p2ConsRate, isEkyner ? d.p2ConsImpE : d.p2ConsImpA],
                ['P3 (KW)', d.p3kwh, isEkyner ? (d.OFR ? d.OFR.p3Cons : 0) : d.p3ConsRate, isEkyner ? d.p3ConsImpE : d.p3ConsImpA],
            ];
            consData.forEach(([lbl, kwh, rate, imp]) => {
                dataCell(lbl,                cx[0], sy, cw[0], RH, 'left');
                dataCell(kwh.toFixed(2),     cx[1], sy, cw[1], RH, 'right');
                dataCell(`${lbl.replace('KW','€/KW')}`, cx[2], sy, cw[2], RH, 'left');
                dataCell(rate.toFixed(5),    cx[3], sy, cw[3], RH, 'right');
                dataCell(imp > 0 ? imp.toFixed(2) : '—', cx[4], sy, cw[4], RH, 'right', false, isEkyner ? GREEN : null);
                sy += RH;
            });

            // Descuento consumo
            const discC = isEkyner ? 0 : d.discCons;
            dataCell('Descuento%', cx[0], sy, cw[0]+cw[1], RH, 'left', false, [120,120,120]);
            dataCell(`${discC}%`,  cx[2], sy, cw[2]+cw[3], RH, 'right', false, [120,120,120]);
            dataCell('—',          cx[4], sy, cw[4], RH, 'center', false, [120,120,120]);
            sy += RH + 2;

            // ─ BOTTOM ROW: 6 cells ─
            const impuestoV = isEkyner ? d.impuestoE : d.impuestoA;
            const ivaV      = isEkyner ? d.ivaE      : d.ivaA;
            const totalV    = isEkyner ? d.totalE     : d.totalA;
            const reactivaV = d.reactiva;

            const botLabels = ['OTROS\nGASTOS (€)', 'IMPUESTO\nELÉCTRICO (€)', 'ALQUILER\nEQUIPOS (€)', 'FINANCIACIÓN\nBONO SOCIAL (€)', 'IVA (€)', 'TOTAL\nFACTURA (€)'];
            const botVals   = [reactivaV.toFixed(2), impuestoV.toFixed(2), d.ALQUILER.toFixed(2), d.BONO_SOCIAL.toFixed(2), ivaV.toFixed(2), totalV.toFixed(2)];
            const botW      = [28, 28, 28, 30, 22, 28]; // total 164
            const BOTH      = 9;
            let bx = M;
            botLabels.forEach((lbl, i) => {
                hdrCell(lbl, bx, sy, botW[i], BOTH, [220,230,242], BLUE);
                bx += botW[i];
            });
            sy += BOTH;
            bx = M;
            botVals.forEach((val, i) => {
                const isTot = i === 5;
                dataCell(val, bx, sy, botW[i], 6, 'right', isTot, isTot ? (isEkyner ? GREEN : BLUE) : null);
                bx += botW[i];
            });
            sy += 6 + 5;

            return sy;
        }

        // Draw section 2 (actual company)
        y = drawBillingSection(false, y);

        // Draw section 3 (Ekyner)
        y = drawBillingSection(true, y);

        // ╔══════════════════════════════════════════════════╗
        // ║  4. COMPARATIVA                                  ║
        // ╚══════════════════════════════════════════════════╝
        sectionTitle('4', 'COMPARATIVA', y);
        y += 8;

        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BLUE_LIGHT);
        const offerNamePDF = d.offerLabel ? d.offerLabel.split(' —')[0] : 'Empresa Oferta';
        doc.text(`Con su compañía actual en ${d.dias} días paga ${d.totalA.toFixed(2)} euros`, M, y);
        y += 6;
        doc.text(`Con ${offerNamePDF} en ${d.dias} días pagaría ${d.totalE.toFixed(2)} euros`, M, y);
        y += 6;
        const pctTxt = `${typeof d.ahorroPct === 'number' ? d.ahorroPct.toFixed(1) : d.ahorroPct}%`;
        doc.text(`En un año el ahorro estimado sería de ${d.ahorroAnual.toFixed(2)} euros; el % de ahorro sería de ${pctTxt}`, M, y);

        y += 16;

        // ─── Footer ───
        doc.setDrawColor(...BLUE);
        doc.setLineWidth(0.35);
        doc.line(M, y, W - M, y);
        y += 5;
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...BLUE);
        doc.text('La información contenida en este documento es para uso exclusivo del cliente y es de carácter informativo.', M, y);

        const offerNameFile = d.offerLabel ? d.offerLabel.split(' —')[0].replace(/\s+/g,'_') : 'Oferta';
        const filename = `Simulacion_${offerNameFile}_${d.titular ? d.titular.replace(/\s+/g,'_') : 'Cliente'}.pdf`;
        doc.save(filename);
    }

    // PDF button
    const btnPdf = document.getElementById('btn-descargar-pdf');
    if (btnPdf) btnPdf.addEventListener('click', generatePDF);

    // ================================================================
    // MODAL: VISTA PREVIA CALCULADORA
    // ================================================================
    const previewModal     = document.getElementById('preview-calc-modal');
    const btnOpenPreview   = document.getElementById('btn-preview-calc');
    const btnClosePreview  = document.getElementById('close-preview-modal');
    const btnClosePreview2 = document.getElementById('close-preview-modal-2');

    function openPreviewModal() {
        if (previewModal) {
            previewModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    function closePreviewModal() {
        if (previewModal) {
            previewModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    if (btnOpenPreview)   btnOpenPreview.addEventListener('click', openPreviewModal);
    if (btnClosePreview)  btnClosePreview.addEventListener('click', closePreviewModal);
    if (btnClosePreview2) {
        btnClosePreview2.addEventListener('click', () => {
            closePreviewModal();
            const calcCard = document.getElementById('calc-calcular-btn');
            if (calcCard) calcCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    if (previewModal) {
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) closePreviewModal();
        });
    }

    // ================================================================
    // CALCULADORA DE INGRESOS PRO — Plan de Pagos Wake Up 2026
    // ================================================================

    const WAKEUP_DB = {
        ranks: [
            { id: 'DI',  minPts: 0,    residual: 0.05, bacPct: 0.50 },
            { id: 'EI',  minPts: 50,   residual: 0.10, bacPct: 0.70 },
            { id: 'CI',  minPts: 500,  residual: 0.15, bacPct: 0.80 },
            { id: 'DIR', minPts: 5000, residual: 0.20, bacPct: 0.90 }
        ],
        energy: {
            elec: {
                alumbra: { 
                    products: {
                        'index+ 2.0': [
                            { max: 1, vc: 18, pts: 1, bac: 30, pack: true },
                            { max: 2, vc: 23, pts: 2, bac: 30, pack: true },
                            { max: 5, vc: 27, pts: 3, bac: 30, pack: true },
                            { max: 10, vc: 50, pts: 3, bac: 100, pack: false },
                            { max: 20, vc: 70, pts: 4, bac: 145, pack: false },
                            { max: Infinity, vc: 150, pts: 6, bac: 300, pack: false }
                        ],
                        'index+ 3.0': [
                            { max: 1, vc: 20, pts: 1, bac: 30, pack: true },
                            { max: 2, vc: 24, pts: 2, bac: 30, pack: true },
                            { max: 5, vc: 27, pts: 3, bac: 30, pack: true },
                            { max: 10, vc: 55, pts: 3, bac: 125, pack: false },
                            { max: 20, vc: 80, pts: 4, bac: 180, pack: false },
                            { max: Infinity, vc: 180, pts: 6, bac: 380, pack: false }
                        ],
                        'index 3.0': [
                            { max: 5, vc: 15, pts: 1, bac: 30, pack: true },
                            { max: 10, vc: 25, pts: 2, bac: 40, pack: false },
                            { max: Infinity, vc: 60, pts: 4, bac: 100, pack: false }
                        ],
                        'fijo 3.0': [
                            { max: 5, vc: 20, pts: 2, bac: 30, pack: true },
                            { max: 10, vc: 24, pts: 2, bac: 30, pack: true },
                            { max: Infinity, vc: 27, pts: 3, bac: 30, pack: true }
                        ],
                        'index 2.0': [
                            { max: 1, vc: 13, pts: 1, bac: 30, pack: true },
                            { max: 2, vc: 18, pts: 2, bac: 30, pack: true },
                            { max: 5, vc: 20, pts: 3, bac: 30, pack: true },
                            { max: 10, vc: 32, pts: 3, bac: 70, pack: false },
                            { max: 20, vc: 50, pts: 4, bac: 100, pack: false },
                            { max: Infinity, vc: 100, pts: 5, bac: 200, pack: false }
                        ],
                        'fijo 2.0': [
                            { max: 5, vc: 14, pts: 2, bac: 30, pack: true },
                            { max: 10, vc: 18, pts: 2, bac: 30, pack: true },
                            { max: Infinity, vc: 22, pts: 2, bac: 30, pack: true }
                        ]
                    }
                },
                logos: {
                    products: {
                        'omega 2.0': [
                            { max: 1, vc: 10, pts: 1, bac: 30, pack: true },
                            { max: 2, vc: 12, pts: 2, bac: 30, pack: true },
                            { max: 5, vc: 14, pts: 2, bac: 30, pack: true },
                            { max: 10, vc: 22, pts: 3, bac: 40, pack: false },
                            { max: Infinity, vc: 60, pts: 5, bac: 100, pack: false }
                        ],
                        'epsilon 2.0': [
                            { max: 1, vc: 10, pts: 1, bac: 0, pack: false },
                            { max: 2, vc: 12, pts: 2, bac: 0, pack: false },
                            { max: 5, vc: 14, pts: 2, bac: 0, pack: false },
                            { max: 10, vc: 30, pts: 3, bac: 30, pack: false },
                            { max: Infinity, vc: 60, pts: 5, bac: 60, pack: false }
                        ]
                    }
                },
                nordy: {
                    products: {
                        'nordy 2.0': [
                            { max: 5, vc: 8, pts: 2, bac: 30, pack: true },
                            { max: 10, vc: 10, pts: 2, bac: 30, pack: true },
                            { max: Infinity, vc: 20, pts: 3, bac: 50, pack: false }
                        ]
                    }
                },
                plenitude: {
                    products: {
                        'facil prime': [
                            { max: 1, vc: 8, pts: 1, bac: 0, pack: false },
                            { max: 5, vc: 10, pts: 1, bac: 0, pack: false },
                            { max: 10, vc: 15, pts: 2, bac: 20, pack: false },
                            { max: Infinity, vc: 50, pts: 4, bac: 100, pack: false }
                        ]
                    }
                }
            },
            gas: {
                gana: {
                    products: {
                        'gas gana': [
                            { max: 0.005, vc: 5, pts: 1, bac: 10 },
                            { max: 0.015, vc: 7, pts: 1, bac: 10 },
                            { max: 0.050, vc: 11, pts: 1, bac: 15 },
                            { max: Infinity, vc: 27, pts: 3, bac: 15 }
                        ]
                    }
                },
                logos: {
                    products: {
                        'gas epsilon': [
                            { max: 0.005, vc: 9, pts: 1, bac: 10 },    // RL.1
                            { max: 0.015, vc: 17, pts: 2, bac: 10 },   // RL.2
                            { max: 0.050, vc: 28, pts: 3, bac: 20 },   // RL.3
                            { max: Infinity, vc: 57, pts: 4, bac: 30 } // RL.4
                        ]
                    }
                },
                plenitude: {
                    products: {
                        'gas power': [
                            { max: 0.005, vc: 5, pts: 1, bac: 0 },
                            { max: 0.015, vc: 9, pts: 1, bac: 10 },
                            { max: 0.050, vc: 25, pts: 2, bac: 40 },
                            { max: Infinity, vc: 100, pts: 4, bac: 150 }
                        ]
                    }
                }
            },
            sva: {
                logos: {
                    products: {
                        'mantenimiento': {
                            'basico': { vc: 3, pts: 1 },
                            'premium': { vc: 6, pts: 1 },
                            'manitas': { vc: 5, pts: 1 }
                        }
                    }
                }
            }
        },
        seguros: {
            'auto': { vcPct: 0.18, tramos: [{ max: 100, p: 0 }, { max: 200, p: 1 }, { max: 500, p: 2 }, { max: 900, p: 3 }, { max: Infinity, p: 4 }] },
            'hogar': { vcPct: 0.33, tramos: [{ max: 70, p: 0 }, { max: 200, p: 1 }, { max: 300, p: 2 }, { max: 400, p: 3 }, { max: Infinity, p: 4 }] },
            'vida': { vcPct: 0.30, tramos: [{ max: 100, p: 0 }, { max: 200, p: 1 }, { max: 300, p: 2 }, { max: Infinity, p: 3 }] },
            'salud': { vcPct: 0.13, tramos: [{ max: 300, p: 0 }, { max: 500, p: 1 }, { max: Infinity, p: 2 }] }
        },
        hipotecas: {
            'wypo': [
                { max: 100, bac: 90, pts: 2 },
                { max: 150, bac: 180, pts: 2 },
                { max: 200, bac: 270, pts: 3 },
                { max: 300, bac: 450, pts: 4 },
                { max: 600, bac: 1000, pts: 5 },
                { max: Infinity, bac: 1200, pts: 6 }
            ]
        },
        movil: {
            estandar: { vc: 80, pts: 4, pack: true },
            pro: { vc: 120, pts: 6, pack: true }
        },
        alarmas: {
            estandar: { vc: 120, pts: 4, pack: true },
            negocio: { vc: 120, pts: 4, pack: true }
        }
    };

    function findTier(tramos, valor) {
        if (!tramos || !Array.isArray(tramos)) return tramos;
        return tramos.find(t => valor <= t.max) || tramos[tramos.length - 1];
    }

    function incFmt(n) { return (n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'; }
    function incSet(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
    function incVal(id) { const el = document.getElementById(id); return el ? (parseFloat(el.value) || 0) : 0; }

    function updateRates(service) {
        const company = document.querySelector(`.service-company[data-service="${service}"]`)?.value;
        const rateSelect = document.querySelector(`.service-rate[data-service="${service}"]`);
        if (!rateSelect || !company) return;

        let options = '';
        const data = WAKEUP_DB.energy[service]?.[company]?.products || {};
        for(let r in data) {
            options += `<option value="${r}">${r.toUpperCase()}</option>`;
        }
        rateSelect.innerHTML = options || '<option value="unico">Tarifa Única</option>';
    }

    function calcIncomePro() {
        const rangeId = document.getElementById('inc-rango').value;
        const currentRange = WAKEUP_DB.ranks.find(r => r.id === rangeId);
        
        let totalPts = 0;
        let totalBac = 0;
        let totalPackContracts = 0;
        let totalVC = 0;

        // Actualizar porcentajes de Rango en la UI
        const pctDirectoEl = document.getElementById('inc-pct-directo');
        if (pctDirectoEl) pctDirectoEl.value = currentRange.bacPct * 100;
        
        const pctIndirectoEl = document.getElementById('inc-pct-indirecto');
        if (pctIndirectoEl) pctIndirectoEl.value = (currentRange.id === 'DI' ? 0 : 20); // Según BAC Indirecto EI=20%, CI/DIR=10% + 1a Gen

        // Iterar servicios
        const rows = ['elec', 'gas', 'sva', 'seguros', 'hipotecas', 'movil', 'alarmas'];
        rows.forEach(s => {
            const company = document.querySelector(`.service-company[data-service="${s}"]`)?.value || 'default';
            const product = document.querySelector(`.service-rate[data-service="${s}"]`)?.value || 'unico';
            const count = incVal(`inp-${s}-count`);
            const valInput = incVal(`inp-${s}-val`);

            let vc = 0, pts = 0, extraBAC = 0, isPack = false;

            if (s === 'elec' || s === 'gas') {
                const tiers = WAKEUP_DB.energy[s]?.[company]?.products?.[product];
                const tier = findTier(tiers, valInput);
                if (tier) {
                    vc = tier.vc;
                    pts = tier.pts;
                    extraBAC = tier.bac || 0;
                    isPack = tier.pack || false;
                }
            } else if (s === 'seguros') {
                const segData = WAKEUP_DB.seguros[product];
                if (segData) {
                    vc = (valInput / 12) * segData.vcPct; // VC mensual
                    const tier = findTier(segData.tramos, valInput);
                    pts = tier ? tier.p : 0;
                }
            } else if (s === 'hipotecas') {
                const tier = findTier(WAKEUP_DB.hipotecas.wypo, valInput);
                if (tier) {
                    extraBAC = tier.bac;
                    pts = tier.pts;
                }
            } else if (s === 'movil' || s === 'alarmas') {
                const data = WAKEUP_DB[s][product];
                if (data) {
                    vc = data.vc;
                    pts = data.pts;
                    isPack = data.pack;
                }
            } else if (s === 'sva') {
                const data = WAKEUP_DB.energy.sva.logos?.products?.mantenimiento?.[product];
                if (data) { vc = data.vc; pts = data.pts; }
            }

            // Cálculo final por fila (BAC Directo = (VC_mensual_o_Fijo * %Rango) + extraBACfijo)
            // Según el plan, el BAC suele ser un fijo. Si vc es "comisionable", el BAC es vc * %Rango
            // Si el servicio tiene un BAC específico (extraBAC), se usa ese.
            
            let rowBac = 0;
            if (extraBAC > 0) {
                rowBac = (extraBAC * currentRange.bacPct) * count;
            } else if (vc > 0 && s !== 'seguros') {
                // Para energía que no tiene BAC fijo, el BAC suele ser el VC
                rowBac = (vc * currentRange.bacPct) * count;
            }

            const rowPts = pts * count;
            
            totalPts += rowPts;
            totalBac += rowBac;
            totalVC += (vc * count);
            if (isPack) totalPackContracts += count;

            // Update Row UI
            const vcDisp = document.querySelector(`.inc-row-${s} .service-vc`);
            const ptsDisp = document.querySelector(`.inc-row-${s} .service-pts`);
            const totDisp = document.querySelector(`.inc-row-${s} .service-total`);
            
            if (vcDisp) vcDisp.textContent = vc.toFixed(1) + ' €';
            if (ptsDisp) ptsDisp.textContent = pts;
            if (totDisp) totDisp.textContent = incFmt(rowBac);
        });

        // Pack Bonus Logic (150€ cada 5 contratos elegibles)
        const packSets = Math.floor(totalPackContracts / 5);
        const packBonus = packSets * 150;

        // Residual Percentage Logic (Página 4 del Plan)
        let residualPct = 0.05;
        if (totalPts >= 200) residualPct = 0.20;
        else if (totalPts >= 100) residualPct = 0.15;
        else if (totalPts >= 60) residualPct = 0.10;

        // Update Totals UI
        incSet('tot-direct-pts', totalPts);
        incSet('tot-direct-count', totalPackContracts); 
        incSet('tot-direct-money', incFmt(totalBac));
        
        incSet('pack-count', totalPackContracts % 5);
        incSet('pack-bonus-amount', incFmt(packBonus));

        // Animar Barra de Progreso Pack 5
        const progressBar = document.getElementById('pack-progress-inner');
        if (progressBar) {
            const progressPct = ((totalPackContracts % 5) / 5) * 100;
            progressBar.style.width = `${progressPct}%`;
        }
        
        const totalPtsInput = document.getElementById('inc-total-pts-global');
        if (totalPtsInput) totalPtsInput.value = totalPts;
        
        const pctPasivoInput = document.getElementById('inc-pct-pasivo');
        if (pctPasivoInput) pctPasivoInput.value = (residualPct * 100).toFixed(0);

        // Pasivos
        const redVC = incVal('pas-red-vc');
        const pasPersTotal = totalVC * residualPct;
        const pasRedTotal = redVC * 0.05; // Media estimada de red

        incSet('pas-pers-vc', incFmt(totalVC));
        incSet('pas-pers-pct', (residualPct * 100) + '%');
        incSet('pas-pers-total', incFmt(pasPersTotal));
        incSet('pas-red-total', incFmt(pasRedTotal));

        // Resumen Final
        incSet('res-bac-total', incFmt(totalBac));
        incSet('res-bonos-total', incFmt(packBonus));
        const totalInmediato = totalBac + packBonus;
        incSet('res-total-inmediato', incFmt(totalInmediato));
        incSet('res-total-pasivo', incFmt(pasPersTotal + pasRedTotal) + ' /mes');

        // Lógica de Homer
        const homer = document.getElementById('homer-celebration');
        if (homer) {
            if (totalInmediato > 0) {
                homer.classList.add('homer-visible');
                homer.classList.remove('homer-hidden');
            } else {
                homer.classList.remove('homer-visible');
                homer.classList.add('homer-hidden');
            }
        }
    }

    // PDF Generations
    function generateIncomePDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        const BLUE = [30, 58, 138];
        const GOLD = [245, 158, 11];
        const GRAY = [100, 100, 100];
        const LIGHT_GRAY = [245, 245, 245];
        
        // --- Cabecera Corporativa ---
        doc.setFillColor(...BLUE);
        doc.rect(0, 0, 210, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("ESTUDIO FINANCIERO WAKE UP", 15, 18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Proyección de Ingresos y Desarrollo de Negocio - Plan 2026", 15, 27);
        
        const today = new Date().toLocaleDateString('es-ES');
        doc.text(today, 195, 20, { align: 'right' });
        
        let y = 45;
        
        // --- 1. Información del Distribuidor ---
        doc.setTextColor(...BLUE);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("1. Resumen de Calificación", 15, y);
        doc.line(15, y + 2, 195, y + 2);
        y += 12;
        
        const rankName = document.getElementById('inc-rango').selectedOptions[0].text;
        const totalPts = document.getElementById('inc-total-pts-global').value;
        const pasivoPct = document.getElementById('inc-pct-pasivo').value;
        const bacPct = document.getElementById('inc-pct-directo').value;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text("Rango / Posición:", 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(rankName, 55, y);
        
        doc.setFont('helvetica', 'bold');
        doc.text("Puntos Totales:", 110, y);
        doc.setFont('helvetica', 'normal');
        doc.text(totalPts + " pts", 145, y);
        y += 7;
        
        doc.setFont('helvetica', 'bold');
        doc.text("% BAC Directo:", 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(bacPct + "%", 55, y);
        
        doc.setFont('helvetica', 'bold');
        doc.text("% Residual Personal:", 110, y);
        doc.setFont('helvetica', 'normal');
        doc.text(pasivoPct + "%", 150, y);
        
        y += 15;
        
        // --- 2. Desglose Detallado de Servicios ---
        doc.setTextColor(...BLUE);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("2. Desglose de Servicios Directos", 15, y);
        doc.line(15, y + 2, 195, y + 2);
        y += 10;
        
        // Cabecera Tabla
        doc.setFillColor(...BLUE);
        doc.rect(15, y, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8.5);
        doc.text("SERVICIO / COMPAÑÍA", 18, y + 5.5);
        doc.text("DATO TÉCNICO", 85, y + 5.5);
        doc.text("PTS", 125, y + 5.5, { align: 'center' });
        doc.text("CONT.", 145, y + 5.5, { align: 'center' });
        doc.text("COMISIÓN (BAC)", 192, y + 5.5, { align: 'right' });
        
        y += 8;
        
        // Filas Dinámicas
        const rows = ['elec', 'gas', 'sva', 'seguros', 'hipotecas', 'movil', 'alarmas'];
        let hasData = false;
        
        doc.setTextColor(0, 0, 0);
        rows.forEach((s, idx) => {
            const count = parseInt(document.getElementById(`inp-${s}-count`)?.value || 0);
            if (count > 0) {
                hasData = true;
                if (idx % 2 === 0) {
                    doc.setFillColor(...LIGHT_GRAY);
                    doc.rect(15, y, 180, 7, 'F');
                }
                
                const serviceEl = document.querySelector(`.inc-row-${s} .td-servicio`)?.textContent.trim().split('[')[0];
                const company = document.querySelector(`.service-company[data-service="${s}"]`)?.selectedOptions[0]?.text || "-";
                const datoVal = document.getElementById(`inp-${s}-val`)?.value || "-";
                const pts = document.querySelector(`.inc-row-${s} .service-pts`)?.textContent || "0";
                const total = document.querySelector(`.inc-row-${s} .service-total`)?.textContent || "0 €";
                
                doc.text(serviceEl.substring(0, 18), 18, y + 5);
                doc.setFontSize(7);
                doc.text(company.substring(0, 30), 45, y + 5);
                doc.setFontSize(8.5);
                doc.text(datoVal, 85, y + 5);
                doc.text(pts, 125, y + 5, { align: 'center' });
                doc.text(count.toString(), 145, y + 5, { align: 'center' });
                doc.setTextColor(...BLUE);
                doc.setFont('helvetica', 'bold');
                doc.text(total, 192, y + 5, { align: 'right' });
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                
                y += 7;
            }
        });
        
        if (!hasData) {
            doc.setFont('helvetica', 'italic');
            doc.text("No se han registrado contratos para este estudio.", 105, y + 10, { align: 'center' });
            y += 15;
        }
        
        y += 10;
        
        // --- 3. Resultados Económicos ---
        // Panel BAC + Bonos (Inmediato)
        doc.setFillColor(...GOLD);
        doc.rect(15, y, 90, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("INGRESOS INMEDIATOS", 20, y + 10);
        
        const inmediatos = document.getElementById('res-total-inmediato').textContent;
        const bacTotal = document.getElementById('res-bac-total').textContent;
        const bonosTotal = document.getElementById('res-bonos-total').textContent;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text("Total BAC Directo: " + bacTotal, 20, y + 18);
        doc.text("Bono Pack 5: " + bonosTotal, 20, y + 24);
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(inmediatos, 20, y + 38);
        
        // Panel Residual (Pasivo)
        doc.setFillColor(30, 41, 59); // Slate dark
        doc.rect(105, y, 90, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("INGRESOS PASIVOS (MENSUALES)", 110, y + 10);
        
        const pasivos = document.getElementById('res-total-pasivo').textContent;
        const pasPers = document.getElementById('pas-pers-total').textContent;
        const pasRed = document.getElementById('pas-red-total').textContent;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text("Residual Personal: " + pasPers, 110, y + 18);
        doc.text("Indirecto de Equipo: " + pasRed, 110, y + 24);
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(74, 222, 128); // Green
        doc.text(pasivos, 110, y + 38);
        
        // --- 4. Celebración (Homer Simpson) ---
        const tieneIngresos = inmediatos && !inmediatos.includes("0,00");
        
        if (tieneIngresos && document.getElementById('homer-celebration')) {
            try {
                // Imagen de Homer Simpson en base64 para evitar bloqueos por CORS o file:///
                const homerB64 = "data:image/jpeg;base64,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";
                
                // Posición: En el espacio en blanco inferior
                // x: 75mm (para centrar un ancho de 60mm en 210mm), y: 215mm
                doc.addImage(homerB64, 'JPEG', 75, 215, 60, 45);
            } catch (e) {
                console.error("Error al añadir imagen de Homer en base64 al PDF:", e);
            }
        }

        y += 55;
        
        // Nota Legal / Pie
        doc.setTextColor(...GRAY);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text("Nota: Este estudio es una proyección basada en los datos introducidos y el Plan de Pagos 2026. Los ingresos reales pueden variar según la validación de los contratos por parte de las marcas suministradoras.", 15, y);
        
        doc.save("Estudio_Ingresos_WakeUp_Pro.pdf");
    }

    function generateComparisonPDF() {
        // Lógica similar para el PDF de Comparativa de luz
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("COMPARATIVA DE AHORRO ENERGÉTICO", 15, 20);
        doc.setFontSize(12);
        const compActual = document.getElementById('comp-company-title')?.textContent || 'Comercializadora Actual';
        const ahorroAnual = document.getElementById('save-annual')?.textContent || '0 €';
        doc.text(`Comparativa: ${compActual} vs Ekyner`, 15, 35);
        doc.text(`Ahorro Anual Estimado: ${ahorroAnual}`, 15, 45);
        doc.save("Comparativa_Ahorro_Energia.pdf");
    }

    // Event Listeners initialization
    const serviceTypes = ['elec', 'gas', 'sva'];
    serviceTypes.forEach(s => {
        const sel = document.querySelector(`.service-company[data-service="${s}"]`);
        if (sel) {
            sel.addEventListener('change', () => { updateRates(s); calcIncomePro(); });
            updateRates(s); 
        }
    });

    document.querySelectorAll('.inc-select, .inc-input, .inc-select-global').forEach(el => {
        el.addEventListener('input', calcIncomePro);
    });
    
    const rankSelector = document.getElementById('inc-rango');
    if (rankSelector) rankSelector.addEventListener('change', calcIncomePro);

    const btnIngrPDF = document.getElementById('btn-descargar-ingr-pdf');
    if (btnIngrPDF) btnIngrPDF.addEventListener('click', generateIncomePDF);

    const btnCompPDF = document.getElementById('btn-descargar-pdf');
    // Detailed PDF generator for electricity is already assigned to this button via generatePDF
    // if (btnCompPDF) btnCompPDF.addEventListener('click', generateComparisonPDF);

    // Initial calc
    calcIncomePro();

    // ================================================================
    // CALCULADORA DE PENALIZACIONES
    // ================================================================

    function initPenalizacionesCalculator() {
        const val = id => {
            const el = document.getElementById(id);
            return el ? (parseFloat(el.value) || 0) : 0;
        };
        const setVal = (id, str) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = str;
        };

        const calcAll = () => {
            // Block 1 Mensual
            let mTotal = 0;
            const mFactura = val('penal-m-factura');
            for(let i=1; i<=6; i++) {
                const kwh = val('penal-m-p' + i);
                mTotal += kwh;
            }
            setVal('penal-m-total', mTotal);
            for(let i=1; i<=6; i++) {
                const kwh = val('penal-m-p' + i);
                const pct = mFactura > 0 ? ((kwh / mFactura) * 100).toFixed(0) + '%' : '0%';
                setVal('penal-m-pct-p' + i, pct);
                // Espejar a tabla 2
                setVal('penal-fac-cons-p' + i, kwh);
            }
            setVal('penal-m-pct-total', mFactura > 0 ? ((mTotal / mFactura) * 100).toFixed(0) + '%' : '0%');

            // Block 1 Anual
            let aTotal = 0;
            const aFactura = val('penal-a-factura');
            for(let i=1; i<=6; i++) {
                const kwh = val('penal-a-p' + i);
                aTotal += kwh;
            }
            setVal('penal-a-total', aTotal);
            for(let i=1; i<=6; i++) {
                const kwh = val('penal-a-p' + i);
                const pct = aFactura > 0 ? ((kwh / aFactura) * 100).toFixed(0) + '%' : '0%';
                setVal('penal-a-pct-p' + i, pct);
            }
            setVal('penal-a-pct-total', aFactura > 0 ? ((aTotal / aFactura) * 100).toFixed(0) + '%' : '0%');

            // Block 2: Datos Factura
            const dto = val('penal-fac-descuento');
            let totalEurosFactura = 0;
            for(let i=1; i<=6; i++) {
                const precio = val('penal-fac-precio-p' + i);
                const cons = val('penal-m-p' + i); // from Block 1 Monthly
                const kWFinal = precio * (1 - dto);
                
                setVal('penal-fac-final-p' + i, kWFinal.toFixed(3));
                totalEurosFactura += (kWFinal * cons);
            }
            
            const precioMedio = mTotal > 0 ? (totalEurosFactura / mTotal) : 0;
            
            setVal('penal-fac-precio-medio', precioMedio.toFixed(3));
            setVal('penal-fac-cons-total', mTotal);
            setVal('penal-fac-total-euros', totalEurosFactura.toFixed(2) + ' €');

            // Block 3: Penalizaciones
            const mesesRestantes = val('penal-meses-restantes');
            const kwConsumir = mTotal * mesesRestantes;
            const penalKW = kwConsumir * 0.05; // 5% fijo
            const penalTotalEuros = penalKW * precioMedio;

            setVal('penal-res-kw-mensual', mTotal);
            setVal('penal-res-kw-consumir', kwConsumir.toFixed(0));
            setVal('penal-res-kw-consumir-2', kwConsumir.toFixed(0));
            setVal('penal-res-penal-kw', penalKW.toFixed(1));
            setVal('penal-res-penal-kw-2', penalKW.toFixed(1));
            
            setVal('penal-res-precio-medio-calc', precioMedio.toFixed(3));
            setVal('penal-res-total-euros', penalTotalEuros.toFixed(2) + ' €');
        };

        // Attach listeners
        const inputs = document.querySelectorAll(
            '#recursos-calculadora-penalizaciones input[type="number"]'
        );
        inputs.forEach(inp => inp.addEventListener('input', calcAll));
        
        calcAll();
    }
    
    // Iniciar si existe la sección
    if (document.getElementById('recursos-calculadora-penalizaciones')) {
        initPenalizacionesCalculator();
    }

    function generatePenalizacionesPDF(isPreview = false) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        const BLUE = [30, 58, 138];
        const GRAY = [100, 100, 100];
        const LIGHT_GRAY = [245, 245, 245];
        const RED = [239, 68, 68];
        
        // Cabecera Corporativa
        doc.setFillColor(RED[0], RED[1], RED[2]);
        doc.rect(0, 0, 210, 35, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("ESTUDIO DE PENALIZACIÓN", 15, 18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Estimación de Costes Asociados al Consumo Pendiente", 15, 27);
        
        const today = new Date().toLocaleDateString('es-ES');
        doc.text(today, 195, 20, { align: 'right' });
        
        let y = 45;
        
        // Helper to get value
        const val = id => {
            const el = document.getElementById(id);
            return el ? (parseFloat(el.value) || parseFloat(el.textContent) || 0) : 0;
        };
        const txt = id => {
            const el = document.getElementById(id);
            return el ? el.textContent.trim() : "-";
        };

        // 1. Datos de Consumo
        doc.setTextColor(RED[0], RED[1], RED[2]);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("1. Análisis de Consumo Mensual por Período", 15, y);
        doc.line(15, y + 2, 195, y + 2);
        y += 10;
        
        // Tabla Consumo
        doc.setFillColor(RED[0], RED[1], RED[2]);
        doc.rect(15, y, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8.5);
        doc.text("PERÍODO", 18, y + 5.5);
        doc.text("CONSUMO (kWh)", 85, y + 5.5);
        doc.text("PROPORCIÓN (%)", 145, y + 5.5);
        y += 8;
        
        doc.setTextColor(0, 0, 0);
        for(let i=1; i<=6; i++) {
            if (i % 2 === 0) {
                doc.setFillColor(...LIGHT_GRAY);
                doc.rect(15, y, 180, 7, 'F');
            }
            doc.text("P" + i, 18, y + 5);
            doc.text(val('penal-m-p' + i).toString(), 85, y + 5);
            doc.text(txt('penal-m-pct-p' + i), 145, y + 5);
            y += 7;
        }
        
        // Total Consumo
        doc.setFillColor(254, 240, 138); // Yellow
        doc.rect(15, y, 180, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text("TOTAL MENSUAL", 18, y + 5);
        doc.text(txt('penal-m-total'), 85, y + 5);
        doc.text(txt('penal-m-pct-total'), 145, y + 5);
        doc.setFont('helvetica', 'normal');
        y += 15;

        // 2. Precios
        doc.setTextColor(RED[0], RED[1], RED[2]);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("2. Desglose de Tarifas y Descuentos Aplicados", 15, y);
        doc.line(15, y + 2, 195, y + 2);
        y += 10;
        
        // Tabla Tarifas
        doc.setFillColor(RED[0], RED[1], RED[2]);
        doc.rect(15, y, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text("PERÍODO", 18, y + 5.5);
        doc.text("PRECIO BASE (€)", 55, y + 5.5);
        doc.text("COEF. DESCUENTO", 110, y + 5.5);
        doc.text("PRECIO FINAL (€)", 160, y + 5.5);
        y += 8;
        
        doc.setTextColor(0, 0, 0);
        const dtoBase = val('penal-fac-descuento');
        for(let i=1; i<=6; i++) {
            if (i % 2 === 0) {
                doc.setFillColor(...LIGHT_GRAY);
                doc.rect(15, y, 180, 7, 'F');
            }
            doc.text("P" + i, 18, y + 5);
            doc.text(val('penal-fac-precio-p' + i).toFixed(5), 55, y + 5);
            doc.text(dtoBase.toFixed(2), 110, y + 5);
            doc.text(txt('penal-fac-final-p' + i), 160, y + 5);
            y += 7;
        }

        // Row Media
        doc.setFillColor(254, 240, 138); // Yellow
        doc.rect(15, y, 180, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text("PRECIO MEDIO PONDERADO", 18, y + 5);
        doc.text(txt('penal-fac-precio-medio') + " €", 160, y + 5);
        doc.setFont('helvetica', 'normal');
        y += 15;

        // 3. Resultado
        doc.setTextColor(RED[0], RED[1], RED[2]);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("3. Cálculo Final de Penalización por Cancelación Anticipada", 15, y);
        doc.line(15, y + 2, 195, y + 2);
        y += 15;
        
        // Boxes
        doc.setFillColor(241, 245, 249); // slate-100
        doc.setDrawColor(203, 213, 225); // slate-300
        
        // Box 1
        doc.rect(15, y, 85, 20, 'FD');
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.text("A) Consumo Base Mensual (kWh)", 20, y + 8);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(txt('penal-res-kw-mensual'), 20, y + 15);
        
        // Box 2
        doc.rect(110, y, 85, 20, 'FD');
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.text("B) Meses Restantes de Contrato", 115, y + 8);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(val('penal-meses-restantes').toString(), 115, y + 15);
        
        y += 25;
        
        // Box 3
        doc.rect(15, y, 85, 20, 'FD');
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.text("C) KWh Potenciales a Consumir (A × B)", 20, y + 8);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(txt('penal-res-kw-consumir'), 20, y + 15);
        
        // Box 4
        doc.rect(110, y, 85, 20, 'FD');
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.text("D) KWh Sujetos a Penalización (5% de C)", 115, y + 8);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(txt('penal-res-penal-kw'), 115, y + 15);
        
        y += 30;

        // FINAL RESULT BOX
        doc.setFillColor(254, 242, 242); // red-50
        doc.setDrawColor(RED[0], RED[1], RED[2]);
        doc.setLineWidth(0.8);
        doc.rect(15, y, 180, 30, 'FD');
        doc.setLineWidth(0.1);
        
        doc.setFontSize(12);
        doc.setTextColor(RED[0], RED[1], RED[2]);
        doc.text("IMPORTE TOTAL ESTIMADO DE LA PENALIZACIÓN", 25, y + 12);
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text("(KWh Penalizados × Precio Medio Ponderado del KWh)", 25, y + 20);
        
        doc.setFontSize(22);
        doc.setTextColor(RED[0], RED[1], RED[2]);
        doc.text(txt('penal-res-total-euros'), 190, y + 20, { align: 'right' });
        
        y += 45;
        
        // Legal Text
        doc.setTextColor(...GRAY);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text("Nota Importante: Este estudio es un documento meramente informativo e ilustrativo. La penalización económica se calcula", 15, y);
        doc.text("de forma aproximada de acuerdo a lo establecido por ley (5% del consumo estimado pendiente). El importe real cobrado", 15, y + 4);
        doc.text("por la comercializadora saliente podría variar en función de las lecturas y plazos de facturación aplicados.", 15, y + 8);
        
        if (isPreview) {
            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
        } else {
            doc.save("Estudio_Penalizacion_Comercializadora.pdf");
        }
    }

    const btnPrintPenalPdf = document.getElementById('btn-descargar-penalizaciones-pdf');
    if (btnPrintPenalPdf) btnPrintPenalPdf.addEventListener('click', () => generatePenalizacionesPDF(false));

    const btnPreviewPenal = document.getElementById('btn-preview-penalizaciones');
    if (btnPreviewPenal) btnPreviewPenal.addEventListener('click', () => generatePenalizacionesPDF(true));

    // ================================================================
    // CROWDFUNDING MODULE
    // ================================================================
    const CROWDFUNDING_CONFIG = {
        mtoProfesional: 150,
        costesWeb: 50,
        fondosActuales: 720, // <-- CAMBIA ESTE VALOR PARA ACTUALIZAR RECAUDACIÓN
        linkPago: 'https://www.paypal.me/tu_usuario' // <-- CAMBIA ESTE LINK
    };

    function initCrowdfunding() {
        const totalMensual = CROWDFUNDING_CONFIG.mtoProfesional + CROWDFUNDING_CONFIG.costesWeb;
        const metaAnual = totalMensual * 12;
        const fondos = CROWDFUNDING_CONFIG.fondosActuales;
        const falta = Math.max(0, metaAnual - fondos);
        const porcentaje = Math.min(100, Math.round((fondos / metaAnual) * 100));

        const progressPercent = document.getElementById('crowdfunding-percent');
        const progressBar = document.getElementById('crowdfunding-progress-bar');
        const remainingText = document.getElementById('crowdfunding-remaining');
        const btnDonar = document.querySelector('.crowdfunding-banner .btn-primary');

        if (progressPercent) progressPercent.textContent = `${porcentaje}%`;
        if (progressBar) progressBar.style.width = `${porcentaje}%`;
        if (remainingText) remainingText.textContent = `${falta.toLocaleString('es-ES')}€`;
        if (btnDonar) btnDonar.href = CROWDFUNDING_CONFIG.linkPago;
    }

    initCrowdfunding();

});

