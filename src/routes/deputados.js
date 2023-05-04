const express = require('express');
const router = express.Router();
const getDeputados = require('../controllers/deputados');

router.get('/deputados', getDeputados);

module.exports = router;