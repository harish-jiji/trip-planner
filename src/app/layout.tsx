import { Metadata } from 'next';
import "./globals.css";

export const metadata: Metadata = {
  title: 'Trip Planner',
  description: 'Plan routes, track budgets, and share your itineraries natively.',
};
import "leaflet/dist/leaflet.css";
import ClientAuthProvider from "@/components/ClientAuthProvider";

import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background-light dark:bg-background-dark transition-colors duration-300 font-display relative">
        <ClientAuthProvider>
          <NotificationProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </NotificationProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
