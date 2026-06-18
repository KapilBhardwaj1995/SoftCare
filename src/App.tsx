import { useState } from 'react';
import { StoreProvider, useStore } from './store';
import CustomerApp from './components/CustomerApp';
import AdminApp from './components/AdminApp';
import DeliveryApp from './components/DeliveryApp';
import { Icon, Button, Input, Badge } from './components/ui';

function AuthScreen() {
  const { login, registerUser, addNotification } = useStore();
  const [mode, setMode] = useState<'login' | 'register' | 'pick'>('pick');
  const [role, setRole] = useState<'customer' | 'admin' | 'delivery'>('customer');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', address: '' });
  const [error, setError] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const user = login(form.email, form.password);
    if (!user) setError('Invalid email or password. Try the demo credentials below.');
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill all required fields');
      return;
    }
    registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: 'customer', address: form.address });
    addNotification({
      id: 'n' + Date.now(),
      title: '🎉 Welcome to SoftCare!',
      message: 'Use WELCOME10 for 10% off your first order. Happy shopping!',
      type: 'offer',
      createdAt: Date.now(),
      read: false,
    });
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-300/30 blur-3xl animate-blob" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-fuchsia-300/30 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 dot-pattern opacity-[0.15]" />
      </div>

      <div className="relative z-10 hidden w-1/2 flex-col justify-center bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-md ring-1 ring-white/30 shadow-lg">
            🌸
          </div>
          <div>
            <div className="font-[Fraunces] text-3xl font-bold tracking-tight">SoftCare</div>
            <div className="text-sm font-semibold text-white/80 tracking-wider uppercase">Hygiene • Delivered</div>
          </div>
        </div>

        <h1 className="mt-14 font-[Fraunces] text-5xl font-bold leading-tight">
          Care you can<br />
          <span className="italic text-amber-200">trust,</span> delivered<br />
          with <span className="italic">love.</span>
        </h1>
        <p className="mt-5 max-w-md text-white/90 leading-relaxed">
          Shop premium baby diapers, adult diapers, sanitary pads, panty liners and maternity pads from top brands. Fast delivery, easy returns, and discreet packaging.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-3">
          {[
            { icon: '🚚', title: 'Free Delivery', sub: 'Orders above ₹499' },
            { icon: '✅', title: '100% Genuine', sub: 'Trusted brands only' },
            { icon: '🔒', title: 'Secure Pay', sub: 'UPI, Cards, COD' },
            { icon: '🎁', title: 'Discreet Pack', sub: 'Privacy first' },
          ].map((f, i) => (
            <div key={f.title} className="card-lift rounded-2xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="text-2xl">{f.icon}</div>
              <div className="mt-2 font-bold">{f.title}</div>
              <div className="text-xs text-white/80">{f.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {['🧑', '👩', '👨', '👵'].map((e, i) => (
              <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg ring-2 ring-pink-400">
                {e}
              </div>
            ))}
          </div>
          <div>
            <div className="font-bold">50,000+ happy families</div>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <span>⭐⭐⭐⭐⭐</span> 4.8 rating
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex w-full items-center justify-center p-4 sm:p-8 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl bg-white/90 p-6 shadow-2xl shadow-pink-200/40 backdrop-blur-xl ring-1 ring-white/60 sm:p-8">
          {/* Mobile logo */}
          <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-2xl text-white shadow-lg shadow-pink-200">🌸</div>
            <div className="font-[Fraunces] text-2xl font-extrabold text-gradient-pink">SoftCare</div>
          </div>

          {mode === 'pick' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 text-3xl shadow-inner">
                  🌸
                </div>
                <h2 className="mt-4 font-[Fraunces] text-2xl font-bold text-slate-900">Welcome!</h2>
                <p className="mt-1 text-sm text-slate-500">Choose how you'd like to continue</p>
              </div>
              <div className="space-y-2.5">
                <button
                  onClick={() => { setRole('customer'); setMode('login'); }}
                  className="group flex w-full items-center gap-4 rounded-2xl border-2 border-pink-100 bg-gradient-to-r from-pink-50/50 to-rose-50/50 p-4 text-left transition hover:border-pink-300 hover:from-pink-50 hover:to-rose-50 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-2xl text-white shadow-md shadow-pink-200 group-hover:scale-110 transition">🛍️</div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">Customer</div>
                    <div className="text-xs text-slate-500">Shop diapers, pads & more</div>
                  </div>
                  <div className="text-pink-500 transition group-hover:translate-x-1">→</div>
                </button>
                <button
                  onClick={() => { setRole('admin'); setForm({ ...form, email: 'admin@softcare.in', password: 'admin123' }); setMode('login'); }}
                  className="group flex w-full items-center gap-4 rounded-2xl border-2 border-violet-100 bg-gradient-to-r from-violet-50/50 to-purple-50/50 p-4 text-left transition hover:border-violet-300 hover:from-violet-50 hover:to-purple-50 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-2xl text-white shadow-md shadow-violet-200 group-hover:scale-110 transition">📊</div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">Admin Panel</div>
                    <div className="text-xs text-slate-500">Manage products, orders & reports</div>
                  </div>
                  <div className="text-violet-500 transition group-hover:translate-x-1">→</div>
                </button>
                <button
                  onClick={() => { setRole('delivery'); setForm({ ...form, email: 'rahul@example.com', password: 'delivery123' }); setMode('login'); }}
                  className="group flex w-full items-center gap-4 rounded-2xl border-2 border-sky-100 bg-gradient-to-r from-sky-50/50 to-blue-50/50 p-4 text-left transition hover:border-sky-300 hover:from-sky-50 hover:to-blue-50 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-2xl text-white shadow-md shadow-sky-200 group-hover:scale-110 transition">🚚</div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">Delivery Partner</div>
                    <div className="text-xs text-slate-500">View & update assigned deliveries</div>
                  </div>
                  <div className="text-sky-500 transition group-hover:translate-x-1">→</div>
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-2xl text-white shadow-lg shadow-pink-200">🌸</div>
                <h2 className="mt-3 font-[Fraunces] text-2xl font-bold">
                  {role === 'customer' ? 'Welcome back!' : role === 'admin' ? 'Admin Login' : 'Delivery Login'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {role === 'customer' ? 'Sign in to your SoftCare account' : 'Enter your credentials to continue'}
                </p>
              </div>
              <Input label="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              <Button type="submit" className="w-full" size="lg">Sign In to Continue</Button>
              {role === 'customer' && (
                <p className="text-center text-sm text-slate-600">
                  New to SoftCare?{' '}
                  <button type="button" onClick={() => setMode('register')} className="font-bold text-pink-600 hover:underline">
                    Create account
                  </button>
                </p>
              )}
              <button type="button" onClick={() => { setMode('pick'); setError(''); }} className="w-full text-center text-xs text-slate-500 hover:text-pink-600 transition">
                ← Back to role selection
              </button>

              <div className="mt-2 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 p-4 border border-pink-100">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-pink-700">
                  <Icon name="sparkle" className="h-3.5 w-3.5" /> Demo credentials (pre-filled)
                </div>
                <div className="space-y-0.5 text-xs text-slate-600 font-mono">
                  {role === 'customer' && <div>📧 priya@example.com<br />🔒 customer123</div>}
                  {role === 'admin' && <div>📧 admin@softcare.in<br />🔒 admin123</div>}
                  {role === 'delivery' && <div>📧 rahul@example.com<br />🔒 delivery123</div>}
                </div>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-2xl text-white shadow-lg shadow-pink-200">🌸</div>
                <h2 className="mt-3 font-[Fraunces] text-2xl font-bold">Create Account</h2>
                <p className="mt-1 text-xs text-slate-500">Join 50,000+ happy families</p>
              </div>
              <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Priya Sharma" />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="98765 43210" />
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="At least 6 characters" />
              <Input label="Address (optional)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House no, City, Pincode" />
              {error && <div className="rounded-lg bg-red-50 p-2 text-xs text-red-600 font-medium">{error}</div>}
              <Button type="submit" className="w-full" size="lg">Create My Account 🎉</Button>
              <p className="text-center text-sm text-slate-500">
                Already a member?{' '}
                <button type="button" onClick={() => setMode('login')} className="font-bold text-pink-600 hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleRouter() {
  const { currentUser, logout } = useStore();
  if (!currentUser) return <AuthScreen />;

  return (
    <div className="relative">
      {currentUser.role === 'customer' && <CustomerApp />}
      {currentUser.role === 'admin' && <AdminApp />}
      {currentUser.role === 'delivery' && <DeliveryApp />}

      {currentUser.role === 'customer' && (
        <div className="fixed bottom-4 right-4 z-40 hidden sm:flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs shadow-lg border border-pink-100 animate-fade-up">
          <Badge color="pink">Shopping as Customer</Badge>
          <button onClick={logout} className="text-slate-400 hover:text-red-500 transition" title="Switch role">
            <Icon name="logout" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <RoleRouter />
    </StoreProvider>
  );
}
