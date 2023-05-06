const mongoose = require(`mongoose`);

const AutoresSchema = mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  nome: { type: String, required: true },
  tipo: { type: String, required: true },
});

AutoresSchema.pre('save', async function (next) {
  next();
});

const Autores = mongoose.model('Propostas', AutoresSchema);
module.exports = Autores;