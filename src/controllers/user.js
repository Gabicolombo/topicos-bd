const User = require('../schemas/user');
const Message = require('../schemas/messages');
const bcryptjs = require('bcryptjs');
const formidable = require('formidable');
const fs = require('fs');

const register = async(req, res, next) => {
  try{

    const { nome, usuario, senha } = req.body;

    if(await User.findOne({usuario: usuario})) return res.status(409).json({message: 'Esse usuário já está sendo utilizado'});

    await User.create(req.body);

    res.status(200).json({message: 'Usuário cadastrado com sucesso'});

  }catch(err){
    console.error(err);
    next();
  }
}

const login = async(req, res, next) => {
  try{

    const { usuario, senha } = req.body;

    const user = await User.findOne({ usuario: usuario }).select('+senha');

    if(!user) return res.status(404).json({message: 'Usuário não encontrado'});

    let result = await bcryptjs.compare(senha, user.senha);

    if(!result) return res.status(400).json({message: 'Senha incorreta'});

    const token = await user.generateAuthToken();

    return res.status(200).json({user, token});


  }catch(err){
    console.error(err);
    next();
  }
}

const removeToken = async(req, res, next) => {
  try{

    const updateUser = await User.findOneAndUpdate(
      { usuario: req.user.usuario },
      { $set: {
        tokens: []
      }}
    );

    return res.status(200).json({message: 'Volte sempre'});

  }catch(err){
    console.error(err);
    next();
  }
}

const saveMessage = async(req, res, next) => {
  try{
    
    let message = '';
    if (req.body.tipo === 'texto'){
      message = await Message({
        usuario: req.user.usuario,
        data: '04/06/2023',
        tipo: req.body.tipo,
        mensagem: {
          texto: req.body.texto
        }
      });
    }else if(req.body.tipo === 'imagem') {
    
      const imageData = fs.readFileSync(req.files[0].path);
      message = await Message({
        usuario: req.user.usuario,
        data: '04/06/2023',
        tipo: req.body.tipo,
        mensagem: {
          imagem: imageData,
          descricao: req.body.descricao,
          tipoImagem: req.files[0].mimetype,
          tamanho: req.files[0].size
        }
      });
    }
    else if(req.body.tipo === 'video'){
      const videoData = fs.readFileSync(req.files[0].path);
    
      message = await Message({
        usuario: req.user.usuario,
        data: '04/06/2023',
        tipo: req.body.tipo,
        mensagem: {
          video: videoData,
          descricao: req.body.descricao,
          tipoVideo: req.files[0].mimetype,

        }
      });
    }else {
      message = await Message({
        usuario: req.user.usuario,
        data: '04/06/2023',
        tipo: req.body.tipo,
        mensagem: {
          descricao: req.body.descricao,
          opcoes: req.body.opcoes
        }
      });
      
    }

    await message.save();
    return res.status(200).send(message);

  }catch(err){
    console.error(err);
    next();
  }
}

const getImage = async(req, res, next) => {
  try{
    const content = await Message.findOne({tipo: 'imagem'});
    const binaryData = content.mensagem.imagem;
    
    const base64Image = binaryData.toString('base64');

    
    const imgTag = `<img src="data:image/jpeg;base64,${base64Image}" alt="Imagem">`;

    res.status(200).send(imgTag);

  }catch(err){
    console.error(err);
    next();
  }
}

const getVideo = async(req, res, next) => {
  try{
    const content = await Message.findOne({tipo: 'video'});
    const binaryData = content.mensagem.video;
    
    const base64Video = binaryData.toString('base64');

    
    const imgTag = `<video src="data:video/mp4;base64,${base64Video}" width="640" height="360" controls>
  </video>`;

    res.status(200).send(imgTag);

  }catch(err){
    console.error(err);
    next();
  }
}



module.exports = {
  register,
  login,
  removeToken,
  saveMessage,
  getImage,
  getVideo
}