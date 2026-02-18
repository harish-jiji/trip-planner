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
      <body className="bg-gray-50 dark:bg-black transition-colors duration-300">
        <ClientAuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
