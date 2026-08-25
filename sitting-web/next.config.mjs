/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle mínimo autocontenido (server.js + node_modules necesarios):
  // más fácil de desplegar en Render/Railway/Docker. Vercel lo soporta igual.
  output: "standalone",
};

export default nextConfig;
