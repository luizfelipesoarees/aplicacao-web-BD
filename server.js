const express = require('express');
const path = require('path');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'seu_segredo_para_token'; // Altere para um segredo mais seguro

// Configuração do banco de dados
const config = {
    user: 'Luiz',
    password: 'LinkZ0903#',
    server: 'fatec-projetos.database.windows.net',
    database: 'fatec-projeto1',
    options: {
        encrypt: true // Dependendo da configuração do seu servidor SQL Server
    }
};


app.use(express.json());

// Servir arquivos estáticos da raiz do projeto
app.use(express.static(__dirname));

// Rota para atualizar a vida do herói e do vilão
app.post('/atualizarVida', async (req, res) => {
    const { vidaHeroi, vidaVilao } = req.body;

    console.log('Dados recebidos:', vidaHeroi, vidaVilao);

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
            MERGE INTO Personagens AS target
            USING (VALUES ('heroi', ${vidaHeroi}), ('vilao', ${vidaVilao})) AS source (Nome, Vida)
            ON target.Nome = source.Nome
            WHEN MATCHED THEN
                UPDATE SET Vida = source.Vida
            WHEN NOT MATCHED THEN
                INSERT (Nome, Vida) VALUES (source.Nome, source.Vida);
        `);
        res.status(200).send('Vida do herói e do vilão atualizada com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar a vida do herói e do vilão.');
    }
});

// Rota para fornecer os dados do herói e do vilão
app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Consulta para obter os dados do herói
        const heroResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'heroi'");
        const heroi = heroResult.recordset[0];

        // Consulta para obter os dados do vilão
        const villainResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'vilao'");
        const vilao = villainResult.recordset[0];

        res.json({ heroi, vilao });
    } catch (error) {
        console.error('Erro ao buscar dados do herói e do vilão:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do herói e do vilão.' });
    }
});

// Rota para inserir uma nova ação no log
app.post('/logAcao', async (req, res) => {
    const { acao, personagem } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        const query = `INSERT INTO LogAcoes (Acao, Personagem) VALUES ('${acao}', '${personagem}')`;
        await request.query(query);
        res.status(200).send('Ação registrada com sucesso.');
    } catch (error) {
        console.error('Erro ao registrar ação:', error);
        res.status(500).send('Erro ao registrar ação.');
    }
});

// Rota para buscar os registros de log de ações
app.get('/logAcoes', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        const result = await request.query("SELECT * FROM LogAcoes ORDER BY Data DESC");
        console.log(result.recordset); // Verificar o formato dos dados de log
        res.json(result.recordset);
    } catch (error) {
        console.error('Erro ao buscar registros de log de ações:', error);
        res.status(500).json({ error: 'Erro ao buscar registros de log de ações.' });
    }
});


// Rota para registro de usuário
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Verificar se o usuário já existe
        const result = await request.query(`SELECT * FROM Usuarios WHERE username = '${username}'`);
        if (result.recordset.length > 0) {
            return res.status(400).send('Usuário já existe.');
        }

        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir novo usuário
        await request.query(`INSERT INTO Usuarios (username, password) VALUES ('${username}', '${hashedPassword}')`);
        res.status(201).send('Usuário registrado com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao registrar o usuário.');
    }
});


// Rota para login de usuário
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Verificar se o usuário existe
        const result = await request.query(`SELECT * FROM Usuarios WHERE username = '${username}'`);
        if (result.recordset.length === 0) {
            return res.status(400).send('Usuário ou senha inválidos.');
        }

        const user = result.recordset[0];

        // Verificar a senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Usuário ou senha inválidos.');
        }

        // Gerar token JWT
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao fazer login.');
    }
});

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para servir o arquivo HTML de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});