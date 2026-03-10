import "./globals.css";
import "leaflet/dist/leaflet.css";
import ClientAuthProvider from "@/components/ClientAuthProvider";

import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background-light dark:bg-background-dark transition-colors duration-300 font-display">
        <ClientAuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
