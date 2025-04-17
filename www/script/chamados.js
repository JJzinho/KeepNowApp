// www/script/chamados.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Elementos DOM ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pendenteList = document.getElementById('pendente-list');
    const andamentoList = document.getElementById('andamento-list');
    const concluidoList = document.getElementById('concluido-list');
    const arquivadoList = document.getElementById('arquivado-list');

    let allTickets = []; // Armazena todos os chamados carregados

    // --- Funções de Renderização ---

    /**
     * Calcula o tempo restante até uma data ou "Expirado".
     * @param {Date | string} date - A data de expiração/arquivamento.
     * @returns {string | null} - String formatada do tempo restante ou null.
     */
    function timeUntil(date) {
        if (!date) return null;
        const now = new Date();
        const target = new Date(date); // Garante que é um objeto Date

        if (isNaN(target.getTime())) return null; // Data inválida

        const diffMillis = target - now;

        if (diffMillis <= 0) return "Expirado";

        const diffSeconds = Math.floor(diffMillis / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        let result = "";
        if (diffDays > 0) {
            result += `${diffDays}d `;
        }
        if (diffHours % 24 > 0) {
             // Mostra horas apenas se for menos de 1 dia ou se houver dias
            if (diffDays > 0 || diffHours % 24 > 0) {
                result += `${diffHours % 24}h `;
            }
        }
         // Mostra minutos apenas se for menos de 1 hora e não negativo
         if (diffDays === 0 && diffHours % 24 === 0 && diffMinutes % 60 > 0) {
            result += `${diffMinutes % 60}m`;
        }
        // Se tudo for zero mas ainda positivo, é menos de 1 minuto
        if (result.trim() === "" && diffMillis > 0) return "Menos de 1m";

        return result.trim() || "Expirado"; // Fallback caso algo dê errado
    }

    /**
     * Cria o elemento HTML (card) para um chamado.
     * @param {object} ticket - O objeto do chamado.
     * @returns {HTMLElement} - O elemento div do card.
     */
    function createTicketCard(ticket) {
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.dataset.ticketId = ticket.id; // Armazena o ID no elemento

        const expirationText = ticket.status === 'Pendente' && ticket.expiresAt ? timeUntil(ticket.expiresAt) : null;
        // Calcula quando o item concluído deve ser arquivado (3 dias após conclusão)
        const autoArchiveDate = ticket.status === 'Concluido' && ticket.completedAt
            ? new Date(new Date(ticket.completedAt).getTime() + 3 * 24 * 60 * 60 * 1000)
            : null;
        const archivalText = autoArchiveDate ? timeUntil(autoArchiveDate) : null;


        // --- HTML Dinâmico por Status ---
        let actionsHtml = '';
        let observationHtml = '';
        let resolutionHtml = '';
        let attachmentHtml = '';
        let archivedReasonHtml = '';

        switch (ticket.status) {
            case 'Pendente':
                actionsHtml = `
                    <button class="btn btn-danger cancel-btn" title="Cancelar Chamado"><i class="material-icons">cancel</i> Cancelar</button>
                    <button class="btn btn-primary follow-btn" title="Iniciar Atendimento"><i class="material-icons">arrow_forward</i> Seguir</button>
                `;
                break;

            case 'Em Andamento':
                observationHtml = `
                    <div class="observation-section">
                        <label for="obs-${ticket.id}">Observação:</label>
                        <textarea id="obs-${ticket.id}" class="observation-input" placeholder="Adicione detalhes sobre o andamento...">${ticket.observation || ''}</textarea>
                    </div>
                `;
                resolutionHtml = `
                    <div class="resolution-section">
                        <label>Resolver como:</label>
                        <div>
                            <input type="radio" id="res-realizado-${ticket.id}" name="resolution-${ticket.id}" value="Realizado" ${ticket.resolution === 'Realizado' ? 'checked' : ''}>
                            <label for="res-realizado-${ticket.id}">Realizado</label>
                        </div>
                        <div>
                            <input type="radio" id="res-cancelado-${ticket.id}" name="resolution-${ticket.id}" value="Cancelado" ${ticket.resolution === 'Cancelado' ? 'checked' : ''}>
                            <label for="res-cancelado-${ticket.id}">Cancelado</label>
                        </div>
                    </div>
                 `;
                actionsHtml = `
                    <button class="btn btn-success complete-btn" title="Marcar como Concluído ou Cancelado" disabled><i class="material-icons">check_circle</i> Concluir Ação</button>
                `;
                break;

            case 'Concluido':
                 // Mostra observação se existir
                observationHtml = ticket.observation ? `
                    <div class="observation-section">
                        <strong>Observação Final:</strong>
                        <p>${ticket.observation}</p>
                    </div>` : '';
                 // Seção de anexos
                attachmentHtml = `
                    <div class="attachment-section">
                         <label for="attach-${ticket.id}">Anexar Doc/Foto (OS, NF - Simulado):</label>
                         <input type="file" id="attach-${ticket.id}" class="attachment-input" accept="image/*,application/pdf">
                         <ul class="attachment-list" id="attach-list-${ticket.id}">
                             ${ticket.attachments?.map(att => `<li title="${att.name} (${(att.size / 1024).toFixed(1)} KB)">${att.name}</li>`).join('') || ''}
                         </ul>
                         ${ticket.attachments?.length === 0 ? '<small>Nenhum anexo.</small>' : ''}
                     </div>
                 `;
                 // Não há botões de ação, apenas arquivamento automático
                break;

            case 'Arquivado':
                 // Mostra observação se existir
                observationHtml = ticket.observation ? `
                    <div class="observation-section">
                        <strong>Observação Final:</strong>
                        <p>${ticket.observation}</p>
                    </div>` : '';
                 // Mostra anexos se existirem
                attachmentHtml = ticket.attachments?.length > 0 ? `
                    <div class="attachment-section">
                         <strong>Anexos:</strong>
                         <ul class="attachment-list">
                             ${ticket.attachments.map(att => `<li title="${att.name} (${(att.size / 1024).toFixed(1)} KB)">${att.name}</li>`).join('')}
                         </ul>
                     </div>
                 ` : '';
                 // Mostra motivo do arquivamento
                archivedReasonHtml = `
                    <div class="archived-reason">
                        <i class="material-icons">archive</i>
                        Arquivado em ${formatDate(ticket.archivedAt)}
                        ${ticket.resolution ? ` (Motivo: ${ticket.resolution})` : ''}
                    </div>
                 `;
                 // Botão para desarquivar (opcional, pode ser complexo redefinir status anterior)
                 // actionsHtml = `<button class="btn btn-secondary unarchive-btn"><i class="material-icons">unarchive</i> Desarquivar</button>`;
                break;
        }

        // --- Montagem do HTML do Card ---
        card.innerHTML = `
            <div class="ticket-header">
                <span class="ticket-occurrence">${getOccurrenceName(ticket.occurrence)}</span>
                <span class="ticket-priority ${ticket.priority}">${ticket.priority}</span>
            </div>
            <div class="ticket-info"><i class="material-icons">location_on</i> <span>${ticket.location}</span></div>
            <div class="ticket-info"><i class="material-icons">description</i> <span>${ticket.description}</span></div>
            <div class="ticket-info"><i class="material-icons">business</i> <span>${ticket.condoName}</span></div>
            <div class="ticket-info"><i class="material-icons">event</i> <span>Criado em: ${formatDate(ticket.createdAt)}</span></div>

            ${expirationText ? `<div class="expiration-info"><i class="material-icons">timer</i> Expira em: ${expirationText} (${formatDate(ticket.expiresAt)})</div>` : ''}
            ${archivalText ? `<div class="archival-info"><i class="material-icons">inventory_2</i> Arquiva em: ${archivalText}</div>` : ''}

            ${observationHtml}
            ${resolutionHtml}
            ${attachmentHtml}
            ${archivedReasonHtml}

            <div class="ticket-actions">
                ${actionsHtml}
            </div>
        `;

        // --- Adicionar Listeners aos Elementos INTERNOS do Card ---

        // Botão Seguir (Pendente -> Em Andamento)
        const followBtn = card.querySelector('.follow-btn');
        if (followBtn) {
            followBtn.addEventListener('click', () => moveTicketStatus(ticket.id, 'Em Andamento'));
        }

        // Botão Cancelar (Pendente -> Arquivado)
        const cancelBtn = card.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                 if (confirm(`Tem certeza que deseja cancelar o chamado "${getOccurrenceName(ticket.occurrence)} - ${ticket.location}"?`)) {
                    archiveTicket(ticket.id, 'Cancelado'); // Arquiva com motivo 'Cancelado'
                 }
            });
        }

        // Input de Observação (Em Andamento) - Salva ao perder foco (blur)
        const obsInput = card.querySelector('.observation-input');
        if (obsInput) {
            obsInput.addEventListener('blur', (e) => updateTicketObservation(ticket.id, e.target.value));
            // Usar 'blur' em vez de 'change' ou 'input' para salvar quando o usuário sai do campo
        }

        // Radio Buttons de Resolução (Em Andamento)
        const resolutionRadios = card.querySelectorAll(`input[name="resolution-${ticket.id}"]`);
        const completeBtn = card.querySelector('.complete-btn'); // Pega o botão concluir DENTRO do cartão atual

        resolutionRadios.forEach(radio => {
             radio.addEventListener('change', (e) => {
                if (e.target.checked && completeBtn) {
                     updateTicketResolution(ticket.id, e.target.value); // Salva a resolução escolhida imediatamente
                     completeBtn.disabled = false; // Habilita o botão Concluir Ação
                }
             });
             // Habilitar botão Concluir Ação se já houver uma resolução marcada ao renderizar o card
             if(radio.checked && completeBtn) {
                 completeBtn.disabled = false;
             }
        });


        // Botão Concluir Ação (Em Andamento -> Concluido ou Arquivado)
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                const selectedResolution = card.querySelector(`input[name="resolution-${ticket.id}"]:checked`);
                if (selectedResolution) {
                    const resolutionValue = selectedResolution.value;
                    if (resolutionValue === 'Realizado') {
                        completeTicket(ticket.id); // Move para Concluido
                    } else if (resolutionValue === 'Cancelado') {
                         // Confirmação extra para cancelamento nesta etapa
                         if (confirm(`Tem certeza que deseja marcar este chamado como CANCELADO durante o andamento?\n\n"${getOccurrenceName(ticket.occurrence)} - ${ticket.location}"`)) {
                            archiveTicket(ticket.id, 'Cancelado'); // Move para Arquivado com motivo 'Cancelado'
                         }
                    }
                } else {
                    // Este caso não deveria ocorrer se o botão só habilita ao selecionar, mas é uma segurança
                    alert("Por favor, selecione uma resolução (Realizado ou Cancelado) antes de concluir a ação.");
                }
            });
        }

         // Input de Anexo (Concluido)
        const attachInput = card.querySelector('.attachment-input');
        if (attachInput) {
            attachInput.addEventListener('change', (e) => handleAttachment(ticket.id, e.target.files[0], card)); // Passa o card para atualizar a lista
        }

        // Botão Desarquivar (Arquivado - Opcional)
        // const unarchiveBtn = card.querySelector('.unarchive-btn');
        // if (unarchiveBtn) {
        //     unarchiveBtn.addEventListener('click', () => {
        //         // Lógica para desarquivar (ex: mover para Pendente ou Andamento?)
        //         // Pode precisar de mais regras de negócio.
        //         alert(`Desarquivar ticket ${ticket.id} (funcionalidade não implementada)`);
        //     });
        // }

        return card;
    }

    /**
     * Renderiza todos os chamados nas suas respectivas listas/abas.
     */
    function renderAllTickets() {
        // Limpar listas atuais
        pendenteList.innerHTML = '';
        andamentoList.innerHTML = '';
        concluidoList.innerHTML = '';
        arquivadoList.innerHTML = '';

        const fragmentPendente = document.createDocumentFragment();
        const fragmentAndamento = document.createDocumentFragment();
        const fragmentConcluido = document.createDocumentFragment();
        const fragmentArquivado = document.createDocumentFragment();

        let counts = { Pendente: 0, Andamento: 0, Concluido: 0, Arquivado: 0 };

        // Ordenar por mais recente primeiro
        allTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        allTickets.forEach(ticket => {
            const card = createTicketCard(ticket);
            switch (ticket.status) {
                case 'Pendente':
                    fragmentPendente.appendChild(card);
                    counts.Pendente++;
                    break;
                case 'Em Andamento':
                    fragmentAndamento.appendChild(card);
                    counts.Andamento++;
                    break;
                case 'Concluido':
                    fragmentConcluido.appendChild(card);
                    counts.Concluido++;
                    break;
                case 'Arquivado':
                    fragmentArquivado.appendChild(card);
                    counts.Arquivado++;
                    break;
            }
        });

        // Adicionar fragmentos ou mensagens de lista vazia
        pendenteList.appendChild(counts.Pendente > 0 ? fragmentPendente : createEmptyListMessage('Nenhum chamado pendente.'));
        andamentoList.appendChild(counts.Andamento > 0 ? fragmentAndamento : createEmptyListMessage('Nenhum chamado em andamento.'));
        concluidoList.appendChild(counts.Concluido > 0 ? fragmentConcluido : createEmptyListMessage('Nenhum chamado concluído recentemente.'));
        arquivadoList.appendChild(counts.Arquivado > 0 ? fragmentArquivado : createEmptyListMessage('Nenhum chamado arquivado.'));

        updateTabCounts(counts); // Atualiza contagem nas abas
    }

    /**
     * Cria um elemento de mensagem para listas vazias.
     * @param {string} text - O texto da mensagem.
     * @returns {HTMLElement} - O elemento div da mensagem.
     */
    function createEmptyListMessage(text) {
        const div = document.createElement('div');
        div.className = 'status-message';
        div.textContent = text;
        return div;
    }

    /**
     * Atualiza os contadores exibidos nas abas.
     * @param {object} counts - Objeto com a contagem para cada status (Pendente, Andamento, etc.).
     */
    function updateTabCounts(counts) {
        tabButtons.forEach(button => {
            const tabName = button.dataset.tab; // pendente, andamento, etc.
            // Converte para a chave do objeto counts (Pendente, Andamento, etc.)
            const countKey = tabName.charAt(0).toUpperCase() + tabName.slice(1);
            const count = counts[countKey] || 0;

            // Remove contagem antiga
            const existingCountSpan = button.querySelector('.tab-count');
            if (existingCountSpan) {
                existingCountSpan.remove();
            }
            // Adiciona nova contagem se for maior que 0
            if (count > 0) {
                const countSpan = document.createElement('span');
                countSpan.className = 'tab-count';
                countSpan.textContent = `(${count})`;
                button.appendChild(countSpan);
            }
        });
    }


    // --- Funções de Lógica de Negócio (Manipulação de Dados) ---

    /**
     * Encontra o índice de um chamado na lista `allTickets`.
     * @param {number} ticketId - O ID do chamado.
     * @returns {number} - O índice do chamado ou -1 se não encontrado.
     */
    function findTicketIndex(ticketId) {
        // Usa Number() para garantir que a comparação seja entre números
        return allTickets.findIndex(t => Number(t.id) === Number(ticketId));
    }

    /**
     * Move um chamado para um novo status.
     * @param {number} ticketId - ID do chamado.
     * @param {string} newStatus - O novo status ('Em Andamento', 'Concluido', 'Arquivado').
     */
    function moveTicketStatus(ticketId, newStatus) {
        const index = findTicketIndex(ticketId);
        if (index > -1) {
            console.log(`Movendo ticket ${ticketId} para ${newStatus}`);
            allTickets[index].status = newStatus;
            // Limpar resolução ao mover para frente? Decidi não limpar, pode ser útil manter.
            // Se mover para 'Em Andamento', talvez limpar 'completedAt' e 'archivedAt'?
            if (newStatus === 'Em Andamento') {
                allTickets[index].completedAt = null;
                allTickets[index].archivedAt = null;
                 allTickets[index].resolution = null; // Limpa resolução ao voltar para andamento? Opcional.
            }
            saveTickets(allTickets);
            renderAllTickets(); // Re-renderiza tudo para mover o cartão visualmente
        } else {
            console.error(`Ticket ${ticketId} não encontrado para mover status.`);
        }
    }

    /**
     * Atualiza a observação de um chamado.
     * @param {number} ticketId - ID do chamado.
     * @param {string} observation - O novo texto da observação.
     */
    function updateTicketObservation(ticketId, observation) {
        const index = findTicketIndex(ticketId);
        if (index > -1) {
            if (allTickets[index].observation !== observation) { // Salva só se mudou
                console.log(`Atualizando observação do ticket ${ticketId}`);
                allTickets[index].observation = observation;
                saveTickets(allTickets);
                // Não precisa re-renderizar tudo aqui, apenas salvar.
            }
        } else {
            console.error(`Ticket ${ticketId} não encontrado para atualizar observação.`);
        }
    }

    /**
      * Atualiza a resolução selecionada para um chamado (antes de concluir).
      * @param {number} ticketId - ID do chamado.
      * @param {string} resolution - A resolução ('Realizado', 'Cancelado').
      */
    function updateTicketResolution(ticketId, resolution) {
        const index = findTicketIndex(ticketId);
        if (index > -1) {
             if (allTickets[index].resolution !== resolution) {
                console.log(`Atualizando resolução do ticket ${ticketId} para ${resolution}`);
                allTickets[index].resolution = resolution;
                saveTickets(allTickets);
            }
        } else {
             console.error(`Ticket ${ticketId} não encontrado para atualizar resolução.`);
        }
    }

    /**
     * Marca um chamado como concluído (status 'Concluido').
     * @param {number} ticketId - ID do chamado.
     */
    function completeTicket(ticketId) {
        const index = findTicketIndex(ticketId);
        if (index > -1) {
            console.log(`Concluindo ticket ${ticketId}`);
            allTickets[index].status = 'Concluido';
            allTickets[index].completedAt = new Date(); // Marca data/hora da conclusão
            allTickets[index].resolution = 'Realizado'; // Garante que a resolução seja 'Realizado'
            saveTickets(allTickets);
            renderAllTickets();
        } else {
             console.error(`Ticket ${ticketId} não encontrado para concluir.`);
        }
    }

    /**
     * Move um chamado para o status 'Arquivado'.
     * @param {number} ticketId - ID do chamado.
     * @param {string} reason - O motivo ('Cancelado', 'Expirado', ou outro).
     */
    function archiveTicket(ticketId, reason) {
        const index = findTicketIndex(ticketId);
        if (index > -1) {
            console.log(`Arquivando ticket ${ticketId} por motivo: ${reason}`);
            allTickets[index].status = 'Arquivado';
            allTickets[index].archivedAt = new Date(); // Marca data/hora do arquivamento
            allTickets[index].resolution = reason;
            // Limpar completedAt se estiver arquivando por expiração/cancelamento?
            if (reason === 'Expirado' || reason === 'Cancelado') {
                allTickets[index].completedAt = null;
            }
            saveTickets(allTickets);
            renderAllTickets();
        } else {
            console.error(`Ticket ${ticketId} não encontrado para arquivar.`);
        }
    }

    /**
     * Simula o anexo de um arquivo, salvando apenas metadados.
     * @param {number} ticketId - ID do chamado.
     * @param {File} file - O objeto File selecionado.
     * @param {HTMLElement} cardElement - O elemento do card para atualizar a lista de anexos.
     */
    function handleAttachment(ticketId, file, cardElement) {
        if (!file) return;

        const index = findTicketIndex(ticketId);
        if (index > -1) {
            if (!allTickets[index].attachments) {
                allTickets[index].attachments = [];
            }

            // Limite de tamanho (ex: 5MB) - importante para localStorage
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(`Arquivo "${file.name}" muito grande (${(file.size / (1024*1024)).toFixed(1)}MB). Limite de 5MB para esta demonstração.`);
                // Limpa o input de arquivo
                const attachInput = cardElement.querySelector(`#attach-${ticketId}`);
                if(attachInput) attachInput.value = null;
                return;
            }

            // Cria objeto com metadados (NÃO salva o conteúdo do arquivo)
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                // lastModified: file.lastModified, // Pode ser útil
            };

            // Adiciona metadados à lista de anexos do ticket
            allTickets[index].attachments.push(fileData);
            saveTickets(allTickets);

            // Atualiza a lista de anexos visualmente no card específico
            const attachListUl = cardElement.querySelector(`#attach-list-${ticketId}`);
            if (attachListUl) {
                const li = document.createElement('li');
                li.title = `${fileData.name} (${(fileData.size / 1024).toFixed(1)} KB)`;
                li.textContent = fileData.name;
                attachListUl.appendChild(li);
                // Remove mensagem "Nenhum anexo" se existir
                const noAttachMsg = attachListUl.parentNode.querySelector('small');
                if(noAttachMsg) noAttachMsg.style.display = 'none';
            }

            alert(`Anexo "${file.name}" registrado (simulação).`);

            // Limpa o input de arquivo após adicionar
            const attachInput = cardElement.querySelector(`#attach-${ticketId}`);
            if(attachInput) attachInput.value = null;

        } else {
             alert("Erro ao encontrar o chamado para anexar o arquivo.");
             const attachInput = cardElement?.querySelector(`#attach-${ticketId}`); // Usa optional chaining
             if(attachInput) attachInput.value = null;
        }
    }

    /**
     * Verifica chamados pendentes expirados e concluídos arquiváveis.
     * Modifica `allTickets` diretamente e retorna true se houve mudanças.
     * @returns {boolean} - True se algum ticket foi modificado, false caso contrário.
     */
    function checkExpiredAndArchivableTickets() {
        const now = new Date();
        let changed = false;
        const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;

        allTickets.forEach(ticket => {
            // 1. Verificar Pendentes Expirados
            // Garante que expiresAt é uma data válida antes de comparar
            if (ticket.status === 'Pendente' && ticket.expiresAt && ticket.expiresAt instanceof Date && !isNaN(ticket.expiresAt) && now > ticket.expiresAt) {
                console.warn(`Chamado ${ticket.id} (${getOccurrenceName(ticket.occurrence)}) expirou. Arquivando...`);
                ticket.status = 'Arquivado';
                ticket.archivedAt = now;
                ticket.resolution = 'Expirado';
                changed = true;
            }

            // 2. Verificar Concluídos para Arquivar (após 3 dias)
             // Garante que completedAt é uma data válida
            if (ticket.status === 'Concluido' && ticket.completedAt && ticket.completedAt instanceof Date && !isNaN(ticket.completedAt)) {
                 if (now.getTime() > (ticket.completedAt.getTime() + threeDaysInMillis)) {
                     console.info(`Chamado ${ticket.id} (${getOccurrenceName(ticket.occurrence)}) concluído há mais de 3 dias. Arquivando...`);
                    ticket.status = 'Arquivado';
                    ticket.archivedAt = now; // Marca a data de arquivamento automático
                     // Mantém a resolução original que levou à conclusão ('Realizado')
                     changed = true;
                 }
            }
        });

        return changed; // Retorna se houve alteração
    }


    // --- Inicialização e Event Listeners Globais ---

    // Troca de Abas
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab; // Ex: "pendente"

            // Remove 'active' de todos os botões e painéis
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Adiciona 'active' ao botão clicado e painel correspondente
            button.classList.add('active');
            const targetPane = document.getElementById(`${targetTab}-list`); // Ex: "pendente-list"
            if (targetPane) {
                targetPane.classList.add('active');
            } else {
                console.error(`Painel da aba #${targetTab}-list não encontrado.`);
            }
        });
    });

    // --- Carga Inicial ---
    allTickets = loadTickets(); // Carrega os dados do localStorage
    console.log("Chamados carregados:", allTickets);

    // Verifica expirações e arquivamentos ANTES da primeira renderização
    const needsUpdate = checkExpiredAndArchivableTickets();
    if (needsUpdate) {
        saveTickets(allTickets); // Salva se houve alteração
    }

    renderAllTickets(); // Renderiza a lista inicial

    // Opcional: Verificar expirações/arquivamentos periodicamente (ex: a cada minuto)
    // Cuidado: setInterval pode consumir recursos se a verificação for pesada.
    const checkInterval = setInterval(() => {
        console.log("Verificando chamados expirados/arquiváveis...");
        const updated = checkExpiredAndArchivableTickets();
        if (updated) {
            saveTickets(allTickets);
            renderAllTickets(); // Re-renderiza se algo mudou
            console.log("Lista de chamados atualizada após verificação.");
        }
    }, 60 * 1000); // 60000 ms = 1 minuto

    // Limpar o intervalo se a página for descarregada (boa prática)
    window.addEventListener('beforeunload', () => {
        clearInterval(checkInterval);
    });


}); // Fim do DOMContentLoaded