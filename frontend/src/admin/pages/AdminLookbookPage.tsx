import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Upload, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { LookbookCollection } from '../../types';

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
      <label className="text-[10px] text-mid uppercase tracking-widest block mb-2 font-medium">{label}</label>
      
      {value ? (
        <div className="relative group border border-white/5 rounded overflow-hidden aspect-video max-h-48 bg-black/40">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => document.getElementById(`file-input-${bucket}`)?.click()}
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
          onClick={() => document.getElementById(`file-input-${bucket}`)?.click()}
          className={`border border-dashed rounded p-6 text-center cursor-pointer transition-all duration-350 bg-white/[0.01] ${
            dragging ? 'border-gold bg-gold/5 shadow-[0_0_15px_rgba(201,168,76,0.08)]' : 'border-white/10 hover:border-white/20'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
              <p className="text-[9px] uppercase tracking-widest font-sans text-mid mt-1">Uploading Media…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={18} className="text-mid" strokeWidth={1.5} />
              <p className="text-[9px] uppercase tracking-widest font-sans text-silver">Drag & Drop Image, or <span className="text-gold">Browse</span></p>
              <p className="text-[8px] text-mid/80 font-sans tracking-wide">WEBP, JPG, PNG up to 10MB</p>
            </div>
          )}
        </div>
      )}

      <input
        id={`file-input-${bucket}`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}

// ─── Lookbook Admin Page ────────────────────────────────────────────────────────

export function AdminLookbookPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCollection, setEditCollection] = useState<LookbookCollection | null>(null);

  const { data: collections, isLoading } = useQuery<LookbookCollection[]>({
    queryKey: ['admin', 'lookbook'],
    queryFn: () => api.get('/content/lookbook', { params: { published_only: false } }).then((r) => r.data),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.put(`/content/lookbook/${id}`, { is_published: published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'lookbook'] }),
  });

  const deleteCollection = useMutation({
    mutationFn: (id: string) => api.delete(`/content/lookbook/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lookbook'] });
      toast.success('Collection deleted');
    },
  });

  return (
    <>
      <Helmet><title>Lookbook — Exotic Admin</title></Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-light text-cream">Lookbook</h1>
            <p className="text-sm text-mid mt-0.5">Manage editorial collections and product hotspots</p>
          </div>
          <button
            className="btn-primary text-sm flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> New Collection
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-48 rounded" />)}
          </div>
        ) : !collections?.length ? (
          <div className="border border-dashed border-graphite rounded p-16 text-center">
            <BookOpen size={32} className="text-mid mx-auto mb-3" strokeWidth={1} />
            <p className="text-silver mb-1">No lookbook collections yet</p>
            <p className="text-xs text-mid mb-6">Create your first editorial collection</p>
            <button className="btn-primary text-sm" onClick={() => setShowCreateModal(true)}>
              Create Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <motion.div
                key={collection.id}
                layout
                className="bg-charcoal border border-graphite rounded overflow-hidden group"
              >
                {/* Cover image */}
                <div className="relative aspect-video bg-graphite overflow-hidden">
                  {collection.cover_image_url ? (
                    <img
                      src={collection.cover_image_url}
                      alt={collection.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen size={24} className="text-muted" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`text-[9px] px-2 py-1 font-semibold ${
                      collection.is_published ? 'bg-green-900/80 text-green-300' : 'bg-graphite text-mid'
                    }`}>
                      {collection.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-serif text-lg font-light text-cream">{collection.title}</h3>
                  {collection.season && <p className="text-xs text-gold mt-0.5">{collection.season}</p>}
                  {collection.description && (
                    <p className="text-xs text-mid mt-1 line-clamp-2">{collection.description}</p>
                  )}
                  <p className="text-xs text-mid mt-2">{collection.images.length} images</p>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  <button
                    onClick={() => togglePublish.mutate({ id: collection.id, published: !collection.is_published })}
                    className="btn-outline !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                  >
                    {collection.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                    {collection.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => setEditCollection(collection)}
                    className="btn-ghost !p-2 !min-h-0 !min-w-0 text-mid hover:text-cream"
                    aria-label="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete "${collection.title}"?`)) deleteCollection.mutate(collection.id); }}
                    className="btn-ghost !p-2 !min-h-0 !min-w-0 text-mid hover:text-red-400 ml-auto"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editCollection) && (
          <CollectionModal
            collection={editCollection}
            onClose={() => { setShowCreateModal(false); setEditCollection(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function CollectionModal({ collection, onClose }: { collection: LookbookCollection | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isEdit = !!collection;

  const [form, setForm] = useState({
    title: collection?.title || '',
    slug: collection?.slug || '',
    description: collection?.description || '',
    season: collection?.season || '',
    cover_image_url: collection?.cover_image_url || '',
    is_published: collection?.is_published || false,
    sort_order: collection?.sort_order || 0,
  });

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? api.put(`/content/lookbook/${collection!.id}`, form)
        : api.post('/content/lookbook', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'lookbook'] });
      toast.success(isEdit ? 'Collection updated' : 'Collection created');
      onClose();
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Error saving collection'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-lg bg-charcoal border border-graphite rounded"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-graphite">
          <h2 className="font-serif text-lg font-light">{isEdit ? 'Edit Collection' : 'New Collection'}</h2>
          <button className="btn-ghost !p-1.5 !min-h-0 !min-w-0" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-label text-[10px] text-mid block mb-1.5">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: autoSlug(e.target.value) })} className="input-standard w-full text-sm" required />
            </div>
            <div>
              <label className="text-label text-[10px] text-mid block mb-1.5">Slug *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-standard w-full text-sm font-mono" required />
            </div>
          </div>
          <div>
            <label className="text-label text-[10px] text-mid block mb-1.5">Season / Label</label>
            <input type="text" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="input-standard w-full text-sm" placeholder="Monsoon 2026" />
          </div>
          <div>
            <label className="text-label text-[10px] text-mid block mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-standard w-full text-sm resize-none" rows={3} />
          </div>
          
          <SingleImageUploader 
            value={form.cover_image_url} 
            onChange={(url) => setForm({ ...form, cover_image_url: url })} 
            bucket="lookbook-images" 
            label="Cover Image" 
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setForm({ ...form, is_published: !form.is_published })} className={`w-10 h-5 rounded-full relative transition-colors ${form.is_published ? 'bg-gold' : 'bg-graphite'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-silver">Published</span>
          </label>

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
