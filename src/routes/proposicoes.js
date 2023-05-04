const express = require('express');
const router = express.Router();
const getProposicoes = require('../controllers/proposicoes');

router.get('/getProposicoesCamara', getProposicoes);

module.exports = router;

