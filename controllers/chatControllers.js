import Chat from '../models/chatSchema.js';
import User from '../models/userSchema.js';

//Поиск чата с кем переписывался
export const accessChats = async (req, res) => {

  const { userId } = req.body;
  if (!userId) res.send({ message: "При получении чата, id пользователя не указан!" });

  let chatExists = await Chat.find({
    isGroup: false,
    $and: [           //объединяет два условия в массиве
      { users: { $elemMatch: { $eq: userId } } },//Ищет чаты, в которых массив "users" содержит хотя бы один элемент, который строго равен значению переменной "userId"
      { users: { $elemMatch: { $eq: req.rootUserId } } },//Ищет чаты, в которых массив "users" содержит хотя бы один элемент, который строго равен значению переменной "rootUserId"
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  chatExists = await User.populate(chatExists, {
    path: 'latestMessage.sender',
    select: 'name email picture',
  });

  if (chatExists.length > 0) {
    res.status(200).send(chatExists[0]);
  } else {

    let data = {
      chatName: 'sender',
      users: [userId, req.rootUserId],
      isGroup: false,
    };

    try {
      const newChat = await Chat.create(data);
      const chat = await Chat.find({ _id: newChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(chat);
    } catch (error) {
      res.status(500).send(error);
    }
  }
};

//Получить чаты
export const fetchAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.rootUserId } },
    })
      .populate('users')
      .populate('latestMessage')
      .populate('groupAdmin')
      .sort({ updatedAt: -1 });

    const finalChats = await User.populate(chats, {
      path: 'latestMessage.sender',
      select: 'name email picture',
    });

    res.status(200).json(finalChats);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};

//Создать группу
export const creatGroup = async (req, res) => {

  const { chatName, users } = req.body;

  if (!chatName || !users) {
    res.status(400).json({ message: 'Пожалуйста заполните поля' });
  }

  const parsedUsers = JSON.parse(users);

  if (parsedUsers.length < 2) {
    res.send(400).send('Группа должна содержать более 2 пользователей');
  }
  //Добавления пользователя который создал группу
  parsedUsers.push(req.rootUser);
  //Создание группы
  try {
    const chat = await Chat.create({
      chatName: chatName,
      users: parsedUsers,
      isGroup: true,
      groupAdmin: req.rootUserId,
    });

    const createdChat = await Chat.findOne({ _id: chat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    res.send(createdChat);
  } catch (error) {
    res.sendStatus(500);
  }
};

//Переименовать группу
export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName)
    res.status(400).send('Укажите id чата и имя чата');
  try {
    const chat = await Chat.findByIdAndUpdate(chatId, {
      $set: { chatName },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');
    if (!chat) res.status(404);
    res.status(200).send(chat);
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
};

//Добавить в группу
export const addToGroup = async (req, res) => {
  const { userId, chatId } = req.body;
  const existing = await Chat.findOne({ _id: chatId });
  if (!existing.users.includes(userId)) {
    const chat = await Chat.findByIdAndUpdate(chatId, {
      $push: { users: userId },
    })
      .populate('groupAdmin', '-password')
      .populate('users', '-password');
    if (!chat) res.status(404);
    res.status(200).send(chat);
  } else {
    res.status(409).send('пользователь уже существует');
  }
};

//Выйти из группы
export const removeFromGroup = async (req, res) => {
  const { userId, chatId } = req.body;

  const existing = await Chat.findOne({ _id: chatId });

  if (existing.users.includes(userId)) {
    Chat.findByIdAndUpdate(chatId, {
      $pull: { users: userId }, //который удаляет указанное значение из массива
    })
      .populate('groupAdmin', '-password')
      .populate('users', '-password')
      .then((e) => res.status(200).send(e))
      .catch((e) => res.status(404));
  } else {
    res.status(409).send('пользователя не существует');
  }
};


