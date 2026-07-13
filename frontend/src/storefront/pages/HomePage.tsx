import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/api';
import { FadeInSection } from '../../components/motion/FadeInSection';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import type { ProductListItem, HeroBanner, Category } from '../../types';

// ─── Hero Section ─────────────────────────────────────────────────────────────

// Placeholder editorial hero images — replace with actual brand photography
const HERO_SLIDES = [
  {
    id: '1',
    title: 'The Art of\nZardozi Couture.',
    subtitle: 'Exquisite bridal wear and luxury ethnic masterpieces shaped by 12+ years of pristine design heritage.',
    cta_text: 'View Bridal Collection',
    cta_link: '/shop?category=apparel',
    image_url: '/brand/img1_enhanced.png',
  },
  {
    id: '2',
    title: 'Custom Bridal\nDiaries.',
    subtitle: 'Hand-crafted bridal gowns and bespoke ethnic sets tailored to perfection. By appointment only.',
    cta_text: 'Explore Lookbook',
    cta_link: '/lookbook',
    image_url: '/brand/creamish_enhanced.png',
  },
  {
    id: '3',
    title: 'Luxury Ethnic',
    subtitle: 'Bespoke silhouettes, gold embellishments, and custom tailoring for modern heritage statement pieces.',
    cta_text: 'Book Consultation',
    cta_link: '/contact',
    image_url: '/brand/img2_enhanced.png',
  },
];

const PLACEHOLDER_PRODUCTS: ProductListItem[] = [
  {
    id: 'p1',
    name: 'Zardozi Maroon Bridal Lehenga',
    slug: 'zardozi-maroon-lehenga',
    price: 185000,
    compare_at_price: 210000,
    is_published: true,
    is_featured: true,
    is_new_arrival: true,
    total_stock: 10,
    low_stock_threshold: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img1_1', url: '/brand/img1.png', is_primary: true, is_hover: false, sort_order: 0 },
      { id: 'img1_2', url: '/brand/img1.png', is_primary: false, is_hover: true, sort_order: 1 }
    ]
  },
  {
    id: 'p2',
    name: 'Peach Sharara Designer Suit',
    slug: 'peach-sharara-suit',
    price: 85000,
    compare_at_price: undefined,
    is_published: true,
    is_featured: true,
    is_new_arrival: true,
    total_stock: 8,
    low_stock_threshold: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img2_1', url: '/brand/img2.png', is_primary: true, is_hover: false, sort_order: 0 },
      { id: 'img2_2', url: '/brand/img2.png', is_primary: false, is_hover: true, sort_order: 1 }
    ]
  },
  {
    id: 'p3',
    name: 'Heritage Red Silk Anarkali',
    slug: 'heritage-red-anarkali',
    price: 120000,
    compare_at_price: 145000,
    is_published: true,
    is_featured: true,
    is_new_arrival: true,
    total_stock: 5,
    low_stock_threshold: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img3_1', url: '/brand/img3.png', is_primary: true, is_hover: false, sort_order: 0 },
      { id: 'img3_2', url: '/brand/img3.png', is_primary: false, is_hover: true, sort_order: 1 }
    ]
  },
  {
    id: 'p4',
    name: 'Royal Bridal Kundan Choker',
    slug: 'royal-kundan-choker',
    price: 65000,
    compare_at_price: undefined,
    is_published: true,
    is_featured: true,
    is_new_arrival: true,
    total_stock: 3,
    low_stock_threshold: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img4_1', url: '/brand/img4.png', is_primary: true, is_hover: false, sort_order: 0 },
      { id: 'img4_2', url: '/brand/img4.png', is_primary: false, is_hover: true, sort_order: 1 }
    ]
  },
  {
    id: 'p5',
    name: 'Gilded Gold Embroidered Suit',
    slug: 'gilded-gold-silk-suit',
    price: 95000,
    compare_at_price: undefined,
    is_published: true,
    is_featured: true,
    is_new_arrival: true,
    total_stock: 4,
    low_stock_threshold: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img5_1', url: '/brand/img5.png', is_primary: true, is_hover: false, sort_order: 0 },
      { id: 'img5_2', url: '/brand/img5.png', is_primary: false, is_hover: true, sort_order: 1 }
    ]
  }
];

function HeroSection({ banners }: { banners?: HeroBanner[] }) {
  const slides = banners?.length
    ? banners.map((b, idx) => ({
        ...b,
        title: b.title || HERO_SLIDES[idx % HERO_SLIDES.length].title,
        subtitle: b.subtitle || HERO_SLIDES[idx % HERO_SLIDES.length].subtitle,
        cta_text: b.cta_text || HERO_SLIDES[idx % HERO_SLIDES.length].cta_text,
        cta_link: b.cta_link || HERO_SLIDES[idx % HERO_SLIDES.length].cta_link,
        image_url: b.image_url || HERO_SLIDES[idx % HERO_SLIDES.length].image_url
      }))
    : HERO_SLIDES;
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(intervalRef.current);
  }, [slides.length]);

  const slide = slides[current];

  return (
    <section className="relative h-screen flex flex-col overflow-hidden">
      {/* Spacer to keep the image container completely below the navbar */}
      <div className="h-16 md:h-20 bg-transparent shrink-0" />

      {/* Main slider body */}
      <div className="relative flex-1 flex items-center overflow-hidden">
        {/* Background image */}
        <AnimatePresence mode="sync">
          <motion.div
            key={slide.id}
            className="absolute inset-0 bg-cover bg-top md:bg-[center_58%]"
            style={{ backgroundImage: `url(${slide.image_url})` }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </AnimatePresence>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="section-container relative z-10 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mr-auto -ml-2 sm:-ml-4 md:-ml-8 lg:-ml-12 xl:-ml-16"
            >
              {/* Category Tag */}
              <p className="text-label text-gold text-xs mb-6">
                EXOTIC BY TAUSIF AHMED — Custom Couture
              </p>

              {/* Title */}
              <h1
                className="text-display text-white mb-6"
                style={{ whiteSpace: 'pre-line', lineHeight: '1.05' }}
              >
                {slide.title}
              </h1>

              {/* CTA Button */}
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <Link to="/shop" className="btn-primary">
                  Shop Now
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 right-8 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-label text-ash/60 text-[9px] writing-vertical-lr rotate-90">
            SCROLL
          </span>
          <ChevronDown size={16} className="text-ash/60" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Marquee Strip ─────────────────────────────────────────────────────────────

function MarqueeStrip() {
  const items = [
    '✦ Bespoke Bridal Designing',
    '✦ Handcrafted Zardozi Couture',
    '✦ Luxury Ethnic Collection',
    '✦ 12+ Years Craftsmanship',
    '✦ Studio Trials By Appointment',
    '✦ Custom Made-to-Measure',
  ];
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden bg-gold py-3">
      <div className="flex whitespace-nowrap marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center px-6 text-label text-[10px] font-semibold text-black tracking-widest"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Category Grid ─────────────────────────────────────────────────────────────

const PLACEHOLDER_CATEGORIES = [
  { name: 'Bridal Wear', slug: 'bridal-wear', image_url: '/brand/img3.png' },
  { name: 'Luxury Ethnic', slug: 'luxury-ethnic', image_url: '/brand/img2.png' },
  { name: 'Bespoke Jewellery', slug: 'jewellery', image_url: '/brand/img4.png' },
  { name: 'Accessories', slug: 'accessories', image_url: '/brand/img5.png' },
];

function CategoryGrid({ categories }: { categories?: Category[] }) {
  const items = categories?.length
    ? categories.map((cat, idx) => ({
        ...cat,
        image_url: cat.image_url || PLACEHOLDER_CATEGORIES[idx % PLACEHOLDER_CATEGORIES.length].image_url
      }))
    : PLACEHOLDER_CATEGORIES;

  return (
    <section className="section-py bg-charcoal">
      <div className="section-container">
        <FadeInSection className="text-center" style={{ marginBottom: '3rem' }}>
          <p className="text-label text-gold text-xs mb-3">Curated for you</p>
          <h2 className="text-headline">Shop by Category</h2>
        </FadeInSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {items.map((cat, i) => (
            <FadeInSection key={cat.slug} delay={i * 0.08}>
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group relative overflow-hidden block"
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={cat.image_url || ''}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="font-serif text-lg sm:text-xl font-light text-white leading-tight">{cat.name}</h3>
                  <p className="text-label text-[9px] text-gold mt-1.5 flex items-center gap-1">
                    Shop All <ArrowRight size={10} />
                  </p>
                </div>
              </Link>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── New Arrivals ─────────────────────────────────────────────────────────────

function NewArrivals({ products }: { products?: ProductListItem[]; isLoading?: boolean }) {
  return (
    <section className="section-py">
      <div className="section-container">
        <FadeInSection className="flex items-end justify-between mb-12">
          <div>
            <p className="text-label text-gold text-xs mb-3">Just dropped</p>
            <h2 className="text-headline">New Arrivals</h2>
          </div>
          <Link
            to="/shop?new=true"
            className="hidden md:flex items-center gap-2 text-label text-xs text-gold hover:text-gold-light transition-colors"
          >
            View All <ArrowRight size={12} />
          </Link>
        </FadeInSection>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible md:pb-0 scrollbar-hide">
          {!products ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-64 md:w-auto snap-start">
                <ProductCardSkeleton />
              </div>
            ))
          ) : products.length === 0 ? (
            <p className="text-silver text-sm col-span-4">No new arrivals yet.</p>
          ) : (
            products.slice(0, 4).map((product, i) => (
              <div key={product.id} className="flex-shrink-0 w-64 md:w-auto snap-start">
                <ProductCard product={product} index={i} />
              </div>
            ))
          )}
        </div>

        <div className="mt-8 md:hidden">
          <Link to="/shop?new=true" className="btn-outline w-full justify-center">
            View All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Products ─────────────────────────────────────────────────────────

function FeaturedProducts({ products }: { products?: ProductListItem[] }) {
  if (!products?.length) return null;
  const [featured, ...rest] = products;
  const side = rest.slice(0, 3);

  return (
    <section className="section-py bg-carbon">
      <div className="section-container">
        <FadeInSection className="mb-12">
          <p className="text-label text-gold text-xs mb-3">Editor's picks</p>
          <h2 className="text-headline">Featured This Season</h2>
        </FadeInSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Large feature */}
          <FadeInSection>
            <ProductCard product={featured} />
          </FadeInSection>

          {/* Side stack */}
          <div className="grid grid-cols-2 gap-4">
            {side.map((product, i) => (
              <FadeInSection key={product.id} delay={0.1 + i * 0.05}>
                <ProductCard product={product} />
              </FadeInSection>
            ))}
          </div>
        </div>

        <FadeInSection className="mt-10 flex justify-center">
          <Link to="/shop?featured=true" className="btn-primary">
            Shop Featured <ArrowRight size={14} />
          </Link>
        </FadeInSection>
      </div>
    </section>
  );
}

// ─── Editorial Banner ─────────────────────────────────────────────────────────

function EditorialBanner() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(/brand/img4.png)`,
        }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative section-py section-container flex flex-col items-center text-center">
        <FadeInSection>
          <p className="text-label text-gold text-xs mb-4">Exclusive editorial</p>
          <h2 className="text-headline text-white mb-6 max-w-xl mx-auto">
            The Zardozi Heritag Styled for Celebrations
          </h2>
          <p className="text-ash/80 mb-10 max-w-xl mx-auto leading-relaxed text-sm md:text-base font-light">
            An exclusive editorial collection exploring heavy metal embroidery, <span className="whitespace-nowrap">hand-woven</span> luxury silk threads, and traditional heritage silhouettes.
          </p>
          <Link to="/lookbook" className="btn-primary">
            View Lookbook <ArrowRight size={14} />
          </Link>
        </FadeInSection>
      </div>
    </section>
  );
}

// ─── Social Proof Strip ───────────────────────────────────────────────────────

const SOCIAL_POSTS = [
  '/brand/img6.png',
  '/brand/img7.png',
  '/brand/img8.png',
  '/brand/img9.png',
  '/brand/img10.png',
  '/brand/img11.png',
];

function SocialStrip() {
  const doubledPosts = [...SOCIAL_POSTS, ...SOCIAL_POSTS];

  return (
    <section className="section-py bg-carbon/50 overflow-hidden">
      <div className="section-container">
        <FadeInSection className="text-center mb-10">
          <p className="text-label text-gold text-[10px] tracking-[0.2em] uppercase mb-3">✦ Follow Our Journey ✦</p>
          <a
            href="https://www.instagram.com/exotic_bytausifahmed/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-serif text-2xl md:text-3xl font-light text-cream hover:text-gold transition-colors duration-300 tracking-wide"
          >
            @exotic_bytausifahmed
          </a>
        </FadeInSection>
      </div>

      {/* Edge-to-Edge Infinite Marquee */}
      <div className="w-full overflow-hidden relative mt-6 select-none">
        <div className="flex gap-4 w-max marquee-track hover:[animation-play-state:paused]">
          {doubledPosts.map((url, i) => (
            <a
              key={i}
              href="https://www.instagram.com/exotic_bytausifahmed/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden block group w-44 sm:w-60 md:w-72 flex-shrink-0"
              style={{ aspectRatio: '1' }}
            >
              <img
                src={url}
                alt={`Instagram post ${(i % 6) + 1}`}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors duration-300 flex items-center justify-center">
                <span className="text-[10px] tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-sans uppercase">
                  View Post
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export function HomePage() {
  const { data: banners } = useQuery<HeroBanner[]>({
    queryKey: ['banners'],
    queryFn: () => api.get('/content/banners').then((r) => r.data),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const { data: newArrivals, isLoading: loadingNew } = useQuery<ProductListItem[]>({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () =>
      api.get('/products', { params: { new_arrival: true, limit: 8 } }).then((r) => r.data),
  });

  const { data: featured } = useQuery<ProductListItem[]>({
    queryKey: ['products', 'featured'],
    queryFn: () =>
      api.get('/products', { params: { featured: true, limit: 4 } }).then((r) => r.data),
  });

  return (
    <>
      <Helmet>
        <title>Exotic — Premium Fashion & Accessories</title>
        <meta
          name="description"
          content="Exotic — Premium fashion and accessories. Shop the latest curated drops, editorial lookbooks, and exclusive pieces."
        />
        <meta property="og:title" content="Exotic — Premium Fashion & Accessories" />
        <meta
          property="og:description"
          content="Shop the latest curated drops and editorial fashion at Exotic."
        />
      </Helmet>

      <HeroSection banners={banners} />
      <MarqueeStrip />
      <CategoryGrid categories={categories} />
      <NewArrivals products={newArrivals && newArrivals.length > 0 ? newArrivals : PLACEHOLDER_PRODUCTS} isLoading={loadingNew} />
      <FeaturedProducts products={featured && featured.length > 0 ? featured : PLACEHOLDER_PRODUCTS.slice(0, 4)} />
      <EditorialBanner />
      <SocialStrip />
    </>
  );
}
