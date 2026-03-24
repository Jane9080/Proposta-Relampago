const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (sua página HTML)
app.use(express.static('public'));

let itens = [];

app.get('/api/items', (req, res) => {
    res.json({ itens });
});

app.post('/api/items', (req, res) => {
    const { conteudo, tipo } = req.body;
    
    const novoItem = {
        id: Date.now(),
        conteudo,
        tipo: tipo || 'TEXTO',
        criadoEm: new Date().toISOString()
    };
    
    itens.push(novoItem);
    res.status(201).json(novoItem);
});

app.delete('/api/items/:id', (req, res) => {
    const id = parseInt(req.params.id);
    itens = itens.filter(item => item.id !== id);
    res.json({ mensagem: 'Item removido' });
});

app.get('/teste', (req, res) => {
    res.json({ mensagem: 'Servidor funcionando! 🎉' });
});

// Para qualquer outra rota, servir o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
