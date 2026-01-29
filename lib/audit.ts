import { prisma } from './db';

export interface AuditLogEntry {
  action: string;
  performedBy: string;
  targetType: string;
  targetId: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilters {
  action?: string;
  performedBy?: string;
  targetType?: string;
  targetId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Create a new audit log entry
 * Used to track all admin actions and security events
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        performedBy: entry.performedBy,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: entry.metadata || {},
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break main operations
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Get audit logs with optional filtering and pagination
 */
export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const {
    action,
    performedBy,
    targetType,
    targetId,
    startDate,
    endDate,
    page = 1,
    limit = 50,
  } = filters;

  const where: any = {};

  if (action) where.action = action;
  if (performedBy) where.performedBy = performedBy;
  if (targetType) where.targetType = targetType;
  if (targetId) where.targetId = targetId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get audit logs for a specific admin user
 */
export async function getAuditLogsByUser(
  userId: string,
  page: number = 1,
  limit: number = 50
) {
  return getAuditLogs({
    performedBy: userId,
    page,
    limit,
  });
}

/**
 * Get audit logs for a specific target entity
 */
export async function getAuditLogsByTarget(
  targetType: string,
  targetId: string,
  page: number = 1,
  limit: number = 50
) {
  return getAuditLogs({
    targetType,
    targetId,
    page,
    limit,
  });
}

/**
 * Get recent audit logs (last N days)
 */
export async function getRecentAuditLogs(days: number = 7, limit: number = 100) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return getAuditLogs({
    startDate,
    limit,
  });
}
