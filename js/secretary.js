/**
 * AGOGE ELITE - Secretary Module
 * Attendance & Financial Management (Income & Expenses)
 * v2 - Bono fix + Cartera/Banco separation
 */

let activeBonosData = [];

// Saldos iniciales (anteriores al sistema digital)
const INITIAL_BALANCE_EFECTIVO = 856.25;
const INITIAL_BALANCE_BANCO = 657.81;

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
            walletTotal: document.getElementById('statWalletTotal'),
            bankTotal: document.getElementById('statBankTotal'),
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
    const setupToggles = () => {
        const resetToggles = () => {
            [els.viewIngresosBtn, els.viewGastosBtn, els.viewBonosBtn].forEach(btn => btn?.classList.remove('active'));
            [els.ingresosWrap, els.gastosWrap, els.bonosWrap].forEach(wrap => wrap?.classList.add('hidden'));
        };

        els.viewIngresosBtn?.addEventListener('click', () => {
            resetToggles();
            els.viewIngresosBtn.classList.add('active');
            els.ingresosWrap.classList.remove('hidden');
        });

        els.viewGastosBtn?.addEventListener('click', () => {
            resetToggles();
            els.viewGastosBtn.classList.add('active');
            els.gastosWrap.classList.remove('hidden');
        });

        els.viewBonosBtn?.addEventListener('click', () => {
            resetToggles();
            els.viewBonosBtn.classList.add('active');
            els.bonosWrap.classList.remove('hidden');
        });
    };
    setupToggles();

    // --- SESSION BUILDER LOGIC ---

    const addSessionRow = (data = null) => {
        const container = document.getElementById('sessionItemsContainer');
        if (!container) return;

        const row = document.createElement('div');
        row.className = 'session-row';
        row.style.cssText = 'background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05);';
        
        row.innerHTML = `
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <select class="form-input row-type" style="flex: 1; font-size: 0.7rem; height: 35px; padding: 0 5px;">
                    <option value="individual">Indiv.</option>
                    <option value="grupo">Grupo</option>
                    <option value="bono">Bono</option>
                    <option value="inyeccion">Extra</option>
                </select>
                <select class="form-input row-bonus hidden" style="flex: 2; font-size: 0.7rem; height: 35px; padding: 0 5px;">
                    <option value="">-- Bono --</option>
                    ${activeBonosData.map(b => `<option value="${b.id}" data-name="${b.group_name}" data-price="${b.price_per_session}" data-total="${b.total_sessions}" data-used="${b.sessions_used}" data-players="${b.players || 1}">${b.group_name} (${b.total_sessions - b.sessions_used} restantes - ${b.players || 1} pax)</option>`).join('')}
                </select>
                <input type="text" class="form-input row-name" placeholder="Nombre" style="flex: 2; font-size: 0.7rem; height: 35px;">
                <button type="button" class="btn btn--outline remove-row-btn" style="padding: 0 10px; border-color: rgba(229,57,53,0.3); color: var(--red); height: 35px;">&times;</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="font-size: 0.6rem; color: #666;">PAX:</span>
                    <input type="number" class="form-input row-pax" value="1" min="1" style="font-size: 0.7rem; height: 30px; padding: 0 5px;">
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="font-size: 0.6rem; color: #666;">TOTAL:</span>
                    <input type="number" class="form-input row-price" value="0.00" step="0.01" style="font-size: 0.7rem; height: 30px; padding: 0 5px;">
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <select class="form-input row-payment" style="font-size: 0.65rem; height: 30px; padding: 0 3px;">
                        <option value="efectivo">💰 EFECTIVO</option>
                        <option value="banco">🏦 BANCO</option>
                    </select>
                </div>
            </div>
        `;

        container.appendChild(row);

        const typeSelect = row.querySelector('.row-type');
        const bonusSelect = row.querySelector('.row-bonus');
        const nameInput = row.querySelector('.row-name');
        const paxInput = row.querySelector('.row-pax');
        const priceInput = row.querySelector('.row-price');
        const paymentSelect = row.querySelector('.row-payment');

        typeSelect.addEventListener('change', () => {
            const val = typeSelect.value;
            bonusSelect.classList.toggle('hidden', val !== 'bono');
            nameInput.classList.toggle('hidden', val === 'bono');
            priceInput.readOnly = (val === 'bono');
            if (val === 'bono') {
                paxInput.value = 1;
                paymentSelect.value = 'banco'; // Bonos suelen ser por banco
            }
            if (val === 'inyeccion') nameInput.value = 'Ingreso Extra';
            updateSessionTotals();
        });

        bonusSelect.addEventListener('change', () => {
            const opt = bonusSelect.options[bonusSelect.selectedIndex];
            if (opt.value) {
                priceInput.value = opt.getAttribute('data-price');
                paxInput.value = opt.getAttribute('data-players') || 1;
            }
            updateSessionTotals();
        });

        [paxInput, priceInput].forEach(el => el.addEventListener('input', updateSessionTotals));
        row.querySelector('.remove-row-btn').addEventListener('click', () => {
            row.remove();
            updateSessionTotals();
        });

        if (data) {
            typeSelect.value = data.type || 'individual';
            nameInput.value = data.name || '';
            paxInput.value = data.pax || 1;
            priceInput.value = data.price || 0;
            if (data.payment) paymentSelect.value = data.payment;
            typeSelect.dispatchEvent(new Event('change'));
        }
    };

    const updateSessionTotals = () => {
        let totalPax = 0;
        let totalPrice = 0;
        document.querySelectorAll('.session-row').forEach(row => {
            totalPax += parseInt(row.querySelector('.row-pax').value) || 0;
            totalPrice += parseFloat(row.querySelector('.row-price').value) || 0;
        });
        const paxDisplay = document.getElementById('sessionTotalPax');
        const priceDisplay = document.getElementById('sessionTotalPrice');
        if (paxDisplay) paxDisplay.textContent = totalPax;
        if (priceDisplay) priceDisplay.textContent = totalPrice.toFixed(2) + ' €';
    };

    document.getElementById('addRowBtn')?.addEventListener('click', () => addSessionRow());

    // Add Attendance Button (Now "Match" button)
    els.addBtn?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.add('is-open');
        document.getElementById('loginFormWrap')?.classList.add('hidden');
        document.getElementById('registerFormWrap')?.classList.add('hidden');
        
        els.modal.classList.remove('hidden');
        els.expModal.classList.add('hidden');
        els.bonusModal?.classList.add('hidden');
        
        document.getElementById('sessionItemsContainer').innerHTML = '';
        addSessionRow();
        document.getElementById('attModalTitle').textContent = 'REGISTRO DE PARTIDA';
        const dateInput = document.getElementById('attDate');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        updateSessionTotals();
    });

    els.addExtraBtn?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.add('is-open');
        document.getElementById('loginFormWrap')?.classList.add('hidden');
        els.modal.classList.remove('hidden');
        els.expModal.classList.add('hidden');
        els.bonusModal?.classList.add('hidden');
        
        document.getElementById('sessionItemsContainer').innerHTML = '';
        addSessionRow({ type: 'inyeccion', name: 'Ingreso Extra', pax: 1, price: 0 });
        document.getElementById('attModalTitle').textContent = 'NUEVO INGRESO EXTRA';
        const dateInput = document.getElementById('attDate');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        updateSessionTotals();
    });

    // Form: Match Session Submit
    els.form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('attDate').value;
        const rows = document.querySelectorAll('.session-row');
        if (rows.length === 0) return alert('Añade al menos una fila.');

        let successCount = 0;
        for (const row of rows) {
            const type = row.querySelector('.row-type').value;
            let name = row.querySelector('.row-name').value;
            const pax = parseInt(row.querySelector('.row-pax').value) || 0;
            const price = parseFloat(row.querySelector('.row-price').value) || 0;
            const payment = row.querySelector('.row-payment').value;

            if (type === 'bono') {
                const bonusSelect = row.querySelector('.row-bonus');
                const opt = bonusSelect.options[bonusSelect.selectedIndex];
                if (!opt.value) continue;
                const bonusId = opt.value;
                const maxSess = parseInt(opt.getAttribute('data-total'));
                const currentSess = parseInt(opt.getAttribute('data-used')) + 1;
                name = `${opt.getAttribute('data-name')} [BONO ${currentSess}/${maxSess}]`;
                
                await api.updateGroupBonus(bonusId, { 
                    sessions_used: currentSess, 
                    is_active: currentSess < maxSess 
                });
            }

            // Bonos: el precio por sesión se cuenta como ingreso al aplicar
            const logData = { 
                date, 
                type: type === 'bono' ? 'grupo' : type, 
                name, 
                players: pax, 
                total_price: price, 
                price_per_pax: pax > 0 ? (price / pax) : 0,
                payment_method: payment
            };
            if (await api.saveAttendanceLog(logData)) {
                await api.syncToSheets(logData, 'attendance');
                successCount++;
            }
        }

        if (successCount > 0) {
            document.getElementById('authModal')?.classList.remove('is-open');
            renderSecretaryDashboard(api, els);
        }
    });

    // Add Expense Button
    els.addExpBtn?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.add('is-open');
        els.expModal.classList.remove('hidden');
        els.modal.classList.add('hidden');
        els.bonusModal?.classList.add('hidden');
        els.expForm.reset();
        const dateInput = document.getElementById('expDate');
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    });

    els.expForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            date: document.getElementById('expDate').value,
            concept: document.getElementById('expConcept').value,
            category: document.getElementById('expCategory').value,
            amount: parseFloat(document.getElementById('expAmount').value)
        };
        if (await api.saveExpenseLog(data)) {
            await api.syncToSheets(data, 'expenses');
            document.getElementById('authModal')?.classList.remove('is-open');
            renderSecretaryDashboard(api, els);
        }
    });

    // Add Bono Button
    els.addBonoBtn?.addEventListener('click', () => {
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.add('is-open');
        els.bonusModal?.classList.remove('hidden');
        els.modal.classList.add('hidden');
        els.expModal.classList.add('hidden');
        els.bonusForm?.reset();
    });

    els.bonusForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sess = parseInt(document.getElementById('bonusSessions').value);
        const price = parseFloat(document.getElementById('bonusPrice').value);
        const players = parseInt(document.getElementById('bonusPlayers')?.value) || 1;
        const bonoPayment = document.getElementById('bonusPaymentMethod')?.value || 'banco';
        const groupName = document.getElementById('bonusName').value;
        const data = {
            group_name: groupName,
            total_sessions: sess,
            sessions_used: 0,
            price_total: price,
            price_per_session: (price / sess),
            players: players,
            is_active: true
        };
        if (await api.saveGroupBonus(data)) {
            document.getElementById('authModal')?.classList.remove('is-open');
            renderSecretaryDashboard(api, els);
        }
    });

    // Modal Close
    document.getElementById('modalClose')?.addEventListener('click', () => {
        document.getElementById('authModal')?.classList.remove('is-open');
    });

    // Global Deletes
    window.adminDeleteAttendance = async (id) => {
        if (confirm('¿Eliminar este registro de asistencia?')) {
            if (await api.deleteAttendanceLog(id)) renderSecretaryDashboard(api, els);
        }
    };
    window.adminDeleteExpense = async (id) => {
        if (confirm('¿Eliminar este gasto?')) {
            if (await api.deleteExpenseLog(id)) renderSecretaryDashboard(api, els);
        }
    };
    window.adminDeleteBonus = async (id) => {
        if (confirm('¿Eliminar este bono?')) {
            if (await api.deleteGroupBonus(id)) renderSecretaryDashboard(api, els);
        }
    };
};

export const renderSecretaryDashboard = async (api, els) => {
    const logs = await api.getAttendanceLogs();
    const expenses = await api.getExpenseLogs();
    const bonos = await api.getGroupBonuses ? await api.getGroupBonuses() : [];
    activeBonosData = bonos.filter(b => b.is_active); 

    if (!logs || !expenses) return;

    // Group logs by Date
    const groupedLogs = logs.reduce((acc, log) => {
        if (!acc[log.date]) acc[log.date] = { date: log.date, items: [], totalPax: 0, totalPrice: 0 };
        acc[log.date].items.push(log);
        acc[log.date].totalPax += (log.players || 0);
        acc[log.date].totalPrice += (log.total_price || 0);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b) - new Date(a));

    // Stats
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const incomeDay = logs.filter(l => l.date === todayStr).reduce((sum, l) => sum + (l.total_price || 0), 0);
    const incomeTotal = logs.reduce((sum, l) => sum + (l.total_price || 0), 0);
    const expenseTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Cartera/Banco: Calcular por método de pago
    // Registros antiguos sin payment_method se consideran efectivo
    const incomeEfectivo = logs
        .filter(l => !l.payment_method || l.payment_method === 'efectivo')
        .reduce((sum, l) => sum + (l.total_price || 0), 0);
    const incomeBanco = logs
        .filter(l => l.payment_method === 'banco')
        .reduce((sum, l) => sum + (l.total_price || 0), 0);

    // Saldos = Inicial + ingresos digitales (los iniciales ya incluyen el histórico)
    const walletBalance = INITIAL_BALANCE_EFECTIVO + incomeEfectivo - incomeTotal + incomeBanco > 0 
        ? INITIAL_BALANCE_EFECTIVO + incomeEfectivo - (logs.filter(l => !l.payment_method || l.payment_method === 'efectivo').filter(l => l.created_at).reduce((s,l) => s + (l.total_price||0), 0))
        : INITIAL_BALANCE_EFECTIVO;
    const bankBalance = INITIAL_BALANCE_BANCO + incomeBanco - (logs.filter(l => l.payment_method === 'banco').filter(l => l.created_at).reduce((s,l) => s + (l.total_price||0), 0));

    // Mostrar solo los saldos base + nuevos ingresos digitales (con payment_method definido)
    const newEfectivo = logs.filter(l => l.payment_method === 'efectivo').reduce((sum, l) => sum + (l.total_price || 0), 0);
    const newBanco = logs.filter(l => l.payment_method === 'banco').reduce((sum, l) => sum + (l.total_price || 0), 0);

    if (els.stats.day) els.stats.day.textContent = `${incomeDay.toFixed(2)} €`;
    if (els.stats.incomeTotal) els.stats.incomeTotal.textContent = `${incomeTotal.toFixed(2)} €`;
    if (els.stats.balanceTotal) {
        const net = incomeTotal - expenseTotal;
        els.stats.balanceTotal.textContent = `${net.toFixed(2)} €`;
        els.stats.balanceTotal.style.color = net >= 0 ? 'var(--gold)' : 'var(--blood-light)';
    }
    if (els.stats.walletTotal) els.stats.walletTotal.textContent = `${(INITIAL_BALANCE_EFECTIVO + newEfectivo).toFixed(2)} €`;
    if (els.stats.bankTotal) els.stats.bankTotal.textContent = `${(INITIAL_BALANCE_BANCO + newBanco).toFixed(2)} €`;

    // Render Grouped Attendance
    els.list.innerHTML = sortedDates.length > 0 ? sortedDates.map(date => {
        const g = groupedLogs[date];
        const rowId = `details-${date.replace(/-/g, '')}`;
        return `
            <tr class="sec-grouped-row" onclick="document.getElementById('${rowId}').classList.toggle('hidden')" style="cursor:pointer; background: rgba(212,175,55,0.02);">
                <td style="font-family:monospace; color:var(--gold); font-weight:bold;">${date}</td>
                <td><span class="sec-type-badge sec-type-badge--grupo">PARTIDA</span></td>
                <td style="text-align:left; font-weight:700;">RESUMEN JORNADA ${date}</td>
                <td>${g.totalPax}</td>
                <td style="color:var(--gold); font-weight:bold;">${g.totalPrice.toFixed(2)} €</td>
                <td><span style="font-size:0.6rem; opacity:0.6;">[+] VER DETALLE</span></td>
                <td>---</td>
            </tr>
            <tr id="${rowId}" class="hidden" style="background: rgba(0,0,0,0.15);">
                <td colspan="7" style="padding: 10px;">
                    <div style="border-left: 2px solid var(--gold); padding-left: 15px;">
                        <table style="width:100%; font-size:0.75rem;">
                            <thead>
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <th style="text-align:left; padding: 5px;">TIPO</th>
                                    <th style="text-align:left; padding: 5px;">NOMBRE / CONCEPTO</th>
                                    <th style="padding: 5px;">PAX</th>
                                    <th style="padding: 5px;">TOTAL</th>
                                    <th style="padding: 5px;">PAGO</th>
                                    <th style="padding: 5px;">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${g.items.map(item => `
                                    <tr>
                                        <td><span class="sec-type-badge sec-type-badge--${item.type}" style="font-size:0.55rem;">${item.type.toUpperCase()}</span></td>
                                        <td style="text-align:left;">${item.name}</td>
                                        <td>${item.players}</td>
                                        <td>${item.total_price.toFixed(2)} €</td>
                                        <td><span style="font-size:0.6rem;">${item.payment_method === 'banco' ? '🏦' : '💰'}</span></td>
                                        <td><button class="btn btn--outline btn--sm" style="font-size:0.55rem; padding: 2px 6px; border-color:var(--red); color:var(--red);" onclick="event.stopPropagation(); adminDeleteAttendance('${item.id}')">Borrar</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </td>
            </tr>
        `;
    }).join('') : '<tr><td colspan="7">No hay partidas.</td></tr>';

    // Render Expenses
    els.expList.innerHTML = expenses.length > 0 ? expenses.map(e => `
        <tr>
            <td style="font-family:monospace; font-size:0.7rem;">${e.date}</td>
            <td><span class="sec-type-badge sec-type-badge--${e.category.toLowerCase()}">${e.category.toUpperCase()}</span></td>
            <td style="font-weight:bold;">${e.concept}</td>
            <td style="color:var(--blood-light);">${e.amount.toFixed(2)} €</td>
            <td><button class="btn btn--outline btn--sm" onclick="adminDeleteExpense('${e.id}')">Borrar</button></td>
        </tr>
    `).join('') : '<tr><td colspan="5">No hay gastos.</td></tr>';

    // Render Bonos (CON CONTADOR CORRECTO)
    if (els.bonosList) {
        els.bonosList.innerHTML = bonos.length > 0 ? bonos.map(b => `
            <tr style="opacity: ${b.is_active ? '1' : '0.5'};">
                <td style="font-weight:bold; color:var(--gold);">${b.group_name} <span style="font-size:0.65rem; color:var(--text-muted);">(${b.players || 1} pax)</span></td>
                <td style="font-family:monospace; font-weight:bold; color:${b.is_active ? 'var(--bronze-light)' : '#888'};">${b.sessions_used} / ${b.total_sessions}</td>
                <td>${b.price_total.toFixed(2)} € <span style="font-size:0.7rem; color:var(--bronze-light);">(${b.price_per_session.toFixed(2)}€/s)</span></td>
                <td><span class="sec-type-badge ${b.is_active ? 'sec-type-badge--grupo' : 'sec-type-badge--individual'}">${b.is_active ? 'ACTIVO' : 'AGOTADO'}</span></td>
                <td><button class="btn btn--outline btn--sm" onclick="adminDeleteBonus('${b.id}')">Borrar</button></td>
            </tr>
        `).join('') : '<tr><td colspan="5">No hay bonos.</td></tr>';
    }
};
