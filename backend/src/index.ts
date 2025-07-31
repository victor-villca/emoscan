import app from './app';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeSocket } from './config/socket';

dotenv.config();

const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Swagger docs available at http://localhost:${PORT}/api/docs`);
});
