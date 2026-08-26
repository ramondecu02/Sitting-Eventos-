export const metadata = {
  title: "Sitting Les Moles Events",
  description: "Editor del plano de mesas para bodas y eventos de Les Moles Events.",
};

/* Sin esto, Next.js pone un viewport por defecto que SÍ permite pellizcar para
   hacer zoom. Se desactiva aquí (solo afecta a /login, que es la única otra
   página además de "/"; "/" sirve sitting.html tal cual y trae su propia
   etiqueta <meta name="viewport"> con el mismo criterio, ver sitting.html). */
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
