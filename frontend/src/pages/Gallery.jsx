import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { supabase, logVisitor } from '../api';
import { Plus, Trash2, Eye, X, ZoomIn, ZoomOut, Upload, Loader, FileImage } from 'lucide-react';
import Skeleton from '../components/Skeleton';

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    // Log visitor hit
    logVisitor('Gallery');

    // Check if user is logged in
    setIsAdmin(localStorage.getItem('is_admin') === 'true');

    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('gallery_images').select('*').order('uploaded_at', { ascending: false });
      if (error) throw error;
      setImages(data || []);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadLoading(true);

    if (!selectedFile) {
      setUploadError('Please select or drag an image file to upload.');
      setUploadLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', newTitle);
    formData.append('description', newDesc);
    formData.append('category', newCategory);
    formData.append('image', selectedFile);

    try {
      await api.post('/gallery/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Reset form and reload
      setNewTitle('');
      setNewDesc('');
      setSelectedFile(null);
      setShowAddForm(false);
      fetchGallery();
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload image. Ensure you are logged in as admin.');
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
            className="max-w-xl mx-auto glass border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-lg overflow-hidden text-left"
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
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Land">Land</option>
                  <option value="Layout">Layout</option>
                  <option value="Road & Rail">Road & Rail</option>
                  <option value="Drone Mapping">Drone Mapping</option>
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Upload File (Drag & Drop)</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition ${
                    dragActive ? "border-primary bg-blue-50/25 dark:bg-zinc-850/50" : "border-slate-300 dark:border-zinc-700 hover:border-primary"
                  }`}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {selectedFile ? (
                    <div className="flex items-center space-x-2 text-primary dark:text-survey-gold">
                      <FileImage size={24} />
                      <span className="font-bold text-xs">{selectedFile.name} ({(selectedFile.size/1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto text-slate-400" size={32} />
                      <p className="text-xs text-slate-500">Drag & Drop your image here or <span className="text-primary dark:text-survey-gold font-bold underline">browse files</span></p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-sm flex items-center justify-center space-x-1.5"
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
        <div className="w-full pt-8">
          <Skeleton type="card" count={6} />
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          {filteredImages.map((img) => {
            const imgPath = img.image || img.image_url;
            return (
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
                  style={{ backgroundImage: `url('${imgPath}')` }}
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
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow transition duration-205"
                      title="Delete Image"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          
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
                src={lightboxImage.image || lightboxImage.image_url} 
                alt={lightboxImage.title} 
                className="max-w-full max-h-[70vh] rounded-lg shadow-2xl object-contain border border-zinc-850"
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
