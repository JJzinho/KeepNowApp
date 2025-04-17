document.addEventListener('DOMContentLoaded', () => {
    // Elementos Globais
    const addPageBtn = document.getElementById('add-page-btn');
    const newPageNameInput = document.getElementById('new-page-name');
    const pagesContainer = document.getElementById('pages-container');
    const pageTemplate = document.getElementById('page-template');

    const STORAGE_KEY = 'documentPagesData_v5_mobile_info_dl'; // Nova chave

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

    // --- Funções da Interface ---
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

         const oldUrl = previewArea.dataset.objectUrl;
         if (oldUrl) URL.revokeObjectURL(oldUrl);

        // Restaura estado atual
        if (pageData.currentDocument) {
            displayPreview(pageData.currentDocument.fileType, pageData.currentDocument.fileName, previewArea);
            startDateInput.value = pageData.currentDocument.startDate || '';
            endDateInput.value = pageData.currentDocument.endDate || '';
            dateInputsContainer.style.display = 'flex'; // Mostra container das datas
            saveBtn.disabled = false;
        } else {
             previewArea.innerHTML = '<p>Nenhum arquivo selecionado.</p>';
             dateInputsContainer.style.display = 'none'; // Esconde datas se não houver doc
             saveBtn.disabled = true;
        }
        updateHistoryList(pageData.history || [], historyListUl); // Passa UL para adicionar listeners

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

    function toggleMenu(menuContent, toggleBtn) {
         menuContent.classList.toggle('open');
         toggleBtn.classList.toggle('open');
     }

    function handleDeletePage(pageSection, pageData, previewArea) {
         if (confirm(`Tem certeza que deseja excluir a pasta "${pageData.name}"?`)) {
             const pages = getStoredPages();
             const updatedPages = pages.filter(p => p.id !== pageData.id);
             savePages(updatedPages);
              const currentPreviewUrl = previewArea.dataset.objectUrl;
              if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
             pageSection.remove();
         }
    }

    // --- Funções Auxiliares (handleFileSelection, handleSaveDocument, displayPreview) ---
    // (Estas funções permanecem as mesmas da V4)
    function handleFileSelection(file, previewArea, dateInputsContainer, saveBtn, pageSection, pageData) {
         const oldUrl = previewArea.dataset.objectUrl;
         if (oldUrl) { URL.revokeObjectURL(oldUrl); previewArea.dataset.objectUrl = ''; }

         if (file) {
             const fileUrl = URL.createObjectURL(file);
             previewArea.dataset.objectUrl = fileUrl;
             displayPreview(file.type, file.name, previewArea, fileUrl);
             dateInputsContainer.style.display = 'flex';
             saveBtn.disabled = false;
             pageSection.currentFile = file;
         } else {
             pageSection.currentFile = null;
             if (!pageData.currentDocument) {
                 previewArea.innerHTML = '<p>Nenhum arquivo selecionado.</p>';
                 dateInputsContainer.style.display = 'none';
                 saveBtn.disabled = true;
                 pageSection.querySelector('.start-date').value = '';
                 pageSection.querySelector('.end-date').value = '';
             } else {
                 displayPreview(pageData.currentDocument.fileType, pageData.currentDocument.fileName, previewArea);
                 saveBtn.disabled = false;
             }
         }
    }

    function handleSaveDocument(pageSection, pageData, startDateInput, endDateInput, historyListUl, fileInput) {
         const pages = getStoredPages();
         const pageIndex = pages.findIndex(p => p.id === pageData.id);
         if (pageIndex === -1) { console.error("Página não encontrada"); return; }

         const currentPage = pages[pageIndex];
         const fileToSave = pageSection.currentFile;
         const newStartDate = startDateInput.value;
         const newEndDate = endDateInput.value;
         let documentChanged = false;

         if (fileToSave) {
             if (currentPage.currentDocument) {
                 if (!currentPage.history) currentPage.history = [];
                 currentPage.history.push({ ...currentPage.currentDocument, modifiedDate: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) });
                 if (currentPage.history.length > 10) currentPage.history.shift();
             }
             currentPage.currentDocument = { fileName: fileToSave.name, fileType: fileToSave.type, startDate: newStartDate, endDate: newEndDate, savedDate: new Date().toISOString() };
             documentChanged = true;
         } else if (currentPage.currentDocument) {
             if (currentPage.currentDocument.startDate !== newStartDate || currentPage.currentDocument.endDate !== newEndDate) {
                 currentPage.currentDocument.startDate = newStartDate;
                 currentPage.currentDocument.endDate = newEndDate;
                 documentChanged = true;
             }
         } else { alert("Selecione um arquivo para salvar."); return; }

         if (documentChanged) {
             savePages(pages);
             pageData.currentDocument = currentPage.currentDocument;
             pageData.history = currentPage.history;
             updateHistoryList(currentPage.history || [], historyListUl); // Passa UL para listeners
             alert(`Documento salvo/atualizado na pasta "${currentPage.name}"!`);
             if (fileToSave) fileInput.value = '';
         } else { alert("Nenhuma alteração detectada."); }
         pageSection.currentFile = null;
    }

     function displayPreview(fileType, fileName, previewAreaElement, fileUrl = null) {
         previewAreaElement.innerHTML = '';
         let previewElement = null;
         const oldUrl = previewAreaElement.dataset.objectUrl;
         if (oldUrl && oldUrl !== fileUrl) { URL.revokeObjectURL(oldUrl); previewAreaElement.dataset.objectUrl = ''; }

         if (fileType.startsWith('image/')) {
            previewElement = document.createElement('img');
            previewElement.src = fileUrl || '';
            previewElement.alt = `Preview de ${fileName}`;
            previewElement.onerror = () => { previewAreaElement.innerHTML = '<p>Erro ao carregar imagem.</p>'; };
         } else if (fileType === 'application/pdf') {
             if (fileUrl) {
                 previewElement = document.createElement('embed');
                 previewElement.src = fileUrl;
                 previewElement.type = "application/pdf";
                 previewElement.style.width = "100%"; previewElement.style.height = "200px";
                 const fallbackText = document.createElement('p');
                 fallbackText.style.fontSize = '0.9em'; fallbackText.style.marginTop = '10px';
                 fallbackText.innerHTML = `Preview pode não funcionar. <a href="${fileUrl}" target="_blank" rel="noopener noreferrer">Abrir ${fileName} em nova aba</a>.`;
                 const container = document.createElement('div');
                 container.style.textAlign = 'center'; container.appendChild(previewElement); container.appendChild(fallbackText);
                 previewElement = container;
             } else {
                 previewElement = document.createElement('p'); previewElement.textContent = `📄 PDF Salvo: ${fileName}`;
             }
         } else {
             previewElement = document.createElement('p'); previewElement.textContent = `📄 Arquivo: ${fileName}`;
         }
         if (previewElement) { previewAreaElement.appendChild(previewElement); }
         else { previewAreaElement.innerHTML = '<p>Sem preview disponível.</p>'; }
         if(fileUrl) previewAreaElement.dataset.objectUrl = fileUrl;
    }

    // --- Função de Histórico Atualizada ---
    function updateHistoryList(history, ulElement) {
        ulElement.innerHTML = ''; // Limpa
        const explanationDiv = ulElement.closest('.history-list').querySelector('.history-explanation'); // Encontra a explicação
         if (!history || history.length === 0) {
             const li = document.createElement('li'); li.textContent = 'Nenhuma modificação anterior.'; li.style.color = 'var(--ff-secondary-text)';
             ulElement.appendChild(li);
             if (explanationDiv) explanationDiv.style.display = 'none'; // Esconde explicação se não há histórico
             return;
         }
         if (explanationDiv) explanationDiv.style.display = 'block'; // Mostra explicação se há histórico

        history.slice().reverse().forEach(doc => {
            const li = document.createElement('li');

            const textDiv = document.createElement('div'); // Div para o texto
            textDiv.textContent = `Arquivo: ${doc.fileName || '?'}`;
            const dateSpan = document.createElement('span');
            dateSpan.textContent = `Substituído em: ${doc.modifiedDate || '?'}`;
            textDiv.appendChild(dateSpan);

            const downloadBtn = document.createElement('button'); // Botão de download
            downloadBtn.className = 'download-history-btn';
            downloadBtn.textContent = 'Info'; // Texto mais curto
            downloadBtn.title = 'Baixar informações do histórico';

            // Armazena dados no botão para fácil acesso no clique
            downloadBtn.dataset.filename = doc.fileName || 'arquivo_desconhecido';
            downloadBtn.dataset.filetype = doc.fileType || 'desconhecido';
            downloadBtn.dataset.startdate = doc.startDate || 'N/A';
            downloadBtn.dataset.enddate = doc.endDate || 'N/A';
            downloadBtn.dataset.saveddate = doc.savedDate || 'N/A';
            downloadBtn.dataset.modifieddate = doc.modifiedDate || 'N/A';

            // Adiciona listener diretamente no botão criado
            downloadBtn.addEventListener('click', handleDownloadHistoryInfo);

            li.appendChild(textDiv);
            li.appendChild(downloadBtn);
            ulElement.appendChild(li);
        });
    }

    // --- Função para Download da Informação do Histórico ---
    function handleDownloadHistoryInfo(event) {
         event.stopPropagation(); // Impede que o clique se propague para o LI/Header

         const btn = event.currentTarget;
         const filename = btn.dataset.filename;
         const modifiedDate = btn.dataset.modifieddate;

         // Prepara o conteúdo do arquivo de texto
         const fileContent = `Informações do Histórico de Documento\n` +
                             `--------------------------------------\n` +
                             `Nome do Arquivo Original: ${filename}\n` +
                             `Tipo Original: ${btn.dataset.filetype}\n` +
                             `Data de Início (na época): ${btn.dataset.startdate}\n` +
                             `Data de Término (na época): ${btn.dataset.enddate}\n` +
                             `Data de Salvamento (na época): ${btn.dataset.saveddate ? new Date(btn.dataset.saveddate).toLocaleString('pt-BR') : 'N/A'}\n` +
                             `Data da Substituição: ${modifiedDate}\n` +
                             `--------------------------------------\n` +
                             `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`+
                             `IMPORTANTE: Este arquivo contém apenas informações sobre o documento e NÃO o arquivo original.`;

        // Cria um Blob com o conteúdo
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });

        // Cria um link temporário para download
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        // Limpa e formata nome do arquivo para download
        const safeFilename = filename.replace(/[^a-z0-9._-]/gi, '_').substring(0, 50);
        link.download = `historico_${safeFilename}.txt`;

        // Simula o clique no link e limpa
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Libera memória
    }

    // --- Carregamento Inicial e Listener Global ---
    function loadPagesFromStorage() {
        const storedPages = getStoredPages();
        pagesContainer.innerHTML = '';
        storedPages.forEach(pageData => {
             if (!pageData.id || !pageData.name) { console.warn("Registro inválido:", pageData); return; }
            const pageElement = createPageElement(pageData);
            pagesContainer.appendChild(pageElement);
        });
    }

    addPageBtn.addEventListener('click', () => {
        const pageName = newPageNameInput.value.trim();
        if (!pageName) { alert('Digite um nome para a pasta.'); newPageNameInput.focus(); return; }
        const newPageData = { id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, name: pageName, currentDocument: null, history: [] };
        const pages = getStoredPages(); pages.push(newPageData); savePages(pages);
        const newPageElement = createPageElement(newPageData); pagesContainer.appendChild(newPageElement);
        newPageNameInput.value = '';
    });

    loadPagesFromStorage(); // Carrega os dados ao iniciar

}); // Fim do DOMContentLoaded