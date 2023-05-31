const User = require('../schemas/user');
const bcryptjs = require('bcryptjs');

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



module.exports = {
  register,
  login,
  removeToken
}