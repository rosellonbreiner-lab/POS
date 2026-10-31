import crypto from "crypto";
import argon2 from "argon2";
import { prisma } from "./db";
import { cookies } from "next/headers";
import { User, UserRole } from "@prisma/client";
import { Permission, hasPermission } from "./permissions";

const SESSION_COOKIE_NAME = "mototaller_session";
const SESSION_EXPIRATION_HOURS = 12;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19 * 1024, // 19 MiB
    timeCost: 2,
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  // Generate random 256-bit token
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_HOURS * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  // Store in HttpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.deleteMany({
      where: { tokenHash },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const tokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return null;

  // Check if expired
  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED: Sesión no válida o expirada");
  }
  return user;
}

export async function requirePermission(permission: Permission): Promise<User> {
  const user = await requireAuth();
  if (!hasPermission(user.role, permission)) {
    throw new Error(`FORBIDDEN: Permiso requerido no otorgado (${permission})`);
  }
  return user;
}

