# DESIGN — "Glass Dashboard v5" para taller de motos

> Aclaración: "Glass Dashboard v5" y las skills de Emil Kowalski no están cargadas en esta conversación, así que este archivo define el sistema a partir de glassmorphism y de los principios públicos de interacción de Emil Kowalski. Si tienes los archivos originales de esa skill o capturas de referencia del "v5", súbelos y se ajusta.

## Identidad
Taller de motos: oscuro, técnico, energético. Fondo profundo con resplandores de color, paneles de vidrio esmerilado, acento **naranja motor** y **cian eléctrico** para datos.

## Tokens de color (modo oscuro por defecto; modo claro opcional)
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0B0D12` | Fondo base |
| `--bg-glow-1` | `#FF6A1A` al 18 % | Resplandor radial superior izquierdo |
| `--bg-glow-2` | `#22D3EE` al 12 % | Resplandor radial inferior derecho |
| `--glass` | `rgba(255,255,255,0.06)` | Superficie de tarjetas |
| `--glass-strong` | `rgba(255,255,255,0.10)` | Hover / modales |
| `--glass-border` | `rgba(255,255,255,0.14)` | Borde 1 px |
| `--text` | `#F3F4F6` | Texto principal |
| `--text-muted` | `#9CA3AF` | Secundario |
| `--primary` | `#FF6A1A` | Acciones principales |
| `--info` | `#22D3EE` | Datos, enlaces |
| `--success` | `#34D399` | Stock OK, pagado |
| `--warning` | `#FBBF24` | Stock bajo, vence pronto |
| `--danger` | `#F87171` | Agotado, error, anulado |

Contraste mínimo WCAG AA (4.5:1) sobre vidrio. El estado nunca depende solo del color: lleva icono + texto.

## Vidrio
```css
.glass{background:var(--glass);border:1px solid var(--glass-border);
 backdrop-filter:blur(16px) saturate(140%);border-radius:16px;
 box-shadow:0 8px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08)}
```
Fallback sin `backdrop-filter`: fondo sólido `rgba(20,22,30,.92)`. Máximo 2 capas de blur apiladas (rendimiento).

## Tipografía
- Títulos y cifras: **Space Grotesk** (carácter mecánico). Cuerpo: **Inter**. Códigos/SKU/placas: **JetBrains Mono**.
- Escala: 12 / 14 / 16 / 20 / 28 / 40. Números con `font-variant-numeric: tabular-nums`.

## Espaciado y forma
Base 4 px. Radios: 8 (inputs), 16 (tarjetas), 24 (modales). Sidebar 260 px colapsable; contenido máx. 1440 px. Responsive: móvil, tablet, escritorio (taller usa tablet y PC).

## Movimiento (principios Emil Kowalski)
- Animar solo `transform` y `opacity`. Nunca animar `height/width/top`.
- Entrada: `ease-out` personalizado `cubic-bezier(0.23, 1, 0.32, 1)`; **duración 150–250 ms**, nada de UI > 300 ms.
- Nunca aparecer desde `scale(0)`: partir de `scale(0.95)` + `opacity 0`.
- Botones: `:active { transform: scale(0.97) }`.
- Popovers/menús nacen desde su disparador (`transform-origin` correcto); tooltips sin retraso tras el primero.
- Listas: aparición escalonada (stagger 30–50 ms), sin exceso.
- Acciones muy frecuentes (escaneo, atajos de teclado) **sin animación**.
- Toasts apilados con gesto/animación suave (estilo Sonner). Estados de carga con skeleton, no spinners largos.
- Respetar `prefers-reduced-motion` (reducir a fade).

## Componentes
Sidebar, Topbar (búsqueda global + escáner), KPI Card, Tabla densa con filtros, Gráficas (área, barras, dona), Badge de estado, Modal/Drawer, Formularios con validación en línea, Toast, Estado vacío, Skeleton, Chip de **ubicación** (`E-03 · N2`), Tarjeta de producto con foto.

## Pantallas clave
Login · Dashboard · Inventario (lista + detalle con foto y mapa de ubicación) · Punto de venta (escáner a pantalla completa) · Cotizaciones · Facturas · Órdenes de trabajo · Clientes/Motos · Compras · Contabilidad · Estadísticas · Configuración · Auditoría.

## Impresión
CSS `@media print` independiente: factura A4 y ticket 80 mm, fondo blanco, sin vidrio, logo y datos del negocio, código QR/barras de la factura.

## Accesibilidad
Navegación por teclado completa, foco visible (anillo `--primary`), roles ARIA, etiquetas en todos los inputs, objetivos táctiles ≥ 44 px.
