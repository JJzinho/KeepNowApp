// manutencao.js

// Ensure jsPDF is loaded from CDN before this script runs
const { jsPDF } = window.jspdf;

// Load activities from localStorage or initialize as empty array
let activities = JSON.parse(localStorage.getItem('activities')) || [];

/**
 * Saves the current state of the activities array to localStorage.
 */
function saveActivities() {
    localStorage.setItem('activities', JSON.stringify(activities));
    console.log("Activities saved to localStorage.");
}

/**
 * Calculates the next execution date based on the selected period.
 * @param {string} period - The selected period ('Mensal', 'Customizado', etc.).
 * @param {string} [customValue=''] - The custom period string (e.g., "7 dias").
 * @returns {string|null} - The next date in YYYY-MM-DD format, or null if calculation fails.
 */
function calculateNextDate(period, customValue = '') {
    const date = new Date(); // Start with today

    try {
        if (period === 'Customizado' && customValue) {
            const match = customValue.match(/(\d+)\s*(dias?|meses?|anos?)/i);
            if (match) {
                const amount = parseInt(match[1]);
                const unit = match[2].toLowerCase();

                if (unit.startsWith('dia')) {
                    date.setDate(date.getDate() + amount);
                } else if (unit.startsWith('mes')) {
                    date.setMonth(date.getMonth() + amount);
                } else if (unit.startsWith('ano')) {
                    date.setFullYear(date.getFullYear() + amount);
                } else {
                     console.warn("Invalid custom unit:", unit);
                     return null; // Indicate failure for invalid unit
                }
                return date.toISOString().split('T')[0]; // Return calculated date
            } else {
                console.warn("Invalid custom period format:", customValue);
                return null; // Indicate failure for invalid format
            }
        }

        // Handle predefined periods
        switch (period) {
            case 'Segunda a sexta':
                let daysToAddWorkday = 1;
                if (date.getDay() === 5) daysToAddWorkday = 3; // Friday -> Monday
                else if (date.getDay() === 6) daysToAddWorkday = 2; // Saturday -> Monday
                date.setDate(date.getDate() + daysToAddWorkday);
                break;
            case 'Segunda a sábado':
                let daysToAddSat = 1;
                if (date.getDay() === 6) daysToAddSat = 2; // Saturday -> Monday
                date.setDate(date.getDate() + daysToAddSat);
                break;
            case 'Mensal':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'Trimestral':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'Semestral':
                date.setMonth(date.getMonth() + 6);
                break;
            case 'Anual':
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                 // If period is not recognized (and not Custom), maybe return null or handle error
                 console.warn("Unrecognized period for date calculation:", period);
                 return null; // Indicate failure
        }
        return date.toISOString().split('T')[0]; // Return calculated date

    } catch (error) {
        console.error("Error calculating next date:", error);
        return null; // Return null on any unexpected error
    }
}


/**
 * Creates the HTML element for a single activity item.
 * @param {object} activity - The activity object.
 * @param {boolean} [isArchived=false] - Flag indicating if the activity is archived.
 * @returns {HTMLElement} - The created div element for the activity.
 */
function createActivityElement(activity, isArchived = false) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    div.dataset.activityId = activity.id; // Add dataset for potential future use

    // Find the date of the last action (report) for archived items
    const lastReportDate = (activity.reports && activity.reports.length > 0)
        ? new Date(activity.reports[activity.reports.length - 1].date).toLocaleDateString()
        : 'N/A';

    div.innerHTML = `
        <div class="activity-details">
            <h3>${activity.occurrence || 'N/A'}</h3>
            <p><strong>Descrição:</strong> ${activity.description || 'N/A'}</p>
            <p><strong>Tipo:</strong> ${activity.type || 'N/A'}</p>
            ${isArchived
                ? `<p><strong>Data Última Ação:</strong> ${lastReportDate}</p>`
                : `<p><strong>Próxima execução:</strong> ${activity.nextDate || 'N/A'}</p>`
            }
            <p><strong>Período:</strong> ${activity.period || 'N/A'} ${activity.customPeriod ? `(${activity.customPeriod})` : ''}</p>
             <p><strong>Equipe:</strong> ${activity.team || 'N/A'}</p>
             <p><strong>Norma:</strong> ${activity.norm || 'N/A'}</p>
        </div>
        <div class="activity-actions">
            ${!isArchived ? `
                <button onclick="openPerformModal(${activity.id})">Realizar</button>
                <button onclick="openNotPerformedModal(${activity.id})">Não Realizei</button>
            ` : ''}
            <button onclick="generateReport(${activity.id})">Relatório</button>
        </div>
    `;
    return div;
}

/**
 * Renders all activities into the active and archived lists.
 */
function renderActivities() {
    const activeContainer = document.getElementById('activeActivities');
    const archivedContainer = document.getElementById('archivedActivities');
    const archivedSection = document.getElementById('archivedSection');
    const generatePdfButton = document.getElementById('generatePdfButton');
    const toggleArchivedButton = document.querySelector('.toggle-archived');

    activeContainer.innerHTML = '';
    archivedContainer.innerHTML = '';

    let hasArchivedItems = false;

    // Sort activities: active by nextDate (ascending), archived by last report date (descending)
    const sortedActivities = [...activities].sort((a, b) => {
        if (a.archived !== b.archived) {
            return a.archived ? 1 : -1; // Active items first
        }
        if (a.archived) {
            // Sort archived by last report date, descending (newest first)
            const dateA = a.reports && a.reports.length > 0 ? new Date(a.reports[a.reports.length - 1].date) : 0;
            const dateB = b.reports && b.reports.length > 0 ? new Date(b.reports[b.reports.length - 1].date) : 0;
            return dateB - dateA;
        } else {
            // Sort active by nextDate, ascending (soonest first)
            const dateA = a.nextDate ? new Date(a.nextDate) : Infinity;
            const dateB = b.nextDate ? new Date(b.nextDate) : Infinity;
            return dateA - dateB;
        }
    });


    sortedActivities.forEach(activity => {
        if (activity.archived) {
            archivedContainer.appendChild(createActivityElement(activity, true));
            hasArchivedItems = true;
        } else {
            activeContainer.appendChild(createActivityElement(activity));
        }
    });

    // Manage visibility of the archived section and controls
    if (hasArchivedItems) {
        generatePdfButton.disabled = false; // Enable PDF button
        // Only show section if explicitly toggled visible OR if toggle button isn't present
        if (archivedSection.classList.contains('visible') || !toggleArchivedButton) {
             archivedSection.style.display = 'block';
        } else {
            archivedSection.style.display = 'none';
        }
    } else {
        archivedSection.style.display = 'none'; // Hide section if empty
        archivedSection.classList.remove('visible'); // Ensure state is consistent
        generatePdfButton.disabled = true; // Disable PDF button
        if (toggleArchivedButton) {
            toggleArchivedButton.textContent = 'Mostrar Arquivadas'; // Reset button text
        }
    }

     // Update toggle button text based on visibility state (if button exists)
    if (toggleArchivedButton) {
         toggleArchivedButton.textContent = archivedSection.classList.contains('visible')
            ? 'Ocultar Arquivadas'
            : 'Mostrar Arquivadas';
    }

    console.log("Activities rendered.");
}

/**
 * Toggles the visibility of the new activity form.
 */
function toggleForm() {
    const formContainer = document.getElementById('activityFormContainer');
    formContainer.classList.toggle('expanded');
}

/**
 * Toggles the visibility of the custom period input field based on the period selection.
 */
function toggleCustomInput() {
    const periodSelect = document.getElementById('period');
    const customInput = document.getElementById('customPeriod');
    if (periodSelect.value === 'Customizado') {
        customInput.style.display = 'block';
        customInput.required = true; // Make required only when visible
    } else {
        customInput.style.display = 'none';
        customInput.value = ''; // Clear value when hidden
        customInput.required = false;
    }
}

/**
 * Toggles the visibility of the archived activities section.
 */
function toggleArchived() {
    const archivedSection = document.getElementById('archivedSection');
    const button = document.querySelector('.toggle-archived');
    const hasArchivedItems = activities.some(a => a.archived);

    if (!hasArchivedItems) {
         // alert("Não há atividades arquivadas para mostrar.");
         archivedSection.style.display = 'none';
         archivedSection.classList.remove('visible');
         if(button) button.textContent = 'Mostrar Arquivadas';
         return; // Do nothing else if no items
    }

    // Toggle visibility if there are items
    archivedSection.classList.toggle('visible');
    renderActivities(); // Re-render to update visibility and button text correctly
}

/**
 * Opens the modal for recording a performed activity.
 * @param {number} id - The ID of the activity.
 */
function openPerformModal(id) {
    const activity = activities.find(a => a.id === id);
    if (!activity) {
        console.error("Activity not found for ID:", id);
        return;
    }
    document.getElementById('activityId').value = id;
    document.getElementById('performModal').style.display = 'block';
    console.log("Opened Perform modal for activity ID:", id);
}

/**
 * Closes the modal for recording a performed activity and resets the form.
 */
function closePerformModal() {
    const modal = document.getElementById('performModal');
    modal.style.display = 'none';
    document.getElementById('performForm').reset();
    // Clean up potential Blob URLs (good practice)
    const beforeImg = document.getElementById('beforeImage');
    const afterImg = document.getElementById('afterImage');
    if (beforeImg._previewUrl) {
        URL.revokeObjectURL(beforeImg._previewUrl);
        delete beforeImg._previewUrl;
    }
     if (afterImg._previewUrl) {
        URL.revokeObjectURL(afterImg._previewUrl);
        delete afterImg._previewUrl;
     }
    console.log("Closed Perform modal.");
}

/**
 * Opens the modal for recording why an activity was not performed.
 * @param {number} id - The ID of the activity.
 */
function openNotPerformedModal(id) {
     const activity = activities.find(a => a.id === id);
    if (!activity) {
        console.error("Activity not found for ID:", id);
        return;
    }
    document.getElementById('notPerformedActivityId').value = id;
    document.getElementById('notPerformedModal').style.display = 'block';
    console.log("Opened Not Performed modal for activity ID:", id);
}

/**
 * Closes the modal for recording non-performance and resets the form.
 */
function closeNotPerformedModal() {
    const modal = document.getElementById('notPerformedModal');
    modal.style.display = 'none';
    document.getElementById('notPerformedForm').reset();
    console.log("Closed Not Performed modal.");
}

/**
 * Generates and displays the HTML report for a single activity in a modal.
 * @param {number} id - The ID of the activity.
 */
function generateReport(id) {
    const activity = activities.find(a => a.id === id);
    if (!activity) {
        console.error("Activity not found for report generation:", id);
        return;
    }
    console.log("Generating individual report for activity ID:", id);

    let reportContentHTML = `
        <h4>${activity.occurrence || 'N/A'}</h4>
        <p><strong>Descrição:</strong> ${activity.description || 'N/A'}</p>
        <p><strong>Tipo:</strong> ${activity.type || 'N/A'}</p>
        <p><strong>Equipe:</strong> ${activity.team || 'N/A'}</p>
        <p><strong>Norma:</strong> ${activity.norm || 'N/A'}</p>
        <p><strong>Período:</strong> ${activity.period || 'N/A'}${activity.customPeriod ? ` (${activity.customPeriod})` : ''}</p>
        <p><strong>Criado em:</strong> ${new Date(activity.created).toLocaleString()}</p>
        <p><strong>Status:</strong> ${activity.archived ? 'Arquivada' : 'Ativa'}</p>
        ${!activity.archived ? `<p><strong>Próxima Execução:</strong> ${activity.nextDate || 'N/A'}</p>` : ''}
        <hr style="border-top: 1px solid #ccc; margin: 15px 0;">
    `;

    if (activity.reports && activity.reports.length > 0) {
        reportContentHTML += '<h4>Histórico de Registros:</h4>';
        // Iterate in reverse chronological order (newest first)
        [...activity.reports].reverse().forEach((report, index) => {
            const reportDate = new Date(report.date).toLocaleString();
            const status = report.performed ? "Realizada" : "Não realizada";
            const reportNumber = activity.reports.length - index;

            reportContentHTML += `
                <div class="report-item">
                    <p><strong>Registro #${reportNumber} (${status})</strong></p>
                    <p><strong>Data:</strong> ${reportDate}</p>
                    ${report.performed ? `
                        ${report.beforeDescription ? `<p><strong>Pré-Desc.:</strong> ${report.beforeDescription}</p>` : ''}
                        ${report.beforeImage ? `<p><strong>Foto Antes:</strong> <a href="${report.beforeImage}" target="_blank" rel="noopener noreferrer">Ver Foto</a></p>` : ''}
                        ${report.afterDescription ? `<p><strong>Pós-Desc.:</strong> ${report.afterDescription}</p>` : ''}
                        ${report.afterImage ? `<p><strong>Foto Depois:</strong> <a href="${report.afterImage}" target="_blank" rel="noopener noreferrer">Ver Foto</a></p>` : ''}
                    ` : `
                        ${report.reason ? `<p><strong>Motivo:</strong> ${report.reason}</p>` : ''}
                    `}
                </div>
                ${index < activity.reports.length - 1 ? '<hr style="border-top: 1px dashed #eee; margin: 10px 0;">' : ''}
            `;
        });
    } else {
        reportContentHTML += '<p>Nenhum registro histórico encontrado.</p>';
    }

    document.getElementById('reportContent').innerHTML = reportContentHTML;
    // Store activity ID on the modal for the download button
    document.getElementById('reportModal').dataset.activityId = id;
    document.getElementById('reportModal').style.display = 'block';
}

/**
 * Downloads the content of the individual report modal as a text file.
 */
function downloadReport() {
    const reportContentElement = document.getElementById('reportContent');
    const activityId = document.getElementById('reportModal').dataset.activityId;
    const activity = activities.find(a => a.id == activityId); // Use == for potential string/number comparison

    if (!activity) {
        console.error("Cannot download report, activity not found for ID:", activityId);
        alert("Erro ao encontrar atividade para baixar relatório.");
        return;
    }

    // Create a cleaner text representation
    let textContent = `RELATÓRIO DA ATIVIDADE\n`;
    textContent += `=========================\n`;
    textContent += `Ocorrência: ${activity.occurrence || 'N/A'}\n`;
    textContent += `Descrição: ${activity.description || 'N/A'}\n`;
    textContent += `Tipo: ${activity.type || 'N/A'}\n`;
    textContent += `Equipe: ${activity.team || 'N/A'}\n`;
    textContent += `Norma: ${activity.norm || 'N/A'}\n`;
    textContent += `Período: ${activity.period || 'N/A'}${activity.customPeriod ? ` (${activity.customPeriod})` : ''}\n`;
    textContent += `Criado em: ${new Date(activity.created).toLocaleString()}\n`;
    textContent += `Status: ${activity.archived ? 'Arquivada' : 'Ativa'}\n`;
    if (!activity.archived) textContent += `Próxima Execução: ${activity.nextDate || 'N/A'}\n`;
    textContent += `\n--- Histórico de Registros ---\n`;

    if (activity.reports && activity.reports.length > 0) {
         [...activity.reports].reverse().forEach((report, index) => {
             const reportDate = new Date(report.date).toLocaleString();
             const status = report.performed ? "Realizada" : "Não realizada";
             const reportNumber = activity.reports.length - index;
             textContent += `\nRegistro #${reportNumber} (${status}) - Data: ${reportDate}\n`;
             if (report.performed) {
                 if (report.beforeDescription) textContent += `  Pré-Desc.: ${report.beforeDescription}\n`;
                 if (report.beforeImage) textContent += `  Foto Antes: (Anexada - ver link no sistema)\n`;
                 if (report.afterDescription) textContent += `  Pós-Desc.: ${report.afterDescription}\n`;
                 if (report.afterImage) textContent += `  Foto Depois: (Anexada - ver link no sistema)\n`;
             } else {
                  if (report.reason) textContent += `  Motivo: ${report.reason}\n`;
             }
         });
    } else {
         textContent += `Nenhum registro histórico encontrado.\n`;
    }
    textContent += `=========================\n`;


    const filename = `relatorio_${activity.occurrence.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${activityId}.txt`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url);
    console.log("Downloaded individual text report:", filename);
}

/**
 * Closes the individual report modal.
 */
function closeReport() {
    const modal = document.getElementById('reportModal');
    modal.style.display = 'none';
    document.getElementById('reportContent').innerHTML = ''; // Clear content
    delete modal.dataset.activityId; // Remove stored ID
    console.log("Closed individual report modal.");
}


/**
 * Generates a consolidated PDF report for all archived activities.
 */
function generateArchivedPdfReport() {
    console.log("Attempting to generate archived PDF report...");
    const doc = new jsPDF();
    const archived = activities.filter(a => a.archived);

    if (archived.length === 0) {
        alert("Não há atividades arquivadas para gerar o relatório.");
        console.log("No archived activities found.");
        return;
    }

    console.log(`Found ${archived.length} archived activities.`);

    let yPosition = 15; // Initial Y position
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const baseLineHeight = 7; // Base line height for normal text

    // Helper to add text with automatic page breaks
    const addTextWithWrap = (text, x, y, options = {}, lineHeight = baseLineHeight) => {
        const lines = doc.splitTextToSize(text, options.maxWidth || contentWidth);
        const neededHeight = lines.length * lineHeight * (options.lineSpacingFactor || 1);

        // Check for page break before adding text block
        if (y + neededHeight > pageHeight - margin) {
            doc.addPage();
            y = margin; // Reset Y for new page
        }
        doc.text(lines, x, y, options);
        return y + neededHeight; // Return new Y position
    };

    // Add main title
    doc.setFontSize(18);
    yPosition = addTextWithWrap("Relatório Consolidado de Atividades Arquivadas", pageWidth / 2, yPosition, { align: 'center' }, baseLineHeight * 1.2);
    yPosition += baseLineHeight; // Add extra space after title


    // Sort archived activities (e.g., by last report date, descending)
    archived.sort((a, b) => {
         const dateA = a.reports && a.reports.length > 0 ? new Date(a.reports[a.reports.length - 1].date) : 0;
         const dateB = b.reports && b.reports.length > 0 ? new Date(b.reports[b.reports.length - 1].date) : 0;
         return dateB - dateA; // Newest first
    });


    archived.forEach((activity, index) => {
        // Check if enough space for the header and some content, otherwise add page
        if (yPosition + baseLineHeight * 5 > pageHeight - margin) {
             doc.addPage();
             yPosition = margin;
        }

        // Activity Header
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        yPosition = addTextWithWrap(`Atividade #${index + 1}: ${activity.occurrence || 'N/A'}`, margin, yPosition, {}, baseLineHeight * 1.1);
        doc.setFont(undefined, 'normal');
        yPosition += baseLineHeight * 0.5; // Space after header

        // Basic Activity Info
        doc.setFontSize(10);
        const basicInfo = [
            `Descrição: ${activity.description || 'N/A'}`,
            `Tipo: ${activity.type || 'N/A'}`,
            `Equipe: ${activity.team || 'N/A'}`,
            `Norma: ${activity.norm || 'N/A'}`,
            `Período: ${activity.period || 'N/A'}${activity.customPeriod ? ` (${activity.customPeriod})` : ''}`,
            `Criado em: ${new Date(activity.created).toLocaleString()}`
        ];
        basicInfo.forEach(line => {
            yPosition = addTextWithWrap(line, margin, yPosition, { maxWidth: contentWidth }, baseLineHeight * 0.9);
        });
        yPosition += baseLineHeight * 0.7; // Space before history

        // History Section
        if (activity.reports && activity.reports.length > 0) {
            if (yPosition + baseLineHeight * 2 > pageHeight - margin) { // Check space for history header
                doc.addPage(); yPosition = margin;
            }
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            yPosition = addTextWithWrap("Histórico de Registros:", margin, yPosition, {}, baseLineHeight);
            doc.setFont(undefined, 'normal');
            yPosition += baseLineHeight * 0.3;

            // Show reports (newest first)
            [...activity.reports].reverse().forEach((report, reportIndex) => {
                const reportDate = new Date(report.date).toLocaleString();
                const status = report.performed ? "Realizada" : "Não realizada";
                const reportNumber = activity.reports.length - reportIndex;
                let reportHeader = `Registro #${reportNumber} (${status}) - Data: ${reportDate}`;

                 if (yPosition + baseLineHeight * 2 > pageHeight - margin) { // Check space per report entry
                    doc.addPage(); yPosition = margin;
                 }

                doc.setFontSize(10);
                doc.setFont(undefined, 'italic');
                yPosition = addTextWithWrap(reportHeader, margin + 5, yPosition, { maxWidth: contentWidth - 5 }, baseLineHeight * 0.9);
                doc.setFont(undefined, 'normal');

                let details = [];
                if (report.performed) {
                    if(report.beforeDescription) details.push(`  Pré-Desc.: ${report.beforeDescription}`);
                    if(report.beforeImage) details.push(`  Foto Antes: (Link no sistema)`);
                    if(report.afterDescription) details.push(`  Pós-Desc.: ${report.afterDescription}`);
                    if(report.afterImage) details.push(`  Foto Depois: (Link no sistema)`);
                } else {
                    if(report.reason) details.push(`  Motivo: ${report.reason}`);
                }

                details.forEach(detailLine => {
                     yPosition = addTextWithWrap(detailLine, margin + 5, yPosition, { maxWidth: contentWidth - 10 }, baseLineHeight * 0.8);
                });
                yPosition += baseLineHeight * 0.5; // Space between report entries
            });

        } else {
            yPosition = addTextWithWrap("Nenhum registro histórico encontrado.", margin + 5, yPosition, {}, baseLineHeight * 0.9);
        }

        // Add separator line between activities unless it's the last one
        if (index < archived.length - 1) {
             if (yPosition + baseLineHeight * 2 > pageHeight - margin) { // Check space before adding line
                doc.addPage(); yPosition = margin;
             }
            doc.setDrawColor(200, 200, 200); // Light gray
            doc.line(margin, yPosition, pageWidth - margin, yPosition); // Draw line
            yPosition += baseLineHeight * 1.5; // Space after line
        }
    });

    // Save the PDF
    try {
        doc.save('relatorio_atividades_arquivadas.pdf');
        console.log("Archived PDF report generation complete.");
    } catch (e) {
        console.error("Error generating or saving PDF:", e);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para detalhes.");
    }
}

// --- Event Listeners ---

// Form for creating new activities
document.getElementById('activityForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log("Submitting new activity form...");

    const period = document.getElementById('period').value;
    const customPeriod = document.getElementById('customPeriod').value;

    // Validate custom period if selected
    if (period === 'Customizado' && !customPeriod.match(/(\d+)\s*(dias?|meses?|anos?)/i)) {
        alert('Por favor, insira um período customizado válido (ex: "7 dias", "2 meses", "1 ano").');
        console.warn("Invalid custom period submitted:", customPeriod);
        return; // Stop submission
    }

    // Attempt to calculate the next date
    const nextDateValue = calculateNextDate(period, customPeriod);
    if (!nextDateValue && period !== 'Customizado') { // Allow custom without initial calc failure if format was wrong
         // For standard periods, failure is less expected unless config is wrong.
        console.error("Failed to calculate next date for standard period:", period);
        alert('Não foi possível calcular a próxima data para o período selecionado.');
        return;
    }
     // If custom calculation failed, maybe warn but allow creation without a date? Or enforce format better.
     // For now, we proceed even if nextDateValue is null for custom periods if format was bad

    const newActivity = {
        id: Date.now(), // Use timestamp as a simple unique ID
        occurrence: document.getElementById('occurrence').value,
        norm: document.getElementById('norm').value,
        description: document.getElementById('description').value,
        team: document.getElementById('team').value,
        period: period,
        customPeriod: period === 'Customizado' ? customPeriod : '',
        type: document.getElementById('type').value,
        nextDate: nextDateValue, // Store calculated date or null
        created: new Date().toISOString(),
        archived: false,
        reports: [] // Initialize empty reports array
    };

    activities.push(newActivity); // Add to the main array
    saveActivities(); // Persist changes
    renderActivities(); // Update the UI
    e.target.reset(); // Clear the form
    toggleCustomInput(); // Reset custom input visibility
    toggleForm(); // Collapse the form
    console.log("New activity created:", newActivity.id);
});

// Form for marking activity as performed
document.getElementById('performForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('activityId').value);
    console.log("Submitting Perform form for activity ID:", id);

    const activityIndex = activities.findIndex(a => a.id === id);
    if (activityIndex === -1) {
        console.error("Activity not found to perform:", id);
        alert("Erro: Atividade não encontrada.");
        closePerformModal();
        return;
    }

    const beforeImageFile = document.getElementById('beforeImage').files[0];
    const afterImageFile = document.getElementById('afterImage').files[0];

    // Create temporary Blob URLs for image references in the report
    const beforeImageUrl = beforeImageFile ? URL.createObjectURL(beforeImageFile) : null;
    const afterImageUrl = afterImageFile ? URL.createObjectURL(afterImageFile) : null;

    // Store these temp URLs for potential cleanup in closePerformModal
     if(beforeImageUrl) document.getElementById('beforeImage')._previewUrl = beforeImageUrl;
     if(afterImageUrl) document.getElementById('afterImage')._previewUrl = afterImageUrl;

    const report = {
        date: new Date().toISOString(),
        performed: true,
        beforeImage: beforeImageUrl, // Store the temporary URL
        beforeDescription: document.getElementById('beforeDescription').value,
        afterImage: afterImageUrl,   // Store the temporary URL
        afterDescription: document.getElementById('afterDescription').value
    };

    let activity = activities[activityIndex];
    if (!activity.reports) activity.reports = []; // Ensure reports array exists

    activity.reports.push(report);
    activity.archived = true; // Mark as archived
    activity.nextDate = null; // Clear next execution date for archived items

    activities[activityIndex] = activity; // Update the item in the array

    saveActivities();
    renderActivities();
    closePerformModal(); // Close modal and reset form
    console.log("Activity marked as performed and archived:", id);
});

// Form for marking activity as not performed
document.getElementById('notPerformedForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('notPerformedActivityId').value);
    console.log("Submitting Not Performed form for activity ID:", id);

    const activityIndex = activities.findIndex(a => a.id === id);
    if (activityIndex === -1) {
        console.error("Activity not found for non-performance:", id);
         alert("Erro: Atividade não encontrada.");
        closeNotPerformedModal();
        return;
    }

    const report = {
        date: new Date().toISOString(),
        performed: false,
        reason: document.getElementById('reason').value
    };

    let activity = activities[activityIndex];
    if (!activity.reports) activity.reports = []; // Ensure reports array exists

    activity.reports.push(report);
    activity.archived = true; // Mark as archived
    activity.nextDate = null; // Clear next execution date

    activities[activityIndex] = activity; // Update item in array

    saveActivities();
    renderActivities();
    closeNotPerformedModal(); // Close modal and reset form
    console.log("Activity marked as not performed and archived:", id);
});

// Button to generate consolidated PDF report
document.getElementById('generatePdfButton').addEventListener('click', generateArchivedPdfReport);


// --- Initialization and Global Event Handlers ---

// Initial render when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded. Initializing...");
    renderActivities();
    // Ensure custom input visibility is correct on load (if form starts expanded or has preset value)
    toggleCustomInput();
});

// Close modals if clicked outside the content area
window.onclick = function(event) {
    const modals = ['reportModal', 'performModal', 'notPerformedModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && event.target === modal) { // Check if the click is on the modal background
            console.log(`Clicked outside ${modalId} content. Closing modal.`);
            switch (modalId) {
                case 'reportModal': closeReport(); break;
                case 'performModal': closePerformModal(); break;
                case 'notPerformedModal': closeNotPerformedModal(); break;
                default: modal.style.display = 'none'; // Fallback
            }
        }
    });
};