/* Sirve sitting.html tal cual (bytes idénticos) en la raíz "/". El proxy.js
   ya ha comprobado la sesión antes de que esta petición llegue aquí. Se
   sirve como Route Handler (no como page.js de React) para que el <script>
   inline de sitting.html se ejecute de verdad — con dangerouslySetInnerHTML
   los <script> insertados no se ejecutan. */

import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "sitting.html");
let cached = null;

function html() {
  if (cached === null || process.env.NODE_ENV !== "production") {
    cached = fs.readFileSync(FILE_PATH, "utf8");
  }
  return cached;
}

export async function GET() {
  return new Response(html(), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
