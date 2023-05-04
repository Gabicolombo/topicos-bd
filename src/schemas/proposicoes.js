const mongoose = require('mongoose');

const ProposicoesSchema = mongoose.Schema({
    id: { type: Number, required: true},
    uri: { type: String},
    siglaTipo: { type: String, required: true},
    codTipo: { type: Number, required: true},
    numero: { type: Number},
    ano: { type: Number},
    ementa: { type: String}
})

ProposicoesSchema.pre('save', async function(next) {
    const proposicoes = this;
    next();
});

const Proposicoes = mongoose.model('Proposicoes', ProposicoesSchema);
module.exports = Proposicoes;