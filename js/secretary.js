/**
 * AGOGE ELITE - Secretary Module
 * Attendance & Financial Management (Income & Expenses)
 */

export const initSecretary = (api) => {
    if (window._secretaryInitialized) return;
    window._secretaryInitialized = true;
    
    const els = {
        addBtn: document.getElementById('addAttendanceBtn'),
        addExtraBtn: document.getElementById('addExtraIncomeBtn'),
        modal: document.getElementById('attendanceModalWrap'),
        form: document.getElementById('attendanceForm'),
        list: document.getElementById('secretaryAttendanceList'),
        expList: document.getElementById('secretaryExpenseList'),
        search: document.getElementById('secSearchName'),
        filterDate: document.getElementById('secFilterDate'),
        filterType: document.getElementById('secFilterType'),
        stats: {
            day: document.getElementById('statIncomeDay'),
            month: document.getElementById('statIncomeMonth'),
            expMonth: document.getElementById('statExpenseMonth'),
            netBalance: document.getElementById('statNetBalance'),
            incomeTotal: document.getElementById('statIncomeTotal'),
            balanceTotal: document.getElementById('statBalanceTotal'),
            count: document.getElementById('statAttendanceCount')
        },
        // Toggles
        viewIngresosBtn: document.getElementById('viewIngresosBtn'),
        viewGastosBtn: document.getElementById('viewGastosBtn'),
        viewBonosBtn: document.getElementById('viewBonosBtn'),
        ingresosWrap: document.getElementById('secIngresosWrap'),
        gastosWrap: document.getElementById('secGastosWrap'),
        bonosWrap: document.getElementById('secBonosWrap'),
        // Expense elements
        addExpBtn: document.getElementById('addExpenseBtn'),
        expModal: document.getElementById('expenseModalWrap'),
        expForm: document.getElementById('expenseForm'),
        // Bonos elements
        addBonoBtn: document.getElementById('addBonoBtn'),
        bonusModal: document.getElementById('bonusModalWrap'),
        bonusForm: document.getElementById('bonusForm'),
        bonosList: document.getElementById('secretaryBonosList')
    };

    if (!els.list) return;

    // Load initial data
    renderSecretaryDashboard(api, els);

    // View Toggles
    els.viewIngresosBtn?.addEventListener('click', () => {
        els.viewIngresosBtn.classList.add('active');
        els.viewGastosBtn.classList.remove('active');
        els.viewBonosBtn?.classList.remove('active');
        els.ingresosWrap.classList.remove('hidden');
        els.gastosWrap.classList.add('hidden');
        els.bonosWrap?.classList.add('hidden');
    });

    els.viewGastosBtn?.addEventListener('click', () => {
        els.viewGastosBtn.classList.add('active');
        els.viewIngresosBtn.classList.remove('active');
        els.viewBonosBtn?.classList.remove('active');
        els.gastosWrap.classList.remove('hidden');
        els.ingresosWrap.classList.add('hidden');
        els.bonosWrap?.classList.add('hidden');
    });

    els.viewBonosBtn?.addEventListener('click', () => {
        els.viewBonosBtn.classList.add('active');
        els.viewIngresosBtn.classList.remove('active');
        els.viewGastosBtn.classList.remove('active');
        els.bonosWrap?.classList.remove('hidden');
        els.ingresosWrap.classList.add('hidden');
        els.gastosWrap.classList.add('hidden');
    });

    // Add Attendance Button
    els.addBtn?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.add('is-open');
        document.getElementById('loginFormWrap')?.classList.add('hidden');
        document.getElementById('registerFormWrap')?.classList.add('hidden');
        
        els.modal.classList.remove('hidden');
        els.expModal.classList.add('hidden');
        els.bonusModal?.classList.add('hidden');
        els.form.reset();
        document.getElementById('attModalTitle').textContent = 'REGISTRO DE ASISTENCIA';
        document.getElementById('attType').value = 'individual';
        const dateInput = document.getElementById('attDate');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    });

    // Add Extra Income Button
    els.addExtraBtn?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.add('is-open');
        document.getElementById('loginFormWrap')?.classList.add('hidden');
        document.getElementById('registerFormWrap')?.classList.add('hidden');
        
        els.modal.classList.remove('hidden');
        els.expModal.classList.add('hidden');
        els.bonusModal?.classList.add('hidden');
        els.form.reset();
        
        document.getElementById('attModalTitle').textContent = 'NUEVO INGRESO EXTRA';
        document.getElementById('attType').value = 'inyeccion';
        document.getElementById('attName').value = 'Ingreso';
        document.getElementById('attPlayers').value = '1';
        const dateInput = document.getElementById('attDate');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    });

    // Add Expense Button
    els.addExpBtn?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        const loginWrap = document.getElementById('loginFormWrap');
        const regWrap = document.getElementById('registerFormWrap');
        if (authModal) authModal.classList.add('is-open');
        if (loginWrap) loginWrap.classList.add('hidden');
        if (regWrap) regWrap.classList.add('hidden');

        els.expModal.classList.remove('hidden');
        els.modal.classList.add('hidden');
        els.bonusModal?.classList.add('hidden');
        els.expForm.reset();
        const dateInput = document.getElementById('expDate');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    });

    // Modal Close (Global for authModal children)
    document.getElementById('modalClose')?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.remove('is-open');
        els.modal.classList.add('hidden');
        els.expModal.classList.add('hidden');
        els.bonusModal?.classList.add('hidden');
    });

    // Add Bono Button
    els.addBonoBtn?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.add('is-open');
        document.getElementById('loginFormWrap')?.classList.add('hidden');
        document.getElementById('registerFormWrap')?.classList.add('hidden');
        
        els.bonusModal?.classList.remove('hidden');
        els.modal.classList.add('hidden');
        els.expModal.classList.add('hidden');
        els.bonusForm?.reset();
    });

    // Form: Bonus Auto-calculation
    ['bonusSessions', 'bonusPrice'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', () => {
            const sess = parseFloat(document.getElementById('bonusSessions').value) || 1;
            const total = parseFloat(document.getElementById('bonusPrice').value) || 0;
            const display = document.getElementById('bonusPricePerSession');
            if (display) display.textContent = (total / sess).toFixed(2);
        });
    });

    // Form: Bonus Submit
    els.bonusForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const totalSessions = parseInt(document.getElementById('bonusSessions').value);
        const totalPrice = parseFloat(document.getElementById('bonusPrice').value);
        
        const bonusData = {
            group_name: document.getElementById('bonusName').value,
            total_sessions: totalSessions,
            sessions_used: 0,
            price_total: totalPrice,
            price_per_session: (totalPrice / totalSessions).toFixed(2),
            is_active: true
        };
        
        if (await api.saveGroupBonus(bonusData)) {
            document.getElementById('authModal')?.classList.remove('is-open');
            renderSecretaryDashboard(api, els);
        }
    });

    // Handle selecting a Bonus in the Attendance Modal
    const attBonusSelect = document.getElementById('attBonusSelect');
    attBonusSelect?.addEventListener('change', () => {
        const opt = attBonusSelect.options[attBonusSelect.selectedIndex];
        if (opt.value !== '') {
            document.getElementById('attName').value = opt.getAttribute('data-name');
            document.getElementById('attTotalPrice').value = opt.getAttribute('data-price');
            document.getElementById('attPlayers').value = opt.getAttribute('data-pax') || 1;
            document.getElementById('attType').value = 'grupo';
            
            // Dispatch input event to recalculate
            document.getElementById('attTotalPrice').dispatchEvent(new Event('input'));
        }
    });

    // Form: Attendance Auto-calculation
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

    // Form: Attendance Submit
    els.form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let nameVal = document.getElementById('attName').value;
        const totalInput = parseFloat(document.getElementById('attTotalPrice').value);
        
        const bonusSelect = document.getElementById('attBonusSelect');
        const selectedBonusId = bonusSelect ? bonusSelect.value : null;
        let finalPrice = totalInput;
        
        if (selectedBonusId) {
            const opt = bonusSelect.options[bonusSelect.selectedIndex];
            const maxSess = parseInt(opt.getAttribute('data-total'));
            const currentSess = parseInt(opt.getAttribute('data-used')) + 1;
            
            // Append bono format
            nameVal = `${nameVal} [BONO ${currentSess}/${maxSess}]`;
            
            // Update the bonus in Supabase
            const bonusData = {
                id: selectedBonusId,
                sessions_used: currentSess,
                is_active: currentSess < maxSess
            };
            await api.saveGroupBonus(bonusData);
        }
        
        const formData = {
            date: document.getElementById('attDate').value,
            type: document.getElementById('attType').value,
            name: nameVal,
            players: parseInt(document.getElementById('attPlayers').value),
            total_price: finalPrice,
            price_per_pax: parseFloat(document.getElementById('attPricePerPax').textContent)
        };
        
        if (await api.saveAttendanceLog(formData)) {
            await api.syncToSheets(formData, 'attendance');
            document.getElementById('authModal')?.classList.remove('is-open');
            renderSecretaryDashboard(api, els);
        }
    });

    // Form: Expense Submit
    els.expForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            date: document.getElementById('expDate').value,
            concept: document.getElementById('expConcept').value,
            category: document.getElementById('expCategory').value,
            amount: parseFloat(document.getElementById('expAmount').value)
        };
        if (await api.saveExpenseLog(formData)) {
            await api.syncToSheets(formData, 'expense');
            document.getElementById('authModal')?.classList.remove('is-open');
            renderSecretaryDashboard(api, els);
        }
    });

    // Global delete handlers
    window.adminDeleteAttendance = async (id) => {
        if (confirm('¿Eliminar registro de asistencia?')) {
            if (await api.deleteAttendanceLog(id)) renderSecretaryDashboard(api, els);
        }
    };
    window.adminDeleteExpense = async (id) => {
        if (confirm('¿Eliminar registro de gasto?')) {
            if (await api.deleteExpenseLog(id)) renderSecretaryDashboard(api, els);
        }
    };
    window.adminDeleteBonus = async (id) => {
        if (confirm('¿Eliminar bono completamente?')) {
            if (await api.deleteGroupBonus(id)) renderSecretaryDashboard(api, els);
        }
    };
};

const renderSecretaryDashboard = async (api, els) => {
    const logs = await api.getAttendanceLogs();
    const expenses = await api.getExpenseLogs();
    const bonos = await api.getGroupBonuses ? await api.getGroupBonuses() : [];
    
    if (!logs || !expenses) return;

    // Stats calculations
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const incomeDay = logs.filter(l => l.date === todayStr).reduce((sum, l) => sum + (l.total_price || 0), 0);
    const incomeMonth = logs.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).reduce((sum, l) => sum + (l.total_price || 0), 0);
    
    const expenseMonth = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).reduce((sum, e) => sum + (e.amount || 0), 0);

    const incomeTotal = logs.reduce((sum, l) => sum + (l.total_price || 0), 0);
    const expenseTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    if (els.stats.day) els.stats.day.textContent = `${incomeDay.toFixed(2)} €`;
    if (els.stats.month) els.stats.month.textContent = `${incomeMonth.toFixed(2)} €`;
    if (els.stats.expMonth) els.stats.expMonth.textContent = `${expenseMonth.toFixed(2)} €`;
    
    if (els.stats.netBalance) {
        const net = incomeMonth - expenseMonth;
        els.stats.netBalance.textContent = `${net.toFixed(2)} €`;
        els.stats.netBalance.style.color = net >= 0 ? 'var(--gold)' : 'var(--blood-light)';
    }

    if (els.stats.incomeTotal) {
        els.stats.incomeTotal.textContent = `${incomeTotal.toFixed(2)} €`;
    }

    if (els.stats.balanceTotal) {
        const globalNet = incomeTotal - expenseTotal;
        els.stats.balanceTotal.textContent = `${globalNet.toFixed(2)} €`;
        els.stats.balanceTotal.style.color = globalNet >= 0 ? 'var(--gold)' : 'var(--blood-light)';
    }
    
    // Attendance Table
    els.list.innerHTML = logs.length > 0 ? logs.map(l => `
        <tr>
            <td style="font-family:monospace; font-size:0.7rem;">${l.date}</td>
            <td><span class="sec-type-badge sec-type-badge--${l.type}">${l.type}</span></td>
            <td style="font-weight:bold;">${l.name}</td>
            <td>${l.players}</td>
            <td>${l.total_price} €</td>
            <td style="color:var(--bronze-light);">${l.price_per_pax} €</td>
            <td><button class="sec-action-btn sec-action-btn--delete" onclick="adminDeleteAttendance('${l.id}')">BORRAR</button></td>
        </tr>
    `).join('') : '<tr><td colspan="7">No hay ingresos.</td></tr>';

    // Expenses Table
    els.expList.innerHTML = expenses.length > 0 ? expenses.map(e => `
        <tr>
            <td style="font-family:monospace; font-size:0.7rem;">${e.date}</td>
            <td><span class="sec-type-badge sec-type-badge--${e.category.toLowerCase()}">${e.category.toUpperCase()}</span></td>
            <td style="font-weight:bold;">${e.concept}</td>
            <td style="color:var(--blood-light);">${e.amount.toFixed(2)} €</td>
            <td>
                <button class="btn btn--outline btn--sm" onclick="adminDeleteExpense('${e.id}')">Borrar</button>
            </td>
        </tr>
    `).join('') : `<tr><td colspan="5" class="u-text-center">No hay gastos registrados</td></tr>`;
    
    // Bonos Table
    if (els.bonosList) {
        els.bonosList.innerHTML = bonos.length > 0 ? bonos.map(b => `
            <tr style="opacity: ${b.is_active ? '1' : '0.5'};">
                <td style="font-weight:bold; color:var(--gold);">${b.group_name}</td>
                <td style="font-family:monospace;">${b.sessions_used} / ${b.total_sessions}</td>
                <td>${b.price_total.toFixed(2)} € <span style="font-size:0.7rem; color:var(--bronze-light);">(${b.price_per_session.toFixed(2)}€/s)</span></td>
                <td><span class="sec-type-badge ${b.is_active ? 'sec-type-badge--grupo' : 'sec-type-badge--individual'}">${b.is_active ? 'ACTIVO' : 'AGOTADO'}</span></td>
                <td>
                    <button class="btn btn--outline btn--sm" onclick="adminDeleteBonus('${b.id}')">Borrar</button>
                </td>
            </tr>
        `).join('') : `<tr><td colspan="5" class="u-text-center">No hay bonos activos</td></tr>`;
    }

    // Populate the dropdown in Attendance Modal
    const attBonusSelect = document.getElementById('attBonusSelect');
    if (attBonusSelect) {
        const activeBonos = bonos.filter(b => b.is_active);
        attBonusSelect.innerHTML = `<option value="">-- No asociar a ningún bono --</option>` + 
            activeBonos.map(b => `<option value="${b.id}" data-name="${b.group_name}" data-price="${b.price_per_session}" data-total="${b.total_sessions}" data-used="${b.sessions_used}" data-pax="1">${b.group_name} (${b.total_sessions - b.sessions_used} restantes)</option>`).join('');
    }

    // Attach search handlers
    const renderFiltered = () => {
        const q = (els.search?.value || '').toLowerCase();
        const d = els.filterDate?.value || '';
        const t = els.filterType?.value || 'all';

        Array.from(els.list.children).forEach(tr => {
            const dateStr = tr.children[0].textContent;
            const typeStr = tr.children[1].textContent.toLowerCase();
            const nameStr = tr.children[2].textContent.toLowerCase();
            const matchQ = !q || nameStr.includes(q);
            const matchD = !d || dateStr === d;
            const matchT = t === 'all' || typeStr === t;
            tr.style.display = matchQ && matchD && matchT ? '' : 'none';
        });
    };

    els.search?.addEventListener('input', renderFiltered);
    els.filterDate?.addEventListener('change', renderFiltered);
    els.filterType?.addEventListener('change', renderFiltered);
};
