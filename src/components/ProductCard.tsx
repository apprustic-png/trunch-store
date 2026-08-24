'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Sparkles, ArrowRight, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(product.price);

  const formattedOriginalPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(product.originalPrice);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative bg-noir-800/80 rounded-2xl overflow-hidden border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 flex flex-col hover:shadow-2xl hover:shadow-brand-600/10 transform hover:-translate-y-1"
    >
      {/* Discount Badge */}
      {product.discountPercent > 0 && (
        <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-brand-600 to-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <Tag className="w-3 h-3" />
          <span>Diskon {product.discountPercent}%</span>
        </div>
      )}

      {/* Image Gallery Thumbnail */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
        <img
          src={product.images[0]}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      {/* Product Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
            {product.category}
          </span>
          <h3 className="font-serif text-lg font-bold text-zinc-100 mt-1 group-hover:text-amber-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-amber-300">
                {formattedPrice}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-xs text-zinc-500 line-through">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
              ✓ Gratis Ongkir Seluruh Indonesia
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-zinc-800 group-hover:bg-amber-400 group-hover:text-zinc-950 text-zinc-300 flex items-center justify-center transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
