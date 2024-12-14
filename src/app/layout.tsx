import type { Metadata } from "next";
import "./globals.sass";

export const metadata: Metadata = {
  title: "OACI EFB",
  description: "OACI Map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
