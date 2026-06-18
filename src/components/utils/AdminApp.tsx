import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { CATEGORIES } from '../data';
import type { Product, OrderStatus, Coupon } from '../types';
import { Icon, Button, Input, Select, Textarea, Badge, Modal, EmptyState, formatINR } from './ui';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'coupons';

export default function AdminApp() {
  const { products, addProduct, updateProduct, deleteProduct, orders, updateOrderStatus, users, coupons, addCoupon, toggleCoupon, deleteCoupon, logout } = useStore();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'chart' },
    { id: 'products', label: 'Products', icon: 'package' },
    { id: 'orders', label: 'Orders', icon: 'truck' },
    { id: 'customers', label: 'Customers', icon: 'users' },
    { id: 'coupons', label: 'Coupons', icon: 'tag' },
  ];

  const totalRevenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
  const lowStock = products.filter(p => p.stock < 15).length;

  // Dashboard
  const dashboardView = (
    <div className="space-y-6">
      <div>
        <h2 className="font-[Fraunces] text-3xl font-bold">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">Overview of your store performance</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: formatINR(totalRevenue), color: 'from-emerald-400 to-teal-500', icon: 'chart' },
          { label: 'Total Orders', value: totalOrders, color: 'from-sky-400 to-blue-500', icon: 'package' },
          { label: 'Pending Orders', value: pendingOrders, color: 'from-amber-400 to-orange-500', icon: 'truck' },
          { label: 'Low Stock', value: lowStock, color: 'from-rose-400 to-pink-500', icon: 'shield' },
        ].map((s, i) => (
          <div key={s.label} className="card-lift rounded-3xl border border-pink-100/50 bg-white p-5 shadow-sm animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-md`}>
              <Icon name={s.icon} className="h-5 w-5" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
            <div className="text-xs font-semibold text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="mb-4 font-semibold">Sales by Category</h3>
          <div className="space-y-3">
            {CATEGORIES.map((c) => {
              const catProducts = products.filter(p => p.category === c.id);
              const catOrders = orders.flatMap(o => o.items.filter(i => catProducts.some(cp => cp.id === i.productId)));
              const total = catOrders.reduce((s, i) => s + i.price * i.qty, 0);
              const max = Math.max(1, ...CATEGORIES.map(c2 => {
                const cp2 = products.filter(p => p.category === c2.id);
                return orders.flatMap(o => o.items.filter(i => cp2.some(cp => cp.id === i.productId))).reduce((s, i) => s + i.price * i.qty, 0);
              }));
              const pct = (total / max) * 100;
              return (
                <div key={c.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{c.emoji} {c.label}</span>
                    <span className="text-slate-500">{formatINR(total)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="mb-4 font-semibold">Recent Orders</h3>
          {orders.length === 0 ? (
            <EmptyState icon="package" title="No orders yet" />
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <div className="text-sm font-semibold">{o.id}</div>
                    <div className="text-xs text-slate-500">{o.customerName} • {formatINR(o.total)}</div>
                  </div>
                  <Badge color={o.status === 'Delivered' ? 'green' : o.status === 'Cancelled' ? 'red' : 'blue'}>{o.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <h3 className="mb-4 font-semibold">Low Stock Alerts</h3>
        {lowStock === 0 ? (
          <p className="text-sm text-slate-500">All products are well stocked 🎉</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {products.filter(p => p.stock < 15).map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg bg-amber-50 p-3">
                <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/100')} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-amber-700">Only {p.stock} in stock</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setEditingProduct(p); setShowProductModal(true); }}>Restock</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Products
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }, [products, searchTerm]);

  const productsView = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Products ({products.length})</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-56 rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
          </div>
          <Button onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
            <Icon name="plus" className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/100')} />
                      <div>
                        <div className="font-medium text-slate-900 line-clamp-1">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{CATEGORIES.find(c => c.id === p.category)?.label}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{formatINR(p.price)}</span>
                    <span className="ml-1 text-xs text-slate-400 line-through">{formatINR(p.mrp)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={p.stock === 0 ? 'red' : p.stock < 15 ? 'yellow' : 'green'}>{p.stock} units</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                        <Icon name="edit" className="h-4 w-4" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this product?')) deleteProduct(p.id); }} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Orders
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders;
    return orders.filter(o => o.status === orderFilter);
  }, [orders, orderFilter]);

  const ordersView = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Manage Orders ({orders.length})</h2>
        <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value as any)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100">
          <option value="all">All Orders</option>
          <option value="Placed">Placed</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Packed">Packed</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      {filteredOrders.length === 0 ? (
        <EmptyState icon="package" title="No orders found" />
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{o.id}</span>
                    <Badge color={o.status === 'Delivered' ? 'green' : o.status === 'Cancelled' ? 'red' : 'blue'}>{o.status}</Badge>
                    <Badge color={o.paymentStatus === 'Paid' ? 'green' : 'yellow'}>{o.paymentStatus}</Badge>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{o.customerName} • {o.customerPhone}</div>
                  <div className="text-xs text-slate-500">{new Date(o.placedAt).toLocaleString('en-IN')}</div>
                  <div className="mt-1 text-xs text-slate-500 line-clamp-1">{o.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatINR(o.total)}</div>
                  <div className="text-xs text-slate-500">{o.paymentMethod}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3">
                <div className="flex-1 text-xs text-slate-600">
                  <span className="font-medium">Items:</span>{' '}
                  {o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                </div>
                <Select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)} className="!py-1.5 !text-xs w-auto">
                  <option>Placed</option>
                  <option>Confirmed</option>
                  <option>Packed</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const customersView = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Customers</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.filter(u => u.role === 'customer').map((c) => {
          const custOrders = orders.filter(o => o.customerId === c.id);
          return (
            <div key={c.id} className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 font-semibold text-white">
                  {c.name[0]}
                </div>
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.email}</div>
                  <div className="text-xs text-slate-500">{c.phone}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-center text-sm">
                <div>
                  <div className="font-bold text-pink-600">{custOrders.length}</div>
                  <div className="text-[11px] text-slate-500">Orders</div>
                </div>
                <div>
                  <div className="font-bold text-pink-600">{formatINR(custOrders.reduce((s, o) => s + o.total, 0))}</div>
                  <div className="text-[11px] text-slate-500">Spent</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const couponsView = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Discount Coupons</h2>
        <Button onClick={() => {
          const code = prompt('Enter coupon code (e.g. SAVE15)')?.toUpperCase().trim();
          if (!code) return;
          const pctStr = prompt('Discount percentage?');
          const pct = parseInt(pctStr || '0');
          if (!pct) return;
          const minStr = prompt('Minimum order value?', '299');
          const maxStr = prompt('Maximum discount?', '200');
          const coupon: Coupon = { code, discountPct: pct, minOrder: parseInt(minStr || '299'), maxDiscount: parseInt(maxStr || '200'), active: true };
          addCoupon(coupon);
        }}>
          <Icon name="plus" className="h-4 w-4" /> Create Coupon
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div key={c.code} className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-5 ${c.active ? 'border-pink-300 bg-pink-50/50' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
            <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-slate-50" />
            <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-slate-50" />
            <div className="text-center">
              <div className="inline-block rounded-lg bg-white px-3 py-1 font-mono text-lg font-bold text-pink-600">{c.code}</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">{c.discountPct}% OFF</div>
              <div className="mt-1 text-xs text-slate-500">
                Min order: {formatINR(c.minOrder)} • Up to {formatINR(c.maxDiscount)}
              </div>
              <div className="mt-3 flex justify-center gap-2">
                <Button size="sm" variant="outline" onClick={() => toggleCoupon(c.code)}>
                  {c.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => { if (confirm('Delete coupon?')) deleteCoupon(c.code); }}>
                  <Icon name="trash" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-pink-50/30">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-pink-100/50 bg-white/80 backdrop-blur-xl lg:block">
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-500 text-white shadow-lg shadow-pink-200">
            <span className="text-lg">🌸</span>
          </div>
          <div>
            <div className="font-[Fraunces] text-xl font-bold leading-tight text-gradient-pink">SoftCare</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Admin Panel</div>
          </div>
        </div>
        <nav className="space-y-1.5 px-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                tab === t.id ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white shadow-md shadow-pink-200' : 'text-slate-600 hover:bg-pink-50 hover:text-pink-600'
              }`}
            >
              <Icon name={t.icon} className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-4 w-[calc(16rem-2rem)]">
          <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-3 border border-pink-100 mb-2">
            <div className="text-xs font-semibold text-pink-700">Logged in as</div>
            <div className="text-sm font-bold text-slate-900">Admin User</div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition border border-slate-200">
            <Icon name="logout" className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 text-white">🌸</div>
            <div className="font-bold">Admin</div>
          </div>
          <div className="lg:hidden flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${tab === t.id ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Icon name={t.icon} className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>
          <div className="hidden lg:block text-sm text-slate-500">Welcome back 👋</div>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">Admin User</div>
              <div className="text-xs text-slate-500">admin@softcare.in</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 font-semibold text-white">A</div>
          </div>
        </header>
        <main className="p-4 lg:p-6">
          {tab === 'dashboard' && dashboardView}
          {tab === 'products' && productsView}
          {tab === 'orders' && ordersView}
          {tab === 'customers' && customersView}
          {tab === 'coupons' && couponsView}
        </main>
      </div>

      <ProductModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={editingProduct}
        onSave={(p) => {
          if (editingProduct) updateProduct(editingProduct.id, p);
          else addProduct({ ...p, id: 'p' + Date.now().toString().slice(-6) } as Product);
          setShowProductModal(false);
        }}
      />
    </div>
  );
}

function ProductModal({ open, onClose, product, onSave }: { open: boolean; onClose: () => void; product: Product | null; onSave: (p: Partial<Product>) => void }) {
  const [form, setForm] = useState<Partial<Product>>(
    product || {
      name: '',
      brand: '',
      category: 'baby-diapers',
      price: 0,
      mrp: 0,
      size: '',
      packOf: 10,
      stock: 50,
      image: '',
      description: '',
      rating: 4.5,
      absorbency: 'Regular',
    }
  );

  // reset form when product changes
  useEffect(() => {
    setForm(
      product || {
        name: '',
        brand: '',
        category: 'baby-diapers',
        price: 0,
        mrp: 0,
        size: '',
        packOf: 10,
        stock: 50,
        image: '',
        description: '',
        rating: 4.5,
        absorbency: 'Regular',
      }
    );
  }, [product, open]);

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'} maxWidth="max-w-2xl">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Product Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="sm:col-span-2" />
        <Input label="Brand" value={form.brand || ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </Select>
        <Input label="Price (₹)" type="number" value={form.price || 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <Input label="MRP (₹)" type="number" value={form.mrp || 0} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} />
        <Input label="Size / Variant" value={form.size || ''} onChange={(e) => setForm({ ...form, size: e.target.value })} />
        <Input label="Pack of (units)" type="number" value={form.packOf || 0} onChange={(e) => setForm({ ...form, packOf: Number(e.target.value) })} />
        <Input label="Stock" type="number" value={form.stock || 0} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
        <Select label="Absorbency" value={form.absorbency} onChange={(e) => setForm({ ...form, absorbency: e.target.value as any })}>
          <option>Light</option>
          <option>Regular</option>
          <option>Heavy</option>
          <option>Overnight</option>
        </Select>
        <Input label="Image URL" value={form.image || ''} onChange={(e) => setForm({ ...form, image: e.target.value })} className="sm:col-span-2" placeholder="https://..." />
        <Textarea label="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="sm:col-span-2" rows={2} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(form)}>{product ? 'Save Changes' : 'Add Product'}</Button>
      </div>
    </Modal>
  );
}
