import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: {
    default: "Subscription Autopsy — find every charge you forgot about",
    template: "%s · Subscription Autopsy",
  },
  description:
    "Upload a bank statement and find every recurring subscription hiding in it — including the price hikes you never noticed.",
  themeColor: "#0F1B2B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-paper font-body">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
