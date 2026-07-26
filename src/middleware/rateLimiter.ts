import rateLimit from 'express-rate-limit';

import { ErrorType } from '../utils/ErrorType.js';

export const authCallbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: ErrorType.TOO_MANY_REQUESTS },
});

export const authRedirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: ErrorType.TOO_MANY_REQUESTS },
});

export const fileUploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: ErrorType.TOO_MANY_REQUESTS },
});
