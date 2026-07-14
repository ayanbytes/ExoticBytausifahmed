import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { itemCount, openCart } = useCartStore();
  const location = useLocation();
  const count = itemCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleScroll();
    handleResize();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        animate={{
          backgroundColor: 'rgba(8,8,8,0.96)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(42,42,42,0.8)',
        }}
        transition={{ duration: 0.4 }}
      >
        <div className="section-container flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 md:gap-3 select-none group"
          >
            <img
              src="/brand/logo.png"
              alt="Exotic Logo"
              className="h-9 md:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col justify-center">
              <span
                className="font-serif text-sm md:text-lg font-light tracking-[0.18em] text-cream transition-colors duration-300 leading-none"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                EXOTIC
              </span>
              <span className="text-[6px] md:text-[8px] font-sans tracking-[0.2em] text-gold uppercase mt-1 leading-none opacity-90">
                BY TAUSIF AHMED
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `text-label text-sm transition-colors duration-200 ${isActive ? 'text-gold' : 'text-ash hover:text-cream'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">


            <button className="btn-ghost" aria-label="Search">
              <Search size={20} strokeWidth={1.5} />
            </button>

            <button
              className="btn-ghost relative"
              onClick={openCart}
              aria-label={`Cart (${count} items)`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-black text-[9px] font-bold rounded-full flex items-center justify-center"
                >
                  {count > 9 ? '9+' : count}
                </motion.span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="btn-ghost md:!hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-[#0C0C0C] border-l border-white/5 flex flex-col items-center pt-24 px-6 pb-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
              initial={{ x: '100%', rotateY: -25, opacity: 0.8 }}
              animate={{ x: 0, rotateY: 0, opacity: 1 }}
              exit={{ x: '100%', rotateY: 25, opacity: 0.8 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            >
              {/* Header logo inside mobile menu - centered */}
              <div className="flex flex-col items-center text-center gap-3 mb-10 border-b border-white/5 pb-6 w-full">
                <img src="/brand/logo.png" alt="Exotic" className="h-10 w-auto object-contain" />
                <div className="flex flex-col items-center">
                  <span className="font-serif text-sm font-light tracking-[0.18em] text-cream">EXOTIC</span>
                  <span className="text-[6px] tracking-[0.2em] text-gold uppercase mt-1 font-medium">BY TAUSIF AHMED</span>
                </div>
              </div>

              {/* Links list - Centered */}
              <div className="flex flex-col gap-6 mt-6 w-full">
                {[{ label: 'Home', href: '/' }, ...NAV_LINKS].map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.6 }}
                  >
                    <NavLink
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="group flex items-center justify-center py-2.5 relative cursor-pointer w-full text-center"
                    >
                      {({ isActive }) => (
                        <div className="flex items-center justify-center relative py-1">
                          {/* Editorial catalog index number */}
                          <span className="font-sans text-[9px] tracking-widest text-[#C9A84C] font-semibold mr-3 select-none opacity-85">
                            0{i + 1}
                          </span>

                          {/* Label */}
                          <span className={`font-serif text-2xl font-light tracking-wide transition-all duration-500 ${isActive ? 'text-[#C9A84C] scale-105' : 'text-cream/90 group-hover:text-[#C9A84C] group-hover:scale-103'
                            }`}>
                            {link.label}
                          </span>

                          {/* Centered sweeping thin underline */}
                          <motion.div
                            className={`absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent origin-center transition-transform duration-500 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-75'
                              }`}
                          />
                        </div>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </div>

              {/* Footer - centered */}
              <div className="mt-auto pt-6 border-t border-white/5 w-full text-center">
                <p className="text-[10px] tracking-[0.2em] text-cream/40 uppercase font-sans font-medium">© 2026 Exotic Couture</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
