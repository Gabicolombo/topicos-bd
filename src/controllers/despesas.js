const Despesas = require('../schemas/despesas');
const Deputados = require('../schemas/deputados');
const axios = require('axios');

const getDespesasCamara = async(req, res, next) => {
    try {

        //Busca os deputados e percorre cada deputado encontrado no banco
        let deputados = await await Deputados.find({})   
        for(let i = 0; i < deputados.length; i++) {
            const deputado = deputados[i];

            let pagina = 1
            let data = ['']
            //Percorre todas as paginas de despesas do deputado atual
            while(data.length > 0) {
                console.log(deputado.id + " " + deputado.nome + " " + pagina)
                
                const result = await axios.get(`${process.env.API_URL}/deputados/${deputado.id}/despesas?pagina=${pagina}&ordem=ASC&ordenarPor=ano`);
                console.log(`${process.env.API_URL}/deputados/${deputado.id}/despesas?pagina=${pagina}&ordem=ASC&ordenarPor=ano`);
                data = result.data.dados;
                console.log(data)

                data.forEach(obj => {
                    obj.idDeputado = deputado.id;
                });

                await Despesas.create(data);
                
                pagina++;
            }
        }  
    }
    catch(err) {
        console.error(err);
        next();
    }
}

module.exports = getDespesasCamara;