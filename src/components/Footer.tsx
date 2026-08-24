import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-noir-900 border-t border-zinc-800 text-zinc-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-serif text-xl font-bold text-amber-300 tracking-wider mb-3">
            TRUNCH STORE
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Elegansi tanpa batas dalam balutan gaun couture eksklusif. Sistem pre-order khusus menjamin keaslian, kualitas jahit haute couture, dan kesempurnaan di setiap detail.
          </p>
        </div>

        <div>
          <h4 className="font-sans text-sm font-semibold text-zinc-200 uppercase tracking-widest mb-3">
            Ketentuan Layanan
          </h4>
          <ul className="text-sm space-y-2 text-zinc-400">
            <li>• Pre-Order Maksimal 30 Hari (Jahit & Pengiriman)</li>
            <li>• Gratis Ongkir Seluruh Indonesia</li>
            <li>• Satu Pembayaran per Produk</li>
            <li>• Bantuan WhatsApp: +62 851-7994-2243</li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-sm font-semibold text-zinc-200 uppercase tracking-widest mb-3">
            Domain Resmi
          </h4>
          <p className="text-sm text-amber-400 font-mono">
            www.trunch.store
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            © {new Date().getFullYear()} Trunch Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
