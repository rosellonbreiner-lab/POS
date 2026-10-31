# ARCHITECTURE

## Stack
| Capa | Tecnología | Motivo |
|---|---|---|
| Front + Back | **Next.js (App Router) + TypeScript estricto** | Un solo repo, tipado de extremo a extremo |
| Estilos | Tailwind CSS + variables CSS (tokens glass) | Ver DESIGN.md |
| Animación | Motion (framer-motion) + CSS | Reglas de interacción en DESIGN.md |
| Base de datos | **PostgreSQL** | Transacciones ACID para stock y contabilidad |
| ORM | **Prisma** | Consultas parametrizadas, migraciones |
| Validación | **Zod** (cliente y servidor, mismo esquema) | Nunca confiar en el cliente |
| Auth | Propia, sesiones en servidor (ver SECURITY.md) | Control total |
| Contraseñas | argon2id | Estándar actual |
| Imágenes | sharp (re-encode a WebP, quita EXIF) | Seguridad y peso |
| PDF/Impresión | HTML print CSS + @react-pdf/renderer | A4 y ticket 80 mm |
| Códigos de barras | bwip-js / JsBarcode | Etiquetas |
| Gráficas | Recharts | Dashboard |
| Pruebas | Vitest + Playwright | Unitarias y E2E |
| Despliegue | Docker Compose (app + Postgres + Caddy HTTPS) | Reproducible |

## Flujo
`Navegador → Middleware (sesión, CSRF, rate limit) → Route Handler / Server Action → Servicio (permisos + reglas de negocio) → Prisma → PostgreSQL`

## Estructura
```
mototaller/
├── docs/                 # estos .md
├── prisma/               # schema.prisma, migraciones, seed
├── src/
│   ├── app/              # rutas: (auth)/login, (app)/dashboard, inventario, ventas, ...
│   ├── components/ui/    # glass: Card, Button, Input, Table, Modal, Toast
│   ├── features/         # inventario/, facturacion/, cotizaciones/, contabilidad/, ...
│   ├── services/         # lógica de negocio + acceso a datos (único lugar con Prisma)
│   ├── lib/              # auth, permisos, db, validación, audit, money
│   └── types/
├── uploads/              # FUERA de public/, servido solo por ruta autenticada
├── tests/{unit,integration,e2e}
├── .env.example  Dockerfile  docker-compose.yml
```

## Reglas de arquitectura
- Componentes UI **sin** lógica de base de datos. Prisma solo en `services/`.
- **Todo servicio verifica sesión y permiso** (`requirePermission('inventario:editar')`) antes de actuar.
- Dinero en **enteros (centavos) o Decimal**, nunca float.
- Operaciones compuestas (venta, compra, anulación, orden) en `prisma.$transaction`.
- Facturas, movimientos de stock y asientos contables son **append-only**: se corrigen con contra-movimientos.
- Consecutivos de factura/cotización generados en BD con bloqueo (sin saltos ni duplicados).

## Modelo de datos (resumen)
`User, Role, Session, AuditLog` · `Product, Category, Brand, Location(bodega, estante, nivel, posición), StockMovement, ProductImage` · `Customer, Motorcycle` · `Quote, QuoteItem` · `Invoice, InvoiceItem, Payment, CreditNote` · `WorkOrder, WorkOrderItem` · `Supplier, PurchaseOrder, PurchaseItem` · `Account(plan de cuentas), JournalEntry, JournalLine, CashSession, Expense, ExpenseCategory, RecurringExpense` · `Setting, Sequence`.

## Ubicación física
`Location` = {bodega, estante (ej. "E-03"), nivel (1..n), posición}. Un producto puede tener varias ubicaciones con cantidad por ubicación. El escaneo muestra foto + "Estante E-03 · Nivel 2".

## Escáner láser
La pistola actúa como teclado: escribe el código + Enter. Un hook `useBarcodeScanner` detecta ráfagas rápidas (< 50 ms entre teclas) para distinguirlas de escritura humana, funciona aunque el foco no esté en un input y busca por `barcode` o `sku`.
