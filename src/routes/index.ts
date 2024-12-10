import express from 'express';

import authRouter from './auth';
import fileRouter from './file';

const api = express.Router();

api.use('/openid', authRouter);

api.use('/file', fileRouter);

export default api;
