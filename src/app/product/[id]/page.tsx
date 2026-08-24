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
  updateDoc,
} from 'firebase/firestore';
import {
  Tag,
  Truck,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  ShieldAlert,
  ChevronLeft,
  Lock,
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

  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [existingPendingOrder, setExistingPendingOrder] = useState<Order | null>(null);
  const [showPendingModal, setShowPendingModal] = useState<boolean>(false);

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

  useEffect(() => {
    if (profile?.addresses && profile.addresses.length > 0) {
      const defaultAddr = profile.addresses.find((a) => a.isDefault) || profile.addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div
          className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-6"
          style={{ borderColor: '#f4b8c8', borderTopColor: 'transparent' }}
        />
        <p className="text-sm" style={{ color: '#9a8278' }}>Memuat detail gaun...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🌸</div>
        <h2 className="font-serif text-2xl font-bold mb-3" style={{ color: '#2d2520' }}>
          Produk Tidak Ditemukan
        </h2>
        <p className="text-sm mb-8" style={{ color: '#9a8278' }}>
          Gaun yang kamu cari tidak tersedia di katalog kami.
        </p>
        <button onClick={() => router.push('/')} className="btn-primary">
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

  const handleSaveNewAddress = async (newAddrData: Omit<UserAddress, 'id'>) => {
    if (!user || !profile) return;
    const newAddress: UserAddress = { ...newAddrData, id: `addr-${Date.now()}` };
    const updatedAddresses = newAddrData.isDefault
      ? profile.addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddress)
      : [...profile.addresses, newAddress];
    try {
      await updateDoc(doc(db, 'users', user.uid), { addresses: updatedAddresses });
      await refreshProfile();
      setSelectedAddressId(newAddress.id);
      setShowAddressModal(false);
    } catch (err) {
      console.error('Failed to save address', err);
      alert('Gagal menyimpan alamat. Coba lagi.');
    }
  };

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
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        where('status', '==', 'pending'),
        where('productId', '==', product.id)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0];
        const existingData = { id: existingDoc.id, ...existingDoc.data() } as Order;
        setExistingPendingOrder(existingData);
        setShowPendingModal(true);
        setSubmitting(false);
        return;
      }
      await createNewPendingOrder(selectedAddr);
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Terjadi kesalahan saat memulai checkout. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

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
      note,
      addressSnapshot: addrSnapshot,
      status: 'pending',
      lynkProductUuid: product.lynkProductUuid,
      checkoutUrl: product.checkoutUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'orders'), newOrder);
    alert(
      `Pastikan email yang kamu isi di halaman pembayaran sama dengan email akun kamu (${user.email}) di www.trunch.store. Jika mengalami kendala, hubungi +62 851-7994-2243.`
    );
    window.open(product.checkoutUrl, '_blank');
    setSubmitting(false);
    router.push('/client');
  };

  const handleContinueExistingOrder = () => {
    if (!existingPendingOrder) return;
    setShowPendingModal(false);
    alert(
      `Pastikan email yang kamu isi di halaman pembayaran sama dengan email akun kamu (${user?.email}) di www.trunch.store.`
    );
    window.open(existingPendingOrder.checkoutUrl, '_blank');
    router.push('/client');
  };

  const handleCreateNewReplaceOrder = async () => {
    if (!existingPendingOrder || !user || !profile) return;
    setShowPendingModal(false);
    setSubmitting(true);
    try {
      await deleteDoc(doc(db, 'orders', existingPendingOrder.id));
      const selectedAddr = profile.addresses.find((a) => a.id === selectedAddressId) || profile.addresses[0];
      await createNewPendingOrder(selectedAddr);
    } catch (err) {
      console.error('Error replacing order', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-sm mb-8 transition-colors"
        style={{ color: '#9a8278' }}
        onMouseOver={e => (e.currentTarget.style.color = '#c45573')}
        onMouseOut={e => (e.currentTarget.style.color = '#9a8278')}
      >
        <ChevronLeft className="w-4 h-4" />
        Kembali ke Katalog
      </button>

      {/* Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <div
            className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden"
            style={{ background: '#f9f3ec', border: '1px solid #f2e8d9' }}
          >
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 badge-discount flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
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
                className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 transition-all"
                style={{
                  border: selectedImage === img ? '2.5px solid #c45573' : '1.5px solid #f2e8d9',
                  opacity: selectedImage === img ? 1 : 0.65,
                  transform: selectedImage === img ? 'scale(0.96)' : 'scale(1)',
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Purchase Section */}
        <div className="space-y-7">
          {/* Title & Price */}
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: '#d4a853' }}
            >
              {product.category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2 leading-tight" style={{ color: '#2d2520' }}>
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-serif text-3xl font-bold" style={{ color: '#c45573' }}>
                {formattedPrice}
              </span>
              {product.discountPercent > 0 && (
                <span className="text-sm line-through" style={{ color: '#c4a99a' }}>
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
            <p className="text-xs font-medium mt-2 flex items-center gap-1.5" style={{ color: '#4caf84' }}>
              <Truck className="w-3.5 h-3.5" />
              Harga Sudah Final • Gratis Ongkir Seluruh Indonesia
            </p>
          </div>

          {/* Description & Specs */}
          <div
            className="py-6 space-y-4 text-sm"
            style={{ borderTop: '1.5px solid #f2e8d9', borderBottom: '1.5px solid #f2e8d9' }}
          >
            <p className="leading-relaxed" style={{ color: '#6b5b52' }}>{product.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: '#9a8278' }}>
              <div>• Bahan: <span style={{ color: '#4a3f38' }}>{product.specs.material}</span></div>
              <div>• Warna: <span style={{ color: '#4a3f38' }}>{product.specs.color}</span></div>
              <div>• Gaya: <span style={{ color: '#4a3f38' }}>{product.specs.style}</span></div>
              <div>• Musim: <span style={{ color: '#4a3f38' }}>{product.specs.seasonAge}</span></div>
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#4a3f38' }}>
              Pilih Ukuran
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className="py-3 rounded-xl text-sm font-bold transition-all"
                  style={
                    selectedSize === size
                      ? {
                          background: 'linear-gradient(135deg, #c45573, #e8839a)',
                          color: 'white',
                          border: '2px solid #c45573',
                          boxShadow: '0 4px 16px rgba(196,85,115,0.25)',
                        }
                      : {
                          background: 'white',
                          color: '#6b5b52',
                          border: '1.5px solid #e8d5bc',
                        }
                  }
                >
                  {size}
                </button>
              ))}
            </div>
            {product.sizeChart[selectedSize] && (
              <p
                className="text-xs font-medium p-3 rounded-xl"
                style={{
                  background: '#fff8ec',
                  border: '1px solid #f0d898',
                  color: '#b8860b',
                }}
              >
                📏 Ukuran {selectedSize}: {product.sizeChart[selectedSize]}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold" style={{ color: '#4a3f38' }}>
              Catatan untuk Penjahit (Opsional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Tolong lingkar dada disesuaikan 88cm, atau minta diperpanjang 3cm..."
              className="input-field resize-none"
            />
          </div>

          {/* Address Selection */}
          <div
            className="p-4 rounded-2xl space-y-3"
            style={{ background: '#fdf3f6', border: '1.5px solid #f4b8c8' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#2d2520' }}>
                <MapPin className="w-4 h-4" style={{ color: '#c45573' }} />
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
                className="text-xs font-medium flex items-center gap-1 transition"
                style={{ color: '#c45573' }}
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Alamat Baru
              </button>
            </div>

            {profile?.addresses && profile.addresses.length > 0 ? (
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="input-field"
              >
                {profile.addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    [{addr.label}] {addr.fullAddress}, {addr.district}, {addr.regency}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs" style={{ color: '#9a8278' }}>
                Belum ada alamat tersimpan. Klik &quot;Tambah Alamat Baru&quot; untuk menambahkan.
              </p>
            )}
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleInitiateCheckout}
            disabled={submitting}
            className="w-full py-4 rounded-full font-extrabold text-base text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            style={{
              background: submitting
                ? '#c4a99a'
                : 'linear-gradient(135deg, #c45573 0%, #d4a853 100%)',
              boxShadow: submitting ? 'none' : '0 8px 32px rgba(196,85,115,0.3)',
            }}
          >
            <span>{submitting ? 'Memproses Order...' : 'CHECKOUT SEKARANG'}</span>
            <ExternalLink className="w-5 h-5" />
          </button>

          <p className="text-[11px] text-center flex items-center justify-center gap-1" style={{ color: '#b8a09a' }}>
            <Lock className="w-3 h-3" />
            Tanpa Keranjang Belanja • 1 Checkout = 1 Produk • Pembayaran Aman via Lynk.id
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

      {/* Pending Order Modal */}
      {showPendingModal && existingPendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="max-w-md w-full p-8 rounded-3xl shadow-2xl space-y-6 text-center"
            style={{ background: 'white', border: '1.5px solid #f4b8c8' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: '#fff8ec', border: '2px solid #d4a853' }}
            >
              <ShieldAlert className="w-8 h-8" style={{ color: '#d4a853' }} />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold" style={{ color: '#2d2520' }}>
                Order Pending Ditemukan
              </h3>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: '#7a6258' }}>
                Order kamu sebelumnya untuk gaun{' '}
                <strong style={{ color: '#2d2520' }}>{existingPendingOrder.productName}</strong> masih berstatus{' '}
                <span className="font-bold" style={{ color: '#d4a853' }}>PENDING</span>, mau dilanjutkan?
              </p>
            </div>

            <div
              className="p-4 rounded-xl text-xs text-left space-y-1"
              style={{ background: '#fdf3f6', border: '1px solid #f4b8c8' }}
            >
              <div style={{ color: '#6b5b52' }}>• Ukuran Sebelumnya: <strong style={{ color: '#2d2520' }}>Ukuran {existingPendingOrder.size}</strong></div>
              <div style={{ color: '#6b5b52' }}>• Tanggal Order: <strong style={{ color: '#2d2520' }}>{new Date(existingPendingOrder.createdAt).toLocaleDateString('id-ID')}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleContinueExistingOrder}
                className="py-3 rounded-full font-bold text-sm text-white transition"
                style={{ background: 'linear-gradient(135deg, #c45573, #e8839a)' }}
              >
                Lanjutkan
              </button>
              <button
                onClick={handleCreateNewReplaceOrder}
                className="py-3 rounded-full font-bold text-sm transition"
                style={{ background: '#f9f3ec', border: '1.5px solid #e8d5bc', color: '#6b5b52' }}
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
