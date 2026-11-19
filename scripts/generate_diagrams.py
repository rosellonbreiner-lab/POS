import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Color Palette
NAVY = '#0F2C59'
BLUE = '#0284C7'
LIGHT_BLUE = '#E0F2FE'
DARK_SLATE = '#1E293B'
LIGHT_GRAY = '#F8FAFC'
BORDER_GRAY = '#94A3B8'
WHITE = '#FFFFFF'
GREEN = '#16A34A'
LIGHT_GREEN = '#DCFCE7'
AMBER = '#D97706'
LIGHT_AMBER = '#FEF3C7'
RED = '#DC2626'
LIGHT_RED = '#FEE2E2'
PURPLE = '#7C3AED'
LIGHT_PURPLE = '#EDE9FE'

OUTPUT_DIR = os.path.abspath("docs_images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def save_fig(fig, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    plt.savefig(filepath, dpi=200, bbox_inches='tight', facecolor=WHITE)
    plt.close(fig)
    print(f"Diagrama guardado: {filepath}")
    return filepath

# ----------------------------------------------------------------------
# 1. DIAGRAMA DE ARQUITECTURA DE SOFTWARE (4 CAPAS)
# ----------------------------------------------------------------------
def generate_architecture_diagram():
    fig, ax = plt.subplots(figsize=(11, 7))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    # Title
    ax.text(5.5, 8.1, "ARQUITECTURA DE SOFTWARE EN CAPAS - MOTOTALLER v2.4", 
            fontsize=15, fontweight='bold', color=NAVY, ha='center')

    layers = [
        {"y": 6.3, "h": 1.3, "title": "1. CAPA DE PRESENTACIÓN / CLIENTE (PWA & WEB)", "bg": LIGHT_BLUE, "border": BLUE,
         "items": ["PWA Móvil (Android / iOS)", "Navegador Web PC Mostrador", "Lector Código de Barras (Entrada Láser)", "Tailwind CSS v4 + React 19"]},
        
        {"y": 4.6, "h": 1.3, "title": "2. CAPA DE COMUNICACIÓN & TÚNEL REMOTO", "bg": LIGHT_PURPLE, "border": PURPLE,
         "items": ["Túnel Cifrado HTTPS ngrok (Dominio Fijo)", "Red Local LAN / WiFi Taller", "CORS & Content Security Policy", "Sesiones HttpOnly + Argon2id"]},
        
        {"y": 2.7, "h": 1.5, "title": "3. CAPA DE LÓGICA DE NEGOCIO & SERVICIOS (BACKEND)", "bg": LIGHT_AMBER, "border": AMBER,
         "items": ["Next.js 16 App Router (Route Handlers)", "Módulo Ventas & Descuentos (/api/sales)", "Módulo Taller & Checklist (/api/orders)", "Control de Caja & Arqueo Ciego", "Prisma ORM 5.x (Client Engine)"]},
        
        {"y": 0.8, "h": 1.5, "title": "4. CAPA DE PERSISTENCIA & HARDWARE EXTERNO", "bg": LIGHT_GREEN, "border": GREEN,
         "items": ["SQLite Database (prisma/dev.db)", "Modo WAL (Write-Ahead Logging Concurrente)", "Impresora Térmica ESC/POS (80mm/58mm)", "Copias de Respaldo Automatizadas"]}
    ]

    for layer in layers:
        # Layer Container
        box = patches.FancyBboxPatch((0.5, layer["y"]), 10, layer["h"], boxstyle='round,pad=0.15',
                                     facecolor=layer["bg"], edgecolor=layer["border"], linewidth=2)
        ax.add_patch(box)
        # Title badge
        ax.text(0.8, layer["y"] + layer["h"] - 0.28, layer["title"], fontsize=11, fontweight='bold', color=NAVY)
        
        # Items chips
        n_items = len(layer["items"])
        w_chip = 9.4 / n_items
        for idx, itm in enumerate(layer["items"]):
            cx = 0.8 + idx * w_chip
            c_box = patches.FancyBboxPatch((cx, layer["y"] + 0.15), w_chip - 0.2, layer["h"] - 0.55,
                                           boxstyle='round,pad=0.08', facecolor=WHITE, edgecolor=layer["border"], linewidth=1.2)
            ax.add_patch(c_box)
            ax.text(cx + (w_chip - 0.2) / 2, layer["y"] + 0.15 + (layer["h"] - 0.55) / 2, itm,
                    fontsize=8.5, fontweight='bold', color=DARK_SLATE, ha='center', va='center', wrap=True)

    # Inter-layer arrows
    for y_arrow in [6.18, 4.48, 2.58]:
        ax.annotate("", xy=(5.5, y_arrow), xytext=(5.5, y_arrow + 0.22),
                    arrowprops=dict(arrowstyle="<->", color=NAVY, lw=2, mutation_scale=15))

    return save_fig(fig, "diagrama_arquitectura.png")

# ----------------------------------------------------------------------
# 2. DIAGRAMA DE CASOS DE USO UML
# ----------------------------------------------------------------------
def generate_use_case_diagram():
    fig, ax = plt.subplots(figsize=(11, 7.5))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 9)
    ax.axis('off')

    ax.text(5.5, 8.6, "DIAGRAMA DE CASOS DE USO UML - SISTEMA MOTOTALLER", 
            fontsize=15, fontweight='bold', color=NAVY, ha='center')

    # System Boundary Box
    system_box = patches.FancyBboxPatch((2.6, 0.4), 5.8, 7.9, boxstyle='round,pad=0.2',
                                       facecolor=LIGHT_GRAY, edgecolor=BORDER_GRAY, linewidth=1.5, linestyle='--')
    ax.add_patch(system_box)
    ax.text(5.5, 8.05, "Límite del Sistema: MotoTaller POS & Workshop", fontsize=10.5, fontstyle='italic', color=DARK_SLATE, ha='center')

    # Actors (Left and Right)
    actors = [
        {"name": "CAJERO / MOSTADOR", "x": 1.2, "y": 6.8},
        {"name": "MECÁNICO / PATIO", "x": 1.2, "y": 3.8},
        {"name": "ADMINISTRADOR", "x": 1.2, "y": 1.2},
        {"name": "BODEGUERO", "x": 9.8, "y": 5.5},
        {"name": "SUPERADMIN", "x": 9.8, "y": 2.2}
    ]

    for act in actors:
        # Simple stick actor icon representation
        ax.plot(act["x"], act["y"] + 0.35, 'o', color=NAVY, markersize=14)
        ax.plot([act["x"], act["x"]], [act["y"] + 0.25, act["y"] - 0.05], color=NAVY, lw=2.5)
        ax.plot([act["x"] - 0.25, act["x"] + 0.25], [act["y"] + 0.15, act["y"] + 0.15], color=NAVY, lw=2.5)
        ax.plot([act["x"], act["x"] - 0.2], [act["y"] - 0.05, act["y"] - 0.3], color=NAVY, lw=2.5)
        ax.plot([act["x"], act["x"] + 0.2], [act["y"] - 0.05, act["y"] - 0.3], color=NAVY, lw=2.5)
        ax.text(act["x"], act["y"] - 0.52, act["name"], fontsize=8.5, fontweight='bold', color=NAVY, ha='center')

    # Use Cases (Ovals in center)
    use_cases = [
        {"text": "CU-01: Iniciar Sesión con Hashing", "x": 5.5, "y": 7.3, "w": 4.6, "h": 0.55, "actors": [0, 1, 2, 3, 4]},
        {"text": "CU-02: Venta Rápida POS con Descuentos", "x": 5.5, "y": 6.4, "w": 4.6, "h": 0.55, "actors": [0, 2]},
        {"text": "CU-03: Recepción Moto & Checklist", "x": 5.5, "y": 5.5, "w": 4.6, "h": 0.55, "actors": [1, 2]},
        {"text": "CU-04: Consumo Repuestos & Mano Obra", "x": 5.5, "y": 4.6, "w": 4.6, "h": 0.55, "actors": [1, 2]},
        {"text": "CU-05: Gestión de Inventario & Barcode Único", "x": 5.5, "y": 3.7, "w": 4.6, "h": 0.55, "actors": [2, 3]},
        {"text": "CU-06: Cartera de Créditos & Abonos", "x": 5.5, "y": 2.8, "w": 4.6, "h": 0.55, "actors": [0, 2]},
        {"text": "CU-07: Arqueo Ciego & Cierre de Caja", "x": 5.5, "y": 1.9, "w": 4.6, "h": 0.55, "actors": [0, 2]},
        {"text": "CU-08: Auditoría Sensible & Backups", "x": 5.5, "y": 1.0, "w": 4.6, "h": 0.55, "actors": [4]}
    ]

    for uc in use_cases:
        ellipse = patches.Ellipse((uc["x"], uc["y"]), uc["w"], uc["h"], facecolor=LIGHT_BLUE, edgecolor=BLUE, linewidth=1.5)
        ax.add_patch(ellipse)
        ax.text(uc["x"], uc["y"], uc["text"], fontsize=8.5, fontweight='bold', color=DARK_SLATE, ha='center', va='center')
        
        # Connect to actors
        for act_idx in uc["actors"]:
            act = actors[act_idx]
            ax.plot([act["x"] + (0.35 if act["x"] < 5 else -0.35), uc["x"] + (-uc["w"]/2 if act["x"] < 5 else uc["w"]/2)],
                    [act["y"], uc["y"]], color=BORDER_GRAY, lw=1.1, linestyle='-')

    return save_fig(fig, "diagrama_casos_de_uso.png")

# ----------------------------------------------------------------------
# 3. DIAGRAMA DE FLUJO: VENTA POS Y DESCUENTOS
# ----------------------------------------------------------------------
def generate_pos_flowchart():
    fig, ax = plt.subplots(figsize=(10, 8.5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10.5)
    ax.axis('off')

    ax.text(5.0, 10.1, "DIAGRAMA DE FLUJO - PROCESO DE VENTA POS Y DESCUENTOS", 
            fontsize=14, fontweight='bold', color=NAVY, ha='center')

    steps = [
        {"type": "start", "text": "INICIO: Cliente solicita repuestos en mostrador", "y": 9.3},
        {"type": "box", "text": "Escanear código de barras con lector láser o buscar por nombre", "y": 8.3},
        {"type": "decision", "text": "¿Código existe y tiene stock disponible?", "y": 7.0},
        {"type": "box", "text": "Agregar ítem al carrito y verificar subtotal", "y": 5.6},
        {"type": "decision", "text": "¿Se negoció descuento con el cliente?", "y": 4.3},
        {"type": "box", "text": "Aplicar descuento en % o $ (Refleja 'Ahorro' en vivo)", "y": 3.0, "x_offset": 2.6},
        {"type": "box", "text": "Seleccionar método de pago (Efectivo/Nequi/Tarjeta/Crédito)", "y": 1.8},
        {"type": "end", "text": "Registrar venta en BD, descontar stock e imprimir ticket térmico", "y": 0.6}
    ]

    # Draw boxes and connectors
    # 1. Start
    b1 = patches.FancyBboxPatch((2.2, 9.1), 5.6, 0.55, boxstyle='round,pad=0.1', facecolor=LIGHT_GREEN, edgecolor=GREEN, lw=2)
    ax.add_patch(b1)
    ax.text(5.0, 9.37, steps[0]["text"], fontsize=9, fontweight='bold', color=DARK_SLATE, ha='center', va='center')

    # Arrow 1->2
    ax.annotate("", xy=(5.0, 8.65), xytext=(5.0, 9.1), arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.8))

    # 2. Box
    b2 = patches.FancyBboxPatch((2.0, 8.05), 6.0, 0.6, boxstyle='square,pad=0.1', facecolor=WHITE, edgecolor=BLUE, lw=1.5)
    ax.add_patch(b2)
    ax.text(5.0, 8.35, steps[1]["text"], fontsize=9, color=DARK_SLATE, ha='center', va='center')

    # Arrow 2->3
    ax.annotate("", xy=(5.0, 7.55), xytext=(5.0, 8.05), arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.8))

    # 3. Decision 1 (Polygon diamond)
    diamond1 = patches.Polygon([[5.0, 7.55], [7.6, 7.0], [5.0, 6.45], [2.4, 7.0]], closed=True,
                               facecolor=LIGHT_AMBER, edgecolor=AMBER, lw=1.8)
    ax.add_patch(diamond1)
    ax.text(5.0, 7.0, steps[2]["text"], fontsize=8.5, fontweight='bold', color=DARK_SLATE, ha='center', va='center')

    # Branch No: Alert
    ax.plot([7.6, 8.8, 8.8, 8.0], [7.0, 7.0, 8.35, 8.35], color=RED, lw=1.5, linestyle='--')
    ax.text(8.2, 7.15, "NO (Alerta)", fontsize=8, fontweight='bold', color=RED)

    # Branch Yes Arrow 3->4
    ax.annotate("", xy=(5.0, 5.95), xytext=(5.0, 6.45), arrowprops=dict(arrowstyle="->", color=GREEN, lw=1.8))
    ax.text(5.2, 6.2, "SÍ", fontsize=8.5, fontweight='bold', color=GREEN)

    # 4. Box
    b4 = patches.FancyBboxPatch((2.2, 5.35), 5.6, 0.6, boxstyle='square,pad=0.1', facecolor=WHITE, edgecolor=BLUE, lw=1.5)
    ax.add_patch(b4)
    ax.text(5.0, 5.65, steps[3]["text"], fontsize=9, color=DARK_SLATE, ha='center', va='center')

    # Arrow 4->5
    ax.annotate("", xy=(5.0, 4.85), xytext=(5.0, 5.35), arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.8))

    # 5. Decision 2 (Diamond)
    diamond2 = patches.Polygon([[5.0, 4.85], [7.6, 4.3], [5.0, 3.75], [2.4, 4.3]], closed=True,
                               facecolor=LIGHT_AMBER, edgecolor=AMBER, lw=1.8)
    ax.add_patch(diamond2)
    ax.text(5.0, 4.3, steps[4]["text"], fontsize=8.5, fontweight='bold', color=DARK_SLATE, ha='center', va='center')

    # Branch Yes to Discount box
    ax.annotate("", xy=(7.8, 3.3), xytext=(7.6, 4.3), arrowprops=dict(arrowstyle="->", color=GREEN, lw=1.6))
    ax.text(7.6, 3.8, "SÍ", fontsize=8.5, fontweight='bold', color=GREEN)
    b_disc = patches.FancyBboxPatch((6.0, 2.7), 3.6, 0.6, boxstyle='square,pad=0.1', facecolor=LIGHT_GREEN, edgecolor=GREEN, lw=1.5)
    ax.add_patch(b_disc)
    ax.text(7.8, 3.0, "Aplicar % o $\nDescuento visible", fontsize=8, fontweight='bold', color=DARK_SLATE, ha='center', va='center')

    # Connect discount to payment box
    ax.plot([7.8, 7.8, 6.5], [2.7, 2.1, 2.1], color=GREEN, lw=1.5)

    # Branch No direct to payment
    ax.annotate("", xy=(5.0, 2.45), xytext=(5.0, 3.75), arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.8))
    ax.text(4.6, 3.1, "NO", fontsize=8.5, fontweight='bold', color=NAVY)

    # 6. Payment Box
    b6 = patches.FancyBboxPatch((1.8, 1.8), 6.4, 0.65, boxstyle='square,pad=0.1', facecolor=WHITE, edgecolor=BLUE, lw=1.5)
    ax.add_patch(b6)
    ax.text(5.0, 2.12, steps[6]["text"], fontsize=8.5, fontweight='bold', color=DARK_SLATE, ha='center', va='center')

    # Arrow 6->7
    ax.annotate("", xy=(5.0, 1.15), xytext=(5.0, 1.8), arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.8))

    # 7. End
    b7 = patches.FancyBboxPatch((1.2, 0.5), 7.6, 0.65, boxstyle='round,pad=0.1', facecolor=LIGHT_BLUE, edgecolor=BLUE, lw=2)
    ax.add_patch(b7)
    ax.text(5.0, 0.82, steps[7]["text"], fontsize=8.5, fontweight='bold', color=NAVY, ha='center', va='center')

    return save_fig(fig, "diagrama_flujo_pos.png")

# ----------------------------------------------------------------------
# 4. DIAGRAMA DE FLUJO: CICLO DE VIDA DE TALLER DE MOTOS
# ----------------------------------------------------------------------
def generate_workshop_flowchart():
    fig, ax = plt.subplots(figsize=(10, 8.5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10.5)
    ax.axis('off')

    ax.text(5.0, 10.1, "DIAGRAMA DE FLUJO - ATENCIÓN Y REPARACIÓN EN TALLER", 
            fontsize=14, fontweight='bold', color=NAVY, ha='center')

    steps = [
        {"text": "1. RECEPCIÓN: Ingreso de motocicleta, identificación de placa y kilometraje", "y": 9.1},
        {"text": "2. INSPECCIÓN: Checklist físico (espejos, rayones, casco, nivel de combustible)", "y": 7.9},
        {"text": "3. APERTURA: Registro de fallas reportadas y creación de WorkOrder (RECIBIDA)", "y": 6.7},
        {"text": "4. DIAGNÓSTICO & ASIGNACIÓN: Evaluación técnica por mecánico a cargo", "y": 5.5},
        {"text": "5. CONSUMO: ¿Requiere repuestos de bodega?", "y": 4.3},
        {"text": "6. TRABAJO & LIQUIDACIÓN: Reparación física y registro de valor de Mano de Obra", "y": 2.8},
        {"text": "7. FACTURACIÓN & ENTREGA: Orden 'LISTA', cobro en POS y entrega al cliente", "y": 1.3}
    ]

    for idx, s in enumerate(steps):
        if idx == 4: # Decision
            dia = patches.Polygon([[5.0, 4.85], [7.7, 4.3], [5.0, 3.75], [2.3, 4.3]], closed=True,
                                  facecolor=LIGHT_AMBER, edgecolor=AMBER, lw=1.8)
            ax.add_patch(dia)
            ax.text(5.0, 4.3, s["text"], fontsize=8.5, fontweight='bold', color=DARK_SLATE, ha='center', va='center')
            
            # Repuestos branch
            b_rep = patches.FancyBboxPatch((6.8, 3.1), 2.9, 0.6, boxstyle='square,pad=0.1', facecolor=LIGHT_GREEN, edgecolor=GREEN, lw=1.5)
            ax.add_patch(b_rep)
            ax.text(8.25, 3.4, "Descarga de bodega en\ntiempo real por sistema", fontsize=7.5, fontweight='bold', color=DARK_SLATE, ha='center', va='center')
            ax.annotate("", xy=(8.25, 3.7), xytext=(7.7, 4.3), arrowprops=dict(arrowstyle="->", color=GREEN, lw=1.6))
            ax.plot([8.25, 8.25, 6.5], [3.1, 2.8, 2.8], color=GREEN, lw=1.5)
            
            # Direct arrow
            ax.annotate("", xy=(5.0, 3.35), xytext=(5.0, 3.75), arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.8))
        else:
            bg = LIGHT_BLUE if idx in [0, 6] else WHITE
            border = NAVY if idx in [0, 6] else BLUE
            box = patches.FancyBboxPatch((1.2, s["y"] - 0.28), 7.6, 0.62, boxstyle='round,pad=0.1', facecolor=bg, edgecolor=border, lw=1.6)
            ax.add_patch(box)
            ax.text(5.0, s["y"] + 0.03, s["text"], fontsize=8.5, fontweight='bold' if idx in [0, 6] else 'normal', color=NAVY if idx in [0, 6] else DARK_SLATE, ha='center', va='center')

        if idx < 6 and idx != 4:
            ax.annotate("", xy=(5.0, steps[idx+1]["y"] + 0.35), xytext=(5.0, s["y"] - 0.28),
                        arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.8))

    return save_fig(fig, "diagrama_flujo_taller.png")

# ----------------------------------------------------------------------
# 5. DIAGRAMA ENTIDAD-RELACIÓN (DER VISUAL)
# ----------------------------------------------------------------------
def generate_er_diagram():
    fig, ax = plt.subplots(figsize=(11, 8.5))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 9)
    ax.axis('off')

    ax.text(5.5, 8.6, "DIAGRAMA ENTIDAD-RELACIÓN (DER CONCEPTUAL) - MOTOTALLER", 
            fontsize=14, fontweight='bold', color=NAVY, ha='center')

    entities = [
        {"name": "Customer", "x": 0.8, "y": 6.2, "w": 2.2, "h": 1.7, "bg": LIGHT_BLUE,
         "attrs": ["PK id (UUID)", "documentId (Cédula)", "name", "phone", "email"]},
        
        {"name": "Motorcycle", "x": 0.8, "y": 3.7, "w": 2.2, "h": 1.7, "bg": LIGHT_BLUE,
         "attrs": ["PK id (UUID)", "FK customerId", "plate (Placa)", "brand, model", "year, color"]},
        
        {"name": "WorkOrder", "x": 4.0, "y": 3.7, "w": 2.5, "h": 2.0, "bg": LIGHT_AMBER,
         "attrs": ["PK id (UUID)", "FK customerId", "FK motorcycleId", "status (RECIBIDA)", "laborCost, partsCost", "total"]},
        
        {"name": "Product", "x": 7.8, "y": 6.2, "w": 2.5, "h": 1.9, "bg": LIGHT_GREEN,
         "attrs": ["PK id (UUID)", "barcode (UNIQUE)", "sku (UNIQUE)", "name", "salePrice, costPrice", "currentStock, minStock"]},
        
        {"name": "WorkOrderItem", "x": 7.8, "y": 3.7, "w": 2.4, "h": 1.6, "bg": LIGHT_AMBER,
         "attrs": ["PK id (UUID)", "FK orderId", "FK productId", "quantity", "unitPrice, totalPrice"]},
        
        {"name": "Invoice", "x": 4.0, "y": 6.2, "w": 2.5, "h": 1.9, "bg": LIGHT_PURPLE,
         "attrs": ["PK id (UUID)", "consecutive (UNIQUE)", "FK customerId, FK userId", "subtotal, discount", "total, paymentType"]},
        
        {"name": "Credit", "x": 4.0, "y": 1.0, "w": 2.4, "h": 1.8, "bg": LIGHT_RED,
         "attrs": ["PK id (UUID)", "FK invoiceId", "FK customerId", "totalAmount, paidAmount", "remainingAmount, status"]},
        
        {"name": "CashSession", "x": 7.8, "y": 1.0, "w": 2.4, "h": 1.8, "bg": LIGHT_GRAY,
         "attrs": ["PK id (UUID)", "openedAt, closedAt", "initialCash, finalCash", "calculatedCash", "difference, status"]}
    ]

    for ent in entities:
        # Table Box
        box = patches.FancyBboxPatch((ent["x"], ent["y"]), ent["w"], ent["h"], boxstyle='round,pad=0.08',
                                     facecolor=ent["bg"], edgecolor=NAVY, lw=1.5)
        ax.add_patch(box)
        # Header banner
        hdr = patches.Rectangle((ent["x"], ent["y"] + ent["h"] - 0.38), ent["w"], 0.38, facecolor=NAVY)
        ax.add_patch(hdr)
        ax.text(ent["x"] + ent["w"]/2, ent["y"] + ent["h"] - 0.2, ent["name"], fontsize=9.5, fontweight='bold', color=WHITE, ha='center')
        
        # Attribute text
        for i, a in enumerate(ent["attrs"]):
            bold_prefix = a.startswith("PK") or a.startswith("FK")
            ax.text(ent["x"] + 0.12, ent["y"] + ent["h"] - 0.58 - i * 0.23, a,
                    fontsize=7.8, fontweight='bold' if bold_prefix else 'normal', color=NAVY if bold_prefix else DARK_SLATE)

    # Relationships Lines
    # Customer 1 -> N Motorcycle
    ax.plot([1.9, 1.9], [6.2, 5.4], color=NAVY, lw=1.5)
    ax.text(2.0, 5.7, "1:N", fontsize=7.5, fontweight='bold', color=NAVY)

    # Customer 1 -> N Invoice
    ax.plot([3.0, 4.0], [7.1, 7.1], color=NAVY, lw=1.5)
    ax.text(3.4, 7.25, "1:N", fontsize=7.5, fontweight='bold', color=NAVY)

    # Motorcycle 1 -> N WorkOrder
    ax.plot([3.0, 4.0], [4.6, 4.6], color=NAVY, lw=1.5)
    ax.text(3.4, 4.75, "1:N", fontsize=7.5, fontweight='bold', color=NAVY)

    # WorkOrder 1 -> N WorkOrderItem
    ax.plot([6.5, 7.8], [4.6, 4.6], color=NAVY, lw=1.5)
    ax.text(7.0, 4.75, "1:N", fontsize=7.5, fontweight='bold', color=NAVY)

    # Product 1 -> N WorkOrderItem
    ax.plot([9.0, 9.0], [6.2, 5.3], color=NAVY, lw=1.5)
    ax.text(9.1, 5.7, "1:N", fontsize=7.5, fontweight='bold', color=NAVY)

    # Invoice 1 -> 1 Credit
    ax.plot([5.2, 5.2], [6.2, 2.8], color=NAVY, lw=1.5, linestyle=':')
    ax.text(5.3, 3.3, "1:1", fontsize=7.5, fontweight='bold', color=NAVY)

    return save_fig(fig, "diagrama_entidad_relacion.png")

# ----------------------------------------------------------------------
# 6. DIAGRAMA DE DESPLIEGUE E INFRAESTRUCTURA
# ----------------------------------------------------------------------
def generate_deployment_diagram():
    fig, ax = plt.subplots(figsize=(10.5, 7.5))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    ax.text(5.5, 8.1, "DIAGRAMA DE DESPLIEGUE FÍSICO Y DE RED - MOTOTALLER", 
            fontsize=14, fontweight='bold', color=NAVY, ha='center')

    # Node 1: PC Mostrador
    box_pc = patches.FancyBboxPatch((0.8, 2.2), 4.2, 4.8, boxstyle='round,pad=0.15', facecolor=LIGHT_BLUE, edgecolor=BLUE, lw=2)
    ax.add_patch(box_pc)
    ax.text(2.9, 6.6, "<<Dispositivo Servidor Local>>\nPC Principal Mostrador (Windows 11)", fontsize=10, fontweight='bold', color=NAVY, ha='center')
    
    # Internal artifacts in PC
    ax.text(2.9, 5.6, "• Runtime: Node.js v20.x\n• Server: Next.js 16 (Port 3000)\n• Base de Datos: SQLite (dev.db)\n• Tunnel Client: ngrok Agent", fontsize=8.5, color=DARK_SLATE, ha='center')

    # Sub-devices USB
    b_usb1 = patches.FancyBboxPatch((1.1, 3.7), 3.6, 0.7, boxstyle='square,pad=0.08', facecolor=WHITE, edgecolor=BORDER_GRAY, lw=1.2)
    ax.add_patch(b_usb1)
    ax.text(2.9, 4.05, "Impresora Térmica ESC/POS (USB/80mm)", fontsize=8, fontweight='bold', color=DARK_SLATE, ha='center', va='center')

    b_usb2 = patches.FancyBboxPatch((1.1, 2.6), 3.6, 0.7, boxstyle='square,pad=0.08', facecolor=WHITE, edgecolor=BORDER_GRAY, lw=1.2)
    ax.add_patch(b_usb2)
    ax.text(2.9, 2.95, "Lector Láser Código de Barras (USB)", fontsize=8, fontweight='bold', color=DARK_SLATE, ha='center', va='center')

    # Cloud Tunnel Box
    box_cloud = patches.FancyBboxPatch((6.4, 5.0), 3.8, 1.8, boxstyle='round,pad=0.15', facecolor=LIGHT_PURPLE, edgecolor=PURPLE, lw=2)
    ax.add_patch(box_cloud)
    ax.text(8.3, 6.3, "<<Nube / Servicio de Túnel>>\nngrok Secure HTTPS Edge", fontsize=9.5, fontweight='bold', color=NAVY, ha='center')
    ax.text(8.3, 5.4, "Dominio Fijo Cifrado TLS\nfinished-lucia-...ngrok-free.dev", fontsize=8, color=DARK_SLATE, ha='center')

    # Mobile Devices Box
    box_mob = patches.FancyBboxPatch((6.4, 1.2), 3.8, 2.8, boxstyle='round,pad=0.15', facecolor=LIGHT_GREEN, edgecolor=GREEN, lw=2)
    ax.add_patch(box_mob)
    ax.text(8.3, 3.5, "<<Dispositivos Móviles>>\nSmartphones Patio Taller (Android/iOS)", fontsize=9.5, fontweight='bold', color=NAVY, ha='center')
    ax.text(8.3, 2.3, "• Navegador Chrome / Safari\n• MotoTaller PWA Instalada\n• Checklist & Órdenes en Mano\n• Escaneo y Consulta en Patio", fontsize=8.5, color=DARK_SLATE, ha='center')

    # Connections
    # PC to Cloud
    ax.annotate("", xy=(6.4, 5.9), xytext=(5.0, 5.9), arrowprops=dict(arrowstyle="<->", color=NAVY, lw=2))
    ax.text(5.7, 6.1, "Túnel TLS\nPuerto 3000", fontsize=7.5, fontweight='bold', color=NAVY, ha='center')

    # Cloud to Mobile
    ax.annotate("", xy=(8.3, 4.0), xytext=(8.3, 5.0), arrowprops=dict(arrowstyle="<->", color=GREEN, lw=2))
    ax.text(8.7, 4.5, "HTTPS\nInalámbrico", fontsize=7.5, fontweight='bold', color=GREEN)

    return save_fig(fig, "diagrama_despliegue.png")

# ----------------------------------------------------------------------
# 7. DIAGRAMA DE SECUENCIA UML (VENTA POS)
# ----------------------------------------------------------------------
def generate_sequence_diagram():
    fig, ax = plt.subplots(figsize=(10.5, 7.5))
    ax.set_xlim(0, 10.5)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    ax.text(5.25, 8.1, "DIAGRAMA DE SECUENCIA UML - TRANSACCIÓN EN PUNTO DE VENTA", 
            fontsize=13, fontweight='bold', color=NAVY, ha='center')

    actors = [
        {"name": "Cajero", "x": 1.2},
        {"name": "Frontend POS (React)", "x": 3.5},
        {"name": "API Sales (/api/sales)", "x": 5.8},
        {"name": "Prisma / SQLite", "x": 8.0},
        {"name": "Impresora Térmica", "x": 9.8}
    ]

    for a in actors:
        # Header box
        box = patches.FancyBboxPatch((a["x"] - 0.9, 7.1), 1.8, 0.55, boxstyle='round,pad=0.08', facecolor=LIGHT_BLUE, edgecolor=BLUE, lw=1.5)
        ax.add_patch(box)
        ax.text(a["x"], 7.37, a["name"], fontsize=8, fontweight='bold', color=NAVY, ha='center', va='center')
        # Lifeline
        ax.plot([a["x"], a["x"]], [7.1, 0.6], color=BORDER_GRAY, lw=1.2, linestyle='--')

    messages = [
        {"y": 6.5, "from": 1.2, "to": 3.5, "text": "1: Escanear código de barras", "color": NAVY},
        {"y": 5.8, "from": 3.5, "to": 5.8, "text": "2: GET /api/products?barcode=...", "color": BLUE},
        {"y": 5.2, "from": 5.8, "to": 8.0, "text": "3: prisma.product.findUnique()", "color": BLUE},
        {"y": 4.6, "from": 8.0, "to": 3.5, "text": "4: Retorna producto y stock actual", "color": GREEN, "dash": True},
        {"y": 4.0, "from": 1.2, "to": 3.5, "text": "5: Aplica descuento y presiona 'Cobrar'", "color": NAVY},
        {"y": 3.3, "from": 3.5, "to": 5.8, "text": "6: POST /api/sales (items, discount, total)", "color": BLUE},
        {"y": 2.6, "from": 5.8, "to": 8.0, "text": "7: tx.invoice.create() & tx.stock.update()", "color": BLUE},
        {"y": 1.9, "from": 8.0, "to": 3.5, "text": "8: Venta confirmada y stock rebajado", "color": GREEN, "dash": True},
        {"y": 1.2, "from": 3.5, "to": 9.8, "text": "9: Enviar raw ESC/POS (Ticket con ahorro)", "color": AMBER}
    ]

    for m in messages:
        ls = '--' if m.get("dash") else '-'
        ax.annotate("", xy=(m["to"], m["y"]), xytext=(m["from"], m["y"]),
                    arrowprops=dict(arrowstyle="->", color=m["color"], lw=1.5, linestyle=ls))
        mid_x = (m["from"] + m["to"]) / 2
        ax.text(mid_x, m["y"] + 0.12, m["text"], fontsize=7.5, fontweight='bold', color=m["color"], ha='center')

    return save_fig(fig, "diagrama_secuencia_pos.png")

# ----------------------------------------------------------------------
# 8. DIAGRAMA DE ESTADOS DE ORDEN DE TRABAJO
# ----------------------------------------------------------------------
def generate_order_state_diagram():
    fig, ax = plt.subplots(figsize=(10.5, 6.5))
    ax.set_xlim(0, 10.5)
    ax.set_ylim(0, 7.5)
    ax.axis('off')

    ax.text(5.25, 7.0, "MÁQUINA DE ESTADOS - CICLO DE UNA ORDEN DE TRABAJO (WORKORDER)", 
            fontsize=13, fontweight='bold', color=NAVY, ha='center')

    # State nodes
    states = [
        {"name": "RECIBIDA\n(Ingreso moto & checklist)", "x": 1.5, "y": 4.8, "w": 2.2, "h": 1.0, "bg": LIGHT_BLUE, "b": BLUE},
        {"name": "EN_DIAGNÓSTICO\n(Evaluación técnica)", "x": 4.8, "y": 4.8, "w": 2.2, "h": 1.0, "bg": LIGHT_AMBER, "b": AMBER},
        {"name": "EN_REPARACIÓN\n(Mano de obra y partes)", "x": 8.0, "y": 4.8, "w": 2.2, "h": 1.0, "bg": LIGHT_PURPLE, "b": PURPLE},
        {"name": "ESPERANDO_REPUESTOS\n(Bodega sin existencias)", "x": 8.0, "y": 2.3, "w": 2.2, "h": 1.0, "bg": LIGHT_RED, "b": RED},
        {"name": "LISTA_PARA_ENTREGA\n(Liquidada y probada)", "x": 4.8, "y": 1.5, "w": 2.2, "h": 1.0, "bg": LIGHT_GREEN, "b": GREEN},
        {"name": "ENTREGADA Y FACTURADA\n(Pago recibido en POS)", "x": 1.5, "y": 1.5, "w": 2.2, "h": 1.0, "bg": WHITE, "b": GREEN}
    ]

    for s in states:
        box = patches.FancyBboxPatch((s["x"] - s["w"]/2, s["y"] - s["h"]/2), s["w"], s["h"],
                                     boxstyle='round,pad=0.1', facecolor=s["bg"], edgecolor=s["b"], lw=2)
        ax.add_patch(box)
        ax.text(s["x"], s["y"], s["name"], fontsize=8, fontweight='bold', color=DARK_SLATE, ha='center', va='center')

    # Start dot
    ax.plot(0.4, 4.8, 'o', color=NAVY, markersize=14)
    ax.annotate("", xy=(0.4, 4.8), xytext=(0.1, 4.8), arrowprops=dict(arrowstyle="->", color=NAVY, lw=2))
    ax.annotate("", xy=(0.9, 4.8), xytext=(0.4, 4.8), arrowprops=dict(arrowstyle="->", color=NAVY, lw=2))

    # Transitions
    ax.annotate("", xy=(3.7, 4.8), xytext=(2.6, 4.8), arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.8))
    ax.text(3.15, 5.0, "Asignar mecánico", fontsize=7.5, color=DARK_SLATE, ha='center')

    ax.annotate("", xy=(6.9, 4.8), xytext=(5.9, 4.8), arrowprops=dict(arrowstyle="->", color=NAVY, lw=1.8))
    ax.text(6.4, 5.0, "Iniciar labores", fontsize=7.5, color=DARK_SLATE, ha='center')

    # To Waiting parts
    ax.annotate("", xy=(8.0, 3.3), xytext=(8.0, 4.3), arrowprops=dict(arrowstyle="->", color=RED, lw=1.6))
    ax.text(8.6, 3.8, "Sin stock", fontsize=7.5, color=RED, ha='center')
    ax.annotate("", xy=(8.5, 4.3), xytext=(8.5, 3.3), arrowprops=dict(arrowstyle="->", color=GREEN, lw=1.6))
    ax.text(9.2, 3.8, "Reabastecido", fontsize=7.5, color=GREEN, ha='center')

    # To Ready
    ax.annotate("", xy=(5.9, 1.9), xytext=(7.1, 4.4), arrowprops=dict(arrowstyle="->", color=GREEN, lw=1.8))
    ax.text(7.0, 2.7, "Reparación\nfinalizada", fontsize=7.5, color=GREEN, ha='center')

    # To Invoiced & Delivered
    ax.annotate("", xy=(2.6, 1.5), xytext=(3.7, 1.5), arrowprops=dict(arrowstyle="->", color=GREEN, lw=2))
    ax.text(3.15, 1.7, "Cobro en POS", fontsize=7.5, fontweight='bold', color=GREEN, ha='center')

    return save_fig(fig, "diagrama_estados_orden.png")

if __name__ == "__main__":
    print("Iniciando generación de los 8 diagramas visuales...")
    generate_architecture_diagram()
    generate_use_case_diagram()
    generate_pos_flowchart()
    generate_workshop_flowchart()
    generate_er_diagram()
    generate_deployment_diagram()
    generate_sequence_diagram()
    generate_order_state_diagram()
    print("¡Todos los diagramas generados con éxito!")
