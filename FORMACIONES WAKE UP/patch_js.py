import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Fix Google Login
google_old = '''    if (googleLoginBtn) {
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
                    
                    // Animación de entrada de la app
                    appScreen.style.opacity = '0';
                    setTimeout(() => {
                        appScreen.style.transition = 'opacity 0.5s ease';
                        appScreen.style.opacity = '1';
                    }, 50);
                    
                    // Configurar nombre de usuario
                    displayUsername.textContent = simularCorreo.split('@')[0];
                }, 500);
            } else if(simularCorreo !== null) {
                alert('Por favor, introduce un correo válido.');
            }
        });
    }'''

google_new = '''    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            // Animación de salida del login directo para Google (Sin Prompt)
            loginScreen.style.opacity = '0';
            loginScreen.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                appScreen.classList.remove('hidden');
                
                // Animación de entrada de la app
                appScreen.style.opacity = '0';
                setTimeout(() => {
                    appScreen.style.transition = 'opacity 0.5s ease';
                    appScreen.style.opacity = '1';
                }, 50);
                
                // Configurar nombre de usuario
                const savedProfile = localStorage.getItem('user_profile');
                if(savedProfile) {
                    const prof = JSON.parse(savedProfile);
                    displayUsername.textContent = prof.name ? prof.name.split(' ')[0] : 'Usuario Google';
                } else {
                    displayUsername.textContent = 'Usuario Google';
                }
            }, 500);
        });
    }'''

if 'const simularCorreo = prompt(' in js:
    js = js.replace(google_old, google_new)


# 2. Append User Profile & Inbox logic
extra_js = '''
/* ==========================================================
   USER PROFILE & INBOX LOGIC
   ========================================================== */
function openUserProfile() {
    document.getElementById('user-profile-modal').classList.remove('hidden');
    const saved = localStorage.getItem('user_profile');
    const email = localStorage.getItem('user_email') || document.getElementById('display-username').textContent + '@gmail.com';
    
    document.getElementById('profile-email').value = email;
    
    if(saved) {
        const p = JSON.parse(saved);
        if(p.name) document.getElementById('profile-name').value = p.name;
        if(p.phone) document.getElementById('profile-phone').value = p.phone;
        if(p.avatar) {
            document.getElementById('profile-avatar-img').src = p.avatar;
            document.getElementById('profile-avatar-img').style.display = 'block';
            document.getElementById('profile-avatar-initial').style.display = 'none';
        }
    }
}

function previewProfileAvatar(event) {
    const file = event.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-avatar-img').src = e.target.result;
            document.getElementById('profile-avatar-img').style.display = 'block';
            document.getElementById('profile-avatar-initial').style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
}

function saveUserProfile() {
    const p = {
        name: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
        avatar: document.getElementById('profile-avatar-img').src
    };
    localStorage.setItem('user_profile', JSON.stringify(p));
    
    if(p.name) {
        document.getElementById('display-username').textContent = p.name.split(' ')[0];
    }
    
    alert('Perfil guardado correctamente');
    document.getElementById('user-profile-modal').classList.add('hidden');
}

function openInbox() {
    document.getElementById('inbox-modal').classList.remove('hidden');
    const container = document.getElementById('inbox-messages-container');
    container.innerHTML = '';
    
    const email = document.getElementById('profile-email') ? document.getElementById('profile-email').value : document.getElementById('display-username').textContent + '@gmail.com';
    
    const localMsgs = localStorage.getItem('user_messages_' + email);
    let msgs = localMsgs ? JSON.parse(localMsgs) : [];
    
    if(msgs.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#5e6c84;">No tienes mensajes nuevos.</p>';
        return;
    }
    
    msgs.forEach((m, idx) => {
        container.innerHTML += `
            <div style="background: #fafbfc; border: 1px solid #dfe1e6; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span style="font-weight:bold; color:var(--primary-blue);"><i class='bx bxs-user-badge'></i> Administrador</span>
                    <span style="font-size:0.8rem; color:#5e6c84;">${m.date}</span>
                </div>
                <p style="margin:0; color:#172b4d;">${m.text}</p>
                <button onclick="deleteMessage('${email}', ${idx})" style="margin-top:10px; background:transparent; color:#eb5a46; border:none; cursor:pointer; font-size:0.85rem;"><i class='bx bx-trash'></i> Borrar</button>
            </div>
        `;
    });
}

function deleteMessage(email, idx) {
    const localMsgs = localStorage.getItem('user_messages_' + email);
    let msgs = localMsgs ? JSON.parse(localMsgs) : [];
    msgs.splice(idx, 1);
    localStorage.setItem('user_messages_' + email, JSON.stringify(msgs));
    openInbox();
    checkInboxBadge();
}

function checkInboxBadge() {
    const email = document.getElementById('profile-email') ? document.getElementById('profile-email').value : document.getElementById('display-username').textContent + '@gmail.com';
    const localMsgs = localStorage.getItem('user_messages_' + email);
    let msgs = localMsgs ? JSON.parse(localMsgs) : [];
    
    const badge = document.getElementById('inbox-badge');
    if(badge) {
        if(msgs.length > 0) {
            badge.textContent = msgs.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Modify leaveMessage to save it so the user can read it
function leaveMessage(email) {
    const msg = prompt('Dejar mensaje en el tablón para ' + email + ':');
    if(msg) {
        const localMsgs = localStorage.getItem('user_messages_' + email);
        let msgs = localMsgs ? JSON.parse(localMsgs) : [];
        const today = new Date();
        msgs.push({
            date: today.toLocaleDateString(),
            text: msg
        });
        localStorage.setItem('user_messages_' + email, JSON.stringify(msgs));
        alert('Mensaje enviado a ' + email);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkInboxBadge, 1000);
});
'''

if 'USER PROFILE & INBOX LOGIC' not in js:
    js = js + extra_js

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
