import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.route';
import sessionRoutes  from './routes/session.route'
import emotionRoutes from './routes/emotion.route'
import { corsOptions } from './config/cors';
import { setupSwagger } from './config/swagger';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

setupSwagger(app)

app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes)
app.use('/api/emotions', emotionRoutes)

export default app;