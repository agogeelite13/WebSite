/**
 * AGOGE ELITE - Profile & Gamification Module
 */

export const renderMedals = (userProfile, enrollments, nextSundayKey) => {
    const medalsList = document.getElementById('medalsList');
    if (!medalsList || !userProfile) return;

    const totalMissions = (userProfile.exp || 0);
    const hasClan = !!userProfile.clan;
    const isEnrolled = enrollments[nextSundayKey]?.some(e => e.user_id === userProfile.id);

    const medals = [
        {
            id: 'spartan_shield',
            title: 'Escudo de Esparta',
            desc: 'Veteranía demostrada (10+ misiones)',
            unlocked: totalMissions >= 10,
            img: 'medals/spartan_shield.png'
        },
        {
            id: 'spear_point',
            title: 'Punta de Lanza',
            desc: 'Primeros en el frente (Inscrito esta semana)',
            unlocked: isEnrolled,
            img: 'medals/spear_point.png'
        },
        {
            id: 'brotherhood',
            title: 'Hermandad de Armas',
            desc: 'Efectividad en equipo (Pertenece a un clan)',
            unlocked: hasClan,
            img: 'medals/brotherhood.png'
        },
        {
            id: 'loyalty',
            title: 'Lealtad Agoge',
            desc: 'Compromiso total (Registrado)',
            unlocked: true,
            img: 'medals/loyalty.png'
        }
    ];

    medalsList.innerHTML = medals.map(m => `
        <div class="medal-slot ${m.unlocked ? 'unlocked' : 'empty'}" title="${m.title}: ${m.desc}${m.unlocked ? '' : ' (BLOQUEADO)'}">
            ${m.img ?
            `<img src="${m.img}" class="medal-icon ${m.unlocked ? 'unlocked' : 'locked'}" alt="${m.title}">` :
            `<i class="${m.icon} medal-placeholder ${m.unlocked ? 'unlocked' : ''}"></i>`
        }
        </div>
    `).join('');
};

export const updateProfileView = (userProfile) => {
    if (!userProfile) return;
    
    const elements = {
        profCallsign: document.getElementById('profCallsign'),
        profRealName: document.getElementById('profRealName'),
        profSpecialty: document.getElementById('profSpecialty'),
        profRank: document.getElementById('profRank'),
        profMissions: document.getElementById('profMissions'),
        profGear: document.getElementById('profGear'),
        profClan: document.getElementById('profClan'),
        profFaction: document.getElementById('profFaction'),
        profLevel: document.getElementById('profLevel'),
        profXPText: document.getElementById('profXPText'),
        profXPFill: document.getElementById('profXPFill'),
        missionLogList: document.getElementById('missionLogList')
    };

    if (elements.profCallsign) elements.profCallsign.textContent = userProfile.callsign || '-';
    if (elements.profRealName) elements.profRealName.textContent = userProfile.name || '-';

    const factionMap = {
        'none': 'SIN FACCIÓN',
        'taskforce': 'TASK FORCE (ORDEN)',
        'uprising': 'UPRISING (REBELIÓN)'
    };
    if (elements.profFaction) elements.profFaction.textContent = factionMap[userProfile.faction] || 'SIN FACCIÓN';

    const gearMap = {
        'own': 'PROPIA',
        'complete': 'COMPLETO (25€)',
        'replica': 'RÉPLICA (20€)',
        'basic': 'BÁSICO (5€)'
    };
    if (elements.profGear) elements.profGear.textContent = gearMap[userProfile.gear] || 'PROPIA';
    if (elements.profClan) elements.profClan.textContent = userProfile.clan || 'SIN CLAN';

    const specMap = {
        'assault': 'ASALTO (FUSILERO)',
        'medic': 'MÉDICO DE CAMPO',
        'support': 'APOYO (SMG)',
        'sniper': 'TIRADOR SELECTO'
    };
    if (elements.profSpecialty) elements.profSpecialty.textContent = specMap[userProfile.specialty] || 'ASALTO';

    const missions = (userProfile.exp || 0);
    const level = Math.floor(missions / 5) + 1;
    const currentLevelXP = missions % 5;
    const xpPercent = (currentLevelXP / 5) * 100;

    let rank = 'RECLUTA';
    let tier = 'standard';
    let frameClass = 'frame-recluta';
    let avatarSrc = 'avatars/avatar_recluta.png';

    if (userProfile.role === 'admin') {
        rank = 'COMANDANTE SUPREMO';
        tier = 'supreme';
        frameClass = 'frame-mando';
        avatarSrc = 'avatars/avatar_operador.png';
        const profilePanel = document.getElementById('profilePanel');
        if (profilePanel) {
            profilePanel.classList.add('admin-mode');
            profilePanel.dataset.tier = 'supreme';
        }
        if (elements.profCallsign && !elements.profCallsign.innerHTML.includes('supreme-badge')) {
            elements.profCallsign.innerHTML += ' <span class="supreme-badge">MANDO</span>';
        }
        // Force Max Stats for Admin View
        if (elements.profLevel) elements.profLevel.textContent = `NIVEL MAX`;
        if (elements.profXPText) elements.profXPText.textContent = `∞ / ∞ XP`;
        if (elements.profXPFill) elements.profXPFill.style.width = `100%`;
    } else {
        if (missions >= 10) {
            rank = 'ÉLITE';
            tier = 'elite';
            frameClass = 'frame-elite';
            avatarSrc = 'avatars/avatar_operador.png';
        } else if (missions >= 6) {
            rank = 'VETERANO';
            tier = 'standard';
            frameClass = 'frame-veterano';
            avatarSrc = 'avatars/avatar_operador.png';
        } else if (missions >= 3) {
            rank = 'OPERADOR';
            tier = 'standard';
            frameClass = 'frame-operador';
            avatarSrc = 'avatars/avatar_operador.png';
        }
        
        if (elements.profLevel) elements.profLevel.textContent = level;
        if (elements.profXPText) elements.profXPText.textContent = `${currentLevelXP} / 5 XP`;
        if (elements.profXPFill) elements.profXPFill.style.width = `${xpPercent}%`;
    }

    const avatarImg = document.getElementById('profAvatar');
    const avatarFrame = document.getElementById('operatorAvatarFrame');
    if (avatarImg) avatarImg.src = avatarSrc;
    if (avatarFrame) {
        avatarFrame.className = 'operator-avatar-frame';
        avatarFrame.classList.add(frameClass);
    }

    const profilePanel = document.getElementById('profilePanel');
    if (profilePanel) profilePanel.dataset.tier = tier;

    if (elements.profRank) {
        elements.profRank.textContent = rank;
        elements.profRank.dataset.rank = rank.toLowerCase().split(' ')[0]; // Support "comandante"
    }

    if (elements.profMissions) elements.profMissions.textContent = missions;

    // Tactical ID UUID Generation (Fixed based on user ID)
    const uuidDisplay = document.getElementById('operatorUUID');
    if (uuidDisplay && userProfile.id) {
        uuidDisplay.textContent = `ID: ${userProfile.id.substring(0, 8).toUpperCase()}`;
    }

    if (elements.missionLogList) {
        const history = userProfile.missionHistory || [];
        elements.missionLogList.innerHTML = history.length > 0 ?
            history.map(date => `<div class="mission-item">OPERACIÓN: SUNDAY ${date}</div>`).join('') :
            '<div class="mission-item">SIN ACTIVIDAD REGISTRADA</div>';
    }
};

export const renderClanView = async (userProfile, clans, allUsers, actions) => {
    const clanView = document.getElementById('clanView');
    if (!clanView || !userProfile) return;

    if (!userProfile.clan) {
        clanView.innerHTML = `
            <div class="clan-empty">
                <p>Actualmente no perteneces a ninguna fuerza de tareas.</p>
                <div class="clan-actions">
                    <button id="createClanBtn" class="btn btn--primary btn--sm">Crear Clan</button>
                    <button id="joinClanBtn" class="btn btn--outline btn--sm">Unirse a Clan</button>
                </div>
            </div>
        `;
        document.getElementById('createClanBtn')?.addEventListener('click', actions.createClan);
        document.getElementById('joinClanBtn')?.addEventListener('click', actions.joinClan);
    } else {
        const clanData = clans.find(c => c.name === userProfile.clan) || { level: 1 };
        const members = allUsers.filter(u => u.clan === userProfile.clan);
        
        clanView.innerHTML = `
            <div class="clan-info">
                <div class="clan-header">
                    <span class="clan-tag" style="background:var(--bronze); color:black; padding:2px 6px; font-weight:bold; border-radius:2px; font-size:0.7em; margin-right:8px;">[${userProfile.clan.substring(0, 3).toUpperCase()}]</span>
                    <span class="clan-name" style="font-family:var(--font-display); font-size:0.9rem;">${userProfile.clan}</span>
                </div>
                
                <div class="clan-members" style="margin-top:15px; border-top: 1px solid var(--border); padding-top:10px;">
                    <h5 style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Miembros de la Unidad</h5>
                    <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:4px;">
                        ${members.map(m => `
                            <li style="font-size:0.75rem; display:flex; justify-content:space-between; align-items:center;">
                                <span><i class="fas fa-user-shield" style="margin-right:5px; color:var(--white); font-size:0.8em;"></i> ${m.callsign || m.name}</span>
                                <span style="font-size:0.7em; opacity:0.6;">LVL ${Math.floor(m.exp || 0)}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="clan-stats" style="margin-top:15px; font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center; justify-content:space-between;">
                    <span>Nivel de Clan: <span style="color:var(--white)">${clanData.level || 1}</span></span>
                    <button id="leaveClanBtn" class="btn btn--outline btn--xs">Abandonar</button>
                </div>
            </div>
        `;
        document.getElementById('leaveClanBtn')?.addEventListener('click', actions.leaveClan);
    }
};
