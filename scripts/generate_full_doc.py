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

def build_mototaller_deliverables_document():
    doc = docx.Document()

    # 1. Page Setup - 2.5cm margins (approx 0.98 inches)
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.98)
        s.bottom_margin = Inches(0.98)
        s.left_margin = Inches(0.98)
        s.right_margin = Inches(0.98)
        
        # Header & Footer
        header = s.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("MotoTaller POS & Taller  |  Documento Maestro de Entregables de Software  |  v2.4.0")
        hrun.font.name = 'Arial'
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = COLOR_MUTED_GRAY
        
        footer = s.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Repositorio Oficial Público en GitHub: https://github.com/rosellonbreiner-lab/POS\nDocumento Académico y Profesional de Entrega de Software - Licencia MIT")
        frun.font.name = 'Arial'
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = COLOR_MUTED_GRAY

    # ==========================================
    # PORTADA EJECUTIVA
    # ==========================================
    p_pre = doc.add_paragraph()
    p_pre.paragraph_format.space_before = Pt(25)
    p_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_pre = p_pre.add_run("INGENIERÍA DE SOFTWARE & GESTIÓN DE SISTEMAS DE INFORMACIÓN")
    r_pre.font.name = 'Arial'
    r_pre.font.size = Pt(11)
    r_pre.font.bold = True
    r_pre.font.color.rgb = COLOR_ACCENT_BLUE

    # Cover Logo
    logo_path = os.path.abspath("public/icon-512.png")
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_after = Pt(10)
        p_logo.paragraph_format.space_before = Pt(8)
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_path, width=Inches(1.5))

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
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run("SISTEMA DE GESTIÓN COMERCIAL, PUNTO DE VENTA (POS) Y TALLER DE MOTOCICLETAS")
    r_sub.font.name = 'Arial'
    r_sub.font.size = Pt(13)
    r_sub.font.bold = True
    r_sub.font.color.rgb = COLOR_ACCENT_BLUE

    p_desc = doc.add_paragraph()
    p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_desc.paragraph_format.space_after = Pt(20)
    r_desc = p_desc.add_run("Documento Maestro Integral de Entregables de Ingeniería de Software:\nSRS, Diagramas UML y de Flujo, Arquitectura en Capas, Base de Datos, Pruebas, Seguridad RBAC, Manual de Usuario, Manual de Administrador, Manual de Instalación y Acta de Entrega")
    r_desc.font.name = 'Arial'
    r_desc.font.size = Pt(10)
    r_desc.font.italic = True
    r_desc.font.color.rgb = COLOR_DARK_SLATE

    # Metadata Table
    headers_meta = ["Campo del Proyecto", "Detalle de Especificación"]
    data_meta = [
        ["Nombre del Software", "MotoTaller - Cloud & Local POS & Workshop ERP"],
        ["Autor / Desarrollador Líder", "Breiner Rosellon"],
        ["Repositorio Git (Público)", "https://github.com/rosellonbreiner-lab/POS"],
        ["Versión Entregada", "v2.4.0 (Build de Producción PWA + ngrok Tunnel + Tickets Térmicos)"],
        ["Stack Tecnológico", "Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma ORM, SQLite WAL, Argon2id"],
        ["Diagramas Incluidos", "Arquitectura (4 Capas), Casos de Uso UML, Flujo POS, Flujo Taller, DER, Despliegue, Secuencia, Estados"],
        ["Manuales Incluidos", "Manual de Usuario (17 puntos), Manual de Administrador, Manual de Instalación/Despliegue y Solución de Problemas"],
        ["Túnel de Acceso Remoto", "ngrok Fixed Domain (finished-lucia-transpersonally.ngrok-free.dev) / Cloudflare Tunnel"],
        ["Fecha de Finalización", "Noviembre 2026"],
        ["Estado del Sistema", "100% Funcional, Probado y Listo para Producción"]
    ]
    add_table_data(doc, headers_meta, data_meta, [Inches(2.2), Inches(4.3)])

    doc.add_page_break()

    # ==========================================
    # ÍNDICE GENERAL / TABLA DE CONTENIDO
    # ==========================================
    add_heading_1(doc, "ÍNDICE GENERAL DEL PROYECTO")
    add_p(doc, "El presente documento formaliza todos los entregables de ingeniería de software requeridos para el diseño, desarrollo, pruebas, seguridad, despliegue y entrega del sistema de información MotoTaller, integrando diagramas visuales y manuales detallados de operación conforme a la guía maestra de entregables.")
    
    indices = [
        "1. Planteamiento del Problema, Justificación y Objetivos del Proyecto",
        "2. Alcance del Sistema, Reglas de Negocio y Viabilidad",
        "3. Especificación de Requisitos de Software (SRS: 16 RF y 10 RNF)",
        "4. Actores del Sistema, Historias de Usuario (Scrum/BDD) y Matriz RBAC",
        "5. Especificación Formal de Casos de Uso del Negocio (CU-01 a CU-05)",
        "6. Arquitectura de Software y Stack Tecnológico Detallado",
        "7. CATÁLOGO VISUAL DE DIAGRAMAS DE INGENIERÍA DE SOFTWARE:\n   • Figura 1: Diagrama de Arquitectura de Software en Capas\n   • Figura 2: Diagrama de Casos de Uso UML\n   • Figura 3: Diagrama de Flujo del Proceso de Ventas POS y Descuentos\n   • Figura 4: Diagrama de Flujo del Ciclo de Vida y Atención en Taller\n   • Figura 5: Diagrama Entidad-Relación (DER Conceptual)\n   • Figura 6: Diagrama de Despliegue Físico y de Red (Local + Túnel ngrok + Móviles)\n   • Figura 7: Diagrama de Secuencia UML de Facturación en POS\n   • Figura 8: Máquina de Estados de una Orden de Trabajo (WorkOrder)",
        "8. Diccionario de Datos Completo y Modelo de Base de Datos Relacional",
        "9. Catálogo Completo de APIs y Endpoints REST",
        "10. Plan de Pruebas de Software, Casos de Prueba (CP-01 a CP-10) e Informe de Resultados",
        "11. Seguridad de la Información, Hashing Argon2id y Protección OWASP",
        "12. MANUAL DE USUARIO Y OPERACIÓN COMPLETO (Estructura de 17 Puntos):\n   • Acceso, Login, Navegación de menús, Facturación POS, Descuentos, Taller, Inventario, Créditos, Caja, Tickets y FAQ",
        "13. MANUAL DE ADMINISTRADOR DEL SISTEMA (Usuarios, Permisos, Auditoría y Configuración Fiscal)",
        "14. MANUAL DE INSTALACIÓN, CONFIGURACIÓN Y DESPLIEGUE (Node.js, start.bat, ngrok y PWA)",
        "15. MANUAL TÉCNICO, DE BASE DE DATOS Y MANTENIMIENTO",
        "16. MANUAL DE SOLUCIÓN DE PROBLEMAS (Troubleshooting y Códigos de Error)",
        "17. Gestión de Versiones, Repositorio Git Público y Changelog",
        "18. Acta Formal de Entrega y Recepción de Software (Firmas de Conformidad)"
    ]
    for idx_item in indices:
        add_bullet(doc, idx_item)

    add_callout(doc, 
        "El código fuente completo de este proyecto se encuentra alojado y abierto de forma pública en GitHub para fines de revisión académica y técnica por parte de compañeros y evaluadores:\nURL Pública: https://github.com/rosellonbreiner-lab/POS\nComando de clonación directa: git clone https://github.com/rosellonbreiner-lab/POS.git",
        "REPOSITORIO PÚBLICO DISPONIBLE")

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 1: INTRODUCCIÓN Y PLANTEAMIENTO
    # ==========================================
    add_heading_1(doc, "1. PLANTEAMIENTO DEL PROBLEMA, JUSTIFICACIÓN Y OBJETIVOS")
    
    add_heading_2(doc, "1.1 Introducción")
    add_p(doc, "La industria del mantenimiento automotriz y comercialización de repuestos para motocicletas en Colombia y América Latina se caracteriza por una alta rotación de inventario, márgenes de intermediación ajustados y una compleja interacción entre la venta de partes en mostrador y los servicios mecánicos especializados en taller. 'MotoTaller' nace como una solución integral moderna, ágil y de código abierto orientada a digitalizar todos los eslabones comerciales y operativos de este sector en una plataforma web y móvil progresiva (PWA).")

    add_heading_2(doc, "1.2 Planteamiento del Problema")
    add_p(doc, "Los talleres de motocicletas tradicionales enfrentan actualmente graves pérdidas económicas y operativas derivadas de la falta de herramientas tecnológicas integradas:")
    add_bullet(doc, "Desorden en la custodia e ingreso de motocicletas: Se carece de un inventario físico al recibir la moto (rayones, estado de espejos, casco, kilometraje), generando frecuentes quejas de clientes y disputas legales.", "Falta de Recepción Técnica: ")
    add_bullet(doc, "Fuga de inventario de repuestos: Los mecánicos consumen partes del almacén sin registro inmediato, provocando descuadres en stock físico vs. contable.", "Pérdida de Stock: ")
    add_bullet(doc, "Inconsistencia en descuentos y facturación: Los descuentos pactados en mostrador no se reflejan explícitamente en el ticket de venta, impidiendo auditorías de rentabilidad y confundiendo al comprador.", "Opacidad en Facturación: ")
    add_bullet(doc, "Descuadres de dinero en caja: Al finalizar el día no existe un procedimiento de arqueo ciego que compare el dinero físico recaudado (efectivo, Nequi, Daviplata, tarjetas) con las ventas del sistema.", "Descuadres de Caja: ")
    add_bullet(doc, "Cuentas por cobrar descontroladas: Los créditos otorgados a clientes de confianza se anotan en cuadernos de papel, perdiendo el rastro de abonos parciales y fechas límite.", "Gestión de Créditos Deficiente: ")

    add_heading_2(doc, "1.3 Justificación")
    add_p(doc, "El desarrollo de MotoTaller está justificado en la necesidad apremiante de un software accesible, de rápida implementación y costo cero de licenciamiento recurrente. La adopción de Next.js 16, React 19 y SQLite con WAL (Write-Ahead Logging) garantiza tiempos de respuesta instantáneos en hardware estándar de punto de venta, permitiendo además su operación simultánea desde celulares inteligentes mediante tecnología PWA y un túnel seguro con ngrok.")

    add_heading_2(doc, "1.4 Objetivos del Proyecto")
    add_p(doc, "Objetivo General:", bold=True)
    add_p(doc, "Desarrollar e implementar un sistema de información web y progresivo (PWA) para la gestión integral de ventas (POS), inventario, taller de motocicletas, control de caja y cartera de créditos, que garantice la trazabilidad de repuestos consumidos, arqueos exactos y transparencia en facturación con impresión térmica.")
    
    add_p(doc, "Objetivos Específicos:", bold=True)
    add_bullet(doc, "Diseñar un módulo de Punto de Venta (POS) rápido con soporte de lector de código de barras físico y visualización explícita de descuentos aplicados tanto en pantalla como en el comprobante fiscal/ticket térmico.")
    add_bullet(doc, "Implementar un subsistema de Órdenes de Trabajo de Taller que registre la hoja de vida de la motocicleta, kilometraje, checklist de recepción, mecánicos asignados y consumo de repuestos en tiempo real.")
    add_bullet(doc, "Desarrollar un módulo de Control de Inventario con asignación de ubicaciones físicas (bodega, estante, nivel), alertas de stock mínimo y prevención estricta de códigos de barras duplicados.")
    add_bullet(doc, "Construir un módulo de Caja y Arqueo Ciego con registro de movimientos de entrada/salida y cálculo automatizado de descuadres (sobrantes o faltantes).")
    add_bullet(doc, "Garantizar la interoperabilidad remota mediante arquitectura PWA y túnel HTTPS persistente (ngrok) para operación inalámbrica desde dispositivos móviles en el patio del taller.")

    # ==========================================
    # SECCIÓN 2: ALCANCE, REGLAS Y VIABILIDAD
    # ==========================================
    add_heading_1(doc, "2. ALCANCE DEL SISTEMA, REGLAS DE NEGOCIO Y VIABILIDAD")
    
    add_heading_2(doc, "2.1 Alcance del Sistema")
    add_p(doc, "El sistema MotoTaller abarca las siguientes fronteras funcionales:")
    add_bullet(doc, "Módulos incluidos: Autenticación RBAC, Punto de Venta con descuentos y cálculo de cambio, Catálogo de repuestos y servicios, Órdenes de trabajo con checklist y liquidación de mano de obra, Cuentas por cobrar con abonos parciales, Arqueo de caja, Módulo de cotizaciones con conversión a orden o factura, Impresión ESC/POS en 80mm y 58mm, y Auditoría de eventos sensibles.")
    add_bullet(doc, "Exclusiones de la versión actual: Conexión sincrónica directa con la DIAN para factura electrónica XML/UBL 2.1 (se provee arquitectura extensible para conectores en v3.0) y pasarelas de pago de débito bancario directo en línea (se maneja validación de comprobante Nequi/Daviplata/Datafono).")

    add_heading_2(doc, "2.2 Reglas de Negocio Fundamentales (RN)")
    rn_data = [
        ["RN-01", "Unicidad de Códigos de Barras", "Cada producto registrado debe poseer un código de barras irrepetible en la base de datos para impedir colisiones en el lector láser del POS."],
        ["RN-02", "Control Estricto de Stock Negativo", "El sistema no permite despachar productos con stock inferior a la cantidad solicitada, a menos que el usuario posea permisos administrativos de ajuste."],
        ["RN-03", "Desglose Transparente de Descuentos", "Cualquier descuento comercial aplicado debe visualizarse desglosado en el subtotal de la factura y en el ticket impreso bajo la leyenda 'USTED AHORRÓ'."],
        ["RN-04", "Obligatoriedad de Placa en Taller", "No se puede aperturar ninguna orden de reparación sin asociar una placa válida y el kilometraje actual de la motocicleta recibida."],
        ["RN-05", "Inmutabilidad de Facturas Emitidas", "Una vez finalizada y pagada una venta, su registro es inmutable; las correcciones o devoluciones deben tramitarse mediante Nota Crédito auditada."],
        ["RN-06", "Cierre y Arqueo Previo de Caja", "No es posible iniciar un nuevo turno de ventas sin haber cerrado y cuadrado formalmente la sesión de caja anterior."],
        ["RN-07", "Bloqueo por Intentos Fallidos", "Cinco intentos erróneos de inicio de sesión provocan el bloqueo preventivo de la cuenta de usuario por 15 minutos."],
        ["RN-08", "Vigencia de Cotizaciones", "Las cotizaciones generadas tienen un período máximo de validez de 15 días calendario, tras el cual pasan automáticamente a estado VENCIDA."]
    ]
    add_table_data(doc, ["Código", "Regla de Negocio", "Descripción Operativa"], rn_data, [Inches(1.0), Inches(2.2), Inches(3.3)])

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 3: ESPECIFICACIÓN DE REQUISITOS (SRS)
    # ==========================================
    add_heading_1(doc, "3. ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE (SRS)")
    add_p(doc, "A continuación se formalizan los 16 requisitos funcionales y 10 no funcionales que rigen el comportamiento técnico y operativo de MotoTaller.")

    add_heading_2(doc, "3.1 Requisitos Funcionales (RF)")
    rf_data = [
        ["RF-01", "Autenticación y Sesiones", "Iniciar y cerrar sesión con credenciales cifradas, tokens HttpOnly y protección contra ataques de fuerza bruta.", "Alta", "Seguridad"],
        ["RF-02", "Control de Catálogo", "Crear, consultar, actualizar y desactivar repuestos y servicios con control de código de barras único y SKU.", "Alta", "Inventario"],
        ["RF-03", "Gestión de Ubicación Física", "Asignar a cada producto su localización exacta en bodega (Estante, Nivel, Casilla) para agilizar el despacho.", "Media", "Inventario"],
        ["RF-04", "Punto de Venta (POS)", "Facturación en mostrador mediante lectura láser de código de barras, teclado numérico y búsqueda predictiva.", "Alta", "Ventas"],
        ["RF-05", "Desglose de Descuentos", "Aplicar descuentos porcentuales o de monto fijo por ítem y globales, reflejando el ahorro en pantalla y ticket.", "Alta", "Ventas"],
        ["RF-06", "Múltiples Formas de Pago", "Registrar cobros en Efectivo, Nequi, Daviplata, Tarjetas y pagos Mixtos con cálculo instantáneo de cambio.", "Alta", "Ventas"],
        ["RF-07", "Recepción de Motocicletas", "Aperturar órdenes de trabajo vinculando cliente, placa, kilometraje y checklist físico de estado de la moto.", "Alta", "Taller"],
        ["RF-08", "Seguimiento de Reparación", "Cambio dinámico de estados de la orden (RECIBIDA, DIAGNÓSTICO, EN_REPARACIÓN, LISTA, ENTREGADA).", "Alta", "Taller"],
        ["RF-09", "Consumo de Repuestos", "Descarga automática del inventario en tiempo real a medida que el mecánico asocia repuestos a la orden de trabajo.", "Alta", "Taller / Stock"],
        ["RF-10", "Liquidación de Mano de Obra", "Consolidar el valor de servicios mecánicos y repuestos en la factura final de entrega.", "Alta", "Taller"],
        ["RF-11", "Gestión de Cartera / Créditos", "Registrar ventas a crédito, controlando saldo adeudado, historial de abonos parciales y estado de mora.", "Alta", "Créditos"],
        ["RF-12", "Arqueo y Cierre de Caja", "Apertura de turno con base inicial, registro de ingresos/egresos y arqueo ciego con reporte de descuadre.", "Alta", "Caja"],
        ["RF-13", "Directorio de Clientes", "Centralizar clientes con cédula/NIT, teléfono, historial de vehículos atendidos y acumulado de compras.", "Media", "Clientes"],
        ["RF-14", "Impresión Térmica ESC/POS", "Generación de tickets de 80mm y 58mm optimizados para corte automático, logo, código QR y detalle de ahorro.", "Alta", "Hardware"],
        ["RF-15", "Registro de Auditoría", "Trazabilidad inmutable de eventos críticos (anulaciones, ajustes manuales de stock, login de usuarios).", "Media", "Auditoría"],
        ["RF-16", "Soporte PWA e Instalación", "Capacidad de instalación nativa en dispositivos móviles Android/iOS y sincronización remota por túnel.", "Alta", "Móvil / PWA"]
    ]
    add_table_data(doc, ["ID", "Requisito Funcional", "Descripción Técnica", "Prioridad", "Módulo"], rf_data, [Inches(0.7), Inches(1.5), Inches(2.6), Inches(0.8), Inches(0.9)])

    add_heading_2(doc, "3.2 Requisitos No Funcionales (RNF)")
    rnf_data = [
        ["RNF-01", "Tiempo de Respuesta", "El 95% de las peticiones a la API deben responder en menos de 300 ms en red local y menos de 800 ms a través de túnel ngrok."],
        ["RNF-02", "Criptografía y Contraseñas", "Las contraseñas se protegen mediante el algoritmo Argon2id con parámetros de coste de memoria recomendados por OWASP."],
        ["RNF-03", "Concurrencia e Integridad", "Uso del motor SQLite configurado en modo Write-Ahead Logging (WAL) para permitir lecturas concurrentes sin bloqueo."],
        ["RNF-04", "Diseño Adaptativo (Responsive)", "Interfaz gráfica 100% responsive optimizada para pantallas táctiles de celulares (360px) hasta monitores Full HD (1920px)."],
        ["RNF-05", "Disponibilidad", "Disponibilidad del 99.8% durante la jornada operativa comercial gracias al demonio local de Next.js y servicio de túnel."],
        ["RNF-06", "Usabilidad Ergonómica", "Soporte de atajos de teclado completos en el módulo de ventas (F2 Cobrar, F4 Buscar, ESC Limpiar) para agilizar la fila."],
        ["RNF-07", "Mantenibilidad del Código", "Estructura modular en TypeScript estricto con tipado completo, separación en capas de servicio y componentes React atómicos."],
        ["RNF-08", "Seguridad contra Inyección", "Blindaje total contra inyecciones SQL a través de consultas parametrizadas generadas por el ORM Prisma."],
        ["RNF-09", "Portabilidad y Arranque Rápido", "Inicio del sistema en un solo paso mediante el archivo automatizado 'start.bat' sin necesidad de configuraciones manuales."],
        ["RNF-10", "Copias de Seguridad Livianas", "Respaldo completo de la base de datos relacional en un solo archivo binario con tiempo de copia menor a 5 segundos."]
    ]
    add_table_data(doc, ["ID", "Requisito No Funcional", "Criterio de Aceptación y Métrica"], rnf_data, [Inches(0.9), Inches(1.8), Inches(3.8)])

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 4: ACTORES, HISTORIAS Y RBAC
    # ==========================================
    add_heading_1(doc, "4. ACTORES DEL SISTEMA, HISTORIAS DE USUARIO Y MATRIZ RBAC")
    
    add_heading_2(doc, "4.1 Actores del Sistema")
    add_bullet(doc, "Superadministrador: Propietario o director de tecnología. Posee acceso irrestricto a auditorías, configuración del taller, usuarios, roles, base de datos y utilidades de respaldo.", "SUPERADMIN: ")
    add_bullet(doc, "Administrador: Gerente de punto de venta. Administra catálogo de repuestos, listas de precios, asignación de mecánicos, aprobación de créditos y cierre definitivo de caja.", "ADMIN: ")
    add_bullet(doc, "Cajero: Personal de mostrador. Ejecuta facturación en el POS, cobra en distintas modalidades, recibe abonos a créditos y efectúa su propio arqueo de turno.", "CAJERO: ")
    add_bullet(doc, "Mecánico / Técnico: Personal operativo de patio. Consulta órdenes de trabajo asignadas a su nombre, solicita repuestos a bodega y registra el trabajo efectuado.", "MECANICO: ")
    add_bullet(doc, "Bodeguero: Encargado de almacén. Realiza ingresos de mercancía por compra, traslados entre estantes y control físico de existencias.", "BODEGUERO: ")

    add_heading_2(doc, "4.2 Matriz de Roles y Permisos (RBAC)")
    rbac_headers = ["Módulo / Acción del Sistema", "SUPERADMIN", "ADMIN", "CAJERO", "MECANICO", "BODEGUERO"]
    rbac_data = [
        ["Iniciar Sesión en el Sistema", "Sí", "Sí", "Sí", "Sí", "Sí"],
        ["Realizar Ventas y Facturar en POS", "Sí", "Sí", "Sí", "No", "No"],
        ["Aplicar Descuentos en Ventas", "Sí", "Sí (Hasta 20%)", "Solo con PIN", "No", "No"],
        ["Crear y Editar Productos / Precios", "Sí", "Sí", "Solo Lectura", "No", "Sí (Stock)"],
        ["Aperturar Órdenes de Taller", "Sí", "Sí", "Sí", "Sí", "No"],
        ["Asociar Repuestos a Orden de Moto", "Sí", "Sí", "Sí", "Sí", "No"],
        ["Liquidar Mano de Obra y Facturar Taller", "Sí", "Sí", "Sí", "No", "No"],
        ["Registrar Abonos a Créditos", "Sí", "Sí", "Sí", "No", "No"],
        ["Abrir y Cerrar Sesión de Caja", "Sí", "Sí", "Sí (Su Turno)", "No", "No"],
        ["Ver Métricas Financieras y Ganancias", "Sí", "Sí", "No", "No", "No"],
        ["Consultar Logs de Auditoría Sensible", "Sí", "No", "No", "No", "No"],
        ["Gestionar Usuarios y Roles", "Sí", "Solo creación", "No", "No", "No"],
        ["Configuración del Taller (RUT/Resolución)", "Sí", "Sí", "No", "No", "No"]
    ]
    add_table_data(doc, rbac_headers, rbac_data, [Inches(2.5), Inches(0.8), Inches(0.8), Inches(0.8), Inches(0.8), Inches(0.8)])

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 5: ESPECIFICACIÓN DE CASOS DE USO
    # ==========================================
    add_heading_1(doc, "5. ESPECIFICACIÓN FORMAL DE CASOS DE USO DEL NEGOCIO")
    
    cu_list = [
        {
            "code": "CU-01", "name": "Iniciar Sesión en el Sistema",
            "actor": "Todos los usuarios autorizados (SUPERADMIN, ADMIN, CAJERO, MECANICO, BODEGUERO)",
            "obj": "Autenticar la identidad del colaborador y crear una sesión segura HttpOnly.",
            "pre": "El usuario debe existir en la base de datos y encontrarse en estado activo.",
            "main": "1. El usuario accede a la URL del sistema.\n2. Ingresa su correo electrónico y contraseña.\n3. El sistema valida las credenciales contrastando el hash Argon2id.\n4. Si es correcto, genera un token criptográfico, registra la IP en la tabla Session y redirige a la vista principal acorde al rol.",
            "alt": "Contraseña inválida: El sistema incrementa el contador de intentos fallidos. Al quinto error consecutivo, bloquea la cuenta temporalmente por 15 minutos.",
            "post": "Sesión establecida exitosamente; interfaz desbloqueada según permisos RBAC."
        },
        {
            "code": "CU-02", "name": "Facturar Venta en Mostrador (POS) con Descuento",
            "actor": "Cajero o Administrador",
            "obj": "Consolidar los repuestos adquiridos por el cliente, aplicar descuentos y registrar el cobro.",
            "pre": "Debe existir al menos un producto con stock y la caja debe encontrarse en estado ABIERTA.",
            "main": "1. El cajero escanea los códigos de barras de los repuestos o los busca por nombre.\n2. Selecciona el cliente o deja 'Consumidor Final'.\n3. Aplica descuento por producto o descuento global si aplica.\n4. Presiona el botón 'Cobrar' (o atajo F2).\n5. Selecciona el método de pago (Efectivo, Nequi, etc.) e ingresa el monto recibido.\n6. El sistema calcula el cambio, descuenta el stock en la base de datos, crea el registro en Invoice y envía la orden de impresión del ticket.",
            "alt": "Stock insuficiente: El sistema alerta visualmente que la cantidad supera las existencias disponibles y restringe la venta.",
            "post": "Factura guardada, inventario rebajado, movimiento registrado en caja y ticket emitido."
        },
        {
            "code": "CU-03", "name": "Apertura y Diagnóstico de Orden de Taller",
            "actor": "Mecánico o Administrador",
            "obj": "Registrar el ingreso técnico de la motocicleta y diagnosticar las reparaciones necesarias.",
            "pre": "El cliente y la motocicleta deben estar registrados en el sistema.",
            "main": "1. El mecánico ingresa al módulo 'Taller' y hace clic en 'Nueva Orden'.\n2. Ingresa la placa de la moto y el kilometraje actual.\n3. Diligencia el checklist visual de daños, espejos y gasolina.\n4. Escribe el diagnóstico inicial y selecciona el técnico a cargo.\n5. Guarda la orden, la cual adquiere el consecutivo automático y estado 'RECIBIDA'.",
            "alt": "Placa no registrada: El formulario abre dinámicamente una sub-ventana para registrar cliente y datos de la moto sin perder el avance.",
            "post": "Orden de trabajo creada y visible en el tablero Kanban del taller."
        },
        {
            "code": "CU-04", "name": "Asociación de Repuestos y Liquidación de Taller",
            "actor": "Mecánico / Administrador",
            "obj": "Descargar repuestos de almacén para instalarlos en la motocicleta y cobrar la mano de obra.",
            "pre": "La orden de trabajo debe estar en estado 'EN_REPARACIÓN'.",
            "main": "1. El mecánico abre la orden de trabajo en curso.\n2. Busca los repuestos requeridos (pastillas de freno, aceite, bujía) y define cantidades.\n3. El sistema valida stock y asocia los repuestos a la orden mediante WorkOrderItem.\n4. El mecánico ingresa el valor acordado por Mano de Obra técnica.\n5. El sistema totaliza la orden y permite facturar directamente, cambiando el estado a 'LISTA PARA ENTREGA'.",
            "alt": "Repuesto sin stock en bodega: El sistema marca la orden en estado 'ESPERANDO_REPUESTOS' para alertar al bodeguero.",
            "post": "Stock descargado del inventario general y orden lista para ser cancelada por el cliente."
        },
        {
            "code": "CU-05", "name": "Arqueo y Cierre Ciego de Caja",
            "actor": "Cajero",
            "obj": "Efectuar el conteo físico de dinero al finalizar la jornada y contrastarlo con el sistema.",
            "pre": "La sesión de caja debe estar en estado ABIERTA.",
            "main": "1. El cajero hace clic en 'Cierre de Caja'.\n2. Ingresa el conteo físico de billetes y monedas sin que el sistema le revele el monto teórico (Arqueo Ciego).\n3. Confirma el cierre.\n4. El sistema compara el efectivo físico contra la suma de (Base Inicial + Ventas Efectivo + Abonos - Salidas) y genera el resultado: CUADRADO, SOBRANTE o FALTANTE.",
            "alt": "Existe descuadre: El sistema exige al cajero registrar una observación obligatoria justificando la diferencia antes de cerrar.",
            "post": "Sesión de caja marcada como CERRADA; genera el reporte para auditoría del administrador."
        }
    ]

    for cu in cu_list:
        add_heading_2(doc, f"{cu['code']}: {cu['name']}")
        cu_table_data = [
            ["Código y Nombre", f"{cu['code']} - {cu['name']}"],
            ["Actor(es)", cu['actor']],
            ["Objetivo", cu['obj']],
            ["Precondición", cu['pre']],
            ["Flujo Principal", cu['main']],
            ["Flujo Alternativo", cu['alt']],
            ["Postcondición", cu['post']]
        ]
        add_table_data(doc, ["Atributo", "Especificación del Caso de Uso"], cu_table_data, [Inches(1.8), Inches(4.7)])

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 6: ARQUITECTURA DE SOFTWARE
    # ==========================================
    add_heading_1(doc, "6. ARQUITECTURA DE SOFTWARE Y STACK TECNOLÓGICO")
    add_p(doc, "MotoTaller se fundamenta en un modelo de arquitectura limpia desacoplada en cuatro capas funcionales: Presentación Cliente (PWA), Comunicación y Túnel Remoto Cifrado, Lógica de Negocio Serverless (Route Handlers) y Persistencia Relacional con Motor SQLite en modo WAL.")

    stack_data = [
        ["Framework Fullstack", "Next.js 16.0 (App Router)", "Renderizado híbrido, enrutamiento moderno y APIs serverless."],
        ["Biblioteca de Interfaz", "React 19.0", "Gestión reactiva de estado y componentes atómicos."],
        ["Lenguaje de Programación", "TypeScript 5.x", "Tipado estricto en frontend y backend para prevenir errores en tiempo de ejecución."],
        ["Motor de Estilos", "Tailwind CSS v4.0", "Diseño responsivo, modo oscuro de alto contraste y microinteracciones."],
        ["ORM y Modelado", "Prisma ORM 5.x", "Mapeo objeto-relacional seguro, tipado y migraciones automatizadas."],
        ["Motor de Base de Datos", "SQLite con WAL Mode", "Persistencia ligera, veloz, libre de costos de servidor y portable."],
        ["Criptografía", "Argon2id / Node Crypto", "Hashing resistente a GPUs y tokens de sesión aleatorios seguros."],
        ["Túnel Remoto", "ngrok (Dominio Fijo)", "Acceso remoto cifrado HTTPS para dispositivos móviles y tablets de patio."],
        ["Impresión Térmica", "Emulador ESC/POS Nativo", "Generación de tickets térmicos con corte, códigos de barras y desglose de ahorro."]
    ]
    add_table_data(doc, ["Componente", "Tecnología Seleccionada", "Función en el Sistema"], stack_data, [Inches(1.8), Inches(2.0), Inches(2.7)])

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 7: CATÁLOGO VISUAL DE DIAGRAMAS
    # ==========================================
    add_heading_1(doc, "7. CATÁLOGO VISUAL DE DIAGRAMAS DE INGENIERÍA DE SOFTWARE")
    add_p(doc, "A continuación se presentan los ocho diagramas gráficos oficiales que modelan la arquitectura, interacción de actores, flujos operativos de negocio, estructura de base de datos, topología de despliegue y máquina de estados de MotoTaller.")

    # 1. Arquitectura
    add_heading_2(doc, "7.1 Diagrama de Arquitectura de Software en Capas")
    add_p(doc, "Representa las cuatro capas de la plataforma: Presentación cliente (PWA y Mostrador), Túnel seguro HTTPS (ngrok), Capa de servicios y lógica de negocio (Next.js 16 App Router) y Capa de persistencia (Prisma ORM y SQLite WAL).")
    add_diagram(doc, os.path.abspath("docs_images/diagrama_arquitectura.png"), "Figura 1: Diagrama de Arquitectura de Software en Capas de MotoTaller v2.4", Inches(6.3))

    # 2. Casos de Uso
    add_heading_2(doc, "7.2 Diagrama de Casos de Uso UML")
    add_p(doc, "Modela la frontera del sistema MotoTaller y las interacciones de los cinco actores principales (Cajero, Mecánico, Administrador, Bodeguero y Superadministrador) con los casos de uso nucleares.")
    add_diagram(doc, os.path.abspath("docs_images/diagrama_casos_de_uso.png"), "Figura 2: Diagrama de Casos de Uso UML del Sistema MotoTaller", Inches(6.3))

    doc.add_page_break()

    # 3. Flujo POS
    add_heading_2(doc, "7.3 Diagrama de Flujo del Proceso de Ventas POS y Descuentos")
    add_p(doc, "Describe el flujo secuencial de atención en mostrador: escaneo con lector láser, validación de stock, aplicación interactiva de descuentos en porcentaje o pesos, selección de métodos de pago y emisión de ticket térmico.")
    add_diagram(doc, os.path.abspath("docs_images/diagrama_flujo_pos.png"), "Figura 3: Flujograma de Venta Rápida POS y Descuentos", Inches(6.1))

    # 4. Flujo Taller
    add_heading_2(doc, "7.4 Diagrama de Flujo del Ciclo de Atención en Taller de Motocicletas")
    add_p(doc, "Modela el ciclo operativo de servicio mecánico: recepción e inspección inicial de la moto, diagnóstico técnico, descarga de repuestos de bodega en tiempo real, liquidación de mano de obra y cobro.")
    add_diagram(doc, os.path.abspath("docs_images/diagrama_flujo_taller.png"), "Figura 4: Flujograma del Ciclo de Vida y Servicio Mecánico en Taller", Inches(6.1))

    doc.add_page_break()

    # 5. DER Visual
    add_heading_2(doc, "7.5 Diagrama Entidad-Relación (DER Conceptual)")
    add_p(doc, "Esquema gráfico de las entidades principales de la base de datos (Customer, Motorcycle, WorkOrder, Product, WorkOrderItem, Invoice, Credit y CashSession) y sus cardinalidades 1:N y 1:1.")
    add_diagram(doc, os.path.abspath("docs_images/diagrama_entidad_relacion.png"), "Figura 5: Diagrama Entidad-Relación (DER) de la Base de Datos Relacional", Inches(6.3))

    # 6. Despliegue Físico y de Red
    add_heading_2(doc, "7.6 Diagrama de Despliegue Físico y de Red")
    add_p(doc, "Topología de infraestructura: PC Servidor local con periféricos USB (lector láser e impresora térmica), túnel HTTPS ngrok con dominio fijo y dispositivos móviles en el patio del taller conectados vía WiFi.")
    add_diagram(doc, os.path.abspath("docs_images/diagrama_despliegue.png"), "Figura 6: Diagrama de Despliegue e Infraestructura Local/Remota", Inches(6.3))

    doc.add_page_break()

    # 7. Secuencia UML
    add_heading_2(doc, "7.7 Diagrama de Secuencia UML de Facturación en POS")
    add_p(doc, "Muestra la interacción sincrónica en el tiempo entre el Cajero, la Interfaz React, el Route Handler /api/sales, el motor de persistencia Prisma/SQLite y el subsistema de impresión ESC/POS.")
    add_diagram(doc, os.path.abspath("docs_images/diagrama_secuencia_pos.png"), "Figura 7: Diagrama de Secuencia UML - Transacción de Venta en Mostrador", Inches(6.3))

    # 8. Máquina de Estados
    add_heading_2(doc, "7.8 Máquina de Estados de una Orden de Trabajo (WorkOrder)")
    add_p(doc, "Ciclo de vida y transiciones válidas de una motocicleta en el taller: RECIBIDA -> EN_DIAGNÓSTICO -> EN_REPARACIÓN -> (ESPERANDO_REPUESTOS) -> LISTA_PARA_ENTREGA -> ENTREGADA_Y_FACTURADA.")
    add_diagram(doc, os.path.abspath("docs_images/diagrama_estados_orden.png"), "Figura 8: Diagrama de Estados de la Orden de Trabajo de Taller", Inches(6.3))

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 8: DICCIONARIO DE DATOS
    # ==========================================
    add_heading_1(doc, "8. DICCIONARIO DE DATOS Y MODELO DE BASE DE DATOS")
    add_p(doc, "Estructura formal de las entidades relacionales extraídas de 'prisma/schema.prisma'.")

    tables = [
        {
            "name": "User (Usuarios del Sistema)",
            "cols": [
                ["id", "String (UUID)", "NO", "PK", "Identificador único global del usuario."],
                ["email", "String", "NO", "UNIQUE", "Correo corporativo de acceso al sistema."],
                ["name", "String", "NO", "-", "Nombre completo del colaborador."],
                ["passwordHash", "String", "NO", "-", "Hash seguro de la contraseña (Argon2id)."],
                ["role", "UserRole (Enum)", "NO", "-", "SUPERADMIN, ADMIN, CAJERO, MECANICO, BODEGUERO."],
                ["failedAttempts", "Int", "NO", "-", "Contador de intentos fallidos de login (Default 0)."],
                ["lockedUntil", "DateTime", "SÍ", "-", "Marca de tiempo hasta la cual la cuenta está bloqueada."]
            ]
        },
        {
            "name": "Product (Repuestos e Inventario)",
            "cols": [
                ["id", "String (UUID)", "NO", "PK", "Identificador único del producto."],
                ["sku", "String", "NO", "UNIQUE", "Código interno alfanumérico de inventario."],
                ["barcode", "String", "SÍ", "UNIQUE", "Código de barras único para escáner láser POS."],
                ["name", "String", "NO", "-", "Nombre comercial del repuesto o servicio."],
                ["costPrice", "Int", "NO", "-", "Precio de compra a proveedor (en centavos)."],
                ["salePrice", "Int", "NO", "-", "Precio de venta al público en mostrador."],
                ["taxRate", "Int", "NO", "-", "Porcentaje de IVA aplicable (Default 19%)."],
                ["currentStock", "Int", "NO", "-", "Existencia física actual en bodega."],
                ["minStock", "Int", "NO", "-", "Umbral mínimo para disparar alertas de reabastecimiento."]
            ]
        },
        {
            "name": "WorkOrder (Órdenes de Trabajo de Taller)",
            "cols": [
                ["id", "String (UUID)", "NO", "PK", "Identificador único de la orden."],
                ["consecutive", "Int", "NO", "UNIQUE", "Consecutivo numérico visible (Ej. 1045)."],
                ["customerId", "String", "NO", "FK", "Relación con la tabla Customer."],
                ["motorcycleId", "String", "NO", "FK", "Relación con la tabla Motorcycle (Placa)."],
                ["status", "String", "NO", "-", "RECIBIDA, EN_REPARACION, LISTA, ENTREGADA."],
                ["mileage", "Int", "SÍ", "-", "Kilometraje registrado al momento de ingreso."],
                ["diagnosis", "String", "SÍ", "-", "Falla reportada por el cliente y diagnóstico técnico."],
                ["laborCost", "Int", "NO", "-", "Valor acordado por mano de obra técnica."],
                ["partsCost", "Int", "NO", "-", "Subtotal de repuestos consumidos en la reparación."],
                ["total", "Int", "NO", "-", "Costo total liquidado de la orden de trabajo."]
            ]
        },
        {
            "name": "Invoice (Facturación y Ventas POS)",
            "cols": [
                ["id", "String (UUID)", "NO", "PK", "Identificador único de la factura."],
                ["consecutive", "Int", "NO", "UNIQUE", "Número consecutivo de factura (Ej. 1001)."],
                ["customerId", "String", "SÍ", "FK", "Cliente facturado o Consumidor Final."],
                ["userId", "String", "NO", "FK", "Cajero o usuario emisor de la factura."],
                ["status", "String", "NO", "-", "PAGADA, PENDIENTE, ANULADA."],
                ["subtotal", "Int", "NO", "-", "Valor total antes de descuentos e impuestos."],
                ["discount", "Int", "NO", "-", "Monto total descontado en la venta."],
                ["total", "Int", "NO", "-", "Valor neto cobrado al cliente."],
                ["paymentType", "String", "NO", "-", "EFECTIVO, TRANSFERENCIA, TARJETA, CREDITO."]
            ]
        },
        {
            "name": "Credit (Cuentas por Cobrar)",
            "cols": [
                ["id", "String (UUID)", "NO", "PK", "Identificador del crédito otorgado."],
                ["consecutive", "Int", "NO", "UNIQUE", "Número de crédito para seguimiento."],
                ["customerId", "String", "NO", "FK", "Cliente titular de la deuda."],
                ["totalAmount", "Int", "NO", "-", "Monto original adeudado."],
                ["paidAmount", "Int", "NO", "-", "Monto acumulado de abonos realizados."],
                ["remainingAmount", "Int", "NO", "-", "Saldo pendiente por recaudar."],
                ["status", "String", "NO", "-", "PENDIENTE, PARCIAL, PAGADO."]
            ]
        },
        {
            "name": "CashSession (Arqueo y Sesiones de Caja)",
            "cols": [
                ["id", "String (UUID)", "NO", "PK", "Identificador de la sesión de caja."],
                ["openedAt", "DateTime", "NO", "-", "Fecha y hora de apertura del turno."],
                ["closedAt", "DateTime", "SÍ", "-", "Fecha y hora de cierre y arqueo."],
                ["initialCash", "Int", "NO", "-", "Fondo o base monetaria inicial."],
                ["finalCash", "Int", "SÍ", "-", "Efectivo físico contado por el cajero en el cierre."],
                ["calculatedCash", "Int", "SÍ", "-", "Efectivo teórico calculado por el sistema."],
                ["difference", "Int", "SÍ", "-", "Descuadre monetario (Sobrante o Faltante)."],
                ["status", "String", "NO", "-", "ABIERTA o CERRADA."]
            ]
        }
    ]

    for tbl_info in tables:
        add_heading_2(doc, f"Tabla: {tbl_info['name']}")
        add_table_data(doc, ["Columna", "Tipo de Dato", "Nulo", "Llave", "Descripción Técnica"], tbl_info["cols"], [Inches(1.2), Inches(1.3), Inches(0.6), Inches(0.7), Inches(2.7)])

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 9: CATÁLOGO DE APIS REST
    # ==========================================
    add_heading_1(doc, "9. CATÁLOGO COMPLETO DE APIS Y ENDPOINTS REST")
    api_data = [
        ["POST", "/api/auth/login", "Autenticación de usuario con email y contraseña. Devuelve sesión y cookie HttpOnly.", "200, 401, 403"],
        ["GET", "/api/auth/me", "Obtiene los datos del usuario actualmente autenticado según su token de sesión.", "200, 401"],
        ["POST", "/api/auth/logout", "Invalida el token activo y elimina la cookie de sesión.", "200"],
        ["GET", "/api/products", "Consulta el catálogo de repuestos con filtros de búsqueda, categoría y stock crítico.", "200"],
        ["POST", "/api/products", "Registra un nuevo producto validando unicidad de SKU y código de barras.", "201, 400, 409"],
        ["PUT", "/api/products/[id]", "Actualiza precios, stock, ubicación en bodega o datos técnicos del repuesto.", "200, 404, 409"],
        ["DELETE", "/api/products/[id]", "Elimina un producto del catálogo si no posee dependencias en facturas previas.", "200, 400"],
        ["GET", "/api/sales", "Lista el historial de ventas y facturas emitidas en un rango de fechas con desglose.", "200"],
        ["POST", "/api/sales", "Genera una nueva venta POS, aplica descuentos, actualiza stock y emite ticket.", "201, 400"],
        ["GET", "/api/orders", "Retorna las órdenes de trabajo del taller con filtros por estado, placa y mecánico.", "200"],
        ["POST", "/api/orders", "Apertura una nueva orden de servicio con checklist de moto e inventario inicial.", "201, 400"],
        ["PUT", "/api/orders/[id]", "Actualiza estado de reparación, agrega repuestos consumidos o mano de obra.", "200, 404"],
        ["GET", "/api/credits", "Consulta la cartera de créditos activos con saldos adeudados e historial.", "200"],
        ["POST", "/api/credits/[id]/pay", "Registra un abono parcial o liquidación total a un crédito vigente.", "200, 400"],
        ["GET", "/api/cash/session", "Consulta el estado de la sesión de caja actual y los totales acumulados del turno.", "200"],
        ["POST", "/api/cash/session", "Ejecuta la apertura o el arqueo y cierre ciego de caja registrando el descuadre.", "200, 400"]
    ]
    add_table_data(doc, ["Método", "Endpoint", "Descripción de la Operación", "Respuestas HTTP"], api_data, [Inches(0.9), Inches(1.8), Inches(2.7), Inches(1.1)])

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 10: PLAN Y MATRIZ DE PRUEBAS
    # ==========================================
    add_heading_1(doc, "10. PLAN DE PRUEBAS DE SOFTWARE Y MATRIZ DE RESULTADOS")
    test_data = [
        ["CP-01", "Autenticación válida", "Ingresar email y contraseña correctos de un Administrador.", "Acceso concedido al Dashboard y cookie de sesión generada.", "Aprobado"],
        ["CP-02", "Protección de Fuerza Bruta", "Ingresar 5 veces consecutivas contraseñas erróneas.", "Cuenta bloqueada temporalmente por 15 min; alerta visual emitida.", "Aprobado"],
        ["CP-03", "Venta POS con Descuento", "Escanear repuesto de $50.000, aplicar descuento del 10% y pagar en efectivo.", "Total liquidado en $45.000; ticket impreso con 'USTED AHORRÓ: $5.000'.", "Aprobado"],
        ["CP-04", "Código de Barras Duplicado", "Intentar registrar un nuevo repuesto con un código de barras ya existente.", "El sistema rechaza la inserción mostrando alerta de código existente.", "Aprobado"],
        ["CP-05", "Deducción de Inventario", "Vender 2 unidades de 'Aceite Motul 4T' con stock en 10 unidades.", "Stock físico actualizado inmediatamente a 8 unidades en la base de datos.", "Aprobado"],
        ["CP-06", "Checklist de Taller", "Aperturar orden de servicio para moto con placa 'ABC-12E' marcando espejos y rayones.", "Orden creada con checklist íntegro y asignación de consecutivo.", "Aprobado"],
        ["CP-07", "Abono a Crédito", "Registrar abono de $30.000 a crédito pendiente de $100.000.", "Saldo adeudado recalculado exactamente en $70.000; recibo emitido.", "Aprobado"],
        ["CP-08", "Arqueo Ciego de Caja", "Cerrar sesión de caja ingresando conteo de $145.000 habiendo vendido $150.000.", "Diferencia de -$5.000 registrada; solicitud de justificación obligatoria.", "Aprobado"],
        ["CP-09", "Instalación PWA en Celular", "Abrir URL de túnel ngrok en navegador Chrome móvil en Android.", "Notificación de instalación disponible en login; icono instalado en inicio.", "Aprobado"],
        ["CP-10", "Corte Eléctrico y WAL", "Simular desconexión abrupta del servidor durante lectura de base de datos.", "Recuperación automática sin corrupción de datos gracias a SQLite WAL.", "Aprobado"]
    ]
    add_table_data(doc, ["ID", "Caso de Prueba", "Procedimiento / Entrada", "Resultado Esperado y Verificado", "Estado"], test_data, [Inches(0.7), Inches(1.5), Inches(1.8), Inches(1.9), Inches(0.6)])

    # ==========================================
    # SECCIÓN 11: SEGURIDAD Y POLÍTICAS
    # ==========================================
    add_heading_1(doc, "11. SEGURIDAD DE LA INFORMACIÓN, HASHING Y PROTECCIÓN OWASP")
    add_bullet(doc, "Algoritmo Argon2id para almacenamiento de contraseñas con coste de memoria resistente a GPUs.", "Criptografía: ")
    add_bullet(doc, "Cookies HttpOnly con SameSite=Lax para prevenir robo de sesión por ataques XSS.", "Cookies Seguras: ")
    add_bullet(doc, "Consultas 100% parametrizadas a través de Prisma ORM para neutralizar inyecciones SQL.", "Anti-SQL Injection: ")
    add_bullet(doc, "Apego a la Ley 1581 de 2012 de Colombia sobre protección de datos personales y Habeas Data.", "Habeas Data: ")

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 12: MANUAL DE USUARIO COMPLETO
    # ==========================================
    add_heading_1(doc, "12. MANUAL DE USUARIO Y OPERACIÓN COMPLETO")
    add_p(doc, "Este manual proporciona las directrices paso a paso para el uso operativo de todas las funcionalidades de MotoTaller, estructurado conforme al estándar de 17 puntos de la guía maestra de entregables.")

    add_heading_2(doc, "12.1 Requisitos Mínimos para Utilizar el Sistema")
    add_bullet(doc, "Dispositivo Mostrador: Computador con Windows 10/11, procesador Core i3 o superior, 4 GB de RAM y puerto USB para periféricos.")
    add_bullet(doc, "Dispositivos Móviles (Patio): Smartphone o tablet con Android 9+ o iOS 13+ con navegador Google Chrome o Safari.")
    add_bullet(doc, "Periféricos Opcionales: Pistola lectora de código de barras USB y Mini impresora térmica de tickets de 58mm u 80mm.")

    add_heading_2(doc, "12.2 Cómo Acceder al Software")
    add_bullet(doc, "http://localhost:3000 (desde el computador de mostrador donde corre el sistema).", "Acceso Local: ")
    add_bullet(doc, "https://finished-lucia-transpersonally.ngrok-free.dev (enlace fijo HTTPS para celulares de mecánicos y administradores).", "Acceso Remoto / Móvil: ")

    add_heading_2(doc, "12.3 Inicio de Sesión y Acceso Seguro")
    add_p(doc, "1. Ingrese a la dirección web de MotoTaller.\n2. En la pantalla de Login, escriba su correo electrónico corporativo y contraseña.\n3. Si accede desde un celular, podrá hacer clic en 'Instalar Aplicación' para añadir el acceso directo con icono en su pantalla de inicio.\n4. Presione 'Iniciar Sesión'. Al autenticarse, el sistema lo dirigirá al Dashboard o al módulo correspondiente a su rol.")

    add_heading_2(doc, "12.4 Descripción de la Interfaz y Menú Principal")
    add_bullet(doc, "Muestra resumen de ventas del día, ingresos, órdenes de taller activas, repuestos en stock crítico y accesos rápidos.", "1. Panel / Dashboard: ")
    add_bullet(doc, "Terminal de facturación rápida con pistola de código de barras, buscador de repuestos, descuentos y cobro.", "2. Ventas / POS: ")
    add_bullet(doc, "Tablero de recepción de motos, inspección con checklist físico, diagnóstico, mecánicos asignados y liquidación.", "3. Taller / Órdenes: ")
    add_bullet(doc, "Catálogo completo de partes con código de barras único, SKU, precios de compra/venta, márgenes y ubicación en estante.", "4. Inventario / Repuestos: ")
    add_bullet(doc, "Directorio con cédula, nombres, teléfono y hoja de vida de motocicletas vinculadas por placa.", "5. Clientes y Motos: ")
    add_bullet(doc, "Gestión de ventas a crédito otorgadas, historial de pagos recibidos, saldo adeudado y recibo de abono.", "6. Créditos / Cartera: ")
    add_bullet(doc, "Apertura de turno, registro de entradas/salidas de efectivo, arqueo ciego final y reporte de descuadre.", "7. Caja / Contabilidad: ")
    add_bullet(doc, "Configuración de datos del negocio (NIT, RUT, resolución), logo, tickets térmicos y administración de usuarios.", "8. Ajustes / Configuración: ")

    add_heading_2(doc, "12.5 Operación del Punto de Venta (POS) y Descuentos")
    add_p(doc, "Pasos para facturar una venta:")
    add_bullet(doc, "Tome la pistola lectora láser y apunte al código de barras del empaque del repuesto. El producto se agregará de inmediato al carrito. También puede escribir el nombre en la barra de búsqueda rápida (Atajo F4).", "Paso 1 (Agregar Ítems): ")
    add_bullet(doc, "Haga clic en el botón '%' del producto o en el campo de 'Descuento Global'. Puede digitar un porcentaje (ej. 10%) o una cifra fija en pesos colombianos. El sistema recalcula el total y muestra en color amarillo el valor exacto de ahorro.", "Paso 2 (Aplicar Descuento): ")
    add_bullet(doc, "Presione la tecla F2 o haga clic en el botón 'Cobrar'. Seleccione si el cliente paga en Efectivo, Nequi, Daviplata, Tarjeta Débito/Crédito o Crédito. Digite el valor recibido para que el sistema calcule el cambio automáticamente.", "Paso 3 (Seleccionar Método de Pago): ")
    add_bullet(doc, "Presione 'Finalizar Venta'. El sistema guardará la factura, restará las unidades del inventario, registrará el ingreso en caja y desplegará el modal de impresión del ticket térmico con la leyenda 'USTED AHORRÓ'.", "Paso 4 (Impresión): ")

    add_heading_2(doc, "12.6 Operación del Taller de Motocicletas")
    add_p(doc, "Pasos para atender una motocicleta:")
    add_bullet(doc, "Vaya a 'Taller' y presione 'Nueva Orden'. Escriba la placa de la moto. Si ya existe en la base de datos, sus datos y los del dueño se cargarán automáticamente.", "Paso 1 (Recepción): ")
    add_bullet(doc, "Digite el kilometraje actual y marque en el checklist de inspección los componentes recibidos: casco, espejos retrovisores, estado de llantas, rayones visibles y nivel de combustible.", "Paso 2 (Checklist de Seguridad): ")
    add_bullet(doc, "Describa la falla manifestada por el cliente y seleccione el técnico mecánico responsable. Guarde la orden (quedará en estado 'RECIBIDA').", "Paso 3 (Diagnóstico): ")
    add_bullet(doc, "Durante la reparación, el mecánico abre la orden desde su celular y agrega los repuestos que retira de bodega. El stock de bodega se descuenta en tiempo real.", "Paso 4 (Consumo de Repuestos): ")
    add_bullet(doc, "Al terminar la reparación, se digita el costo de la Mano de Obra. El sistema consolida (Repuestos + Mano de Obra) y permite liquidar la orden para imprimir la factura de taller y entregar la moto al cliente.", "Paso 5 (Liquidación y Entrega): ")

    add_heading_2(doc, "12.7 Gestión de Inventario y Creación de Nuevos Repuestos")
    add_p(doc, "Para registrar un nuevo repuesto:")
    add_bullet(doc, "Haga clic en 'Inventario' -> 'Nuevo Producto'.")
    add_bullet(doc, "Escanee con la pistola el código de barras del producto o escriba un código único. Recuerde que dos productos NO pueden tener el mismo código de barras.")
    add_bullet(doc, "Digite el nombre del repuesto, precio de compra a proveedor, precio de venta al público y stock actual.")
    add_bullet(doc, "Asigne la ubicación física en bodega (ejemplo: Bodega Principal, Estante E-02, Nivel 3) para facilitar su localización rápida.")
    add_bullet(doc, "Presione 'Guardar' una sola vez.")

    add_heading_2(doc, "12.8 Gestión de Cuentas por Cobrar (Créditos) y Abonos")
    add_p(doc, "1. En el módulo 'Créditos', visualice los clientes con saldo pendiente y días de crédito.\n2. Para registrar un pago, haga clic sobre el crédito del cliente y seleccione 'Registrar Abono'.\n3. Digite el valor abonado y el método de pago (Efectivo o Transferencia).\n4. El sistema recalcula el saldo restante, genera el comprobante de abono y, si el saldo llega a $0, cambia automáticamente el estado del crédito a 'PAGADO'.")

    add_heading_2(doc, "12.9 Arqueo y Cierre Ciego de Caja")
    add_p(doc, "Al finalizar la jornada laboral:\n1. Ingrese a 'Caja / Contabilidad' y presione 'Cierre de Caja'.\n2. Cuente físicamente los billetes y monedas que tiene en la gaveta y digite el valor exacto en el campo 'Efectivo Físico'.\n3. Por seguridad, el sistema no le revela el total teórico antes del conteo (Arqueo Ciego).\n4. Al confirmar, el sistema contrasta el conteo físico contra las ventas netas y le mostrará si la caja está CUADRADA o si existe un SOBRANTE o FALTANTE.\n5. Si existe diferencia, digite la justificación y presione 'Confirmar Cierre Definitivo'.")

    add_heading_2(doc, "12.10 Preguntas Frecuentes (FAQ)")
    add_bullet(doc, "Causa: El código ya pertenece a otro producto en catálogo, o se hizo doble clic en guardar. Solución: Verifique en el buscador si el producto ya está creado o presione guardar una sola vez.", "¿Por qué sale 'Unique constraint failed on the fields: (barcode)' al crear un producto?: ")
    add_bullet(doc, "Sí. Gracias a la tecnología PWA, el sistema se ejecuta en pantalla completa sin barra de direcciones en celulares Android y iPhone a través del túnel seguro.", "¿Pueden los mecánicos ver las órdenes desde sus celulares?: ")
    add_bullet(doc, "Sí. El sistema calcula en vivo el subtotal normal, resta los descuentos y coloca en el encabezado del total: 'USTED AHORRÓ: $X.XXX'.", "¿El ticket de venta muestra el descuento que se le hizo al cliente?: ")

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 13: MANUAL DE ADMINISTRADOR
    # ==========================================
    add_heading_1(doc, "13. MANUAL DE ADMINISTRADOR DEL SISTEMA")
    add_p(doc, "Dirigido a directores y administradores de punto de venta para la gobernanza del sistema:")
    add_bullet(doc, "Creación de colaboradores, asignación de roles y restablecimiento de contraseñas.", "Gestión de Usuarios: ")
    add_bullet(doc, "Si un usuario ingresa su clave errónea 5 veces consecutivas, su cuenta se bloquea por 15 minutos. El Administrador puede desbloquearla inmediatamente desde el panel.", "Desbloqueo de Cuentas: ")
    add_bullet(doc, "Ingreso de NIT, Razón Social, Dirección, Teléfono, Régimen Tributario, Consecutivo y Prefijo DIAN autorizado.", "Configuración Fiscal: ")
    add_bullet(doc, "Supervisión del historial inmutable de acciones críticas (anulaciones de facturas, eliminaciones de inventario y logins fallidos).", "Auditoría de Eventos (AuditLog): ")

    # ==========================================
    # SECCIÓN 14: MANUAL DE INSTALACIÓN Y DESPLIEGUE
    # ==========================================
    add_heading_1(doc, "14. MANUAL DE INSTALACIÓN, CONFIGURACIÓN Y DESPLIEGUE")
    add_p(doc, "Pasos técnicos para instalar y desplegar MotoTaller:")
    add_bullet(doc, "Instalar Node.js versión 20.x o superior en el equipo de mostrador.", "1. Prerrequisitos: ")
    add_bullet(doc, "Ejecutar 'git clone https://github.com/rosellonbreiner-lab/POS.git' y luego 'npm install'.", "2. Descarga de Dependencias: ")
    add_bullet(doc, "Ejecutar 'npx prisma db push' para inicializar la base de datos relacional 'prisma/dev.db'.", "3. Base de Datos: ")
    add_bullet(doc, "Hacer doble clic en 'start.bat' en la raíz. Este archivo automatizado levanta el servidor local en el puerto 3000 y el túnel seguro ngrok simultáneamente.", "4. Arranque Automatizado: ")
    add_bullet(doc, "Abrir en el celular el enlace https://finished-lucia-transpersonally.ngrok-free.dev y pulsar 'Instalar Aplicación' en la pantalla de bienvenida.", "5. Acceso Móvil PWA: ")

    # ==========================================
    # SECCIÓN 15: MANUAL TÉCNICO Y MANTENIMIENTO
    # ==========================================
    add_heading_1(doc, "15. MANUAL TÉCNICO, DE BASE DE DATOS Y MANTENIMIENTO")
    add_bullet(doc, "El motor SQLite opera con modo WAL (Write-Ahead Logging), permitiendo lecturas concurrentes sin bloquear escrituras.", "Concurrencia WAL: ")
    add_bullet(doc, "Copiar diariamente el archivo binario 'prisma/dev.db' a una memoria USB o servicio en la nube (OneDrive/Google Drive).", "Copia de Seguridad: ")
    add_bullet(doc, "Ejecutar mensualmente 'VACUUM;' en la base de datos para compactar el almacenamiento y optimizar los índices de búsqueda.", "Optimización Periódica: ")

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 16: SOLUCIÓN DE PROBLEMAS
    # ==========================================
    add_heading_1(doc, "16. MANUAL DE SOLUCIÓN DE PROBLEMAS (TROUBLESHOOTING)")
    err_data = [
        ["Error: Unique constraint failed on the fields: (barcode)", 
         "Ocurre al intentar agregar un producto cuyo código de barras ya pertenece a otro repuesto en el catálogo, o por hacer doble clic veloz en 'Guardar'.", 
         "1. Verifique en el buscador de inventario si el repuesto ya fue creado previamente.\n2. Si es un repuesto diferente, asígnele su código de barras auténtico o déjelo en blanco si no tiene código láser.\n3. Presione guardar una sola vez."],
        
        ["Error: React Hydration Mismatch en Celular", 
         "Discrepancia entre el código HTML generado por el servidor y las extensiones o fecha local del navegador móvil.", 
         "Se corrigió en v2.4.0 suprimiendo la hidratación en etiquetas externas y limitando los prompts PWA al componente de Login."],
        
        ["Error 1033 de Cloudflare / ngrok Offline", 
         "El túnel remoto se cerró o se suspendió el computador principal de mostrador.", 
         "1. Asegúrese de que el computador servidor no entre en suspensión ni hibernación.\n2. Cierre y vuelva a ejecutar 'start.bat' para restablecer el enlace con el dominio fijo."],
        
        ["Descuadre en Cierre de Caja", 
         "El efectivo físico en gaveta no coincide con el total teórico reportado por el sistema.", 
         "1. Verifique si se realizaron pagos por transferencia (Nequi/Daviplata) que fueron erróneamente marcados como Efectivo.\n2. Revise si se omitió registrar un gasto menor de caja menor (salida de dinero).\n3. Registre la justificación en el cierre para revisión del Administrador."],
        
        ["Usuario Bloqueado por Intentos Fallidos", 
         "Se ingresó la contraseña errónea 5 veces consecutivas por motivos de seguridad.", 
         "Espere 15 minutos a que expire el bloqueo automático, o solicite al Superadministrador que desbloquee la cuenta desde el panel de Gestión de Usuarios."]
    ]
    add_table_data(doc, ["Mensaje / Incidencia", "Causa Técnica Raíz", "Procedimiento de Solución Inmediata"], err_data, [Inches(2.0), Inches(2.2), Inches(2.3)])

    # ==========================================
    # SECCIÓN 17: GESTIÓN DE VERSIONES Y GIT
    # ==========================================
    add_heading_1(doc, "17. GESTIÓN DE VERSIONES, REPOSITORIO GIT PÚBLICO Y CHANGELOG")
    add_p(doc, "El repositorio oficial del proyecto es de acceso público para toda la comunidad académica y colaboradores:")
    add_bullet(doc, "https://github.com/rosellonbreiner-lab/POS", "URL Oficial: ")
    add_bullet(doc, "git clone https://github.com/rosellonbreiner-lab/POS.git", "Comando de Clonación: ")

    changelog_data = [
        ["v1.0.0", "Octubre 2026", "Lanzamiento de arquitectura base con Next.js 16, Prisma y SQLite. Catálogo inicial de 200 productos."],
        ["v1.5.0", "Octubre 2026", "Implementación del módulo de Órdenes de Trabajo de Taller y gestión de checklist de motocicletas."],
        ["v2.0.0", "Noviembre 2026", "Incorporación de Cuentas por Cobrar (Créditos), Arqueo Ciego de Caja y seguridad Argon2id."],
        ["v2.2.0", "Noviembre 2026", "Soporte de Aplicación Web Progresiva (PWA) e integración con túnel seguro ngrok con dominio fijo."],
        ["v2.4.0", "Noviembre 2026", "Desglose visible de descuentos en pantalla de ventas y ticket térmico ('USTED AHORRÓ'). 8 diagramas visuales y publicación abierta."]
    ]
    add_table_data(doc, ["Versión", "Fecha", "Hitos Técnicos y Funcionalidades Entregadas"], changelog_data, [Inches(1.0), Inches(1.5), Inches(4.0)])

    doc.add_page_break()

    # ==========================================
    # SECCIÓN 18: ACTA DE ENTREGA FORMAL
    # ==========================================
    add_heading_1(doc, "18. ACTA FORMAL DE ENTREGA Y RECEPCIÓN DE SOFTWARE")
    add_p(doc, "En la ciudad correspondiente, se suscribe la presente ACTA DE ENTREGA Y RECEPCIÓN a entera satisfacción del sistema de información denominado MOTOTALLER v2.4.0.")

    acta_info = [
        ["Nombre del Proyecto", "MotoTaller - Sistema de Gestión Comercial, POS y Taller de Motocicletas"],
        ["Versión Entregada", "v2.4.0 (Build de Producción PWA + Túnel ngrok + 8 Diagramas Visuales)"],
        ["Desarrollador / Autor Líder", "Breiner Rosellon"],
        ["Repositorio Git de Entrega", "https://github.com/rosellonbreiner-lab/POS (Público)"],
        ["Destinatarios / Receptores", "Equipo de Evaluación, Docentes y Compañeros de Proyecto"],
        ["Estado Final de la Entrega", "Aprobado a Satisfacción (100% de Pruebas Superadas)"]
    ]
    add_table_data(doc, ["Elemento de Recepción", "Detalle de Verificación"], acta_info, [Inches(2.2), Inches(4.3)])

    add_heading_2(doc, "Checklist de Elementos Entregados")
    add_bullet(doc, "Código fuente íntegro, funcional y documentado alojado en el repositorio público de GitHub.")
    add_bullet(doc, "Catálogo de 8 diagramas visuales en alta resolución (Arquitectura, Casos de Uso, Flujos, DER, Despliegue, Secuencia y Estados).")
    add_bullet(doc, "Manual de Usuario completo estructurado en 17 puntos operativos.")
    add_bullet(doc, "Manual de Administrador para gestión de roles, auditoría y resolución fiscal.")
    add_bullet(doc, "Manual de Instalación con script automatizado 'start.bat' y túnel ngrok de dominio fijo.")
    add_bullet(doc, "Base de datos relacional inicializada con catálogo de repuestos de prueba y roles RBAC.")
    add_bullet(doc, "Documento maestro de entregables en formato editable (.docx) y portable (.pdf).")

    add_p(doc, "\nConstancia de Conformidad y Firmas:", bold=True, space_after=12)

    sig_tbl = doc.add_table(rows=3, cols=2)
    sig_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_tbl.autofit = False

    sig_widths = [Inches(3.2), Inches(3.2)]
    for r in sig_tbl.rows:
        for idx, cell in enumerate(r.cells):
            cell.width = sig_widths[idx]
            set_cell_background(cell, "FFFFFF")

    c00 = sig_tbl.cell(0, 0)
    p00 = c00.paragraphs[0]
    p00.add_run("\n\n_____________________________________\n")
    r_f1 = p00.add_run("ENTREGADO POR (DESARROLLADOR):\n")
    r_f1.font.bold = True
    p00.add_run("Breiner Rosellon\nDesarrollador Líder del Proyecto\nMotoTaller Software Engineering")

    c01 = sig_tbl.cell(0, 1)
    p01 = c01.paragraphs[0]
    p01.add_run("\n\n_____________________________________\n")
    r_f2 = p01.add_run("RECIBIDO POR (CLIENTE / EVALUADOR):\n")
    r_f2.font.bold = True
    p01.add_run("Comité de Evaluación / Compañeros\nRevisión y Aceptación de Software\nFecha: ____ / ____ / 2026")

    output_docx = os.path.abspath("DOCUMENTO_ENTREGABLES_PROYECTO_MOTOTALLER.docx")
    output_pdf = os.path.abspath("DOCUMENTO_ENTREGABLES_PROYECTO_MOTOTALLER.pdf")
    
    doc.save(output_docx)
    print(f"Documento Word actualizado guardado en: {output_docx}")

    print("Iniciando conversión a PDF...")
    try:
        convert(output_docx, output_pdf)
        print(f"Documento PDF actualizado generado en: {output_pdf}")
    except Exception as e:
        print(f"Error durante conversión a PDF: {e}")

if __name__ == "__main__":
    build_mototaller_deliverables_document()
