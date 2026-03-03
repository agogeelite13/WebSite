/**
 * AGOGE ELITE — Main Script v2
 * Modules: scrollProgress, stickyHeader, hamburger, reveal,
 *          activeNav, contactForm, smoothScroll, parallax,
 *          statsCounter, calendar, lightbox, faq
 */

'use strict';

/* =============================================
   MODULE: Scroll Progress Bar
   ============================================= */
const initScrollProgress = () => {
    const bar = document.getElementById('scrollProgress');
    const topBarDate = document.getElementById('topBarDate');
    if (bar) {
        const update = () => {
            const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
            bar.style.width = `${Math.min(pct, 100)}%`;
        };
        window.addEventListener('scroll', update, { passive: true });
    }

    if (topBarDate) {
        const d = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        topBarDate.textContent = d.toLocaleDateString('es-ES', options).toUpperCase();
    }
};

/* =============================================
   MODULE: Sticky Header
   ============================================= */
const initStickyHeader = () => {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', update, { passive: true });
    update();
};

/* =============================================
   MODULE: Hamburger Menu
   ============================================= */
const initHamburger = () => {
    const btn = document.getElementById('hamburger');
    const nav = document.querySelector('.nav');
    if (!btn || !nav) return;

    const close = () => {
        btn.classList.remove('is-active');
        nav.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Abrir menú');
        document.body.classList.remove('nav-open');
    };

    const open = () => {
        btn.classList.add('is-active');
        nav.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Cerrar menú');
        document.body.classList.add('nav-open');
    };

    btn.addEventListener('click', () => nav.classList.contains('is-open') ? close() : open());
    document.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', close));
    document.addEventListener('click', e => {
        if (nav.classList.contains('is-open') && !nav.contains(e.target) && !btn.contains(e.target)) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
};

/* =============================================
   MODULE: Scroll Reveal
   ============================================= */
const initReveal = () => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
};

/* =============================================
   MODULE: Active Nav on Scroll
   ============================================= */
const initActiveNav = () => {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav__link');
    if (!sections.length || !links.length) return;
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.id;
                links.forEach(l => {
                    l.classList.toggle('nav__link--active', l.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => io.observe(s));
};

/* =============================================
   MODULE: Contact Form Feedback
   ============================================= */
const initContactForm = () => {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.textContent;
        btn.textContent = 'Mensaje enviado ✓';
        btn.disabled = true;
        btn.classList.add('btn--sent');
        setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.classList.remove('btn--sent'); form.reset(); }, 3500);
    });
};

/* =============================================
   MODULE: Smooth Scroll
   ============================================= */
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
};

/* =============================================
   MODULE: Hero Parallax
   ============================================= */
const initParallax = () => {
    const layer = document.getElementById('heroParallax');
    if (!layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const update = () => {
        const scrolled = window.scrollY;
        // Move the bg layer at 40% of scroll speed for parallax depth
        layer.style.transform = `translateY(${scrolled * 0.4}px)`;
    };

    window.addEventListener('scroll', update, { passive: true });
};

/* =============================================
   MODULE: Stats Counter
   ============================================= */
const initStatsCounter = () => {
    const nums = document.querySelectorAll('.stat-item__num[data-target]');
    if (!nums.length) return;

    const animateCount = (el) => {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = `${current}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                animateCount(e.target);
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });

    nums.forEach(el => io.observe(el));
};

/* =============================================
   MODULE: Mission Countdown (PHASE 8)
   ============================================= */
const initCountdown = () => {
    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minsEl = document.getElementById('countMins');
    if (!daysEl) return;

    const updateTimer = () => {
        const now = new Date();
        const nextSunday = new Date();
        nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
        nextSunday.setHours(10, 0, 0, 0);

        if (now > nextSunday) {
            nextSunday.setDate(nextSunday.getDate() + 7);
        }

        const diff = nextSunday - now;
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        daysEl.textContent = String(d).padStart(2, '0');
        hoursEl.textContent = String(h).padStart(2, '0');
        minsEl.textContent = String(m).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 60000);
};

/* =============================================
   MODULE: Calendar
   ============================================= */
const initCalendar = () => {
    const container = document.getElementById('calendar');
    if (!container) return;

    const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const DAYS_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    let current = new Date();
    let viewYear = current.getFullYear();
    let viewMonth = current.getMonth();

    const render = () => {
        const today = new Date();
        const firstDay = new Date(viewYear, viewMonth, 1);
        let startOffset = (firstDay.getDay() + 6) % 7;
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

        let html = `
      <div class="cal-header">
        <button class="cal-nav" id="calPrev" aria-label="Mes anterior">&#8249;</button>
        <span class="cal-header__title">${MONTHS_ES[viewMonth]} ${viewYear}</span>
        <button class="cal-nav" id="calNext" aria-label="Mes siguiente">&#8250;</button>
      </div>
      <div class="cal-days-header">${DAYS_ES.map(d => `<span>${d}</span>`).join('')}</div>
      <div class="cal-grid">
    `;

        for (let i = startOffset - 1; i >= 0; i--) {
            html += `<div class="cal-cell cal-cell--other-month">${daysInPrev - i}</div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(viewYear, viewMonth, d);
            const isSunday = date.getDay() === 0;
            const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            let cls = 'cal-cell';
            if (isSunday) cls += ' cal-cell--sunday';
            if (isToday) cls += ' cal-cell--today';
            html += `<div class="${cls}" aria-label="${d} de ${MONTHS_ES[viewMonth]}${isSunday ? ' — Partida pública' : ''}">${d}</div>`;
        }

        const totalCells = startOffset + daysInMonth;
        const remainder = totalCells % 7;
        if (remainder !== 0) {
            for (let d = 1; d <= 7 - remainder; d++) {
                html += `<div class="cal-cell cal-cell--other-month">${d}</div>`;
            }
        }

        html += `</div>`;
        container.innerHTML = html;

        document.getElementById('calPrev').addEventListener('click', () => {
            viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
            render();
        });
        document.getElementById('calNext').addEventListener('click', () => {
            viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
            render();
        });
    };

    render();
};

/* =============================================
   MODULE: Gallery Lightbox
   ============================================= */
const initLightbox = () => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    if (!lightbox || !lightboxImg || !closeBtn) return;

    const open = (src, alt) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.classList.add('is-open');
        document.body.classList.add('nav-open');
    };

    const close = () => {
        lightbox.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        lightboxImg.src = '';
    };

    document.querySelectorAll('.gallery-item img, .insta-item img').forEach(img => {
        img.addEventListener('click', (e) => {
            if (img.closest('.insta-item')) {
                // If it's an insta item, we want to allow the link to work too or just show in lightbox?
                // Letting it work as a lightbox for now as it looks cool
                e.preventDefault();
            }
            open(img.src, img.alt);
        });
    });

    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close(); });
};

/* =============================================
   MODULE: FAQ Accordion
   ============================================= */
const initFAQ = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Close all others
            faqItems.forEach(i => {
                i.classList.remove('is-open');
                i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Toggle current
            if (!isOpen) {
                item.classList.add('is-open');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
};


/* =============================================
   MODULE: Auth & Operator Dashboard
   ============================================= */
const initAuth = () => {
    // Elements
    const authTrigger = document.getElementById('authTrigger');
    const authModal = document.getElementById('authModal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toRegister = document.getElementById('toRegister');
    const toLogin = document.getElementById('toLogin');
    const loginFormWrap = document.getElementById('loginFormWrap');
    const registerFormWrap = document.getElementById('registerFormWrap');
    const recoveryFormWrap = document.getElementById('recoveryFormWrap');
    const toRecover = document.getElementById('toRecover');
    const backToLogin = document.getElementById('backToLogin');
    const recoveryForm = document.getElementById('recoveryForm');

    const userMenu = document.getElementById('userMenu');
    const userNameDisplay = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboard = document.getElementById('dashboard');
    const adminBtn = document.getElementById('adminBtn');
    const adminPanel = document.getElementById('adminPanel');
    const userMissionView = document.getElementById('userMissionView');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const adminUserList = document.getElementById('adminUserList');
    const adminEnrollList = document.getElementById('adminEnrollList');

    const enrollBtn = document.getElementById('enrollBtn');
    const enrollStatus = document.getElementById('enrollStatus');
    const playerCountEl = document.getElementById('playerCount');
    const nextMissionDateEl = document.getElementById('nextMissionDate');
    const rulesWaiver = document.getElementById('rulesWaiver');
    const enrollActionWrap = document.getElementById('enrollActionWrap');
    const userRankBadge = document.getElementById('userRankBadge');
    const userSpecialtyTag = document.getElementById('userSpecialtyTag');
    const profileBtn = document.getElementById('profileBtn');
    const profilePanel = document.getElementById('profilePanel');
    const closeProfileBtn = document.getElementById('closeProfileBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const profileViewMode = document.getElementById('profileViewMode');
    const profileEditForm = document.getElementById('profileEditForm');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const downloadManifestoBtn = document.getElementById('downloadManifestoBtn');
    const adminAforoCount = document.getElementById('adminAforoCount');
    const adminAforoProgress = document.getElementById('adminAforoProgress');
    const openIntelBtn = document.getElementById('openIntelBtn');
    const closeIntelBtn = document.getElementById('closeIntelBtn');
    const intelBoard = document.getElementById('intelBoard');
    const intelMapImg = document.getElementById('intelMapImg');

    // State
    let currentUser = JSON.parse(localStorage.getItem('agogeUser')) || null;
    let enrollments = JSON.parse(localStorage.getItem('agogeEnrollments')) || {}; // { dateStr: [emails] }
    let clans = JSON.parse(localStorage.getItem('agogeClans')) || [];

    // Helper: Get Next Sunday String
    const getNextSunday = () => {
        const d = new Date();
        d.setDate(d.getDate() + (7 - d.getDay()) % 7);
        if (d.getDay() !== 0 || (d.getHours() > 14)) d.setDate(d.getDate() + 7); // If today is Sun afternoon, move to next
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return d.toLocaleDateString('es-ES', options);
    };

    const getNextSundayKey = () => {
        const d = new Date();
        d.setDate(d.getDate() + (7 - d.getDay()) % 7);
        return d.toISOString().split('T')[0];
    };

    const ADMIN_EMAIL = 'admin@agoge.elite';
    const ADMIN_PASS = 'agoge2025';

    const updateUI = () => {
        if (currentUser) {
            authTrigger?.classList.add('hidden');
            userMenu?.classList.remove('hidden');
            if (userNameDisplay) userNameDisplay.textContent = currentUser.callsign || currentUser.name;
            dashboard?.classList.remove('hidden');

            // Admin button visibility
            if (currentUser.email === ADMIN_EMAIL) {
                adminBtn?.classList.remove('hidden');
            } else {
                adminBtn?.classList.add('hidden');
            }

            // Profile info populate (Dashboard snippet)
            if (userNameDisplay) userNameDisplay.textContent = currentUser.callsign || currentUser.name;
            updateProfileView();

            // Enrollment check
            const sunKey = getNextSundayKey();
            const list = enrollments[sunKey] || [];
            if (list.includes(currentUser.email)) {
                enrollBtn?.classList.add('hidden');
                enrollStatus?.classList.remove('hidden');
            } else {
                enrollBtn?.classList.remove('hidden');
                enrollStatus?.classList.add('hidden');
            }

            // Rank & Specialty Display
            if (userRankBadge) {
                const totalMissions = currentUser.exp || 0;
                let rank = 'RECLUTA';
                if (totalMissions >= 10) rank = 'ÉLITE';
                else if (totalMissions >= 6) rank = 'VETERANO';
                else if (totalMissions >= 3) rank = 'OPERADOR';
                userRankBadge.textContent = rank;
                userRankBadge.dataset.rank = rank.toLowerCase();
            }
            if (userSpecialtyTag) {
                const specMap = {
                    'assault': 'ASALTO',
                    'medic': 'MÉDICO',
                    'support': 'APOYO',
                    'sniper': 'TIRADOR'
                };
                userSpecialtyTag.textContent = specMap[currentUser.specialty] || 'ASALTO';
                userSpecialtyTag.dataset.specialty = currentUser.specialty || 'assault';
            }
        } else {
            authTrigger?.classList.remove('hidden');
            userMenu?.classList.add('hidden');
            dashboard?.classList.add('hidden');
            adminPanel?.classList.add('hidden');
            profilePanel?.classList.add('hidden');
            userMissionView?.classList.remove('hidden');
        }

        // Update count
        const sunKey = getNextSundayKey();
        const list = enrollments[sunKey] || [];
        if (playerCountEl) playerCountEl.textContent = list.length;
        if (nextMissionDateEl) nextMissionDateEl.textContent = getNextSunday();

        // Reset waiver
        if (rulesWaiver) rulesWaiver.checked = false;
        if (currentUser && list.includes(currentUser.email)) {
            enrollActionWrap?.classList.add('hidden');
        } else {
            enrollActionWrap?.classList.remove('hidden');
        }

        // Sub-renders
        renderClanLeaderboard();
        if (currentUser) {
            renderMedals();
        }
    };

    // INTEL BOARD LOGIC
    const openIntelMode = () => {
        if (!intelBoard) return;
        intelBoard.classList.remove('hidden');
        // If map image exists, show it, otherwise keep placeholder
        if (intelMapImg && intelMapImg.getAttribute('src')) {
            intelMapImg.classList.remove('hidden');
            document.querySelector('.intel-map-placeholder')?.classList.add('hidden');
        }
        renderVoting();
    };

    const closeIntelMode = () => {
        intelBoard?.classList.add('hidden');
    };

    openIntelBtn?.addEventListener('click', openIntelMode);
    closeIntelBtn?.addEventListener('click', closeIntelMode);

    // VOTING LOGIC
    const renderVoting = () => {
        const sunKey = getNextSundayKey();
        const votes = JSON.parse(localStorage.getItem(`agogeVotes_${sunKey}`) || '{}');
        const userVote = votes[currentUser?.email];
        const votingResults = document.getElementById('votingResults');
        const votingOptions = document.getElementById('votingOptions');
        const resultsList = document.getElementById('resultsList');

        if (userVote) {
            votingOptions?.classList.add('hidden');
            votingResults?.classList.remove('hidden');

            // Calculate totals
            const totals = {};
            Object.values(votes).forEach(v => totals[v] = (totals[v] || 0) + 1);
            const totalCount = Object.values(votes).length;

            if (resultsList) {
                const labels = { tdm: 'Eliminación', ctf: 'Bandera', vip: 'VIP', dom: 'Dominación' };
                resultsList.innerHTML = Object.entries(labels).map(([key, label]) => {
                    const count = totals[key] || 0;
                    const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
                    return `
                        <div class="result-item">
                            <div style="display:flex; justify-content:space-between; margin-top:5px;">
                                <span>${label}</span>
                                <span>${count}</span>
                            </div>
                            <div class="result-bar-wrap">
                                <div class="result-bar-fill" style="width: ${pct}%"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } else {
            votingOptions?.classList.remove('hidden');
            votingResults?.classList.add('hidden');
        }
    };

    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentUser) return;
            const sunKey = getNextSundayKey();
            const votes = JSON.parse(localStorage.getItem(`agogeVotes_${sunKey}`) || '{}');
            votes[currentUser.email] = btn.dataset.mode;
            localStorage.setItem(`agogeVotes_${sunKey}`, JSON.stringify(votes));
            renderVoting();
        });
    });

    const updateProfileView = () => {
        if (!currentUser) return;
        const profCallsign = document.getElementById('profCallsign');
        const profRealName = document.getElementById('profRealName');
        const profSpecialty = document.getElementById('profSpecialty');
        const profRank = document.getElementById('profRank');
        const profMissions = document.getElementById('profMissions');
        const profGear = document.getElementById('profGear');
        const profClan = document.getElementById('profClan');
        const missionLogList = document.getElementById('missionLogList');

        if (profCallsign) profCallsign.textContent = currentUser.callsign || '-';
        if (profRealName) profRealName.textContent = currentUser.name || '-';

        const gearMap = {
            'own': 'PROPIA',
            'complete': 'COMPLETO (25€)',
            'replica': 'RÉPLICA (20€)',
            'basic': 'BÁSICO (5€)'
        };
        if (profGear) profGear.textContent = gearMap[currentUser.gear] || 'PROPIA';
        if (profClan) profClan.textContent = currentUser.clan || 'SIN CLAN';

        const specMap = {
            'assault': 'ASALTO (FUSILERO)',
            'medic': 'MÉDICO DE CAMPO',
            'support': 'APOYO (SMG)',
            'sniper': 'TIRADOR SELECTO'
        };
        if (profSpecialty) profSpecialty.textContent = specMap[currentUser.specialty] || 'ASALTO';

        const totalMissions = (currentUser.exp || 0);
        let rankStr = 'RECLUTA';
        if (totalMissions >= 10) rankStr = 'ÉLITE';
        else if (totalMissions >= 6) rankStr = 'VETERANO';
        else if (totalMissions >= 3) rankStr = 'OPERADOR';

        if (profRank) profRank.textContent = rankStr;
        if (profMissions) profMissions.textContent = totalMissions;

        if (missionLogList) {
            const history = currentUser.missionHistory || [];
            missionLogList.innerHTML = history.length > 0 ?
                history.map(date => `<div class="mission-item">OPERACIÓN: SUNDAY ${date}</div>`).join('') :
                '<div class="mission-item">SIN ACTIVIDAD REGISTRADA</div>';
        }

        // Render Medals
        renderMedals();

        renderClanView?.();
    };

    const renderMedals = () => {
        const medalsList = document.getElementById('medalsList');
        if (!medalsList || !currentUser) return;

        const totalMissions = (currentUser.exp || 0);
        const hasClan = !!currentUser.clan;
        const isEnrolled = enrollments[getNextSundayKey()]?.includes(currentUser.email);

        const medals = [
            {
                id: 'spartan_shield',
                title: 'Escudo de Esparta',
                desc: 'Veteranía demostrada (10+ misiones)',
                unlocked: totalMissions >= 10,
                img: '/C:/Users/sergiolopez/.gemini/antigravity/brain/ef5c91d8-f873-4e2d-9e35-c99052363a61/agoge_medal_spartan_shield_1772470581102.png'
            },
            {
                id: 'spear_point',
                title: 'Punta de Lanza',
                desc: 'Primeros en el frente (Inscrito esta semana)',
                unlocked: isEnrolled,
                img: '/C:/Users/sergiolopez/.gemini/antigravity/brain/ef5c91d8-f873-4e2d-9e35-c99052363a61/agoge_medal_spear_point_1772470673963.png'
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
                unlocked: true, // Always true if logged in
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

    const updateAdminDashboard = () => {
        if (!adminUserList || !adminEnrollList) return;

        const allUsers = JSON.parse(localStorage.getItem('agoge_users') || '[]');
        const sunKey = getNextSundayKey();
        const enrolledEmails = enrollments[sunKey] || [];

        // Capacity Aforo Logic (20 slots)
        const maxAforo = 20;
        const currentCount = enrolledEmails.length;
        if (adminAforoCount) adminAforoCount.textContent = `${currentCount} / ${maxAforo}`;
        if (adminAforoProgress) adminAforoProgress.style.width = `${(currentCount / maxAforo) * 100}%`;

        // Users List
        adminUserList.innerHTML = allUsers.map(u => `
            <div class="admin-item">
                <div class="admin-item__info">
                    <span class="admin-item__name">${u.callsign || u.name} <small style="opacity:0.5; font-size:0.7em;">(${u.name})</small></span>
                    <span class="admin-item__sub">${u.email} — ${u.clan || 'sin clan'}</span>
                </div>
                <div class="admin-item__actions">
                    <button class="btn btn--primary btn--xs" onclick="adminEnrollUser('${u.email}')" ${enrolledEmails.includes(u.email) ? 'disabled' : ''}>
                        ${enrolledEmails.includes(u.email) ? 'INSCRITO' : 'INSCRIBIR'}
                    </button>
                </div>
            </div>
        `).join('') || '<p style="padding:15px; color:#666; font-size:0.8rem;">No hay usuarios registrados.</p>';

        // Enrollment List (including guests)
        adminEnrollList.innerHTML = enrolledEmails.map(email => {
            const isGuest = !email.includes('@');
            const u = isGuest ? { name: email, gear: (enrollments[`${sunKey}_gear`] || {})[email] || 'unknown' } : (allUsers.find(user => user.email === email) || { name: email });
            const gearMap = { 'own': 'PROPIA', 'complete': 'COMPLETO', 'replica': 'RÉPLICA', 'basic': 'BÁSICO' };
            const gearStr = u?.gear ? `<span style="color:var(--bronze); font-size:0.7em;">(${gearMap[u.gear] || 'N/A'})</span>` : '';
            return `
                <div class="admin-item">
                    <div class="admin-item__info">
                        <span class="admin-item__name">${u.callsign || u.name} ${gearStr}</span>
                        <span class="admin-item__sub">${isGuest ? 'INVITADO' : email}</span>
                    </div>
                    <button class="btn btn--outline btn--xs" onclick="adminUnenrollUser('${email}')">BORRAR</button>
                </div>
            `;
        }).join('') || '<p style="padding:15px; color:#666; font-size:0.8rem;">Nadie inscrito todavía.</p>';
    };

    // Events: Modal
    authTrigger?.addEventListener('click', () => authModal.classList.add('is-open'));
    const closeModal = () => authModal.classList.remove('is-open');
    [modalClose, modalOverlay].forEach(el => el?.addEventListener('click', closeModal));

    const showWrap = (wrap) => {
        [loginFormWrap, registerFormWrap, recoveryFormWrap].forEach(w => w?.classList.add('hidden'));
        wrap?.classList.remove('hidden');
    };

    toRegister?.addEventListener('click', () => showWrap(registerFormWrap));
    toLogin?.addEventListener('click', () => showWrap(loginFormWrap));
    toRecover?.addEventListener('click', () => showWrap(recoveryFormWrap));
    backToLogin?.addEventListener('click', () => showWrap(loginFormWrap));

    // Recovery Submit
    recoveryForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('recoverEmail').value;
        alert(`Instrucciones enviadas a ${email}. Revisa tu bandeja de entrada.`);
        showWrap(loginFormWrap);
    });

    // Events: Auth Logic
    registerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const callsign = document.getElementById('regCallsign').value;
        const specialty = document.getElementById('regSpecialty').value;
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPass').value;

        const users = JSON.parse(localStorage.getItem('agoge_users') || '[]');
        if (users.find(u => u.email === email)) {
            alert('Este email ya está registrado.');
            return;
        }

        const newUser = { name, callsign, specialty, email, pass, exp: 0 };
        users.push(newUser);
        localStorage.setItem('agoge_users', JSON.stringify(users));

        currentUser = newUser;
        localStorage.setItem('agogeUser', JSON.stringify(currentUser));
        updateUI();
        closeModal();
    });

    // Handle Login
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPass').value;

        const users = JSON.parse(localStorage.getItem('agoge_users') || '[]');

        // Mock Admin check
        let user;
        if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
            user = { name: 'Administrador', email: ADMIN_EMAIL };
        } else {
            user = users.find(u => u.email === email && u.pass === pass);
        }

        if (user) {
            closeModal();
            const scan = document.getElementById('scanOverlay');
            if (scan) {
                scan.classList.add('is-active');
                setTimeout(() => {
                    scan.classList.remove('is-active');
                    localStorage.setItem('agogeUser', JSON.stringify(user));
                    currentUser = user;
                    updateUI();
                }, 2500);
            } else {
                localStorage.setItem('agogeUser', JSON.stringify(user));
                currentUser = user;
                updateUI();
            }
        } else {
            alert('Credenciales inválidas. Acceso denegado.');
        }
    });

    // Admin Panel Controls
    adminBtn?.addEventListener('click', () => {
        userMissionView?.classList.add('hidden');
        profilePanel?.classList.add('hidden');
        adminPanel?.classList.remove('hidden');
        updateAdminDashboard();
    });

    closeAdminBtn?.addEventListener('click', () => {
        adminPanel?.classList.add('hidden');
        userMissionView?.classList.remove('hidden');
    });

    // Profile Panel Controls
    profileBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        userMissionView?.classList.add('hidden');
        adminPanel?.classList.add('hidden');
        profilePanel?.classList.remove('hidden');
        profileViewMode?.classList.remove('hidden');
        profileEditForm?.classList.add('hidden');
        updateProfileView();
    });

    closeProfileBtn?.addEventListener('click', () => {
        profilePanel?.classList.add('hidden');
        userMissionView?.classList.remove('hidden');
    });

    editProfileBtn?.addEventListener('click', () => {
        profileViewMode?.classList.add('hidden');
        profileEditForm?.classList.remove('hidden');

        // Fill form
        document.getElementById('editCallsign').value = currentUser.callsign || '';
        document.getElementById('editSpecialty').value = currentUser.specialty || 'assault';
        const radios = document.getElementsByName('editGear');
        radios.forEach(r => {
            if (r.value === (currentUser.gear || 'own')) r.checked = true;
        });
    });

    cancelEditBtn?.addEventListener('click', () => {
        profileViewMode?.classList.remove('hidden');
        profileEditForm?.classList.add('hidden');
    });

    profileEditForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCallsign = document.getElementById('editCallsign').value;
        const newSpecialty = document.getElementById('editSpecialty').value;
        const gearVal = document.querySelector('input[name="editGear"]:checked').value;

        currentUser.callsign = newCallsign;
        currentUser.specialty = newSpecialty;
        currentUser.gear = gearVal;

        // Persist
        localStorage.setItem('agogeUser', JSON.stringify(currentUser));

        const users = JSON.parse(localStorage.getItem('agoge_users')) || [];
        const idx = users.findIndex(u => u.email === currentUser.email);
        if (idx !== -1) {
            users[idx] = currentUser;
            localStorage.setItem('agoge_users', JSON.stringify(users));
        }

        profileViewMode?.classList.remove('hidden');
        profileEditForm?.classList.add('hidden');
        updateProfileView();
        updateUI();
    });

    // Admin Manifesto Download
    downloadManifestoBtn?.addEventListener('click', () => {
        const sunKey = getNextSundayKey();
        const list = enrollments[sunKey] || [];
        const users = JSON.parse(localStorage.getItem('agoge_users')) || [];

        let manifest = `MANIFESTO AGOGE ELITE - ${sunKey}\n`;
        manifest += `TOTAL INSCRITOS: ${list.length}\n`;
        manifest += `------------------------------------------\n`;

        list.forEach((email, i) => {
            const u = users.find(x => x.email === email);
            const gear = u?.gear === 'rental' ? '[ALQUILER]' : '[PROPIA]';
            manifest += `${i + 1}. ${u?.callsign || 'N/A'} (${u?.name || email}) - ${gear}\n`;
        });

        const blob = new Blob([manifest], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `manifesto_agoge_${sunKey}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Mobile Dropdowns
    document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                const parent = trigger.parentElement;
                parent.classList.toggle('is-open');
            }
        });
    });

    logoutBtn?.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('agogeUser');
        updateUI();
    });

    // Events: Enrollment
    enrollBtn?.addEventListener('click', () => {
        if (!currentUser) return;
        if (!rulesWaiver || !rulesWaiver.checked) {
            alert('Debes aceptar la normativa de seguridad antes de inscribirte.');
            return;
        }

        const sunKey = getNextSundayKey();
        const maxAforo = 20;
        if (!enrollments[sunKey]) enrollments[sunKey] = [];

        // BUG FIX: Double Enrollment check
        if (enrollments[sunKey].includes(currentUser.email)) {
            alert('Ya estás inscrito para esta misión.');
            return;
        }

        if (enrollments[sunKey].length >= maxAforo) {
            alert('AFORO COMPLETO: No quedan plazas para esta misión. Inténtalo de nuevo la próxima semana.');
            return;
        }

        // Enrollment Logic
        enrollments[sunKey].push(currentUser.email);
        localStorage.setItem('agogeEnrollments', JSON.stringify(enrollments));

        // Clan Multiplier Logic
        let xpGained = 1;
        let socialXpGained = 1;
        if (currentUser.clan) {
            const clanMembers = JSON.parse(localStorage.getItem('agoge_users') || [])
                .filter(u => u.clan === currentUser.clan && enrollments[sunKey].includes(u.email));

            if (clanMembers.length >= 2) {
                xpGained = 1.5; // Multiplier for playing together
                socialXpGained = 2; // Social level boost
                console.log(`[CLAN BOOST] Multiplier x1.5 applied for ${currentUser.clan}`);
            }
        }

        // Experience & Mission Log Gain
        currentUser.exp = (currentUser.exp || 0) + xpGained;
        currentUser.socialLevel = (currentUser.socialLevel || 0) + socialXpGained;

        if (!currentUser.missionHistory) currentUser.missionHistory = [];
        if (!currentUser.missionHistory.includes(sunKey)) {
            currentUser.missionHistory.unshift(sunKey);
        }

        localStorage.setItem('agogeUser', JSON.stringify(currentUser));

        // Update in global list
        const users = JSON.parse(localStorage.getItem('agoge_users') || '[]');
        const uIdx = users.findIndex(u => u.email === currentUser.email);
        if (uIdx !== -1) {
            users[uIdx].exp = currentUser.exp;
            users[uIdx].socialLevel = currentUser.socialLevel;
            users[uIdx].missionHistory = currentUser.missionHistory;
            localStorage.setItem('agoge_users', JSON.stringify(users));
        }

        updateUI();
    });

    // CLAN LOGIC
    const renderClanView = () => {
        const clanView = document.getElementById('clanView');
        if (!clanView) return;

        if (!currentUser.clan) {
            clanView.innerHTML = `
                <div class="clan-empty">
                    <p>Actualmente no perteneces a ninguna fuerza de tareas.</p>
                    <div class="clan-actions">
                        <button id="createClanBtn" class="btn btn--primary btn--sm">Crear Clan</button>
                        <button id="joinClanBtn" class="btn btn--outline btn--sm">Unirse a Clan</button>
                    </div>
                </div>
            `;
            document.getElementById('createClanBtn')?.addEventListener('click', createClan);
            document.getElementById('joinClanBtn')?.addEventListener('click', joinClan);
        } else {
            const clanData = clans.find(c => c.name === currentUser.clan) || { level: 1 };
            clanView.innerHTML = `
                <div class="clan-info">
                    <div class="clan-header">
                        <span class="clan-tag" style="background:var(--bronze); color:black; padding:2px 6px; font-weight:bold; border-radius:2px; font-size:0.7em; margin-right:8px;">[${currentUser.clan.substring(0, 3).toUpperCase()}]</span>
                        <span class="clan-name" style="font-family:var(--font-display); font-size:0.9rem;">${currentUser.clan}</span>
                    </div>
                    <div class="clan-stats" style="margin-top:10px; font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center; justify-content:space-between;">
                        <span>Nivel de Clan: <span style="color:var(--white)">${clanData.level || 1}</span></span>
                        <button id="leaveClanBtn" class="btn btn--outline btn--xs">Abandonar</button>
                    </div>
                </div>
            `;
            document.getElementById('leaveClanBtn')?.addEventListener('click', leaveClan);
        }
    };

    const createClan = () => {
        const name = prompt('Nombre de tu nueva Fuerza de Tareas (Clan):');
        if (!name) return;
        if (clans.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            alert('Ese nombre ya está en uso por otra unidad.');
            return;
        }
        const newClan = { name, level: 1, members: [currentUser.email] };
        clans.push(newClan);
        localStorage.setItem('agogeClans', JSON.stringify(clans));

        currentUser.clan = name;
        localStorage.setItem('agogeUser', JSON.stringify(currentUser));

        const users = JSON.parse(localStorage.getItem('agoge_users') || '[]');
        const uIdx = users.findIndex(u => u.email === currentUser.email);
        if (uIdx !== -1) {
            users[uIdx].clan = name;
            localStorage.setItem('agoge_users', JSON.stringify(users));
        }
        updateProfileView();
    };

    const joinClan = () => {
        const name = prompt('Ingresa el nombre del Clan al que deseas unirte:');
        if (!name) return;
        const clan = clans.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (!clan) {
            alert('Esa fuerza de tareas no existe en nuestros registros.');
            return;
        }
        clan.members.push(currentUser.email);
        localStorage.setItem('agogeClans', JSON.stringify(clans));

        currentUser.clan = clan.name;
        localStorage.setItem('agogeUser', JSON.stringify(currentUser));

        const users = JSON.parse(localStorage.getItem('agoge_users') || '[]');
        const uIdx = users.findIndex(u => u.email === currentUser.email);
        if (uIdx !== -1) {
            users[uIdx].clan = clan.name;
            localStorage.setItem('agoge_users', JSON.stringify(users));
        }
        updateProfileView();
    };

    const leaveClan = () => {
        if (!confirm('¿Seguro que deseas abandonar tu unidad?')) return;
        currentUser.clan = null;
        localStorage.setItem('agogeUser', JSON.stringify(currentUser));
        const users = JSON.parse(localStorage.getItem('agoge_users') || '[]');
        const uIdx = users.findIndex(u => u.email === currentUser.email);
        if (uIdx !== -1) {
            users[uIdx].clan = null;
            localStorage.setItem('agoge_users', JSON.stringify(users));
        }
        updateProfileView();
    };

    // ADMIN MANUAL TOOLS
    window.adminEnrollUser = (email) => {
        const sunKey = getNextSundayKey();
        if (!enrollments[sunKey]) enrollments[sunKey] = [];
        if (!enrollments[sunKey].includes(email)) {
            enrollments[sunKey].push(email);
            localStorage.setItem('agogeEnrollments', JSON.stringify(enrollments));
            updateAdminDashboard();
            updateUI();
        }
    };

    window.adminUnenrollUser = (email) => {
        const sunKey = getNextSundayKey();
        if (enrollments[sunKey]) {
            enrollments[sunKey] = enrollments[sunKey].filter(e => e !== email);
            localStorage.setItem('agogeEnrollments', JSON.stringify(enrollments));
            updateAdminDashboard();
            updateUI();
        }
    };

    const addManualBtn = document.getElementById('addManualBtn');
    addManualBtn?.addEventListener('click', () => {
        const nameInput = document.getElementById('manualNameInput');
        const gearSelect = document.getElementById('manualGearSelect');
        const value = nameInput.value.trim();
        if (!value) return;

        const sunKey = getNextSundayKey();
        if (!enrollments[sunKey]) enrollments[sunKey] = [];

        // If it's a guest name (not email)
        if (!enrollments[sunKey].includes(value)) {
            enrollments[sunKey].push(value);
            // Store gear for guests separately
            if (!enrollments[`${sunKey}_gear`]) enrollments[`${sunKey}_gear`] = {};
            enrollments[`${sunKey}_gear`][value] = gearSelect.value;

            localStorage.setItem('agogeEnrollments', JSON.stringify(enrollments));
            nameInput.value = '';
            updateAdminDashboard();
            updateUI();
        }
    });

    const renderClanLeaderboard = () => {
        const leaderboardBody = document.getElementById('clanLeaderboardBody');
        if (!leaderboardBody) return;

        const allUsers = JSON.parse(localStorage.getItem('agoge_users') || '[]');

        const clanStats = clans.map(clan => {
            const members = allUsers.filter(u => u.clan === clan.name);
            const totalXP = members.reduce((sum, u) => sum + (u.exp || 0), 0);
            const avgMissions = members.length > 0 ? (totalXP / members.length).toFixed(1) : 0;

            return {
                name: clan.name,
                membersCount: members.length,
                totalXP: totalXP,
                socialLevel: avgMissions
            };
        });

        clanStats.sort((a, b) => b.totalXP - a.totalXP);

        leaderboardBody.innerHTML = clanStats.map((clan, idx) => `
            <tr>
                <td class="leader-pos">#${idx + 1}</td>
                <td class="leader-clan-name">${clan.name}</td>
                <td class="leader-stat">${clan.membersCount}</td>
                <td><span class="rank-pill">NIVEL ${Math.floor(clan.socialLevel)}</span></td>
                <td class="leader-stat">${clan.totalXP} XP</td>
            </tr>
        `).join('');
    };
};

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initStickyHeader();
    initHamburger();
    initReveal();
    initActiveNav();
    initContactForm();
    initSmoothScroll();
    initParallax();
    initStatsCounter();
    initCalendar();
    initLightbox();
    initFAQ();
    initAuth();
    initCountdown();
});
