# CONTROLES DE SEGURIDAD WEB 2026

> Guía completa para (1) cumplir lo que Google exige para no marcar tu sitio como inseguro y (2) dificultar al máximo que un intruso entre o saque información.
> Fecha de referencia: octubre 2026. Pensado para una aplicación web con login, base de datos, facturación e inventario (ej. software de taller de motos), pero aplica a cualquier web.

---

## 0. Aclaración honesta antes de empezar

- **No existe el "100% seguro".** El objetivo real es: *hacer el ataque tan costoso y difícil que no valga la pena, y detectarlo y recuperarse rápido si ocurre.*
- **Google no da una "certificación de seguro".** Lo que existe es:
  1. **Chrome** muestra advertencia si no usas HTTPS válido.
  2. **Google Safe Browsing** te marca como peligroso si detecta malware, phishing, software no deseado o contenido engañoso (normalmente porque te hackearon).
  3. **Google Search Console** te avisa en "Problemas de seguridad".
- Por tanto: **HTTPS correcto + que nadie te hackee + no tener contenido engañoso = sitio "seguro" para Google.** Este documento cubre las tres cosas.

### Novedad 2026 que te afecta
- Desde **Chrome 154 (octubre 2026)** la opción *"Usar siempre conexiones seguras"* viene activada por defecto: Chrome intenta HTTPS primero y **muestra una advertencia antes de abrir cualquier sitio público sin HTTPS**. Un sitio en HTTP simplemente ya no es viable.
- Los certificados TLS públicos tienen **vida máxima cada vez más corta** (200 días desde marzo 2026, bajando por etapas hasta 47 días hacia 2029). **Sin renovación automática, tu sitio se cae.** Automatiza todo.

---

## 1. HTTPS / TLS (obligatorio para Google)

- [ ] Certificado TLS válido y de CA pública (Let's Encrypt, ZeroSSL, Cloudflare, etc.).
- [ ] **Renovación 100% automática** (certbot / acme.sh / Caddy / proveedor) con alerta si falla.
- [ ] Redirección **301 de HTTP → HTTPS** en todo el sitio (incluye `www` y subdominios).
- [ ] Solo **TLS 1.2 y TLS 1.3**. Desactivar SSLv3, TLS 1.0 y 1.1.
- [ ] Suites de cifrado modernas (AEAD: AES-GCM, ChaCha20-Poly1305). Sin RC4, 3DES, CBC débiles.
- [ ] **HSTS** activo: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (usa `preload` solo cuando estés seguro de que todos los subdominios son HTTPS).
- [ ] OCSP stapling activado.
- [ ] Sin **contenido mixto** (ni una imagen, script o CSS cargado por `http://`).
- [ ] Certificado cubre todos los hostnames que uses (`midominio.com`, `www`, `api`, `admin`).
- [ ] Registros **CAA** en DNS para limitar qué CA puede emitir certificados de tu dominio.
- [ ] Probar con **SSL Labs** (meta: calificación **A+**).

### Ejemplo Nginx (base)
```nginx
server {
    listen 80;
    server_name midominio.com www.midominio.com;
    return 301 https://midominio.com$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name midominio.com;

    ssl_certificate     /etc/letsencrypt/live/midominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/midominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    server_tokens off;
}
```

---

## 2. Cabeceras HTTP de seguridad

| Cabecera | Valor recomendado | Para qué sirve |
|---|---|---|
| `Content-Security-Policy` | Ver sección 2.1 | Frena XSS e inyección de scripts |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Fuerza HTTPS |
| `X-Content-Type-Options` | `nosniff` | Evita que el navegador "adivine" tipos MIME |
| `X-Frame-Options` | `DENY` (o `frame-ancestors 'none'` en CSP) | Anti-clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | No filtra URLs internas |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | Bloquea APIs que no usas |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aísla la ventana |
| `Cross-Origin-Resource-Policy` | `same-origin` | Evita que otros sitios lean tus recursos |
| `Cross-Origin-Embedder-Policy` | `require-corp` (si no rompe nada) | Aislamiento adicional |
| `Cache-Control` en páginas con datos | `no-store` | Que no se guarden facturas/datos en caché |

Quitar cabeceras que revelan tecnología: `Server`, `X-Powered-By`.

### 2.1 CSP estricta (punto de partida)
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM_POR_REQUEST}';
  style-src 'self' 'nonce-{RANDOM_POR_REQUEST}';
  img-src 'self' data: blob:;
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```
- Evita `'unsafe-inline'` y `'unsafe-eval'`. Usa **nonces o hashes**.
- Empieza en modo `Content-Security-Policy-Report-Only`, corrige, y luego pasa a modo enforce.
- Verifica con **securityheaders.com** y **Mozilla Observatory** (meta: A+).

---

## 3. Autenticación y sesiones (donde más atacan)

### 3.1 Contraseñas
- [ ] Hash con **Argon2id** (preferido) o bcrypt (cost ≥ 12). **Nunca** MD5, SHA1, SHA256 simple ni texto plano.
- [ ] Sal única por usuario (la librería moderna ya lo hace).
- [ ] Longitud mínima **12 caracteres**; permitir frases largas (hasta 64+). No forzar reglas absurdas; sí **bloquear contraseñas filtradas** (API *Have I Been Pwned* con k-anonymity).
- [ ] No exigir cambios periódicos sin motivo; sí forzar cambio si hay sospecha de filtración.
- [ ] Recuperación de contraseña con **token de un solo uso, aleatorio, expira en 15–30 min**, y respuesta idéntica exista o no el correo (evita enumerar usuarios).

### 3.2 MFA / Passkeys
- [ ] **MFA obligatorio** para administradores y cualquier rol con acceso a contabilidad/facturación.
- [ ] Preferir **Passkeys / WebAuthn (FIDO2)** — resistentes a phishing. Alternativa: TOTP (app autenticadora). **Evitar SMS** como único segundo factor.
- [ ] Códigos de recuperación de un solo uso, guardados hasheados.

### 3.3 Anti fuerza bruta
- [ ] **Rate limiting** por IP *y* por cuenta en login, recuperación y registro.
- [ ] Bloqueo temporal progresivo (backoff) tras intentos fallidos; no bloqueo permanente (permite DoS a usuarios).
- [ ] CAPTCHA/Turnstile/reCAPTCHA solo tras varios fallos.
- [ ] Mensajes de error **genéricos** ("credenciales inválidas"), sin decir cuál campo falló.
- [ ] Tiempo de respuesta constante (evita enumeración por timing).

### 3.4 Sesiones y cookies
- [ ] Cookies de sesión con `HttpOnly; Secure; SameSite=Lax` (o `Strict`) y prefijo `__Host-`.
- [ ] ID de sesión aleatorio criptográfico (≥128 bits), **regenerado tras el login** y tras cambios de privilegio.
- [ ] Expiración por inactividad (ej. 15–30 min) y expiración absoluta (ej. 8–12 h).
- [ ] **Logout real**: invalida la sesión en el servidor.
- [ ] Si usas JWT: vida corta (5–15 min) + refresh token rotativo y revocable; algoritmo fijo (no aceptar `none`); nunca guardarlo en `localStorage` (preferir cookie HttpOnly).
- [ ] Ver y **cerrar sesiones activas** desde el perfil; notificar logins desde dispositivos nuevos.

---

## 4. Autorización (control de acceso)

> "Broken Access Control" es la vulnerabilidad nº 1 del OWASP Top 10.

- [ ] **Denegar por defecto**: todo endpoint exige permiso explícito.
- [ ] **RBAC** con mínimo privilegio (ej. `admin`, `contador`, `mecánico`, `vendedor`). Cada rol solo ve y hace lo necesario.
- [ ] **Validar permisos en el servidor, siempre.** Ocultar un botón en el front no es seguridad.
- [ ] Prevenir **IDOR**: si piden `/factura/123`, comprobar que esa factura pertenece/está autorizada para ese usuario.
- [ ] Operaciones críticas (anular factura, ajustar inventario, borrar usuarios) → confirmación + registro de auditoría + (idealmente) reautenticación.
- [ ] Panel de administración en ruta/subdominio separado, con restricción por IP/VPN si es posible.
- [ ] Cuentas por defecto eliminadas o con contraseña única fuerte; cuentas inactivas deshabilitadas.

---

## 5. Validación de entradas y prevención de inyecciones

- [ ] **Consultas parametrizadas / ORM** siempre. **Prohibido** concatenar strings en SQL.
- [ ] Validar en el servidor **tipo, longitud, formato y rango** con una lista blanca (esquemas: Zod, Joi, Pydantic, etc.). La validación del front es solo comodidad.
- [ ] **Escapar la salida** según contexto (HTML, atributo, JS, URL). Usar frameworks que escapen por defecto; evitar `innerHTML`, `dangerouslySetInnerHTML`, `v-html` con datos de usuario.
- [ ] Sanitizar HTML permitido con librería probada (DOMPurify).
- [ ] Protección **CSRF**: cookies `SameSite` + token anti-CSRF en operaciones que cambian estado (o doble envío de cookie).
- [ ] Evitar **SSRF**: si el servidor hace peticiones a URLs que da el usuario, usar lista blanca y bloquear rangos internos (127.0.0.0/8, 10/8, 169.254.169.254, etc.).
- [ ] Evitar **path traversal** (`../`), **inyección de comandos** (no usar `exec`/`system` con datos del usuario), **XXE** (desactivar entidades externas en XML), **deserialización insegura**.
- [ ] Limitar tamaño de body, número de parámetros y profundidad de JSON.
- [ ] CORS: lista blanca explícita de orígenes; nunca `*` con credenciales.

---

## 6. Subida de archivos (fotos de productos, etc.)

- [ ] Validar **tipo real** por contenido (magic bytes), no solo por extensión ni `Content-Type`.
- [ ] Lista blanca: solo `jpg`, `png`, `webp`. Rechazar SVG con scripts, HTML, PHP, etc.
- [ ] Límite de tamaño (ej. 2–5 MB) y dimensiones.
- [ ] **Re-procesar la imagen** (redimensionar/recodificar) para eliminar código incrustado y metadatos EXIF (GPS).
- [ ] Renombrar con nombre aleatorio (UUID); **nunca** usar el nombre original.
- [ ] Guardar **fuera del directorio ejecutable** del servidor (o en almacenamiento de objetos S3/R2) y servir con `Content-Type` fijo + `X-Content-Type-Options: nosniff`.
- [ ] Escanear con antivirus (ClamAV) si procede.

---

## 7. Protección de datos

### 7.1 En tránsito y en reposo
- [ ] Todo el tráfico cifrado (HTTPS interno también entre servicios/BD si están en hosts distintos).
- [ ] **Cifrado en reposo**: disco/volumen de la BD y backups cifrados (LUKS, cifrado del proveedor cloud).
- [ ] Cifrado a nivel de campo para datos sensibles (documentos de identidad, datos bancarios, teléfonos) con claves gestionadas aparte.
- [ ] **Nunca** guardar datos de tarjetas. Si cobras en línea, usa pasarela (Wompi, PayU, Mercado Pago, Stripe) para que el dato nunca toque tu servidor (PCI DSS).

### 7.2 Secretos
- [ ] **Cero secretos en el código ni en el repositorio** (API keys, contraseñas de BD, claves JWT).
- [ ] Variables de entorno o gestor de secretos (Vault, Doppler, AWS/GCP Secret Manager).
- [ ] `.env` en `.gitignore`; escanear historial con **gitleaks / trufflehog**.
- [ ] **Rotar** secretos periódicamente y de inmediato si hay sospecha de filtración.
- [ ] Claves distintas por entorno (desarrollo / pruebas / producción).

### 7.3 Minimización
- [ ] Recolecta y guarda **solo lo necesario**; define tiempos de retención y borra lo que ya no uses.
- [ ] No registrar contraseñas, tokens ni datos personales completos en logs.
- [ ] Enmascarar datos en pantalla cuando sea posible (ej. `****1234`).
- [ ] Respuestas de API que devuelvan **solo los campos necesarios** (nada de enviar el objeto usuario completo con el hash).

---

## 8. Base de datos

- [ ] La BD **no es accesible desde internet**: solo desde la red privada / localhost del servidor de la app.
- [ ] Usuario de BD de la aplicación con **mínimos privilegios** (sin `DROP`, `GRANT`, `SUPERUSER`). Usuario distinto para migraciones.
- [ ] Contraseña larga y aleatoria; autenticación fuerte; TLS a la BD.
- [ ] Puerto no estándar no es seguridad, pero **firewall sí**: permitir solo la IP de la app.
- [ ] Auditoría de consultas sensibles y alertas de picos de lectura anormales (exfiltración).
- [ ] **Backups** (ver sección 13).

---

## 9. Servidor e infraestructura

### 9.1 Sistema operativo
- [ ] SO y paquetes **actualizados** con parches automáticos de seguridad (unattended-upgrades).
- [ ] Solo los servicios necesarios; desinstalar lo que no se use.
- [ ] **Firewall** (ufw/nftables/security groups): abrir solo 80/443 al público; SSH restringido.
- [ ] **SSH**: solo llaves (sin contraseña), `PermitRootLogin no`, **fail2ban/CrowdSec**, idealmente acceso por VPN/bastión y puerto limitado por IP.
- [ ] Usuarios no root para ejecutar la app; permisos de archivos mínimos (`chmod` estricto).
- [ ] Contenedores: imágenes mínimas (distroless/alpine), **no correr como root**, sin `--privileged`, filesystem de solo lectura cuando se pueda, límites de CPU/RAM.
- [ ] Endurecimiento según **CIS Benchmarks**.

### 9.2 Red y borde
- [ ] **WAF + CDN** (Cloudflare, AWS WAF, etc.) con reglas OWASP CRS, protección **DDoS** y **bot management**.
- [ ] Ocultar la IP real del servidor de origen (aceptar tráfico solo desde el CDN).
- [ ] **DNS seguro**: DNSSEC, bloqueo de transferencia de dominio, **MFA en el registrador y en el DNS** (el secuestro de dominio es una vía clásica de ataque).
- [ ] Protección contra *subdomain takeover* (eliminar registros DNS apuntando a servicios que ya no usas).
- [ ] Correo del dominio con **SPF, DKIM y DMARC** (`p=reject`) para que no suplanten tu dominio (phishing = Safe Browsing).
- [ ] Proteger paneles (phpMyAdmin, Adminer, Grafana, etc.): no exponerlos públicamente.

---

## 10. Código y cadena de suministro (OWASP 2025)

- [ ] **Dependencias**: auditar y actualizar (`npm audit`, `pip-audit`, Dependabot, Renovate, Snyk).
- [ ] Archivos de bloqueo (`package-lock.json`, etc.) versionados; instalar con `npm ci`.
- [ ] Revisar paquetes nuevos (typosquatting, mantenedores sospechosos); evitar librerías abandonadas.
- [ ] **SBOM** (lista de componentes) y escaneo de vulnerabilidades en CI.
- [ ] **SAST** (CodeQL, Semgrep) y **DAST** (OWASP ZAP) en el pipeline.
- [ ] **Escaneo de secretos** en pre-commit y CI.
- [ ] Ramas protegidas, **revisión de código obligatoria**, commits firmados, MFA en GitHub/GitLab.
- [ ] CI/CD con permisos mínimos; secretos del pipeline protegidos; despliegues solo desde ramas aprobadas.
- [ ] **Subresource Integrity (SRI)** si cargas JS/CSS de CDN externos (mejor aún: autoalojar).
- [ ] Reducir scripts de terceros al mínimo (analytics, chats, widgets): cada uno es una puerta de entrada.
- [ ] Modo debug **desactivado** en producción; sin stack traces visibles al usuario.

### Manejo de errores (nuevo en OWASP 2025)
- [ ] Errores controlados: nunca fallar "abierto" (si falla la verificación de permisos → **denegar**).
- [ ] Mensajes genéricos al usuario; detalle técnico solo en logs internos.
- [ ] Probar casos límite y excepciones (entradas vacías, nulas, enormes, concurrentes).

---

## 11. Seguridad de API

- [ ] Autenticación en **todos** los endpoints no públicos.
- [ ] Rate limiting y cuotas por usuario/clave/IP.
- [ ] Validación de esquema en entrada y salida; versionado de API.
- [ ] Evitar exponer IDs secuenciales (usar UUID) y *mass assignment* (lista blanca de campos que se pueden actualizar).
- [ ] Deshabilitar introspección/GraphQL playground y Swagger en producción (o protegerlos).
- [ ] Limitar métodos HTTP permitidos por ruta; responder `405` al resto.
- [ ] Paginación obligatoria y límites de resultados (evita volcado masivo de datos).
- [ ] Inventario de endpoints (eliminar los olvidados/"shadow APIs").

---

## 12. Registro, monitoreo y detección

- [ ] **Logs de auditoría**: logins (éxito/fallo), cambios de permisos, acciones sobre facturas/inventario/contabilidad, exportaciones, cambios de configuración. Con usuario, IP, fecha y acción.
- [ ] Logs **inmutables / centralizados** en otro servidor (si hackean el servidor, no pueden borrar sus huellas).
- [ ] **Alertas** en tiempo real (correo/Telegram/Slack) para: múltiples fallos de login, login desde país inusual, creación de admin, descargas masivas, errores 500 en aumento, cambios en archivos del servidor.
- [ ] Monitoreo de integridad de archivos (AIDE, Wazuh, OSSEC).
- [ ] Monitoreo de disponibilidad y expiración de certificados (UptimeRobot, Better Stack).
- [ ] **Google Search Console** verificado: revisa **"Problemas de seguridad"** y "Acciones manuales". Actívalo desde el día 1 para enterarte rápido si Google detecta algo.
- [ ] Revisar periódicamente el estado en **Google Safe Browsing Site Status** (transparencyreport.google.com/safe-browsing/search).
- [ ] Retención de logs ≥ 90 días (idealmente 12 meses).

---

## 13. Respaldo y recuperación (anti-ransomware)

- [ ] Regla **3-2-1**: 3 copias, 2 medios distintos, 1 fuera del sitio (offsite) y, mejor, **1 inmutable/offline**.
- [ ] Backups **automáticos, cifrados** y con retención definida (diaria / semanal / mensual).
- [ ] Credenciales de backup **separadas** de las del servidor principal (que un intruso no pueda borrarlos).
- [ ] **Probar la restauración** al menos cada trimestre (un backup no probado no existe).
- [ ] Definir **RPO/RTO** (cuántos datos puedes perder y cuánto tardas en volver).
- [ ] Infraestructura como código para reconstruir el servidor rápido.

---

## 14. Para que Google NO te marque como peligroso

Causas típicas de marcado y cómo evitarlas:

| Causa | Control |
|---|---|
| **Malware / código inyectado** (sitio hackeado) | Todo lo de este documento: parches, WAF, escaneo de integridad, sin plugins abandonados |
| **Phishing / ingeniería social** (páginas que imitan a otras o piden credenciales de forma engañosa) | No copiar marcas ajenas; formularios de login solo en tu dominio; DMARC activo; revisar que nadie suba páginas falsas en tu servidor |
| **Software no deseado / descargas engañosas** | No ofrecer ejecutables sin firma; sin botones de descarga falsos; sin anuncios de redes dudosas |
| **Contenido engañoso o redirecciones ocultas** | Auditar scripts de terceros; vigilar `.htaccess`, redirecciones y JS ofuscado |
| **HTTPS roto o expirado** | Renovación automática + monitoreo + HSTS |
| **Contenido mixto** | Todo recurso por HTTPS |
| **Sitio comprometido con SEO spam** (páginas ocultas de farmacia/casino) | Monitoreo de integridad, Search Console, revisar `site:tudominio.com` periódicamente |
| **Scripts de terceros comprometidos** | CSP estricta + SRI + minimizar terceros |
| **Subdominios olvidados** | Inventario DNS y eliminar los no usados |

### Si Google te marca (plan de respuesta)
1. Aislar: poner el sitio en mantenimiento.
2. Revisar el informe de **Search Console → Problemas de seguridad** (muestra URLs afectadas).
3. Limpiar: restaurar desde backup **limpio**, cambiar **todas** las credenciales y claves, parchear la causa raíz.
4. Solicitar **revisión** desde Search Console.
5. Documentar el incidente.

---

## 15. Cumplimiento legal (Colombia)

- [ ] **Ley 1581 de 2012 (Habeas Data)** y Decreto 1377/2013: política de tratamiento de datos personales publicada, **autorización informada** del titular, canal para consultas/reclamos (acceso, corrección, supresión).
- [ ] **Registro Nacional de Bases de Datos (RNBD)** ante la SIC, cuando aplique según tamaño de la empresa.
- [ ] Aviso de privacidad visible en formularios y en el pie de página.
- [ ] Medidas de seguridad técnicas/administrativas documentadas (principio de seguridad de la Ley 1581).
- [ ] **Plan de notificación de incidentes**: si hay filtración de datos personales, reportarla a la SIC (Superintendencia de Industria y Comercio) en los plazos que exija la norma vigente.
- [ ] Facturación: si emites **factura electrónica DIAN**, usar proveedor habilitado y proteger certificados de firma digital y claves de acceso.
- [ ] Términos y condiciones y política de cookies (si usas cookies no esenciales: consentimiento).
- [ ] Referencias internacionales útiles: **OWASP ASVS**, **ISO/IEC 27001**, **NIST CSF 2.0**, **CIS Controls v8**, **PCI DSS 4.0** (si se tocan pagos).

> Verifica siempre los plazos y requisitos con la norma vigente o un asesor legal; este documento es técnico, no asesoría jurídica.

---

## 16. Respuesta a incidentes

Prepara esto **antes** de necesitarlo:

1. **Roles**: quién decide, quién ejecuta, quién comunica.
2. **Detectar**: alertas (sección 12).
3. **Contener**: aislar el servidor, revocar sesiones y tokens, bloquear IPs, desactivar cuentas comprometidas.
4. **Erradicar**: encontrar y eliminar la causa (vulnerabilidad, credencial filtrada, puerta trasera).
5. **Recuperar**: restaurar desde backup limpio, rotar TODOS los secretos, monitoreo reforzado.
6. **Notificar**: usuarios afectados y autoridad (SIC) si hay datos personales.
7. **Aprender**: post-mortem y mejorar controles.
- [ ] Lista de contactos de emergencia y procedimiento impresos/fuera del sistema afectado.
- [ ] Simulacro al menos una vez al año.

---

## 17. Pruebas de seguridad (verificación continua)

| Herramienta | Qué verifica |
|---|---|
| **SSL Labs** (ssllabs.com/ssltest) | TLS, certificado, protocolos |
| **securityheaders.com** | Cabeceras HTTP |
| **Mozilla Observatory** | Configuración general web |
| **OWASP ZAP** / Burp Suite | Escaneo dinámico de vulnerabilidades |
| **Nuclei** / Nikto | Configuraciones y CVEs conocidos |
| **Semgrep / CodeQL** | Análisis estático del código |
| **gitleaks / trufflehog** | Secretos en el repositorio |
| **npm audit / pip-audit / Trivy** | Dependencias e imágenes de contenedor |
| **Lynis** | Auditoría del servidor Linux |
| **Search Console + Safe Browsing Site Status** | Estado frente a Google |
| **Pentest externo** | Revisión humana independiente (antes de salir a producción y 1 vez al año) |

Frecuencia sugerida: escaneos automáticos en **cada commit/despliegue**, escaneo completo **mensual**, pentest **anual**.

---

## 18. Capa extra: Zero Trust y endurecimiento avanzado

- [ ] Acceso administrativo solo mediante **VPN / Zero Trust** (Cloudflare Access, Tailscale, WireGuard).
- [ ] Separación de entornos (dev / staging / producción) sin compartir datos reales en desarrollo.
- [ ] **Segmentación de red**: app, BD y backups en segmentos distintos.
- [ ] Principio de mínimo privilegio también para cuentas cloud (IAM) y claves de API.
- [ ] **Allowlist de salida** (egress filtering): el servidor solo puede conectarse a destinos necesarios; dificulta la exfiltración.
- [ ] Contenedores/servicios con perfiles AppArmor/SELinux/seccomp.
- [ ] Honeytokens / credenciales señuelo que disparan alerta si alguien las usa.
- [ ] Capacitación del personal en phishing e ingeniería social (la persona suele ser el eslabón más débil).
- [ ] Dispositivos del equipo: disco cifrado, bloqueo automático, antivirus/EDR, actualizaciones al día.
- [ ] Gestor de contraseñas corporativo; prohibido reutilizar contraseñas.

---

## 19. Controles específicos para sistema de taller (inventario + facturación + contabilidad)

- [ ] **Roles separados**: quien factura no ajusta inventario; quien ajusta inventario no ve contabilidad completa.
- [ ] **Facturas inmutables**: no se editan; se anulan con nota crédito y queda registro.
- [ ] Auditoría de **cada movimiento de inventario** (quién, cuándo, cantidad antes/después).
- [ ] **Lector de código de barras**: tratar el texto escaneado como entrada **no confiable** (validar formato, longitud y caracteres; consulta parametrizada). Un código de barras malicioso puede contener inyección.
- [ ] Alertas de stock bajo no deben exponer datos a usuarios sin permiso.
- [ ] Exportaciones (Excel/PDF) restringidas por rol, registradas y con límite de volumen.
- [ ] Impresión/PDF de facturas generados en servidor con plantillas sin ejecución de código del usuario.
- [ ] Cierre contable por periodo (bloquea modificaciones a periodos cerrados).
- [ ] Copia de seguridad diaria de contabilidad y facturación, con prueba de restauración.

---

## 20. Lista de verificación final (pre-lanzamiento)

**Crítico (no lanzar sin esto)**
- [ ] HTTPS válido + redirección + HSTS + renovación automática
- [ ] Contraseñas con Argon2id/bcrypt + rate limit + MFA para admins
- [ ] Consultas parametrizadas y validación del lado servidor
- [ ] Autorización verificada en servidor (sin IDOR)
- [ ] Cookies `HttpOnly; Secure; SameSite`
- [ ] BD no expuesta a internet; usuario de BD con mínimos privilegios
- [ ] Sin secretos en el repositorio; `.env` fuera de git
- [ ] Debug apagado; errores genéricos
- [ ] Backups automáticos probados, con copia offsite
- [ ] Firewall + SSH con llaves + actualizaciones automáticas
- [ ] Cabeceras de seguridad + CSP en vigor
- [ ] Google Search Console verificado

**Importante (primeras semanas)**
- [ ] WAF/CDN con protección DDoS
- [ ] Logs centralizados + alertas
- [ ] Escaneo de dependencias y de secretos en CI
- [ ] SPF/DKIM/DMARC
- [ ] Política de privacidad y autorización de datos (Ley 1581)
- [ ] Plan de respuesta a incidentes escrito

**Mejora continua**
- [ ] Pentest anual
- [ ] Revisión trimestral de accesos y permisos
- [ ] Simulacro de restauración trimestral
- [ ] Rotación de secretos programada
- [ ] Actualizar este documento cada 6 meses (las amenazas y requisitos cambian)

---

## Referencias recomendadas

- OWASP Top 10 (edición 2025) y OWASP ASVS: owasp.org
- OWASP Cheat Sheet Series: cheatsheetseries.owasp.org
- Google Safe Browsing / Transparency Report: transparencyreport.google.com/safe-browsing
- Google Search Console – Informe de problemas de seguridad
- Chrome Security Team – "HTTPS by default" (Chrome 154)
- Mozilla SSL Configuration Generator: ssl-config.mozilla.org
- NIST CSF 2.0, CIS Controls v8, CIS Benchmarks

---

*Documento generado como guía técnica de buenas prácticas. Adáptalo a tu stack (Node, Python, PHP, etc.) y revísalo con un profesional de ciberseguridad antes de salir a producción.*
