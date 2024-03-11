import Message from '../models/messageSchema.js';
import Chat from '../models/chatSchema.js';

export const sendMessage = async (req, res) => {

  const { chatId, message } = req.body;

  try {

    let msg = await Message.create({ sender: req.rootUserId, message, chatId });

    msg = await (await msg.populate('sender', 'name picture email')).populate(
      {
        path: 'chatId',
        select: 'chatName isGroup users',
        model: 'Chat',
        populate: {
          path: 'users',
          select: 'name email picture',
          model: 'User',
        },
      });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: msg,
    });

    res.status(200).send(msg);

  } catch (error) {

    console.log(error);
    res.status(500).json({ error: error });

  }
};

// // Контроллер для отправки сообщений с изображением
export const sendMessageWithImage = async (req, res) => {

  try {
    if (!req.file || !req.file.filename) {
      return res.status(400).json({ error: 'Неверные данные изображения' });
    }
    const imageUrl = `http://localhost:${process.env.PORT}/static/${req.file.filename}`;

    let msg = await Message.create({ sender: req.rootUserId, message: imageUrl, chatId: req.body.chatId });
    // populate используется для заполнения (populate) ссылочных полей
    msg = await (await msg.populate('sender', 'name picture email')).populate(
      {
        path: 'chatId',
        select: 'chatName isGroup users',
        model: 'Chat',
        populate: {
          path: 'users',
          select: 'name email picture',
          model: 'User',
        },
      });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: msg,
    });

    res.status(200).send(msg);
  } catch (error) {
    console.error('Ошибка обработки изображения:', error);
    res.status(500).json({ error: 'Ошибка обработки изображения' });
  }
};

//получение сообщений
export const getMessages = async (req, res) => {

  const { chatId } = req.params;

  try {
    let messages = await Message.find({ chatId })
      .populate({
        path: 'sender',
        model: 'User',
        select: 'name picture email',
      })
      .populate({
        path: 'chatId',
        model: 'Chat',
      });

    res.status(200).json(messages);
  } catch (error) {

    res.sendStatus(500).json({ error: error });
    console.log(error);

  }
};
