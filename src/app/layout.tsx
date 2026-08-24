import React from 'react';
import ClientLayout from '@/components/ClientLayout';
import '@/app/globals.css';

export const metadata = {
  title: 'Trunch Store | Gaun Eksklusif Haute Couture',
  description:
    'Web Toko Online Resmi Trunch Store (trunch.store). Koleksi gaun haute couture eksklusif dengan sistem pre-order maksimal 30 hari dan gratis ongkir seluruh Indonesia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
