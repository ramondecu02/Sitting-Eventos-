// Contenido de la checklist del roadmap (ROADMAP_checklist.pdf).
// Se edita aquí y se regenera con:  node roadmap/build.mjs
// Cada casilla es [texto, hecho]. Una tarjeta cuenta como hecha cuando todas sus casillas lo están.

const T = true, F = false;

// Lo ya entregado, en orden de versión (cada entrada lleva su versión al final).
export const hecho = [
  'Plano de mesas, invitados, alergias y montaje',
  'Menú, escaleta (con paradas y su duración), producción, compras y bebidas',
  'Minutas: editor tipo Canva, 60 modelos por evento y estilo, castellano / catalán',
  'Camareros: agenda, disponibilidad, alta y baja, reparto por tiempos y «Avisar»',
  'Portal del cliente (enlace ?cliente=), textos según el tipo de evento y lista → plano en unos 5 s',
  'Usuarios y roles (administrador, eventos, cocina, compras, contabilidad, servicio)',
  'Previsión de banquetes, rentabilidad, inventario y presupuesto imprimible',
  'Despliegue automático: cada cambio subido a la rama de producción se publica en Cloudflare Pages',
  'Móvil sin zoom (pellizco, doble toque y zoom al entrar en un campo)',
  'Copias de seguridad automáticas, papelera de 30 días y restaurar un evento o todo (Parámetros → Copias de seguridad) · v01.54',
  'Historial de cambios por evento: quién, qué y cuándo, y volver a una versión anterior (Planificación → Historial de cambios) · v01.56',
  'Equipo y accesos: fichas de usuario, alta por invitación, desactivar, permisos por rol editables, registro de actividad, contraseña propia y cierre por inactividad · v01.57',
  'Cambios compartidos entre departamentos (se juntan por secciones, sin pisarse) y sección «Coordinación»: cifras compartidas, cambios por revisar y avisos · v01.58',
  'Planos de fondo del salón compartidos con todo el equipo (servidor, cola sin conexión, migración de los que ya había) · v01.59',
  'App instalable (icono, pantalla completa) y modo sin conexión: se abre sin red y los cambios se suben solos al volver · v01.60',
  'RGPD: aviso y consentimiento en el portal, plazo de conservación, anonimizar eventos y derechos de las personas · Estado del sistema (errores, espacio, vigilante) · v01.61',
  'Modo servicio (el día del evento), turnos y horas de camareros, y cierre del evento · v01.62–01.63',
  'Avisos por correo (cliente, camareros, resumen del equipo, bandeja de salida) y WhatsApp con un clic · v01.64 (el correo sale de verdad cuando pongas la cuenta)',
  'Portal del cliente ampliado: aprobar menú y minuta con nombre y fecha, plano, mensajes con el equipo, logo y fotos · v01.65',
  'Propuesta y contrato: PDF desde el presupuesto, plantilla editable, publicar en el portal y aceptación online con nombre y NIF · v01.66',
  'Pedidos a proveedores: lo que hay que comprar repartido por proveedor, envío por correo o WhatsApp y control de recepción · v01.67',
  'Consultas web: formulario público con antispam, bandeja del equipo, disponibilidad por local y de la consulta al evento con un clic · v01.68',
  'Rol Contabilidad y Previsión por fusión: «Importar Excel» compara con lo que hay, enseña lo nuevo, lo cambiado y lo repetido y no pisa lo editado en la app · v01.69',
  'Justificantes de pago y documentos de identidad subidos por el cliente o el equipo (Recursos → Documentos) · v01.70',
  'Contrato de Les Moles tal cual su Word (castellano y català: Calibri, logo, marca de agua, pie, negritas y subrayados) con los datos puestos solos, editable sobre el propio papel, cláusulas añadidas por evento y dos firmantes · v01.70–01.71',
  '«Qué preparar» (antes «Lista de la compra»): cada plato con lo que lleva, por ración y para el evento, como en su escandallo de Parámetros, sin listado total · v01.72 (en el orden de la escaleta desde la v01.73)',
  'Alergias y sustituciones: copiar los platos de un comensal a otros con el mismo caso (dos vegetarianos, dos celíacos…) sin escribirlos dos veces, con «Deshacer» · v01.73',
  'Plano de sala, salón interior: «Ordenar» (y la primera colocación) deja las mesas en 3 filas horizontales, ni una más · v01.74',
  'Comunicación con los clientes: notas largas con asunto (editables), adjuntar el chat de WhatsApp (.txt o .zip), correos (.eml) y capturas o PDF, y un registro con buscador (también dentro de los adjuntos), desde/hasta y filtro por tipo · v01.75',
  'Escaleta y Alergias: lo que se confirma a mano cuenta como decidido, y la escaleta dice por qué sigue pendiente cada comensal (qué plato le falta y en qué tiempo) · v01.76',
  'Alergias: «No hace falta» en cada plato que choca, para no tener que añadir un sustituto que no se necesita; deja de contar como falta en toda la app, se copia con «Copiar a otros…» y se borra al anonimizar · v01.77',
  'Portal del cliente, Invitados: mesas plegables con su resumen («10 personas · 2 alergias»), buscador por nombre, mesa o alergia, filtro «Solo con alergia o dieta» y filas más compactas: en el móvil la pestaña pasa de unos 12.000 px a unos 2.400 · v01.78',
  'Portal del cliente, Inicio: tarjeta «Qué os falta» (firmar, lista de invitados, identidad, aprobar menú y minuta, próximo pago y mensajes, con botón a cada uno y lo atrasado primero), número de pendientes en la pestaña Inicio y pestaña elegida siempre a la vista · v01.79',
  'Seguridad del portal: se cierra solo N días después del evento (30 por defecto, se cambia en Parámetros → Privacidad y datos), cabeceras (no indexar, no incrustar en otra web), tope a quien prueba enlaces al azar, enlaces antiguos listados y la app de detrás del portal apartada para lectores de pantalla y tabulador · v01.80',
  'Portal del cliente: los plazos de pago suman siempre lo que falta (lo pagado de más se descuenta del siguiente) y el esquema del plano usa el tamaño real de cada mesa, sin solapes · v01.81',
  'Platos compartidos bien contados: el jamón (y chips, crujiente, pan de cristal, coca…) lleva su plato en cada mesa de aperitivo, el menú infantil cuenta por niños y por mesa de niños, y Parámetros → Platos enseña y deja cambiar «Cómo se sirve» cada plato (ficha, tabla y filtros) · v01.82',
  'Interfaz: buscador global (Ctrl + K, «/» o el botón «Buscar») para saltar a cualquier sección, evento, plato o acción según el rol, y portada de Parámetros con las pantallas agrupadas, su estado y «Para revisar» · v01.83',
  'Parámetros revisados: avisos de ingredientes sin cantidad, «Para revisar» con los alérgenos sin confirmar y controles de al menos 36 px en pantallas táctiles; todas las pantallas del equipo comprobadas en móvil, tableta y portátil · v01.84',
  'Escaleta y plano: «(solo aperitivo)» marca a quien viene al aperitivo y no a cenar (cuenta en aperitivos, estaciones, jamón y mesas de aperitivo; no en el sitting, los menús ni los platos del banquete) y las cantidades de «Menús» corregidas a mano se propagan a los totales y al banquete · v01.85',
  'Alergias y sustituciones: cada comensal es un desplegable (cerrado, solo su nombre y su estado; «Todo decidido» lo cierra solo) con «Abrir los pendientes», «Abrir todos» y «Cerrar todos» · v01.86',
  'Escaleta: «Detalles de servicio» por persona (vela de cumpleaños, dedicatorias…) que no son alergias: salen en dorado tras su plato, en el PDF y en el modo servicio, sin restar platos ni entrar en Alergias · v01.87',
  'Alergias: botón «Pasar a detalle de servicio» en cada plato sustitutivo (propone el momento, ofrece quitar «alergias» falsas del plano y se puede deshacer) · v01.88',
  'Platos por unidades: croquetas y buñuelos de 8 en 8 (campo «Uds por plato» en Parámetros → Platos): la vajilla del check list y la escaleta cuentan platos, no comensales · v01.89',
  'Montaje: editor de mesas (nombre, forma, plazas, largo en metros, giro, tamaño y gente a cada lado, con vista previa) que se dibuja en el plano real, el esquema del portal y el PDF · v01.90',
  'Editor visual de mesas (doble clic en la mesa): arrastrar los extremos para alargarla, + y − por lado y por cabecera (varias personas en una cabecera), intercambiar sillas, ancho, giro y forma, todo reflejado al momento en el plano · v01.91',
  'Logo de los novios: el que mandan por el portal, WhatsApp o correo se recorta, se le quita el fondo (blanco o negro) y se cambia de color (original, negro, blanco, el del diseño o cualquiera); queda como «Logo de la pareja» del evento y se usa en todas las minutas · v01.92',
  'Correos: diseño de la casa con botón al portal y vista previa, respuesta a quien lo envía y copia oculta, estado de entrega (entregado, rebotado, spam) con aviso, adjuntos (3 × 3 MB) y envío programado cancelable · v01.93',
  'Botón «Nombre completo | Solo nombre» en el plano, el listado y los marcasitios (pantalla y PDF): solo el nombre de pila, con compuestos enteros (Maria Carmen, Josep Maria) y la inicial del apellido si hay dos iguales en la mesa · v01.94',
  'Minutas: la Guía Michelin nueva es el único logo de distinción (sin estrella verde, Sol Sostenible ni Repsol) en el catálogo, las plantillas y los formatos antiguos; las minutas ya hechas se actualizan solas · v01.95',
];

export const decisiones = [
  'Personas que usarán el programa desde el día 1: nombre, correo y rol',
  'Qué proyecto de Cloudflare Pages es el de producción (hoy hay tres) y desconectar los otros dos',
  'Cuenta de correo transaccional creada y con el dominio del restaurante verificado (para la fase 3)',
  'Persona de referencia que aprueba cada entrega',
];

export const calendario = [
  ['1–3', 'Copias y papelera · historial · usuarios y permisos · cambios compartidos · planos compartidos · app instalable · RGPD · estado', '01.54–01.61'],
  ['4–9', 'Modo servicio · turnos y horas · cierre de evento', '01.62–01.63'],
  ['10–14', 'Avisos por correo · WhatsApp · portal ampliado', '01.64–01.65'],
  ['15–28', 'Contrato y firma · compras por proveedor · consultas', '01.66–01.68'],
  ['Después', 'Rol Contabilidad · Previsión por fusión · contrato real, justificantes y documentos de identidad · contrato con el formato de tu Word, editable sobre el papel · «Qué preparar» por plato y copiar alergias · salón interior en 3 filas · Comunicación con adjuntos, buscador y filtros · escaleta y alergias al día, con «No hace falta» por plato · portal del cliente: lista de invitados compacta en el móvil y «Qué os falta» en Inicio, cierre del portal tras el evento, cabeceras de seguridad, pagos que cuadran, plano del cliente sin solapes y vajilla compartida (jamón) bien contada, portada de Parámetros, buscador global y revisión de los datos de Parámetros · «solo aperitivo» en el plano y cantidades de «Menús» corregidas a mano que se propagan en la escaleta', '01.69–01.95'],
];

export const fases = [
  {
    n: 1, titulo: 'Proteger los datos', sub: 'Días 1–3 · imprescindible antes de fiarlo todo al programa',
    tareas: [
      { id: '1.1', titulo: 'Copias de seguridad, papelera y restaurar', esfuerzo: '~1 día', v: 'v01.54',
        que: [
          ['Tabla de copias y copia automática al guardar (como mucho una cada pocas horas)', T],
          ['Conservar 30 copias diarias y 12 semanales', T],
          ['Papelera de eventos borrados (30 días)', T],
          ['Parámetros → Copias: elegir fecha, ver qué eventos cambian y restaurar uno o todos', T],
          ['Botón «Descargar todo» (JSON), solo admin', T],
        ],
        hecho: [
          ['Se borra un evento de prueba y se recupera en menos de 1 minuto', T],
          ['Se restaura un evento de ayer sin tocar los demás', T],
          ['La descarga completa se vuelve a importar sin errores', T],
        ] },
      { id: '1.2', titulo: 'Historial de cambios por evento', esfuerzo: '~1 día', v: 'v01.56',
        que: [
          ['El servidor apunta quién y qué sección cambió al guardar', T],
          ['Instantánea del evento (como mucho 1 cada 10 min por persona y evento; las últimas 50)', T],
          ['Pestaña «Historial» en el evento: quién · qué · cuándo', T],
          ['Botón «Volver a esta versión»', T],
        ],
        hecho: [
          ['Aparece «Ana · plano · hace 5 min» tras un cambio', T],
          ['Se deshace el último cambio de un evento', T],
          ['La base de datos no engorda de forma apreciable', T],
        ] },
      { id: '1.3', titulo: 'App instalable y modo sin conexión', esfuerzo: '~1 día', v: 'v01.60',
        que: [
          ['Manifiesto e iconos (se instala con su icono en el móvil o la tablet)', T],
          ['Caché de la app y del último documento', T],
          ['Cola de cambios hechos sin conexión y sincronización al volver', T],
          ['Aviso «sin conexión · N cambios pendientes»', T],
        ],
        hecho: [
          ['Con el modo avión se abre la escaleta del día y se marca algo', T],
          ['Al recuperar la red, el cambio aparece en otro dispositivo', T],
          ['Se instala desde el móvil y abre a pantalla completa', T],
        ] },
      { id: '1.4', titulo: 'Usuarios, roles y registro de cada persona', esfuerzo: '~1,5 días', v: 'v01.57',
        que: [
          ['Ficha de cada persona (rol, puesto, teléfono, estado, último acceso)', T],
          ['Alta por invitación: enlace de un solo uso para que cada persona elija su contraseña', T],
          ['Cambiar la propia contraseña y obligar a cambiar la temporal', T],
          ['Desactivar y activar el acceso sin perder el historial; siempre un administrador', T],
          ['Permisos por rol editables (tabla de secciones) y vuelta a los de fábrica', T],
          ['Registro de actividad filtrable por persona (accesos, usuarios, borrados, copias)', T],
          ['Bloqueo tras 5 fallos y cierre de sesión por inactividad configurable', T],
          ['Solo administración y eventos pueden borrar eventos', T],
        ],
        hecho: [
          ['Una invitación de principio a fin en dos navegadores', T],
          ['Una persona desactivada no puede entrar y su sesión abierta se cierra', T],
          ['Los permisos nuevos llegan a otra persona al recargar', T],
          ['Cocina no puede borrar un evento', T],
        ] },
      { id: '1.7', titulo: 'Cambios compartidos y coordinación entre departamentos', esfuerzo: '~2 días', v: 'v01.58',
        que: [
          ['Los cambios de Eventos, Cocina y Compras en el mismo evento se juntan por secciones (nadie pisa a nadie)', T],
          ['El plano, que también lleva los platos sustitutivos de Cocina, se junta línea a línea con la versión que cada persona tenía antes', T],
          ['Trabajo sin conexión: al volver, los cambios se juntan sin borrar lo de los demás', T],
          ['Sección «Coordinación»: cifras compartidas (comensales, alergias, sustitutivos, platos, bebidas) y quién las define y quién las necesita', T],
          ['Estado por departamento: qué ha cambiado desde su última revisión y botón «He revisado»', T],
          ['Aviso en las pantallas de tu departamento y pastilla en la tarjeta del evento (Inicio)', T],
          ['Avisos entre departamentos que quedan pendientes hasta que alguien los marca como hechos', T],
          ['Comprobaciones del evento repartidas por departamento', T],
        ],
        hecho: [
          ['Eventos cambia el plano y Cocina el menú a la vez: se conservan los dos', T],
          ['Cocina marca un plato sustitutivo mientras Eventos añade invitados: el plano tiene las dos cosas', T],
          ['Compras ve qué ha cambiado (adultos, alergias, sustitutivos, platos) desde su última revisión', T],
        ] },
      { id: '1.8', titulo: 'Planos de fondo compartidos', esfuerzo: '~1 día', v: 'v01.59',
        que: [
          ['Hoy la imagen del salón sobre la que se dibuja el plano se guarda solo en el navegador de quien la sube: el resto del equipo no la ve', T],
          ['Guardarla en el servidor (comprimida, aparte del documento de eventos) y que la vean todos los dispositivos', T],
          ['Pasar a compartida la que ya haya en cada navegador, sin perderla', T],
          ['Planos propios de un evento (catering fuera) también compartidos', T],
        ],
        hecho: [
          ['Se sube el plano del salón desde un ordenador y se ve en la tablet de sala', T],
          ['Los planos que ya estaban en un navegador siguen ahí tras la actualización', T],
        ] },
      { id: '1.5', titulo: 'RGPD y datos de clientes', esfuerzo: '~0,5 día', v: 'v01.61',
        que: [
          ['Aviso de privacidad y consentimiento en el portal del cliente (las alergias son datos de salud)', T],
          ['Política de conservación decidida por el restaurante (p. ej. 12 meses)', T],
          ['Anonimizar nombres y alergias de eventos cerrados pasado el plazo', T],
        ],
        hecho: [
          ['El portal muestra el aviso antes de pedir datos', T],
          ['Un evento de prueba caducado queda anonimizado', T],
        ] },
      { id: '1.6', titulo: 'Salud del sistema', esfuerzo: '~0,5 día', v: 'v01.61',
        que: [
          ['Pantalla «Estado» para admin: último guardado, última copia y errores recientes', T],
          ['Registro de errores del servidor', T],
          ['Medir el tamaño del documento (la base de datos admite 2 MB por registro) y avisar a tiempo', T],
        ],
        hecho: [
          ['Un error provocado aparece en la pantalla en menos de 1 minuto', T],
        ] },
    ],
  },
  {
    n: 2, titulo: 'El día del evento', sub: 'Días 4–9',
    tareas: [
      { id: '2.1', titulo: 'Modo servicio', esfuerzo: '2–3 días', v: 'v01.62',
        que: [
          ['Escaleta en directo: qué toca ahora, qué viene y cuánto dura la parada en curso', T],
          ['Botón «Salido» por plato o tiempo, con la hora real', T],
          ['Plano con alergias por mesa en grande y búsqueda de invitado', T],
          ['Llegada de invitados (marcar presentes) y recuento en vivo', T],
          ['Incidencias rápidas («falta pan en mesa 4») visibles para el responsable', T],
        ],
        hecho: [
          ['Dos móviles ven el mismo estado en menos de 6 segundos', T],
          ['Al acabar queda el registro de horas reales frente a la escaleta prevista', T],
        ] },
      { id: '2.2', titulo: 'Turnos y horas de camareros', esfuerzo: '~2 días', v: 'v01.63',
        que: [
          ['Asignar personal a cada evento', T],
          ['Registrar hora real de entrada y de salida', T],
          ['Total de horas por camarero y por mes', T],
          ['Exportación a Excel/CSV para la gestoría', T],
          ['Hoja por camarero con sus funciones y su horario', T],
        ],
        hecho: [
          ['Al cerrar un evento sale «María · 7,5 h · barra»', T],
          ['El CSV mensual cuadra con las horas registradas', T],
        ] },
      { id: '2.3', titulo: 'Cierre del evento', esfuerzo: '~1 día', v: 'v01.63',
        que: [
          ['Lista de cierre: cobros pendientes, material, incidencias y nota para la próxima vez', T],
          ['Paso a «celebrado» con el resumen económico real frente al presupuestado', T],
        ],
        hecho: [
          ['Un evento de prueba pasa a «celebrado» con su resumen', T],
          ['Las cifras reales coinciden con Rentabilidad', T],
        ] },
    ],
  },
  {
    n: 3, titulo: 'Comunicación', sub: 'Días 10–14',
    tareas: [
      { id: '3.1', titulo: 'Avisos por correo', esfuerzo: '1–2 días', v: 'v01.64',
        que: [
          ['Cuenta de correo verificada y conectada', T],
          ['Resumen diario o semanal al equipo («3 eventos · faltan 2 pagos · 4 camareros por avisar»)', T],
          ['Recordatorios al cliente: enviar la lista, pagos, reunión', T],
          ['Aviso a los camareros marcados «Avisar», con los datos de su turno', T],
          ['Registro de envíos (estado e intentos) y plantillas editables en Parámetros', T],
          ['Disparo programado mediante una acción que llama a un punto protegido del servidor', T],
        ],
        hecho: [
          ['Llega el resumen del lunes a las 8:00', F],
          ['Un cliente de prueba recibe el recordatorio de la lista', F],
          ['Cada envío queda registrado', F],
        ] },
      { id: '3.2', titulo: 'WhatsApp con un clic', esfuerzo: '~0,5 día', v: 'v01.64',
        que: [
          ['Botones «Avisar por WhatsApp» con el mensaje ya redactado (camareros, clientes, proveedores)', T],
        ],
        hecho: [
          ['Abre WhatsApp con el teléfono y el mensaje correctos', T],
        ] },
      { id: '3.3', titulo: 'Portal del cliente ampliado', esfuerzo: '~2 días', v: 'v01.65',
        que: [
          ['Aprobar la minuta y el menú (con nombre y fecha)', T],
          ['Subir su logo y fotos', T],
          ['Ver el plano', T],
          ['Dejar comentarios al equipo y recibir su respuesta', T],
          ['Cada aprobación queda en el historial del evento', T],
        ],
        hecho: [
          ['Un cliente de prueba aprueba la minuta y queda en el historial', T],
          ['El logo que sube llega al equipo para colocarlo en la minuta', T],
        ] },
    ],
  },
  {
    n: 4, titulo: 'Parte comercial y compras', sub: 'Semanas 3–4',
    tareas: [
      { id: '4.1', titulo: 'Presupuesto → contrato → firma', esfuerzo: '2–3 días', v: 'v01.66',
        que: [
          ['PDF de propuesta desde el presupuesto del evento', T],
          ['PDF de contrato (plantilla editable en Parámetros, con revisión del asesor antes de publicar)', T],
          ['Aceptación online en el portal (nombre, NIF, fecha, hora y huella del texto)', T],
          ['Registro de la señal', T],
          ['Firma electrónica simple; proveedor de firma externo solo si hace falta validez reforzada (decisión tuya)', T],
        ],
        hecho: [
          ['Se genera el contrato de un evento de prueba', F],
          ['El cliente lo acepta desde el portal y queda registrado con fecha y hora', F],
          ['Tu asesor revisa el texto base del contrato (y lo marcas como «revisado»)', F],
        ] },
      { id: '4.2', titulo: 'Compras por proveedor', esfuerzo: '~2 días', v: 'v01.67',
        que: [
          ['Pedido agrupado por proveedor a partir de lo que lleva cada plato (ingredientes, bebidas y material que falta)', T],
          ['Envío por correo o WhatsApp, y PDF', T],
          ['Control de recepción: lo pedido frente a lo llegado, línea a línea', T],
          ['Conexión con el inventario (material que falta) y con los precios de «Análisis de compras»', T],
        ],
        hecho: [
          ['Un pedido sale agrupado por proveedor', T],
          ['Lo recibido se compara con lo pedido', T],
        ] },
      { id: '4.3', titulo: 'Consultas y disponibilidad', esfuerzo: '~2 días', v: 'v01.68',
        que: [
          ['Formulario web público con protección anti-spam (campo trampa, tiempo mínimo, topes y Turnstile opcional) y casilla de privacidad', T],
          ['Calendario de disponibilidad por fecha y salón (Previsión + eventos)', T],
          ['Seguimiento de la consulta hasta confirmar', T],
          ['Convertir la consulta en evento con un clic', T],
        ],
        hecho: [
          ['Una consulta de prueba llega a la app', T],
          ['Se convierte en evento sin reescribir datos', T],
        ] },
      { id: '4.4', titulo: 'Contrato tal cual su Word, justificantes de pago y documentos de identidad', esfuerzo: '~4 días', v: 'v01.71',
        que: [
          ['Contrato de Les Moles en castellano y en català con el formato de vuestro Word (letra, logo, marca de agua, pie, negritas), con la referencia, los dos clientes con su documento, la reserva, el pago y el IBAN rellenados solos', T],
          ['Cláusulas adicionales por evento (se numeran a continuación) y edición del contrato sobre el propio papel, con los datos como etiquetas; «volver al texto habitual»', T],
          ['Dos firmantes: cada persona acepta con su nombre y su documento, desde el mismo enlace; el PDF lleva las firmas como el Word', T],
          ['Justificantes de pago: los sube el cliente (portal) o el equipo, se confirman y se asocian a un pago', T],
          ['Documentos de identidad de los clientes: se suben, solo los ven administración y eventos (cada apertura queda registrada) y se borran a los N días del evento', T],
        ],
        hecho: [
          ['El contrato de un evento de prueba sale igual que el Word, en los dos idiomas y con una cláusula añadida', T],
          ['Los dos clientes firman desde el móvil y el PDF lleva sus firmas y la aceptación', T],
          ['Un justificante y un documento de identidad subidos por el cliente aparecen en Documentos del evento', T],
        ] },
    ],
  },
];

export const calidad = [
  ['Accesibilidad: revisión automática (axe-core) de las pantallas nuevas del equipo, el portal del cliente en móvil y el formulario público: 0 avisos graves tras los arreglos de la 01.68 y la 01.70', T],
  ['Seguridad: cookies HttpOnly + Secure + SameSite, topes y tamaño máximo en los puntos públicos, permisos aplicados en el servidor, cabeceras que impiden indexar o incrustar la app, cierre del portal tras el evento y tope a quien prueba enlaces', T],
  ['Auditoría con varios revisores de toda la app (diseño, cifras, móvil): opcional, la lanzo cuando lo pidas', F],
  ['Pruebas automáticas de los flujos críticos (cliente → plano, guardado, copia y restauración) en cada entrega', F],
  ['Cada entrega: versión visible en pantalla, prueba en navegador y móvil, e informe en castellano', F],
];

// [qué falta, qué desbloquea]
export const falta = [
  ['Cuenta de correo (Resend) con el dominio verificado; secretos RESEND_API_KEY, MAIL_FROM y CRON_TOKEN en cada proyecto de Cloudflare Pages; en GitHub el secreto CRON_TOKEN, la variable SITE_URL y avisos.yml en la rama principal', 'Hasta entonces todo queda «simulado» y no sale ningún correo'],
  ['Decidir qué proyecto de Cloudflare Pages es el de producción (hay tres) y desconectar los otros dos', 'Que nadie entre en una copia sin datos'],
  ['Definir las personas: los perfiles ya existen (Administrador —Jeroni—, Eventos, Cocina, Compras, Contabilidad y Servicio); falta quién es cada uno e invitarles desde «Equipo y accesos»; persona de referencia; dos administradores como mínimo; decidir si Eventos ve Proveedores y Comunicación', 'Empezar a usarlo en serio'],
  ['Cargar los Excel de Previsión 2027 y 2028 con el nuevo «Importar Excel» y revisar los casos dudosos (Laia i Albert, Jordi Aleu, Núria i Victor, Zaida, Laura y Sergi)', 'Previsión al día'],
  ['Contrato: que el asesor lea el texto base (es el vuestro de siempre), lo marque como «revisado» y confirmar los datos de la empresa y el IBAN; decidir si basta la firma simple o queréis proveedor externo', 'Poder publicar contratos a clientes'],
  ['Documentos de clientes: decidir cuántos días se guardan los DNI tras el evento (hoy 90) y cuánto los justificantes de pago (hoy hasta anonimizar el evento; la contabilidad suele exigir años); y que el primer pago del contrato (3 semanas antes) coincida con el aviso de la agenda (18 días)', 'Cumplir RGPD y obligaciones contables'],
  ['Portal del cliente: decidir cuántos días después del evento se cierra (hoy 30; Parámetros → Privacidad y datos) y crear enlace nuevo en los eventos que aún tengan un enlace antiguo y corto (esa misma pantalla los lista)', 'Que el IBAN, el presupuesto y el contrato no queden abiertos para siempre'],
  ['Platos por completar (Parámetros → Platos y escandallo → «Con avisos»): tabla de quesos y tarta tatin sin escandallo, sopa fría de tomate con ingredientes sin cantidad; y confirmar con cocina los alérgenos de los 346 ingredientes (Parámetros → Alérgenos)', 'Producción, Qué preparar y Alergias al día y sin «pendiente»'],
  ['Datos del responsable de privacidad (Parámetros → Privacidad y datos) y revisión de los textos por el asesor', 'Cumplir RGPD con vuestros textos'],
  ['Proveedores de compra: darlos de alta y asignarles los artículos la primera vez', 'Pedidos agrupados por proveedor'],
  ['Consultas web: activar el formulario, elegir tipos y salones y poner el enlace ?consulta en la web, Instagram y Google Business', 'Recibir consultas'],
  ['Vigilante externo (p. ej. UptimeRobot) mirando /api/health', 'Saber si la app se cae'],
  ['Volver a importar los precios del «Análisis de compras» del Maître cuando cambien', 'Costes estimados al día'],
  ['Un evento piloto de principio a fin (consulta → contrato → pedidos → servicio → cierre) y anotar lo que chirríe', 'Pulir con uso real'],
];

export const opcionales = [
  'Avisos por correo de «el cliente ha escrito / ha aprobado» (hoy se ven en el Inicio de la app)',
  'Proveedor de firma electrónica avanzada, si el contrato necesita más validez',
  'Claves de Turnstile para el formulario de consultas, si algún día entra spam',
  'Auditoría con varios revisores de toda la app (diseño, cifras, móvil)',
  'Permitir el zoom en el móvil (hoy bloqueado a petición tuya; los lectores de pantalla lo recomiendan)',
];
