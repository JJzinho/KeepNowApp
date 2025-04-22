// --- Função de Conversão para Base64 ---
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Elementos Globais
    const addPageBtn = document.getElementById('add-page-btn');
    const newPageNameInput = document.getElementById('new-page-name');
    const pagesContainer = document.getElementById('pages-container');
    const pageTemplate = document.getElementById('page-template');

    const STORAGE_KEY = 'documentPagesData_v5_mobile_info_dl';

    // --- Funções de Armazenamento Local ---
    function getStoredPages() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Erro ao ler localStorage:", error);
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    }

    function savePages(pages) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
        } catch (error) {
            console.error("Erro ao salvar no localStorage:", error);
            alert("Não foi possível salvar as alterações.");
        }
    }

    // --- Função de Exibição de Preview ---
    function displayPreview(fileType, fileName, previewAreaElement, fileData) {
        previewAreaElement.innerHTML = '';
        const dataUrl = `data:${fileType};base64,${fileData}`;
        
        if (fileType.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = dataUrl;
            img.alt = `Preview de ${fileName}`;
            previewAreaElement.appendChild(img);
        } else if (fileType === 'application/pdf') {
            const embed = document.createElement('embed');
            embed.src = dataUrl;
            embed.type = "application/pdf";
            embed.style.width = "100%";
            embed.style.height = "200px";
            previewAreaElement.appendChild(embed);
        } else {
            previewAreaElement.innerHTML = `<p>📄 ${fileName}</p>`;
        }
    }

    // --- Função de Seleção de Arquivo ---
    async function handleFileSelection(file, previewArea, dateInputsContainer, saveBtn, pageSection, pageData) {
        if (file) {
            try {
                const fileData = await readFileAsBase64(file);
                displayPreview(file.type, file.name, previewArea, fileData);
                dateInputsContainer.style.display = 'flex';
                saveBtn.disabled = false;
                pageSection.currentFile = file;
            } catch (error) {
                console.error("Erro ao processar arquivo:", error);
                alert("Erro ao carregar arquivo!");
            }
        } else {
            if (!pageData.currentDocument) {
                previewArea.innerHTML = '<p>Nenhum arquivo selecionado.</p>';
                dateInputsContainer.style.display = 'none';
                saveBtn.disabled = true;
            }
        }
    }

    // --- Função de Salvar Documento ---
    async function handleSaveDocument(pageSection, pageData, startDateInput, endDateInput, historyListUl, fileInput) {
        const pages = getStoredPages();
        const pageIndex = pages.findIndex(p => p.id === pageData.id);
        if (pageIndex === -1) return;

        const currentPage = pages[pageIndex];
        const fileToSave = pageSection.currentFile;
        const newStartDate = startDateInput.value;
        const newEndDate = endDateInput.value;
        
        if (fileToSave) {
            try {
                const fileData = await readFileAsBase64(fileToSave);
                
                if (currentPage.currentDocument) {
                    currentPage.history.push({
                        ...currentPage.currentDocument,
                        modifiedDate: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                    });
                    if (currentPage.history.length > 10) currentPage.history.shift();
                }

                currentPage.currentDocument = {
                    fileName: fileToSave.name,
                    fileType: fileToSave.type,
                    fileData: fileData,
                    startDate: newStartDate,
                    endDate: newEndDate,
                    savedDate: new Date().toISOString()
                };

                savePages(pages);
                updateHistoryList(currentPage.history, historyListUl);
                alert(`Documento salvo em ${currentPage.name}!`);
                fileInput.value = '';
                
            } catch (error) {
                console.error("Erro ao ler arquivo:", error);
                alert("Erro ao processar arquivo!");
            }
        }
    }

    // --- Função de Download do Histórico ---
    function handleDownloadHistoryInfo(event) {
        const btn = event.currentTarget;
        const fileName = btn.dataset.filename;
        const fileType = btn.dataset.filetype;
        const fileData = btn.dataset.filedata;
    
        if (!fileData) {
            alert("Arquivo original não disponível");
            return;
        }
    
        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileType });
    
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // --- Função de Atualização do Histórico ---
    function updateHistoryList(history, ulElement) {
        ulElement.innerHTML = '';
        const explanationDiv = ulElement.closest('.history-list').querySelector('.history-explanation');
        
        if (!history || history.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Nenhuma modificação anterior.';
            ulElement.appendChild(li);
            if (explanationDiv) explanationDiv.style.display = 'none';
            return;
        }
        
        if (explanationDiv) explanationDiv.style.display = 'block';

        history.slice().reverse().forEach(doc => {
            const li = document.createElement('li');
            
            // Texto do histórico
            const textDiv = document.createElement('div');
            textDiv.innerHTML = `
                <strong>${doc.fileName}</strong>
                <span>Atualizado em: ${doc.modifiedDate}</span>
            `;
            
            // Botão de download
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-history-btn';
            downloadBtn.textContent = '⬇️ Baixar';
            
            // Armazena todos os dados necessários
            downloadBtn.dataset.filename = doc.fileName;
            downloadBtn.dataset.filetype = doc.fileType;
            downloadBtn.dataset.filedata = doc.fileData;
            
            downloadBtn.addEventListener('click', handleDownloadHistoryInfo);
            
            li.appendChild(textDiv);
            li.appendChild(downloadBtn);
            ulElement.appendChild(li);
        });
    }

    // --- Função de Criação de Elementos de Página ---
    function createPageElement(pageData) {
        const uniqueId = pageData.id.replace(/[^a-zA-Z0-9-_]/g, '');
        const templateHtml = pageTemplate.innerHTML.replace(/\{\{id\}\}/g, uniqueId);
        const templateNode = document.createElement('div');
        templateNode.innerHTML = templateHtml;
        const pageSection = templateNode.firstElementChild;

        // Seleciona elementos
        const pageHeader = pageSection.querySelector('.page-header');
        const pageTitle = pageSection.querySelector('.page-title');
        const toggleBtn = pageSection.querySelector('.toggle-menu-btn');
        const deleteBtn = pageSection.querySelector('.delete-page-btn');
        const menuContent = pageSection.querySelector('.menu-content');
        const fileInput = pageSection.querySelector('.file-input');
        const previewArea = pageSection.querySelector('.preview-area');
        const dateInputsContainer = pageSection.querySelector('.date-inputs');
        const startDateInput = pageSection.querySelector('.start-date');
        const endDateInput = pageSection.querySelector('.end-date');
        const saveBtn = pageSection.querySelector('.save-doc-btn');
        const historyListUl = pageSection.querySelector('.history-list ul');

        // Configurações Iniciais
        pageSection.dataset.pageId = pageData.id;
        pageTitle.textContent = pageData.name;
        pageTitle.title = pageData.name;

        // Restaura estado atual
        if (pageData.currentDocument) {
            displayPreview(
                pageData.currentDocument.fileType,
                pageData.currentDocument.fileName,
                previewArea,
                pageData.currentDocument.fileData
            );
            startDateInput.value = pageData.currentDocument.startDate || '';
            endDateInput.value = pageData.currentDocument.endDate || '';
            dateInputsContainer.style.display = 'flex';
            saveBtn.disabled = false;
        } else {
            previewArea.innerHTML = '<p>Nenhum arquivo selecionado.</p>';
            dateInputsContainer.style.display = 'none';
            saveBtn.disabled = true;
        }
        updateHistoryList(pageData.history || [], historyListUl);

        // Event Listeners do Card
        pageHeader.addEventListener('click', (e) => {
            if (e.target === toggleBtn || e.target === deleteBtn || deleteBtn.contains(e.target) || toggleBtn.contains(e.target)) return;
            toggleMenu(menuContent, toggleBtn);
        });
        toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(menuContent, toggleBtn); });
        deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); handleDeletePage(pageSection, pageData, previewArea); });
        fileInput.addEventListener('change', (event) => { handleFileSelection(event.target.files[0], previewArea, dateInputsContainer, saveBtn, pageSection, pageData); });
        saveBtn.addEventListener('click', () => { handleSaveDocument(pageSection, pageData, startDateInput, endDateInput, historyListUl, fileInput); });

        return pageSection;
    }

    // --- Funções Auxiliares ---
    function toggleMenu(menuContent, toggleBtn) {
        menuContent.classList.toggle('open');
        toggleBtn.classList.toggle('open');
    }

    function handleDeletePage(pageSection, pageData, previewArea) {
        if (confirm(`Tem certeza que deseja excluir a pasta "${pageData.name}"?`)) {
            const pages = getStoredPages();
            const updatedPages = pages.filter(p => p.id !== pageData.id);
            savePages(updatedPages);
            pageSection.remove();
        }
    }

    // --- Carregamento Inicial ---
    function loadPagesFromStorage() {
        const storedPages = getStoredPages();
        pagesContainer.innerHTML = '';
        storedPages.forEach(pageData => {
            if (!pageData.id || !pageData.name) {
                console.warn("Registro inválido:", pageData);
                return;
            }
            const pageElement = createPageElement(pageData);
            pagesContainer.appendChild(pageElement);
        });
    }

    // --- Event Listeners Globais ---
    addPageBtn.addEventListener('click', () => {
        const pageName = newPageNameInput.value.trim();
        if (!pageName) {
            alert('Digite um nome para a pasta.');
            newPageNameInput.focus();
            return;
        }
        const newPageData = {
            id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name: pageName,
            currentDocument: null,
            history: []
        };
        const pages = getStoredPages();
        pages.push(newPageData);
        savePages(pages);
        const newPageElement = createPageElement(newPageData);
        pagesContainer.appendChild(newPageElement);
        newPageNameInput.value = '';
    });

    // Inicialização
    loadPagesFromStorage();
});