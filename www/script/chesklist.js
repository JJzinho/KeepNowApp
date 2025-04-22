// checklist.js

// Dados completos baseados no PDF
const maintenanceItems = [
    // --- Itens Originais ---
    { id: "A16", periodicity: "SEMESTRAL", system: "Hidrossanitário", activity: "Verificar estanqueidade de registros e componentes", responsible: "Manutenção Local" }, // Originalmente: Abrir e fechar completamente os registros dos subsolos e cobertura (barrilete)...
    { id: "A17", periodicity: "ANUAL", system: "Hidrossanitário", activity: "Substituir vedantes de torneiras e registros", responsible: "Empresa Especializada" }, // Originalmente: Verificar e, se necessário, substituir os vedantes (courinhos)...
    { id: "A33", periodicity: "MENSAL", system: "Hidrossanitário", activity: "Verificar mecanismos da caixa acoplada", responsible: "Manutenção Local" }, // Originalmente: Verificar e limpar os ralos, canaletas e grelhas do sistema de esgoto

    { id: "B2.7", periodicity: "ANUAL", system: "Incêndio", activity: "Recarregar extintores", responsible: "Empresa Especializada" }, // Originalmente: Verificar a validade e se necessário recarregar os extintores
    { id: "B6.3", periodicity: "MENSAL", system: "Incêndio", activity: "Testar sistema de hidrantes", responsible: "Manutenção Local" }, // Originalmente: Verificar a estanqueidade do sistema, das tubulações e registros inclusive hidrantes no passeio e Acionar a bomba de incêndio...

    { id: "C1.0", periodicity: "DIÁRIA", system: "Elétrico", activity: "Verificar quadros elétricos", responsible: "Manutenção Local" }, // Originalmente: verificar o quadro sinóptico que monitora o funcionamento, pane das bombas e equipamentos
    { id: "C2.6", periodicity: "SEMESTRAL", system: "Elétrico", activity: "Testar disjuntores DR", responsible: "Empresa Certificada" }, // Originalmente: Testar o disjuntor tipo DR apertando o botão localizado no próprio aparelho.

    { id: "E1.3", periodicity: "MENSAL", system: "Climatização", activity: "Limpar filtros de ar-condicionado", responsible: "Técnico Especializado" }, // Originalmente: Realizar limpeza dos componentes e filtros, mesmo em período de não utilização

    { id: "IID10", periodicity: "QUINQUENAL", system: "Estrutural", activity: "Verificar tirantes e estrutura", responsible: "Engenharia Especializada" }, // Mapeado de: ID: 110.10, Periodicity: 10. QUINQUENAL, System: SISTEMAS CIVIS, Subsistema: CONTEÇÃO, Activity: Verificar 20% dos tirantes permanentes...

    // --- Itens Adicionados do PDF ---

    // Sistema Hidrossanitário
    { id: "A1.7", periodicity: "ANUAL", system: "Hidrossanitário", activity: "Verificar tubulações de água potável (obstruções, estanqueidade, fixação)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "A10.5", periodicity: "TRIMESTRAL", system: "Hidrossanitário", activity: "Limpar reservatórios de água não potável e manutenção do revestimento. Limpeza e manutenção do filtro.", responsible: "Equipe de manutenção local" }, //
    { id: "A10.7", periodicity: "ANUAL", system: "Hidrossanitário", activity: "Verificar sistema de tratamento da água (reúso)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "All.3", periodicity: "MENSAL", system: "Hidrossanitário", activity: "Testar funcionamento de SPAs e Banheiras conforme fornecedor", responsible: "Equipe de manutenção local/empresa especializada" }, //
    { id: "All.5", periodicity: "TRIMESTRAL", system: "Hidrossanitário", activity: "Limpeza dispositivos anti-resíduos (SPAs e Banheiras)", responsible: "Equipe de manutenção local/empresa especializada" }, //
    { id: "A11.7", periodicity: "ANUAL", system: "Hidrossanitário", activity: "Limpar e manter SPAs/Banheiras conforme fornecedor. Refazer rejuntamento das bordas.", responsible: "Equipe de manutenção local/empresa especializada" }, //
    { id: "A3.6a", periodicity: "SEMESTRAL", system: "Hidrossanitário", activity: "Verificar mecanismos internos da caixa acoplada", responsible: "Equipe de manutenção local" }, // Renomeado de A3.6 para evitar duplicidade de ID
    { id: "A3.6b", periodicity: "SEMESTRAL", system: "Hidrossanitário", activity: "Limpar e verificar regulagem dos mecanismos de descarga", responsible: "Equipe de manutenção local" }, // Renomeado de A3.6
    { id: "A3.6c", periodicity: "SEMESTRAL", system: "Hidrossanitário", activity: "Verificar posição das bombas submersas (esgoto/pluvial)", responsible: "Equipe de manutenção local/" }, // Renomeado de A3.6
    { id: "A3.6d", periodicity: "SEMESTRAL", system: "Hidrossanitário", activity: "Abrir/fechar registros (subsolos/cobertura) para evitar emperramento", responsible: "Equipe de manutenção local" }, // Renomeado de A3.6
    { id: "A3.7a", periodicity: "ANUAL", system: "Hidrossanitário", activity: "Verificar tubulações de captação (jardim) contra raízes", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de A3.7
    { id: "A3.7b", periodicity: "ANUAL", system: "Hidrossanitário", activity: "Verificar tubulações de água servida (obstruções, estanqueidade, fixação)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de A3.7
    { id: "A5.1", periodicity: "SEMANAL", system: "Hidrossanitário", activity: "Verificar funcionamento dos dispositivos de irrigação", responsible: "Equipe de manutenção local" }, //
    { id: "A5.3", periodicity: "MENSAL", system: "Hidrossanitário", activity: "Vistoriar e limpar filtros de linha (irrigação)", responsible: "Equipe de manutenção local / empresa capacitada" }, //
    { id: "A5.7", periodicity: "ANUAL", system: "Hidrossanitário", activity: "Verificar tubulações de captação (jardim) contra raízes (drenagem)", responsible: "Equipe de manutenção local / empresa capacitada" }, //
    { id: "A6.6", periodicity: "SEMESTRAL", system: "Hidrossanitário", activity: "Verificar vazamento bolsas vaso sanitário, limpar aeradores, verificar estanqueidade caixa descarga", responsible: "Equipe de manutenção local/empresa especializada" }, //
    { id: "A6.7", periodicity: "ANUAL", system: "Hidrossanitário", activity: "Inspecionar/completar rejuntamento bacia sanitária. Limpar caixa descarga e verificar mecanismo.", responsible: "Equipe de manutenção local/empresa especializada" }, //
    { id: "A6.9", periodicity: "TRIENAL", system: "Hidrossanitário", activity: "Verificar diafragma torre entrada e comporta mecanismo caixa acoplada", responsible: "Equipe de manutenção local/empresa especializada" }, //
    { id: "A7.3", periodicity: "MENSAL", system: "Hidrossanitário", activity: "Verificar funcionamento, estanqueidade e pressão da válvula redutora", responsible: "Equipe de manutenção local" }, //
    { id: "A7.6", periodicity: "SEMESTRAL", system: "Hidrossanitário", activity: "Válvula redutora de pressão: Limpeza do sistema (rodízio das alças)", responsible: "Equipe de manutenção" }, //
    { id: "A8.3", periodicity: "MENSAL", system: "Hidrossanitário", activity: "Verificar potabilidade e análise bacteriológica da água (poço artesiano)", responsible: "Equipe de manutenção" }, // ID A8.6 no PDF, corrigido para A8.3
    { id: "A8.6", periodicity: "SEMESTRAL", system: "Hidrossanitário", activity: "Limpar e desinfetar poços artesianos. Verificar potabilidade e análise físico-química.", responsible: "Equipe de manutenção" }, //
    { id: "A9.1", periodicity: "SEMANAL", system: "Hidrossanitário", activity: "Verificar nível reservatórios, funcionamento torneiras de boia e chave de boia", responsible: "Equipe de manutenção local" }, //
    { id: "A9.2", periodicity: "QUINZENAL", system: "Hidrossanitário", activity: "Utilizar e limpar bombas em sistema de rodízio (se não automático)", responsible: "Equipe de manutenção local" }, //
    { id: "A9.6", periodicity: "SEMESTRAL", system: "Hidrossanitário", activity: "Verificar funcionalidade extravasor (ladrão), deterioração/oxidação componentes. Manutenção bombas recalque.", responsible: "Equipe de manutenção local" }, //

    // Sistema de Incêndio
    { id: "B1.3", periodicity: "MENSAL", system: "Incêndio", activity: "Acionar bomba de incêndio (via dreno ou botoeira)", responsible: "Equipe de manutenção local" }, // ID 813 no PDF, corrigido para B1.3
    { id: "B3.5a", periodicity: "TRIMESTRAL", system: "Incêndio", activity: "Lubrificar dobradiças e maçanetas (portas corta-fogo)", responsible: "Equipe de manutenção local" }, // ID B3.5 no PDF
    { id: "B3.5b", periodicity: "TRIMESTRAL", system: "Incêndio", activity: "Verificar abertura/fechamento 45° (portas corta-fogo). Regular se necessário (empresa especializada).", responsible: "Equipe de manutenção local" }, // ID B3:5 no PDF
    { id: "B3.6", periodicity: "SEMESTRAL", system: "Incêndio", activity: "Verificar funcionamento e integridade das portas corta-fogo, ajustar se necessário", responsible: "Equipe de manutenção local/ empresa capacitada" }, // ID B3:6 no PDF
    { id: "B4.3", periodicity: "MENSAL", system: "Incêndio", activity: "Verificar estado das placas de sinalização de fuga", responsible: "Equipe de manutenção local" }, //
    { id: "B5.3", periodicity: "MENSAL", system: "Incêndio", activity: "Verificar funcionamento do sistema de detecção e alarme conforme instruções", responsible: "Equipe de manutenção local/ empresa capacitada" }, // ID BB.3 no PDF
    { id: "B6.1", periodicity: "SEMANAL", system: "Incêndio", activity: "Verificar nível reservatórios e funcionamento boias (sistema de hidrantes)", responsible: "Equipe de manutenção local" }, // ID B61 no PDF
    { id: "B6.6a", periodicity: "SEMESTRAL", system: "Incêndio", activity: "Verificar estanqueidade dos registros de gaveta (hidrantes)", responsible: "Equipe de manutenção local" }, // ID 85.6 no PDF
    { id: "B6.6b", periodicity: "SEMESTRAL", system: "Incêndio", activity: "Abrir/fechar registros (subsolos/cobertura) para evitar emperramento (hidrantes)", responsible: "Equipe de manutenção local" }, // ID B8.8 no PDF (Subsistema Hidrantes)
    { id: "B7.3a", periodicity: "MENSAL", system: "Incêndio", activity: "Verificar lâmpadas de emergência, trocar queimadas/danificadas", responsible: "Equipe de manutenção local" }, // ID 87.3 no PDF
    { id: "B7.3b", periodicity: "MENSAL", system: "Incêndio", activity: "Testar funcionamento sistema de iluminação de emergência", responsible: "Equipe de manutenção local" }, // ID 873 no PDF
    { id: "B7.3c", periodicity: "MENSAL", system: "Incêndio", activity: "Acionar botão teste luminárias autônomas, verificar/substituir lâmpadas", responsible: "Equipe de manutenção local" }, // ID 873 no PDF
    { id: "B7.4", periodicity: "BIMESTRAL", system: "Incêndio", activity: "Simular falta de energia, verificar acendimento luminárias após 15 min", responsible: "Equipe de manutenção local" }, // ID B74 no PDF
    { id: "B8.3", periodicity: "MENSAL", system: "Incêndio", activity: "Alternar operação ventiladores (pressurização escada) se houver 2", responsible: "Equipe de manutenção local" }, // ID B8.3 no PDF

    // Sistema Elétrico
    { id: "C1.7", periodicity: "ANUAL", system: "Elétrico", activity: "Verificar e reapertar conexões do quadro de distribuição", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "C2.3", periodicity: "MENSAL", system: "Elétrico", activity: "Verificar, limpar e reparar lâmpadas/luminárias externas", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "C2.6b", periodicity: "SEMESTRAL", system: "Elétrico", activity: "Verificar, limpar e reparar caixas de passagem/inspeção do solo", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de C2.6
    { id: "C2.7", periodicity: "ANUAL", system: "Elétrico", activity: "Rever isolamento emendas fios. Verificar/substituir contatos elétricos desgastados.", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "C2.8", periodicity: "BIENAL", system: "Elétrico", activity: "Reapertar todas as conexões (tomadas, interruptores, pontos de luz)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "C4.3", periodicity: "MENSAL", system: "Elétrico", activity: "Testar funcionamento do grupo gerador por 15 minutos", responsible: "Equipe de manutenção local" }, //
    { id: "C4.4", periodicity: "BIMESTRAL", system: "Elétrico", activity: "Verificar nível de óleo e obstrução ventilação (grupo gerador)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "C4.6a", periodicity: "SEMESTRAL", system: "Elétrico", activity: "Verificar e efetuar manutenção do catalizador (grupo gerador)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de C4.6
    { id: "C4.6b", periodicity: "SEMESTRAL", system: "Elétrico", activity: "Verificar e complementar nível de combustível (grupo gerador)", responsible: "Equipe de manutenção local" }, // Renomeado de C4.6
    { id: "C4.6c", periodicity: "SEMESTRAL", system: "Elétrico", activity: "Limpar cabine / carenagem (grupo gerador)", responsible: "Equipe de manutenção local" }, // Renomeado de C4.6
    { id: "C5.6", periodicity: "SEMESTRAL", system: "Elétrico", activity: "Limpeza das placas fotovoltaicas", responsible: "Equipe de manutenção local / Empresa capacitada" }, //
    { id: "C6.0", periodicity: "DIÁRIA", system: "Elétrico", activity: "Verificar funcionamento das câmeras (cerca elétrica - verificar se é CFTV)", responsible: "Equipe de manutenção local/empresa capacitada" }, // (Atividade parece ser de CFTV, não cerca elétrica)
    { id: "C6.3a", periodicity: "MENSAL", system: "Elétrico", activity: "Medir corrente e voltagem da cerca elétrica", responsible: "Equipe de manutenção local/empresa capacitada" }, // Renomeado de C6.3
    { id: "C6.3b", periodicity: "MENSAL", system: "Elétrico", activity: "Verificar funcionamento de todo o sistema (cerca elétrica)", responsible: "Equipe de manutenção local/empresa capacitada" }, // Renomeado de C6.3
    { id: "C6.3c", periodicity: "MENSAL", system: "Elétrico", activity: "Verificar funcionamento conforme instruções do fornecedor (cerca elétrica)", responsible: "Equipe de manutenção local/empresa capacitada" }, // Renomeado de C6.3

    // Climatização
    { id: "E1.3a", periodicity: "MENSAL", system: "Climatização", activity: "Verificar integridade proteções tubulações rede frigorígena", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de E1.3
    { id: "E1.3c", periodicity: "MENSAL", system: "Climatização", activity: "Verificar componentes sistema ar condicionado, reparar anomalias", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de E1.3
    { id: "E1.3d", periodicity: "MENSAL", system: "Climatização", activity: "Verificar e limpar unidades condensadora e evaporadora", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de E1.3
    { id: "E1.6", periodicity: "SEMESTRAL", system: "Climatização", activity: "Inspecionar estanqueidade tubulações de dreno (Ar Central)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "E2.6", periodicity: "SEMESTRAL", system: "Climatização", activity: "Inspecionar estanqueidade tubulações de dreno (Split)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "E3.3", periodicity: "MENSAL", system: "Climatização", activity: "Manutenção mini-ventiladores (renovação de ar / exaustão)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //

    // Instalações de Gás
    { id: "F1.3", periodicity: "MENSAL", system: "Gás", activity: "Verificar condições e validade das mangueiras de ligação", responsible: "Equipe de manutenção local/empresa especializada." }, //

    // Impermeabilizações
    { id: "G1.7a", periodicity: "ANUAL", system: "Impermeabilização", activity: "Verificar integridade proteção mecânica, sinais infiltração/falha", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de G1.7
    { id: "G1.7b", periodicity: "ANUAL", system: "Impermeabilização", activity: "Inspecionar camada drenante jardim, limpar obstruções ralos/grelhas", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de G1.7
    { id: "G1.8", periodicity: "BIENAL", system: "Impermeabilização", activity: "Verificar presença de carbonatação e fungos próximos às impermeabilizações", responsible: "Equipe de manutenção local/ empresa capacitada" }, //

    // Sistemas Civis / Estrutural
    { id: "I10.7a", periodicity: "ANUAL", system: "Estrutural", activity: "Testar profundidade da carbonatação (contenção)", responsible: "Equipe de manutenção local / empresa capacitada" }, // Renomeado de 10.7
    { id: "I10.7b", periodicity: "ANUAL", system: "Estrutural", activity: "Verificar aparecimento de manchas superficiais no concreto (contenção)", responsible: "Equipe de manutenção local / empresa capacitada" }, // Renomeado de 10.7
    { id: "I10.7c", periodicity: "ANUAL", system: "Estrutural", activity: "Verificar descoloração do concreto (contenção)", responsible: "Equipe de manutenção local / empresa capacitada" }, // Renomeado de 10.7
    { id: "I10.7d", periodicity: "ANUAL", system: "Estrutural", activity: "Verificar condições do concreto em locais de acesso restrito", responsible: "Equipe de manutenção local /" }, // Renomeado de 10.7
    { id: "I10.7e", periodicity: "ANUAL", system: "Estrutural", activity: "Verificar colagem e integridade da junta Jeene", responsible: "Equipe de manutenção local/" }, // Renomeado de 110.7
    { id: "I7.6", periodicity: "SEMESTRAL", system: "Estrutural", activity: "Aplicar cera carnaúba em divisórias de laminado melamínico", responsible: "Equipe de manutenção local / Empresa capacitada" }, //
    { id: "I9.4", periodicity: "BIMESTRAL", system: "Estrutural", activity: "Podar vegetação de cobertura (taludes), reparar se necessário", responsible: "Equipe de manutenção local/ jardineiro qualificado" }, //
    { id: "I9.7", periodicity: "ANUAL", system: "Estrutural", activity: "Verificar tubulações captação água (talude) contra raízes/entupimento", responsible: "Equipe de manutenção local / empresa capacitada" }, //

    // Esquadrias
    { id: "J1.5", periodicity: "TRIMESTRAL", system: "Esquadrias", activity: "Limpeza geral das esquadrias de alumínio e componentes", responsible: "Equipe de manutenção local" }, //
    { id: "J1.7a", periodicity: "ANUAL", system: "Esquadrias", activity: "Verificar ocorrência de vazamentos (esquadria de alumínio)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J1.7
    { id: "J1.7b", periodicity: "ANUAL", system: "Esquadrias", activity: "Regular freio janelas Maxim-ar (±30°)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J1.7
    { id: "J1.7c", periodicity: "ANUAL", system: "Esquadrias", activity: "Inspecionar integridade física (esquadria de alumínio)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J1.7
    { id: "J1.7d", periodicity: "ANUAL", system: "Esquadrias", activity: "Verificar fissuras, falhas vedação/fixação caixilhos (alumínio)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J1.7
    { id: "J1.7e", periodicity: "ANUAL", system: "Esquadrias", activity: "Revisar orifícios dos trilhos inferiores (alumínio)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J1.7
    { id: "J1.7f", periodicity: "ANUAL", system: "Esquadrias", activity: "Regular freio (alumínio - genérico?)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J1.7 - Duplicado? Verificar PDF
    { id: "J2.6", periodicity: "SEMESTRAL", system: "Esquadrias", activity: "Verificar pontos de oxidação em esquadrias de ferro/aço, reparar", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "J2.7a", periodicity: "ANUAL", system: "Esquadrias", activity: "Executar serviços conforme pintura original (ferro/aço)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J2.7
    { id: "J2.7b", periodicity: "ANUAL", system: "Esquadrias", activity: "Verificar e executar fixações pontos de solda (ferro/aço)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J2.7
    { id: "J3.3", periodicity: "MENSAL", system: "Esquadrias", activity: "Lubrificar com grafite em pó dobradiças, rótulas (madeira)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "J4.5", periodicity: "TRIMESTRAL", system: "Esquadrias", activity: "Limpeza geral das esquadrias de PVC e componentes", responsible: "Equipe de manutenção local" }, //
    { id: "J4.7a", periodicity: "ANUAL", system: "Esquadrias", activity: "Verificar ocorrência de vazamentos (PVC)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J4.7
    { id: "J4.7b", periodicity: "ANUAL", system: "Esquadrias", activity: "Inspecionar integridade física (PVC)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J4.7
    { id: "J4.7c", periodicity: "ANUAL", system: "Esquadrias", activity: "Verificar fissuras, falhas vedação/fixação caixilhos (PVC)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de J4.7
    { id: "J5.6", periodicity: "SEMESTRAL", system: "Esquadrias", activity: "Verificar elementos de vedação e fixação (Aço Inox)", responsible: "Equipe de manutenção local" }, //
    { id: "J6.1", periodicity: "DIÁRIA", system: "Esquadrias", activity: "Troca das pilhas (Fechaduras Eletrônicas)", responsible: "Equipe de manutenção local" }, // Periodicidade 'NA' mudada para 'DIÁRIA' para encaixar
    { id: "J7.6", periodicity: "SEMESTRAL", system: "Esquadrias", activity: "Limpeza/ajustes (carros rodagem, trilhos, roldanas, radares, fotocélula, fecho, anti-pânico) (Portas Automatizadas)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "J7.7", periodicity: "ANUAL", system: "Esquadrias", activity: "Revisão das baterias (Portas Automatizadas)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "J7.8", periodicity: "BIENAL", system: "Esquadrias", activity: "Substituição escovinhas e guias de piso (Portas Automatizadas)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "J7.10", periodicity: "QUINQUENAL", system: "Esquadrias", activity: "Substituir baterias sistema anti-pânico (Portas Automatizadas)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //

    // Revestimentos
    { id: "L.20.7a", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar eflorescência, manchas, peças quebradas (Fachada Porcelanato/Cerâmica)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L.20.7
    { id: "L.20.7b", periodicity: "ANUAL", system: "Revestimentos", activity: "Revisar rejuntamento (fissuras, falhas) (Fachada Porcelanato/Cerâmica)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L.20.7
    { id: "L.20.7c", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar calafetação e vedação, reparar (Fachada Porcelanato/Cerâmica)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L.20.7
    { id: "L.20.9", periodicity: "TRIENAL", system: "Revestimentos", activity: "Lavagem fachada, verificar rejuntes/mastique, inspecionar se necessário", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L1.7a", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar eflorescência, manchas, peças quebradas (Cerâmica/Porcelanato)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L1.7
    { id: "L1.7b", periodicity: "ANUAL", system: "Revestimentos", activity: "Revisar rejuntamento (fissuras, falhas) (Cerâmica/Porcelanato)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L1.7
    { id: "L1.9", periodicity: "TRIENAL", system: "Revestimentos", activity: "Lavagem fachada cerâmica/porcelanato, verificar rejuntes/mastique", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L10.7", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar calafetação e vedação, reparar (Argamassa)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L11.7", periodicity: "ANUAL", system: "Revestimentos", activity: "Análise visual/táctil pontos falhos pintura externa/textura (encontros rejunte)", responsible: "Equipe de manutenção local / Empresa capacitada" }, //
    { id: "L11.8a", periodicity: "BIENAL", system: "Revestimentos", activity: "Inspecionar pintura externa (descascamento, esfarelamento, cor)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de L11.8
    { id: "L11.8b", periodicity: "BIENAL", system: "Revestimentos", activity: "Repintura externa para evitar envelhecimento/fissuras/infiltrações", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de L11.8
    { id: "L12.7", periodicity: "ANUAL", system: "Revestimentos", activity: "Manutenção Deck de Madeira", responsible: "Equipe de manutenção local / Empresa capacitada" }, // ID 127 no PDF
    { id: "L13.5", periodicity: "TRIMESTRAL", system: "Revestimentos", activity: "Limpeza preventiva do carpete", responsible: "Equipe de manutenção local / Empresa capacitada" }, //
    { id: "L13.7", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar fixação dos componentes do carpete", responsible: "Equipe de manutenção local / Empresa capacitada" }, //
    { id: "L14.5a", periodicity: "TRIMESTRAL", system: "Revestimentos", activity: "Regular nivelamento placas piso elevado", responsible: "Equipe de manutenção local" }, // Renomeado de L14.5
    { id: "L14.5b", periodicity: "TRIMESTRAL", system: "Revestimentos", activity: "Ajustar apoios/calços placas piso elevado (evitar folgas)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L14.5
    { id: "L14.6a", periodicity: "SEMESTRAL", system: "Revestimentos", activity: "Revisar piso elevado, reparar juntas uniformes", responsible: "Equipe de manutenção local" }, // Renomeado de L14.6
    { id: "L14.6b", periodicity: "SEMESTRAL", system: "Revestimentos", activity: "Verificar limpeza espaço entre laje e piso elevado, ralos", responsible: "Equipe de manutenção local" }, // Renomeado de L14.6
    { id: "L15.5", periodicity: "TRIMESTRAL", system: "Revestimentos", activity: "Revisar piso podotátil, substituir peças soltas/trincadas/quebradas", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L16.7a", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar integridade e reconstituir rejuntamentos (pisos, paredes, peitoris, etc.)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L16.7
    { id: "L16.7b", periodicity: "ANUAL", system: "Revestimentos", activity: "Inspecionar/completar rejunte convencional (box, banheiras)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L16.7
    { id: "L16.8", periodicity: "BIENAL", system: "Revestimentos", activity: "Inspecionar/completar rejunte flexível com mastique", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L17.7a", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar integridade vedações flexíveis", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L17.7
    { id: "L17.7b", periodicity: "ANUAL", system: "Revestimentos", activity: "Inspecionar/completar rejunte convencional (vedações flexíveis - áreas molhadas)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L17.7
    { id: "L17.8", periodicity: "BIENAL", system: "Revestimentos", activity: "Inspecionar/completar rejunte flexível com mastique (vedações flexíveis)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L2.5", periodicity: "TRIMESTRAL", system: "Revestimentos", activity: "Limpeza geral das fachadas ACM e componentes", responsible: "Equipe de manutenção local" }, // ID 12.5 no PDF
    { id: "L2.7a", periodicity: "ANUAL", system: "Revestimentos", activity: "Inspecionar integridade física (ACM)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // ID 12.7 no PDF
    { id: "L2.7b", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar fixação peças ACM nos montantes metálicos", responsible: "Equipe de manutenção local/ empresa capacitada" }, // ID 12.7 no PDF
    { id: "L20.7", periodicity: "ANUAL", system: "Revestimentos", activity: "Manutenção Piso Emborrachado", responsible: "Equipe de manutenção local / Empresa capacitada" }, // ID 124 no PDF
    { id: "L21.5", periodicity: "TRIMESTRAL", system: "Revestimentos", activity: "Limpeza geral fachada em brise metálico", responsible: "Equipe de manutenção local / Empresa capacitada" }, // ID 121.5 no PDF
    { id: "L21.7a", periodicity: "ANUAL", system: "Revestimentos", activity: "Reapertar parafusos aparentes (fechos, fechaduras, puxadores, roldanas) (Brise)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // ID 121.7 no PDF
    { id: "L21.7b", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar regulagem aberturas e corrigir (Brise)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // ID 121.7 no PDF
    { id: "L23.7", periodicity: "ANUAL", system: "Revestimentos", activity: "Revisar rejuntamento pedras industrializadas (fissuras, falhas)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L25.2", periodicity: "QUINZENAL", system: "Revestimentos", activity: "Limpar piso epóxi sem formar poças (manter seco)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // ID 125.2 no PDF
    { id: "L25.7a", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar/reaplicar mastique ou substituir junta dilatação (Epóxi)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de L25.7
    { id: "L25.7b", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar e tratar fissuras (Epóxi)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de L25.7
    { id: "L25.7c", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar/recuperar superfície desgastada (Epóxi)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de L25.7
    { id: "L3.7a", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar e tratar fissuras (Piso Cimentado)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de L3.7
    { id: "L3.7b", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar/recuperar superfície desgastada (Piso Cimentado)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de L3.7
    { id: "L4.3", periodicity: "MENSAL", system: "Revestimentos", activity: "Observar acúmulo localizado de água (Ladrilho Hidráulico)", responsible: "Equipe de manutenção local" }, //
    { id: "L4.7", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar peças soltas/desgaste, colar, reconstituir rejuntes (Ladrilho)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L5.7", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar peças soltas ou desgaste excessivo (Pedra Portuguesa)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L6.7a", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar e refazer calafetação juntas (Pisos Madeira)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L6.7
    { id: "L6.7b", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar/refazer envernizamento (retardante fogo) (Pisos Madeira)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L6.7
    { id: "L7.7", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar e refazer calafetação/rejunte juntas (Pisos Laminados)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L8.7", periodicity: "ANUAL", system: "Revestimentos", activity: "Limpeza e manutenção piso vinílico (detergente neutro, máquina, dry-buffing)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "L9.1", periodicity: "SEMANAL", system: "Revestimentos", activity: "Limpeza pedras naturais (solução hipoclorito sódio) prevenir fungos/eflorescência", responsible: "Equipe de manutenção local/ empresa capacitada" }, // ID 19.1 no PDF
    { id: "L9.7a", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar eflorescência, manchas, peças quebradas (Pedras Naturais)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de L9.7
    { id: "L9.7b", periodicity: "ANUAL", system: "Revestimentos", activity: "Revisar rejuntamento (fissuras, falhas) (Pedras Naturais)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de 19.7
    { id: "L9.7c", periodicity: "ANUAL", system: "Revestimentos", activity: "Verificar/reconstituir rejuntamentos, preencher juntas dilatação com mastique (Pedras)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de 19.7

    // Forros
    { id: "M1.7", periodicity: "ANUAL", system: "Forros", activity: "Verificar calafetação/fixação rufos, para-raios, antenas, esquadrias (Forro Gesso)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "M1.8a", periodicity: "BIENAL", system: "Forros", activity: "Verificar deterioração pintura (Forro Gesso)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de M1.8
    { id: "M1.8b", periodicity: "BIENAL", system: "Forros", activity: "Verificar condição pontos embutidos (Forro Gesso)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de M1.8
    { id: "M1.8c", periodicity: "BIENAL", system: "Forros", activity: "Verificar existência de fissuras (Forro Gesso)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de M1.8
    { id: "M1.8d", periodicity: "BIENAL", system: "Forros", activity: "Revisar/repintar áreas secas (Forro Gesso)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de M1.8
    { id: "M1.9", periodicity: "TRIENAL", system: "Forros", activity: "Repintar paredes e tetos áreas secas (Forro Gesso)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "M2.7", periodicity: "ANUAL", system: "Forros", activity: "Verificar falhas fixação e reconstituir (Forro PVC)", responsible: "Equipe de manutenção local / Empresa capacitada" }, //
    { id: "M3.7", periodicity: "ANUAL", system: "Forros", activity: "Verificar falhas fixação e reconstituir (Forro Madeira)", responsible: "Equipe de manutenção local / Empresa capacitada" }, //
    { id: "M3.8", periodicity: "BIENAL", system: "Forros", activity: "Verificar/refazer envernizamento (retardante fogo) (Forro/Painéis Madeira)", responsible: "Equipe de manutenção local / Empresa capacitada" }, //
    { id: "M4.7", periodicity: "ANUAL", system: "Forros", activity: "Verificar falhas fixação e reconstituir (Forro Tela Tensionada)", responsible: "Equipe de manutenção local / Empresa capacitada" }, //

    // Vidros
    { id: "N1.7a", periodicity: "ANUAL", system: "Vidros", activity: "Verificar vedação, fixação, fissuras vidros", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de N1.7
    { id: "N1.7b", periodicity: "ANUAL", system: "Vidros", activity: "Inspecionar funcionamento sistema vidros temperados", responsible: "Equipe de" }, // Renomeado de N1.7
    { id: "N1.7c", periodicity: "ANUAL", system: "Vidros", activity: "Verificar guarda-corpos (não são estanques à água)", responsible: "manutenção local/ empresa capacitada" }, // Renomeado de N1.7
    { id: "N2.7", periodicity: "ANUAL", system: "Vidros", activity: "Inspecionar vidros blindados (não podem ter delaminação)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //

    // Cobertura
    { id: "O1.6", periodicity: "SEMESTRAL", system: "Cobertura", activity: "Verificar integridade calhas, telhas, protetores térmicos. Limpar/reparar.", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "O1.7a", periodicity: "ANUAL", system: "Cobertura", activity: "Verificar integridade estrutural componentes, vedações, fixações (Telhado)", responsible: "Equipe de" }, // Renomeado de O1.7
    { id: "O1.7b", periodicity: "ANUAL", system: "Cobertura", activity: "Verificar nível de corrosão materiais metálicos (Cobertura Metálica)", responsible: "manutenção local/ empresa capacitada" }, // Renomeado de O1.7

    // Logística (Estacionamento/Garagens)
    { id: "P1.2", periodicity: "QUINZENAL", system: "Logística", activity: "Lavar área estacionamento/garagem (detergente neutro, lavadora automática)", responsible: "Equipe de manutenção local / Empresa capacitada" }, //
    { id: "P1.3a", periodicity: "MENSAL", system: "Logística", activity: "Verificar, limpar, reparar lâmpadas/luminárias externas (Estacionamento)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de P1.3
    { id: "P1.3b", periodicity: "MENSAL", system: "Logística", activity: "Verificar lâmpadas, trocar queimadas/danificadas (Estacionamento - Geral?)", responsible: "Equipe de manutenção local" }, // Renomeado de P1.3
    { id: "P1.3c", periodicity: "MENSAL", system: "Logística", activity: "Acionar botão teste luminárias autônomas emergência (Estacionamento)", responsible: "Equipe de" }, // Renomeado de P1.3
    { id: "P1.3d", periodicity: "MENSAL", system: "Logística", activity: "Verificar estado placas sinalização segurança/tráfego (Estacionamento)", responsible: "manutenção local" }, // Renomeado de P1.3
    { id: "P1.5", periodicity: "TRIMESTRAL", system: "Logística", activity: "Lavar área estacionamento/garagem (reforço quinzenal)", responsible: "Equipe de manutenção local / Empresa capacitada" }, //
    { id: "P1.7a", periodicity: "ANUAL", system: "Logística", activity: "Verificar/reaplicar mastique ou substituir junta dilatação (Estacionamento)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de P1.7
    { id: "P1.7b", periodicity: "ANUAL", system: "Logística", activity: "Verificar e tratar fissuras (Estacionamento)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de P1.7
    { id: "P1.7c", periodicity: "ANUAL", system: "Logística", activity: "Verificar/recuperar superfície desgastada (Estacionamento)", responsible: "Equipe de manutenção local / Empresa capacitada" }, // Renomeado de P1.7

    // Paisagismo e Lazer
    { id: "Q1.0a", periodicity: "DIÁRIA", system: "Paisagismo", activity: "Ligar filtro da piscina", responsible: "Equipe de manutenção local / empresa especializada" }, // Renomeado de Q1.0
    { id: "Q1.0b", periodicity: "DIÁRIA", system: "Paisagismo", activity: "Remover resíduos peneira, aspirar fundo piscina", responsible: "Equipe de manutenção local / empresa especializada" }, // Renomeado de Q1.0
    { id: "Q1.1a", periodicity: "SEMANAL", system: "Paisagismo", activity: "Adicionar algicida conforme fabricante (piscina)", responsible: "Equipe de manutenção local / empresa especializada" }, // Renomeado de Q1.1
    { id: "Q1.1b", periodicity: "SEMANAL", system: "Paisagismo", activity: "Lavar filtro piscina (retrolavagem)", responsible: "Equipe de manutenção local / empresa especializada" }, // Renomeado de Q1.1
    { id: "Q1.1c", periodicity: "SEMANAL", system: "Paisagismo", activity: "Verificar PH (7,2-7,6) e cloro (1,0 PPM) água piscina", responsible: "Equipe de manutenção local / empresa especializada" }, // Renomeado de Q1.1
    { id: "Q1.1d", periodicity: "SEMANAL", system: "Paisagismo", activity: "Limpar bordas piscina (limpa-bordas)", responsible: "Equipe de manutenção local / empresa especializada" }, // Renomeado de QI.I
    { id: "Q1.7", periodicity: "ANUAL", system: "Paisagismo", activity: "Verificar rejuntamento piscina, peças soltas/trincadas", responsible: "Equipe de manutenção local / empresa especializada" }, //
    { id: "Q2.0", periodicity: "DIÁRIA", system: "Paisagismo", activity: "Limpeza equipamentos fitness (desinfetante MSRA/H1N1)", responsible: "Equipe de manutenção local / empresa especializada" }, // Periodicidade 'SEMPRE QUE NECESSÁRIO' mudada para 'DIÁRIA'
    { id: "Q3.1", periodicity: "SEMANAL", system: "Paisagismo", activity: "Drenar água equipamento sauna", responsible: "Equipe de manutenção local" }, //
    { id: "Q3.3", periodicity: "MENSAL", system: "Paisagismo", activity: "Regular/verificar calibragem termostato sauna", responsible: "Equipe de manutenção local / empresa especializada" }, //
    { id: "Q4.1", periodicity: "SEMANAL", system: "Paisagismo", activity: "Limpeza geral churrasqueira", responsible: "Equipe de manutenção local" }, //
    { id: "Q4.6", periodicity: "SEMESTRAL", system: "Paisagismo", activity: "Verificar revestimentos/tijolos refratários churrasqueira, reparar", responsible: "Equipe de manutenção local/ jardineiro qualificado" }, //
    { id: "Q5.1", periodicity: "SEMANAL", system: "Paisagismo", activity: "Remover sujeiras pisos prática recreativa", responsible: "Equipe de manutenção local" }, //
    { id: "Q5.6", periodicity: "SEMESTRAL", system: "Paisagismo", activity: "Avaliar condições piso prática recreativa", responsible: "Equipe de manutenção local" }, //
    { id: "Q6.0a", periodicity: "DIÁRIA", system: "Paisagismo", activity: "Regar campo futebol (manhã/tarde)", responsible: "Equipe de manutenção local" }, // Renomeado de Q6.0
    { id: "Q6.0b", periodicity: "DIÁRIA", system: "Paisagismo", activity: "Regar campo futebol (manhã/tarde) - Duplicado?", responsible: "Equipe de manutenção local" }, // Renomeado de Q6.0
    { id: "Q6.3", periodicity: "MENSAL", system: "Paisagismo", activity: "Manutenção jardim campo futebol (ervas daninhas, pragas, substituir mortas)", responsible: "Equipe de manutenção local/ jardineiro qualificado" }, //
    { id: "Q6.4", periodicity: "BIMESTRAL", system: "Paisagismo", activity: "Podar grama campo futebol", responsible: "Equipe de manutenção local/ jardineiro qualificado" }, // ID 06.4 no PDF
    { id: "Q6.8", periodicity: "BIENAL", system: "Paisagismo", activity: "Repintura demarcações campo futebol", responsible: "Equipe de" }, //
    { id: "Q8.0a", periodicity: "DIÁRIA", system: "Paisagismo", activity: "Regar jardins (manhã/tarde)", responsible: "Equipe de manutenção local" }, // Renomeado de Q8:0
    { id: "Q8.0b", periodicity: "DIÁRIA", system: "Paisagismo", activity: "Regar jardins (manhã/tarde) - Duplicado?", responsible: "Equipe de manutenção local" }, // Renomeado de Q8.0
    { id: "Q8.3", periodicity: "MENSAL", system: "Paisagismo", activity: "Manutenção jardins (ervas daninhas, pragas, substituir mortas)", responsible: "Equipe de manutenção local/ jardineiro qualificado" }, //
    { id: "Q8.4", periodicity: "BIMESTRAL", system: "Paisagismo", activity: "Podar grama jardins", responsible: "Equipe de manutenção local/ jardineiro qualificado" }, // ID 08.4 no PDF
    { id: "Q9.1", periodicity: "SEMANAL", system: "Paisagismo", activity: "Limpar calhas toboágua (limpa-bordas)", responsible: "Equipe de manutenção local / empresa especializada" }, //

    // Pavimentação
    { id: "R1.3", periodicity: "MENSAL", system: "Pavimentação", activity: "Revisar piso asfáltico, substituir defeitos (fissuras, trincas, etc.)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "R2.3a", periodicity: "MENSAL", system: "Pavimentação", activity: "Limpeza piso intertravado (vassoura cerdas macias)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de R2.3
    { id: "R2.3b", periodicity: "MENSAL", system: "Pavimentação", activity: "Revisar/recompor rejuntamento piso intertravado (areia fina/pó pedra)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de R2.3
    { id: "R2.3c", periodicity: "MENSAL", system: "Pavimentação", activity: "Revisar piso intertravado, substituir peças soltas/trincadas/quebradas", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de R2.3
    { id: "R2.3d", periodicity: "MENSAL", system: "Pavimentação", activity: "Remover ervas daninhas/grama juntas piso intertravado", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de R2.3
    { id: "R2.3e", periodicity: "MENSAL", system: "Pavimentação", activity: "Limpeza pontual imediata piso intertravado (substâncias nocivas)", responsible: "Equipe de manutenção local/ empresa capacitada" }, // Renomeado de R2.3
    { id: "R2.6", periodicity: "SEMESTRAL", system: "Pavimentação", activity: "Lavagem geral piso intertravado", responsible: "Equipe de manutenção local/ empresa capacitada" }, //

    // Telecomunicações
    { id: "T1.3", periodicity: "MENSAL", system: "Telecomunicações", activity: "Verificar funcionamento telefonia/interfones conforme fornecedor", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "T2.3", periodicity: "MENSAL", system: "Telecomunicações", activity: "Verificar funcionamento CFTV conforme fornecedor", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "T4.3", periodicity: "MENSAL", system: "Telecomunicações", activity: "Verificar funcionamento antena coletiva conforme fornecedor", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "T4.6", periodicity: "SEMESTRAL", system: "Telecomunicações", activity: "Verificar desempenho, revisar componentes, regular sinal (Antena Coletiva)", responsible: "Equipe de manutenção local/ empresa capacitada" }, //

    // Decoração
    { id: "S1", periodicity: "DIÁRIA", system: "Decoração", activity: "Limpeza armários planejados", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "S2", periodicity: "DIÁRIA", system: "Decoração", activity: "Limpeza cortinas", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "S3", periodicity: "DIÁRIA", system: "Decoração", activity: "Limpeza persianas", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "S4", periodicity: "DIÁRIA", system: "Decoração", activity: "Limpeza eletrodomésticos", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "S5", periodicity: "DIÁRIA", system: "Decoração", activity: "Limpeza espelho", responsible: "Equipe de manutenção local/ empresa capacitada" }, //
    { id: "S6", periodicity: "DIÁRIA", system: "Decoração", activity: "Limpeza luminárias", responsible: "Equipe de manutenção local/ empresa capacitada" } //
];

let savedData = JSON.parse(localStorage.getItem('maintenanceData')) || {};
let currentSkippingItemId = null; // To track which item is being skipped

function renderItems() {
    const container = document.getElementById('checklist');
    container.innerHTML = ''; // Clear previous items

    const now = new Date();
    // Set current time to the start of the day for consistent date comparisons
    now.setHours(0, 0, 0, 0);

    const systemFilter = document.getElementById('system-filter').value;
    const periodFilter = document.getElementById('period-filter').value;

    maintenanceItems.forEach(item => {
        // Apply Filters
        if (systemFilter && item.system !== systemFilter) return;
        if (periodFilter && item.periodicity !== periodFilter) return;

        // Get Saved Data
        const itemKey = item.id;
        const itemData = savedData[itemKey] || {};
        const lastDone = itemData.lastDone ? new Date(itemData.lastDone) : null;
        let nextDue = null;
        if(lastDone) {
            lastDone.setHours(0,0,0,0); // Normalize lastDone time
            nextDue = calculateNextDue(lastDone, item.periodicity);
        }
        const isOverdue = nextDue ? now >= nextDue : !lastDone; // Overdue if nextDue is today or past, or if never done


        // Create Element
        const itemElement = document.createElement('div');
        // Base classes + conditional classes
        let itemClasses = ['item'];
        if (itemData.status === 'completed' && !isOverdue) itemClasses.push('completed');
        if (itemData.status === 'skipped') itemClasses.push('skipped');
        // Only show overdue if not skipped and actually overdue
        if (isOverdue && itemData.status !== 'skipped') itemClasses.push('overdue');
        itemElement.className = itemClasses.join(' ');

        // Populate Inner HTML
        let historyHtml = '';
        if (lastDone) {
             historyHtml += `Última: ${formatDate(lastDone)}`;
             if (nextDue) {
                  historyHtml += ` | Próxima: ${formatDate(nextDue)}`;
             }
        }
         if (itemData.status === 'skipped' && itemData.lastSkipped) {
             const skipDate = new Date(itemData.lastSkipped);
             const reason = itemData.skipReason || "N/A"; // Show reason if available
             historyHtml += `<div class="item-history skipped-info">Pulado em: ${formatDate(skipDate)} | Motivo: ${reason}</div>`;
         } else if (lastDone) {
             historyHtml = `<div class="item-history">${historyHtml}</div>`; // Wrap history if not skipped
         }


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
                <span>${item.responsible || 'N/A'}</span>
                <div class="item-actions">
                    ${itemData.status !== 'skipped' ? `<button class="btn btn-success" onclick="completeItem('${item.id}', '${item.periodicity}')" title="Marcar como Concluído">✓</button>` : ''}
                    ${itemData.status !== 'skipped' ? `<button class="btn btn-danger" onclick="skipItem('${item.id}')" title="Pular Item (Informar Motivo)">✗</button>` : `<button class="btn btn-warning" onclick="unskipItem('${item.id}')" title="Reativar Item">↷</button>`}
                </div>
            </div>
            ${historyHtml}
        `;

        container.appendChild(itemElement);
    });
}

function calculateNextDue(lastDate, periodicity) {
    if (!(lastDate instanceof Date) || isNaN(lastDate)) return null; // Check if lastDate is valid

    const nextDate = new Date(lastDate);
    // Ensure time is zeroed out before adding periods
    nextDate.setHours(0, 0, 0, 0);

    switch (periodicity) {
        case 'DIÁRIA': nextDate.setDate(nextDate.getDate() + 1); break;
        case 'SEMANAL': nextDate.setDate(nextDate.getDate() + 7); break;
        case 'QUINZENAL': nextDate.setDate(nextDate.getDate() + 15); break;
        case 'MENSAL': nextDate.setMonth(nextDate.getMonth() + 1); break;
        case 'BIMESTRAL': nextDate.setMonth(nextDate.getMonth() + 2); break;
        case 'TRIMESTRAL': nextDate.setMonth(nextDate.getMonth() + 3); break;
        case 'SEMESTRAL': nextDate.setMonth(nextDate.getMonth() + 6); break;
        case 'ANUAL': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
        case 'BIENAL': nextDate.setFullYear(nextDate.getFullYear() + 2); break;
        case 'TRIENAL': nextDate.setFullYear(nextDate.getFullYear() + 3); break;
        case 'QUINQUENAL': nextDate.setFullYear(nextDate.getFullYear() + 5); break;
        default: return null; // Handle unknown periodicities
    }
    // Return the date with time zeroed out
    return nextDate;
}

function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return 'Data inválida'; // Check if date is valid
    // Ensure date object is valid before formatting
    try {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (e) {
        console.error("Error formatting date:", date, e);
        return 'Data inválida';
    }
}


function formatPeriodicity(period) {
    const map = {
        'DIÁRIA': 'Diária',
        'SEMANAL': 'Semanal',
        'QUINZENAL': 'Quinzenal',
        'MENSAL': 'Mensal',
        'BIMESTRAL': 'Bimestral',
        'TRIMESTRAL': 'Trimestral',
        'SEMESTRAL': 'Semestral',
        'ANUAL': 'Anual',
        'BIENAL': 'Bienal',
        'TRIENAL': 'Trienal',
        'QUINQUENAL': 'Quinquenal'
    };
    return map[period] || period;
}

// Function to show a specific modal by its ID
function showModal(modalId, title = '', message = '') {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with ID ${modalId} not found.`);
        return; // Exit if modal not found
    }

    // Handle standard modal content if needed
    if (modalId === 'modal') {
        const modalTitle = modal.querySelector('#modal-title');
        const modalMessage = modal.querySelector('#modal-message');
        if(modalTitle) modalTitle.textContent = title;
        if(modalMessage) modalMessage.innerHTML = message.replace(/\n/g, '<br>');
    }
    // Skip Reason Modal specific setup (ID display is handled in skipItem)
    // Report Modal specific setup (handled in generateAndShowReport)

    modal.style.display = 'flex';
}

// Function to close a specific modal by its ID
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    // Clear the skipping item ID and reason input when closing the skip reason modal
    if (modalId === 'skip-reason-modal') {
        currentSkippingItemId = null;
        const reasonInput = document.getElementById('skip-reason-input');
        if (reasonInput) {
            reasonInput.value = ''; // Clear textarea
        }
    }
    // Clear report output when closing report modal
    if (modalId === 'report-modal') {
         const reportOutput = document.getElementById('report-output');
         if(reportOutput) reportOutput.value = '';
    }
}

function completeItem(id, periodicity) {
    const now = new Date();
    const nextDue = calculateNextDue(new Date(now), periodicity); // Pass a new Date object

    savedData[id] = {
        status: 'completed',
        lastDone: now.toISOString(),
        nextDue: nextDue ? nextDue.toISOString() : null // Store null if nextDue is invalid
    };
    // Remove skip reason if completing a previously skipped item
    delete savedData[id].skipReason;
    delete savedData[id].lastSkipped;


    localStorage.setItem('maintenanceData', JSON.stringify(savedData));

    const nextDueDateString = nextDue ? formatDate(nextDue) : 'N/A';

    showModal(
        'modal', // ID of the standard modal
        'Concluído com Sucesso!',
        `Item ${id} marcado como concluído.\nPróxima verificação: ${nextDueDateString}\n\nVerifique se:\n1. Todas etapas foram executadas\n2. Não há vazamentos/resíduos\n3. Sistemas estão operando normalmente`
    );

    renderItems();
}

// Function called when 'X' button is clicked
function skipItem(id) {
    // Prepare and show the reason modal
    currentSkippingItemId = id; // Store the ID of the item being skipped
    const idDisplay = document.getElementById('skip-item-id-display');
    if (idDisplay) {
         idDisplay.textContent = id; // Show item ID in modal
    }
    const reasonInput = document.getElementById('skip-reason-input');
     if(reasonInput) {
         reasonInput.value = ''; // Clear previous reason
         reasonInput.focus(); // Focus the input field
     }
    showModal('skip-reason-modal'); // Use the function to show the skip reason modal
}


// Function called when 'Confirmar Pular' button in the modal is clicked
function confirmSkip() {
    if (!currentSkippingItemId) return; // Safety check

    const reasonInput = document.getElementById('skip-reason-input');
    const reason = reasonInput ? reasonInput.value.trim() : '';

    if (!reason) {
        alert('Por favor, insira um motivo para pular o item.');
        if(reasonInput) reasonInput.focus();
        return; // Don't proceed without a reason
    }

    // Save data with reason
    savedData[currentSkippingItemId] = {
        ...savedData[currentSkippingItemId], // Preserve lastDone date if exists
        status: 'skipped',
        lastSkipped: new Date().toISOString(), // Record when it was skipped
        skipReason: reason // Store the reason
    };
    // Ensure nextDue is removed or nullified when skipped
    delete savedData[currentSkippingItemId].nextDue;


    localStorage.setItem('maintenanceData', JSON.stringify(savedData));

    closeModal('skip-reason-modal'); // Close the reason modal
    renderItems(); // Re-render the list

    // Optionally show a confirmation message in the standard modal
    showModal('modal', 'Item Pulado', `A inspeção do item ${currentSkippingItemId} foi marcada como pulada com motivo registrado.`);

    currentSkippingItemId = null; // Reset the tracking variable
}

// Function called when 'Reativar' button is clicked
function unskipItem(id) {
    if (savedData[id] && savedData[id].status === 'skipped') {
        // Remove the skipped status and reason, keeping other data like lastDone
        delete savedData[id].status;
        delete savedData[id].lastSkipped;
        delete savedData[id].skipReason; // <<< Remove the reason

        // If the item had a lastDone date, recalculate nextDue
        if (savedData[id].lastDone) {
             const lastDoneDate = new Date(savedData[id].lastDone);
             const item = maintenanceItems.find(i => i.id === id);
             if (item) {
                 const nextDueDate = calculateNextDue(lastDoneDate, item.periodicity);
                 savedData[id].nextDue = nextDueDate ? nextDueDate.toISOString() : null;
             }
         } else {
              // If it was never done, there's no nextDue to calculate
               delete savedData[id].nextDue;
         }
         // If no lastDone exists after unskipping, the item might become immediately overdue
         // Consider if the entry should be removed completely if never done and unskipped:
         // if (!savedData[id].lastDone) delete savedData[id];


        localStorage.setItem('maintenanceData', JSON.stringify(savedData));
        renderItems();
        showModal('modal','Item Reativado', `O item ${id} não está mais marcado como pulado.`);
    }
}


// Function to generate and display the report text
function generateAndShowReport() {
    let reportText = "Relatório de Itens de Manutenção Pulados\n";
    reportText += "=========================================\n\n";
    let skippedCount = 0;

    // Iterate through all defined maintenance items to check their status in savedData
    maintenanceItems.forEach(item => {
        const itemData = savedData[item.id];
        if (itemData && itemData.status === 'skipped') {
            skippedCount++;
            let skipDate = 'N/A';
            if (itemData.lastSkipped) {
                try {
                     skipDate = formatDate(new Date(itemData.lastSkipped));
                } catch (e) {
                    console.error("Error formatting skip date for item:", item.id, itemData.lastSkipped, e);
                    skipDate = 'Data inválida';
                }
            }

            const reason = itemData.skipReason || 'Motivo não informado'; // Fallback if reason is missing

            reportText += `ID Item:     ${item.id}\n`;
            reportText += `Sistema:     ${item.system}\n`;
            reportText += `Atividade:   ${item.activity}\n`;
            reportText += `Responsável: ${item.responsible || 'N/A'}\n`;
            reportText += `Data Pulado: ${skipDate}\n`;
            reportText += `Motivo:      ${reason}\n`;
            reportText += `-----------------------------------------\n\n`;
        }
    });

    if (skippedCount === 0) {
        reportText += "Nenhum item marcado como pulado encontrado.";
    } else {
        reportText += `Total de itens pulados: ${skippedCount}\n`;
    }

    const reportOutput = document.getElementById('report-output');
    if(reportOutput) {
        reportOutput.value = reportText; // Put text in textarea
    }

    showModal('report-modal'); // Show the report modal
}


// --- Event Listeners Setup ---
document.addEventListener('DOMContentLoaded', (event) => {
    const systemFilterElement = document.getElementById('system-filter');
    const periodFilterElement = document.getElementById('period-filter');
    const resetButtonElement = document.getElementById('reset');
    const confirmSkipButton = document.getElementById('confirm-skip-button'); // Get reason confirm button
    const generateReportButton = document.getElementById('generate-report-button'); // Get report button

    // Filter and Reset Listeners
    if(systemFilterElement) systemFilterElement.addEventListener('change', renderItems);
    if(periodFilterElement) periodFilterElement.addEventListener('change', renderItems);
    if(resetButtonElement) resetButtonElement.addEventListener('click', () => {
        if(systemFilterElement) systemFilterElement.value = '';
        if(periodFilterElement) periodFilterElement.value = '';
        renderItems();
    });

    // Listener for the skip reason confirmation button
    if (confirmSkipButton) {
        confirmSkipButton.addEventListener('click', confirmSkip);
    }

    // Listener for the generate report button
    if (generateReportButton) {
         generateReportButton.addEventListener('click', generateAndShowReport);
    }


    // Initial Render when DOM is ready
    renderItems();
});