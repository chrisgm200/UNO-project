import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { registerSocketHandlers } from './sockets/socketHandlers';
import { ClientToServerEvents, ServerToClientEvents } from './types';

const app = express();
app.use(cors());
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' }, // en producción, restringe al dominio/URL de tu app
});

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  registerSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Servidor UNO corriendo en puerto ${PORT}`));