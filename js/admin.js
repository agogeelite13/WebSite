/**
 * AGOGE ELITE - Admin Dashboard Module (v2 - Bulletproof)
 *
 * All actions have console.log for debug verification.
 * Exported functions: updateAdminDashboard, downloadManifesto,
 *   setupMissionConfig, renderAdminPhotos, attachAdminGlobals
 */

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// DASHBOARD: Renders users list + enrollment list
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const updateAdminDashboard = async (api, nextSundayKey) => {

    const adminUserList   = document.getElementById('adminUserList');
    const adminEnrollList = document.getElementById('adminEnrollList');
    const adminAforoCount    = document.getElementById('adminAforoCount');
    const adminAforoProgress = document.getElementById('adminAforoProgress');

    if (!adminUserList || !adminEnrollList) {
        console.warn('[ADMIN] adminUserList or adminEnrollList not found in DOM â€“ skipping.');
        return;
    }

    const allUsers           = await api.getUsers();
    const dbEnrollments      = await api.getEnrollments();
    const enrolledIdentifiers = dbEnrollments[nextSundayKey] || [];


    // Capacity bar
    const maxAforo    = 20;
    const currentCount = enrolledIdentifiers.length;
    if (adminAforoCount)    adminAforoCount.textContent    = `${currentCount} / ${maxAforo}`;
    if (adminAforoProgress) adminAforoProgress.style.width = `${Math.min((currentCount / maxAforo) * 100, 100)}%`;

    // â”€â”€ Users list (with INSCRIBIR button) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (allUsers.length === 0) {
        adminUserList.innerHTML = '<tr><td colspan="4" style="padding:15px;color:#666;font-size:0.8rem;">No hay usuarios registrados.</td></tr>';
    } else {
        adminUserList.innerHTML = allUsers.map(u => {
            const isEnrolled = enrolledIdentifiers.some(e => e.user_id === u.id);
            return `
                <tr>
                    <td>${u.callsign || u.name || 'â€”'} <small style="opacity:.5">(${u.name || ''})</small></td>
                    <td>${u.specialty || 'â€”'}</td>
                    <td style="color:${isEnrolled ? '#2ecc71' : '#aaa'}">${isEnrolled ? 'âœ” INSCRITO' : 'â€”'}</td>
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

    // â”€â”€ Enrolled list (with ASISTIÃ“ + BORRAR buttons) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (enrolledIdentifiers.length === 0) {
        adminEnrollList.innerHTML = '<p style="padding:15px;color:#666;font-size:0.8rem;">Nadie inscrito todavÃ­a.</p>';
    } else {
        const gearMap = { own: 'PROPIA', complete: 'COMPLETO', replica: 'RÃ‰PLICA', basic: 'BÃSICO' };
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
                                ${hasAttended ? 'CONFIRMADO' : 'ASISTIÃ“'}
                            </button>` : ''}
                        <button class="btn btn--outline btn--xs admin-unenroll-btn"
                            data-enrollid="${entry.id}">
                            BORRAR
                        </button>
                    </div>
                </div>`;
        }).join('');
    }

    // â”€â”€ Attach event listeners (replaces window.onclick handlers) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    _attachDashboardListeners(api, nextSundayKey);
};

// Attaches click handlers to dynamically-rendered admin buttons
const _attachDashboardListeners = (api, nextSundayKey) => {
    // INSCRIBIR buttons
    document.querySelectorAll('.admin-enroll-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId = btn.dataset.uid;
            const email  = btn.dataset.email;
                    btn.disabled = true;
            btn.textContent = '...';
            const ok = await api.enroll(nextSundayKey, userId, email, 'own');
            if (ok) {
                            updateAdminDashboard(api, nextSundayKey);
            } else {
                console.error('[ADMIN] Enroll FAILED');
                alert('Error al inscribir. Revisa los permisos en Supabase (ver SQL admin_fix_v2.sql).');
                btn.disabled = false;
                btn.textContent = 'INSCRIBIR';
            }
        });
    });

    // ASISTIÃ“ buttons
    document.querySelectorAll('.admin-attendance-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId   = btn.dataset.uid;
            const sunKey   = btn.dataset.sunkey;
                    btn.disabled = true;
            btn.textContent = '...';
            const user = await api.getProfile(userId);
            if (!user) {
                console.error('[ADMIN] getProfile returned null for', userId);
                alert('No se encontrÃ³ el perfil del usuario.');
                return;
            }
            const history = Array.isArray(user.mission_history) ? user.mission_history : [];
            if (!history.includes(sunKey)) history.push(sunKey);
            const newExp = (user.exp || 0) + 100;
            const ok = await api.saveProfile({ ...user, exp: newExp, mission_history: history });
            if (ok) {
                            btn.textContent = 'CONFIRMADO';
                updateAdminDashboard(api, nextSundayKey);
            } else {
                console.error('[ADMIN] Attendance save FAILED');
                alert('Error al guardar asistencia. Revisa los permisos en Supabase.');
                btn.disabled = false;
                btn.textContent = 'ASISTIÃ“';
            }
        });
    });

    // BORRAR (unenroll) buttons
    document.querySelectorAll('.admin-unenroll-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const enrollmentId = btn.dataset.enrollid;
                    btn.disabled = true;
            btn.textContent = '...';
            const ok = await api.unenroll(enrollmentId);
            if (ok) {
                            updateAdminDashboard(api, nextSundayKey);
            } else {
                console.error('[ADMIN] Unenroll FAILED');
                alert('Error al borrar inscripciÃ³n. Revisa los permisos en Supabase.');
                btn.disabled = false;
                btn.textContent = 'BORRAR';
            }
        });
    });
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MANIFESTO DOWNLOAD
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const downloadManifesto = async (api, nextSundayKey) => {
    const dbEnrollments = await api.getEnrollments();
    const list          = dbEnrollments[nextSundayKey] || [];
    const allUsers      = await api.getUsers();
    const gearMap       = { own: 'PROPIA', complete: 'COMPLETO', replica: 'RÃ‰PLICA', basic: 'BÃSICO' };

    let manifest  = `MANIFESTO AGOGE ELITE - ${nextSundayKey}\n`;
    manifest     += `TOTAL INSCRITOS: ${list.length}\n`;
    manifest     += `------------------------------------------\n`;

    list.forEach((entry, i) => {
        const u = entry.is_guest
            ? { callsign: entry.guest_name, name: entry.guest_name, gear: entry.gear }
            : (allUsers.find(x => x.id === entry.user_id) || { callsign: 'â€”', name: entry.user_email, gear: entry.gear });
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MISSION CONFIG FORM
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const setupMissionConfig = async (api, nextSundayKey) => {
    const form = document.getElementById('adminMissionForm');
    if (!form) return;

    // Prevent double-binding if called multiple times
    if (form.dataset.bound === 'true') return;
    form.dataset.bound = 'true';

    // Load current settings
    const settings = await api.getMissionSettings(nextSundayKey);
    if (settings) {
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
    
        const btn      = form.querySelector('[type="submit"]');
        const feedback = document.getElementById('configFeedback');
        if (btn) btn.disabled = true;

        const success = await api.saveMissionSettings(missionData);
        if (success) {
                    if (feedback) { feedback.style.display = 'block'; feedback.style.color = '#2ecc71'; feedback.textContent = 'âœ” OPORD publicada con Ã©xito.'; }
            else alert('Â¡MisiÃ³n publicada con Ã©xito!');
        } else {
            console.error('[ADMIN] Mission save FAILED');
            if (feedback) { feedback.style.display = 'block'; feedback.style.color = 'var(--blood)'; feedback.textContent = 'âœ– Error al guardar. Revisa permisos Supabase.'; }
            else alert('Error al publicar la misiÃ³n. Revisa los permisos en Supabase (admin_fix_v2.sql).');
        }
        if (btn) btn.disabled = false;
    });
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PHOTO MODERATION
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const renderAdminPhotos = async (api) => {
    const photoList = document.getElementById('adminPhotoList');
    if (!photoList) return;

    photoList.innerHTML = '<div style="text-align:center;font-size:.8rem;color:var(--text-muted);padding:10px;">Cargando inteligencia...</div>';

    const photos = await api.getCommunityPhotos('pending');

    if (photos.length === 0) {
        photoList.innerHTML = '<div style="text-align:center;font-size:.8rem;color:var(--text-muted);padding:20px;">No hay archivos visuales pendientes de revisiÃ³n.</div>';
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
                <span style="color:var(--bronze-light);">OP:</span> ${photo.users?.callsign || (photo.user_id ? photo.user_id.split('-')[0] : 'ANÓNIMO')}
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
                    btn.disabled = true; btn.textContent = '...';
            const ok = await api.updateCommunityPhotoStatus(id, 'approved');
            if (ok) { console.log('[ADMIN] Photo approved'); renderAdminPhotos(api); }
            else    { alert('Error al aprobar foto.'); btn.disabled = false; btn.textContent = 'APROBAR'; }
        });
    });

    photoList.querySelectorAll('.photo-reject-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
                    btn.disabled = true; btn.textContent = '...';
            const ok = await api.updateCommunityPhotoStatus(id, 'rejected');
            if (ok) { console.log('[ADMIN] Photo rejected'); renderAdminPhotos(api); }
            else    { alert('Error al denegar foto.'); btn.disabled = false; btn.textContent = 'DENEGAR'; }
        });
    });
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ATTACH GLOBAL HANDLERS (for manual enrollment form in admin.html)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const attachAdminGlobals = (api, nextSundayKey) => {

    // Manual enrollment form button (in admin.html HTML)
    const manualEnrollBtn = document.querySelector('[onclick*="adminEnrollUser"]');
    if (manualEnrollBtn) {
        // Remove inline onclick and replace with event listener
        manualEnrollBtn.removeAttribute('onclick');
        manualEnrollBtn.addEventListener('click', async () => {
            const userId = document.getElementById('manualEnrollId')?.value?.trim();
            const email  = document.getElementById('manualEnrollEmail')?.value?.trim();
            if (!userId) return alert('Rellena al menos el Nombre/ID del operador.');
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
            const ok = await api.enroll(nextSundayKey, userId, email, 'own');
        if (ok) updateAdminDashboard(api, nextSundayKey);
        else alert('Error al inscribir usuario.');
    };

    window.adminUnenrollUser = async (enrollmentId) => {
            const ok = await api.unenroll(enrollmentId);
        if (ok) updateAdminDashboard(api, nextSundayKey);
        else alert('Error al borrar inscripciÃ³n.');
    };

    window.adminConfirmAttendance = async (userId, sunKey) => {
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
