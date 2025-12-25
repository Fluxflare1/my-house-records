import "./globals.css";

export const metadata = {
  title: "My House Records",
  description: "Rent, bills, payments, statements and receipt tracking.",
  manifest: "/manifest.webmanifest"
};

export const viewport = {
  themeColor: "#000000"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>{children}</body>
    </html>
  );
}
