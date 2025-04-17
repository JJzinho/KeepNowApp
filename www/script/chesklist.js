// Dados completos baseados no PDF
const maintenanceItems = [
    // Sistema Hidrossanitário
    { id: "A16", periodicity: "SEMESTRAL", system: "Hidrossanitário", activity: "Verificar estanqueidade de registros e componentes", responsible: "Manutenção Local" },
    { id: "A17", periodicity: "ANUAL", system: "Hidrossanitário", activity: "Substituir vedantes de torneiras e registros", responsible: "Empresa Especializada" },
    { id: "A33", periodicity: "MENSAL", system: "Hidrossanitário", activity: "Verificar mecanismos da caixa acoplada", responsible: "Manutenção Local" },
    
    // Sistema de Incêndio
    { id: "B2.7", periodicity: "ANUAL", system: "Incêndio", activity: "Recarregar extintores", responsible: "Empresa Especializada" },
    { id: "B6.3", periodicity: "MENSAL", system: "Incêndio", activity: "Testar sistema de hidrantes", responsible: "Manutenção Local" },
    
    // Sistema Elétrico
    { id: "C1.0", periodicity: "DIÁRIA", system: "Elétrico", activity: "Verificar quadros elétricos", responsible: "Manutenção Local" },
    { id: "C2.6", periodicity: "SEMESTRAL", system: "Elétrico", activity: "Testar disjuntores DR", responsible: "Empresa Certificada" },
    
    // Climatização
    { id: "E1.3", periodicity: "MENSAL", system: "Climatização", activity: "Limpar filtros de ar-condicionado", responsible: "Técnico Especializado" },
    
    // Estrutural
    { id: "IID10", periodicity: "QUINQUENAL", system: "Estrutural", activity: "Verificar tirantes e estrutura", responsible: "Engenharia Especializada" }
];

let savedData = JSON.parse(localStorage.getItem('maintenanceData')) || {};

function renderItems() {
    const container = document.getElementById('checklist');
    container.innerHTML = '';
    
    const now = new Date();
    const systemFilter = document.getElementById('system-filter').value;
    const periodFilter = document.getElementById('period-filter').value;

    maintenanceItems.forEach(item => {
        if (systemFilter && item.system !== systemFilter) return;
        if (periodFilter && item.periodicity !== periodFilter) return;

        const itemKey = item.id;
        const itemData = savedData[itemKey] || {};
        const lastDone = itemData.lastDone ? new Date(itemData.lastDone) : null;
        const nextDue = lastDone ? calculateNextDue(lastDone, item.periodicity) : null;
        const isOverdue = nextDue ? now > nextDue : true;

        const itemElement = document.createElement('div');
        itemElement.className = `item ${itemData.status === 'completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
        
        itemElement.innerHTML = `
            <div class="item-header">
                <span class="item-id">${item.id}</span>
                <span class="item-period">${formatPeriodicity(item.periodicity)}</span>
            </div>
            <div class="item-body">
                <div class="item-system">${item.system}</div>
                <div class="item-activity">${item.activity}</div>
            </div>
            <div class="item-footer">
                <span>${item.responsible}</span>
                <div class="item-actions">
                    <button class="btn btn-success" onclick="completeItem('${item.id}', '${item.periodicity}')">✓</button>
                    <button class="btn btn-danger" onclick="skipItem('${item.id}')">✗</button>
                </div>
            </div>
            ${lastDone ? `<div class="item-history">Última: ${formatDate(lastDone)}</div>` : ''}
        `;

        container.appendChild(itemElement);
    });
}

function calculateNextDue(lastDate, periodicity) {
    const nextDate = new Date(lastDate);
    switch(periodicity) {
        case 'DIÁRIA': nextDate.setDate(nextDate.getDate() + 1); break;
        case 'SEMANAL': nextDate.setDate(nextDate.getDate() + 7); break;
        case 'MENSAL': nextDate.setMonth(nextDate.getMonth() + 1); break;
        case 'TRIMESTRAL': nextDate.setMonth(nextDate.getMonth() + 3); break;
        case 'SEMESTRAL': nextDate.setMonth(nextDate.getMonth() + 6); break;
        case 'ANUAL': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
    }
    return nextDate;
}

function formatDate(date) {
    return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatPeriodicity(period) {
    const map = {
        'DIÁRIA': 'Diária',
        'SEMANAL': 'Semanal',
        'MENSAL': 'Mensal',
        'TRIMESTRAL': 'Trimestral',
        'SEMESTRAL': 'Semestral',
        'ANUAL': 'Anual',
        'QUINQUENAL': '5 Anos'
    };
    return map[period] || period;
}

function showModal(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function completeItem(id, periodicity) {
    const now = new Date();
    const nextDue = calculateNextDue(now, periodicity);
    
    savedData[id] = {
        status: 'completed',
        lastDone: now.toISOString(),
        nextDue: nextDue.toISOString()
    };
    
    localStorage.setItem('maintenanceData', JSON.stringify(savedData));
    
    showModal(
        'Concluído com Sucesso!',
        `Próxima verificação: ${formatDate(nextDue)}\n\nVerifique se:\n1. Todas etapas foram executadas\n2. Não há vazamentos/resíduos\n3. Sistemas estão operando normalmente`
    );
    
    renderItems();
}

function skipItem(id) {
    if (confirm('⚠️ Atenção!\nPular esta inspeção pode causar:\n- Riscos de segurança\n- Danos estruturais\n- Multas regulatórias\n\nConfirma a exclusão?')) {
        savedData[id] = {
            status: 'skipped',
            lastSkipped: new Date().toISOString()
        };
        localStorage.setItem('maintenanceData', JSON.stringify(savedData));
        renderItems();
    }
}

// Event Listeners
document.getElementById('system-filter').addEventListener('change', renderItems);
document.getElementById('period-filter').addEventListener('change', renderItems);
document.getElementById('reset').addEventListener('click', () => {
    document.getElementById('system-filter').value = '';
    document.getElementById('period-filter').value = '';
    renderItems();
});

// Initial Render
renderItems();