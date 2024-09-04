import express from 'express';
import { validateData } from './complianceService.js';

const app = express();
const PORT = 3006;

app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 100000}));
app.use(express.text({ limit: '50mb' }));

// Endpoint para verificar conformidade dos dados
app.post('/validate', (req, res) => {
  const data = req.body;

  // Valida se os dados estão em conformidade
  const validationResults = validateData(data);

  if (validationResults.isValid) {
    res.status(200).json({ message: 'Dados em conformidade.' });
  } else {
    res.status(400).json({ message: 'Dados não estão em conformidade.', errors: validationResults.errors });
  }
});

app.listen(PORT, () => {
  console.log(`Conformidade Service listening on port ${PORT}`);
});
