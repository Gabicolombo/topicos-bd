const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const db = require("./database/mongodb");
const path = require("path");
const dotenv = require("dotenv");
const http = require("http");
const app = express();
const cron = require("node-cron");
const server = http.createServer(app);
/*const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});*/

const userBusiness = require("./repositories/user");
const fs = require("fs");

dotenv.config({ path: path.resolve("./env/config.env") });

const port = process.env.PORT;

const routesUsuarios = require("../src/routes/user");

app.use(cors()); // Usar o middleware cors

app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(routesUsuarios);

db();

cron.schedule("* * * * *", () => {
  const rooms = Socket.rooms;
  Object.keys(rooms).forEach(async (key) => {
    if ("startDate" in rooms[key] && "hasStarted" in rooms[key]) {
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

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected!");

  userBusiness
    .getMessages()
    .then((messages) => {
      socket.emit("history", messages);
    })
    .catch((error) => {
      console.error("Erro ao obter mensagens do banco de dados:", error);
    });

  //recebimento da mensagem
  socket.on("message", (message) => {
    console.log(message);
    userBusiness.saveTextMessage(message);
    //socket.emit("history", message);
    io.emit("message", message);
  });
});
