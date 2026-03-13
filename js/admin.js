/**
 * AGOGE ELITE - Admin Dashboard Module
 */

export const updateAdminDashboard = async (api, nextSundayKey) => {
    const adminUserList = document.getElementById('adminUserList');
    const adminEnrollList = document.getElementById('adminEnrollList');
    const adminAforoCount = document.getElementById('adminAforoCount');
    const adminAforoProgress = document.getElementById('adminAforoProgress');
    
    if (!adminUserList || !adminEnrollList) return;

    const allUsers = await api.getUsers();
    const dbEnrollments = await api.getEnrollments();
    const enrolledIdentifiers = dbEnrollments[nextSundayKey] || [];

    // Capacity Aforo Logic (20 slots)
    const maxAforo = 20;
    const currentCount = enrolledIdentifiers.length;
    if (adminAforoCount) adminAforoCount.textContent = `${currentCount} / ${maxAforo}`;
    if (adminAforoProgress) adminAforoProgress.style.width = `${(currentCount / maxAforo) * 100}%`;

    // Users List
    adminUserList.innerHTML = allUsers.map(u => {
        const isEnrolled = enrolledIdentifiers.some(e => e.user_id === u.id);
        return `
            <div class="admin-item">
                <div class="admin-item__info">
                    <span class="admin-item__name">${u.callsign || u.name} <small style="opacity:0.5; font-size:0.7em;">(${u.name})</small></span>
                    <span class="admin-item__sub">${u.email} — ${u.clan || 'sin clan'}</span>
                </div>
                <div class="admin-item__actions">
                    <button class="btn btn--primary btn--xs" onclick="window.adminEnrollUser('${u.id}', '${u.email}')" ${isEnrolled ? 'disabled' : ''}>
                        ${isEnrolled ? 'INSCRITO' : 'INSCRIBIR'}
                    </button>
                </div>
            </div>
        `;
    }).join('') || '<p style="padding:15px; color:#666; font-size:0.8rem;">No hay usuarios registrados.</p>';

    // Enrollment List (including guests)
    adminEnrollList.innerHTML = enrolledIdentifiers.map(entry => {
        const u = entry.is_guest ? { name: entry.guest_name, gear: entry.gear } : (allUsers.find(user => user.id === entry.user_id) || { name: entry.user_email, gear: entry.gear });
        const gearMap = { 'own': 'PROPIA', 'complete': 'COMPLETO', 'replica': 'RÉPLICA', 'basic': 'BÁSICO' };
        const gearStr = u?.gear ? `<span style="color:var(--bronze); font-size:0.7em;">(${gearMap[u.gear] || 'N/A'})</span>` : '';
        return `
            <div class="admin-item">
                <div class="admin-item__info">
                    <span class="admin-item__name">${u.callsign || u.name} ${gearStr}</span>
                    <span class="admin-item__sub">${entry.is_guest ? 'INVITADO' : entry.user_email}</span>
                </div>
                <button class="btn btn--outline btn--xs" onclick="window.adminUnenrollUser('${entry.id}')">BORRAR</button>
            </div>
        `;
    }).join('') || '<p style="padding:15px; color:#666; font-size:0.8rem;">Nadie inscrito todavía.</p>';
};

export const downloadManifesto = async (api, nextSundayKey) => {
    const dbEnrollments = await api.getEnrollments();
    const list = dbEnrollments[nextSundayKey] || [];
    const allUsers = await api.getUsers();

    let manifest = `MANIFESTO AGOGE ELITE - ${nextSundayKey}\n`;
    manifest += `TOTAL INSCRITOS: ${list.length}\n`;
    manifest += `------------------------------------------\n`;

    list.forEach((entry, i) => {
        const u = entry.is_guest ? { name: entry.guest_name, gear: entry.gear } : (allUsers.find(x => x.id === entry.user_id) || { name: entry.user_email, gear: entry.gear });
        const gearMap = { 'own': 'PROPIA', 'complete': 'COMPLETO', 'replica': 'RÉPLICA', 'basic': 'BÁSICO' };
        const gearStr = gearMap[entry.gear || 'own'];
        manifest += `${i + 1}. ${u?.callsign || 'N/A'} (${u?.name || entry.user_email}) - ${gearStr}\n`;
    });

    const blob = new Blob([manifest], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manifesto_agoge_${nextSundayKey}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const setupMissionConfig = async (api, nextSundayKey) => {
    const form = document.getElementById('adminMissionForm');
    if (!form) return;

    // Load current settings
    const settings = await api.getMissionSettings(nextSundayKey);
    if (settings) {
        document.getElementById('confSituation').value = settings.situation || '';
        document.getElementById('confMission').value = settings.mission || '';
        document.getElementById('confGear').value = settings.gear_rules || '';
        document.getElementById('confMap').value = settings.map_url || '';
        document.getElementById('confMode').value = settings.game_mode || 'tdm';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const missionData = {
            sun_key: nextSundayKey,
            situation: document.getElementById('confSituation').value,
            mission: document.getElementById('confMission').value,
            gear_rules: document.getElementById('confGear').value,
            map_url: document.getElementById('confMap').value,
            game_mode: document.getElementById('confMode').value
        };

        const success = await api.saveMissionSettings(missionData);
        if (success) {
            alert('¡Misión publicada con éxito!');
            window.location.reload(); // Simple way to refresh all components
        } else {
            alert('Error al publicar la misión. Verifica los permisos.');
        }
    });
};
