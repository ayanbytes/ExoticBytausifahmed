import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ChevronDown, ArrowLeft, Share2, Check, Heart, ChevronLeft, ChevronRight, Truck, Zap, ShieldCheck, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import { FadeInSection } from '../../components/motion/FadeInSection';
import { ProductCard } from '../components/ProductCard';
import type { Product, ProductListItem } from '../../types';

// Expandable accordion section
function AccordionSection({ title, children, defaultOpen = false }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div 
      style={{ marginBottom: '16px' }}
      className={`transition-all duration-300 rounded-2xl border ${
        open 
          ? 'bg-white/[0.03] border-gold/20 shadow-[0_8px_32px_rgba(201,168,76,0.03)]' 
          : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
      }`}
    >
      <button
        className="flex items-center justify-between w-full px-6 py-5 text-left cursor-pointer group"
        onClick={() => setOpen(!open)}
      >
        <span className={`font-sans text-xs md:text-sm font-semibold tracking-[0.2em] uppercase transition-colors duration-300 ${
          open ? 'text-gold' : 'text-cream'
        }`}>{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className={`${open ? 'text-gold' : 'text-mid'} transition-colors duration-300`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-sm md:text-base text-silver leading-relaxed font-light font-sans">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, openCart } = useCartStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, active: false });
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleBuyItNow = () => {
    const cartItemId = `${product?.id}-${selectedVariant?.id || 'default'}-${selectedSize || ''}-${selectedColor || ''}`;
    addItem({
      id: cartItemId,
      product_id: product!.id,
      product_name: product!.name,
      product_slug: product!.slug,
      variant_id: selectedVariant?.id,
      variant_size: selectedSize || undefined,
      variant_color: selectedColor || undefined,
      quantity,
      unit_price: effectivePrice,
      image_url: primaryImage?.url,
    });
    navigate('/checkout');
  };

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

  const { data: related } = useQuery<ProductListItem[]>({
    queryKey: ['products', 'related', product?.category_id, product?.id],
    queryFn: async () => {
      // 1. Try to fetch products by active category
      const res = await api.get('/products', {
        params: { category: product?.category?.slug, limit: 10 },
      });
      let list = res.data.filter((p: ProductListItem) => p.id !== product?.id);
      
      // 2. If list is less than 4, fetch general products to fill the container
      if (list.length < 4) {
        const fallbackRes = await api.get('/products', { params: { limit: 10 } });
        const fallbackList = fallbackRes.data.filter((p: ProductListItem) => p.id !== product?.id);
        
        for (const item of fallbackList) {
          if (!list.some((existing) => existing.id === item.id)) {
            list.push(item);
          }
          if (list.length >= 4) break;
        }
      }
      return list.slice(0, 4);
    },
    enabled: !!product,
  });

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="h-16 md:h-20" />
        <div className="section-container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="skeleton" style={{ aspectRatio: '3/4' }} />
          <div className="space-y-4">
            <div className="skeleton h-8 w-2/3 rounded" />
            <div className="skeleton h-6 w-1/3 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-4/5 rounded" />
        </div>
      </div>
      </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 text-center py-20">
        <h1 className="font-serif text-3xl mb-4">Product Not Found</h1>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const primaryImage = product.images[selectedImage] || product.images[0];
  const dbSizes = [...new Set(product.variants.filter((v) => v.size && v.is_active).map((v) => v.size!))];
  const sizes = dbSizes.length > 0 ? dbSizes : ['M', 'L', 'XL', '2XL', '3XL'];
  const colors = [...new Set(product.variants.filter((v) => v.color && v.is_active).map((v) => v.color!))];

  const selectedVariant = product.variants.find(
    (v) =>
      (!selectedSize || v.size === selectedSize) &&
      (!selectedColor || v.color === selectedColor)
  );

  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.total_stock > 0;
  const effectivePrice = product.price + (selectedVariant?.price_modifier || 0);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const cartItemId = `${product.id}-${selectedVariant?.id || 'default'}-${selectedSize || ''}-${selectedColor || ''}`;
    addItem({
      id: cartItemId,
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      variant_id: selectedVariant?.id,
      variant_size: selectedSize || undefined,
      variant_color: selectedColor || undefined,
      quantity,
      unit_price: effectivePrice,
      image_url: primaryImage?.url,
    });

    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      openCart();
    }, 600);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y, active: true });
  };

  return (
    <>
      <Helmet>
        <title>{product.name} — Exotic</title>
        <meta name="description" content={product.description?.slice(0, 155) || `Shop ${product.name} at Exotic.`} />
        {primaryImage && <meta property="og:image" content={primaryImage.url} />}
      </Helmet>

      <div className="bg-black min-h-screen">
        {/* Navbar Spacer */}
        <div className="h-16 md:h-20" />

        <div className="section-container pt-6 pb-8 md:pt-10 md:pb-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-mid">
            <button onClick={() => navigate(-1)} className="hover:text-cream flex items-center gap-1 transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
            <span>/</span>
            {product.category && (
              <>
                <Link to={`/shop?category=${product.category.slug}`} className="hover:text-cream transition-colors">
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-silver">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image Gallery */}
            <div className="flex gap-3">
              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="hidden sm:flex flex-col gap-2 w-16">
                  {product.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-20 overflow-hidden border-2 transition-colors duration-200 ${i === selectedImage ? 'border-gold' : 'border-transparent hover:border-ash'
                        }`}
                    >
                      <img src={img.url} alt={img.alt_text || `${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="flex-1">
                <div
                  className="relative overflow-hidden bg-graphite cursor-zoom-in group/image rounded-2xl border border-white/5 shadow-lg"
                  style={{ aspectRatio: '3/4' }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setZoomPos({ x: 0, y: 0, active: false })}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={primaryImage?.url}
                      src={primaryImage?.url}
                      alt={primaryImage?.alt_text || product.name}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={zoomPos.active ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transform: 'scale(1.5)',
                        transition: 'transform 0.1s ease',
                      } : {}}
                    />
                  </AnimatePresence>

                  {/* Left / Right Carousel Chevrons */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/75 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 hover:bg-black/75 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.is_new_arrival && (
                      <span className="text-label text-[9px] bg-gold text-black px-2 py-0.5">NEW</span>
                    )}
                  </div>
                </div>

                {/* Mobile thumbnail strip */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto sm:hidden">
                    {product.images.map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(i)}
                        className={`flex-shrink-0 w-14 h-16 overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-gold' : 'border-transparent'
                          }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8 lg:pl-4">
              <div className="space-y-3">
                {product.category && (
                  <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-gold">{product.category.name}</p>
                )}
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-wide text-white">{product.name}</h1>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3.5">
                <span className="text-2xl md:text-3xl font-light text-cream">
                  ₹{effectivePrice.toLocaleString('en-IN')}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <span className="text-base md:text-lg text-mid line-through font-light">
                      ₹{product.compare_at_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-label text-[10px] bg-gold/15 text-gold px-2.5 py-0.5 rounded-sm font-semibold">
                      {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="border-b border-white/10" />

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div className="flex items-center justify-between mb-3.5">
                    <p className="font-sans text-[11px] tracking-[0.2em] text-ash uppercase font-semibold">
                      Size: <span className="text-gold font-bold tracking-normal ml-1.5">{selectedSize || 'Select'}</span>
                    </p>
                    <button 
                      type="button" 
                      onClick={() => setShowSizeGuide(true)} 
                      className="text-xs text-gold/80 hover:text-gold hover:underline tracking-wide transition-colors font-medium cursor-pointer bg-transparent border-none"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => {
                      const v = product.variants.find(
                        (va) => va.size === size && (!selectedColor || va.color === selectedColor)
                      );
                      const outOfStock = v && v.stock === 0;
                      return (
                        <motion.button
                          key={size}
                          onClick={() => !outOfStock && setSelectedSize(size)}
                          whileHover={!outOfStock ? { scale: 1.02 } : {}}
                          className={`px-5 py-2 h-11 min-w-[3.5rem] text-xs tracking-wider font-bold border transition-all duration-300 relative rounded-md flex items-center justify-center cursor-pointer ${selectedSize === size
                            ? 'border-gold bg-gold text-black shadow-lg shadow-gold/15'
                            : outOfStock
                              ? 'border-white/5 text-muted cursor-not-allowed bg-white/[0.005]'
                              : 'border-white/10 text-silver hover:border-gold hover:text-gold hover:bg-gold/5 bg-white/[0.01]'
                            }`}
                          aria-label={`Size ${size}${outOfStock ? ' — Out of stock' : ''}`}
                        >
                          {size}
                          {outOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="block w-full h-px bg-muted/60 rotate-45" />
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {colors.length > 0 && (
                <div>
                  <p className="font-sans text-xs tracking-wider text-ash uppercase font-semibold mb-3">
                    Color: <span className="text-cream font-normal normal-case ml-1">{selectedColor || 'Select'}</span>
                  </p>
                  <div className="flex gap-3">
                    {colors.map((color) => {
                      const variant = product.variants.find((v) => v.color === color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-9 h-9 rounded-full border-2 transition-all duration-300 cursor-pointer ${selectedColor === color ? 'border-gold scale-110 shadow-lg shadow-gold/20' : 'border-transparent hover:border-ash/50'
                            }`}
                          style={{ backgroundColor: variant?.color_hex || '#888' }}
                          title={color}
                          aria-label={`Color: ${color}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Controls and Actions (Clean Editorial Layout) */}
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div style={{ marginBottom: '20px' }}>
                  <p className="font-sans text-xs tracking-wider text-ash uppercase font-semibold mb-3">Quantity</p>
                  <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-white/[0.01] h-12 w-full sm:w-36">
                    <button
                      className="w-12 h-full flex items-center justify-center text-silver hover:text-cream hover:bg-white/5 transition-colors cursor-pointer text-lg font-light"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="flex-1 text-center font-sans font-medium text-sm text-cream">{quantity}</span>
                    <button
                      className="w-12 h-full flex items-center justify-center text-silver hover:text-cream hover:bg-white/5 transition-colors cursor-pointer text-lg font-light"
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>

                {/* Purchase CTAs Stack */}
                <div style={{ marginBottom: '20px' }} className="pt-2">
                  {/* Add to Bag */}
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    style={{ marginBottom: '12px' }}
                    className={`w-full justify-center text-xs tracking-[0.2em] uppercase font-bold rounded-lg h-12 px-6 border border-gold hover:bg-gold/5 text-gold flex items-center gap-2 transition-all duration-300 cursor-pointer ${!inStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                    whileTap={inStock ? { scale: 0.98 } : {}}
                  >
                    <AnimatePresence mode="wait">
                      {addedToCart ? (
                        <motion.span
                          key="added"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Check size={16} /> Added to Bag
                        </motion.span>
                      ) : (
                        <motion.span
                          key="add"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <ShoppingBag size={16} />
                          {inStock ? 'Add to Bag' : 'Out of Stock'}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Buy It Now */}
                  <motion.button
                    onClick={handleBuyItNow}
                    disabled={!inStock}
                    className={`btn-primary w-full justify-center text-xs tracking-[0.2em] uppercase font-bold rounded-lg h-12 px-6 cursor-pointer ${!inStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                    whileTap={inStock ? { scale: 0.98 } : {}}
                  >
                    Buy It Now
                  </motion.button>
                </div>

                {/* Wishlist & Share Secondary Actions */}
                <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-6">
                  {/* Add to Wishlist */}
                  <button 
                    className="flex items-center gap-2 text-[11px] text-silver hover:text-gold transition-colors cursor-pointer font-bold tracking-[0.15em] uppercase"
                    title="Add to Wishlist"
                    aria-label="Add to Wishlist"
                  >
                    <Heart size={14} className="text-silver hover:text-gold transition-colors" /> Add to Wishlist
                  </button>

                  {/* Share */}
                  <button
                    className="flex items-center gap-2 text-[11px] text-silver hover:text-gold transition-colors cursor-pointer font-bold tracking-[0.15em] uppercase"
                    onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                  >
                    <Share2 size={13} /> Share Piece
                  </button>
                </div>
              </div>

              {/* Accordions */}
              <div className="mt-14 space-y-4">
                {product.description && (
                  <AccordionSection title="Description" defaultOpen={true}>
                    <p>{product.description}</p>
                  </AccordionSection>
                )}
                {product.size_guide && (
                  <AccordionSection title="Size Guide">
                    <div dangerouslySetInnerHTML={{ __html: product.size_guide }} />
                  </AccordionSection>
                )}
                <AccordionSection title="Shipping & Delivery">
                  <p>{product.shipping_info || 'Standard delivery in 3–7 business days. Express delivery available at checkout.'}</p>
                </AccordionSection>
                <AccordionSection title="Returns">
                  <p>{product.return_policy || 'Easy 30-day returns for unworn items with original tags attached.'}</p>
                </AccordionSection>
              </div>

              {/* Trust Badges */}
              <div 
                style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}
                className="mt-16 border-t border-white/5 pt-8"
              >
                <div className="bg-white/[0.015] border border-white/5 rounded-2xl p-4.5 flex items-start gap-3.5">
                  <Truck className="text-gold mt-0.5 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-semibold text-cream tracking-wide">Free Shipping</h4>
                    <p className="text-[10px] text-silver mt-1 leading-relaxed">Delivered in 3–5 business days</p>
                  </div>
                </div>
                <div className="bg-white/[0.015] border border-white/5 rounded-2xl p-4.5 flex items-start gap-3.5">
                  <Zap className="text-gold mt-0.5 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-semibold text-cream tracking-wide">Ships in 24 Hours</h4>
                    <p className="text-[10px] text-silver mt-1 leading-relaxed">90% of orders shipped same day</p>
                  </div>
                </div>
                <div className="bg-white/[0.015] border border-white/5 rounded-2xl p-4.5 flex items-start gap-3.5">
                  <ShieldCheck className="text-gold mt-0.5 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-semibold text-cream tracking-wide">Secure Checkout</h4>
                    <p className="text-[10px] text-silver mt-1 leading-relaxed">Safe & encrypted payments</p>
                  </div>
                </div>
                <div className="bg-white/[0.015] border border-white/5 rounded-2xl p-4.5 flex items-start gap-3.5">
                  <DollarSign className="text-gold mt-0.5 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-semibold text-cream tracking-wide">COD Available</h4>
                    <p className="text-[10px] text-silver mt-1 leading-relaxed">Pay cash on delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="border-t border-white/5 py-16 mt-16 text-center">
          <div className="section-container">
            <h2 className="font-serif text-2xl md:text-3xl font-light text-cream mb-4">Customer Reviews</h2>
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-sm text-silver font-light">Be the first to write a review</p>
              <button className="px-6 py-3 border border-white/10 hover:border-gold hover:text-gold text-silver rounded-lg text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 bg-white/[0.01] hover:bg-gold/5 cursor-pointer">
                Write a review
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related && related.length > 0 && (
          <div className="section-py border-t border-white/5">
            <div className="section-container">
              <FadeInSection className="mb-12 text-center">
                <h2 className="font-serif text-2xl md:text-3xl font-light text-cream">You May Also Like...</h2>
              </FadeInSection>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Size Guide Modal Overlay */}
        <AnimatePresence>
          {showSizeGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSizeGuide(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
              />
              
              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-lg bg-[#0c0c0c] border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl z-10 overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="absolute top-4 right-4 text-silver hover:text-gold transition-colors cursor-pointer text-2xl font-light leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5"
                  aria-label="Close modal"
                >
                  &times;
                </button>

                {/* Content */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="font-serif text-2xl text-cream tracking-wide">Size Guide</h3>
                </div>
                
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse border border-white/10 text-xs md:text-sm text-silver font-sans">
                    <thead>
                      <tr>
                        <th colSpan={4} className="border border-white/10 py-3 bg-white/[0.02] font-semibold text-cream italic tracking-wide">
                          STRAIGHT KURTI FARMA INCHWISE
                        </th>
                      </tr>
                      <tr className="bg-white/[0.01]">
                        <th className="border border-white/10 py-2.5 font-bold text-cream uppercase tracking-wider">Size</th>
                        <th className="border border-white/10 py-2.5 font-bold text-cream uppercase tracking-wider">Bust</th>
                        <th className="border border-white/10 py-2.5 font-bold text-cream uppercase tracking-wider">Waist</th>
                        <th className="border border-white/10 py-2.5 font-bold text-cream uppercase tracking-wider">Hip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: 'M', bust: '38.5"', waist: '34.5"', hip: '40.5"' },
                        { size: 'L', bust: '40.5"', waist: '37.5"', hip: '42.5"' },
                        { size: 'XL', bust: '42.5"', waist: '40.5"', hip: '45.5"' },
                        { size: '2XL', bust: '44.5"', waist: '42.5"', hip: '47.5"' },
                        { size: '3XL', bust: '46.5"', waist: '45.5"', hip: '51.5"' }
                      ].map((row) => (
                        <tr key={row.size} className="hover:bg-white/[0.02] transition-colors">
                          <td className="border border-white/10 py-3 font-bold text-cream bg-white/[0.005]">{row.size}</td>
                          <td className="border border-white/10 py-3 font-light">{row.bust}</td>
                          <td className="border border-white/10 py-3 font-light">{row.waist}</td>
                          <td className="border border-white/10 py-3 font-light">{row.hip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
