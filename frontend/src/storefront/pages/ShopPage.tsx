import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../lib/api';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { FadeInSection } from '../../components/motion/FadeInSection';
import type { ProductListItem, Category } from '../../types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Popularity' },
];

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOR_OPTIONS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FAFAFA' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Green', hex: '#2D5016' },
  { name: 'Red', hex: '#8B1A1A' },
];

interface FilterState {
  sizes: string[];
  colors: string[];
  minPrice: string;
  maxPrice: string;
}

function FilterSection({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-graphite pb-4 mb-4">
      <button
        className="flex items-center justify-between w-full py-2 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-label text-xs text-ash">{title}</span>
        {open ? <ChevronUp size={14} className="text-mid" /> : <ChevronDown size={14} className="text-mid" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sizes: [],
    colors: [],
    minPrice: '',
    maxPrice: '',
  });

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const newArrival = searchParams.get('new') === 'true';
  const featured = searchParams.get('featured') === 'true';

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const categoriesList = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories;
    }
    return [
      { id: 'cat1', name: 'Bridal Wear', slug: 'bridal-wear', description: '' },
      { id: 'cat2', name: 'Luxury Ethnic', slug: 'luxury-ethnic', description: '' },
      { id: 'cat3', name: 'Jewellery', slug: 'jewellery', description: '' }
    ];
  }, [categories]);

  const { data: products, isLoading } = useQuery<ProductListItem[]>({
    queryKey: ['products', { category, sort, newArrival, featured, filters }],
    queryFn: () =>
      api
        .get('/products', {
          params: {
            category: category || undefined,
            sort,
            new_arrival: newArrival || undefined,
            featured: featured || undefined,
            min_price: filters.minPrice || undefined,
            max_price: filters.maxPrice || undefined,
          },
        })
        .then((r) => r.data),
  });

  const displayedProducts = products || [];

  const pageTitle = useMemo(() => {
    if (category) {
      const cat = categoriesList.find((c) => c.slug === category);
      return cat?.name || 'Shop';
    }
    if (newArrival) return 'New Arrivals';
    if (featured) return 'Featured';
    return 'All Products';
  }, [category, categoriesList, newArrival, featured]);

  const toggleSize = (size: string) => {
    setFilters((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const toggleColor = (color: string) => {
    setFilters((f) => ({
      ...f,
      colors: f.colors.includes(color) ? f.colors.filter((c) => c !== color) : [...f.colors, color],
    }));
  };

  const clearFilters = () => setFilters({ sizes: [], colors: [], minPrice: '', maxPrice: '' });
  const hasFilters = filters.sizes.length > 0 || filters.colors.length > 0 || filters.minPrice || filters.maxPrice;

  const FiltersPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <FilterSection title="Category" defaultOpen={true}>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }}
            className="flex items-center gap-2.5 text-xs text-left transition-colors cursor-pointer group text-silver hover:text-cream"
          >
            <span className={`w-3.5 h-3.5 border flex items-center justify-center transition-all ${!category ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-muted group-hover:border-mid'}`}>
              {!category && <span className="w-1.5 h-1.5 bg-black" />}
            </span>
            <span className={!category ? 'text-[#C9A84C] font-semibold' : 'text-silver hover:text-white'}>All Products</span>
          </button>
          {categoriesList.map((cat) => {
            const isSelected = category === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), category: cat.slug })}
                className="flex items-center gap-2.5 text-xs text-left transition-colors cursor-pointer group text-silver hover:text-cream"
              >
                <span className={`w-3.5 h-3.5 border flex items-center justify-center transition-all ${isSelected ? 'border-[#C9A84C] bg-[#C9A84C]' : 'border-muted group-hover:border-mid'}`}>
                  {isSelected && <span className="w-1.5 h-1.5 bg-black" />}
                </span>
                <span className={isSelected ? 'text-[#C9A84C] font-semibold' : 'text-silver hover:text-white'}>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Size" defaultOpen={true}>
        <div className="grid grid-cols-3 gap-2">
          {SIZE_OPTIONS.map((size) => {
            const isSelected = filters.sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`py-2 text-[11px] font-sans font-semibold text-center border transition-all duration-200 cursor-pointer ${isSelected
                    ? 'border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/5'
                    : 'border-[#2A2A2A] text-silver hover:border-[#6B6B6B]'
                  }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price Range" defaultOpen={true}>
        <div className="space-y-4">
          <div className="relative pt-2">
            <input
              type="range"
              min="1000"
              max="300000"
              step="5000"
              value={filters.maxPrice || '300000'}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
              className="w-full h-1 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#C9A84C]"
              style={{
                background: `linear-gradient(to right, #C9A84C 0%, #C9A84C ${((Number(filters.maxPrice || 300000) - 1000) / 299000) * 100}%, #2A2A2A ${((Number(filters.maxPrice || 300000) - 1000) / 299000) * 100}%, #2A2A2A 100%)`
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-sans text-muted">
            <span>₹1,000</span>
            <span className="text-[#C9A84C] font-semibold">Max: ₹{Number(filters.maxPrice || 300000).toLocaleString('en-IN')}</span>
            <span>₹3,00,000</span>
          </div>
        </div>
      </FilterSection>

      <button
        onClick={clearFilters}
        className="w-full py-3 bg-[#C9A84C] text-black text-[11px] font-bold tracking-wider text-center uppercase mt-6 transition-colors duration-200 hover:bg-[#E0C47A] cursor-pointer"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{pageTitle} — Exotic</title>
        <meta name="description" content={`Shop ${pageTitle} at Exotic — Premium fashion and accessories.`} />
      </Helmet>

      <div className="bg-black min-h-screen">
        {/* Navbar Spacer */}
        <div className="h-16 md:h-20" />

        {/* Page Header */}
        <div className="section-container py-10 md:py-14 border-b border-[#1A1A1A]">
          <FadeInSection>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-3">The Collection</h1>
            <p className="text-sm text-mid max-w-xl font-sans font-light leading-relaxed">
              Curated excellence for the avant-garde. Explore our seasonal drop of high-performance luxury silhouettes.
            </p>
          </FadeInSection>
        </div>

        <div className="section-container py-8">
          <div className="flex gap-8">
            {/* Sidebar Filter — Desktop */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <FiltersPanel />
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Sort + Mobile Filter Controls */}
              <div className="flex items-center justify-between mb-8 gap-4">
                <button
                  className="lg:hidden btn-outline !py-2 !px-4 flex items-center gap-2"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal size={14} />
                  Filters {hasFilters && `(${filters.sizes.length})`}
                </button>

                <div className="hidden lg:block">
                  <span className="text-[11px] font-sans font-semibold tracking-wider text-silver uppercase">
                    {displayedProducts.length} Products Found
                  </span>
                </div>

                <div className="ml-auto flex items-center gap-2.5">
                  <span className="text-[11px] font-sans text-mid">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), sort: e.target.value })}
                      className="appearance-none bg-transparent border-b border-[#2A2A2A] text-[11px] font-sans font-semibold text-white pr-6 pl-1 py-1 outline-none cursor-pointer focus:border-[#C9A84C] transition-colors"
                      aria-label="Sort products"
                    >
                      <option value="newest" className="bg-black text-white">Featured</option>
                      <option value="price_asc" className="bg-black text-white">Price: Low to High</option>
                      <option value="price_desc" className="bg-black text-white">Price: High to Low</option>
                      <option value="popularity" className="bg-black text-white">Popularity</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-silver pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10">
                {isLoading ? (
                  Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)
                ) : !displayedProducts || displayedProducts.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <p className="font-serif text-2xl text-silver mb-2">No products found</p>
                    <p className="text-mid text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  displayedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
                )}
              </div>

              {/* Pagination */}
              {!isLoading && displayedProducts.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-16 pt-12 border-t border-[#1A1A1A]">
                  <button className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] text-silver hover:text-white hover:border-mid transition-all cursor-pointer">
                    &lt;
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center text-xs font-sans text-[#C9A84C] border-b-2 border-[#C9A84C] font-semibold cursor-pointer">
                    01
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center text-xs font-sans text-silver hover:text-white transition-all cursor-pointer">
                    02
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center text-xs font-sans text-silver hover:text-white transition-all cursor-pointer">
                    03
                  </button>
                  <span className="text-xs text-muted px-1">...</span>
                  <button className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] text-silver hover:text-white hover:border-mid transition-all cursor-pointer">
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
            />
             <motion.div
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#080808] flex flex-col border-l border-[#1A1A1A] shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#1A1A1A]">
                <h2 className="font-serif text-xl font-light text-white tracking-wide">Filters</h2>
                <button className="btn-ghost p-1 cursor-pointer" onClick={() => setMobileFiltersOpen(false)}>
                  <X size={22} className="text-white" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                {/* Sort By section for mobile */}
                <div className="border-b border-[#1A1A1A] pb-6">
                  <span className="text-label text-[10px] text-ash block mb-3">Sort By</span>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSearchParams({ ...Object.fromEntries(searchParams), sort: e.target.value })}
                      className="appearance-none w-full bg-[#111111] border border-[#2A2A2A] text-[11px] font-sans text-white px-3 py-2.5 outline-none cursor-pointer focus:border-[#C9A84C] transition-colors"
                      aria-label="Sort products"
                    >
                      <option value="newest" className="bg-black text-white">Featured</option>
                      <option value="price_asc" className="bg-black text-white">Price: Low to High</option>
                      <option value="price_desc" className="bg-black text-white">Price: High to Low</option>
                      <option value="popularity" className="bg-black text-white">Popularity</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-silver pointer-events-none" />
                  </div>
                </div>

                <FiltersPanel />
              </div>
              <div className="px-8 py-6 border-t border-[#1A1A1A]">
                <button 
                  className="w-full py-3.5 bg-[#C9A84C] text-black text-[11px] font-bold tracking-wider text-center uppercase transition-colors duration-200 hover:bg-[#E0C47A] cursor-pointer"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
