import "./globals.css";

// The real <html> lives in [locale]/layout.tsx; this root only passes through.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
