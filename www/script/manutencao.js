// manutencao.js
let activities = JSON.parse(localStorage.getItem('activities')) || [];

function saveActivities() {
    localStorage.setItem('activities', JSON.stringify(activities));
}

function calculateNextDate(period, customValue = '') {
    const date = new Date();
    
    if (period === 'Customizado' && customValue) {
        const match = customValue.match(/(\d+)\s*(dias?|meses?|anos?)/i);
        if (match) {
            const amount = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            
            if (unit.startsWith('dia')) date.setDate(date.getDate() + amount);
            else if (unit.startsWith('mes')) date.setMonth(date.getMonth() + amount);
            else if (unit.startsWith('ano')) date.setFullYear(date.getFullYear() + amount);
        }
        return date.toISOString().split('T')[0];
    }

    switch(period) {
        case 'Segunda a sexta':
            date.setDate(date.getDate() + (date.getDay() === 5 ? 3 : 1));
            break;
        case 'Segunda a sábado':
            date.setDate(date.getDate() + (date.getDay() === 6 ? 2 : 1));
            break;
        case 'Mensal': date.setMonth(date.getMonth() + 1); break;
        case 'Trimestral': date.setMonth(date.getMonth() + 3); break;
        case 'Semestral': date.setMonth(date.getMonth() + 6); break;
        case 'Anual': date.setFullYear(date.getFullYear() + 1); break;
    }
    return date.toISOString().split('T')[0];
}

function createActivityElement(activity, isArchived = false) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    div.innerHTML = `
        <div class="activity-details">
            <h3>${activity.occurrence}</h3>
            <p>${activity.description}</p>
            ${!isArchived ? `<p>Próxima execução: ${activity.nextDate}</p>` : ''}
            <p>Período: ${activity.period} ${activity.customPeriod ? `(${activity.customPeriod})` : ''}</p>
        </div>
        <div class="activity-actions">
            ${!isArchived ? `
                <button onclick="openPerformModal(${activity.id})">Realizar</button>
                <button onclick="openNotPerformedModal(${activity.id})">Não realizei</button>
            ` : ''}
            <button onclick="generateReport(${activity.id})">Relatório</button>
        </div>
    `;
    return div;
}

function renderActivities() {
    const activeContainer = document.getElementById('activeActivities');
    const archivedContainer = document.getElementById('archivedActivities');
    
    activeContainer.innerHTML = '';
    archivedContainer.innerHTML = '';
    
    activities.forEach(activity => {
        if (activity.archived) {
            archivedContainer.appendChild(createActivityElement(activity, true));
        } else {
            activeContainer.appendChild(createActivityElement(activity));
        }
    });
}

function toggleForm() {
    const formContainer = document.getElementById('activityFormContainer');
    formContainer.classList.toggle('expanded');
}

function toggleCustomInput() {
    const period = document.getElementById('period').value;
    const customInput = document.getElementById('customPeriod');
    customInput.style.display = period === 'Customizado' ? 'block' : 'none';
    if (period !== 'Customizado') customInput.value = '';
}

function toggleArchived() {
    const archivedSection = document.getElementById('archivedSection');
    const button = document.querySelector('.toggle-archived');
    archivedSection.classList.toggle('visible');
    button.textContent = archivedSection.classList.contains('visible') 
        ? 'Ocultar Arquivadas' 
        : 'Mostrar Arquivadas';
}

function openPerformModal(id) {
    document.getElementById('activityId').value = id;
    document.getElementById('performModal').style.display = 'block';
}

function closePerformModal() {
    document.getElementById('performModal').style.display = 'none';
    document.getElementById('performForm').reset();
}

function openNotPerformedModal(id) {
    document.getElementById('notPerformedActivityId').value = id;
    document.getElementById('notPerformedModal').style.display = 'block';
}

function closeNotPerformedModal() {
    document.getElementById('notPerformedModal').style.display = 'none';
    document.getElementById('notPerformedForm').reset();
}

function generateReport(id) {
    const activity = activities.find(a => a.id === id);
    let reportContent = `
        <h4>${activity.occurrence}</h4>
        <p><strong>Descrição:</strong> ${activity.description}</p>
        <p><strong>Tipo:</strong> ${activity.type}</p>
        <p><strong>Criado em:</strong> ${new Date(activity.created).toLocaleString()}</p>
    `;
    
    if (activity.reports && activity.reports.length > 0) {
        reportContent += '<h4>Histórico:</h4>';
        activity.reports.forEach(report => {
            reportContent += `
                <div class="report-item">
                    <p><strong>Data:</strong> ${new Date(report.date).toLocaleString()}</p>
                    ${report.performed ? `
                        <p><strong>Status:</strong> Realizada</p>
                        ${report.beforeDescription ? `<p><strong>Pré-atividade:</strong> ${report.beforeDescription}</p>` : ''}
                        ${report.afterDescription ? `<p><strong>Pós-atividade:</strong> ${report.afterDescription}</p>` : ''}
                    ` : `
                        <p><strong>Status:</strong> Não realizada</p>
                        <p><strong>Motivo:</strong> ${report.reason}</p>
                    `}
                </div>
                <hr>
            `;
        });
    } else {
        reportContent += '<p>Nenhum registro encontrado para esta atividade.</p>';
    }
    
    document.getElementById('reportContent').innerHTML = reportContent;
    document.getElementById('reportModal').style.display = 'block';
}

function downloadReport() {
    const content = document.getElementById('reportContent').innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-manutencao.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function closeReport() {
    document.getElementById('reportModal').style.display = 'none';
}

// Eventos
document.getElementById('activityForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const period = document.getElementById('period').value;
    const customPeriod = document.getElementById('customPeriod').value;
    
    const newActivity = {
        id: Date.now(),
        occurrence: document.getElementById('occurrence').value,
        norm: document.getElementById('norm').value,
        description: document.getElementById('description').value,
        team: document.getElementById('team').value,
        period: period,
        customPeriod: period === 'Customizado' ? customPeriod : '',
        type: document.getElementById('type').value,
        nextDate: calculateNextDate(period, customPeriod),
        created: new Date().toISOString(),
        archived: false,
        reports: []
    };

    activities.push(newActivity);
    saveActivities();
    renderActivities();
    e.target.reset();
    toggleForm();
});

document.getElementById('performForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('activityId').value);
    const activity = activities.find(a => a.id === id);
    
    // Simulando upload de imagens (em um sistema real, você faria o upload para um servidor)
    const beforeImage = document.getElementById('beforeImage').files[0];
    const afterImage = document.getElementById('afterImage').files[0];
    
    // Criando URLs para as imagens (apenas para demonstração)
    const beforeImageUrl = beforeImage ? URL.createObjectURL(beforeImage) : null;
    const afterImageUrl = afterImage ? URL.createObjectURL(afterImage) : null;
    
    const report = {
        date: new Date().toISOString(),
        performed: true,
        beforeImage: beforeImageUrl,
        beforeDescription: document.getElementById('beforeDescription').value,
        afterImage: afterImageUrl,
        afterDescription: document.getElementById('afterDescription').value
    };
    
    activity.reports.push(report);
    activity.nextDate = calculateNextDate(activity.period, activity.customPeriod);
    saveActivities();
    renderActivities();
    closePerformModal();
});

document.getElementById('notPerformedForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('notPerformedActivityId').value);
    const activity = activities.find(a => a.id === id);
    
    const report = {
        date: new Date().toISOString(),
        performed: false,
        reason: document.getElementById('reason').value
    };
    
    activity.reports.push(report);
    saveActivities();
    renderActivities();
    closeNotPerformedModal();
});

// Inicialização
renderActivities();
window.onclick = function(event) {
    const modals = ['reportModal', 'performModal', 'notPerformedModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}