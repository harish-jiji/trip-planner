import "./globals.css";
import "leaflet/dist/leaflet.css";
import ClientAuthProvider from "@/components/ClientAuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientAuthProvider>{children}</ClientAuthProvider>
      </body>
    </html>
  );
}
