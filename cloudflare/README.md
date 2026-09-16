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

## Desplegar como Cloudflare **Pages** conectando GitHub (recomendado)
Se despliega como **Pages** (URL `*.pages.dev`), no como Worker suelto.

1. Panel de Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**.
2. Elige el repositorio `ramondecu02/Sitting-Eventos-`.
3. Configura la compilación (**Set up builds and deployments**):
   - **Production branch / rama de producción**: `claude/les-moles-events-redesign-848773`
     (la rama donde vive esta app; si luego se fusiona a `main`, usa `main`).
   - **Root directory / directorio raíz**: `cloudflare`
   - **Build command / comando de compilación**: *(vacío)*
   - **Build output directory / directorio de salida**: `public`
   - Cloudflare lee `wrangler.toml`, que fija `pages_build_output_dir = ./public`
     y **el binding de D1 (`DB`) se aplica solo**: no hay que añadirlo a mano.
4. (Opcional pero recomendado) Secreto de sesión:
   **Settings → Variables and secrets → Add → tipo Secret**
   - Nombre: `SESSION_SECRET` · Valor: una cadena aleatoria larga, p. ej.
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
5. **Save and Deploy**. Cloudflare da una URL `https://lesmoles-events.pages.dev`.
6. Comprueba `https://<tu-url>/api/me` → debe responder
   `{"authed":false,"setup":true}`. Entonces abre la app → **crea la cuenta de
   administrador** → ya estás dentro.

Cada `git push` a la rama de producción vuelve a desplegar automáticamente.

> Si `/api/me` responde `{"error":"not-found"}`, se está sirviendo un
> despliegue **antiguo**: entra en el proyecto → pestaña **Deployments** →
> **Retry deployment** (o **Create deployment**) sobre el último commit, y
> confirma que el directorio de salida es `public`.

## Alternativa: desplegar desde tu ordenador (Wrangler, Pages)
```bash
cd cloudflare
npm install
npx wrangler login
npx wrangler pages deploy public --project-name=lesmoles-events
# Secreto de sesión (una sola vez):
npx wrangler pages secret put SESSION_SECRET --project-name=lesmoles-events
```

## Base de datos
La D1 `lesmoles-events` (id `d972615b-2a59-4fa1-8126-3f3de7e39cc6`) ya está creada
y con el esquema (`users`, `store`) **aplicado**. Para recrearlo en otro entorno:
```bash
npx wrangler d1 execute lesmoles-events --remote --file=./schema.sql
```

## Dominio propio
Pages → tu proyecto → **Custom domains → Set up a domain**
(p. ej. `eventos.lesmoles.com`). Cloudflare gestiona el certificado.

## Notas
- El mismo `index.html` funciona como **vista previa** (Artifact) sin backend:
  detecta que no hay API y entra en modo demostración local. Desplegado en el
  Worker usa la API real (login, sesión y datos compartidos por todo el equipo).
- El documento compartido se guarda como un único JSON (fila `id=1` de `store`);
  el frontend fusiona por evento al leer (gana el cambio más reciente), igual que
  la versión anterior con Postgres.
