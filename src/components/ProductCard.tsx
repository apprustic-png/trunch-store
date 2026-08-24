'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ArrowRight, Tag, Truck } from 'lucide-react';

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
    <Link href={`/product/${product.id}`} className="card-product group flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ background: '#f9f3ec' }}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient Overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(45,37,32,0.25) 0%, transparent 60%)' }} />

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-3 left-3">
            <span className="badge-discount flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              {product.discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Arrow on hover */}
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          style={{ background: 'white', color: '#c45573' }}>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#d4a853' }}>
          {product.category}
        </p>
        <h3 className="font-serif text-lg font-semibold leading-snug mb-3 group-hover:text-rose-600 transition-colors" style={{ color: '#2d2520' }}>
          {product.name}
        </h3>
        <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: '#8a7468' }}>
          {product.description}
        </p>

        {/* Price */}
        <div className="mt-auto pt-4 border-t" style={{ borderColor: '#f2e8d9' }}>
          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="font-serif text-xl font-bold" style={{ color: '#c45573' }}>
              {formattedPrice}
            </span>
            {product.discountPercent > 0 && (
              <span className="text-xs line-through" style={{ color: '#c4a99a' }}>
                {formattedOriginalPrice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium" style={{ color: '#4caf84' }}>
            <Truck className="w-3 h-3" />
            <span>Gratis Ongkir Seluruh Indonesia</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
