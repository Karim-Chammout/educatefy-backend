import 'dotenv/config';
import express, { Request, Response } from 'express';

import config from './config';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Express Server');
});

const PORT = config.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
