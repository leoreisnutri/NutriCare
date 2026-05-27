/**
 * CÓDIGO INTEGRADO PARA GOOGLE APPS SCRIPT
 * 
 * Siga os passos abaixo para implantar este código na sua Planilha Google:
 * 
 * 1. Abra a sua Planilha do Google Sheets onde deseja salvar os dados dos pacientes.
 * 2. No menu do topo, clique em: Extensões > Apps Script.
 * 3. Apague qualquer código que aparecer no editor de texto.
 * 4. Copie todo o código abaixo e cole no editor.
 * 5. Clique no ícone de Disquete (Salvar projeto) no topo do editor.
 * 6. Clique em Implantar (botão azul) > Nova implantação.
 * 7. Clique no ícone de Engrenagem (Selecionar tipo) ao lado de "Configurar implantação" e escolha "Aplicativo da Web".
 * 8. Preencha as configurações:
 *    - Descrição: Integração UBS NutriCare
 *    - Executar como: "Eu (seu e-mail)"
 *    - Quem tem acesso: "Qualquer pessoa" (ou "Qualquer pessoa, inclusive anônima" em algumas versões)
 *    - ATENÇÃO: Essa configuração é segura pois apenas a sua URL exclusiva gerada receberá requisições.
 * 9. Clique em "Implantar".
 * 10. O Google solicitará "Autorizar acesso" (pois o script alterará sua planilha). Conceda as permissões necessárias
 *     (clique em "Configurações Avançadas" > "Ir para Projeto Sem Nome (não seguro)" para prosseguir se o aviso do Google aparecer).
 * 11. Ao concluir, o Google exibirá a "URL do aplicativo da Web". Copie esta URL.
 * 12. Abra o aplicativo UBS NutriCare no seu navegador, clique no ícone de Engrenagem (Configurações) e cole a URL lá!
 */

function doPost(e) {
  // Acessa a planilha ativa do documento
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  try {
    // Transforma a requisição de texto bruto em objeto JSON
    var data = JSON.parse(e.postData.contents);
    
    // Requisição de Teste de Conexão realizada pelo app
    if (data.action === 'test') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success', 
        message: 'Conexão estabelecida com sucesso! Sua planilha está pronta para receber dados.'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
    }
    
    // Configura os cabeçalhos se a planilha estiver totalmente vazia
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
      
      // Formata a linha de cabeçalho para ficar profissional (Fundo Teal, Letra Branca, Negrito)
      var headerRange = sheet.getRange(1, 1, 1, 18);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f766e");
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      
      // Ajusta as colunas automaticamente na primeira execução
      sheet.autoResizeColumns(1, 18);
    }
    
    // Adiciona a nova linha com as informações enviadas pelo aplicativo
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
    
    // Retorna resposta de sucesso com CORS habilitado
    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch (error) {
    // Em caso de erro, retorna o erro em formato JSON
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.toString() 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
  }
}

// Lida com requisições CORS preflight (OPTIONS)
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
