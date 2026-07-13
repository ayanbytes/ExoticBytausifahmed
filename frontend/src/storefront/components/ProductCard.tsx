import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { HoverZoomImage } from '../../components/motion/HoverZoomImage';
import { useCartStore } from '../../store/cartStore';
import type { ProductListItem } from '../../types';

interface ProductCardProps {
  product: ProductListItem;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();

  const primaryImage = product.images.find((i) => i.is_primary) || product.images[0];
  const hoverImage = product.images.find((i) => i.is_hover);

  const discountPercent = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      quantity: 1,
      unit_price: product.price,
      image_url: primaryImage?.url,
    });
    openCart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative overflow-hidden bg-graphite">
          {primaryImage ? (
            <HoverZoomImage
              src={primaryImage.url}
              hoverSrc={hoverImage?.url}
              alt={primaryImage.alt_text || product.name}
              aspectRatio="3/4"
            />
          ) : (
            <div
              className="bg-graphite flex items-center justify-center"
              style={{ aspectRatio: '3/4' }}
            >
              <span className="text-label text-mid text-xs">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new_arrival && (
              <span className="text-label text-[8px] tracking-wider border border-gold/40 text-gold px-2 py-0.5 bg-black/60 backdrop-blur-md">
                NEW
              </span>
            )}
            {discountPercent && (
              <span className="text-label text-[8px] tracking-wider border border-white/20 text-cream px-2 py-0.5 bg-black/60 backdrop-blur-md">
                -{discountPercent}%
              </span>
            )}
            {product.total_stock === 0 && (
              <span className="text-label text-[8px] tracking-wider border border-red-500/30 text-red-400 px-2 py-0.5 bg-black/60 backdrop-blur-md">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Quick add button (floating glass style) */}
          {product.total_stock > 0 && (
            <motion.button
              variants={{
                initial: { y: 15, opacity: 0 },
                hover: { y: 0, opacity: 1 }
              }}
              initial="initial"
              animate={undefined} /* Inherits from parent's animate state via animate name matching */
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-4 left-4 right-4 bg-black/85 border border-gold/30 hover:border-gold hover:bg-gold hover:text-black text-cream text-[10px] text-label py-3 flex items-center justify-center gap-1.5 transition-all duration-300 backdrop-blur-md shadow-lg"
              onClick={handleQuickAdd}
              aria-label={`Quick add ${product.name} to cart`}
            >
              <ShoppingBag size={13} />
              Quick Add
            </motion.button>
          )}
        </div>

        {/* Info */}
        <div className="pt-3 pb-2 text-left">
          {product.category && (
            <p className="text-label text-[9px] text-mid tracking-widest">{product.category.name}</p>
          )}
          <h3 className="font-serif text-[15px] font-light text-cream group-hover:text-gold transition-colors duration-300 leading-snug mt-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[13px] font-sans font-semibold text-gold">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compare_at_price && (
              <span className="text-[11px] font-sans text-mid line-through">
                ₹{product.compare_at_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%' }} />
      <div className="pt-4 space-y-2">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
    </div>
  );
}
