# TEST_PLAN

## Unitarias (Vitest)
Cálculo de IVA/descuentos/totales (redondeo), consecutivos, reglas de stock (no negativo), asientos contables balanceados (débito = crédito), detección de ráfaga del escáner, validadores Zod.

## Integración
Venta atómica (falla a mitad → nada se guarda), anulación con nota crédito, compra aumenta stock, orden de trabajo descuenta repuestos, concurrencia: dos ventas del último ítem → solo una pasa.

## Seguridad (obligatorias)
- Cada endpoint/acción sin sesión → 401; con rol incorrecto → 403 (matriz rol × acción).
- Bloqueo tras intentos fallidos; sin enumeración de usuarios.
- Subida: `.php` renombrado a `.jpg`, SVG con script, archivo > 5 MB → rechazados.
- Intentos de XSS e inyección SQL en cada formulario.
- Cookies con flags correctos; cabeceras y CSP presentes.
- IDOR: usuario A no accede a objetos fuera de su permiso.

## E2E (Playwright)
Login (+2FA) → crear producto con foto y estante → escanear → cotizar → convertir a factura → imprimir → ver asiento y caja → alerta de stock bajo → logout. Probar en móvil, tablet, escritorio.

## Criterio de aprobación
0 fallos, 0 vulnerabilidades altas en `npm audit`, build de producción limpio.
