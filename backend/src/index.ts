import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { corsOptions } from './config/cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { router } from './routes';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1', router);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.warn(`PharmaFind API running on port ${env.PORT} [${env.NODE_ENV}]`);
});

export { app };
