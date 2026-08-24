'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus, Product, UnmatchedPayment } from '@/types';
import { SEED_PRODUCTS } from '@/data/seed-products';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import {
  ShieldAlert,
  Package,
  Clock,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  MapPin,
  ExternalLink,
  RefreshCw,
  Eye,
} from 'lucide-react';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'order confirm',
  'production',
  'packaging',
  'shipping',
  'delivery',
  'done',
];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedPayment[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'analytics' | 'unmatched'>('orders');

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Drag and Drop State
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);

  // Guard access: Admin default email apprustic@gmail.com
  useEffect(() => {
    if (!authLoading && (!user || user.email !== 'apprustic@gmail.com')) {
      alert('Akses Ditolak: Halaman admin hanya khusus untuk apprustic@gmail.com');
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Realtime Firestore Listeners
  useEffect(() => {
    if (!user || user.email !== 'apprustic@gmail.com') return;

    // Listen Orders
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
      setOrders(list);
    });

    // Listen Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
      if (list.length > 0) {
        setProducts(list);
      } else {
        setProducts(SEED_PRODUCTS.map((p, idx) => ({ ...p, id: p.lynkProductUuid, createdAt: new Date().toISOString() })));
      }
    });

    // Listen Unmatched Payments
    const unsubUnmatched = onSnapshot(collection(db, 'unmatched_payments'), (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as UnmatchedPayment[];
      setUnmatched(list);
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubUnmatched();
    };
  }, [user]);

  if (authLoading || !user || user.email !== 'apprustic@gmail.com') {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center text-zinc-400">
        Memverifikasi akses admin...
      </div>
    );
  }

  // Handle Drag & Drop Status Updates
  const handleDragStart = (orderId: string) => {
    setDraggedOrderId(orderId);
  };

  const handleDropOnStatus = async (targetStatus: OrderStatus) => {
    if (!draggedOrderId) return;
    try {
      const orderRef = doc(db, 'orders', draggedOrderId);
      await updateDoc(orderRef, {
        status: targetStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Drag drop status update error', err);
    } finally {
      setDraggedOrderId(null);
    }
  };

  // Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.lynkProductUuid) {
      alert('Nama Produk dan Lynk Product UUID wajib diisi!');
      return;
    }

    try {
      const prodId = editingProduct.id || editingProduct.lynkProductUuid || `prod-${Date.now()}`;
      const prodRef = doc(db, 'products', prodId);

      const payload = {
        ...editingProduct,
        id: prodId,
        price: Number(editingProduct.price || 0),
        originalPrice: Number(editingProduct.originalPrice || 0),
        discountPercent: Number(editingProduct.discountPercent || 0),
        images: editingProduct.images || ['/placeholder.jpg'],
        isActive: editingProduct.isActive !== false,
        createdAt: editingProduct.createdAt || new Date().toISOString(),
      };

      await setDoc(prodRef, payload, { merge: true });
      setShowProductModal(false);
      setEditingProduct(null);
      alert('Produk berhasil disimpan!');
    } catch (err) {
      console.error('Product save error', err);
    }
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await deleteDoc(doc(db, 'products', prodId));
    } catch (err) {
      console.error('Product delete error', err);
    }
  };

  // Manual Match Unmatched Payment
  const handleManualMatchPayment = async (unmatchedItem: UnmatchedPayment, targetOrderId: string) => {
    try {
      const orderRef = doc(db, 'orders', targetOrderId);
      const poDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await updateDoc(orderRef, {
        status: 'order confirm',
        paymentRefId: unmatchedItem.refId,
        paymentTime: unmatchedItem.createdAt,
        poDeadline,
        updatedAt: new Date().toISOString(),
      });

      const unRef = doc(db, 'unmatched_payments', unmatchedItem.id);
      await updateDoc(unRef, { status: 'resolved' });

      alert('Pembayaran berhasil dicocokkan manual ke order!');
    } catch (err) {
      console.error('Manual match error', err);
    }
  };

  // Analytics Calculations
  const totalOmset = orders
    .filter((o) => o.status !== 'pending')
    .reduce((sum, o) => sum + (o.productPrice || 0), 0);

  const totalPaidOrders = orders.filter((o) => o.status !== 'pending').length;
  const totalPendingOrders = orders.filter((o) => o.status === 'pending').length;
  const conversionRate = orders.length > 0 ? ((totalPaidOrders / orders.length) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header Admin */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-noir-900 p-6 rounded-3xl border border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>Admin Control Panel (apprustic@gmail.com)</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-zinc-100 mt-1">
            Dashboard Manajemen Trunch Store
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-800/80 p-1.5 rounded-full border border-zinc-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-full transition ${
              activeTab === 'orders' ? 'bg-amber-400 text-zinc-950 shadow-md' : 'text-zinc-400'
            }`}
          >
            Board Pesanan
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-full transition ${
              activeTab === 'products' ? 'bg-amber-400 text-zinc-950 shadow-md' : 'text-zinc-400'
            }`}
          >
            Manajemen Produk
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-full transition ${
              activeTab === 'analytics' ? 'bg-amber-400 text-zinc-950 shadow-md' : 'text-zinc-400'
            }`}
          >
            Analitik
          </button>
          <button
            onClick={() => setActiveTab('unmatched')}
            className={`px-4 py-2 rounded-full transition relative ${
              activeTab === 'unmatched' ? 'bg-amber-400 text-zinc-950 shadow-md' : 'text-zinc-400'
            }`}
          >
            Unmatched ({unmatched.filter((u) => u.status === 'needs_review').length})
          </button>
        </div>
      </div>

      {/* TAB 1: KANBAN DRAG AND DROP BOARD */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-zinc-200">
              Kanban Board Pesanan (Geser Kartu Ke Kanan Sesuai Progress Status)
            </h3>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-6">
            {ORDER_STATUSES.map((status) => {
              const statusOrders = orders.filter((o) => o.status === status);
              return (
                <div
                  key={status}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnStatus(status)}
                  className="w-72 shrink-0 bg-noir-800/80 border border-zinc-800 rounded-2xl p-4 flex flex-col min-h-[500px]"
                >
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-700/60 mb-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                      {status}
                    </span>
                    <span className="text-xs bg-zinc-700/80 text-zinc-200 px-2 py-0.5 rounded-full font-mono">
                      {statusOrders.length}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {statusOrders.map((order) => (
                      <div
                        key={order.id}
                        draggable
                        onDragStart={() => handleDragStart(order.id)}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-amber-400/50 cursor-grab active:cursor-grabbing transition shadow-md hover:shadow-amber-400/5 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-zinc-100 line-clamp-1">
                            {order.productName}
                          </span>
                          <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                            {order.size}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-400">
                          {order.userName} ({order.userPhone || 'No WA'})
                        </p>

                        <div className="flex justify-between items-center pt-2 text-[10px] text-zinc-500 border-t border-zinc-800">
                          <span>Rp{order.productPrice?.toLocaleString('id-ID')}</span>
                          <span className="flex items-center gap-1 text-amber-300">
                            <Eye className="w-3 h-3" /> Detail
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT CRUD */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold text-zinc-100">
              Manajemen Katalog Produk
            </h3>
            <button
              onClick={() => {
                setEditingProduct({
                  isActive: true,
                  specs: {},
                  sizeChart: { S: '', M: '', L: '', XL: '' },
                  images: ['/Petal Whispers (Bisikan Kelopak)/Petal Whispers (Bisikan Kelopak) 1.jpg'],
                });
                setShowProductModal(true);
              }}
              className="px-4 py-2 bg-amber-400 text-zinc-950 font-bold text-xs rounded-full hover:bg-amber-300 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-noir-800/80 p-5 rounded-2xl border border-zinc-800 space-y-4"
              >
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-900">
                  <img src={prod.images?.[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-zinc-100 text-base">{prod.name}</h4>
                  <p className="text-xs text-amber-400 font-semibold mt-1">
                    Rp{prod.price?.toLocaleString('id-ID')}{' '}
                    <span className="text-zinc-500 line-through text-[10px]">
                      Rp{prod.originalPrice?.toLocaleString('id-ID')}
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2">
                    {prod.description}
                  </p>
                  <div className="text-[10px] font-mono text-zinc-500 mt-2 truncate">
                    UUID: {prod.lynkProductUuid}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      setEditingProduct(prod);
                      setShowProductModal(true);
                    }}
                    className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-noir-800 p-5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Total Omzet Terbayar</span>
              <p className="font-serif text-2xl font-bold text-amber-300">
                Rp{totalOmset.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-noir-800 p-5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Order Terkonfirmasi</span>
              <p className="font-serif text-2xl font-bold text-emerald-400">
                {totalPaidOrders} Pesanan
              </p>
            </div>
            <div className="bg-noir-800 p-5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Order Pending</span>
              <p className="font-serif text-2xl font-bold text-rose-400">
                {totalPendingOrders} Pesanan
              </p>
            </div>
            <div className="bg-noir-800 p-5 rounded-2xl border border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-400">Konversi Pending → Paid</span>
              <p className="font-serif text-2xl font-bold text-amber-400">
                {conversionRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UNMATCHED PAYMENTS */}
      {activeTab === 'unmatched' && (
        <div className="space-y-6">
          <h3 className="font-serif text-xl font-bold text-zinc-100">
            Daftar Pembayaran Gagal Dicocokkan Otomatis (Unmatched Payments)
          </h3>

          {unmatched.length === 0 ? (
            <div className="text-center py-12 bg-noir-800/40 rounded-2xl border border-zinc-800 text-zinc-500 text-xs">
              Semua pembayaran Lynk.id berhasil dicocokkan otomatis!
            </div>
          ) : (
            <div className="space-y-4">
              {unmatched.map((item) => (
                <div
                  key={item.id}
                  className="bg-noir-800 p-5 rounded-2xl border border-zinc-800 space-y-3"
                >
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-amber-400">RefID: {item.refId}</span>
                    <span className="text-zinc-400">Email: {item.email}</span>
                  </div>
                  <div className="text-xs text-zinc-300">
                    Product UUID: {item.lynkProductUuid}
                  </div>

                  {item.status === 'needs_review' && (
                    <div className="flex gap-2 pt-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleManualMatchPayment(item, e.target.value);
                          }
                        }}
                        className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded-xl px-3 py-2"
                      >
                        <option value="">-- Cocokkan Manual ke Order Pending --</option>
                        {orders
                          .filter((o) => o.status === 'pending')
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.productName} - {o.userEmail} ({o.size})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-noir-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 text-zinc-100 space-y-4">
            <h3 className="font-serif text-xl font-bold text-amber-300">
              Detail Lengkap Pesanan
            </h3>
            <div className="space-y-2 text-xs text-zinc-300 bg-zinc-800/80 p-4 rounded-2xl border border-zinc-700">
              <div>• Produk: <strong>{selectedOrder.productName}</strong></div>
              <div>• Ukuran: <strong>Ukuran {selectedOrder.size}</strong></div>
              <div>• Note Penjahit: <strong>{selectedOrder.note || 'Tidak ada'}</strong></div>
              <div>• Pembeli: <strong>{selectedOrder.userName}</strong></div>
              <div>• WhatsApp: <strong>{selectedOrder.userPhone}</strong></div>
              <div>• Email: <strong>{selectedOrder.userEmail}</strong></div>
              <div>• Total Nominal: <strong>Rp{selectedOrder.productPrice?.toLocaleString('id-ID')}</strong></div>
              <div>• Status: <strong className="uppercase text-amber-400">{selectedOrder.status}</strong></div>
              <div className="pt-2 border-t border-zinc-700">
                • Alamat Pengiriman: <br />
                <strong>
                  [{selectedOrder.addressSnapshot?.label}] {selectedOrder.addressSnapshot?.fullAddress},{' '}
                  Kec. {selectedOrder.addressSnapshot?.district}, {selectedOrder.addressSnapshot?.regency}
                </strong>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-noir-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 text-zinc-100 my-8 space-y-4">
            <h3 className="font-serif text-xl font-bold text-amber-300">
              {editingProduct.id ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Harga Normal</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.originalPrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Diskon (%)</label>
                  <input
                    type="number"
                    value={editingProduct.discountPercent || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discountPercent: Number(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Harga Diskon</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-rose-400">
                  Lynk Product UUID (Wajib untuk Webhook Matching)
                </label>
                <input
                  type="text"
                  required
                  placeholder="6a8c1175728c54d9d6ded0ea..."
                  value={editingProduct.lynkProductUuid || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, lynkProductUuid: e.target.value })}
                  className="w-full bg-zinc-800 border border-rose-500/50 rounded-xl px-3 py-2 font-mono text-amber-300"
                />
                {!editingProduct.lynkProductUuid && (
                  <p className="text-[10px] text-rose-400 mt-1">
                    ⚠️ Peringatan: Tanpa lynkProductUuid, webhook tidak dapat memverifikasi pembayaran secara otomatis!
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1">Link Checkout Lynk.id</label>
                <input
                  type="text"
                  required
                  placeholder="http://lynk.id/trunch/.../checkout"
                  value={editingProduct.checkoutUrl || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, checkoutUrl: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi Produk</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-full font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 text-zinc-950 rounded-full font-bold text-xs hover:bg-amber-300"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
