import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { HeroBanner, Category } from '../../types';

// ─── Single Image Uploader Component ────────────────────────────────────────────

interface SingleImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  label: string;
}

function SingleImageUploader({ value, onChange, bucket, label }: SingleImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    
    setUploading(true);
    try {
      const { data: urlData } = await api.post('/content/upload-url', {
        filename: file.name,
        content_type: file.type,
        bucket,
      });

      await fetch(urlData.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      onChange(urlData.public_url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div>
      <label className="text-label text-[10px] text-mid block mb-1.5">{label}</label>
      
      {value ? (
        <div className="relative group border border-white/5 rounded overflow-hidden aspect-video max-h-40 bg-black/40">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => document.getElementById(`file-input-${bucket}-${label.replace(/\s+/g, '')}`)?.click()}
              className="px-3 py-1.5 bg-white/10 text-cream text-[10px] uppercase tracking-widest font-sans hover:bg-gold hover:text-black transition-all"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 bg-red-950/80 text-red-400 text-[10px] uppercase tracking-widest font-sans hover:bg-red-650 hover:text-white transition-all"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-input-${bucket}-${label.replace(/\s+/g, '')}`)?.click()}
          className={`border border-dashed rounded p-5 text-center cursor-pointer transition-all duration-350 bg-white/[0.01] ${
            dragging ? 'border-gold bg-gold/5 shadow-[0_0_15px_rgba(201,168,76,0.08)]' : 'border-white/10 hover:border-white/20'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
              <p className="text-[9px] uppercase tracking-widest font-sans text-mid mt-1">Uploading Media…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Upload size={16} className="text-mid" strokeWidth={1.5} />
              <p className="text-[9px] uppercase tracking-widest font-sans text-silver">Drag & Drop Image, or <span className="text-gold">Browse</span></p>
              <p className="text-[8px] text-mid/80 font-sans tracking-wide">WEBP, JPG, PNG up to 10MB</p>
            </div>
          )}
        </div>
      )}

      <input
        id={`file-input-${bucket}-${label.replace(/\s+/g, '')}`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}

// ─── Banner Management ─────────────────────────────────────────────────────────

function BannerSection() {
  const queryClient = useQueryClient();
  const [editBanner, setEditBanner] = useState<HeroBanner | null | 'new'>(null);

  const { data: banners, isLoading } = useQuery<HeroBanner[]>({
    queryKey: ['admin', 'banners'],
    queryFn: () => api.get('/content/banners').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/content/banners/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] }); toast.success('Banner deleted'); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-light text-cream">Hero Banners</h2>
        <button className="btn-primary text-xs flex items-center gap-1.5 !py-2 !px-3" onClick={() => setEditBanner('new')}>
          <Plus size={14} /> Add Banner
        </button>
      </div>

      {isLoading ? (
        <div className="skeleton h-24 rounded" />
      ) : !banners?.length ? (
        <p className="text-mid text-sm py-6 text-center">No banners yet.</p>
      ) : (
        <div className="space-y-2">
          {banners.map((banner) => (
            <div key={banner.id} className="flex items-center gap-4 bg-charcoal border border-graphite p-4 rounded">
              {banner.image_url && (
                <img src={banner.image_url} alt="" className="w-16 h-10 object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cream truncate">{banner.title}</p>
                {banner.subtitle && <p className="text-xs text-mid truncate">{banner.subtitle}</p>}
                <p className="text-xs text-gold mt-0.5">{banner.cta_text} → {banner.cta_link}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditBanner(banner)} className="btn-ghost !p-1.5 !min-h-0 !min-w-0 text-mid hover:text-cream" aria-label="Edit">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => { if (confirm('Delete banner?')) deleteMutation.mutate(banner.id); }} className="btn-ghost !p-1.5 !min-h-0 !min-w-0 text-mid hover:text-red-400" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editBanner !== null && (
          <BannerModal banner={editBanner === 'new' ? null : editBanner} onClose={() => setEditBanner(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function BannerModal({ banner, onClose }: { banner: HeroBanner | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEdit = !!banner;
  const [form, setForm] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    cta_text: banner?.cta_text || '',
    cta_link: banner?.cta_link || '',
    image_url: banner?.image_url || '',
    is_active: banner?.is_active ?? true,
    sort_order: banner?.sort_order || 0,
  });

  const mutation = useMutation({
    mutationFn: () => isEdit ? api.put(`/content/banners/${banner!.id}`, form) : api.post('/content/banners', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      toast.success(isEdit ? 'Banner updated' : 'Banner created');
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Error'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="relative w-full max-w-lg bg-charcoal border border-graphite rounded" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-graphite">
          <h3 className="font-serif text-lg font-light">{isEdit ? 'Edit Banner' : 'New Banner'}</h3>
          <button className="btn-ghost !p-1.5 !min-h-0 !min-w-0" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="px-6 py-6 space-y-4">
          {[
            { key: 'title', label: 'Title *', required: true },
            { key: 'subtitle', label: 'Subtitle' },
            { key: 'cta_text', label: 'CTA Text' },
            { key: 'cta_link', label: 'CTA Link' },
          ].map(({ key, label, required }) => (
            <div key={key}>
              <label className="text-label text-[10px] text-mid block mb-1.5">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="input-standard w-full text-sm"
                required={required}
              />
            </div>
          ))}
          
          <SingleImageUploader 
            value={form.image_url} 
            onChange={(url) => setForm({ ...form, image_url: url })} 
            bucket="product-images" 
            label="Banner Image" 
          />

          <div className="flex gap-3 pt-2 border-t border-graphite">
            <button type="button" className="btn-outline flex-1 justify-center text-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center text-sm disabled:opacity-50" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Category Management ───────────────────────────────────────────────────────

function CategorySection() {
  const queryClient = useQueryClient();
  const [editCat, setEditCat] = useState<Category | null | 'new'>(null);

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }); queryClient.invalidateQueries({ queryKey: ['categories'] }); toast.success('Category deleted'); },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-light text-cream">Categories</h2>
        <button className="btn-primary text-xs flex items-center gap-1.5 !py-2 !px-3" onClick={() => setEditCat('new')}>
          <Plus size={14} /> Add Category
        </button>
      </div>

      {isLoading ? <div className="skeleton h-20 rounded" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 bg-charcoal border border-graphite p-4 rounded">
              {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-12 h-12 object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cream">{cat.name}</p>
                <p className="text-xs text-mid">{cat.slug}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditCat(cat)} className="btn-ghost !p-1.5 !min-h-0 !min-w-0 text-mid hover:text-cream" aria-label="Edit"><Edit2 size={14} /></button>
                <button onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id); }} className="btn-ghost !p-1.5 !min-h-0 !min-w-0 text-mid hover:text-red-400" aria-label="Delete"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editCat !== null && (
          <CategoryModal category={editCat === 'new' ? null : editCat} onClose={() => setEditCat(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryModal({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEdit = !!category;
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    sort_order: category?.sort_order || 0,
    is_active: category?.is_active ?? true,
  });
  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const mutation = useMutation({
    mutationFn: () => isEdit ? api.put(`/categories/${category!.id}`, form) : api.post('/categories', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(isEdit ? 'Category updated' : 'Category created');
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Error'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="relative w-full max-w-md bg-charcoal border border-graphite rounded" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-graphite">
          <h3 className="font-serif text-lg font-light">{isEdit ? 'Edit Category' : 'New Category'}</h3>
          <button className="btn-ghost !p-1.5 !min-h-0 !min-w-0" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-label text-[10px] text-mid block mb-1.5">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })} className="input-standard w-full text-sm" required />
            </div>
            <div>
              <label className="text-label text-[10px] text-mid block mb-1.5">Slug *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-standard w-full text-sm font-mono" required />
            </div>
          </div>
          
          <SingleImageUploader 
            value={form.image_url} 
            onChange={(url) => setForm({ ...form, image_url: url })} 
            bucket="category-images" 
            label="Category Image" 
          />

          <div>
            <label className="text-label text-[10px] text-mid block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-standard w-full text-sm resize-none" rows={2} />
          </div>
          <div className="flex gap-3 pt-2 border-t border-graphite">
            <button type="button" className="btn-outline flex-1 justify-center text-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center text-sm disabled:opacity-50" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Content Admin Page ────────────────────────────────────────────────────────

export function AdminContentPage() {
  return (
    <>
      <Helmet><title>Content — Exotic Admin</title></Helmet>
      <div className="space-y-12">
        <div>
          <h1 className="font-serif text-2xl font-light text-cream">Content Management</h1>
          <p className="text-sm text-mid mt-0.5">Manage homepage hero banners and product categories</p>
        </div>
        <BannerSection />
        <div className="border-t border-graphite pt-8">
          <CategorySection />
        </div>
      </div>
    </>
  );
}
