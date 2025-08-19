import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const logStream = fs.createWriteStream(path.join(process.cwd(), 'server.log'), { flags: 'a' });

const logRequest = (message) => {
  const timestamp = new Date().toISOString();
  logStream.write(`[${timestamp}] ${message}\n`);
  console.log(`[${timestamp}] ${message}`);
};

const loggingMiddleware = (req, res, next) => {
  const { method, originalUrl, query, body } = req;

  let logMessage = `Request: ${method} ${originalUrl}`;
  logMessage += `\n  Query: ${JSON.stringify(query)}`;
  logMessage += `\n  Body: ${JSON.stringify(body)}`;

  const token = req.headers.authorization;

  if (token && token.startsWith('Bearer ')) {
    const tokenValue = token.split(' ')[1];
    try {
      const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
      logMessage += `\n  Token: VALID`;
      logMessage += `\n  User: ${JSON.stringify(decoded)}`;
    } catch (error) {
      logMessage += `\n  Token: INVALID - ${error.message}`;
    }
  } else {
    logMessage += '\n  Token: NOT PROVIDED';
  }

  logRequest(logMessage);

  next();
};

export default loggingMiddleware;
