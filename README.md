# LEDKID-LANDING

**La página pública de LEDKID: la home de `https://ledkid.com/`.**

Este repo es la **FUENTE DE VERDAD** de esa página. Se edita aquí y sólo aquí.

Un solo `index.html` sin build, sin dependencias y sin red: los estilos van en
línea y la tipografía es la del sistema, así que el archivo se abre igual desde
disco que servido.

## Ver

Doble clic a `index.html`, o cualquier servidor estático:

```powershell
python -m http.server 8090
```

## Publicar en ledkid.com  ⚠️ EL PASO QUE SE OLVIDA

Commitear aquí **no publica nada**. `ledkid.com` lo sirve el gateway del
simulador (el backend Go en el puerto 8081), que lee una copia:

```
LEDKID-LANDING/                              ← ✅ esto es lo que se edita
      │   powershell scripts\sincronizar-landing.ps1
      ▼
LEDKID-SIMULADOR/frontend/public/landing/   ← artefacto, en .gitignore
      ▼
LEDKID-SIMULADOR/frontend/dist/landing/     ← artefacto, en .gitignore
                                               ESTO es lo que sirve ledkid.com
```

Así que publicar es:

```powershell
# 1. editar y commitear AQUI
# 2. desde la raiz de ROBOKIT-SIMULADOR (clonado al lado de este repo):
powershell scripts\sincronizar-landing.ps1
```

No hace falta build ni reiniciar el backend: la landing es HTML plano y los
estáticos se leen del disco en cada petición.

⚠️ **Nunca edites `frontend/public/landing/` ni `frontend/dist/landing/`.** Son
artefactos: el siguiente sincronizado los borra y los reescribe, y el cambio se
pierde **sin dar ningún error**. Eso pasó el 2026-08-09 y costó una tarde.

### Rutas: aquí relativas, allá absolutas

Aquí el HTML usa rutas **relativas** (`assets/x.svg`, `media/x.mp4`, `app.js`)
para poder desplegarse solo en la raíz (GitHub Pages, Cloudflare Pages) sin
arrastrar el simulador. El script de sincronizado las convierte a **absolutas**
(`/landing/assets/…`) porque en el gateway los archivos viven bajo `/landing/`:
`/assets/` ya es del bundle de la SPA y no se pueden mezclar.

**Si añades un asset, referéncialo en relativo.** El script sólo reescribe
`="assets/`, `="media/` y `src="app.js"`; una ruta que no encaje en esos patrones
llegará a producción tal cual y dará 404.

## `app.js` va aparte, no en línea

La CSP del gateway es `script-src 'self'` sin `'unsafe-inline'`: un `<script>`
con código dentro del HTML lo bloquea el navegador y la página se queda sin
desplegables, sin menú de móvil y sin carrusel.

Por lo mismo **no se usa Google Fonts**: `font-src 'self' data:` bloquea la hoja
de `fonts.googleapis.com`, así que la tipografía es la pila del sistema — que
además es la de los ocho videos de `LEDKID-MARKETING` (`Segoe UI`, weight 800).

## BOTITO no se edita a mano

`assets/robo.svg` lo **genera** un script del otro repo leyendo el componente
real del simulador (`frontend/src/components/RoboMascot.vue`), que es el BOTITO que
el niño ve todos los días:

```bash
# desde ROBOKIT-SIMULADOR
node frontend/scripts/exportar-robo-landing.mjs
```

Escribe aquí, en `assets/robo.svg`. Si cambia el componente, se vuelve a correr
y luego se sincroniza. Editarlo a mano se pierde en la siguiente exportación.

## BOTITO, su familia y los dibujos (`scripts/generar-botitos.mjs`)

Un solo generador escribe todo lo que lleva a BOTITO fuera de `robo.svg` (escribe
relativo al script, no al cwd):

```bash
node scripts/generar-botitos.mjs
```

- `assets/botito-*.svg`: 14 variantes con el cuerpo de BOTITO. La familia (rosa,
  audífonos, obra, científico, músico, explorador) y las de la ronda 3, cada una con
  color y accesorio propios: `kit` (menta con la caja del kit), `gorra` (celeste),
  `profe` (morado con birrete y puntero), `foco` (ámbar con un LED), `mono` (fresa con
  moño), `capa` (coral con capa), `piloto` (lima con casco y bandera) y `libro` (cian).
- `assets/escena-hero.svg`: la portada (tres BOTITOS alrededor de un LED).
- `assets/escena-material.svg`, `escena-plataforma.svg`, `escena-docentes.svg`: las
  tarjetas de "Todo llega armado al salón".
- `assets/nivel-chispa.svg`, `nivel-circuito.svg`, `nivel-robot.svg`,
  `nivel-ingenieria.svg`: las cuatro baldosas de niveles.

Todo se anima solo dentro del `<img>` con CSS propio que solo mueve `transform` y
`opacity`, y queda quieto con reducir movimiento. `app.js` mete la familia en línea
para que salude al pasar el ratón.

**Claro y oscuro.** Cada color del dibujo es una variable CSS con su valor claro y su
valor oscuro (`prefers-color-scheme`), y un SVG dentro de un `<img>` sigue el tema de
la página. Los colores de BOTITO viven en UN solo lugar, `PALETAS` del generador, y
son los de la app (`VARIANTES` y `VARIANTES_CLARO` de
`frontend/src/components/botitoAnimado.js`). Si la app los cambia, se copian ahí y se
regenera.

El `viewBox` de las variantes (`-32 -32 144 156`) es más ancho que el de `robo.svg` a
propósito: dentro de un `<img>` el brazo que saluda se cortaría. En las escenas cada
BOTITO va en un `<svg>` anidado con ese mismo `viewBox`.

Ya no se usan (siguen en disco): `media/hero-loop.mp4`, `media/hero-poster.png`,
`assets/producto-*.svg`, `assets/nivel-1..3.svg`, `assets/hero-aula.svg` y
`assets/incluye-*.svg`, que eran los robots de palitos.

## Portada y paneles

La portada es corta: presentación, "Todo el programa, por partes", BOTITO con su
familia y "Pruébelo hoy". El resto vive en paneles (`.panel[data-panel]` en
`index.html`) que se abren desde el menú: Programa, Material, Plataforma, Todo LedKid,
Para directores y Contacto.

Todo va por el ancla de la URL (`#programa`, `#kit`, `#plataforma`, `#ecosistema`,
`#directores`, `#contacto` y cualquier id de dentro, como `#preguntas` o `#video`).
Se puede enlazar un panel y el botón de atrás funciona. Sin JavaScript no se oculta
nada y la página se ve entera, como antes. Al abrir un panel, el foco va a su título.

## La paleta

Clara y suave, la del modo claro de la app (`main.css`, `html.light-mode`), con el
verde `#00a882` de acento. El ámbar `#FFA000` se queda en el logo y el foquito, y los
botones usan `#FFC24D` con tinta casi negra. Con `prefers-color-scheme: dark` la página
pasa al azul noche con verde de la app. Los tokens están en `:root` al principio del
`<style>`, con su bloque oscuro debajo. Todo el texto pasa de 4,5 a 1 en los dos temas.

## Los otros generadores

`scripts/` tiene los generadores de las ilustraciones y los videos
(`generar-ilustraciones.mjs`, `generar-hero-loop.mjs`, `generar-video.mjs`). No se
copian al simulador: sólo se publican sus salidas (`assets/`, `media/`, `marca/`).

## La marca

- `LED` en ámbar `#FFAD00`, `KID` en el color del texto. El corte de dos tonos es
  el mismo que usan el logotipo, los videos y la tarjeta final de cada uno.
- El foquito es la misma geometría que el `favicon.svg` de las tres apps.

Si cambias la marca aquí, cámbiala también en `LEDKID-SIMULADOR/frontend/public/`
(logo y favicon) y en los guiones de `LEDKID-MARKETING`.

---

## 🔴 AVISO ABIERTO (2026-08-26): el texto del video no coincide con el archivo

La sección `#video` ya anuncia **"Dos minutos y medio"** y **"Ver el programa ·
2:30"**, pero el `media/ledkid-ventas.mp4` que hay aquí es todavía el corte de
**2:11**. El video nuevo quedó a medio renderizar.

Se cierra copiando el mp4 y el póster nuevos desde
`LEDKID-MARKETING/video-ventas-colegios/` y corriendo, **desde el simulador**,
`scripts\sincronizar-landing.ps1`. El detalle está en el `TRASPASO.md` de esa
carpeta.

## Las ilustraciones ya no son personas: son robots

Los muñecos planos se cambiaron por **robots de la familia BOTITO** (Meme:
*"esos personas de fondo se ven demasiado IA"*). El cambio está en el GENERADOR,
no en los SVG: `scripts/generar-ilustraciones.mjs`, función `figura()` (antes
`nino()`). Conserva el canon de proporciones, así que mesas, pupitres y suelos
siguen cuadrando.

⚠️ Al regenerar, dos trampas:

1. Los dos generadores escriben en `landing/assets` y `landing/media`
   **relativos al cwd**, de cuando la landing era una subcarpeta. Corriéndolos
   desde el repo crean una carpeta `landing/` intrusa: hay que copiar a
   `assets/` y `media/` y borrarla.
2. Necesitan `RESVG_PATH`, y la ruta que traen escrita no existe en esta
   máquina. Usar la del simulador:
   `LEDKID-SIMULADOR/frontend/node_modules/@resvg/resvg-js/index.js`.

Desde la ronda 3 esas ilustraciones ya no están en la página: el héroe es
`assets/escena-hero.svg` y las tarjetas y las baldosas salen de
`scripts/generar-botitos.mjs` (ver arriba).

## Todo LedKid y las mini demos

Dos secciones nuevas después de la familia de BOTITO, escritas a mano en
`index.html` (no hay generador):

- `#ecosistema`: seis tarjetas, una por pieza de LedKid (Simulador y Academia,
  Exámenes, Impresión 3D, idiomas, planificaciones y presentaciones, notas). Cada
  una lleva su icono SVG en línea con su propio gesto y un primo de BOTITO
  (`assets/botito-*.svg`). La forma copia la tarjeta de la app, con borde de 2 px,
  canto abajo y fondo tintado, sin franja de color a la izquierda.
- `#pruebalo`: tres escenas en SVG y CSS. Una pregunta de lección que se contesta
  de verdad, el ratón y el queso (el primer juego de la Academia, en bucle) y una
  nota que sube de 71 a 84 al entrar en pantalla.

`app.js` pausa las animaciones de las dos secciones cuando no están en pantalla,
maneja la pregunta y hace subir la nota. Sin script todo se ve igual, con la nota
ya en su valor final. Con reducir movimiento todo queda quieto en su estado final.

Solo se enlaza lo que abre sin sesión (`/academia`). Exámenes, notas e Impresión 3D
piden cuenta, así que aquí solo se cuentan.
