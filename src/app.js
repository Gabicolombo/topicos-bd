const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const db = require('./database/mongodb');
const path = require('path'); 
const dotenv = require('dotenv');


dotenv.config({ path: path.resolve('./env/config.env')});

// configurando a porta
const port = process.env.PORT;

// conectando
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyparser.json());

db();

app.listen(() => {
  console.log(`Listening on ${port}`);
});

