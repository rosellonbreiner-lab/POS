# Documentación Técnica y Manual de Usuario Oficial
## Sistema de Gestión Comercial, POS & ERP Multinegocio (PWA)

**Versión**: 2.5 (2026)  
**Autor & Desarrollador Principal**: Breiner Rosellon  
**Repositorio GitHub**: [https://github.com/rosellonbreiner-lab/POS](https://github.com/rosellonbreiner-lab/POS)

---

# PARTE 1: MANUAL DE USUARIO

## 1. Instalación de la Aplicación en Teléfonos Android (PWA)

El software no requiere descargar un archivo `.apk` pesado desde tiendas externas; funciona como una **Progressive Web App (PWA)** instalable con 1 solo toque:

1. **Abrir el Navegador**: Desde tu celular Android, abre Google Chrome o Microsoft Edge e ingresa a la dirección web del sistema (ej. `https://192.168.1.215:3000`).
2. **Notificación de Instalación**: Al ingresar, verás en la parte inferior de la pantalla un recuadro flotante que dice:  
   *"Instalar POS en tu Teléfono — Accede en 1 toque desde la pantalla de inicio, en pantalla completa y sin barra de direcciones"*.
3. **Pulsar "Instalar Ahora"**: Toca el botón azul. El sistema operativo Android te preguntará: *¿Deseas instalar la aplicación?*. Confirma tocando **Instalar**.
4. **Acceso desde el Menú**: Si cerraste el aviso, puedes tocar el botón de menú hamburguesa (arriba a la izquierda) y seleccionar la opción **"Instalar App en Celular"**.
5. **Listo**: En tu pantalla de inicio aparecerá el icono oficial de la aplicación. Al tocarlo, el sistema se abrirá en **pantalla completa (Standalone)**, ocultando la barra del navegador para trabajar con la máxima velocidad y comodidad.

*(Para dispositivos Apple iPhone / iPad: Toca el botón Compartir en Safari y selecciona "Agregar a la pantalla de inicio").*

---

## 2. Acceso y Autenticación de Usuarios

1. **Ingreso de Credenciales**: Ingresa tu correo electrónico registrado y contraseña.
2. **Emblema de Seguridad Interactivo**: El escudo de seguridad POS reacciona protegiendo visualmente los accesos cuando te posicionas en el campo de contraseña.
3. **Control Anti Fuerza Bruta**: Por seguridad bancaria y comercial, si se introducen 5 contraseñas incorrectas de manera consecutiva, el sistema bloquea temporalmente los intentos durante 15 minutos para evitar ataques automatizados.
4. **Roles de Usuario**:
   - **SUPERADMIN**: Acceso irrestricto, configuración multi-empresa, creación de usuarios, paletas de colores, backups y auditoría.
   - **ADMIN**: Gestión total del negocio asignado (ventas, compras, inventario, eliminación de artículos, créditos, arqueos).
   - **TRABAJADOR**: Operación de mostrador (facturación rápida, consulta de stock y órdenes de trabajo).

---

## 3. Módulo de Bajo Stock & Pedidos Rápidos a Proveedores

Este módulo fue diseñado para resolver el problema de quedarse sin existencias y tardar horas calculando qué pedir a los distribuidores:

1. **Indicadores en Tiempo Real**:
   - **Artículos Bajo Stock**: Total de productos cuyo stock actual es menor o igual al mínimo establecido.
   - **Agotados Críticos (0)**: Productos sin una sola unidad en almacén.
   - **Total Unidades a Pedir**: Suma de todas las piezas requeridas para restablecer el almacén.
   - **Inversión Costo Estimada**: Cuánto dinero en pesos colombianos ($ COP) costará comprar el pedido a precio de costo.
2. **Ajuste de Unidades**: En la tabla, cada producto cuenta con botones `+` y `-` para aumentar o reducir las unidades sugeridas antes de emitir la orden.
3. **Copiar Pedido a WhatsApp**:
   - Haz clic en el botón verde **"Copiar Pedido a WhatsApp"**.
   - El sistema copiará automáticamente al portapapeles un texto formateado profesionalmente con el nombre del negocio, fecha, cada repuesto con su cantidad solicitada y el total sugerido.
   - Solo debes abrir la conversación con tu distribuidor/proveedor en WhatsApp y presionar **Pegar (Ctrl+V o Mantener presionado)**.
4. **Recepción Rápida al Llegar la Mercancía**:
   - Cuando el camión o repartidor entrega los repuestos, no necesitas editar producto por producto.
   - Usa los botones rápidos `+5`, `+10` o `+Todo` en la columna de recepción para ingresar el stock al inventario de inmediato.

---

## 4. Punto de Venta (POS) & Facturación

1. **Adición por Pistola Láser**: Al disparar la pistola sobre el código de barras de cualquier repuesto, el sistema emite un pitido y lo agrega directamente al carrito con cantidad 1. Si se vuelve a disparar el mismo código, suma otra unidad.
2. **Escaneo con Cámara del Celular**:
   - Toca el botón **"Escanear con Cámara"**.
   - Se abrirá el visor en vivo a 60 cuadros por segundo con retícula láser.
   - Al detectar el código, la pantalla emitirá un destello verde con sonido de confirmación y cargará el artículo en la venta.
   - Puedes activar la linterna (flash) con el icono de rayo si estás en un rincón oscuro de la bodega.
3. **Precios Negociables y Descuentos**:
   - Si acordaste un precio especial con el cliente, puedes escribir el valor acordado en la casilla de precio de venta. El sistema calculará el ahorro obtenido.
   - Puedes aplicar un **Descuento Extra a la Factura** en pesos colombianos.
4. **Venta de Contado vs. Venta a Crédito (Fiado)**:
   - **Efectivo / Transferencia**: Descuenta el inventario y suma los ingresos a la caja del día.
   - **Crédito**: Registra la factura y traslada automáticamente la deuda al **Módulo de Créditos y Cartera**, solicitando obligatoriamente el nombre del cliente y placa.
5. **Impresión de Ticket Térmico**: Al finalizar la venta, se genera el ticket con el encabezado de la empresa, listo para enviar a impresoras térmicas de 58 mm o 80 mm.

---

## 5. Inventario & Coordenadas Físicas en Bodega

1. **Registro de Artículos**: Haz clic en **"Nuevo Repuesto / Producto"**.
2. **Coordenadas de Estantería**: Define **Estante** (ej. E-01), **Nivel** (ej. 2) y **Posición** (ej. P-04).
3. **Chip de Ubicación**: En la tabla de inventario, al hacer clic sobre el chip de ubicación, se abre el mapa visual del estante para ubicar la pieza en segundos.
4. **Filtro por Motos**: Botones de acceso rápido para filtrar piezas de Boxer, NKD, Eco Deluxe, Pulsar, etc.

---

## 6. Órdenes de Trabajo (Taller de Motos)

1. **Recepción del Vehículo**: Registra placa, modelo de la moto, cliente, teléfono y diagnóstico de la falla o mantenimiento requerido.
2. **Poner / Quitar Repuestos en Vivo**: A medida que el mecánico desarma la moto y coloca piezas (pastillas, kit de arrastre, aceite), haz clic en **"Poner / Quitar Repuestos"** para asignarlos. Cada pieza asignada se descuenta automáticamente del inventario.
3. **Entrega y Facturación**: Al terminar el trabajo, pulsa **"Terminar & Facturar"**, selecciona el método de pago recibido y entrega la factura al cliente.

---

## 7. Cotizaciones & Presupuestos

1. **Crear Cotización**: Selecciona repuestos y calcula cuánto costará la reparación sin alterar el inventario.
2. **Imprimir Ticket de Cotización**: Entrega un comprobante formal al cliente con validez temporal.
3. **Pasar a Venta**: Cuando el cliente regresa a autorizar el trabajo, haz clic en **"Pasar a Venta"**. La cotización se convierte en factura de venta oficial y descuenta los artículos del stock.

---

## 8. Créditos & Cuentas por Cobrar (Cartera)

1. **Monitoreo de Deudas**: Visualiza en tiempo real el dinero en la calle, clientes morosos y saldos pendientes.
2. **Registrar Abonos**: Cuando un cliente viene a pagar parte de su deuda, haz clic en **"Registrar Abono"**, ingresa el monto recibido y el medio (Efectivo o Transferencia).
3. **Paz y Salvo**: Al liquidar el total de la deuda, el crédito cambia a estado verde *Paz y Salvo* y permite imprimir el recibo final.

---

## 9. Contabilidad & Arqueo Diario

1. **Navegación por Fecha**: Selecciona *Hoy*, *Ayer* o cualquier día en el calendario interactivo.
2. **Separación de Ingresos**: Muestra claramente cuánto dinero entró por ventas de mostrador vs. cuánto entró por abonos a deudas viejas.
3. **Imprimir Arqueo**: Genera el comprobante de cierre de turno con totales de efectivo y transferencias para cuadre de caja.

---

## 10. Panel de Configuración & Superadmin

1. **Multi-Empresa**: Crea empresas independientes (Taller, Ferretería, Tienda de Abarrotes) dentro del mismo software.
2. **Paletas de Color Personalizadas**: Elige entre temas visuales (Azul Cyan Tech, Verde Esmeralda, Naranja Ferretería, Rojo Racing, Ámbar Industrial) o escribe códigos hexadecimales personalizados.
3. **Gestión de Permisos (RBAC)**: Activa o desactiva qué módulos y botones puede ver cada rol de usuario.
4. **Copias de Seguridad (Backups)**: Descarga en 1 clic un archivo `.zip` con la base de datos completa y archivos de configuración para salvaguardar tu información.
5. **Crédito de Autor By Breiner Rosellon**: Activa o desactiva el hipervínculo de autor en el pie de página del login y configura la URL de destino.

---

# PARTE 2: ARQUITECTURA TÉCNICA

## 1. Estructura de Directorios del Proyecto

```
mototaller/
├── certificates/               # Certificados SSL locales (server.key y server.crt)
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos relacional
│   └── dev.db                  # Base de datos SQLite local
├── public/                     # Recursos estáticos servidos por Next.js
│   ├── manifest.json           # Manifiesto PWA W3C para instalación móvil
│   ├── sw.js                   # Service Worker oficial (caché y offline)
│   ├── icon-192.png            # Icono PWA para pantalla de inicio móvil
│   ├── icon-512.png            # Icono PWA en alta resolución
│   ├── icon-maskable.png       # Icono adaptativo para Android
│   └── apple-touch-icon.png    # Icono para dispositivos iOS
├── scripts/
│   ├── generate-cert.mjs       # Generador de certificados TLS autofirmados
│   └── generate_pwa_icons.py   # Generador de iconos PWA con Pillow
├── src/
│   ├── app/
│   │   ├── api/                # Rutas API REST del backend
│   │   │   ├── auth/           # Login, logout, sesión activa
│   │   │   ├── products/       # CRUD de productos y stock
│   │   │   ├── sales/          # Facturación, ventas y eliminación
│   │   │   ├── orders/         # Órdenes de trabajo de taller
│   │   │   ├── quotes/         # Cotizaciones y conversión a venta
│   │   │   ├── credits/        # Cuentas por cobrar y abonos
│   │   │   ├── companies/      # Multi-tenant y paletas de colores
│   │   │   ├── settings/       # Configuración global y créditos
│   │   │   ├── backups/        # Exportación e importación ZIP
│   │   │   └── audit/          # Bitácora inmutable de seguridad
│   │   ├── layout.tsx          # Root Layout con viewport PWA y metadata
│   │   ├── page.tsx            # Interfaz principal del sistema (módulos)
│   │   └── globals.css         # Tailwind v4 y clases Glassmorphism
│   ├── components/
│   │   ├── auth/               # LoginForm, LoginSecurityBadge, SystemDashboardAnime
│   │   ├── common/             # PwaInstallPrompt, CameraScannerModal, TicketModal
│   │   ├── inventory/          # CreateProductModal, LocationDetailsModal
│   │   ├── sales/              # SalesView, CreateSaleModal
│   │   ├── orders/             # CreateWorkOrderModal, EditOrderPartsModal
│   │   ├── quotes/             # CreateQuoteModal
│   │   ├── credits/            # CreditsView
│   │   ├── cash/               # CashAccountingView
│   │   ├── audit/              # AuditView
│   │   ├── settings/           # SettingsView
│   │   └── ui/                 # Button, Input, Card, Badge, LocationChip
│   ├── features/
│   │   └── scanner/            # Hook useBarcodeScanner para pistolas láser
│   └── lib/
│       ├── auth.ts             # Criptografía Argon2id, tokens y cookies seguras
│       ├── prisma.ts           # Cliente singleton de Prisma ORM
│       └── sound.ts            # Beep sintetizado con Web Audio API
├── next.config.ts              # Cabeceras OWASP, rewrites y configuración Turbopack
├── package.json                # Dependencias y scripts de ejecución
└── README.md                   # Resumen ejecutivo del proyecto
```

---

## 2. Modelo de Base de Datos (Prisma Schema)

Las entidades relacionales fundamentales implementadas en Prisma son:

- **`User`**: Cuentas con contraseñas en hash Argon2id, rol (`SUPERADMIN`, `ADMIN`, `TRABAJADOR`), empresa asignada y sesiones activas.
- **`Product`**: Artículos y repuestos con `sku`, `barcode`, `name`, `costPrice`, `salePrice`, `currentStock`, `minStock` y `motorcycleFit`.
- **`Location`**: Almacén con coordenadas físicas `shelf`, `level`, `position`.
- **`Invoice`**: Factura de venta con `consecutive`, `total`, `paymentType` (`EFECTIVO`, `TRANSFERENCIA`, `CREDITO`) y relación con cliente.
- **`InvoiceItem`**: Detalle de ítems facturados con `quantity`, `unitPrice` y descuento aplicado.
- **`Credit`**: Cuenta por cobrar con `totalAmount`, `paidAmount`, `remainingAmount` y estado (`PENDIENTE`, `PARCIAL`, `PAGADO`).
- **`CreditPayment`**: Abonos parciales con monto, fecha, método de pago y responsable.
- **`WorkOrder`**: Orden de trabajo de taller con diagnóstico, placa de la motocicleta y repuestos asignados en tiempo real.
- **`Quote` & `QuoteItem`**: Presupuestos previos de repuestos para clientes.
- **`AuditLog`**: Registro forense de seguridad con IP, User-Agent, acción y fecha.

---

## 3. Endpoints de la API REST

| Método | Endpoint | Descripción | Rol Mínimo |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Iniciar sesión y emitir cookie segura | Público |
| `POST` | `/api/auth/logout` | Revocar token y destruir sesión | Autenticado |
| `GET` | `/api/products` | Consultar inventario con búsqueda y filtros | `TRABAJADOR` |
| `POST` | `/api/products` | Crear nuevo producto o repuesto | `ADMIN` |
| `DELETE` | `/api/products/[id]`| Eliminar o descontinuar repuesto | `ADMIN` |
| `GET` | `/api/sales` | Listado de facturas y ventas | `TRABAJADOR` |
| `POST` | `/api/sales` | Registrar venta en mostrador (POS) | `TRABAJADOR` |
| `DELETE` | `/api/sales/[id]` | Anular factura y reintegrar stock | `ADMIN` |
| `GET` | `/api/orders` | Consultar órdenes de trabajo | `TRABAJADOR` |
| `POST` | `/api/orders` | Crear nueva orden de trabajo | `TRABAJADOR` |
| `PATCH` | `/api/orders/[id]` | Asignar o retirar repuestos de una orden | `TRABAJADOR` |
| `GET` | `/api/quotes` | Consultar cotizaciones emitidas | `TRABAJADOR` |
| `POST` | `/api/quotes` | Crear cotización estimada | `TRABAJADOR` |
| `POST` | `/api/quotes/[id]/convert` | Convertir cotización en venta oficial | `TRABAJADOR` |
| `GET` | `/api/credits` | Consultar cuentas por cobrar | `ADMIN` |
| `POST` | `/api/credits/[id]/payment` | Registrar abono parcial de cliente | `ADMIN` |
| `GET` | `/api/companies` | Consultar empresas y paletas | `TRABAJADOR` |
| `POST` | `/api/companies` | Crear o modificar empresa y colores | `SUPERADMIN` |
| `GET` | `/api/settings` | Consultar configuración y permisos | `TRABAJADOR` |
| `POST` | `/api/settings` | Guardar permisos RBAC y créditos | `SUPERADMIN` |
| `GET` | `/api/backups` | Descargar backup completo en archivo ZIP | `SUPERADMIN` |
| `POST` | `/api/backups/restore` | Restaurar backup con código de seguridad | `SUPERADMIN` |
| `GET` | `/api/audit` | Consultar bitácora inmutable de auditoría | `SUPERADMIN` |

---

## 4. Arquitectura PWA (Progressive Web App)

### Manifiesto W3C (`public/manifest.json`)
Define los metadatos necesarios para que los motores Chromium (Android, Chrome, Edge) y WebKit (iOS Safari) reconozcan la aplicación como software instalable:
- `display: "standalone"` garantiza ejecución sin interfaz de navegador.
- `theme_color: "#1F3A5F"` tiñe la barra de estado del sistema operativo Android.
- Iconos estándar de 192x192, 512x512 y maskable de 512x512 para iconos adaptativos de Android.

### Service Worker (`public/sw.js`)
- **Ciclo de Vida**: Eventos `install`, `activate` con `self.clients.claim()` para control inmediato de pestañas.
- **Estrategia Híbrida**:
  - `Network First` para rutas `/api/*`: Asegura que el flujo de dinero, existencias y facturación sea 100% fresco.
  - `Network First con Fallback a Caché` para activos estáticos (`/`, imágenes, estilos, JS).

### Componente de Instalación (`src/components/common/PwaInstallPrompt.tsx`)
- Captura el evento nativo del navegador `beforeinstallprompt` y lo almacena para disparar la ventana de confirmación cuando el usuario pulse el botón.
- Detecta si la aplicación ya se está ejecutando en modo instalado (`display-mode: standalone`).
- Ofrece soporte guiado para dispositivos Apple iOS.

---

## 5. Ciberseguridad Web 2026 (OWASP Top 10)

1. **A01: Broken Access Control**: Middleware de autorización por rol (`SUPERADMIN`, `ADMIN`, `TRABAJADOR`) validado estrictamente en servidor.
2. **A02: Cryptographic Failures**: Algoritmo Argon2id con parámetros `m=19456`, `t=2` y tokens criptográficos generados por `crypto.randomBytes(32)`.
3. **A03: Injection**: Todas las consultas a la base de datos se ejecutan a través de consultas parametrizadas generadas por el motor de Prisma ORM, imposibilitando inyecciones SQL.
4. **A05: Security Misconfiguration**: Cabeceras HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff y Content-Security-Policy (CSP) estricta configuradas en `next.config.ts`.
5. **A07: Identification and Authentication Failures**: Cookies `HttpOnly`, `SameSite: "lax"`, `Secure: true`, rate limiter contra ataques de fuerza bruta y mitigación de ataques de tiempo (*timing attacks*).

---

© 2026 **Breiner Rosellon** — Todos los derechos reservados.
