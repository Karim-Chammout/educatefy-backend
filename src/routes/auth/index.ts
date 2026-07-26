import express from 'express';

import { handleCallback, logout, redirectToProvider } from './authController.js';
import { authStatus } from './authStatus.js';
import { authCallbackLimiter, authRedirectLimiter } from '../../middleware/rateLimiter.js';

const authRouter = express.Router();

authRouter.get('/redirect/:oidcID', authRedirectLimiter, redirectToProvider);

authRouter.post('/callback/:oidcID', authCallbackLimiter, handleCallback);

authRouter.post('/logout', logout);

authRouter.get('/status', authStatus);

export default authRouter;
