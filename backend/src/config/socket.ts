import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { corsOptions } from './cors';

export let io: Server;

export function initializeSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: corsOptions,
  });

  console.log('🔌 Socket.IO initialized');

  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('join_session', (sessionCode: string) => {
      console.log(
        `👉 Client ${socket.id} is joining session room: ${sessionCode}`
      );
      socket.join(sessionCode);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
