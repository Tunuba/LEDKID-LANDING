// Genera el video de muestra de la landing (landing/media/ledkid-demo.mp4).
// Es material PROVISIONAL: ocupa el lugar de la grabación real de un aula.
// Cada cuadro se compone como SVG, se rasteriza con resvg y ffmpeg los une.
//
//   node landing/scripts/generar-video.mjs
//
// Requiere ffmpeg en el PATH y @resvg/resvg-js (se toma del SIMULADOR, que ya lo trae).

import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const RESVG = process.env.RESVG_PATH
  || 'C:/Users/Pc/ROBOKIT-SIMULADOR-nuevo/frontend/node_modules/@resvg/resvg-js/index.js'
const { Resvg } = require(RESVG)

const RAIZ    = process.cwd()
const ASSETS  = join(RAIZ, 'landing/assets')
const MEDIA   = join(RAIZ, 'landing/media')
const CUADROS = join(process.env.TEMP || '.', 'ledkid-video-frames')

const W = 1280, H = 720, FPS = 30, DUR = 13          // segundos
const TOTAL = DUR * FPS

const C = {
  crema:  '#FFF3DC', blanco: '#FFFFFF', tinta: '#0F2A47',
  ambar:  '#FFA000', ambar2: '#FFC24D', azul: '#1461D6',
  turque: '#00A88F', gris: '#5B6779', cielo: '#E7F0FD',
}
const FUENTE = "'Segoe UI', 'Segoe UI Semibold', Arial, sans-serif"

// ── Interpolación ──────────────────────────────────────────────────────────
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const suave = t => { const x = clamp(t); return x * x * (3 - 2 * x) }
const tramo = (t, a, b) => suave((t - a) / (b - a))
// Aparece en [a,b] y se va en [c,d]
const ventana = (t, a, b, c, d) => Math.min(tramo(t, a, b), 1 - tramo(t, c, d))

// ── Ilustraciones ya generadas, incrustadas en el lienzo ───────────────────
const cache = new Map()
function ilustracion(nombre) {
  if (!cache.has(nombre)) {
    const bruto = readFileSync(join(ASSETS, nombre + '.svg'), 'utf8')
    const w = Number(bruto.match(/width="(\d+)"/)[1])
    const h = Number(bruto.match(/height="(\d+)"/)[1])
    const interior = bruto.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    cache.set(nombre, { w, h, interior })
  }
  return cache.get(nombre)
}

// Coloca una ilustración con un ancho dado; opcionalmente la recorta a una tarjeta.
function pegar(nombre, { x, y, ancho, recorte = null, id = '' }) {
  const il = ilustracion(nombre)
  const k = ancho / il.w
  const clip = recorte
    ? `<clipPath id="c${id}"><rect x="${x}" y="${y}" width="${recorte.w}" height="${recorte.h}" rx="${recorte.r ?? 22}"/></clipPath>`
    : ''
  return `${clip}<g ${recorte ? `clip-path="url(#c${id})"` : ''}>
    <g transform="translate(${x},${y}) scale(${k})">${il.interior}</g>
  </g>`
}

// ── Logo (trazos vectoriales, sin depender de fuentes) ─────────────────────
const LOGO = readFileSync(join(RAIZ, 'frontend/public/marca/ledkid-horizontal.svg'), 'utf8')
const LOGO_W = 617, LOGO_H = 162
const logo = ({ x, y, ancho, color = '#1A1D26', op = 1 }) => {
  const interior = LOGO
    .replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replaceAll('#1A1D26', color)
  const k = ancho / LOGO_W
  // El viewBox original arranca en -3,-3
  return `<g opacity="${op}" transform="translate(${x},${y}) scale(${k}) translate(3,3)">${interior}</g>`
}

const texto = (t, { x, y, tam = 44, peso = 700, color = C.tinta, op = 1, anchor = 'start', esp = 0 }) =>
  `<text x="${x}" y="${y}" font-family="${FUENTE}" font-size="${tam}" font-weight="${peso}"
         fill="${color}" opacity="${op}" text-anchor="${anchor}" letter-spacing="${esp}">${t}</text>`

// ── Escenas ────────────────────────────────────────────────────────────────

// 1 · Marca
function escenaMarca(t) {
  const op = ventana(t, 0, .55, 2.5, 3.1)
  if (op <= 0) return ''
  const entra = tramo(t, .1, .9)
  const k = 0.94 + 0.06 * entra
  const subeOp = ventana(t, .8, 1.4, 2.5, 3.1)
  return `
    <rect width="${W}" height="${H}" fill="${C.crema}" opacity="${op}"/>
    <circle cx="1128" cy="128" r="180" fill="${C.ambar2}" opacity="${.35 * op}"/>
    <circle cx="150" cy="640" r="200" fill="${C.ambar2}" opacity="${.30 * op}"/>
    <g transform="translate(${W / 2},${H / 2 - 20}) scale(${k}) translate(${-W / 2},${-(H / 2 - 20)})">
      ${logo({ x: W / 2 - 260, y: 268, ancho: 520, op })}
    </g>
    ${texto('ROBÓTICA EDUCATIVA · GUATEMALA', { x: W / 2, y: 468, tam: 24, peso: 700, color: C.gris, op: subeOp, anchor: 'middle', esp: 6 })}`
}

// 2 · El aula
function escenaAula(t) {
  const op = ventana(t, 2.7, 3.3, 6.0, 6.6)
  if (op <= 0) return ''
  const sube = 40 * (1 - tramo(t, 2.9, 4.0))
  const l2 = ventana(t, 3.5, 4.1, 6.0, 6.6)
  return `
    <rect width="${W}" height="${H}" fill="${C.blanco}" opacity="${op}"/>
    <g opacity="${op}" transform="translate(0,${sube})">
      ${texto('Robótica y', { x: 84, y: 268, tam: 58, peso: 700 })}
      ${texto('electrónica en', { x: 84, y: 334, tam: 58, peso: 700 })}
      ${texto('el salón de clases', { x: 84, y: 400, tam: 58, peso: 700, color: C.azul })}
    </g>
    <g opacity="${l2}">
      ${texto('Kits · Plataforma · Docentes', { x: 84, y: 466, tam: 25, peso: 600, color: C.gris })}
      <rect x="84" y="500" width="92" height="7" rx="3.5" fill="${C.ambar}"/>
    </g>
    <g opacity="${op}" transform="translate(0,${sube * .5})">
      ${pegar('hero-aula', { x: 616, y: 128, ancho: 600, recorte: { w: 600, h: 436, r: 30 }, id: 'aula' })}
    </g>`
}

// 3 · Las tres piezas
function escenaPiezas(t) {
  const op = ventana(t, 6.2, 6.8, 9.4, 10.0)
  if (op <= 0) return ''
  const cartas = [
    { n: 'incluye-kit', tit: 'Kits para el salón', sub: 'Material y repuestos incluidos' },
    { n: 'incluye-simulador', tit: 'Simulador en línea', sub: 'Practican sin quemar nada' },
    { n: 'incluye-docente', tit: 'Formación docente', sub: 'Planificación clase por clase' },
  ]
  const anchoC = 348, altoC = 242, sep = 32
  const x0 = (W - (anchoC * 3 + sep * 2)) / 2
  return `
    <rect width="${W}" height="${H}" fill="${C.cielo}" opacity="${op}"/>
    ${texto('Todo llega armado', { x: W / 2, y: 148, tam: 54, peso: 700, color: C.tinta, op, anchor: 'middle' })}
    ${cartas.map((c, i) => {
      const ap = ventana(t, 6.6 + i * .28, 7.3 + i * .28, 9.4, 10.0)
      const dy = 26 * (1 - tramo(t, 6.6 + i * .28, 7.3 + i * .28))
      const x = x0 + i * (anchoC + sep)
      return `<g opacity="${ap}" transform="translate(0,${dy})">
        <rect x="${x}" y="216" width="${anchoC}" height="${altoC + 118}" rx="26" fill="${C.blanco}"/>
        ${pegar(c.n, { x, y: 216, ancho: anchoC, recorte: { w: anchoC, h: altoC, r: 26 }, id: 'p' + i })}
        ${texto(c.tit, { x: x + 26, y: 508, tam: 27, peso: 700, color: C.tinta })}
        ${texto(c.sub, { x: x + 26, y: 546, tam: 20, peso: 500, color: C.gris })}
      </g>`
    }).join('')}`
}

// 4 · Cierre
function escenaCierre(t) {
  const op = tramo(t, 9.6, 10.2)
  if (op <= 0) return ''
  const l2 = tramo(t, 10.4, 11.0)
  const l3 = tramo(t, 10.9, 11.5)
  return `
    <rect width="${W}" height="${H}" fill="${C.tinta}" opacity="${op}"/>
    <circle cx="1140" cy="640" r="220" fill="${C.azul}" opacity="${.28 * op}"/>
    <circle cx="120" cy="90" r="150" fill="${C.ambar}" opacity="${.16 * op}"/>
    ${logo({ x: W / 2 - 230, y: 236, ancho: 460, color: '#FFFFFF', op })}
    ${texto('Agende una presentación en su colegio', { x: W / 2, y: 440, tam: 34, peso: 600, color: '#C9D6E6', op: l2, anchor: 'middle' })}
    <g opacity="${l3}">
      <rect x="${W / 2 - 150}" y="492" width="300" height="66" rx="33" fill="${C.ambar}"/>
      ${texto('ledkid.gt', { x: W / 2, y: 536, tam: 30, peso: 700, color: '#26190A', anchor: 'middle' })}
    </g>`
}

// Sello: esto es material de muestra, que se vea.
const sello = () => `
  <g opacity=".85">
    <rect x="${W - 178}" y="34" width="144" height="40" rx="20" fill="#0F2A47" opacity=".55"/>
    ${texto('MUESTRA', { x: W - 106, y: 61, tam: 18, peso: 700, color: '#FFFFFF', anchor: 'middle', esp: 2.5 })}
  </g>`

const cuadro = t => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.crema}"/>
  ${escenaMarca(t)}
  ${escenaAula(t)}
  ${escenaPiezas(t)}
  ${escenaCierre(t)}
  ${sello()}
</svg>`

// ── Render ─────────────────────────────────────────────────────────────────
mkdirSync(MEDIA, { recursive: true })
if (existsSync(CUADROS)) rmSync(CUADROS, { recursive: true, force: true })
mkdirSync(CUADROS, { recursive: true })

const POSTER_T = 4.6                       // el cuadro que se usa de portada
let posterPng = null

console.log(`Componiendo ${TOTAL} cuadros (${DUR}s a ${FPS} fps)…`)
for (let i = 0; i < TOTAL; i++) {
  const t = i / FPS
  const png = new Resvg(cuadro(t), { font: { loadSystemFonts: true } }).render().asPng()
  writeFileSync(join(CUADROS, `f${String(i).padStart(4, '0')}.png`), png)
  if (posterPng === null && t >= POSTER_T) posterPng = png
  if (i % 60 === 0) process.stdout.write(`  ${i}/${TOTAL}\r`)
}
writeFileSync(join(MEDIA, 'video-poster.png'), posterPng)
console.log(`\n✓ portada  landing/media/video-poster.png`)

const salida = join(MEDIA, 'ledkid-demo.mp4')
execFileSync('ffmpeg', [
  '-y', '-framerate', String(FPS),
  '-i', join(CUADROS, 'f%04d.png'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '21',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  salida,
], { stdio: ['ignore', 'ignore', 'pipe'] })

rmSync(CUADROS, { recursive: true, force: true })
console.log(`✓ video    landing/media/ledkid-demo.mp4`)
