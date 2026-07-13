import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, BookOpen,
  Image, Settings, LogOut, Menu, X, ChevronRight, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const NAV_ITEMS = [
  { label: 'Products', href: '/admin', icon: Package, exact: true },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Lookbook', href: '/admin/lookbook', icon: BookOpen },
  { label: 'Content', href: '/admin/content', icon: Image },
];

export function AdminLayout() {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth().finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!checking && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [checking, isAuthenticated]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#0D0D0D]/90 backdrop-blur-md border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <p className="font-serif text-[13px] font-light tracking-[0.15em] text-cream">EXOTIC</p>
        <p className="text-[9px] uppercase tracking-[0.2em] text-gold mt-1 font-medium font-sans">Admin Suite</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.exact}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-sm text-xs font-medium tracking-[0.1em] transition-all duration-350 relative group ${
                isActive
                  ? 'bg-gold/5 text-gold border-l-2 border-gold pl-3.5'
                  : 'text-silver hover:text-cream hover:bg-white/[0.02] border-l-2 border-transparent hover:pl-4.5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={15} strokeWidth={isActive ? 2 : 1.5} className="transition-transform group-hover:scale-110 duration-200" />
                <span className="font-sans uppercase text-[10px] tracking-widest">{item.label}</span>
                {isActive && (
                  <motion.span 
                    layoutId="activeIndicator"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,168,76,0.6)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info & Logout */}
      <div className="px-4 py-5 border-t border-white/5 space-y-2 bg-black/20">
        <div className="px-4 py-1">
          <p className="text-xs font-medium text-cream truncate">{user?.full_name || user?.email}</p>
          <p className="text-[9px] text-mid uppercase tracking-widest mt-0.5 font-sans">{user?.role?.replace('_', ' ')}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-sm text-xs text-silver hover:text-red-400 hover:bg-red-500/5 w-full transition-all duration-250 font-sans uppercase tracking-widest"
        >
          <LogOut size={15} strokeWidth={1.5} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] flex admin-suite">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-56 flex-shrink-0 h-screen sticky top-0 z-40">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-56 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-[#080808]/70 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-30">
          <button
            className="lg:hidden btn-ghost !p-1.5 !min-h-0 !min-w-0 border border-white/10 hover:border-gold/50 rounded-sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-mid hover:text-gold uppercase tracking-widest font-sans transition-colors flex items-center gap-1.5"
          >
            View Storefront <span className="text-[12px]">→</span>
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
