# PRD — MotoTaller (sistema de gestión para taller de motos)

## Qué y por qué
Software web para administrar un taller de motos: inventario de repuestos con ubicación física, ventas con factura impresa, cotizaciones, órdenes de trabajo y contabilidad. Reemplaza cuadernos/Excel, evita pérdidas de stock y da control financiero.

## Usuarios y roles
| Rol | Puede |
|---|---|
| **Admin (dueño)** | Todo: usuarios, contabilidad, configuración, anulaciones, auditoría |
| **Contador** | Contabilidad, reportes, lectura de facturas/compras |
| **Cajero/Ventas** | Escanear, vender, cotizar, facturar, caja |
| **Mecánico** | Órdenes de trabajo, consultar inventario/ubicación, solicitar repuestos |
| **Bodeguero** | Inventario, entradas, ajustes, ubicaciones |

## Módulos (alcance v1 completo)
1. **Autenticación y seguridad**: login, logout, roles, bloqueo por intentos, 2FA TOTP (obligatorio para Admin), cambio/recuperación de contraseña, sesiones activas.
2. **Dashboard**: ventas hoy/mes, utilidad, caja, stock bajo, cotizaciones pendientes, órdenes abiertas, top productos, gráficas.
3. **Inventario**: productos (SKU, código de barras, nombre, categoría, marca, compatibilidad moto, costo, precio, IVA, stock, **stock mínimo**, **foto**, **ubicación: bodega/estante/nivel/posición**), kardex de movimientos, ajustes con motivo, conteo físico, alertas de stock bajo/agotado, importación/exportación CSV.
4. **Escáner láser**: lector USB tipo teclado (HID). Escaneo en buscador, venta, cotización, entradas y conteo. Producto no encontrado → ofrecer crearlo con ese código. Impresión de etiquetas de código de barras.
5. **Cotizaciones**: consecutivo, cliente/moto, ítems (repuestos + mano de obra), vigencia, estados (borrador/enviada/aprobada/rechazada/vencida), PDF/impresión, **convertir a factura u orden de trabajo**.
6. **Facturación**: consecutivo único sin saltos, IVA, descuentos, métodos de pago (efectivo, transferencia, tarjeta, crédito), pago mixto, **impresión (A4 y ticket 80 mm)**, descuenta stock en transacción, anulación solo con nota crédito y motivo (nunca borrar).
7. **Clientes y motos**: datos, placa, marca/modelo/año, historial de servicios y compras.
8. **Órdenes de trabajo**: recepción de moto, diagnóstico, repuestos usados (descuentan stock), mano de obra, estado, entrega y facturación.
9. **Proveedores y compras**: órdenes de compra, entrada a inventario, cuentas por pagar.
10. **Contabilidad**: ingresos, egresos, **categorías y cuentas configurables (se pueden agregar más)**, caja diaria con apertura/cierre y arqueo, cuentas por cobrar/pagar, resumen de IVA, utilidad bruta/neta, estado de resultados, flujo de caja, gastos fijos recurrentes, exportación Excel/PDF.
11. **Estadísticas**: ventas por período/vendedor/categoría, rotación, productos sin movimiento, margen por producto, comparativos.
12. **Auditoría**: registro inmutable de quién hizo qué y cuándo.
13. **Configuración**: datos del negocio, logo, impuestos, consecutivos, impresoras, usuarios, copias de seguridad.

## Fuera de alcance v1
- Facturación electrónica ante la DIAN (ver nota abajo), app móvil nativa, multi-sucursal, e-commerce.

> **Nota legal (Colombia):** la factura impresa por el sistema es un documento interno/POS. Para validez fiscal ante la DIAN se necesita un proveedor tecnológico de facturación electrónica. La arquitectura deja un módulo `fiscal/` preparado para integrarlo después. Confirmar con el contador del taller.

## Criterios de éxito
- Escanear un código agrega el producto en < 1 s y muestra foto + ubicación.
- Una venta descuenta stock, genera factura y asiento contable en una sola transacción atómica.
- Ningún endpoint accesible sin sesión y permiso correcto (verificado por pruebas).
- `typecheck`, `lint`, pruebas y `build` pasan sin errores.
- Alerta visible cuando stock ≤ mínimo.
