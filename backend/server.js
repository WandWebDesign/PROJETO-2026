const express = require('express');
const mysql = require('mysql2/promise'); // Importante: usar a versão com /promise
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configurar o Pool de conexão (mais eficiente e suporta await)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'BKD123!WVPwvp',
    database: 'padaria_diniz',
    waitForConnections: true,
    connectionLimit: 10
});

// Teste de conexão
db.getConnection()
    .then(() => console.log('Conectado ao MySQL (Pool) - Padaria Diniz!'))
    .catch(err => console.error('Erro ao conectar:', err));

// ==========================================
// ROTA DE CADASTRO
// ==========================================
app.post('/api/cadastro', async (req, res) => {
    try {
        const { nome, email, senha, telefone, cpf } = req.body;
        const [result] = await db.query("INSERT INTO usuarios (email, senha, tipo_usuario) VALUES (?, ?, 'cliente')", [email, senha]);
        const codigo_usuario = result.insertId;
        
        await db.query("INSERT INTO clientes (codigo_usuario, cpf, nome, telefone) VALUES (?, ?, ?, ?)", [codigo_usuario, cpf, nome, telefone]);
        res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Email já cadastrado ou erro no servidor.' });
    }
});

// ==========================================
// ROTA DE LOGIN
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const [results] = await db.query("SELECT * FROM usuarios WHERE email = ? AND senha = ?", [email, senha]);
        
        if (results.length > 0) {
            res.status(200).json({ mensagem: 'Login efetuado!', tipo_usuario: results[0].tipo_usuario });
        } else {
            res.status(401).json({ erro: 'Email ou senha incorretos.' });
        }
    } catch (err) {
        res.status(500).json({ erro: 'Erro no servidor' });
    }
});

// ==========================================
// ROTA DE CATÁLOGO (PRODUTOS)
// ==========================================
app.get('/api/produtos', async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT p.*, s.nome AS nome_setor, i.imagem_base64
            FROM produtos p
            JOIN setor s ON p.codigo_setor = s.codigo_setor
            LEFT JOIN imagens_produtos i ON p.codigo_produto = i.codigo_produto
        `);
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar catálogo." });
    }
});

// ==========================================
// ROTAS DO PAINEL ADMIN (CRUD)
// ==========================================

// ADICIONAR
app.post('/api/produtos', async (req, res) => {
    const { setor, nome, valor, preco_oferta, quantidade_estoque, is_retiravel, imagens, unidade_medida, categoria } = req.body;
    try {
        const [resSetor] = await db.query('SELECT codigo_setor FROM setor WHERE nome = ?', [setor]);
        const codigoSetor = resSetor[0].codigo_setor;

        const [resProd] = await db.query(
            'INSERT INTO produtos (codigo_setor, nome, valor, preco_oferta, is_retiravel, quantidade_estoque, unidade_medida, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [codigoSetor, nome, valor, preco_oferta || null, is_retiravel, quantidade_estoque, unidade_medida, categoria]
        );
        
        const codigoProduto = resProd.insertId;
        if (imagens) {
            for (let img of imagens) {
                await db.query('INSERT INTO imagens_produtos (codigo_produto, imagem_base64) VALUES (?, ?)', [codigoProduto, img]);
            }
        }
        res.status(201).json({ mensagem: 'Sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao salvar.' });
    }
});

// EDITAR
app.put('/api/produtos/:id', async (req, res) => {
    const { setor, nome, valor, preco_oferta, quantidade_estoque, is_retiravel, imagens, unidade_medida, categoria } = req.body;
    try {
        const [resSetor] = await db.query('SELECT codigo_setor FROM setor WHERE nome = ?', [setor]);
        await db.query('UPDATE produtos SET codigo_setor=?, nome=?, valor=?, preco_oferta=?, is_retiravel=?, quantidade_estoque=?, unidade_medida=?, categoria=? WHERE codigo_produto=?',
            [resSetor[0].codigo_setor, nome, valor, preco_oferta || null, is_retiravel, quantidade_estoque, unidade_medida, categoria, req.params.id]);

        if (imagens) {
            await db.query('DELETE FROM imagens_produtos WHERE codigo_produto = ?', [req.params.id]);
            for (let img of imagens) {
                await db.query('INSERT INTO imagens_produtos (codigo_produto, imagem_base64) VALUES (?, ?)', [req.params.id, img]);
            }
        }
        res.status(200).json({ mensagem: 'Atualizado!' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar.' });
    }
});

// EXCLUIR
app.delete('/api/produtos/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM produtos WHERE codigo_produto = ?', [req.params.id]);
        res.status(200).json({ mensagem: 'Excluído!' });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao excluir.' });
    }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));