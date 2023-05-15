const express = require('express');
const router = express.Router();
const controller = require('../controllers/deputados');

router.get('/deputados', controller.getDeputados);
router.get('/getListaDeputados/:page/:quantity', controller.getListaDeputados);

module.exports = router;