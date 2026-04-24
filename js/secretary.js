/**
 * AGOGE ELITE - Secretary Module
 * Attendance & Financial Management (Income & Expenses)
 */

export const initSecretary = (api) => {
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
        ingresosWrap: document.getElementById('secIngresosWrap'),
        gastosWrap: document.getElementById('secGastosWrap'),
        // Expense elements
        addExpBtn: document.getElementById('addExpenseBtn'),
        expModal: document.getElementById('expenseModalWrap'),
        expForm: document.getElementById('expenseForm')
    };

    if (!els.list) return;

    // Load initial data
    renderSecretaryDashboard(api, els);

    // View Toggles
    els.viewIngresosBtn?.addEventListener('click', () => {
        els.viewIngresosBtn.classList.add('active');
        els.viewGastosBtn.classList.remove('active');
        els.ingresosWrap.classList.remove('hidden');
        els.gastosWrap.classList.add('hidden');
    });

    els.viewGastosBtn?.addEventListener('click', () => {
        els.viewGastosBtn.classList.add('active');
        els.viewIngresosBtn.classList.remove('active');
        els.gastosWrap.classList.remove('hidden');
        els.ingresosWrap.classList.add('hidden');
    });

    // Add Attendance Button
    els.addBtn?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.add('is-open');
        document.getElementById('loginFormWrap')?.classList.add('hidden');
        document.getElementById('registerFormWrap')?.classList.add('hidden');
        
        els.modal.classList.remove('hidden');
        els.expModal.classList.add('hidden');
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
        els.modal.classList.add('hidden'); // Hide other
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
        const formData = {
            date: document.getElementById('attDate').value,
            type: document.getElementById('attType').value,
            name: document.getElementById('attName').value,
            players: parseInt(document.getElementById('attPlayers').value),
            total_price: parseFloat(document.getElementById('attTotalPrice').value),
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
};

const renderSecretaryDashboard = async (api, els) => {
    const logs = await api.getAttendanceLogs();
    const expenses = await api.getExpenseLogs();
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
            <td style="font-weight:bold;">${e.concept}</td>
            <td><span class="sec-type-badge sec-type-badge--${e.category}">${e.category}</span></td>
            <td style="color:var(--blood-light); font-weight:bold;">-${e.amount} €</td>
            <td><button class="sec-action-btn sec-action-btn--delete" onclick="adminDeleteExpense('${e.id}')">BORRAR</button></td>
        </tr>
    `).join('') : '<tr><td colspan="5">No hay gastos registrados.</td></tr>';
};
