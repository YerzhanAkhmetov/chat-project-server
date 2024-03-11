import express from "express";
import { getMessages, sendMessage, sendMessageWithImage } from "../controllers/messageControllers.js";
import { checkAuth } from "../middleware/user.js";
import multer from 'multer';
import { fileURLToPath } from 'url'
import { dirname } from 'path';
import path from 'path';

const router = express.Router();

//работа  с картинкой
const filenameUrl = fileURLToPath(import.meta.url)
// Получаем директорию текущего модуля
const currentDir = dirname(filenameUrl);
// Получаем путь к директории выше текущей
const parentDir = path.resolve(currentDir, '..');
// Папка для сохранения изображений
const imageUploadPath = path.join(parentDir, './assets/images/');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageUploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


//routes с работой сообщениями
router.post("/", checkAuth, sendMessage);
router.get("/:chatId", checkAuth, getMessages);
// Маршрут для загрузки изображений и добавления их в сообщение
router.post("/image/upload", checkAuth, upload.single('image'), sendMessageWithImage);



export default router;
