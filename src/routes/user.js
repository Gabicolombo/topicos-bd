const express = require('express');
const controller = require('../controllers/user');
const auth = require('../middleware/auth');

const multer = require('multer');

const upload = multer({ dest: '../uploads/' });

const routes = express.Router();

routes.post('/cadastro', controller.register);
routes.post('/login', controller.login);
routes.delete('/sair', auth, controller.removeToken);

//upload.single('imagem')
routes.post('/messages', auth, upload.single('imagem'), controller.saveMessage);
routes.get('/messages', controller.getImage);
module.exports = routes;