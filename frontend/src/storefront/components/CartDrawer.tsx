import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore();
  const total = subtotal();

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-charcoal flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-graphite">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} strokeWidth={1.5} className="text-gold" />
                <h2 className="font-serif text-xl font-light">Your Bag</h2>
                {items.length > 0 && (
                  <span className="text-label text-[10px] text-mid ml-1">({items.length})</span>
                )}
              </div>
              <button className="btn-ghost" onClick={closeCart} aria-label="Close cart">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingBag size={48} strokeWidth={1} className="text-muted mb-4" />
                  <p className="font-serif text-2xl font-light text-silver mb-2">Your bag is empty</p>
                  <p className="text-sm text-mid mb-8">Add something extraordinary</p>
                  <Link to="/shop" className="btn-primary inline-flex items-center justify-center text-center" onClick={closeCart}>
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex gap-4"
                    >
                      {/* Image */}
                      <div className="w-20 h-24 bg-graphite flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} className="text-muted" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-base font-light text-cream leading-tight">
                          {item.product_name}
                        </h4>
                        {(item.variant_size || item.variant_color) && (
                          <p className="text-xs text-mid mt-0.5">
                            {[item.variant_size, item.variant_color].filter(Boolean).join(' / ')}
                          </p>
                        )}
                        <p className="text-sm font-medium text-gold mt-1">
                          ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                        </p>

                        <div className="flex items-center gap-3 mt-3">
                          {/* Qty */}
                          <div className="flex items-center border border-graphite">
                            <button
                              className="w-8 h-8 flex items-center justify-center text-silver hover:text-cream transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              className="w-8 h-8 flex items-center justify-center text-silver hover:text-cream transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            className="text-mid hover:text-red-400 transition-colors ml-auto"
                            onClick={() => removeItem(item.id)}
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-graphite px-6 py-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-silver">Subtotal</span>
                  <span className="font-serif text-xl font-light">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-mid">Shipping calculated at checkout</p>
                <Link
                  to="/checkout"
                  className="btn-primary w-full justify-center"
                  onClick={closeCart}
                >
                  Checkout via WhatsApp
                </Link>
                <button
                  className="btn-outline w-full justify-center"
                  onClick={closeCart}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
