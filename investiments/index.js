import express, { json } from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

const app = express();
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 100000}));
app.use(express.text({ limit: '50mb' }));

// Configuração do banco de dados
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const Investment = sequelize.define('Investment', {
  userId: DataTypes.INTEGER,
  valor: DataTypes.FLOAT,
  status: DataTypes.STRING // 'pending', 'completed'
});

// Sincronizar banco de dados
sequelize.sync();

// Configuração do ActiveMQ
const stompClient = Stomp.over(new SockJS('http://localhost:61614/stomp'));

stompClient.connect({}, () => {
  stompClient.subscribe('/topic/notifications', (message) => {
    console.log('Mensagem recebida:', message.body);
    // Processar a mensagem recebida
  });
});

// Enviar mensagem para o ActiveMQ
const sendMessage = (msg) => {
  stompClient.send('/topic/investments', {}, JSON.stringify(msg));
};

app.post('/investments', async (req, res) => {
  const { userId, valor } = req.body;

  try {
    // Criar investimento com status 'pending'
    const investment = await Investment.create({ userId, valor, status: 'pending' });

    // Enviar mensagem para o ActiveMQ para processamento
    const message = { userId, valor, investmentId: investment.id };
    sendMessage(message);
    console.log('Mensagem enviada para o tópico:', message);

    res.status(201).send('Investimento criado com status pendente');
  } catch (error) {
    res.status(500).send('Erro ao criar investimento');
  }
});

// Endpoint para receber notificações de sucesso/fracasso de transações
app.post('/investments/notifications', async (req, res) => {
  const { investmentId, status } = req.body;

  try {
    await Investment.update({ status }, { where: { id: investmentId } });
    res.status(200).send('Status do investimento atualizado');
  } catch (error) {
    res.status(500).send('Erro ao atualizar status do investimento');
  }
});

app.listen(3004, () => {
  console.log('Investments service listening on port 3004');
});
