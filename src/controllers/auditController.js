import * as auditService from '../services/auditService.js';

export const getAuditLogs = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
    const logs = await auditService.getAuditLogs(limit);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving audit logs', error: error.message });
  }
};
