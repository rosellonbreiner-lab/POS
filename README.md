# Sistema de Gestión Comercial, POS & ERP Multinegocio 🚀

> **Plataforma web integral de alto rendimiento para Punto de Venta (POS), Facturación Electrónica/Térmica, Inventario con Coordenadas Físicas, Módulo Exclusivo de Bajo Stock, Cartera de Créditos, Órdenes de Trabajo y Contabilidad.**  
> Diseñada bajo arquitectura **Multi-Tenant**, experiencia de usuario **PWA (Progressive Web App)** instalable en Android y estándares estrictos de ciberseguridad **OWASP Top 10 (2025/2026)**.

---

## 📚 Documentación Oficial de Entregables de Ingeniería de Software

Este repositorio contiene la entrega técnica integral del sistema **MotoTaller v2.4.0**, estructurada conforme a la **Guía Maestra de Entregables de Software** (Requisitos SRS, Diagramas UML, Base de Datos, Pruebas, Seguridad, Manuales y Despliegue):

### 📄 Documentos de Entrega Oficiales (Word & PDF)
| Documento | Formato Editable | Formato Portable | Descripción |
| :--- | :---: | :---: | :--- |
| **Documento Maestro de Entregables** | [Descargar .docx](./DOCUMENTO_ENTREGABLES_PROYECTO_MOTOTALLER.docx) | [Descargar .pdf](./DOCUMENTO_ENTREGABLES_PROYECTO_MOTOTALLER.pdf) | Libro completo con SRS (16 RF / 10 RNF), Arquitectura, 8 Diagramas, DER, APIs, 10 Casos de Prueba, Seguridad y Acta de Entrega con firmas. |
| **Manual de Usuario y Operación** | [Descargar .docx](./MANUAL_DE_USUARIO_Y_OPERACION_MOTOTALLER.docx) | [Descargar .pdf](./MANUAL_DE_USUARIO_Y_OPERACION_MOTOTALLER.pdf) | Guía práctica de 17 capítulos con instrucciones paso a paso, flujogramas de ventas POS, checklist de taller y preguntas frecuentes. |

### 🖼️ Galería de Diagramas de Arquitectura y UML (200 DPI)
Los diagramas visuales generados se encuentran alojados en la carpeta [`/docs_images/`](./docs_images/):
1. **[Diagrama de Arquitectura de Software en 4 Capas](./docs_images/diagrama_arquitectura.png)** (Cliente PWA, Túnel ngrok, Next.js 16 API y SQLite WAL).
2. **[Diagrama de Casos de Uso UML](./docs_images/diagrama_casos_de_uso.png)** (5 actores: Cajero, Mecánico, Administrador, Bodeguero, Superadmin).
3. **[Diagrama de Flujo: Proceso de Ventas POS y Descuentos](./docs_images/diagrama_flujo_pos.png)** (BPMN del proceso de cobro en mostrador).
4. **[Diagrama de Flujo: Ciclo de Vida y Servicio en Taller](./docs_images/diagrama_flujo_taller.png)** (Atención de motos, checklist y consumo de repuestos).
5. **[Diagrama Entidad-Relación (DER Conceptual)](./docs_images/diagrama_entidad_relacion.png)** (Modelo relacional de 18 entidades en Prisma).
6. **[Diagrama de Despliegue Físico y de Red](./docs_images/diagrama_despliegue.png)** (PC mostrador, periféricos USB, túnel seguro y móviles).
7. **[Diagrama de Secuencia UML](./docs_images/diagrama_secuencia_pos.png)** (Transacción sincrónica en el POS).
8. **[Máquina de Estados de la Orden de Trabajo](./docs_images/diagrama_estados_orden.png)** (Estados: RECIBIDA -> DIAGNÓSTICO -> REPARACIÓN -> LISTA -> ENTREGADA).

---

## 📱 Novedad: Aplicación Instalable en Android (PWA)

El software cuenta con tecnología **Progressive Web App (PWA)** que permite instalarlo directamente en cualquier teléfono inteligente Android (así como en tablets, computadores y dispositivos iOS) como si fuese una **App nativa**:

- **Instalación con 1 Clic**: Al abrir el sistema desde el navegador del celular (Chrome/Edge), aparece un banner flotante inferior con el botón **"Instalar Ahora"**, o desde el menú lateral tocando **"Instalar App en Celular"**.
- **Acceso Directo en Pantalla de Inicio**: Crea el icono oficial con el logotipo del sistema en el menú de aplicaciones de tu teléfono.
- **Modo Standalone (Pantalla Completa)**: Se abre sin barra de direcciones URL, sin pestañas del navegador y sin distracciones, optimizando el 100% de la pantalla del celular.
- **Service Worker con Caché Inteligente (`/sw.js`)**: Acelera la apertura de la aplicación precacheando recursos clave, garantizando fluidez incluso con conexiones móviles inestables.
- **Estrategia Network-First para APIs**: Todas las operaciones de facturación, inventario y dinero viajan en tiempo real directo a la base de datos sin riesgo de información obsoleta.
- **Soporte para iPhone / iPad**: Incluye modal instructivo automático para Safari (*Compartir > Agregar a pantalla de inicio*).

---

## 🎨 Identidad Visual Corporativa & Paletas Dinámicas

### Paleta Base del Sistema
| Token / Código | Nombre | Aplicación |
| :--- | :--- | :--- |
| `#0D1117` | Tech Dark Background | Fondo global con rejilla cibernética y resplandor radial |
| `#1F3A5F` | Deep Navy | Encabezados, barras de navegación, botones primarios y sombras |
| `#5AA9E6` | Vivid Cyan / Sky Blue | Acentos de estado, gráficos Anime.js, bordes neón e indicadores activos |
| `#EAF4F4` | Ice White / Slate Soft | Textos de alto contraste, cifras clave y lectura limpia |
| `#222831` | Dark Graphite Slate | Tarjetas de datos, paneles modales y recuadros de métricas |

### Personalización Multi-Tenant por Empresa
Desde el panel de **Superadmin**, cada empresa registrada (Taller de Motos, Ferretería, Tienda/Comercio) puede configurar su propia paleta de colores (`primaryColor` y `secondaryColor`), logotipo corporativo, lema, NIT, teléfono y mensajes para el ticket térmico. El selector del menú lateral y los botones del sistema se adaptan en tiempo real al color corporativo de la empresa activa.

---

## 📦 Módulos del Sistema en Detalle

### 1. Dashboard & Analítica en Tiempo Real
- **KPIs en Vivo**: Ventas del día, utilidad neta estimada calculada en tiempo real, órdenes activas y total de cotizaciones emitidas.
- **Accesos Rápidos Responsivos**: Tarjetas con acceso directo a *Facturar en Mostrador*, *Asignar Repuestos a Moto* y *Hacer Cotización*, adaptables a 1 columna en móvil y 3 columnas en escritorio.
- **Aislamiento Multi-Empresa**: El Superadmin puede consultar métricas consolidadas de todas las empresas o filtrar por una empresa en particular.

### 2. Inventario & Kardex con Coordenadas Físicas
- **Ubicación Física en Almacén**: Mapeo exacto de repuestos y productos por **Estante**, **Nivel** y **Posición** (ej. `E-01 / Nivel 2 / P-03`).
- **Chip de Ubicación Interactivo**: Visualización gráfica del casillero físico para despacho rápido en mostrador.
- **Filtros Rápidos por Motocicleta / Categoría**: Acceso inmediato a repuestos para Boxer CT 100, AKT NKD 125, Eco Deluxe, FZ 16, Pulsar, etc.
- **Escáner de Código de Barras**: Detección con pistola láser USB/Bluetooth o cámara del celular.
- **Eliminación y Descontinuación Segura**: Eliminación limpia de repuestos obsoletos sin romper la integridad referencial de facturas pasadas.

### 3. Módulo Exclusivo de Bajo Stock & Pedidos a Proveedores
Diseñado específicamente para agilizar la reposición de mercancía sin perder tiempo:
- **Detección Automática de Existencias Críticas**: Filtra en tiempo real todos los artículos con `stock actual <= stock mínimo` y resalta en rojo los **Agotados Críticos (0 unidades)**.
- **Cálculo Sugerido de Reposición**: Determina automáticamente las unidades exactas que se deben pedir para restablecer el stock óptimo.
- **Ajuste Interactivo (+ / -)**: Permite subir o bajar unidades a solicitar de cada repuesto directamente en la tabla.
- **Inversión Costo Estimada**: Totaliza el dinero exacto requerido para hacer el pedido a precio de costo de compra.
- **Generador de Pedidos a WhatsApp en 1 Clic**: Genera un mensaje formateado con emojis, listado de repuestos, cantidades y referencias listo para copiar y enviar al proveedor por WhatsApp.
- **Recepción Rápida de Mercancía**: Botones interactivos `+5`, `+10` y `+Todo` para sumar inmediatamente el stock al inventario cuando llega el camión de repuestos.

### 4. Punto de Venta (POS) & Facturación
- **Lector de Códigos con Pistola**: Al disparar la pistola de código de barras estando en el POS, el producto se agrega **inmediatamente al carrito de venta** con sonido beep de confirmación.
- **Cámara en Vivo de Alta Velocidad (60 FPS)**: Modal de escaneo continuo con la cámara del celular utilizando la API nativa `BarcodeDetector` y fallback automático `Html5Qrcode`. Cuenta con botón para encender linterna (flash) y voltear entre cámara trasera y delantera.
- **Precios Negociables**: Posibilidad de modificar el precio de venta acordado con el cliente al momento de facturar, registrando el descuento otorgado.
- **Descuento Extra a la Factura**: Campo para aplicar rebajas globales en pesos colombianos ($ COP) distribuidas proporcionalmente entre los artículos.
- **Múltiples Formas de Pago**: Efectivo en caja, Transferencia bancaria (Nequi, Daviplata, Bancolombia) y Venta a Crédito (Fiado).
- **Impresión Térmica**: Generación de ticket térmico formateado para impresoras de 58 mm y 80 mm con datos fiscales y desglose.

### 5. Órdenes de Trabajo (Taller de Motocicletas)
- **Control por Placa y Cliente**: Registro de moto, cliente, teléfono y diagnóstico del trabajo a realizar.
- **Asignación Dinámica de Piezas**: Modal *"Poner / Quitar Repuestos"* para ir agregando repuestos a la motocicleta conforme el mecánico los va instalando, descontándolos del inventario en tiempo real.
- **Facturación en 1 Clic**: Al entregar la moto terminada, el botón *"Terminar & Facturar"* genera la factura oficial de venta y el ticket para el cliente.

### 6. Cotizaciones Formales
- Elaboración de presupuestos previos para clientes sin descontar inventario antes de tiempo.
- Impresión de ticket térmico cotizado.
- Botón **"Pasar a Venta"**: Convierte la cotización en una venta oficial con factura en segundos cuando el cliente aprueba el presupuesto.

### 7. Créditos y Cartera (Ventas Fiadas)
- Registro detallado de cuentas por cobrar originadas en el Punto de Venta.
- **Historial de Abonos**: Modal para registrar pagos parciales en efectivo o transferencia, indicando quién recibió el dinero.
- **Cálculo Automático de Saldo**: Indicador visual de saldo pendiente o *Paz y Salvo* total.
- **Comprobante de Abono**: Impresión de recibo térmico con saldo anterior, abono realizado y saldo restante.

### 8. Contabilidad & Arqueo Diario de Caja
- **Filtro por Fecha y Calendario**: Consulta de caja de *Hoy*, *Ayer*, *Últimos 7 días* o cualquier día seleccionado en el calendario.
- **Balance Financiero**: Desglose de ingresos por ventas de mostrador vs. ingresos por abonos de cartera de créditos.
- **Reporte de Arqueo**: Impresión de comprobante diario para cuadre de caja al cierre del turno.

### 9. Auditoría de Seguridad Inmutable
- Bitácora persistente de eventos del sistema: inicios de sesión, intentos bloqueados por fuerza bruta, creación de usuarios, cambios de roles y eliminación de repuestos con IP, fecha y User-Agent.

### 10. Panel de Configuración & Superadmin
- **Gestión Multi-Empresa**: Creación de nuevas sucursales o empresas independientes con sus propias paletas de colores y datos fiscales.
- **Control de Usuarios**: Creación y edición de cuentas de usuario, asignación de empresa y roles (`SUPERADMIN`, `ADMIN`, `TRABAJADOR`).
- **Matriz Dinámica de Permisos (RBAC)**: Activación y desactivación en vivo de módulos y funcionalidades permitidas por rol.
- **Copias de Seguridad (Backups ZIP)**: Descarga y restauración de backups de la base de datos y configuraciones con código de confirmación de seguridad.
- **Crédito de Autor By Breiner Rosellon**: Configuración desde Superadmin para activar/desactivar el hipervínculo de autor en el footer del login y personalizar la URL de destino.

---

## 🔒 Seguridad y Protección Web 2026 (OWASP Top 10)

- **Cifrado Argon2id**: Almacenamiento seguro de credenciales con coste de memoria de 19 MiB (`m=19456`, `t=2`).
- **Protección contra Timing Attacks**: Verificación criptográfica con hash *dummy* para impedir la enumeración de usuarios por medición de tiempos de respuesta.
- **Cookies de Sesión Blindadas**: Flags `HttpOnly`, `SameSite: "lax"`, `Secure: true` y rotación de tokens criptográficos de 256 bits.
- **Rate Limiting Anti Fuerza Bruta**: Bloqueo progresivo tras 5 intentos fallidos consecutivos en `/api/auth/login`.
- **Emblema de Seguridad POS Dinámico**: Componente interactivo en el login que reacciona a los campos de correo y contraseña con estados visuales de protección.
- **Cabeceras HTTP de Seguridad (Security Headers)**:
  - `Strict-Transport-Security (HSTS)`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy (CSP)` estricta
  - `Permissions-Policy` configurada para permitir la cámara exclusivamente en orígenes HTTPS seguros.

---

## 📶 Soporte HTTPS Local para Cámara en Celulares

Para que los navegadores móviles (Chrome en Android y Safari en iOS) permitan el acceso a la cámara web sin restricciones de seguridad de Google, el servidor incluye soporte HTTPS experimental local con certificados SSL válidos para la red local:

- Certificados ubicados en `./certificates/server.key` y `./certificates/server.crt`.
- Incluyen nombres alternativos del sujeto (SAN) para `localhost`, `127.0.0.1` y la IP local `192.168.1.215`.
- Script de arranque preconfigurado:
  ```bash
  npm run dev
  ```
  Inicia en `https://0.0.0.0:3000` permitiendo conectarse desde el teléfono móvil a través de `https://192.168.1.215:3000`.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Framework Web** | Next.js 16 (App Router + Turbopack) |
| **PWA & Offline** | Web App Manifest W3C, Service Worker API (`/sw.js`), Cache Storage API |
| **Librerías UI** | React 19, TypeScript 5, Tailwind CSS v4, Lucide React Icons |
| **Animaciones** | Anime.js, Framer Motion, CSS Keyframes |
| **Escáner de Barras** | Native BarcodeDetector API (60fps), `html5-qrcode`, WebRTC `getUserMedia` |
| **Base de Datos & ORM**| Prisma ORM 6, SQLite / PostgreSQL |
| **Criptografía** | Argon2id (`argon2`), Node.js `crypto` (SHA-256 / Random Bytes) |
| **Certificados SSL** | `selfsigned` con SANs para IP local |

---

## 💻 Puesta en Marcha & Actualizaciones Seguras

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente Prisma
npx prisma generate

# 3. Iniciar servidor con HTTPS para escaneo móvil y PWA
npm run dev

# 4. Modo HTTP estándar (opcional)
npm run dev:http

# 5. Compilación de verificación de tipos (TypeScript)
npx tsc --noEmit

# 6. Compilación para producción
npm run build
npm run start
```

### 🛡️ Actualización Continua Sin Pérdida de Datos (Zero-Data-Loss)

Para instalar futuras actualizaciones o cambios de funcionalidad manteniendo el 100% de los datos guardados en SQLite y la configuración multi-empresa:

```bash
# Actualización Segura Integral (Snapshot + Prisma Push sin pérdida + WAL + Verificación)
npm run update:safe

# Copia de Seguridad Instantánea
npm run db:backup

# Restauración de la Última Copia Verificada
npm run db:restore

# Chequeo de Integridad y Recuento de Registros
npm run db:verify
```

---

## 📄 Créditos y Autoría

Desarrollado y mantenido por **Breiner Rosellon**.  
Repositorio oficial: [https://github.com/rosellonbreiner-lab/POS](https://github.com/rosellonbreiner-lab/POS)  
Licencia Privada y Comercial © 2026. Todos los derechos reservados.
