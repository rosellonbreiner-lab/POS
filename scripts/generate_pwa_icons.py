#!/usr/bin/env python3
"""
Generador de iconos oficiales para la PWA (Progressive Web App)
Sistema de Gestión Comercial & POS
Colores corporativos: #0D1117, #1F3A5F, #5AA9E6, #EAF4F4, #34D399
"""

import math
from PIL import Image, ImageDraw, ImageFont

def draw_rounded_rect(draw, bbox, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def generate_pos_icon(size=512, is_maskable=False):
    # Crear imagen RGBA de alta resolución
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = size * 0.12 if is_maskable else size * 0.04
    rect_box = [margin, margin, size - margin, size - margin]
    corner_radius = size * (0.28 if not is_maskable else 0.22)

    # 1. Fondo degradado simulado de alta calidad (#0D1117 a #1F3A5F)
    bg_color = (13, 17, 23, 255) # #0D1117
    border_color = (90, 169, 230, 180) # #5AA9E6
    draw_rounded_rect(draw, rect_box, corner_radius, fill=bg_color, outline=border_color, width=max(2, int(size * 0.015)))

    # Resplandor radial interno
    center_x = size / 2
    center_y = size / 2

    # 2. Emblema geométrico central (Caja registradora / Capas tecnológicas / Escudo)
    # Dibujar base estilizada
    scale = (size - 2 * margin) / 400.0

    # Capa inferior (Bandeja / Pedestal)
    tray_w = 220 * scale
    tray_h = 40 * scale
    tray_x = center_x - tray_w / 2
    tray_y = center_y + 60 * scale
    draw.rounded_rectangle(
        [tray_x, tray_y, tray_x + tray_w, tray_y + tray_h],
        radius=int(12 * scale),
        fill=(31, 58, 95, 255), # #1F3A5F
        outline=(90, 169, 230, 240),
        width=max(2, int(3 * scale))
    )

    # Ranura de recibo / luz
    slot_w = 160 * scale
    slot_h = 8 * scale
    draw.rounded_rectangle(
        [center_x - slot_w/2, tray_y + 16 * scale, center_x + slot_w/2, tray_y + 16 * scale + slot_h],
        radius=int(4 * scale),
        fill=(52, 211, 153, 255) # Verde esmeralda #34D399
    )

    # Pantalla principal del POS / Terminal
    screen_w = 240 * scale
    screen_h = 170 * scale
    screen_x = center_x - screen_w / 2
    screen_y = center_y - 120 * scale
    draw.rounded_rectangle(
        [screen_x, screen_y, screen_x + screen_w, screen_y + screen_h],
        radius=int(22 * scale),
        fill=(34, 40, 49, 255), # #222831
        outline=(90, 169, 230, 255), # #5AA9E6
        width=max(2, int(4 * scale))
    )

    # Interior de pantalla
    inner_margin = 14 * scale
    draw.rounded_rectangle(
        [screen_x + inner_margin, screen_y + inner_margin, screen_x + screen_w - inner_margin, screen_y + screen_h - inner_margin],
        radius=int(14 * scale),
        fill=(13, 17, 23, 255) # #0D1117
    )

    # Líneas de código de barras estilizadas en la pantalla
    bars_y = screen_y + 40 * scale
    bars_h = 45 * scale
    bar_positions = [
        (-70, 8, (90, 169, 230)),
        (-55, 4, (234, 244, 244)),
        (-44, 12, (90, 169, 230)),
        (-24, 6, (234, 244, 244)),
        (-12, 10, (52, 211, 153)),
        (4, 5, (234, 244, 244)),
        (16, 14, (90, 169, 230)),
        (38, 7, (234, 244, 244)),
        (52, 10, (52, 211, 153)),
        (68, 6, (90, 169, 230)),
    ]

    for rel_x, width, color in bar_positions:
        bx = center_x + rel_x * scale
        bw = width * scale
        draw.rounded_rectangle(
            [bx, bars_y, bx + bw, bars_y + bars_h],
            radius=int(2 * scale),
            fill=(*color, 255)
        )

    # Línea de escaneo láser Cyan (#22D3EE) cruzando las barras
    laser_y = bars_y + bars_h / 2
    draw.line(
        [(screen_x + inner_margin + 6 * scale, laser_y), (screen_x + screen_w - inner_margin - 6 * scale, laser_y)],
        fill=(34, 211, 238, 255), # Cyan neón
        width=max(2, int(3 * scale))
    )

    # Texto "POS" o puntos de estado en la parte inferior de la pantalla
    dot_y = screen_y + screen_h - 28 * scale
    for i, color in enumerate([(248, 113, 113), (251, 191, 36), (52, 211, 153)]):
        dx = center_x - 30 * scale + i * 30 * scale
        draw.ellipse([dx - 5 * scale, dot_y - 5 * scale, dx + 5 * scale, dot_y + 5 * scale], fill=(*color, 255))

    # Pequeño rayo de energía / Sparkle en esquina superior derecha
    sp_x = screen_x + screen_w - 20 * scale
    sp_y = screen_y - 10 * scale
    r = 16 * scale
    draw.line([(sp_x - r, sp_y), (sp_x + r, sp_y)], fill=(90, 169, 230, 255), width=max(2, int(3 * scale)))
    draw.line([(sp_x, sp_y - r), (sp_x, sp_y + r)], fill=(90, 169, 230, 255), width=max(2, int(3 * scale)))

    return img

if __name__ == "__main__":
    import os

    output_dir = "public"
    os.makedirs(output_dir, exist_ok=True)

    # 1. Icono estándar 512x512
    icon512 = generate_pos_icon(512, is_maskable=False)
    icon512.save(os.path.join(output_dir, "icon-512.png"), "PNG")
    print("[OK] Generado public/icon-512.png")

    # 2. Icono estándar 192x192
    icon192 = generate_pos_icon(192, is_maskable=False)
    icon192.save(os.path.join(output_dir, "icon-192.png"), "PNG")
    print("[OK] Generado public/icon-192.png")

    # 3. Icono maskable (adaptativo de Android) 512x512
    icon_maskable = generate_pos_icon(512, is_maskable=True)
    icon_maskable.save(os.path.join(output_dir, "icon-maskable.png"), "PNG")
    print("[OK] Generado public/icon-maskable.png")

    # 4. Apple Touch Icon (180x180 para iOS)
    icon_apple = generate_pos_icon(180, is_maskable=False)
    icon_apple.save(os.path.join(output_dir, "apple-touch-icon.png"), "PNG")
    print("[OK] Generado public/apple-touch-icon.png")
