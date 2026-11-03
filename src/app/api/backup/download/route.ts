import { NextResponse } from "next/server";
import fs from "fs";
import { getCurrentUser } from "@/lib/auth";
import { getStoredBackupPath } from "@/lib/backup";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Acceso denegado. Solo administradores pueden descargar copias de seguridad." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Nombre de archivo requerido." }, { status: 400 });
  }

  const filePath = getStoredBackupPath(filename);
  if (!filePath || !fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Archivo de copia de seguridad no encontrado." }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  await createAuditLog({
    userId: user.id,
    action: "BACKUP_DOWNLOADED",
    resource: "SystemBackup",
    resourceId: filename,
    details: {
      filename,
      sizeBytes: fileBuffer.length,
      downloadedBy: user.name,
    },
  });

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(fileBuffer.length),
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
