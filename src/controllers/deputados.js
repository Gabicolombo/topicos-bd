const Deputados = require('../schemas/deputados');
const axios = require('axios');

const getDeputados = async(req, res, next) => {
  try{

    if(!await Deputados.findOne({})){
      const result = await axios.get(`${process.env.API_URL}/deputados?idLegislatura=56&ordem=ASC&ordenarPor=nome`);
    
      await Deputados.create(result.data.dados);

      return res.status(200).json(result.data.dados);
    }
    return res.status(200).send('Já existe documentos no banco de dados');

    
  }catch(err){
    console.error(err);
    next()
  }
}

const getListaDeputados = async(req, res, next) => {
  try {
    const result = await Deputados.find().skip((req.params.page-1)*req.params.quantity).limit(req.params.quantity);
    return res.status(200).send(result);
  }
  catch(err) {
    console.error(err);
    next();
  }
}

const getDeputado = async(req, res, next) => {
  try{
   
    const id = req.params.id;
   
    const result = await Deputados.find({id: id});
  
    if(result.length == 0) return res.status(404).json({message: 'Não foi encontrado esse deputado'});

    return res.status(200).json(result);

  }catch(err){
    console.error(err);
    next();
  }
}

module.exports = {
  getDeputados,
  getListaDeputados,
  getDeputado
};