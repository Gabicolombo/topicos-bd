const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const db = require('./database/mongodb');
const path = require('path'); 
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve('./env/config.env')});

// configurando a porta
const port = process.env.PORT;

// configurando as rotas
const routesDeputados = require('../src/routes/deputados');
const routeProposicoes = require('../src/routes/proposicoes');
const routePropostas = require('../src/routes/propostas');
const routeDespesas = require('../src/routes/despesas');

// conectando
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyparser.json());

app.use(routesDeputados);
app.use(routeProposicoes);
app.use(routePropostas);
app.use(routeDespesas);

db();

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

