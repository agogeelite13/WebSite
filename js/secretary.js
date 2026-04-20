/**
 * AGOGE ELITE - Secretary Module
 * Attendance & Financial Management
 */

export const initSecretary = (api) => {
    const els = {
        addBtn: document.getElementById('addAttendanceBtn'),
        modal: document.getElementById('attendanceModalWrap'),
        form: document.getElementById('attendanceForm'),
        list: document.getElementById('secretaryAttendanceList'),
        search: document.getElementById('secSearchName'),
        filterDate: document.getElementById('secFilterDate'),
        filterType: document.getElementById('secFilterType'),
        stats: {
            day: document.getElementById('statIncomeDay'),
            week: document.getElementById('statIncomeWeek'),
            month: document.getElementById('statIncomeMonth'),
            count: document.getElementById('statAttendanceCount')
        }
    };

    if (!els.list) return;

    // Load initial data
    console.log('[SECRETARY] Initializing module...');
    renderSecretaryDashboard(api, els);

    // Add Button
    els.addBtn?.addEventListener('click', () => {
        console.log('[SECRETARY] Add button clicked');
        const authModal = document.getElementById('authModal');
        const loginWrap = document.getElementById('loginFormWrap');
        const regWrap = document.getElementById('registerFormWrap');
        const attWrap = document.getElementById('attendanceModalWrap');

        if (authModal) authModal.classList.add('is-open');
        if (loginWrap) loginWrap.classList.add('hidden');
        if (regWrap) regWrap.classList.add('hidden');
        if (attWrap) attWrap.classList.remove('hidden');
        
        els.form.reset();
        const dateInput = document.getElementById('attDate');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    });

    // Modal Close (using existing close button logic)
    document.getElementById('modalClose')?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.remove('is-open');
        els.modal.classList.add('hidden');
    });
    
    document.getElementById('modalOverlay')?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.remove('is-open');
        els.modal.classList.add('hidden');
    });

    // Form: Auto-calculation
    ['attPlayers', 'attTotalPrice'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => {
            const paxInput = document.getElementById('attPlayers');
            const totalInput = document.getElementById('attTotalPrice');
            const display = document.getElementById('attPricePerPax');
            
            if (paxInput && totalInput && display) {
                const pax = parseFloat(paxInput.value) || 1;
                const total = parseFloat(totalInput.value) || 0;
                display.textContent = (total / pax).toFixed(2);
            }
        });
    });

    // Form: Submit
    els.form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            date: document.getElementById('attDate').value,
            type: document.getElementById('attType').value,
            name: document.getElementById('attName').value,
            players: parseInt(document.getElementById('attPlayers').value),
            total_price: parseFloat(document.getElementById('attTotalPrice').value),
            price_per_pax: parseFloat(document.getElementById('attPricePerPax').textContent)
        };

        const ok = await api.saveAttendanceLog(formData);
        if (ok) {
            // Also sync to sheets if configured
            await api.syncToSheets(formData);
            els.modal.classList.add('hidden');
            renderSecretaryDashboard(api, els);
        } else {
            alert('Error al guardar en base de datos. Verifica la tabla attendance_logs.');
        }
    });

    // Filters
    [els.search, els.filterDate, els.filterType].forEach(el => {
        el?.addEventListener('input', () => renderSecretaryDashboard(api, els));
    });

    // Global delete handler
    window.adminDeleteAttendance = async (id) => {
        if (confirm('¿Eliminar este registro permanentemente?')) {
            const ok = await api.deleteAttendanceLog(id);
            if (ok) renderSecretaryDashboard(api, els);
        }
    };
};

const renderSecretaryDashboard = async (api, els) => {
    const logs = await api.getAttendanceLogs();
    if (!logs) return;

    const searchTerm = els.search.value.toLowerCase();
    const filterDate = els.filterDate.value;
    const filterType = els.filterType.value;

    const filtered = logs.filter(l => {
        const matchesSearch = (l.name || '').toLowerCase().includes(searchTerm);
        const matchesDate = !filterDate || l.date === filterDate;
        const matchesType = filterType === 'all' || l.type === filterType;
        return matchesSearch && matchesDate && matchesType;
    });

    // Render Table
    els.list.innerHTML = filtered.length > 0 ? 
        filtered.map(l => `
            <tr>
                <td style="font-family:monospace; font-size:0.7rem;">${l.date}</td>
                <td><span class="sec-type-badge sec-type-badge--${l.type}">${l.type}</span></td>
                <td style="font-weight:bold;">${l.name}</td>
                <td>${l.players}</td>
                <td>${l.total_price} €</td>
                <td style="color:var(--bronze-light);">${l.price_per_pax} €</td>
                <td>
                    <button class="sec-action-btn sec-action-btn--delete" onclick="adminDeleteAttendance('${l.id}')">BORRAR</button>
                </td>
            </tr>
        `).join('') :
        '<tr><td colspan="7" style="text-align:center; padding:20px; color:#666;">No hay registros.</td></tr>';

    // Calculate Totals
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Day
    const incomeDay = logs.filter(l => l.date === todayStr).reduce((sum, l) => sum + (l.total_price || 0), 0);
    els.stats.day.textContent = `${incomeDay.toFixed(2)} €`;

    // Month
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const incomeMonth = logs.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).reduce((sum, l) => sum + (l.total_price || 0), 0);
    els.stats.month.textContent = `${incomeMonth.toFixed(2)} €`;

    // Week (Approx)
    const incomeWeek = logs.filter(l => {
        const d = new Date(l.date);
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays <= 7;
    }).reduce((sum, l) => sum + (l.total_price || 0), 0);
    els.stats.week.textContent = `${incomeWeek.toFixed(2)} €`;

    // Counts
    const groups = logs.filter(l => l.type === 'grupo').length;
    const indivs = logs.filter(l => l.type === 'individual').length;
    els.stats.count.textContent = `${groups} / ${indivs}`;
};
