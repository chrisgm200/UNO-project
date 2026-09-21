"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const socketHandlers_1 = require("./sockets/socketHandlers");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*' }, // en producción, restringe al dominio/URL de tu app
});
io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
    (0, socketHandlers_1.registerSocketHandlers)(io, socket);
});
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Servidor UNO corriendo en puerto ${PORT}`));
