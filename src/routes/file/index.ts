import express from 'express';
import multer from 'multer';

import { authenticated } from '../../middleware/authenticated.js';
import { fileUploadHandler } from './fileUploadController.js';

const fileRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

fileRouter.post('/upload', authenticated, upload.single('file'), fileUploadHandler);

export default fileRouter;
