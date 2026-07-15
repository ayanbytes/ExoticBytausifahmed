import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import { FadeInSection } from '../../components/motion/FadeInSection';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '919826704113';

type Step = 'details' | 'review' | 'done';

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const total = subtotal();

  const [step, setStep] = useState<Step>('details');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [details, setDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
  });

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="pt-24 text-center py-20 section-container">
        <AlertCircle size={48} className="text-mid mx-auto mb-4" />
        <h1 className="font-serif text-2xl mb-2">Your bag is empty</h1>
        <p className="text-silver mb-8">Add some items before checking out.</p>
        <button className="btn-primary" onClick={() => navigate('/shop')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppCheckout = async () => {
    setIsSubmitting(true);
    try {
      // 1. Save order to DB
      const orderPayload = {
        customer_name: details.name,
        customer_email: details.email || undefined,
        customer_phone: details.phone,
        delivery_address: details.address,
        city: details.city,
        state: details.state,
        pincode: details.pincode,
        notes: details.notes || undefined,
        items: items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          variant_size: item.variant_size || undefined,
          variant_color: item.variant_color || undefined,
          quantity: item.quantity,
          unit_price: item.unit_price,
          image_url: item.image_url || undefined,
        })),
      };

      const { data: order } = await api.post('/orders', orderPayload);
      setOrderId(order.id);
      setOrderNumber(order.order_number);

      // 2. Build WhatsApp message
      const itemLines = items
        .map(
          (item) =>
            `• ${item.product_name}${item.variant_size ? ` (${item.variant_size})` : ''}${item.variant_color ? ` - ${item.variant_color}` : ''} × ${item.quantity} — ₹${(item.unit_price * item.quantity).toLocaleString('en-IN')}`
        )
        .join('\n');

      const message = [
        `🛍️ *New Order — EXOTIC BY TAUSIF AHMED*`,
        `Order No: *${order.order_number}*`,
        ``,
        `*Items:*`,
        itemLines,
        ``,
        `*Order Total: ₹${total.toLocaleString('en-IN')}*`,
        ``,
        `*Customer Details:*`,
        `Name: ${details.name}`,
        `Phone: ${details.phone}`,
        `Address: ${details.address}, ${details.city}, ${details.state} - ${details.pincode}`,
        details.notes ? `Notes: ${details.notes}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

      // 3. Mark WhatsApp as sent
      await api.patch(`/orders/${order.id}/whatsapp-sent`);

      // 4. Clear cart and go to done
      clearCart();
      setStep('done');

      // 5. Open WhatsApp
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout — Exotic</title>
      </Helmet>

      <div className="bg-black min-h-screen">
        <div className="h-16 md:h-20" />
        
        <div className="section-container py-10 max-w-5xl mx-auto">
          {/* Header */}
          <FadeInSection className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              {step !== 'done' && (
                <button
                  className="btn-ghost !p-0"
                  onClick={() => step === 'review' ? setStep('details') : navigate(-1)}
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h1 className="font-serif text-3xl font-light">
                {step === 'details' ? 'Your Details' : step === 'review' ? 'Review Order' : 'Order Placed!'}
              </h1>
            </div>

            {/* Step indicators */}
            {step !== 'done' && (
              <div className="flex items-center gap-0">
                {(['details', 'review'] as Step[]).map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors ${step === s || (s === 'details' && step === 'review') ? 'bg-gold text-black' : 'bg-graphite text-silver'}`}>
                      {s === 'details' && step === 'review' ? <Check size={12} /> : i + 1}
                    </div>
                    <span className={`ml-2 text-xs ${step === s ? 'text-cream' : 'text-mid'}`}>
                      {s === 'details' ? 'Details' : 'Review'}
                    </span>
                    {i < 1 && <div className="w-10 h-px bg-graphite mx-3" />}
                  </div>
                ))}
              </div>
            )}
          </FadeInSection>

          {/* ── Step 1: Details ── */}
          {step === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <form onSubmit={handleDetailsSubmit} className="lg:col-span-3 space-y-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-sans text-xs md:text-sm tracking-[0.2em] text-ash uppercase font-semibold block mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={details.name}
                      onChange={(e) => setDetails({ ...details, name: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold/40 focus:ring-1 focus:ring-gold/40 rounded-xl px-5 h-14 text-cream placeholder-ash/30 text-base transition-all duration-300 outline-none focus:outline-none"
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs md:text-sm tracking-[0.2em] text-ash uppercase font-semibold block mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={details.phone}
                      onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold/40 focus:ring-1 focus:ring-gold/40 rounded-xl px-5 h-14 text-cream placeholder-ash/30 text-base transition-all duration-300 outline-none focus:outline-none"
                      required
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-sans text-xs md:text-sm tracking-[0.2em] text-ash uppercase font-semibold block mb-2">Email (optional)</label>
                  <input
                    type="email"
                    value={details.email}
                    onChange={(e) => setDetails({ ...details, email: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold/40 focus:ring-1 focus:ring-gold/40 rounded-xl px-5 h-14 text-cream placeholder-ash/30 text-base transition-all duration-300 outline-none focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="font-sans text-xs md:text-sm tracking-[0.2em] text-ash uppercase font-semibold block mb-2">Delivery Address *</label>
                  <textarea
                    value={details.address}
                    onChange={(e) => setDetails({ ...details, address: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold/40 focus:ring-1 focus:ring-gold/40 rounded-xl py-4 px-5 text-cream placeholder-ash/30 text-base transition-all duration-300 outline-none focus:outline-none resize-none"
                    rows={4}
                    required
                    placeholder="House/Flat no., Street, Locality"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="font-sans text-xs md:text-sm tracking-[0.2em] text-ash uppercase font-semibold block mb-2">City *</label>
                    <input
                      type="text"
                      value={details.city}
                      onChange={(e) => setDetails({ ...details, city: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold/40 focus:ring-1 focus:ring-gold/40 rounded-xl px-5 h-14 text-cream placeholder-ash/30 text-base transition-all duration-300 outline-none focus:outline-none"
                      required
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs md:text-sm tracking-[0.2em] text-ash uppercase font-semibold block mb-2">State *</label>
                    <input
                      type="text"
                      value={details.state}
                      onChange={(e) => setDetails({ ...details, state: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold/40 focus:ring-1 focus:ring-gold/40 rounded-xl px-5 h-14 text-cream placeholder-ash/30 text-base transition-all duration-300 outline-none focus:outline-none"
                      required
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="font-sans text-xs md:text-sm tracking-[0.2em] text-ash uppercase font-semibold block mb-2">Pincode *</label>
                    <input
                      type="text"
                      value={details.pincode}
                      onChange={(e) => setDetails({ ...details, pincode: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold/40 focus:ring-1 focus:ring-gold/40 rounded-xl px-5 h-14 text-cream placeholder-ash/30 text-base transition-all duration-300 outline-none focus:outline-none"
                      required
                      placeholder="XXXXXX"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-sans text-xs md:text-sm tracking-[0.2em] text-ash uppercase font-semibold block mb-2">Order Notes (optional)</label>
                  <textarea
                    value={details.notes}
                    onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold/40 focus:ring-1 focus:ring-gold/40 rounded-xl py-4 px-5 text-cream placeholder-ash/30 text-base transition-all duration-300 outline-none focus:outline-none resize-none"
                    rows={3}
                    placeholder="Special instructions for your order…"
                  />
                </div>

                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="btn-primary w-full h-12 justify-center text-xs tracking-[0.2em] font-bold uppercase rounded-lg shadow-lg shadow-gold/10 cursor-pointer"
                >
                  Review Order →
                </motion.button>
              </form>

              {/* Order summary sidebar */}
              <div className="lg:col-span-2">
                <OrderSummary />
              </div>
            </div>
          )}

          {/* ── Step 2: Review ── */}
          {step === 'review' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3 space-y-6">
                {/* Customer details summary */}
                <div className="bg-white/[0.015] border border-white/10 rounded-2xl p-6 space-y-3">
                  <h3 className="font-sans text-[11px] font-semibold tracking-[0.2em] text-gold uppercase mb-4">Delivery Details</h3>
                  <p className="text-sm text-cream font-medium">{details.name}</p>
                  <p className="text-sm text-silver">{details.phone}</p>
                  {details.email && <p className="text-sm text-silver">{details.email}</p>}
                  <p className="text-sm text-silver">
                    {details.address}, {details.city}, {details.state} — {details.pincode}
                  </p>
                  {details.notes && <p className="text-sm text-mid italic">Note: {details.notes}</p>}
                  <button onClick={() => setStep('details')} className="text-xs text-gold hover:underline mt-2 cursor-pointer bg-transparent border-none">
                    Edit Details
                  </button>
                </div>

                {/* WhatsApp CTA */}
                <div className="bg-white/[0.015] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <MessageCircle size={20} className="text-[#25D366] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-cream">Order via WhatsApp</p>
                      <p className="text-xs text-silver mt-1 leading-relaxed">
                        Clicking below will save your order and open WhatsApp with your order details pre-filled.
                        Simply send the message to confirm.
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleWhatsAppCheckout}
                    disabled={isSubmitting}
                    className="w-full h-12 flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bf5a] text-white text-xs font-bold tracking-[0.2em] uppercase rounded-lg transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <MessageCircle size={18} />
                    )}
                    {isSubmitting ? 'Placing Order…' : 'Confirm & Open WhatsApp'}
                  </motion.button>
                </div>
              </div>

              <div className="lg:col-span-2">
                <OrderSummary />
              </div>
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 'done' && (
            <FadeInSection className="text-center py-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check size={36} className="text-black" />
              </motion.div>
              <h2 className="font-serif text-4xl font-light mb-3">Order Received!</h2>
              {orderNumber && (
                <p className="text-mid mb-2">Order No: <span className="text-gold font-medium">{orderNumber}</span></p>
              )}
              <p className="text-silver max-w-md mx-auto mb-10">
                Your order has been saved. Please send the WhatsApp message to confirm.
                We'll reach out to confirm delivery details.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary" onClick={() => navigate('/shop')}>
                  Continue Shopping
                </button>
                <button className="btn-outline" onClick={() => navigate('/')}>
                  Back to Home
                </button>
              </div>
            </FadeInSection>
          )}
        </div>
      </div>
    </>
  );
}

function OrderSummary() {
  const { items, subtotal } = useCartStore();
  const total = subtotal();

  return (
    <div className="bg-white/[0.015] border border-white/10 p-6 rounded-2xl space-y-4 sticky top-24 shadow-xl">
      <h3 className="font-sans text-[11px] font-semibold tracking-[0.2em] text-gold uppercase mb-4">Order Summary</h3>
      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3.5 items-center">
            <div className="w-12 h-16 bg-graphite flex-shrink-0 overflow-hidden rounded-lg border border-white/5">
              {item.image_url && (
                <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-cream font-medium leading-tight">{item.product_name}</p>
              {item.variant_size && (
                <span className="inline-block text-[10px] bg-white/5 border border-white/10 text-cream px-1.5 py-0.5 rounded-sm mt-1">
                  Size: {item.variant_size}
                </span>
              )}
              <p className="text-xs text-silver mt-1">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm text-cream font-medium">₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-4 space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-silver">Subtotal</span>
          <span className="text-cream">₹{total.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-silver">Shipping</span>
          <span className="text-gold font-semibold uppercase tracking-wider text-xs">Free</span>
        </div>
        <div className="flex justify-between font-medium text-base border-t border-white/10 pt-3">
          <span className="text-cream">Total</span>
          <span className="font-serif text-xl text-gold font-medium">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
