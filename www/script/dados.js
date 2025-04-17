const TICKET_STORAGE_KEY = 'listaDeChamados';

function loadTickets() {
    const savedTickets = localStorage.getItem(TICKET_STORAGE_KEY);
    if (savedTickets) {
        try {
            // Revive as datas que podem ter sido salvas como strings
            const tickets = JSON.parse(savedTickets);
            return tickets.map(ticket => ({
                ...ticket,
                createdAt: ticket.createdAt ? new Date(ticket.createdAt) : null,
                expiresAt: ticket.expiresAt ? new Date(ticket.expiresAt) : null,
                completedAt: ticket.completedAt ? new Date(ticket.completedAt) : null,
                archivedAt: ticket.archivedAt ? new Date(ticket.archivedAt) : null,
            }));
        } catch (e) {
            console.error("Erro ao carregar chamados do localStorage:", e);
            return []; // Retorna lista vazia em caso de erro
        }
    }
    return []; // Retorna lista vazia se não houver nada salvo
}

function saveTickets(ticketsArray) {
    try {
        // Salva as datas como ISO strings para consistência no JSON
        const ticketsToSave = ticketsArray.map(ticket => ({
            ...ticket,
            createdAt: ticket.createdAt ? ticket.createdAt.toISOString() : null,
            expiresAt: ticket.expiresAt ? ticket.expiresAt.toISOString() : null,
            completedAt: ticket.completedAt ? ticket.completedAt.toISOString() : null,
            archivedAt: ticket.archivedAt ? ticket.archivedAt.toISOString() : null,
        }));
        localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(ticketsToSave));
    } catch (e) {
        console.error("Erro ao salvar chamados no localStorage:", e);
        alert("Erro ao salvar a lista de chamados.");
    }
}

function getNextTicketId(tickets) {
     return tickets.length > 0 ? Math.max(0, ...tickets.map(t => t.id || 0)) + 1 : 1;
}

function calculateExpirationDate(priority, createdAt) {
    const creationDate = new Date(createdAt);
    let daysToAdd = 0;
    switch (priority) {
        case 'Baixo': daysToAdd = 14; break;
        case 'Média': daysToAdd = 7; break;
        case 'Alta': daysToAdd = 3; break;
        case 'Urgência': daysToAdd = 2; break; // 48 horas = 2 dias
        default: daysToAdd = 14; // Padrão se prioridade for inválida
    }
    creationDate.setDate(creationDate.getDate() + daysToAdd);
    return creationDate;
}