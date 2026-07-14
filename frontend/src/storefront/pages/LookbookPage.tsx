import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Plus, MessageSquare, X, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import { FadeInSection } from '../../components/motion/FadeInSection';
import type { LookbookCollection, LookbookHotspot, ProductListItem } from '../../types';

// Animated Hotspot Pin with breathing pulsing halo
interface HotspotPinProps {
  hotspot: LookbookHotspot;
  onSelectProduct: (product: ProductListItem) => void;
}

function HotspotPin({ hotspot, onSelectProduct }: HotspotPinProps) {
  const [hovered, setHovered] = useState(false);
  const product = hotspot.product;

  if (!product) return null;

  return (
    <div
      className="absolute"
      style={{ left: `${hotspot.x_percent}%`, top: `${hotspot.y_percent}%`, transform: 'translate(-50%, -50%)', zIndex: 20 }}
    >
      {/* Ripple ring effect */}
      <span className="absolute inline-flex h-8 w-8 rounded-full bg-gold/40 animate-ping -translate-x-[6px] -translate-y-[6px]" />

      <button
        onClick={() => onSelectProduct(product)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-5 h-5 rounded-full bg-[#C9A84C] border-2 border-white flex items-center justify-center shadow-2xl hover:scale-125 transition-all duration-300 cursor-pointer"
        aria-label={`View ${product.name}`}
      >
        <Plus size={10} className="text-black stroke-[3px]" />
      </button>

      {/* Elegant Hover Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: 5, x: '-50%' }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-3 left-1/2 w-44 bg-black/90 backdrop-blur-md border border-gold/20 p-3 shadow-2xl pointer-events-none text-center"
          >
            <p className="text-[10px] text-gold uppercase tracking-widest font-semibold mb-1">Quick View</p>
            <p className="text-[11px] text-cream font-light line-clamp-1 leading-snug">{product.name}</p>
            <p className="text-[10px] text-[#C9A84C] mt-0.5">₹{product.price.toLocaleString('en-IN')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Side Drawer for Shop the Look
interface ProductDrawerProps {
  product: ProductListItem | null;
  onClose: () => void;
}

function ProductDrawer({ product, onClose }: ProductDrawerProps) {
  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Sliding Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0D0D0D] border-l border-gold/15 p-8 flex flex-col justify-between h-full shadow-2xl z-50 overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-graphite/40 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-gold" />
                  <span className="text-[9px] tracking-[0.25em] text-gold uppercase font-bold">Featured Product</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-ash hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full cursor-pointer"
                  aria-label="Close details"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Main Image */}
              {product.images?.[0] && (
                <div className="relative overflow-hidden aspect-[4/5] mb-6 group border border-gold/10 bg-[#141414]">
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="font-serif text-2xl text-white font-light tracking-wide leading-tight">{product.name}</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-gold text-lg font-light">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.compare_at_price && (
                    <span className="text-ash text-xs line-through">₹{product.compare_at_price.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="h-[1px] bg-graphite/40 my-4" />
                <p className="text-xs text-cream/70 leading-relaxed font-light font-sans">
                  Tailored for the modern aesthetic, this piece embodies traditional craftsmanship reimagined. Designed to style effortlessly within your curated wardrobe.
                </p>
              </div>
            </div>

            {/* CTA action */}
            <div className="border-t border-graphite/40 pt-6 mt-8">
              <Link
                to={`/product/${product.slug}`}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#C9A84C] hover:bg-[#D4B860] text-black font-semibold text-[10px] tracking-[0.25em] uppercase transition-all duration-300 shadow-xl"
                onClick={onClose}
              >
                View Product Details <ArrowRight size={12} />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Lookbook Image Card
interface LookbookImageCardProps {
  image: LookbookCollection['images'][0];
  isLarge?: boolean;
  onSelectProduct: (product: ProductListItem) => void;
}

function LookbookImageCard({ image, isLarge = false, onSelectProduct }: LookbookImageCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative overflow-hidden group border border-white/5 rounded-[24px] ${isLarge ? 'row-span-2' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.img
        src={image.url}
        alt={image.alt_text || 'Lookbook image'}
        className="w-full h-full object-cover rounded-[24px]"
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ aspectRatio: isLarge ? '2/3' : '1' }}
      />
      <div className={`absolute inset-0 bg-black/30 transition-opacity duration-300 rounded-[24px] ${hovered ? 'opacity-100' : 'opacity-0'}`} />

      {/* Hotspot pins */}
      {image.hotspots?.map((hotspot) => (
        <HotspotPin key={hotspot.id} hotspot={hotspot} onSelectProduct={onSelectProduct} />
      ))}

      {/* "Shop the look" label */}
      {image.hotspots?.length > 0 && (
        <motion.div
          className="absolute bottom-4 left-4 z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-[9px] tracking-widest uppercase bg-gold text-black px-3.5 py-2 flex items-center gap-1.5 font-bold shadow-lg rounded-[14px]">
            <ShoppingBag size={10} /> Shop the Look
          </span>
        </motion.div>
      )}
    </div>
  );
}

// Placeholder editorial content for when no data exists
const PLACEHOLDER_COLLECTIONS: LookbookCollection[] = [
  {
    id: '1',
    title: 'Bridal Diaries',
    slug: 'bridal-diaries',
    description: 'Intricate custom silhouettes, handwoven gold zardozi work, and bespoke details tailored for the royal bride.',
    season: 'Bridal Couture',
    cover_image_url: undefined,
    is_published: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    images: [
      { id: '1', url: '/brand/img3.png', alt_text: 'Bridal Mannequin Display', sort_order: 0, layout_size: 'large', hotspots: [] },
      { id: '2', url: '/brand/img1.png', alt_text: 'Close up Zardozi detail', sort_order: 1, layout_size: 'medium', hotspots: [] },
      { id: '3', url: '/brand/img4.png', alt_text: 'Bridal portrait close-up', sort_order: 2, layout_size: 'medium', hotspots: [] },
    ],
  },
  {
    id: '2',
    title: 'Luxury Ethnic',
    slug: 'luxury-ethnic',
    description: 'Timeless traditional ethnic designs and statement silhouettes for modern celebrations.',
    season: 'Festive Collection',
    cover_image_url: undefined,
    is_published: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    images: [
      { id: '5', url: '/brand/img2.png', alt_text: 'Model in custom ethnic wear', sort_order: 0, layout_size: 'large', hotspots: [] },
      { id: '6', url: '/brand/img5.png', alt_text: 'Handcrafted purse and lehenga detail', sort_order: 1, layout_size: 'medium', hotspots: [] },
    ],
  },
];

export function LookbookPage() {
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 160]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.2]);

  const { data: collections, isLoading } = useQuery<LookbookCollection[]>({
    queryKey: ['lookbook'],
    queryFn: () => api.get('/content/lookbook').then((r) => r.data),
  });

  const displayCollections = collections?.length ? collections : PLACEHOLDER_COLLECTIONS;
  const activeId = activeCollection || displayCollections[0]?.id;
  const activeData = displayCollections.find((c) => c.id === activeId) || displayCollections[0];

  return (
    <>
      <Helmet>
        <title>Lookbook — Exotic</title>
        <meta name="description" content="Explore Exotic's editorial lookbook — styled collections, seasonal drops, and shop-the-look features." />
      </Helmet>

      {/* Hero with Parallax */}
      <div className="relative h-[55vh] min-h-[400px] flex items-end overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(/brand/lookbook_hero_banner.png)`,
            y: heroY,
            opacity: heroOpacity
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent z-[2]" />

        <div className="relative section-container pb-16 z-10 w-full">
          <FadeInSection className="max-w-2xl text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[10px] tracking-[0.3em] text-[#C9A84C] uppercase font-semibold mb-3">Editorial Campaign</p>
              <h1 className="text-5xl md:text-7xl font-serif font-light text-white tracking-wide leading-none">Lookbook</h1>
            </motion.div>
          </FadeInSection>
        </div>
      </div>

      {/* Premium Sticky Navigation Bar - Upgraded to 3D sliding capsule buttons */}
      <div className="bg-[#0A0A0A] border-b border-white/10 sticky top-16 md:top-20 z-40 shadow-xl transition-all duration-300 py-4">
        <div className="section-container">
          <div className="inline-flex bg-[#121212] border border-white/5 p-1.5 rounded-full gap-2 overflow-x-auto scrollbar-hide max-w-full">
            {displayCollections.map((collection) => {
              const isActive = collection.id === activeId;
              return (
                <button
                  key={collection.id}
                  onClick={() => setActiveCollection(collection.id)}
                  className={`relative flex-shrink-0 px-8 py-3 rounded-full flex items-center justify-center text-center transition-all duration-500 focus:outline-none cursor-pointer text-[10px] tracking-[0.22em] uppercase font-bold z-10 ${isActive ? 'text-black font-extrabold' : 'text-cream/60 hover:text-white hover:scale-102'
                    }`}
                >
                  {/* Sliding capsule background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeCapsuleBackground"
                      className="absolute inset-0 bg-gradient-to-r from-[#C9A84C] to-[#E1C269] rounded-full shadow-[0_4px_15px_rgba(201,168,76,0.3)]"
                      style={{ zIndex: -1 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  {collection.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Collection Container */}
      <AnimatePresence mode="wait">
        {activeData && (
          <motion.div
            key={activeData.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#0A0A0A] relative z-10"
          >
            {/* Added generous padding top (pt-20 md:pt-28) to guarantee separation from sticky navigation bar */}
            <div className="section-container pt-20 pb-16 md:pt-28 md:pb-24">
              {/* Luxury Split Screen Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

                {/* Left Panel: Static Description & Notes (Sticky on Desktop) */}
                <div className="lg:col-span-4 lg:sticky lg:top-40 space-y-8">
                  <div>

                    <h2 className="font-serif text-3xl md:text-4xl text-white font-light tracking-wide leading-tight mb-4">
                      {activeData.title}
                    </h2>
                    <p className="text-xs text-cream/70 leading-relaxed font-light">
                      {activeData.description || 'Intricate custom silhouettes, handwoven details, and bespoke finishes tailored specifically for the discerning collector.'}
                    </p>
                  </div>

                  {/* Glassmorphic Director's Note */}
                  <div className="bg-[#121212] border border-white/5 p-6 md:p-8 relative overflow-hidden shadow-2xl">
                    <span className="absolute top-0 right-1 text-gold/5 font-serif text-[130px] leading-none select-none pointer-events-none">“</span>
                    <p className="font-serif text-xs italic text-cream/80 leading-relaxed font-light mb-4 relative z-10">
                      "Every thread we weave holds a legacy of heritage spanning generations. With this collection, we showcase silhouettes that blend modern structure with the soul of ancient Indian craftsmanship."
                    </p>
                    <p className="text-[9px] text-gold uppercase tracking-[0.2em] font-sans font-medium">
                      — Tausif Ahmed
                    </p>
                  </div>

                  {/* Elegant Request Lookbook Button */}
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919039624538'}?text=${encodeURIComponent(
                        `Hello Exotic! I would like to request the lookbook for your latest Couture collections.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full lg:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-transparent border border-[#C9A84C] text-[#C9A84C] text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-[#C9A84C] hover:text-black transition-all duration-300 cursor-pointer shadow-lg rounded-[14px]"
                    >
                      <MessageSquare size={12} /> Request Lookbook
                    </a>
                  </div>
                </div>

                {/* Right Panel: Interactive Editorial Staggered Image Grid */}
                <div className="lg:col-span-8">
                  {activeData.images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {activeData.images.map((image, i) => {
                        const isLarge = image.layout_size === 'large' || image.layout_size === 'full' || i === 0;
                        return (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className={isLarge && i === 0 ? 'md:col-span-2' : ''}
                          >
                            <LookbookImageCard
                              image={image}
                              isLarge={isLarge && i === 0}
                              onSelectProduct={setSelectedProduct}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 border border-white/5 bg-[#121212]">
                      <p className="text-xs text-ash tracking-widest uppercase">No collection images available</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Drawer */}
      <ProductDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      {isLoading && (
        <div className="section-container py-24 bg-[#0A0A0A]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-[400px] bg-[#121212] animate-pulse border border-white/5" />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
