const User = require('../schemas/user');
const Message = require('../schemas/messages');

async function saveTextMessage(data) {
  console.log(data);
    let message = await Message(data);

      await message.save();

      return 1;
}

async function getMessages(){
  const messages = await Message.find({}, {_id: 0}).lean();
  const messageArray = Object.values(messages);
  return messageArray;
}

module.exports = { saveTextMessage, getMessages };