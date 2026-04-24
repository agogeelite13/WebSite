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
        'sniper': 'TIRADOR SELECTO',
        'leader': 'LÍDER DE ESCUADRA'
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
        if (elements.profLevel) {
            elements.profLevel.textContent = 'MAX';
            elements.profLevel.style.fontSize = '0.9rem';
        }
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
        
        if (elements.profLevel) {
            if (level >= 20) {
                elements.profLevel.textContent = 'MAX';
                elements.profLevel.style.fontSize = '0.9rem';
            } else {
                elements.profLevel.textContent = level;
            }
        }
        if (elements.profXPText) elements.profXPText.textContent = level >= 20 ? 'NIVEL MÁXIMO' : `${currentLevelXP} / 5 XP`;
        if (elements.profXPFill) elements.profXPFill.style.width = level >= 20 ? '100%' : `${xpPercent}%`;
    }

    // Use custom avatar if user has one saved, otherwise use rank-based
    const finalAvatar = userProfile.avatar || avatarSrc;
    const avatarImg = document.getElementById('profAvatar');
    const avatarFrame = document.getElementById('operatorAvatarFrame');
    if (avatarImg) avatarImg.src = finalAvatar;
    if (avatarFrame) {
        avatarFrame.className = 'operator-avatar-frame';
        avatarFrame.classList.add(frameClass);
    }

    // Avatar Picker: highlight current & attach click handlers
    document.querySelectorAll('.avatar-picker__option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.avatar === finalAvatar);
        opt.onclick = async () => {
            const newAvatar = opt.dataset.avatar;
            if (avatarImg) avatarImg.src = newAvatar;
            document.querySelectorAll('.avatar-picker__option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            // Save to DB
            const api = window._api_instance;
            if (api) await api.saveProfile({ id: userProfile.id, avatar: newAvatar });
        };
    });

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
        let history = userProfile.missionHistory || [];
        
        // Demo for Admin (Requested by user)
        if (userProfile.role === 'admin' && history.length === 0) {
            history = [
                { date: '2026-04-12', operation: 'OPERACIÓN TERMITA', role: 'LÍDER DE ESCUADRA' },
                { date: '2026-04-05', operation: 'FUEGO CRUZADO', role: 'FRANCOTIRADOR' },
                { date: '2026-03-29', operation: 'TORMENTA DE ARENA', role: 'MÉDICO' }
            ];
        }

        elements.missionLogList.innerHTML = history.length > 0 ?
            history.map(item => {
                const isObj = typeof item === 'object';
                const missionName = isObj ? item.operation : `OPERACIÓN: SUNDAY ${item}`;
                const roleText = (isObj && item.role) ? `<span class="log-role">${item.role}</span>` : '';
                const dateText = isObj ? item.date : item;
                
                return `
                    <div class="mission-log-entry">
                        <div class="log-header">
                            <span class="log-date">${dateText}</span>
                            ${roleText}
                        </div>
                        <div class="log-op-name">${missionName}</div>
                    </div>
                `;
            }).join('') :
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

/** --- SOCIAL & COMMUNITY LOGIC --- **/

export const initSocial = async (api, currentUser) => {
    const viewMyProfileBtn = document.getElementById('viewMyProfileBtn');
    const viewCommunityBtn = document.getElementById('viewCommunityBtn');
    const communityView = document.getElementById('communityView');
    const profileMain = document.querySelector('.profile-card--premium'); // The main profile content

    const userSearchInput = document.getElementById('userSearchInput');
    const userSearchBtn = document.getElementById('userSearchBtn');
    const userSearchResults = document.getElementById('userSearchResults');

    if (!viewCommunityBtn || !currentUser) return;

    // View Toggles
    viewMyProfileBtn?.addEventListener('click', () => {
        viewMyProfileBtn.classList.add('active');
        viewCommunityBtn.classList.remove('active');
        communityView.classList.add('hidden');
        profileMain.classList.remove('hidden');
    });

    viewCommunityBtn?.addEventListener('click', () => {
        viewCommunityBtn.classList.add('active');
        viewMyProfileBtn.classList.remove('active');
        communityView.classList.remove('hidden');
        profileMain.classList.add('hidden');
        renderFriends(api, currentUser);
    });

    // Search Logic
    const handleSearch = async () => {
        const query = userSearchInput.value.trim();
        console.log('Iniciando búsqueda de:', query);
        if (query.length < 2) {
            console.warn('Búsqueda demasiado corta');
            return;
        }
        userSearchResults.innerHTML = '<p class="u-text-center u-small">Buscando...</p>';
        const users = await api.searchUsers(query);
        console.log('Usuarios encontrados:', users.length);
        renderSearchResults(users, api, currentUser);
    };

    userSearchBtn?.addEventListener('click', handleSearch);
    userSearchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
};

const renderSearchResults = (users, api, currentUser) => {
    const container = document.getElementById('userSearchResults');
    if (!container) return;

    if (users.length === 0) {
        container.innerHTML = '<p class="u-text-center u-small">No se encontraron operadores.</p>';
        return;
    }

    container.innerHTML = users.filter(u => u.id !== currentUser.id).map(user => `
        <div class="user-card">
            <img src="${user.avatar_url || 'avatars/avatar_recluta.png'}" class="user-card__avatar">
            <h5 class="user-card__name">${user.callsign || user.name}</h5>
            <p class="user-card__meta">${user.specialty || 'RECLUTA'} | LVL ${Math.floor(user.exp || 0)}</p>
            <div class="user-card__actions">
                <button class="btn btn--primary btn--sm user-card__btn" onclick="sendFriendRequest('${user.id}')">AGREGAR</button>
            </div>
        </div>
    `).join('');

    window.sendFriendRequest = async (friendId) => {
        if (await api.sendFriendRequest(currentUser.id, friendId)) {
            alert('Solicitud enviada!');
            handleSearch(); // Refresh results to hide or show status
        }
    };
};

export const renderFriends = async (api, currentUser) => {
    const friendsList = document.getElementById('friendsList');
    const pendingArea = document.getElementById('pendingRequestsArea');
    const pendingList = document.getElementById('pendingRequestsList');

    if (!friendsList || !currentUser) return;

    const friendships = await api.getFriendships(currentUser.id);
    
    const pending = friendships.filter(f => f.status === 'pending' && f.friend_id === currentUser.id);
    const accepted = friendships.filter(f => f.status === 'accepted');

    // Handle Pending
    if (pending.length > 0) {
        pendingArea.classList.remove('hidden');
        pendingList.innerHTML = pending.map(f => {
            const u = f.user;
            return `
                <div class="user-card" style="border-color:var(--gold);">
                    <img src="${u.avatar_url || 'avatars/avatar_recluta.png'}" class="user-card__avatar">
                    <h5 class="user-card__name">${u.callsign}</h5>
                    <div class="user-card__actions">
                        <button class="btn btn--primary btn--sm" onclick="acceptFriend('${f.id}')">ACEPTAR</button>
                        <button class="btn btn--outline btn--sm" onclick="rejectFriend('${f.id}')">RECHAZAR</button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        pendingArea.classList.add('hidden');
    }

    // Handle Friends
    if (accepted.length > 0) {
        friendsList.innerHTML = accepted.map(f => {
            const isUserA = f.user_id === currentUser.id;
            const u = isUserA ? f.friend : f.user;
            return `
                <div class="user-card">
                    <img src="${u.avatar_url || 'avatars/avatar_recluta.png'}" class="user-card__avatar">
                    <h5 class="user-card__name">${u.callsign}</h5>
                    <p class="user-card__meta">${u.specialty} | LVL ${Math.floor(u.exp || 0)}</p>
                    <div class="user-card__actions">
                        <button class="btn btn--outline btn--sm" onclick="viewFriendProfile('${u.id}')">VER FICHA</button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        friendsList.innerHTML = '<p class="u-text-muted u-small">Aún no tienes amigos agregados.</p>';
    }

    window.acceptFriend = async (id) => {
        if (await api.updateFriendship(id, 'accepted')) renderFriends(api, currentUser);
    };
    window.rejectFriend = async (id) => {
        if (confirm('¿Rechazar esta solicitud?')) {
            if (await api.deleteFriendship(id)) renderFriends(api, currentUser);
        }
    };
    window.viewFriendProfile = async (userId) => {
        const user = await api.getProfile(userId);
        if (user) {
            const modal = document.getElementById('operatorCardModal');
            document.getElementById('opCardCallsign').textContent = user.callsign || '-';
            document.getElementById('opCardAvatar').src = user.avatar_url || 'avatars/avatar_recluta.png';
            document.getElementById('opCardSpecialty').textContent = (user.specialty || 'Asalto').toUpperCase();
            document.getElementById('opCardMissions').textContent = user.exp || 0;
            document.getElementById('opCardXP').textContent = user.exp || 0;
            
            const factionMap = { 'none': 'SIN FACCIÓN', 'taskforce': 'TASK FORCE', 'uprising': 'UPRISING' };
            document.getElementById('opCardFaction').textContent = factionMap[user.faction] || 'SIN FACCIÓN';
            
            const rankPill = document.getElementById('opCardRank');
            const exp = user.exp || 0;
            let rank = 'recluta';
            if (exp >= 30) rank = 'comandante';
            else if (exp >= 20) rank = 'veterano';
            else if (exp >= 10) rank = 'operador';
            
            rankPill.textContent = rank.toUpperCase();
            rankPill.setAttribute('data-rank', rank);
            
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            
            document.getElementById('closeOpCard').onclick = () => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            };
        }
    };
};

