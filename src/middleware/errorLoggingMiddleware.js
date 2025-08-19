import fs from 'fs';
import path from 'path';

const logStream = fs.createWriteStream(path.join(process.cwd(), 'server.log'), { flags: 'a' });

const logError = (message) => {
  const timestamp = new Date().toISOString();
  logStream.write(`[${timestamp}] [ERROR] ${message}\n`);
  console.error(`[${timestamp}] [ERROR] ${message}`);
};

const errorLoggingMiddleware = (err, req, res, next) => {
  const { method, originalUrl, query, body } = req;

  let logMessage = `Error occurred during request: ${method} ${originalUrl}`;
  logMessage += `\n  Query: ${JSON.stringify(query)}`;
  logMessage += `\n  Body: ${JSON.stringify(body)}`;
  logMessage += `\n  Error: ${err.message}`;
  logMessage += `\n  Stack: ${err.stack}`;

  logError(logMessage);

  res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
};

export default errorLoggingMiddleware;
