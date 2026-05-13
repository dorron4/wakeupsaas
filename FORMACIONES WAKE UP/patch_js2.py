import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Look for the broken innerHTML block starting from `tr.innerHTML =` to the end of the `deleteMember` button
broken_block_start = "tr.innerHTML ="
broken_block_end = "<button onclick=\"deleteMember( + index + )\" style=\"background:transparent; color:#eb5a46; border:none; cursor:pointer; font-size:1.2rem;\"><i class='bx bx-trash'></i></button>"

start_idx = js.find(broken_block_start)
end_idx = js.find(broken_block_end)

if start_idx != -1 and end_idx != -1:
    # We need to replace everything between start_idx and end_idx + len(broken_block_end)
    # Wait, the broken code also has a `\n        `; at the end?
    end_idx = js.find(";", end_idx) + 1
    
    # We also need to fix exportToExcel:
    # csv += `"${m.email}","${m.name}","${m.status}","${m.dateAdded}","${m.role}"\n`;
    # In powershell it became:
    # csv += "${m.email}","${m.name}","${m.status}","${m.dateAdded}","${m.role}"\n;
    
    # Let's just fix the whole ADMIN PANEL LOGIC part by replacing the whole thing.
    
    admin_logic_start = "/* ==========================================================\n   ADMIN PANEL LOGIC"
    admin_logic_end = "/* ==========================================================\n   USER PROFILE & INBOX LOGIC"
    
    idx1 = js.find(admin_logic_start)
    idx2 = js.find(admin_logic_end)
    
    if idx1 != -1 and idx2 != -1:
        correct_admin_logic = """/* ==========================================================
   ADMIN PANEL LOGIC
   ========================================================== */
let adminMembers = [];

function openAdminLogin() {
    document.getElementById('admin-login-modal').classList.remove('hidden');
}

function loginAdmin() {
    const email = document.getElementById('admin-email').value;
    const pwd = document.getElementById('admin-password').value;
    if(email === 'aitordorronsoro@gmail.com' && pwd === 'Megustaelchocolate6@') {
        document.getElementById('admin-login-modal').classList.add('hidden');
        document.getElementById('admin-dashboard-container').classList.remove('hidden');
        loadAdminData();
    } else {
        alert('Credenciales incorrectas.');
    }
}

async function loadAdminData() {
    try {
        const res = await fetch('api.php');
        if(res.ok) {
            adminMembers = await res.json();
        } else {
            throw new Error('Fallback to local');
        }
    } catch(e) {
        console.warn('Usando localStorage como fallback', e);
        const local = localStorage.getItem('admin_members');
        if(local) {
            adminMembers = JSON.parse(local);
        } else {
            adminMembers = [
                {email: "kaimartinez48@gmail.com", name: "Kai Martinez", status: "JOINED", dateAdded: "11/05/2026", role: "Can View & Add Members"},
                {email: "fernando.ramirezhernando@hotmail.com", name: "Fernando Ramirez", status: "INVITED", dateAdded: "05/05/2026", role: "Can View & Add Members"}
            ];
        }
    }
    renderAdminTable();
}

async function saveAdminData() {
    try {
        const res = await fetch('api.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({action: 'save', members: adminMembers})
        });
        if(!res.ok) throw new Error('API Fail');
    } catch(e) {
        localStorage.setItem('admin_members', JSON.stringify(adminMembers));
    }
    renderAdminTable();
}

function renderAdminTable(filterText = '') {
    const tbody = document.getElementById('admin-table-body');
    const countSpan = document.getElementById('admin-member-count');
    tbody.innerHTML = '';
    
    let filtered = adminMembers;
    if(filterText) {
        const text = filterText.toLowerCase();
        filtered = adminMembers.filter(m => (m.name && m.name.toLowerCase().includes(text)) || m.email.toLowerCase().includes(text));
    }
    
    countSpan.textContent = filtered.length;

    filtered.forEach((m, index) => {
        // Status Badge Style
        let statusStyle = 'background: #e3fcef; color: #006644;'; // JOINED green
        if(m.status === 'INVITED' || m.status === 'PENDING') {
            statusStyle = 'background: #fffae6; color: #ff8b00;'; // orange
        }

        const initial = m.name ? m.name.charAt(0).toUpperCase() : '?';
        const avatarColor = 'hsl(' + (m.email.length * 20 % 360) + ', 70%, 60%)';

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #dfe1e6';
        tr.innerHTML = `
            <td style="padding: 15px 20px; display: flex; align-items: center; gap: 15px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: ${avatarColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">${initial}</div>
                <span style="font-weight: 500;">${m.email}</span>
            </td>
            <td style="padding: 15px 20px; color: #5e6c84;">${m.name || 'N/A'}</td>
            <td style="padding: 15px 20px;">
                <span style="${statusStyle} padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; display: inline-block;">${m.status}</span>
            </td>
            <td style="padding: 15px 20px; color: #5e6c84;">${m.dateAdded}</td>
            <td style="padding: 15px 20px;">
                <select onchange="changeRole(${index}, this.value)" style="background: #fafbfc; border: 1px solid #dfe1e6; border-radius: 4px; padding: 6px 12px; color: #172b4d; font-size: 0.85rem; font-family: inherit; font-weight: 500; cursor: pointer; appearance: none; -webkit-appearance: none; padding-right: 25px; background-image: url('data:image/svg+xml;utf8,<svg fill=%22%235e6c84%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>'); background-repeat: no-repeat; background-position-x: 100%; background-position-y: 50%;">
                    <option value="Can View & Add Members" ${m.role === 'Can View & Add Members' ? 'selected' : ''}>Can View & Add Members</option>
                    <option value="Can Edit" ${m.role === 'Can Edit' ? 'selected' : ''}>Can Edit</option>
                    <option value="Can View" ${m.role === 'Can View' ? 'selected' : ''}>Can View</option>
                </select>
            </td>
            <td style="padding: 15px 20px; text-align: right;">
                ${m.status === 'PENDING' ? `<button onclick="acceptMember(${index})" style="background:#0052cc; color:white; border:none; border-radius:4px; padding:6px 12px; cursor:pointer; font-size:0.85rem; margin-right:5px;"><i class='bx bx-check'></i> Aceptar</button>` : ``}
                <button onclick="leaveMessage('${m.email}')" style="background:transparent; color:#5e6c84; border:none; cursor:pointer; font-size:1.2rem; margin-right: 10px;"><i class='bx bx-message-square-detail'></i></button>
                <button onclick="deleteMember(${index})" style="background:transparent; color:#eb5a46; border:none; cursor:pointer; font-size:1.2rem;"><i class='bx bx-trash'></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterAdminTable() {
    renderAdminTable(document.getElementById('admin-search').value);
}

function changeRole(index, newRole) {
    adminMembers[index].role = newRole;
    saveAdminData();
}

function deleteMember(index) {
    if(confirm('¿Seguro que quieres eliminar a ' + adminMembers[index].email + '?')) {
        adminMembers.splice(index, 1);
        saveAdminData();
    }
}

function acceptMember(index) {
    adminMembers[index].status = 'JOINED';
    saveAdminData();
}

function generateReferralLink() {
    const link = window.location.origin + window.location.pathname + '?ref=aitor';
    navigator.clipboard.writeText(link).then(() => {
        alert('Enlace de referido copiado al portapapeles: ' + link);
    });
}

function exportToExcel() {
    let csv = 'Email,Name,Status,Date Added,Role\\n';
    adminMembers.forEach(m => {
        csv += `"${m.email}","${m.name}","${m.status}","${m.dateAdded}","${m.role}"\\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'miembros_wakeup.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// CHECK URL PARAMETERS FOR REFERRAL
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('ref')) {
        // Show register instead of login
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('register-screen').classList.remove('hidden');
    }
});

async function submitRegistration() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    
    if(!name || !email) { alert('Por favor, rellena todos los campos'); return; }
    
    // Attempt to save to API
    try {
        let members = [];
        const res = await fetch('api.php');
        if(res.ok) members = await res.json();
        else {
            const loc = localStorage.getItem('admin_members');
            if(loc) members = JSON.parse(loc);
        }
        
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        
        members.push({
            email: email,
            name: name,
            status: "PENDING",
            dateAdded: dd + '/' + mm + '/' + yyyy,
            role: "Can View"
        });
        
        const saveRes = await fetch('api.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({action: 'save', members: members})
        });
        if(!saveRes.ok) throw new Error('API Fail');
    } catch(e) {
        // Fallback local
        const loc = localStorage.getItem('admin_members');
        let members = loc ? JSON.parse(loc) : [];
        members.push({
            email: email,
            name: name,
            status: "PENDING",
            dateAdded: "01/01/2026",
            role: "Can View"
        });
        localStorage.setItem('admin_members', JSON.stringify(members));
    }
    
    alert('Solicitud enviada correctamente. El administrador revisar tu solicitud.');
    window.location.href = window.location.pathname; // remove ?ref
}

\n"""
        js = js[:idx1] + correct_admin_logic + js[idx2:]
        
with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
