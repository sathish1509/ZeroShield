import { createAuditEntry } from '../models/auditModel.js';

export const autoAuditLog = (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
      if (req.auditContext || isWriteMethod) {
        try {
          const rawPath = (req.originalUrl || req.path).split('?')[0];
          const pathSegments = rawPath.split('/').filter(Boolean).filter((s) => s !== 'api');
          const primaryResource = pathSegments[0] || 'resource';
          const subAction = pathSegments[pathSegments.length - 1] || 'action';

          const action = req.auditContext?.action || `${req.method}_${subAction}`.toUpperCase();
          const resource = req.auditContext?.resource || primaryResource;
          const resourceId = req.auditContext?.resourceId || req.params?.id || null;

          let details = req.auditContext?.details;
          if (!details && req.body) {
            const bodyCopy = { ...req.body };
            delete bodyCopy.password;
            delete bodyCopy.token;
            delete bodyCopy.refreshToken;
            details = bodyCopy;
          }

          const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;

          await createAuditEntry({
            userId: req.user.id,
            action,
            resource,
            resourceId,
            details: details || {},
            ipAddress,
          });
        } catch (err) {
          console.error('Failed to create audit log entry:', err);
        }
      }
    }
  });

  next();
};
