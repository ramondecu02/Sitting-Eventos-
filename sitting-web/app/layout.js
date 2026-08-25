export const metadata = {
  title: "Sitting Castell Vidal",
  description: "Editor del plano de mesas para bodas y eventos de Castell Vidal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
