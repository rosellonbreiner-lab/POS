import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx2pdf import convert
from deliverables_builder import (
    add_heading_1, add_heading_2, add_heading_3,
    add_p, add_bullet, add_callout, add_table_data, add_diagram,
    COLOR_PRIMARY_NAVY, COLOR_ACCENT_BLUE, COLOR_DARK_SLATE, COLOR_MUTED_GRAY,
    HEX_PRIMARY_NAVY, HEX_ACCENT_BLUE, HEX_LIGHT_BLUE, set_cell_background
)

def build_standalone_user_manual():
    doc = docx.Document()

    # Margins
    for s in doc.sections:
        s.top_margin = Inches(0.98)
        s.bottom_margin = Inches(0.98)
        s.left_margin = Inches(0.98)
        s.right_margin = Inches(0.98)
        
        # Header & Footer
        header = s.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("MotoTaller POS & Taller  |  Manual Oficial de Usuario y Operación  |  v2.4.0")
        hrun.font.name = 'Arial'
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = COLOR_MUTED_GRAY
        
        footer = s.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Manual de Operación de MotoTaller - Repositorio: https://github.com/rosellonbreiner-lab/POS\nDocumento para Capacitación y Uso Diario del Personal")
        frun.font.name = 'Arial'
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = COLOR_MUTED_GRAY

    # ==========================================
    # PORTADA DEL MANUAL
    # ==========================================
    p_pre = doc.add_paragraph()
    p_pre.paragraph_format.space_before = Pt(30)
    p_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_pre = p_pre.add_run("MANUAL OFICIAL DE USUARIO Y GUÍA DE OPERACIÓN")
    r_pre.font.name = 'Arial'
    r_pre.font.size = Pt(12)
    r_pre.font.bold = True
    r_pre.font.color.rgb = COLOR_ACCENT_BLUE

    logo_path = os.path.abspath("public/icon-512.png")
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_after = Pt(12)
        p_logo.paragraph_format.space_before = Pt(10)
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_path, width=Inches(1.6))

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(6)
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run("MOTOTALLER")
    r_title.font.name = 'Arial'
    r_title.font.size = Pt(28)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY_NAVY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(16)
    r_sub = p_sub.add_run("MANUAL DE USUARIO, OPERACIÓN EN MOSTRADOR Y TALLER MECÁNICO")
    r_sub.font.name = 'Arial'
    r_sub.font.size = Pt(12.5)
    r_sub.font.bold = True
    r_sub.font.color.rgb = COLOR_ACCENT_BLUE

    p_desc = doc.add_paragraph()
    p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_desc.paragraph_format.space_after = Pt(24)
    r_desc = p_desc.add_run("Guía de Operación Paso a Paso con 17 Capítulos:\nInicio de Sesión, Punto de Venta con Lector de Código de Barras y Descuentos, Órdenes de Servicio Técnico con Checklist, Inventario en Bodega, Cartera de Créditos, Arqueo Ciego de Caja y Preguntas Frecuentes")
    r_desc.font.name = 'Arial'
    r_desc.font.size = Pt(10)
    r_desc.font.italic = True
    r_desc.font.color.rgb = COLOR_DARK_SLATE

    # Metadata
    headers_meta = ["Datos de la Guía", "Detalle"]
    data_meta = [
        ["Sistema de Información", "MotoTaller - Sistema de Gestión Comercial y Taller"],
        ["Versión", "v2.4.0 (PWA Móvil + POS Térmico)"],
        ["Autor / Desarrollador", "Breiner Rosellon"],
        ["Repositorio Público Git", "https://github.com/rosellonbreiner-lab/POS"],
        ["Audiencia", "Cajeros, Mecánicos, Bodegueros, Administradores y Propietarios"],
        ["Soporte Remoto", "Túnel Seguro ngrok (finished-lucia-transpersonally.ngrok-free.dev)"]
    ]
    add_table_data(doc, headers_meta, data_meta, [Inches(2.2), Inches(4.3)])

    doc.add_page_break()

    # ==========================================
    # ÍNDICE DEL MANUAL
    # ==========================================
    add_heading_1(doc, "ÍNDICE DEL MANUAL DE USUARIO")
    indices = [
        "1. Introducción y Objetivo del Sistema",
        "2. Requisitos Mínimos para Utilizar el Software (PC y Celulares)",
        "3. Cómo Acceder al Software (Local y Enlace Remoto ngrok)",
        "4. Inicio de Sesión y Acceso Seguro",
        "5. Descripción General de la Interfaz y Navegación",
        "6. Explicación de Cada Menú del Sistema",
        "7. Cómo Realizar Ventas en POS con Código de Barras y Descuentos",
        "8. Flujo Visual del Proceso de Ventas (Diagrama)",
        "9. Cómo Atender y Recepcionar una Motocicleta en Taller",
        "10. Checklist de Inspección Física y Seguridad",
        "11. Flujo Visual del Ciclo de Vida del Taller (Diagrama)",
        "12. Cómo Registrar Nuevos Repuestos y Evitar Códigos Duplicados",
        "13. Cómo Otorgar Créditos y Registrar Abonos Parciales",
        "14. Cómo Realizar el Arqueo y Cierre Ciego de Caja",
        "15. Cómo Imprimir Tickets Térmicos (80mm y 58mm) con Desglose de Ahorro",
        "16. Solución de Problemas Comunes y Mensajes de Error",
        "17. Preguntas Frecuentes (FAQ) y Soporte Técnico"
    ]
    for idx_item in indices:
        add_bullet(doc, idx_item)

    doc.add_page_break()

    # 1. Introducción
    add_heading_1(doc, "1. INTRODUCCIÓN Y OBJETIVO DEL SISTEMA")
    add_p(doc, "MotoTaller es una plataforma integral diseñada para agilizar y organizar la operación comercial y mecánica de talleres y almacenes de repuestos de motocicletas. Su objetivo principal es erradicar las pérdidas de inventario, brindar transparencia en los descuentos aplicados y automatizar los arqueos de caja y hojas de vida de los vehículos atendidos.")

    # 2. Requisitos
    add_heading_1(doc, "2. REQUISITOS MÍNIMOS PARA UTILIZAR EL SOFTWARE")
    add_bullet(doc, "Computador de Mostrador: PC con Windows 10 u 11, mínimo 4 GB de memoria RAM, navegador Google Chrome o Microsoft Edge.")
    add_bullet(doc, "Celulares y Tablets en Patio: Dispositivos Android (versión 9.0 o superior) o iPhone/iPad (iOS 13.0 o superior).")
    add_bullet(doc, "Hardware de Punto de Venta: Lector de códigos de barras láser con conexión USB e impresora térmica de tickets de 58mm u 80mm.")

    # 3. Acceso
    add_heading_1(doc, "3. CÓMO ACCEDER AL SOFTWARE")
    add_bullet(doc, "http://localhost:3000 (en el computador del local donde está encendido el sistema).", "En el Local (PC Mostrador): ")
    add_bullet(doc, "https://finished-lucia-transpersonally.ngrok-free.dev (enlace con candado de seguridad para usar desde cualquier celular dentro o fuera del taller).", "Desde el Celular o Patio: ")

    # 4. Login
    add_heading_1(doc, "4. INICIO DE SESIÓN Y ACCESO SEGURO")
    add_p(doc, "1. Abra el navegador e ingrese a la dirección correspondiente.\n2. En pantalla observará el formulario de bienvenida de MotoTaller.\n3. Digite su correo electrónico asignado y su contraseña de seguridad.\n4. Si está desde el celular, presione el botón 'Instalar Aplicación' en la pantalla de bienvenida para crear el icono en su pantalla de inicio.\n5. Presione 'Iniciar Sesión'.")

    add_callout(doc,
        "Por políticas de seguridad contra robo de cuentas, si introduce su contraseña incorrecta 5 veces seguidas, el sistema bloqueará temporalmente el acceso por 15 minutos. Si esto ocurre, el Administrador del taller puede desbloquearlo de inmediato desde el panel de usuarios.",
        "BLOQUEO PREVENTIVO DE SEGURIDAD")

    # 5. Interfaz
    add_heading_1(doc, "5. DESCRIPCIÓN GENERAL DE LA INTERFAZ Y NAVEGACIÓN")
    add_p(doc, "MotoTaller cuenta con una interfaz ergonómica en modo oscuro de alto contraste, diseñada para no cansar la vista durante jornadas de trabajo intensas:")
    add_bullet(doc, "Menú Lateral Izquierdo: Permite alternar entre los módulos (Dashboard, POS, Taller, Inventario, Clientes, Créditos, Caja, Ajustes).")
    add_bullet(doc, "Barra Superior: Indica el usuario conectado, su rol (Administrador, Cajero, Mecánico) y el botón para Cerrar Sesión.")
    add_bullet(doc, "Área Central de Trabajo: Pantalla dinámica donde se realizan las operaciones de venta, diagnósticos y consultas.")

    # 6. Menús
    add_heading_1(doc, "6. EXPLICACIÓN DE CADA MENÚ DEL SISTEMA")
    add_bullet(doc, "Métricas en tiempo real: total vendido hoy, margen de ganancia estimado, órdenes de motos en proceso y alertas de repuestos que están por agotarse.", "1. Panel / Dashboard: ")
    add_bullet(doc, "Pantalla de venta rápida con soporte de lector de código de barras, búsqueda por nombre, descuentos automáticos y múltiples formas de cobro.", "2. Ventas / POS: ")
    add_bullet(doc, "Módulo de atención de motos con checklist de ingreso, asignación de mecánicos, repuestos consumidos y liquidación de mano de obra.", "3. Taller / Órdenes: ")
    add_bullet(doc, "Lista maestra de repuestos con código de barras, precio de costo, precio al público, stock actual y estante en bodega.", "4. Inventario: ")
    add_bullet(doc, "Directorio de clientes con historial de compras y motocicletas vinculadas por número de placa.", "5. Clientes & Motos: ")
    add_bullet(doc, "Cartera de ventas a crédito, historial de abonos y saldo restante de cada cliente.", "6. Créditos: ")
    add_bullet(doc, "Apertura diaria de turno, registro de gastos menores, arqueo ciego final y cálculo de sobrante/faltante.", "7. Caja / Contabilidad: ")
    add_bullet(doc, "Datos del negocio (RUT, NIT, dirección), resolución DIAN y control de usuarios.", "8. Ajustes: ")

    doc.add_page_break()

    # 7. POS
    add_heading_1(doc, "7. CÓMO REALIZAR VENTAS EN POS CON CÓDIGO DE BARRAS Y DESCUENTOS")
    add_p(doc, "Procedimiento detallado para facturar en mostrador:")
    add_bullet(doc, "Apunte con el lector láser al código de barras del repuesto. El sistema sonará y añadirá el producto al carrito de compras con su precio. Si el repuesto no tiene código de barras, búsquelo por nombre en la barra de búsqueda o presione F4.", "Paso 1: Agregar Repuestos: ")
    add_bullet(doc, "Para cambiar la cantidad, utilice los botones '+' o '-' en el carrito, o digite directamente el número de unidades deseadas.", "Paso 2: Ajustar Cantidades: ")
    add_bullet(doc, "Si acordó un precio especial o descuento con el cliente, haga clic en el botón de descuento '%' del ítem o en el campo de descuento general. Escriba el porcentaje (ej. 10%) o el valor en pesos. El sistema actualizará el total en vivo y mostrará en color amarillo el valor descontado.", "Paso 3: Aplicar Descuento Comercial: ")
    add_bullet(doc, "Presione la tecla F2 o haga clic en el botón verde 'Cobrar'. Seleccione el método de pago: Efectivo, Nequi, Daviplata, Tarjeta o Crédito. Si el cliente paga en efectivo, escriba la cantidad recibida para que el sistema calcule el cambio exacto a devolver.", "Paso 4: Cobro: ")
    add_bullet(doc, "Haga clic en 'Confirmar Pago'. La venta quedará registrada, el inventario se rebajará automáticamente y se abrirá el comprobante de ticket térmico listo para imprimir, mostrando claramente 'USTED AHORRÓ'.", "Paso 5: Impresión de Ticket: ")

    # 8. Flujo Visual POS
    add_heading_1(doc, "8. FLUJO VISUAL DEL PROCESO DE VENTAS (DIAGRAMA)")
    add_diagram(doc, os.path.abspath("docs_images/diagrama_flujo_pos.png"), "Figura: Diagrama de Flujo del Proceso de Ventas POS y Descuentos en MotoTaller", Inches(6.0))

    doc.add_page_break()

    # 9. Taller
    add_heading_1(doc, "9. CÓMO ATENDER Y RECEPCIONAR UNA MOTOCICLETA EN TALLER")
    add_p(doc, "Procedimiento para el ingreso y reparación de motocicletas:")
    add_bullet(doc, "Ingrese a 'Taller' y haga clic en 'Nueva Orden de Servicio'. Escriba la placa de la moto. Si la moto ya vino antes, el sistema cargará automáticamente los datos del dueño y las características de la moto.", "1. Identificación: ")
    add_bullet(doc, "Digite el kilometraje que marca el velocímetro en ese momento.", "2. Kilometraje: ")
    add_bullet(doc, "Diligencie la lista de chequeo de inspección física (espejos, casco recibido, rayones en tapas, nivel del tanque de gasolina).", "3. Inspección: ")
    add_bullet(doc, "Escriba los motivos de ingreso expresados por el cliente (ejemplo: 'Ruidos en el freno delantero y cambio de aceite') y asigne el mecánico que atenderá la moto.", "4. Diagnóstico: ")
    add_bullet(doc, "Guarde la orden. Quedará en estado 'RECIBIDA'. A medida que el mecánico trabaje, podrá abrir la orden desde su celular y cargar los repuestos utilizados directamente desde bodega.", "5. Seguimiento: ")
    add_bullet(doc, "Al finalizar las labores mecánicas, se digita el costo de la Mano de Obra. La orden pasa a 'LISTA PARA ENTREGA' y puede ser cobrada e impresa en el punto de venta.", "6. Liquidación: ")

    # 10. Checklist
    add_heading_1(doc, "10. CHECKLIST DE INSPECCIÓN FÍSICA Y SEGURIDAD")
    add_p(doc, "El checklist de recepción previene reclamaciones injustificadas registrando el estado real de la motocicleta:")
    chk_data = [
        ["Espejos Retrovisores", "Registra si la moto ingresa con ambos espejos, uno solo o ninguno."],
        ["Casco en Custodia", "Registra si el cliente deja su casco en el taller y las condiciones del mismo."],
        ["Rayones y Carrocería", "Permite dejar constancia de rayones, abolladuras o tapas quebradas previas."],
        ["Nivel de Combustible", "Marca el porcentaje de gasolina en el tanque (Reserva, 1/4, 1/2, 3/4 o Lleno)."],
        ["Accesorios Adicionales", "Registra elementos como impermeables, candados de disco o herramientas dejadas en la moto."]
    ]
    add_table_data(doc, ["Componente Evaluado", "Importancia Operativa"], chk_data, [Inches(2.5), Inches(4.0)])

    # 11. Flujo Visual Taller
    add_heading_1(doc, "11. FLUJO VISUAL DEL CICLO DE VIDA DEL TALLER (DIAGRAMA)")
    add_diagram(doc, os.path.abspath("docs_images/diagrama_flujo_taller.png"), "Figura: Diagrama de Flujo del Ciclo de Vida y Servicio Mecánico en Taller", Inches(6.0))

    doc.add_page_break()

    # 12. Inventario y Barcode
    add_heading_1(doc, "12. CÓMO REGISTRAR NUEVOS REPUESTOS Y EVITAR CÓDIGOS DUPLICADOS")
    add_p(doc, "Para mantener la exactitud del inventario:")
    add_bullet(doc, "Vaya a 'Inventario' y presione 'Nuevo Producto'.")
    add_bullet(doc, "Escanee con la pistola lectora el código de barras impreso en el repuesto.")
    add_bullet(doc, "Digite el Nombre (ej. 'Pastillas de Freno Delanteras Pulsar 200 NS'), Precio de Compra, Precio de Venta al Público y Cantidad Inicial en Bodega.")
    add_bullet(doc, "Asigne la Ubicación en Bodega (Estante y Nivel) para que cualquier empleado sepa exactamente dónde encontrar el repuesto.")
    add_bullet(doc, "Presione 'Guardar' una sola vez.")

    add_callout(doc,
        "¿Por qué sale el error: 'Unique constraint failed on the fields: (barcode)'?\nEste aviso indica que el código de barras que intenta registrar YA ESTÁ ASIGNADO a otro repuesto en el catálogo, o que presionó dos veces seguidas el botón 'Guardar'. Para solucionarlo: verifique en el buscador si el producto ya existe en el sistema, o si es un producto distinto, asígnele su código de barras auténtico.",
        "EXPLICACIÓN TÉCNICA DEL CÓDIGO DE BARRAS DUPLICADO", border_color="D97706", bg_color="FEF3C7")

    # 13. Créditos
    add_heading_1(doc, "13. CÓMO OTORGAR CRÉDITOS Y REGISTRAR ABONOS PARCIALES")
    add_bullet(doc, "Al cobrar una venta o servicio en el POS, seleccione el método 'Crédito' y asigne el cliente con su cédula.", "Otorgar Crédito: ")
    add_bullet(doc, "En el menú 'Créditos', busque al cliente por nombre o cédula. Haga clic en 'Registrar Abono', digite el monto abonado y elija Efectivo o Transferencia.", "Registrar Abono: ")
    add_bullet(doc, "El sistema imprime el comprobante de abono indicando: Monto Anterior, Valor Abonado y Saldo Pendiente. Al llegar el saldo a $0, el crédito se marca automáticamente como 'PAGADO'.", "Cancelación: ")

    # 14. Arqueo Caja
    add_heading_1(doc, "14. CÓMO REALIZAR EL ARQUEO Y CIERRE CIEGO DE CAJA")
    add_p(doc, "Al finalizar el turno de trabajo:")
    add_bullet(doc, "Ingrese a 'Caja / Contabilidad' y presione 'Cierre de Caja'.")
    add_bullet(doc, "Cuente físicamente los billetes y monedas que tiene en la gaveta y digite la cantidad total en 'Efectivo Físico'.")
    add_bullet(doc, "El sistema no le revelará el monto teórico de ventas antes del conteo (Arqueo Ciego), garantizando total transparencia.")
    add_bullet(doc, "Al presionar 'Confirmar Cierre', el sistema comparará el dinero físico contra las ventas netas y le dirá si la caja está CUADRADA, o si existe SOBRANTE o FALTANTE.")
    add_bullet(doc, "Si hay alguna diferencia, escriba el motivo justificado y cierre el turno definitivamente.")

    # 15. Tickets Térmicos
    add_heading_1(doc, "15. CÓMO IMPRIMIR TICKETS TÉRMICOS CON DESGLOSE DE AHORRO")
    add_p(doc, "MotoTaller es compatible con impresoras térmicas de 80mm y 58mm (las más comunes en puntos de venta). El ticket incluye:")
    add_bullet(doc, "Encabezado con Razón Social, NIT, Teléfono y Dirección del Taller.")
    add_bullet(doc, "Consecutivo de Factura y fecha exacta de emisión.")
    add_bullet(doc, "Lista detallada de repuestos y servicios con precios unitarios.")
    add_bullet(doc, "Subtotal regular antes de promociones.")
    add_bullet(doc, "Línea destacada: 'DESCUENTO APLICADO: -$XX.XXX'.")
    add_bullet(doc, "TOTAL NETO A PAGAR y leyenda inferior: '*** USTED AHORRÓ: $XX.XXX ***'.")
    add_bullet(doc, "Resolución DIAN aplicable y código QR de verificación.")

    # 16. Troubleshooting
    add_heading_1(doc, "16. SOLUCIÓN DE PROBLEMAS COMUNES Y MENSAJES DE ERROR")
    add_bullet(doc, "El código de barras ya existe en otro producto del inventario, o se hizo doble clic en guardar. Solución: Verifique en la lista de inventario si el repuesto ya está registrado.", "1. 'Unique constraint failed on the fields: (barcode)': ")
    add_bullet(doc, "El computador servidor se apagó o se cerró la consola. Solución: Vuelva a hacer doble clic en 'start.bat' en el computador principal.", "2. No abre la página desde el celular (Error de conexión / 1033): ")
    add_bullet(doc, "El lector no está configurado con retorno de carro (Enter). Solución: Desconecte y vuelva a conectar el cable USB del lector.", "3. La pistola láser no salta automáticamente de renglón: ")

    # 17. FAQ y Soporte
    add_heading_1(doc, "17. PREGUNTAS FRECUENTES (FAQ) Y SOPORTE TÉCNICO")
    add_p(doc, "¿Dónde se descargan las actualizaciones del software?\nTodas las versiones y mejoras se publican directamente en el repositorio público de GitHub: https://github.com/rosellonbreiner-lab/POS.")
    add_p(doc, "¿Qué pasa si se va la luz en el taller?\nMotoTaller utiliza SQLite en modo WAL, lo que protege la base de datos contra corrupción de datos ante cortes imprevistos de energía eléctrica.")

    output_docx = os.path.abspath("MANUAL_DE_USUARIO_Y_OPERACION_MOTOTALLER.docx")
    output_pdf = os.path.abspath("MANUAL_DE_USUARIO_Y_OPERACION_MOTOTALLER.pdf")
    
    doc.save(output_docx)
    print(f"Manual de Usuario Word guardado en: {output_docx}")

    print("Iniciando conversión a PDF del Manual de Usuario...")
    try:
        convert(output_docx, output_pdf)
        print(f"Manual de Usuario PDF generado en: {output_pdf}")
    except Exception as e:
        print(f"Error generando PDF del manual: {e}")

if __name__ == "__main__":
    build_standalone_user_manual()
