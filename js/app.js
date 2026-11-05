/* Cono Sur · lógica de la app. Los campos se configuran en js/formularios.js */
(() => {
  'use strict';

  const F = window.FORMULARIOS;
  const EMPRESA = window.EMPRESA || {};
  const TABS = Object.keys(F);
  const KEY = 'conosur.registros.v1';
  const KEY_BORRADOR = 'conosur.borrador.';

  /* ---------------- utilidades ---------------- */
  const $ = (s, el = document) => el.querySelector(s);
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'value' || k === 'checked') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat(9)) {
      if (k == null || k === false) continue;
      el.append(k.nodeType ? k : document.createTextNode(String(k)));
    }
    return el;
  }
  const svg = (paths) => h('span', { html: `<svg viewBox="0 0 24 24">${paths}</svg>` }).firstChild;
  const ICON = {
    bomba: '<path d="M3 17h11V9H8l-5 5z"/><circle cx="6.5" cy="18.5" r="1.8"/><circle cx="12" cy="18.5" r="1.8"/><path d="M14 13h3l3 4h-6M10 9l4-5 7 3"/>',
    equipo: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 3v2h6V3M8 10l2 2 4-4M8 16h8"/>',
    casco: '<path d="M3 17h18M5 17a7 7 0 0 1 14 0M10 10V6h4v4"/><path d="M4 17v2h16v-2"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    pdf: '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
    copia: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    basura: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
    atras: '<path d="M15 18l-6-6 6-6"/>',
    camara: '<path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="3.5"/>',
    guardar: '<path d="M5 3h11l4 4v14H5z"/><path d="M8 3v5h7M8 21v-7h8v7"/>',
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const hoy = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  const ahora = () => new Date().toTimeString().slice(0, 5);
  const fechaCL = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}-${m}-${y}`; };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isNaN(n) ? 0 : n; };
  const fmtNum = (n) => (Math.round(n * 100) / 100).toLocaleString('es-CL');
  function duracion(a, b) {
    if (!a || !b) return '';
    const [ah, am] = a.split(':').map(Number), [bh, bm] = b.split(':').map(Number);
    let min = bh * 60 + bm - (ah * 60 + am);
    if (min < 0) min += 1440; // pasó la medianoche
    return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`;
  }
  let toastT;
  function toast(msg, tipo) {
    const t = $('#toast'); t.textContent = msg; t.className = 'toast ' + (tipo || ''); t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2800);
  }
  function todosLosCampos(cfg) { return cfg.secciones.flatMap((s) => s.campos); }

  /* ---------------- datos ---------------- */
  let db = cargar();
  function cargar() {
    try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.registros) return d; } catch (e) { /* vacío */ }
    return { registros: {}, contadores: {} };
  }
  function guardarDB() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
    catch (e) { toast('No queda espacio en el teléfono. Descarga un respaldo y borra registros antiguos.', 'error'); return false; }
  }
  const lista = (tab) => (db.registros[tab] ||= []);
  function nuevoFolio(tab) {
    const n = (db.contadores[tab] || 0) + 1; db.contadores[tab] = n;
    return `${F[tab].prefijo}-${String(n).padStart(4, '0')}`;
  }
  function datosIniciales(cfg) {
    const d = {};
    for (const c of todosLosCampos(cfg)) {
      if (c.def === 'hoy') d[c.id] = hoy();
      else if (c.def === 'ahora') d[c.id] = ahora();
      else if (c.def != null) d[c.id] = c.def;
      if (c.tipo === 'tabla') d[c.id] = [{}];
    }
    return d;
  }

  /* ---------------- navegación (#/pestaña/registro) ---------------- */
  let edit = null; // { tab, id, datos }
  function ruta() {
    const [tab, id] = location.hash.replace(/^#\/?/, '').split('/');
    return { tab: TABS.includes(tab) ? tab : TABS[0], id };
  }
  const ir = (hash) => { location.hash = hash; };

  function render() {
    const { tab, id } = ruta();
    renderTabs(tab);
    const main = $('#main'); main.innerHTML = '';
    if (id) {
      const reg = id === 'nuevo' ? null : lista(tab).find((r) => r.id === id);
      if (id !== 'nuevo' && !reg) { ir('#/' + tab); return; }
      main.append(vistaForm(tab, reg));
    } else {
      edit = null;
      main.append(vistaLista(tab));
    }
    window.scrollTo(0, 0);
  }

  function renderTabs(actual) {
    const nav = $('#tabs'); nav.innerHTML = '';
    for (const t of TABS) {
      nav.append(h('a', { class: 'tab', href: '#/' + t, role: 'tab', 'aria-selected': String(t === actual) },
        svg(ICON[F[t].icono] || ICON.equipo), h('span', {}, F[t].corto), h('span', { class: 'count' }, lista(t).length)));
    }
  }

  /* ---------------- vista: lista ---------------- */
  function claseInsignia(v) {
    if (!v) return '';
    if (/fuera|malo|no$/i.test(v)) return 'bad';
    if (/observ/i.test(v)) return 'warn';
    return 'ok';
  }

  function vistaLista(tab) {
    const cfg = F[tab];
    const regs = [...lista(tab)].sort((a, b) => (b.datos.fecha || '').localeCompare(a.datos.fecha || '') || b.creado - a.creado);
    const mes = hoy().slice(0, 7);
    const delMes = regs.filter((r) => (r.datos.fecha || '').startsWith(mes));
    const wrap = h('div');

    wrap.append(h('div', { class: 'page-head' },
      h('div', {}, h('h1', {}, cfg.titulo), h('p', {}, 'Registros guardados en este dispositivo')),
      h('a', { class: 'btn btn-primary', href: `#/${tab}/nuevo` }, svg(ICON.mas), 'Nuevo')));

    let tercero;
    if (cfg.destacado) {
      tercero = [fmtNum(delMes.reduce((s, r) => s + num(r.datos[cfg.destacado]), 0)) + ' ' + (cfg.unidad || ''), `${cfg.unidad || ''} este mes`];
    } else if (cfg.insignia) {
      const malos = regs.filter((r) => claseInsignia(r.datos[cfg.insignia]) === 'bad').length;
      tercero = [malos, 'con problemas'];
    } else {
      tercero = [regs.filter((r) => r.datos.fecha === hoy()).length, 'hoy'];
    }
    wrap.append(h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('b', {}, regs.length), h('span', {}, 'total')),
      h('div', { class: 'stat' }, h('b', {}, delMes.length), h('span', {}, 'este mes')),
      h('div', { class: 'stat' }, h('b', {}, tercero[0]), h('span', {}, tercero[1]))));

    if (!regs.length) {
      wrap.append(h('div', { class: 'vacio' }, svg(ICON[cfg.icono]), h('h3', {}, 'Aún no hay registros'),
        h('p', {}, `Toca "Nuevo" para crear el primer ${cfg.corto.toLowerCase() === 'ast' ? 'AST' : 'registro'}.`)));
      return wrap;
    }

    const buscador = h('input', { class: 'search', type: 'search', placeholder: 'Buscar por folio, cliente, obra, equipo…' });
    const cont = h('div', { class: 'lista' });
    const pintar = () => {
      const q = buscador.value.trim().toLowerCase();
      cont.innerHTML = '';
      const filtrados = regs.filter((r) => !q || (r.folio + ' ' + JSON.stringify(r.datos).replace(/data:[^"]+/g, '')).toLowerCase().includes(q));
      for (const r of filtrados) cont.append(tarjeta(tab, r));
      if (!filtrados.length) cont.append(h('div', { class: 'vacio' }, h('p', {}, 'Sin resultados.')));
    };
    buscador.addEventListener('input', pintar);
    wrap.append(buscador, cont);
    pintar();
    return wrap;
  }

  function tarjeta(tab, r) {
    const cfg = F[tab];
    const ins = cfg.insignia ? r.datos[cfg.insignia] : null;
    const cls = claseInsignia(ins);
    const sub = (cfg.resumen || []).map((k) => r.datos[k]).filter(Boolean).join(' · ') || '—';
    const stop = (fn) => (e) => { e.stopPropagation(); fn(); };
    return h('div', { class: 'reg ' + cls, onclick: () => ir(`#/${tab}/${r.id}`) },
      h('div', { class: 'reg-top' }, h('span', { class: 'folio' }, r.folio), h('span', { class: 'fecha' }, fechaCL(r.datos.fecha)),
        ins ? h('span', { class: 'badge ' + cls }, ins) : null),
      h('div', { class: 'reg-sub' }, sub),
      cfg.destacado ? h('div', { class: 'reg-big' }, h('b', {}, fmtNum(num(r.datos[cfg.destacado]))), h('span', {}, cfg.unidad)) : null,
      h('div', { class: 'reg-acc' },
        h('button', { class: 'btn btn-sm', onclick: stop(() => imprimir(tab, r)) }, svg(ICON.pdf), 'PDF'),
        h('button', { class: 'btn btn-sm', onclick: stop(() => duplicar(tab, r)) }, svg(ICON.copia), 'Duplicar'),
        h('button', { class: 'btn btn-sm btn-danger', onclick: stop(() => eliminar(tab, r)) }, svg(ICON.basura), 'Eliminar')));
  }

  function duplicar(tab, r) {
    const cfg = F[tab];
    const datos = JSON.parse(JSON.stringify(r.datos));
    // no se copian firmas ni fotos, y la fecha queda en hoy
    for (const c of todosLosCampos(cfg)) {
      if (c.tipo === 'firma' || c.tipo === 'fotos') delete datos[c.id];
      if (c.tipo === 'tabla') (datos[c.id] || []).forEach((f) => c.columnas.forEach((col) => col.tipo === 'firma' && delete f[col.id]));
      if (c.def === 'hoy') datos[c.id] = hoy();
    }
    localStorage.setItem(KEY_BORRADOR + tab, JSON.stringify(datos));
    ir(`#/${tab}/nuevo`);
    toast('Copia creada: revisa los datos y firma de nuevo');
  }

  function eliminar(tab, r) {
    if (!confirm(`¿Eliminar ${r.folio}? Esta acción no se puede deshacer.`)) return;
    db.registros[tab] = lista(tab).filter((x) => x.id !== r.id);
    guardarDB(); render(); toast(`${r.folio} eliminado`);
  }

  /* ---------------- vista: formulario ---------------- */
  let borradorT;
  function borrarBorrador(tab) { clearTimeout(borradorT); localStorage.removeItem(KEY_BORRADOR + tab); }
  function cambio(delUsuario = true) {
    if (!edit) return;
    document.querySelectorAll('[data-calc]').forEach((el) => {
      const c = todosLosCampos(F[edit.tab]).find((x) => x.id === el.dataset.calc);
      const v = duracion(edit.datos[c.desde], edit.datos[c.hasta]);
      edit.datos[c.id] = v; el.textContent = v || '—';
    });
    if (!edit.id && delUsuario) {
      const { tab, datos } = edit;
      clearTimeout(borradorT);
      borradorT = setTimeout(() => { try { localStorage.setItem(KEY_BORRADOR + tab, JSON.stringify(datos)); } catch (e) { /* sin espacio */ } }, 400);
    }
  }

  function vistaForm(tab, reg) {
    const cfg = F[tab];
    let datos, recuperado = false;
    if (reg) datos = JSON.parse(JSON.stringify(reg.datos));
    else {
      try { datos = JSON.parse(localStorage.getItem(KEY_BORRADOR + tab)); } catch (e) { datos = null; }
      recuperado = !!datos;
      datos ||= datosIniciales(cfg);
    }
    edit = { tab, id: reg?.id || null, datos };

    const wrap = h('form', { novalidate: true, onsubmit: (e) => { e.preventDefault(); guardar(); } });
    wrap.append(h('div', { class: 'form-head' },
      h('a', { class: 'icon-btn', href: '#/' + tab, 'aria-label': 'Volver' }, svg(ICON.atras)),
      h('div', {}, h('h1', {}, cfg.titulo), h('span', { class: 'muted' }, reg ? `${reg.folio} · editando` : 'Nuevo registro'))));

    if (recuperado) {
      const av = h('div', { class: 'aviso' }, h('span', {}, 'Se recuperó un borrador sin guardar.'),
        h('button', { type: 'button', class: 'btn btn-sm', onclick: () => { borrarBorrador(tab); render(); } }, 'Empezar de cero'));
      wrap.append(av);
    }

    cfg.secciones.forEach((sec, i) => {
      wrap.append(h('section', { class: 'seccion' },
        h('h2', {}, h('span', { class: 'num' }, i + 1), sec.titulo),
        h('div', { class: 'grid' }, sec.campos.map((c) => campo(c, datos)))));
    });

    wrap.append(h('div', { class: 'form-foot' },
      h('a', { class: 'btn', href: '#/' + tab, onclick: () => { if (!reg) borrarBorrador(tab); } }, 'Cancelar'),
      reg ? h('button', { type: 'button', class: 'btn btn-dark', onclick: () => imprimir(tab, { ...reg, datos: edit.datos }) }, svg(ICON.pdf), 'PDF') : null,
      h('button', { type: 'submit', class: 'btn btn-primary' }, svg(ICON.guardar), 'Guardar')));

    setTimeout(() => cambio(false), 0);
    return wrap;
  }

  const ANCHO_COMPLETO = new Set(['parrafo', 'checklist', 'tabla', 'casillas', 'fotos', 'firma']);

  function campo(c, datos) {
    const full = ANCHO_COMPLETO.has(c.tipo) || c.ancho === 'completo';
    const box = h('div', { class: 'campo' + (full ? ' full' : ''), 'data-campo': c.id });
    const set = (v) => { datos[c.id] = v; box.classList.remove('error'); cambio(); };
    if (c.tipo === 'tabla' && !(Array.isArray(datos[c.id]) && datos[c.id].length)) datos[c.id] = [{}];
    const label = h('label', { for: 'f_' + c.id }, c.label, c.requerido ? h('span', { class: 'req' }, ' *') : null);
    box.append(label);
    box.append(control(c, datos[c.id], set, 'f_' + c.id));
    return box;
  }

  // crea el control de entrada de un campo (también usado en columnas de tabla)
  function control(c, valor, set, idAttr) {
    const tipos = { texto: 'text', numero: 'text', fecha: 'date', hora: 'time' };
    switch (c.tipo) {
      case 'texto': case 'numero': case 'fecha': case 'hora':
        return h('input', {
          class: 'inp', id: idAttr, type: tipos[c.tipo], value: valor ?? '', placeholder: c.ayuda || '',
          inputmode: c.tipo === 'numero' ? 'decimal' : null, autocomplete: 'off',
          oninput: (e) => set(e.target.value),
        });
      case 'parrafo':
        return h('textarea', { class: 'inp', id: idAttr, placeholder: c.ayuda || '', value: valor ?? '', oninput: (e) => set(e.target.value) });
      case 'lista':
        return h('select', { class: 'inp', id: idAttr, onchange: (e) => set(e.target.value) },
          h('option', { value: '' }, 'Seleccionar…'),
          c.opciones.map((o) => { const op = h('option', { value: o }, o); if (o === valor) op.selected = true; return op; }));
      case 'opcion':
        return segmentado(c.opciones, valor, set);
      case 'casillas': {
        const sel = new Set(valor || []);
        return h('div', { class: 'chips' }, c.opciones.map((o) => h('label', { class: 'chip' },
          h('input', { type: 'checkbox', checked: sel.has(o), onchange: (e) => { e.target.checked ? sel.add(o) : sel.delete(o); set([...sel]); } }), o)));
      }
      case 'checklist': return checklist(c, valor, set);
      case 'tabla': return tabla(c, valor, set);
      case 'duracion': return h('div', { class: 'calc', 'data-calc': c.id }, valor || '—');
      case 'firma': return cajaFirma(c.label, valor, set);
      case 'fotos': return fotos(valor, set);
      default: return h('div', {}, `Tipo de campo desconocido: ${c.tipo}`);
    }
  }

  function segmentado(opciones, valor, set) {
    const seg = h('div', { class: 'seg' });
    let actual = valor;
    for (const o of opciones) {
      seg.append(h('button', {
        type: 'button', 'data-v': o, class: o === actual ? 'on' : '',
        onclick: (e) => {
          actual = actual === o ? '' : o; // tocar de nuevo desmarca
          seg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.v === actual));
          set(actual);
        },
      }, o));
    }
    return seg;
  }

  function checklist(c, valor, set) {
    const v = valor || {};
    const opciones = c.opciones || ['Bueno', 'Malo', 'N/A'];
    const cont = h('div', { class: 'chk' });
    const filas = [];
    cont.append(h('div', { class: 'chk-head' },
      h('button', { type: 'button', class: 'btn btn-sm', onclick: () => { c.items.forEach((it) => { v[it] = { ...(v[it] || {}), v: opciones[0] }; }); set(v); repintar(); } },
        `Marcar todo "${opciones[0]}"`)));
    const repintar = () => filas.forEach((f) => f.remove()) || pintarFilas();
    function pintarFilas() {
      filas.length = 0;
      for (const it of c.items) {
        const reg = v[it] || {};
        const obs = h('input', { class: 'inp obs', placeholder: 'Observación (opcional)', value: reg.obs || '', hidden: !reg.obs && reg.v !== opciones[1],
          oninput: (e) => { v[it] = { ...(v[it] || {}), obs: e.target.value }; set(v); } });
        const fila = h('div', { class: 'chk-row' }, h('span', { class: 'item' }, it),
          segmentado(opciones, reg.v, (x) => { v[it] = { ...(v[it] || {}), v: x }; if (x === opciones[1]) { obs.hidden = false; obs.focus(); } set(v); }),
          obs);
        fila.querySelector('.item').addEventListener('click', () => { obs.hidden = false; obs.focus(); });
        filas.push(fila); cont.append(fila);
      }
    }
    pintarFilas();
    return cont;
  }

  function tabla(c, valor, set) {
    const filas = valor; // siempre es un arreglo (ver campo())
    const wrap = h('div');
    const cont = h('div', { class: 'filas' });
    const total = h('span', { class: 'total' });
    const actTotal = () => {
      total.textContent = (c.suma || []).map((k) => {
        const col = c.columnas.find((x) => x.id === k);
        return `Total ${col?.label || k}: ${fmtNum(filas.reduce((s, f) => s + num(f[k]), 0))}`;
      }).join(' · ');
    };
    const pintar = () => {
      cont.innerHTML = '';
      filas.forEach((f, i) => {
        cont.append(h('div', { class: 'fila' },
          h('span', { class: 'n' }, i + 1),
          filas.length > 1 ? h('button', { type: 'button', class: 'del', 'aria-label': 'Quitar fila', onclick: () => { filas.splice(i, 1); set(filas); pintar(); } }, '✕') : null,
          c.columnas.map((col) => h('div', { class: 'campo' + (col.tipo === 'firma' ? ' full' : '') },
            h('label', {}, col.label),
            control(col, f[col.id], (x) => { f[col.id] = x; set(filas); actTotal(); }, null)))));
      });
      actTotal();
    };
    pintar();
    wrap.append(cont, h('div', { class: 'tabla-foot' },
      h('button', { type: 'button', class: 'btn btn-sm', onclick: () => { filas.push({}); set(filas); pintar(); } }, svg(ICON.mas), 'Agregar fila'),
      total));
    return wrap;
  }

  function cajaFirma(titulo, valor, set) {
    const box = h('button', { type: 'button', class: 'firma-box' });
    const pintar = (v) => { box.innerHTML = ''; box.append(v ? h('img', { src: v, alt: 'Firma' }) : '✍️  Toca para firmar'); };
    pintar(valor);
    box.addEventListener('click', () => pedirFirma(titulo, (img) => { set(img); pintar(img); }));
    return box;
  }

  function fotos(valor, set) {
    const lista = Array.isArray(valor) ? [...valor] : [];
    const cont = h('div', { class: 'fotos' });
    const input = h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true });
    input.addEventListener('change', async () => {
      for (const f of input.files) { try { lista.push(await comprimir(f)); } catch (e) { toast('No se pudo leer una foto', 'error'); } }
      input.value = ''; set(lista); pintar();
    });
    const pintar = () => {
      cont.innerHTML = '';
      lista.forEach((src, i) => cont.append(h('div', { class: 'foto' }, h('img', { src, alt: '' }),
        h('button', { type: 'button', 'aria-label': 'Quitar foto', onclick: () => { lista.splice(i, 1); set(lista); pintar(); } }, '✕'))));
      cont.append(h('label', { class: 'foto-add' }, h('span', {}, svg(ICON.camara), 'Agregar foto'), input));
    };
    pintar();
    return cont;
  }

  function comprimir(file, max = 1280, q = 0.7) {
    return new Promise((ok, mal) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const cv = h('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(img.src); ok(cv.toDataURL('image/jpeg', q));
      };
      img.onerror = mal;
      img.src = URL.createObjectURL(file);
    });
  }

  function validar(cfg, datos) {
    document.querySelectorAll('.campo.error').forEach((e) => e.classList.remove('error'));
    const faltan = todosLosCampos(cfg).filter((c) => {
      if (!c.requerido) return false;
      const v = datos[c.id];
      return v == null || v === '' || (Array.isArray(v) && !v.length);
    });
    faltan.forEach((c) => document.querySelector(`[data-campo="${c.id}"]`)?.classList.add('error'));
    if (faltan.length) {
      document.querySelector(`[data-campo="${faltan[0].id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast(`Falta completar: ${faltan.map((c) => c.label).join(', ')}`, 'error');
    }
    return !faltan.length;
  }

  function guardar() {
    const { tab, id, datos } = edit;
    const cfg = F[tab];
    if (!validar(cfg, datos)) return;
    const ahoraMs = Date.now();
    let reg;
    if (id) {
      reg = lista(tab).find((r) => r.id === id);
      reg.datos = datos; reg.actualizado = ahoraMs;
    } else {
      reg = { id: uid(), folio: nuevoFolio(tab), creado: ahoraMs, actualizado: ahoraMs, datos };
      lista(tab).push(reg);
    }
    if (!guardarDB()) { if (!id) lista(tab).pop(); return; }
    borrarBorrador(tab);
    toast(`${reg.folio} guardado ✓`);
    ir('#/' + tab);
  }

  /* ---------------- firma ---------------- */
  function pedirFirma(titulo, alAceptar) {
    const modal = $('#modalFirma'), cv = $('#firmaCanvas');
    $('#firmaTitulo').textContent = titulo || 'Firma';
    modal.hidden = false;
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr); ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0f2a44';
    let dibujando = false, hayTrazo = false, last;
    const pos = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    cv.onpointerdown = (e) => { dibujando = true; last = pos(e); cv.setPointerCapture(e.pointerId); ctx.beginPath(); ctx.arc(last[0], last[1], 1.2, 0, 7); ctx.fillStyle = ctx.strokeStyle; ctx.fill(); hayTrazo = true; };
    cv.onpointermove = (e) => {
      if (!dibujando) return;
      const p = pos(e); ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p;
    };
    cv.onpointerup = cv.onpointercancel = () => { dibujando = false; };
    const cerrar = () => { modal.hidden = true; };
    $('#firmaLimpiar').onclick = () => { ctx.clearRect(0, 0, cv.width, cv.height); hayTrazo = false; };
    modal.querySelectorAll('[data-cerrar]').forEach((b) => (b.onclick = cerrar));
    $('#firmaOk').onclick = () => {
      if (!hayTrazo) { toast('Dibuja la firma primero', 'error'); return; }
      alAceptar(recortar(cv)); cerrar();
    };
  }
  // recorta los bordes vacíos de la firma para que se vea bien en el PDF
  function recortar(cv) {
    const ctx = cv.getContext('2d'); const { width: w, height: hh } = cv;
    const d = ctx.getImageData(0, 0, w, hh).data;
    let x0 = w, y0 = hh, x1 = 0, y1 = 0;
    for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const pad = 10; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w, x1 + pad); y1 = Math.min(hh, y1 + pad);
    const out = h('canvas'); const s = Math.min(1, 600 / (x1 - x0));
    out.width = (x1 - x0) * s; out.height = (y1 - y0) * s;
    out.getContext('2d').drawImage(cv, x0, y0, x1 - x0, y1 - y0, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  }

  /* ---------------- PDF (impresión) ---------------- */
  function valorTexto(c, v) {
    if (v == null || v === '') return '';
    if (c.tipo === 'fecha') return fechaCL(v);
    if (Array.isArray(v)) return v.join(', ');
    return String(v);
  }

  function imprimir(tab, reg) {
    const cfg = F[tab], d = reg.datos;
    let html = `<div class="p-head"><img src="${esc(EMPRESA.logo)}" alt="">
      <div class="t"><b>${esc(cfg.titulo)}</b><span>${esc(EMPRESA.nombre)} ${esc(EMPRESA.subtitulo || '')}</span></div>
      <div class="f">Folio<b>${esc(reg.folio)}</b>${esc(fechaCL(d.fecha))}</div></div>`;

    for (const sec of cfg.secciones) {
      let simples = '', bloques = '', firmas = '';
      for (const c of sec.campos) {
        const v = d[c.id];
        if (c.tipo === 'firma') {
          firmas += `<div class="p-firma"><div class="img">${v ? `<img src="${v}">` : ''}</div>${esc(c.label)}</div>`;
        } else if (c.tipo === 'checklist') {
          const ops = c.opciones || ['Bueno', 'Malo', 'N/A'];
          bloques += `<table class="p-table"><tr><th>${esc(c.label)}</th>${ops.map((o) => `<th class="mark">${esc(o)}</th>`).join('')}<th>Observación</th></tr>${
            c.items.map((it) => { const r = (v || {})[it] || {}; return `<tr><td>${esc(it)}</td>${ops.map((o) => `<td class="mark">${r.v === o ? '✔' : ''}</td>`).join('')}<td>${esc(r.obs || '')}</td></tr>`; }).join('')}</table>`;
        } else if (c.tipo === 'tabla') {
          const filas = (v || []).filter((f) => Object.values(f).some((x) => x));
          const tot = (c.suma || []).map((k) => `Total ${esc(c.columnas.find((x) => x.id === k)?.label || k)}: ${fmtNum(filas.reduce((s, f) => s + num(f[k]), 0))}`).join(' · ');
          bloques += `<table class="p-table" style="margin-top:4px"><tr><th style="width:24px">#</th>${c.columnas.map((col) => `<th>${esc(col.label)}</th>`).join('')}</tr>${
            (filas.length ? filas : [{}]).map((f, i) => `<tr><td>${filas.length ? i + 1 : ''}</td>${c.columnas.map((col) => `<td>${col.tipo === 'firma' ? (f[col.id] ? `<img src="${f[col.id]}">` : '') : esc(valorTexto(col, f[col.id]))}</td>`).join('')}</tr>`).join('')}
            ${tot ? `<tr><td colspan="${c.columnas.length + 1}" style="text-align:right;font-weight:700">${tot}</td></tr>` : ''}</table>`;
        } else if (c.tipo === 'fotos') {
          if (v?.length) bloques += `<div style="margin-top:4px"><small>${esc(c.label)}</small><div class="p-fotos">${v.map((s) => `<img src="${s}">`).join('')}</div></div>`;
        } else {
          const full = c.tipo === 'parrafo' || c.tipo === 'casillas' || c.ancho === 'completo';
          simples += `<div class="p-cell${full ? ' full' : ''}"><small>${esc(c.label)}</small>${esc(valorTexto(c, v)).replace(/\n/g, '<br>')}</div>`;
        }
      }
      html += `<div class="p-sec"><h3>${esc(sec.titulo)}</h3>${simples ? `<div class="p-grid">${simples}</div>` : ''}${bloques}${firmas ? `<div class="p-firmas">${firmas}</div>` : ''}</div>`;
    }
    html += `<div class="p-pie">Documento generado con la app ${esc(EMPRESA.nombre)} · ${new Date().toLocaleString('es-CL')}</div>`;
    $('#print').innerHTML = html;

    const tituloAnterior = document.title;
    document.title = `${reg.folio} ${cfg.corto} ${fechaCL(d.fecha)}`; // nombre sugerido del PDF
    const restaurar = () => { document.title = tituloAnterior; window.removeEventListener('afterprint', restaurar); };
    window.addEventListener('afterprint', restaurar);
    // espera a que carguen las imágenes antes de abrir el diálogo
    const imgs = [...$('#print').querySelectorAll('img')].filter((i) => !i.complete);
    Promise.all(imgs.map((i) => new Promise((r) => { i.onload = i.onerror = r; }))).then(() => setTimeout(() => window.print(), 50));
  }

  /* ---------------- menú: respaldo ---------------- */
  function abrirMenu() {
    const m = $('#modalMenu'); m.hidden = false;
    const total = TABS.reduce((s, t) => s + lista(t).length, 0);
    let kb = 0; try { kb = Math.round((localStorage.getItem(KEY) || '').length / 1024); } catch (e) { /* */ }
    $('#mInfo').textContent = `${total} registros guardados en este dispositivo (${kb} KB). Versión prototipo 0.1`;
    m.querySelectorAll('[data-cerrar]').forEach((b) => (b.onclick = () => (m.hidden = true)));
  }
  $('#btnMenu').addEventListener('click', abrirMenu);
  $('#mRespaldo').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(db)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `respaldo-conosur-${hoy()}.json` });
    document.body.append(a); a.click(); a.remove();
    toast('Respaldo descargado');
  });
  $('#mRestaurar').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (!d.registros) throw new Error();
      if (!confirm('Esto reemplazará los registros actuales por los del respaldo. ¿Continuar?')) return;
      db = d; guardarDB(); $('#modalMenu').hidden = true; render(); toast('Respaldo restaurado');
    } catch (err) { toast('El archivo no es un respaldo válido', 'error'); }
    e.target.value = '';
  });
  document.querySelectorAll('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m && m.id !== 'modalFirma') m.hidden = true; }));

  /* ---------------- instalación (PWA) ---------------- */
  let promptInstalar;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); promptInstalar = e; $('#btnInstalar').hidden = false; });
  $('#btnInstalar').addEventListener('click', async () => { if (!promptInstalar) return; promptInstalar.prompt(); await promptInstalar.userChoice; promptInstalar = null; $('#btnInstalar').hidden = true; });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});

  /* ---------------- inicio ---------------- */
  $('#brandName').textContent = EMPRESA.nombre || 'Cono Sur';
  $('#brandSub').textContent = EMPRESA.subtitulo || '';
  if (EMPRESA.logo) $('#brandLogo').src = EMPRESA.logo;
  window.addEventListener('hashchange', render);
  render();
})();
