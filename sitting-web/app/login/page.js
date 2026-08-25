const PAGE_BG = "#E7E3D8";
const INK = "#2B2822";
const MUT = "#71695D";
const LINE = "#D8D2C3";
const GOLD = "#866430";
const RUBY = "#8E2C48";

export default async function LoginPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const wrong = sp.error === "1";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PAGE_BG,
        color: INK,
        fontFamily: "Karla, system-ui, sans-serif",
        padding: 20,
      }}
    >
      <form
        method="POST"
        action="/api/login"
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#FBFAF6",
          border: `1px solid ${LINE}`,
          borderRadius: 10,
          padding: "28px 26px",
          boxShadow: "0 12px 32px rgba(40,34,24,.10)",
        }}
      >
        <div style={{ marginBottom: 4, fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: 26 }}>
          Sitting
        </div>
        <div
          style={{
            fontSize: 9.5,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: MUT,
            marginBottom: 22,
          }}
        >
          Castell Vidal
        </div>

        <label htmlFor="password" style={{ fontSize: 12.5, color: MUT, display: "block", marginBottom: 6 }}>
          Contraseña del equipo
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "9px 11px",
            fontSize: 14,
            border: `1px solid ${LINE}`,
            borderRadius: 6,
            marginBottom: 14,
            background: "#fff",
            color: INK,
          }}
        />

        {wrong && (
          <p style={{ color: RUBY, fontSize: 12.5, margin: "0 0 14px" }}>
            Contraseña incorrecta. Inténtalo de nuevo.
          </p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px 12px",
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            background: GOLD,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
