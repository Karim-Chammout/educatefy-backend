import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import config from './config';
import GraphQL from './graphql';
import { attachToken } from './middleware/attachToken';
import { accessLog, errorLog } from './middleware/logging';
import { renewToken } from './middleware/renewToken';
import api from './routes';
import { corsOptions } from './utils/corsOptions';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(accessLog);
app.use(cors(corsOptions));

app.use(attachToken);
app.use(renewToken);

app.use('/api', api);

app.use('/graphql/', GraphQL());

app.use(errorLog);

const PORT = config.PORT || 9090;
app.listen(PORT, () => {
  console.info(`
  Server is running at:
  http://localhost:${PORT}
  http://localhost:${PORT}/graphql/`);
});
