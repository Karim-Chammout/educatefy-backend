import express from 'express';

import { handleCallback, redirectToProvider } from './authController.js';

const authRouter = express.Router();

authRouter.get('/redirect/:oidcID', redirectToProvider);

authRouter.post('/callback/:oidcID', handleCallback);

export default authRouter;
