'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, Order, UserAddress } from '@/types';
import { SEED_PRODUCTS } from '@/data/seed-products';
import { useAuth } from '@/context/AuthContext';
import LocationPickerModal from '@/components/LocationPickerModal';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Tag,
  Check,
  Truck,
  Clock,
  ExternalLink,
  AlertTriangle,
  MapPin,
  Plus,
  ShieldAlert,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { user, profile, signInWithGoogle, refreshProfile } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [note, setNote] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);

  // Pending Order Modal State
  const [existingPendingOrder, setExistingPendingOrder] = useState<Order | null>(null);
  const [showPendingModal, setShowPendingModal] = useState<boolean>(false);

  // Load product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!productId) return;
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          setSelectedImage(data.images[0] || '');
        } else {
          // Fallback search in seed products
          const found = SEED_PRODUCTS.find(
            (p) => p.lynkProductUuid === productId || p.name === productId
          );
          if (found) {
            const data: Product = {
              ...found,
              id: found.lynkProductUuid,
              createdAt: new Date().toISOString(),
            };
            setProduct(data);
            setSelectedImage(data.images[0] || '');
          }
        }
      } catch (err) {
        console.warn('Error fetching product', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  // Set default address when profile is available
  useEffect(() => {
    if (profile?.addresses && profile.addresses.length > 0) {
      const defaultAddr = profile.addresses.find((a) => a.isDefault) || profile.addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Memuat detail gaun...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Produk Tidak Ditemukan</h2>
        <p className="text-zinc-400 text-sm mb-6">Gaun yang kamu cari tidak tersedia.</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-amber-400 text-zinc-950 font-bold rounded-full text-xs"
        >
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedOriginalPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(product.originalPrice);

  // Address Save Handler
  const handleSaveNewAddress = async (newAddrData: Omit<UserAddress, 'id'>) => {
    if (!user || !profile) return;
    const newAddress: UserAddress = {
      ...newAddrData,
      id: `addr-${Date.now()}`,
    };

    const updatedAddresses = newAddrData.isDefault
      ? profile.addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddress)
      : [...profile.addresses, newAddress];

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { addresses: updatedAddresses });
      await refreshProfile();
      setSelectedAddressId(newAddress.id);
      setShowAddressModal(false);
    } catch (err) {
      console.error('Failed to save address', err);
      alert('Gagal menyimpan alamat. Coba lagi.');
    }
  };

  // Main Checkout Flow Trigger
  const handleInitiateCheckout = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }

    if (!profile?.phone || !profile?.addresses || profile.addresses.length === 0) {
      alert('Mohon lengkapi profil & alamat pengiriman kamu di Halaman Client terlebih dahulu sebelum checkout.');
      router.push('/client');
      return;
    }

    const selectedAddr = profile.addresses.find((a) => a.id === selectedAddressId) || profile.addresses[0];
    if (!selectedAddr) {
      alert('Silakan pilih atau tambahkan alamat pengiriman.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Check if user already has a pending order for THIS SAME product
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        where('status', '==', 'pending'),
        where('productId', '==', product.id)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Pending order exists! Prompt modal rule
        const existingDoc = snapshot.docs[0];
        const existingData = { id: existingDoc.id, ...existingDoc.data() } as Order;
        setExistingPendingOrder(existingData);
        setShowPendingModal(true);
        setSubmitting(false);
        return;
      }

      // 2. Create new pending order
      await createNewPendingOrder(selectedAddr);
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Terjadi kesalahan saat memulai checkout. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  // Create Order Helper
  const createNewPendingOrder = async (addrSnapshot: UserAddress) => {
    if (!user || !product) return;

    const newOrder: Omit<Order, 'id'> = {
      userId: user.uid,
      userEmail: user.email || '',
      userName: profile?.name || user.displayName || '',
      userPhone: profile?.phone || '',
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.images[0] || '',
      size: selectedSize,
      note: note,
      addressSnapshot: addrSnapshot,
      status: 'pending',
      lynkProductUuid: product.lynkProductUuid,
      checkoutUrl: product.checkoutUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'orders'), newOrder);

    // Notice popup & Open Lynk.id window
    alert(
      `Pastikan email yang kamu isi di halaman pembayaran sama dengan email akun kamu (${user.email}) di www.trunch.store. Jika mengalami kendala, hubungi +62 851-7994-2243.`
    );

    window.open(product.checkoutUrl, '_blank');
    setSubmitting(false);
    router.push('/client');
  };

  // Pending Modal Action: "Lanjutkan"
  const handleContinueExistingOrder = () => {
    if (!existingPendingOrder) return;
    setShowPendingModal(false);
    alert(
      `Pastikan email yang kamu isi di halaman pembayaran sama dengan email akun kamu (${user?.email}) di www.trunch.store. Jika mengalami kendala, hubungi +62 851-7994-2243.`
    );
    window.open(existingPendingOrder.checkoutUrl, '_blank');
    router.push('/client');
  };

  // Pending Modal Action: "Tidak" (Delete old pending order & create new)
  const handleCreateNewReplaceOrder = async () => {
    if (!existingPendingOrder || !user || !profile) return;
    setShowPendingModal(false);
    setSubmitting(true);

    try {
      // Delete old pending order
      await deleteDoc(doc(db, 'orders', existingPendingOrder.id));

      // Create new pending order
      const selectedAddr = profile.addresses.find((a) => a.id === selectedAddressId) || profile.addresses[0];
      await createNewPendingOrder(selectedAddr);
    } catch (err) {
      console.error('Error replacing order', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-brand-600 to-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg">
                Diskon {product.discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImage === img
                    ? 'border-amber-400 scale-95 shadow-md'
                    : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Buying Section */}
        <div className="space-y-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              {product.category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-100 mt-1">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-serif text-3xl font-bold text-amber-300">
                {formattedPrice}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-sm text-zinc-500 line-through">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              ✓ Harga Pas • Gratis Ongkir Seluruh Indonesia
            </p>
          </div>

          <div className="border-t border-b border-zinc-800/80 py-6 space-y-4 text-xs text-zinc-300">
            <p className="leading-relaxed text-zinc-300">{product.description}</p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-zinc-400">
              <div>• Bahan: {product.specs.material}</div>
              <div>• Warna: {product.specs.color}</div>
              <div>• Gaya: {product.specs.style}</div>
              <div>• Musim: {product.specs.seasonAge}</div>
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Pilih Ukuran (S, M, L, XL)
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                    selectedSize === size
                      ? 'bg-amber-400 border-amber-400 text-zinc-950 shadow-lg shadow-amber-400/10'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  Ukuran {size}
                </button>
              ))}
            </div>
            {product.sizeChart[selectedSize] && (
              <p className="text-xs text-amber-400/90 font-medium bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                Patokan Ukuran {selectedSize}: {product.sizeChart[selectedSize]}
              </p>
            )}
          </div>

          {/* Note Form for Tailor */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-200">
              "Note" (Catatan Bebas untuk Penjahit)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Tolong lingkar dada disesuaikan 88cm, atau minta diperpanjang 3cm..."
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-400 resize-none text-zinc-100"
            />
          </div>

          {/* Address Selection Preview */}
          <div className="space-y-3 bg-noir-800 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                Alamat Pengiriman
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    signInWithGoogle();
                  } else {
                    setShowAddressModal(true);
                  }
                }}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Alamat Baru
              </button>
            </div>

            {profile?.addresses && profile.addresses.length > 0 ? (
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
              >
                {profile.addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    [{addr.label}] {addr.fullAddress}, {addr.district}, {addr.regency}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-zinc-400">
                Belum ada alamat tersimpan. Klik "Tambah Alamat Baru" untuk menambahkan alamat.
              </p>
            )}
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleInitiateCheckout}
            disabled={submitting}
            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-brand-600 text-zinc-950 font-extrabold text-base shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <span>{submitting ? 'Memproses Order...' : 'CHECKOUT SEKARANG'}</span>
            <ExternalLink className="w-5 h-5" />
          </button>

          <p className="text-[11px] text-zinc-400 text-center">
            🔒 Tanpa Keranjang Belanja • 1 Checkout = 1 Produk • Pembayaran Aman via Lynk.id
          </p>
        </div>
      </div>

      {/* Address Picker Modal */}
      {showAddressModal && (
        <LocationPickerModal
          onSaveAddress={handleSaveNewAddress}
          onCancel={() => setShowAddressModal(false)}
        />
      )}

      {/* Pending Order Warning Modal (Single Pending Rule) */}
      {showPendingModal && existingPendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-noir-900 border border-amber-500/30 rounded-3xl max-w-md w-full p-6 text-zinc-100 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-zinc-100">
                Order Pending Ditemukan
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Order kamu sebelumnya untuk gaun <strong>{existingPendingOrder.productName}</strong> masih berstatus <span className="text-amber-400 font-bold uppercase">Pending</span> nih, mau dilanjutkan?
              </p>
            </div>

            <div className="bg-zinc-800/80 p-3 rounded-xl border border-zinc-700 text-xs text-zinc-300 text-left space-y-1">
              <div>• Ukuran Sebelumnya: <strong>Ukuran {existingPendingOrder.size}</strong></div>
              <div>• Tanggal Order: <strong>{new Date(existingPendingOrder.createdAt).toLocaleDateString('id-ID')}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleContinueExistingOrder}
                className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 font-bold text-xs shadow-lg hover:brightness-110 transition"
              >
                Lanjutkan
              </button>
              <button
                onClick={handleCreateNewReplaceOrder}
                className="w-full py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs border border-zinc-700 transition"
              >
                Tidak (Buat Baru)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
