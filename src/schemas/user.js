const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/off.json');

const UserSchema = mongoose.Schema({
  nome: { type: String, required: true },
  usuario: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  tokens:[{
    token:{
        type:String,
        required:true
    }
  }]
})

UserSchema.methods.generateAuthToken = async function(){
  const user = this;
  const token = jwt.sign({
    _id: user.id.toString()
  }, config.secret);

  user.tokens = user.tokens.concat({token});
  await user.save();
  return token;
}

UserSchema.pre('save', async function(next) {
  const user = this;

  if(user.isModified('senha')){
    user.senha = await bcryptjs.hash(user.senha, 5);
  }

  next();
})

const User = mongoose.model('Usuários', UserSchema);
module.exports = User;