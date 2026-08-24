'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserProfile, UserAddress, Order } from '@/types';
import LocationPickerModal from '@/components/LocationPickerModal';
import { db } from '@/lib/firebase';
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import {
  User as UserIcon,
  MapPin,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Package,
  Truck,
  Sparkles,
  Phone,
} from 'lucide-react';

export default function ClientPage() {
  const { user, profile, refreshProfile, signInWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);

  // Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || user?.displayName || '');
      setPhone(profile.phone || '');
    }
  }, [profile, user]);

  // Realtime Orders Listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      // Sort by createdAt desc locally
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(list);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-noir-900 border border-zinc-800 rounded-3xl text-center space-y-6 shadow-2xl">
        <UserIcon className="w-16 h-16 text-amber-400 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-zinc-100">Halaman Client Area</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Silakan login dengan akun Google kamu untuk mengakses tracking order, manajemen alamat pengiriman, dan profil akun.
        </p>
        <button
          onClick={signInWithGoogle}
          className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-brand-600 text-zinc-950 font-bold text-sm shadow-lg hover:brightness-110 transition"
        >
          Login Google
        </button>
      </div>
    );
  }

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      alert('Mohon isi nomor WhatsApp aktif kamu.');
      return;
    }
    setSavingProfile(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name,
        phone,
      });
      await refreshProfile();
      alert('Profil berhasil diperbarui!');
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Address Handlers
  const handleSaveAddress = async (addrData: Omit<UserAddress, 'id'>) => {
    if (!profile) return;

    let updatedList: UserAddress[];
    if (editingAddress) {
      updatedList = profile.addresses.map((a) =>
        a.id === editingAddress.id ? { ...addrData, id: editingAddress.id } : a
      );
    } else {
      const newAddr: UserAddress = { ...addrData, id: `addr-${Date.now()}` };
      updatedList = [...profile.addresses, newAddr];
    }

    if (addrData.isDefault) {
      updatedList = updatedList.map((a) => ({
        ...a,
        isDefault: a.id === (editingAddress?.id || updatedList[updatedList.length - 1].id),
      }));
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { addresses: updatedList });
      await refreshProfile();
      setShowAddressModal(false);
      setEditingAddress(null);
    } catch (err) {
      console.error('Failed address save', err);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!profile || !confirm('Yakin ingin menghapus alamat ini?')) return;
    const updated = profile.addresses.filter((a) => a.id !== addrId);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { addresses: updated });
      await refreshProfile();
    } catch (err) {
      console.error('Failed address delete', err);
    }
  };

  // PO 30 days Countdown Helper
  const calculateDaysRemaining = (poDeadline?: string) => {
    if (!poDeadline) return 30;
    const diffMs = new Date(poDeadline).getTime() - new Date().getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Client Header Info */}
      <div className="bg-gradient-to-r from-noir-900 via-zinc-900 to-noir-900 p-6 sm:p-8 rounded-3xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shadow-lg">
            <img
              src={user.photoURL || '/placeholder-avatar.png'}
              alt={user.displayName || ''}
              className="w-full h-full object-cover rounded-full bg-zinc-900"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-zinc-100">
              {profile?.name || user.displayName}
            </h1>
            <p className="text-xs text-zinc-400">{user.email}</p>
            <p className="text-xs text-amber-400 font-medium mt-1">
              WA: {profile?.phone || 'Belum diisi'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-800/80 p-1.5 rounded-full border border-zinc-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-full transition ${
              activeTab === 'orders'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Pesanan Saya ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-5 py-2.5 rounded-full transition ${
              activeTab === 'addresses'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Alamat Pengiriman
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-full transition ${
              activeTab === 'profile'
                ? 'bg-amber-400 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Profil Akun
          </button>
        </div>
      </div>

      {/* TAB 1: ORDERS TRACKING */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-noir-800/40 rounded-3xl border border-zinc-800 space-y-3">
              <Package className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-zinc-300">
                Belum Ada Pesanan
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Kamu belum pernah melakukan checkout. Lihat katalog kami di homepage dan pilih gaun impianmu.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-noir-800/80 rounded-2xl border border-zinc-800 p-6 space-y-6 shadow-lg"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-2">
                  <div>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Order ID: {order.id}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-zinc-100 mt-0.5">
                      {order.productName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        order.status === 'pending'
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                          : order.status === 'done'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                      }`}
                    >
                      Status: {order.status}
                    </span>
                  </div>
                </div>

                {/* Status Tracking Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400 font-medium">
                    <span>Proses PO Jahit & Pengiriman</span>
                    {order.status !== 'pending' && (
                      <span className="text-amber-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        Hitung Mundur PO: {calculateDaysRemaining(order.poDeadline)} Hari Lagi
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[
                      'pending',
                      'order confirm',
                      'production',
                      'packaging',
                      'shipping',
                      'delivery',
                      'done',
                    ].map((st, i) => {
                      const statusOrderIndex = [
                        'pending',
                        'order confirm',
                        'production',
                        'packaging',
                        'shipping',
                        'delivery',
                        'done',
                      ].indexOf(order.status);

                      const isPassed = i <= statusOrderIndex;
                      return (
                        <div key={st} className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isPassed ? 'bg-amber-400' : 'bg-zinc-800'
                            }`}
                          />
                          <span className="block text-[9px] text-center text-zinc-500 truncate capitalize">
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
                  <div>
                    <span className="text-zinc-500 block">Detail Pilihan:</span>
                    <span className="text-zinc-200 font-bold">Ukuran {order.size}</span>
                    {order.note && (
                      <p className="text-zinc-400 mt-1 italic">"{order.note}"</p>
                    )}
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Total Biaya:</span>
                    <span className="text-amber-300 font-bold text-sm">
                      Rp{order.productPrice?.toLocaleString('id-ID')}
                    </span>
                    <span className="block text-[10px] text-emerald-400 mt-0.5">
                      ✓ Gratis Ongkir
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Alamat Tujuan:</span>
                    <span className="text-zinc-200 font-semibold">
                      [{order.addressSnapshot?.label}] {order.addressSnapshot?.fullAddress}
                    </span>
                  </div>
                </div>

                {/* Pending Order Notice & Pay Button */}
                {order.status === 'pending' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3">
                    <p className="text-xs text-amber-200 leading-relaxed">
                      ⚠️ <strong>Order kamu masih berstatus Pending.</strong> Pastikan email yang kamu isi di halaman pembayaran sama dengan email akun kamu (<strong>{user.email}</strong>) di www.trunch.store. Jika mengalami kendala, hubungi WhatsApp <strong>+62 851-7994-2243</strong>.
                    </p>
                    <button
                      onClick={() => window.open(order.checkoutUrl, '_blank')}
                      className="px-5 py-2 bg-amber-400 text-zinc-950 font-bold text-xs rounded-full hover:bg-amber-300 transition flex items-center gap-1.5"
                    >
                      <span>Lanjutkan Pembayaran via Lynk.id</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ADDRESS MANAGEMENT */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-zinc-100">
              Daftar Alamat Pengiriman
            </h3>
            <button
              onClick={() => {
                setEditingAddress(null);
                setShowAddressModal(true);
              }}
              className="px-4 py-2 bg-amber-400 text-zinc-950 font-bold text-xs rounded-full hover:bg-amber-300 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Alamat</span>
            </button>
          </div>

          {!profile?.addresses || profile.addresses.length === 0 ? (
            <div className="text-center py-12 bg-noir-800/40 rounded-2xl border border-zinc-800 text-zinc-500 text-xs">
              Belum ada alamat pengiriman tersimpan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-noir-800/80 p-5 rounded-2xl border border-zinc-800 space-y-3 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {addr.fullAddress}, Kec. {addr.district}, {addr.regency},{' '}
                    {addr.province}
                  </p>
                  {addr.benchmark && (
                    <p className="text-[11px] text-zinc-400">
                      Patokan: {addr.benchmark}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Pin Coordinate: {addr.lat?.toFixed(5)}, {addr.lng?.toFixed(5)}
                  </p>

                  <div className="flex gap-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        setEditingAddress(addr);
                        setShowAddressModal(true);
                      }}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto bg-noir-800/80 p-8 rounded-3xl border border-zinc-800 space-y-6">
          <h3 className="font-serif text-xl font-bold text-zinc-100">
            Pengaturan Profil Akun
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Email Terdaftar (Google Sign-In)
              </label>
              <input
                type="email"
                disabled
                value={user.email || ''}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nomor WhatsApp (Aktif)
              </label>
              <input
                type="text"
                required
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 font-bold text-xs shadow-lg hover:brightness-110 transition"
            >
              {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </form>
        </div>
      )}

      {/* Address Picker Modal */}
      {showAddressModal && (
        <LocationPickerModal
          onSaveAddress={handleSaveAddress}
          initialAddress={editingAddress}
          onCancel={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
        />
      )}
    </div>
  );
}
