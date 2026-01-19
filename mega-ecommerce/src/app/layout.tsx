import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/redux";

export const metadata: Metadata = {
  title: "Mega Ecommerce - Best Online Shopping Experience",
  description: "Shop the latest products with amazing deals. Premium quality products at best prices.",
  keywords: "ecommerce, online shopping, best deals, products, shop",
};

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ReduxProvider>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
