'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '@/types';
import { SEED_PRODUCTS } from '@/data/seed-products';
import ProductCard from '@/components/ProductCard';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import { Sparkles, ShieldCheck, Truck, Clock, AlertCircle } from 'lucide-react';
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
          // Fallback to static seed data if Firestore is empty
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
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900 via-noir-900 to-noir-900">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Koleksi Eksklusif Pre-Order Haute Couture</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-zinc-100 tracking-tight leading-tight">
            Keanggunan Murni dalam{' '}
            <span className="bg-gradient-to-r from-amber-200 via-rose-400 to-amber-400 bg-clip-text text-transparent">
              Setiap Helai Jahitan
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Gaun pilihan berkualitas tinggi buatan penjahit berpengalaman. Setiap detail dirancang untuk memberikan kenyamanan, estetika mewah, dan kesan percaya diri tanpa tanding.
          </p>

          <div className="flex flex-wrap justify-center gap-6 pt-4 text-xs font-medium text-zinc-300">
            <div className="flex items-center gap-2 bg-zinc-800/60 px-4 py-2 rounded-full border border-zinc-700">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>PO Maksimal 30 Hari (Jahit & Kirim)</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-800/60 px-4 py-2 rounded-full border border-zinc-700">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Gratis Ongkir Seluruh Indonesia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Carousel Ulasan Pelanggan */}
        <section>
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl font-bold text-zinc-100">
              Ulasan Pelanggan Setia
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Pengalaman keanggunan gaun Trunch Store dari pembeli di seluruh Indonesia
            </p>
          </div>
          <TestimonialCarousel />
        </section>

        {/* Catalog Grid Section */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-800 pb-4 gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-zinc-100 tracking-tight">
                Katalog Gaun Terbaru
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Pilih gaun favoritmu dan langsung lakukan checkout
              </p>
            </div>
            <span className="text-xs text-amber-400 font-mono">
              Total {products.length} Desain Eksklusif
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl bg-zinc-800/50 animate-pulse border border-zinc-800"
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

        {/* Terms & Conditions Section */}
        <section className="bg-noir-800/60 rounded-3xl border border-zinc-800 p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
            <div>
              <h3 className="font-serif text-2xl font-bold text-zinc-100">
                Terms & Conditions (Ketentuan Layanan)
              </h3>
              <p className="text-xs text-zinc-400">
                Harap dibaca dengan cermat sebelum melakukan pemesanan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs text-zinc-300 leading-relaxed">
            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-2">
              <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                1. Sistem Pre-Order (PO)
              </h4>
              <p>
                Seluruh gaun diproduksi khusus (custom sewing). Proses pengerjaan jahit hingga siap dikirim membutuhkan waktu <strong>maksimal 30 hari kalender</strong> terhitung sejak pembayaran dikonfirmasi oleh sistem.
              </p>
            </div>

            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-2">
              <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                2. Gratis Ongkos Kirim
              </h4>
              <p>
                Trunch Store memberikan penawaran <strong>Gratis Ongkir ke seluruh wilayah Indonesia</strong> tanpa minimum pembelian. Nominal harga yang dibayar di checkout sudah final (sama dengan harga setelah diskon).
              </p>
            </div>

            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 space-y-2">
              <h4 className="font-bold text-rose-400 text-sm flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                3. Pembatalan & Penukaran
              </h4>
              <p>
                Order yang sudah masuk ke status produksi tidak dapat dibatalkan. Penukaran ukuran hanya diperbolehkan jika terjadi cacat produksi dari pihak kami dengan melampirkan video unboxing penuh tanpa terpotong.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
