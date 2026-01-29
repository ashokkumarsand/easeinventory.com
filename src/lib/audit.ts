import { prisma } from './prisma';

/**
 * ISO 27001 Audit Logging Utility
 */
export async function logSecurityAction(params: {
  tenantId: string;
  userId?: string;
  action: string;
  resource?: string;
  details?: any;
  ipAddress?: string;
}) {
  try {
    await prisma.securityLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        details: params.details || {},
        ipAddress: params.ipAddress
      }
    });
  } catch (error) {
    console.error('FAILED_TO_LOG_SECURITY_ACTION:', error);
  }
}

export enum SecurityAction {
  SENSITIVE_DATA_UPDATE = 'SENSITIVE_DATA_UPDATE',
  CREDENTIAL_ENCRYPTION = 'CREDENTIAL_ENCRYPTION',
  BULK_PAYMENT_REMINDER = 'BULK_PAYMENT_REMINDER',
  GSP_API_ACCESS = 'GSP_API_ACCESS',
  EXPORT_GSTR1 = 'EXPORT_GSTR1'
}
