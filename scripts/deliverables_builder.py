import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_element(name):
    return OxmlElement(name)

def set_cell_background(cell, hex_color):
    tcPr = cell._element.get_or_add_tcPr()
    shd_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
    tcPr.append(parse_xml(shd_xml))

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left=None, right=None, left_sz=None):
    tcPr = cell._element.get_or_add_tcPr()
    borders_elm = create_element('w:tcBorders')
    
    for side, color, sz in [('top', top, '4'), ('bottom', bottom, '4'), ('left', left, left_sz or '4'), ('right', right, '4')]:
        if color:
            b_xml = f'<w:{side} {nsdecls("w")} w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            borders_elm.append(parse_xml(b_xml))
        else:
            b_xml = f'<w:{side} {nsdecls("w")} w:val="none"/>'
            borders_elm.append(parse_xml(b_xml))
    tcPr.append(borders_elm)

# Styling Constants
COLOR_PRIMARY_NAVY = RGBColor(15, 44, 89)      # #0F2C59
COLOR_ACCENT_BLUE = RGBColor(2, 132, 199)      # #0284C7
COLOR_DARK_SLATE = RGBColor(30, 41, 59)        # #1E293B
COLOR_MUTED_GRAY = RGBColor(100, 116, 139)     # #64748B
HEX_PRIMARY_NAVY = "0F2C59"
HEX_ACCENT_BLUE = "0284C7"
HEX_LIGHT_BLUE = "F0F9FF"
HEX_ZEBRA = "F8FAFC"
HEX_BORDER = "CBD5E1"
HEX_SUCCESS = "16A34A"
HEX_WARNING = "D97706"

def add_heading_1(doc, text):
    h = doc.add_heading(level=1)
    run = h.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = COLOR_PRIMARY_NAVY
    h.paragraph_format.space_before = Pt(18)
    h.paragraph_format.space_after = Pt(8)
    h.paragraph_format.keep_with_next = True
    return h

def add_heading_2(doc, text):
    h = doc.add_heading(level=2)
    run = h.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = COLOR_ACCENT_BLUE
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    return h

def add_heading_3(doc, text):
    h = doc.add_heading(level=3)
    run = h.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = COLOR_DARK_SLATE
    h.paragraph_format.space_before = Pt(10)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    return h

def add_p(doc, text="", bold=False, italic=False, color=COLOR_DARK_SLATE, space_after=6):
    p = doc.add_paragraph()
    if text:
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(10)
        run.font.bold = bold
        run.font.italic = italic
        run.font.color.rgb = color
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    return p

def add_bullet(doc, text, bold_prefix="", level=0):
    p = doc.add_paragraph(style='List Bullet')
    if bold_prefix:
        r1 = p.add_run(bold_prefix)
        r1.font.name = 'Arial'
        r1.font.size = Pt(10)
        r1.font.bold = True
        r1.font.color.rgb = COLOR_PRIMARY_NAVY
    r2 = p.add_run(text)
    r2.font.name = 'Arial'
    r2.font.size = Pt(10)
    r2.font.color.rgb = COLOR_DARK_SLATE
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    return p

def add_callout(doc, text, title="NOTA IMPORTANTE / REGLA DE NEGOCIO", border_color="0284C7", bg_color="F0F9FF"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=160)
    set_cell_borders(cell, top=None, bottom=None, left=border_color, right=None, left_sz="24")
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    
    r_title = p.add_run(f"📌 {title}\n")
    r_title.font.name = 'Arial'
    r_title.font.size = Pt(10)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY_NAVY
    
    r_body = p.add_run(text)
    r_body.font.name = 'Arial'
    r_body.font.size = Pt(9.5)
    r_body.font.color.rgb = COLOR_DARK_SLATE
    
    sp_p = doc.add_paragraph()
    sp_p.paragraph_format.space_after = Pt(4)

def add_table_data(doc, headers, data, col_widths=None):
    tbl = doc.add_table(rows=len(data) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False

    # Header Row
    hdr_row = tbl.rows[0]
    trPr = hdr_row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

    for idx, header in enumerate(headers):
        cell = hdr_row.cells[idx]
        if col_widths and idx < len(col_widths):
            cell.width = col_widths[idx]
        set_cell_background(cell, HEX_PRIMARY_NAVY)
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        set_cell_borders(cell, top=HEX_PRIMARY_NAVY, bottom=HEX_PRIMARY_NAVY, left=HEX_PRIMARY_NAVY, right=HEX_PRIMARY_NAVY)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(header)
        r.font.name = 'Arial'
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    # Data Rows
    for r_idx, row_values in enumerate(data):
        row = tbl.rows[r_idx + 1]
        bg = HEX_ZEBRA if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_values):
            cell = row.cells[c_idx]
            if col_widths and c_idx < len(col_widths):
                cell.width = col_widths[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=90, bottom=90, left=120, right=120)
            set_cell_borders(cell, top=HEX_BORDER, bottom=HEX_BORDER, left=HEX_BORDER, right=HEX_BORDER)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(str(val))
            r.font.name = 'Arial'
            r.font.size = Pt(9)
            r.font.color.rgb = COLOR_DARK_SLATE

    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(6)
    return tbl

def add_diagram(doc, image_path, caption, width=Inches(6.2)):
    if os.path.exists(image_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(10)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(image_path, width=width)
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(12)
        r_cap = p_cap.add_run(caption)
        r_cap.font.name = 'Arial'
        r_cap.font.size = Pt(9)
        r_cap.font.italic = True
        r_cap.font.color.rgb = COLOR_MUTED_GRAY
    else:
        print(f"Advertencia: no se encontró la imagen en {image_path}")
