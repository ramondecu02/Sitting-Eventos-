# Les Moles Events — Roadmap para usar el programa al 100 %

Documento vivo. Última actualización: versión **01.58** (octubre 2026).
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
| Usuarios y roles (admin, eventos, cocina, compras, servicio) | ✅ |
| Previsión de banquetes, rentabilidad, inventario, presupuesto imprimible | ✅ |
| Despliegue automático: cada `git push` a la rama de producción publica en Cloudflare Pages | ✅ |
| **Copias de seguridad automáticas, papelera 30 días y restaurar** (Parámetros → Copias de seguridad) | ✅ |
| **Historial de cambios por evento** (quién, qué y cuándo; volver a una versión) | ✅ |
| **Equipo y accesos**: usuarios con ficha, alta por invitación, permisos por rol editables, registro de actividad, contraseña propia y cierre por inactividad | ✅ |
| **Cambios compartidos y coordinación entre departamentos**: lo que cambian Eventos, Cocina y Compras en un mismo evento se junta (no se pisa), y cada departamento ve qué ha cambiado para él | ✅ |

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

### 1.3 App instalable y con modo sin conexión — *~1 día* — v01.60
- **Qué:** icono en la pantalla del móvil/tablet; los eventos del día quedan guardados para **consultar** aunque falle el wifi del salón; los cambios hechos sin conexión se guardan y **se sincronizan al volver**, con aviso claro («sin conexión · 3 cambios pendientes»).
- **Detalle técnico:** `manifest.webmanifest`, `sw.js` (caché de la app y del último documento), iconos; el guardado ya es local primero («Guardado en este dispositivo»), solo falta la cola de subida.
- **Hecho cuando:** con el avión activado se abre la escaleta del día, se marca algo, y al recuperar la red aparece en otro dispositivo.

### 1.4 Usuarios, roles y registro de cada persona — ✅ **hecho en la v01.57**
- **Dónde:** menú lateral → **Equipo y accesos** (solo administrador), con tres apartados: *Personas*, *Roles y permisos* y *Registro de actividad*.
- **Ficha de cada persona:** nombre, email, rol, puesto y teléfono, y su estado: **Activo**, **Pendiente de aceptar**, **Invitación caducada** o **Desactivado**. Se ve su último acceso y cuántas veces ha entrado.
- **Registro de cada persona (alta por invitación):** el administrador pulsa «Invitar a una persona»; el programa crea el acceso y da un **enlace de un solo uso (7 días)** — con botones para copiar el enlace, copiar un mensaje ya redactado y abrir WhatsApp con su teléfono. La persona lo abre, **elige su propia contraseña** (8 caracteres o más) y entra: nadie más sabe su contraseña. Alternativa: poner una contraseña inicial; entonces tiene que cambiarla al entrar.
- **Cambiar la propia contraseña:** botón «Mi contraseña» en el menú. Si la contraseña es temporal, el programa obliga a cambiarla antes de seguir.
- **Quitar el acceso sin perder el historial:** «Desactivar» (y «Activar» cuando vuelva). Las sesiones abiertas de esa persona dejan de valer al momento. También: invitación nueva, contraseña temporal y eliminar. Siempre queda al menos un administrador activo.
- **Roles y permisos editables:** una tabla con qué secciones ve cada rol (Eventos, Cocina, Compras, Servicio); el administrador lo ve todo. Parámetros, Rentabilidad, Copias de seguridad y Equipo y accesos son solo del administrador y no se pueden dar a otros roles. Se puede volver a los permisos de fábrica.
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
  - **Aviso flotante** en las pantallas de tu departamento (p. ej. la Lista de la compra para Compras): «Compras: 5 cambios desde tu última revisión · Ver detalle · He revisado».
  - **Pastilla en la tarjeta del evento** (Inicio): «Compras: 5 cambios»; Eventos y administración ven «Por revisar: Compras».
  - **Avisos entre departamentos** («suben 10 comensales, pedir más cordero»): quedan pendientes en el evento hasta que alguien los marca como hechos.
  - **Comprobaciones** del evento (las mismas alertas del resumen) repartidas por departamento, con un botón que lleva a la pantalla donde se arreglan.
- **Detalle técnico:** cada evento lleva `_k` (sellos por parte) y, al subir, el texto del plano que la persona tenía antes de tocarlo; el servidor y la app usan el mismo código de fusión (`mergeEv`, fusión de líneas a tres bandas). Las revisiones (`rev`) y los avisos (`avisos`) viven dentro del evento y se sincronizan como todo lo demás; las revisiones no cuentan como cambios en el historial. Un valor por defecto que añade la app a un evento antiguo no se sella, así que nunca pisa lo que haya escrito otra persona. Restaurar una copia o volver a una versión gana a todo lo anterior (incluido lo que la copia ya no tenía).
- **Qué sigue sin juntarse:** si dos personas tocan **exactamente lo mismo a la vez** (la misma línea del plano, el mismo campo) se queda lo del último que guarda; y una **lista entera** (tareas, proveedores, pagos) que modifican dos personas a la vez: gana la última.
- **Comprobado:** en el servidor real y con tres navegadores (Eventos, Cocina, Compras): cambios simultáneos de plano y menú, plano editado a la vez por Eventos y Cocina, Cocina trabajando sin conexión mientras Eventos sigue, Compras viendo el detalle de los cambios, avisos entre departamentos y la versión móvil; con la versión anterior la misma prueba falla.

### 1.8 Planos de fondo compartidos — *~1 día* — v01.59
- **Qué pasa hoy:** la imagen del salón sobre la que se dibuja el plano de mesas (el «plano de fondo», común o propio de un evento de catering) se guarda **solo en el navegador de quien la sube**. Todo lo demás del evento sí es de todo el equipo; esto no.
- **Qué hacer:** guardarla en el servidor (comprimida y aparte del documento de eventos, para no pasar el límite de la base de datos), que la vean todos los dispositivos, y pasar a compartida la que ya haya en cada navegador sin perderla.
- **Hecho cuando:** se sube el plano del salón desde un ordenador y se ve en la tablet de sala.

### 1.5 RGPD y datos de clientes — *~0,5 día* — v01.61
- Las **alergias son datos de salud** (categoría especial). Aviso de privacidad en el portal del cliente, texto de consentimiento, y política de conservación: anonimizar nombres y alergias de eventos cerrados pasado un plazo que decida el restaurante (p. ej. 12 meses).

### 1.6 Salud del sistema — *~0,5 día* — v01.61
- Pantalla «Estado» para admin (último guardado, último backup, errores recientes) y registro de errores del servidor, para enterarse antes de que lo note un camarero.
- **Tamaño del documento:** todo el negocio vive en un solo registro de la base de datos (límite de 2 MB por registro en D1). Medirlo, avisar al administrador cuando pase de ~1,5 MB y, si hace falta, pasar a un registro por evento.

---

## 3. Fase 2 — El día del evento (días 4–9)

### 2.1 Modo servicio — *2–3 días* — v01.62
- **Qué:** una pantalla pensada para móvil, con letra grande, para sala y cocina durante el evento:
  - escaleta **en directo** (qué toca ahora, qué viene, cuánto dura la parada en curso);
  - botón por plato/tiempo «**Salido**» con hora real, visible para todos en segundos (reutiliza el latido de 5 s ya existente);
  - plano con **alergias por mesa** en grande y búsqueda de invitado;
  - llegada de invitados (marcar presentes) y recuento en vivo;
  - incidencias rápidas («falta pan en mesa 4») que ve el responsable.
- **Hecho cuando:** dos móviles ven el mismo estado en menos de 6 s; tras el evento queda el **registro real de horas** (comparado con la escaleta prevista).

### 2.2 Turnos y horas de camareros — *~2 días* — v01.63
- **Qué:** asignar personal a cada evento (ya hay disponibilidad, alta/baja y reparto por tiempos); registrar **hora real de entrada y salida**; total de horas por camarero y por mes; exportación a Excel/CSV para la gestoría. Hoja por camarero con sus funciones y su horario.
- **Hecho cuando:** al cerrar un evento sale el resumen «María · 7,5 h · barra» y el CSV mensual cuadra.

### 2.3 Cierre del evento — *~1 día* — v01.63
- Lista de cierre (cobros pendientes, devoluciones de material, incidencias, nota para la próxima vez) y paso del evento a «celebrado» con su resumen económico real frente a lo presupuestado (conecta con Rentabilidad).

---

## 4. Fase 3 — Comunicación (días 10–14)

### 3.1 Avisos por correo — *1–2 días* — v01.64
- **Qué:** resumen diario/semanal al equipo («esta semana: 3 eventos · faltan 2 pagos · 4 camareros por avisar»); recordatorios al cliente (enviar la lista, pagos, reunión); aviso a camareros marcados «Avisar» con los datos de su turno.
- **Detalle técnico:** envío mediante servicio de correo (punto 1.3); como Pages no ejecuta tareas programadas, el disparo se hace con una acción programada que llama a un endpoint protegido. Tabla `outbox` con intentos y estado; plantillas editables en Parámetros.
- **Hecho cuando:** llega el resumen del lunes a las 8:00 y un recordatorio de lista a un cliente de prueba; cada envío queda registrado.

### 3.2 WhatsApp con un clic — *~0,5 día* — v01.64
- Botones «Avisar por WhatsApp» con el mensaje ya redactado (camareros, clientes, proveedores) mediante enlace directo (`wa.me`), sin necesidad de API de pago.

### 3.3 Portal del cliente ampliado — *~2 días* — v01.65
- El cliente puede **aprobar la minuta y el menú** (con su fecha y nombre), subir su logo y fotos, ver el plano y dejar comentarios al equipo. Cada aprobación queda en el historial del evento.

---

## 5. Fase 4 — Parte comercial y compras (semanas 3–4)

### 4.1 Presupuesto → contrato → firma — *2–3 días* — v01.66
- PDF de propuesta y de contrato desde el presupuesto del evento (plantilla editable en Parámetros), aceptación online en el portal del cliente (nombre, fecha y hora), registro de la señal. *Firma electrónica simple: si se necesita validez reforzada, se valorará un proveedor de firma externo.*

### 4.2 Compras por proveedor — *~2 días* — v01.67
- A partir de producción: pedido **agrupado por proveedor** (con teléfono/correo), envío por correo o WhatsApp, y control de **recepción** (lo pedido frente a lo llegado). Conecta con inventario y con los precios de «Análisis de compras».

### 4.3 Consultas y disponibilidad — *~2 días* — v01.68
- Formulario web (con protección anti-spam) que crea una **consulta** en la app; calendario de disponibilidad por fecha y salón (usa Previsión + eventos); seguimiento hasta confirmar → se convierte en evento con un clic.

---

## 6. Calidad continua (en paralelo)

- **Auditoría con varios revisores** de toda la app (diseño, coherencia de cifras, accesibilidad, móvil): pendiente; se hace antes de la fase 3.
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

El orden se puede cambiar según la urgencia real del restaurante: cualquier
elemento de las fases 2–4 puede adelantarse sin depender de los anteriores,
**salvo** los de la fase 1, que conviene tener antes de fiarlo todo al programa.
