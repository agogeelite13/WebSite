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
            icon: 'fas fa-users-crown'
        },
        {
            id: 'loyalty',
            title: 'Lealtad Agoge',
            desc: 'Compromiso total (Registrado)',
            unlocked: true,
            icon: 'fas fa-helmet-battle'
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

    // Advanced Level & XP Logic
    const missions = (userProfile.exp || 0);
    const baseXP = missions * 100;
    const clanBonus = userProfile.clan ? 50 : 0;
    const totalXP = baseXP + clanBonus;
    
    // Level Curve: 500 XP per level for now (linear but expandable)
    const level = Math.floor(totalXP / 500) + 1;
    const currentLevelXP = (level - 1) * 500;
    const nextLevelXP = level * 500;
    const progressInLevel = totalXP - currentLevelXP;
    const percent = (progressInLevel / 500) * 100;

    let rankStr = 'RECLUTA';
    if (level >= 10) rankStr = 'ÉLITE';
    else if (level >= 6) rankStr = 'VETERANO';
    else if (level >= 3) rankStr = 'OPERADOR';

    if (elements.profRank) elements.profRank.textContent = rankStr;
    if (elements.profLevel) elements.profLevel.textContent = `NIVEL ${level}`;
    if (elements.profXPText) elements.profXPText.textContent = `${progressInLevel} / 500 XP`;
    if (elements.profXPFill) elements.profXPFill.style.width = `${percent}%`;
    if (elements.profMissions) elements.profMissions.textContent = missions;

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
