// generar-botitos.mjs -- la familia de BOTITO para la landing.
//
//   node scripts/generar-botitos.mjs
//
// Escribe assets/botito-<variante>.svg (seis archivos). NO se editan a mano: se
// cambia este script y se vuelve a correr. Escribe relativo a ESTE archivo, no al
// cwd, asi que da igual desde donde se lance (la trampa de los otros generadores).
//
// El cuerpo es el de BOTITO tal cual (RoboMascot.vue del simulador y el teaser de
// LEDKID-MARKETING): mismas piezas, medidas y pivotes. Cada variante cambia SOLO el
// color o pone UN accesorio encima; nada de proporciones nuevas.
//
// ⚠️ EL viewBox ES MAS ANCHO QUE EL DE robo.svg A PROPOSITO. Estos SVG van en un
// <img>, y ahi `overflow: visible` no existe: lo que sale del lienzo se corta. El
// brazo que saluda llega a x = -29 y los sombreros y las notas suben hasta y = -30.
// El robot sigue centrado en x = 40. Si se cambia el viewBox, el tamaño de la
// tarjeta en index.html (.botito-card) se revisa a la vez.
//
// Las animaciones van DENTRO del SVG (en un <img> no llega el CSS de la pagina) y
// solo mueven transform y opacity. app.js, si corre, mete el SVG en linea para que
// al pasar el raton o al entrar en pantalla BOTITO salude (clase .saluda). Las
// clases llevan el prefijo bv- porque, metidas en linea, sus reglas son globales.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const VIEWBOX = '-32 -32 144 156'

const CLASICO = {
  cabeza: '#2a3148', cabezaBorde: '#4a5578', cuerpo: '#252b3d', cuerpoBorde: '#3a4260',
  pierna: '#1e2333', pie: '#2e3650', ojo: '#00d4aa', luz: '#00ffc8',
}
const ROSA = {
  cabeza: '#8e3a6c', cabezaBorde: '#c2679c', cuerpo: '#7a3160', cuerpoBorde: '#a9568a',
  pierna: '#5e2449', pie: '#9a4679', ojo: '#ff8fd0', luz: '#ffc2e6',
}

// ── Accesorios. Cada uno dice en que hueco del dibujo va. ──
const NOTAS = (x, y) => `
  <g class="bv-notas">
    <path class="bv-nota bv-nota1" d="M${x} ${y} v-9 l6 -2 v9" fill="none" stroke="#FFA000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="bv-nota bv-nota1" cx="${x - 1.6}" cy="${y}" r="2.2" fill="#FFA000"/>
    <circle class="bv-nota bv-nota1" cx="${x + 4.4}" cy="${y - 2}" r="2.2" fill="#FFA000"/>
    <path class="bv-nota bv-nota2" d="M${x + 12} ${y - 10} v-8" fill="none" stroke="#00b894" stroke-width="1.6" stroke-linecap="round"/>
    <path class="bv-nota bv-nota2" d="M${x + 12} ${y - 18} q4 1 4 5" fill="none" stroke="#00b894" stroke-width="1.6" stroke-linecap="round"/>
    <circle class="bv-nota bv-nota2" cx="${x + 10.4}" cy="${y - 10}" r="2.2" fill="#00b894"/>
  </g>`

const ACCESORIOS = {
  audifonos: {
    // diadema y dos copas en ambar de marca; la cabeza lleva el ritmo
    cabeza: `
      <path d="M12 22 C12 -6 68 -6 68 22" fill="none" stroke="#1b2136" stroke-width="5" stroke-linecap="round"/>
      <path d="M12 22 C12 -6 68 -6 68 22" fill="none" stroke="#FFA000" stroke-width="3" stroke-linecap="round"/>
      <rect x="7" y="14" width="11" height="19" rx="5" fill="#FFA000" stroke="#c77800" stroke-width="1.2"/>
      <rect x="62" y="14" width="11" height="19" rx="5" fill="#FFA000" stroke="#c77800" stroke-width="1.2"/>
      <rect x="9.5" y="18" width="3" height="11" rx="1.5" fill="#ffd27a"/>`,
    encima: NOTAS(80, 6),
    css: `
.bv-audifonos .bv-cabeza { animation: bv-ritmo .9s ease-in-out infinite; }
@keyframes bv-ritmo { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }`,
  },
  obra: {
    // casco de obra: la antena asoma por arriba
    cabeza: `
      <path d="M14 12 C14 -8 66 -8 66 12 Z" fill="#FFC21A" stroke="#d99a00" stroke-width="1.4"/>
      <rect x="36.5" y="-3" width="7" height="15" rx="3.5" fill="#ffd95c"/>
      <path d="M22 4 C26 -1 32 -3 36 -3" fill="none" stroke="#fff3c4" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
      <rect x="7" y="10" width="66" height="5.5" rx="2.75" fill="#FFB000" stroke="#d99a00" stroke-width="1.2"/>`,
    brazoR: `
      <g class="bv-llave">
        <rect x="68" y="76" width="4" height="18" rx="2" fill="#aab4c8" transform="rotate(-30 70 86)"/>
        <circle cx="75" cy="78" r="4.2" fill="none" stroke="#aab4c8" stroke-width="3" transform="rotate(-30 70 86)"/>
      </g>`,
    css: `
.bv-obra .bv-brazo-r { animation: bv-martillo 1.4s ease-in-out infinite; }
@keyframes bv-martillo { 0%, 60%, 100% { transform: rotate(0); } 70% { transform: rotate(-22deg); } 80% { transform: rotate(-4deg); } 88% { transform: rotate(-18deg); } }`,
  },
  cientifico: {
    // lentes redondos sobre las pantallas de los ojos, y un matraz en la mano
    cabeza: `
      <circle cx="29.5" cy="22.5" r="9.5" fill="#ffffff" fill-opacity=".08" stroke="#e8eef8" stroke-width="1.8"/>
      <circle cx="50.5" cy="22.5" r="9.5" fill="#ffffff" fill-opacity=".08" stroke="#e8eef8" stroke-width="1.8"/>
      <path d="M39 21.5 Q40 19.5 41 21.5" fill="none" stroke="#e8eef8" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M20 21 L15.5 18.5 M60 21 L64.5 18.5" stroke="#e8eef8" stroke-width="1.8" stroke-linecap="round"/>`,
    brazoR: `
      <g class="bv-matraz">
        <rect x="67" y="76" width="7" height="7" rx="1.5" fill="#e8eef8" fill-opacity=".5" stroke="#e8eef8" stroke-width="1.2"/>
        <path d="M66.5 83 L61 96 Q60 99.5 64 99.5 L77 99.5 Q81 99.5 80 96 L74.5 83 Z" fill="#e8eef8" fill-opacity=".25" stroke="#e8eef8" stroke-width="1.2"/>
        <path d="M63.4 92 L77.6 92 L79.6 96.4 Q80.4 99 77 99 L64 99 Q60.6 99 61.4 96.4 Z" fill="#2FE3A0"/>
        <circle class="bv-burbuja bv-burbuja1" cx="69" cy="80" r="1.6" fill="#2FE3A0"/>
        <circle class="bv-burbuja bv-burbuja2" cx="72" cy="80" r="1.2" fill="#2FE3A0"/>
      </g>`,
    css: `
.bv-burbuja { transform-box: fill-box; transform-origin: 50% 50%; animation: bv-burbuja 2.2s ease-out infinite; opacity: 0; }
.bv-burbuja2 { animation-delay: 1.1s; }
@keyframes bv-burbuja { 0% { opacity: 0; transform: translateY(0) scale(.6); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateY(-14px) scale(1.2); } }`,
  },
  musico: {
    // guitarra cruzada delante del pecho; el brazo derecho rasguea
    cuerpo: `
      <g transform="translate(5 2) rotate(-38 40 74)">
        <rect x="37.8" y="30" width="4.4" height="36" rx="1.6" fill="#7a4a22"/>
        <rect x="36" y="25" width="8" height="8" rx="2.2" fill="#5a3416"/>
        <path d="M38 38 h4 M38 44 h4 M38 50 h4" stroke="#e8c79a" stroke-width=".8"/>
        <ellipse cx="40" cy="70" rx="10.5" ry="9" fill="#FF8A3D" stroke="#c95a17" stroke-width="1.2"/>
        <ellipse cx="40" cy="84" rx="14" ry="12" fill="#FF8A3D" stroke="#c95a17" stroke-width="1.2"/>
        <ellipse cx="40" cy="77" rx="9.5" ry="7" fill="#FF8A3D"/>
        <circle cx="40" cy="78" r="4" fill="#3b1d0a"/>
        <rect x="34" y="89" width="12" height="2.6" rx="1.3" fill="#5a3416"/>
      </g>`,
    encima: NOTAS(78, 8),
    css: `
.bv-musico .bv-brazo-r { animation: bv-rasgueo .5s ease-in-out infinite; }
@keyframes bv-rasgueo { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(14deg); } }`,
  },
  explorador: {
    // sombrero de ala ancha y panoleta roja con la punta al viento
    cabeza: `
      <ellipse cx="40" cy="6" rx="32" ry="5" fill="#C8A26A" stroke="#9c7a45" stroke-width="1.2"/>
      <path d="M20 6 C21 -10 59 -10 60 6 Z" fill="#D8B47A" stroke="#9c7a45" stroke-width="1.2"/>
      <rect x="21" y="0.5" width="38" height="4" rx="1" fill="#7a5a2e"/>`,
    cuerpo: `
      <path d="M19 45 Q40 53 61 45 L61 49.5 Q40 57.5 19 49.5 Z" fill="#E4473B"/>
      <g class="bv-punta"><path d="M55 49 L65 61 L57 59 Z" fill="#c9362b"/></g>
      <circle cx="56" cy="49" r="2.6" fill="#c9362b"/>`,
    css: `
.bv-punta { transform-box: view-box; transform-origin: 56px 49px; animation: bv-viento 1.1s ease-in-out infinite; }
@keyframes bv-viento { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-14deg); } }`,
  },
}

const VARIANTES = [
  { id: 'rosa', nombre: 'BOTITO en rosa', c: ROSA, retraso: -1.2 },
  { id: 'audifonos', nombre: 'BOTITO con audífonos', c: CLASICO, a: ACCESORIOS.audifonos, retraso: -5.4 },
  { id: 'obra', nombre: 'BOTITO con casco de obra', c: CLASICO, a: ACCESORIOS.obra, retraso: -3.0 },
  { id: 'cientifico', nombre: 'BOTITO científico con lentes', c: CLASICO, a: ACCESORIOS.cientifico, retraso: -7.2 },
  { id: 'musico', nombre: 'BOTITO músico con guitarra', c: CLASICO, a: ACCESORIOS.musico, retraso: -0.2 },
  { id: 'explorador', nombre: 'BOTITO explorador', c: CLASICO, a: ACCESORIOS.explorador, retraso: -4.3 },
]

// Reglas comunes: reposo (flota, respira, parpadea, luces) y el saludo, que va
// cada 9 s por su cuenta y, en linea, cuando la pagina le pone .saluda. El saludo
// periodico esta al FINAL del ciclo: al quitar .saluda la animacion empieza de
// nuevo en reposo y no encadena un segundo saludo.
const CSS_COMUN = `
.bv g { transform-box: view-box; }
.bv-flota { transform-origin: 40px 60px; animation: bv-flota 3.4s ease-in-out infinite; }
.bv-sombra { transform-box: view-box; transform-origin: 40px 115px; animation: bv-sombra 3.4s ease-in-out infinite; }
.bv-cabeza { transform-origin: 40px 44px; }
.bv-antena { transform-origin: 40px 4px; }
.bv-brazo-l { transform-origin: 10px 52px; animation: bv-saludo-ciclo 9s ease-in-out infinite; animation-delay: var(--bv-retraso, 0s); }
.bv-brazo-r { transform-origin: 70px 52px; }
.bv-respira { transform-origin: 40px 68px; animation: bv-respira 3.2s ease-in-out infinite; }
.bv-ojo-l { transform-origin: 29.5px 22.5px; animation: bv-parpadeo 4.6s ease-in-out infinite; }
.bv-ojo-r { transform-origin: 50.5px 22.5px; animation: bv-parpadeo 4.6s ease-in-out infinite; }
.bv-led { animation: bv-led 1.6s ease-in-out infinite; }
.bv-boca { opacity: .1; animation: bv-boca 1s linear infinite; }
.bv-b2 { animation-delay: .25s; } .bv-b3 { animation-delay: .5s; } .bv-b4 { animation-delay: .75s; }
.bv-pecho { opacity: .15; animation: bv-pecho 1.2s ease-in-out infinite; }
.bv-p2 { animation-delay: .4s; } .bv-p3 { animation-delay: .8s; }
.bv-nota { opacity: 0; animation: bv-nota 2.6s ease-out infinite; }
.bv-nota2 { animation-delay: 1.3s; }
.bv-raiz { transform-origin: 40px 60px; }
.saluda .bv-brazo-l { animation: bv-saludo 1.5s ease-in-out both; }
.saluda .bv-raiz { animation: bv-brinco .7s ease-out both; }
.saluda .bv-cabeza { animation: bv-ladea 1.5s ease-in-out both; }
@keyframes bv-flota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
@keyframes bv-sombra { 0%, 100% { transform: scale(1); } 50% { transform: scale(.92); } }
@keyframes bv-respira { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.018, .982); } }
@keyframes bv-parpadeo { 0%, 92%, 100% { transform: scaleY(1); } 94% { transform: scaleY(.1); } }
@keyframes bv-led { 0%, 38%, 62%, 100% { opacity: 1; } 50% { opacity: .08; } }
@keyframes bv-boca { 0%, 100% { opacity: .1; } 18% { opacity: 1; } }
@keyframes bv-pecho { 0%, 100% { opacity: .15; } 33% { opacity: 1; } }
@keyframes bv-nota { 0% { opacity: 0; transform: translate(0, 6px); } 25% { opacity: 1; } 100% { opacity: 0; transform: translate(4px, -10px); } }
@keyframes bv-saludo-ciclo {
  0%, 80% { transform: rotate(0); } 83% { transform: rotate(68deg); } 85% { transform: rotate(28deg); }
  87% { transform: rotate(68deg); } 89% { transform: rotate(28deg); } 91% { transform: rotate(68deg); } 95%, 100% { transform: rotate(0); }
}
@keyframes bv-saludo {
  0% { transform: rotate(0); } 15% { transform: rotate(68deg); } 25% { transform: rotate(28deg); } 35% { transform: rotate(68deg); }
  45% { transform: rotate(28deg); } 55% { transform: rotate(68deg); } 65% { transform: rotate(28deg); } 75% { transform: rotate(68deg); } 100% { transform: rotate(0); }
}
@keyframes bv-brinco { 0% { transform: none; } 18% { transform: translateY(2px) scale(1.03, .96); } 45% { transform: translateY(-9px); } 75% { transform: translateY(0) scale(1.02, .98); } 100% { transform: none; } }
@keyframes bv-ladea { 0%, 100% { transform: rotate(0); } 20%, 80% { transform: rotate(6deg); } }
@media (prefers-reduced-motion: reduce) {
  .bv *, .saluda * { animation: none !important; }
  .bv-boca { opacity: .7; } .bv-pecho { opacity: .8; } .bv-nota { opacity: 1; } .bv-burbuja { opacity: 1; }
}`

function botito({ id, nombre, c, a = {}, retraso }) {
  return `<!-- ${nombre}. ARCHIVO GENERADO por scripts/generar-botitos.mjs — NO SE EDITA A MANO.
     Mismo cuerpo que BOTITO (RoboMascot.vue); solo cambia el color o lleva un accesorio. -->
<svg xmlns="http://www.w3.org/2000/svg" class="bv bv-${id}" viewBox="${VIEWBOX}" width="144" height="156" style="--bv-retraso:${retraso}s">
<style>${CSS_COMUN}${a.css || ''}
</style>
<g class="bv-sombra"><ellipse cx="40" cy="115" rx="20" ry="4" fill="rgba(20,22,28,.18)"/></g>
<g class="bv-flota"><g class="bv-raiz">
  <g class="bv-cabeza">
    <rect x="16" y="4" width="48" height="40" rx="9" fill="${c.cabeza}"/>
    <rect x="16" y="4" width="48" height="40" rx="9" fill="none" stroke="${c.cabezaBorde}" stroke-width="1.5"/>
    <rect x="18" y="6" width="44" height="7" rx="4" fill="white" opacity=".05"/>
    <rect x="22" y="15" width="15" height="15" rx="4.5" fill="#0d1120"/>
    <g class="bv-ojo-l"><circle cx="29.5" cy="22.5" r="5.5" fill="${c.ojo}"/><circle cx="31.5" cy="20.5" r="2" fill="white" opacity=".6"/></g>
    <rect x="43" y="15" width="15" height="15" rx="4.5" fill="#0d1120"/>
    <g class="bv-ojo-r"><circle cx="50.5" cy="22.5" r="5.5" fill="${c.ojo}"/><circle cx="52.5" cy="20.5" r="2" fill="white" opacity=".6"/></g>
    <rect x="25" y="35" width="30" height="5" rx="2.5" fill="#0d1120"/>
    <circle class="bv-boca" cx="30" cy="37.5" r="2" fill="${c.ojo}"/>
    <circle class="bv-boca bv-b2" cx="36.5" cy="37.5" r="2" fill="${c.ojo}"/>
    <circle class="bv-boca bv-b3" cx="43" cy="37.5" r="2" fill="${c.ojo}"/>
    <circle class="bv-boca bv-b4" cx="49.5" cy="37.5" r="2" fill="${c.ojo}"/>${a.cabeza || ''}
    <g class="bv-antena">
      <line x1="40" y1="4" x2="40" y2="-3" stroke="#8899bb" stroke-width="2.2" stroke-linecap="round"/>
      <circle class="bv-led" cx="40" cy="-3" r="3.5" fill="${c.luz}"/>
    </g>
  </g>
  <g class="bv-brazo-l">
    <rect x="4" y="52" width="12" height="32" rx="5" fill="${c.cuerpo}" stroke="${c.cuerpoBorde}" stroke-width="1.2"/>
    <ellipse cx="10" cy="86" rx="7" ry="5" fill="${c.pie}" stroke="${c.ojo}" stroke-width="1"/>
  </g>
  <g class="bv-pierna-l">
    <rect x="23" y="94" width="13" height="16" rx="5" fill="${c.pierna}" stroke="${c.cuerpoBorde}" stroke-width="1.2"/>
    <rect x="20" y="106" width="19" height="7" rx="3.5" fill="${c.pie}"/>
  </g>
  <g class="bv-pierna-r">
    <rect x="44" y="94" width="13" height="16" rx="5" fill="${c.pierna}" stroke="${c.cuerpoBorde}" stroke-width="1.2"/>
    <rect x="41" y="106" width="19" height="7" rx="3.5" fill="${c.pie}"/>
  </g>
  <g class="bv-cuerpo"><g class="bv-respira">
    <rect x="16" y="48" width="48" height="40" rx="9" fill="${c.cuerpo}"/>
    <rect x="16" y="48" width="48" height="40" rx="9" fill="none" stroke="${c.cuerpoBorde}" stroke-width="1.5"/>
    <rect x="20" y="53" width="40" height="30" rx="7" fill="#0d1120" stroke="#2a3050" stroke-width="1.2"/>
    <circle class="bv-pecho" cx="30" cy="68" r="4" fill="#ff3d52"/>
    <circle class="bv-pecho bv-p2" cx="40" cy="68" r="4" fill="#00d4aa"/>
    <circle class="bv-pecho bv-p3" cx="50" cy="68" r="4" fill="#ffd700"/>
  </g>${a.cuerpo || ''}</g>
  <g class="bv-brazo-r">
    <rect x="64" y="52" width="12" height="32" rx="5" fill="${c.cuerpo}" stroke="${c.cuerpoBorde}" stroke-width="1.2"/>
    <ellipse cx="70" cy="86" rx="7" ry="5" fill="${c.pie}" stroke="${c.ojo}" stroke-width="1"/>${a.brazoR || ''}
  </g>${a.encima || ''}
</g></g>
</svg>
`
}

for (const v of VARIANTES) {
  const destino = path.join(RAIZ, 'assets', `botito-${v.id}.svg`)
  fs.writeFileSync(destino, botito(v))
  console.log('escrito', path.relative(RAIZ, destino))
}
