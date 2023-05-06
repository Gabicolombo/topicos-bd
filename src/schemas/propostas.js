const mongoose = require('mongoose');

const PropostasSchema = mongoose.Schema({
  idProposicao: { type: 'string', required: true, unique: true },
  deputados: [{
    id: { 
      type: 'string', 
      required: true, 
    },
    nome: { type: 'string', required: true },
  }],
  ementa: { type: 'string'},
  ano: { type: Number },
  uri: { type: String },
  siglaTipo: { type: String},
  codTipo: { type: Number},
  numero: { type: Number },
})

PropostasSchema.pre('save', async function(next){
  next();
});

const Propostas = mongoose.model('Propostas', PropostasSchema);
module.exports = Propostas;