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
} from 'firebase/firestore';
import {
  User as UserIcon,
  MapPin,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Package,
  Sparkles,
  Phone,
} from 'lucide-react';

export default function ClientPage() {
  const { user, profile, refreshProfile, signInWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || user?.displayName || '');
      setPhone(profile.phone || '');
    }
  }, [profile, user]);

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
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(list);
    });
    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-10 text-center space-y-6 rounded-3xl" style={{ background: 'white', border: '1.5px solid #f4b8c8', boxShadow: '0 8px 40px rgba(196, 85, 115, 0.10)' }}>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: 'linear-gradient(135deg, #fdf3f6, #fff8ec)' }}
        >
          <UserIcon className="w-10 h-10" style={{ color: '#c45573' }} />
        </div>
        <h2 className="font-serif text-2xl font-bold" style={{ color: '#2d2520' }}>Client Area</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#7a6258' }}>
          Silakan login dengan akun Google untuk mengakses tracking order, manajemen alamat, dan profil akun.
        </p>
        <button onClick={signInWithGoogle} className="btn-primary w-full">
          <Sparkles className="w-4 h-4" />
          Login dengan Google
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      alert('Mohon isi nomor WhatsApp aktif kamu.');
      return;
    }
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name, phone });
      await refreshProfile();
      alert('Profil berhasil diperbarui!');
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSavingProfile(false);
    }
  };

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
      await updateDoc(doc(db, 'users', user.uid), { addresses: updatedList });
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
      await updateDoc(doc(db, 'users', user.uid), { addresses: updated });
      await refreshProfile();
    } catch (err) {
      console.error('Failed address delete', err);
    }
  };

  const calculateDaysRemaining = (poDeadline?: string) => {
    if (!poDeadline) return 30;
    const diffMs = new Date(poDeadline).getTime() - new Date().getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const STATUS_ORDER = ['pending', 'order confirm', 'production', 'packaging', 'shipping', 'delivery', 'done'];

  const getStatusColor = (status: string) => {
    if (status === 'pending') return { bg: '#fff8ec', border: '#f0d898', text: '#b8860b' };
    if (status === 'done') return { bg: '#f0fff7', border: '#a8e6c1', text: '#2d7a50' };
    return { bg: '#fdf3f6', border: '#f4b8c8', text: '#c45573' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Client Header */}
      <div
        className="p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, #fdf3f6 0%, #fffdf9 50%, #fff8ec 100%)',
          border: '1.5px solid #f4b8c8',
          boxShadow: '0 4px 24px rgba(196, 85, 115, 0.08)',
        }}
      >
        {/* Avatar + Info */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <div className="absolute inset-0 rounded-full p-0.5" style={{ background: 'linear-gradient(135deg, #c45573, #d4a853)' }}>
              <img
                src={user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User')}
                alt={user.displayName || ''}
                className="w-full h-full object-cover rounded-full"
                style={{ background: '#fdf3f6' }}
              />
            </div>
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold" style={{ color: '#2d2520' }}>
              {profile?.name || user.displayName}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#9a8278' }}>{user.email}</p>
            <p className="text-xs font-medium mt-1 flex items-center gap-1" style={{ color: '#d4a853' }}>
              <Phone className="w-3 h-3" />
              {profile?.phone || 'Nomor WA belum diisi'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 rounded-full text-xs font-semibold" style={{ background: 'white', border: '1.5px solid #f2e8d9' }}>
          {[
            { key: 'orders', label: `Pesanan (${orders.length})` },
            { key: 'addresses', label: 'Alamat' },
            { key: 'profile', label: 'Profil' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="px-5 py-2.5 rounded-full transition-all"
              style={
                activeTab === tab.key
                  ? {
                      background: 'linear-gradient(135deg, #c45573, #e8839a)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(196,85,115,0.2)',
                    }
                  : { color: '#9a8278' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          {orders.length === 0 ? (
            <div
              className="text-center py-20 rounded-3xl space-y-4"
              style={{ background: '#fdfaf7', border: '1.5px solid #f2e8d9' }}
            >
              <Package className="w-12 h-12 mx-auto" style={{ color: '#e8d5bc' }} />
              <h3 className="font-serif text-lg font-bold" style={{ color: '#2d2520' }}>
                Belum Ada Pesanan
              </h3>
              <p className="text-xs max-w-sm mx-auto" style={{ color: '#9a8278' }}>
                Kamu belum pernah melakukan checkout. Lihat katalog kami dan pilih gaun impianmu!
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const statusColor = getStatusColor(order.status);
              const statusIndex = STATUS_ORDER.indexOf(order.status);
              return (
                <div
                  key={order.id}
                  className="rounded-2xl p-6 space-y-5"
                  style={{ background: 'white', border: '1px solid #f2e8d9', boxShadow: '0 4px 20px rgba(180,120,100,0.06)' }}
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ borderBottom: '1.5px solid #f2e8d9', paddingBottom: '1rem' }}>
                    <div>
                      <span className="text-[11px] font-mono" style={{ color: '#c4a99a' }}>ID: {order.id}</span>
                      <h4 className="font-serif text-lg font-bold mt-0.5" style={{ color: '#2d2520' }}>
                        {order.productName}
                      </h4>
                    </div>
                    <span
                      className="text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-auto"
                      style={{ background: statusColor.bg, border: `1px solid ${statusColor.border}`, color: statusColor.text }}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs" style={{ color: '#9a8278' }}>
                      <span>Proses PO Jahit &amp; Pengiriman</span>
                      {order.status !== 'pending' && (
                        <span className="flex items-center gap-1 font-mono" style={{ color: '#d4a853' }}>
                          <Clock className="w-3 h-3" />
                          {calculateDaysRemaining(order.poDeadline)} Hari Lagi
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {STATUS_ORDER.map((st, i) => (
                        <div key={st} className="space-y-1">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{ background: i <= statusIndex ? '#c45573' : '#f2e8d9' }}
                          />
                          <span className="block text-[9px] text-center truncate capitalize" style={{ color: '#b8a09a' }}>
                            {st}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs p-4 rounded-xl"
                    style={{ background: '#fdfaf7', border: '1px solid #f2e8d9' }}
                  >
                    <div>
                      <span className="block mb-1" style={{ color: '#b8a09a' }}>Detail Pilihan:</span>
                      <span className="font-bold" style={{ color: '#2d2520' }}>Ukuran {order.size}</span>
                      {order.note && (
                        <p className="mt-1 italic" style={{ color: '#7a6258' }}>&quot;{order.note}&quot;</p>
                      )}
                    </div>
                    <div>
                      <span className="block mb-1" style={{ color: '#b8a09a' }}>Total Biaya:</span>
                      <span className="font-bold text-sm" style={{ color: '#c45573' }}>
                        Rp{order.productPrice?.toLocaleString('id-ID')}
                      </span>
                      <span className="block text-[10px] mt-0.5" style={{ color: '#4caf84' }}>✓ Gratis Ongkir</span>
                    </div>
                    <div>
                      <span className="block mb-1" style={{ color: '#b8a09a' }}>Alamat Tujuan:</span>
                      <span className="font-semibold" style={{ color: '#2d2520' }}>
                        [{order.addressSnapshot?.label}] {order.addressSnapshot?.fullAddress}
                      </span>
                    </div>
                  </div>

                  {/* Pending CTA */}
                  {order.status === 'pending' && (
                    <div
                      className="p-4 rounded-xl space-y-3"
                      style={{ background: '#fff8ec', border: '1px solid #f0d898' }}
                    >
                      <p className="text-xs leading-relaxed" style={{ color: '#7a6258' }}>
                        ⚠️ <strong style={{ color: '#2d2520' }}>Order kamu masih Pending.</strong> Pastikan email yang kamu isi di halaman pembayaran sama dengan email akun kamu (
                        <strong style={{ color: '#b8860b' }}>{user.email}</strong>) di www.trunch.store.
                        Jika mengalami kendala, hubungi WA <strong style={{ color: '#2d2520' }}>+62 851-7994-2243</strong>.
                      </p>
                      <button
                        onClick={() => window.open(order.checkoutUrl, '_blank')}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white transition"
                        style={{ background: 'linear-gradient(135deg, #c45573, #e8839a)' }}
                      >
                        Lanjutkan Pembayaran via Lynk.id
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold" style={{ color: '#2d2520' }}>
              Daftar Alamat Pengiriman
            </h3>
            <button
              onClick={() => {
                setEditingAddress(null);
                setShowAddressModal(true);
              }}
              className="btn-primary text-xs py-2.5 px-4"
            >
              <Plus className="w-4 h-4" />
              Tambah Alamat
            </button>
          </div>

          {!profile?.addresses || profile.addresses.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ background: '#fdfaf7', border: '1.5px solid #f2e8d9' }}
            >
              <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: '#e8d5bc' }} />
              <p className="text-sm" style={{ color: '#9a8278' }}>Belum ada alamat pengiriman tersimpan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-5 rounded-2xl space-y-3"
                  style={{ background: 'white', border: '1px solid #f2e8d9', boxShadow: '0 2px 12px rgba(180,120,100,0.05)' }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm flex items-center gap-1.5" style={{ color: '#2d2520' }}>
                      <MapPin className="w-4 h-4" style={{ color: '#c45573' }} />
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: '#f0fff7', border: '1px solid #a8e6c1', color: '#2d7a50' }}
                      >
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: '#6b5b52' }}>
                    {addr.fullAddress}, Kec. {addr.district}, {addr.regency}, {addr.province}
                  </p>
                  {addr.benchmark && (
                    <p className="text-[11px]" style={{ color: '#9a8278' }}>Patokan: {addr.benchmark}</p>
                  )}
                  <p className="text-[10px] font-mono" style={{ color: '#c4a99a' }}>
                    📍 {addr.lat?.toFixed(5)}, {addr.lng?.toFixed(5)}
                  </p>

                  <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid #f2e8d9' }}>
                    <button
                      onClick={() => {
                        setEditingAddress(addr);
                        setShowAddressModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition"
                      style={{ background: '#fdfaf7', border: '1px solid #e8d5bc', color: '#6b5b52' }}
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition"
                      style={{ background: '#fdf3f6', border: '1px solid #f4b8c8', color: '#c45573' }}
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

      {/* TAB 3: PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl space-y-6" style={{ background: 'white', border: '1.5px solid #f2e8d9', boxShadow: '0 4px 24px rgba(180,120,100,0.06)' }}>
          <h3 className="font-serif text-xl font-bold" style={{ color: '#2d2520' }}>
            Pengaturan Profil Akun
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4a3f38' }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4a3f38' }}>
                Email Terdaftar (Google Sign-In)
              </label>
              <input
                type="email"
                disabled
                value={user.email || ''}
                className="input-field"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4a3f38' }}>
                Nomor WhatsApp Aktif
              </label>
              <input
                type="text"
                required
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary w-full py-3"
            >
              {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </form>
        </div>
      )}

      {/* Address Modal */}
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
