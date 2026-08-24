'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </AuthProvider>
  );
}
