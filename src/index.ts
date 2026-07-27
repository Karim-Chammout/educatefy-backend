import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import config from './config.js';
import GraphQL from './graphql/index.js';
import { attachToken } from './middleware/attachToken.js';
import { errorHandler, httpLogger } from './middleware/logging.js';
import { renewToken } from './middleware/renewToken.js';
import api from './routes/index.js';
import { corsOptions } from './utils/corsOptions.js';
import logger from './utils/logger.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(httpLogger);
app.use(cors(corsOptions));

app.use(attachToken);
app.use(renewToken);

app.use('/api', api);

app.use('/graphql/', GraphQL());

app.use(errorHandler);

const PORT = config.PORT || 9090;
app.listen(PORT, () => {
  logger.info({ port: PORT }, `Server is running at http://localhost:${PORT}`);
});
