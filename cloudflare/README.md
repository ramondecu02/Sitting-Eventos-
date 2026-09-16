# Les Moles Events — app en Cloudflare (Worker + D1)

App completa de gestión de bodas y eventos: página de bienvenida, inicio de
sesión con **usuarios y roles**, y el panel de gestión (resumen, plano de sala,
invitados, banquete, producción, compras, servicio, bebidas, proveedores,
presupuesto, cronología, tareas, fotografías, documentos e inventario).

- **Frontend**: `public/index.html` (un único HTML autónomo).
- **Backend**: `src/worker.js` (Cloudflare Worker) con API real.
- **Datos**: Cloudflare **D1** (`lesmoles-events`), ya creada en la cuenta.

## Qué hace el backend
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/me` | GET | Estado de sesión. Si no hay usuarios, indica `setup`. |
| `/api/setup` | POST | Crea el **primer administrador** (solo si no existe ninguno). |
| `/api/login` | POST | Inicia sesión (email + contraseña) → cookie firmada. |
| `/api/logout` | POST | Cierra la sesión. |
| `/api/store` | GET/PUT | Documento compartido del negocio (eventos, inventario…). |
| `/api/users` | GET/POST/DELETE | Gestión de usuarios (solo administrador). |

La sesión es una cookie **HttpOnly, Secure, firmada con HMAC** (`SESSION_SECRET`).
Las contraseñas se guardan con **PBKDF2-SHA256** (100k iteraciones) + salt.

Roles: `admin`, `eventos`, `cocina`, `compras`, `servicio`. El administrador crea
al resto del equipo desde **«Usuarios y roles»** (barra lateral).

## Desplegar conectando el repositorio de GitHub (recomendado)
1. Panel de Cloudflare → **Workers & Pages → Create → Workers → Connect to Git**.
2. Elige el repositorio `ramondecu02/sitting-eventos-` (rama de trabajo actual).
3. **Root directory / directorio raíz**: `cloudflare`
   - Build command: *(vacío)* · Deploy command: `npx wrangler deploy`
   - (Cloudflare detecta `wrangler.toml`; el binding D1 y los assets ya están configurados.)
4. Crea el secreto de sesión: Worker → **Settings → Variables and Secrets → Add → Secret**
   - Nombre: `SESSION_SECRET` · Valor: una cadena aleatoria larga, p. ej.
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
5. **Deploy**. Cloudflare da una URL `https://lesmoles-events.<tu-subdominio>.workers.dev`.
6. Abre la URL → **crea la cuenta de administrador** → ya estás dentro.

Cada `git push` a la rama vuelve a desplegar automáticamente.

## Alternativa: desplegar desde tu ordenador (Wrangler)
```bash
cd cloudflare
npm install
npx wrangler login
npx wrangler secret put SESSION_SECRET   # pega una cadena aleatoria larga
npx wrangler deploy
```

## Base de datos
La D1 `lesmoles-events` (id `d972615b-2a59-4fa1-8126-3f3de7e39cc6`) ya está creada
y con el esquema aplicado. Para recrear el esquema en otro entorno:
```bash
npx wrangler d1 execute lesmoles-events --remote --file=./schema.sql
```

## Dominio propio
Worker → **Settings → Domains & Routes → Add → Custom Domain**
(p. ej. `eventos.lesmoles.com`). Cloudflare gestiona el certificado.

## Notas
- El mismo `index.html` funciona como **vista previa** (Artifact) sin backend:
  detecta que no hay API y entra en modo demostración local. Desplegado en el
  Worker usa la API real (login, sesión y datos compartidos por todo el equipo).
- El documento compartido se guarda como un único JSON (fila `id=1` de `store`);
  el frontend fusiona por evento al leer (gana el cambio más reciente), igual que
  la versión anterior con Postgres.
