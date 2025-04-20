import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.route';
import { corsOptions } from './config/cors';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/users', userRoutes);

export default app;
