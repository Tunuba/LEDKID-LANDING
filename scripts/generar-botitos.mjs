// generar-botitos.mjs -- BOTITO, su familia y los dibujos de la landing.
//
//   node scripts/generar-botitos.mjs
//
// Escribe en assets/ (relativo a ESTE archivo, no al cwd):
//   botito-<variante>.svg   las 12 variantes sueltas (6 de la familia y 6 nuevas)
//   escena-hero.svg         la portada: tres BOTITOS alrededor de un foquito
//   escena-material.svg     Kits para el salon
//   escena-plataforma.svg   Simulador en linea
//   escena-docentes.svg     Formacion y acompanamiento
//   nivel-chispa.svg, nivel-circuito.svg, nivel-robot.svg, nivel-ingenieria.svg
//                           las cuatro baldosas de niveles
// NADA de esto se edita a mano: se cambia este script y se vuelve a correr.
//
// EL CUERPO ES EL DE BOTITO TAL CUAL (RoboMascot.vue y botitoAnimado.js del
// simulador): mismas piezas, medidas y pivotes. Cada variante cambia el color y
// lleva un accesorio; nada de proporciones nuevas.
//
// CLARO Y OSCURO. Cada color del dibujo es una variable CSS (--bv-*, --il-*) con su
// valor claro y su valor oscuro bajo @media (prefers-color-scheme: dark). Un SVG
// dentro de un <img> tambien sigue el tema de la pagina (medido en Chrome), asi
// que no hace falta meterlos en linea para que cambien. En oscuro la carcasa es la
// de botitoAnimado.js; en claro, la misma familia de tonos subida a pastel.
//
// ⚠️ EL viewBox DE LAS VARIANTES (-32 -32 144 156) ES MAS ANCHO QUE EL DE robo.svg
// A PROPOSITO: en un <img> no hay overflow visible y el brazo que saluda llega a
// x = -29. En las escenas cada BOTITO va en un <svg> anidado con ese mismo viewBox,
// asi los transform-origin de sus animaciones (view-box) son los de siempre.
//
// Las animaciones van DENTRO del SVG y solo mueven transform y opacity; con
// reducir movimiento todo queda quieto. Las clases llevan prefijo bv- (BOTITO) o
// il- (ilustracion) porque, metidas en linea por app.js, sus reglas son globales.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const VIEWBOX = '-32 -32 144 156'

// ── Paletas: LAS MISMAS DE LA APP ──
// oscuro = VARIANTES de frontend/src/components/botitoAnimado.js (el de siempre).
// claro  = VARIANTES_CLARO del mismo archivo (r3-botito-tema): carcasa blanca con
//          contorno del tono de la variante y pantalla muy oscura para que los ojos
//          sigan encendidos. Si la app cambia sus colores, se copian aqui: este es el
//          UNICO lugar de la landing donde viven los colores de BOTITO.
// Las cuatro paletas que la app no tiene (fresa, coral, lima, cian) siguen la misma
// receta claro(borde, cuerpo, pierna, pie, ojo, pantalla).
const BASE_OSC = { pantalla: '#0d1120', panelBorde: '#2a3050', antena: '#8899bb', brillo: 'rgba(255,255,255,.05)', sombra: 'rgba(0,0,0,.28)', lente: '#e8eef8' }
const BASE_CLA = {
  cabeza: '#ffffff', cabezaBorde: '#00896b', cuerpo: '#f3faf7', cuerpoBorde: '#00896b', pierna: '#dcf2ea', pie: '#009a78',
  ojo: '#00d4aa', luz: '#00896b', antena: '#5c6179', pantalla: '#113a33', panelBorde: '#00896b',
  brillo: 'rgba(255,255,255,.05)', sombra: 'rgba(26,29,46,.16)', lente: '#3b4463',
}
const claro = (borde, cuerpo, pierna, pie, ojo, pantalla) => ({ ...BASE_CLA, cabezaBorde: borde, cuerpoBorde: borde, panelBorde: borde, luz: borde, cuerpo, pierna, pie, ojo, pantalla })
const PALETAS = {
  clasico: {
    oscuro: { ...BASE_OSC, cabeza: '#2a3148', cabezaBorde: '#4a5578', cuerpo: '#252b3d', cuerpoBorde: '#3a4260', pierna: '#1e2333', pie: '#2e3650', ojo: '#00d4aa', luz: '#00ffc8' },
    claro: { ...BASE_CLA },
  },
  rosa: {
    oscuro: { ...BASE_OSC, cabeza: '#8e3a6c', cabezaBorde: '#c2679c', cuerpo: '#7a3160', cuerpoBorde: '#a9568a', pierna: '#5e2449', pie: '#9a4679', ojo: '#ff8fd0', luz: '#ffc2e6' },
    claro: claro('#b8407f', '#fdf2f8', '#f9dcec', '#c94f92', '#ff8fd0', '#3d1330'),
  },
  menta: {
    oscuro: { ...BASE_OSC, cabeza: '#1f5a52', cabezaBorde: '#3f8a7e', cuerpo: '#1a4d46', cuerpoBorde: '#357a6f', pierna: '#143c37', pie: '#2a6a60', ojo: '#7dffd8', luz: '#c8fff0' },
    claro: claro('#1f7f6f', '#effaf7', '#d3f1ea', '#2a9d8a', '#7dffd8', '#0f3530'),
  },
  cielo: {
    oscuro: { ...BASE_OSC, cabeza: '#1f4f8a', cabezaBorde: '#4a7fc0', cuerpo: '#1a4277', cuerpoBorde: '#3d6ea8', pierna: '#14345e', pie: '#2a5a96', ojo: '#6bd0ff', luz: '#c8eeff' },
    claro: claro('#1f6fb8', '#f0f6fd', '#d6e7f8', '#3a86d0', '#6bd0ff', '#0f2440'),
  },
  morado: {
    oscuro: { ...BASE_OSC, cabeza: '#4a3a78', cabezaBorde: '#7462a8', cuerpo: '#3f3168', cuerpoBorde: '#64549a', pierna: '#30264f', pie: '#54448a', ojo: '#c7a4ff', luz: '#e6d6ff' },
    claro: claro('#7355b8', '#f6f2fd', '#e4dbf7', '#8a6bd0', '#c7a4ff', '#241a40'),
  },
  ambar: {
    oscuro: { ...BASE_OSC, cabeza: '#7a5212', cabezaBorde: '#b07d2a', cuerpo: '#694510', cuerpoBorde: '#9a6c22', pierna: '#4f340c', pie: '#8a5f1c', ojo: '#ffc24b', luz: '#ffe08a' },
    claro: claro('#9a6400', '#fff8eb', '#fbe8c2', '#c98a1c', '#ffc24b', '#3a2608'),
  },
  fresa: {
    oscuro: { ...BASE_OSC, cabeza: '#8f2f4f', cabezaBorde: '#c95b7e', cuerpo: '#7c2744', cuerpoBorde: '#b04c6d', pierna: '#5c1c33', pie: '#9c3a5c', ojo: '#ff9ab8', luz: '#ffd0de' },
    claro: claro('#c23a64', '#fff2f5', '#fcdbe4', '#d4577d', '#ff9ab8', '#3d1222'),
  },
  coral: {
    oscuro: { ...BASE_OSC, cabeza: '#86402c', cabezaBorde: '#bf6a4f', cuerpo: '#733625', cuerpoBorde: '#a75a41', pierna: '#55281b', pie: '#94503a', ojo: '#ffb08f', luz: '#ffd6c4' },
    claro: claro('#b24a2a', '#fff4ef', '#fbdfd3', '#c9603e', '#ffb08f', '#3a170c'),
  },
  cian: {
    oscuro: { ...BASE_OSC, cabeza: '#145a6b', cabezaBorde: '#2f8aa0', cuerpo: '#114d5c', cuerpoBorde: '#2a7a8e', pierna: '#0d3c48', pie: '#226a7c', ojo: '#7cf0ff', luz: '#c8fbff' },
    claro: claro('#127489', '#effafc', '#d2eff5', '#1f8ea6', '#7cf0ff', '#0b2f38'),
  },
  lima: {
    oscuro: { ...BASE_OSC, cabeza: '#46611c', cabezaBorde: '#6f8f38', cuerpo: '#3c5418', cuerpoBorde: '#61802f', pierna: '#2d3f12', pie: '#557326', ojo: '#d4ff7a', luz: '#ecffc2' },
    claro: claro('#4f7a12', '#f6fbec', '#e3f1c7', '#6a9a22', '#d4ff7a', '#1e2e08'),
  },
}
const CLAVES = ['cabeza', 'cabezaBorde', 'cuerpo', 'cuerpoBorde', 'pierna', 'pie', 'ojo', 'luz', 'pantalla', 'panelBorde', 'antena', 'brillo', 'sombra', 'lente']
const kebab = s => s.replace(/[A-Z]/g, m => '-' + m.toLowerCase())
const vars = o => CLAVES.map(k => `--bv-${kebab(k)}:${o[k]}`).join(';')
function cssPaletas(nombres) {
  const uno = [...new Set(nombres)]
  return uno.map(n => `.bv-p-${n}{${vars(PALETAS[n].claro)}}`).join('\n')
    + '\n@media (prefers-color-scheme: dark){\n' + uno.map(n => `.bv-p-${n}{${vars(PALETAS[n].oscuro)}}`).join('\n') + '\n}'
}
// Atajos para escribir el color de una pieza como variable
const F = k => `style="fill:var(--bv-${kebab(k)})"`
const FS = (f, s) => `style="fill:var(--bv-${kebab(f)});stroke:var(--bv-${kebab(s)})"`

// ── Accesorios. Cada uno dice en que hueco del dibujo va:
//    detras (antes de todo), cabeza, sobreAntena (tapa la antena), cuerpo, brazoR, encima. ──
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
  // ─── la familia (ronda 2) ───
  audifonos: {
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
    cabeza: `
      <path d="M14 12 C14 -8 66 -8 66 12 Z" fill="#FFC21A" stroke="#d99a00" stroke-width="1.4"/>
      <rect x="36.5" y="-3" width="7" height="15" rx="3.5" fill="#ffd95c"/>
      <path d="M22 4 C26 -1 32 -3 36 -3" fill="none" stroke="#fff3c4" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
      <rect x="7" y="10" width="66" height="5.5" rx="2.75" fill="#FFB000" stroke="#d99a00" stroke-width="1.2"/>`,
    brazoR: `
      <g class="bv-llave">
        <rect x="68" y="76" width="4" height="18" rx="2" fill="#98a3ba" transform="rotate(-30 70 86)"/>
        <circle cx="75" cy="78" r="4.2" fill="none" stroke="#98a3ba" stroke-width="3" transform="rotate(-30 70 86)"/>
      </g>`,
    css: `
.bv-obra .bv-brazo-r { animation: bv-martillo 1.4s ease-in-out infinite; }
@keyframes bv-martillo { 0%, 60%, 100% { transform: rotate(0); } 70% { transform: rotate(-22deg); } 80% { transform: rotate(-4deg); } 88% { transform: rotate(-18deg); } }`,
  },
  cientifico: {
    cabeza: `
      <circle cx="29.5" cy="22.5" r="9.5" fill="#ffffff" fill-opacity=".08" style="stroke:var(--bv-lente)" stroke-width="1.8"/>
      <circle cx="50.5" cy="22.5" r="9.5" fill="#ffffff" fill-opacity=".08" style="stroke:var(--bv-lente)" stroke-width="1.8"/>
      <path d="M39 21.5 Q40 19.5 41 21.5" fill="none" style="stroke:var(--bv-lente)" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M20 21 L15.5 18.5 M60 21 L64.5 18.5" style="stroke:var(--bv-lente)" stroke-width="1.8" stroke-linecap="round"/>`,
    brazoR: `
      <g class="bv-matraz">
        <rect x="67" y="76" width="7" height="7" rx="1.5" fill="#e8eef8" fill-opacity=".5" style="stroke:var(--bv-lente)" stroke-width="1.2"/>
        <path d="M66.5 83 L61 96 Q60 99.5 64 99.5 L77 99.5 Q81 99.5 80 96 L74.5 83 Z" fill="#e8eef8" fill-opacity=".35" style="stroke:var(--bv-lente)" stroke-width="1.2"/>
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

  // ─── las nuevas (ronda 3): una por lugar de la pagina ───
  // Menta con la caja del kit: la cajita lleva sus LEDs, que se encienden por turno
  caja: {
    brazoR: `
      <g class="bv-caja">
        <rect x="58" y="80" width="30" height="21" rx="4" fill="#FFC24D" stroke="#c98a12" stroke-width="1.3"/>
        <rect x="58" y="80" width="30" height="6" rx="3" fill="#ffd98a" stroke="#c98a12" stroke-width="1.3"/>
        <path d="M68 86 v15 M78 86 v15" stroke="#c98a12" stroke-width="1.1"/>
        <circle class="bv-cajaled bv-cl1" cx="63" cy="93.5" r="2.6" fill="#ff5a6e"/>
        <circle class="bv-cajaled bv-cl2" cx="73" cy="93.5" r="2.6" fill="#1fd3a6"/>
        <circle class="bv-cajaled bv-cl3" cx="83" cy="93.5" r="2.6" fill="#ffd21f"/>
      </g>`,
    css: `
.bv-cajaled { animation: bv-cajaled 2.4s ease-in-out infinite; opacity: .35; }
.bv-cl2 { animation-delay: .8s; } .bv-cl3 { animation-delay: 1.6s; }
@keyframes bv-cajaled { 0%, 100% { opacity: .35; } 20% { opacity: 1; } 45% { opacity: .35; } }
.bv-caja-v .bv-brazo-r { animation: bv-mece 3.2s ease-in-out infinite; }
@keyframes bv-mece { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-6deg); } }`,
  },
  // Cielo con gorra de lado: la visera mira a la izquierda
  gorra: {
    cabeza: `
      <path d="M17 13 C17 -6 63 -6 63 13 Z" fill="#FF7A45" stroke="#d2551f" stroke-width="1.3"/>
      <path d="M40 -3 C47 -3 58 3 62 11" fill="none" stroke="#ffb08c" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M18 11 Q4 8 -1 14 Q8 16 18 15 Z" fill="#e8612b" stroke="#d2551f" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="40" cy="-3.5" r="2.4" fill="#d2551f"/>`,
    tapaAntena: true,
    css: `
.bv-gorra-v .bv-cabeza { animation: bv-asiente 2.8s ease-in-out infinite; }
@keyframes bv-asiente { 0%, 70%, 100% { transform: rotate(0); } 78% { transform: rotate(-5deg); } 86% { transform: rotate(3deg); } }`,
  },
  // Morado profesor: birrete con borla y un puntero que senala
  profe: {
    cabeza: `
      <rect x="25" y="-1" width="30" height="8" rx="2" fill="#262b40"/>
      <path d="M8 -2 L40 -12 L72 -2 L40 8 Z" fill="#2f3550" stroke="#1b1f30" stroke-width="1.2" stroke-linejoin="round"/>
      <g class="bv-borla"><path d="M40 -2 L60 1 L60 12" fill="none" stroke="#FFC24D" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="57.5" y="11" width="5" height="7" rx="2" fill="#FFC24D"/></g>
      <circle cx="40" cy="-2" r="2.2" fill="#FFC24D"/>`,
    tapaAntena: true,
    brazoR: `
      <g class="bv-puntero"><path d="M70 88 L100 58" stroke="#8b5a2b" stroke-width="3" stroke-linecap="round"/>
        <circle cx="100.5" cy="57.5" r="3.4" fill="#FFA000"/></g>`,
    css: `
.bv-borla { transform-origin: 60px 1px; animation: bv-borla 2.6s ease-in-out infinite; }
@keyframes bv-borla { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(10deg); } }
.bv-profe-v .bv-brazo-r { animation: bv-senala 3.6s ease-in-out infinite; }
@keyframes bv-senala { 0%, 100% { transform: rotate(0); } 35%, 60% { transform: rotate(-24deg); } 45% { transform: rotate(-18deg); } }`,
  },
  // Ambar con un LED grande que se enciende
  foco: {
    brazoR: `
      <g class="bv-foco">
        <circle class="bv-foco-halo" cx="80" cy="70" r="15" fill="#FFD54F" fill-opacity=".55"/>
        <path d="M72 81 V70 a8 8 0 0 1 16 0 V81 Z" fill="#FF5A6E" stroke="#c23347" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M75 70 a5 5 0 0 1 4 -5" fill="none" stroke="#ffc2cb" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="70.5" y="80" width="19" height="4" rx="2" fill="#e04257"/>
        <path d="M76 84 v10 M84 84 v14" stroke="#a9b3c9" stroke-width="1.6" stroke-linecap="round"/>
      </g>`,
    css: `
.bv-foco-halo { transform-box: fill-box; transform-origin: 50% 50%; animation: bv-halo 2s ease-in-out infinite; }
@keyframes bv-halo { 0%, 100% { opacity: .35; transform: scale(.85); } 50% { opacity: 1; transform: scale(1.15); } }`,
  },
  // Fresa con un mono grande en la cabeza
  mono: {
    cabeza: `
      <g class="bv-mono">
        <path d="M22 4 C8 -8 4 8 14 10 C18 11 21 8 22 4 Z" fill="#FF6F9A" stroke="#d94677" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M22 4 C30 -10 42 2 32 8 C28 10 24 8 22 4 Z" fill="#FF6F9A" stroke="#d94677" stroke-width="1.3" stroke-linejoin="round"/>
        <circle cx="22" cy="5" r="4" fill="#ff8fb2" stroke="#d94677" stroke-width="1.2"/>
        <path d="M12 2 q2 -2 5 -1" fill="none" stroke="#ffd0de" stroke-width="1.4" stroke-linecap="round"/>
      </g>`,
    css: `
.bv-mono { transform-origin: 22px 5px; animation: bv-mono 2.4s ease-in-out infinite; }
@keyframes bv-mono { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }`,
  },
  // Coral con capa de heroe que ondea por detras
  capa: {
    detras: `
      <g class="bv-capa"><path d="M20 50 Q40 44 60 50 L78 104 Q66 112 56 104 Q46 114 34 104 Q22 112 4 102 Z" fill="#00b894" stroke="#00876c" stroke-width="1.4" stroke-linejoin="round"/></g>`,
    cuerpo: `
      <path d="M40 58 l3 6 6.5 .6 -5 4.3 1.5 6.4 -6 -3.4 -6 3.4 1.5 -6.4 -5 -4.3 6.5 -.6 z" fill="#FFD54F" opacity=".95"/>`,
    css: `
.bv-capa { transform-origin: 40px 48px; animation: bv-capa 1.6s ease-in-out infinite; }
@keyframes bv-capa { 0%, 100% { transform: skewX(0) scaleX(1); } 50% { transform: skewX(-7deg) scaleX(1.05); } }`,
  },
  // Cian con su libro abierto: las paginas pasan solas
  libro: {
    brazoR: `
      <g class="bv-libro">
        <path d="M58 80 Q68 76 76 80 V100 Q68 96 58 100 Z" fill="#ffffff" stroke="#3b6fd1" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M76 80 Q84 76 94 80 V100 Q84 96 76 100 Z" fill="#ffffff" stroke="#3b6fd1" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M61 85 h11 M61 89 h11 M61 93 h8 M79 85 h11 M79 89 h11" stroke="#9fb3d9" stroke-width="1.2" stroke-linecap="round"/>
        <path class="bv-hoja" d="M76 80 Q84 76 92 80 V99 Q84 95 76 99 Z" fill="#eaf1ff" stroke="#3b6fd1" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M86 78 v8 l2 -2 2 2 v-8" fill="#ff5a6e"/>
      </g>`,
    css: `
.bv-hoja { transform-origin: 76px 90px; animation: bv-hoja 4s ease-in-out infinite; }
@keyframes bv-hoja { 0%, 60%, 100% { transform: scaleX(1); opacity: 1; } 70% { transform: scaleX(.1); opacity: .9; } 71% { transform: scaleX(-.1); opacity: .9; } 80%, 99% { transform: scaleX(-1); opacity: 0; } }`,
  },
  // Lima con casco de carreras y su bandera a cuadros
  casco: {
    cabeza: `
      <path d="M13 16 C13 -9 67 -9 67 16 L62 16 C60 6 20 6 18 16 Z" fill="#2f6fd6" stroke="#1d4fa8" stroke-width="1.3"/>
      <path d="M40 -4.5 V11" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <path d="M22 4 C26 -1 32 -3 36 -3" fill="none" stroke="#8fb6ff" stroke-width="1.6" stroke-linecap="round"/>`,
    tapaAntena: true,
    brazoR: `
      <g class="bv-bandera"><path d="M70 90 V56" stroke="#8a97b8" stroke-width="2.4" stroke-linecap="round"/>
        <g transform="translate(71 56)"><rect width="22" height="15" rx="1.5" fill="#ffffff" stroke="#2b3148" stroke-width="1"/>
          <path d="M0 0h5.5v5h-5.5zM11 0h5.5v5H11zM5.5 5H11v5H5.5zM16.5 5H22v5h-5.5zM0 10h5.5v5H0zM11 10h5.5v5H11z" fill="#2b3148"/></g></g>`,
    css: `
.bv-bandera { transform-origin: 70px 90px; animation: bv-bandera 1.2s ease-in-out infinite; }
@keyframes bv-bandera { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(8deg); } }`,
  },
}

// ── Las variantes. `retraso` desfasa el saludo periodico para que no saluden a la vez. ──
const VARIANTES = [
  // familia (ronda 2)
  { id: 'rosa', nombre: 'BOTITO en rosa', pal: 'rosa', retraso: -1.2 },
  { id: 'audifonos', nombre: 'BOTITO con audífonos', pal: 'clasico', acc: 'audifonos', retraso: -5.4 },
  { id: 'obra', nombre: 'BOTITO con casco de obra', pal: 'clasico', acc: 'obra', retraso: -3.0 },
  { id: 'cientifico', nombre: 'BOTITO científico con lentes', pal: 'clasico', acc: 'cientifico', retraso: -7.2 },
  { id: 'musico', nombre: 'BOTITO músico con guitarra', pal: 'clasico', acc: 'musico', retraso: -0.2 },
  { id: 'explorador', nombre: 'BOTITO explorador', pal: 'clasico', acc: 'explorador', retraso: -4.3 },
  // nuevas (ronda 3): cada una con color Y accesorio propios
  { id: 'kit', nombre: 'BOTITO menta con la caja del kit', pal: 'menta', acc: 'caja', retraso: -2.1 },
  { id: 'gorra', nombre: 'BOTITO celeste con gorra', pal: 'cielo', acc: 'gorra', retraso: -6.3 },
  { id: 'profe', nombre: 'BOTITO profesor con birrete', pal: 'morado', acc: 'profe', retraso: -4.8 },
  { id: 'foco', nombre: 'BOTITO ámbar con un LED encendido', pal: 'ambar', acc: 'foco', retraso: -0.6 },
  { id: 'mono', nombre: 'BOTITO fresa con moño', pal: 'fresa', acc: 'mono', retraso: -3.6 },
  { id: 'capa', nombre: 'BOTITO coral con capa', pal: 'coral', acc: 'capa', retraso: -8.0 },
  { id: 'libro', nombre: 'BOTITO turquesa con su libro', pal: 'cian', acc: 'libro', retraso: -7.6 },
  { id: 'piloto', nombre: 'BOTITO lima con casco y bandera de carreras', pal: 'lima', acc: 'casco', retraso: -5.0 },
]
const V = Object.fromEntries(VARIANTES.map(v => [v.id, v]))

// Reglas comunes: reposo (flota, respira, parpadea, luces) y el saludo, cada 9 s
// por su cuenta y, en linea, cuando la pagina le pone .saluda.
const CSS_COMUN = `
.bv g { transform-box: view-box; }
.bv-flota { transform-origin: 40px 60px; animation: bv-flota 3.4s ease-in-out infinite; }
.bv-sombra { transform-origin: 40px 115px; animation: bv-sombra 3.4s ease-in-out infinite; }
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
  .bv-boca { opacity: .7; } .bv-pecho { opacity: .8; } .bv-nota { opacity: 1; } .bv-burbuja { opacity: 1; } .bv-cajaled { opacity: 1; }
}`

// El interior de BOTITO (sin <svg>): el mismo dibujo de RoboMascot, con colores en variables.
function interior(v) {
  const a = v.acc ? ACCESORIOS[v.acc] : {}
  const antena = `
    <g class="bv-antena">
      <line x1="40" y1="4" x2="40" y2="-3" style="stroke:var(--bv-antena)" stroke-width="2.2" stroke-linecap="round"/>
      <circle class="bv-led" cx="40" cy="-3" r="3.5" ${F('luz')}/>
    </g>`
  return `
<g class="bv-sombra"><ellipse cx="40" cy="115" rx="20" ry="4" ${F('sombra')}/></g>
<g class="bv-flota"><g class="bv-raiz">${a.detras || ''}
  <g class="bv-cabeza">
    <rect x="16" y="4" width="48" height="40" rx="9" ${F('cabeza')}/>
    <rect x="16" y="4" width="48" height="40" rx="9" fill="none" style="stroke:var(--bv-cabeza-borde)" stroke-width="1.5"/>
    <rect x="18" y="6" width="44" height="7" rx="4" ${F('brillo')}/>
    <rect x="22" y="15" width="15" height="15" rx="4.5" ${F('pantalla')}/>
    <g class="bv-ojo-l"><circle cx="29.5" cy="22.5" r="5.5" ${F('ojo')}/><circle cx="31.5" cy="20.5" r="2" fill="white" opacity=".6"/></g>
    <rect x="43" y="15" width="15" height="15" rx="4.5" ${F('pantalla')}/>
    <g class="bv-ojo-r"><circle cx="50.5" cy="22.5" r="5.5" ${F('ojo')}/><circle cx="52.5" cy="20.5" r="2" fill="white" opacity=".6"/></g>
    <rect x="25" y="35" width="30" height="5" rx="2.5" ${F('pantalla')}/>
    <circle class="bv-boca" cx="30" cy="37.5" r="2" ${F('ojo')}/>
    <circle class="bv-boca bv-b2" cx="36.5" cy="37.5" r="2" ${F('ojo')}/>
    <circle class="bv-boca bv-b3" cx="43" cy="37.5" r="2" ${F('ojo')}/>
    <circle class="bv-boca bv-b4" cx="49.5" cy="37.5" r="2" ${F('ojo')}/>${a.tapaAntena ? antena + (a.cabeza || '') : (a.cabeza || '') + antena}
  </g>
  <g class="bv-brazo-l">
    <rect x="4" y="52" width="12" height="32" rx="5" ${FS('cuerpo', 'cuerpoBorde')} stroke-width="1.2"/>
    <ellipse cx="10" cy="86" rx="7" ry="5" ${FS('pie', 'ojo')} stroke-width="1"/>
  </g>
  <g class="bv-pierna-l">
    <rect x="23" y="94" width="13" height="16" rx="5" ${FS('pierna', 'cuerpoBorde')} stroke-width="1.2"/>
    <rect x="20" y="106" width="19" height="7" rx="3.5" ${F('pie')}/>
  </g>
  <g class="bv-pierna-r">
    <rect x="44" y="94" width="13" height="16" rx="5" ${FS('pierna', 'cuerpoBorde')} stroke-width="1.2"/>
    <rect x="41" y="106" width="19" height="7" rx="3.5" ${F('pie')}/>
  </g>
  <g class="bv-cuerpo"><g class="bv-respira">
    <rect x="16" y="48" width="48" height="40" rx="9" ${F('cuerpo')}/>
    <rect x="16" y="48" width="48" height="40" rx="9" fill="none" style="stroke:var(--bv-cuerpo-borde)" stroke-width="1.5"/>
    <rect x="20" y="53" width="40" height="30" rx="7" ${FS('pantalla', 'panelBorde')} stroke-width="1.2"/>
    <circle class="bv-pecho" cx="30" cy="68" r="4" fill="#ff3d52"/>
    <circle class="bv-pecho bv-p2" cx="40" cy="68" r="4" fill="#00d4aa"/>
    <circle class="bv-pecho bv-p3" cx="50" cy="68" r="4" fill="#ffd700"/>
  </g>${a.cuerpo || ''}</g>
  <g class="bv-brazo-r">
    <rect x="64" y="52" width="12" height="32" rx="5" ${FS('cuerpo', 'cuerpoBorde')} stroke-width="1.2"/>
    <ellipse cx="70" cy="86" rx="7" ry="5" ${FS('pie', 'ojo')} stroke-width="1"/>${a.brazoR || ''}
  </g>${a.encima || ''}
</g></g>`
}
const clases = v => `bv bv-${v.id} bv-p-${v.pal}${v.acc ? ' bv-' + v.acc + '-v' : ''}`
const cssDe = lista => cssPaletas(lista.map(v => v.pal)) + CSS_COMUN + [...new Set(lista.map(v => v.acc).filter(Boolean))].map(k => ACCESORIOS[k].css || '').join('')

// Un BOTITO dentro de una escena: <svg> anidado con el viewBox de siempre.
// (x, y) es la esquina del lienzo y `alto` su alto; el pie cae en y + alto * 145/156.
function botitoEn(id, x, y, alto, extra = '') {
  const v = V[id]
  const ancho = alto * 144 / 156
  const svg = `<svg class="${clases(v)}" x="${x}" y="${y}" width="${ancho.toFixed(1)}" height="${alto}" viewBox="${VIEWBOX}" overflow="visible" style="--bv-retraso:${v.retraso}s">${interior(v)}</svg>`
  // Las animaciones de la escena van en un <g> alrededor: el transform CSS sobre un
  // <svg> anidado no es fiable en todos los navegadores.
  return extra ? `<g class="${extra}">${svg}</g>` : svg
}
const pieDe = (y, alto) => y + alto * 145 / 156

function archivoBotito(v) {
  return `<!-- ${v.nombre}. ARCHIVO GENERADO por scripts/generar-botitos.mjs — NO SE EDITA A MANO.
     Mismo cuerpo que BOTITO (RoboMascot.vue); cambia el color y lleva un accesorio. -->
<svg xmlns="http://www.w3.org/2000/svg" class="${clases(v)}" viewBox="${VIEWBOX}" width="144" height="156" style="--bv-retraso:${v.retraso}s">
<style>${cssDe([v])}
</style>${interior(v)}
</svg>
`
}

// ══ Ilustraciones ═════════════════════════════════════════════════════════════
// El estilo de los iconos de la app: trazo redondo, contorno oscuro suave en claro
// y claro en oscuro, rellenos planos y pocos. Los colores de los componentes (LED
// rojo, placa azul, cobre) no cambian con el tema: son los del objeto real.
const IL_CLARO = {
  trazo: '#3b4463', papel: '#ffffff', gris: '#e7ebf4', gris2: '#cdd4e4', suelo: 'rgba(59,68,99,.08)',
  pantalla: '#f4f7fc', rejilla: '#e3e8f2', verde: '#00a882', ambar: '#FFA000', mesa: '#e9dcc6', mesa2: '#d8c6a8',
  pcb: '#1f7ad6', pcb2: '#1766b8', metal: '#d9dee8', metal2: '#aab3c5', cobre: '#d9a45b', negro: '#2b3148',
  planta: '#43b77a', maceta: '#e38b5a', pista: '#2b3148', pistaLinea: '#ffffff', pizarra: '#ffffff', marco: '#c9b28c',
}
const IL_OSCURO = {
  trazo: '#b4bfdc', papel: '#1f2942', gris: '#253150', gris2: '#34426a', suelo: 'rgba(0,0,0,.28)',
  pantalla: '#141c30', rejilla: '#1f2a44', verde: '#00d4aa', ambar: '#FFB020', mesa: '#3a3346', mesa2: '#2c2738',
  pcb: '#2d8ae6', pcb2: '#1f6cc0', metal: '#aeb7ca', metal2: '#7b869e', cobre: '#d9a45b', negro: '#0f1424',
  planta: '#3fcf86', maceta: '#d9794a', pista: '#0c111e', pistaLinea: '#e7ecf7', pizarra: '#1b2439', marco: '#6d5c43',
}
const ilVars = o => Object.entries(o).map(([k, v]) => `--il-${kebab(k)}:${v}`).join(';')
const CSS_IL = `
.il{${ilVars(IL_CLARO)}}
@media (prefers-color-scheme: dark){.il{${ilVars(IL_OSCURO)}}}
.il .t{stroke:var(--il-trazo);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.il .t2{stroke:var(--il-trazo);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.il .fb{transform-box:fill-box;transform-origin:50% 50%}
@media (prefers-reduced-motion: reduce){ .il * { animation: none !important; } }`
const c = k => `var(--il-${kebab(k)})`

function archivoIlustracion(nombre, titulo, w, h, cuerpo, botitos = [], css = '') {
  return `<!-- ${titulo}. ARCHIVO GENERADO por scripts/generar-botitos.mjs — NO SE EDITA A MANO. -->
<svg xmlns="http://www.w3.org/2000/svg" class="il il-${nombre}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<style>${CSS_IL}${botitos.length ? cssDe(botitos.map(id => V[id])) : ''}${css}
</style>
${cuerpo}
</svg>
`
}

// ── Piezas de dibujo reutilizables ──
const led = (x, y, color, clase = '', e = 1) => `<g transform="translate(${x} ${y}) scale(${e})">
  <circle class="${clase} fb" cx="0" cy="-8" r="14" fill="${color}" fill-opacity=".35"/>
  <path d="M-8 4 V-8 a8 8 0 0 1 16 0 V4 Z" fill="${color}" class="t2"/>
  <rect x="-10" y="3" width="20" height="4.5" rx="2" fill="${color}" class="t2"/>
  <path d="M-3.5 8 v12 M3.5 8 v16" class="t2" fill="none"/>
  <path d="M-4 -8 a4 4 0 0 1 3 -4" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round" fill="none"/></g>`

const semaforo = (x, y, e = 1) => `<g transform="translate(${x} ${y}) scale(${e})">
  <rect x="-5" y="92" width="10" height="44" rx="4" style="fill:${c('gris2')}" class="t2"/>
  <rect x="-24" y="0" width="48" height="98" rx="14" style="fill:${c('negro')}" class="t2"/>
  <circle cx="0" cy="22" r="11" fill="#ff5a6e" class="il-sem il-sem1"/>
  <circle cx="0" cy="49" r="11" fill="#ffc21f" class="il-sem il-sem2"/>
  <circle cx="0" cy="76" r="11" fill="#1fd3a6" class="il-sem il-sem3"/></g>`
const CSS_SEMAFORO = `
.il-sem{opacity:.22;animation:il-sem 4.5s linear infinite}
.il-sem2{animation-delay:1.5s}.il-sem3{animation-delay:3s}
@keyframes il-sem{0%,30%{opacity:1}34%,100%{opacity:.22}}
@media (prefers-reduced-motion: reduce){.il-sem1{opacity:1}}`

const protoboard = (x, y, w, h) => {
  let hoyos = ''
  for (let i = 0; i < Math.floor((w - 24) / 12); i++) for (let j = 0; j < 2; j++) hoyos += `<rect x="${x + 14 + i * 12}" y="${y + 22 + j * 12}" width="4" height="4" rx="1" style="fill:${c('gris2')}"/><rect x="${x + 14 + i * 12}" y="${y + h - 38 + j * 12}" width="4" height="4" rx="1" style="fill:${c('gris2')}"/>`
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" style="fill:${c('papel')}" class="t"/>
  <path d="M${x + 12} ${y + 10} h${w - 24}" stroke="#ff5a6e" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M${x + 12} ${y + h - 10} h${w - 24}" stroke="#3d8bff" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M${x + 10} ${y + h / 2} h${w - 20}" style="stroke:${c('gris')}" stroke-width="5" stroke-linecap="round"/>${hoyos}</g>`
}
const resistencia = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-26 0 H26" class="t2" fill="none"/>
  <rect x="-14" y="-6" width="28" height="12" rx="6" fill="#f1d7a6" class="t2"/>
  <path d="M-7 -5.5 v11 M-1 -5.5 v11 M5 -5.5 v11" stroke-width="2.6" stroke="#b5452e"/><path d="M-1 -5.5 v11" stroke-width="2.6" stroke="#6b3a1d"/></g>`

const ultrasonico = (x, y, e = 1) => `<g transform="translate(${x} ${y}) scale(${e})">
  <rect x="0" y="0" width="120" height="58" rx="8" style="fill:${c('pcb')}" class="t2"/>
  <circle cx="30" cy="29" r="22" style="fill:${c('metal')}" class="t2"/><circle cx="30" cy="29" r="14" style="fill:${c('metal2')}"/>
  <circle cx="90" cy="29" r="22" style="fill:${c('metal')}" class="t2"/><circle cx="90" cy="29" r="14" style="fill:${c('metal2')}"/>
  <path d="M24 23 l12 12 M36 23 l-12 12 M84 23 l12 12 M96 23 l-12 12" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
  <rect x="52" y="6" width="16" height="8" rx="2" style="fill:${c('negro')}"/>
  <path d="M44 58 v12 M54 58 v12 M66 58 v12 M76 58 v12" class="t2" fill="none"/></g>`
const ondas = (x, y, clase) => `<g transform="translate(${x} ${y})" fill="none" stroke-linecap="round">
  <path class="${clase} ${clase}1" d="M0 -14 a18 18 0 0 1 0 28" stroke="#1fb6ff" stroke-width="3.5"/>
  <path class="${clase} ${clase}2" d="M12 -24 a30 30 0 0 1 0 48" stroke="#1fb6ff" stroke-width="3.5"/>
  <path class="${clase} ${clase}3" d="M24 -34 a44 44 0 0 1 0 68" stroke="#1fb6ff" stroke-width="3.5"/></g>`
const CSS_ONDAS = `
.il-onda{opacity:0;animation:il-onda 2.4s ease-out infinite}
.il-onda2{animation-delay:.4s}.il-onda3{animation-delay:.8s}
@keyframes il-onda{0%{opacity:0;transform:translateX(-4px)}25%{opacity:1}100%{opacity:0;transform:translateX(8px)}}
@media (prefers-reduced-motion: reduce){.il-onda{opacity:.8}}`

// Pantalla del simulador: el circuito con su LED que se enciende
const pantallaSim = (x, y, w, h) => `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" style="fill:${c('pantalla')}"/>
  <rect x="${x}" y="${y}" width="${w}" height="16" rx="8" style="fill:${c('gris')}"/>
  <circle cx="${x + 12}" cy="${y + 8}" r="3" fill="#ff5a6e"/><circle cx="${x + 22}" cy="${y + 8}" r="3" fill="#ffc21f"/><circle cx="${x + 32}" cy="${y + 8}" r="3" fill="#1fd3a6"/>
  <rect x="${x + 14}" y="${y + 30}" width="${w * .28}" height="${h * .5}" rx="5" style="fill:${c('negro')}"/>
  <path d="M${x + 14 + w * .28} ${y + 40} H${x + w * .72} V${y + h * .5}" fill="none" style="stroke:${c('verde')}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M${x + 14 + w * .28} ${y + h * .7} H${x + w * .72} V${y + h * .62}" fill="none" style="stroke:${c('trazo')}" stroke-opacity=".5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle class="il-simluz fb" cx="${x + w * .72}" cy="${y + h * .56}" r="${h * .14}" fill="#ffd54f" fill-opacity=".5"/>
  <circle cx="${x + w * .72}" cy="${y + h * .56}" r="${h * .065}" fill="#ff5a6e"/>
  <rect x="${x + w - 44}" y="${y + h - 22}" width="34" height="14" rx="7" style="fill:${c('verde')}"/><path d="M${x + w - 30} ${y + h - 18.5} l6 3.5 -6 3.5 z" fill="#fff"/></g>`
const CSS_SIM = `
.il-simluz{animation:il-simluz 2.6s ease-in-out infinite}
@keyframes il-simluz{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}`

const laptop = (x, y, w, h) => `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" style="fill:${c('negro')}" class="t"/>
  ${pantallaSim(x + 10, y + 10, w - 20, h - 20)}
  <path d="M${x - 26} ${y + h + 4} H${x + w + 26} L${x + w + 12} ${y + h + 20} H${x - 12} Z" style="fill:${c('gris2')}" class="t"/>
  <rect x="${x + w / 2 - 24}" y="${y + h + 6}" width="48" height="5" rx="2.5" style="fill:${c('gris')}"/></g>`

const fondoBlobs = (w, h, tinte, tinte2) => `<rect width="${w}" height="${h}" fill="${tinte}"/>
  <circle cx="${w * .86}" cy="${h * .16}" r="${h * .36}" fill="${tinte2}"/>
  <circle cx="${w * .08}" cy="${h * .9}" r="${h * .22}" fill="${tinte2}"/>
  <g style="fill:${c('trazo')}" fill-opacity=".14">${[0, 1, 2, 3].map(i => [0, 1, 2].map(j => `<circle cx="${w * .07 + i * 16}" cy="${h * .1 + j * 16}" r="2.6"/>`).join('')).join('')}</g>`

// ── Escenas de "Todo llega armado al salon" (720 x 500, la proporcion 36/25 de la tarjeta) ──
const TINTES = `
.il{--il-t-crema:#fff3dc;--il-t-crema2:#ffe7bd;--il-t-menta:#e3f5ee;--il-t-menta2:#c9ebdd;--il-t-cielo:#e8f0fc;--il-t-cielo2:#d2e2f8;--il-t-rosa:#fdebf3;--il-t-rosa2:#f9d6e6}
@media (prefers-color-scheme: dark){.il{--il-t-crema:#2a2419;--il-t-crema2:#3a301d;--il-t-menta:#132a2a;--il-t-menta2:#17393a;--il-t-cielo:#15223d;--il-t-cielo2:#1b2d52;--il-t-rosa:#2c1a2a;--il-t-rosa2:#3c2138}}`

function escenaMaterial() {
  const W = 720, H = 500, suelo = 440
  const bY = 96, bA = 360
  const caja = `<g>
    <path d="M346 318 L364 236 H590 L608 318 Z" fill="#ffe2a3" class="t"/>
    <path d="M380 250 H574" stroke="#e7b75a" stroke-width="3" stroke-linecap="round"/>
    <rect x="336" y="316" width="282" height="124" rx="16" fill="#FFC24D" class="t"/>
    <rect x="336" y="316" width="282" height="26" rx="12" fill="#ffd98a" class="t"/>
    <path d="M430 342 v98 M524 342 v98" stroke="#c98a12" stroke-width="3"/>
    ${led(383, 392, '#ff5a6e', 'il-ledk il-ledk1', 1)}
    ${resistencia(477, 388)}
    ${led(571, 392, '#1fd3a6', 'il-ledk il-ledk2', 1)}
    <path d="M350 426 q16 -14 32 0 t32 0" fill="none" stroke="#3d8bff" stroke-width="4" stroke-linecap="round"/>
    <path d="M540 426 q16 -14 32 0 t32 0" fill="none" stroke="#ff5a6e" stroke-width="4" stroke-linecap="round"/>
  </g>`
  const cuerpo = `${fondoBlobs(W, H, c('tCrema'), c('tCrema2'))}
  <ellipse cx="${W / 2}" cy="${suelo + 6}" rx="${W * .46}" ry="18" style="fill:${c('suelo')}"/>
  ${semaforo(668, 278, 1.2)}
  ${caja}
  ${botitoEn('kit', 6, bY, bA)}`
  return archivoIlustracion('material', 'Kits para el salon: BOTITO menta con la caja del kit y un semaforo de LEDs', W, H, cuerpo, ['kit'],
    TINTES + CSS_SEMAFORO + `
.il-ledk{animation:il-ledk 2.4s ease-in-out infinite}.il-ledk2{animation-delay:1.2s}
@keyframes il-ledk{0%,100%{opacity:.15;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}`)
}

function escenaPlataforma() {
  const W = 720, H = 500, suelo = 440
  const cuerpo = `${fondoBlobs(W, H, c('tMenta'), c('tMenta2'))}
  <ellipse cx="${W / 2}" cy="${suelo + 6}" rx="${W * .46}" ry="18" style="fill:${c('suelo')}"/>
  ${laptop(388, 214, 290, 196)}
  <g transform="translate(262 352)">${ultrasonico(0, 0, .8)}</g>
  ${ondas(366, 375, 'il-onda')}
  <path d="M300 408 C300 444 360 446 400 428" fill="none" stroke="#3d8bff" stroke-width="3.5" stroke-linecap="round"/>
  <g transform="translate(640 120)"><rect x="-18" y="0" width="36" height="30" rx="15" style="fill:${c('negro')}" class="t2"/><circle cx="0" cy="15" r="6" style="fill:${c('gris2')}"/>
    <path class="il-bip fb" d="M24 4 a16 16 0 0 1 0 22 M32 -2 a26 26 0 0 1 0 34" fill="none" style="stroke:${c('ambar')}" stroke-width="3" stroke-linecap="round"/></g>
  ${botitoEn('gorra', 0, 96, 360)}`
  return archivoIlustracion('plataforma', 'Simulador en linea: BOTITO celeste junto al simulador, un sensor de distancia y una alarma', W, H, cuerpo, ['gorra'],
    TINTES + CSS_ONDAS + CSS_SIM + `
.il-bip{animation:il-bip 1.2s ease-in-out infinite}
@keyframes il-bip{0%,100%{opacity:.2}50%{opacity:1}}`)
}

function escenaDocentes() {
  const W = 720, H = 500, suelo = 440
  const pizarra = `<g transform="translate(70 0)">
    <path d="M250 440 L280 380 M580 440 L550 380" class="t" fill="none"/>
    <rect x="200" y="80" width="430" height="300" rx="16" style="fill:${c('marco')}" class="t"/>
    <rect x="214" y="94" width="402" height="272" rx="10" style="fill:${c('pizarra')}"/>
    <rect x="238" y="118" width="120" height="16" rx="8" style="fill:${c('tCielo2')}"/>
    <g transform="translate(250 170)">
      <rect x="0" y="16" width="34" height="56" rx="7" fill="#FFC24D" class="t2"/><rect x="10" y="10" width="14" height="7" rx="2" style="fill:${c('trazo')}"/>
      <path d="M17 16 V0 H130 V30 M17 72 V88 H130 V64" fill="none" class="t2"/>
      <path d="M120 54 V42 a10 10 0 0 1 20 0 V54 Z" fill="#ff5a6e" class="t2"/><path d="M118 54 h24" class="t2"/>
      <circle class="il-pzluz fb" cx="130" cy="42" r="20" fill="#ffd54f" fill-opacity=".45"/>
    </g>
    <g class="t2" fill="none">
      <rect x="440" y="160" width="20" height="20" rx="5" style="fill:${c('papel')}"/><path d="M472 170 h110"/>
      <rect x="440" y="208" width="20" height="20" rx="5" style="fill:${c('papel')}"/><path d="M472 218 h90"/>
      <rect x="440" y="256" width="20" height="20" rx="5" style="fill:${c('papel')}"/><path d="M472 266 h100"/>
    </g>
    <path class="il-tic il-tic1" d="M444 170 l5 5 9 -10" fill="none" style="stroke:${c('verde')}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="il-tic il-tic2" d="M444 218 l5 5 9 -10" fill="none" style="stroke:${c('verde')}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="il-tic il-tic3" d="M444 266 l5 5 9 -10" fill="none" style="stroke:${c('verde')}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="238" y="316" width="160" height="12" rx="6" style="fill:${c('gris')}"/><rect x="238" y="336" width="110" height="12" rx="6" style="fill:${c('gris')}"/>
  </g>`
  const cuerpo = `${fondoBlobs(W, H, c('tCielo'), c('tCielo2'))}
  <ellipse cx="${W / 2}" cy="${suelo + 6}" rx="${W * .46}" ry="18" style="fill:${c('suelo')}"/>
  ${pizarra}
  <g transform="translate(572 300) scale(.9)"><rect x="0" y="40" width="110" height="100" rx="10" style="fill:${c('papel')}" class="t"/>
    <rect x="0" y="40" width="110" height="26" rx="10" style="fill:${c('verde')}"/><rect x="0" y="56" width="110" height="10" style="fill:${c('verde')}"/>
    <path d="M24 32 v16 M86 32 v16" class="t" fill="none"/>
    <g style="fill:${c('gris2')}">${[0, 1, 2, 3].map(i => [0, 1].map(j => `<rect x="${12 + i * 24}" y="${78 + j * 26}" width="16" height="16" rx="4"/>`).join('')).join('')}</g>
    <rect x="36" y="104" width="16" height="16" rx="4" fill="#FFC24D"/></g>
  ${botitoEn('profe', -10, 96, 360)}`
  return archivoIlustracion('docentes', 'Formacion y acompanamiento: BOTITO profesor senala la pizarra con la clase del dia', W, H, cuerpo, ['profe'],
    TINTES + `
.il-tic{opacity:0;animation:il-tic 6s ease-out infinite}.il-tic2{animation-delay:1s}.il-tic3{animation-delay:2s}
@keyframes il-tic{0%,8%{opacity:0;transform:scale(.6)}14%,80%{opacity:1;transform:none}90%,100%{opacity:0}}
.il-tic{transform-box:fill-box;transform-origin:30% 60%}
.il-pzluz{animation:il-simluz 2.6s ease-in-out infinite}
@keyframes il-simluz{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
@media (prefers-reduced-motion: reduce){.il-tic{opacity:1}}`)
}

// ── Las cuatro baldosas de niveles (400 x 260, fondo transparente: manda la baldosa) ──
function nivelChispa() {
  const cuerpo = `<ellipse cx="200" cy="246" rx="190" ry="12" style="fill:${c('suelo')}"/>
  ${protoboard(30, 150, 250, 92)}
  ${led(118, 128, '#ff5a6e', 'il-ledn', 1.2)}
  ${resistencia(196, 178)}
  <path d="M50 186 C40 120 90 110 104 160" fill="none" stroke="#ff5a6e" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M240 186 C262 130 300 150 302 196" fill="none" stroke="#3d8bff" stroke-width="4.5" stroke-linecap="round"/>
  ${semaforo(340, 94, 1)}`
  return archivoIlustracion('chispa', 'Nivel Chispa: un LED en la placa de pruebas y un semaforo', 400, 260, cuerpo, [], CSS_SEMAFORO + `
.il-ledn{animation:il-ledn 2s ease-in-out infinite}
@keyframes il-ledn{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}`)
}
function nivelCircuito() {
  const cuerpo = `<ellipse cx="200" cy="246" rx="190" ry="12" style="fill:${c('suelo')}"/>
  ${laptop(190, 92, 180, 126)}
  <g transform="translate(18 150)">${ultrasonico(0, 0, .8)}</g>
  ${ondas(122, 174, 'il-onda')}
  <path d="M60 212 C60 250 130 250 170 228" fill="none" stroke="#3d8bff" stroke-width="3.5" stroke-linecap="round"/>`
  return archivoIlustracion('circuito', 'Nivel Circuito: el sensor de distancia conectado al simulador', 400, 260, cuerpo, [], CSS_ONDAS + CSS_SIM)
}
function nivelRobot() {
  // El seguidor de linea de perfil, sin cara: es el robot que arma el alumno.
  const rueda = (x) => `<g transform="translate(${x} 206)"><circle r="26" style="fill:${c('negro')}" class="t2"/><g class="il-rueda"><circle r="12" style="fill:${c('metal')}"/><path d="M0 -12 V12 M-12 0 H12" style="stroke:${c('metal2')}" stroke-width="3"/></g></g>`
  const cuerpo = `<rect x="0" y="228" width="400" height="22" rx="11" style="fill:${c('suelo')}"/>
  <path d="M0 238 H400" style="stroke:${c('pista')}" stroke-width="10"/>
  <path class="il-tramo" d="M0 238 H400" style="stroke:${c('pistaLinea')}" stroke-width="2" stroke-dasharray="18 22"/>
  <g class="il-carro">
    <rect x="70" y="150" width="250" height="26" rx="10" fill="#bfe6ff" fill-opacity=".85" class="t"/>
    <rect x="96" y="112" width="112" height="40" rx="6" style="fill:${c('pcb')}" class="t2"/>
    <rect x="112" y="120" width="44" height="24" rx="3" style="fill:${c('metal')}"/><rect x="166" y="124" width="30" height="8" rx="2" style="fill:${c('negro')}"/>
    <rect x="218" y="120" width="70" height="32" rx="8" fill="#FFC24D" class="t2"/><path d="M234 128 v16 M250 128 v16 M266 128 v16" stroke="#c98a12" stroke-width="3"/>
    <path d="M320 176 v18 h28 v-10" fill="none" class="t2"/>
    <rect x="322" y="192" width="44" height="12" rx="4" style="fill:${c('pcb2')}" class="t2"/>
    <circle class="il-ir" cx="334" cy="210" r="4" fill="#ff5a6e"/><circle class="il-ir il-ir2" cx="354" cy="210" r="4" fill="#ff5a6e"/>
    ${rueda(120)}${rueda(268)}
    <circle cx="200" cy="120" r="5" class="il-estado" style="fill:${c('verde')}"/>
  </g>`
  return archivoIlustracion('robot', 'Nivel Robot: el seguidor de linea sobre la pista', 400, 260, cuerpo, [], `
.il-carro{animation:il-carro 1.4s ease-in-out infinite}
@keyframes il-carro{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
.il-rueda{animation:il-rueda 1.2s linear infinite}
@keyframes il-rueda{to{transform:rotate(360deg)}}
.il-tramo{animation:il-tramo 1.2s linear infinite}
@keyframes il-tramo{to{transform:translateX(-40px)}}
.il-ir{animation:il-ir 1s ease-in-out infinite}.il-ir2{animation-delay:.5s}
@keyframes il-ir{0%,100%{opacity:.25}50%{opacity:1}}
.il-estado{animation:il-ir 1.6s ease-in-out infinite}`)
}
function nivelIngenieria() {
  const cuerpo = `<ellipse cx="200" cy="246" rx="190" ry="12" style="fill:${c('suelo')}"/>
  <g transform="translate(40 96)">
    <rect x="0" y="0" width="180" height="140" rx="16" style="fill:${c('papel')}" class="t"/>
    <rect x="16" y="16" width="148" height="78" rx="8" style="fill:${c('negro')}"/>
    <path d="M26 76 L50 62 L72 70 L96 44 L120 52 L150 30" fill="none" style="stroke:${c('verde')}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="il-punto fb" cx="150" cy="30" r="6" style="fill:${c('verde')}"/>
    <rect x="16" y="106" width="44" height="20" rx="4" style="fill:${c('pcb')}"/>
    <rect x="70" y="106" width="36" height="20" rx="4" fill="#4fa3ff"/><path d="M76 112 h24 M76 118 h24" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>
    <circle cx="146" cy="116" r="8" fill="#ffc21f"/>
    <path d="M150 0 V-26" class="t2"/>
    <g transform="translate(150 -30)" fill="none" stroke-linecap="round">
      <path class="il-wifi il-wifi1" d="M-10 -6 a14 14 0 0 1 20 0" style="stroke:${c('verde')}" stroke-width="3.5"/>
      <path class="il-wifi il-wifi2" d="M-18 -14 a25 25 0 0 1 36 0" style="stroke:${c('verde')}" stroke-width="3.5"/></g>
  </g>
  <g transform="translate(270 118)">
    <path d="M10 64 H90 L80 122 H20 Z" style="fill:${c('maceta')}" class="t"/>
    <rect x="4" y="56" width="92" height="14" rx="6" style="fill:${c('maceta')}" class="t2"/>
    <g class="il-hoja"><path d="M50 58 V20" class="t2" fill="none"/>
      <path d="M50 34 C30 34 22 18 26 8 C40 8 50 20 50 34 Z" style="fill:${c('planta')}" class="t2"/>
      <path d="M50 26 C66 26 76 12 72 2 C58 2 50 14 50 26 Z" style="fill:${c('planta')}" class="t2"/></g>
    <rect x="62" y="40" width="10" height="40" rx="3" style="fill:${c('pcb')}" class="t2"/>
  </g>
  <path d="M220 200 C240 200 250 170 332 168" fill="none" stroke="#3d8bff" stroke-width="3.5" stroke-linecap="round"/>`
  return archivoIlustracion('ingenieria', 'Nivel Ingenieria: estacion de monitoreo con sensores, pantalla y una planta', 400, 260, cuerpo, [], `
.il-punto{animation:il-punto 1.8s ease-in-out infinite}
@keyframes il-punto{0%,100%{opacity:.4;transform:scale(.7)}50%{opacity:1;transform:scale(1.2)}}
.il-wifi{opacity:.2;animation:il-wifi 2s ease-in-out infinite}.il-wifi2{animation-delay:.4s}
@keyframes il-wifi{0%,100%{opacity:.2}40%{opacity:1}}
.il-hoja{transform-box:fill-box;transform-origin:50% 100%;animation:il-hoja 3.6s ease-in-out infinite}
@keyframes il-hoja{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}`)
}

// ── La portada: tres BOTITOS alrededor de un circuito que se enciende ──
function escenaHero() {
  const W = 640, H = 560
  const cuerpo = `
  <circle cx="330" cy="290" r="232" style="fill:${c('tMenta')}"/>
  <circle cx="330" cy="290" r="170" style="fill:${c('tCrema')}" class="il-latido fb"/>
  <g fill="none" style="stroke:${c('verde')}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".55">
    <path d="M70 120 H150 V70 H230"/><path d="M560 110 H500 V60 H430"/><path d="M40 420 H120 V470"/><path d="M600 400 H540 V470"/></g>
  <g style="fill:${c('verde')}"><circle class="il-nodo fb" cx="230" cy="70" r="7"/><circle class="il-nodo il-nodo2 fb" cx="430" cy="60" r="7"/><circle class="il-nodo il-nodo3 fb" cx="120" cy="470" r="7"/><circle class="il-nodo fb" cx="540" cy="470" r="7"/></g>
  <g class="il-chispa il-ch1"><path d="M120 250 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z" style="fill:${c('ambar')}"/></g>
  <g class="il-chispa il-ch2"><path d="M548 230 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" style="fill:${c('ambar')}"/></g>
  <g class="il-chispa il-ch3"><path d="M470 150 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" style="fill:${c('verde')}"/></g>
  <ellipse cx="330" cy="505" rx="250" ry="18" style="fill:${c('suelo')}"/>
  ${botitoEn('mono', 20, 232, 270)}
  ${botitoEn('capa', 454, 232, 256, 'il-salta')}
  ${botitoEn('foco', 186, 118, 400)}`
  return archivoIlustracion('hero', 'Tres BOTITOS: uno ambar con un LED encendido, uno fresa con moño y uno coral con capa', W, H, cuerpo, ['mono', 'capa', 'foco'],
    TINTES + `
.il-latido{animation:il-latido 5s ease-in-out infinite}
@keyframes il-latido{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
.il-nodo{animation:il-nodo 2.8s ease-in-out infinite}.il-nodo2{animation-delay:.9s}.il-nodo3{animation-delay:1.8s}
@keyframes il-nodo{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.25)}}
.il-chispa{transform-box:fill-box;transform-origin:50% 50%;animation:il-chispa 3.2s ease-in-out infinite}
.il-ch2{animation-delay:1.1s}.il-ch3{animation-delay:2.1s}
@keyframes il-chispa{0%,100%{opacity:0;transform:scale(.4) rotate(0)}40%,60%{opacity:1;transform:scale(1) rotate(45deg)}}
.il-salta{transform-box:fill-box;transform-origin:50% 100%;animation:il-salta 2.6s ease-in-out infinite}
@keyframes il-salta{0%,55%,100%{transform:translateY(0)}70%{transform:translateY(-22px)}85%{transform:translateY(0)}}`)
}

// ══ Escribir ══════════════════════════════════════════════════════════════════
const escribir = (nombre, texto) => {
  const destino = path.join(RAIZ, 'assets', nombre)
  fs.writeFileSync(destino, texto)
  console.log('escrito', path.relative(RAIZ, destino))
}
for (const v of VARIANTES) escribir(`botito-${v.id}.svg`, archivoBotito(v))
escribir('escena-hero.svg', escenaHero())
escribir('escena-material.svg', escenaMaterial())
escribir('escena-plataforma.svg', escenaPlataforma())
escribir('escena-docentes.svg', escenaDocentes())
escribir('nivel-chispa.svg', nivelChispa())
escribir('nivel-circuito.svg', nivelCircuito())
escribir('nivel-robot.svg', nivelRobot())
escribir('nivel-ingenieria.svg', nivelIngenieria())
