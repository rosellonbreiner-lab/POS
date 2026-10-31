import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { UserRole } from "@prisma/client";

async function main() {
  console.log("Iniciando seed de MotoTaller con los 3 tipos de usuarios...");

  // 1. Super Usuario (Control total, cambiar nombre de taller, logo, auditoría)
  const superPassword = await hashPassword("SuperAdmin2026!");
  const superUser = await prisma.user.upsert({
    where: { email: "super@mototaller.co" },
    update: { role: UserRole.SUPERADMIN },
    create: {
      email: "super@mototaller.co",
      name: "Super Usuario (Master)",
      passwordHash: superPassword,
      role: UserRole.SUPERADMIN,
      forcePasswordReset: false,
    },
  });
  console.log(`[OK] Super Usuario creado: ${superUser.email} / Clave: SuperAdmin2026!`);

  // 2. Administrador (Dueño del taller)
  const adminPassword = await hashPassword("AdminDueño123!");
  const adminUser = await prisma.user.upsert({
    where: { email: "dueno@mototaller.co" },
    update: { role: UserRole.ADMIN },
    create: {
      email: "dueno@mototaller.co",
      name: "Dueño del Taller",
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      forcePasswordReset: false,
    },
  });
  console.log(`[OK] Administrador Dueño creado: ${adminUser.email} / Clave: AdminDueño123!`);

  // Mantener también admin@mototaller.co por compatibilidad
  await prisma.user.upsert({
    where: { email: "admin@mototaller.co" },
    update: { role: UserRole.SUPERADMIN },
    create: {
      email: "admin@mototaller.co",
      name: "Super Admin",
      passwordHash: superPassword,
      role: UserRole.SUPERADMIN,
      forcePasswordReset: false,
    },
  });

  // 3. Trabajador Común (Mecánicos / Cajeros de mostrador)
  const workerPassword = await hashPassword("Trabajador123!");
  const workerUser = await prisma.user.upsert({
    where: { email: "trabajador@mototaller.co" },
    update: { role: UserRole.TRABAJADOR },
    create: {
      email: "trabajador@mototaller.co",
      name: "Mecánico / Trabajador",
      passwordHash: workerPassword,
      role: UserRole.TRABAJADOR,
      forcePasswordReset: false,
    },
  });
  console.log(`[OK] Usuario Trabajador creado: ${workerUser.email} / Clave: Trabajador123!`);

  console.log("Usuarios listos.");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
