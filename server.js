require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const axios = require('axios');

const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(express.static('.'));

const RPC_ENDPOINT = process.env.RPC_ENDPOINT;
const API_KEY = process.env.API_KEY;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || '*';

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/api/withdraw', async (req, res) => {
  try {
    const { address, amount } = req.body;
    if (!address || !amount) {
      return res.status(400).json({ error: 'Endereço e valor são obrigatórios' });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    const data = {
      jsonrpc: '2.0',
      id: 1,
      method: 'sendtoaddress',
      params: [address, Number(amount)]
    };

    const response = await axios.post(RPC_ENDPOINT, data, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    });

    if (response.data.error) {
      return res.status(400).json({ error: response.data.error });
    }

    res.json({ success: true, txid: response.data.result });
  } catch (err) {
    console.error('Erro ao processar saque:', err);
    res.status(500).json({ error: 'Erro ao processar saque', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
