import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import axios from 'axios';
const app = express();

app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 100000}));
app.use(express.text({ limit: '50mb' }));

// Configuração do banco de dados H2
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const User = sequelize.define('User', {
  nome: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  empresa: DataTypes.STRING,
  urlImagem: DataTypes.STRING,
  cnpj: DataTypes.STRING,
  setor: DataTypes.STRING,
  pix: DataTypes.STRING,
  telefone: DataTypes.STRING,
  endereco: DataTypes.JSON,
  descricao: DataTypes.STRING,
  dataFundacao: DataTypes.STRING,
  numFuncionarios: DataTypes.STRING,
  redesSociais: DataTypes.JSON,
  certificacoes: DataTypes.STRING,
  tipoEmpresa: DataTypes.STRING,
  nomeRepresentante: DataTypes.STRING,
  documentoIdentidadeRepresentante: DataTypes.STRING,
  referenciasComerciais: DataTypes.STRING,
  tipo: DataTypes.STRING // 'emp' ou 'inv'
});

// Sincronizar banco de dados
sequelize.sync();

const complianceServiceUrl = 'http://localhost:3006/validate';
const authServiceUrl = 'http://localhost:3001/auth';

// Criar ou Atualizar Usuário
app.post('/users', async (req, res) => {  
  const {
    id, nome, email, senha, empresa, urlImagem, cnpj, setor, pix, telefone, endereco,
    descricao, dataFundacao, numFuncionarios, redesSociais, certificacoes, tipoEmpresa,
    nomeRepresentante, documentoIdentidadeRepresentante, referenciasComerciais, tipo
  } = req.body;

  // Chamar o serviço de conformidade
  try {
    const response = await axios.post(complianceServiceUrl, {
      type: 'user',
      data: { nome, email, senha, empresa, urlImagem, cnpj, setor, pix, telefone, endereco, descricao, dataFundacao, numFuncionarios, redesSociais, certificacoes, tipoEmpresa, nomeRepresentante, documentoIdentidadeRepresentante, referenciasComerciais, tipo }
    });

    if (response.data.message === 'Dados em conformidade.') {
      // Criar ou atualizar o usuário sem senha
      await User.upsert({
        id, nome, email, empresa, urlImagem, cnpj, setor, pix, telefone, endereco,
        descricao, dataFundacao, numFuncionarios, redesSociais, certificacoes, tipoEmpresa,
        nomeRepresentante, documentoIdentidadeRepresentante, referenciasComerciais, tipo
      });

      // Criar a senha após a criação do usuário
      if (senha) {
        try {
          await axios.post(authServiceUrl, { email, senha });
          res.status(201).send('Usuário criado e senha registrada');
        } catch (error) {
          res.status(500).send('Erro ao registrar senha');
        }
      } else {
        res.status(201).send('Usuário criado');
      }
    } else {
      res.status(400).send('Dados não estão em conformidade.');
    }
  } catch (error) {
    res.status(500).send('Erro ao validar conformidade');
  }
});

// Obter Usuário
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send('Usuário não encontrado');
    }
  } catch (error) {
    res.status(500).send('Erro ao obter usuário');
  }
});

app.listen(3002, () => {
  console.log('User service listening on port 3002');
});
