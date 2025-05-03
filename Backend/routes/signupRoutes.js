import express from 'express';
import { createUser } from '../controller/signupController.js';

const router = express.Router();

router.post('/signup', createUser);

export default router;