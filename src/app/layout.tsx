import React from 'react';
import ClientLayout from '@/components/ClientLayout';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <head>
        <title>Trunch Store | Haute Couture & Premium Dresses</title>
        <meta
          name="description"
          content="Web Toko Online Resmi Trunch Store (trunch.store). Koleksi gaun haute couture eksklusif dengan sistem pre-order maksimal 30 hari dan gratis ongkir seluruh Indonesia."
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body className="bg-noir-900 text-zinc-100 font-sans min-h-screen flex flex-col antialiased selection:bg-brand-600 selection:text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
