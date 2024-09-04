import express from 'express';
import axios from 'axios';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

const app = express();
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 100000}));
app.use(express.text({ limit: '50mb' }));

// Configuração do ActiveMQ
const stompClient = Stomp.over(new SockJS('http://localhost:61614/stomp')); // URL do seu broker ActiveMQ
const userServiceUrl = 'http://localhost:3002/users'; // URL do microsserviço de usuários

// Conectar ao ActiveMQ e configurar assinatura
stompClient.connect({}, () => {
  stompClient.subscribe('/topic/notifications', async (message) => {
    const data = JSON.parse(message.body);
    console.log('Mensagem recebida:', data);

    if (data.type === 'pix') {
      await handlePixNotification(data);
    } else {
      console.log('Tipo de mensagem desconhecido:', data.type);
    }
  });

  console.log('Aguardando mensagens no tópico: /topic/notifications');
});

async function handlePixNotification(data) {
  const { transactionId, valor, status, userId } = data;

  // Obter informações do usuário
  try {
    const userResponse = await axios.get(`${userServiceUrl}/${userId}`);
    const user = userResponse.data;

    // Verificar status da transação e enviar notificação apropriada
    if (status === 'completed') {
      await sendPixNotification(user, valor, 'recebido');
    } else if (status === 'failed') {
      await sendPixNotification(user, valor, 'enviado');
    } else {
      console.log('Status de transação desconhecido:', status);
    }
  } catch (error) {
    console.error('Erro ao obter usuário ou enviar notificação:', error);
  }
}

async function sendPixNotification(user, valor, tipoNotificacao) {
  // Mock simulando notificação
  console.log(`Notificação ${tipoNotificacao} de Pix enviada para ${user.email}. Valor: ${valor}`);
}

app.listen(3005, () => {
  console.log('Notification service listening on port 3005');
});