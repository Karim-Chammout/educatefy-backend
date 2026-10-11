import { CorsOptions } from 'cors';
import config from '../config.js';

/*
 * https://educatefy-backend.onrender.com - Render.com preview domain
 * https://educatefy-frontend.vercel.app - Vercel preview domain
 */
const allowedDomains = [
  'https://educatefy-backend.onrender.com',
  'https://educatefy-frontend.vercel.app',
  config.APP_URL,
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    // Allow all localhost ports and specific domains
    const localhostPattern = /^http:\/\/localhost(:\d+)?$/;
    if (allowedDomains.includes(origin) || localhostPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
