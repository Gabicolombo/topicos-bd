const User = require('../schemas/user');
const Message = require('../schemas/messages');

async function saveTextMessage(data) {
    let message = await Message(data);

      await message.save();

      return 1;
}

module.exports = { saveTextMessage };