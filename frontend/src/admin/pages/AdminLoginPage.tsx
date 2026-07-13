import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { Toaster } from 'react-hot-toast';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Admin Login — Exotic</title></Helmet>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1A1A1A', color: '#F5F0EA', border: '1px solid #2A2A2A' } }} />

      <div className="min-h-screen bg-black grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Luxury Editorial Imagery */}
        <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 overflow-hidden border-r border-graphite/40">
          <div className="absolute inset-0 z-0">
            <img 
              src="/brand/creamish_bridal.png" 
              alt="Exotic Bridal" 
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.4] contrast-[1.05] transition-transform duration-[10000ms] hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          </div>

          <div className="relative z-10">
            <p className="font-serif text-sm tracking-[0.25em] text-cream/70">EXOTIC BY TAUSIF AHMED</p>
          </div>

          <div className="relative z-10 max-w-xl">
            <h2 className="font-serif text-5xl font-light text-cream leading-tight mb-4 tracking-wide">
              Curating Luxury & Heritage
            </h2>
            <p className="text-silver text-sm leading-relaxed max-w-md font-light">
              Access the exclusive administrative suite to manage inventory, fulfill bespoke orders, and customize lookbook experiences.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-mid">
            <p>© {new Date().getFullYear()} EXOTIC. All rights reserved.</p>
            <p className="tracking-widest">ADMIN PORTAL</p>
          </div>
        </div>

        {/* Right Side: Glassmorphic Login Form */}
        <div className="col-span-1 lg:col-span-5 flex items-center justify-center p-6 bg-[#080808] relative">
          {/* Subtle ambient light */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-gold/5 blur-[80px] pointer-events-none top-1/4 right-1/4" />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md z-10 backdrop-blur-xl bg-charcoal/30 border border-white/5 p-8 lg:p-10 rounded shadow-2xl relative"
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <span className="inline-block w-8 h-[1px] bg-gold/65 mb-4" />
              <p className="font-serif text-xl font-light tracking-[0.15em] text-cream mb-1">ADMIN PORTAL</p>
              <p className="text-[10px] text-mid uppercase tracking-[0.2em] font-sans">Secure Authorization</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] text-mid uppercase tracking-widest block mb-2 font-medium">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-standard w-full bg-black/40 border-white/10 hover:border-white/20 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-200"
                  placeholder="admin@exotic.com"
                  required
                  autoComplete="email"
                  id="admin-email"
                />
              </div>

              <div>
                <label className="text-[10px] text-mid uppercase tracking-widest block mb-2 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-standard w-full pr-10 bg-black/40 border-white/10 hover:border-white/20 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-200"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    id="admin-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mid hover:text-cream transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center mt-6 disabled:opacity-50 relative overflow-hidden group"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">Sign In</span>
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-gold-light via-gold to-gold-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-graphite/40 text-center">
              <a href="/" className="text-xs text-mid hover:text-cream transition-colors flex items-center justify-center gap-1.5">
                <span>←</span> Back to Storefront
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
