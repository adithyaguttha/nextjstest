import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import { AuthProvider } from "../lib/AuthContext";
import { Inter } from "next/font/google";
import AuthGuard from './components/AuthGuard';

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap"
});

export const metadata: Metadata = {
  title: "Knock Knock - Real Estate Platform",
  description: "Find your dream property with Knock Knock real estate platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <AuthProvider>
          <AuthGuard>
            <Navbar />
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
