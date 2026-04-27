/**
 * AGOGE ELITE - Admin Dashboard Module (v2 - Bulletproof)
 *
 * All actions have console.log for debug verification.
 * Exported functions: updateAdminDashboard, downloadManifesto,
 *   setupMissionConfig, renderAdminPhotos, attachAdminGlobals
 */

// -----------------------------------------------------------------------------
// DASHBOARD: Renders users list + enrollment list
// -----------------------------------------------------------------------------
export const updateAdminDashboard = async (api, nextSundayKey) => {

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


    // Capacity bar
    const maxAforo    = 20;
    const currentCount = enrolledIdentifiers.length;
    if (adminAforoCount)    adminAforoCount.textContent    = `${currentCount} / ${maxAforo}`;
    if (adminAforoProgress) adminAforoProgress.style.width = `${Math.min((currentCount / maxAforo) * 100, 100)}%`;

    // —— Users list (with INSCRIBIR button) ———————————————
    if (allUsers.length === 0) {
        adminUserList.innerHTML = '<tr><td colspan="4" style="padding:15px;color:#666;font-size:0.8rem;">No hay usuarios registrados.</td></tr>';
    } else {
        adminUserList.innerHTML = allUsers.map(u => {
            const isEnrolled = enrolledIdentifiers.some(e => e.user_id === u.id);
            return `
                <tr>
                    <td>${u.callsign || u.name || '—'} <small style="opacity:.5">(${u.name || ''})</small></td>
                    <td>${u.specialty || '—'}</td>
                    <td style="color:${isEnrolled ? '#2ecc71' : '#aaa'}">${isEnrolled ? '✓ INSCRITO' : '—'}</td>
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

    // —— Enrolled list (with ASISTIÓ + BORRAR buttons) —————————————
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

    // —— Attach event listeners (replaces window.onclick handlers) ———————————
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

    // ASISTIÓ buttons
    document.querySelectorAll('.admin-attendance-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId   = btn.dataset.uid;
            const sunKey   = btn.dataset.sunkey;
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
            if (!confirm('¿Eliminar esta inscripción?')) return;
            const enrollId = btn.dataset.enrollid;
                    btn.disabled = true;
            btn.textContent = '...';
            const ok = await api.unenroll(enrollId);
            if (ok) {
                            updateAdminDashboard(api, nextSundayKey);
            } else {
                console.error('[ADMIN] Unenroll FAILED');
                alert('Error al borrar inscripción.');
                btn.disabled = false;
                btn.textContent = 'BORRAR';
            }
        });
    });
};

// -----------------------------------------------------------------------------
// PHOTOS: Approve/Reject community photos
// -----------------------------------------------------------------------------
export const renderAdminPhotos = async (api) => {
    const photoList = document.getElementById('adminPhotoList');
    if (!photoList) return;

    const photos = await api.getCommunityPhotos();
    const pending = photos.filter(p => p.status === 'pending');

    if (pending.length === 0) {
        photoList.innerHTML = '<p style="padding:15px;color:#666;font-size:0.8rem;">No hay fotos pendientes de moderación.</p>';
        return;
    }

    photoList.innerHTML = pending.map(p => `
        <div class="admin-item" style="flex-direction:column; align-items:flex-start; gap:10px;">
            <div style="display:flex; gap:15px; width:100%;">
                <img src="${p.url}" style="width:80px; height:80px; object-fit:cover; border:1px solid var(--border);">
                <div style="flex:1;">
                    <span class="admin-item__name">${p.user_name || 'Anónimo'}</span>
                    <span class="admin-item__sub">ID: ${p.id.split('-')[0]}</span>
                    <div style="margin-top:10px; display:flex; gap:5px;">
                        <button class="btn btn--primary btn--xs photo-approve-btn" data-id="${p.id}">APROBAR</button>
                        <button class="btn btn--outline btn--xs photo-reject-btn" data-id="${p.id}">DENEGAR</button>
                        <button class="btn btn--outline btn--xs photo-delete-btn" data-id="${p.id}" data-url="${p.url}" style="color:var(--red); border-color:var(--red);">BORRAR</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

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

    photoList.querySelectorAll('.photo-delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('¿Seguro que quieres borrar esta foto permanentemente del sistema?')) return;
            const id = btn.dataset.id;
            const url = btn.dataset.url;
            btn.disabled = true; btn.textContent = 'BORRANDO...';
            const ok = await api.deleteCommunityPhoto(id, url);
            if (ok) { console.log('[ADMIN] Photo deleted'); renderAdminPhotos(api); }
            else    { alert('Error al borrar foto.'); btn.disabled = false; btn.textContent = 'BORRAR PERMANENTEMENTE'; }
        });
    });
};

// -----------------------------------------------------------------------------
// ATTACH GLOBAL HANDLERS (for manual enrollment form in admin.html)
// -----------------------------------------------------------------------------
export const attachAdminGlobals = (api, nextSundayKey) => {
    
    // Initialize OPORD form
    setupMissionConfig(api, nextSundayKey);

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
        else alert('Error al borrar inscripción.');
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

    // --- TECHNICAL CONFIG LOGIC ---
    const configBtn = document.getElementById('openConfigBtn');
    const configModal = document.getElementById('configModal');
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    const sheetsUrlInput = document.getElementById('sheetsUrlInput');

    if (configBtn && configModal) {
        configBtn.addEventListener('click', () => {
            configModal.classList.add('is-open');
            if (sheetsUrlInput) sheetsUrlInput.value = localStorage.getItem('sec_sheets_url') || '';
        });
        
        document.getElementById('configModalClose')?.addEventListener('click', () => {
            configModal.classList.remove('is-open');
        });
        document.getElementById('configModalOverlay')?.addEventListener('click', () => {
            configModal.classList.remove('is-open');
        });
    }

    saveConfigBtn?.addEventListener('click', () => {
        const url = sheetsUrlInput?.value.trim();
        if (url) {
            localStorage.setItem('sec_sheets_url', url);
            alert('Enlace con Google Sheets establecido correctamente.');
            configModal?.classList.remove('is-open');
        } else {
            alert('Por favor, introduce una URL válida.');
        }
    });
};

export const applyPermissions = (userProfile) => {
    if (!userProfile) return;
    
    const role = userProfile.role;
    const isFullAdmin = role === 'admin' || userProfile.is_admin;
    
    // Select containers
    const dashCol = document.querySelector('.admin-col--dash');
    const configCol = document.querySelector('.admin-col--config');
    const photosCol = document.querySelector('.admin-col--photos');
    const usersCol = document.querySelector('.admin-col--users');
    const secPanel = document.getElementById('secretaryPanel');
    
    if (role === 'jefe_operaciones') {
        // Jefe de Operaciones sees mission dash and config
        if (photosCol) photosCol.style.display = 'none';
        if (usersCol) usersCol.style.display = 'none';
        if (secPanel) secPanel.classList.add('hidden');
        if (dashCol) dashCol.style.display = 'block';
        if (configCol) configCol.style.display = 'block';
    } else if (role === 'secretario') {
        // Secretario - Show only secretary panel
        if (secPanel) secPanel.classList.remove('hidden');
        if (photosCol) photosCol.style.display = 'none';
        if (usersCol) usersCol.style.display = 'none';
        if (dashCol) dashCol.style.display = 'none';
        if (configCol) configCol.style.display = 'none';
    } else if (isFullAdmin) {
        // Full Admin sees EVERYTHING
        if (secPanel) secPanel.classList.remove('hidden');
        if (photosCol) photosCol.style.display = 'block';
        if (usersCol) usersCol.style.display = 'block';
        if (dashCol) dashCol.style.display = 'block';
        if (configCol) configCol.style.display = 'block';
        
        // Render the user roles list if we are admin
        renderUserRoles(window._api_instance); 
    } else {
        // Safety redirect
        window.location.href = 'index.html';
    }
};

const renderUserRoles = async (api) => {
    const listWrap = document.getElementById('adminUserRoleList');
    if (!listWrap) return;
    
    const users = await api.getUsers();
    if (users.length === 0) {
        listWrap.innerHTML = '<p class="u-text-muted">No hay usuarios registrados.</p>';
        return;
    }
    
    listWrap.innerHTML = `
        <table class="leaderboard-table">
            <thead>
                <tr>
                    <th>OPERADOR</th>
                    <th>ROL ACTUAL</th>
                    <th>ACCIONES</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(u => `
                    <tr>
                        <td><strong>${u.callsign || u.name}</strong><br><small style="opacity:0.6;">${u.email || ''}</small></td>
                        <td><span class="sec-type-badge sec-type-badge--${u.role || 'recluta'}">${(u.role || 'recluta').toUpperCase()}</span></td>
                        <td>
                            <select class="form-input btn--xs" onchange="window.adminChangeUserRole('${u.id}', this.value)" style="padding: 2px 5px; font-size: 0.7rem; width: auto;">
                                <option value="recluta" ${u.role === 'recluta' ? 'selected' : ''}>RECLUTA</option>
                                <option value="secretario" ${u.role === 'secretario' ? 'selected' : ''}>SECRETARIO</option>
                                <option value="jefe_operaciones" ${u.role === 'jefe_operaciones' ? 'selected' : ''}>JEFE OPS</option>
                                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>ADMIN</option>
                            </select>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

// Global role change handler
window.adminChangeUserRole = async (userId, newRole) => {
    const api = window._api_instance;
    if (!api) return;
    
    const ok = await api.saveProfile({ id: userId, role: newRole });
    if (ok) {
        alert('Rango actualizado correctamente.');
        location.reload(); // Refresh to apply permissions
    } else {
        alert('Error al actualizar el rango. Revisa los permisos.');
    }
};

// -----------------------------------------------------------------------------
// MISSION CONFIG
// -----------------------------------------------------------------------------
export const setupMissionConfig = async (api, nextSundayKey) => {
    const form = document.getElementById('adminMissionForm');
    const sitInput = document.getElementById('confSituation');
    const misInput = document.getElementById('confMission');
    const gearInput = document.getElementById('confGear');
    const mapInput = document.getElementById('confMap');
    const modeSelect = document.getElementById('confMode');
    const feedback = document.getElementById('configFeedback');
    const submitBtn = form?.querySelector('button[type="submit"]');

    if (!form || !sitInput) return;

    // Load current config
    const config = await api.getMissionSettings(nextSundayKey);
    if (config) {
        sitInput.value = config.situation || '';
        misInput.value = config.mission || '';
        gearInput.value = config.gear_rules || '';
        mapInput.value = config.map_url || '';
        if (config.mode) modeSelect.value = config.mode;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'PUBLICANDO...';
        feedback.style.display = 'none';

        const missionData = {
            sun_key: nextSundayKey,
            situation: sitInput.value.trim(),
            mission: misInput.value.trim(),
            gear_rules: gearInput.value.trim(),
            map_url: mapInput.value.trim(),
            mode: modeSelect.value
        };

        const ok = await api.saveMissionSettings(missionData);
        
        if (ok) {
            feedback.textContent = '¡OPERACIÓN ACTUALIZADA CON ÉXITO!';
            feedback.style.color = '#2ecc71';
        } else {
            feedback.textContent = 'ERROR DE COMUNICACIÓN CON MANDO.';
            feedback.style.color = 'var(--red)';
        }
        feedback.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'PUBLICAR ACTUALIZACIÓN';
        
        setTimeout(() => { feedback.style.display = 'none'; }, 5000);
    });
};

// -----------------------------------------------------------------------------
// MANIFESTO DOWNLOAD
// -----------------------------------------------------------------------------
export const downloadManifesto = async (api, nextSundayKey) => {
    const enrollments = await api.getEnrollments();
    const list = enrollments[nextSundayKey] || [];
    if (list.length === 0) return alert('No hay inscritos para este domingo.');

    let csv = "OPERADOR;EMAIL;EQUIPO;ROL;COMENTARIOS\n";
    list.forEach(e => {
        const name = e.is_guest ? e.guest_name : (e.user_email || 'Anon');
        const role = e.role || 'assault';
        const gear = e.gear || 'own';
        csv += `${name};${e.user_email || ''};${gear};${role};${e.comment || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Manifiesto_${nextSundayKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
