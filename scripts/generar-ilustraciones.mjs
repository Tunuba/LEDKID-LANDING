// Genera las ilustraciones de la landing de LedKid.
// Son de MUESTRA: ocupan el lugar de las fotos reales del aula mientras no las haya.
// Vectoriales y planas, sin dependencias ni fuentes instaladas.
//
//   node landing/scripts/generar-ilustraciones.mjs landing/assets

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = process.argv[2] || 'landing/assets'

// ── Paleta ─────────────────────────────────────────────────────────────────
export const C = {
  ambar:   '#FFA000',
  ambar2:  '#FFC24D',
  crema:   '#FFF3DC',
  azul:    '#1461D6',
  azul2:   '#4A8BEE',
  tinta:   '#0F2A47',
  cielo:   '#E7F0FD',
  turque:  '#00A88F',
  turque2: '#7FD9CB',
  menta:   '#E4F7F3',
  coral:   '#FF6B57',
  coral2:  '#FFD9D3',
  gris:    '#D8DFE9',
  gris2:   '#EEF2F7',
  blanco:  '#FFFFFF',
  negro:   '#12202F',
}

const PIELES = ['#F0C9A4', '#D9A273', '#B57A4E', '#F6DCC0']
const PELOS  = ['#2C2320', '#4A2F1C', '#12202F', '#6B4423']

// ── Piezas reutilizables ───────────────────────────────────────────────────

// LED del logo, en contorno. Su caja propia es 101 x 156.
export const LED_CUERPO = 'M5,105 V65 Q5,0 50,0 Q95,0 95,65 V105 Q95,115 85,115 H15 Q5,115 5,105 Z'
export const led = ({ x = 0, y = 0, s = 1, color = C.ambar, grosor = 11 }) => `
  <g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${grosor}">
    <path d="${LED_CUERPO}" stroke-linejoin="round"/>
    <path d="M5,117 H95" stroke-linecap="round"/>
    <path d="M28,124 V145 M72,124 V145" stroke-linecap="round"/>
  </g>`

// ── Construcción del cuerpo ────────────────────────────────────────────────
// El canon se cuenta en CABEZAS desde la coronilla, que es como se mide una
// figura humana: un adulto son 7.5 cabezas y un niño de 6-10 años son 6.
// Antes la figura medía 2.5 cabezas y NO tenía piernas —el torso se cortaba en
// el aire—, y por eso se leía como un muñeco y no como una persona.
//
// La cabeza del ADULTO es más grande en absoluto que la del niño (unos 23 cm
// contra 19.5), aunque pese menos dentro de la figura: lo que hace adulto a un
// adulto es el NÚMERO de cabezas, no encogerle el cráneo. Por eso k > 1 en el
// adulto; antes era 0.82 y salía un adulto más bajo que un niño.
export const CANON = {
  // anchoHombro / anchoCadera son MEDIOS anchos, en alturas de cabeza. El canon
  // de dibujo se enuncia en anchos de cabeza (=0.72 de su alto): un adulto mide
  // 2 cabezas de hombro a hombro y 1.6 de cadera; en un niño los hombros pesan
  // menos, 1.8 y 1.55. De ahí salen estos 0.74/0.58 y 0.66/0.56.
  nino:   { k: 1,    alto: 6,   hombro: 1.35, cintura: 2.70, cadera: 3.20, rodilla: 4.50, anchoHombro: 0.66, anchoCadera: 0.56, pantalonLargo: false },
  adulto: { k: 1.18, alto: 7.5, hombro: 1.45, cintura: 3.00, cadera: 3.75, rodilla: 5.60, anchoHombro: 0.74, anchoCadera: 0.58, pantalonLargo: true },
}

// Cotas de una figura ya multiplicadas por su escala. `planta` es lo que hay que
// hacer coincidir con el suelo de la escena: sin este dato las figuras flotan.
export const medidas = (adulto = false, s = 1) => {
  const c = adulto ? CANON.adulto : CANON.nino
  const H = 62 * c.k
  return {
    cabeza: H * s,
    total: H * c.alto * s,
    razon: c.alto,
    coronilla: (-H / 2) * s,
    cadera: (-H / 2 + H * c.cadera) * s,   // para apoyar mesas y pupitres
    planta: (-H / 2 + H * c.alto) * s,
  }
}

// El cráneo suelto. Existe para poder MEDIR la razón cabeza/cuerpo con píxeles
// en vez de estimarla a ojo.
export const cabezaSola = ({ x = 0, y = 0, s = 1, piel = 0, adulto = false }) =>
  `<g transform="translate(${x},${y}) scale(${s * (adulto ? CANON.adulto.k : CANON.nino.k)})">
    <circle cx="0" cy="0" r="31" fill="${PIELES[piel]}"/>
  </g>`

// FIGURA: el alumno (o el docente) de frente. Es un ROBOT de la familia BOTITO.
//
// ⚠️ AQUI HABIA UN NInO DIBUJADO PLANO y se cambio el 2026-08-26. Meme: *"esos
// personas y demas de fondo se ven demasiado IA... reemplazalos por robots o
// algo"*. Y no era solo gusto: aquellas figuras —tono de piel liso, pelo de una
// sola forma, dos puntos por ojos y un arco por boca— son el molde exacto de
// cualquier banco de ilustraciones, y en una pagina cuyo pie ya admite que las
// ilustraciones son "material de muestra" eran lo que la hacia parecer una
// plantilla. Un robot no tiene tono de piel que acertar ni cara humana que caiga
// en el valle inquietante, y ademas ES la marca: BOTITO es el personaje que el
// nino ve dentro del simulador y el que narra el video de ventas.
//
// SE CONSERVA EL CANON ENTERO (`CANON`, `medidas`) y la firma de la funcion: el
// robot mide lo mismo que media el nino, apoya la planta en el mismo sitio y su
// cadera cae a la misma altura, asi que las mesas, los pupitres y los suelos de
// todas las escenas siguen cuadrando sin tocar una sola coordenada. Los
// parametros `piel` y `pelo` se ACEPTAN Y SE IGNORAN a proposito, para no tener
// que reescribir las siete llamadas.
//
// El origen es el CENTRO DE LA CABEZA; la planta queda en `medidas(adulto,s).planta`.
export const figura = ({ x = 0, y = 0, s = 1, ropa = C.azul, pantalon = C.tinta, piel = 0, pelo = 0, coleta = false, brazo = 'abajo', adulto = false, sombra = true }) => {
  const c = adulto ? CANON.adulto : CANON.nino
  const k = c.k
  const H = 62 * k                 // alto de la cabeza: el modulo de todo
  const r = 31 * k
  const en = (n) => -r + n * H

  const yHombro  = en(c.hombro)
  const yCintura = en(c.cintura)
  const yCadera  = en(c.cadera)
  const yRodilla = en(c.rodilla)
  const ySuelo   = en(c.alto)
  const hx = H * c.anchoHombro
  const cx = H * c.anchoCadera

  // PIERNAS: dos barras rectas con pie. Un robot no tiene rodilla de carne, pero
  // la articulacion se marca igual —un tubo recto de la cadera al suelo se lee
  // como un palo— asi que se dibuja un disco en `yRodilla`.
  const px = cx * 0.62
  // Mas gruesas que en la figura humana a proposito: un robot de barras finas se
  // lee como una arana. Con 0.42/0.38 el personaje sale rechoncho y amigable,
  // que es la lectura que se busca en una pagina para colegios.
  const gMuslo = H * 0.42, gCanilla = H * 0.38
  const hPie = H * 0.15, aPie = H * 0.46
  const yTobillo = ySuelo - hPie
  const pierna = (lado) => {
    const xr = lado * px * 1.02, xt = lado * px * 0.94
    return `
    <path d="M${lado * px},${yCadera - H * 0.04} L${xr},${yRodilla}" stroke="${pantalon}" stroke-width="${gMuslo}" stroke-linecap="round"/>
    <circle cx="${xr}" cy="${yRodilla}" r="${gMuslo * 0.46}" fill="${pantalon}"/>
    <path d="M${xr},${yRodilla} L${xt},${yTobillo}" stroke="${pantalon}" stroke-width="${gCanilla}" stroke-linecap="round"/>
    <rect x="${xt - aPie * 0.44}" y="${yTobillo}" width="${aPie}" height="${hPie}" rx="${hPie * 0.45}" fill="${C.tinta}"/>`
  }

  // BRAZOS: el MISMO esqueleto que tenia la figura humana (hombro -> codo ->
  // mano, con el codo a la altura de la cintura y la mano a media altura del
  // muslo). Levantar el brazo no lo alarga: cambia el angulo, no la longitud.
  const ax = hx
  const yArt = yHombro + H * 0.05
  const gBrazo = H * 0.30, rMano = H * 0.19
  const yMano = (yCadera + yRodilla) / 2 - rMano
  const Lu = yCintura - yArt
  const Lf = yMano - yCintura
  const bIzq = brazo === 'arriba'
    ? (() => {
        const codo = [-ax - Lu * 0.55, yArt - Lu * 0.835]
        return { codo, mano: [codo[0] - Lf * 0.20, codo[1] - Lf * 0.98] }
      })()
    : { codo: [-(hx + H * 0.03), yCintura], mano: [-(hx + H * 0.01), yMano] }
  const bDer = { codo: [hx + H * 0.03, yCintura], mano: [hx + H * 0.01, yMano] }
  const brazoSvg = (b, lado) => `
    <path d="M${lado * ax},${yArt} L${b.codo[0]},${b.codo[1]} L${b.mano[0]},${b.mano[1]}"
          fill="none" stroke="${ropa}" stroke-width="${gBrazo}" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${b.mano[0]}" cy="${b.mano[1]}" r="${rMano}" fill="${ropa}"/>`

  // TORSO: caja redondeada con su panel de pecho y tres luces. Las luces son las
  // mismas tres que BOTITO lleva en el simulador.
  // El torso se ensancha un 16% sobre el ancho de hombros del canon: la caja de
  // un robot no se estrecha en la cintura como un cuerpo, y con el ancho justo
  // salia larguirucho al lado de una cabeza cuadrada.
  const tw = hx * 2.32, th = yCadera - yHombro + H * 0.10
  const panelW = tw * 0.62, panelH = th * 0.40
  const luz = (i, col) => `<circle cx="${(-1 + i) * panelW * 0.24}" cy="${yHombro + th * 0.40}" r="${H * 0.075}" fill="${col}"/>`

  return `
  <g transform="translate(${x},${y}) scale(${s})">
    ${sombra ? `<ellipse cx="0" cy="${ySuelo}" rx="${H * 0.66}" ry="${H * 0.13}" fill="${C.tinta}" opacity=".12"/>` : ''}
    ${pierna(-1)}${pierna(1)}
    ${brazoSvg(bIzq, -1)}${brazoSvg(bDer, 1)}
    <rect x="${-H * 0.11}" y="${r * 0.62}" width="${H * 0.22}" height="${yHombro - r * 0.62 + H * 0.10}" rx="${H * 0.08}" fill="${C.tinta}"/>
    <rect x="${-tw / 2}" y="${yHombro}" width="${tw}" height="${th}" rx="${H * 0.34}" fill="${ropa}"/>
    <rect x="${-panelW / 2}" y="${yHombro + th * 0.20}" width="${panelW}" height="${panelH}" rx="${H * 0.13}" fill="${C.negro}"/>
    ${luz(0, C.coral)}${luz(1, C.turque)}${luz(2, C.ambar)}
    <g transform="scale(${k})">
      <rect x="-33" y="-30" width="66" height="58" rx="19" fill="${C.tinta}"/>
      <rect x="-24" y="-21" width="48" height="35" rx="13" fill="${C.negro}"/>
      <circle cx="-11" cy="-3" r="7.5" fill="${C.turque}"/>
      <circle cx="11"  cy="-3" r="7.5" fill="${C.turque}"/>
      <circle cx="-8.5" cy="-5.5" r="2.4" fill="${C.blanco}"/>
      <circle cx="13.5" cy="-5.5" r="2.4" fill="${C.blanco}"/>
      ${coleta ? `<rect x="-41" y="-10" width="8" height="19" rx="4" fill="${ropa}"/><rect x="33" y="-10" width="8" height="19" rx="4" fill="${ropa}"/>` : ''}
      <path d="M0,-30 L0,-45" stroke="${C.tinta}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="0" cy="-50" r="7" fill="${C.turque}"/>
      <circle cx="0" cy="-50" r="12" fill="${C.turque}" opacity=".22"/>
    </g>
  </g>`
}

// Robot de dos ruedas visto de frente.
export const robot = ({ x = 0, y = 0, s = 1, cuerpo = C.azul }) => `
  <g transform="translate(${x},${y}) scale(${s})">
    <path d="M0,-52 V-30" stroke="${C.tinta}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="0" cy="-58" r="8" fill="${C.ambar}"/>
    <rect x="-58" y="-32" width="116" height="72" rx="18" fill="${cuerpo}"/>
    <rect x="-40" y="-18" width="80" height="34" rx="12" fill="${C.blanco}"/>
    <circle cx="-20" cy="0" r="8.5" fill="${C.tinta}"/>
    <circle cx="20"  cy="0" r="8.5" fill="${C.tinta}"/>
    <circle cx="-17" cy="-3" r="3" fill="${C.blanco}"/>
    <circle cx="23"  cy="-3" r="3" fill="${C.blanco}"/>
    <rect x="-16" y="24" width="32" height="7" rx="3.5" fill="${C.tinta}" opacity=".35"/>
    <circle cx="-52" cy="44" r="17" fill="${C.tinta}"/>
    <circle cx="52"  cy="44" r="17" fill="${C.tinta}"/>
    <circle cx="-52" cy="44" r="6"  fill="${C.gris}"/>
    <circle cx="52"  cy="44" r="6"  fill="${C.gris}"/>
  </g>`

// Laptop abierta, con un circuito dibujado en la pantalla.
export const laptop = ({ x = 0, y = 0, s = 1 }) => `
  <g transform="translate(${x},${y}) scale(${s})">
    <rect x="-96" y="-72" width="192" height="122" rx="10" fill="${C.tinta}"/>
    <rect x="-86" y="-62" width="172" height="102" rx="5" fill="${C.cielo}"/>
    <g fill="none" stroke="${C.azul}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M-64,-38 H-30 V0 H4"/>
      <path d="M-64,18 H-20 V-20"/>
    </g>
    <rect x="-72" y="-46" width="16" height="16" rx="3" fill="${C.ambar}"/>
    <circle cx="20" cy="0" r="13" fill="none" stroke="${C.ambar}" stroke-width="5"/>
    <rect x="40" y="-30" width="34" height="46" rx="5" fill="${C.turque}"/>
    <path d="M-108,50 H108 l14,20 H-122 z" fill="${C.gris}"/>
    <rect x="-26" y="56" width="52" height="7" rx="3.5" fill="${C.blanco}" opacity=".8"/>
  </g>`

// Placa de pruebas con un LED y su resistencia.
export const placa = ({ x = 0, y = 0, s = 1 }) => `
  <g transform="translate(${x},${y}) scale(${s})">
    <rect x="-90" y="-40" width="180" height="80" rx="10" fill="${C.gris2}" stroke="${C.gris}" stroke-width="3"/>
    ${Array.from({ length: 9 }, (_, i) =>
      Array.from({ length: 4 }, (_, j) =>
        `<circle cx="${-72 + i * 18}" cy="${-24 + j * 16}" r="2.6" fill="${C.gris}"/>`).join('')).join('')}
    <path d="M-54,-8 H-18" stroke="${C.coral}" stroke-width="5" stroke-linecap="round"/>
    <rect x="-14" y="-16" width="34" height="16" rx="8" fill="${C.ambar2}"/>
    <path d="M24,-8 H54" stroke="${C.azul}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="60" cy="-8" r="11" fill="${C.ambar}"/>
    <circle cx="60" cy="-8" r="19" fill="none" stroke="${C.ambar}" stroke-width="3" opacity=".45"/>
  </g>`

// Mesa de trabajo. `y` es la TAPA y `pata` el largo de las patas: la mesa apoya
// en y + 18 + pata, y ese numero tiene que ser el suelo de la escena. La tapa de
// una mesa de aula le llega a la cadera al que esta de pie, no al muslo.
export const mesa = ({ x = 0, y = 0, w = 420, color = C.gris, pata = 86 }) => `
  <g transform="translate(${x},${y})">
    <rect x="${-w / 2}" y="0" width="${w}" height="18" rx="9" fill="${color}"/>
    <rect x="${-w / 2 + 30}" y="18" width="16" height="${pata}" rx="8" fill="${color}" opacity=".75"/>
    <rect x="${w / 2 - 46}"  y="18" width="16" height="${pata}" rx="8" fill="${color}" opacity=".75"/>
  </g>`

// Adornos de fondo: puntos y arcos.
export const puntos = (x, y, filas, cols, color = C.ambar, op = .35) =>
  `<g fill="${color}" opacity="${op}">` +
  Array.from({ length: filas }, (_, f) =>
    Array.from({ length: cols }, (_, c) =>
      `<circle cx="${x + c * 20}" cy="${y + f * 20}" r="3.4"/>`).join('')).join('') + '</g>'

export const svg = (w, h, cuerpo, fondo = C.blanco) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <rect width="${w}" height="${h}" fill="${fondo}"/>
${cuerpo}
</svg>
`

// ═══════════════════════════════════════════════════════════════════════════
// 1 · Portada: el aula
// ═══════════════════════════════════════════════════════════════════════════
// El AULA tiene un suelo y una mesa, y todo lo que hay dentro se apoya en uno o
// en otra. Las patas de la mesa terminan en SUELO y los pies de los niños
// también: sin una cota compartida las figuras flotan aunque estén bien hechas.
const SUELO_AULA = 572     // donde acaban las patas de la mesa y los pies
const S_NINO_AULA = 0.76   // los dos alumnos tienen la MISMA edad → la misma escala
const Y_NINO_AULA = SUELO_AULA - medidas(false, S_NINO_AULA).planta
// La tapa a la altura de la cadera del alumno, que es donde cae una mesa de aula.
// Antes quedaba en 468, o sea a media pierna, y parecia una mesa de juguete.
const MESA_AULA  = Y_NINO_AULA + medidas(false, S_NINO_AULA).cadera
const PATA_AULA  = SUELO_AULA - MESA_AULA - 18

const heroAula = svg(880, 640, `
  <circle cx="742" cy="118" r="150" fill="${C.ambar2}" opacity=".32"/>
  <circle cx="118" cy="536" r="196" fill="${C.ambar2}" opacity=".42"/>
  ${puntos(56, 70, 3, 5, C.ambar, .5)}
  ${puntos(700, 470, 4, 4, C.azul, .22)}

  <!-- pizarra -->
  <g transform="translate(440,168)">
    <rect x="-230" y="-108" width="460" height="216" rx="18" fill="${C.blanco}" stroke="${C.gris}" stroke-width="4"/>
    <rect x="-230" y="-108" width="460" height="46" rx="18" fill="${C.tinta}"/>
    <circle cx="-204" cy="-85" r="6" fill="${C.coral}"/>
    <circle cx="-184" cy="-85" r="6" fill="${C.ambar}"/>
    <circle cx="-164" cy="-85" r="6" fill="${C.turque2}"/>
    <g fill="none" stroke="${C.azul}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M-180,-16 H-96 V44 H-20"/>
      <path d="M-180,44 H-140"/>
    </g>
    <rect x="-196" y="-32" width="26" height="26" rx="6" fill="${C.turque}"/>
    ${led({ x: 8, y: -40, s: .52, color: C.ambar, grosor: 13 })}
    <path d="M104,-26 h96 M104,4 h72 M104,34 h96" stroke="${C.gris}" stroke-width="9" stroke-linecap="round"/>
  </g>

  <!-- alumnos y mesa. Los niños están DE PIE detrás de la mesa: la tapa les tapa
       la cadera y las canillas se ven entre la tapa y el suelo. -->
  ${figura({ x: 268, y: Y_NINO_AULA, s: S_NINO_AULA, ropa: C.coral, piel: 1, pelo: 1, coleta: true, brazo: 'arriba' })}
  ${figura({ x: 580, y: Y_NINO_AULA, s: S_NINO_AULA, ropa: C.turque, piel: 2, pelo: 2 })}
  ${mesa({ x: 440, y: MESA_AULA, w: 560, pata: PATA_AULA })}
  <!-- lo de encima de la mesa apoya en MESA_AULA, no a media altura -->
  ${robot({ x: 440, y: MESA_AULA - 61 * .82, s: .82 })}
  ${laptop({ x: 690, y: MESA_AULA - 70 * .52, s: .52 })}
  ${placa({ x: 208, y: MESA_AULA - 40 * .52, s: .52 })}
`, C.crema)

// ═══════════════════════════════════════════════════════════════════════════
// 2 · Niveles
// ═══════════════════════════════════════════════════════════════════════════
// El pie del semáforo marca el suelo de la escena: el niño pisa esa misma cota.
const SUELO_N1 = 424
const S_N1 = .92

const nivel1 = svg(660, 480, `
  <circle cx="556" cy="96" r="118" fill="${C.ambar2}" opacity=".3"/>
  ${puntos(30, 36, 3, 3, C.ambar, .45)}
  <!-- semáforo -->
  <g transform="translate(456,232)">
    <rect x="-56" y="-142" width="112" height="238" rx="26" fill="${C.tinta}"/>
    <circle cx="0" cy="-92" r="30" fill="${C.coral}"/>
    <circle cx="0" cy="-16" r="30" fill="${C.ambar}"/>
    <circle cx="0" cy="60"  r="30" fill="${C.turque}" opacity=".35"/>
    <rect x="-14" y="96" width="28" height="96" rx="10" fill="${C.tinta}"/>
    <path d="M74,-92 a34,34 0 0 1 0,0" fill="none"/>
    <g stroke="${C.ambar}" stroke-width="6" stroke-linecap="round" opacity=".65">
      <path d="M46,-40 h22"/><path d="M46,-16 h30"/><path d="M46,8 h22"/>
    </g>
  </g>
  ${figura({ x: 178, y: SUELO_N1 - medidas(false, S_N1).planta, s: S_N1, ropa: C.azul, piel: 0, pelo: 0, brazo: 'arriba' })}
  ${placa({ x: 300, y: SUELO_N1 - 40 * .68, s: .68 })}
`, C.crema)

// Aquí no había ningún objeto que marcara el suelo, así que se fija uno y todo
// lo que se apoya (niño y portátil) comparte esa cota.
const SUELO_N2 = 440
const S_N2 = .92

const nivel2 = svg(660, 480, `
  <circle cx="120" cy="108" r="132" fill="${C.azul2}" opacity=".22"/>
  ${puntos(500, 60, 3, 4, C.azul, .3)}
  <!-- sensor y ondas -->
  <g transform="translate(438,214)">
    <rect x="-78" y="-52" width="156" height="104" rx="20" fill="${C.tinta}"/>
    <circle cx="-30" cy="0" r="27" fill="${C.gris2}"/><circle cx="-30" cy="0" r="14" fill="${C.azul}"/>
    <circle cx="30"  cy="0" r="27" fill="${C.gris2}"/><circle cx="30"  cy="0" r="14" fill="${C.azul}"/>
    <g fill="none" stroke="${C.ambar}" stroke-width="7" stroke-linecap="round">
      <path d="M96,-30 a44,44 0 0 1 0,60"/>
      <path d="M124,-52 a76,76 0 0 1 0,104" opacity=".6"/>
    </g>
  </g>
  <!-- campana. Movida a la derecha: el niño ya no es un torso, ocupa alto y ancho -->
  <g transform="translate(300,158)">
    <path d="M0,-58 a44,44 0 0 1 44,44 v34 l14,20 H-58 l14,-20 v-34 a44,44 0 0 1 44,-44 z" fill="${C.ambar}"/>
    <circle cx="0" cy="-62" r="9" fill="${C.tinta}"/>
    <path d="M-13,50 a13,13 0 0 0 26,0" fill="${C.tinta}"/>
  </g>
  ${figura({ x: 150, y: SUELO_N2 - medidas(false, S_N2).planta, s: S_N2, ropa: C.turque, piel: 3, pelo: 3, coleta: true })}
  ${laptop({ x: 470, y: SUELO_N2 - 70 * .58, s: .58 })}
`, C.cielo)

// La pista ES el suelo. La curva vale y≈320 en x=300 y y≈393 en x=546 (calculado
// sobre las dos bézier del trazo), y su grosor es 26: la cara de arriba está 13
// por encima del eje. El robot apoya las ruedas en el eje y el niño pisa la cara.
const PISTA_N3 = 'M40,404 C170,404 150,318 268,318 S420,404 560,392'
const S_N3 = .72

const nivel3 = svg(660, 480, `
  <circle cx="110" cy="120" r="130" fill="${C.turque2}" opacity=".38"/>
  ${puntos(408, 56, 3, 3, C.turque, .35)}
  <path d="M40,404 C170,404 150,318 268,318 S420,404 560,392"
        fill="none" stroke="${C.tinta}" stroke-width="26" stroke-linecap="round" opacity=".9"/>
  <path d="M40,404 C170,404 150,318 268,318 S420,404 560,392"
        fill="none" stroke="${C.blanco}" stroke-width="5" stroke-dasharray="18 20" stroke-linecap="round"/>
  ${robot({ x: 300, y: 320 - 61 * 1.15, s: 1.15, cuerpo: C.azul })}
  ${figura({ x: 546, y: 380 - medidas(false, S_N3).planta, s: S_N3, ropa: C.coral, piel: 2, pelo: 1, brazo: 'arriba' })}
  <g transform="translate(120,196)">
    <rect x="-64" y="-56" width="128" height="112" rx="16" fill="${C.blanco}" opacity=".92"/>
    <path d="M-40,-24 h40 M-40,0 h64 M-40,24 h30" stroke="${C.tinta}" stroke-width="7" stroke-linecap="round" opacity=".8"/>
    <circle cx="34" cy="-24" r="10" fill="${C.turque}"/>
  </g>
`, C.menta)

// ═══════════════════════════════════════════════════════════════════════════
// 3 · Qué incluye
// ═══════════════════════════════════════════════════════════════════════════
const incluyeKit = svg(720, 500, `
  ${puntos(566, 54, 3, 4, C.ambar, .4)}
  <g transform="translate(360,262)">
    <rect x="-268" y="-166" width="536" height="332" rx="26" fill="${C.blanco}" stroke="${C.gris}" stroke-width="5"/>
    <rect x="-268" y="-166" width="536" height="332" rx="26" fill="none" stroke="${C.ambar}" stroke-width="5" opacity=".5"/>
    <!-- compartimentos -->
    <rect x="-244" y="-142" width="248" height="132" rx="14" fill="${C.gris2}"/>
    <rect x="20"   y="-142" width="224" height="132" rx="14" fill="${C.gris2}"/>
    <rect x="-244" y="6"    width="160" height="136" rx="14" fill="${C.gris2}"/>
    <rect x="-68"  y="6"    width="152" height="136" rx="14" fill="${C.gris2}"/>
    <rect x="100"  y="6"    width="144" height="136" rx="14" fill="${C.gris2}"/>

    <!-- microcontrolador -->
    <g transform="translate(-120,-76)">
      <rect x="-86" y="-42" width="172" height="84" rx="10" fill="${C.turque}"/>
      <rect x="-46" y="-20" width="66" height="40" rx="6" fill="${C.tinta}"/>
      <g fill="${C.ambar}">
        ${Array.from({ length: 9 }, (_, i) => `<rect x="${-80 + i * 18}" y="-40" width="9" height="10" rx="2"/>`).join('')}
        ${Array.from({ length: 9 }, (_, i) => `<rect x="${-80 + i * 18}" y="30" width="9" height="10" rx="2"/>`).join('')}
      </g>
      <circle cx="52" cy="22" r="7" fill="${C.coral}"/>
    </g>

    <!-- cables -->
    <g transform="translate(132,-76)" fill="none" stroke-width="9" stroke-linecap="round">
      <path d="M-80,-24 C-30,-64 30,16 80,-24" stroke="${C.coral}"/>
      <path d="M-80,4   C-30,-36 30,44 80,4"   stroke="${C.azul}"/>
      <path d="M-80,32  C-30,-8  30,72 80,32"  stroke="${C.ambar}"/>
    </g>

    <!-- LEDs -->
    <g transform="translate(-164,74)">
      ${led({ x: -76, y: -46, s: .42, color: C.coral, grosor: 13 })}
      ${led({ x: -14, y: -46, s: .42, color: C.ambar, grosor: 13 })}
      ${led({ x: 48,  y: -46, s: .42, color: C.turque, grosor: 13 })}
    </g>

    <!-- sensor y motor -->
    <g transform="translate(8,74)">
      <rect x="-58" y="-34" width="116" height="68" rx="14" fill="${C.tinta}"/>
      <circle cx="-22" cy="0" r="18" fill="${C.gris2}"/><circle cx="-22" cy="0" r="9" fill="${C.azul}"/>
      <circle cx="22"  cy="0" r="18" fill="${C.gris2}"/><circle cx="22"  cy="0" r="9" fill="${C.azul}"/>
    </g>
    <g transform="translate(172,74)">
      <rect x="-46" y="-26" width="70" height="52" rx="12" fill="${C.gris}"/>
      <rect x="24" y="-8" width="26" height="16" rx="6" fill="${C.tinta}"/>
      <circle cx="-56" cy="0" r="24" fill="${C.tinta}"/>
      <circle cx="-56" cy="0" r="9"  fill="${C.gris}"/>
    </g>
  </g>
`, C.crema)

const incluyeSimulador = svg(720, 500, `
  <circle cx="608" cy="102" r="120" fill="${C.azul2}" opacity=".2"/>
  ${puntos(58, 400, 3, 4, C.azul, .25)}
  ${laptop({ x: 348, y: 244, s: 1.42 })}
  <g transform="translate(566,142)">
    <circle cx="0" cy="0" r="46" fill="${C.ambar}"/>
    <path d="M-13,-19 L20,0 -13,19 z" fill="${C.blanco}"/>
  </g>
  <g transform="translate(150,352)">
    <rect x="-70" y="-30" width="140" height="60" rx="30" fill="${C.blanco}"/>
    <circle cx="-38" cy="0" r="12" fill="${C.turque}"/>
    <path d="M-14,-8 h56 M-14,10 h34" stroke="${C.gris}" stroke-width="8" stroke-linecap="round"/>
  </g>
`, C.cielo)

// La docente mide 7.5 cabezas: con la mano en alto necesita 651 de alto por cada
// unidad de escala, y el lienzo son 500. De ahí que S_DOC sea .68 y no 1.25.
const SUELO_DOC = 470
const S_DOC = .68

const incluyeDocente = svg(720, 500, `
  <circle cx="112" cy="112" r="126" fill="${C.turque2}" opacity=".34"/>
  ${puntos(546, 388, 3, 4, C.turque, .3)}
  <g transform="translate(452,206)">
    <rect x="-190" y="-136" width="380" height="272" rx="20" fill="${C.blanco}" stroke="${C.gris}" stroke-width="5"/>
    <rect x="-190" y="-136" width="380" height="44" rx="20" fill="${C.turque}"/>
    <path d="M-150,-52 h150 M-150,-14 h230 M-150,24 h190 M-150,62 h120"
          stroke="${C.gris}" stroke-width="12" stroke-linecap="round"/>
    <g transform="translate(126,44)">
      <circle cx="0" cy="0" r="34" fill="${C.turque}"/>
      <path d="M-15,2 L-4,14 16,-12" fill="none" stroke="${C.blanco}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
  ${figura({ x: 168, y: SUELO_DOC - medidas(true, S_DOC).planta, s: S_DOC, ropa: C.azul, piel: 1, pelo: 0, brazo: 'arriba', adulto: true })}
`, C.menta)

// ═══════════════════════════════════════════════════════════════════════════
// 4 · Producto por nivel, sin fondo: se apoyan sobre el color de la baldosa
//     y se salen por abajo, como una foto de producto recortada.
// ═══════════════════════════════════════════════════════════════════════════
const sinFondo = (w, h, cuerpo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
${cuerpo}
</svg>
`

const producto1 = sinFondo(520, 420, `
  <g transform="translate(372,150)">
    <rect x="-52" y="-124" width="104" height="216" rx="24" fill="${C.tinta}"/>
    <circle cx="0" cy="-76" r="27" fill="${C.coral}"/>
    <circle cx="0" cy="-4"  r="27" fill="${C.ambar}"/>
    <circle cx="0" cy="68"  r="27" fill="${C.turque}" opacity=".3"/>
    <rect x="-13" y="92" width="26" height="120" rx="9" fill="${C.tinta}"/>
  </g>
  <!-- las tres piezas comparten la línea del pie del semáforo (362): antes cada
       una flotaba a una altura distinta y se leía como un collage -->
  ${placa({ x: 196, y: 362 - 40 * 1.15, s: 1.15 })}
  ${led({ x: 16, y: 362 - 145 * .62, s: .62, color: C.ambar, grosor: 12 })}
`)

const producto2 = sinFondo(520, 420, `
  ${laptop({ x: 316, y: 236, s: 1.18 })}
  <g transform="translate(158,196)">
    <rect x="-70" y="-46" width="140" height="92" rx="18" fill="${C.tinta}"/>
    <circle cx="-27" cy="0" r="24" fill="${C.gris2}"/><circle cx="-27" cy="0" r="12" fill="${C.azul}"/>
    <circle cx="27"  cy="0" r="24" fill="${C.gris2}"/><circle cx="27"  cy="0" r="12" fill="${C.azul}"/>
    <g fill="none" stroke="${C.ambar}" stroke-width="7" stroke-linecap="round">
      <path d="M-88,-26 a38,38 0 0 0 0,52"/>
      <path d="M-114,-46 a66,66 0 0 0 0,92" opacity=".55"/>
    </g>
  </g>
`)

const producto3 = sinFondo(520, 420, `
  <path d="M-20,376 C120,376 110,286 250,286 S420,376 546,362"
        fill="none" stroke="${C.tinta}" stroke-width="30" stroke-linecap="round" opacity=".92"/>
  <path d="M-20,376 C120,376 110,286 250,286 S420,376 546,362"
        fill="none" stroke="${C.blanco}" stroke-width="6" stroke-dasharray="20 22" stroke-linecap="round"/>
  <!-- la pista vale y≈286 en x=262; las ruedas apoyan ahí, antes se hundían 31 -->
  ${robot({ x: 262, y: 286 - 61 * 1.5, s: 1.5 })}
`)

// ═══════════════════════════════════════════════════════════════════════════
const salidas = {
  'producto-1.svg':       producto1,
  'producto-2.svg':       producto2,
  'producto-3.svg':       producto3,
  'hero-aula.svg':        heroAula,
  'nivel-1.svg':          nivel1,
  'nivel-2.svg':          nivel2,
  'nivel-3.svg':          nivel3,
  'incluye-kit.svg':      incluyeKit,
  'incluye-simulador.svg': incluyeSimulador,
  'incluye-docente.svg':  incluyeDocente,
}

// Solo escribe cuando se ejecuta directo: el generador del video importa las piezas.
if (process.argv[1] && process.argv[1].endsWith('generar-ilustraciones.mjs')) {
  mkdirSync(OUT, { recursive: true })
  for (const [nombre, contenido] of Object.entries(salidas)) {
    writeFileSync(join(OUT, nombre), contenido, 'utf8')
    console.log('✓', join(OUT, nombre))
  }
  console.log(`\n${Object.keys(salidas).length} ilustraciones de muestra en ${OUT}`)
}
