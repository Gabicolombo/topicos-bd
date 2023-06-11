const http = require('http');
const moment = require('moment');

const Message = require('./schemas/messages');

const botName = 'Watson'

class Socket {
  /**
   * Gerencia as salas disponíveis no socket de acordo com os registros da base de dados.
   * Cada sala corresponde a um leilão, mas os registros de leilão mantidos nesse atributo `rooms` 
   * são somente aqueles cujo campo `status` igual 0 no banco de dados. Isso significa afirmar que 
   * serão mantidos somente aqueles que ainda não iniciaram sua contagem de tempo. Os registros com status 
   * diferente de 0, indicam que o leilão ou já iniciou, ou já finalizou. Portanto, não mantê-los
   * armazenados nesse atributo significa dizer que não será possível os clientes comunicarem através
   * dessa sala, visto que ela não está mais disponível.
   */
   static rooms = {};

  /**
   * Corresponde a todas as mensagens de todas as salas no socket do servidor. Essas mensagens são 
   * armazenadas em memória.
   */
  static messages = [];

  /**
   * Corresponde a todos os usuários conectados ao socket do servidor.
   */
  static users = [];


  // Guarda uma instância da conexão com o socket
  static io;

  constructor(){}

  /**
   * Recebe uma instância de um servidor HTTP, cria a conexão do socket no servidor e
   * possibilita que o clientes se conectem com o servidor usando o socket.
   * @param {http.Server} server - A Instância de um servidor HTTP
   */
  async init(server) {
    Socket.io = require('socket.io')(server,  { cors: { origin: '*', methods: '*' } });

    Socket.users = [];
    Socket.messages = [];
    Socket.rooms = {};

    // Invoca o método `refreshRooms` para registrar as salas de acordo com registros da base de dados
    Socket.refreshRooms();
    
    /**
     * Estabelece a conexão com o socket por parte do servidor, permitindo que o cliente se conecte
     * com o servidor para emitir e escutar eventos. Isso recebe uma instância do socket representando
     * o cliente.
     */ 
    Socket.io.on('connection', (socket) => {

      /**
       * Ouve um evento emitido pelo cliente identificado por `joinRoom`. O evento recebe um
       * listener que basicamente é uma função que vai adicionar um cliente a uma determinada sala.
       * O evento recebe como parâmetros, o `data` que são os dados do cliente e o `callback` que é
       * uma função callback passada pelo cliente para que o servidor retorne as informações do cliente
       * e a respectiva sala a qual ele entrou
       * 
       * @param {{ userId: String, username: String, room: String, roomName: String }} data - Dados do cliente
       * @param {Function} callback - Função callback
       */
      socket.on('joinRoom', (data, callback) => {
          const { userId, username, room, roomName } = data;
          
          // Adiciona um cliente a uma determinada sala do socket
          socket.join(room);
          
          // Invoca o método que registra os dados do cliente e sua relação com a sala 
          const user = this.addUserToRoom(socket.id, userId, room, username);
          
          // Emite um evento identificado por `message` com uma mensagem de boas vindas ao cliente.
          socket.emit('message', formatMessage(botName, `Bem-vindo à sala: ${roomName}.`));
      
          /**
           * Emite um evento identificado por `message` para todos os clientes conectados na mesma
           * sala do cliente que acabou de se conectar, exceto para ele mesmo. Sinalizando a entrada
           * desse cliente.
           */
          socket.broadcast
            .to(user.room)
            .emit(
              'message',
              formatMessage(botName, `${user.name} entrou na sala.`)
            );

          /**
           * A função callback passada pelo cliente, que possibilita o servidor retornar as informações 
           * da sala, como usuários, mensagens, valor atual e tempo restante para que o cliente 
           * possa ter controla das informações do usuário e da sala a qual ele entrou.
           */
          callback({
            room: user.room,
            users: this.getRoomUsers(user.room),
            messages: this.getMessagesRoom(user.room),
            //currentValue: Socket.rooms[user.room] && Socket.rooms[user.room].currentValue,
            //leftTime: Socket.rooms[user.room] && Socket.rooms[user.room].currentTime
          });

          // Emite um evento identificado por `roomUsers` com a lista de usuários da sala atualizados
          Socket.io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: this.getRoomUsers(user.room)
          });
      });
      
      /**
       * Ouve um evento emitido pelo cliente identificado por `message`. O evento recebe um
       * listener que basicamente é uma função que vai recuperar do atributo `users` o usuário quem
       * emitiu baseado no id do socket. Além disso, o evento recebe um parâmetro no listener que é
       * uma mensagem emitida pelo cliente. Com isso, a mensagem (valor do leilão) será enviada para 
       * todos os usuários que estão na mesma sala que o usuário quem emitiu o evento. 
       */
      socket.on('message', (message) => {
          const user = this.getCurrentUser(socket.id);
    
          // Adiciona a mensagem ao atributo `messages` da classe Socket
          Socket.messages.push({
            room: user.room,
            name: user.name,
            text: message,
            time: moment().format('h:mm a')
          })

          /**
           * Recupera a sala do usuário do atributo `rooms` da classe Socket. Ao recuperar, 
           * verifica se o valor atual da sala (leilão) é maior que o valor emitido pelo cliente, 
           * se sim, atualiza o valor atual da sala pelo novo valor emitido pelo cliente e notifica
           * todos os usuários na mesma sala que o cliente que emitiu a mensagem com a nova mensagem 
           * e o valor atual do leilão.
           */

        
          // Emite um evento identificado por 'message' para os clientes em uma determinada sala 
          // com o conteúdo da mensagem
          Socket.io.to(user.room).emit('message', formatMessage(user.name, message, user.room));
         
      });
      
      /**
       * Ouve um evento emitido pelo cliente identificado por `disconnect`. O evento recebe um
       * listener que basicamente é uma função que vai remover o usuário do atributo `users` da 
       * classe Socket baseado no id do socket e o socket vai emitir uma mensagem aos usuários
       * que estão na sala do usuário que saiu, notificando a saída desse usuário.
       */
      socket.on('disconnected', () => {
          
          const user = this.userLeave(socket.id);
          
          if (user) {
            // Emite um evento identificado por `message` para os clientes da sala sinalizando a 
            // saída do usuário
            Socket.io.to(user.room).emit(
              'message',
              formatMessage(botName, `${user.name} deixou a sala.`)
            );
      
            // Emite um evento identificado por `roomUsers` com a lista de usuários da sala atualizados
            Socket.io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: this.getRoomUsers(user.room)
            });
          }
      });

      /**
       * Ouve um evento emitido pelo cliente identificado por `disconnect`. O evento recebe um
       * listener que basicamente é uma função que vai remover o usuário do atributo `users` da 
       * classe Socket baseado no id do socket e o socket vai emitir uma mensagem aos usuários
       * que estão na sala do usuário que saiu, notificando a saída desse usuário.
       */
      socket.on('disconnect', () => {
          
        const user = this.userLeave(socket.id);
        
        if (user) {
          // Emite um evento identificado por `message` para os clientes da sala sinalizando a 
          // saída do usuário
          Socket.io.to(user.room).emit(
            'message',
            formatMessage(botName, `${user.name} deixou a sala.`)
          );
    
          // Emite um evento identificado por `roomUsers` com a lista de usuários da sala atualizados
          Socket.io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: this.getRoomUsers(user.room)
          });
        }
      });
    });
  }


  /**
   * Adiciona um usuário ao atributo `users` da classe Socket
   * @param {String} socketId - O id do socket
   * @param {String} userId - O id do usuário
   * @param {String} roomId - O id da sala
   * @param {String} username - O nome do usuário
   * @returns {{socketId: String, id: String, room: String, name: String }} - Retorna um objeto representando o usuário adicionado
   */
  addUserToRoom(socketId, userId, roomId, username) {
    const user = { socketId, id: userId, room: roomId, name: username };

    // Verifica se já existe um usuário com o id e sala fornecidos n
    const userInRoom = Socket.users.findIndex((user) => user.id === userId && user.room === roomId);

    if (userInRoom !== -1) {
      // Caso usuário já esteja incluído na sala, atualizar seu id do socket
      Socket.users[userInRoom].socketId = socketId;
    } else {
      // Usuário ainda não armazenado, adicioná-lo no atributo `users` da classe Socket
      Socket.users.push(user);
    }

    return user;
  }

  /**
   * Obtém um usuário do atributo users da classe Socket baseado no id do socket
   * @param {String} socketId - O identificador da sala
   * @returns {{socketId: String, id: String, room: String, name: String }} - Retorna um objeto representando o usuário buscado
   */
  getCurrentUser(socketId){
    return Socket.users.find(user => user.socketId === socketId)
  }

  /**
   * Remove um usuário do atributo users da classe Socket baseado em seu id do socket, caso exista
   * @param {String} socketId - O identificador da sala
   * @returns {{socketId: String, id: String, room: String, name: String }[]} - Retorna uma lista de usuários
   */
  userLeave(socketId){
    const index = Socket.users.findIndex(user => user.socketId === socketId)
    
    if(index !== -1){
      return Socket.users.splice(index, 1)[0]
    }
  }

  /**
   * Obtém uma lista de usuários do atributo users da classe Socket baseado no id da sala
   * @param {String} roomId - O identificador da sala
   * @returns {{socketId: String, id: String, room: String, name: String }[]} - Retorna uma lista de usuários
   */
  getRoomUsers(roomId){
    return Socket.users.filter(user => user.room === roomId)
  }


  /**
   * Obtém uma lista de todas os usuários conectados ao Socket
   * @returns {{socketId: String, id: String, room: String, name: String }[]} - Retorna uma lista de usuários
   */
  getUsers() {
    return Socket.users;
  }


  /**
   * Obtém uma lista de todas as mensagens de um sala específica
   * @param {String} roomId - O identificador da sala
   * @returns {{room: String, name: String, text: String, time: String}[]} - Retorna uma lista de mensagens
   */
  getMessagesRoom(roomId) {
    const messagesRoom = Socket.messages.filter((message) => message.room === roomId);
    return messagesRoom;
  }


  /**
   * Inicia o leilão, atualizando o status na base de dados do registro do leilão para 1, indicando
   * o início.
   * @param {String} id - O id do leilão
   * @returns {Promise<void>} 
   */
  static async startRoomTime(id) {
    console.log('method: startRoomTime');
    await Produto.findByIdAndUpdate(id, { status: 1 });

    // Inicia a contagem do tempo restante do leilão
    if (Socket.rooms[id]) {
      Socket.rooms[id].hasStarted = true;
      Socket.decrementRoomTime(id);
    }
  }


  /**
   * Decrementa o tempo restante do Leilão até 0
   * @param {String} id - O id do leilão
   * @returns {Promise<void>} 
   */
  static async decrementRoomTime(id) {
    console.log('method: decrementRoomTime');
    const interval = setInterval(async () => {
      if (Socket.rooms[id]) Socket.rooms[id].currentTime--;
      if (Socket.rooms[id] && Socket.rooms[id].currentTime <= 0) {
        await Socket.finishRoomTime(id);
        clearInterval(interval);
      }
    }, 1000);
  }

  /**
    * Finaliza a contagem do tempo restante do leilao, atualiza o status do leilao para 2, 
    * indicando que o leilão foi finalizado e remove a sala do atributo rooms da classe Socket.
    * @param {String} id - O id do leilão
    * @returns {Promise<void>} 
    */
  static async finishRoomTime(id) {
    console.log('method: finishRoomTime');
    console.log('socket', Socket.rooms[id]);
    await Produto.findByIdAndUpdate(id, { 
      status: 2, 
      valorFinal: Socket.rooms[id].currentValue,
      usuarioGanhador: Socket.rooms[id].userWinner,
    });
    delete Socket.rooms[id];
  }

  /**
   * Atualiza o atributo rooms da classe Socket com os registros de leilão ainda não iniciados 
   * (status = 0)
   * @returns {Promise<void>} 
   */
  static async refreshRooms() {
    console.log('method: refreshRooms');

    // Busca leilões da base de dados que ainda não foram iniciados (status = 0)
    const products = await Produto.find({ status: 0 });

    // Atualiza o atributo rooms da Classe Socket com as informações dos leilões obtidas da base 
    // dados que ainda não foram iniciados (status == 0)
    products && products.forEach((product) => {
      // Tempo padrão de duração do leilão (600 segundos ~ 10 minutos)
      let currentTime = 300;
      
      Socket.rooms[product._id] = { 
        currentValue: product.valorInicial,
        startDate: product.dataInicio,
        currentTime,
        userWinner: '',
        hasStarted: false
      };
    });
  }
}

module.exports = { Socket }
