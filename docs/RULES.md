# RULES — cómo debe programar la IA en este proyecto

## Autonomía (cambia respecto al proyecto anterior)
El dueño del proyecto **autoriza** a la IA a: instalar dependencias, crear archivos, ejecutar scripts, migraciones y pruebas, y **decidir la seguridad** por su cuenta siguiendo SECURITY.md. Sigue pidiendo confirmación antes de: borrar datos o tablas existentes, `git push --force`, cambiar credenciales reales, o desplegar a producción.

## Debe hacer
- TypeScript `strict`; sin `any` salvo justificación comentada.
- Un cambio pequeño a la vez, ciclo: **leer → planificar → implementar → probar → revisar → commit → actualizar docs**.
- Validar toda entrada con Zod en el servidor. Verificar sesión y permiso en **cada** servicio.
- Dinero en enteros/Decimal. Transacciones para venta, compra, anulación y ajustes.
- Seguir DESIGN.md: usar solo tokens y componentes de `components/ui`; nada de colores o fuentes sueltos.
- Textos de interfaz en español (Colombia), moneda COP, zona horaria America/Bogota.
- Cada funcionalidad nueva incluye pruebas (unitarias de reglas; E2E del flujo crítico).
- Ejecutar `npm run typecheck && npm run lint && npm test && npm run build` antes de dar algo por terminado.
- Actualizar TASKS.md, MEMORY.md y DECISIONS.md al terminar cada fase.
- Mensajes de error genéricos al usuario; detalle solo en logs del servidor.

## No debe hacer
- No guardar secretos en el repo ni imprimirlos en logs.
- No borrar facturas, movimientos ni asientos: se corrigen con contra-movimientos.
- No confiar en validaciones del cliente ni ocultar botones como única protección.
- No usar SQL concatenado, `dangerouslySetInnerHTML`, `eval` ni `localStorage` para sesiones.
- No agregar librerías sin necesidad; revisar mantenimiento y `npm audit`.
- No saltar pruebas ni dejar código a medias.
- No dejar usuarios/contraseñas por defecto en producción.
- No refactorizar código no relacionado con la tarea.
