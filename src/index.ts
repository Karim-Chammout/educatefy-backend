import 'dotenv/config';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

import config from './config';
import GraphQL from './graphql';
import { attachToken } from './middleware/attachToken';
import { accessLog, errorLog } from './middleware/logging';
import { renewToken } from './middleware/renewToken';
import api from './routes';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(accessLog);

app.use(attachToken);
app.use(renewToken);

app.get('/', (req: Request, res: Response) => {
  res.send('Express Server');
});

app.use('/api', api);

app.use('/graphql/', GraphQL());

app.use(errorLog);

const PORT = config.PORT || 8080;
app.listen(PORT, () => {
  console.info(`
  Server is running at:
  http://localhost:${PORT}
  http://localhost:${PORT}/graphql/`);
});
