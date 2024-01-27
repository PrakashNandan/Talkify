const Message = require("../model/messageModel");
const User = require("../model/userModel");
const Chat = require("../model/ChatModel");

exports.sendMessage = async (req, res) => {
  // chatId, message, senderId

  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.sendStatus(400);
    res.json(error.message);
  }
};

exports.allMessages = async (req, res) => {
  try {
    const message = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

      res.json(message);
  } catch (error) {
    res.sendStatus(400);
    res.json(error.message);
  }
};
