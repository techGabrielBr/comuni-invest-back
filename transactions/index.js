import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

const app = express();
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 100000}));
app.use(express.text({ limit: '50mb' }));

// Configuração do banco de dados H2
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const Transaction = sequelize.define('Transaction', {
  userId: DataTypes.INTEGER,
  valor: DataTypes.FLOAT,
  status: DataTypes.STRING // 'pending', 'completed', 'failed'
});

// Sincronizar banco de dados
sequelize.sync();

// Configuração do ActiveMQ
const stompClient = Stomp.over(new SockJS('http://localhost:61614/stomp')); // URL do seu broker ActiveMQ
const transactionQueue = '/queue/transactions'; // Nome da fila do ActiveMQ

stompClient.connect({}, () => {
  console.log('Conectado ao ActiveMQ');
});

app.post('/transactions', async (req, res) => {
  const { userId, valor } = req.body;

  try {
    // Criar a transação com status 'pending'
    const transaction = await Transaction.create({ userId, valor, status: 'pending' });

    // Enviar mensagem para o ActiveMQ para processamento
    stompClient.send(transactionQueue, {}, JSON.stringify({
      transactionId: transaction.id,
      valor,
      type: 'pix' // Incluir tipo da transação
    }));

    console.log('Mensagem enviada para a fila:', {
      transactionId: transaction.id,
      valor,
      type: 'pix'
    });

    res.status(201).send('Transação criada');
  } catch (error) {
    res.status(500).send('Erro ao criar transação');
  }
});

// Endpoint para receber notificações de sucesso/fracasso
app.post('/transactions/notifications', async (req, res) => {
  const { transactionId, status } = req.body;

  try {
    await Transaction.update({ status }, { where: { id: transactionId } });
    res.status(200).send('Status da transação atualizado');
  } catch (error) {
    res.status(500).send('Erro ao atualizar status da transação');
  }
});

app.listen(3003, () => {
  console.log('Transactions service listening on port 3003');
});
