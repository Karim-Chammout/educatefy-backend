import { CorsOptions } from 'cors';

// To be added later
const allowedDomains = [''];

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
