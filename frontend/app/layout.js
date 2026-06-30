import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import StitchLoader from "@/components/StitchLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "PulseGuard — AI-Powered Emergency Medical Assistance",
  description: "When every second matters, PulseGuard turns your device into an intelligent emergency companion. AI triage, SOS alerts, live tracking, and more.",
  keywords: "emergency, medical, AI, triage, SOS, health, tracking, hospital finder",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#15803D" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <StitchLoader>
            {children}
          </StitchLoader>
        </AuthProvider>
      </body>
    </html>
  );
}
