import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, ChevronDown, ArrowLeft, Share2, Check } from 'lucide-react';
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
    <div className="border-b border-graphite">
      <button
        className="flex items-center justify-between w-full py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-label text-xs text-ash">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={16} className="text-mid" />
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
            <div className="pb-4 text-sm text-silver leading-relaxed">{children}</div>
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

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

  const { data: related } = useQuery<ProductListItem[]>({
    queryKey: ['products', 'related', product?.category_id],
    queryFn: () =>
      api.get('/products', {
        params: { category: product?.category?.slug, limit: 4 },
      }).then((r) => r.data.filter((p: ProductListItem) => p.id !== product?.id).slice(0, 4)),
    enabled: !!product?.category_id,
  });

  if (isLoading) {
    return (
      <div className="pt-16 md:pt-20 section-container py-16">
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
  const sizes = [...new Set(product.variants.filter((v) => v.size && v.is_active).map((v) => v.size!))];
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

    const cartItemId = `${product.id}-${selectedVariant?.id || 'default'}`;
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

      <div className="pt-16 md:pt-20">
        <div className="section-container py-8 md:py-14">
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
                  className="relative overflow-hidden bg-graphite cursor-zoom-in"
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
            <div className="space-y-6">
              {product.category && (
                <p className="text-label text-[10px] text-gold">{product.category.name}</p>
              )}
              <h1 className="font-serif text-4xl md:text-5xl font-light leading-tight">{product.name}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-medium text-cream">
                  ₹{effectivePrice.toLocaleString('en-IN')}
                </span>
                {product.compare_at_price && (
                  <span className="text-lg text-mid line-through">
                    ₹{product.compare_at_price.toLocaleString('en-IN')}
                  </span>
                )}
                {product.compare_at_price && (
                  <span className="text-label text-[10px] bg-gold/20 text-gold px-2 py-0.5">
                    {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                  </span>
                )}
              </div>

              <div className="gold-divider" />

              {/* Color Selector */}
              {colors.length > 0 && (
                <div>
                  <p className="text-label text-xs text-ash mb-3">
                    Color: <span className="text-cream font-normal">{selectedColor || 'Select'}</span>
                  </p>
                  <div className="flex gap-2">
                    {colors.map((color) => {
                      const variant = product.variants.find((v) => v.color === color);
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${selectedColor === color ? 'border-gold scale-110' : 'border-transparent hover:border-ash'
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

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-label text-xs text-ash">
                      Size: <span className="text-cream font-normal">{selectedSize || 'Select'}</span>
                    </p>
                    <Link to="/size-guide" className="text-xs text-gold hover:underline">Size Guide</Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const v = product.variants.find(
                        (va) => va.size === size && (!selectedColor || va.color === selectedColor)
                      );
                      const outOfStock = v && v.stock === 0;
                      return (
                        <motion.button
                          key={size}
                          onClick={() => !outOfStock && setSelectedSize(size)}
                          whileHover={!outOfStock ? { scale: 1.05 } : {}}
                          className={`w-12 h-12 text-sm border transition-all duration-200 relative ${selectedSize === size
                            ? 'border-gold bg-gold text-black font-medium'
                            : outOfStock
                              ? 'border-graphite text-muted cursor-not-allowed'
                              : 'border-graphite text-silver hover:border-ash cursor-pointer'
                            }`}
                          aria-label={`Size ${size}${outOfStock ? ' — Out of stock' : ''}`}
                        >
                          {size}
                          {outOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <span className="block w-full h-px bg-muted rotate-45" />
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-graphite">
                  <button
                    className="w-11 h-11 flex items-center justify-center text-silver hover:text-cream transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    className="w-11 h-11 flex items-center justify-center text-silver hover:text-cream transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >+</button>
                </div>

                {!inStock && (
                  <span className="text-xs text-mid">Out of stock</span>
                )}
              </div>

              {/* Add to cart */}
              <motion.button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`btn-primary w-full justify-center text-sm ${!inStock ? 'opacity-40 cursor-not-allowed' : ''}`}
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

              <button
                className="flex items-center gap-2 text-xs text-silver hover:text-cream transition-colors"
                onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
              >
                <Share2 size={14} /> Share
              </button>

              {/* Accordions */}
              <div className="mt-4 border-t border-graphite">
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
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related && related.length > 0 && (
          <div className="section-py bg-charcoal">
            <div className="section-container">
              <FadeInSection className="mb-10">
                <p className="text-label text-gold text-xs mb-2">You may also like</p>
                <h2 className="text-title font-serif font-light">Complete the Look</h2>
              </FadeInSection>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
