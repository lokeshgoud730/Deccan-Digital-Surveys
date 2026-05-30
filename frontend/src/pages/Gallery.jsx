import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { Plus, Trash2, Eye, X, ZoomIn, ZoomOut, Upload, Loader } from 'lucide-react';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Admin upload states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Land');
  const [newImgUrl, setNewImgUrl] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    // Log visitor hit
    api.post('/log-visitor/', { page: 'Gallery' }).catch(() => {});

    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    setIsAdmin(!!token);

    fetchGallery();
  }, []);

  const fetchGallery = () => {
    setLoading(true);
    api.get('/gallery/')
      .then((res) => {
        setImages(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching gallery:', err);
        setLoading(false);
      });
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadLoading(true);

    // Validate URL or provide fallback
    const imgPath = newImgUrl || '/images/hero_bg.png';

    try {
      await api.post('/gallery/', {
        title: newTitle,
        description: newDesc,
        category: newCategory,
        image_url: imgPath
      });
      
      // Reset form and reload
      setNewTitle('');
      setNewDesc('');
      setNewImgUrl('');
      setShowAddForm(false);
      fetchGallery();
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to add image. Ensure you are authorized.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteImage = async (id, e) => {
    e.stopPropagation(); // Prevent opening lightbox
    if (!window.confirm("Are you sure you want to delete this gallery photo?")) return;

    try {
      await api.delete(`/gallery/${id}/`);
      setImages(images.filter(img => img.id !== id));
    } catch (err) {
      alert('Error deleting image: ' + (err.response?.data?.detail || err.message));
    }
  };

  const categories = ['All', 'Land', 'Layout', 'Road & Rail', 'Drone Mapping'];

  const filteredImages = activeFilter === 'All'
    ? images
    : images.filter(img => img.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      
      {/* Header section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50 font-sans"
        >
          Project Gallery
        </motion.h1>
        <div className="h-1.5 w-24 bg-survey-gold mx-auto rounded-full" />
        <p className="text-slate-500 dark:text-zinc-400">
          Visual showcase of our land boundaries, layout designs, and drone mapping operations.
        </p>
      </section>

      {/* Admin Panel Header triggers */}
      {isAdmin && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition"
          >
            <Plus size={18} />
            <span>{showAddForm ? 'Close Image Editor' : 'Upload New Photo'}</span>
          </button>
        </div>
      )}

      {/* Upload image form */}
      <AnimatePresence>
        {isAdmin && showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-lg mx-auto glass border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-lg overflow-hidden text-left"
          >
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-zinc-50 mb-4 flex items-center space-x-2">
              <Upload size={18} className="text-survey-gold" />
              <span>Add Image Details</span>
            </h3>
            {uploadError && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg mb-3">
                {uploadError}
              </p>
            )}
            <form onSubmit={handleAddImage} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Image Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Boundary demarcation at Jangaon"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief context details..."
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Land">Land</option>
                    <option value="Layout">Layout</option>
                    <option value="Road & Rail">Road & Rail</option>
                    <option value="Drone Mapping">Drone Mapping</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Image URL Path</label>
                  <input
                    type="text"
                    value={newImgUrl}
                    onChange={(e) => setNewImgUrl(e.target.value)}
                    placeholder="/images/hero_bg.png"
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-sm flex items-center justify-center space-x-1.5"
              >
                {uploadLoading ? <Loader className="animate-spin" size={16} /> : <span>Publish Image</span>}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter list */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all ${
              activeFilter === cat
                ? 'bg-primary border-primary text-white dark:bg-survey-gold dark:border-survey-gold dark:text-slate-950 shadow-md scale-105'
                : 'border-slate-300 text-slate-600 dark:border-zinc-800 dark:text-zinc-400 hover:border-primary dark:hover:border-survey-gold'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-survey-gold" />
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          {filteredImages.map((img) => (
            <motion.div
              layout
              key={img.id}
              className="group relative cursor-pointer glass border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 h-64"
              onClick={() => {
                setLightboxImage(img);
                setZoomLevel(1);
              }}
            >
              {/* Photo */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url('${img.image_url}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Detail overlays on hover */}
              <div className="absolute bottom-0 left-0 w-full p-4 text-left translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100 flex flex-col justify-end h-full">
                <span className="text-[10px] bg-survey-gold text-slate-950 font-bold px-2 py-0.5 rounded w-fit mb-1.5">
                  {img.category}
                </span>
                <h3 className="font-extrabold text-white text-lg line-clamp-1">{img.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2 mt-1">{img.description}</p>
              </div>

              {/* Top Right Admin Actions / Eye icon */}
              <div className="absolute top-3 right-3 flex items-center space-x-2">
                <span className="p-2 bg-slate-950/70 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition duration-300 shadow">
                  <Eye size={14} />
                </span>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteImage(img.id, e)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow transition duration-200"
                    title="Delete Image"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          
          {filteredImages.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500">
              No photos found under "{activeFilter}" category.
            </div>
          )}
        </motion.div>
      )}

      {/* LIGHTBOX POPUP SYSTEM */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-4"
          >
            {/* Lightbox header control row */}
            <div className="absolute top-4 w-full px-6 flex justify-between items-center text-white z-10">
              <div className="text-left">
                <h3 className="font-bold text-lg">{lightboxImage.title}</h3>
                <span className="text-xs text-survey-gold font-semibold uppercase">{lightboxImage.category}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}
                  className="p-2 hover:bg-zinc-800 rounded-full transition"
                  title="Zoom Out"
                >
                  <ZoomOut size={20} />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                  className="p-2 hover:bg-zinc-800 rounded-full transition"
                  title="Zoom In"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition shadow"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Lightbox Zoomable Picture */}
            <motion.div 
              style={{ scale: zoomLevel }}
              className="max-w-4xl max-h-[70vh] transition-transform duration-200"
            >
              <img 
                src={lightboxImage.image_url} 
                alt={lightboxImage.title} 
                className="max-w-full max-h-[70vh] rounded-lg shadow-2xl object-contain border border-zinc-800"
              />
            </motion.div>

            {/* Lightbox description details */}
            <div className="absolute bottom-6 max-w-2xl px-6 text-center text-slate-300">
              <p className="text-sm">{lightboxImage.description}</p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
