import 'dotenv/config';
import express, { Request, Response } from 'express';

import config from './config';
import GraphQL from './graphql';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req: Request, res: Response) => {
  res.send('Express Server');
});

app.use('/graphql/', GraphQL());

const PORT = config.PORT || 8080;

app.listen(PORT, () => {
  console.info(`
  Server is running at:
  http://localhost:${PORT}
  http://localhost:${PORT}/graphql/`);
});
