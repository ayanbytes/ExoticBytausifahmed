import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingCart, Package, AlertTriangle, TrendingUp,
  Clock, CheckCircle, Truck, XCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import api from '../../lib/api';
import type { DashboardStats, Order } from '../../types';

// Stat card
function StatCard({ label, value, icon: Icon, color = 'text-gold', sub }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="backdrop-blur-md bg-charcoal/20 border border-white/5 hover:border-gold/25 p-5 rounded transition-all duration-300 relative group overflow-hidden shadow-lg"
    >
      {/* Soft light glow in corner */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-gold/5 rounded-full blur-xl group-hover:bg-gold/10 transition-colors" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1.5">
          <p className="text-[10px] text-mid uppercase tracking-widest font-sans font-medium">{label}</p>
          <p className="font-serif text-3xl font-light text-cream tracking-wide">{value}</p>
          {sub && <p className="text-[10px] text-mid/85 font-light">{sub}</p>}
        </div>
        <div className={`p-3 bg-white/[0.02] border border-white/5 rounded-sm group-hover:border-gold/30 transition-colors ${color}`}>
          <Icon size={16} strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  );
}

const mockOrdersData = [
  { day: 'Mon', orders: 4, revenue: 12000 },
  { day: 'Tue', orders: 7, revenue: 21500 },
  { day: 'Wed', orders: 5, revenue: 15000 },
  { day: 'Thu', orders: 12, revenue: 38000 },
  { day: 'Fri', orders: 9, revenue: 27000 },
  { day: 'Sat', orders: 15, revenue: 45000 },
  { day: 'Sun', orders: 11, revenue: 33000 },
];

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const STATUS_PILL_CLASSES: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function AdminDashboard() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
    refetchInterval: 30000,
  });

  const { data: recentOrders } = useQuery<Order[]>({
    queryKey: ['admin', 'orders', 'recent'],
    queryFn: () => api.get('/orders', { params: { limit: 8 } }).then((r) => r.data),
  });

  return (
    <>
      <Helmet><title>Dashboard — Exotic Admin</title></Helmet>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl font-light text-cream tracking-wide">Overview</h1>
            <p className="text-xs text-mid uppercase tracking-widest font-sans mt-1">Operational Analytics & Orders</p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/5 rounded-full text-[10px] text-mid font-sans uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Stats
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            label="Total Orders"
            value={stats?.total_orders ?? '—'}
            icon={ShoppingCart}
          />
          <StatCard
            label="Pending"
            value={stats?.pending_orders ?? '—'}
            icon={Clock}
            color="text-yellow-400"
            sub="Awaiting review"
          />
          <StatCard
            label="Today's Orders"
            value={stats?.orders_today ?? '—'}
            icon={TrendingUp}
            color="text-green-400"
          />
          <StatCard
            label="Total Products"
            value={stats?.total_products ?? '—'}
            icon={Package}
          />
          <StatCard
            label="Low Stock"
            value={stats?.low_stock_products ?? '—'}
            icon={AlertTriangle}
            color={stats && stats.low_stock_products > 0 ? 'text-red-400 animate-pulse' : 'text-mid'}
            sub="Items to restock"
          />
          <StatCard
            label="Revenue (Month)"
            value={stats ? `₹${(stats.revenue_this_month / 1000).toFixed(1)}k` : '—'}
            icon={TrendingUp}
            color="text-gold"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="backdrop-blur-md bg-charcoal/20 border border-white/5 p-6 rounded shadow-xl">
            <h3 className="text-[10px] uppercase tracking-widest font-sans font-medium text-mid mb-6">Orders Volume</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockOrdersData} barSize={16}>
                <defs>
                  <linearGradient id="goldBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E0C47A" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#A07832" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#6B6B6B', fontSize: 10, fontFamily: 'sans-serif' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B6B6B', fontSize: 10, fontFamily: 'sans-serif' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
                  contentStyle={{ background: '#111111', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 2, color: '#F5F0EA', fontSize: 11, fontFamily: 'sans-serif' }}
                />
                <Bar dataKey="orders" fill="url(#goldBarGrad)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="backdrop-blur-md bg-charcoal/20 border border-white/5 p-6 rounded shadow-xl">
            <h3 className="text-[10px] uppercase tracking-widest font-sans font-medium text-mid mb-6">Revenue Performance</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={mockOrdersData}>
                <defs>
                  <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#C9A84C" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#6B6B6B', fontSize: 10, fontFamily: 'sans-serif' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B6B6B', fontSize: 10, fontFamily: 'sans-serif' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: '#111111', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 2, color: '#F5F0EA', fontSize: 11, fontFamily: 'sans-serif' }}
                  formatter={(value: unknown) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={1.5} fillOpacity={1} fill="url(#goldAreaGrad)" dot={{ fill: '#C9A84C', r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="backdrop-blur-md bg-charcoal/20 border border-white/5 rounded shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest font-sans font-medium text-cream">Recent Orders</h3>
            <a href="/admin/orders" className="text-[10px] uppercase tracking-widest font-sans font-semibold text-gold hover:text-gold-light transition-colors">View all orders →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-black/25">
                  {['Order', 'Customer', 'Total Amount', 'Status', 'Date Placed'].map((h) => (
                    <th key={h} className="text-left px-6 py-3.5 text-[9px] uppercase tracking-widest font-sans font-medium text-mid">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {!recentOrders ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="skeleton h-4 w-24 rounded-sm" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : recentOrders.map((order) => {
                  const StatusIcon = STATUS_ICONS[order.status] || Clock;
                  return (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors cursor-pointer group">
                      <td className="px-6 py-4 font-mono text-xs text-gold font-medium group-hover:text-gold-light transition-colors">{order.order_number}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-cream text-xs font-medium">{order.customer_name}</p>
                          <p className="text-[10px] text-mid mt-0.5">{order.customer_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-cream text-xs font-medium">₹{order.total.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-sans border font-medium ${STATUS_PILL_CLASSES[order.status] || 'bg-white/5 text-silver border-white/10'}`}>
                          <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                          <span>{order.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-mid text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
