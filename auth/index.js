import express from 'express';
import pkg from 'bcryptjs';
const { hash, compare } = pkg;
import pkgJson from 'jsonwebtoken';
const { sign } = pkgJson;
import { Sequelize, DataTypes } from 'sequelize';
const app = express();
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 100000}));
app.use(express.text({ limit: '50mb' }));

// Configuração do banco de dados H2
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Definir modelo User com apenas email e senha
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  senha: DataTypes.STRING
});

// Sincronizar banco de dados
sequelize.sync();

const secret = 'secret43283492839asd239849234';

// Registrar Usuário
app.post('/auth', async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    // Criptografar a senha
    const hashedPassword = await hash(senha, 10);

    // Criar o usuário
    await User.create({
      email, senha: hashedPassword
    });

    res.status(201).send('Usuário registrado com sucesso');
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).send('Erro ao registrar usuário');
  }
});

// Autenticar Usuário
app.post('/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Buscar usuário pelo email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).send('Email ou senha incorretos');
    }

    // Verificar a senha
    const isMatch = await compare(senha, user.senha);

    if (!isMatch) {
      return res.status(401).send('Email ou senha incorretos');
    }

    // Gerar o token JWT
    const token = sign({ id: user.email }, secret, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    res.status(500).send('Erro ao autenticar usuário');
  }
});

app.listen(3001, () => {
  console.log('Auth service listening on port 3001');
});
