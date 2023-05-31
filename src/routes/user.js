const express = require('express');
const controller = require('../controllers/user');
const auth = require('../middleware/auth');

const routes = express.Router();

routes.post('/cadastro', controller.register);
routes.post('/login', controller.login);
routes.delete('/sair', auth, controller.removeToken);

module.exports = routes;