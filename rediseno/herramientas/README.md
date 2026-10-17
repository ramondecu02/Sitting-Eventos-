# Herramientas del rediseño (solo para el prototipo; no forman parte de la app)

Sirven para regenerar `rediseno/prototipo.html` cuando cambie la app real. **No tocan la app**: solo la leen.

1. Arrancar una copia local de la app con datos de ejemplo (puerto 8790) y rellenarla con `datos_ejemplo.mjs`.
2. `capturar.mjs` abre cada sección real en un navegador, inyecta `traductor.js` y guarda su estructura traducida (`trans_*.json`).
   - Argumentos: `[claves] [salida.json] [prefijo]`. Variables: `BASE` (URL de la app) y `NOSWITCH=1`.
3. `generar.py` convierte esos JSON en `d9_data.js` (datos) y `a5_lay.html` (reglas de maquetación) del prototipo.

Las rutas de los scripts apuntan a la carpeta de trabajo donde se hicieron; hay que adaptarlas.
