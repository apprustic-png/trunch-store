'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '@/types';
import { SEED_PRODUCTS } from '@/data/seed-products';
import ProductCard from '@/components/ProductCard';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { Sparkles, ShieldCheck, Truck, Clock, AlertCircle, ArrowDown } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[];
          setProducts(list.filter((p) => p.isActive !== false));
        } else {
          setProducts(
            SEED_PRODUCTS.map((p, idx) => ({
              ...p,
              id: p.lynkProductUuid || `prod-${idx}`,
              createdAt: new Date().toISOString(),
            }))
          );
        }
      } catch (err) {
        console.warn('Firestore fetch failed, fallback to local seed data', err);
        setProducts(
          SEED_PRODUCTS.map((p, idx) => ({
            ...p,
            id: p.lynkProductUuid || `prod-${idx}`,
            createdAt: new Date().toISOString(),
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="pb-24">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden min-h-[480px] flex items-center justify-center px-4 sm:px-6 py-20">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #fdf3f6 0%, #fdfaf7 40%, #f9f0e8 100%)',
          }}
        />
        {/* Decorative soft circles */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(244,184,200,0.25) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center space-y-7">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.18em]"
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1.5px solid #f4b8c8',
              color: '#c45573',
              boxShadow: '0 2px 12px rgba(196,85,115,0.10)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Koleksi Eksklusif Pre-Order Haute Couture</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]" style={{ color: '#2d2520' }}>
            Keanggunan Murni dalam{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #c45573 0%, #d4a853 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Setiap Helai Jahitan
            </span>
          </h1>

          {/* Sub-text */}
          <p
            className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#7a6258' }}
          >
            Gaun pilihan berkualitas tinggi buatan penjahit berpengalaman. Setiap detail dirancang untuk kenyamanan, estetika mewah, dan kesan percaya diri tanpa tanding.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium"
              style={{
                background: 'white',
                border: '1.5px solid #f2e8d9',
                color: '#7a6258',
                boxShadow: '0 2px 12px rgba(180,120,100,0.08)',
              }}
            >
              <Clock className="w-4 h-4" style={{ color: '#d4a853' }} />
              <span>PO Maks. 30 Hari (Jahit &amp; Kirim)</span>
            </div>
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium"
              style={{
                background: 'white',
                border: '1.5px solid #f2e8d9',
                color: '#7a6258',
                boxShadow: '0 2px 12px rgba(180,120,100,0.08)',
              }}
            >
              <Truck className="w-4 h-4" style={{ color: '#4caf84' }} />
              <span>Gratis Ongkir Seluruh Indonesia</span>
            </div>
          </div>

          {/* Scroll cue */}
          <div className="flex justify-center pt-6 animate-bounce">
            <ArrowDown className="w-5 h-5" style={{ color: '#e8d5bc' }} />
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pt-10">

        {/* Testimonials */}
        <section>
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-2" style={{ color: '#d4a853' }}>
              Apa Kata Pelanggan Kami
            </p>
            <h2 className="font-serif text-3xl font-bold" style={{ color: '#2d2520' }}>
              Ulasan Pelanggan Setia
            </h2>
            <p className="text-sm mt-2" style={{ color: '#9a8278' }}>
              Pengalaman keanggunan gaun Trunch Store dari pembeli di seluruh Indonesia
            </p>
          </div>
          <TestimonialCarousel />
        </section>

        {/* Catalog */}
        <section className="space-y-8">
          <div
            className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 gap-4"
            style={{ borderBottom: '1.5px solid #f2e8d9' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-1" style={{ color: '#d4a853' }}>
                Terbaru &amp; Terpilih
              </p>
              <h2 className="font-serif text-3xl font-bold" style={{ color: '#2d2520' }}>
                Katalog Gaun Eksklusif
              </h2>
              <p className="text-sm mt-1" style={{ color: '#9a8278' }}>
                Pilih gaun favoritmu dan langsung lakukan checkout
              </p>
            </div>
            <span
              className="text-xs font-mono px-4 py-2 rounded-full"
              style={{
                background: '#fff8ec',
                border: '1px solid #f0d898',
                color: '#b8860b',
              }}
            >
              {products.length} Desain Eksklusif
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-[450px] rounded-2xl animate-pulse"
                  style={{ background: '#f2e8d9' }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Terms & Conditions */}
        <section
          className="rounded-3xl p-8 sm:p-12 space-y-8"
          style={{
            background: 'linear-gradient(135deg, #fdf3f6 0%, #fffdf9 100%)',
            border: '1.5px solid #f4b8c8',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #c45573, #e8839a)' }}
            >
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold" style={{ color: '#2d2520' }}>
                Terms &amp; Conditions
              </h3>
              <p className="text-sm mt-1" style={{ color: '#9a8278' }}>
                Harap dibaca dengan cermat sebelum melakukan pemesanan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* T&C Card 1 */}
            <div
              className="p-6 rounded-2xl space-y-3"
              style={{ background: 'white', border: '1px solid #f2e8d9' }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: '#d4a853' }} />
                <h4 className="font-semibold text-sm" style={{ color: '#2d2520' }}>
                  1. Sistem Pre-Order (PO)
                </h4>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#7a6258' }}>
                Seluruh gaun diproduksi khusus (custom sewing). Proses pengerjaan hingga siap dikirim membutuhkan waktu{' '}
                <strong style={{ color: '#2d2520' }}>maksimal 30 hari kalender</strong> sejak pembayaran dikonfirmasi.
              </p>
            </div>

            {/* T&C Card 2 */}
            <div
              className="p-6 rounded-2xl space-y-3"
              style={{ background: 'white', border: '1px solid #f2e8d9' }}
            >
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" style={{ color: '#4caf84' }} />
                <h4 className="font-semibold text-sm" style={{ color: '#2d2520' }}>
                  2. Gratis Ongkos Kirim
                </h4>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#7a6258' }}>
                Trunch Store memberikan{' '}
                <strong style={{ color: '#2d2520' }}>Gratis Ongkir ke seluruh wilayah Indonesia</strong> tanpa minimum pembelian. Harga yang dibayar di checkout sudah final.
              </p>
            </div>

            {/* T&C Card 3 */}
            <div
              className="p-6 rounded-2xl space-y-3"
              style={{ background: 'white', border: '1px solid #f2e8d9' }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" style={{ color: '#c45573' }} />
                <h4 className="font-semibold text-sm" style={{ color: '#2d2520' }}>
                  3. Pembatalan &amp; Penukaran
                </h4>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#7a6258' }}>
                Order yang sudah masuk ke tahap produksi tidak dapat dibatalkan. Penukaran ukuran hanya diperbolehkan jika ada cacat produksi dengan{' '}
                <strong style={{ color: '#2d2520' }}>video unboxing penuh</strong>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
