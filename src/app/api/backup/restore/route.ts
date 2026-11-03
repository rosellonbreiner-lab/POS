import { NextResponse } from "next/server";
import fs from "fs";
import { getCurrentUser } from "@/lib/auth";
import { restoreEncryptedBackup, getStoredBackupPath, decryptAndInspectBackup } from "@/lib/backup";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json(
      { error: "Acceso denegado. Solo administradores autorizados pueden restaurar el sistema." },
      { status: 403 }
    );
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let fileBuffer: Buffer | null = null;
    let confirmationCode = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      confirmationCode = (formData.get("confirmationCode") as string) || "";

      if (!file) {
        return NextResponse.json(
          { error: "No se proporcionó ningún archivo de copia de seguridad." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      const body = await request.json();
      confirmationCode = body.confirmationCode || "";

      if (body.filename) {
        const filePath = getStoredBackupPath(body.filename);
        if (!filePath || !fs.existsSync(filePath)) {
          return NextResponse.json(
            { error: "El archivo de copia de seguridad seleccionado no existe en el servidor." },
            { status: 404 }
          );
        }
        fileBuffer = fs.readFileSync(filePath);
      } else if (body.fileBase64) {
        fileBuffer = Buffer.from(body.fileBase64, "base64");
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { error: "Contenido del archivo de copia de seguridad vacío o no válido." },
        { status: 400 }
      );
    }

    // Código de seguridad obligatorio para evitar restauraciones accidentales
    if (confirmationCode.trim() !== "RESTAURAR-COPIA-2026") {
      return NextResponse.json(
        {
          error:
            "Código de confirmación de seguridad incorrecto. Escriba exactamente 'RESTAURAR-COPIA-2026' para autorizar el restablecimiento.",
        },
        { status: 400 }
      );
    }

    // Ejecutar restauración atómica cifrada
    const result = await restoreEncryptedBackup(fileBuffer, {
      id: user.id,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      metadata: result.metadata,
    });
  } catch (error: any) {
    console.error("Error al restaurar backup cifrado:", error);
    return NextResponse.json(
      { error: error.message || "Error al restaurar la copia de seguridad." },
      { status: 500 }
    );
  }
}
