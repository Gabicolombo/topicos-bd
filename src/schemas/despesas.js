const mongoose = require('mongoose');

const DespesasSchema = mongoose.Schema({
    idDeputado: { type: Number, required: true },
    ano: { type: Number, required: true },
    mes: { type: Number, required: true },
    tipoDespesa: { type: String, required: true },
    valorLiquido: { type: Number, required: true }
})

DespesasSchema.pre('save', async function(next) {
    const despesas = this;
    next();
});

const Despesas = mongoose.model('Despesas', DespesasSchema);
module.exports = Despesas;