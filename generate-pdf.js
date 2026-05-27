const fs = require('fs');
const PDFDocument = require('pdfkit');

// Inicializa o documento PDF A4 com margens de 50pt (~1.76cm)
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 60, left: 50, right: 50 },
  bufferPages: true
});

doc.pipe(fs.createWriteStream('Manual_NutriCare.pdf'));

// Paleta de cores do NutriCare
const primaryColor = '#0f766e';     // Teal clínico
const secondaryColor = '#0d9488';   // Teal médio
const textColor = '#1e293b';        // Cinza escuro
const lightTeal = '#f0fdfa';        // Fundo alerta
const grayText = '#64748b';         // Cinza secundário

let currentY = 50;

function checkPageBreak(neededHeight) {
  if (currentY + neededHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    currentY = doc.page.margins.top;
  }
}

function printH1(text) {
  checkPageBreak(60);
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(18)
     .text(text, 50, currentY);
  currentY += 24;
  
  // Linha horizontal abaixo do título principal
  doc.strokeColor('#ccfbf1')
     .lineWidth(1.5)
     .moveTo(50, currentY)
     .lineTo(doc.page.width - 50, currentY)
     .stroke();
  currentY += 15;
}

function printH2(text) {
  checkPageBreak(40);
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(13)
     .text(text, 50, currentY);
  currentY += 20;
}

function printH3(text) {
  checkPageBreak(30);
  doc.fillColor(secondaryColor)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text(text, 50, currentY);
  currentY += 16;
}

function printParagraph(text) {
  const options = { width: doc.page.width - 100, align: 'justify' };
  const height = doc.heightOfString(text, options);
  checkPageBreak(height + 15);
  doc.fillColor(textColor)
     .font('Helvetica')
     .fontSize(10)
     .text(text, 50, currentY, options);
  currentY += height + 10;
}

function printBullet(text) {
  const options = { width: doc.page.width - 120, align: 'justify' };
  const height = doc.heightOfString(text, options);
  checkPageBreak(height + 12);
  doc.fillColor(textColor)
     .font('Helvetica')
     .fontSize(10)
     .text('•', 55, currentY);
  doc.text(text, 70, currentY, options);
  currentY += height + 6;
}

function printAlertBox(title, text) {
  const options = { width: doc.page.width - 160, align: 'justify' };
  const combinedText = `${title}: ${text}`;
  const textHeight = doc.heightOfString(combinedText, options);
  const boxHeight = textHeight + 16;
  
  checkPageBreak(boxHeight + 20);
  
  // Retângulo de fundo
  doc.rect(50, currentY, doc.page.width - 100, boxHeight)
     .fill(lightTeal);
     
  // Borda esquerda
  doc.rect(50, currentY, 4, boxHeight)
     .fill(secondaryColor);
     
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(9.5)
     .text(title + ':', 65, currentY + 8);
     
  doc.fillColor(textColor)
     .font('Helvetica')
     .fontSize(9.5)
     .text(text, 120, currentY + 8, { width: doc.page.width - 180, align: 'justify' });
     
  currentY += boxHeight + 15;
}

function printTable(headers, rows) {
  const colWidths = [180, 180, 135];
  const rowHeight = 22;
  const tableHeight = (rows.length + 1) * rowHeight;
  checkPageBreak(tableHeight + 20);
  
  // Cabeçalho da Tabela
  doc.rect(50, currentY, doc.page.width - 100, rowHeight).fill('#f1f5f9');
  
  let currentX = 50;
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9);
  headers.forEach((h, idx) => {
    doc.text(h, currentX + 8, currentY + 6);
    currentX += colWidths[idx];
  });
  
  currentY += rowHeight;
  
  // Linhas da Tabela
  doc.fillColor(textColor).font('Helvetica').fontSize(9);
  rows.forEach(r => {
    doc.strokeColor('#e2e8f0')
       .lineWidth(0.5)
       .moveTo(50, currentY + rowHeight)
       .lineTo(doc.page.width - 50, currentY + rowHeight)
       .stroke();
       
    currentX = 50;
    r.forEach((cell, idx) => {
      doc.text(cell, currentX + 8, currentY + 6);
      currentX += colWidths[idx];
    });
    currentY += rowHeight;
  });
  
  currentY += 15;
}

// ----------------------------------------------------
// GERAR CONTEÚDO
// ----------------------------------------------------

// 1. Capa
doc.rect(0, 0, 30, doc.page.height).fill(primaryColor);

doc.fillColor(primaryColor)
   .font('Helvetica-Bold')
   .fontSize(46)
   .text('NutriCare', 80, 220);
   
doc.fillColor(grayText)
   .font('Helvetica')
   .fontSize(16)
   .text('Manual do Usuário e Documentação Técnica', 80, 275);
   
doc.fillColor(textColor)
   .fontSize(10.5)
   .text('Desenvolvedor: Leandresson Pires Reis', 80, doc.page.height - 180)
   .text('Versão do Aplicativo: 1.2 (Estável)', 80, doc.page.height - 160)
   .text('Data de Publicação: Maio de 2026', 80, doc.page.height - 140)
   .text('Licença: Todos os Direitos Reservados', 80, doc.page.height - 120);

// 2. Página 2: Introdução
doc.addPage();
currentY = 50;

printH1('1. Introdução ao NutriCare');
printParagraph(
  'O NutriCare é um aplicativo web de página única (Single Page Application - SPA) de nível profissional, concebido especificamente para nutricionistas e profissionais de saúde realizarem o acompanhamento antropométrico e clínico de pacientes participantes de grupos de promoção da saúde.'
);
printParagraph(
  'O sistema adota uma abordagem offline-first (funciona completamente sem internet) e integra recursos de visualização gráfica avançada e sincronização em lote com o Google Sheets, viabilizando o armazenamento de dados online sem necessidade de servidores complexos ou bancos de dados adicionais.'
);

printAlertBox(
  'Vantagem Clínica',
  'O NutriCare é rápido, responsivo e adaptado para tablets e smartphones, permitindo seu uso direto em consultórios, Unidades Básicas de Saúde (UBS) ou em atendimentos domiciliares sem dependências.'
);

printH2('1.1. Pilares do Projeto');
printBullet('Privacidade do Paciente: Todos os dados inseridos são mantidos inicialmente no navegador local do usuário, garantindo conformidade com regras de proteção a dados sensíveis.');
printBullet('Agilidade no Atendimento: O sistema possui recursos inteligentes como o autocompletar de nomes de pacientes já cadastrados para preenchimento automático das informações fixas (telefone, idade, altura, grupo e comorbidades).');
printBullet('Indicadores Baseados em Evidências: Os cálculos de Classificação de IMC e Relação Cintura-Quadril seguem as diretrizes recomendadas pela Organização Mundial da Saúde (OMS) e Lipschitz.');

// 3. Página 3: Funcionalidades Clínicas
doc.addPage();
currentY = 50;

printH1('2. Funcionalidades do Aplicativo');
printParagraph(
  'O NutriCare unifica o registro de dados antropométricos e clínicos em um fluxo único de avaliação física. Cada pesagem gera um histórico cronológico organizado para o profissional de saúde.'
);

printH2('2.1. Métricas de Saúde Calculadas');

printH3('Índice de Massa Corporal (IMC)');
printParagraph(
  'Calculado pela equação: IMC = Peso (kg) / Altura² (m). O NutriCare incorpora uma ferramenta de cálculo inteligente de IMC que detecta a idade informada do paciente e seleciona automaticamente a diretriz de classificação recomendada:'
);
printBullet('Adultos (menores de 60 anos): Classificação baseada nos critérios padrão da OMS (Organização Mundial da Saúde).');
printBullet('Idosos (60 anos ou mais): Classificação baseada no critério de Lipschitz (1994) / OPAS, que tolera faixas de IMC ligeiramente superiores para compensar as alterações corporais normais da senescência.');
printParagraph(
  'Essa decisão é executada de forma autônoma em tempo real no formulário (exibindo a referência no card de prévia) e é salva na base de dados e sincronizada na planilha online sem necessidade de intervenção do profissional.'
);

const headersIMC = ['Classificação Adulto (< 60 anos)', 'Classificação Idoso (>= 60 anos)', 'Faixa de IMC'];
const rowsIMC = [
  ['Baixo Peso', 'Baixo Peso (Idoso)', 'Menor que 18.5 (Adulto) / 22.0 (Idoso)'],
  ['Eutrofia (Normal)', 'Eutrofia (Idoso)', '18.5 a 24.9 (Adulto) / 22.0 a 27.0 (Idoso)'],
  ['Sobrepeso', 'Sobrepeso (Idoso)', '25.0 a 29.9 (Adulto) / Maior que 27.0 (Idoso)'],
  ['Obesidade Grau I / II / III', 'Sobrepeso (Idoso)', 'Maior ou igual a 30.0 (Adulto)']
];
printTable(headersIMC, rowsIMC);

printH3('Relação Cintura-Quadril (RCQ)');
printParagraph(
  'Calculado pela fórmula: RCQ = Cintura (cm) / Quadril (cm). É o indicador padrão-ouro para estimar o risco de complicações cardiovasculares associadas ao acúmulo de gordura visceral. A classificação de risco varia de acordo com o sexo do paciente:'
);
printBullet('Mulher (Feminino): RCQ maior ou igual a 0.85 é classificado como Risco Cardíaco Elevado.');
printBullet('Homem (Masculino): RCQ maior ou igual a 0.90 é classificado como Risco Cardíaco Elevado.');

// 4. Página 4: Gráficos e Armazenamento
doc.addPage();
currentY = 50;

printH1('3. Gráficos Clínicos Evolutivos');
printParagraph(
  'Para aperfeiçoar a experiência clínica do profissional de nutrição e auxiliar no engajamento dos pacientes, o NutriCare integra gráficos dinâmicos alimentados pela biblioteca Chart.js.'
);
printParagraph(
  'O gráfico de evolução aparece no topo dos detalhes expandidos do paciente, dividindo-se em três abas de dados históricos ordenados cronologicamente (do mais antigo ao mais recente):'
);
printBullet('Aba Peso (kg): Exibe a evolução ponderal do paciente através de uma linha com preenchimento sombreado na cor institucional (Teal/Menta).');
printBullet('Aba Glicemia Capilar (mg/dL): Plota a linha de tendência glicêmica do paciente, filtrando registros nulos de glicose não aferida.');
printBullet('Aba Pressão Arterial (mmHg): Plota duas linhas independentes no mesmo gráfico — a linha vermelha superior representa a pressão Sistólica (Máxima) e a linha azul inferior representa a pressão Diastólica (Mínima), extraídas de formatos textuais como "120/80".');

printAlertBox(
  'Estética Premium Adaptativa',
  'Os gráficos se adaptam automaticamente ao tema ativo do aplicativo. No Tema Escuro, as grades e textos do gráfico mudam para cores claras com transparência, garantindo legibilidade e uma aparência sofisticada.'
);

printH1('4. Armazenamento e Backups');
printParagraph(
  'O banco de dados local do navegador (localStorage) grava as pesagens sob a chave ubs_patients. As pesagens nunca são eliminadas por padrão, mantendo-se em cache local e permitindo a exportação manual:'
);
printBullet('Planilha CSV Local: Gera um arquivo .csv formatado no padrão brasileiro (separado por ";", UTF-8 BOM e vírgulas decimais).');
printBullet('Backup JSON: Permite salvar em disco um arquivo .json completo que pode ser importado para restaurar ou mesclar dados em qualquer computador.');

// 5. Página 5: Integração Google Sheets
doc.addPage();
currentY = 50;

printH1('5. Integração com o Google Sheets');
printParagraph(
  'A sincronização com a nuvem é efetuada por chamadas HTTP (POST) enviadas ao serviço Google Web App gerado via Google Apps Script.'
);

printH2('5.1. Contorno de CORS local');
printParagraph(
  'Os navegadores bloqueiam requisições de rede originadas de arquivos locais (protocolo file://). O NutriCare detecta isso automaticamente e aplica o modo no-cors, permitindo o tráfego dos dados para a planilha mesmo rodando o app off-line sem servidor local.'
);

printH2('5.2. As 18 Colunas Sincronizadas');
printParagraph(
  'A planilha do Google Sheets é estruturada com cabeçalhos profissionais na primeira linha contendo as seguintes 18 colunas:'
);
printBullet('1. Data do Registro | 2. Nome | 3. Telefone | 4. Sexo | 5. Idade');
printBullet('6. Grupo / UBS | 7. Peso | 8. Data do Peso | 9. Altura | 10. IMC');
printBullet('11. Classificação IMC | 12. Cintura | 13. Quadril | 14. RCQ');
printBullet('15. Classificação RCQ | 16. Pressão Arterial | 17. Glicemia Capilar | 18. Comorbidades');

printAlertBox(
  'Suporte e Direitos',
  'Este software foi personalizado e aperfeiçoado sob demanda técnica exclusiva. Todos os direitos de propriedade intelectual da aplicação final pertencem a Leandresson Pires Reis.'
);

// 6. Página 6: Arquitetura, Tecnologias e Fluxograma
doc.addPage();
currentY = 50;

printH1('6. Arquitetura, Tecnologias e Fluxograma');
printParagraph(
  'O NutriCare foi desenvolvido para ser independente e auto-executável, não necessitando de processos de compilação complexos ou banco de dados relacional hospedado.'
);

printH2('6.1. Linguagens e Tecnologias Utilizadas');
printBullet('HTML5 Semântico: Utilizado para estruturar a página e os componentes de formulários de forma acessível e estruturada.');
printBullet('CSS3 Vanilla: Folha de estilos customizada utilizando variáveis CSS (design system), layouts responsivos (Flexbox e CSS Grid), animações de transição e suporte completo para temas Claro e Escuro.');
printBullet('JavaScript (ES6+): Linguagem principal responsável por toda a lógica de negócios, incluindo validação, persistência no localStorage, manipulação do DOM e integrações assíncronas de rede.');
printBullet('Chart.js: Biblioteca leve e de alto desempenho para renderização de gráficos em telas utilizando elemento HTML Canvas.');
printBullet('Google Apps Script (JavaScript no lado do Servidor): API para recepção e gravação em tempo real na planilha Google Sheets.');

printH2('6.2. Métodos de Integração e Armazenamento');
printParagraph(
  'A arquitetura do aplicativo baseia-se em armazenamento local reativo (localStorage) e transporte através de requisições Fetch assíncronas em modo no-cors para permitir a execução off-line direta de arquivos file:// locais sem bloqueios de segurança do navegador.'
);

// Garante que o fluxograma tem espaço vertical
checkPageBreak(250);

printH2('6.3. Fluxograma de Funcionamento');
currentY += 10;

// Funções auxiliares para desenhar caixas e setas no PDF
function drawNode(text, x, y, w, h, bgColor = '#f0fdfa', borderColor = '#0f766e', txtColor = '#0f766e') {
  doc.rect(x, y, w, h)
     .fillAndStroke(bgColor, borderColor);
  doc.fillColor(txtColor)
     .font('Helvetica-Bold')
     .fontSize(8)
     .text(text, x + 5, y + (h - 8) / 2 - 2, { width: w - 10, align: 'center' });
}

function drawArrowVertical(x, y1, y2) {
  doc.strokeColor('#0d9488')
     .lineWidth(1.5)
     .moveTo(x, y1)
     .lineTo(x, y2)
     .stroke();
     
  doc.moveTo(x - 3, y2 - 4)
     .lineTo(x, y2)
     .lineTo(x + 3, y2 - 4)
     .stroke();
}

const centerX = doc.page.width / 2; // ~297

// Desenhar elementos do fluxograma
// Passo 1
drawNode('1. ENTRADA DE DADOS: Profissional digita o Nome do paciente no formulário.', centerX - 200, currentY, 400, 20);
drawArrowVertical(centerX, currentY + 20, currentY + 35);
currentY += 35;

// Passo 2
drawNode('2. VERIFICAÇÃO AUTOMÁTICA: O sistema autocompleta Idade, Sexo, Altura se houver cadastro.', centerX - 200, currentY, 400, 20);
drawArrowVertical(centerX, currentY + 20, currentY + 35);
currentY += 35;

// Passo 3
drawNode('3. PROCESSAMENTO CLÍNICO: Calcula o IMC (OMS/Lipschitz) e a Relação Cintura-Quadril (RCQ).', centerX - 200, currentY, 400, 20);
drawArrowVertical(centerX, currentY + 20, currentY + 35);
currentY += 35;

// Passo 4
drawNode('4. GRAVAÇÃO LOCAL (localStorage): Os dados são gravados e gráficos evolutivos são recarregados.', centerX - 200, currentY, 400, 20);
drawArrowVertical(centerX, currentY + 20, currentY + 35);
currentY += 35;

// Ramificação para 5A e 5B
doc.strokeColor('#0d9488')
   .lineWidth(1.5)
   .moveTo(centerX - 100, currentY)
   .lineTo(centerX + 100, currentY)
   .stroke();

drawArrowVertical(centerX - 100, currentY, currentY + 15);
drawArrowVertical(centerX + 100, currentY, currentY + 15);
currentY += 15;

// Passo 5A & 5B
drawNode('5A. SINCRONIZAÇÃO NUVEM\nEnvio de POST (JSON) para Google Sheets', centerX - 210, currentY, 200, 30, '#e0f2fe', '#0284c7', '#0369a1');
drawNode('5B. EXPORTAÇÃO OFFLINE\nDownload manual de CSV ou JSON', centerX + 10, currentY, 200, 30, '#fef3c7', '#d97706', '#b45309');

currentY += 45;

// ----------------------------------------------------
// NUMERAÇÃO DE PÁGINAS E RODAPÉ
// ----------------------------------------------------
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  
  // Não colocar numeração na capa (página 0)
  if (i > 0) {
    doc.strokeColor('#e2e8f0')
       .lineWidth(0.5)
       .moveTo(50, doc.page.height - 45)
       .lineTo(doc.page.width - 50, doc.page.height - 45)
       .stroke();
       
    doc.fillColor(grayText)
       .font('Helvetica')
       .fontSize(8)
       .text('NutriCare - Manual do Usuário e Documentação Técnica', 50, doc.page.height - 35)
       .text(`Página ${i + 1} de ${range.count}`, doc.page.width - 120, doc.page.height - 35, { align: 'right' });
  }
}

// Finaliza o arquivo PDF
doc.end();
console.log('PDF gerado com sucesso: Manual_NutriCare.pdf');
