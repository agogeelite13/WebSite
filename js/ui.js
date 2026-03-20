/**
 * AGOGE ELITE - UI Components Module
 */

export const initScrollProgress = () => {
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

export const initStickyHeader = () => {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', update, { passive: true });
    update();
};

export const initHamburger = () => {
    const btn = document.getElementById('hamburger');
    const nav = document.querySelector('.nav');
    if (!btn || !nav) return;

    const close = () => {
        btn.classList.remove('is-active');
        nav.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Abrir menú');
        document.body.classList.remove('nav-open');
        // Close any open dropdowns too
        document.querySelectorAll('.nav__dropdown').forEach(d => d.classList.remove('is-active'));
    };

    const open = () => {
        btn.classList.add('is-active');
        nav.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Cerrar menú');
        document.body.classList.add('nav-open');
    };

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.contains('is-open') ? close() : open();
    });

    // Only close if NOT a dropdown trigger
    document.querySelectorAll('.nav__link').forEach(l => {
        l.addEventListener('click', () => {
            if (!l.classList.contains('dropdown-trigger')) {
                close();
            }
        });
    });

    document.addEventListener('click', e => {
        if (nav.classList.contains('is-open') && !nav.contains(e.target) && !btn.contains(e.target)) close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
};

export const initDropdowns = () => {
    const triggers = document.querySelectorAll('.dropdown-trigger');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                const parent = trigger.closest('.nav__dropdown');
                const isOpen = parent.classList.contains('is-active');
                
                // Close other dropdowns
                document.querySelectorAll('.nav__dropdown').forEach(d => d.classList.remove('is-active'));
                
                if (!isOpen) {
                    parent.classList.add('is-active');
                    trigger.setAttribute('aria-expanded', 'true');
                } else {
                    trigger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
};

export const initReveal = () => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
};

export const initActiveNav = () => {
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

export const initContactForm = () => {
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

export const initSmoothScroll = () => {
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

export const initParallax = () => {
    const layer = document.getElementById('heroParallax');
    if (!layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const update = () => {
        const scrolled = window.scrollY;
        layer.style.transform = `translateY(${scrolled * 0.4}px)`;
    };
    window.addEventListener('scroll', update, { passive: true });
};

export const initStatsCounter = () => {
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

export const initCountdown = () => {
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

export const initCalendar = () => {
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

export const initLightbox = () => {
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
            if (img.closest('.insta-item')) e.preventDefault();
            open(img.src, img.alt);
        });
    });

    closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close(); });
};

export const initFAQ = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');
            faqItems.forEach(i => {
                i.classList.remove('is-open');
                i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('is-open');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });
};

export const initTacticalMap = () => {
    const svg = document.getElementById('mapHotspots');
    const tooltip = document.getElementById('mapTooltip');
    const container = document.querySelector('.intel-map-container');
    if (!svg || !tooltip || !container) return;

    const hotspots = [
        { x: 300, y: 200, label: 'ALPHA', desc: 'Zona de Oficinas - Control de documentación.' },
        { x: 850, y: 450, label: 'BRAVO', desc: 'Almacén Principal - Punto de extracción habilitado.' },
        { x: 100, y: 700, label: 'SPAWN TF', desc: 'Punto de despliegue Task Force.' },
        { x: 1100, y: 150, label: 'SPAWN UP', desc: 'Punto de despliegue Uprising.' }
    ];

    svg.innerHTML = hotspots.map((h, i) => `
        <g class="map-hotspot" data-index="${i}" transform="translate(${h.x}, ${h.y})" style="cursor:pointer; pointer-events:all;">
            <circle r="12" fill="rgba(205, 127, 50, 0.6)" stroke="var(--bronze)" stroke-width="2" />
            <rect x="20" y="-12" width="${h.label.length * 9 + 10}" height="24" fill="rgba(0,0,0,0.85)" stroke="var(--border)" rx="4" />
            <text x="25" y="5" class="hotspot-text" style="fill:var(--white); font-family:var(--font-display); font-size:14px; font-weight:bold; pointer-events:none;">${h.label}</text>
        </g>
    `).join('');

    svg.querySelectorAll('.map-hotspot').forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const index = el.dataset.index;
            const h = hotspots[index];
            tooltip.innerHTML = `<strong>${h.label}</strong><br>${h.desc}`;
            tooltip.classList.remove('hidden');
            
            // Interaction: Pulse effect or sound could go here
        });

        el.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left + 15;
            const y = e.clientY - rect.top + 15;
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        });

        el.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
    });
};

export const initTerminalLog = () => {
    const container = document.querySelector('.top-bar__ticker p');
    if (!container) return;

    const messages = [
        "SISTEMA AGOGE v4.0.2 - LINK ESTABLECIDO",
        "ENCRIPTACIÓN MILITAR ACTIVA - AES-256",
        "SATÉLITE EN POSICIÓN - COBERTURA TOTAL",
        "SENSOR BIOMÉTRICO: OPERADOR AUTORIZADO",
        "PROTOCOLO SPARTAN INICIADO...",
        "DATA_STREAM: [CAPTURING_INTEL]"
    ];

    let i = 0;
    setInterval(() => {
        container.textContent = messages[i];
        i = (i + 1) % messages.length;
    }, 8000);
};
