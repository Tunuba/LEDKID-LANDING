// Genera el video de fondo del hero (landing/media/hero-loop.mp4).
// Es un plano ambiental del aula, SIN texto: encima va el titular de la página.
// Material de MUESTRA hasta que haya grabación real.
//
//   node landing/scripts/generar-hero-loop.mjs
//
// Todo lo que se mueve usa seno/coseno con periodo divisor de la duración,
// así el último cuadro empalma con el primero y el bucle no salta.

import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { C, led, figura, robot, laptop, placa, mesa, puntos, medidas } from './generar-ilustraciones.mjs'

const require = createRequire(import.meta.url)
const { Resvg } = require(process.env.RESVG_PATH
  || 'C:/Users/Pc/ROBOKIT-SIMULADOR-nuevo/frontend/node_modules/@resvg/resvg-js/index.js')

const MEDIA   = join(process.cwd(), 'landing/media')
const CUADROS = join(process.env.TEMP || '.', 'ledkid-hero-frames')

const W = 1280, H = 720, FPS = 30, DUR = 10

// Mismo criterio que en las ilustraciones: un suelo unico, los pies y las patas
// de la mesa encima de el, y la tapa a la altura de la cadera del alumno.
const SUELO = 700
const S_NINO = .8
const Y_NINO = SUELO - medidas(false, S_NINO).planta
const TAPA   = Y_NINO + medidas(false, S_NINO).cadera
const PATA   = SUELO - TAPA - 18
const TOTAL = DUR * FPS
const TAU = Math.PI * 2

// onda de 0 a 1, con `ciclos` repeticiones dentro del bucle
const onda = (t, ciclos = 1, fase = 0) => (Math.sin(TAU * (t / DUR * ciclos) + fase) + 1) / 2

function cuadro(t) {
  const zoom = 1.02 + 0.035 * onda(t, 1)                   // respiración lenta
  const bobo = 5 * Math.sin(TAU * (t / DUR * 4))            // el robot flota
  const antena = onda(t, 5) > .55 ? 1 : .25                 // parpadeo de la antena
  const ledTablero = .35 + .65 * onda(t, 2.5, Math.PI)      // el LED de la pizarra respira
  const trazo = 340 - 340 * (t / DUR * 2 % 1)               // la corriente recorre el circuito
  const brillo = .18 + .14 * onda(t, 2)

  // Escena OSCURA a propósito: encima va un velo negro y el titular en blanco.
  // Con el fondo crema de las ilustraciones el velo lo dejaba todo beige sucio.
  const NOCHE = '#0B1B2E', NOCHE2 = '#16324E'

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${NOCHE}"/>
  <!-- desplazado a la derecha: el tercio izquierdo queda libre para el titular -->
  <g transform="translate(${W / 2 + 150},${H / 2}) scale(${zoom}) translate(${-W / 2},${-H / 2})">
    <circle cx="1058" cy="104" r="196" fill="${C.ambar}" opacity="${.10 + brillo * .16}"/>
    <circle cx="176"  cy="646" r="234" fill="${NOCHE2}" opacity=".9"/>
    <circle cx="700"  cy="720" r="220" fill="${NOCHE2}" opacity=".55"/>
    ${puntos(96, 96, 3, 5, C.ambar, .5)}
    ${puntos(1040, 470, 4, 4, C.azul2, .35)}

    <!-- pizarra -->
    <g transform="translate(668,214)">
      <rect x="-286" y="-134" width="572" height="268" rx="20" fill="${C.blanco}" stroke="${C.gris}" stroke-width="4"/>
      <rect x="-286" y="-134" width="572" height="52" rx="20" fill="${C.tinta}"/>
      <circle cx="-256" cy="-108" r="7" fill="${C.coral}"/>
      <circle cx="-232" cy="-108" r="7" fill="${C.ambar}"/>
      <circle cx="-208" cy="-108" r="7" fill="${C.turque2}"/>
      <g fill="none" stroke="${C.gris2}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-224,-20 H-120 V54 H-28"/>
      </g>
      <g fill="none" stroke="${C.azul}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"
         stroke-dasharray="86 254" stroke-dashoffset="${trazo}">
        <path d="M-224,-20 H-120 V54 H-28"/>
      </g>
      <rect x="-244" y="-38" width="30" height="30" rx="7" fill="${C.turque}"/>
      <g opacity="${ledTablero}">
        ${led({ x: 6, y: -50, s: .62, color: C.ambar, grosor: 13 })}
        <circle cx="41" cy="-6" r="62" fill="${C.ambar}" opacity="${brillo * .5}"/>
      </g>
      <path d="M132,-32 h116 M132,2 h88 M132,36 h116" stroke="${C.gris}" stroke-width="10" stroke-linecap="round"/>
    </g>

    <!-- alumnos y mesa -->
    ${figura({ x: 440, y: Y_NINO, s: S_NINO, ropa: C.coral, piel: 1, pelo: 1, coleta: true, brazo: 'arriba' })}
    ${figura({ x: 852, y: Y_NINO, s: S_NINO, ropa: C.turque, piel: 2, pelo: 2 })}
    ${mesa({ x: 646, y: TAPA, w: 660, color: '#2C4C6E', pata: PATA })}
    <g transform="translate(0,${bobo})">
      ${robot({ x: 646, y: TAPA - 61 * .9, s: .9 })}
      <circle cx="646" cy="${TAPA - 61 * .9 - 58}" r="14" fill="${C.ambar}" opacity="${antena}"/>
    </g>
    ${laptop({ x: 966, y: TAPA - 70 * .56, s: .56 })}
    ${placa({ x: 370, y: TAPA - 40 * .56, s: .56 })}
  </g>
</svg>`
}

mkdirSync(MEDIA, { recursive: true })
if (existsSync(CUADROS)) rmSync(CUADROS, { recursive: true, force: true })
mkdirSync(CUADROS, { recursive: true })

console.log(`Componiendo ${TOTAL} cuadros del bucle (${DUR}s a ${FPS} fps)…`)
let poster = null
for (let i = 0; i < TOTAL; i++) {
  const png = new Resvg(cuadro(i / FPS)).render().asPng()
  writeFileSync(join(CUADROS, `f${String(i).padStart(4, '0')}.png`), png)
  if (i === 0) poster = png
  if (i % 60 === 0) process.stdout.write(`  ${i}/${TOTAL}\r`)
}
writeFileSync(join(MEDIA, 'hero-poster.png'), poster)

execFileSync('ffmpeg', [
  '-y', '-framerate', String(FPS), '-i', join(CUADROS, 'f%04d.png'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '23',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
  join(MEDIA, 'hero-loop.mp4'),
], { stdio: ['ignore', 'ignore', 'pipe'] })

rmSync(CUADROS, { recursive: true, force: true })
console.log('\n✓ landing/media/hero-loop.mp4 + hero-poster.png')
