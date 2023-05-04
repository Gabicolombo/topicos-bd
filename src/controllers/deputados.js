const Deputados = require('../schemas/deputados');
const axios = require('axios');

const getDeputados = async(req, res, next) => {
  try{

    if(!await Deputados.findOne({})){
      const result = await axios.get(`${process.env.API_URL}/deputados?dataInicio=2018-01-01&dataFim=2022-12-31&ordem=ASC&ordenarPor=nome`);
    
      await Deputados.create(result.data.dados);

      return res.status(200).json(result.data.dados);
    }
    return res.status(200).send('Já existe documentos no banco de dados');

    
  }catch(err){
    console.error(err);
    next()
  }
}

module.exports = getDeputados;