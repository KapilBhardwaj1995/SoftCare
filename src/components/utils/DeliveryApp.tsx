import { useState } from 'react';
import { useStore } from '../store';
import type { Order } from '../types';
import { Icon, Button, Badge, EmptyState, formatINR } from './ui';

export default function DeliveryApp() {
  const { orders, currentUser, updateOrderStatus, logout } = useStore();
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // In a real app, orders would be assigned; here we show non-cancelled non-delivered orders as assigned
  const assignedOrders = orders.filter(
    (o) => ['Confirmed', 'Packed', 'Out for Delivery'].includes(o.status) && (o.deliveryPartnerId === currentUser?.id || !o.deliveryPartnerId)
  );
  const completedOrders = orders.filter(
    (o) => ['Delivered', 'Cancelled'].includes(o.status) && (o.deliveryPartnerId === currentUser?.id || true)
  );

  const showList = activeTab === 'assigned' ? assignedOrders : completedOrders;

  function acceptAndStart(o: Order) {
    updateOrderStatus(o.id, 'Out for Delivery');
    setSelectedOrder(o);
  }

  function markDelivered(o: Order) {
    updateOrderStatus(o.id, 'Delivered');
    setSelectedOrder(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50/40 via-white to-blue-50/30">
      <header className="sticky top-0 z-20 border-b border-sky-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 text-white shadow-lg shadow-sky-200">
              <Icon name="truck" className="h-5 w-5" />
            </div>
            <div>
              <div className="font-[Fraunces] text-xl font-bold leading-tight">Delivery</div>
              <div className="text-xs text-slate-500 font-medium">Hi, {currentUser?.name} 👋</div>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">
            <Icon name="logout" className="h-4 w-4" /> Logout
          </button>
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-4">
          <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'assigned' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}
            >
              📦 Assigned ({assignedOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'completed' ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}
            >
              ✅ History ({completedOrders.length})
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 p-4 pb-20">
        {showList.length === 0 ? (
          <EmptyState icon="truck" title={activeTab === 'assigned' ? 'No new deliveries' : 'No past deliveries'} subtitle={activeTab === 'assigned' ? 'Great job! All caught up 🎉' : 'Complete deliveries to see them here'} />
        ) : (
          <div className="space-y-3">
            {showList.map((o) => (
              <div key={o.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{o.id}</span>
                      <Badge color={o.status === 'Delivered' ? 'green' : o.status === 'Cancelled' ? 'red' : 'blue'}>{o.status}</Badge>
                      {o.paymentMethod === 'COD' && <Badge color="yellow">COD: {formatINR(o.total)}</Badge>}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Icon name="user" className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium">{o.customerName}</span>
                      <a href={`tel:${o.customerPhone}`} className="ml-auto flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100">
                        <Icon name="phone" className="h-3 w-3" /> Call
                      </a>
                    </div>
                    <div className="mt-1.5 flex items-start gap-2 text-sm text-slate-600">
                      <Icon name="map" className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span className="text-xs">{o.address}</span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{o.items.length} items • Total: <span className="font-semibold text-slate-900">{formatINR(o.total)}</span></div>
                  </div>
                </div>

                {activeTab === 'assigned' && (
                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                    {o.status === 'Confirmed' || o.status === 'Packed' ? (
                      <Button className="flex-1" size="sm" variant="secondary" onClick={() => acceptAndStart(o)}>
                        <Icon name="truck" className="h-4 w-4" /> Start Delivery
                      </Button>
                    ) : (
                      <>
                        <Button className="flex-1" size="sm" onClick={() => markDelivered(o)}>
                          <Icon name="check" className="h-4 w-4" /> Mark as Delivered
                        </Button>
                        <button
                          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(o.address)}`, '_blank')}
                          className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        >
                          <Icon name="map" className="h-4 w-4" /> Navigate
                        </button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrder(o)}>Details</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Order {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                <Icon name="x" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs font-medium uppercase text-slate-400">Customer</div>
                <div className="font-semibold">{selectedOrder.customerName}</div>
                <div className="text-slate-600">{selectedOrder.customerPhone}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-400">Delivery Address</div>
                <div className="text-slate-700">{selectedOrder.address}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase text-slate-400">Items</div>
                <div className="space-y-1">
                  {selectedOrder.items.map((i) => (
                    <div key={i.productId} className="flex justify-between">
                      <span>{i.name} × {i.qty}</span>
                      <span className="font-medium">{formatINR(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                <span>Total</span>
                <span>{formatINR(selectedOrder.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Payment:</span>
                <Badge color={selectedOrder.paymentStatus === 'Paid' ? 'green' : 'yellow'}>
                  {selectedOrder.paymentMethod} • {selectedOrder.paymentStatus}
                </Badge>
              </div>
            </div>
            {activeTab === 'assigned' && (
              <div className="mt-4 flex gap-2">
                {selectedOrder.status === 'Out for Delivery' ? (
                  <>
                    <Button className="flex-1" onClick={() => { markDelivered(selectedOrder); }}>
                      <Icon name="check" className="h-4 w-4" /> Mark Delivered
                    </Button>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(selectedOrder.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      <Icon name="map" className="h-4 w-4" /> Navigate
                    </a>
                  </>
                ) : (
                  <Button className="w-full" variant="secondary" onClick={() => acceptAndStart(selectedOrder)}>
                    <Icon name="truck" className="h-4 w-4" /> Start Delivery
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
