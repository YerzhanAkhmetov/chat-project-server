import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    register,
    login,
    validUser,
    updateUser,
    getUserById,
    updatePicture,
    searchUsers
} from '../controllers/userControllers.js';
import { checkAuth } from '../middleware/user.js';

const router = express.Router();
//picture
const storage = multer.diskStorage({
    destination: './assets/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage });

//routes с работой пользователей
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/valid', checkAuth, validUser);
router.get('/api/user?', checkAuth, searchUsers);
router.get('/api/users/:id', checkAuth, getUserById);
router.patch('/api/users/update/:id', checkAuth, updateUser);
router.patch('/api/users/update/picture/:id', checkAuth, upload.single('image'), updatePicture);

export default router;