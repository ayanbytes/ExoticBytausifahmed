import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Clock, CheckCircle, Truck, Package, XCircle, Eye, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { Order, OrderStatus } from '../../types';

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string; icon: React.ElementType }[] = [
  { value: 'pending', label: 'Pending', color: 'text-yellow-400', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'text-blue-400', icon: CheckCircle },
  { value: 'processing', label: 'Processing', color: 'text-indigo-400', icon: Package },
  { value: 'shipped', label: 'Shipped', color: 'text-purple-400', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'text-green-400', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'text-red-400', icon: XCircle },
];

const STATUS_BADGES: Record<OrderStatus, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400',
  confirmed: 'bg-blue-900/30 text-blue-400',
  processing: 'bg-indigo-900/30 text-indigo-400',
  shipped: 'bg-purple-900/30 text-purple-400',
  delivered: 'bg-green-900/30 text-green-400',
  cancelled: 'bg-red-900/30 text-red-400',
};

function OrderDetailPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OrderStatus>(order.status);

  const statusMutation = useMutation({
    mutationFn: (newStatus: OrderStatus) => api.patch(`/orders/${order.id}/status`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success('Order status updated');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <motion.div
        className="absolute inset-0 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-lg h-full bg-[#0D0D0D] border-l border-graphite overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="sticky top-0 bg-[#0D0D0D] border-b border-graphite px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-serif text-lg font-light text-cream">{order.order_number}</h2>
            <p className="text-xs text-mid">{new Date(order.created_at).toLocaleString('en-IN')}</p>
          </div>
          <button className="btn-ghost !p-1.5 !min-h-0 !min-w-0" onClick={onClose}>
            <XCircle size={18} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Status update */}
          <div>
            <p className="text-label text-[10px] text-mid mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(({ value, label, color, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setStatus(value);
                    statusMutation.mutate(value);
                  }}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-all duration-150 ${
                    status === value
                      ? `border-current ${color} bg-current/10`
                      : 'border-graphite text-mid hover:border-muted'
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer info */}
          <div className="border border-graphite p-4 space-y-2">
            <p className="text-label text-[10px] text-gold mb-3">Customer Details</p>
            <p className="text-sm text-cream font-medium">{order.customer_name}</p>
            <p className="text-sm text-silver">{order.customer_phone}</p>
            {order.customer_email && <p className="text-sm text-silver">{order.customer_email}</p>}
            <p className="text-sm text-silver mt-2">
              {order.delivery_address}, {order.city}, {order.state} — {order.pincode}
            </p>
            {order.notes && <p className="text-xs text-mid italic mt-2">Note: {order.notes}</p>}
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs flex items-center gap-2 !py-2 !px-4"
            >
              <MessageCircle size={14} className="text-[#25D366]" />
              Message on WhatsApp
            </a>
            {order.whatsapp_sent && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle size={12} /> WA sent
              </span>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-label text-[10px] text-gold mb-3">Order Items</p>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 border border-graphite p-3 rounded">
                  <div className="w-12 h-14 bg-graphite flex-shrink-0 overflow-hidden">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-cream">{item.product_name}</p>
                    {item.variant_size && <p className="text-xs text-mid">Size: {item.variant_size}</p>}
                    {item.variant_color && <p className="text-xs text-mid">Color: {item.variant_color}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-mid">×{item.quantity}</p>
                      <p className="text-sm text-cream">₹{item.total_price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-graphite pt-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-mid">Subtotal</span>
              <span className="text-cream">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mid">Shipping</span>
              <span className="text-cream">₹{order.shipping_cost.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-medium text-base border-t border-graphite pt-2">
              <span className="text-cream">Total</span>
              <span className="font-serif text-xl text-gold">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['admin', 'orders', statusFilter],
    queryFn: () =>
      api.get('/orders', { params: { status: statusFilter || undefined, limit: 100 } }).then((r) => r.data),
  });

  return (
    <>
      <Helmet><title>Orders — Exotic Admin</title></Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-light text-cream">Orders</h1>
          <p className="text-sm text-mid mt-0.5">{orders?.length || 0} orders</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('')}
            className={`flex-shrink-0 px-4 py-2 text-label text-[10px] rounded border transition-colors ${!statusFilter ? 'border-gold text-gold bg-gold/10' : 'border-graphite text-mid hover:border-muted'}`}
          >
            All Orders
          </button>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`flex-shrink-0 px-4 py-2 text-label text-[10px] rounded border transition-colors ${statusFilter === value ? `border-current ${STATUS_BADGES[value]}` : 'border-graphite text-mid hover:border-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-charcoal border border-graphite rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-graphite">
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-label text-[10px] text-mid">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/50">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-20 rounded" /></td>
                    ))}</tr>
                  ))
                ) : !orders?.length ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-mid">No orders found</td></tr>
                ) : orders.map((order) => {
                  const statusConfig = STATUS_OPTIONS.find((s) => s.value === order.status);
                  return (
                    <tr key={order.id} className="hover:bg-graphite/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gold">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <p className="text-cream">{order.customer_name}</p>
                        <p className="text-[10px] text-mid">{order.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-silver">{order.items.length} items</td>
                      <td className="px-4 py-3 text-cream font-medium">₹{order.total.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${STATUS_BADGES[order.status]}`}>
                          {statusConfig?.label || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-mid text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="btn-ghost !p-1.5 !min-h-0 !min-w-0 text-mid hover:text-cream"
                          aria-label="View order"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
