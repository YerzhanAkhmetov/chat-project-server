import express from 'express';
import { checkAuth } from '../middleware/user.js';
import {
  accessChats,
  fetchAllChats,
  creatGroup,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from '../controllers/chatControllers.js';


const router = express.Router();
//routes с работой  чата и группы 
router.post('/', checkAuth, accessChats);
router.get('/', checkAuth, fetchAllChats);
router.post('/group', checkAuth, creatGroup);
router.patch('/group/add', checkAuth, addToGroup);
router.patch('/group/rename', checkAuth, renameGroup);
router.patch('/group/remove', checkAuth, removeFromGroup);


export default router;
