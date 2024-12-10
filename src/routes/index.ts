import express from 'express';

import authRouter from './auth';

const api = express.Router();

api.use('/openid', authRouter);

export default api;
