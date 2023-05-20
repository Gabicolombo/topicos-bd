const Propostas = require('../schemas/propostas');
const Deputados = require('../schemas/deputados');
const axios = require('axios');

const getPropostas = async (req, res, next) => {
    try {
        let pagina = 5029;

        let dados = ['']
        while (dados.length > 0) {

            const result = await axios.get(`${process.env.API_URL}/proposicoes?ordem=ASC&ordenarPor=id&ano=2019&ano=2020&ano=2021&ano=2022&pagina=${pagina}`);

            if (result.data.dados.length == 0) return;

            for (doc of result.data.dados) {

                let author = await axios.get(`${process.env.API_URL}/proposicoes/${doc.id}/autores`);
                let id = doc.id;

                const deputados = await Promise.all(author.data.dados.map(async (deputado) => {
                    const id = deputado.uri.split('/').pop();
                    const result = await Deputados.find({ id: id });
                    if (result.length > 0) {
                        let nome = deputado.nome;
                        let tipo = deputado.tipo;
                        if (id == '' || id == undefined) id = '-';
                        if (nome == '' || nome == undefined) nome = '-';
                        if (tipo == '' || tipo == undefined) nome = '-';
                        return { id, nome, tipo };
                    }
                }));
                if (deputados.length > 0 && deputados[0] != undefined) {


                    delete doc['id'];
                    let document = {
                        ...doc,
                        idProposicao: id,
                        deputados: deputados
                    }

                    await Propostas.create(document);


                }

            }
            console.log(pagina);
            pagina++;

        }

        return res.status(200).json(dados);
    }
    catch (err) {
        console.error(err);
        next();
    }
}

module.exports = {
    getPropostas,
};