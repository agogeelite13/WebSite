/**
 * AGOGE ELITE - Admin Dashboard Module (v2 - Bulletproof)
 *
 * All actions have console.log for debug verification.
 * Exported functions: updateAdminDashboard, downloadManifesto,
 *   setupMissionConfig, renderAdminPhotos, attachAdminGlobals
 */

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD: Renders users list + enrollment list
// ─────────────────────────────────────────────────────────────────────────────
export const updateAdminDashboard = async (api, nextSundayKey) => {
    console.log('[ADMIN] updateAdminDashboard called for key:', nextSundayKey);

    const adminUserList   = document.getElementById('adminUserList');
    const adminEnrollList = document.getElementById('adminEnrollList');
    const adminAforoCount    = document.getElementById('adminAforoCount');
    const adminAforoProgress = document.getElementById('adminAforoProgress');

    if (!adminUserList || !adminEnrollList) {
        console.warn('[ADMIN] adminUserList or adminEnrollList not found in DOM – skipping.');
        return;
    }

    const allUsers           = await api.getUsers();
    const dbEnrollments      = await api.getEnrollments();
    const enrolledIdentifiers = dbEnrollments[nextSundayKey] || [];

    console.log('[ADMIN] Users loaded:', allUsers.length);
    console.log('[ADMIN] Enrolled for', nextSundayKey, ':', enrolledIdentifiers.length);

    // Capacity bar
    const maxAforo    = 20;
    const currentCount = enrolledIdentifiers.length;
    if (adminAforoCount)    adminAforoCount.textContent    = `${currentCount} / ${maxAforo}`;
    if (adminAforoProgress) adminAforoProgress.style.width = `${Math.min((currentCount / maxAforo) * 100, 100)}%`;

    // ── Users list (with INSCRIBIR button) ──────────────────────────────────
    if (allUsers.length === 0) {
        adminUserList.innerHTML = '<tr><td colspan="4" style="padding:15px;color:#666;font-size:0.8rem;">No hay usuarios registrados.</td></tr>';
    } else {
        adminUserList.innerHTML = allUsers.map(u => {
            const isEnrolled = enrolledIdentifiers.some(e => e.user_id === u.id);
            return `
                <tr>
                    <td>${u.callsign || u.name || '—'} <small style="opacity:.5">(${u.name || ''})</small></td>
                    <td>${u.specialty || '—'}</td>
                    <td style="color:${isEnrolled ? '#2ecc71' : '#aaa'}">${isEnrolled ? '✔ INSCRITO' : '—'}</td>
                    <td>
                        <button
                            class="btn btn--primary btn--xs admin-enroll-btn"
                            data-uid="${u.id}"
                            data-email="${u.email}"
                            ${isEnrolled ? 'disabled' : ''}
                        >${isEnrolled ? 'INSCRITO' : 'INSCRIBIR'}</button>
                    </td>
                </tr>`;
        }).join('');
    }

    // ── Enrolled list (with ASISTIÓ + BORRAR buttons) ───────────────────────
    if (enrolledIdentifiers.length === 0) {
        adminEnrollList.innerHTML = '<p style="padding:15px;color:#666;font-size:0.8rem;">Nadie inscrito todavía.</p>';
    } else {
        const gearMap = { own: 'PROPIA', complete: 'COMPLETO', replica: 'RÉPLICA', basic: 'BÁSICO' };
        adminEnrollList.innerHTML = enrolledIdentifiers.map(entry => {
            const u = entry.is_guest
                ? { callsign: entry.guest_name, name: entry.guest_name, gear: entry.gear }
                : (allUsers.find(user => user.id === entry.user_id) || { callsign: entry.user_email, name: entry.user_email, gear: entry.gear });
            const gearStr    = u?.gear ? `<span style="color:var(--bronze);font-size:.7em;">(${gearMap[u.gear] || 'N/A'})</span>` : '';
            const hasAttended = entry.attended === true || (Array.isArray(u?.mission_history) && u.mission_history.includes(nextSundayKey));

            return `
                <div class="admin-item">
                    <div class="admin-item__info">
                        <span class="admin-item__name">${u.callsign || u.name} ${gearStr}</span>
                        <span class="admin-item__sub">${entry.is_guest ? 'INVITADO' : entry.user_email}</span>
                    </div>
                    <div class="admin-item__actions" style="display:flex;gap:5px;">
                        ${!entry.is_guest ? `
                            <button class="btn btn--primary btn--xs admin-attendance-btn"
                                data-uid="${entry.user_id}"
                                data-sunkey="${nextSundayKey}"
                                data-enrollid="${entry.id}"
                                ${hasAttended ? 'disabled' : ''}>
                                ${hasAttended ? 'CONFIRMADO' : 'ASISTIÓ'}
                            </button>` : ''}
                        <button class="btn btn--outline btn--xs admin-unenroll-btn"
                            data-enrollid="${entry.id}">
                            BORRAR
                        </button>
                    </div>
                </div>`;
        }).join('');
    }

    // ── Attach event listeners (replaces window.onclick handlers) ───────────
    _attachDashboardListeners(api, nextSundayKey);
};

// Attaches click handlers to dynamically-rendered admin buttons
const _attachDashboardListeners = (api, nextSundayKey) => {
    // INSCRIBIR buttons
    document.querySelectorAll('.admin-enroll-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId = btn.dataset.uid;
            const email  = btn.dataset.email;
            console.log('[ADMIN] Enrolling user:', userId, email);
            btn.disabled = true;
            btn.textContent = '...';
            const ok = await api.enroll(nextSundayKey, userId, email, 'own');
            if (ok) {
                console.log('[ADMIN] Enroll SUCCESS');
                updateAdminDashboard(api, nextSundayKey);
            } else {
                console.error('[ADMIN] Enroll FAILED');
                alert('Error al inscribir. Revisa los permisos en Supabase (ver SQL admin_fix_v2.sql).');
                btn.disabled = false;
                btn.textContent = 'INSCRIBIR';
            }
        });
    });

    // ASISTIÓ buttons
    document.querySelectorAll('.admin-attendance-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId   = btn.dataset.uid;
            const sunKey   = btn.dataset.sunkey;
            console.log('[ADMIN] Confirming attendance for user:', userId, 'mission:', sunKey);
            btn.disabled = true;
            btn.textContent = '...';
            const user = await api.getProfile(userId);
            if (!user) {
                console.error('[ADMIN] getProfile returned null for', userId);
                alert('No se encontró el perfil del usuario.');
                return;
            }
            const history = Array.isArray(user.mission_history) ? user.mission_history : [];
            if (!history.includes(sunKey)) history.push(sunKey);
            const newExp = (user.exp || 0) + 100;
            const ok = await api.saveProfile({ ...user, exp: newExp, mission_history: history });
            if (ok) {
                console.log('[ADMIN] Attendance confirmed. New XP:', newExp);
                btn.textContent = 'CONFIRMADO';
                updateAdminDashboard(api, nextSundayKey);
            } else {
                console.error('[ADMIN] Attendance save FAILED');
                alert('Error al guardar asistencia. Revisa los permisos en Supabase.');
                btn.disabled = false;
                btn.textContent = 'ASISTIÓ';
            }
        });
    });

    // BORRAR (unenroll) buttons
    document.querySelectorAll('.admin-unenroll-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const enrollmentId = btn.dataset.enrollid;
            console.log('[ADMIN] Unenrolling entry id:', enrollmentId);
            btn.disabled = true;
            btn.textContent = '...';
            const ok = await api.unenroll(enrollmentId);
            if (ok) {
                console.log('[ADMIN] Unenroll SUCCESS');
                updateAdminDashboard(api, nextSundayKey);
            } else {
                console.error('[ADMIN] Unenroll FAILED');
                alert('Error al borrar inscripción. Revisa los permisos en Supabase.');
                btn.disabled = false;
                btn.textContent = 'BORRAR';
            }
        });
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// MANIFESTO DOWNLOAD
// ─────────────────────────────────────────────────────────────────────────────
export const downloadManifesto = async (api, nextSundayKey) => {
    console.log('[ADMIN] downloadManifesto for:', nextSundayKey);
    const dbEnrollments = await api.getEnrollments();
    const list          = dbEnrollments[nextSundayKey] || [];
    const allUsers      = await api.getUsers();
    const gearMap       = { own: 'PROPIA', complete: 'COMPLETO', replica: 'RÉPLICA', basic: 'BÁSICO' };

    let manifest  = `MANIFESTO AGOGE ELITE - ${nextSundayKey}\n`;
    manifest     += `TOTAL INSCRITOS: ${list.length}\n`;
    manifest     += `------------------------------------------\n`;

    list.forEach((entry, i) => {
        const u = entry.is_guest
            ? { callsign: entry.guest_name, name: entry.guest_name, gear: entry.gear }
            : (allUsers.find(x => x.id === entry.user_id) || { callsign: '—', name: entry.user_email, gear: entry.gear });
        const gearStr = gearMap[entry.gear || 'own'] || 'N/A';
        manifest += `${i + 1}. ${u?.callsign || 'N/A'} (${u?.name || entry.user_email}) - ${gearStr}\n`;
    });

    const blob = new Blob([manifest], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `manifesto_agoge_${nextSundayKey}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────────
// MISSION CONFIG FORM
// ─────────────────────────────────────────────────────────────────────────────
export const setupMissionConfig = async (api, nextSundayKey) => {
    console.log('[ADMIN] setupMissionConfig for:', nextSundayKey);
    const form = document.getElementById('adminMissionForm');
    if (!form) return;

    // Prevent double-binding if called multiple times
    if (form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    // Load current settings
    const settings = await api.getMissionSettings(nextSundayKey);
    if (settings) {
        console.log('[ADMIN] Loaded mission settings:', settings);
        const el = id => document.getElementById(id);
        if (el('confSituation')) el('confSituation').value = settings.situation  || '';
        if (el('confMission'))   el('confMission').value   = settings.mission    || '';
        if (el('confGear'))      el('confGear').value      = settings.gear_rules || '';
        if (el('confMap'))       el('confMap').value       = settings.map_url    || '';
        if (el('confMode'))      el('confMode').value      = settings.game_mode  || 'tdm';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const el = id => document.getElementById(id);
        const missionData = {
            sun_key:   nextSundayKey,
            situation: el('confSituation')?.value || '',
            mission:   el('confMission')?.value   || '',
            gear_rules: el('confGear')?.value     || '',
            map_url:   el('confMap')?.value        || '',
            game_mode: el('confMode')?.value       || 'tdm'
        };
        console.log('[ADMIN] Saving mission config:', missionData);

        const btn      = form.querySelector('[type="submit"]');
        const feedback = document.getElementById('configFeedback');
        if (btn) btn.disabled = true;

        const success = await api.saveMissionSettings(missionData);
        if (success) {
            console.log('[ADMIN] Mission saved OK');
            if (feedback) { feedback.style.display = 'block'; feedback.style.color = '#2ecc71'; feedback.textContent = '✔ OPORD publicada con éxito.'; }
            else alert('¡Misión publicada con éxito!');
        } else {
            console.error('[ADMIN] Mission save FAILED');
            if (feedback) { feedback.style.display = 'block'; feedback.style.color = 'var(--blood)'; feedback.textContent = '✖ Error al guardar. Revisa permisos Supabase.'; }
            else alert('Error al publicar la misión. Revisa los permisos en Supabase (admin_fix_v2.sql).');
        }
        if (btn) btn.disabled = false;
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO MODERATION
// ─────────────────────────────────────────────────────────────────────────────
export const renderAdminPhotos = async (api) => {
    console.log('[ADMIN] renderAdminPhotos called');
    const photoList = document.getElementById('adminPhotoList');
    if (!photoList) return;

    photoList.innerHTML = '<div style="text-align:center;font-size:.8rem;color:var(--text-muted);padding:10px;">Cargando inteligencia...</div>';

    const photos = await api.getCommunityPhotos('pending');
    console.log('[ADMIN] Pending photos:', photos.length);

    if (photos.length === 0) {
        photoList.innerHTML = '<div style="text-align:center;font-size:.8rem;color:var(--text-muted);padding:20px;">No hay archivos visuales pendientes de revisión.</div>';
        return;
    }

    photoList.innerHTML = '';
    photos.forEach(photo => {
        const div = document.createElement('div');
        div.className = 'admin-item';
        div.style.cssText = 'flex-direction:column;align-items:stretch;padding:10px;background:rgba(0,0,0,.5);margin-bottom:10px;';
        div.innerHTML = `
            <img src="${photo.image_url}" alt="Intel"
                 style="width:100%;height:150px;object-fit:cover;border:1px solid var(--border);border-radius:4px;margin-bottom:10px;">
            <div style="font-size:.75rem;color:var(--text-muted);margin-bottom:5px;">
                <span style="color:var(--bronze-light);">OP:</span> ${photo.user_id}
            </div>
            <div style="font-size:.8rem;line-height:1.2;margin-bottom:15px;">"${photo.caption || ''}"</div>
            <div style="display:flex;justify-content:space-between;gap:8px;">
                <button class="btn btn--xs photo-reject-btn"
                    data-id="${photo.id}"
                    style="background:var(--blood);color:var(--white);flex:1;">DENEGAR</button>
                <button class="btn btn--outline btn--xs photo-approve-btn"
                    data-id="${photo.id}"
                    style="border-color:#2ecc71;color:#2ecc71;flex:1;">APROBAR</button>
            </div>`;
        photoList.appendChild(div);
    });

    // Attach listeners
    photoList.querySelectorAll('.photo-approve-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            console.log('[ADMIN] Approving photo id:', id);
            btn.disabled = true; btn.textContent = '...';
            const ok = await api.updateCommunityPhotoStatus(id, 'approved');
            if (ok) { console.log('[ADMIN] Photo approved'); renderAdminPhotos(api); }
            else    { alert('Error al aprobar foto.'); btn.disabled = false; btn.textContent = 'APROBAR'; }
        });
    });

    photoList.querySelectorAll('.photo-reject-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            console.log('[ADMIN] Rejecting photo id:', id);
            btn.disabled = true; btn.textContent = '...';
            const ok = await api.updateCommunityPhotoStatus(id, 'rejected');
            if (ok) { console.log('[ADMIN] Photo rejected'); renderAdminPhotos(api); }
            else    { alert('Error al denegar foto.'); btn.disabled = false; btn.textContent = 'DENEGAR'; }
        });
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// ATTACH GLOBAL HANDLERS (for manual enrollment form in admin.html)
// ─────────────────────────────────────────────────────────────────────────────
export const attachAdminGlobals = (api, nextSundayKey) => {
    console.log('[ADMIN] attachAdminGlobals called. sunKey:', nextSundayKey);

    // Manual enrollment form button (in admin.html HTML)
    const manualEnrollBtn = document.querySelector('[onclick*="adminEnrollUser"]');
    if (manualEnrollBtn) {
        // Remove inline onclick and replace with event listener
        manualEnrollBtn.removeAttribute('onclick');
        manualEnrollBtn.addEventListener('click', async () => {
            const userId = document.getElementById('manualEnrollId')?.value?.trim();
            const email  = document.getElementById('manualEnrollEmail')?.value?.trim();
            if (!userId) return alert('Rellena al menos el Nombre/ID del operador.');
            console.log('[ADMIN] Manual enroll:', userId, email);
            manualEnrollBtn.disabled = true;
            manualEnrollBtn.textContent = '...';
            
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
            
            let finalUserId = null;
            let finalEmail = email;

            if (isUUID) {
                finalUserId = userId;
            } else {
                // Smart search: Check if this name/email matches an existing account
                const usersList = await api.getUsers();
                const qId = userId.toLowerCase();
                const qEmail = email ? email.toLowerCase() : '';
                
                const matchedUser = usersList.find(u => 
                    (qEmail && u.email && u.email.toLowerCase() === qEmail) ||
                    (qId && u.callsign && u.callsign.toLowerCase() === qId) ||
                    (qId && u.name     && u.name.toLowerCase()     === qId)
                );

                if (matchedUser) {
                    console.log('[ADMIN] Matched manual input to existing user:', matchedUser.id);
                    finalUserId = matchedUser.id;
                    finalEmail  = matchedUser.email;
                }
            }

            let ok;
            if (finalUserId) {
                // We have a real user ID
                ok = await api.enroll(nextSundayKey, finalUserId, finalEmail || 'manual@agoge.local', 'own');
            } else {
                // Definitely a guest
                ok = await api.enrollGuest(nextSundayKey, userId, email || 'Invitado', 'own');
            }
            
            if (ok) {
                console.log('[ADMIN] Manual enroll SUCCESS');
                document.getElementById('manualEnrollId').value   = '';
                document.getElementById('manualEnrollEmail').value = '';
                updateAdminDashboard(api, nextSundayKey);
            } else {
                console.error('[ADMIN] Manual enroll FAILED');
                alert('Error al inscribir. Revisa los permisos en Supabase (admin_fix_v2.sql).');
            }
            manualEnrollBtn.disabled = false;
            manualEnrollBtn.textContent = 'Inscribir';
        });
    }

    // Also keep window globals as fallback for any remaining onclick= attrs
    window.adminEnrollUser = async (userId, email) => {
        console.log('[ADMIN][window] adminEnrollUser:', userId, email);
        const ok = await api.enroll(nextSundayKey, userId, email, 'own');
        if (ok) updateAdminDashboard(api, nextSundayKey);
        else alert('Error al inscribir usuario.');
    };

    window.adminUnenrollUser = async (enrollmentId) => {
        console.log('[ADMIN][window] adminUnenrollUser:', enrollmentId);
        const ok = await api.unenroll(enrollmentId);
        if (ok) updateAdminDashboard(api, nextSundayKey);
        else alert('Error al borrar inscripción.');
    };

    window.adminConfirmAttendance = async (userId, sunKey) => {
        console.log('[ADMIN][window] adminConfirmAttendance:', userId, sunKey);
        const user = await api.getProfile(userId);
        if (!user) return alert('Perfil no encontrado.');
        const history = Array.isArray(user.mission_history) ? user.mission_history : [];
        if (!history.includes(sunKey)) history.push(sunKey);
        const newExp = (user.exp || 0) + 100;
        const ok = await api.saveProfile({ ...user, exp: newExp, mission_history: history });
        if (ok) updateAdminDashboard(api, nextSundayKey);
        else alert('Error al guardar asistencia. Revisa los permisos en Supabase.');
    };
};
