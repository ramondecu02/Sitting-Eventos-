# Les Moles Events — Roadmap para usar el programa al 100 %

Documento vivo. Última actualización: versión **01.56** (octubre 2026).
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

### 1.3 App instalable y con modo sin conexión — *~1 día* — v01.57
- **Qué:** icono en la pantalla del móvil/tablet; los eventos del día quedan guardados para **consultar** aunque falle el wifi del salón; los cambios hechos sin conexión se guardan y **se sincronizan al volver**, con aviso claro («sin conexión · 3 cambios pendientes»).
- **Detalle técnico:** `manifest.webmanifest`, `sw.js` (caché de la app y del último documento), iconos; el guardado ya es local primero («Guardado en este dispositivo»), solo falta la cola de subida.
- **Hecho cuando:** con el avión activado se abre la escaleta del día, se marca algo, y al recuperar la red aparece en otro dispositivo.

### 1.4 Permisos finos por rol y usuarios reales — *~0,5 día* — v01.57
- Matriz clara de qué ve/edita cada rol (p. ej. cocina no ve precios; servicio no cambia el plano). Alta de las personas reales de la lista 1.1. Cierre de sesión por inactividad.

### 1.5 RGPD y datos de clientes — *~0,5 día* — v01.57
- Las **alergias son datos de salud** (categoría especial). Aviso de privacidad en el portal del cliente, texto de consentimiento, y política de conservación: anonimizar nombres y alergias de eventos cerrados pasado un plazo que decida el restaurante (p. ej. 12 meses).

### 1.6 Salud del sistema — *~0,5 día* — v01.57
- Pantalla «Estado» para admin (último guardado, último backup, errores recientes) y registro de errores del servidor, para enterarse antes de que lo note un camarero.

---

## 3. Fase 2 — El día del evento (días 4–9)

### 2.1 Modo servicio — *2–3 días* — v01.58
- **Qué:** una pantalla pensada para móvil, con letra grande, para sala y cocina durante el evento:
  - escaleta **en directo** (qué toca ahora, qué viene, cuánto dura la parada en curso);
  - botón por plato/tiempo «**Salido**» con hora real, visible para todos en segundos (reutiliza el latido de 5 s ya existente);
  - plano con **alergias por mesa** en grande y búsqueda de invitado;
  - llegada de invitados (marcar presentes) y recuento en vivo;
  - incidencias rápidas («falta pan en mesa 4») que ve el responsable.
- **Hecho cuando:** dos móviles ven el mismo estado en menos de 6 s; tras el evento queda el **registro real de horas** (comparado con la escaleta prevista).

### 2.2 Turnos y horas de camareros — *~2 días* — v01.59
- **Qué:** asignar personal a cada evento (ya hay disponibilidad, alta/baja y reparto por tiempos); registrar **hora real de entrada y salida**; total de horas por camarero y por mes; exportación a Excel/CSV para la gestoría. Hoja por camarero con sus funciones y su horario.
- **Hecho cuando:** al cerrar un evento sale el resumen «María · 7,5 h · barra» y el CSV mensual cuadra.

### 2.3 Cierre del evento — *~1 día* — v01.59
- Lista de cierre (cobros pendientes, devoluciones de material, incidencias, nota para la próxima vez) y paso del evento a «celebrado» con su resumen económico real frente a lo presupuestado (conecta con Rentabilidad).

---

## 4. Fase 3 — Comunicación (días 10–14)

### 3.1 Avisos por correo — *1–2 días* — v01.60
- **Qué:** resumen diario/semanal al equipo («esta semana: 3 eventos · faltan 2 pagos · 4 camareros por avisar»); recordatorios al cliente (enviar la lista, pagos, reunión); aviso a camareros marcados «Avisar» con los datos de su turno.
- **Detalle técnico:** envío mediante servicio de correo (punto 1.3); como Pages no ejecuta tareas programadas, el disparo se hace con una acción programada que llama a un endpoint protegido. Tabla `outbox` con intentos y estado; plantillas editables en Parámetros.
- **Hecho cuando:** llega el resumen del lunes a las 8:00 y un recordatorio de lista a un cliente de prueba; cada envío queda registrado.

### 3.2 WhatsApp con un clic — *~0,5 día* — v01.60
- Botones «Avisar por WhatsApp» con el mensaje ya redactado (camareros, clientes, proveedores) mediante enlace directo (`wa.me`), sin necesidad de API de pago.

### 3.3 Portal del cliente ampliado — *~2 días* — v01.61
- El cliente puede **aprobar la minuta y el menú** (con su fecha y nombre), subir su logo y fotos, ver el plano y dejar comentarios al equipo. Cada aprobación queda en el historial del evento.

---

## 5. Fase 4 — Parte comercial y compras (semanas 3–4)

### 4.1 Presupuesto → contrato → firma — *2–3 días* — v01.62
- PDF de propuesta y de contrato desde el presupuesto del evento (plantilla editable en Parámetros), aceptación online en el portal del cliente (nombre, fecha y hora), registro de la señal. *Firma electrónica simple: si se necesita validez reforzada, se valorará un proveedor de firma externo.*

### 4.2 Compras por proveedor — *~2 días* — v01.63
- A partir de producción: pedido **agrupado por proveedor** (con teléfono/correo), envío por correo o WhatsApp, y control de **recepción** (lo pedido frente a lo llegado). Conecta con inventario y con los precios de «Análisis de compras».

### 4.3 Consultas y disponibilidad — *~2 días* — v01.64
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
| 1–3 | Copias y papelera · historial · app instalable y sin conexión · permisos · RGPD · estado | 01.54–01.57 |
| 4–9 | Modo servicio · turnos y horas · cierre de evento | 01.58–01.59 |
| 10–14 | Avisos por correo · WhatsApp · portal ampliado | 01.60–01.61 |
| 15–28 | Contrato y firma · compras por proveedor · consultas | 01.62–01.64 |

El orden se puede cambiar según la urgencia real del restaurante: cualquier
elemento de las fases 2–4 puede adelantarse sin depender de los anteriores,
**salvo** los de la fase 1, que conviene tener antes de fiarlo todo al programa.
