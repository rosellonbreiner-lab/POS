# Manual de Seguridad y Control de Amenazas 2026

> Basado en la guía de Controles de Seguridad Web 2026 (OWASP Top 10 2025/2026, Google Safe Browsing y estándares de Chrome 154+).

---

## 1. Estado de Implementación Técnica en MotoTaller

### 1.1 Autenticación y Criptografía
- [x] **Algoritmo de Contraseñas**: Argon2id con parámetros recomendados de memoria (19 MiB) y 2 iteraciones temporales.
- [x] **Protección contra Fuerza Bruta (Brute Force)**:
  - Módulo en memoria `src/lib/rateLimit.ts` con algoritmo de ventana deslizante.
  - Límite de 10 peticiones por IP en 15 minutos.
  - Límite de 5 intentos fallidos por cuenta de usuario en 15 minutos.
  - Bloqueo temporal automático y cabecera HTTP estándar `Retry-After`.
- [x] **Protección contra Timing Attacks**:
  - Hash *dummy* Argon2id precalculado (`DUMMY_ARGON2_HASH`) para que los intentos con correos inexistentes tarden el mismo tiempo de CPU que un usuario válido, evitando la enumeración de usuarios.
- [x] **Formulario de Login Seguro**:
  - Sin credenciales de prueba pre-cargadas en el código del cliente.
  - Sin botones de acceso directo que expongan contraseñas de producción.
- [x] **Gestión de Sesiones**:
  - Tokens criptográficos aleatorios de 256 bits generados en el servidor (`crypto.randomBytes(32)`).
  - Almacenamiento en base de datos únicamente del hash SHA-256 del token.
  - Cookie segura: `HttpOnly; SameSite=Lax; Path=/` con bandera `Secure` en producción.
  - Inactivación y destrucción efectiva de sesión al hacer Logout tanto en el cliente como en base de datos.

### 1.2 Autorización y Roles (RBAC)
- [x] **Validación en el Servidor (Server-Side Enforcement)**:
  - Denegación por defecto: cada ruta de API verifica la identidad y el rol antes de procesar cualquier mutación.
- [x] **Aislamiento por Niveles**:
  - **SUPERADMIN**: Gestión de cuentas, visualización de credenciales maestras, configuración de la matriz de módulos y acceso exclusivo a auditoría.
  - **ADMIN (Dueño)**: Gestión de inventario, ventas, órdenes de trabajo, arqueo de caja y retiro de repuestos.
  - **TRABAJADOR (Operador)**: Acceso restringido al Punto de Venta (POS) y órdenes de trabajo operativas. Bloqueo en servidor para contabilidad, configuración y auditoría.
- [x] **Eliminación y Descontinuación Segura de Artículos**:
  - Endpoint `DELETE /api/products/[id]` protegido para roles `ADMIN` y `SUPERADMIN`.
  - Si un repuesto no tiene historial contable o de ventas, se elimina físicamente en una transacción ACID.
  - Si el repuesto ya cuenta con facturación o compras previas, se marca como `[DESCONTINUADO]` y su stock se ajusta a 0 para preservar la trazabilidad fiscal y no corromper la integridad referencial.

### 1.3 Cabeceras HTTP y Prevención de Inyecciones
- [x] **Cabeceras de Protección en `next.config.ts` y `middleware.ts`**:
  - `Strict-Transport-Security`: `max-age=31536000; includeSubDomains; preload`
  - `X-Frame-Options: DENY` (anti-clickjacking).
  - `X-Content-Type-Options: nosniff` (anti-MIME sniffing).
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=()`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-origin`
  - `X-Permitted-Cross-Domain-Policies: none`
  - `Content-Security-Policy (CSP)`: Directivas explícitas de orígenes permitidos.
  - `poweredByHeader: false`: Cabecera de huella de Next.js deshabilitada.
- [x] **Prevención de Caché en Rutas de API**:
  - `Cache-Control: no-store, no-cache, must-revalidate` aplicado en `middleware.ts` para todas las rutas `/api/*`.
- [x] **Prevención de Inyecciones SQL**:
  - Consultas parametrizadas obligatorias gestionadas mediante Prisma ORM.

### 1.4 Auditoría y Registro (Audit Logging)
- [x] Registro append-only en base de datos (`AuditLog`):
  - Inicios de sesión exitosos (`AUTH_LOGIN_SUCCESS`).
  - Intentos fallidos (`AUTH_LOGIN_FAILED`).
  - Bloqueos de fuerza bruta (`AUTH_LOGIN_RATE_LIMITED`).
  - Retiro o eliminación de artículos de inventario.
  - Modificación de configuración del taller y permisos de roles.
  - Captura automática de IP y User-Agent en cada evento.

---

## 2. Guía de Despliegue en Producción (Checklist de Infraestructura)

Para garantizar la calificación **A+** en herramientas como *SSL Labs* y *SecurityHeaders.com*:

1. **Certificado SSL/TLS**:
   - Usar Let's Encrypt o Cloudflare con renovación automática configurada.
   - Forzar redirección HTTP (puerto 80) a HTTPS (puerto 443) con código 301.
   - Habilitar únicamente suites de cifrado modernas (TLS 1.2 y TLS 1.3).
2. **Protección perimetral con WAF / Cloudflare**:
   - Activar el Web Application Firewall (WAF) con reglas OWASP CRS.
   - Activar protección contra ataques DDoS y bots automatizados.
   - Ocultar la dirección IP real del servidor de origen.
3. **Respaldo de Base de Datos (Regla 3-2-1)**:
   - Respaldo diario automático y cifrado de la base de datos SQLite o PostgreSQL.
   - Conservar al menos una copia externa fuera del servidor principal.
   - Probar la restauración de backups periódicamente.
4. **Supervisión en Google Search Console & Safe Browsing**:
   - Vincular el dominio en Search Console para recibir alertas tempranas de seguridad o malware.
