'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Clarissa Maharani',
    city: 'Jakarta Selatan',
    rating: 5,
    comment: 'Jahitan Petal Whispers sangat rapi dan mengembang sempurna! Walaupun PO 30 hari, dalam 18 hari gaunnya sudah sampai di rumah. Sangat worth it!',
    product: 'Petal Whispers',
    avatar: 'CM',
  },
  {
    id: 2,
    name: 'Vanessa Anggraini',
    city: 'Surabaya',
    rating: 5,
    comment: 'Lavender Fly warnanya persis seperti di foto. Bahan tulle dan renda hitam transparannya mewah sekali. Gratis ongkir benar-benar 100% tanpa biaya tersembunyi.',
    product: 'Lavender Fly',
    avatar: 'VA',
  },
  {
    id: 3,
    name: 'Siti Nurhaliza',
    city: 'Bandung',
    rating: 5,
    comment: 'Oriental Raven ini perpaduan cheongsam modern yang unik banget. Sangat elegan dipake untuk event formal maupun semi formal. Udah jadi favorit wardrobe!',
    product: 'Oriental Raven',
    avatar: 'SN',
  },
  {
    id: 4,
    name: 'Fiona Lestari',
    city: 'Medan',
    rating: 5,
    comment: 'Pelayanan Trunch Store sangat responsif. Note catatan penjahit saya untuk pinggang direspon dengan sangat tepat. Will order again!',
    product: 'Coffee Muse',
    avatar: 'FL',
  },
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      go(1);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  function go(direction: number) {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + direction + TESTIMONIALS.length) % TESTIMONIALS.length);
      setAnimating(false);
    }, 200);
  }

  const current = TESTIMONIALS[currentIndex];

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8 sm:p-12"
      style={{
        background: 'linear-gradient(135deg, #fdf3f6 0%, #fffdf9 60%, #fdf0e8 100%)',
        border: '1.5px solid #f4b8c8',
        boxShadow: '0 8px 40px rgba(196, 85, 115, 0.08)',
      }}
    >
      {/* Decorative quote mark */}
      <div className="absolute top-6 left-6 pointer-events-none" style={{ color: '#f4b8c8', opacity: 0.4 }}>
        <Quote className="w-20 h-20" />
      </div>

      <div
        className="relative z-10 max-w-3xl mx-auto text-center transition-all duration-200"
        style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)' }}
      >
        {/* Stars */}
        <div className="flex justify-center gap-1 mb-5" style={{ color: '#d4a853' }}>
          {[...Array(current.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-current" />
          ))}
        </div>

        {/* Quote */}
        <p className="font-serif text-lg sm:text-xl italic leading-relaxed mb-8" style={{ color: '#4a3f38' }}>
          &ldquo;{current.comment}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center justify-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #c45573, #d4a853)' }}
          >
            {current.avatar}
          </div>
          <div className="text-left">
            <h5 className="font-semibold text-base" style={{ color: '#2d2520' }}>{current.name}</h5>
            <p className="text-xs" style={{ color: '#9a8278' }}>
              {current.city} &bull;{' '}
              <span style={{ color: '#c45573' }} className="font-medium">{current.product}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {TESTIMONIALS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: idx === currentIndex ? '#c45573' : '#e8d5bc',
              width: idx === currentIndex ? '24px' : '8px',
            }}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => go(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{ background: 'white', border: '1.5px solid #f2e8d9', color: '#c45573', boxShadow: '0 2px 10px rgba(196,85,115,0.1)' }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{ background: 'white', border: '1.5px solid #f2e8d9', color: '#c45573', boxShadow: '0 2px 10px rgba(196,85,115,0.1)' }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
