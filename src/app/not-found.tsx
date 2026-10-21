import "./globals.css";

export default function GlobalNotFound() {
  return (
    <html lang="en" data-reality="glass" data-theme="dark">
      <body style={{ display: "grid", placeItems: "center", minHeight: "100svh", padding: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: "clamp(4rem, 20vw, 12rem)" }}>404</h1>
          <p><a className="link-u" href="/">Back to Raktim Chandra&apos;s home page</a></p>
        </div>
      </body>
    </html>
  );
}
