import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Upload,
  X, Star, Image as ImageIcon, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { Product, Category } from '../../types';

// ─── Image Uploader ────────────────────────────────────────────────────────────

interface UploadedImage {
  url: string;
  file_name: string;
  is_primary: boolean;
  is_hover: boolean;
  alt_text: string;
}

function ImageUploader({ images, onImagesChange }: {
  images: UploadedImage[];
  onImagesChange: (imgs: UploadedImage[]) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const { data: urlData } = await api.post('/content/upload-url', {
          filename: file.name,
          content_type: file.type,
          bucket: 'product-images',
        });

        await fetch(urlData.upload_url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        newImages.push({
          url: urlData.public_url,
          file_name: file.name,
          is_primary: images.length === 0 && newImages.length === 0,
          is_hover: false,
          alt_text: '',
        });
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    onImagesChange([...images, ...newImages]);
    setUploading(false);
  }, [images, onImagesChange]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAddManualUrl = () => {
    if (manualUrl.trim()) {
      onImagesChange([
        ...images,
        {
          url: manualUrl.trim(),
          file_name: manualUrl.split('/').pop() || 'image.png',
          is_primary: images.length === 0,
          is_hover: false,
          alt_text: '',
        },
      ]);
      setManualUrl('');
      toast.success('Image URL added!');
    }
  };

  const setPrimary = (idx: number) => {
    onImagesChange(images.map((img, i) => ({ ...img, is_primary: i === idx, is_hover: img.is_hover && i !== idx })));
  };

  const setHover = (idx: number) => {
    onImagesChange(images.map((img, i) => ({ ...img, is_hover: i === idx })));
  };

  const removeImage = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    if (images[idx].is_primary && next.length > 0) next[0].is_primary = true;
    onImagesChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border border-dashed rounded p-6 text-center cursor-pointer transition-all duration-350 bg-white/[0.01] ${
          dragging ? 'border-gold bg-gold/5 shadow-[0_0_15px_rgba(201,168,76,0.08)]' : 'border-white/10 hover:border-white/20'
        }`}
        onClick={() => document.getElementById('image-file-input')?.click()}
      >
        <input
          id="image-file-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-widest font-sans text-mid mt-1">Uploading Media…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={20} className="text-mid" strokeWidth={1.5} />
            <p className="text-[10px] uppercase tracking-widest font-sans text-silver">Drag & Drop Images, or <span className="text-gold">Browse</span></p>
            <p className="text-[9px] text-mid/80 font-sans tracking-wide">WEBP, JPG, PNG formats up to 10MB</p>
          </div>
        )}
      </div>

      {/* Manual URL input fallback */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Or paste direct image URL (e.g., /brand/img1.png or Unsplash URL)"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          className="input-standard flex-1 text-xs py-2.5 px-3 rounded-[14px]"
        />
        <button
          type="button"
          onClick={handleAddManualUrl}
          className="btn-primary !min-height-0 !py-2 px-4 text-[10px] tracking-wider rounded-[14px]"
        >
          Add URL
        </button>
      </div>

      {/* Image previews */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative group border border-white/5 rounded overflow-hidden aspect-[3/4] bg-black/40">
            <img src={img.url} alt={img.alt_text || `Image ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            
            {/* Badges */}
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
              {img.is_primary && (
                <span className="text-[7px] tracking-widest bg-gold text-black px-1.5 py-0.5 font-bold uppercase rounded-sm">PRIMARY</span>
              )}
              {img.is_hover && (
                <span className="text-[7px] tracking-widest bg-blue-500 text-white px-1.5 py-0.5 font-bold uppercase rounded-sm">HOVER</span>
              )}
            </div>

            {/* Hover Actions overlay */}
            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPrimary(i)}
                title="Set as primary"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${img.is_primary ? 'bg-gold text-black' : 'bg-white/10 text-cream hover:bg-gold hover:text-black'}`}
              >
                <Star size={11} fill={img.is_primary ? 'currentColor' : 'none'} />
              </button>
              <button
                type="button"
                onClick={() => setHover(i)}
                title="Set as hover image"
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${img.is_hover ? 'bg-blue-500 text-white' : 'bg-white/10 text-cream hover:bg-blue-500 hover:text-white'}`}
              >
                <ImageIcon size={11} />
              </button>
              <button
                type="button"
                onClick={() => removeImage(i)}
                title="Remove"
                className="w-7 h-7 bg-red-955/80 text-red-400 rounded-full flex items-center justify-center hover:bg-red-650 hover:text-white transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Product Form Modal (Slide-Over Panel) ──────────────────────────────────────

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_at_price: string;
  category_id: string;
  tags: string;
  is_published: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  size_guide: string;
  shipping_info: string;
  return_policy: string;
  total_stock: string;
  low_stock_threshold: string;
}

function ProductModal({ product, categories, onClose }: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!product;

  const [form, setForm] = useState<ProductFormData>({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compare_at_price: product?.compare_at_price?.toString() || '',
    category_id: product?.category_id || '',
    tags: product?.tags?.join(', ') || '',
    is_published: product?.is_published || false,
    is_featured: product?.is_featured || false,
    is_new_arrival: product?.is_new_arrival || false,
    size_guide: product?.size_guide || '',
    shipping_info: product?.shipping_info || '',
    return_policy: product?.return_policy || '',
    total_stock: product?.total_stock?.toString() || '10',
    low_stock_threshold: product?.low_stock_threshold?.toString() || '2',
  });

  const [images, setImages] = useState<UploadedImage[]>(
    product?.images.map((img) => ({
      url: img.url,
      file_name: img.url.split('/').pop() || '',
      is_primary: img.is_primary,
      is_hover: img.is_hover,
      alt_text: img.alt_text || '',
    })) || []
  );

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        price: parseFloat(data.price),
        compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : undefined,
        category_id: data.category_id || undefined,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        is_published: data.is_published,
        is_featured: data.is_featured,
        is_new_arrival: data.is_new_arrival,
        size_guide: data.size_guide || undefined,
        shipping_info: data.shipping_info || undefined,
        return_policy: data.return_policy || undefined,
        total_stock: parseInt(data.total_stock) || 0,
        low_stock_threshold: parseInt(data.low_stock_threshold) || 0,
      };

      let saved: Product;
      if (isEdit) {
        const { data: res } = await api.put(`/products/${product!.id}`, payload);
        saved = res;
      } else {
        const { data: res } = await api.post('/products', payload);
        saved = res;
      }

      for (const img of images) {
        if (!product?.images.find((i) => i.url === img.url)) {
          await api.post(
            `/products/${saved.id}/images`,
            null,
            { params: { url: img.url, alt_text: img.alt_text, is_primary: img.is_primary, is_hover: img.is_hover } }
          );
        }
      }

      return saved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Something went wrong');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-2xl h-full bg-[#0D0D0D]/95 backdrop-blur-xl border-l border-white/5 flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="sticky top-0 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <div className="space-y-0.5">
            <h2 className="font-serif text-lg font-light text-cream">{isEdit ? 'Edit Curated Piece' : 'Add New Piece'}</h2>
            <p className="text-[9px] uppercase tracking-widest font-sans text-gold">Collection Inventory Editor</p>
          </div>
          <button type="button" className="btn-ghost !p-1.5 !min-h-0 !min-w-0 border border-white/10 hover:border-white/30 rounded-sm" onClick={onClose} aria-label="Close panel"><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
                className="input-standard w-full text-sm font-medium"
                required
              />
            </div>
            <div>
              <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">URL Slug *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input-standard w-full font-mono text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Editorial Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-standard w-full resize-none text-sm leading-relaxed"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-standard w-full text-sm font-semibold text-gold"
                required
              />
            </div>
            <div>
              <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Compare At (₹)</label>
              <input
                type="number"
                step="0.01"
                value={form.compare_at_price}
                onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                className="input-standard w-full text-sm font-semibold"
              />
            </div>
            <div>
              <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="input-standard w-full py-2 text-sm"
              >
                <option value="" className="bg-[#0D0D0D]">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0D0D0D]">{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Tags (comma-separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="input-standard w-full text-sm"
              placeholder="minimalist, luxury, summer-collection"
            />
          </div>

          {/* Stock Quantities */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Stock Quantity</label>
              <div className="flex items-center border border-white/10 bg-black/45 rounded-lg overflow-hidden h-[44px] w-36">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, total_stock: Math.max(0, parseInt(f.total_stock || '0') - 1).toString() }))}
                  className="w-12 h-full flex items-center justify-center hover:text-gold hover:bg-white/5 transition-colors font-bold text-lg cursor-pointer border-r border-white/10 text-cream"
                >
                  -
                </button>
                <input
                  type="number"
                  value={form.total_stock}
                  onChange={(e) => setForm({ ...form, total_stock: e.target.value })}
                  className="w-12 text-center bg-transparent text-sm font-bold text-cream focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, total_stock: (parseInt(f.total_stock || '0') + 1).toString() }))}
                  className="w-12 h-full flex items-center justify-center hover:text-gold hover:bg-white/5 transition-colors font-bold text-lg cursor-pointer border-l border-white/10 text-cream"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Low Stock Alert Limit</label>
              <div className="flex items-center border border-white/10 bg-black/45 rounded-lg overflow-hidden h-[44px] w-36">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, low_stock_threshold: Math.max(0, parseInt(f.low_stock_threshold || '0') - 1).toString() }))}
                  className="w-12 h-full flex items-center justify-center hover:text-gold hover:bg-white/5 transition-colors font-bold text-lg cursor-pointer border-r border-white/10 text-cream"
                >
                  -
                </button>
                <input
                  type="number"
                  value={form.low_stock_threshold}
                  onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                  className="w-12 text-center bg-transparent text-sm font-bold text-cream focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, low_stock_threshold: (parseInt(f.low_stock_threshold || '0') + 1).toString() }))}
                  className="w-12 h-full flex items-center justify-center hover:text-gold hover:bg-white/5 transition-colors font-bold text-lg cursor-pointer border-l border-white/10 text-cream"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 py-3 border-y border-white/5 bg-white/[0.01] px-4 rounded-[14px]">
            {[
              { key: 'is_published' as const, label: 'Published' },
              { key: 'is_featured' as const, label: 'Featured Piece' },
              { key: 'is_new_arrival' as const, label: 'New Arrival' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, [key]: !form[key] })}
                  className={`w-9 h-5 rounded-full relative transition-colors duration-250 ${form[key] ? 'bg-gold' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-250 ${form[key] ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs uppercase tracking-wider text-silver font-sans font-semibold">{label}</span>
              </label>
            ))}
          </div>

          {/* Images */}
          <div>
            <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Media Gallery</label>
            <ImageUploader images={images} onImagesChange={setImages} />
          </div>

          {/* Details sections */}
          <details className="border border-white/5 bg-black/20 rounded-[20px] p-4 group transition-colors duration-300">
            <summary className="text-xs text-ash uppercase tracking-wider cursor-pointer select-none font-semibold flex items-center justify-between">
              <span>Size Guide, Shipping & Returns</span>
              <ChevronRight size={12} className="transform group-open:rotate-90 transition-transform duration-200" />
            </summary>
            <div className="space-y-4 mt-5">
              <div>
                <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Size Guide Description</label>
                <textarea value={form.size_guide} onChange={(e) => setForm({ ...form, size_guide: e.target.value })} className="input-standard w-full text-sm resize-none" rows={3} />
              </div>
              <div>
                <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Shipping Logistics</label>
                <textarea value={form.shipping_info} onChange={(e) => setForm({ ...form, shipping_info: e.target.value })} className="input-standard w-full text-sm resize-none" rows={2} />
              </div>
              <div>
                <label className="text-xs text-ash uppercase tracking-wider block mb-2 font-semibold">Return Policy Details</label>
                <textarea value={form.return_policy} onChange={(e) => setForm({ ...form, return_policy: e.target.value })} className="input-standard w-full text-sm resize-none" rows={2} />
              </div>
            </div>
          </details>
        </form>

        {/* Action Panel Footer */}
        <div className="sticky bottom-0 bg-[#0D0D0D]/90 backdrop-blur-md px-6 py-5 border-t border-white/5 flex gap-4">
          <button type="button" className="btn-outline flex-1 justify-center text-xs tracking-widest font-sans uppercase" onClick={onClose}>Cancel</button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn-primary flex-1 justify-center text-xs tracking-widest font-sans uppercase disabled:opacity-50"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving changes…' : isEdit ? 'Update Piece' : 'Create Piece'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Products Admin Page ────────────────────────────────────────────────────────

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalProduct, setModalProduct] = useState<Product | null | 'new'>('empty' as any);
  const [showModal, setShowModal] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['admin', 'products'],
    queryFn: () => api.get('/products', { params: { published_only: false, limit: 100 } }).then((r) => r.data),
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product deleted');
    },
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.put(`/products/${id}`, { is_published: published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  });

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Inventory — Exotic Admin</title></Helmet>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl font-light text-cream tracking-wide">Curated Inventory</h1>
            <p className="text-xs text-mid uppercase tracking-widest font-sans mt-1">
              {filtered?.length || 0} Pieces in collection
            </p>
          </div>
          <button
            className="btn-primary text-xs uppercase tracking-widest font-sans flex items-center gap-2 group"
            onClick={() => { setModalProduct(null); setShowModal(true); }}
          >
            <Plus size={14} className="transition-transform group-hover:rotate-90 duration-200" /> Add Product
          </button>
        </div>

        {/* Search / Filters */}
        <div className="flex items-center gap-4">
          <div className="relative w-full max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mid" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or slug…"
              className="input-standard w-full pl-10"
            />
          </div>
        </div>

        {/* Table Listing */}
        <div className="backdrop-blur-md bg-charcoal/20 border border-white/5 rounded shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-black/25">
                  {['Product Piece', 'Curated Price', 'Inventory', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-[9px] uppercase tracking-widest font-sans font-medium text-mid">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-5"><div className="skeleton h-4 w-24 rounded-sm" /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center border-none">
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="w-12 h-12 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mx-auto text-mid/60">
                          <Search size={18} />
                        </div>
                        <h3 className="font-serif text-lg text-cream">No curated items found</h3>
                        <p className="text-xs text-mid leading-relaxed">No products match your search criteria. Try modifying your search or add a new piece to the collection.</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered?.map((product) => {
                  const primaryImg = product.images.find((i) => i.is_primary) || product.images[0];
                  const isLowStock = product.total_stock <= product.low_stock_threshold;
                  return (
                    <tr key={product.id} className="hover:bg-white/[0.01] transition-colors cursor-pointer group">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-13 bg-white/[0.02] border border-white/5 flex-shrink-0 overflow-hidden rounded-sm relative shadow-md">
                            {primaryImg ? (
                              <img src={primaryImg.url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : <ImageIcon size={15} className="text-mid m-auto mt-4" />}
                          </div>
                          <div>
                            <p className="text-cream text-xs font-semibold font-sans">{product.name}</p>
                            <p className="text-[9px] uppercase tracking-wider text-mid font-medium font-sans mt-0.5">{product.category?.name || 'Unassigned'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="text-cream text-xs font-medium font-mono">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.compare_at_price && (
                          <span className="ml-2 text-mid text-[11px] line-through font-mono">₹{product.compare_at_price.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] border font-medium ${isLowStock ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                          <span className={`w-1 h-1 rounded-full bg-current ${isLowStock ? 'animate-pulse' : ''}`} />
                          <span>{product.total_stock} Units</span>
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePublish.mutate({ id: product.id, published: !product.is_published });
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-sans border font-semibold transition-all duration-200 ${
                            product.is_published
                              ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                              : 'bg-white/5 text-mid border-white/10 hover:bg-white/10 hover:text-cream'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full bg-current ${product.is_published ? 'animate-pulse' : ''}`} />
                          <span>{product.is_published ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => { setModalProduct(product as unknown as Product); setShowModal(true); }}
                            className="btn-ghost !p-2 !min-h-0 !min-w-0 border border-white/5 hover:border-gold/50 rounded text-mid hover:text-gold"
                            title="Edit"
                            aria-label="Edit piece"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${product.name}" from curation?`)) deleteMutation.mutate(product.id);
                            }}
                            className="btn-ghost !p-2 !min-h-0 !min-w-0 border border-white/5 hover:border-red-500/50 rounded text-mid hover:text-red-400"
                            title="Delete"
                            aria-label="Delete piece"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over panel */}
      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={modalProduct as Product | null}
            categories={categories || []}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
