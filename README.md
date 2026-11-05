# Cono Sur Ingeniería · App de terreno

App web (funciona en celular, tablet y computador) con tres pestañas:

1. **Report de bombeo**
2. **Estado de equipos** (checklist con Bueno / Malo / N/A)
3. **AST** · Análisis Seguro de Trabajo

Cada registro se guarda en el dispositivo, lleva folio automático (RB-0001, EE-0001, AST-0001),
firma con el dedo, fotos y se puede **exportar a PDF**. Se puede **instalar como app** en el celular
y funciona sin internet.

> Estado: **prototipo**. Los campos son los típicos de la industria; se ajustarán a los formatos reales de Cono Sur.

## Cómo publicarla gratis (GitHub Pages)

1. En GitHub, entra al repositorio → **Settings** → **Pages**.
2. En *Source* elige **Deploy from a branch**, rama **main**, carpeta **/ (root)** → **Save**.
3. En 1–2 minutos aparece la dirección, algo como
   `https://pablosotomayorp-cmd.github.io/cono-sur-ingenier-a-/`

## Cómo instalarla en el celular

- **Android (Chrome):** abre la dirección → botón **Instalar app** arriba, o menú ⋮ → *Agregar a la pantalla principal*.
- **iPhone (Safari):** abre la dirección → botón Compartir → *Agregar a pantalla de inicio*.

## Cómo cambiar los campos

Todo está en **`js/formularios.js`**. Cada campo es una línea como:

```js
{ id: 'cliente', label: 'Cliente / Constructora', tipo: 'texto', requerido: true },
```

Al inicio del archivo está la lista de tipos (texto, número, fecha, hora, lista, checklist, tabla, firma, fotos…).
Los colores están al inicio de `css/styles.css` y el logo en `icons/logo.svg`.

Si cambias archivos después de publicar, sube el número en `sw.js` (`conosur-v1` → `conosur-v2`) para que los celulares tomen la versión nueva.

## Importante sobre los datos

En este prototipo los registros quedan **guardados solo en el dispositivo** donde se crearon.
Usa el menú ⋮ → **Descargar respaldo** para guardar una copia. Una próxima etapa puede agregar una
base de datos en la nube para que la oficina vea todo lo que se llena en terreno.

## Probarla en el computador

Abre una terminal en esta carpeta y ejecuta `python3 -m http.server`, luego entra a http://localhost:8000
