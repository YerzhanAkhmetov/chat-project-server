import jwt from 'jsonwebtoken'
import user from '../models/userSchema.js';
import dotenv from 'dotenv';
dotenv.config()


//проверка токена
export const checkAuth = async (req, res, next) => {
    try {
        //получаем токен из заголовка headers
        // console.log(req.headers.authorization);
        const token = req.headers.authorization;
        // console.log(token);
        if (token.length) {
            const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(verifiedUser);
            const rootUser = await user.findOne({ _id: verifiedUser.id }).select('-password');
            req.token = token;
            req.rootUser = rootUser;
            req.rootUserId = rootUser._id;
        }
        //продолжаем
        next();
    } catch (error) {
        // console.log(error);
        res.json({ error: 'Ошибка Токена' });
    }

};