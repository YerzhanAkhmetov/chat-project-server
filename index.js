import express from 'express';
import mongoDBConnect from './mongoDB/connection.js';
import dotenv from 'dotenv'
import cors from 'cors'
import { Server } from 'socket.io';
import chalk from 'chalk';
//for multer
import { fileURLToPath } from 'url'
import { dirname } from 'path';
import path from 'path';

//Routes
import userRoutes from './routes/user.js'
import chatRoutes from './routes/chat.js'
import messageRoutes from './routes/message.js'

dotenv.config()

let usersActiv = []
//CONSTS/////////
const PORT = process.env.PORT || 8009
//express
const app = express();

//Middleware /////////
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

//работа  с картинкой
const filenameUrl = fileURLToPath(import.meta.url)
const dirnamePath = dirname(filenameUrl)
console.log(filenameUrl);
//это доступ к папке с картинками
app.use("/static", express.static(path.join(dirnamePath, 'assets')))
app.use("/static", express.static(path.join(dirnamePath, 'assets/images')))

// ROUTES  /////////
app.use('/', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);



//для теста
// app.get('/', (req, res) => {
//     res.send('Welcome')
// })
//создание сервера
// const server = createServer(app);


//запуск СЕРВЕРА /////////
const server = app.listen(PORT, () => {
    console.log(chalk.blue(`server running at http://localhost:${PORT}`));
});

//подключения к БД /////////
mongoDBConnect();
//запуск WS подбключения /////////
const io = new Server(server, {
    pingTimeout: 60000,
    cors: '*'
    // cors: {
    //     origin: 'http://localhost:8000',
    //   },
});

//подключаем ws соединение
io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on("disconnect", () => {
        console.log("🔥: user disconnected");
        //поиск по ид и удаление из массива
        if (usersActiv) {
            const findUser = usersActiv.find(user => user.socketId === socket.id);
            if (socket.id && findUser) {
                usersActiv = usersActiv.filter(obj => obj.socketId !== socket.id);
            }
        }

    });
    //подключение Active user
    socket.on('setup', (userData) => {
        socket.join(userData.id);
        const findUser = usersActiv.find(user => user.id === userData.id);
        if (userData.id && !findUser) {
            userData.socketId = socket.id
            usersActiv.push(userData)
        }

        //для получефния онлайн юзера
        socket.emit('connected', usersActiv);
    });
    //подключение к переписке
    socket.on('join room', (room) => {
        // console.log("join room", room);
        socket.join(room);
    });


    //нужно для того чтобы видеть что пользователь печатает
    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));
    //сообщения
    socket.on('new message', (newMessageRecieve) => {
        let chat = newMessageRecieve.chatId;
        if (!chat.users) console.log('chats.users не найден');
        chat.users.forEach((user) => {
            if (user._id == newMessageRecieve.sender._id) return;
            // data
            socket.in(user._id).emit('message recieved', newMessageRecieve);
        });
    });
});




