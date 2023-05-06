const mongoose = require(`mongoose`);

const AutoresSchema = mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  uri: { type: String },
  siglaTipo: { type: String, required: true },
  codTipo: { type: Number, required: true },
  numero: { type: Number },
  ano: { type: Number },
  ementa: { type: String },
  deputado: [{
    id: { type: 'string', required: true, unique: true },
    nome: { type: 'string', required: true },
  }],
});

AutoresSchema.pre('save', async function (next) {
  next();
});

const Autores = mongoose.model('Propostas', AutoresSchema);
module.exports = Autores;