import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Admin button
admin_btn = '''<h2 id="section-title">Bienvenida</h2>
                <button id="btn-admin-panel" onclick="openAdminLogin()" class="btn-primary" style="margin-left: auto; display:flex; align-items:center; gap:8px; font-weight:bold; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); background: linear-gradient(135deg, #1e3a8a, #3b82f6);"><i class='bx bx-shield-quarter'></i> Acceso Administrador</button>'''
content = content.replace('<h2 id="section-title">Bienvenida</h2>', admin_btn)

# 2. Make user-info clickable
content = content.replace('<div class="user-info">', '<div class="user-info" onclick="openUserProfile()" style="cursor: pointer; transition: opacity 0.3s;" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1" title="Ver mi perfil">')

# 3. Add Inbox Block after hero-card
inbox_html = '''
                    <!-- Bandeja de Entrada -->
                    <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                        <div class="module-card glass-effect" style="display: flex; align-items: center; cursor: pointer; position: relative; padding: 25px; transition: transform 0.3s; border-left: 5px solid #eb5a46;" onclick="openInbox()" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                            <div style="font-size: 3.5rem; color: #eb5a46; position: relative; display: flex;">
                                <i class='bx bx-envelope'></i>
                                <span id="inbox-badge" class="hidden" style="position: absolute; top: -5px; right: -5px; background: #e11d48; color: white; border-radius: 50%; width: 24px; height: 24px; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">0</span>
                            </div>
                            <div style="margin-left: 20px;">
                                <h3 style="margin: 0; color: var(--primary-blue); font-size: 1.4rem;">Bandeja de Mensajes</h3>
                                <p style="margin: 5px 0 0; font-size: 0.95rem; color: #5e6c84;">Avisos importantes del administrador</p>
                            </div>
                        </div>
                    </div>
'''
content = content.replace('                    <!-- Motivos en Bienvenida -->', inbox_html + '\n                    <!-- Motivos en Bienvenida -->')

# 4. Add all Modals
modals_html = '''
    <!-- USER PROFILE MODAL -->
    <div id="user-profile-modal" class="modal-overlay hidden" style="z-index: 100000;">
        <div class="modal-box glass-effect" style="max-width: 500px; text-align: left;">
            <div class="modal-header-bar">
                <h3><i class='bx bx-user-circle'></i> Mi Perfil</h3>
                <button onclick="document.getElementById('user-profile-modal').classList.add('hidden')" class="btn-icon" style="font-size:1.8rem;"><i class='bx bx-x'></i></button>
            </div>
            <div class="modal-body-content" style="padding: 30px;">
                <div style="display: flex; justify-content: center; margin-bottom: 20px;">
                    <div id="profile-avatar-preview" style="width: 100px; height: 100px; border-radius: 50%; background: var(--primary-blue); color: white; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: bold; cursor: pointer; overflow: hidden; position: relative;" onclick="document.getElementById('profile-avatar-upload').click()">
                        <span id="profile-avatar-initial">?</span>
                        <div style="position: absolute; bottom: 0; background: rgba(0,0,0,0.5); width: 100%; text-align: center; padding: 2px; font-size: 0.7rem;"><i class='bx bx-camera'></i></div>
                        <img id="profile-avatar-img" src="" style="width: 100%; height: 100%; object-fit: cover; display: none;">
                    </div>
                    <input type="file" id="profile-avatar-upload" style="display: none;" accept="image/*" onchange="previewProfileAvatar(event)">
                </div>
                
                <div class="input-group" style="margin-bottom: 15px;">
                    <label style="display:block; margin-bottom: 5px; color: var(--text-secondary); font-size: 0.9rem;">Nombre y Apellidos</label>
                    <input type="text" id="profile-name" style="width:100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff;">
                </div>
                <div class="input-group" style="margin-bottom: 15px;">
                    <label style="display:block; margin-bottom: 5px; color: var(--text-secondary); font-size: 0.9rem;">Correo Electrónico (Tu ID principal)</label>
                    <input type="email" id="profile-email" style="width:100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff;" readonly title="El correo no se puede cambiar ya que es tu ID">
                </div>
                <div class="input-group" style="margin-bottom: 25px;">
                    <label style="display:block; margin-bottom: 5px; color: var(--text-secondary); font-size: 0.9rem;">Teléfono de Contacto</label>
                    <input type="tel" id="profile-phone" style="width:100%; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff;">
                </div>
                
                <button onclick="saveUserProfile()" class="btn-primary" style="width:100%;">Guardar Perfil <i class='bx bx-save'></i></button>
            </div>
        </div>
    </div>

    <!-- INBOX MODAL -->
    <div id="inbox-modal" class="modal-overlay hidden" style="z-index: 100000;">
        <div class="modal-box glass-effect" style="max-width: 600px; text-align: left;">
            <div class="modal-header-bar">
                <h3><i class='bx bx-envelope'></i> Bandeja de Mensajes</h3>
                <button onclick="document.getElementById('inbox-modal').classList.add('hidden')" class="btn-icon" style="font-size:1.8rem;"><i class='bx bx-x'></i></button>
            </div>
            <div id="inbox-messages-container" class="modal-body-content" style="padding: 20px; max-height: 60vh; overflow-y: auto;">
                <!-- Messages will be injected here -->
            </div>
        </div>
    </div>

    <!-- ADMIN LOGIN MODAL -->
    <div id="admin-login-modal" class="modal-overlay hidden" style="z-index: 100000;">
        <div class="modal-box glass-effect" style="max-width: 400px; text-align: center;">
            <div class="modal-header-bar">
                <h3>Acceso Administrador</h3>
                <button onclick="document.getElementById('admin-login-modal').classList.add('hidden')" class="btn-icon" style="font-size:1.8rem;"><i class='bx bx-x'></i></button>
            </div>
            <div class="modal-body-content" style="padding: 20px;">
                <input type="email" id="admin-email" placeholder="Correo electrónico" style="width:100%; margin-bottom: 15px; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff;">
                <input type="password" id="admin-password" placeholder="Contraseña" style="width:100%; margin-bottom: 20px; padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); color: #fff;">
                <button onclick="loginAdmin()" class="btn-primary" style="width:100%;">Entrar</button>
            </div>
        </div>
    </div>

    <!-- ADMIN DASHBOARD MODAL/FULLSCREEN -->
    <div id="admin-dashboard-container" class="hidden" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #f4f5f7; z-index: 200000; overflow-y: auto; color: #172b4d;">
        <div style="background: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e1e4e8; position: sticky; top: 0; z-index: 10;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <h2 style="color: #172b4d; margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;">
                    WAKE UP SERVICIOS
                </h2>
                <span style="background: #dfe1e6; color: #42526e; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">Owner <i class='bx bx-user'></i> <span id="admin-member-count">0</span></span>
            </div>
            <div style="display: flex; gap: 15px;">
                <button onclick="generateReferralLink()" class="btn-secondary" style="background: white; color: #42526e; border: 1px solid #dfe1e6; font-size: 0.9rem; padding: 8px 15px; border-radius: 4px; cursor: pointer;"><i class='bx bx-link'></i> Share Link</button>
                <button onclick="exportToExcel()" class="btn-secondary" style="background: white; color: #42526e; border: 1px solid #dfe1e6; font-size: 0.9rem; padding: 8px 15px; border-radius: 4px; cursor: pointer;"><i class='bx bx-download'></i> Export Excel</button>
                <button onclick="document.getElementById('admin-dashboard-container').classList.add('hidden')" class="btn-primary" style="background: #eb5a46; border: none; font-size: 0.9rem; padding: 8px 15px; border-radius: 4px; cursor: pointer; color: white;"><i class='bx bx-x'></i> Cerrar Panel</button>
            </div>
        </div>
        
        <div style="padding: 30px; max-width: 1400px; margin: 0 auto;">
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
                <div style="padding: 20px; border-bottom: 1px solid #e1e4e8; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #172b4d; font-size: 1.2rem;">Members List</h3>
                    <div style="position: relative;">
                        <input type="text" id="admin-search" placeholder="Search for someone on this Board" style="padding: 8px 12px 8px 35px; border-radius: 4px; border: 2px solid #dfe1e6; width: 350px; font-size: 0.9rem; background: #fafbfc;" onkeyup="filterAdminTable()">
                        <i class='bx bx-search' style="position: absolute; left: 12px; top: 12px; color: #7a869a;"></i>
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; color: #172b4d;" id="admin-members-table">
                        <thead>
                            <tr style="border-bottom: 2px solid #dfe1e6; color: #5e6c84; font-size: 0.85rem; background: #fafbfc;">
                                <th style="padding: 15px 20px; font-weight: 600;">Email</th>
                                <th style="padding: 15px 20px; font-weight: 600;">Name</th>
                                <th style="padding: 15px 20px; font-weight: 600;">Status</th>
                                <th style="padding: 15px 20px; font-weight: 600;">Date Added</th>
                                <th style="padding: 15px 20px; font-weight: 600;">Role</th>
                                <th style="padding: 15px 20px; font-weight: 600; text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="admin-table-body">
                            <!-- JS -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- REGISTRATION SCREEN (REPLACES LOGIN WHEN REF IS PRESENT) -->
    <div id="register-screen" class="login-container hidden">
        <div class="login-box glass-effect">
            <div class="login-header">
                <i class='bx bx-user-plus login-logo'></i>
                <h1>Solicitar Acceso</h1>
                <p>Estás siendo invitado a unirte a Wake Up Servicios. Completa tus datos para solicitar acceso.</p>
            </div>
            <form id="register-form">
                <div class="input-group">
                    <i class='bx bx-user'></i>
                    <input type="text" id="reg-name" placeholder="Nombre completo" required>
                </div>
                <div class="input-group">
                    <i class='bx bx-envelope'></i>
                    <input type="email" id="reg-email" placeholder="Correo electrónico" required>
                </div>
                <button type="button" onclick="submitRegistration()" class="btn-primary" style="margin-top: 15px; width: 100%;">Enviar Solicitud <i class='bx bx-check'></i></button>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="#" onclick="window.location.href='index.html'" style="color: rgba(255,255,255,0.7); font-size: 0.9rem; text-decoration: underline;">Ya tengo cuenta (Iniciar sesión)</a>
                </div>
            </form>
        </div>
    </div>

</body>'''

content = content.replace('</body>', modals_html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

# Style CSS
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

if 'display: flex;' not in css.split('.top-header {')[1].split('}')[0]:
    css = css.replace('.top-header {\n    margin-bottom: 30px;\n}', '.top-header {\n    margin-bottom: 30px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}')

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)
