# Les Moles Events — Roadmap para usar el programa al 100 %

Documento vivo. Última actualización: versión **01.72** (octubre 2026). **Todas las fases del roadmap están hechas;** lo que queda depende del restaurante: ver la sección 8.
Objetivo: que el restaurante gestione **todos** sus eventos con el programa
(bodas, bautizos, comuniones, comidas de empresa…) sin depender de papel,
WhatsApp suelto ni Excel.

> Los esfuerzos son estimaciones de trabajo efectivo (días de desarrollo y
> pruebas). El orden propuesto va de **proteger lo que ya hay** → **el día del
> evento** → **comunicación** → **parte comercial**.

---

## 0. Dónde estamos (ya hecho)

| Área | Estado |
|---|---|
| Plano de mesas, invitados, alergias, montaje | ✅ en producción |
| Menú, escaleta (con **paradas**), producción, compras, bebidas | ✅ |
| Minutas: editor tipo Canva, **60 modelos** por evento y estilo, ES/CA | ✅ |
| Camareros: agenda, disponibilidad, alta/baja, reparto por tiempos, **avisar** (01.52) | ✅ |
| **Portal del cliente** (`?cliente=`), texto según tipo de evento, lista → plano en ~5 s | ✅ |
| Usuarios y roles (administrador, eventos, cocina, compras, **contabilidad**, servicio) | ✅ |
| Previsión de banquetes, rentabilidad, inventario, presupuesto imprimible | ✅ |
| Despliegue automático: cada `git push` a la rama de producción publica en Cloudflare Pages | ✅ |
| **Copias de seguridad automáticas, papelera 30 días y restaurar** (Parámetros → Copias de seguridad) | ✅ |
| **Historial de cambios por evento** (quién, qué y cuándo; volver a una versión) | ✅ |
| **Equipo y accesos**: usuarios con ficha, alta por invitación, permisos por rol editables, registro de actividad, contraseña propia y cierre por inactividad | ✅ |
| **RGPD**: aviso y consentimiento en el portal, plazo de conservación, anonimizar eventos y atender derechos de las personas · **Estado del sistema** con errores y vigilante externo | ✅ |
| **App instalable y modo sin conexión** (icono, abrir sin red, cola de cambios con contador) | ✅ |
| **Planos de fondo del salón compartidos** con todo el equipo (servidor, no solo el navegador de quien los sube) | ✅ |
| **Cambios compartidos y coordinación entre departamentos**: lo que cambian Eventos, Cocina y Compras en un mismo evento se junta (no se pisa), y cada departamento ve qué ha cambiado para él | ✅ |
| **Modo servicio** (el día del evento: incidencias, hitos y escaleta en el móvil) · **Turnos y horas** de camareros · **Cierre del evento** | ✅ |
| **Avisos por correo** (cliente, camareros, resumen del equipo, bandeja de salida) y **WhatsApp con un clic** | ✅ (el correo sale de verdad cuando pongas la cuenta: sección 8) |
| **Portal del cliente ampliado**: plano, aprobar menú y minuta, mensajes con el equipo, logo y fotos | ✅ |
| **Propuesta y contrato**: PDF desde el presupuesto, plantilla editable, aceptación online con nombre y NIF | ✅ (falta que tu asesor revise el texto) |
| **Contrato de Les Moles tal cual su Word** (castellano y català: misma letra, logo, marca de agua, pie, negritas y subrayados), con los datos puestos solos, **editable sobre el propio papel**, cláusulas añadidas por evento y **dos firmantes** · **justificantes de pago** y **documentos de identidad** de los clientes (Recursos → Documentos) | ✅ (falta que el administrador lo marque como «revisado») |
| **Pedidos a proveedores** por correo, WhatsApp o PDF, con control de recepción | ✅ (falta dar de alta tus proveedores) |
| **Consultas web**: formulario público con antispam, bandeja, disponibilidad por local y de la consulta al evento con un clic | ✅ (falta activarlo y poner el enlace) |

### Novedad de la versión 01.72
- **«Lista de la compra» pasa a llamarse «Qué preparar»** (Menú del evento, y su pestaña) y **ya no es un listado total**: cada plato sale con **lo que hay que preparar**, como en su escandallo de Parámetros. Por ejemplo, «Arroz de pato del Delta del Ebro y alcachofas · 155 raciones»: sofrito de alcachofa, pimiento cortado, ajo picado, salsa de tomate, arroz carneroli, caldo de pollo, magret cortado y española, cada uno con su **cantidad por ración** y la **cantidad para el evento** (por ración × raciones). Va ordenado por tiempos del menú, igual que Producción; un plato sin escandallo lo avisa en vez de quedar vacío, y si falta alguna medida sale «pendiente».
- **Los totales por proveedor siguen en «Pedidos a proveedores»** (hay un botón en la propia hoja que lleva allí). El PDF se llama «preparación» y lleva el mismo aspecto que Producción.
- Arreglo menor: en el PDF de **Producción**, la nota «N llevan plato sustitutivo» salía con el prefijo «Montaje:»; ya no.

### Novedad de la versión 01.71
- **El contrato es ahora tu Word, tal cual.** En la 01.70 el texto era el vuestro pero la presentación era la del programa; ahora es **la de vuestros dos Word**: letra **Calibri** (se usa Carlito, su equivalente libre y con las mismas medidas), texto **justificado**, título y «Ref.» en gris, «REUNIDOS» y «CLAUSULAS» centrados, cada cláusula con su etiqueta **subrayada** (Primera, Segunda…) y su título en negrita, nombres, documentos, importes y plazos en **negrita**, los datos de la cuenta **resaltados en amarillo**, las listas con «a)», «b)»… o con viñetas, las **firmas** en columnas (el restaurante y cada cliente, con su documento debajo), el **logo** arriba a la derecha con «**Página | N**» (en catalán «Pàgina»), la **marca de agua** grande del logo y el **pie** con los datos de Castell Vidal en cada página. Se ve así en el portal del cliente, en la vista previa y en el **PDF** (con la letra incrustada, así que se ve igual en cualquier ordenador). Con los datos de ejemplo de tu Word, el texto sale **palabra por palabra igual**: la prueba lo compara con el original.
- **Se mantiene todo lo que escribisteis, también las erratas** («Efectivida de la reserva», «el sr.», «CASTELL VIDAL,SL», la numeración del catalán que repite «Tercera»…): son vuestro texto y se corrigen en Parámetros si queréis. Lo único que ha cambiado son los **datos de ejemplo** que arrastraban los Word («Evento 186_2024», «Event185-2024», el nombre de los novios de muestra…), que ahora salen del evento. En la 01.70 había «arreglado» dos cosas sin que lo pidierais (la numeración del catalán y el correo de privacidad): vuelven a ser como en tu Word. Las **cláusulas añadidas** a un evento siguen la numeración de tu texto (en castellano «Decimotercera»; en catalán, como el último título es «ONZENA», sale «DOTZENA») y con el mismo aspecto.
- **Editar el contrato sobre el propio papel.** En **Presupuesto → «Datos y cláusulas de este contrato» → «Editar el contrato»** se abre el contrato tal como saldrá, **con los datos ya puestos**: se escribe como en Word (negrita, subrayado, cursiva, **resaltado**, centrar, justificar; Ctrl+B/U/I), se puede **insertar un dato** (referencia, nombres, fecha, cuenta…) y **añadir una cláusula** que sale numerada y se escribe ahí mismo. Los datos salen en **azul** como etiquetas que no se escriben: se cambian en «Datos y cláusulas» (o en la ficha) y el contrato se actualiza solo, también el que tiene el texto retocado. «Guardar» deja el texto de ese evento; «Volver al texto habitual» lo deja como el de siempre. Cancelar con cambios avisa antes de descartar.
- **El texto general** (el que usan todos los contratos nuevos) se edita igual en **Parámetros → Contrato y propuesta → «Editar sobre el papel»** (castellano y català). Si se cambia, hay que volver a marcarlo como «revisado». También hay un campo nuevo, **«Pie de los documentos»** (los renglones que salen abajo en cada página; por defecto, los de tu Word).
- **La propuesta** usa el mismo membrete y la misma letra; los **pedidos a proveedores** siguen con su PDF sencillo de antes.
- Pequeños ajustes de datos como en el Word: el mes de la fecha en castellano lleva mayúscula («21 de Mayo de 2024»), el IBAN sale como «IBAN ES33 0049…», y «Banc» en catalán; el plazo del último pago es «…una vez cerrado el número definitivo de asistentes», sin coma. La aceptación electrónica sale **debajo de las firmas**, en pequeño: nombre, documento, fecha, hora y huella.

### Novedad de la versión 01.70
- *(Nota: la presentación que se describe aquí cambió en la 01.71, que reproduce el formato de los Word: ver arriba.)*
- **El contrato de verdad.** Los dos contratos base que nos pasaste (castellano y catalán) son ahora el texto de fábrica: se rellena solo con la **referencia**, la fecha, **los dos clientes con su documento** (DNI, NIE o pasaporte, y «el Sr.» / «la Sra.»), el tipo de evento, el lugar, la reserva, el **IBAN**, el 65 % y el plazo del primer y del último pago, y el correo de eventos. En **Presupuesto → «Propuesta y contrato» → «Datos y cláusulas de este contrato»** se escribe lo propio de cada evento: idioma, referencia (hay un botón «Poner Event1_2026» que propone el siguiente número del año), tratamiento, tipo y número de documento de cada persona.
- **Cláusulas añadidas a un evento concreto** («Servicio de bus», lo que haga falta): se numeran a continuación de las 12 de siempre (Decimotercera, Decimocuarta…; en catalán, Tretzena…) y salen en el PDF y en el portal. Y si hay que cambiar algo del texto de **ese** contrato, «Editar el texto de este contrato» abre el texto entero y «Volver al texto habitual» lo deja como estaba. El texto general se sigue cambiando en Parámetros → Contrato y propuesta (con castellano y català por separado).
- **Dos firmantes.** Si en la ficha hay dos personas (pareja A y B), el contrato lo aceptan **las dos**, cada una con su nombre y su documento, desde el mismo enlace (cada una en su móvil si quieren). La tarjeta del equipo dice quién falta y el PDF lleva **tres cuadros de firma** (el restaurante y cada cliente, a mano o con la aceptación online). Si una de las dos aceptó una versión anterior, se le pide que acepte la nueva.
- **Justificantes de pago.** El cliente los sube desde su portal (**Pagos → «Subir el justificante»** o la pestaña **Documentos**, diciendo a qué pago corresponden) y el equipo también puede subirlos (concepto, importe y archivo). Salen como «Pendiente de confirmar» y «Nuevo» hasta que alguien marca **«Confirmar: el dinero ha llegado»**; se pueden **asociar a un pago** registrado en el presupuesto. Los ven administración, eventos y **contabilidad**.
- **Documentos de identidad de los clientes** (de cada persona, DNI/NIE/pasaporte; una foto o un PDF). Son datos delicados, así que: **solo los ven administración y eventos** (ni contabilidad ni cocina), el cliente puede **subirlos pero no volver a verlos** (el enlace del portal no sirve para bajarlos), **cada vez que alguien del equipo abre uno queda anotado** en el registro de actividad, y **se borran solos a los 90 días del evento** (se cambia en Parámetros → Privacidad y datos) y siempre al anonimizar el evento. En el registro de tratamientos del RGPD aparece como «Documentos de los clientes».
- **Dónde está todo:** Recursos → **Documentos** del evento (el contrato publicado con las aceptaciones, los justificantes y los documentos de identidad) y la pestaña **Documentos** del portal del cliente. Archivos: JPG, PNG, WebP o PDF, **hasta 600 KB** (con topes por día y por persona); se guardan aparte del documento del evento y se comprueba el contenido real, no solo el nombre.
- **Cosas que cambian respecto a la 01.66:** el contrato ya **no lleva tabla de importes ni exige las condiciones de cancelación** (el contrato base ya tiene sus cláusulas de cancelación; el campo de Parámetros solo sale si se añade `{cancelacion}`), así que cambiar el presupuesto ya no obliga a firmar otra vez; sí obliga cambiar una cláusula o el texto. Se han quitado del texto base dos referencias a eventos concretos que arrastraba el Word («Evento 186_2024», «Event185-2024») por la referencia del evento, y se ha corregido una numeración repetida en la versión catalana.
- **Lo que no cambia:** hasta que el administrador marque el texto como **«revisado»** (Parámetros → Contrato y propuesta) el contrato solo se puede ver y descargar como borrador. Es vuestro texto de siempre, pero conviene que lo lea el asesor una vez.
- **De paso:** el buscador de personas del RGPD ahora también encuentra y borra a alguien por el **número de documento** escrito en el contrato; un fallo de accesibilidad del selector «Lista por meses / Calendario» del Inicio (que decía ser una lista de pestañas sin serlo) queda corregido; la pantalla «Contrato y propuesta» avisa si el **IBAN del portal** (Pagos) es distinto del del contrato.

### Novedad de la versión 01.69
- **Nuevo rol «Contabilidad»** (además de Administrador, Eventos, Cocina, Compras y Servicio). Ve: Resumen, **Ficha y contacto** (para registrar cobros), **Presupuesto**, **Proveedores**, **Pedidos a proveedores**, **Turnos y horas** (solo lectura), **Cierre del evento**, **Previsión** y Documentos, más Coordinación (que la ven todos). **No** ve el plano, el menú, los camareros, el inventario, los avisos, el portal del cliente, las consultas, el Modo servicio, Parámetros ni Rentabilidad; el servidor le cierra el Modo servicio, el correo, las consultas, los usuarios y las copias. En **Coordinación** hay un quinto departamento, «Contabilidad», que recibe los cambios de fecha y de comensales (la base de las facturas) y al que se pueden mandar avisos. Los permisos se pueden ajustar en Equipo y accesos → Roles y permisos (Parámetros y Rentabilidad siguen siendo solo del administrador).
- **El rol Eventos ahora ve «Presupuesto»** (su descripción ya lo decía, pero no lo tenía): es donde se publican las propuestas y los contratos.
- **Previsión → «Importar Excel» ahora FUSIONA** en vez de reemplazar el año: compara el Excel con lo que ya hay y enseña una pantalla de revisión con **lo nuevo** (marcado), **lo que ha cambiado** (campo a campo: viene marcado solo lo que estaba en blanco o mal escrito en la app; lo que ya tenía otro dato lo eliges tú) y **lo repetido en la app** (se ofrece quitar la fila que sobra). Lo que está en la app y no en el Excel no se toca, y un campo en blanco del Excel nunca borra nada. Avisa de las fechas con el año equivocado (las corrige si quieres), de las que solo traen el mes («Sin día fijo») y de las que pasarán solas a Eventos. *(El importador de antes borraba el año entero y dejaba sin enlazar los eventos ya creados.)*
- **Los Excel de 2027 y 2028 de octubre** se han comparado con los anteriores: 5 celebraciones nuevas y 2 cambios en 2027 (y «Boda Laia i Albert», que el Excel viejo traía repetida, pasa al 12/06/2027), y 4 en 2028. Con este importador se cargan sin perder nada. De ahora en adelante **todo se introduce desde el programa**.
- Un local escrito mal en el Excel («LES VIYES DEL CONVENT») ya se reconoce como Les Vinyes (colores de la Previsión y disponibilidad de las consultas).

### Novedades de las versiones 01.62 a 01.68
- **01.62** Modo servicio · **01.63** Turnos de camareros y cierre del evento · **01.64** Avisos por correo y WhatsApp · **01.65** Portal del cliente ampliado · **01.66** Propuesta, contrato y aceptación online · **01.67** Pedidos a proveedores · **01.68** Consultas web y disponibilidad. El detalle de cada una está en su apartado de más abajo.
- **01.68, además:** revisión de **accesibilidad automática** (axe-core) de todas las pantallas nuevas —contrastes del portal y del menú lateral, idioma de la página, etiqueta del tirador de tamaño del plano, botones verdes de WhatsApp— y arreglo de lo que salió; dos pruebas automáticas que fallaban a veces por una carrera de tiempos (no por la app) quedaron estabilizadas.

### Novedad de la versión 01.61
- **RGPD y datos de clientes** (fase 1.5) y **Salud del sistema** (fase 1.6): aviso y consentimiento en el portal, anonimización, derechos de las personas, pantalla de estado, registro de errores y vigilante externo.

### Novedad de la versión 01.60
- **App instalable y modo sin conexión** (fase 1.3): se instala como app y se abre sin red; los cambios se suben solos al volver.

### Novedad de la versión 01.59
- **Planos de fondo compartidos** (fase 1.8): la imagen del salón ya no vive solo en un navegador; la ve todo el equipo.

### Novedad de la versión 01.58
- **Cambios compartidos y coordinación entre departamentos** (fase 1.7): los cambios de distintas personas en el mismo evento se juntan por secciones, y nueva sección **Coordinación** con las cifras compartidas, los cambios por revisar de cada departamento y los avisos entre departamentos.

### Novedad de la versión 01.57
- **Equipo y accesos** (fase 1.4): usuarios con ficha, alta por invitación, desactivar, permisos editables por rol y registro de actividad.

### Novedad de la versión 01.56
- **Historial de cambios por evento** (fase 1.2): ver más abajo.

### Ajuste de la versión 01.55
- **Copias de seguridad:** la pantalla ya se actualiza sola (al entrar, cada 20 s y con el botón «Actualizar»), de modo que un evento recién borrado sale enseguida en la papelera.

### Novedad de la versión 01.54
- **Copias de seguridad, papelera y restaurar** (fase 1.1): ver más abajo.

### Ajustes de la versión 01.53
- **Móvil sin zoom:** ya no se puede ampliar la página con el pellizco ni con doble toque, y el móvil no hace zoom solo al entrar en un campo de texto. El zoom propio del editor de minutas y del plano sigue funcionando.

### Ajustes de la versión 01.52
- **Escaleta:** los títulos de apartado (Menús, Alergias, Bebidas, Aperitivos, Estaciones, Menú, Postres, Cafés, Menú infantil, Menú staff) salen **subrayados y sobre banda**, en pantalla y en el PDF.
- **Paradas:** la **duración** se ve en grande, en un recuadro junto al nombre. Se quita la hora (es relativa); ya no aparecen en la franja de horas.
- **Camareros:** junto a Pendiente / Disponible / No disponible, nuevo control **No avisar · Avisar · Avisado ✓** por evento; filas resaltadas, contador «por avisar», filtro, botón «Copiar a quién avisar» y aviso en el Resumen del evento.

---

## 1. Decisiones y datos que necesito del restaurante (antes de empezar)

1. **Quién usa el programa desde el día 1 y con qué rol** (nombre, correo, rol). Se revisan los permisos por rol antes de dar acceso.
2. **Qué proyecto de Cloudflare Pages es el de producción.** Hoy el repositorio despliega en tres proyectos (`lesmoles-events`, `sitting-eventos`, `les-moles-events`); solo `lesmoles-events` tiene la base de datos declarada. Conviene desconectar los otros dos para que nadie entre en una copia sin datos.
3. **Cuenta de correo transaccional** (hace falta para la fase 3): se crea una cuenta gratuita en un servicio de envío y se verifica el dominio del restaurante.
4. **Quién es la persona de referencia** que aprueba cada entrega (para no acumular cambios sin revisar).

---

## 2. Fase 1 — Proteger los datos (días 1–3) · *imprescindible*

Hoy todo el negocio vive en un único documento en la base de datos (D1), que se
fusiona evento a evento. Funciona bien con varias personas a la vez, pero **no
hay copias automáticas ni historial**: si alguien borra o sobrescribe algo, solo
se recupera con el código manual por evento.

### 1.1 Copias de seguridad, papelera y restaurar — ✅ **hecho en la v01.54**
- **Copia automática:** al guardar, si la última tiene más de **4 horas**, se guarda una copia del documento tal como estaba (Pages no admite tareas programadas, así que se hace «al trabajar»; la primera se hace en el primer guardado tras publicar). Se conservan las **12 últimas**, **una por día durante 30 días** y **una por semana durante 12 semanas**. Si un solo guardado borra **3 eventos o más**, copia al instante.
- **Papelera:** cada evento borrado se guarda entero **30 días**; se recupera con un clic. Si se pulsa «Deshacer» al borrar, deja de aparecer allí.
- **Copia manual** («Hacer una copia ahora», hasta 30) y **copia previa**: antes de restaurar algo, se guarda lo que hay (hasta 10), así restaurar también se puede deshacer.
- **Restaurar:** Parámetros → **Copias de seguridad** (solo admin). Elegir una copia → ver qué eventos han cambiado, cuáles ya no están y cuáles se crearon después → restaurar **un evento** o **todo** (con confirmación). Lo creado después de la copia se conserva.
- **Descargar y reimportar:** «Descargar todo (.json)», descarga de cualquier copia y «Restaurar desde un archivo…» (comprueba que el archivo sea una copia de Les Moles).
- **Detalle técnico:** tablas `backups` y `papelera` en D1 (se crean solas), comprimidas (gzip); API `/api/backups…` solo para admin; lo restaurado se marca como «tocado ahora» para que gane a las copias viejas de los navegadores abiertos, que se actualizan solos. D1 además guarda su propio historial de restauración (7–30 días según plan) como segunda red de seguridad.
- **Comprobado:** un evento borrado se recupera en menos de 1 segundo; se restaura un evento de una copia sin tocar los demás; la descarga completa se vuelve a importar; los roles que no son admin reciben 403.

### 1.2 Historial de cambios por evento — ✅ **hecho en la v01.56**
- **Qué se apunta:** cada guardado que cambia un evento deja una línea: **quién**, **qué secciones** (plano, ficha, menú, bebidas, escaleta, minuta, alergias, camareros, montaje, agenda, tareas, proveedores, presupuesto, comunicación, documentos, portal del cliente) y **cuándo**. Los cambios seguidos de la misma persona (menos de 10 minutos entre uno y otro) se juntan en una sola línea; también se apunta «Evento creado».
- **Sin ruido:** lo que añade la app sola a un evento viejo (valores vacíos por defecto, marcas internas de las migraciones, la «foto» del portal) no cuenta como cambio; un guardado sin cambios reales no deja nada.
- **Volver a una versión:** cada línea guarda el evento tal como estaba **antes** de ese cambio. «Volver a antes de este cambio…» enseña qué secciones cambiarían y pide confirmación; solo cambia ese evento y los demás no se tocan. Volver deja su propia línea (con lo que había), así que **también se puede deshacer**.
- **Dónde:** Planificación → **Historial de cambios** (administrador y equipo de eventos; cocina, compras y servicio no lo ven). Se actualiza solo cada 20 s y con el botón «Actualizar».
- **Límites:** las últimas 50 líneas por evento y 180 días; cada versión guardada va comprimida y pesa unos pocos KB.
- **Detalle técnico:** tabla `historial` en D1 (se crea sola); API `/api/historial` (lista), `/api/historial/ver`, `/api/historial/restaurar`.
- **Comprobado:** «Ana · plano · ficha · menú · hace 5 min»; deshacer el último cambio devuelve el plano, la ficha y el menú sin recargar la página; la base de datos no engorda (máx. 50 líneas por evento, ~3 KB cada versión en las pruebas).

### 1.3 App instalable y con modo sin conexión — ✅ **hecho en la v01.60**
- **Instalar la app:** el programa tiene manifiesto e iconos (logo de Les Moles). En el móvil, la tablet y el ordenador (Chrome, Edge, Android) sale el botón **«Instalar la app»** en el menú; en iPhone/iPad el mismo botón explica los pasos (Compartir → Añadir a pantalla de inicio). Se abre a pantalla completa, con su icono.
- **Abrir sin conexión:** un *service worker* guarda la app en el dispositivo; si no hay red (o tarda más de 6 s) se abre la última versión guardada, con los eventos que había en el dispositivo y la sesión de siempre. Sin haber entrado nunca en ese dispositivo y sin red, no se entra (hace falta una primera vez con conexión).
- **Trabajar sin conexión:** todo se guarda primero en el dispositivo. El indicador del menú dice **«Sin conexión · 3 eventos con cambios sin subir (se subirán solos)»** (y cuenta también los planos de fondo pendientes); al volver la red se suben solos, se trae lo de los compañeros y el indicador vuelve a «Guardado». El contador sobrevive a cerrar la página.
- **Si la sesión caducó mientras tanto:** al volver la red pide entrar de nuevo, y avisa de que lo hecho sin conexión sigue guardado y se subirá.
- **Versión nueva:** cuando hay una versión nueva guardada, sale un aviso «Hay una versión nueva de la app · Recargar» (no se recarga sola para no cortar nada a medias).
- **Detalle técnico:** `manifest.webmanifest`, `sw.js` (versión puesta por el despliegue; nunca toca `/api`), iconos en `/icons`, cabeceras sin caché para el service worker y el manifiesto; nuevo `deploy.sh` que copia todo.
- **Comprobado:** servidor HTTP real + Chromium sin red: se instala el service worker, la app queda guardada, se recarga sin conexión y abre; se edita un evento sin red y se ve «1 evento con cambios sin subir»; se abre la escaleta; al volver la red se sube y otro dispositivo lo recibe; botón de instalar en Chrome y pasos en iPhone.

### 1.4 Usuarios, roles y registro de cada persona — ✅ **hecho en la v01.57**
- **Dónde:** menú lateral → **Equipo y accesos** (solo administrador), con tres apartados: *Personas*, *Roles y permisos* y *Registro de actividad*.
- **Ficha de cada persona:** nombre, email, rol, puesto y teléfono, y su estado: **Activo**, **Pendiente de aceptar**, **Invitación caducada** o **Desactivado**. Se ve su último acceso y cuántas veces ha entrado.
- **Registro de cada persona (alta por invitación):** el administrador pulsa «Invitar a una persona»; el programa crea el acceso y da un **enlace de un solo uso (7 días)** — con botones para copiar el enlace, copiar un mensaje ya redactado y abrir WhatsApp con su teléfono. La persona lo abre, **elige su propia contraseña** (8 caracteres o más) y entra: nadie más sabe su contraseña. Alternativa: poner una contraseña inicial; entonces tiene que cambiarla al entrar.
- **Cambiar la propia contraseña:** botón «Mi contraseña» en el menú. Si la contraseña es temporal, el programa obliga a cambiarla antes de seguir.
- **Quitar el acceso sin perder el historial:** «Desactivar» (y «Activar» cuando vuelva). Las sesiones abiertas de esa persona dejan de valer al momento. También: invitación nueva, contraseña temporal y eliminar. Siempre queda al menos un administrador activo.
- **Roles y permisos editables:** una tabla con qué secciones ve cada rol (Eventos, Cocina, Compras, Contabilidad, Servicio); el administrador lo ve todo. Parámetros, Rentabilidad, Copias de seguridad y Equipo y accesos son solo del administrador y no se pueden dar a otros roles. Se puede volver a los permisos de fábrica.
- **Registro de actividad:** quién entró, intentos fallidos, quién invitó/desactivó/cambió el rol de quién, quién cambió permisos, quién creó o **borró un evento**, copias, restauraciones y descargas de datos. Filtrable por persona (se guardan 400 días).
- **Seguridad:** tras 5 contraseñas incorrectas seguidas con el mismo correo, bloqueo de 10 minutos; **cierre de sesión por inactividad** configurable (nunca, 15 min … 12 h; por defecto 8 h); y solo el administrador y el equipo de eventos pueden **borrar eventos** (cocina, compras y servicio no, ni por error).
- **Detalle técnico:** columnas nuevas en `users` y tabla `actividad` (se crean solas; los usuarios de antes siguen entrando); API `/api/users`, `/api/invitacion`, `/api/me/password`, `/api/actividad`, `/api/roles`, `/api/seguridad`.
- **Comprobado:** alta por invitación de principio a fin en dos navegadores, desactivar/activar, cambio obligatorio de contraseña, bloqueo por intentos, permisos nuevos que llegan a otra persona, cierre por inactividad y que cocina no puede borrar eventos.

### 1.7 Cambios compartidos y coordinación entre departamentos — ✅ **hecho en la v01.58**
**El problema:** todo el equipo trabaja ya sobre un único documento (nada se guarda «en el perfil» de cada persona: el rol solo decide qué pantallas ve), pero si Eventos cambiaba el plano de un evento y, a la vez, Cocina cambiaba el menú del **mismo** evento, el que guardaba después **borraba el cambio del otro**. Y no había forma de ver, desde Compras, qué había cambiado en Cocina o en el plano.

- **Los cambios se juntan por secciones.** Cada evento apunta cuándo cambió cada parte (plano, ficha, menú, cada plato marcado, bebidas, camareros…). Al guardar o recibir lo de otra persona, cada parte la gana quien la cambió más tarde y lo que nadie ha tocado se queda como está. Si un departamento trabaja sin conexión, al volver se juntan los cambios sin borrar lo de los demás.
- **El plano se junta línea a línea.** Los platos sustitutivos de Cocina se guardan dentro del plano, así que Eventos y Cocina escriben en el mismo texto. Ahora se compara con la versión que cada persona tenía antes de editar: lo de Eventos (invitados nuevos) y lo de Cocina (sustitutivos) se conservan los dos. Dos altas en el mismo sitio se quedan las dos.
- **Menú → Planificación → Coordinación** (la ven todos los roles, también Compras y Servicio):
  - **Datos compartidos:** fecha, comensales (adultos, niños, bebés, staff), mesas, alergias y dietas, platos sustitutivos, platos del menú, bebidas y camareros, con **quién los define** y **quién los necesita**.
  - **Estado por departamento** (Eventos, Cocina, Compras, Servicio): al pulsar «He revisado» se guarda una foto de las cifras; desde entonces, la tarjeta del departamento dice **qué ha cambiado** («Adultos 163 → 164», «+ Lucía Nueva (Mesa 99) · gluten», «+ Edu Rodríguez → Lubina») solo de lo que le afecta a ese departamento. Cada rol solo puede marcar como revisado lo suyo (el administrador, todo).
  - **Aviso flotante** en las pantallas de tu departamento (p. ej. «Qué preparar» para Compras): «Compras: 5 cambios desde tu última revisión · Ver detalle · He revisado».
  - **Pastilla en la tarjeta del evento** (Inicio): «Compras: 5 cambios»; Eventos y administración ven «Por revisar: Compras».
  - **Avisos entre departamentos** («suben 10 comensales, pedir más cordero»): quedan pendientes en el evento hasta que alguien los marca como hechos.
  - **Comprobaciones** del evento (las mismas alertas del resumen) repartidas por departamento, con un botón que lleva a la pantalla donde se arreglan.
- **Detalle técnico:** cada evento lleva `_k` (sellos por parte) y, al subir, el texto del plano que la persona tenía antes de tocarlo; el servidor y la app usan el mismo código de fusión (`mergeEv`, fusión de líneas a tres bandas). Las revisiones (`rev`) y los avisos (`avisos`) viven dentro del evento y se sincronizan como todo lo demás; las revisiones no cuentan como cambios en el historial. Un valor por defecto que añade la app a un evento antiguo no se sella, así que nunca pisa lo que haya escrito otra persona. Restaurar una copia o volver a una versión gana a todo lo anterior (incluido lo que la copia ya no tenía).
- **Qué sigue sin juntarse:** si dos personas tocan **exactamente lo mismo a la vez** (la misma línea del plano, el mismo campo) se queda lo del último que guarda; y una **lista entera** (tareas, proveedores, pagos) que modifican dos personas a la vez: gana la última.
- **Comprobado:** en el servidor real y con tres navegadores (Eventos, Cocina, Compras): cambios simultáneos de plano y menú, plano editado a la vez por Eventos y Cocina, Cocina trabajando sin conexión mientras Eventos sigue, Compras viendo el detalle de los cambios, avisos entre departamentos y la versión móvil; con la versión anterior la misma prueba falla.

### 1.8 Planos de fondo compartidos — ✅ **hecho en la v01.59**
- **El problema:** la imagen del salón sobre la que se dibuja el plano de mesas (el «plano de fondo», común o propio de un evento de catering) se guardaba **solo en el navegador de quien la subía**: la tablet de sala no la veía.
- **Ahora:** al subirla (Plano de mesas → «Subir plano») se guarda en el servidor, comprimida y **aparte del documento de eventos** (la base de datos admite 2 MB por registro y el documento ya lleva todo el negocio). Los demás dispositivos la bajan solos (se avisa en el latido de sincronización cada ~15 s) y la etiqueta del panel dice **«compartido con el equipo»**. Quitarla también se quita en todos.
- **Planos que ya estaban en un navegador:** se suben solos la primera vez que se sincroniza (el primero que sube gana; el resto lo recibe).
- **Sin conexión:** si no hay red al subir o quitar, queda en una cola del dispositivo y se sube sola al volver, aunque se cierre la página.
- **Permisos:** pueden subirlo o quitarlo administración, eventos y servicio; cocina y compras solo lo ven. El servidor rechaza lo que no sea una imagen (JPEG/PNG/WebP) o pese más de 1,6 MB; la app reduce la calidad sola para que quepa. Cada subida o baja queda en el registro de actividad.
- **Detalle técnico:** tabla `planos` (se crea sola) y API `/api/planos` (lista), `/api/planos/ver`, `PUT` y `DELETE`; claves `loc:interior`, `loc:exterior` y `ev:<id>:interior|exterior`; los planos propios de eventos que ya no existen se limpian pasados 45 días.
- **Comprobado:** Eventos sube y Servicio lo recibe y lo dibuja; migración de un navegador con un plano «de antes»; plano propio del evento; quitar; cocina y compras reciben 403; clave, tipo y tamaño no válidos; subida sin conexión y al volver.

### 1.5 RGPD y datos de clientes — ✅ **hecho en la v01.61**
- **Aviso de privacidad en el portal del cliente** (pestaña Invitados): resumen visible y «Leer el aviso completo» con responsable, para qué, base jurídica, quién lo ve, cuánto se guarda, derechos y reclamación ante la AEPD; también desde el enlace «Privacidad» del pie.
- **Consentimiento para las alergias** (son datos de salud): si el cliente escribe una alergia o dieta nueva, hay que marcar la casilla «Acepto que Les Moles trate las alergias…»; sin ella **no se guarda** y la pantalla explica por qué. Queda apuntado **cuándo** y **con qué versión del aviso** (el servidor lo exige, no solo la pantalla). Las alergias que ya venían en la lista de partida del equipo no piden nada.
- **Parámetros → Privacidad y datos** (solo administrador):
  - **Responsable y plazo:** nombre/razón social, NIF, dirección y correo de privacidad (salen en el aviso) y cuánto se conservan los datos de un evento (6, 12, 18, 24, 36 o 60 meses; por defecto 12).
  - **Anonimizar eventos que pasan el plazo:** lista de los que ya lo han pasado y botón «Anonimizar los seleccionados» (doble pulsación). Se quitan nombres de invitados y del cliente, contactos, alergias, comunicaciones, minuta personalizada y enlace del portal; **quedan las cifras** (mesas, personas por tipo, importes) para las estadísticas. También se borran su historial, papelera, lista del cliente y plano propio. Opción de hacerlo **sola, una vez al día**. Las copias de seguridad automáticas se renuevan solas (~3 meses); las manuales las borra el administrador.
  - **Buscar o quitar a una persona** (derechos de acceso y supresión): busca un nombre, teléfono o correo en todos los eventos, muestra dónde aparece, copia un resumen para contestarle y «Quitar a esta persona de todos los eventos» (solo esa persona; el resto de la línea sigue). Queda en el registro de actividad **sin guardar el nombre**.
  - **Textos listos:** el aviso de privacidad, el registro de actividades de tratamiento (art. 30 RGPD; imprimible/PDF) y los pasos para atender una petición (plazo de un mes).
- **Detalle técnico:** `meta.privacidad` (configuración), API `/api/privacidad`, `/api/privacidad/anonimizar` y `/api/privacidad/persona`; el consentimiento va dentro de la lista del cliente (`consent: {ts, v}`).
- **Comprobado:** el servidor real con eventos de prueba (anonimizar, búsqueda con tildes de más, quitar a una persona que comparte línea, copia vieja de un navegador que no «des-anonimiza», permisos 403/401), y el portal en un navegador: sin casilla no se guarda, con casilla sí, queda «Aceptado el…».
- **Tu parte (no depende de mí):** rellenar el responsable, NIF, dirección y correo de privacidad; elegir el plazo; y revisar los textos con tu asesor (son plantillas orientativas).

### 1.6 Salud del sistema — ✅ **hecho en la v01.61**
- **Parámetros → Estado del sistema** (solo administrador): aviso general («Todo en orden» / avisos / problemas), último guardado, nº de eventos, copias de seguridad (y cuándo fue la última automática), papelera, historial, planos de fondo, personas con acceso, listas de clientes pendientes y la versión de la app. Se actualiza solo cada 30 s.
- **Espacio del documento:** todo el negocio vive en un registro de la base de datos con límite de 2 MB; una barra dice cuánto ocupa y avisa al llegar al 70 % y al 90 %.
- **Errores:** todo error del servidor y todo error que le salta a la app en un móvil o tablet se apunta (con quién y dónde) en «Errores recientes», con límite para que un fallo en bucle no llene la base de datos. Se puede vaciar el registro.
- **Al entrar el administrador**, si hay un problema importante sale un aviso sin abrir la pantalla.
- **Vigilante externo:** `/api/health` (público, sin datos) contesta «ok» si el servidor y la base de datos funcionan; la pantalla da la dirección para apuntar un servicio gratuito como UptimeRobot, que avisa aunque nadie tenga la app abierta.
- **Comprobado:** health, permisos (solo admin), registro y límite de avisos de la app, avisos «mal» por errores recientes, vaciar el registro y el flujo en pantalla (un error provocado aparece en menos de 1 s).
- **Tu parte (no depende de mí):** dar de alta el vigilante gratuito con esa dirección y elegir a qué correo/móvil avisa.

---

## 3. Fase 2 — El día del evento (días 4–9)

### 2.1 Modo servicio — ✅ **hecho en la v01.62**
- **Una pantalla para el móvil, con letra grande** (menú → «Servicio en directo → Modo servicio»; y el día del evento el **Inicio** enseña un aviso «HOY» con un botón que la abre). Tres pestañas:
  - **Ahora:** la escaleta en directo. Lo que toca ahora (aperitivos, estaciones, 1.º, 2.º… postre, tarta, cafés, ressopó y la barra libre si la ficha tiene su hora), con un botón enorme **«Salido»** que apunta la hora real y quién lo pulsó. Las **paradas** de la escaleta (regalos, discursos…) salen en su sitio, con «Empieza / Termina» y un contador de cuánto lleva y cuánto queda. Debajo, **«Con plato sustituto en este tiempo»**: quién lleva sustituto y en qué mesa. «A continuación» (con «Ya salió» por si se salta un orden) y «Ya servido» con **cambiar hora** y **deshacer**.
  - **Mesas:** todas las mesas con **las alergias en grande** (etiqueta roja), dietas, niños y el plato que le toca a quien lo lleva decidido; **buscador** (nombre, mesa o alergia) y filtros (con alergia, faltan por llegar, ya han llegado); casilla grande por invitado para marcar que **ha llegado** y «Han llegado todos» por mesa; recuento en vivo (adultos, niños, bebés, staff).
  - **Avisos:** incidencias de un toque («Falta pan», «Falta agua», «Derrame o limpieza», «Duda de alergia»…) con la mesa elegida, o escritas a mano. Al resto del equipo le sale una **alerta** (y vibra el móvil) y la pestaña se marca; se marcan como resueltas y queda quién las resolvió.
- **Varios móviles a la vez:** el estado del servicio **no va dentro del documento del negocio** (serían muchos cambios pequeños que se pisarían): tiene su propia tabla `servicio` con una versión por dato, y cada móvil pregunta cada 3 s «¿qué ha cambiado desde la versión N?». Si dos personas pulsan «Salido» a la vez, **gana la hora de la primera**.
- **Sin cobertura (muy típico en un salón):** los cambios se ven al instante en el móvil, se guardan en él y suben solos al volver la señal («Sin conexión · 2 cambios por enviar»). La pantalla del móvil no se apaga mientras está abierto el modo servicio.
- **Al terminar:** «Terminar servicio» (administración, eventos y servicio) guarda **dentro del evento** el registro real: hora prevista y hora real de cada tiempo y parada, cuántos invitados llegaron de cuántos, y los avisos con su resolución. Se puede reabrir. Los datos «vivos» se borran solos a los 90 días y al anonimizar un evento; en el servidor las llegadas se guardan con una **huella del nombre**, no con el nombre.
- **Permisos:** lo ven administración, eventos, cocina y servicio; **compras no** (ni la pantalla ni la API). En «Equipo y accesos → Roles y permisos» sale como sección fija.
- **Comprobado** (servidor real, dos móviles + uno de Compras): «Salido» llega al otro móvil en **2,5 s** (el objetivo era 6 s); la parada en curso con su contador; dos pulsaciones a la vez → una sola hora; llegadas, buscador, filtros y «Han llegado todos»; avisos con alerta, resolución y envío con Intro; corte de cobertura y subida al volver; recargar y que todo siga; corregir hora y deshacer; terminar y que el otro móvil lo vea; el registro llega al documento del servidor; claves, horas absurdas, textos largos y tope de datos en la API; permisos (compras 403); anonimización; funciona también sin servidor (vista previa) y sin desbordes en 390 px.

### 2.2 Turnos y horas de camareros — ✅ **hecho en la v01.63**
- **Camareros → «Turnos y horas»** (administración, eventos y servicio):
  - **Este evento:** una fila por camarero confirmado, con su **función del reparto** («Barra, Servir mesas») y su hora prevista de entrada. Se apunta la **entrada y la salida reales** (con un botón **«Ahora»** para fichar de un toque) y la **pausa**; las horas salen solas, también cuando se pasa de medianoche (17:30 → 01:00 con 30 min de pausa = 7 h). Totales del evento, aviso de quién tiene entrada y **no salida**, y «Poner la hora prevista de entrada a todos».
  - **Por mes:** total de horas por camarero y por evento, con aviso de los eventos del mes **sin horas apuntadas** (para que el total no engañe). **CSV para la gestoría** (detalle y resumen): separado por «;», coma decimal, fechas dd/mm/aaaa y una fila TOTAL; se abre en Excel en español sin tocar nada.
  - **Hojas por camarero:** hoja en PDF con el horario del evento (briefing, banquete…), la hora de entrada y las **funciones por tiempo** de cada uno; de uno solo o de todo el equipo.
- **Dos personas a la vez:** las horas viven dentro del evento y se juntan **campo a campo** (una cambia la salida y otra la pausa de la misma persona: se conservan las dos).
- **Rentabilidad:** el coste del personal pasa a calcularse con las **horas reales × €/hora**; si a algún camarero le falta su hora, ese va con las horas previstas. Lo que se escriba a mano en Rentabilidad manda sobre todo.
- **Permisos y datos personales:** lo que se apunta (horas y notas) entra en el aviso de privacidad como **registro de jornada (obligación legal, 4 años)**; las notas libres se borran al anonimizar o al «borrar a una persona».
- **Comprobado:** 7 h con medianoche y pausa, 6 h, 5,5 h y «falta salida»; totales; el servidor recibe las horas y Servicio las ve; dos ediciones a la vez; CSV (BOM, «;», coma decimal, suma de filas = fila TOTAL = 18,75 h); hoja de un camarero y PDF descargado; Rentabilidad = 18,75 h × 15 €/h = 281,25 €; cocina no ve la sección; sin desborde en 390 px.

### 2.3 Cierre del evento — ✅ **hecho en la v01.63**
- **«Servicio en directo → Cierre del evento»** (administración y eventos): para el evento ya celebrado,
  - **Lista de cierre** con casi todo calculado solo: **cobros** (lo que falta por cobrar del presupuesto), **material y alquileres** (con su nota), **avisos del servicio** (los que quedaron sin resolver en el modo servicio) y **horas del personal**. Si algo no cuadra se puede marcar «acordado/revisado» a mano.
  - **Previsto y real:** comensales previstos frente a los que llegaron, presupuestado frente a cobrado, **personal previsto frente a real** (con las horas apuntadas), costes y margen de **Rentabilidad**, y la escaleta **hora a hora** (previsto y real). Debajo, el personal: «María · 7 h · Barra, Servir mesas».
  - **Nota para la próxima vez** (qué fue bien, qué cambiaríamos).
  - **Estados:** «Marcar como celebrado» → «Cerrar el evento» (solo cuando la lista está completa; queda quién y cuándo) → «Reabrir» si hace falta.
- **Las cifras coinciden con Rentabilidad:** el personal real que sale en el cierre es el mismo que usa Rentabilidad (281,25 € en la prueba).
- **Roles:** «Turnos y horas» y «Cierre» llegan solos a quien los tiene de fábrica (eventos/servicio) aunque el administrador ya hubiera guardado los permisos antes; si los quita a propósito, se respeta (el servidor apunta qué secciones conocía).
- **Comprobado:** lista (3 pendientes + horas que cuadra sola), celebrado → bloqueo de cerrar → confirmar → cerrado, nota y material en el servidor, reabrir, cocina no entra, historial del evento con las secciones «camareros» y «cierre», y que el RGPD (buscar y borrar a una persona) alcanza a las notas nuevas y a los avisos del modo servicio.

---

## 4. Fase 3 — Comunicación (días 10–14)

### 3.1 Avisos por correo — ✅ **hecho en la v01.64** (falta tu parte para que salgan de verdad)
- **Planificación → «Avisos y correo»** (administración y eventos): para el evento abierto, a quién escribir y con qué mensaje **ya redactado**:
  - **Cliente:** cada paso de la agenda (enviar la lista, primer y último pago con su importe, reuniones) con su fecha («vencido hace 39 días», «mañana»…) y un botón **Correo** que abre el texto redactado —con los nombres, el enlace privado del portal y el IBAN— para repasarlo y enviarlo; más un mensaje libre. Si un paso ya se envió, avisa y ofrece «Enviarlo otra vez».
  - **Camareros:** los confirmados con su hora de entrada, **a quién avisar** y el estado; correo individual o a todos los marcados «Avisar» **con los datos de su turno** (hora de entrada y funciones del reparto); al enviarlo, queda «avisado ✓». En la ficha de cada camarero hay ahora un campo **Correo**.
  - **Resumen del equipo:** vista previa, «enviármelo a mí» y (administración) «enviarlo ya al equipo»: eventos de la semana, **lo que queda por cobrar**, **camareros por avisar y los que faltan**, **alergias sin plato sustituto** y los pasos de la agenda que vencen en 3 días.
  - **Bandeja de salida:** todo lo enviado con su estado (**enviado · simulado · error**), intentos y motivo del fallo, con «Reintentar».
- **Parámetros → «Correo y avisos»** (solo administración): estado del envío (activado o no), qué se manda **solo** (resumen semanal o diario, día y hora; **recordatorios a clientes: apagados de fábrica**, por tipo), firma, correo de respuesta y **todas las plantillas editables** (asunto y texto, con sus variables y «volver a la de fábrica»). Botones para enviar una prueba a tu correo y para **ver qué se enviaría ahora** sin enviar nada. Lleva la guía paso a paso de la activación.
- **Cómo sale solo:** Pages no ejecuta tareas programadas, así que hay una acción de GitHub (`.github/workflows/avisos.yml`) que **llama cada hora** al servidor (`/api/correo/cron`, protegido con una clave); es el servidor quien decide si toca (el resumen a su día y hora, los recordatorios del día) y **nunca repite** un envío (referencia única por aviso).
- **Sin servicio de correo no pasa nada raro:** mientras no esté activado, todo queda en la bandeja como **«simulado»** y NO sale; así se puede probar entero.
- **Datos y RGPD:** la bandeja se borra sola a los 180 días y al anonimizar un evento; el registro de tratamientos incluye «Correos y avisos». Tope de 40 correos por persona y hora.
- **Los datos del resumen** (cifras, importes, camareros, alergias sin plato) los calcula la app con la misma matemática de siempre y viajan en cada evento (`_snap`, no cuenta en el historial); el servidor solo los lee.
- **Comprobado** (servidor real con un servicio de correo de mentira): enviado, simulado y error con su motivo; reintentar; el mismo aviso no se repite; tope por hora; permisos (cocina 403, eventos no cambia ajustes); resumen con cobros, camareros, alergias y agenda; recordatorios de lista y pago con nombres, enlace e IBAN; semanal solo su día; recordatorios apagados no envían; la llamada programada sin clave o con clave mala da 403; limpieza a 180 días y al anonimizar; en pantalla: redactar y enviar, simulado, «enviarlo otra vez», camareros, resumen, bandeja, ajustes, plantillas, prueba y simulación; sin desbordes en 390 px.
- **Tu parte (no depende de mí):** (1) cuenta gratuita en **Resend** y **verificar el dominio** desde el que escribir (lo que tarda es el DNS); (2) en Cloudflare, en cada proyecto de Pages, los secretos `RESEND_API_KEY`, `MAIL_FROM` y `CRON_TOKEN`; (3) en GitHub, el secreto `CRON_TOKEN` y la variable `SITE_URL`; y que el archivo `avisos.yml` esté en la **rama principal**. Está explicado también en la propia pantalla.

### 3.2 WhatsApp con un clic — ✅ **hecho en la v01.64**
- Botón **WhatsApp** (verde) con el mensaje ya redactado, que abre la conversación con el texto puesto (enlace `wa.me`: no hace falta nada de pago ni configurar nada; lo envía la persona):
  - **Camareros** (en «Camareros del evento» y en «Avisos y correo»): su hora de entrada, el evento, la fecha y sus **funciones del reparto**.
  - **Clientes** (en «Ficha y contacto» y en «Avisos y correo»): cada paso de la agenda o un mensaje libre.
  - **Proveedores** (en la tabla de Proveedores): confirmación del evento y del servicio.
- Reconoce los teléfonos como se escriban (`600 11 22 33`, `+34 622 333 444`, `0034…`) y les pone el prefijo de España si falta; si no hay teléfono, el botón sale desactivado y lo dice.
- Los textos son **los mismos que los del correo** (se editan en Parámetros → Correo y avisos).

### 3.3 Portal del cliente ampliado — ✅ **hecho en la v01.65**
- **El cliente (sin usuario, con su enlace privado) tiene ahora 8 pestañas:** Inicio · Pagos · Presupuesto · Invitados · **Plano** · El día · **Aprobar** · **Mensajes**.
  - **Plano:** ve el esquema de su salón con las mesas colocadas (solo lectura: «lo marca Les Moles») y, al tocar una mesa, quién se sienta en ella según su lista. La «foto» del evento que ya viajaba al portal lleva ahora ese esquema.
  - **Aprobar:** el **menú** y la **minuta** (la imagen tal como saldrá en las mesas). Escribe su nombre y pulsa «Aprobar»: queda **«Aprobado por … el 10/10 a las 16:55»**. Si el equipo cambia después el menú o la minuta, la aprobación se marca como **«Ha cambiado desde que lo aprobasteis»** y puede volver a aprobar (cada aprobación guarda una huella de lo que se aprobó, así no se confunde una versión con otra).
  - **Mensajes:** escribe al equipo desde su portal y ve **la respuesta sin recargar**; en el **Inicio** de la app cada evento muestra «Portal: 2 mensajes sin leer · 1 archivo nuevo» y los mensajes quedan «leídos» al abrirlos.
  - **Su logo y sus fotos:** sube **1 logo y hasta 8 fotos** (en el móvil se reducen solas a un tamaño razonable; cada archivo pesa menos de 500 KB) y puede quitar las que no quiera.
- **El equipo, en Planificación → «Portal del cliente»** (administración y eventos): enlace para copiar, **estado de las aprobaciones** (quién, cuándo y si han caducado), botón **«Publicar la minuta para el cliente»** (convierte la minuta diseñada en imagen y la sube al portal; si aún no hay diseño, dice qué hacer), **conversación** con el cliente (contestar desde la app) y **archivos recibidos** con «Bajar» para usar el logo y las fotos en la minuta (con «Logo o imagen» del diseñador de minutas).
- **Historial del evento:** cada aprobación queda en «Historial de cambios» (sección «aprobaciones», «Aprobó el menú», con el nombre que escribió el cliente y «(cliente)»).
- **Límites y datos:** tope de 30 mensajes y 40 archivos al día por evento (con mensaje claro al cliente); las imágenes se validan en el servidor (tipo y tamaño); los mensajes y archivos viven en tablas aparte (no engordan el documento del evento), **se borran al anonimizar el evento** y los **encuentra el buscador de personas del RGPD**. Todo el portal es **solo del evento de su enlace**: sin sesión, el servidor solo entrega lo que corresponde a ese enlace.
- **Comprobado** (servidor real + dos navegadores: el equipo y el cliente en móvil de 390 px): las 8 pestañas, el plano con sus mesas, aprobar menú y minuta, **que un cambio del equipo invalide la aprobación**, mensajes en los dos sentidos con lectura, subida real de imágenes (la grande se reduce, el límite de 8, quitar), publicar la minuta (48 KB, vertical), permisos (eventos sí, cocina no), enlace de otro evento sin acceso, límites diarios, fusión de cambios (el equipo y el cliente tocan el mismo evento sin pisarse), borrado RGPD, **sin desbordes en móvil** y sin errores en consola.
- **Tu parte:** ninguna; funciona con lo que ya hay. (Los avisos por correo de «el cliente ha escrito / ha aprobado» no están: hoy se ven en el Inicio de la app. Si los quieres, se añaden a las plantillas de 3.1.)

---

## 5. Fase 4 — Parte comercial y compras (semanas 3–4)

### 4.1 Presupuesto → contrato → firma — ✅ **hecho en la v01.66** (falta tu parte: que tu asesor revise el texto) · *el texto del contrato se sustituyó por el real en la v01.70: ver 4.4*
- **Planificación → Presupuesto → «Propuesta y contrato»** (al final de la página; un botón arriba lleva a ella): cuatro pasos con su estado — **presupuesto** · **documento publicado en el portal** (tipo, versión, quién y cuándo) · **aceptado por el cliente** (nombre, NIF, fecha y hora) · **señal recibida** (con un botón «Registrar señal recibida» que añade el pago). Con avisos de qué falta, de si el presupuesto ha cambiado desde que se publicó y de si el cliente aceptó una versión anterior.
- **Dos documentos que salen del presupuesto**: la **propuesta** (lo que se ofrece) y el **contrato** (partes, objeto, menú, precio, forma de pago con sus fechas, comensales y cambios, cancelación, protección de datos y aceptación). Se descargan en **PDF** (borrador antes de publicar; con el bloque de firmas al final, a mano o con la aceptación online) y se ven en el portal.
- **Parámetros → «Contrato y propuesta»** (solo administración): datos de la empresa (razón social, CIF, domicilio, quién firma), **condiciones de cancelación** (las escribes tú), condiciones adicionales, validez de la propuesta y **las dos plantillas editables**, con las variables que se rellenan solas ({cliente}, {fecha_evento}, {desglose}, {menu_resumen}, {tabla_importes}, {plan_pagos}…) y «volver al texto de fábrica». Vista previa con el evento abierto y PDF de prueba.
- **Para que no salga nada a medias:** no se puede publicar si falta un dato (te dice cuál: CIF, IBAN, cancelación, menú, importes…) ni si la plantilla usa una variable que no existe; y **un contrato solo se publica cuando el administrador ha marcado su texto como «revisado»** (si después se cambia una letra, hay que volver a marcarlo). Los textos de fábrica son un **modelo orientativo, no asesoramiento legal**.
- **Publicar** fija el texto tal como está en ese momento y lo copia al portal del cliente (pestaña **«Contrato»** o **«Propuesta»**, con aviso en su Inicio). El cliente lo lee, escribe su **nombre y su NIF**, marca que lo ha leído y acepta; puede **descargar el PDF**. Si el presupuesto o la plantilla cambian y se publica una versión nueva, **la aceptación anterior deja de valer** (el cliente ve «Ha cambiado desde que lo aceptasteis») y **lo que firmó de la versión anterior se conserva** y se puede descargar. También se puede retirar del portal.
- **Qué se guarda de cada aceptación** (en el propio evento, con su historial: «Neus Valldepérez (cliente) · Aceptó el contrato (versión 1)»): el texto aceptado, nombre, NIF, fecha, hora y una **huella** del texto, más los datos de la empresa de ese momento. Es **firma electrónica simple**: sirve como prueba de la aceptación, pero no es una firma avanzada ni cualificada; si quieres ese nivel hace falta un proveedor de firma externo (decisión tuya, con tu asesor).
- **Avisar al cliente:** en «Avisos y correo» sale la fila «El contrato para aceptar» con **Correo** y **WhatsApp** (plantilla editable en Parámetros → Correo y avisos). Y en las alertas del evento: «el contrato lleva N días publicado y el cliente no lo ha aceptado».
- **RGPD:** el contrato aceptado (nombre, NIF y texto) se borra al **anonimizar** el evento y lo **encuentra y borra el buscador de personas**. *(De paso, se ha corregido que el nombre de quien aprobó el menú o la minuta —v01.65— no se borraba al anonimizar.)*
- **Comprobado** (servidor real y dos navegadores, el cliente en móvil): publicar con datos que faltan, plantilla sin revisar, variable inexistente, revisar y volver a revisar al cambiar el texto, vista previa y PDF, publicar, **aceptar sin NIF / sin marcar / con una huella vieja / con un enlace antiguo**, aceptar, que un guardado del equipo con una copia antigua **no borre la aceptación**, versión nueva que invalida la anterior (y conserva la firmada), retirar, registrar la señal, PDF firmado con el NIF, avisos por correo y WhatsApp, permisos (eventos publica; Parámetros solo el administrador; cocina nada), búsqueda y borrado de la persona, anonimizar, sin desbordes en móvil de 390 px ni en modo oscuro, y sin errores en consola.
- **Tu parte (no depende de mí):** (1) **que tu asesor o abogado lea el texto del contrato**, lo ajuste en Parámetros y lo marque como revisado; (2) escribir las **condiciones de cancelación**; (3) rellenar los **datos de la empresa** (razón social, CIF, domicilio, quién firma); (4) decidir si te basta la firma electrónica simple o quieres un **proveedor de firma** externo.

### 4.2 Compras por proveedor — ✅ **hecho en la v01.67** (falta tu parte: dar de alta tus proveedores y asignarles los artículos la primera vez)
- **Menú del evento → «Pedidos a proveedores»** (administración, eventos y compras; en «Qué preparar» hay un botón que lleva allí): lo que hay que comprar para el evento abierto, repartido **por proveedor**:
  - **Qué se compra:** los ingredientes de los platos elegidos (las mismas cuentas que «Qué preparar»: raciones × escandallo), las **bebidas del evento** (con su producto y cantidad) y el **material que falta** según el Montaje y el inventario (sillas, mesas, tronas…). Las cantidades se redondean **hacia arriba** a unidades de compra (kg, g, unidades, botellas) para no quedarse cortos.
  - **Proveedores de compra** (alta, edición y baja en la propia pantalla: nombre, contacto, teléfono y correo) y **asignación una sola vez por artículo**: se recuerda para todos los eventos siguientes. Los que no tienen proveedor salen aparte, con un desplegable en cada uno y la opción de **marcar varios y asignarlos de golpe**.
  - **Coste estimado** de cada línea y del pedido, con los precios del **«Análisis de compras»** del Maître (lo que no tenga precio sale como «sin precio»).
- **El pedido:** «Preparar el pedido» congela las cantidades (versión 1, fecha de entrega —por defecto el día antes del evento— y notas para el proveedor). Se envía por **correo** (ya redactado: saludo, evento, fecha de entrega y todas las líneas; queda en la bandeja del servidor y no se repite la misma versión), por **WhatsApp** (con el teléfono del proveedor) o en **PDF** con una columna «Recibido» para apuntar a mano; si se avisó por teléfono, «Ya lo he enviado». Si después **cambia el evento** (más invitados, otro plato…), el pedido avisa de **qué ha cambiado** (p. ej. «Ajo picado: 78 g → 83 g») y se actualiza con un clic (versión 2, indicando que hay que avisar al proveedor).
- **Control de recepción:** en cada línea se apunta lo que llega y dice **✓ completo · faltan 1,16 kg · de más: +3 g**; «Todo ha llegado» apunta todo de golpe; cada proveedor pasa a «Recibido en parte» o **«Recibido completo»**, con el recuento arriba. Se guarda **por línea**, así que **dos personas pueden recibir a la vez** (cada una lo suyo) sin pisarse, y desde el móvil.
- **Avisos:** en las alertas del evento, «pedido sin recibir (la entrega prevista ya pasó)» y «hay N pedidos preparados sin enviar» a menos de 5 días del evento. Los cambios salen en el **historial** del evento como «compras».
- **Roles:** compras puede **mandar pedidos a proveedores por correo** (solo eso: no mensajes a clientes ni la bandeja); eventos y administración, todo. Los proveedores son datos del negocio (se registran en el registro de tratamientos como «Proveedores de compra»).
- **Comprobado** (servidor real, dos equipos a la vez): dar de alta proveedores, asignar uno a uno y de golpe, que se queden para los demás eventos, preparar, correo (con su referencia en la bandeja y sin servicio activado queda «simulado»), WhatsApp con el teléfono bien formado, PDF sin bloque de firmas, recepción completa/parcial/de más sin perder el foco al escribir, cambio del evento y actualización, **dos equipos que recibían líneas distintas a la vez**, que quitar un proveedor no lo resucite una copia antigua, coste con precios del Maître, material que falta, permisos del correo (compras solo pedidos; cocina y servicio, nada), alertas, historial y móvil de 390 px sin desbordes.
- **Tu parte (no depende de mí):** (1) dar de alta tus **proveedores** (nombre, teléfono, correo) y (2) asignarles los **artículos** la primera vez (el informe del Maître no dice a quién se compra cada cosa; después se recuerda). (3) Para que el correo salga de verdad: lo de la sección 3.1 (cuenta de correo).

### 4.3 Consultas y disponibilidad — ✅ **hecho en la v01.68** (falta tu parte: activar el formulario y darle el enlace a quien lo vaya a usar)
- **Formulario público** en `tu-dirección/?consulta` (sin usuario): nombre, correo o teléfono (basta uno), qué se celebra, invitados, fecha o «cuándo, más o menos», salón, mensaje y la **casilla de privacidad** con la información (responsable, para qué, cuánto tiempo y derechos, con los datos de «Privacidad y datos»). Pensado para el móvil. Si está apagado, lo dice y da vuestro teléfono y correo.
- **Parámetros → «Consultas web»** (solo administración): activarlo o apagarlo, texto de bienvenida, **tipos de celebración** y **salones** (uno por línea), si el formulario dice si **la fecha parece libre**, a quién **avisar** de cada consulta (vacío = administración y eventos), **acuse de recibo** a quien escribe (texto editable) y cuánto **conservar** las consultas (6–36 meses). Con el enlace para copiar y abrir.
- **Protección contra el spam, sin depender de nadie:** un campo trampa que solo rellenan los robots (a ellos se les dice «gracias» y no se guarda nada), un **tiempo mínimo** desde que se abre el formulario (firmado por el servidor; la página espera sola lo que falte), tope de **4 consultas por hora y 10 al día por persona** (se reconoce por una huella que se borra a los 2 días) y **80 al día en total**, rechazo de mensajes con montones de enlaces. Y, **opcional**, el control **Turnstile de Cloudflare** (si pones las claves `TURNSTILE_SITEKEY` y `TURNSTILE_SECRET`).
- **Previsión → «Consultas web»** (administración y eventos): la **bandeja** con lo que llega (nuevas arriba, filtros Abiertas · En Previsión · Descartadas · Todas, buscador), un aviso en el **Inicio** («Tienes 2 consultas nuevas de la web») y, en cada una: el mensaje y los datos, **cómo está la fecha que piden en cada local** (Les Moles / Les Vinyes: libre · provisional · ocupada, y con qué celebración), **responder por correo** (redactado; queda en la bandeja del servidor) o **WhatsApp**, estado (Nueva · Contactada · Visita · En Previsión · Descartada), **nota del equipo** y borrar.
- **De la consulta al evento:** **«Añadir a la Previsión»** crea la celebración pendiente (con fecha, salón, invitados, teléfono y origen «Web») y la consulta muestra su estado real («En Previsión · pendiente», «Confirmada», «Ya es un evento»); cuando se confirma con fecha, **pasa sola a Eventos** como siempre. **«Crear el evento ya»** lo hace todo de un clic (hace falta fecha exacta) y deja botón para abrirlo.
- **Disponibilidad:** pestaña con el **calendario mes a mes** por local (barra rellena = ocupada, rayas = provisional, vacía = libre; con texto para lector de pantalla) hecho con la Previsión y los eventos (lo descartado no ocupa; el catering o «fuera» no ocupa los salones; si falta el local, se avisa como provisional en los dos), y «Comprobar una fecha» con el detalle de cada día. Si el administrador lo activa, el **formulario público** le dice a quien consulta si la fecha «parece libre» **sin dar nombres ni detalles**.
- **RGPD:** las consultas se **borran solas** pasado el plazo; al **anonimizar un evento** se borran las consultas que acabaron en él y **su fila de la Previsión** (nombre de la celebración, teléfono, localidad); el **buscador de personas** encuentra y borra a alguien también en las **consultas** y en la **Previsión** *(de paso: antes la Previsión no se limpiaba al anonimizar ni al borrar a una persona)*. Aparece en el registro de tratamientos como «Consultas web».
- **Comprobado** (servidor real y varios navegadores, el formulario en móvil de 390 px): apagado de fábrica, activar desde Parámetros, campos obligatorios y mensajes de error, **campo trampa**, permiso falso/caducado/demasiado rápido, topes por persona y por día, **Turnstile** (simulado), el aviso y el acuse por correo (simulados), disponibilidad de varios casos, bandeja, leída/estado/nota, correo y WhatsApp, Previsión y evento de un clic, calendario, permisos (eventos sí; cocina no; ajustes solo administración), borrado y caducidad, RGPD, sin desbordes y sin errores en consola.
- **Tu parte (no depende de mí):** (1) **activar el formulario** en Parámetros → Consultas web y decidir los tipos, los salones y si dice si la fecha está libre; (2) **poner el enlace** `…/?consulta` donde quieras (tu web, Instagram, Google Business…); (3) para que los avisos y el acuse salgan de verdad, lo de la sección 3.1 (cuenta de correo); (4) *opcional:* claves de Turnstile si algún día entra spam.

### 4.4 Contrato real, justificantes de pago y documentos de identidad — ✅ **hecho en la v01.70** (falta tu parte: que el administrador marque el contrato como «revisado»)
- **Contrato base de Les Moles, castellano y català** (los dos Word que pasaste, tal cual): Reunidos (con los dos clientes y su documento), 12 cláusulas (objeto, efectividad de la reserva, número de asistentes, oferta gastronómica e intolerancias, precios y menú, prueba del menú, servicios extra, condiciones de pago, protocolo del evento, seguimiento del contrato, suspensión del evento y protección de datos) y bloque de firmas. Se rellena con los datos del evento y de la casa; lo que falta se avisa («falta el documento de identidad de Neus…», «falta la referencia del contrato») y no se puede publicar a medias.
- **Por evento** (Presupuesto → «Propuesta y contrato» → «Datos y cláusulas de este contrato»): idioma, referencia, tratamiento y documento de cada persona, **cláusulas adicionales** (título y texto; se numeran a continuación) y **texto propio** de ese contrato, que se edita **sobre el propio papel** con los datos puestos como etiquetas («Editar el contrato»; «Volver al texto habitual»).
- **Dos firmantes** con aceptación independiente (nombre, documento, fecha, hora y huella del texto); el PDF lleva las firmas como el Word (columnas con nombre y documento) y, debajo, la aceptación electrónica (castellano y català). Se guarda cada aceptación en el evento y en su historial; si una persona aceptó una versión anterior, se le pide la nueva.
- **Justificantes de pago** (portal del cliente y equipo) con estado «Pendiente de confirmar» → «Confirmado», aviso de «Nuevo» y asociación a un pago del presupuesto. **Documentos de identidad** por persona, con las reglas de privacidad de arriba (solo administración y eventos, el cliente no puede volver a verlos, apertura registrada, borrado a los 90 días del evento o al anonimizar).
- **Permisos** (comprobados con usuarios reales): administración y eventos ven y gestionan todo; **contabilidad** ve el contrato y los justificantes pero **no** los documentos de identidad; **cocina** y los demás no ven nada de esto en Documentos.
- **Comprobado** (servidor real y varios navegadores, el cliente en móvil de 390 px): contrato completo en los dos idiomas, cláusula añadida y numeración, texto propio y volver al habitual, dos firmas desde el mismo enlace (y solo una, y con huella vieja, y sin documento), PDF con 1 y con 2 firmantes en castellano y en catalán revisados a mano, subida de justificantes y documentos (foto y PDF, tipos y tamaños no válidos, topes), el cliente **no puede volver a ver** sus documentos, el equipo sí y queda anotado, confirmar y asociar a un pago, los permisos por rol, el borrado automático a los N días y al anonimizar, el buscador de personas (por nombre y por número de documento) y **accesibilidad (axe-core) de todas las pantallas nuevas, en claro y en oscuro: 0 avisos**.
- **Tu parte (no depende de mí):** (1) en **Parámetros → Contrato y propuesta**, que el administrador **lea el texto base y lo marque como «revisado»** (idealmente tras enseñárselo al asesor) y confirme los datos de la empresa y el **IBAN** que vienen del contrato de siempre; (2) decidir **cuántos días** se guardan los documentos de identidad (hoy **90 días tras el evento**) y **cuánto tiempo** los justificantes de pago: hoy se conservan hasta que se anonimiza el evento, y la contabilidad suele exigir guardarlos años; (3) el **primer pago (65 %)** del contrato es **3 semanas antes** del evento (21 días) y la agenda con el cliente lo avisa a los **18 días**: conviene que coincidan (se cambia en Parámetros → Contrato y propuesta → «Pagos del contrato» o en Parámetros → Agenda con el cliente).

---

## 6. Calidad continua (en paralelo)

- **Accesibilidad:** revisión automática con axe-core de las pantallas de las versiones 01.62–01.70 (equipo en claro y oscuro, portal del cliente en móvil y formulario público): **0 avisos graves** tras los arreglos de la 01.68 y la 01.70. Una sola excepción deliberada: el zoom del móvil está **bloqueado a petición tuya** (v01.5x); los lectores de pantalla y las personas con baja visión lo echan en falta, así que si algún día quieres permitirlo es un cambio de una línea.
- **Seguridad:** las cookies de sesión son `HttpOnly`, `Secure` y `SameSite=Lax`; los puntos públicos (portal, formulario de consultas, entrada) tienen topes por persona y por día y tamaño máximo de envío; todo lo del portal es solo del evento de su enlace; los permisos se aplican en el **servidor**, no solo en la pantalla.
- **Auditoría con varios revisores** de toda la app (diseño, coherencia de cifras, móvil): **sigue pendiente** y es opcional; se lanza cuando tú lo pidas (consume mucho trabajo de revisión).
- **Pruebas automáticas** de los flujos críticos (cliente → plano, guardado, copia/restauración) ejecutadas en cada entrega.
- **Cada entrega:** versión visible en pantalla («Versión 01.NN»), prueba en navegador y móvil, informe en castellano de qué cambia y cómo se prueba.

---

## 7. Resumen de calendario propuesto

| Días | Entrega | Versión |
|---|---|---|
| 1–3 | Copias y papelera · historial · **usuarios y permisos** · **cambios compartidos** · planos compartidos · app instalable y sin conexión · RGPD · estado | 01.54–01.61 |
| 4–9 | Modo servicio · turnos y horas · cierre de evento | 01.62–01.63 |
| 10–14 | Avisos por correo · WhatsApp · portal ampliado | 01.64–01.65 |
| 15–28 | Contrato y firma · compras por proveedor · consultas | 01.66–01.68 |
| Después | Rol Contabilidad · Previsión por fusión · contrato real, justificantes y documentos de identidad · contrato con el formato de tu Word y editable sobre el papel · «Qué preparar» por plato | 01.69–01.72 |

**Estado: todo entregado (01.54 → 01.72).**

El orden se puede cambiar según la urgencia real del restaurante: cualquier
elemento de las fases 2–4 puede adelantarse sin depender de los anteriores,
**salvo** los de la fase 1, que conviene tener antes de fiarlo todo al programa.

---

## 8. Lo que falta y depende de ti

Todo lo que podía hacer el programa por su cuenta **está hecho y probado**. Lo que queda necesita una cuenta, una decisión o la revisión de una persona del restaurante. De lo más a lo menos urgente:

| # | Qué falta | Quién | Qué desbloquea |
|---|---|---|---|
| 1 | **Cuenta de correo** (Resend, gratuita) y **verificar el dominio** del restaurante; en Cloudflare, en cada proyecto de Pages, los secretos `RESEND_API_KEY`, `MAIL_FROM` y `CRON_TOKEN`; en GitHub, el secreto `CRON_TOKEN` y la variable `SITE_URL`; que `avisos.yml` esté en la rama principal | Tú (lo que tarda es el DNS) | Que **salgan de verdad** los avisos a clientes y camareros, el resumen semanal, los pedidos a proveedores y el acuse de las consultas. Hasta entonces todo queda «simulado» en la bandeja y no sale nada |
| 2 | **Qué proyecto de Cloudflare Pages es el de producción** (hay tres) y desconectar los otros dos | Tú | Que nadie entre en una copia sin datos |
| 3 | **Definir las personas.** Los perfiles ya existen (Administrador —Jeroni—, Eventos, Cocina, Compras, Contabilidad y Servicio): falta decir **quién** es cada uno (nombre, correo, teléfono) e invitarles desde «Equipo y accesos»; una **persona de referencia** que apruebe cada entrega; **dos administradores como mínimo**. Decidir también si Eventos debe ver **Proveedores** y **Comunicación** (hoy no) | Tú | Empezar a usarlo en serio |
| 3b | **Cargar los Excel de Previsión 2027 y 2028** con el nuevo «Importar Excel» y revisar los casos dudosos: «Boda Laia i Albert» (¿12/06/2027?), «Comida Jordi Aleu» (la hoja decía 2026), «Boda Núria i Victor» (solo «octubre» y un teléfono raro), «Boda Zaida» (1/1/2028) y «Laura y Sergi» (solo el nombre). Si «Laia i Albert» se creó dos veces como evento, borrar la repetida en Eventos | Tú | Previsión al día |
| 4 | **Contrato:** que el administrador lea el **texto base** (es vuestro contrato de siempre, castellano y català, tal cual el Word; las erratas del Word siguen ahí: «Efectivida», dos «Tercera» en catalán…, se corrigen con «Editar sobre el papel») en Parámetros → Contrato y propuesta —idealmente tras enseñárselo al asesor—, lo marque como «revisado» y confirme los **datos de la empresa** y el **IBAN** (vienen del contrato que pasaste); decidir si basta la **firma electrónica simple** o quieres un proveedor de firma | Tú + asesor | Poder publicar contratos a los clientes |
| 4b | **Documentos de los clientes:** decidir **cuántos días** se guardan los documentos de identidad tras el evento (hoy **90**, en Parámetros → Privacidad y datos) y **cuánto** los justificantes de pago (hoy hasta anonimizar el evento; la contabilidad suele exigir guardarlos años). Y que el **primer pago** del contrato (3 semanas antes) coincida con el aviso de la agenda con el cliente (hoy 18 días) | Tú + asesor | Cumplir RGPD y obligaciones contables, y que el cliente no reciba dos fechas distintas |
| 5 | **Datos del responsable de privacidad** en Parámetros → Privacidad y datos, y que el asesor revise los textos del aviso y del consentimiento | Tú + asesor | Cumplir RGPD con los textos propios del restaurante |
| 6 | **Proveedores de compra:** darlos de alta (nombre, teléfono, correo) y asignarles los artículos **la primera vez** (después se recuerda) | Quien compra | Pedidos agrupados por proveedor |
| 7 | **Consultas web:** activar el formulario en Parámetros → Consultas web, decidir tipos, salones y si dice «fecha libre», y poner el enlace `…/?consulta` en tu web, Instagram y Google Business | Tú | Recibir consultas |
| 8 | **Vigilante externo:** un monitor gratuito (p. ej. UptimeRobot) que mire `…/api/health` | Tú (5 minutos) | Enterarte si la app se cae |
| 9 | **Precios del «Análisis de compras»** del Maître: volver a importarlos cuando cambien | Quien compra | Costes estimados al día |
| 10 | **Un evento piloto de principio a fin** (consulta → contrato → pedidos → servicio → cierre) y apuntar lo que chirríe | Equipo | Pulir con uso real |

**Opcionales (si los quieres, se hacen):**
- Avisos por correo de «el cliente ha escrito / ha aprobado» (hoy se ven en el Inicio de la app).
- Proveedor de **firma electrónica avanzada** si el contrato necesita más validez.
- Claves de **Turnstile** para el formulario si algún día entra spam.
- **Auditoría con varios revisores** de toda la app.
- Permitir el **zoom en el móvil** (hoy bloqueado a petición tuya).
