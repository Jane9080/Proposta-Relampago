/**
 * PropostaRelâmpago - Servidor Principal
 * Gerador de contratos profissionais para freelancers e MEIs
 * 
 * Funcionalidades:
 * - Servir arquivos estáticos (HTML, CSS, JS)
 * - Rota para gerar PDF de contrato
 * - Rota para salvar leads (email)
 * - Rota para enviar email com contrato
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const cors = require('cors');

// Inicializar aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Arquivo para armazenar leads (JSON simples)
const LEADS_FILE = path.join(__dirname, 'data', 'leads.json');

// Garantir que o diretório 'data' existe
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Inicializar arquivo de leads se não existir
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
}

/**
 * ROTA: GET / (Landing Page)
 * Serve a página inicial do PropostaRelâmpago
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * ROTA: POST /api/leads
 * Captura email do usuário para a lista de espera
 * Body esperado: { email: "usuario@email.com" }
 */
app.post('/api/leads', (req, res) => {
  try {
    const { email } = req.body;

    // Validação básica
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Ler leads existentes
    let leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));

    // Verificar se email já existe
    if (leads.some(lead => lead.email === email)) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    // Adicionar novo lead
    leads.push({
      email,
      data_cadastro: new Date().toISOString()
    });

    // Salvar leads
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

    res.status(201).json({ message: 'Email cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar lead:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

/**
 * ROTA: POST /api/gerar-contrato
 * Gera um PDF com o contrato preenchido
 * Body esperado: {
 *   nomeContratante: string,
 *   nomeContratado: string,
 *   servico: string,
 *   valor: number,
 *   prazo: number,
 *   formaPagamento: string
 * }
 */
app.post('/api/gerar-contrato', (req, res) => {
  try {
    const { nomeContratante, nomeContratado, servico, valor, prazo, formaPagamento } = req.body;

    // Validação básica
    if (!nomeContratante || !nomeContratado || !servico || !valor || !prazo || !formaPagamento) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Criar documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Configurar resposta como PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="contrato_proposta.pdf"');

    // Pipe do PDF para a resposta
    doc.pipe(res);

    // Adicionar conteúdo ao PDF
    adicionarConteudoContrato(doc, {
      nomeContratante,
      nomeContratado,
      servico,
      valor,
      prazo,
      formaPagamento
    });

    // Finalizar documento
    doc.end();

  } catch (error) {
    console.error('Erro ao gerar contrato:', error);
    res.status(500).json({ error: 'Erro ao gerar contrato' });
  }
});

/**
 * Função auxiliar para adicionar conteúdo ao PDF
 * Cria um contrato profissional com todas as cláusulas
 */
function adicionarConteudoContrato(doc, dados) {
  const { nomeContratante, nomeContratado, servico, valor, prazo, formaPagamento } = dados;

  // Configurações de fonte
  const fontePrincipal = 'Helvetica';
  const fonteBold = 'Helvetica-Bold';

  // Título
  doc.font(fonteBold).fontSize(16).text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', { align: 'center' });
  doc.moveDown(0.5);

  // Linha separadora
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(1);

  // Partes do contrato
  doc.font(fonteBold).fontSize(11).text('1. PARTES CONTRATANTES');
  doc.font(fontePrincipal).fontSize(10);
  doc.text(`Contratante (Cliente): ${nomeContratante}`, { indent: 20 });
  doc.text(`Contratado (Prestador): ${nomeContratado}`, { indent: 20 });
  doc.moveDown(0.5);

  // Objeto do contrato
  doc.font(fonteBold).fontSize(11).text('2. OBJETO DO CONTRATO');
  doc.font(fontePrincipal).fontSize(10);
  doc.text(`Serviço a ser prestado: ${servico}`, { indent: 20 });
  doc.moveDown(0.5);

  // Valor
  doc.font(fonteBold).fontSize(11).text('3. VALOR E FORMA DE PAGAMENTO');
  doc.font(fontePrincipal).fontSize(10);
  doc.text(`Valor total: R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`, { indent: 20 });
  doc.text(`Forma de pagamento: ${formaPagamento}`, { indent: 20 });
  doc.moveDown(0.5);

  // Prazo
  doc.font(fonteBold).fontSize(11).text('4. PRAZO DE EXECUÇÃO');
  doc.font(fontePrincipal).fontSize(10);
  doc.text(`Prazo para entrega: ${prazo} dia(s)`, { indent: 20 });
  doc.moveDown(0.5);

  // Cláusulas gerais
  doc.font(fonteBold).fontSize(11).text('5. CLÁUSULAS GERAIS');
  doc.font(fontePrincipal).fontSize(9);
  doc.text('5.1 O Contratado compromete-se a executar o serviço com qualidade e dentro do prazo estabelecido.', { indent: 20 });
  doc.text('5.2 O Contratante compromete-se a efetuar o pagamento conforme a forma e prazo acordados.', { indent: 20 });
  doc.text('5.3 Qualquer alteração no escopo do serviço deve ser acordada por escrito entre as partes.', { indent: 20 });
  doc.moveDown(0.5);

  // Rescisão
  doc.font(fonteBold).fontSize(11).text('6. RESCISÃO');
  doc.font(fontePrincipal).fontSize(9);
  doc.text('Este contrato pode ser rescindido por qualquer uma das partes com notificação prévia de 7 dias, salvo em caso de descumprimento grave.', { indent: 20 });
  doc.moveDown(0.5);

  // Confidencialidade
  doc.font(fonteBold).fontSize(11).text('7. CONFIDENCIALIDADE');
  doc.font(fontePrincipal).fontSize(9);
  doc.text('As partes se comprometem a manter confidencial qualquer informação sensível compartilhada durante a execução do serviço.', { indent: 20 });
  doc.moveDown(1);

  // Data e local
  const hoje = new Date();
  const dataFormatada = `${hoje.getDate()}/${hoje.getMonth() + 1}/${hoje.getFullYear()}`;
  doc.font(fontePrincipal).fontSize(10);
  doc.text(`Data: ${dataFormatada}`, { align: 'center' });
  doc.moveDown(2);

  // Assinaturas
  doc.font(fonteBold).fontSize(10).text('ASSINATURAS', { align: 'center' });
  doc.moveDown(2);

  // Linha para assinatura do contratante
  doc.moveTo(80, doc.y).lineTo(280, doc.y).stroke();
  doc.font(fontePrincipal).fontSize(9).text(nomeContratante, 80, doc.y + 5, { align: 'center' });
  doc.text('(Contratante)', 80, doc.y + 5, { align: 'center' });

  // Linha para assinatura do contratado
  doc.moveTo(320, doc.y - 40).lineTo(520, doc.y - 40).stroke();
  doc.font(fontePrincipal).fontSize(9).text(nomeContratado, 320, doc.y - 35, { align: 'center' });
  doc.text('(Contratado)', 320, doc.y - 35, { align: 'center' });
}

/**
 * ROTA: GET /api/leads
 * Retorna lista de leads cadastrados (apenas para administração)
 */
app.get('/api/leads', (req, res) => {
  try {
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    res.json(leads);
  } catch (error) {
    console.error('Erro ao ler leads:', error);
    res.status(500).json({ error: 'Erro ao ler leads' });
  }
});

/**
 * Iniciar servidor
 */

// Rota para salvar leads (emails)
app.post('/api/leads', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    const leadsFile = path.join(__dirname, 'leads.json');
    let leads = [];
    
    if (fs.existsSync(leadsFile)) {
        leads = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
    }
    
    // Verificar se já existe
    if (!leads.includes(email)) {
        leads.push(email);
        fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
        console.log(`📧 Novo lead: ${email}`);
    }
    
    res.json({ success: true, message: 'Email salvo com sucesso!' });
});


app.listen(PORT, () => {
  console.log(`\n✅ PropostaRelâmpago está rodando em http://localhost:${PORT}`);
  console.log(`📄 Acesse a landing page em http://localhost:${PORT}`);
  console.log(`\n💡 Pressione Ctrl+C para parar o servidor\n`);
});
