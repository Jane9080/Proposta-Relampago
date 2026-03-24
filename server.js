const express = require('express');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const LEADS_FILE = path.join(__dirname, 'data', 'leads.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
}

// Rota para salvar leads
app.post('/api/leads', (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Email inválido' });
    }

    let leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));

    if (leads.some(lead => lead.email === email)) {
        return res.status(409).json({ message: 'Email já cadastrado' });
    }

    leads.push({
        email,
        data_cadastro: new Date().toISOString()
    });

    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

    res.status(201).json({ message: 'Email cadastrado com sucesso!' });
});

// Rota para gerar contrato PDF
app.post('/api/gerar-contrato', (req, res) => {
    const { nomeContratante, nomeContratado, servico, valor, prazo, formaPagamento } = req.body;

    if (!nomeContratante || !nomeContratado || !servico || !valor || !prazo || !formaPagamento) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="contrato_proposta.pdf"');

    doc.pipe(res);

    // Título
    doc.font('Helvetica-Bold').fontSize(16).text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Partes
    doc.font('Helvetica-Bold').fontSize(11).text('1. PARTES CONTRATANTES');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Contratante (Cliente): ${nomeContratante}`, { indent: 20 });
    doc.text(`Contratado (Prestador): ${nomeContratado}`, { indent: 20 });
    doc.moveDown(0.5);

    // Objeto
    doc.font('Helvetica-Bold').fontSize(11).text('2. OBJETO DO CONTRATO');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Serviço a ser prestado: ${servico}`, { indent: 20 });
    doc.moveDown(0.5);

    // Valor
    doc.font('Helvetica-Bold').fontSize(11).text('3. VALOR E FORMA DE PAGAMENTO');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Valor total: R$ ${parseFloat(valor).toFixed(2)}`, { indent: 20 });
    doc.text(`Forma de pagamento: ${formaPagamento}`, { indent: 20 });
    doc.moveDown(0.5);

    // Prazo
    doc.font('Helvetica-Bold').fontSize(11).text('4. PRAZO DE EXECUÇÃO');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Prazo para entrega: ${prazo} dia(s)`, { indent: 20 });
    doc.moveDown(0.5);

    // Cláusulas
    doc.font('Helvetica-Bold').fontSize(11).text('5. CLÁUSULAS GERAIS');
    doc.font('Helvetica').fontSize(9);
    doc.text('5.1 O Contratado compromete-se a executar o serviço com qualidade e dentro do prazo estabelecido.', { indent: 20 });
    doc.text('5.2 O Contratante compromete-se a efetuar o pagamento conforme a forma e prazo acordados.', { indent: 20 });
    doc.text('5.3 Qualquer alteração no escopo do serviço deve ser acordada por escrito entre as partes.', { indent: 20 });
    doc.moveDown(0.5);

    // Rescisão
    doc.font('Helvetica-Bold').fontSize(11).text('6. RESCISÃO');
    doc.font('Helvetica').fontSize(9);
    doc.text('Este contrato pode ser rescindido por qualquer uma das partes com notificação prévia de 7 dias, salvo em caso de descumprimento grave.', { indent: 20 });
    doc.moveDown(0.5);

    // Confidencialidade
    doc.font('Helvetica-Bold').fontSize(11).text('7. CONFIDENCIALIDADE');
    doc.font('Helvetica').fontSize(9);
    doc.text('As partes se comprometem a manter confidencial qualquer informação sensível compartilhada durante a execução do serviço.', { indent: 20 });
    doc.moveDown(1);

    // Data
    const hoje = new Date();
    const dataFormatada = `${hoje.getDate()}/${hoje.getMonth() + 1}/${hoje.getFullYear()}`;
    doc.font('Helvetica').fontSize(10).text(`Data: ${dataFormatada}`, { align: 'center' });
    doc.moveDown(2);

    // Assinaturas
    doc.font('Helvetica-Bold').fontSize(10).text('ASSINATURAS', { align: 'center' });
    doc.moveDown(2);

    doc.moveTo(80, doc.y).lineTo(280, doc.y).stroke();
    doc.font('Helvetica').fontSize(9).text(nomeContratante, 80, doc.y + 5, { align: 'center' });
    doc.text('(Contratante)', 80, doc.y + 5, { align: 'center' });

    doc.moveTo(320, doc.y - 40).lineTo(520, doc.y - 40).stroke();
    doc.font('Helvetica').fontSize(9).text(nomeContratado, 320, doc.y - 35, { align: 'center' });
    doc.text('(Contratado)', 320, doc.y - 35, { align: 'center' });

    doc.end();
});

// Rota para listar leads (admin)
app.get('/api/leads', (req, res) => {
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    res.json(leads);
});

// Rota de teste
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`✅ PropostaRelâmpago rodando em http://localhost:${PORT}`);
});
