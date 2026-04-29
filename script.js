/**
 * AGOGE ELITE — Main Orchestrator (Bootstrapper)
 */

import { initSupabase, api } from './js/api.js';
import * as ui from './js/ui.js';
import * as profile from './js/profile.js';
import * as admin from './js/admin.js';
import * as secretary from './js/secretary.js';
import { initBackground } from './js/background.js';

// 1. GLOBAL STATE
let supabase = null;
let currentUser = null;
let userProfile = null;
let enrollments = {};
let clans = [];

// 2. UTILS
const getNextSunday = () => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay()) % 7);
    if (d.getDay() !== 0 || (d.getHours() > 14)) d.setDate(d.getDate() + 7);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return d.toLocaleDateString('es-ES', options);
};

const getNextSundayKey = () => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay()) % 7);
    return d.toISOString().split('T')[0];
};

// 3. CORE LOGIC
const refreshData = async () => {
    try {
        const [dbEnrollments, dbClans] = await Promise.all([
            api.getEnrollments(),
            api.getClans()
        ]);
        enrollments = dbEnrollments;
        clans = dbClans;

        if (currentUser) {
            userProfile = await api.getProfile(currentUser.id);
            if (!userProfile) {
                // Auto-repair profile
                const defaultProfile = {
                    id: currentUser.id,
                    email: currentUser.email,
                    name: currentUser.email.split('@')[0],
                    callsign: 'RECLUTA',
                    specialty: 'assault',
                    exp: 0,
                    is_admin: false
                };
                if (await api.saveProfile(defaultProfile)) {
                    userProfile = defaultProfile;
                }
            }
        } else {
            userProfile = null;
        }
    } catch (err) {
        console.error('Data Sync Error:', err);
    }
    updateUI();
};

const updateUI = async () => {
    const els = {
        authTrigger: document.getElementById('authTrigger'),
        userMenu: document.getElementById('userMenu'),
        userNameDisplay: document.getElementById('userName'),
        dashboard: document.getElementById('dashboard'),
        adminBtn: document.getElementById('adminBtn'),
        enrollBtn: document.getElementById('enrollBtn'),
        enrollStatus: document.getElementById('enrollStatus'),
        playerCount: document.getElementById('playerCount'),
        nextMissionDate: document.getElementById('nextMissionDate'),
        rulesWaiver: document.getElementById('rulesWaiver'),
        enrollActionWrap: document.getElementById('enrollActionWrap'),
        userRankBadge: document.getElementById('userRankBadge'),
        userSpecialtyTag: document.getElementById('userSpecialtyTag'),
        userMissionView: document.getElementById('userMissionView'),
        adminPanel: document.getElementById('adminPanel'),
        profilePanel: document.getElementById('profilePanel')
    };
    if (currentUser && userProfile) {
        els.authTrigger?.classList.add('hidden');
        els.userMenu?.classList.remove('hidden');
        els.dashboard?.classList.remove('hidden'); // Fix: Show dashboard when logged in
        if (els.userNameDisplay) els.userNameDisplay.textContent = userProfile.callsign || userProfile.name;
        
        // Dynamic Navbar Links
        const navAdmin = document.getElementById('navAdminLink');
        const hasAdminAccess = ['admin', 'jefe_operaciones', 'secretario'].includes(userProfile.role) || userProfile.is_admin;
        if (navAdmin && hasAdminAccess) navAdmin.classList.remove('hidden');

        // Page-specific UI Logic
        const path = window.location.pathname;
        if (path.includes('perfil.html')) {
            window._api_instance = api;
            
            // Get user's real attendance history
            const allLogs = await api.getAttendanceLogs();
            const userCallsign = userProfile.callsign ? userProfile.callsign.toLowerCase() : '';
            const userRealName = userProfile.name ? userProfile.name.toLowerCase() : '';
            const userLogs = allLogs.filter(log => {
                const logName = log.name ? log.name.toLowerCase() : '';
                return (userCallsign && logName.includes(userCallsign)) || 
                       (userRealName && logName.includes(userRealName));
            });

            profile.updateProfileView(userProfile, userLogs);
            profile.renderMedals(userProfile, enrollments, getNextSundayKey(), userLogs);
        } else if (path.includes('admin.html')) {
            if (!hasAdminAccess) window.location.href = 'index.html';
            const sunKey = getNextSundayKey();
            window._api_instance = api; // Global bridge for nested admin calls
            admin.updateAdminDashboard(api, sunKey);
            admin.setupMissionConfig(api, sunKey);
            admin.renderAdminPhotos(api);
            admin.attachAdminGlobals(api, sunKey);
            admin.applyPermissions(userProfile);
            secretary.initSecretary(api);

            // Download Manifesto Listener
            document.getElementById('downloadManifestoBtn')?.addEventListener('click', () => {
                admin.downloadManifesto(api, sunKey);
            });
        } else if (path.includes('operaciones.html')) {
            renderActiveMission();
            renderVoting();
            setupVotingListeners();
        } else if (path.includes('logistica.html')) {
            const allUsers = await api.getUsers();
            profile.renderClanView(userProfile, clans, allUsers, {
                leaderboardId: 'clanLeaderboardBody',
                tfProgressId: 'tfProgress',
                upProgressId: 'upProgress',
                tfStatsId: 'tfStats',
                upStatsId: 'upStats'
            });
            profile.renderOperatorLeaderboard(api, allUsers);
        }

        if (document.getElementById('approvedPhotosGrid')) {
            renderCommunityBoard();
        }

        // Enrollment Logic
        const sunKey = getNextSundayKey();
        const missionEnrollments = enrollments[sunKey] || [];
        const isEnrolled = missionEnrollments.some(e => e.user_id === currentUser.id);
        const count = missionEnrollments.length;
        const capacity = 20;

        if (els.playerCount) els.playerCount.textContent = `${count}/${capacity}`;
        if (els.nextMissionDate) els.nextMissionDate.textContent = getNextSunday().toUpperCase();

        if (isEnrolled) {
            if (els.enrollStatus) {
                els.enrollStatus.textContent = 'ESTADO: INSCRITO — TE VEO EN EL CAMPO';
                els.enrollStatus.style.color = '#2ecc71';
            }
            els.enrollActionWrap?.classList.add('hidden');
        } else {
            els.enrollBtn?.classList.remove('hidden');
            els.enrollStatus?.classList.add('hidden');
            els.enrollActionWrap?.classList.remove('hidden');
        }

        // Rank Display
        if (els.userRankBadge) {
            const exp = userProfile.exp || 0;
            let rank = 'RECLUTA';
            if (exp >= 10) rank = 'ÉLITE';
            else if (exp >= 6) rank = 'VETERANO';
            else if (exp >= 3) rank = 'OPERADOR';
            els.userRankBadge.textContent = rank;
            els.userRankBadge.dataset.rank = rank.toLowerCase();
        }

        // Leaderboard (only if in index or logistica)
        if (path.includes('index.html') || path === '/' || path.includes('logistica.html')) {
            const allUsers = await api.getUsers();
            profile.renderClanView(userProfile, clans, allUsers, {
                leaderboardId: 'clanLeaderboardBody',
                tfProgressId: 'tfProgress',
                upProgressId: 'upProgress',
                tfStatsId: 'tfStats',
                upStatsId: 'upStats',
                createClan: profile.createClan,
                joinClan: profile.joinClan,
                leaveClan: profile.leaveClan
            });
            profile.renderMedals(userProfile, enrollments, sunKey);
        }
    } else {
        els.authTrigger?.classList.remove('hidden');
        els.userMenu?.classList.add('hidden');
        els.dashboard?.classList.add('hidden');
        els.adminPanel?.classList.add('hidden');
        els.profilePanel?.classList.add('hidden');
        els.userMissionView?.classList.remove('hidden');
    }

    // Remaining Slots Logic (works for logged-in and anonymous visitors)
    const slotsSunKey = getNextSundayKey();
    const slotsEnrolled = enrollments[slotsSunKey] || [];
    const maxAforo = 20;
    const remaining = Math.max(0, maxAforo - slotsEnrolled.length);
    const slotsEl = document.getElementById('slotsRemaining');
    if (slotsEl) {
        slotsEl.textContent = `PLAZAS DISPONIBLES: ${remaining}`;
        if (remaining <= 5) slotsEl.style.color = 'var(--blood)';
        else slotsEl.style.color = 'var(--bronze)';
    }
};

// 4. ACTIONS (EVENT HANDLERS)
const createClan = async () => {
    const name = prompt('Nombre de tu nueva Fuerza de Tareas:');
    if (!name) return;
    clans = await api.getClans();
    if (clans.some(c => c.name.toLowerCase() === name.toLowerCase())) return alert('Nombre en uso.');
    if (await api.createClan(name, userProfile.id, userProfile.email)) {
        userProfile.clan = name;
        await api.saveProfile(userProfile);
        refreshData();
    }
};

const joinClan = async () => {
    const name = prompt('Nombre del Clan:');
    if (!name) return;
    clans = await api.getClans();
    const clan = clans.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!clan) return alert('No existe.');
    userProfile.clan = clan.name;
    await api.saveProfile(userProfile);
    refreshData();
};

const leaveClan = async () => {
    if (!confirm('¿Abandonar clan?')) return;
    userProfile.clan = null;
    await api.saveProfile(userProfile);
    refreshData();
};



const setupAuthUI = () => {
    const els = {
        authTrigger: document.getElementById('authTrigger'),
        authModal: document.getElementById('authModal'),
        modalClose: document.getElementById('modalClose'),
        modalOverlay: document.getElementById('modalOverlay'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        toRegister: document.getElementById('toRegister'),
        toLogin: document.getElementById('toLogin'),
        logoutBtn: document.getElementById('logoutBtn'),
        enrollBtn: document.getElementById('enrollBtn'),
        adminBtn: document.getElementById('adminBtn'),
        profileBtn: document.getElementById('profileBtn'),
        closeAdminBtn: document.getElementById('closeAdminBtn'),
        closeProfileBtn: document.getElementById('closeProfileBtn'),
        downloadManifestoBtn: document.getElementById('downloadManifestoBtn'),
        openIntelBtn: document.getElementById('openIntelBtn'),
        closeIntelBtn: document.getElementById('closeIntelBtn')
    };

    els.authTrigger?.addEventListener('click', () => els.authModal.classList.add('is-open'));
    els.modalClose?.addEventListener('click', () => els.authModal.classList.remove('is-open'));
    els.modalOverlay?.addEventListener('click', () => els.authModal.classList.remove('is-open'));

    // Toggle between Login / Register / Recovery forms
    els.toRegister?.addEventListener('click', () => {
        document.getElementById('loginFormWrap')?.classList.add('hidden');
        document.getElementById('recoveryFormWrap')?.classList.add('hidden');
        document.getElementById('registerFormWrap')?.classList.remove('hidden');
    });
    els.toLogin?.addEventListener('click', () => {
        document.getElementById('registerFormWrap')?.classList.add('hidden');
        document.getElementById('recoveryFormWrap')?.classList.add('hidden');
        document.getElementById('loginFormWrap')?.classList.remove('hidden');
    });
    document.getElementById('toRecover')?.addEventListener('click', () => {
        document.getElementById('loginFormWrap')?.classList.add('hidden');
        document.getElementById('registerFormWrap')?.classList.add('hidden');
        document.getElementById('recoveryFormWrap')?.classList.remove('hidden');
    });
    document.getElementById('backToLogin')?.addEventListener('click', () => {
        document.getElementById('recoveryFormWrap')?.classList.add('hidden');
        document.getElementById('registerFormWrap')?.classList.add('hidden');
        document.getElementById('loginFormWrap')?.classList.remove('hidden');
    });

    els.logoutBtn?.addEventListener('click', () => supabase.auth.signOut());

    els.loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) alert(error.message);
        else els.authModal.classList.remove('is-open');
    });

    els.registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPass').value;
        const { data, error } = await supabase.auth.signUp({ email, password: pass });
        if (error) alert(error.message);
        else {
            await api.saveProfile({
                id: data.user.id,
                email,
                name: document.getElementById('regName').value,
                callsign: document.getElementById('regCallsign').value,
                specialty: document.getElementById('regSpecialty').value,
                faction: document.getElementById('regFaction').value || 'none',
                exp: 0, is_admin: false
            });
            alert('Registro OK. Verifica tu email.');
        }
    });

    els.enrollBtn?.addEventListener('click', async () => {
        const waiver = document.getElementById('rulesWaiver');
        const roleSelect = document.getElementById('enrollRole');
        if (!waiver?.checked) return alert('Acepta la normativa de seguridad.');
        
        const selectedRole = roleSelect?.value || 'assault';
        
        if (await api.enroll(getNextSundayKey(), currentUser.id, userProfile.email, userProfile.gear || 'own')) {
            // Update profile with the role played this time
            userProfile.exp = (userProfile.exp || 0) + 1;
            userProfile.specialty = selectedRole;
            await api.saveProfile(userProfile);
            refreshData();
            alert('¡Inscripción confirmada! Te vemos en el campo, operador.');
        }
    });

    els.adminBtn?.addEventListener('click', () => {
        document.getElementById('userMissionView').classList.add('hidden');
        document.getElementById('profilePanel').classList.add('hidden'); // Fix overlap
        document.getElementById('adminPanel').classList.remove('hidden');
        admin.updateAdminDashboard(api, getNextSundayKey());
        admin.setupMissionConfig(api, getNextSundayKey());
    });

    els.closeAdminBtn?.addEventListener('click', () => {
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('userMissionView').classList.remove('hidden');
    });

    els.profileBtn?.addEventListener('click', () => {
        document.getElementById('userMissionView').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden'); // Fix overlap
        document.getElementById('profilePanel').classList.remove('hidden');
        profile.updateProfileView(userProfile);
    });

    els.closeProfileBtn?.addEventListener('click', () => {
        document.getElementById('profilePanel').classList.add('hidden');
        document.getElementById('userMissionView').classList.remove('hidden');
    });

    // Profile Edit Logic
    const editBtn = document.getElementById('editProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const profileView = document.getElementById('profileViewMode');
    const profileEditForm = document.getElementById('profileEditForm');

    editBtn?.addEventListener('click', () => {
        profileView.classList.add('hidden');
        profileEditForm.classList.remove('hidden');
        
        // Populate form
        document.getElementById('editCallsign').value = userProfile.callsign || '';
        document.getElementById('editSpecialty').value = userProfile.specialty || 'assault';
        document.getElementById('editFaction').value = userProfile.faction || 'none';
        const gearRadios = document.getElementsByName('editGear');
        gearRadios.forEach(r => {
            if (r.value === (userProfile.gear || 'own')) r.checked = true;
        });
    });

    cancelEditBtn?.addEventListener('click', () => {
        profileEditForm.classList.add('hidden');
        profileView.classList.remove('hidden');
    });

    profileEditForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedProfile = {
            ...userProfile,
            callsign: document.getElementById('editCallsign').value,
            specialty: document.getElementById('editSpecialty').value,
            faction: document.getElementById('editFaction').value,
            gear: Array.from(document.getElementsByName('editGear')).find(r => r.checked)?.value || 'own'
        };

        if (await api.saveProfile(updatedProfile)) {
            userProfile = updatedProfile;
            profile.updateProfileView(userProfile);
            profileEditForm.classList.add('hidden');
            profileView.classList.remove('hidden');
            alert('SITREP Actualizado, Operador.');
        }
    });

    // Subida de Fotos Comunitarias
    const uploadPhotoForm = document.getElementById('uploadPhotoForm');
    const uploadFeedback = document.getElementById('uploadFeedback');

    uploadPhotoForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('photoUpload');
        const captionInput = document.getElementById('photoCaption');
        const file = fileInput.files[0];
        
        if(!file) return;
        
        const submitBtn = document.getElementById('submitPhotoBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'SUBIENDO...';
        submitBtn.disabled = true;
        uploadFeedback.style.display = 'block';
        uploadFeedback.style.color = 'var(--text-muted)';
        uploadFeedback.textContent = 'Estableciendo conexión encriptada y subiendo imagen...';

        const result = await api.uploadCommunityPhoto(file, userProfile.id, captionInput.value);
        
        if (result) {
            uploadFeedback.style.color = '#2ecc71';
            uploadFeedback.textContent = '¡Archivo enviado! El Mando revisará la foto antes de publicarla.';
            uploadPhotoForm.reset();
        } else {
            uploadFeedback.style.color = 'var(--blood)';
            uploadFeedback.textContent = 'Error en la transmisión. Revisa la consola o reintenta.';
        }
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        setTimeout(() => {
            uploadFeedback.style.display = 'none';
        }, 6000);
    });

    els.downloadManifestoBtn?.addEventListener('click', () => admin.downloadManifesto(api, getNextSundayKey()));

    els.openIntelBtn?.addEventListener('click', () => {
        document.getElementById('intelBoard').classList.remove('hidden');
        renderVoting();
        renderActiveMission();
    });
    els.closeIntelBtn?.addEventListener('click', () => {
        document.getElementById('intelBoard').classList.add('hidden');
    });
};

const renderActiveMission = async () => {
    const sunKey = getNextSundayKey();
    const settings = await api.getMissionSettings(sunKey);
    const enrolled = (await api.getEnrollments())[sunKey] || [];
    
    // 1. Update Mission Briefing
    const sit = document.getElementById('opordSituation');
    const mis = document.getElementById('opordMission');
    const gear = document.getElementById('opordGear');
    const mapImg = document.getElementById('intelMapImg');

    if (settings) {
        if (sit) sit.textContent = settings.situation;
        if (mis) mis.textContent = settings.mission;
        if (gear) gear.textContent = settings.gear_rules;
        if (mapImg && settings.map_url) mapImg.src = settings.map_url;
    }

    // 2. Team Balance (Role Distribution)
    const roleStats = { assault: 0, medic: 0, support: 0, sniper: 0 };
    // Fetch user profiles for roles if not in enrollment
    const profiles = await api.getUsers();
    enrolled.forEach(e => {
        const p = profiles.find(pr => pr.email === e.user_email);
        const role = p?.specialty || 'assault';
        if (roleStats[role] !== undefined) roleStats[role]++;
    });

    const roleContainer = document.getElementById('roleDistribution');
    if (roleContainer) {
        roleContainer.innerHTML = Object.entries(roleStats).map(([role, count]) => `
            <div class="role-stat-card" style="background:rgba(255,255,255,0.05); border:1px solid var(--border); padding:10px; text-align:center;">
                <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">${role}</div>
                <div style="font-size:1.2rem; color:var(--bronze); font-weight:bold; font-family:var(--font-display);">${count}</div>
            </div>
        `).join('');
    }
};

const renderVoting = async () => {
    const sunKey = getNextSundayKey();
    const votes = await api.getVotes(sunKey);
    const userVote = userProfile ? votes[userProfile.email] : null;
    const opt = document.getElementById('votingOptions');
    const res = document.getElementById('votingResults');
    const list = document.getElementById('resultsList');

    if (userVote) {
        opt?.classList.add('hidden');
        res?.classList.remove('hidden');
        const labels = { tdm: 'Eliminación', ctf: 'Bandera', vip: 'VIP', dom: 'Dominación' };
        const allVotes = Object.values(votes);
        const total = allVotes.length;
        const counts = {};
        allVotes.forEach(v => counts[v] = (counts[v] || 0) + 1);
        
        if (list) {
            list.innerHTML = Object.entries(labels).map(([k, l]) => {
                const c = counts[k] || 0;
                const p = total ? (c / total) * 100 : 0;
                return `<div class="result-item" style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.7rem; margin-bottom:4px;">
                        <span>${l}</span>
                        <span>${c} (${Math.round(p)}%)</span>
                    </div>
                    <div class="result-bar-wrap" style="height:6px; background:rgba(0,0,0,0.3); border-radius:3px; overflow:hidden;">
                        <div class="result-bar-fill" style="width:${p}%; height:100%; background:var(--bronze);"></div>
                    </div>
                </div>`;
            }).join('');
        }
    } else {
        opt?.classList.remove('hidden');
        res?.classList.add('hidden');
    }
};

const renderCommunityBoard = async () => {
    const grid = document.getElementById('approvedPhotosGrid');
    if (!grid) return;

    const photos = await api.getCommunityPhotos('approved');
    
    if (photos.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:40px;">No hay reportes visuales disponibles en este momento.</div>';
        return;
    }

    grid.innerHTML = photos.map(photo => `
        <article class="community-card" style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:8px; overflow:hidden; transition:transform 0.3s ease;">
            <div class="community-card__img-wrap" style="aspect-ratio:1/1; overflow:hidden; position:relative;">
                <img src="${photo.image_url}" alt="Intel" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease;" loading="lazy">
                <div class="community-card__overlay" style="position:absolute; bottom:0; left:0; width:100%; padding:15px; background:linear-gradient(transparent, rgba(0,0,0,0.8));">
                    <span class="community-card__user" style="font-size:0.7rem; color:var(--bronze); font-weight:bold; text-transform:uppercase;">OP: ${photo.users?.callsign || (photo.user_id ? photo.user_id.split('-')[0] : 'ANÓNIMO')}</span>
                </div>
            </div>
            <div class="community-card__content" style="padding:15px;">
                <p class="community-card__caption" style="font-size:0.8rem; line-height:1.4; color:var(--white);">"${photo.caption || 'Sin reporte adicional.'}"</p>
                <div class="community-card__meta" style="margin-top:10px; font-size:0.6rem; color:var(--text-muted);">${new Date(photo.created_at).toLocaleDateString()}</div>
            </div>
        </article>
    `).join('');
};

const setupVotingListeners = () => {
    document.querySelectorAll('.vote-btn').forEach(btn => {
        // Remove existing to avoid duplicates if re-rendered
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', async () => {
            if (!currentUser) return alert('Debes estar logueado para votar.');
            if (await api.castVote(getNextSundayKey(), currentUser.id, userProfile.email, newBtn.dataset.mode)) {
                renderVoting();
            }
        });
    });
};

// 5. INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
    // a. Component Inits (Vanilla UI)
    initBackground();
    ui.initScrollProgress();
    ui.initStickyHeader();
    ui.initHamburger();
    ui.initDropdowns();
    ui.initReveal();
    ui.initSmoothScroll();
    ui.initActiveNav();
    ui.initFAQ();
    ui.initTerminalLog();
    ui.initCountdown();
    ui.initParallax();
    ui.initStatsCounter();
    ui.initCalendar();
    ui.initLightbox();

    // b. Supabase & Data Logic
    supabase = initSupabase();
    if (supabase) {
        // Auth UI Bindings
        setupAuthUI();

        // Check current session
        currentUser = (await supabase.auth.getUser()).data.user;
        refreshData();
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            currentUser = session?.user || null;
            refreshData();
        });
    }

    // c. Page specific listeners
    const path = window.location.pathname;
    const sunKey = getNextSundayKey();
    
    if (path.includes('operaciones.html')) {
        profile.initMissionVoting();
        ui.initTacticalMap();
    } else if (path.includes('admin.html')) {
        // Admin globals & logic already handled by setupAuthUI calling admin.update...
        // But we ensure globals are attached
        admin.attachAdminGlobals(api, sunKey);
    } else if (path.includes('perfil.html')) {
        profile.initSocial(api, currentUser);
    }
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}
