# generar-iconos.py — los iconos de ARCHIVO y la tarjeta og:image, desde el logo.
#
# POR QUE EXISTE. Hasta el 2026-08-11 la portada declaraba su icono como un
# `data:` URI y https://ledkid.com/favicon.ico daba 404. La pestaña del navegador
# se veía bien, pero Google no lee `data:` URIs: para el icono del resultado de
# búsqueda necesita una URL que pueda RASTREAR. Por eso el resultado salía sin
# logo. Estos archivos son esa URL.
#
# FUENTE ÚNICA: marca/ledkid-icono.png (1056×1056) y marca/ledkid-horizontal.png.
# Nada se dibuja a mano: si cambia la marca, se vuelve a correr esto y salen los
# cinco archivos otra vez iguales entre sí.
#
# ESCRIBE EN DOS SITIOS A PROPÓSITO:
#   · este repo (raíz)  -> para que la landing se pueda desplegar sola
#   · LEDKID-SIMULADOR/frontend/public/ -> que es la raíz REAL de ledkid.com;
#     Vite lo copia a dist/ y el backend sirve cada archivo por su ruta.
#   sincronizar-landing.ps1 NO copia los archivos sueltos de la raíz (solo
#   index.html, app.js, assets/, media/, marca/), y no hace falta que lo haga:
#   en producción esas rutas ya las sirve el simulador.
#
# Uso:  python scripts/generar-iconos.py     (necesita Pillow)

import os
import shutil
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
LAND = os.path.dirname(AQUI)
PUB = os.path.join(os.path.dirname(LAND), "LEDKID-SIMULADOR", "frontend", "public")

src = Image.open(os.path.join(LAND, "marca", "ledkid-icono.png")).convert("RGBA")

# El glifo solo ocupa ~51% del ancho de su lienzo: a 16 px eso deja 8 píxeles
# útiles y en el resultado de Google se ve un borrón. Se recorta a su caja real
# y se reencuadra cuadrado con 8% de margen.
glifo = src.crop(src.getbbox())
lado = int(max(glifo.size) * 1.16)
cuadro = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
cuadro.paste(glifo, ((lado - glifo.size[0]) // 2, (lado - glifo.size[1]) // 2), glifo)


def png(tam, fondo=None):
    im = cuadro.resize((tam, tam), Image.LANCZOS)
    if fondo:
        base = Image.new("RGBA", (tam, tam), fondo)
        base.alpha_composite(im)
        im = base
    return im


png(96).save(os.path.join(PUB, "favicon-96.png"))
# apple-touch-icon con FONDO BLANCO: iOS no respeta la transparencia, la pinta
# de negro y el LED ámbar sobre negro no es la marca.
png(180, (255, 255, 255, 255)).convert("RGB").save(os.path.join(PUB, "apple-touch-icon.png"))
# .ico con los tres tamaños que leen Google y la pestaña.
png(48).save(os.path.join(PUB, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])

# ── LAS DOS TARJETAS og:image ────────────────────────────────────────────────
#
# 🔴 POR QUE SON DOS, Y POR QUE YA NO SON BLANCAS (2026-08-12). La tarjeta era
# 1200×630 con el logotipo pequeño y centrado sobre BLANCO. En un chat se veía
# bien; en Google no. Google recorta la miniatura del resultado a un CUADRADO de
# ~92 px, así que de esa tarjeta ancha sólo sobrevivía un borrón pálido — que es
# literalmente lo que Meme vio buscando "ledkid". El problema no era la calidad
# del PNG: era la FORMA y el contraste.
#
#   · ledkid-og-cuadrado.png (1200×1200) -> la miniatura de Google (JSON-LD image)
#   · ledkid-og.png          (1200×630)  -> WhatsApp / Facebook / LinkedIn
#
# Las dos son ámbar con el LED en blanco, para que un enlace compartido y un
# resultado de búsqueda se vean como la misma empresa.
#
# ⚠️ SE RASTERIZAN CON CHROME, NO CON PILLOW, y es a propósito: los glifos de
# "LedKid" son PATHS de marca (`marca/ledkid-vertical.svg`), no una tipografía.
# Dibujarlos con Pillow obligaría a copiar la marca a mano aquí dentro, que es
# justo la segunda fuente de verdad que este repo evita. Los SVG de al lado son
# la fuente; esto sólo los convierte.
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def rasterizar(svg, destino, ancho, alto):
    """SVG -> PNG con Chrome headless, al tamaño exacto y sin ventana.

    ⚠️ DOS TRAMPAS, LAS DOS PAGADAS EL 2026-08-12 Y LAS DOS MUDAS:

    1. **Chrome se apunta al SVG, no a un HTML que lo incruste.** El primer intento
       escribía un `<img>` en una carpeta temporal; el proceso que se lanza SALE
       ANTES de que el navegador de verdad haya leído nada, así que Python borraba
       la carpeta y Chrome fotografiaba su propia pantalla de *"Your file couldn't
       be accessed"*. El PNG pesaba lo normal y el script no daba error: había que
       ABRIR la imagen para verlo. Los SVG de al lado llevan `width`/`height`
       explícitos justo para poder cargarlos directos.
    2. **Hay que ESPERAR al archivo.** Por lo mismo de arriba, cuando `subprocess`
       vuelve el PNG puede no existir todavía. Comprobarlo en ese instante daba un
       "Chrome no escribió nada" falso sobre un archivo que aparecía un segundo
       después.
    """
    import subprocess
    import tempfile
    import time
    from pathlib import Path

    origen = Path(LAND) / "marca" / svg
    if os.path.exists(destino):
        os.remove(destino)
    with tempfile.TemporaryDirectory() as perfil:
        subprocess.run(
            [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
             "--no-sandbox", f"--user-data-dir={perfil}",
             f"--screenshot={destino}", f"--window-size={ancho},{alto}",
             origen.as_uri()],
            check=True, capture_output=True,
        )
        for _ in range(60):
            if os.path.exists(destino) and os.path.getsize(destino) > 0:
                break
            time.sleep(0.5)
    if not os.path.exists(destino):
        raise SystemExit(f"Chrome no escribio {destino}")
    ancho_real, alto_real = Image.open(destino).size
    if (ancho_real, alto_real) != (ancho, alto):
        raise SystemExit(f"{destino}: salio {ancho_real}x{alto_real}, se pedia {ancho}x{alto}")


rasterizar("ledkid-og-ancha.svg", os.path.join(PUB, "marca", "ledkid-og.png"), 1200, 630)
rasterizar("ledkid-og-cuadrado.svg",
           os.path.join(PUB, "marca", "ledkid-og-cuadrado.png"), 1200, 1200)

# Copias en este repo: favicon.svg no se genera, ya es de marca y se copia igual
# para que las cuatro rutas relativas del <head> resuelvan también aquí.
for n in ("favicon.ico", "favicon-96.png", "apple-touch-icon.png", "favicon.svg"):
    shutil.copyfile(os.path.join(PUB, n), os.path.join(LAND, n))
for n in ("ledkid-og.png", "ledkid-og-cuadrado.png"):
    shutil.copyfile(os.path.join(PUB, "marca", n), os.path.join(LAND, "marca", n))

for p in ("favicon.ico", "favicon-96.png", "apple-touch-icon.png",
          "marca/ledkid-og.png", "marca/ledkid-og-cuadrado.png"):
    ruta = os.path.join(PUB, *p.split("/"))
    print(p, Image.open(ruta).size, os.path.getsize(ruta), "bytes")
