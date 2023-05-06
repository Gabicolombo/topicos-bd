const express = require('express');

const controller = require('../controllers/propostas');

const router = express.Router();

router.get('/getAutor', controller.getPropostas);

module.exports = router;

