const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.String,
    ref: 'Usuários'
  },
  data: { type: String, required: true },
  tipo: { type: String },
  mensagem: {
    type: Object,
    required: true,
    validate: function (data) {
      if (this.tipo === 'texto') {
        return typeof this.mensagem.texto === 'string';
      } else if (this.tipo === 'imagem') {
        /*
          imagem, descricao, tipo de imagem, tamanho
        */

        return ({
          imagem: { type: Buffer, required: true },
          descricao: { type: String, required: true },
          tipoImagem: { type: String, required: true },
          tamanho: { type: Number, required: true }
        })

      } else if (this.tipo === 'video') {
        /*
          video, descricao, tipo de video, duração
        */
        return ({
          video: { type: Buffer, required: true },
          descricao: { type: String, required: true },
          tipoVideo: { type: String, required: true },
          duracao: { type: Number, required: true }
        })

      } else {
        /*
          alternativas + usuarios,
          data de criação
          data de encerramento
        */

      }

    }
  }
})

const Message = mongoose.model('Messages', messageSchema);
module.exports = Message;