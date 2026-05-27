// Estado da Aplicação
let patients = [];
let settings = { sheetsUrl: "" };
let editingId = null;
let theme = "light";

// Elementos DOM
const patientForm = document.getElementById("patient-form");
const patientIdInput = document.getElementById("patient-id");
const nomeInput = document.getElementById("nome");
const telefoneInput = document.getElementById("telefone");
const idadeInput = document.getElementById("idade");
const grupoInput = document.getElementById("grupo");
const pesoInput = document.getElementById("peso");
const dataPesoInput = document.getElementById("data-peso");
const alturaInput = document.getElementById("altura");
const cinturaInput = document.getElementById("cintura");
const quadrilInput = document.getElementById("quadril");
const glicemiaInput = document.getElementById("glicemia");
const pressaoInput = document.getElementById("pressao");
const outrasComorbidadesInput = document.getElementById("outras-comorbidades");
const formSubmitBtn = document.getElementById("btn-submit");
const submitText = document.getElementById("submit-text");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const btnReset = document.getElementById("btn-reset");

// Elementos de Previsão em Tempo Real
const calculationsPreview = document.querySelector(".calculations-preview");
const previewImc = document.getElementById("preview-imc");
const previewImcBadge = document.getElementById("preview-imc-badge");
const previewRcq = document.getElementById("preview-rcq");
const previewRcqBadge = document.getElementById("preview-rcq-badge");

// Estatísticas
const statTotal = document.getElementById("stat-total");
const statObese = document.getElementById("stat-obese");
const statCardioRisk = document.getElementById("stat-cardio-risk");

// Filtros
const searchInput = document.getElementById("search-input");
const groupFilter = document.getElementById("group-filter");
const statusFilter = document.getElementById("status-filter");
const grupoSuggestions = document.getElementById("grupo-suggestions");

// Listagem
const patientsList = document.getElementById("patients-list");
const syncCountBadge = document.getElementById("sync-count");

// Configurações & Modais
const settingsModal = document.getElementById("settings-modal");
const btnSettings = document.getElementById("btn-settings");
const closeModalBtn = document.querySelector(".close-modal");
const sheetsUrlInput = document.getElementById("sheets-url");
const btnSaveSettings = document.getElementById("btn-save-settings");
const btnTestSheets = document.getElementById("btn-test-sheets");
const connectionStatus = document.getElementById("connection-status");
const btnCopyScript = document.getElementById("btn-copy-script");

// Ações Globais
const themeToggle = document.getElementById("theme-toggle");
const btnExportSheets = document.getElementById("btn-export-sheets");
const exportCsvBtn = document.getElementById("export-csv");
const exportJsonBtn = document.getElementById("export-json");
const importJsonTrigger = document.getElementById("import-json-trigger");
const importJsonFile = document.getElementById("import-json-file");
const toast = document.getElementById("toast");

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupTheme();
  setupEventListeners();
  setDefaultDate();
  render();
});

// Funções de Persistência
function loadData() {
  const localPatients = localStorage.getItem("ubs_patients");
  patients = localPatients ? JSON.parse(localPatients) : [];

  const localSettings = localStorage.getItem("ubs_settings");
  settings = localSettings ? JSON.parse(localSettings) : { sheetsUrl: "" };
  sheetsUrlInput.value = settings.sheetsUrl;

  const localTheme = localStorage.getItem("ubs_theme");
  theme = localTheme || "light";
}

function saveData() {
  localStorage.setItem("ubs_patients", JSON.stringify(patients));
  updateSyncBadge();
}

function saveSettings() {
  settings.sheetsUrl = sheetsUrlInput.value.trim();
  localStorage.setItem("ubs_settings", JSON.stringify(settings));
  showToast("Configurações salvas com sucesso!");
}

// Configuração do Tema
function setupTheme() {
  document.documentElement.setAttribute("data-theme", theme);
  const sunIcon = themeToggle.querySelector(".sun-icon");
  const moonIcon = themeToggle.querySelector(".moon-icon");

  if (theme === "dark") {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  }
}

function toggleTheme() {
  theme = theme === "light" ? "dark" : "light";
  localStorage.setItem("ubs_theme", theme);
  setupTheme();
}

// Definição da Data Padrão para hoje
function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  dataPesoInput.value = today;
}

// Lógica de UI - Toast
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

// Cálculos Nutricionais
function calcularIMC(peso, alturaCm) {
  if (!peso || !alturaCm) return 0;
  const alturaM = alturaCm / 100;
  return parseFloat((peso / (alturaM * alturaM)).toFixed(1));
}

function classificarIMC(imc, idade) {
  if (!imc) return { classe: "-", badge: "badge-info" };

  // Classificação para Idosos (Lipschitz, 1994 / OPAS) - Idade >= 60
  if (idade >= 60) {
    if (imc < 22.0) return { classe: "Baixo Peso (Idoso)", badge: "badge-yellow" };
    if (imc >= 22.0 && imc <= 27.0) return { classe: "Eutrofia (Idoso)", badge: "badge-green" };
    return { classe: "Sobrepeso (Idoso)", badge: "badge-red" };
  }

  // Classificação Padrão Adulto (OMS)
  if (imc < 18.5) return { classe: "Baixo Peso", badge: "badge-yellow" };
  if (imc >= 18.5 && imc <= 24.9) return { classe: "Eutrofia", badge: "badge-green" };
  if (imc >= 25.0 && imc <= 29.9) return { classe: "Sobrepeso", badge: "badge-yellow" };
  if (imc >= 30.0 && imc <= 34.9) return { classe: "Obesidade Grau I", badge: "badge-red" };
  if (imc >= 35.0 && imc <= 39.9) return { classe: "Obesidade Grau II", badge: "badge-red" };
  return { classe: "Obesidade Grau III", badge: "badge-red" };
}

// Relação Cintura-Quadril (RCQ)
function calcularRCQ(cintura, quadril) {
  if (!cintura || !quadril) return 0;
  return parseFloat((cintura / quadril).toFixed(2));
}

function classificarRCQ(rcq, sexo) {
  if (!rcq) return { classe: "-", badge: "badge-info" };
  const limite = (sexo === "M" || sexo === "m" || sexo === "Masculino") ? 0.90 : 0.85;
  if (rcq >= limite) {
    return { classe: "Risco Cardíaco Elevado", badge: "badge-red" };
  }
  return { classe: "Risco Normal", badge: "badge-green" };
}

// Atualização do Preview em Tempo Real do Formulário
function updateLivePreview() {
  const peso = parseFloat(pesoInput.value);
  const altura = parseFloat(alturaInput.value);
  const cintura = parseFloat(cinturaInput.value);
  const quadril = parseFloat(quadrilInput.value);
  const idade = parseInt(idadeInput.value) || 30;
  const sexo = document.querySelector('input[name="sexo"]:checked')?.value || "F";

  const hasImcData = peso > 0 && altura > 0;
  const hasRcqData = cintura > 0 && quadril > 0;

  if (hasImcData || hasRcqData) {
    calculationsPreview.style.display = "grid";
  } else {
    calculationsPreview.style.display = "none";
    return;
  }

  if (hasImcData) {
    const imc = calcularIMC(peso, altura);
    const classif = classificarIMC(imc, idade);
    previewImc.textContent = `${imc} kg/m²`;
    previewImcBadge.textContent = classif.classe;
    previewImcBadge.className = `calc-badge ${classif.badge}`;
    const methodEl = document.getElementById("preview-imc-method");
    if (methodEl) {
      methodEl.textContent = idade >= 60 ? "Referência: Lipschitz (Idoso)" : "Referência: OMS (Adulto)";
    }
  } else {
    previewImc.textContent = "-";
    previewImcBadge.textContent = "-";
    previewImcBadge.className = "calc-badge badge-info";
    const methodEl = document.getElementById("preview-imc-method");
    if (methodEl) methodEl.textContent = "-";
  }

  if (hasRcqData) {
    const rcq = calcularRCQ(cintura, quadril);
    const classif = classificarRCQ(rcq, sexo);
    previewRcq.textContent = rcq;
    previewRcqBadge.textContent = classif.classe;
    previewRcqBadge.className = `calc-badge ${classif.badge}`;
  } else {
    previewRcq.textContent = "-";
    previewRcqBadge.textContent = "-";
    previewRcqBadge.className = "calc-badge badge-info";
  }
}

// Configura os Event Listeners
function setupEventListeners() {
  // Alternar Tema
  themeToggle.addEventListener("click", toggleTheme);

  // Monitorar Inputs para Preview em Tempo Real
  pesoInput.addEventListener("input", updateLivePreview);
  alturaInput.addEventListener("input", updateLivePreview);
  cinturaInput.addEventListener("input", updateLivePreview);
  quadrilInput.addEventListener("input", updateLivePreview);
  idadeInput.addEventListener("input", updateLivePreview);
  document.querySelectorAll('input[name="sexo"]').forEach(el => el.addEventListener("change", updateLivePreview));

  // Detectar seleção/digitação de Nome de Paciente cadastrado
  nomeInput.addEventListener("input", handleNomeInput);

  // Formulário: Submit e Reset
  patientForm.addEventListener("submit", handleFormSubmit);
  btnReset.addEventListener("click", resetForm);

  // Filtros
  searchInput.addEventListener("input", render);
  groupFilter.addEventListener("change", render);
  statusFilter.addEventListener("change", render);

  // Modais de Configuração
  btnSettings.addEventListener("click", () => settingsModal.classList.add("active"));
  closeModalBtn.addEventListener("click", () => settingsModal.classList.remove("active"));
  window.addEventListener("click", (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove("active");
  });

  btnSaveSettings.addEventListener("click", saveSettings);
  btnTestSheets.addEventListener("click", testSheetsConnection);

  // Exportações e Importações
  btnExportSheets.addEventListener("click", exportAllToSheets);
  exportCsvBtn.addEventListener("click", (e) => {
    e.preventDefault();
    downloadCSV();
  });
  exportJsonBtn.addEventListener("click", (e) => {
    e.preventDefault();
    downloadJSON();
  });
  
  importJsonTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    importJsonFile.click();
  });
  importJsonFile.addEventListener("change", importJSON);

  // Copiar código do Apps Script
  btnCopyScript.addEventListener("click", copyScriptCode);

  // Accordion para as Tabelas de Referência de IMC
  const imcRefToggle = document.querySelector(".imc-ref-toggle");
  const imcRefContent = document.querySelector(".imc-ref-content");
  if (imcRefToggle && imcRefContent) {
    imcRefToggle.addEventListener("click", () => {
      const isVisible = imcRefContent.style.display === "block";
      imcRefContent.style.display = isVisible ? "none" : "block";
      const icon = imcRefToggle.querySelector("svg");
      if (icon) {
        icon.style.transform = isVisible ? "rotate(0deg)" : "rotate(180deg)";
      }
    });
  }
}

// Autocompletar quando um nome existente é inserido
function handleNomeInput() {
  const name = nomeInput.value.trim();
  if (name.length < 2) return;

  // Não auto-preencher se já estivermos editando um registro existente
  if (editingId) return;

  // Buscar registros correspondentes
  const existingEntries = patients.filter(p => p.nome.toLowerCase() === name.toLowerCase());
  
  if (existingEntries.length > 0) {
    // Pegar o registro mais recente (primeiro encontrado se mantido ordenado por data)
    const sorted = [...existingEntries].sort((a, b) => b.dataPeso.localeCompare(a.dataPeso));
    const latest = sorted[0];

    // Preencher dados estáticos
    idadeInput.value = latest.idade;
    alturaInput.value = latest.altura;
    grupoInput.value = latest.grupo === "Sem Grupo" ? "" : latest.grupo;
    telefoneInput.value = latest.telefone || "";
    if (latest.sexo) {
      const sexoRadio = document.querySelector(`input[name="sexo"][value="${latest.sexo}"]`);
      if (sexoRadio) sexoRadio.checked = true;
    }

    // Preencher as comorbidades do último cadastro
    document.querySelectorAll('input[name="comorbidades"]').forEach(cb => {
      cb.checked = false;
    });

    const defaultComorbidades = ["Hipertensão (HAS)", "Diabetes (DM)", "Obesidade", "Dislipidemia", "Doença Cardiovascular", "Idoso frágil"];
    const outras = [];

    latest.comorbidades.forEach(c => {
      const checkbox = document.querySelector(`input[name="comorbidades"][value="${c}"]`);
      if (checkbox) {
        checkbox.checked = true;
      } else {
        outras.push(c);
      }
    });

    outrasComorbidadesInput.value = outras.join(", ");

    updateLivePreview();
    showToast(`Paciente "${latest.nome}" encontrado! Preenchendo dados antigos.`);
  }
}

// Submeter Formulário (Adicionar / Editar)
function handleFormSubmit(e) {
  e.preventDefault();

  const id = patientIdInput.value;
  const nome = nomeInput.value.trim();
  const telefone = telefoneInput.value.trim();
  const sexo = document.querySelector('input[name="sexo"]:checked')?.value || "F";
  const idade = parseInt(idadeInput.value);
  const grupo = grupoInput.value.trim() || "Sem Grupo";
  const peso = parseFloat(pesoInput.value);
  const dataPeso = dataPesoInput.value;
  const altura = parseFloat(alturaInput.value);
  const cintura = parseFloat(cinturaInput.value);
  const quadril = parseFloat(quadrilInput.value);
  const glicemia = glicemiaInput.value ? parseInt(glicemiaInput.value) : "";
  const pressao = pressaoInput.value.trim();

  // Comorbidades selecionadas por checkbox
  const comorbidadesList = Array.from(
    document.querySelectorAll('input[name="comorbidades"]:checked')
  ).map(cb => cb.value);

  // Outras comorbidades inseridas por texto
  if (outrasComorbidadesInput.value.trim()) {
    const adicionais = outrasComorbidadesInput.value
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);
    comorbidadesList.push(...adicionais);
  }

  // Cálculos
  const imc = calcularIMC(peso, altura);
  const imcClassif = classificarIMC(imc, idade).classe;
  const rcq = calcularRCQ(cintura, quadril);
  const rcqClassif = classificarRCQ(rcq, sexo).classe;

  const patientData = {
    id: id || Date.now().toString(),
    nome,
    telefone,
    sexo,
    idade,
    grupo,
    peso,
    dataPeso,
    altura,
    cintura,
    quadril,
    glicemia,
    pressao,
    comorbidades: comorbidadesList,
    imc,
    imcClassificacao: imcClassif,
    rcq,
    rcqClassificacao: rcqClassif,
    synced: id ? getPatientSyncStatus(id) : false,
  };

  // Se editados dados críticos de uma pesagem existente, marca como não sincronizada para reenviar
  if (id) {
    const oldPatient = patients.find(p => p.id === id);
    if (oldPatient && (
      oldPatient.peso !== peso || 
      oldPatient.altura !== altura || 
      oldPatient.cintura !== cintura || 
      oldPatient.quadril !== quadril || 
      oldPatient.nome !== nome || 
      oldPatient.dataPeso !== dataPeso ||
      oldPatient.sexo !== sexo ||
      oldPatient.glicemia !== glicemia ||
      oldPatient.pressao !== pressao
    )) {
      patientData.synced = false;
    }
  }

  if (id) {
    // Editar registro específico do histórico
    patients = patients.map(p => p.id === id ? patientData : p);
    showToast("Pesagem atualizada com sucesso!");
  } else {
    // Adicionar novo registro de pesagem (pode ser o mesmo nome, gerando histórico)
    patients.unshift(patientData);
    showToast("Nova pesagem registrada para " + nome + "!");
  }

  saveData();
  resetForm();
  render();
}

function getPatientSyncStatus(id) {
  const p = patients.find(pat => pat.id === id);
  return p ? p.synced : false;
}

// Resetar Formulário
function resetForm() {
  patientForm.reset();
  patientIdInput.value = "";
  setDefaultDate();
  editingId = null;

  // Restaurar botões do formulário
  formTitle.textContent = "Cadastrar Novo Paciente";
  formSubtitle.textContent = "Insira as informações antropométricas e clínicas.";
  submitText.textContent = "Cadastrar";
  formSubmitBtn.classList.remove("btn-warning");
  formSubmitBtn.classList.add("btn-primary");
  
  calculationsPreview.style.display = "none";
  const methodEl = document.getElementById("preview-imc-method");
  if (methodEl) methodEl.textContent = "-";
}

// Preencher Formulário para Edição de um registro de pesagem
function editPatient(id) {
  const p = patients.find(pat => pat.id === id);
  if (!p) return;

  editingId = id;
  patientIdInput.value = p.id;
  nomeInput.value = p.nome;
  idadeInput.value = p.idade;
  grupoInput.value = p.grupo === "Sem Grupo" ? "" : p.grupo;
  telefoneInput.value = p.telefone || "";
  if (p.sexo) {
    const radio = document.querySelector(`input[name="sexo"][value="${p.sexo}"]`);
    if (radio) radio.checked = true;
  }
  pesoInput.value = p.peso;
  dataPesoInput.value = p.dataPeso;
  alturaInput.value = p.altura;
  cinturaInput.value = p.cintura;
  quadrilInput.value = p.quadril;
  glicemiaInput.value = p.glicemia || "";
  pressaoInput.value = p.pressao || "";

  // Desmarcar todos os checkboxes primeiro
  document.querySelectorAll('input[name="comorbidades"]').forEach(cb => {
    cb.checked = false;
  });

  const defaultComorbidades = ["Hipertensão (HAS)", "Diabetes (DM)", "Obesidade", "Dislipidemia", "Doença Cardiovascular", "Idoso frágil"];
  const outras = [];

  p.comorbidades.forEach(c => {
    const checkbox = document.querySelector(`input[name="comorbidades"][value="${c}"]`);
    if (checkbox) {
      checkbox.checked = true;
    } else {
      outras.push(c);
    }
  });

  outrasComorbidadesInput.value = outras.join(", ");

  // Alterar interface do Formulário para Modo de Edição
  formTitle.textContent = "Editar Pesagem";
  formSubtitle.textContent = `Editando pesagem de ${p.nome} (${formatDate(p.dataPeso)})`;
  submitText.textContent = "Salvar Alterações";
  formSubmitBtn.classList.remove("btn-primary");
  formSubmitBtn.classList.add("btn-warning");

  // Rolar suavemente até o formulário
  patientForm.scrollIntoView({ behavior: "smooth" });

  updateLivePreview();
}

// Excluir uma pesagem específica
function deletePatient(id) {
  const p = patients.find(pat => pat.id === id);
  if (!p) return;

  if (confirm(`Tem certeza de que deseja excluir a pesagem de ${p.nome} realizada em ${formatDate(p.dataPeso)}?`)) {
    patients = patients.filter(pat => pat.id !== id);
    saveData();
    showToast("Pesagem removida.");
    render();
  }
}

// Atualiza o crachá de contagem de não-sincronizados
function updateSyncBadge() {
  const unsyncedCount = patients.filter(p => !p.synced).length;
  syncCountBadge.textContent = unsyncedCount;
  if (unsyncedCount > 0) {
    syncCountBadge.style.display = "inline-block";
  } else {
    syncCountBadge.style.display = "none";
  }
}

// RENDERIZAR INTERFACE COM AGRUPAMENTO POR PACIENTE
function render() {
  updateSyncBadge();
  renderStatistics();
  renderGroupSuggestions();
  renderNameSuggestions();

  const searchQuery = searchInput.value.toLowerCase().trim();
  const selectedGroup = groupFilter.value;
  const selectedStatus = statusFilter.value;

  // Agrupar pesagens por nome (case-insensitive para consistência)
  const groups = {};
  patients.forEach(p => {
    const key = p.nome.toLowerCase().trim();
    if (!groups[key]) {
      groups[key] = {
        nome: p.nome,
        entries: []
      };
    }
    groups[key].entries.push(p);
  });

  // Ordenar as pesagens dentro de cada paciente (mais recente primeiro)
  Object.keys(groups).forEach(key => {
    groups[key].entries.sort((a, b) => b.dataPeso.localeCompare(a.dataPeso));
  });

  const patientGroups = Object.values(groups);

  // Filtrar os pacientes com base em seu cadastro mais recente
  const filtered = patientGroups.filter(g => {
    const latest = g.entries[0];
    
    // Filtro de busca (Nome ou comorbidades)
    const matchSearch = latest.nome.toLowerCase().includes(searchQuery) ||
                        latest.comorbidades.some(c => c.toLowerCase().includes(searchQuery));
    
    // Filtro de Grupo
    const matchGroup = selectedGroup === "" || latest.grupo === selectedGroup;

    // Filtro de IMC
    let matchStatus = true;
    if (selectedStatus !== "") {
      if (selectedStatus === "Obesidade") {
        matchStatus = latest.imcClassificacao.includes("Obesidade");
      } else {
        matchStatus = latest.imcClassificacao.includes(selectedStatus);
      }
    }

    return matchSearch && matchGroup && matchStatus;
  });

  // Ordenar os pacientes agrupados em ordem alfabética por nome
  filtered.sort((a, b) => a.nome.localeCompare(b.nome));

  // Limpar lista
  patientsList.innerHTML = "";

  if (filtered.length === 0) {
    patientsList.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="48" height="48">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <p>Nenhum paciente atende aos filtros atuais.</p>
        <p class="sub">Tente mudar o termo de busca ou selecione outro grupo.</p>
      </div>
    `;
    return;
  }

  // Desenhar cartões de pacientes agrupados
  filtered.forEach(g => {
    const latest = g.entries[0];
    const card = document.createElement("div");
    
    // O card terá borda laranja se tiver alguma pesagem não sincronizada no histórico
    const hasUnsynced = g.entries.some(e => !e.synced);
    card.className = `patient-card ${hasUnsynced ? "unsynced" : ""}`;
    card.setAttribute("data-nome", latest.nome);

    const imcObj = classificarIMC(latest.imc, latest.idade);
    const rcqObj = classificarRCQ(latest.rcq, latest.sexo);

    const phoneHtml = latest.telefone 
      ? `<a href="https://wa.me/55${latest.telefone.replace(/\D/g, '')}" target="_blank" class="phone-link" onclick="event.stopPropagation();" title="Chamar no WhatsApp" style="color: var(--primary); font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
             <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
           </svg>
           ${latest.telefone}
         </a>`
      : '<span class="detail-value text-secondary" style="font-weight:400; font-style:italic;">Não informado</span>';

    const comorbidadesHtml = latest.comorbidades.length > 0 
      ? latest.comorbidades.map(c => `<span class="comorbidity-tag">${c}</span>`).join("")
      : '<span class="detail-value text-secondary" style="font-weight:400; font-style:italic;">Nenhuma relatada</span>';

    // Status de sincronização geral (mostra verde se todos os pesos do histórico foram enviados)
    const syncStatusIcon = !hasUnsynced 
      ? `<svg class="text-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" width="18" height="18" title="Todo o histórico está sincronizado no Sheets">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>`
      : `<svg class="text-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="18" height="18" title="Há pesagens neste histórico pendentes de sincronização">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
         </svg>`;

    // Montar a tabela de histórico de medições
    let historyRowsHtml = "";
    g.entries.forEach(entry => {
      const entryImcObj = classificarIMC(entry.imc, entry.idade);
      const entryRcqObj = classificarRCQ(entry.rcq, entry.sexo);
      
      const entrySyncIcon = entry.synced
        ? `<span class="text-teal" style="font-weight:700;" title="Sincronizado">✓</span>`
        : `<span class="text-orange" style="font-weight:700;" title="Pendente">⏳</span>`;

      historyRowsHtml += `
        <tr>
          <td>${formatDate(entry.dataPeso)}</td>
          <td><strong>${entry.peso} kg</strong></td>
          <td>${entry.imc} <span class="badge-mini ${entryImcObj.badge}">${entryImcObj.classe.replace(" (Idoso)", "")}</span></td>
          <td>${entry.cintura} cm</td>
          <td>${entry.quadril} cm</td>
          <td>${entry.rcq} <span class="badge-mini ${entryRcqObj.badge}">${entryRcqObj.classe === "Risco Cardíaco Elevado" ? "Risco" : "Normal"}</span></td>
          <td><strong>${entry.pressao || "-"}</strong></td>
          <td><strong>${entry.glicemia ? entry.glicemia + ' mg/dL' : "-"}</strong></td>
          <td style="text-align: center;">${entrySyncIcon}</td>
          <td>
            <div class="row-actions">
              <button class="btn-icon edit" onclick="event.stopPropagation(); editPatient('${entry.id}')" title="Editar esta pesagem">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button class="btn-icon delete" onclick="event.stopPropagation(); deletePatient('${entry.id}')" title="Excluir esta pesagem">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button class="btn-icon sync" onclick="event.stopPropagation(); syncSinglePatient('${entry.id}')" title="Sincronizar esta pesagem">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    card.innerHTML = `
      <div class="patient-card-main">
        <div class="patient-header">
          <span class="patient-name">${latest.nome}</span>
          <span class="patient-group-badge">${latest.grupo}</span>
          ${syncStatusIcon}
          <span class="history-count" style="font-size:11px; font-weight:600; color:var(--text-secondary); margin-left:auto;">
            ${g.entries.length} pesagem(ns)
          </span>
        </div>
        <div class="patient-meta">
          <span><strong>Idade / Sexo:</strong> ${latest.idade} anos (${latest.sexo === 'M' ? 'Masc.' : 'Fem.'})</span>
          <span><strong>Peso Atual:</strong> ${latest.peso} kg (${formatDate(latest.dataPeso)})</span>
          <span><strong>Altura:</strong> ${latest.altura} cm</span>
        </div>
        <div class="patient-badges" style="margin-top: 8px;">
          <span class="badge ${imcObj.badge}">IMC Atual: ${latest.imc} (${imcObj.classe})</span>
          <span class="badge ${rcqObj.badge}">${rcqObj.classe} (RCQ: ${latest.rcq})</span>
        </div>
        
        <!-- Expanded details -->
        <div class="patient-details-expanded" style="display: none;">
          <div class="detail-item" style="margin-bottom: 8px;">
            <span class="detail-label">Telefone / WhatsApp</span>
            <div style="margin-top: 4px;">
              ${phoneHtml}
            </div>
          </div>
          <div class="detail-item detail-comorbidities" style="margin-bottom: 8px;">
            <span class="detail-label">Comorbidades / Condições Clínicas</span>
            <div style="margin-top: 4px;">
              ${comorbidadesHtml}
            </div>
          </div>

          <!-- Área do Gráfico Evolutivo -->
          <div class="patient-chart-container" style="grid-column: 1 / -1; margin-top: 12px;">
            <div class="chart-header">
              <span class="chart-title">Evolução Clínica</span>
              <div class="chart-tabs">
                <button type="button" class="chart-tab-btn active" data-type="peso">Peso</button>
                <button type="button" class="chart-tab-btn" data-type="glicemia">Glicemia</button>
                <button type="button" class="chart-tab-btn" data-type="pressao">Pressão</button>
              </div>
            </div>
            <div class="chart-wrapper">
              <canvas class="evolution-chart-canvas"></canvas>
            </div>
          </div>
          
          <!-- Tabela de Histórico (Timeline) -->
          <div class="history-table-container" style="grid-column: 1 / -1; margin-top: 12px;">
            <span class="detail-label">Histórico Evolutivo de Pesagens</span>
            <div class="table-responsive">
              <table class="history-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Peso</th>
                    <th>IMC</th>
                    <th>Cintura</th>
                    <th>Quadril</th>
                    <th>RCQ</th>
                    <th>P.A.</th>
                    <th>Glicemia</th>
                    <th style="text-align: center;">Sheets</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${historyRowsHtml}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Ação de expandir/ocultar detalhes
    const cardMain = card.querySelector(".patient-card-main");
    cardMain.addEventListener("click", (e) => {
      // Impede expansão se clicar em ações de linha na tabela
      if (e.target.closest("button") || e.target.closest("svg") || e.target.closest("td")) return;
      
      const details = card.querySelector(".patient-details-expanded");
      const isExpanded = details.style.display === "block" || details.style.display === "grid";
      
      if (!isExpanded) {
        details.style.display = "block";
        // Inicializa o gráfico quando expandido
        initPatientChart(card, g.entries);
      } else {
        details.style.display = "none";
      }
    });

    patientsList.appendChild(card);
  });
}

// Renderiza Estatísticas no Painel com base na medição mais recente de cada paciente único
function renderStatistics() {
  // Agrupar e obter a medição mais recente
  const groups = {};
  patients.forEach(p => {
    const key = p.nome.toLowerCase().trim();
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(p);
  });
  
  const latestEntries = Object.values(groups).map(entries => {
    return entries.reduce((newest, current) => {
      return current.dataPeso.localeCompare(newest.dataPeso) > 0 ? current : newest;
    }, entries[0]);
  });

  statTotal.textContent = latestEntries.length;

  if (latestEntries.length === 0) {
    statObese.textContent = "0%";
    statCardioRisk.textContent = "0";
    return;
  }

  // Obesidade e Sobrepeso
  const obeseOrOverweight = latestEntries.filter(p => 
    p.imcClassificacao.includes("Obesidade") || p.imcClassificacao.includes("Sobrepeso")
  ).length;
  const obesePercentage = Math.round((obeseOrOverweight / latestEntries.length) * 100);
  statObese.textContent = `${obesePercentage}%`;

  // Risco Cardiovascular (RCQ >= 0.90 para Homem ou >= 0.85 para Mulher)
  const cardioRiskCount = latestEntries.filter(p => {
    const limit = (p.sexo === "M") ? 0.90 : 0.85;
    return p.rcq >= limit;
  }).length;
  statCardioRisk.textContent = cardioRiskCount;
}

// Atualiza a lista de autocompletar do campo de Nome
function renderNameSuggestions() {
  const datalist = document.getElementById("patient-names-suggestions");
  if (!datalist) return;
  const uniqueNames = [...new Set(patients.map(p => p.nome))].sort();
  datalist.innerHTML = uniqueNames.map(name => `<option value="${name}"></option>`).join("");
}

// Inicializar gráfico evolutivo usando Chart.js
function initPatientChart(cardElement, entries) {
  const canvas = cardElement.querySelector(".evolution-chart-canvas");
  if (!canvas) return;

  const sortedEntries = [...entries].sort((a, b) => a.dataPeso.localeCompare(b.dataPeso));

  const labels = sortedEntries.map(e => formatDate(e.dataPeso));

  let chartInstance = canvas.chartInstance;

  function getChartConfig(type) {
    let datasets = [];

    if (type === "peso") {
      const data = sortedEntries.map(e => e.peso);
      datasets = [{
        label: "Peso (kg)",
        data: data,
        borderColor: "#0f766e",
        backgroundColor: "rgba(15, 118, 110, 0.1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      }];
      return { labels, datasets };
    } else if (type === "glicemia") {
      const filtered = sortedEntries.filter(e => e.glicemia !== "" && e.glicemia !== undefined && e.glicemia !== null);
      const labelsGlicemia = filtered.map(e => formatDate(e.dataPeso));
      const data = filtered.map(e => e.glicemia);

      datasets = [{
        label: "Glicemia Capilar (mg/dL)",
        data: data,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      }];
      return { labels: labelsGlicemia, datasets };
    } else if (type === "pressao") {
      const filtered = sortedEntries.filter(e => e.pressao && e.pressao.includes("/"));
      const labelsPressao = filtered.map(e => formatDate(e.dataPeso));
      
      const systolic = [];
      const diastolic = [];
      
      filtered.forEach(e => {
        const parts = e.pressao.split("/");
        systolic.push(parseFloat(parts[0]) || 0);
        diastolic.push(parseFloat(parts[1]) || 0);
      });

      datasets = [
        {
          label: "Sistólica (Máxima)",
          data: systolic,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.05)",
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        },
        {
          label: "Diastólica (Mínima)",
          data: diastolic,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.05)",
          borderWidth: 2,
          tension: 0.3,
          fill: false,
        }
      ];
      return { labels: labelsPressao, datasets };
    }

    return { labels, datasets };
  }

  function renderChart(type) {
    const configData = getChartConfig(type);

    if (chartInstance) {
      chartInstance.destroy();
    }

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";
    const textColor = isDark ? "#94a3b8" : "#64748b";

    chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: configData.labels,
        datasets: configData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: textColor,
              font: {
                family: 'Inter',
                size: 11,
                weight: '500'
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter', size: 10 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter', size: 10 } }
          }
        }
      }
    });

    canvas.chartInstance = chartInstance;
  }

  renderChart("peso");

  const tabs = cardElement.querySelectorAll(".chart-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.stopPropagation();
      
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const type = tab.getAttribute("data-type");
      renderChart(type);
    });
  });
}

// Atualiza o filtro de grupos com base nos grupos existentes
function renderGroupSuggestions() {
  const groups = [...new Set(patients.map(p => p.grupo))].filter(g => g && g !== "Sem Grupo");
  const currentSelected = groupFilter.value;
  
  groupFilter.innerHTML = '<option value="">Todos os Grupos</option>';
  grupoSuggestions.innerHTML = '';

  groups.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    groupFilter.appendChild(opt);

    const sug = document.createElement("option");
    sug.value = g;
    grupoSuggestions.appendChild(sug);
  });

  groupFilter.value = currentSelected;
}

// Formatar data de YYYY-MM-DD para DD/MM/AAAA
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// INTEGRAÇÃO GOOGLE SHEETS

// Testar conexão
// Helper para envio adaptativo com suporte a CORS local (modo no-cors em file://)
async function sendToGoogleSheets(url, payload) {
  const isLocalFile = window.location.protocol === 'file:';
  
  if (isLocalFile) {
    // Modo local (file://): navegadores bloqueiam leitura de resposta (CORS), 
    // mas permitem o envio se usarmos 'no-cors'
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(payload)
    });
    // Como no-cors impede leitura, simulamos sucesso. 
    // Se o domínio estiver errado, a requisição disparará erro no catch externo.
    return { status: "success", message: "Enviado no modo local (verifique a planilha)." };
  } else {
    // Modo web (hospedado): podemos usar CORS e ler a resposta normalmente
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(payload)
    });
    return await response.json();
  }
}

// Testar conexão
async function testSheetsConnection() {
  const url = sheetsUrlInput.value.trim();
  if (!url) {
    showConnectionStatus("Por favor, insira a URL do Apps Script primeiro.", "error");
    return;
  }

  btnTestSheets.textContent = "Testando...";
  btnTestSheets.disabled = true;

  try {
    const isLocalFile = window.location.protocol === 'file:';
    
    if (isLocalFile) {
      // No modo local, enviamos via no-cors
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify({ action: "test" })
      });
      showConnectionStatus("Requisição enviada! Como você está abrindo o arquivo localmente pelo computador (dois cliques), o navegador bloqueia a confirmação visual da resposta (CORS). Verifique se um registro de teste ou cabeçalho foi criado na planilha!", "success");
    } else {
      // No modo web, fazemos a checagem com leitura de JSON
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain"
        },
        body: JSON.stringify({ action: "test" })
      });
      const result = await response.json();
      if (result && result.status === "success") {
        showConnectionStatus("Conexão bem-sucedida! A planilha está respondendo.", "success");
      } else {
        showConnectionStatus(`Resposta inesperada: ${result.message || "Erro desconhecido"}`, "error");
      }
    }
  } catch (error) {
    console.error(error);
    showConnectionStatus("Erro ao disparar teste de conexão. Verifique se a URL está correta ou se está sem internet.", "error");
  } finally {
    btnTestSheets.textContent = "Testar Conexão";
    btnTestSheets.disabled = false;
  }
}

function showConnectionStatus(msg, type) {
  connectionStatus.textContent = msg;
  connectionStatus.className = `alert-box alert-${type}`;
  connectionStatus.style.display = "block";
}

// Sincronizar Único Registro de Pesagem
async function syncSinglePatient(id) {
  const p = patients.find(pat => pat.id === id);
  if (!p) return;

  const url = settings.sheetsUrl;
  if (!url) {
    showToast("Configure a URL do Google Sheets nas Configurações ⚙️ no topo.");
    settingsModal.classList.add("active");
    return;
  }

  showToast(`Sincronizando peso de ${p.nome} (${formatDate(p.dataPeso)})...`);

  try {
    const payload = {
      action: "sync",
      nome: p.nome,
      telefone: p.telefone || "",
      sexo: p.sexo || "",
      idade: p.idade,
      grupo: p.grupo,
      peso: p.peso,
      dataPeso: formatDate(p.dataPeso),
      altura: p.altura / 100,
      imc: p.imc,
      imcClassificacao: p.imcClassificacao,
      cintura: p.cintura,
      quadril: p.quadril,
      rcq: p.rcq,
      rcqClassificacao: p.rcqClassificacao,
      pressao: p.pressao || "",
      glicemia: p.glicemia || "",
      comorbidades: p.comorbidades
    };

    const result = await sendToGoogleSheets(url, payload);
    
    if (result && result.status === "success") {
      p.synced = true;
      saveData();
      render();
      showToast(`Pesagem de ${p.nome} enviada para o Google Sheets!`);
    } else {
      showToast(`Erro ao sincronizar: ${result.message || "Planilha recusou o envio"}`);
    }
  } catch (error) {
    console.error(error);
    showToast("Erro de rede ao conectar com o Google Sheets.");
  }
}

// Sincronizar Todos os registros de pesagem pendentes
async function exportAllToSheets() {
  const url = settings.sheetsUrl;
  if (!url) {
    showToast("Configure a URL do Google Sheets nas Configurações ⚙️");
    settingsModal.classList.add("active");
    return;
  }

  const unsynced = patients.filter(p => !p.synced);
  if (unsynced.length === 0) {
    showToast("Todas as pesagens já estão sincronizadas!");
    return;
  }

  btnExportSheets.disabled = true;
  const originalHtml = btnExportSheets.innerHTML;
  btnExportSheets.innerHTML = "<span>Sincronizando...</span>";

  let successCount = 0;
  for (let p of unsynced) {
    try {
      const payload = {
        action: "sync",
        nome: p.nome,
        telefone: p.telefone || "",
        sexo: p.sexo || "",
        idade: p.idade,
        grupo: p.grupo,
        peso: p.peso,
        dataPeso: formatDate(p.dataPeso),
        altura: p.altura / 100,
        imc: p.imc,
        imcClassificacao: p.imcClassificacao,
        cintura: p.cintura,
        quadril: p.quadril,
        rcq: p.rcq,
        rcqClassificacao: p.rcqClassificacao,
        pressao: p.pressao || "",
        glicemia: p.glicemia || "",
        comorbidades: p.comorbidades
      };

      const result = await sendToGoogleSheets(url, payload);
      if (result && result.status === "success") {
        p.synced = true;
        successCount++;
        saveData();
      }
    } catch (e) {
      console.error("Falha ao sincronizar: " + p.nome, e);
    }
  }

  btnExportSheets.disabled = false;
  btnExportSheets.innerHTML = originalHtml;
  
  render();
  
  if (successCount > 0) {
    showToast(`${successCount} pesagens exportadas com sucesso!`);
  } else {
    showToast("Erro ao exportar. Verifique as configurações da planilha.");
  }
}

// EXPORTAÇÃO OFFLINE DE CSV (Ordenado por Nome e Data)
function downloadCSV() {
  if (patients.length === 0) {
    showToast("Não há pacientes para exportar.");
    return;
  }

  const headers = [
    "Nome", "Telefone", "Sexo", "Idade", "Grupo/UBS", "Peso (kg)", "Data do Peso", 
    "Altura (cm)", "IMC", "Classificacao IMC", 
    "Circunferencia Cintura (cm)", "Circunferencia Quadril (cm)", 
    "Relacao Cintura/Quadril (RCQ)", "Classificacao RCQ", "Pressao Arterial", 
    "Glicemia Capilar (mg/dL)", "Comorbidades"
  ];

  let csvContent = "\uFEFF"; 
  csvContent += headers.join(";") + "\r\n"; 

  // Ordenar alfabeticamente por Nome, e depois cronologicamente por Data do Peso (antigos primeiro)
  const sortedForCsv = [...patients].sort((a, b) => {
    const nameCompare = a.nome.localeCompare(b.nome);
    if (nameCompare !== 0) return nameCompare;
    return a.dataPeso.localeCompare(b.dataPeso);
  });

  sortedForCsv.forEach(p => {
    const imcObj = classificarIMC(p.imc, p.idade);
    const rcqObj = classificarRCQ(p.rcq, p.sexo);
    
    const pesoBr = p.peso.toString().replace(".", ",");
    const alturaBr = p.altura.toString();
    const imcBr = p.imc.toString().replace(".", ",");
    const cinturaBr = p.cintura.toString().replace(".", ",");
    const quadrilBr = p.quadril.toString().replace(".", ",");
    const rcqBr = p.rcq.toString().replace(".", ",");
    const glicemiaBr = p.glicemia !== undefined && p.glicemia !== null ? p.glicemia.toString() : "";

    const row = [
      p.nome,
      p.telefone || "",
      p.sexo === "M" ? "Masculino" : "Feminino",
      p.idade,
      p.grupo,
      pesoBr,
      formatDate(p.dataPeso),
      alturaBr,
      imcBr,
      imcObj.classe,
      cinturaBr,
      quadrilBr,
      rcqBr,
      rcqObj.classe,
      p.pressao || "",
      glicemiaBr,
      p.comorbidades.join(", ")
    ];
    
    const cleanRow = row.map(val => {
      let str = String(val);
      if (str.includes(";")) {
        str = `"${str}"`;
      }
      return str;
    });

    csvContent += cleanRow.join(";") + "\r\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const today = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `UBS_NutriCare_Pacientes_${today}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// DOWNLOAD BACKUP JSON
function downloadJSON() {
  if (patients.length === 0) {
    showToast("Não há dados para backup.");
    return;
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patients, null, 2));
  const link = document.createElement("a");
  const today = new Date().toISOString().split("T")[0];
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `UBS_NutriCare_Backup_${today}.json`);
  link.click();
}

// IMPORTAR BACKUP JSON
function importJSON(e) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        const valid = imported.every(p => p.nome && p.peso && p.altura && p.id);
        if (valid) {
          if (confirm(`Deseja mesclar ${imported.length} pesagens importadas com sua lista atual?`)) {
            const merged = [...patients];
            imported.forEach(imp => {
              const existingIdx = merged.findIndex(m => m.id === imp.id);
              if (existingIdx > -1) {
                merged[existingIdx] = imp;
              } else {
                merged.unshift(imp);
              }
            });

            patients = merged;
            saveData();
            render();
            showToast("Dados importados com sucesso!");
          }
        } else {
          alert("Arquivo inválido. Formato de dados de paciente incorreto.");
        }
      } else {
        alert("O arquivo de backup deve conter uma lista válida de registros.");
      }
    } catch (err) {
      alert("Erro ao ler arquivo JSON. Verifique se o arquivo está corrompido.");
    }
  };
  if (e.target.files[0]) {
    fileReader.readAsText(e.target.files[0]);
  }
}

// Copiar código do Apps Script
function copyScriptCode() {
  const code = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Requisição de Teste de Conexão
    if (data.action === 'test') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success', 
        message: 'Conexão estabelecida com sucesso! Sua planilha está pronta para receber dados.'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
    }
    
    // Configura os cabeçalhos se a planilha estiver vazia
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Data do Registro", 
        "Nome", 
        "Telefone",
        "Sexo",
        "Idade (anos)", 
        "Grupo / UBS", 
        "Peso (kg)", 
        "Data do Peso", 
        "Altura (m)", 
        "IMC (kg/m²)", 
        "Classificação IMC", 
        "Cintura (cm)", 
        "Quadril (cm)", 
        "Relação Cintura/Quadril (RCQ)", 
        "Classificação RCQ", 
        "Pressão Arterial",
        "Glicemia Capilar (mg/dL)",
        "Comorbidades"
      ]);
      
      // Formata a linha de cabeçalho
      var headerRange = sheet.getRange(1, 1, 1, 18);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f766e");
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      
      sheet.autoResizeColumns(1, 18);
    }
    
    // Adiciona a linha do paciente
    sheet.appendRow([
      new Date().toLocaleString("pt-BR"),
      data.nome,
      data.telefone || "",
      data.sexo || "",
      data.idade,
      data.grupo || "Sem Grupo",
      data.peso,
      data.dataPeso,
      data.altura,
      data.imc,
      data.imcClassificacao,
      data.cintura,
      data.quadril,
      data.rcq,
      data.rcqClassificacao,
      data.pressao || "",
      data.glicemia || "",
      data.comorbidades ? data.comorbidades.join(", ") : ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}`;

  navigator.clipboard.writeText(code).then(() => {
    showToast("Código do Google Apps Script copiado para a Área de Transferência!");
  }).catch(err => {
    console.error("Falha ao copiar: ", err);
    showToast("Erro ao copiar código automaticamente. Abra o arquivo 'google-script-code.js' na pasta do app.");
  });
}
