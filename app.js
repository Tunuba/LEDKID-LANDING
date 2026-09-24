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

  // ── EL FORMULARIO, QUE AHORA SI ENVIA ──
  //
  // Era `<form action="mailto:...">`, y eso no manda nada a ningun servidor:
  // intenta abrir el cliente de correo del visitante. En un movil, o en un equipo
  // sin cliente configurado -o sea, casi cualquier director-, no ocurre NADA. Se
  // rellenaba, se pulsaba, no salia ningun error, y la solicitud se perdia. Es el
  // peor modo de fallo posible en la unica pantalla que convierte visitas en
  // clientes: silencioso por los dos lados.
  //
  // Ahora hace POST a /api/contacto, que sale por el mismo SMTP que ya manda las
  // verificaciones de cuenta.
  //
  // ⚠️ La landing se sirve bajo /landing/ dentro del gateway 8081, asi que la ruta
  // tiene que ser ABSOLUTA (/api/contacto). Relativa resolveria a
  // /landing/api/contacto, que no existe, y volveriamos a perder solicitudes en
  // silencio — el mismo fallo con otra cara.
  const form = document.getElementById('formContacto');
  const aviso = document.getElementById('respuestaContacto');
  if (form && aviso) {
    const decir = (texto, ok) => {
      aviso.textContent = texto;
      aviso.className = 'respuesta-form ' + (ok ? 'ok' : 'mal');
      aviso.hidden = false;
    };
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const boton = form.querySelector('button[type=submit]');
      const antes = boton.textContent;
      boton.disabled = true;
      boton.textContent = 'Enviando…';
      const d = new FormData(form);
      try {
        const r = await fetch('/api/contacto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            colegio: d.get('colegio') || '',
            contacto: d.get('nombre') || '',
            email: d.get('correo') || '',
            telefono: d.get('telefono') || '',
            alumnos: d.get('alumnos') || '',
            mensaje: d.get('mensaje') || '',
            web: d.get('web') || '',
          }),
        });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) {
          form.reset();
          decir('Recibido. Le contactamos para coordinar la reunión.', true);
        } else {
          // Se le da SIEMPRE una salida que no depende de nosotros. Si el correo
          // falla, que al menos sepa por donde escribir.
          decir((j.error || 'No pudimos enviar su solicitud.') +
                ' Escríbanos por WhatsApp al +502 5754 5388.', false);
        }
      } catch (_) {
        decir('No hay conexión con el servidor. Escríbanos por WhatsApp al +502 5754 5388.', false);
      } finally {
        boton.disabled = false;
        boton.textContent = antes;
      }
    });
  }

// ── La familia de BOTITO: que saluden ──
//
// Los SVG de assets/botito-*.svg ya se mueven solos dentro del <img> (flotan,
// parpadean y saludan cada tanto). Pero a un <img> no le llega nada de la pagina,
// asi que para que saluden AL PASAR EL RATON, al tocarlos o al entrar en pantalla
// se meten en linea y se les pone la clase .saluda un momento. Si el fetch falla,
// se quedan como <img> y la pagina no pierde nada. connect-src 'self' lo permite.
(function () {
  const lista = document.querySelector('.familia-lista');
  if (!lista || !('fetch' in window) || !('DOMParser' in window)) return;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const saludar = (svg) => {
    if (quieto || !svg || svg.classList.contains('saluda')) return;
    svg.classList.add('saluda');
    setTimeout(() => svg.classList.remove('saluda'), 1600);
  };

  const meterEnLinea = (img) => fetch(img.getAttribute('src'))
    .then(r => (r.ok ? r.text() : Promise.reject(r.status)))
    .then(txt => {
      const svg = new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement;
      if (!svg || svg.nodeName.toLowerCase() !== 'svg') return;
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', img.alt);
      svg.setAttribute('focusable', 'false');
      img.replaceWith(document.importNode(svg, true));
    })
    .catch(() => {});

  const tarjetas = [...lista.querySelectorAll('.botito-card')];
  Promise.all(tarjetas.map(t => { const img = t.querySelector('img.botito-var'); return img ? meterEnLinea(img) : null; }))
    .then(() => {
      tarjetas.forEach(t => {
        const svg = () => t.querySelector('svg');
        t.addEventListener('pointerenter', () => saludar(svg()));
        t.addEventListener('click', () => saludar(svg()));
      });
      if (quieto || !('IntersectionObserver' in window)) return;
      // Al entrar en pantalla saludan en ola, una vez.
      const obs = new IntersectionObserver(es => {
        if (!es.some(e => e.isIntersecting)) return;
        obs.disconnect();
        tarjetas.forEach((t, i) => setTimeout(() => saludar(t.querySelector('svg')), 450 + i * 160));
      }, { threshold: .35 });
      obs.observe(lista);
    });
})();

// ── Todo LedKid y las tres mini demos (ronda 2, r2-landing-panel) ──
//
// 1. Los iconos de las tarjetas y las escenas de las demos se animan en bucle.
//    Fuera de pantalla se pausan (clase .anim-dormida), porque las maquinas de
//    colegio son lentas. Sin este script se animan siempre, que tambien vale.
// 2. La pregunta de la leccion se contesta de verdad: la buena cierra el cable y
//    enciende el LED, la mala tiembla y da una pista, sin reganar.
// 3. La nota sube al entrar en pantalla y otra vez al pulsar el boton.
(function () {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hayIO = 'IntersectionObserver' in window;

  // 1. Pausar lo que no se ve
  const vivas = [document.getElementById('ecosistema'), document.getElementById('pruebalo')].filter(Boolean);
  if (hayIO) {
    vivas.forEach(el => el.classList.add('anim-dormida'));
    const obs = new IntersectionObserver(es => {
      es.forEach(e => e.target.classList.toggle('anim-dormida', !e.isIntersecting));
    }, { rootMargin: '80px 0px' });
    vivas.forEach(el => obs.observe(el));
  }

  // 2. La pregunta
  const preg = document.getElementById('demoPregunta');
  const otra = document.getElementById('qOtra');
  if (preg) {
    const aviso = preg.querySelector('.q-aviso');
    const ops = [...preg.querySelectorAll('.q-op')];
    ops.forEach(op => op.addEventListener('click', () => {
      if (preg.classList.contains('ok')) return;
      if (op.dataset.ok) {
        preg.classList.add('ok');
        op.classList.add('gol');
        ops.forEach(o => { o.disabled = true; });
        aviso.textContent = 'Eso es. Con el cable unido, la corriente llega y el LED enciende.';
        if (otra) otra.hidden = false;
      } else {
        op.classList.remove('mal');
        void op.offsetWidth;
        op.classList.add('mal');
        op.disabled = true;
        aviso.textContent = 'Casi. Mira el cable de arriba, está cortado.';
      }
    }));
    if (otra) otra.addEventListener('click', () => {
      preg.classList.remove('ok');
      ops.forEach(o => { o.disabled = false; o.classList.remove('gol', 'mal'); });
      aviso.textContent = '';
      otra.hidden = true;
      ops[0].focus();
    });
  }

  // 3. La nota que sube
  const nota = document.getElementById('demoNota');
  const notaOtra = document.getElementById('notaOtra');
  if (nota) {
    const subir = () => {
      nota.classList.add('sin-trans');
      nota.classList.remove('juega');
      void nota.offsetWidth;
      nota.classList.remove('sin-trans');
      requestAnimationFrame(() => requestAnimationFrame(() => nota.classList.add('juega')));
    };
    if (quieto || !hayIO) nota.classList.add('juega');
    else {
      const obs = new IntersectionObserver(es => {
        if (!es.some(e => e.isIntersecting)) return;
        obs.disconnect();
        setTimeout(subir, 250);
      }, { threshold: .5 });
      obs.observe(nota);
    }
    if (notaOtra) notaOtra.addEventListener('click', subir);
  }
})();

// ── Portada y paneles (ronda 3, r3-landing) ──
//
// Meme: "hay demasiado en una sola pagina". La portada se queda con lo esencial y
// el resto vive en paneles (.panel[data-panel]) que se abren desde el menu. Todo
// va por el ANCLA de la URL: cada boton es un <a href="#algo"> normal, asi que
// se puede enlazar un panel, el boton de atras funciona y, sin este script, la
// pagina sigue entera como antes (nada se oculta si no corre).
//
// Regla: el ancla apunta a un elemento. Si esta dentro de un panel, se abre ese
// panel; si no (o si es #inicio o no hay ancla), se ve la portada. Si el ancla es
// el panel o su primera seccion, se sube al principio; si es una seccion de mas
// abajo (#preguntas, #pruebalo), se baja hasta ella. El foco va al titulo del
// panel para que el teclado y el lector de pantalla sigan donde se abrio.
(function () {
  const portada = document.getElementById('portada');
  const paneles = [...document.querySelectorAll('.panel[data-panel]')];
  const barra = document.getElementById('panelBarra');
  if (!portada || !paneles.length) return;
  document.documentElement.classList.add('js-paneles');
  const enlaces = [...document.querySelectorAll('[data-panel-enl]')];
  const altoCabecera = () => {
    const cab = document.getElementById('cabecera');
    return (cab ? cab.getBoundingClientRect().height : 0) + (barra && !barra.hidden ? barra.getBoundingClientRect().height : 0);
  };

  let primera = true;
  const mostrar = (conFoco) => {
    const id = decodeURIComponent(location.hash.slice(1));
    const destino = id ? document.getElementById(id) : null;
    const panel = destino ? destino.closest('.panel[data-panel]') : null;
    const vista = panel || portada;

    portada.hidden = !!panel;
    paneles.forEach(p => { p.hidden = p !== panel; });
    if (barra) barra.hidden = !panel;
    const clave = panel ? panel.dataset.panel : '';
    enlaces.forEach(a => {
      if (a.dataset.panelEnl === clave) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    // El carrusel y lo que mide su tamaño necesitan saber que ya se ven
    dispatchEvent(new Event('resize'));

    const alPrincipio = !destino || destino === vista || id === 'inicio' ||
      (panel && destino === panel.querySelector('section'));
    const irA = () => {
      if (alPrincipio) scrollTo({ top: 0, behavior: 'auto' });
      else scrollTo({ top: destino.getBoundingClientRect().top + scrollY - altoCabecera() - 8, behavior: 'auto' });
    };
    irA();
    // Las imagenes perezosas del panel recien abierto cambian las alturas: se
    // vuelve a apuntar una vez cuando ya han entrado.
    if (!alPrincipio) setTimeout(irA, 350);

    if (conFoco && panel) {
      const t = (alPrincipio ? panel.querySelector('.panel-titulo') : destino.querySelector('h2, h3')) || panel;
      if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    }
    // En la portada, al volver, el foco va al principio del contenido
    if (conFoco && !panel && !primera) {
      const h1 = portada.querySelector('h1');
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    }
    primera = false;
  };

  addEventListener('hashchange', () => mostrar(true));
  // Pulsar el ancla que ya esta en la URL no dispara hashchange: se repite a mano.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (a.getAttribute('href') === location.hash || (a.getAttribute('href') === '#inicio' && !location.hash)) {
      e.preventDefault(); mostrar(true);
    }
    // El menu de telefono se cierra al elegir (la casilla sin JS tambien)
    const casilla = document.getElementById('menu-movil');
    if (casilla && a.closest('#nav')) casilla.checked = false;
  });
  // Con paneles, el salto entre vistas es instantaneo: un desplazamiento suave
  // desde el fondo de un panel largo hasta arriba del siguiente marea.
  document.documentElement.style.scrollBehavior = 'auto';
  mostrar(false);
})();
