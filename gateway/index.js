import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Configuração do CORS
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
};

app.use(cors(corsOptions));

// Configuração do proxy
const proxyOptions = {
  target: '',
  changeOrigin: true,
  logLevel: 'debug', // Habilitar logging detalhado para debugging
  onError: (err, req, res) => {
    console.error('Erro de proxy:', err);
    res.status(500).send('Erro de proxy');
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying request ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Response from ${req.method} ${req.url}: ${proxyRes.statusCode}`);
  }
};

// Definição dos proxies para cada rota
const proxies = {
  '/users': 'http://localhost:3002',
  '/auth': 'http://localhost:3001',
  '/transactions': 'http://localhost:3003',
  '/investments': 'http://localhost:3004',
  '/notifications': 'http://localhost:3005',
  '/compliance': 'http://localhost:3006'
};

// Criação dos middlewares de proxy dinamicamente
Object.keys(proxies).forEach(route => {
  app.use(route, createProxyMiddleware({
    ...proxyOptions,
    target: proxies[route],
  }));
});

// Middleware para parsear o corpo da requisição
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 100000 }));
app.use(express.text({ limit: '50mb' }));

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});