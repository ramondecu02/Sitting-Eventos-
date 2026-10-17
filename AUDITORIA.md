# Auditoría completa de Les Moles Events · 17 de octubre de 2026

Revisión de toda la aplicación con **8 agentes de auditoría en paralelo**, cada uno con su propio servidor de pruebas y sus propios datos, en solo lectura:

| Nº | Área | Qué se probó |
|---|---|---|
| 1 | Navegación, roles y coherencia global | 51 secciones con el administrador y con cada rol; atajos, buscador, teclado, textos |
| 2 | Plano, listado, marcasitios y montaje | analizador de texto, arrastrar, deshacer, geometría, 444 invitados, móvil |
| 3 | Menú y cocina | cuadre de cantidades entre 9 pantallas, alergias, escaleta, producción, pedidos, bebida |
| 4 | Parte comercial | presupuesto, fechas, camareros, modo servicio, copias, privacidad, inventario |
| 5 | Servidor y seguridad | autenticación, permisos de cada ruta por rol, portal, correo, RGPD, XSS, concurrencia |
| 6 | Diseño, accesibilidad y móvil | 52 pantallas × 3 tamaños con axe, modo oscuro, teclado, rendimiento, sin conexión |
| 7 | PDF y minutas | 16 documentos, las 89 plantillas del diseñador con nombres reales |
| 8 | Portal del cliente y comunicaciones | el portal en móvil, correo, consultas web, flujos de los novios |

**Lo bueno, para empezar:** ningún error de JavaScript en 156 recorridos de pantalla; sin scroll horizontal ni a 320 px; totales del presupuesto idénticos en 5 pantallas y en el portal; modo servicio sincroniza dos móviles en menos de 5 s y reenvía lo hecho sin conexión; copias, papelera e historial restauran bien; los tokens del portal están aislados entre eventos; las consultas SQL van todas parametrizadas; imágenes y adjuntos se validan por firma; arranque en 0,55 s y sin fugas de memoria.

**Lo grave, en una línea:** los permisos por rol solo existen en la pantalla, no en el servidor; hay un hueco de seguridad alimentaria con quien solo viene al aperitivo (ya corregido); y el portal puede decir «enviado» cuando no se ha guardado nada.

---

## 1. Ya corregido (versiones 01.97 y 01.98)

Ver «Novedad de la versión 01.97» y «Novedad de la versión 01.98» en `ROADMAP.md`. La 01.99 (**Seatings**, el diseñador de carteles de mesa) es una función nueva pedida aparte y no cambia este plan.

**Fase A en curso:** ✅ puntos 2 y 3 hechos en la **02.00** (sesiones de verdad, bloqueo de entrada por equipo, tope y orden del documento; «archivar eventos antiguos» queda para la 02.01 junto con el RGPD). Quedan el 4 (RGPD) y el 1 (permisos por rol en el servidor). Resumen:

**01.97** — alergias de quien solo viene al aperitivo en todos los avisos · lista de alergias con comas · «cuñado», «Menéndez», «sin alergias», mesas «Directivos» / «Família Rodó» · PDF sin «?» y sin alergias recortadas, con la dieta junto a la alergia · Supr y Ctrl+Z solo en el plano · «faltan N días» con el cambio de hora · modo oscuro en Coordinación, Estado y diseñador · teclado (el editor del plano ya no estorba) · zoom permitido · avisos del móvil · icono de Servicio en directo · permisos de pantalla (portal, Borrar, atajos vetados) · cerrar sesión limpia el documento del dispositivo · servidor: 400 en vez de 500, fecha de modificación acotada.

**01.98** — portal que solo confirma lo guardado (envío de lista, archivos, justificantes con importe a la española, minuta a tamaño completo) · duplicar evento sin datos del cliente · borrar mesa limpia geometría y montaje · consulta web → evento con contacto y mensaje · euros y números a la española en toda la app (Cierre, Pedidos, Documentos, señal «1.000») · presupuesto PDF en A4, con señal, sin notas internas ni líneas a 0 · deshacer al quitar pagos y extras, sin «Primer pago» duplicado · avisos coherentes con el estado del evento y con `alta` · camareros quitados de la agenda · contrato con dos firmantes «aceptado» solo si firman los dos · dinero oculto a cocina y servicio · aviso de sesión caducada o rol cambiado en cualquier pantalla · plurales («1 mesa», «1 ud») · listado impreso con «solo aperitivo» y etiquetas con «+N» · `/api/propuestas` solo administración y eventos · importes y saludos de los correos · plano impreso con «+N» en vez de recortar alergias · nombres de pila con partículas · importar «Maria + Pere» como dos comensales · vaciar la fecha de un evento (ya no reaparece) · exportar sin invitados avisa.

**Lo que NO he tocado a propósito:** las erratas del contrato (decisión tuya, punto 32), las reglas de redondeo y de cuenta entre pantallas (decisión tuya, punto 9) y todo lo que cambia la estructura (permisos en el servidor, sesiones, portal con identificadores por persona…): están en el plan de abajo, esperando tu confirmación.

---

## 2. Plan paso a paso (necesito tu confirmación antes de empezar cada paso grande)

Ordenado por importancia. **E** = esfuerzo (S pequeño, M medio, L grande); **R** = riesgo de romper algo.

### Fase A · Seguridad y datos personales (lo que no se puede dejar)

1. **Permisos reales por rol en el servidor.** Hoy cocina, servicio, compras y contabilidad pueden leer **todo** el documento (`GET /api/store`: precios, pagos, DNI, IBAN, enlaces privados de los clientes) y reescribir precios y pagos con una petición directa; con el enlace de un cliente pueden incluso escribir como si fueran él. Propuesta: el servidor recorta lo que se lee y rechaza lo que se escribe fuera de las secciones de cada rol, y `/api/propuestas` solo para administración y eventos y sin el token. *E: L · R: medio (la fusión de eventos asume el documento entero; se prueba rol por rol).* **Decisión tuya:** qué ve exactamente cada rol (la matriz actual de `ROLES` vale como punto de partida).
2. **Sesiones de verdad.** Cerrar sesión o cambiar la contraseña invalida la sesión en el servidor (hoy la cookie sigue valiendo 14 días); contraseña temporal obligatoria también en el servidor; cierre por inactividad en el servidor; bloqueo del login por IP además de por correo (hoy cualquiera puede bloquear al administrador con 5 intentos); respuesta única ante usuario inexistente. *E: M · R: bajo.*
3. **Tope y orden en el documento.** El servidor acepta documentos de cualquier tamaño y claves inventadas que luego no se pueden quitar; en D1 real, pasar de ~1-2 MB haría fallar todos los guardados. Propuesta: rechazo suave por encima de ~1,5 MB, claves conocidas, id de texto en cada evento, archivar eventos antiguos. *E: M · R: bajo.*
4. **RGPD completo.** «Quitar a una persona» deja teléfono, notas, DNI, título del evento y el portal activo; el correo de una consulta borrada sigue en la bandeja hasta 180 días; el registro de actividad guarda correos; las copias manuales no caducan. Propuesta: borrar de verdad en todas las tablas, mostrar «qué queda», lista blanca al anonimizar, purgas diarias. *E: M · R: medio.*
5. ~~**Duplicar evento sin datos del cliente**~~ ✅ hecho en la 01.98.

### Fase B · Seguridad alimentaria y cuadre de cocina

6. **Estado único por persona** («por revisar / decidido / confirmado por cocina») visible en Resumen, Alergias, Escaleta y PDF. Hoy una persona con alergia pasa a «Decidido» aunque queden platos «a revisar», y de fábrica hay 0 de 346 ingredientes confirmados. *E: S–M · R: bajo.*
7. **Revisión de alérgenos por plato** (botón «Revisar este plato» que confirme todos sus ingredientes), diccionario del borrador ampliado (ñoquis, española, crumble, holandesa, bearnesa, puré, escabeche, pesto, caldo de pollo…) y permiso de **cocina para confirmar alérgenos** (hoy ningún rol salvo administración puede, y las pantallas le dicen «revisa en Parámetros»). *E: M · R: bajo.* **Decisión tuya:** confirmación de alérgenos por quién.
8. **Platos sustitutivos y aperitivos adaptados en Producción, Qué preparar y Pedidos** (hoy salen como «1 ración» sin ingredientes y falta producto en el pedido). *E: M · R: medio.*
9. **Una sola fuente de verdad para las cantidades.** Hoy: el jamón sale 4,28 / 4,27 / 4,66 kg según la pantalla; una corrección a mano en la Escaleta no llega a Producción, Pedidos ni Check list; «Unidades por persona» tampoco; Producción redondea al más cercano y Pedidos hacia arriba (11 adultos: «Focaccia 0 uds» y pedido de 1); el aperitivo suma 45 o 55 según la pantalla; Bebida ignora a los «solo aperitivo». *E: M · R: medio (hay que fijar la regla y probarla en las 9 pantallas).* **Decisión tuya:** reglas de redondeo y de cuenta (¿staff y niños cuentan en el aperitivo?).
10. **Clave estable por invitado** en Alergias y Escaleta (hoy es «mesa|nombre»: mover a alguien de mesa le pierde su aperitivo adaptado, y dos «Joan» en la misma mesa comparten el «Sin cambios»). *E: M · R: medio.*

### Fase C · Plano e invitados

11. **Banda de validación del plano**: mesa con más gente que plazas, nombres repetidos, mesas renumeradas en silencio, etiquetas no reconocidas («VIP», «silla de ruedas») que hoy no salen en el PDF. *E: M · R: bajo.*
12. **Pantalla = PDF.** Una sola función de filas para listado y marcasitios: hoy el PDF cuenta distinto a los «solo aperitivo», pierde las notas libres y la pantalla saca 13 tarjetas donde el PDF saca 11. *E: M · R: medio.*
13. **Móvil y tableta del plano**: arrastrar el plano con un dedo, ajuste automático al ancho, «Deshacer» a la vista. *E: M · R: bajo.*
14. **Un solo analizador en cliente y servidor** (el portal y el equipo cuentan distinto: comentarios `//`, «solo aperitivo», «Joan +»). *E: M · R: medio.*
15. Giro del plano sin solapes ni apilar mesas; borrar una mesa limpia su geometría y su montaje; los «lados» del Montaje cambian también el plano; importar «Maria + Pere» como dos personas; etiqueta de alergias del plano impreso con «+N» en vez de recortar; nombres de pila con partículas («María de los Ángeles»). *E: S–M cada uno.*

### Fase D · Portal del cliente y comunicaciones

16. **Confirmaciones que no mientan.** ✅ Lo esencial está hecho en la 01.98 (el portal solo dice «enviado» o «recibido» si el servidor lo ha guardado). Queda: reintento al volver la conexión, «Sin guardar» visible y mensajes siempre en castellano. *E: S · R: bajo.*
17. **Lista de invitados del cliente con identificador por persona y fusión.** Dos móviles con el mismo enlace se pisan (gana el último sin aviso); corregir una errata renombra a la persona y le pierde el `*`, el plato sustitutivo y su sitio; la × de una mesa del portal borra la mesa en el plano en 1 segundo. Propuesta: id estable por persona, fusión, y que el plano solo cambie al pulsar «Enviar» (con revisión de lo que se borra o renombra). *E: M–L · R: medio-alto.* **Decisión tuya:** ¿pasar al plano solo al «Enviar» y no cada vez que teclean?
18. **Estados coherentes entre pantallas**: contrato con 2 firmantes y 1 firma sale «aceptado» en Avisos, Resumen y Portal; menú «aprobado» aunque haya cambiado; el paso «lista» significa a la vez «enviar el documento» y «recibir su lista» (el cron les pide la lista que ya enviaron); la minuta publicada es una imagen fija que no avisa de que cambió. *E: M · R: medio.*
19. **Confirmar justificante → registrar el pago**; avisos por correo en ambos sentidos (equipo avisado cuando el cliente escribe o firma, cliente avisado cuando se le contesta); un solo IBAN/correo/concepto (portal, correo y contrato muestran cuentas distintas); saludo con nombres de pila («Hola Marta y Jordi»); importes siempre «4.660,00 €» y sin duplicar («pago de 1485 € («Primer pago… 1.485,00 €»)»). *E: M · R: bajo.*
20. **Minuta publicada**: enlace a tamaño completo y aviso «cambió desde que se publicó». *E: S–M.*

### Fase E · Interfaz y coherencia

21. **Diálogos propios** en lugar de los 24 `confirm()`, 10 `prompt()` y 5 `alert()` nativos, con una función común (foco, trampa de Tab, Esc, devolver el foco). Hoy «Equipo y accesos», «Mi contraseña» y la contraseña temporal no atrapan el foco ni se cierran con Esc. *E: M · R: medio (muchos sitios).*
22. **Navegación**: hash en la URL (que Atrás y recargar funcionen y se puedan enviar enlaces entre compañeros); buscador con sinónimos («invitados», «minuta», «pax», «pdf», «cobro» no encuentran nada); cambiar de evento sin perder la sección; mover «Borrar evento» a Inicio y Resumen. *E: M · R: bajo.*
23. **Barra inferior del móvil** con 4-5 destinos fijos y «Más» (hoy hay 14 botones y «Buscar» y «Más» quedan a ~1.000 px de scroll); «Servicio en directo» destacado el día del evento; banner «no es hoy» y confirmación en «Salido». *E: M · R: bajo.*
24. **Permisos de pantalla restantes**: importes y «Pendiente de cobro» en Home/Resumen/Documentos y el PDF del presupuesto para cocina y servicio; bloque de DNI y contrato para compras y contabilidad; matriz de roles que no permita marcar pantallas que el servidor no admite; leer el rol al volver a la pestaña. *E: S–M · R: bajo.*
25. **Vocabulario y formatos únicos**: invitados / comensales / pax, minuta / menú para invitados, email / correo, «Check list» / «Checklist»; una sola función para euros, fechas y plurales («1 mesas», «1 bebés», «1 uds»); Listado, Marcasitios y Montaje en catalán por defecto en una app en castellano. *E: S–M · R: bajo.*
26. **Sistema de diseño**: ~50 tamaños de letra, 751 colores sueltos, 331 selectores repetidos, `.btn/.badge/.seg/.toggle` en dos capas, 141 declaraciones de ≤10,5 px; pasar un chequeo de modo oscuro y de contraste en cada versión. *E: L · R: medio.*
27. **Rendimiento con bodas grandes** (320 invitados: Alergias y Producción tardan 1,5 s, escribir en el plano 45-70 ms por tecla): memoizar el análisis del plano. **Service worker**: abrir al instante con la copia guardada y actualizar detrás (hoy puede esperar 6 s sin cobertura). *E: M / S · R: bajo.*

### Fase F · Documentos

28. **Incrustar tipografía en todos los PDF** (como ya hace el contrato con Carlito): quita los «?» para siempre y alinea el PDF con la pantalla. *E: M · R: bajo.*
29. **Diseñador de minutas**: con «Marta Vidal y Jordi Ferré» unas 30 de las 89 plantillas solapan el nombre con la fecha, los adornos o los logos; con menús largos 87 de 89 quedan por debajo de 6 pt. Propuesta: autoajustar el nombre a una línea, aviso «texto reducido al X %», semáforo de legibilidad. *E: M · R: medio.*
30. **Presupuesto PDF**: plan de pagos coherente con la app (señal + 65 % + resto), «IVA incluido», sin líneas a 0, sin imprimir las notas internas, papel A4 propio (hoy hereda el del plano). *E: S–M · R: bajo.*
31. **Idioma del cliente** (`ficha.idioma`) para portal, correos y documentos; alérgenos y etiquetas en catalán en los documentos en catalán. *E: L · R: medio.* **Decisión tuya.**
32. **Contrato**: el catalán repite la cláusula «Tercera» y desplaza la numeración; el castellano mantiene erratas («Efectivida de la reserva», «con la fin»). **Las dejé tal cual porque pediste conservar el texto de vuestro Word**; ¿quieres corregirlas? *E: S.* **Decisión tuya.**

---

## 3. Decisiones que necesito de ti

1. Fase A.1: ¿qué ve cada rol? (propongo partir de la matriz actual).
2. Fase B.7: ¿quién confirma los alérgenos (cocina, administración o ambos)?
3. Fase B.9: reglas de cuenta y redondeo de cantidades.
4. Fase D.17: ¿el plano cambia solo al «Enviar» del cliente?
5. Fase F.31 / F.32: idioma por cliente y erratas del contrato.
6. Orden: mi recomendación es **A → B → D.16 → C → resto**, empezando por A.1, B.6-B.7 y D.16 (los tres con más riesgo para el negocio).
