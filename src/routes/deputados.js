const express = require('express');
const router = express.Router();
const getDeputados = require('../controllers/deputados');

router.get('/deputados', getDeputados);

console.log(process.env.API_URL);

module.exports = router;