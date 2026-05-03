import express from 'express';

import authRouter from './auth/index.js';
import fileRouter from './file/index.js';

const api = express.Router();

api.use('/openid', authRouter);

api.use('/file', fileRouter);

export default api;
