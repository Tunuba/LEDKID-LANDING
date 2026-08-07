# LEDKID-LANDING

La página pública de LEDKID. Un solo `index.html`, sin build, sin dependencias
y sin red: el favicon y el logotipo son SVG en línea, así que el archivo se abre
igual desde disco que servido.

Es deliberadamente mínima. Lo que hay que enseñar hoy es el nombre y qué es
LEDKID; el producto vive en los otros repos.

## Ver

Doble clic a `index.html`, o cualquier servidor estático:

```powershell
python -m http.server 8090
```

## Publicar

Al ser un HTML suelto sirve GitHub Pages sin configuración: en Settings → Pages,
rama `main`, carpeta `/ (root)`.

## La marca

- `LED` en ámbar `#FFAD00`, `KID` en el color del texto. El corte de dos tonos es
  el mismo que usan el logotipo, los videos y la tarjeta final de cada uno.
- El foquito es la misma geometría que el `favicon.svg` de las tres apps.

Si cambias la marca aquí, cámbiala también en `LEDKID-SIMULADOR/frontend/public/`
(logo y favicon) y en los guiones de `LEDKID-MARKETING`.
