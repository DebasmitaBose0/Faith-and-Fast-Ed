import AuditLog from "../models/auditLogModel.js";
import logger from "./logger.js";

export const writeAuditLog = async ({
  actorId,
  actionType,
  targetType,
  targetId,
  beforeSnapshot,
  afterSnapshot,
}) => {
  try {
    const auditRecord = await AuditLog.create({
      actorId,
      actionType,
      targetType,
      targetId,
      beforeSnapshot,
      afterSnapshot,
    });

    logger.info(`Audit Log Created: ${actionType} on ${targetType} (ID: ${targetId}) by actor ${actorId}`, {
      auditLogId: auditRecord._id,
    });

    return auditRecord;
  } catch (error) {
    logger.error("Failed to write audit log record", error);
  }
};
