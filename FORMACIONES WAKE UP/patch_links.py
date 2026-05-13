import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

arranque_btn = '''<div style="text-align: center; padding: 30px;">
                            <a href="https://chatgpt.com/g/g-69e40c8022448191ba407f2f46fddc9f-asistente-virtual-wake-up-empresa" target="_blank" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-size: 1.1rem; padding: 15px 30px;">
                                <i class='bx bx-bot' style="font-size: 1.5rem;"></i> Acceder al Asistente Virtual
                            </a>
                        </div>'''

desarrollo_btn = '''<div style="text-align: center; padding: 30px;">
                            <a href="https://chatgpt.com/g/g-6924e8365c5081919c3763099847aec2-asistente-virtual-aitor-dorronsoro" target="_blank" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-size: 1.1rem; padding: 15px 30px; background: #8b5cf6;">
                                <i class='bx bx-bot' style="font-size: 1.5rem;"></i> Acceder al Asistente Virtual
                            </a>
                        </div>'''

servicios_btn = '''<div style="text-align: center; padding: 30px;">
                            <a href="https://chatgpt.com/g/g-69b20e1245788191b59583ab86e903b6-asistente-virtual-aitor-dorronsoro-clientes" target="_blank" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-size: 1.1rem; padding: 15px 30px; background: #10b981;">
                                <i class='bx bx-bot' style="font-size: 1.5rem;"></i> Acceder al Asistente Virtual
                            </a>
                        </div>'''

equipo_btn = '''<div style="text-align: center; padding: 30px;">
                            <a href="https://chatgpt.com/g/g-6925e0a7fc8481918a9dec4cf43bdc82-asistente-ia-aitor-dorronsoro-equipo" target="_blank" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 10px; font-size: 1.1rem; padding: 15px 30px; background: #f59e0b;">
                                <i class='bx bx-bot' style="font-size: 1.5rem;"></i> Acceder al Asistente Virtual
                            </a>
                        </div>'''

html = re.sub(r'<p[^>]*>Asistente especializado en Arranque Inicial próximamente disponible.</p>', arranque_btn, html)
html = re.sub(r'<p[^>]*>Asistente especializado en Desarrollo Personal próximamente disponible.</p>', desarrollo_btn, html)
html = re.sub(r'<p[^>]*>Asistente especializado en Servicios y Clientes próximamente disponible.</p>', servicios_btn, html)
html = re.sub(r'<p[^>]*>Asistente especializado en Creación de Equipo próximamente disponible.</p>', equipo_btn, html)

# To handle cases where encoding may have been weird during the previous print but actually correct in the file:
# Let's also do a generic replacement if the above doesn't match due to exact accents.
html = re.sub(r'<p[^>]*>Asistente especializado en Arranque Inicial pr.*?disponible.</p>', arranque_btn, html)
html = re.sub(r'<p[^>]*>Asistente especializado en Desarrollo Personal pr.*?disponible.</p>', desarrollo_btn, html)
html = re.sub(r'<p[^>]*>Asistente especializado en Servicios y Clientes pr.*?disponible.</p>', servicios_btn, html)
html = re.sub(r'<p[^>]*>Asistente especializado en Creaci.*?n de Equipo pr.*?disponible.</p>', equipo_btn, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
