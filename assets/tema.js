// Tema claro u oscuro de la landing.
//
// Arranca en claro (pedido de Meme); el oscuro solo si el visitante lo elige con
// el boton de la barra de arriba. Se guarda en ledkid-landing-tema, una clave
// propia: la app de /app/ arranca en oscuro y su eleccion no cambia la landing.
//
// Va en un archivo aparte y se carga en el <head> SIN defer: fija data-tema antes
// de pintar (sin parpadeo) y la CSP del gateway (script-src 'self') no deja
// correr un script escrito dentro del HTML.
(() => {
  const raiz = document.documentElement;
  let tema = 'claro';
  try { if (localStorage.getItem('ledkid-landing-tema') === 'oscuro') tema = 'oscuro'; } catch (e) {}
  raiz.dataset.tema = tema;

  document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById('boton-tema');
    if (!boton) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    const pintar = () => {
      const o = raiz.dataset.tema === 'oscuro';
      boton.querySelector('.tema-txt').textContent = o ? 'Claro' : 'Oscuro';
      boton.setAttribute('aria-label', o ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      if (meta) meta.setAttribute('content', o ? '#0e1426' : '#FFFFFF');
    };
    boton.addEventListener('click', () => {
      raiz.dataset.tema = raiz.dataset.tema === 'oscuro' ? 'claro' : 'oscuro';
      try { localStorage.setItem('ledkid-landing-tema', raiz.dataset.tema); } catch (e) {}
      pintar();
    });
    pintar();
  });
})();
