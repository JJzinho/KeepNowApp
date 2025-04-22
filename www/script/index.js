document.addEventListener('DOMContentLoaded', () => {

    // --- Default Condo Data ---
    const defaultCondoData = {
        nomecondo: "Residencial Exemplo",
        endereco: "Rua Modelo, 100",
        cidade: "Cidade Exemplo", // Added default city
        cep: "01001000", // Store raw numbers
        cnpj: "11222333000144", // Store raw numbers
        telefonecondo: "5511900000000", // Store raw numbers +55
        telefonesindico: "5511911111111", // Store raw numbers +55
        unidades: "50",
        moradores: "150",
        torres: "2",
        admin: "Admin Exemplo Ltda.",
        foto: "https://images.unsplash.com/photo-1571905837410-87605d34ad73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTRC20_AddresslbnwwfHx8fDE3NDQwNDIzNDZ8MA&ixlib=rb-4.0.3&q=80&w=1080" // Default URL
    };

    // --- Initial Suppliers Data ---
    const defaultSuppliers = [
        { id: 1, name: "Hidráulica Master", phone: "5511987654321", occurrence: "Hidraulica" },
        { id: 2, name: "Elétrica Total", phone: "5511976543210", occurrence: "Eletrica" },
        { id: 3, name: "Elevadores Seguros", phone: "5511965432109", occurrence: "Elevador" },
        { id: 4, name: "Geradores Potentes", phone: "5511954321098", occurrence: "Gerador" }
    ];

    // --- State Variables ---
    let suppliers = [];
    let currentTicket = {};
    let supplierModalContext = null;
    let isInfoModalInEditMode = false;
    let newFileSelected = false; // Flag for image upload
    let currentImagePreviewSrc = null; // Store preview src during edit

    // --- Utility Functions ---
    const cleanInput = (value) => ('' + value).replace(/\D/g, ''); // Generic cleaner for numbers

    // --- MASKING FUNCTIONS ---
    const maskCEP = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{5})(\d)/, '$1-$2')
            .slice(0, 9); // Limit length (#####-###)
    };

    const maskPhone = (value) => {
        let cleaned = value.replace(/\D/g, '');
        // Handle +55 prefix
        let prefix = "";
        if (cleaned.startsWith('55')) {
            prefix = "+55 ";
            cleaned = cleaned.substring(2);
        } else if (value.trim().startsWith('+')) {
            prefix = "+";
            if (value.trim().startsWith('+5')) prefix = "+5";
            if (value.trim().startsWith('+55')) prefix = "+55 ";
        } else if (cleaned.length > 0) {
            prefix = "+55 "; // Assume BR if starts typing numbers
        }

        let maskedValue = cleaned;
        if (cleaned.length > 2) { // DDD entered
            maskedValue = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
        }
        if (cleaned.length >= 7) { // Start of main number entered
            // Decide between 8 or 9 digits for the first part
            const numDigitsFirstPart = (cleaned.length > 10) ? 5 : 4; // 9 digits main number?
            const firstPart = cleaned.substring(2, 2 + numDigitsFirstPart);
            const secondPart = cleaned.substring(2 + numDigitsFirstPart);
            if(secondPart) { // Only add hyphen if second part exists
                maskedValue = `(${cleaned.substring(0, 2)}) ${firstPart}-${secondPart}`;
            } else {
                maskedValue = `(${cleaned.substring(0, 2)}) ${firstPart}`;
            }
        }

        let fullMasked = prefix + maskedValue;
        // Limit total length: +55 (XX) XXXXX-XXXX -> 19 chars
        return fullMasked.slice(0, 19);
    };


    const maskCNPJ = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .slice(0, 18); // Limit length (XX.XXX.XXX/XXXX-XX)
    };

    // Generic function to apply mask on input event
    const applyInputMask = (inputElement, maskType) => {
        if (!inputElement) return;
        let value = inputElement.value;
        let maskedValue = value;
        let cursorPos = inputElement.selectionStart; // Store cursor position

        switch (maskType) {
            case 'cep':
                maskedValue = maskCEP(value);
                break;
            case 'phone':
                maskedValue = maskPhone(value);
                break;
            case 'cnpj':
                maskedValue = maskCNPJ(value);
                break;
        }

        inputElement.value = maskedValue; // Update value

        // Attempt to restore cursor position (basic)
        if (cursorPos !== null) {
           inputElement.selectionEnd = maskedValue.length;
        }
    };

    // --- FORMATTING FUNCTIONS (for display) ---
    const formatPhone = (phone) => {
        const cleaned = cleanInput(phone); // Use generic cleaner
        if (!cleaned) return "";
         // Assuming +55XXXXXXXXX or 55XXXXXXXXX format stored
         if (cleaned.startsWith('55') && cleaned.length >= 12) {
            const ddd = cleaned.substring(2, 4);
            const numberPart = cleaned.substring(4);
             if (numberPart.length === 9) { // +55 (XX) XXXXX-XXXX
                 return `+55 (${ddd}) ${numberPart.substring(0, 5)}-${numberPart.substring(5)}`;
             } else if (numberPart.length === 8) { // +55 (XX) XXXX-XXXX
                 return `+55 (${ddd}) ${numberPart.substring(0, 4)}-${numberPart.substring(4)}`;
             }
         }
         // Fallback for numbers without 55 prefix
         if (cleaned.length === 11) { // (XX) XXXXX-XXXX
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
         }
         if (cleaned.length === 10) { // (XX) XXXX-XXXX
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
         }
         return phone; // Return original/cleaned if no valid format
    };
    const formatCnpj = (cnpj) => {
        const cleaned = cleanInput(cnpj);
        if (!cleaned || cleaned.length !== 14) return cnpj; // Return original if invalid
        return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };
    const formatCep = (cep) => {
        const cleaned = cleanInput(cep);
         if (!cleaned || cleaned.length !== 8) return cep; // Return original if invalid
        return cleaned.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    };
    const getOccurrenceName = (key) => ({
        'Hidraulica':'Hidráulica',
        'Eletrica':'Elétrica',
        'Elevador':'Elevador',
        'Gerador':'Gerador',
        // NOVAS ENTRADAS ABAIXO
        'Pintura': 'Pintura',
        'Alvenaria': 'Alvenaria / Estrutura',
        'Jardinagem': 'Jardinagem / Paisagismo',
        'Limpeza': 'Limpeza Específica',
        'Seguranca': 'Segurança (Câmeras, Portões, Interfone)',
        'ArCondicionado': 'Ar Condicionado Central',
        'Pragas': 'Controle de Pragas',
        'Telecom': 'Telecomunicações (Antena, Cabeamento)',
        'Incendio': 'Sistema de Incêndio',
        'Gas': 'Sistema de Gás',
        'Outros': 'Geral / Outros'
    }[key] || key); // Mantém o fallback para retornar a própria chave se não encontrar
    
    // NEW function to get display text from selects
    const getSelectedText = (selectElement) => {
        if (!selectElement || selectElement.selectedIndex < 0) return '';
        return selectElement.options[selectElement.selectedIndex].text;
    };

    // --- Modal Handling ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-close-x')) {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                if (modal.id === 'info-modal') {
                    hideInfoModal(); // Use specific hide for info modal
                } else {
                    hideModal(modal);
                }
            }
          }
          if (e.target.classList.contains('modal-overlay')) {
            if (e.target.id === 'info-modal') {
                hideInfoModal(); // Use specific hide for info modal
            } else {
                hideModal(e.target);
            }
          }
        });

    const showModal = (modal) => {
        if (!modal) { console.error("showModal: Modal element not found"); return; }
        modal.classList.remove('hidden');
    };
    const hideModal = (modal) => {
        if (!modal) { console.error("hideModal: Modal element not found"); return; }
        modal.classList.add('hidden');
    };

    const hideInfoModal = () => {
        const modal = document.getElementById('info-modal');
        if (modal) {
            // --- If modal was in edit mode when 'X' was clicked ---
            if (isInfoModalInEditMode) {
                // 1. Reset internal state flags
                isInfoModalInEditMode = false;
                newFileSelected = false;
                currentImagePreviewSrc = null; // Clear temp preview store

                // 2. Visually reset the modal to display mode
                const displayElements = modal.querySelectorAll('.info-display');
                const editElements = modal.querySelectorAll('.info-edit');
                const editLabels = modal.querySelectorAll('.info-edit-label');
                const editInfoBtn = document.getElementById('edit-info-btn');
                const modalImagePreview = document.getElementById('modal-image-preview');
                const editModalPhotoFile = document.getElementById('edit-modal-photo-file');

                displayElements.forEach(el => el.classList.remove('hidden'));
                editElements.forEach(el => el.classList.add('hidden'));
                editLabels.forEach(el => el.classList.add('hidden'));
                if (editInfoBtn) editInfoBtn.classList.remove('hidden'); // Show Edit button again

                // Reset file input visually
                if(editModalPhotoFile) editModalPhotoFile.value = null;
                // Ensure image preview shows the *currently saved* image
                 if (modalImagePreview) {
                    modalImagePreview.src = loadCondoData().foto || ''; // Revert preview to saved data
                     modalImagePreview.classList.remove('hidden');
                 }
            }
            // --- End of edit mode specific reset ---

            // 3. Finally, hide the modal container
            hideModal(modal);
        }
    };

    // --- Data Loading/Saving ---
    function loadCondoData() {
        const savedData = localStorage.getItem('condominioData');
        if (savedData) {
            try {
                // Merge saved data with defaults to ensure all keys exist
                return { ...defaultCondoData, ...JSON.parse(savedData) };
            } catch (e) {
                console.error("Error parsing condo data from localStorage:", e);
                return { ...defaultCondoData }; // Use defaults if parsing fails
            }
        }
        return { ...defaultCondoData }; // Use cloned defaults if nothing saved
    }

    function saveCondoData(data) {
        try {
            // Ensure critical fields are strings before saving
            const dataToSave = { ...data };
            for (const key in dataToSave) {
                if (typeof dataToSave[key] === 'number') {
                    dataToSave[key] = String(dataToSave[key]);
                }
            }
            localStorage.setItem('condominioData', JSON.stringify(dataToSave));
        } catch (e) {
            console.error("Error saving condo data to localStorage:", e);
            if (e.name === 'QuotaExceededError') {
                alert("Erro ao salvar: Espaço de armazenamento local cheio. A imagem pode ser muito grande.");
            } else {
                alert("Erro ao salvar dados do condomínio.");
            }
        }
    }

    function loadSuppliers() {
        const savedSuppliers = localStorage.getItem('condoSuppliers');
        if(savedSuppliers) {
            try {
                return JSON.parse(savedSuppliers);
            } catch(e) {
                console.error("Error parsing suppliers data from localStorage:", e);
                return [...defaultSuppliers]; // Use default clone if parsing fails
            }
        }
         return [...defaultSuppliers]; // Use cloned defaults if nothing saved
    }

    function saveSuppliers(supplierList) {
        try {
            // Ensure phone numbers are saved as cleaned strings
             const suppliersToSave = supplierList.map(s => ({
                 ...s,
                 phone: cleanInput(s.phone) // Save cleaned phone number
             }));
            localStorage.setItem('condoSuppliers', JSON.stringify(suppliersToSave));
        } catch (e) {
            console.error("Error saving suppliers data to localStorage:", e);
            alert("Erro ao salvar dados dos fornecedores.");
        }
    }


    // --- Get DOM Elements ---
    const condoNameDisplay = document.getElementById('condo-name-display');
    const condoImageDisplay = document.getElementById('condo-image-display');
    const infoCardLocation = document.getElementById('info-card-location');
    const infoCardCnpj = document.getElementById('info-card-cnpj');
    const infoCardPhone = document.getElementById('info-card-phone');
    const showMoreBtn = document.getElementById('show-more-btn');
    const infoModal = document.getElementById('info-modal');
    const editInfoBtn = document.getElementById('edit-info-btn');
    const cancelEditInfoBtn = document.getElementById('cancel-edit-info-btn');
    const saveEditInfoBtn = document.getElementById('save-edit-info-btn');
    const createTicketBtn = document.getElementById('create-ticket-btn');
    const viewContactsBtn = document.getElementById('view-contacts-btn');
    const ticketModal = document.getElementById('ticket-modal');
    const previewModal = document.getElementById('preview-modal');
    const supplierModal = document.getElementById('supplier-modal');
    const manageSuppliersModal = document.getElementById('manage-suppliers-modal');
    const ticketForm = document.getElementById('ticket-form'); // Keep this reference
    const supplierForm = document.getElementById('supplier-form');
    const contactsListDiv = document.getElementById('contacts-list');
    const manageContactsListDiv = document.getElementById('manage-contacts-list');
    const supplierSelect = document.getElementById('supplier-select');
    const noSupplierDiv = document.getElementById('no-supplier');
    const whatsappBtn = document.getElementById('send-whatsapp-btn');
    const supplierModalTitle = document.getElementById('supplier-modal-title');
    const backToFormBtn = document.getElementById('back-to-form-btn');
    const addSupplierBtnFromPreview = document.getElementById('add-supplier-btn-from-preview');
    const confirmTicketBtn = document.getElementById('confirm-ticket-btn');
    const closeSupplierModalX = document.getElementById('close-supplier-modal-x');
    const cancelSupplierBtn = document.getElementById('cancel-supplier-btn');
    const closeManageSuppliersBtn = document.getElementById('close-manage-suppliers-btn');
    const newSupplierBtn = document.getElementById('new-supplier-btn');
    const navbarToggle = document.getElementById('navbar-toggle');
    const navbarDropdown = document.getElementById('navbar-dropdown');
    // Edit Modal Inputs
    const editModalName = document.getElementById('edit-modal-name');
    const editModalLocation = document.getElementById('edit-modal-location');
    const editModalCep = document.getElementById('edit-modal-cep');
    const editModalCity = document.getElementById('edit-modal-city');
    const editModalPhone = document.getElementById('edit-modal-phone');
    const editModalManagerPhone = document.getElementById('edit-modal-manager-phone');
    const editModalCnpj = document.getElementById('edit-modal-cnpj');
    const editModalPhotoFile = document.getElementById('edit-modal-photo-file'); // File input
    const modalImagePreview = document.getElementById('modal-image-preview'); // Image preview
    const editModalResidents = document.getElementById('edit-modal-residents');
    const editModalUnits = document.getElementById('edit-modal-units');
    const editModalBlocks = document.getElementById('edit-modal-blocks');
    const editModalAdmin = document.getElementById('edit-modal-admin');
    // Supplier phone input (for masking)
    const supplierPhoneInput = document.getElementById('supplier-phone');
    // NEW Ticket Location Elements
    const ticketLevelSelect = document.getElementById('ticket-level');
    const ticketAreaSelect = document.getElementById('ticket-area');
    const ticketAreaCustomInput = document.getElementById('ticket-area-custom');


     // Check essential elements
     if (!infoModal || !ticketModal || !previewModal || !supplierModal || !manageSuppliersModal || !editInfoBtn || !saveEditInfoBtn || !cancelEditInfoBtn || !editModalPhotoFile || !modalImagePreview || !ticketLevelSelect || !ticketAreaSelect || !ticketAreaCustomInput ) { // Added new location elements check
         console.error("Core modal or essential button/input elements not found! Aborting script setup.");
         alert("Erro crítico: Elementos essenciais da página não foram encontrados.");
         return; // Stop script execution if critical elements are missing
     }


    // --- Render Functions ---
    function updateCondoDataOnUI(currentCondoData) {
        if (!currentCondoData) {
            console.error("updateCondoDataOnUI: No data provided.");
            return;
        }

        // --- Main Page Elements ---
        if(condoNameDisplay) condoNameDisplay.textContent = currentCondoData.nomecondo || "Nome Indefinido";
        // Set main image source (handles URL or Base64)
         if(condoImageDisplay) condoImageDisplay.src = currentCondoData.foto || defaultCondoData.foto;
        if(infoCardLocation) infoCardLocation.textContent = `${currentCondoData.endereco || ''}, ${currentCondoData.cidade || ''}`;
        if(infoCardCnpj) infoCardCnpj.textContent = formatCnpj(currentCondoData.cnpj || '');
        if(infoCardPhone) infoCardPhone.textContent = formatPhone(currentCondoData.telefonecondo || '');

        // --- Info Modal Display Spans ---
        const modalNameDisplay = document.getElementById('modal-name-display');
        const modalLocation = document.getElementById('modal-location');
        const modalCep = document.getElementById('modal-cep');
        const modalCity = document.getElementById('modal-city');
        const modalPhone = document.getElementById('modal-phone');
        const modalManagerPhone = document.getElementById('modal-manager-phone');
        const modalCnpj = document.getElementById('modal-cnpj');
        const modalPhotoUrlDisplay = document.getElementById('modal-photo-url-display'); // Still exists but hidden in edit
        const modalResidents = document.getElementById('modal-residents');
        const modalUnits = document.getElementById('modal-units');
        const modalBlocks = document.getElementById('modal-blocks');
        const modalAdmin = document.getElementById('modal-admin');

        if(modalNameDisplay) modalNameDisplay.textContent = currentCondoData.nomecondo || '';
        if(modalLocation) modalLocation.textContent = currentCondoData.endereco || '';
        if(modalCep) modalCep.textContent = formatCep(currentCondoData.cep || '');
        if(modalCity) modalCity.textContent = currentCondoData.cidade || '';
        if(modalPhone) modalPhone.textContent = formatPhone(currentCondoData.telefonecondo || '');
        if(modalManagerPhone) modalManagerPhone.textContent = formatPhone(currentCondoData.telefonesindico || '');
        if(modalCnpj) modalCnpj.textContent = formatCnpj(currentCondoData.cnpj || '');
        if(modalPhotoUrlDisplay) modalPhotoUrlDisplay.textContent = currentCondoData.foto && currentCondoData.foto.startsWith('http') ? currentCondoData.foto : '(Imagem local)'; // Indicate if it's not a URL
         // Set modal image preview source
         if(modalImagePreview) modalImagePreview.src = currentCondoData.foto || '';

        if(modalResidents) modalResidents.textContent = currentCondoData.moradores || '0';
        if(modalUnits) modalUnits.textContent = currentCondoData.unidades || '0';
        if(modalBlocks) modalBlocks.textContent = currentCondoData.torres || '0';
        if(modalAdmin) modalAdmin.textContent = currentCondoData.admin || '';

        // --- Info Modal Edit Inputs (Populate for editing - Handled in toggleEditMode now) ---
    }

    function renderSuppliersList(container) {
        if (!container) return;
        container.innerHTML = ''; // Clear previous list
        const fragment = document.createDocumentFragment(); // Efficient updates

        if (suppliers.length === 0) {
            container.innerHTML = `<div class="status-message status-info">${container.id === 'contacts-list' ? 'Nenhum fornecedor. Clique em "Gerenciar".' : 'Nenhum fornecedor cadastrado.'}</div>`;
            return;
        }

        suppliers.sort((a, b) => a.name.localeCompare(b.name)).forEach(supplier => {
            const item = document.createElement('div');
            item.className = 'contact-item';
            // Use formatPhone for display here
            item.innerHTML = `
                 <div class="contact-info">
                     <div class="contact-name">${supplier.name}</div>
                     <div class="contact-phone">${formatPhone(supplier.phone)}</div>
                     <span class="contact-occurrence">${getOccurrenceName(supplier.occurrence)}</span>
                 </div>
                 <div class="contact-actions">
                     <button class="contact-btn edit-btn" title="Editar"><i class="material-icons">edit</i></button>
                     <button class="contact-btn delete-btn" title="Excluir"><i class="material-icons">delete</i></button>
                 </div>`;

            const editBtn = item.querySelector('.edit-btn');
            const deleteBtn = item.querySelector('.delete-btn');
            if (editBtn) editBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent clicks bubbling up if needed
                handleEditSupplier(supplier.id);
            });
            if (deleteBtn) deleteBtn.addEventListener('click', (e) => {
                 e.stopPropagation();
                 handleDeleteSupplier(supplier.id);
             });

            fragment.appendChild(item);
        });
        container.appendChild(fragment);
    }

    function updatePreviewModal() {
        const occurrenceElem = document.getElementById('preview-occurrence');
        const locationElem = document.getElementById('preview-location'); // This element remains the same
        const descriptionElem = document.getElementById('preview-description');
        const priorityElem = document.getElementById('preview-priority');

        if(occurrenceElem) occurrenceElem.textContent = getOccurrenceName(currentTicket.occurrence);
        // UPDATE this line to use the new combined location:
        if(locationElem) locationElem.textContent = currentTicket.location; // location now holds the combined string
        if(descriptionElem) descriptionElem.textContent = currentTicket.description;
        if(priorityElem) priorityElem.textContent = currentTicket.priority;
        updateSupplierDropdownList();
    }

    function updateSupplierDropdownList() {
        if(!supplierSelect || !noSupplierDiv || !whatsappBtn) return; // Check elements

        const suppliersForOccurrence = suppliers.filter(s => s.occurrence === currentTicket.occurrence);
        supplierSelect.innerHTML = `<option value="" selected disabled>Selecione...</option>`;
        noSupplierDiv.classList.add('hidden');
        supplierSelect.classList.remove('hidden'); // Show select initially
        supplierSelect.disabled = true;
        whatsappBtn.disabled = true;

        if (suppliersForOccurrence.length > 0) {
            suppliersForOccurrence.sort((a, b) => a.name.localeCompare(b.name)).forEach(s => {
                // Use formatPhone for display in dropdown
                supplierSelect.innerHTML += `<option value="${s.id}">${s.name} - ${formatPhone(s.phone)}</option>`;
            });
            supplierSelect.disabled = false;
        } else {
            noSupplierDiv.classList.remove('hidden');
            supplierSelect.classList.add('hidden'); // Hide select if no options
        }
        supplierSelect.value = ""; // Reset selection
    }

    // --- Event Handlers ---

    // Handle File Selection for Preview
    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (modalImagePreview) {
                    modalImagePreview.src = e.target.result;
                    currentImagePreviewSrc = e.target.result; // Store for saving
                    newFileSelected = true; // Mark that a new file was chosen
                    modalImagePreview.classList.remove('hidden'); // Ensure preview is visible
                }
            }
            reader.readAsDataURL(file);
        } else if (file) {
            alert("Por favor, selecione um arquivo de imagem válido (JPG, PNG, GIF, etc.).");
            event.target.value = null; // Clear the invalid selection
            newFileSelected = false;
        } else {
            // No file selected or selection cleared
             newFileSelected = false;
             currentImagePreviewSrc = null;
             // Revert preview to saved image if selection is cleared
             if (modalImagePreview) modalImagePreview.src = loadCondoData().foto || '';
        }
    }


    // Toggle Edit Mode for Info Modal
    function toggleInfoEditMode(enableEdit) {
        isInfoModalInEditMode = enableEdit;
        newFileSelected = false; // Reset file selection flag when toggling mode
        currentImagePreviewSrc = null; // Reset preview src store

        const displayElements = infoModal.querySelectorAll('.info-display');
        const editElements = infoModal.querySelectorAll('.info-edit');
        const editLabels = infoModal.querySelectorAll('.info-edit-label'); // Get labels too

        // Get current data to populate/revert
        const currentData = loadCondoData();

        if (enableEdit) {
            // --- Entering Edit Mode ---
            // Populate inputs with CURRENT data (raw for masked fields)
             if(editModalName) editModalName.value = currentData.nomecondo || '';
             if(editModalLocation) editModalLocation.value = currentData.endereco || '';
             if(editModalCep) editModalCep.value = currentData.cep || ''; // Raw
             if(editModalCity) editModalCity.value = currentData.cidade || '';
             if(editModalPhone) editModalPhone.value = currentData.telefonecondo || ''; // Raw
             if(editModalManagerPhone) editModalManagerPhone.value = currentData.telefonesindico || ''; // Raw
             if(editModalCnpj) editModalCnpj.value = currentData.cnpj || ''; // Raw
             if(editModalResidents) editModalResidents.value = currentData.moradores || '0';
             if(editModalUnits) editModalUnits.value = currentData.unidades || '0';
             if(editModalBlocks) editModalBlocks.value = currentData.torres || '0';
             if(editModalAdmin) editModalAdmin.value = currentData.admin || '';

             // Apply masks immediately after populating raw data
             applyInputMask(editModalCep, 'cep');
             applyInputMask(editModalPhone, 'phone');
             applyInputMask(editModalManagerPhone, 'phone');
             applyInputMask(editModalCnpj, 'cnpj');

             // Set image preview and clear file input
             if(modalImagePreview) modalImagePreview.src = currentData.foto || '';
             if(editModalPhotoFile) editModalPhotoFile.value = null; // Clear file input

             displayElements.forEach(el => el.classList.add('hidden'));
             editElements.forEach(el => el.classList.remove('hidden'));
             editLabels.forEach(el => el.classList.remove('hidden')); // Show labels
             if (editInfoBtn) editInfoBtn.classList.add('hidden'); // Hide Edit button
             // Make sure the image preview itself is NOT hidden when editing
             if(modalImagePreview) modalImagePreview.classList.remove('hidden');


        } else {
            // --- Exiting Edit Mode (via Cancel or Save) ---
             displayElements.forEach(el => el.classList.remove('hidden'));
             editElements.forEach(el => el.classList.add('hidden'));
             editLabels.forEach(el => el.classList.add('hidden')); // Hide labels
             if (editInfoBtn) editInfoBtn.classList.remove('hidden'); // Show Edit button
             // Ensure image preview shows the final state (handled by updateCondoDataOnUI called after save/cancel)
             if (modalImagePreview) modalImagePreview.classList.remove('hidden');
        }
    }


    function handleEditSupplier(id) {
        const supplier = suppliers.find(s => s.id === id);
        if (!supplier || !supplierModal || !supplierForm || !supplierModalTitle) return;

        supplierModalTitle.textContent = "Editar Fornecedor";
        supplierForm.reset();
        const supplierIdInput = document.getElementById('supplier-id');
        const supplierNameInput = document.getElementById('supplier-name');
        // const supplierPhoneInput = document.getElementById('supplier-phone'); // Already fetched
        const supplierOccurrenceInput = document.getElementById('supplier-occurrence');

        if(supplierIdInput) supplierIdInput.value = supplier.id;
        if(supplierNameInput) supplierNameInput.value = supplier.name;
        // Populate with raw phone number for editing and apply mask
        if(supplierPhoneInput) {
            supplierPhoneInput.value = supplier.phone || ''; // Use raw number from loaded data
            applyInputMask(supplierPhoneInput, 'phone'); // Apply mask after setting value
        }
        if(supplierOccurrenceInput) supplierOccurrenceInput.value = supplier.occurrence;

        // Determine context...
         if (manageSuppliersModal && !manageSuppliersModal.classList.contains('hidden')) {
             supplierModalContext = 'manage';
             hideModal(manageSuppliersModal);
         } else if (previewModal && !previewModal.classList.contains('hidden')) {
             supplierModalContext = 'preview';
             hideModal(previewModal);
         } else {
             supplierModalContext = 'manage'; // Default context
             // If another modal was open, ensure it's hidden
              if (ticketModal && !ticketModal.classList.contains('hidden')) hideModal(ticketModal);
              if (infoModal && !infoModal.classList.contains('hidden')) hideInfoModal(); // Use specific hide function
         }
        showModal(supplierModal);
    }

    function handleDeleteSupplier(id) {
        const supplier = suppliers.find(s => s.id === id);
        if (!supplier) return;
        if (confirm(`Tem certeza que deseja excluir o fornecedor "${supplier.name}"?`)) {
            suppliers = suppliers.filter(s => s.id !== id);
            saveSuppliers(suppliers); // Persist the change
            renderSuppliersList(contactsListDiv); // Update main list
            renderSuppliersList(manageContactsListDiv); // Update manage list
            // If preview modal is open and the deleted supplier was relevant, update its dropdown
            if (previewModal && !previewModal.classList.contains('hidden') && currentTicket.occurrence === supplier.occurrence) {
                updateSupplierDropdownList();
            }
            console.log(`Fornecedor ID ${id} excluído.`);
        }
    }

    function handleSendWhatsApp() {
        if(!supplierSelect) return;
        const supplierId = supplierSelect.value;
        const supplier = suppliers.find(s => s.id === parseInt(supplierId));
        if (!supplier) { alert('Selecione um fornecedor válido.'); return; }

        const currentCondoData = loadCondoData(); // Load current data for name

        // UPDATE this line to use the combined location from currentTicket
        const message = `*Novo Chamado - ${currentCondoData.nomecondo}*\n\n` +
                        `*Ocorrência:* ${getOccurrenceName(currentTicket.occurrence)}\n` +
                        `*Localização:* ${currentTicket.location}\n` + // Use the combined location
                        `*Descrição:* ${currentTicket.description}\n` +
                        `*Prioridade:* ${currentTicket.priority}\n\n` +
                        `_Por favor, verificar disponibilidade._`;
        // Send CLEAN number to WhatsApp API
        window.open(`https://wa.me/${cleanInput(supplier.phone)}?text=${encodeURIComponent(message)}`, '_blank');
    }

    function handleSupplierFormSubmit(event) {
        event.preventDefault();
        if (!supplierForm) return;

        const idInput = document.getElementById('supplier-id');
        const nameInput = document.getElementById('supplier-name');
        // const phoneInputElem = document.getElementById('supplier-phone'); // Already fetched
        const occurrenceInput = document.getElementById('supplier-occurrence');

        const id = idInput ? idInput.value : null;
        const name = nameInput ? nameInput.value.trim() : null;
        const phoneInput = supplierPhoneInput ? supplierPhoneInput.value : null; // Use fetched ref
        const occurrence = occurrenceInput ? occurrenceInput.value : null;

        if (!name || !phoneInput || !occurrence) { alert('Preencha todos os campos obrigatórios.'); return; }
        // Validate CLEANED phone number
        const phone = cleanInput(phoneInput);
        // Basic validation for BR phone number format (starting with 55, 12 or 13 digits total)
        if (!phone.startsWith('55') || !(phone.length === 12 || phone.length === 13)) {
            alert('Telefone inválido. Formato esperado: +55 (XX) XXXXX-XXXX ou +55 (XX) XXXX-XXXX.');
            return;
        }

        let message = '';
        let isNew = false;
        const supplierData = { name, phone, occurrence }; // Store cleaned phone

        if (id) { // Editing existing supplier
            const index = suppliers.findIndex(s => s.id === parseInt(id));
            if (index !== -1) {
                suppliers[index] = { ...supplierData, id: parseInt(id) };
                message = `Fornecedor "${name}" atualizado.`;
            } else {
                 alert("Erro ao encontrar fornecedor para atualizar.");
                 return;
            }
        } else { // Adding new supplier
             // Find the highest current ID and add 1, or start at 1 if empty
            const newId = suppliers.length > 0 ? Math.max(0, ...suppliers.map(s => s.id)) + 1 : 1;
             suppliers.push({ ...supplierData, id: newId });
             message = `Fornecedor "${name}" adicionado.`;
             isNew = true;
        }

        saveSuppliers(suppliers); // Persist changes
        renderSuppliersList(contactsListDiv); // Update main list display
        renderSuppliersList(manageContactsListDiv); // Update manage list display
        console.log(message); // Log confirmation

        // Close supplier modal and return to the correct previous context
        hideModal(supplierModal);
        if (supplierModalContext === 'preview' && previewModal) {
            updateSupplierDropdownList(); // Update dropdown in preview modal
            // If it was a new supplier of the correct type, select it
            if(isNew && occurrence === currentTicket.occurrence) {
                 const newSupplierOption = Array.from(supplierSelect.options).find(opt => opt.text.startsWith(name));
                 if(newSupplierOption) supplierSelect.value = newSupplierOption.value;
                 if(whatsappBtn) whatsappBtn.disabled = !supplierSelect.value; // Enable whatsapp button
            }
            showModal(previewModal);
        } else if (manageSuppliersModal) { // Default or 'manage' context
            showModal(manageSuppliersModal);
        }
        supplierModalContext = null; // Reset context
        supplierForm.reset();
        if(idInput) idInput.value = ''; // Clear hidden ID field
    }

    // Handler for cancelling the supplier form
    function handleCancelSupplierForm() {
        hideModal(supplierModal);
        // Return to the correct context
        if (supplierModalContext === 'preview' && previewModal) {
            showModal(previewModal);
        } else if (manageSuppliersModal) { // Default or 'manage' context
            showModal(manageSuppliersModal);
        }
        supplierModalContext = null; // Reset context
        if(supplierForm) supplierForm.reset();
        const supplierIdInput = document.getElementById('supplier-id');
        if(supplierIdInput) supplierIdInput.value = '';
    }


    // --- MODIFIED: Handler for Cancel Edit Info Button ---
    function handleCancelEditInfoBtn() {
        // Reset fields using the currently SAVED data
        const currentData = loadCondoData(); // Load fresh data
        updateCondoDataOnUI(currentData); // Update all displays/inputs first
        // Toggle back to display mode
        toggleInfoEditMode(false);
        // Explicitly reset file input and preview (already handled by toggle, but safe)
        if (editModalPhotoFile) editModalPhotoFile.value = null;
        if (modalImagePreview) modalImagePreview.src = currentData.foto || ''; // Revert preview
        newFileSelected = false;
        currentImagePreviewSrc = null;
    }

    // --- Initial Setup ---
    let currentCondoData = loadCondoData(); // Load initial data
    suppliers = loadSuppliers(); // Load suppliers (phone numbers are raw)
    updateCondoDataOnUI(currentCondoData); // Populate UI initially
    renderSuppliersList(contactsListDiv); // Render suppliers on main page

    // --- Attach Event Listeners ---

    // Navbar Toggle
    if (navbarToggle && navbarDropdown) {
        navbarToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click listener from closing immediately
            navbarDropdown.classList.toggle('show');
        });
        // Close dropdown if clicking outside
        document.addEventListener('click', (e) => {
             // Close only if the click is outside the toggle button AND the dropdown itself
            if (!navbarToggle.contains(e.target) && !navbarDropdown.contains(e.target)) {
                 navbarDropdown.classList.remove('show');
             }
         });
         // Prevent clicks inside dropdown from closing it
         navbarDropdown.addEventListener('click', (e) => {
             e.stopPropagation();
         });
    }

    // Info Modal Buttons
    if(showMoreBtn && infoModal) showMoreBtn.addEventListener('click', () => {
         // Ensure data and visual state are reset correctly upon opening
         updateCondoDataOnUI(loadCondoData()); // Load fresh data into UI elements
         toggleInfoEditMode(false); // Ensure it opens in display mode, resets flags/file input
         showModal(infoModal);
     });
    if(editInfoBtn) editInfoBtn.addEventListener('click', () => toggleInfoEditMode(true));
    if(cancelEditInfoBtn) cancelEditInfoBtn.addEventListener('click', handleCancelEditInfoBtn); // Use dedicated handler
    if(saveEditInfoBtn) saveEditInfoBtn.addEventListener('click', () => {
        // 1. Read data from edit inputs
        // Get raw values for masked fields using cleanInput
        const cepValue = cleanInput(editModalCep.value);
        const phoneCondoValue = cleanInput(editModalPhone.value);
        const phoneSindicoValue = cleanInput(editModalManagerPhone.value);
        const cnpjValue = cleanInput(editModalCnpj.value);

        // 2. Validation
        if (!editModalName || !editModalName.value.trim()) { alert("Nome é obrigatório."); return; }
        if (cepValue && cepValue.length !== 8) { alert('CEP inválido. Use 8 dígitos.'); return; }
        // Validate phone starting with 55 and having 12 or 13 digits total
        if (phoneCondoValue && (!phoneCondoValue.startsWith('55') || !(phoneCondoValue.length === 12 || phoneCondoValue.length === 13))) { alert('Telefone do Condomínio inválido. Deve iniciar com 55 e ter 12 ou 13 dígitos (Ex: 5511987654321).'); return; }
        if (phoneSindicoValue && (!phoneSindicoValue.startsWith('55') || !(phoneSindicoValue.length === 12 || phoneSindicoValue.length === 13))) { alert('Telefone do Síndico inválido. Deve iniciar com 55 e ter 12 ou 13 dígitos.'); return; }
        if (cnpjValue && cnpjValue.length !== 14) { alert('CNPJ inválido. Use 14 dígitos.'); return; }
         // Add other validations as needed (e.g., number ranges)

        // 3. Create updated data object
        const updatedCondoData = {
            nomecondo: editModalName.value.trim(),
            endereco: editModalLocation ? editModalLocation.value.trim() : '',
            cidade: editModalCity ? editModalCity.value.trim() : '',
            cep: cepValue, // Store cleaned
            cnpj: cnpjValue, // Store cleaned
            telefonecondo: phoneCondoValue, // Store cleaned
            telefonesindico: phoneSindicoValue, // Store cleaned
            // --- Handle photo ---
            // Use the preview source IF a new file was selected, otherwise keep old data
            foto: newFileSelected && currentImagePreviewSrc ? currentImagePreviewSrc : loadCondoData().foto,
            unidades: editModalUnits ? (editModalUnits.value || '0') : '0', // Ensure default 0 if empty
            moradores: editModalResidents ? (editModalResidents.value || '0') : '0',
            torres: editModalBlocks ? (editModalBlocks.value || '0') : '0',
            admin: editModalAdmin ? editModalAdmin.value.trim() : ''
        };

        // 4. Save data
        saveCondoData(updatedCondoData);
        currentCondoData = updatedCondoData; // Update the in-memory data

        // 5. Refresh UI
        updateCondoDataOnUI(currentCondoData);

        // 6. Switch modal back to display mode
        toggleInfoEditMode(false);

        alert("Informações do condomínio atualizadas com sucesso!");
    });

    // --- Add Mask Listeners ---
    if(editModalCep) editModalCep.addEventListener('input', () => applyInputMask(editModalCep, 'cep'));
    if(editModalPhone) editModalPhone.addEventListener('input', () => applyInputMask(editModalPhone, 'phone'));
    if(editModalManagerPhone) editModalManagerPhone.addEventListener('input', () => applyInputMask(editModalManagerPhone, 'phone'));
    if(editModalCnpj) editModalCnpj.addEventListener('input', () => applyInputMask(editModalCnpj, 'cnpj'));
     // Add mask listener to supplier phone input
     if(supplierPhoneInput) supplierPhoneInput.addEventListener('input', () => applyInputMask(supplierPhoneInput, 'phone'));

     // --- Add File Input Listener ---
     if(editModalPhotoFile) editModalPhotoFile.addEventListener('change', handleFileSelect);


    // --- Ticket Creation Flow ---
    if(createTicketBtn && ticketModal) {
        createTicketBtn.addEventListener('click', () => {
            if(ticketForm) ticketForm.reset();
            // ADD this line to ensure custom field is hidden on open
            if(ticketAreaCustomInput) {
                ticketAreaCustomInput.classList.add('hidden');
                ticketAreaCustomInput.required = false; // Make sure it's not required initially
            }
            currentTicket={};
            showModal(ticketModal);
        });
    }
    if(ticketForm && previewModal && ticketModal) {
        ticketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const occ = document.getElementById('occurrence-type');
            // REMOVED: const loc = document.getElementById('location'); // Old location input removed
            const desc = document.getElementById('description');
            const pri = document.getElementById('priority');

            // --- NEW Location Logic ---
            let locationString = "";
            const levelText = getSelectedText(ticketLevelSelect);
            const areaText = getSelectedText(ticketAreaSelect);
            const customAreaValue = ticketAreaCustomInput ? ticketAreaCustomInput.value.trim() : "";

            // Basic validation for selects
            if (!ticketLevelSelect || !ticketLevelSelect.value) {
                 alert('Por favor, selecione o Nível/Localização Principal.');
                 ticketLevelSelect.focus();
                 return;
            }
             if (!ticketAreaSelect || !ticketAreaSelect.value) {
                 alert('Por favor, selecione a Área Específica.');
                 ticketAreaSelect.focus();
                 return;
            }

            if (ticketAreaSelect.value === 'outro') {
                if (!customAreaValue) {
                    alert('Por favor, especifique a área no campo "Outro".');
                    ticketAreaCustomInput.focus();
                    return; // Stop submission
                }
                locationString = `${levelText} - Outro: ${customAreaValue}`;
            } else {
                locationString = `${levelText} - ${areaText}`;
            }
            // --- End NEW Location Logic ---

            currentTicket = {
                occurrence: occ?.value || '',
                // UPDATE this line:
                location: locationString, // Use the combined string
                description: desc?.value.trim() || '',
                priority: pri?.value || ''
            };
            updatePreviewModal();
            hideModal(ticketModal);
            showModal(previewModal);
        });
    }

    // ADD Event listener for the Area dropdown to show/hide the custom input
    if (ticketAreaSelect && ticketAreaCustomInput) {
        ticketAreaSelect.addEventListener('change', (e) => {
            if (e.target.value === 'outro') {
                ticketAreaCustomInput.classList.remove('hidden');
                ticketAreaCustomInput.required = true; // Make it required only when visible
            } else {
                ticketAreaCustomInput.classList.add('hidden');
                ticketAreaCustomInput.required = false; // Not required when hidden
                ticketAreaCustomInput.value = ''; // Clear value when hidden
            }
        });
    }

    if(backToFormBtn && previewModal && ticketModal) { backToFormBtn.addEventListener('click', () => { hideModal(previewModal); showModal(ticketModal); }); }
    if(confirmTicketBtn && previewModal) { confirmTicketBtn.addEventListener('click', () => { console.log('Chamado confirmado (simulação):', currentTicket); alert('Chamado registrado com sucesso! (Simulação)'); hideModal(previewModal); currentTicket = {}; }); }


    // --- Supplier Management Flow ---
     if(viewContactsBtn && manageSuppliersModal) { viewContactsBtn.addEventListener('click', () => { suppliers = loadSuppliers(); renderSuppliersList(manageContactsListDiv); showModal(manageSuppliersModal); }); }
     if(closeManageSuppliersBtn && manageSuppliersModal) { closeManageSuppliersBtn.addEventListener('click', () => hideModal(manageSuppliersModal)); }
     if(newSupplierBtn && supplierModal && manageSuppliersModal) { newSupplierBtn.addEventListener('click', () => { if(supplierModalTitle) supplierModalTitle.textContent = "Adicionar Novo Fornecedor"; if(supplierForm) supplierForm.reset(); const sid = document.getElementById('supplier-id'); if(sid) sid.value = ''; supplierModalContext = 'manage'; hideModal(manageSuppliersModal); showModal(supplierModal); }); }
     if(addSupplierBtnFromPreview && supplierModal && previewModal) { addSupplierBtnFromPreview.addEventListener('click', () => { if(supplierModalTitle) supplierModalTitle.textContent = "Adicionar Fornecedor"; if(supplierForm) supplierForm.reset(); const sid = document.getElementById('supplier-id'); if(sid) sid.value = ''; const socc = document.getElementById('supplier-occurrence'); if(socc && currentTicket.occurrence) socc.value = currentTicket.occurrence; supplierModalContext = 'preview'; hideModal(previewModal); showModal(supplierModal); }); }
     if(closeSupplierModalX) { closeSupplierModalX.addEventListener('click', handleCancelSupplierForm); }
     if(cancelSupplierBtn) { cancelSupplierBtn.addEventListener('click', handleCancelSupplierForm); }
     if(supplierForm) { supplierForm.addEventListener('submit', handleSupplierFormSubmit); }


    // --- Preview Modal - WhatsApp Interaction ---
    if(supplierSelect) { supplierSelect.addEventListener('change', (e) => { if(whatsappBtn) whatsappBtn.disabled = !e.target.value; }); }
    if(whatsappBtn) { whatsappBtn.addEventListener('click', handleSendWhatsApp); }


}); // End DOMContentLoaded