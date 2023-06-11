const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const db = require('./database/mongodb');
const path = require('path'); 
const dotenv = require('dotenv');
const http = require('http');
const { Socket } = require('./socket');
// para ir atualizando a pagina
const cron = require('node-cron');


dotenv.config({ path: path.resolve('./env/config.env')});

// configurando a porta
const port = process.env.PORT;

// configurando as rotas
const routesUsuarios = require('../src/routes/user');

// conectando
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended:false}));

// // preparando a conexão cliente e servidor
// const socket = new Socket();
// const serverHttp = http.createServer(app);
// socket.init(serverHttp);


app.use(routesUsuarios);

db();

cron.schedule('* * * * *', () => {
  const rooms = Socket.rooms;
  Object.keys(rooms).forEach(async (key) => {
    if ('startDate' in rooms[key] && 'hasStarted' in rooms[key]) {
      const { startDate, hasStarted } = rooms[key];
      if (new Date() > new Date(startDate) && hasStarted === false) {
        await Socket.startRoomTime(key);
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

