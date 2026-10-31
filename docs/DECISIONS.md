# DECISIONS

## 1. Next.js + TypeScript (un solo repo front+back)
Alternativas: React + Express separados, Django. **Elegido:** Next.js. Menos piezas, tipos compartidos, menos superficie de error de conexión front↔back.

## 2. PostgreSQL + Prisma
Alternativas: SQLite, MySQL, Supabase. **Elegido:** PostgreSQL local/Docker. Transacciones ACID para stock y contabilidad; datos del taller bajo control del dueño (no terceros). Prisma evita inyección SQL por diseño.

## 3. Autenticación propia con sesiones en servidor
Alternativas: JWT en localStorage, Supabase Auth. **Elegido:** sesiones opacas en cookie HttpOnly con hash en BD. Revocables al instante, inmunes a robo por XSS de localStorage.

## 4. argon2id para contraseñas · 2FA TOTP obligatorio para roles críticos
Estándar vigente; protege las cuentas con acceso a contabilidad.

## 5. Registros inmutables (facturas, kardex, asientos)
Se corrige con contra-movimientos. Garantiza trazabilidad y evita fraude interno.

## 6. Contabilidad extensible
Plan de cuentas y categorías de gasto en tablas editables por el usuario, no fijas en código. Cumple "libre de agregar más".

## 7. Escáner láser como dispositivo HID (teclado)
Funciona sin drivers en cualquier pistola USB estándar. Se detecta por velocidad de tecleo y terminador Enter.

## 8. Fotos fuera de `public/`, re-encodeadas
Evita ejecución de archivos maliciosos y fuga de metadatos EXIF.

## 9. Estilo glass oscuro + animaciones ≤ 250 ms
Coherencia visual con identidad de taller; principios de movimiento de Emil Kowalski. Fallback sólido sin `backdrop-filter`.

## 10. Factura impresa = documento interno hasta integrar DIAN
Decisión legal pendiente de confirmar con el contador. Módulo `fiscal/` reservado.

## 11. Autonomía de la IA ampliada
El dueño autorizó a la IA a ejecutar e instalar y a decidir seguridad (ver RULES.md), manteniendo confirmación para acciones destructivas.
