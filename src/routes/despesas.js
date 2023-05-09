const express = require('express');
const router = express.Router();
const getDespesasCamara = require('../controllers/despesas');

router.get('/getDespesasCamara', getDespesasCamara);

module.exports = router;