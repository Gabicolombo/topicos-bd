const Propostas = require('../schemas/propostas');
const axios = require('axios');

const getPropostas = async (req, res, next) => {
    try {
        let pagina = 1812;
        let dados = ['']
        while (dados.length > 0) {

            const result = await axios.get(`${process.env.API_URL}/proposicoes?ordem=ASC&ordenarPor=id&ano=2019&ano=2020&ano=2021&ano=2022&pagina=${pagina}`);

            if (result.data.dados.length == 0) return;

            for (doc of result.data.dados) {

                let author = await axios.get(`${process.env.API_URL}/proposicoes/${doc.id}/autores`);
                let id = doc.id;

                const deputados = author.data.dados.map((deputado) => {
                    let id = deputado.uri.split('/').pop();
                    let nome = deputado.nome;
                    if (id == '' || id == undefined) id = '-';
                    if (nome == '' || id == undefined) nome = '-';
                    return { id, nome };
                });

                delete doc['id'];
                let document = {
                    ...doc,
                    idProposicao: id,
                    deputados: deputados
                }

                await Propostas.create(document);
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

const propostas = async (req, res, next) => {
    try {
        const limit_value = +req.query.limit;
        const skip_value = +req.query.skip;
       
        const result = await Propostas.aggregate([
            {
                $project: {
                    idProposicao: 1,
                    ementa: 1,
                    ano: 1,
                    // quantidadeDeputados: { $size: '$deputados' },
                    _id: 0,
                    aux: {
                        $filter: {
                            input: "$deputados",
                            as: "d",
                            cond: {
                                $ne: [
                                    "$$d",
                                    null
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    quantidadeDeputados: { $size: '$aux' },
                    _id: 0,
                    idProposicao: 1,
                    ementa: 1,
                    ano: 1,
                }
            },
            { $sort: {idProposicao: 1}},
            { $skip: skip_value},
            { $limit: limit_value},            
        ]).allowDiskUse(true);

        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        next();
    }
}

module.exports = {
    getPropostas,
    propostas,
};