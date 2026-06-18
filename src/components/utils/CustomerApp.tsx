import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { CATEGORIES, STATUS_STEPS } from '../data';
import type { Category, Order } from '../types';
import { Icon, Button, Input, Textarea, Badge, EmptyState, formatINR, Rating } from './ui';

type View = 'home' | 'category' | 'cart' | 'checkout' | 'orders' | 'orderDetail' | 'profile';

export default function CustomerApp() {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    orders,
    placeOrder,
    currentUser,
    coupons,
    addNotification,
    notifications,
    markNotifRead,
  } = useStore();

  const [view, setView] = useState<View>('home');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [address, setAddress] = useState(currentUser?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'COD'>('UPI');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const subtotal = useMemo(
    () => cart.reduce((s, item) => s + (products.find((p) => p.id === item.productId)?.price || 0) * item.quantity, 0),
    [cart, products]
  );

  const coupon = appliedCoupon ? coupons.find((c) => c.code === appliedCoupon) : null;
  const discount = coupon ? Math.min(coupon.maxDiscount, Math.round((subtotal * coupon.discountPct) / 100)) : 0;
  const deliveryFee = subtotal >= 499 ? 0 : subtotal > 0 ? 40 : 0;
  const total = subtotal - discount + deliveryFee;

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2400);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory) list = list.filter((p) => p.category === activeCategory);
    if (search.trim())
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.brand.toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [products, activeCategory, search]);

  const myOrders = orders.filter((o) => o.customerId === currentUser?.id);

  function applyCoupon() {
    setCouponError('');
    const c = coupons.find((x) => x.code === couponCode.toUpperCase());
    if (!c) return setCouponError('Invalid coupon code');
    if (!c.active) return setCouponError('Coupon is not active');
    if (subtotal < c.minOrder) return setCouponError(`Minimum order of ${formatINR(c.minOrder)} required`);
    setAppliedCoupon(c.code);
    setToast(`🎉 Coupon "${c.code}" applied!`);
  }

  function toggleWishlist(id: string) {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePlaceOrder() {
    if (!currentUser || !address) return;
    const items = cart.map((c) => {
      const p = products.find((pr) => pr.id === c.productId)!;
      return { productId: p.id, name: p.name, qty: c.quantity, price: p.price };
    });
    const codFee = paymentMethod === 'COD' ? 20 : 0;
    const newOrder: Order = {
      id: 'ORD' + Date.now().toString().slice(-8),
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      address,
      items,
      subtotal,
      discount,
      couponCode: appliedCoupon || undefined,
      deliveryFee: deliveryFee + codFee,
      total: total + codFee,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Unpaid' : 'Paid',
      status: 'Placed',
      placedAt: Date.now(),
      eta: new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    };
    placeOrder(newOrder);
    clearCart();
    setAppliedCoupon(null);
    setCouponCode('');
    setCheckoutStep(1);
    setView('orders');
    setSelectedOrder(newOrder);
    addNotification({
      id: 'n' + Date.now(),
      title: '✅ Order Placed!',
      message: `Your order ${newOrder.id} is confirmed. ETA ${newOrder.eta}.`,
      type: 'order',
      createdAt: Date.now(),
      read: false,
    });
    setToast('Order placed successfully! 🎉');
  }

  const header = (
    <header className="sticky top-0 z-30 border-b border-pink-100/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button
          onClick={() => {
            setView('home');
            setActiveCategory(null);
            setSearch('');
          }}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-500 text-white shadow-lg shadow-pink-200/70">
            <span className="text-xl">🌸</span>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xl font-extrabold tracking-tight text-gradient-pink leading-none">SoftCare</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mt-0.5">Hygiene • Delivered</div>
          </div>
        </button>

        <div className="relative mx-2 flex-1 max-w-md">
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setView('category');
            }}
            placeholder="Search diapers, pads, brands..."
            className="w-full rounded-full border border-pink-100 bg-gradient-to-r from-pink-50/60 to-rose-50/60 py-2.5 pl-10 pr-4 text-sm font-medium placeholder:font-normal placeholder:text-slate-400 focus:border-pink-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100 transition"
          />
        </div>

        <button onClick={() => setShowNotif(true)} className="relative rounded-xl p-2.5 text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition">
          <Icon name="bell" />
          {unreadNotifs > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
              {unreadNotifs}
            </span>
          )}
        </button>
        <button onClick={() => setView('orders')} className="hidden rounded-xl p-2.5 text-slate-600 hover:bg-pink-50 hover:text-pink-600 sm:block transition" title="Orders">
          <Icon name="package" />
        </button>
        <button onClick={() => setShowCart(true)} className="relative rounded-xl p-2.5 text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition">
          <Icon name="cart" />
          {cart.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white shadow-md">
              {cart.reduce((s, c) => s + c.quantity, 0)}
            </span>
          )}
        </button>
        <button onClick={() => setView('profile')} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-sm font-bold text-white shadow-md shadow-sky-200 ring-2 ring-white transition hover:scale-105">
          {currentUser?.name?.[0] || 'U'}
        </button>
      </div>
    </header>
  );

  const bottomNav = (
    <nav className="sticky bottom-0 z-30 border-t border-pink-100/60 bg-white/90 backdrop-blur-xl sm:hidden">
      <div className="grid grid-cols-4">
        {[
          { id: 'home', icon: 'home', label: 'Home' },
          { id: 'category', icon: 'package', label: 'Shop' },
          { id: 'orders', icon: 'truck', label: 'Orders' },
          { id: 'profile', icon: 'user', label: 'You' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition ${view === item.id ? 'text-pink-600' : 'text-slate-400'}`}
          >
            <div className={`relative p-1 rounded-xl ${view === item.id ? 'bg-pink-50' : ''}`}>
              <Icon name={item.icon} className="h-5 w-5" />
              {item.id === 'cart' && cart.length > 0 && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-pink-500" />}
            </div>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );

  const productCard = (p: typeof products[0], idx = 0) => {
    const discountPct = Math.round(((p.mrp - p.price) / p.mrp) * 100);
    const inWishlist = wishlist.has(p.id);
    return (
      <div key={p.id} className="card-lift group relative flex flex-col overflow-hidden rounded-3xl border border-white bg-white shadow-sm hover:shadow-xl hover:shadow-pink-200/40 animate-fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 via-pink-50/30 to-rose-50/40">
          <img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/300/fce7f3/ec4899?text=SoftCare')} />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {discountPct > 0 && (
              <div className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                {discountPct}% OFF
              </div>
            )}
            {p.stock < 10 && p.stock > 0 && (
              <div className="rounded-full bg-amber-500 px-2 py-1 text-[10px] font-bold text-white shadow-md">
                Only {p.stock} left
              </div>
            )}
            {p.stock === 0 && (
              <div className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-bold text-white shadow-md">Out of stock</div>
            )}
          </div>
          <button
            onClick={() => toggleWishlist(p.id)}
            className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition ${inWishlist ? 'bg-pink-500 text-white shadow-lg' : 'bg-white/90 text-slate-400 hover:text-pink-500 hover:bg-white'}`}
          >
            <Icon name="heart" className="h-4 w-4" />
          </button>
          {p.absorbency && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-700 backdrop-blur-sm">
              <Icon name="droplet" className="h-3 w-3 text-sky-500" />
              {p.absorbency}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-pink-500">{p.brand}</div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-slate-900 min-h-[2.5rem]">{p.name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Rating value={p.rating} />
            <span className="font-semibold text-slate-700">{p.rating}</span>
            <span className="text-slate-300">•</span>
            <span>{p.packOf} pcs</span>
          </div>
          <div className="mt-auto flex items-end justify-between pt-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-slate-900">{formatINR(p.price)}</span>
                {p.mrp > p.price && <span className="text-xs text-slate-400 line-through">{formatINR(p.mrp)}</span>}
              </div>
              <div className="text-[10px] font-semibold text-emerald-600">Save {formatINR(p.mrp - p.price)}</div>
            </div>
            <button
              onClick={() => {
                addToCart(p.id);
                setToast(`✨ ${p.name.slice(0, 22)}... added`);
              }}
              disabled={p.stock === 0}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200 transition hover:scale-110 hover:shadow-lg hover:shadow-pink-300 active:scale-95 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
            >
              <Icon name="plus" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const cartDrawer = showCart && (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-up" onClick={() => setShowCart(false)}>
      <div className="flex h-full w-full max-w-md flex-col bg-gradient-to-b from-white to-pink-50/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-pink-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Your Cart</h3>
            <p className="text-xs text-slate-500">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={() => setShowCart(false)} className="rounded-xl bg-white p-2 text-slate-500 hover:bg-pink-50 hover:text-pink-600 shadow-sm">
            <Icon name="x" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-100 text-4xl animate-float">🛒</div>
              <EmptyState icon="cart" title="Your cart is empty" subtitle="Browse our collection and add some goodies" />
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((ci, i) => {
                const p = products.find((pr) => pr.id === ci.productId);
                if (!p) return null;
                return (
                  <div key={ci.productId} className="flex gap-3 rounded-2xl border border-pink-100/50 bg-white p-3 shadow-sm animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="relative">
                      <img src={p.image} alt={p.name} className="h-20 w-20 rounded-xl object-cover" onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/100')} />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {ci.quantity}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-pink-500">{p.brand}</div>
                      <div className="line-clamp-1 text-sm font-semibold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.size}</div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="text-base font-extrabold text-slate-900">{formatINR(p.price * ci.quantity)}</div>
                        <div className="flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50/50 p-0.5">
                          <button onClick={() => updateCartQty(ci.productId, ci.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm hover:bg-pink-100">
                            <Icon name="minus" className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-bold">{ci.quantity}</span>
                          <button onClick={() => updateCartQty(ci.productId, ci.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm hover:bg-pink-100">
                            <Icon name="plus" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(ci.productId)} className="self-start rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500">
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="border-t border-pink-100 bg-white p-5">
            <div className="mb-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1"><Icon name="tag" className="h-3 w-3" /> Coupon discount</span>
                  <span className="font-semibold">-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery</span>
                <span className="font-semibold">{deliveryFee === 0 ? <span className="text-emerald-600">FREE 🎉</span> : formatINR(deliveryFee)}</span>
              </div>
              {subtotal < 499 && (
                <div className="mt-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-2.5 text-xs text-amber-700 border border-amber-200">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Icon name="sparkle" className="h-3.5 w-3.5" />
                    Add {formatINR(499 - subtotal)} more for FREE delivery!
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-amber-200/50">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.min(100, (subtotal / 499) * 100)}%` }} />
                  </div>
                </div>
              )}
              <div className="my-2 border-t border-dashed border-pink-200" />
              <div className="flex justify-between text-base">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-extrabold text-gradient-pink text-lg">{formatINR(total)}</span>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                setShowCart(false);
                setView('checkout');
                setCheckoutStep(1);
              }}
            >
              Proceed to Checkout <Icon name="truck" className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const notifDrawer = showNotif && (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNotif(false)}>
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50 px-5 py-4">
          <h3 className="text-lg font-extrabold">🔔 Notifications</h3>
          <button onClick={() => setShowNotif(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white">
            <Icon name="x" />
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {notifications.length === 0 ? (
            <EmptyState icon="bell" title="All caught up!" subtitle="No new notifications" />
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markNotifRead(n.id)}
                className={`w-full rounded-2xl border p-4 text-left transition hover:shadow-md ${
                  n.read ? 'border-slate-100 bg-white' : 'border-pink-200 bg-gradient-to-r from-pink-50/70 to-rose-50/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg ${n.type === 'offer' ? 'bg-pink-100' : n.type === 'order' ? 'bg-emerald-100' : 'bg-sky-100'}`}>
                    {n.type === 'offer' ? '🎉' : n.type === 'order' ? '📦' : 'ℹ️'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900">{n.title}</div>
                    <div className="mt-0.5 text-sm text-slate-600">{n.message}</div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {!n.read && <div className="h-2 w-2 flex-shrink-0 rounded-full bg-pink-500 animate-pulse" />}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const heroBanner = (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 p-6 sm:p-10 text-white shadow-xl shadow-pink-300/40">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-fuchsia-300/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
      <div className="pointer-events-none absolute right-10 top-10 text-8xl opacity-10 animate-spin-slow">🌸</div>
      <div className="pointer-events-none absolute bottom-8 right-24 text-4xl opacity-20 animate-float">✨</div>

      <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm ring-1 ring-white/30">
            <Icon name="sparkle" className="h-3 w-3" /> MONSOON SALE • UP TO 40% OFF
          </div>
          <h1 className="mt-4 font-[Fraunces] text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Comfort & care,<br />
            <span className="italic">delivered with love.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm text-white/90 sm:text-base">
            Premium diapers, sanitary pads, and hygiene essentials from brands you trust.
            Discreet packaging. Free delivery over ₹499.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="white"
              size="lg"
              onClick={() => setView('category')}
              className="!font-bold"
            >
              Shop Now <Icon name="arrow" className="h-4 w-4" /> →
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="!bg-white/10 !text-white backdrop-blur-sm hover:!bg-white/20 ring-1 ring-white/30"
            >
              <Icon name="tag" className="h-4 w-4" /> Use WELCOME10
            </Button>
          </div>
          <div className="mt-6 flex items-center gap-4 text-xs text-white/80">
            <div className="flex items-center gap-1.5"><Icon name="check" className="h-4 w-4 text-emerald-300" /> Free shipping ₹499+</div>
            <div className="flex items-center gap-1.5"><Icon name="check" className="h-4 w-4 text-emerald-300" /> Discreet packaging</div>
            <div className="hidden items-center gap-1.5 sm:flex"><Icon name="check" className="h-4 w-4 text-emerald-300" /> Easy returns</div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-white/30 to-transparent blur-2xl" />
            <img
              src="/images/hero-baby.jpg"
              alt=""
              className="relative h-72 w-full rounded-[2rem] object-cover shadow-2xl ring-4 ring-white/20"
              onError={(e) => { ((e.target as HTMLImageElement).style.display = 'none'); }}
            />
            <div className="absolute -left-6 top-6 flex items-center gap-2 rounded-2xl bg-white/90 p-3 text-slate-900 shadow-xl backdrop-blur animate-float">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Icon name="truck" className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Fast delivery</div>
                <div className="text-sm font-bold">In 2-3 days</div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-8 flex items-center gap-2 rounded-2xl bg-white/90 p-3 text-slate-900 shadow-xl backdrop-blur animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                <Icon name="heart" className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Trusted by</div>
                <div className="text-sm font-bold">50k+ moms</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const homeView = (
    <div className="space-y-8">
      {heroBanner}

      {/* Feature strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: '🚚', title: 'Free Delivery', sub: 'Orders above ₹499', color: 'from-sky-100 to-blue-100' },
          { icon: '🔒', title: 'Secure Payment', sub: 'UPI, Cards, COD', color: 'from-emerald-100 to-teal-100' },
          { icon: '📦', title: 'Discreet Pack', sub: 'Plain packaging', color: 'from-violet-100 to-purple-100' },
          { icon: '💝', title: 'Easy Returns', sub: '7-day policy', color: 'from-pink-100 to-rose-100' },
        ].map((f, i) => (
          <div key={f.title} className={`card-lift rounded-2xl bg-gradient-to-br ${f.color} p-4 animate-fade-up`} style={{ animationDelay: `${i * 80}ms` }}>
            <div className="text-2xl">{f.icon}</div>
            <div className="mt-2 text-sm font-bold text-slate-900">{f.title}</div>
            <div className="text-xs text-slate-600">{f.sub}</div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-[Fraunces] text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Shop by <span className="italic text-gradient-pink">category</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">Find exactly what you need</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCategory(c.id as Category);
                setView('category');
              }}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${c.color} p-5 text-left transition hover:shadow-xl hover:-translate-y-1 animate-fade-up`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="absolute -right-4 -top-4 text-6xl opacity-20 transition group-hover:scale-110 group-hover:rotate-12">{c.emoji}</div>
              <div className="relative">
                <div className="text-4xl transition group-hover:scale-110">{c.emoji}</div>
                <div className="mt-3 text-sm font-bold text-slate-900">{c.label}</div>
                <div className="mt-1 text-xs text-slate-600">
                  {products.filter(p => p.category === c.id).length} products
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-slate-700 opacity-0 transition group-hover:opacity-100">
                  Shop now →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Best sellers */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-[Fraunces] text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Best <span className="italic text-gradient-pink">sellers</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500">Loved by thousands of customers</p>
          </div>
          <button onClick={() => setView('category')} className="text-sm font-semibold text-pink-600 hover:underline">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((p, i) => productCard(p, i))}
        </div>
      </div>

      {/* Offer banners */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-6 text-white shadow-lg">
          <div className="absolute -right-8 -top-8 text-8xl opacity-15">👶</div>
          <Badge color="yellow">Baby Care</Badge>
          <h3 className="mt-3 font-[Fraunces] text-2xl font-bold">Newborn essentials</h3>
          <p className="mt-1 text-sm text-white/90">Gentle on sensitive skin, up to 30% off</p>
          <Button variant="white" size="sm" className="mt-4" onClick={() => { setActiveCategory('baby-diapers'); setView('category'); }}>
            Shop baby
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 p-6 text-white shadow-lg">
          <div className="absolute -right-8 -top-8 text-8xl opacity-15">🌸</div>
          <Badge color="yellow">Period Care</Badge>
          <h3 className="mt-3 font-[Fraunces] text-2xl font-bold">Organic & rash-free</h3>
          <p className="mt-1 text-sm text-white/90">Ultra soft pads starting ₹199</p>
          <Button variant="white" size="sm" className="mt-4" onClick={() => { setActiveCategory('sanitary-pads'); setView('category'); }}>
            Shop pads
          </Button>
        </div>
      </div>
    </div>
  );

  const categoryView = (
    <div className="space-y-5">
      <div>
        <h2 className="font-[Fraunces] text-3xl font-bold tracking-tight text-slate-900">
          Our <span className="italic text-gradient-pink">collection</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">{filteredProducts.length} products found</p>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
            !activeCategory
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-pink-200 hover:text-pink-600'
          }`}
        >
          ✨ All Products
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id as Category)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === c.id
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-pink-200 hover:text-pink-600'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>
      {filteredProducts.length === 0 ? (
        <EmptyState icon="search" title="No products found" subtitle="Try a different search or category" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((p, i) => productCard(p, i))}
        </div>
      )}
    </div>
  );

  const checkoutView = (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={() => setView('home')} className="hover:text-pink-600">Home</button>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Checkout</span>
      </div>
      <h2 className="font-[Fraunces] text-3xl font-bold">Checkout</h2>

      <div className="flex items-center gap-2">
        {['Address', 'Payment', 'Review'].map((step, i) => (
          <div key={step} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold transition ${
                checkoutStep > i + 1
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                  : checkoutStep === i + 1
                  ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {checkoutStep > i + 1 ? <Icon name="check" className="h-5 w-5" /> : i + 1}
            </div>
            <div className={`text-sm font-bold hidden sm:block ${checkoutStep >= i + 1 ? 'text-slate-900' : 'text-slate-400'}`}>{step}</div>
            {i < 2 && <div className={`h-1 flex-1 rounded-full ${checkoutStep > i + 1 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl border border-pink-100/50 bg-white p-6 shadow-sm">
          {checkoutStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600">
                  <Icon name="map" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delivery Address</h3>
                  <p className="text-xs text-slate-500">Where should we send your order?</p>
                </div>
              </div>
              <Textarea
                label="Full Address"
                rows={4}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no, Street, City, State, Pincode"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Recipient Name" value={currentUser?.name} readOnly />
                <Input label="Phone Number" value={currentUser?.phone} readOnly />
              </div>
              <Button size="lg" onClick={() => setCheckoutStep(2)} disabled={!address.trim()} className="w-full sm:w-auto">
                Continue to Payment →
              </Button>
            </div>
          )}
          {checkoutStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600">
                  <Icon name="lock" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Payment Method</h3>
                  <p className="text-xs text-slate-500">Your payment information is secure</p>
                </div>
              </div>
              <div className="space-y-3">
                {([
                  { id: 'UPI', desc: 'Google Pay, PhonePe, Paytm, BHIM', icon: '📱', tag: 'Popular' },
                  { id: 'Card', desc: 'Visa, Mastercard, RuPay, Amex', icon: '💳', tag: '' },
                  { id: 'Net Banking', desc: 'All major Indian banks', icon: '🏦', tag: '' },
                  { id: 'COD', desc: 'Pay cash on delivery (+₹20)', icon: '💵', tag: '' },
                ] as const).map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${
                      paymentMethod === pm.id ? 'border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 shadow-md shadow-pink-100' : 'border-slate-200 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                    }`}
                  >
                    <span className="text-3xl">{pm.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{pm.id}</span>
                        {pm.tag && <Badge color="pink">{pm.tag}</Badge>}
                      </div>
                      <div className="text-xs text-slate-500">{pm.desc}</div>
                    </div>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${paymentMethod === pm.id ? 'border-pink-500 bg-pink-500' : 'border-slate-300'}`}>
                      {paymentMethod === pm.id && <Icon name="check" className="h-3 w-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setCheckoutStep(1)}>← Back</Button>
                <Button onClick={() => setCheckoutStep(3)} className="flex-1 sm:flex-none">Review Order →</Button>
              </div>
            </div>
          )}
          {checkoutStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600">
                  <Icon name="check" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Review Your Order</h3>
                  <p className="text-xs text-slate-500">Please confirm details before placing</p>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
                {cart.map((ci) => {
                  const p = products.find((pr) => pr.id === ci.productId)!;
                  return (
                    <div key={ci.productId} className="flex items-center gap-3 py-1.5">
                      <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/100')} />
                      <div className="flex-1">
                        <div className="text-sm font-semibold line-clamp-1">{p.name}</div>
                        <div className="text-xs text-slate-500">Qty: {ci.quantity} × {formatINR(p.price)}</div>
                      </div>
                      <div className="text-sm font-bold">{formatINR(p.price * ci.quantity)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Deliver to</div>
                  <div className="mt-1 text-sm font-semibold">{currentUser?.name}</div>
                  <div className="text-xs text-slate-600">{currentUser?.phone}</div>
                  <div className="mt-1 text-xs text-slate-600 line-clamp-3">{address}</div>
                </div>
                <div className="rounded-2xl border border-slate-100 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Payment</div>
                  <div className="mt-1 text-sm font-semibold">{paymentMethod}</div>
                  <Badge color={paymentMethod === 'COD' ? 'yellow' : 'green'}>{paymentMethod === 'COD' ? 'Pay on delivery' : 'Pay now'}</Badge>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setCheckoutStep(2)}>← Back</Button>
                <Button size="lg" className="flex-1" onClick={handlePlaceOrder}>
                  <Icon name="gift" className="h-4 w-4" /> Place Order • {formatINR(total + (paymentMethod === 'COD' ? 20 : 0))}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="h-fit rounded-3xl border border-pink-100/50 bg-gradient-to-b from-white to-pink-50/40 p-5 shadow-sm lg:sticky lg:top-20">
          <h4 className="mb-4 text-lg font-bold flex items-center gap-2">
            <Icon name="tag" className="h-4 w-4 text-pink-500" /> Price Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Subtotal ({cart.length} items)</span><span className="font-semibold">{formatINR(subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span className="flex items-center gap-1"><Icon name="tag" className="h-3 w-3" /> {appliedCoupon}</span>
                <span className="font-semibold">-{formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-600">Delivery</span>
              <span className="font-semibold">{deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : formatINR(deliveryFee)}</span>
            </div>
            <div className="my-2 border-t border-dashed border-pink-200" />
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-extrabold text-2xl text-gradient-pink">{formatINR(total)}</span>
            </div>
            {discount > 0 && <div className="text-xs text-emerald-600 font-semibold">You save {formatINR(discount + (deliveryFee === 0 ? 40 : 0))} on this order!</div>}
          </div>
          <div className="mt-5 border-t border-pink-100 pt-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2.5 border border-emerald-200">
                <span className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <Icon name="check" className="h-4 w-4" /> {appliedCoupon} applied
                </span>
                <button onClick={() => setAppliedCoupon(null)} className="text-xs text-emerald-700 underline font-semibold">Remove</button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm uppercase font-semibold placeholder:normal-case placeholder:font-normal focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
                  />
                  <Button size="sm" onClick={applyCoupon}>Apply</Button>
                </div>
                {couponError && <div className="text-xs text-red-500 font-medium">{couponError}</div>}
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Available:</span>{' '}
                  {coupons.filter(c => c.active).map((c, i) => (
                    <button key={c.code} onClick={() => setCouponCode(c.code)} className="mr-1 font-mono text-pink-600 font-bold hover:underline">
                      {c.code}{i < coupons.filter(x => x.active).length - 1 ? ',' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
            <Icon name="shield" className="h-4 w-4 text-emerald-500" />
            Safe and secure checkout. 100% genuine products guaranteed.
          </div>
        </div>
      </div>
    </div>
  );

  const ordersView = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[Fraunces] text-3xl font-bold">My Orders</h2>
          <p className="mt-1 text-sm text-slate-500">{myOrders.length} order{myOrders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      {myOrders.length === 0 ? (
        <div className="rounded-3xl border border-pink-100/50 bg-white p-8 text-center">
          <EmptyState icon="package" title="No orders yet" subtitle="Your orders will appear here once placed" />
          <Button onClick={() => setView('category')} className="mt-4">Start Shopping</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o, i) => (
            <button key={o.id} onClick={() => { setSelectedOrder(o); setView('orderDetail'); }} className="group w-full rounded-3xl border border-pink-100/50 bg-white p-5 text-left shadow-sm transition hover:shadow-lg hover:shadow-pink-100 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600">
                    <Icon name="package" className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{o.id}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(o.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </div>
                <Badge color={o.status === 'Delivered' ? 'green' : o.status === 'Cancelled' ? 'red' : 'blue'}>{o.status}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-pink-50 pt-3">
                <div className="text-xs text-slate-500">
                  {o.status === 'Delivered' ? '✅ Delivered' : <>🚚 ETA: <span className="font-semibold text-slate-700">{o.eta}</span></>}
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-gradient-pink">{formatINR(o.total)}</div>
                  <div className="text-[10px] text-slate-400 group-hover:text-pink-600 font-semibold transition">View details →</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const orderDetailView = selectedOrder && (
    <div className="mx-auto max-w-3xl space-y-4 animate-fade-up">
      <button onClick={() => setView('orders')} className="flex items-center gap-1 text-sm font-semibold text-pink-600 hover:underline">
        ← Back to orders
      </button>
      <div className="overflow-hidden rounded-3xl border border-pink-100/50 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest opacity-80">Order</div>
              <h2 className="mt-1 text-2xl font-extrabold">{selectedOrder.id}</h2>
              <div className="mt-1 text-xs opacity-90">
                Placed on {new Date(selectedOrder.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <Badge color={selectedOrder.status === 'Delivered' ? 'green' : 'yellow'}>{selectedOrder.status}</Badge>
          </div>
        </div>
        <div className="p-6">
          {selectedOrder.status !== 'Cancelled' && (
            <div className="mb-6">
              <div className="relative flex justify-between">
                {STATUS_STEPS.map((step, i) => {
                  const currentIdx = STATUS_STEPS.indexOf(selectedOrder.status);
                  const done = i <= currentIdx;
                  const active = i === currentIdx;
                  return (
                    <div key={step} className="relative flex flex-1 flex-col items-center">
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition ${
                          done
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-200'
                            : 'bg-slate-100 text-slate-400'
                        } ${active ? 'ring-4 ring-emerald-100 animate-pulse-ring' : ''}`}
                      >
                        {done ? <Icon name="check" className="h-5 w-5" /> : i + 1}
                      </div>
                      <div className={`mt-2 text-center text-[11px] font-bold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{step}</div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className="absolute left-1/2 top-5 h-1 w-full">
                          <div className={`h-full rounded-full ${i < currentIdx ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-slate-200'}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-pink-100/50 bg-white p-6">
        <h3 className="mb-4 font-bold text-lg">Items in order</h3>
        <div className="space-y-3">
          {selectedOrder.items.map((it) => (
            <div key={it.productId} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                  <Icon name="package" className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{it.name}</div>
                  <div className="text-xs text-slate-500">Qty: {it.qty} × {formatINR(it.price)}</div>
                </div>
              </div>
              <div className="text-sm font-extrabold">{formatINR(it.price * it.qty)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 border-t border-pink-100 pt-4 text-sm">
          <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>{formatINR(selectedOrder.subtotal)}</span></div>
          {selectedOrder.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount ({selectedOrder.couponCode})</span><span>-{formatINR(selectedOrder.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-slate-600">Delivery</span><span>{selectedOrder.deliveryFee === 0 ? 'FREE' : formatINR(selectedOrder.deliveryFee)}</span></div>
          <div className="flex justify-between pt-2 text-lg font-extrabold border-t border-pink-100 mt-2">
            <span>Total Paid</span>
            <span className="text-gradient-pink">{formatINR(selectedOrder.total)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-pink-100/50 bg-white p-5">
          <h3 className="mb-2 font-bold flex items-center gap-2"><Icon name="map" className="h-4 w-4 text-pink-500" /> Shipping Address</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold">{selectedOrder.customerName}</span><br />
            {selectedOrder.customerPhone}<br />
            {selectedOrder.address}
          </p>
        </div>
        <div className="rounded-3xl border border-pink-100/50 bg-white p-5">
          <h3 className="mb-2 font-bold flex items-center gap-2"><Icon name="lock" className="h-4 w-4 text-pink-500" /> Payment Info</h3>
          <p className="text-sm text-slate-700">Method: <span className="font-semibold">{selectedOrder.paymentMethod}</span></p>
          <div className="mt-2">
            <Badge color={selectedOrder.paymentStatus === 'Paid' ? 'green' : 'yellow'}>{selectedOrder.paymentStatus}</Badge>
          </div>
          {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 p-2.5 text-xs text-sky-700">
              <Icon name="truck" className="h-4 w-4 flex-shrink-0" />
              <span>Expected delivery by <span className="font-bold">{selectedOrder.eta}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const profileView = (
    <div className="mx-auto max-w-2xl space-y-5">
      <h2 className="font-[Fraunces] text-3xl font-bold">My Profile</h2>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 p-6 text-white shadow-xl shadow-pink-200">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-3xl font-extrabold backdrop-blur-sm ring-4 ring-white/30">
            {currentUser?.name[0]}
          </div>
          <div>
            <div className="text-2xl font-extrabold">{currentUser?.name}</div>
            <div className="text-sm text-white/80">{currentUser?.email}</div>
            <div className="text-sm text-white/80">📱 {currentUser?.phone}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-3xl border border-pink-100/50 bg-gradient-to-br from-pink-50 to-rose-50 p-4 text-center">
          <div className="text-3xl font-extrabold text-gradient-pink">{myOrders.length}</div>
          <div className="mt-1 text-xs font-semibold text-slate-600">Total Orders</div>
        </div>
        <div className="rounded-3xl border border-pink-100/50 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 text-center">
          <div className="text-3xl font-extrabold text-emerald-600">{myOrders.filter(o => o.status === 'Delivered').length}</div>
          <div className="mt-1 text-xs font-semibold text-slate-600">Delivered</div>
        </div>
        <div className="rounded-3xl border border-pink-100/50 bg-gradient-to-br from-sky-50 to-blue-50 p-4 text-center">
          <div className="text-3xl font-extrabold text-sky-600">{formatINR(myOrders.reduce((s, o) => s + o.total, 0))}</div>
          <div className="mt-1 text-xs font-semibold text-slate-600">Total Spent</div>
        </div>
      </div>

      <div className="rounded-3xl border border-pink-100/50 bg-white p-6">
        <h3 className="mb-3 font-bold">Saved Address</h3>
        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{currentUser?.address || 'No address saved yet.'}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-pink-50/40 via-white to-sky-50/30">
      {header}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:pb-8">
        <div className="animate-fade-up">
          {view === 'home' && homeView}
          {view === 'category' && categoryView}
          {view === 'cart' && (
            <div className="space-y-4">
              <h2 className="font-[Fraunces] text-3xl font-bold">Shopping Cart</h2>
              {cart.length === 0 ? (
                <div className="rounded-3xl border border-pink-100/50 bg-white p-8 text-center">
                  <EmptyState icon="cart" title="Your cart is empty" subtitle="Browse our collection to add items" />
                  <Button onClick={() => setView('category')} className="mt-4">Start Shopping</Button>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                  <div className="space-y-3">
                    {cart.map((ci, i) => {
                      const p = products.find((pr) => pr.id === ci.productId);
                      if (!p) return null;
                      return (
                        <div key={ci.productId} className="card-lift flex gap-4 rounded-3xl border border-pink-100/50 bg-white p-4 shadow-sm animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                          <img src={p.image} alt={p.name} className="h-24 w-24 rounded-2xl object-cover" onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/100')} />
                          <div className="flex flex-1 flex-col">
                            <div className="text-[10px] font-bold uppercase tracking-wide text-pink-500">{p.brand}</div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.size} • Pack of {p.packOf}</div>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="text-lg font-extrabold text-gradient-pink">{formatINR(p.price * ci.quantity)}</div>
                              <div className="flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50/50 p-0.5">
                                <button onClick={() => updateCartQty(ci.productId, ci.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm hover:bg-pink-100"><Icon name="minus" className="h-4 w-4" /></button>
                                <span className="w-8 text-center font-bold">{ci.quantity}</span>
                                <button onClick={() => updateCartQty(ci.productId, ci.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm hover:bg-pink-100"><Icon name="plus" className="h-4 w-4" /></button>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(ci.productId)} className="self-start rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500"><Icon name="trash" className="h-4 w-4" /></button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-fit rounded-3xl border border-pink-100/50 bg-gradient-to-b from-white to-pink-50/40 p-5 shadow-sm lg:sticky lg:top-20">
                    <h4 className="mb-4 text-lg font-bold">Price Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-semibold">{formatINR(subtotal)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-600">Delivery</span><span className="font-semibold">{deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : formatINR(deliveryFee)}</span></div>
                      {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-{formatINR(discount)}</span></div>}
                      <div className="my-2 border-t border-dashed border-pink-200" />
                      <div className="flex justify-between text-lg font-extrabold"><span>Total</span><span className="text-gradient-pink">{formatINR(total)}</span></div>
                    </div>
                    <Button className="mt-4 w-full" size="lg" onClick={() => setView('checkout')}>Proceed to Checkout</Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {view === 'checkout' && checkoutView}
          {view === 'orders' && ordersView}
          {view === 'orderDetail' && orderDetailView}
          {view === 'profile' && profileView}
        </div>
      </main>
      {bottomNav}
      {cartDrawer}
      {notifDrawer}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-fade-up rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl ring-1 ring-white/10 sm:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}
