'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { UserAddress } from '@/types';
import { MapPin, Search } from 'lucide-react';

// Dynamic import Leaflet map component with ssr: false
const LeafletMap = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl bg-zinc-800 animate-pulse flex items-center justify-center text-xs text-zinc-500">
      Memuat Peta OpenStreetMap...
    </div>
  ),
});

interface AddressPickerProps {
  onSaveAddress: (address: Omit<UserAddress, 'id'>) => void;
  initialAddress?: UserAddress | null;
  onCancel?: () => void;
}

export default function LocationPickerModal({
  onSaveAddress,
  initialAddress,
  onCancel,
}: AddressPickerProps) {
  const [label, setLabel] = useState(initialAddress?.label || 'Rumah');
  const [province, setProvince] = useState(initialAddress?.province || '');
  const [regency, setRegency] = useState(initialAddress?.regency || '');
  const [district, setDistrict] = useState(initialAddress?.district || '');
  const [fullAddress, setFullAddress] = useState(initialAddress?.fullAddress || '');
  const [benchmark, setBenchmark] = useState(initialAddress?.benchmark || '');
  const [isDefault, setIsDefault] = useState(initialAddress?.isDefault || false);

  const [position, setPosition] = useState<[number, number]>([
    initialAddress?.lat || -6.2088,
    initialAddress?.lng || 106.8456, // Default Jakarta
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Nominatim Geocoding Search
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=id`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newLat = parseFloat(first.lat);
        const newLng = parseFloat(first.lon);
        setPosition([newLat, newLng]);

        if (first.display_name && !fullAddress) {
          setFullAddress(first.display_name);
        }
      } else {
        alert('Lokasi tidak ditemukan. Coba ketik nama kota/kecamatan yang lebih spesifik.');
      }
    } catch (err) {
      console.error('Geocoding error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!province || !regency || !district || !fullAddress) {
      alert('Mohon lengkapi Provinsi, Kabupaten/Kota, Kecamatan, dan Detail Alamat.');
      return;
    }

    onSaveAddress({
      label,
      province,
      regency,
      district,
      fullAddress,
      benchmark,
      lat: position[0],
      lng: position[1],
      isDefault,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-noir-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 text-zinc-100 shadow-2xl my-8">
        <h3 className="font-serif text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500" />
          <span>{initialAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Label Alamat (misal: Rumah, Kantor, Kost)
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Rumah"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Provinsi
              </label>
              <input
                type="text"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Jawa Barat"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Kabupaten / Kota
              </label>
              <input
                type="text"
                required
                value={regency}
                onChange={(e) => setRegency(e.target.value)}
                placeholder="Bandung"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Coblong"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Detail Alamat Lengkap (Jalan, RT/RW, No. Rumah)
            </label>
            <textarea
              required
              rows={2}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="Jl. Ir. H. Juanda No. 123, RT 02/RW 05"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Patokan (Opsional)
            </label>
            <input
              type="text"
              value={benchmark}
              onChange={(e) => setBenchmark(e.target.value)}
              placeholder="Depan Masjid Al-Ikhlas / Pagar Hitam"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-amber-300 mb-2">
              Pin Point Lokasi Pengiriman (Leaflet OpenStreetMap)
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari lokasi di peta (contoh: Dago Bandung)..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleSearchLocation}
                disabled={isSearching}
                className="px-4 py-2 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isSearching ? 'Mencari...' : 'Cari'}</span>
              </button>
            </div>

            <div className="w-full h-48 rounded-xl overflow-hidden border border-zinc-700 relative">
              <LeafletMap position={position} setPosition={setPosition} />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Klik lokasi tepat pada peta di atas untuk menggeser pin koordinat: {position[0].toFixed(5)}, {position[1].toFixed(5)}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded accent-amber-400 bg-zinc-800 border-zinc-700"
            />
            <label htmlFor="isDefault" className="text-xs text-zinc-300">
              Jadikan sebagai alamat default
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 font-bold text-xs shadow-lg hover:brightness-110 transition"
            >
              Simpan Alamat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
