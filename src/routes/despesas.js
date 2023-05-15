const express = require('express');
const router = express.Router();
const controller = require('../controllers/despesas');

router.get('/getDespesasCamara', controller.getDespesasCamara);
router.get('/getDespesasPorEstado', controller.getDespesasPorEstado);
router.get('/getDespesasPorPartido', controller.getDespesasPorPartido);

module.exports = router;