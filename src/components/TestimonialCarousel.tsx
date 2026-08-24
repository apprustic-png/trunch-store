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
    product: 'Petal Whispers'
  },
  {
    id: 2,
    name: 'Vanessa Anggraini',
    city: 'Surabaya',
    rating: 5,
    comment: 'Lavender Fly warnanya persis seperti di foto. Bahan tulle dan renda hitam transparannya mewah sekali. Gratis ongkir benar-benar 100% tanpa biaya tersembunyi.',
    product: 'Lavender Fly'
  },
  {
    id: 3,
    name: 'Siti Nurhaliza',
    city: 'Bandung',
    rating: 5,
    comment: 'Oriental Raven ini perpaduan cheongsam modern yang unik banget. Sangat elegan dipake untuk event formal maupun semi formal.',
    product: 'Oriental Raven'
  },
  {
    id: 4,
    name: 'Fiona Lestari',
    city: 'Medan',
    rating: 5,
    comment: 'Pelayanan Trunch Store sangat responsif. Note catatan penjahit saya untuk pinggang direspon dengan sangat tepat. Will order again!',
    product: 'Coffee Muse'
  }
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-noir-900 to-zinc-900 border border-amber-500/20 p-8 sm:p-12 my-12 shadow-2xl">
      <div className="absolute top-6 left-6 text-amber-500/10">
        <Quote className="w-24 h-24" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="flex justify-center gap-1 mb-4 text-amber-400">
          {[...Array(current.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <p className="font-serif text-lg sm:text-2xl italic text-zinc-200 leading-relaxed mb-6">
          "{current.comment}"
        </p>

        <div className="font-sans">
          <h5 className="font-bold text-amber-300 text-base">{current.name}</h5>
          <p className="text-xs text-zinc-400">{current.city} • <span className="text-rose-400 font-medium">{current.product}</span></p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition border border-zinc-700"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition border border-zinc-700"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
