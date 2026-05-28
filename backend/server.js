const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Permite receber dados em JSON

// Configurar a conexão com o MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // seu usuário do banco (geralmente root)
    password: 'BKD123!WVPwvp', // sua senha do banco
    database: 'padaria_diniz'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao MySQL - Padaria Diniz!');
});

// ==========================================
// ROTA DE CADASTRO
// ==========================================
app.post('/api/cadastro', (req, res) => {
    // Pega os dados que vieram do front-end
    const { nome, email, senha, telefone, cpf } = req.body;

    // 1. Inserir na tabela 'usuarios'
    const sqlUsuario = "INSERT INTO usuarios (email, senha, tipo_usuario) VALUES (?, ?, 'cliente')";
    
    db.query(sqlUsuario, [email, senha], (err, result) => {
        if (err) {
            console.error("Erro ao criar usuário:", err);
            return res.status(500).json({ erro: 'Email já cadastrado ou erro no servidor.' });
        }

        const codigo_usuario = result.insertId; // Pega o ID gerado automaticamente

        // 2. Inserir na tabela 'clientes' vinculando ao codigo_usuario
        const sqlCliente = "INSERT INTO clientes (codigo_usuario, cpf, nome, telefone) VALUES (?, ?, ?, ?)";
        
        db.query(sqlCliente, [codigo_usuario, cpf, nome, telefone], (err, result) => {
            if (err) {
                console.error("Erro ao criar cliente:", err);
                return res.status(500).json({ erro: 'Erro ao salvar dados do cliente.' });
            }
            res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!' });
        });
    });
});

// ==========================================
// ROTA DE LOGIN
// ==========================================
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    // Busca o usuário com aquele email e senha
    const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    
    db.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor' });

        if (results.length > 0) {
            // Usuário encontrado!
            const usuario = results[0];
            res.status(200).json({ 
                mensagem: 'Login efetuado com sucesso!',
                tipo_usuario: usuario.tipo_usuario 
            });
        } else {
            // Nenhum usuário com essa combinação
            res.status(401).json({ erro: 'Email ou senha incorretos.' });
        }
    });
});

// Iniciar o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});