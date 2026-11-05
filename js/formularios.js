/* =====================================================================
   CONO SUR · Configuración de formularios
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para cambiar los campos
   de cada pestaña. No hace falta saber programar: copia una línea
   parecida, cambia el texto y guarda.

   Tipos de campo disponibles:
     texto     → una línea de texto
     numero    → número (abre teclado numérico en el celular)
     fecha     → selector de fecha       (def: 'hoy' la llena sola)
     hora      → selector de hora        (def: 'ahora' la llena sola)
     parrafo   → texto largo (observaciones)
     lista     → menú desplegable        (opciones: [...])
     opcion    → botones, se elige uno   (opciones: [...])
     casillas  → varias casillas marcables (opciones: [...])
     checklist → lista de ítems con estado + observación
                 (items: [...], opciones: ['Bueno','Malo','N/A'])
     tabla     → filas que se agregan    (columnas: [...], suma: ['id'])
     duracion  → calcula horas entre dos campos hora (desde, hasta)
     firma     → firma con el dedo
     fotos     → fotos desde la cámara o galería

   Otras opciones:  requerido: true  ·  ayuda: 'texto gris de ejemplo'
                    ancho: 'completo' (ocupa toda la fila)
   ===================================================================== */

window.EMPRESA = {
  nombre: 'Cono Sur',
  subtitulo: 'Ingeniería',
  logo: 'icons/logo.svg',
};

window.FORMULARIOS = {

  /* ------------------------------------------------------------------ */
  bombeo: {
    titulo: 'Report de bombeo',
    corto: 'Bombeo',
    prefijo: 'RB',
    icono: 'bomba',
    resumen: ['cliente', 'obra'],      // lo que se ve en la lista
    destacado: 'm3_bombeados',         // número grande en la tarjeta
    unidad: 'm³',
    secciones: [
      {
        titulo: 'Datos generales',
        campos: [
          { id: 'fecha', label: 'Fecha', tipo: 'fecha', def: 'hoy', requerido: true },
          { id: 'cliente', label: 'Cliente / Constructora', tipo: 'texto', requerido: true },
          { id: 'obra', label: 'Obra / Proyecto', tipo: 'texto', requerido: true },
          { id: 'direccion', label: 'Dirección de la obra', tipo: 'texto' },
          { id: 'equipo', label: 'Equipo (bomba)', tipo: 'texto', ayuda: 'Ej: BP-36 / patente' },
          { id: 'tipo_bomba', label: 'Tipo de bomba', tipo: 'lista', opciones: ['Bomba pluma', 'Bomba estacionaria', 'Bomba telescópica', 'Otra'] },
          { id: 'operador', label: 'Operador', tipo: 'texto', requerido: true },
          { id: 'ayudante', label: 'Ayudante', tipo: 'texto' },
        ],
      },
      {
        titulo: 'Horarios',
        campos: [
          { id: 'h_salida_base', label: 'Salida de base', tipo: 'hora' },
          { id: 'h_llegada_obra', label: 'Llegada a obra', tipo: 'hora' },
          { id: 'h_inicio', label: 'Inicio de bombeo', tipo: 'hora' },
          { id: 'h_termino', label: 'Término de bombeo', tipo: 'hora' },
          { id: 'h_salida_obra', label: 'Salida de obra', tipo: 'hora' },
          { id: 'h_llegada_base', label: 'Llegada a base', tipo: 'hora' },
          { id: 'horas_bombeo', label: 'Horas de bombeo', tipo: 'duracion', desde: 'h_inicio', hasta: 'h_termino' },
          { id: 'horas_totales', label: 'Horas totales del servicio', tipo: 'duracion', desde: 'h_salida_base', hasta: 'h_llegada_base' },
        ],
      },
      {
        titulo: 'Hormigón',
        campos: [
          { id: 'grado', label: 'Grado / tipo de hormigón', tipo: 'texto', ayuda: 'Ej: G25 (90) 20 10' },
          { id: 'planta', label: 'Proveedor / planta', tipo: 'texto' },
          { id: 'elemento', label: 'Elemento hormigonado', tipo: 'texto', ayuda: 'Ej: Losa piso 3, muros eje A' },
          { id: 'm3_programados', label: 'm³ programados', tipo: 'numero' },
          { id: 'm3_bombeados', label: 'm³ bombeados', tipo: 'numero', requerido: true },
          {
            id: 'guias', label: 'Guías de despacho (camiones)', tipo: 'tabla', suma: ['m3'],
            columnas: [
              { id: 'guia', label: 'N° guía', tipo: 'texto' },
              { id: 'camion', label: 'Camión', tipo: 'texto' },
              { id: 'm3', label: 'm³', tipo: 'numero' },
              { id: 'llegada', label: 'Llegada', tipo: 'hora' },
              { id: 'descarga', label: 'Fin descarga', tipo: 'hora' },
            ],
          },
        ],
      },
      {
        titulo: 'Detalle del servicio',
        campos: [
          { id: 'mts_tuberia', label: 'Metros de tubería', tipo: 'numero' },
          { id: 'mts_manguera', label: 'Metros de manguera', tipo: 'numero' },
          { id: 'lavado', label: 'Lavado en obra', tipo: 'opcion', opciones: ['Sí', 'No'] },
          { id: 'aditivo', label: 'Uso de lechada / aditivo', tipo: 'opcion', opciones: ['Sí', 'No'] },
          { id: 'tiempos_muertos', label: 'Tiempos de espera / detenciones', tipo: 'parrafo', ayuda: 'Ej: 40 min esperando camión' },
          { id: 'observaciones', label: 'Observaciones', tipo: 'parrafo' },
        ],
      },
      {
        titulo: 'Firmas',
        campos: [
          { id: 'firma_operador', label: 'Firma operador', tipo: 'firma', requerido: true },
          { id: 'recibe_nombre', label: 'Nombre de quien recibe (cliente)', tipo: 'texto' },
          { id: 'recibe_rut', label: 'RUT de quien recibe', tipo: 'texto', ayuda: '12.345.678-9' },
          { id: 'firma_cliente', label: 'Firma cliente', tipo: 'firma' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  equipos: {
    titulo: 'Estado de equipos',
    corto: 'Equipos',
    prefijo: 'EE',
    icono: 'equipo',
    resumen: ['equipo', 'inspector'],
    insignia: 'estado_general',       // etiqueta de color en la tarjeta
    secciones: [
      {
        titulo: 'Identificación',
        campos: [
          { id: 'fecha', label: 'Fecha', tipo: 'fecha', def: 'hoy', requerido: true },
          { id: 'turno', label: 'Turno', tipo: 'opcion', opciones: ['Día', 'Noche'] },
          { id: 'equipo', label: 'Equipo / código', tipo: 'texto', requerido: true },
          { id: 'tipo_equipo', label: 'Tipo de equipo', tipo: 'lista', opciones: ['Bomba pluma', 'Bomba estacionaria', 'Camión mixer', 'Camioneta', 'Generador', 'Otro'] },
          { id: 'patente', label: 'Patente', tipo: 'texto' },
          { id: 'horometro', label: 'Horómetro', tipo: 'numero' },
          { id: 'kilometraje', label: 'Kilometraje', tipo: 'numero' },
          { id: 'inspector', label: 'Inspeccionado por', tipo: 'texto', requerido: true },
        ],
      },
      {
        titulo: 'Motor y fluidos',
        campos: [
          { id: 'chk_motor', label: 'Revisión', tipo: 'checklist', opciones: ['Bueno', 'Malo', 'N/A'],
            items: ['Nivel aceite motor', 'Nivel refrigerante', 'Nivel aceite hidráulico', 'Combustible', 'Filtros', 'Correas', 'Fugas visibles'] },
        ],
      },
      {
        titulo: 'Sistema hidráulico y pluma',
        campos: [
          { id: 'chk_hidraulico', label: 'Revisión', tipo: 'checklist', opciones: ['Bueno', 'Malo', 'N/A'],
            items: ['Mangueras hidráulicas', 'Cilindros', 'Bomba de hormigón / pistones', 'Tolva y rejilla', 'Secciones de pluma', 'Pasadores y seguros', 'Tubería y abrazaderas', 'Manguera de punta', 'Estabilizadores / patas'] },
        ],
      },
      {
        titulo: 'Seguridad',
        campos: [
          { id: 'chk_seguridad', label: 'Revisión', tipo: 'checklist', opciones: ['Bueno', 'Malo', 'N/A'],
            items: ['Paradas de emergencia', 'Control remoto', 'Luces y baliza', 'Alarma de retroceso', 'Extintor vigente', 'Botiquín', 'Cuñas / calzos', 'Placas de apoyo'] },
        ],
      },
      {
        titulo: 'Neumáticos, frenos y documentación',
        campos: [
          { id: 'chk_rodado', label: 'Revisión', tipo: 'checklist', opciones: ['Bueno', 'Malo', 'N/A'],
            items: ['Neumáticos', 'Frenos', 'Dirección', 'Permiso de circulación', 'Revisión técnica', 'SOAP'] },
        ],
      },
      {
        titulo: 'Resultado',
        campos: [
          { id: 'estado_general', label: 'Estado general del equipo', tipo: 'opcion', requerido: true, ancho: 'completo',
            opciones: ['Operativo', 'Operativo con observaciones', 'Fuera de servicio'] },
          { id: 'fallas', label: 'Fallas detectadas / trabajos pendientes', tipo: 'parrafo' },
          { id: 'fotos', label: 'Fotos', tipo: 'fotos' },
          { id: 'firma_inspector', label: 'Firma de quien inspecciona', tipo: 'firma', requerido: true },
          { id: 'firma_supervisor', label: 'Firma supervisor / mantención', tipo: 'firma' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  ast: {
    titulo: 'AST · Análisis Seguro de Trabajo',
    corto: 'AST',
    prefijo: 'AST',
    icono: 'casco',
    resumen: ['trabajo', 'obra'],
    secciones: [
      {
        titulo: 'Datos del trabajo',
        campos: [
          { id: 'fecha', label: 'Fecha', tipo: 'fecha', def: 'hoy', requerido: true },
          { id: 'hora', label: 'Hora de inicio', tipo: 'hora', def: 'ahora' },
          { id: 'obra', label: 'Obra / faena', tipo: 'texto', requerido: true },
          { id: 'lugar', label: 'Área o lugar específico', tipo: 'texto' },
          { id: 'trabajo', label: 'Trabajo a realizar', tipo: 'texto', requerido: true, ancho: 'completo', ayuda: 'Ej: Bombeo de hormigón losa piso 3' },
          { id: 'supervisor', label: 'Supervisor a cargo', tipo: 'texto', requerido: true },
          { id: 'equipo', label: 'Equipo utilizado', tipo: 'texto' },
        ],
      },
      {
        titulo: 'Verificación previa',
        campos: [
          { id: 'verificacion', label: 'Antes de comenzar', tipo: 'checklist', opciones: ['Sí', 'No', 'N/A'],
            items: [
              '¿El personal conoce el procedimiento de trabajo?',
              '¿El área está señalizada y delimitada?',
              '¿Hay líneas eléctricas cerca del área de trabajo?',
              '¿El terreno es firme para estabilizar el equipo?',
              '¿Las condiciones climáticas son adecuadas?',
              '¿Se cuenta con los permisos de trabajo necesarios?',
              '¿Equipos y herramientas en buen estado?',
              '¿Se coordinó con el jefe de obra / mandante?',
            ] },
        ],
      },
      {
        titulo: 'Análisis de riesgos',
        campos: [
          {
            id: 'pasos', label: 'Etapas del trabajo, riesgos y controles', tipo: 'tabla',
            columnas: [
              { id: 'etapa', label: 'Etapa del trabajo', tipo: 'texto' },
              { id: 'riesgo', label: 'Riesgo / peligro', tipo: 'texto' },
              { id: 'control', label: 'Medida de control', tipo: 'texto' },
            ],
          },
        ],
      },
      {
        titulo: 'Elementos de protección personal (EPP)',
        campos: [
          { id: 'epp', label: 'EPP requerido', tipo: 'casillas', ancho: 'completo',
            opciones: ['Casco', 'Lentes de seguridad', 'Guantes', 'Zapatos de seguridad', 'Protector auditivo', 'Chaleco reflectante', 'Arnés de seguridad', 'Respirador / mascarilla', 'Careta facial', 'Bloqueador solar', 'Ropa de agua'] },
        ],
      },
      {
        titulo: 'Participantes',
        campos: [
          {
            id: 'participantes', label: 'Trabajadores que participan', tipo: 'tabla',
            columnas: [
              { id: 'nombre', label: 'Nombre', tipo: 'texto' },
              { id: 'rut', label: 'RUT', tipo: 'texto' },
              { id: 'cargo', label: 'Cargo', tipo: 'texto' },
              { id: 'firma', label: 'Firma', tipo: 'firma' },
            ],
          },
          { id: 'observaciones', label: 'Observaciones', tipo: 'parrafo' },
          { id: 'firma_supervisor', label: 'Firma supervisor', tipo: 'firma', requerido: true },
        ],
      },
    ],
  },
};
