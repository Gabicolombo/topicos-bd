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
routes.post('/messages', auth, upload.any(), controller.saveMessage);
routes.get('/messages/images', controller.getImage);
routes.get('/messages/videos', controller.getVideo);
module.exports = routes;