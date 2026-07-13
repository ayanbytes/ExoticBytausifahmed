import { useState } from 'react';
import { motion } from 'framer-motion';

interface HoverZoomImageProps {
  src: string;
  hoverSrc?: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export function HoverZoomImage({ src, hoverSrc, alt, className = '', aspectRatio = '3/4' }: HoverZoomImageProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Primary image */}
      <motion.img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        animate={{
          scale: hovered && !hoverSrc ? 1.06 : 1,
          opacity: hoverSrc ? (hovered ? 0 : 1) : 1,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Hover image (crossfade) */}
      {hoverSrc && (
        <motion.img
          src={hoverSrc}
          alt={`${alt} — alternate view`}
          className="absolute inset-0 w-full h-full object-cover"
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1.03 : 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </div>
  );
}
