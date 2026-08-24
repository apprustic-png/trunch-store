import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#2d2520', color: '#d4b8a8' }} className="py-14 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-serif text-xl font-bold text-white tracking-wider">TRUNCH</span>
            <span className="font-serif text-xl font-light text-rose-300 tracking-widest">STORE</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#b8a09a' }}>
            Elegansi tanpa batas dalam balutan gaun couture eksklusif. Sistem pre-order khusus menjamin keaslian, kualitas jahit haute couture, dan kesempurnaan di setiap detail.
          </p>
        </div>

        <div>
          <h4 className="font-sans text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: '#d4a853' }}>
            Ketentuan Layanan
          </h4>
          <ul className="text-sm space-y-2" style={{ color: '#b8a09a' }}>
            <li>• Pre-Order Maks. 30 Hari (Jahit + Kirim)</li>
            <li>• Gratis Ongkir Seluruh Indonesia</li>
            <li>• 1 Checkout = 1 Produk, Qty 1</li>
            <li>• Bantuan: +62 851-7994-2243</li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs font-bold tracking-[0.2em] uppercase mb-4" style={{ color: '#d4a853' }}>
            Domain Resmi
          </h4>
          <p className="text-base font-mono" style={{ color: '#f4b8c8' }}>
            www.trunch.store
          </p>
          <p className="text-xs mt-3" style={{ color: '#6b5b52' }}>
            © {new Date().getFullYear()} Trunch Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
