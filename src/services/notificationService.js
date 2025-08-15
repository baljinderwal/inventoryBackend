import { WebSocketServer } from 'ws';
import url from 'url';
import jwt from 'jsonwebtoken';

const clients = new Map();

export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const token = url.parse(req.url, true).query.token;

    if (!token) {
      ws.terminate();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      clients.set(decoded.id, ws);

      ws.on('close', () => {
        clients.delete(decoded.id);
      });

      ws.send(JSON.stringify({ message: 'Successfully connected to notification service' }));
    } catch (error) {
      ws.terminate();
    }
  });
};

export const sendNotificationToUser = (userId, message) => {
  const client = clients.get(userId);
  if (client && client.readyState === client.OPEN) {
    client.send(JSON.stringify(message));
  }
};
