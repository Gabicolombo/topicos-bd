const Proposicoes = require('../schemas/proposicoes');
const axios = require('axios');

const getProposicoesCamara = async(req, res, next) => {
    try{
        let pagina = 1
        let dados = ['']
        while(dados.length > 0) {

            const result = await axios.get(`${process.env.API_URL}/proposicoes?ordem=ASC&ordenarPor=id&ano=2019&ano=2020&ano=2021&ano=2022&pagina=${pagina}`);

            dados = result.data.dados;

            console.log(dados)

            await Proposicoes.create(dados);

            pagina++;
    
        }
    }
    catch(err){
        console.error(err);
        next();
    }
}

module.exports = getProposicoesCamara;