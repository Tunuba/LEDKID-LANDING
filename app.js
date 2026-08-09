// app.js -- el JavaScript de la landing de LedKid.
//
// Vive aparte del index.html y no en un <script> en linea A PROPOSITO: el
// backend sirve esta pagina con script-src 'self' y sin 'unsafe-inline', asi
// que un script en linea lo BLOQUEA el navegador y la pagina se queda muerta
// (desplegables, menu de movil, pausa del video, carrusel) sin dar un error
// visible. Abierta desde disco si funcionaba, y por eso no se noto.
//
// Si algun dia hay que volver a meterlo dentro del HTML, hay que tocar antes la
// CSP de backend/internal/middleware -- y eso la debilita para toda la
// plataforma, no solo para esta pagina.

  // ── Menú móvil ──
  const hamb = document.getElementById('hamb');
  const nav  = document.getElementById('nav');
  hamb.addEventListener('click', () => {
    const abierto = nav.classList.toggle('abierto');
    hamb.setAttribute('aria-expanded', String(abierto));
  });

  // ── Desplegables de la cabecera ──
  document.querySelectorAll('.nav .item').forEach(item => {
    const disp = item.querySelector('.disparador');
    disp.addEventListener('click', e => {
      e.stopPropagation();
      const abierto = item.classList.contains('abierto');
      document.querySelectorAll('.nav .item').forEach(i => { i.classList.remove('abierto'); i.querySelector('.disparador').setAttribute('aria-expanded','false'); });
      if (!abierto) { item.classList.add('abierto'); disp.setAttribute('aria-expanded','true'); }
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav .item').forEach(i => { i.classList.remove('abierto'); i.querySelector('.disparador').setAttribute('aria-expanded','false'); });
  });
  nav.addEventListener('click', e => {
    if (e.target.closest('a')) { nav.classList.remove('abierto'); hamb.setAttribute('aria-expanded','false'); }
  });

  // ── Sombra de la cabecera ──
  const cabecera = document.getElementById('cabecera');
  const marcarScroll = () => cabecera.classList.toggle('pegado', window.scrollY > 8);
  marcarScroll();
  addEventListener('scroll', marcarScroll, { passive: true });

  // ── Video del hero ──
  //
  // ⚠️ AQUI VIVIA EL BOTON DE PAUSA, Y SE QUITO EL 2026-08-09 por decision de
  // Meme: *"ese boton quitalo, que se reproduzca en loop siempre"*. El video del
  // hero es DECORADO — un control de pausa sobre un fondo invita a pararlo y deja
  // la portada congelada. El <video> lleva `autoplay muted loop playsinline`, que
  // es todo lo que hace falta; este bloque no tiene ya nada que hacer.
  //
  // Si alguien vuelve a poner el boton, acuerdese de reponer tambien su manejador:
  // sin el, el boton se pinta y no hace nada, que es peor que no tenerlo.

  // ── Video de demostración ──
  const demo = document.getElementById('demo');
  const tapaDemo = document.getElementById('tapaDemo');
  // Los controles nativos solo aparecen al reproducir: con el cartel puesto ensucian
  tapaDemo.addEventListener('click', () => { demo.controls = true; demo.play(); });
  demo.addEventListener('play',  () => { tapaDemo.hidden = true; });
  demo.addEventListener('ended', () => { tapaDemo.hidden = false; demo.controls = false; });

  // ── Carrusel ──
  const pista = document.getElementById('pista');
  const paso = () => pista.querySelector('.baldosa').getBoundingClientRect().width + 24;
  document.getElementById('antes').addEventListener('click', () => pista.scrollBy({ left: -paso(), behavior: 'smooth' }));
  document.getElementById('despues').addEventListener('click', () => pista.scrollBy({ left: paso(), behavior: 'smooth' }));
  const marcarMandos = () => {
    // Si las tres baldosas caben, los mandos no pintan nada
    const desborda = pista.scrollWidth > pista.clientWidth + 4;
    document.querySelector('.mandos').style.display = desborda ? '' : 'none';
    const fin = pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4;
    document.getElementById('antes').classList.toggle('activo', pista.scrollLeft > 4);
    document.getElementById('despues').classList.toggle('activo', !fin);
  };
  addEventListener('resize', marcarMandos);
  pista.addEventListener('scroll', marcarMandos, { passive: true });
  marcarMandos();

  // ── Año ──
  document.getElementById('anio').textContent = new Date().getFullYear();

  // ── Aparición ──
  const objetivos = document.querySelectorAll('.revelar');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    objetivos.forEach(el => el.classList.add('visible'));
  } else {
    const obs = new IntersectionObserver(es => {
      es.forEach((e, i) => { if (!e.isIntersecting) return; setTimeout(() => e.target.classList.add('visible'), i * 55); obs.unobserve(e.target); });
    }, { threshold: .1, rootMargin: '0px 0px -50px' });
    objetivos.forEach(el => obs.observe(el));
  }

  // ── LA CLASE QUE FALTABA ──
  //
  // `.tapa-video` (el boton de play del video de demostracion) es `display:none` y
  // solo se enciende con `.js-vivo`. Nadie ponia esa clase en ningun sitio: el
  // grep de `js-vivo` en todo el proyecto daba UNA aparicion, la del CSS. Con el
  // boton invisible y el <video> sin `controls`, sin `autoplay` y sin `muted`, ese
  // video era literalmente imposible de reproducir. Medido en la pagina servida.
  //
  // Va aqui y no en el HTML a proposito: es una mejora progresiva. Si el
  // JavaScript no llega a correr, el boton sigue escondido — y para ese caso esta
  // el <noscript> del HTML, que le pone los controles nativos al video.
  document.documentElement.classList.add('js-vivo');
