# MotoTaller POS & ERP — Sistema de Gestión Comercial y Taller Especializado

> Plataforma centralizada de alto rendimiento para control de ventas (POS), facturación, inventario multialmacén con coordenadas físicas, contabilidad, flujo de caja, cartera/créditos y órdenes de trabajo.
> Diseñada bajo estrictos estándares de ciberseguridad **OWASP Top 10 (2025/2026)** y directrices de protección web **Google Safe Browsing**.

---

## 🎨 Paleta de Identidad Visual Corporativa

La interfaz de usuario implementa un esquema de color de contraste ergonómico y moderno:

| Token / Código | Nombre del Color | Uso Principal |
| :--- | :--- | :--- |
| `#1F3A5F` | Deep Navy | Barras de navegación, cabeceras modales, botones primarios y sombras |
| `#5AA9E6` | Vivid Cyan / Sky Blue | Acentos de estado, selecciones activas, indicadores y gráficos |
| `#EAF4F4` | Ice White / Slate Soft | Textos de alto contraste, cifras clave e iconos destacados |
| `#222831` | Dark Graphite Slate | Fondo de contenedores, tarjetas de datos y paneles de interfaz |

---

## 🔐 Seguridad y Protección Web 2026

La aplicación ha sido blindada para prevenir intrusiones, proteger los datos del negocio y garantizar el cumplimiento frente a motores de búsqueda y navegadores modernos (Chrome 154+):

### 1. Autenticación y Criptografía
- **Argon2id Hashing**: Cifrado moderno de contraseñas con coste de memoria de 19 MiB (`m=19456`, `t=2`), superando SHA-256 y bcrypt estándar.
- **Protección contra Timing Attacks**: Verificación criptográfica con hash *dummy* para igualar el tiempo de cómputo en intentos con correos inexistentes, neutralizando la enumeración de usuarios por análisis de latencia.
- **Tokens de Sesión Aleatorios de 256 bits**: Generados con `crypto.randomBytes(32)` y almacenados en la base de datos como hash SHA-256.
- **Cookies de Sesión Endurecidas**:
  - `HttpOnly: true` (inaccesible desde scripts del navegador / anti-XSS).
  - `SameSite: "lax"` (protección contra Cross-Site Request Forgery).
  - `Secure: true` (forzado en producción).
  - Expiración absoluta de 12 horas.
- **Anti Fuerza Bruta & Rate Limiting**:
  - Limitador en memoria por IP y por cuenta en `/api/auth/login`.
  - Bloqueo temporal automático tras 5 intentos fallidos consecutivos (15 minutos de enfriamiento progresivo).
  - Encabezado estándar `Retry-After`.
- **Login Limpio**: Sin atajos ni credenciales pre-rellenas en el formulario público.

### 2. Control de Acceso y Autorización por Rol (RBAC)
- **Validación del lado servidor**: Cada endpoint valida la sesión activa y los permisos (`SUPERADMIN`, `ADMIN`, `TRABAJADOR`).
- **Super Administrador (`SUPERADMIN`)**:
  - Acceso total e irrestricto al sistema.
  - Gestión centralizada de usuarios y consulta/recuperación de credenciales.
  - Matriz dinámica de permisos: activación y desactivación selectiva de módulos y funcionalidades por rol en tiempo real.
  - Acceso exclusivo al registro inmutable de **Auditoría de Seguridad**.
- **Administrador / Dueño (`ADMIN`)**:
  - Gestión integral de ventas, cotizaciones, órdenes de trabajo, clientes y cartera.
  - Eliminación y descontinuación autorizada de repuestos obsoletos del inventario.
  - Arqueo de caja y reportes de rentabilidad.
- **Operador / Trabajador (`TRABAJADOR`)**:
  - Facturación rápida en Punto de Venta (POS) y escaneo de códigos de barra.
  - Creación de órdenes de trabajo y consulta operativa de stock.
  - Restricción estricta: No tiene acceso a contabilidad, configuración ni logs de auditoría.

### 3. Cabeceras HTTP de Seguridad (HTTP Security Headers)
Implementadas de forma unificada en `next.config.ts` y en el middleware de enrutamiento:
- `Strict-Transport-Security (HSTS)`: `max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options`: `DENY` (mitigación contra Clickjacking e incrustación en iframes maliciosos).
- `X-Content-Type-Options`: `nosniff` (impide el sniffing de tipos MIME).
- `Referrer-Policy`: `strict-origin-when-cross-origin` (previene fugas de URLs internas).
- `Permissions-Policy`: Restringe geolocalización, micrófono y APIs no utilizadas.
- `Cross-Origin-Opener-Policy`: `same-origin`
- `Cross-Origin-Resource-Policy`: `same-origin`
- `Content-Security-Policy (CSP)`: Reglas de orígenes autorizados para scripts, estilos y fuentes.
- `poweredByHeader: false`: Oculta la cabecera `X-Powered-By: Next.js` para reducir la superficie de huella tecnológica.
- `Cache-Control: no-store`: Forzado en rutas de API para evitar el almacenamiento de información fiscal o sensible en memorias caché intermedias.

### 4. Auditoría Inmutable (Audit Log)
- Registro persistente de eventos clave: inicios de sesión exitosos y fallidos, bloqueos por fuerza bruta, creación de usuarios, eliminación de artículos y cambios de configuración, incluyendo marca temporal, dirección IP y User-Agent.

---

## 🚀 Funcionalidades Principales

1. **Punto de Venta Rápido (POS)**:
   - Facturación con soporte para descuentos por ítem o generales.
   - Múltiples métodos de pago (Efectivo, Transferencia, Nequi/Daviplata, Tarjeta, Crédito).
   - Generación de tickets e impresión térmica de 80 mm.
2. **Control de Inventario Multialmacén & Kardex**:
   - Mapeo físico exacto de coordenadas: Bodega, Estante, Nivel y Posición.
   - Modal interactivo de visualización de estantería.
   - Eliminación definitiva de repuestos sin historial comercial o descontinuación automática sin romper la trazabilidad histórica de facturas previas.
   - Soporte para escáner láser de código de barras y cámara web.
3. **Contabilidad & Calendario de Arqueos**:
   - Navegación temporal con selector de fecha para auditar ventas de días anteriores por separado.
   - Balance diario de ingresos, gastos y márgenes de utilidad neta.
4. **Gestión de Órdenes de Servicio y Taller**:
   - Seguimiento del estado de reparación de vehículos y asignación de mano de obra y repuestos.

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Anime.js
- **Base de Datos & ORM**: Prisma ORM, SQLite / PostgreSQL
- **Criptografía**: Argon2id (`argon2`), Node.js `crypto`
- **Manejo de Estado & UI**: React Hooks con sincronización API REST

---

## 💻 Puesta en Marcha (Desarrollo)

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con Turbopack
npm run dev

# Compilación de verificación de tipos
npx tsc --noEmit
```

El servidor iniciará por defecto en `http://localhost:3000` (o `http://0.0.0.0:3000` para pruebas en red local).
