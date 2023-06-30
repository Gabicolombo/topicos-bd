const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const db = require('./database/mongodb');
const path = require('path'); 
const dotenv = require('dotenv');
const http = require('http');
const app = express();
const cron = require('node-cron');
const server = http.createServer(app);
/*const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});*/

const WebSocket = require('ws');
const wss = new WebSocket.Server({
  port: 2829
});

const userBusiness = require('./repositories/user');
const fs = require('fs');

dotenv.config({ path: path.resolve('./env/config.env') });

const port = process.env.PORT;

const routesUsuarios = require('../src/routes/user');

app.use(cors()); // Usar o middleware cors

app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended:false }));

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

server.listen(port, () => {
  console.log(`Listening on ${port}`);
});

 /*app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
 });
*/
//conexao com o socket
/*io.on('connection', (socket) => {
  console.log('connected');
  //recebimento da mensagem
  socket.on('message', (data) => {
    console.log(data);

    //salvando a mensagem
    userBusiness.saveTextMessage(data);

    //envio da mensagem de volta
    switch(data.tipo) {
      case "texto":
        io.emit('message', data.mensagem.texto);
        break;
      case "imagem":
        io.emit('message', data.mensagem.descricao);
        break;
    }

  })
})*/

wss.on("connection", (ws, req) => {
  console.log("New client connected!");

  //recebimento da mensagem
  ws.on('message', (message) => {
    console.log('Received: ' + JSON.parse(message));

    //salvando a mensagem
    userBusiness.saveTextMessage(JSON.parse(message));

    client.send(message)


    //envio da mensagem de volta
    //switch(data.tipo) {
    //  case "texto":
        //io.emit('message', data.mensagem.texto);
    //    break;
    //  case "imagem":
        //io.emit('message', data.mensagem.descricao);
    //    break;
    //}

  })

  ws.on('close', () => console.log('disconnected'));

  ws.onerror = function () {
    console.log("Some error occured");
  }
});