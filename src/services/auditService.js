import redisClient from '../config/redisClient.js';

const AUDIT_LOG_LIST = 'audit-log';

export const logAction = async (userId, action, details) => {
  const logEntry = {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  await redisClient.lpush(AUDIT_LOG_LIST, JSON.stringify(logEntry));
};

export const getAuditLogs = async (limit = 100) => {
  const logs = await redisClient.lrange(AUDIT_LOG_LIST, 0, limit - 1);
  return logs.map(log => JSON.parse(log));
};
