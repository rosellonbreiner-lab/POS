import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

// Hash precalculado con Argon2id (m=19456, t=2) para mitigar ataques de canal lateral / timing attacks
const DUMMY_ARGON2_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$q9X6hP3uE4Yg7bF2a1K0LQ$b5G1xJ4mP8sT9uV2wX0yZ3a4b5c6d7e8f9g0h1i2j3k";

export async function POST(request: Request) {
  // 1. Obtener IP y User-Agent del cliente de forma segura
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "Desconocido";

  // 2. Control de Fuerza Bruta por IP (Máximo 10 intentos por IP en 15 minutos)
  const ipLimit = checkRateLimit(`ip:${clientIp}`, {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 15 * 60 * 1000,
  });

  if (!ipLimit.allowed) {
    return NextResponse.json(
      {
        error: `Demasiados intentos desde esta dirección. Por seguridad, espere ${Math.ceil(
          (ipLimit.retryAfterSeconds || 900) / 60
        )} minutos antes de reintentar.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(ipLimit.retryAfterSeconds || 900),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Correo electrónico y contraseña requeridos" },
        { status: 400 }
      );
    }

    const emailClean = email.toLowerCase().trim();

    // 3. Control de Fuerza Bruta por Cuenta / Correo (Máximo 5 intentos por correo en 15 minutos)
    const accountLimit = checkRateLimit(`account:${emailClean}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
      blockDurationMs: 15 * 60 * 1000,
    });

    if (!accountLimit.allowed) {
      await createAuditLog({
        action: "AUTH_LOGIN_RATE_LIMITED",
        resource: "User",
        details: { emailAttempted: emailClean },
        ipAddress: clientIp,
      });

      return NextResponse.json(
        {
          error: `Cuenta temporalmente bloqueada por múltiples intentos fallidos. Intente nuevamente en ${Math.ceil(
            (accountLimit.retryAfterSeconds || 900) / 60
          )} minutos.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(accountLimit.retryAfterSeconds || 900),
          },
        }
      );
    }

    // 4. Buscar usuario en base de datos
    const user = await prisma.user.findUnique({
      where: { email: emailClean },
    });

    // 5. Mitigación de Timing Attacks (Enumeración de usuarios):
    // Si el usuario no existe, verificamos contra el hash dummy para consumir el mismo tiempo de CPU
    if (!user) {
      await verifyPassword(password, DUMMY_ARGON2_HASH);

      await createAuditLog({
        action: "AUTH_LOGIN_FAILED",
        resource: "User",
        details: { emailAttempted: emailClean, reason: "user_not_found" },
        ipAddress: clientIp,
      });

      return NextResponse.json(
        { error: "Credenciales de acceso no válidas" },
        { status: 401 }
      );
    }

    // 6. Verificar si la cuenta tiene bloqueo persistente en BD
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: "Cuenta temporalmente protegida por seguridad. Intente más tarde." },
        { status: 403 }
      );
    }

    // 7. Comparación criptográfica Argon2id
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      const failed = user.failedAttempts + 1;
      const lockedUntil = failed >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: failed, lockedUntil },
      });

      await createAuditLog({
        userId: user.id,
        action: "AUTH_LOGIN_FAILED",
        resource: "User",
        resourceId: user.id,
        details: { emailAttempted: emailClean, failedAttempts: failed },
        ipAddress: clientIp,
      });

      return NextResponse.json(
        { error: "Credenciales de acceso no válidas" },
        { status: 401 }
      );
    }

    // 8. Éxito: Resetear contadores de intentos fallidos
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
    resetRateLimit(`account:${emailClean}`);
    resetRateLimit(`ip:${clientIp}`);

    // 9. Crear sesión HttpOnly segura vinculada a IP y User-Agent
    await createSession(user.id, clientIp, userAgent);

    // 10. Registro inmutable de auditoría
    await createAuditLog({
      userId: user.id,
      action: "AUTH_LOGIN_SUCCESS",
      resource: "User",
      resourceId: user.id,
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login security error:", error);
    return NextResponse.json(
      { error: "Error en el servicio de autenticación" },
      { status: 500 }
    );
  }
}
