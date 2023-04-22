const Deputados = require('../schemas/deputados');
const axios = require('axios');

const getDeputados = async(req, res, next) => {
  try{

    const result = await axios.get(`${process.env.API_URL}/deputados?ordem=ASC&ordenarPor=nome`);
    
    await Deputados.create(result.data.dados);

    return res.json(result.data.dados);
  }catch(err){
    console.error(err);
    next()
  }
}

module.exports = getDeputados;