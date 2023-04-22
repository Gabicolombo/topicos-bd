const mongoose = require('mongoose');

const DeputadosSchema = mongoose.Schema({
  id: { type: Number, required: true },
  nome: { type: String, required: true },
  siglaPartido: { type: String, required: true },
  siglaUf: { type: String, required: true },
  idLegislatura: { type: String, required: true }
});

DeputadosSchema.pre('save', async function(next){
  const deputados = this;
  next();
});

const Deputados = mongoose.model('Deputados', DeputadosSchema);
module.exports = Deputados;