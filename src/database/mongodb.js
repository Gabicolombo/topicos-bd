const mongoose = require('mongoose');

module.exports = async() => {
  try{
    
    const url = `mongodb+srv://${process.env.USERNAME_DB}:${process.env.PASSWORD}@cluster0.ojygc0w.mongodb.net/test`;
    // conectando com o banco de dados
    await mongoose.connect(url);

    console.log("Connected to database");

  }catch(err){
    console.error(err);
  }
}