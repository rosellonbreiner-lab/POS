import { prisma } from "./db";
import { Prisma } from "@prisma/client";

export async function createAuditLog({
  userId,
  action,
  resource,
  resourceId,
  details,
  ipAddress,
}: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    // Append-only logs shouldn't break the main flow if database log write encounters an issue, but must be reported
    console.error("Error creating audit log:", error);
  }
}

