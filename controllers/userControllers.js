import user from '../models/userSchema.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv'
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url'
import { dirname } from 'path';
dotenv.config()

//РЕГИСТРАЦИЯ
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.json({ message: 'Пользователь уже существует!' });
        }

        const newuser = new user({ email, password, name });
        const token = await newuser.generateAuthToken();
        await newuser.save();

        return res.json({ message: 'Регистрация прошла успешно!', token, user: newuser });
    } catch (error) {
        return res.status(500).json({ message: 'Ошибка при создании пользователя' });
    }
};

//ЛОГИН
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const valid = await user.findOne({ email });
        if (!valid) {
            return res.json({ message: 'Пользователь не найден!' });
        }

        const validPassword = await bcrypt.compare(password, valid.password);
        if (!validPassword) {
            return res.json({ message: 'Неверный пароль!' });
        }

        const token = await valid.generateAuthToken();
        await valid.save();
        res.cookie('userToken', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.json({ token: token, message: 'Добро пожаловать в чат!', user: valid });
    } catch (error) {
        return res.status(500).json({ message: 'Ошибка при авторизации!' });
    }
};

//ПРОВЕРКА НА ВАЛИДНОСТЬ ПОЛЬЗОВАТЕЛЯ
export const validUser = async (req, res) => {
    try {
        const validuser = await user.findOne({ _id: req.rootUserId }).select('-password');
        if (!validuser) res.json({ message: 'Пользователь не найден!' });
        res.status(201).json({
            user: validuser,
            token: req.token,
        });

    } catch (error) {

        res.status(500).json({ error: error });
        console.log(error);
    }
};


//ПОИСК ПОЛЬЗОВАТЕЛЕЙ
export const searchUsers = async (req, res) => {
    try {
        //Ищем пользователей по наименованию search в name и email
        const search = req.query.search
            ? {
                $or: [                                                      //$or -или
                    { name: { $regex: req.query.search, $options: 'i' } },  //$options: 'i'  игнорирование регистров 
                    { email: { $regex: req.query.search, $options: 'i' } }, //$regex: req.query.search  - ищет текст по шаблону которыый передали
                ],
            }
            : {};


        const users = await user.find(search);
        res.status(200).send(users);
    } catch (error) {
        res.status(500).json({ error: error });
        console.log(error);
    }
};

//ПОЛУЧИТЬ ПОЛЬЗОВАТЕЛЯ
export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const findUser = await user.findOne({ _id: id }).select('-password');
        res.status(200).json(findUser);
    } catch (error) {
        res.status(500).json({ error: error });
    }
};


//Обновить пользователя имя
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const updatedUser = await user.findByIdAndUpdate(id, { name });

    return updatedUser;
};

//Обновить пользователя аватарку
export const updatePicture = async (req, res) => {
    const { id } = req.params;
    let picture;

    if (req.file) {
        // Если изображение было загружено, используйте путь к нему
        picture = `http://localhost:${process.env.PORT}/static/${req.file.filename}`;
    } else {
        // Если изображение не было загружено, используйте значение по умолчанию
        picture =
            'https://cdn.icon-icons.com/icons2/2643/PNG/512/man_boy_people_avatar_user_person_black_skin_tone_icon_159355.png';
    }

    const findUser = await user.findOne({ _id: id }).select('-password');
    const prevPicture = findUser.picture;
    console.log(prevPicture);
    const updatedUser = await user.findByIdAndUpdate(
        id,
        { $set: { picture } },
        { new: true } // это опция, чтобы вернуть обновленного пользователя
    );

    const filenameUrl = fileURLToPath(import.meta.url)
    // Получаем директорию текущего модуля
    const currentDir = dirname(filenameUrl);
    // Получаем путь к директории выше текущей
    const parentDir = path.resolve(currentDir, '..');
    // const assetsPath = path.join(__dirname, 'assets');

    // Удаление предыдущей картинки, если она существует
    if (prevPicture && prevPicture !== updatedUser.picture) {

        const imagePath = prevPicture.split('/').pop(); // Извлекаем имя файла из URL картинки

        console.log(imagePath);

        const prevPicturePath = path.join(parentDir, 'assets', imagePath);
        // const prevPicturePath = path.join(dirnamePath, 'assets', prevPicture.split('/').pop());
        // console.log(prevPicturePath);
        try {
            await fs.unlink(prevPicturePath);
            console.log(`Previous picture (${prevPicturePath}) deleted`);
        } catch (err) {
            console.error(`Error deleting previous picture: ${err.message}`);
        }
    }

    res.json({ picture: updatedUser.picture });
};