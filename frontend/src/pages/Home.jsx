import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import {
  Compass, CheckCircle, ShieldCheck, Cpu, ArrowRight, X, Calendar,
  MapPin, Check, ChevronDown, User, Star, Quote, HelpCircle, Layers,
  Camera, Trash2
} from 'lucide-react';
import Onboarding from '../components/Onboarding';

export default function Home() {
  const [settings, setSettings] = useState({
    hero_title: "Deccan Digital Surveys",
    hero_subtitle: "Precision DGPS & Total Station Land Surveying Services Across Telangana & Andhra Pradesh",
    hero_primary_btn: "Book Survey",
    hero_secondary_btn: "Contact Us",
    about_description: "Deccan Digital Surveys was founded in 2018 with a vision to revolutionize land measurement in India.",
    stat_experience_years: 8,
    stat_projects_completed: "1,200+",
    stat_clients_served: "950+"
  });
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  // Before/After state slider (0 to 100 representing clip percentage)
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // FAQ open state
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    // Log visitor hit
    api.post('/log-visitor/', { page: 'Home' }).catch(() => { });
    loadPageData();
  }, []);

  const loadPageData = async () => {
    setLoading(true);
    try {
      // Fetch settings
      const settingsRes = await api.get('/settings/');
      if (settingsRes.data && settingsRes.data.length > 0) {
        setSettings(settingsRes.data[0]);
      }

      // Fetch services
      const servicesRes = await api.get('/services/');
      setServices(servicesRes.data);

      // Fetch testimonials
      const testimonialsRes = await api.get('/testimonials/');
      setTestimonials(testimonialsRes.data);

      // Fetch team
      const teamRes = await api.get('/team/');
      setTeam(teamRes.data);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const handleUpdateServiceImage = async (service, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('title', service.title);
    formData.append('slug', service.slug);
    formData.append('description', service.description);
    formData.append('detail_text', service.detail_text);
    formData.append('process', service.process);
    formData.append('benefits', service.benefits);
    formData.append('equipment', service.equipment);
    formData.append('technical_specifications', service.technical_specifications || '');
    formData.append('equipment_details', service.equipment_details || '');
    formData.append('sample_photos_json', service.sample_photos_json || '[]');
    formData.append('image', file);

    try {
      const res = await api.put(`/services/${service.slug}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setServices(prev => prev.map(s => s.slug === service.slug ? res.data : s));
      alert('Photo successfully updated!');
    } catch (err) {
      alert('Failed to update photo: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteServiceImage = async (service) => {
    if (!window.confirm("Are you sure you want to remove this service's illustration photo?")) return;
    const formData = new FormData();
    formData.append('title', service.title);
    formData.append('slug', service.slug);
    formData.append('description', service.description);
    formData.append('detail_text', service.detail_text);
    formData.append('process', service.process);
    formData.append('benefits', service.benefits);
    formData.append('equipment', service.equipment);
    formData.append('technical_specifications', service.technical_specifications || '');
    formData.append('equipment_details', service.equipment_details || '');
    formData.append('sample_photos_json', service.sample_photos_json || '[]');
    formData.append('image', '');

    try {
      const res = await api.put(`/services/${service.slug}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setServices(prev => prev.map(s => s.slug === service.slug ? res.data : s));
      alert('Photo successfully deleted!');
    } catch (err) {
      alert('Failed to delete photo: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleMove = (clientX, rect) => {
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX, rect);
    }
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1 || isDragging) {
      const rect = e.currentTarget.getBoundingClientRect();
      handleMove(e.clientX, rect);
    }
  };

  // FAQ list
  const faqs = [
    {
      q: "What is DGPS and why is it better than traditional tape measurements?",
      a: "DGPS (Differential Global Positioning System) links with active satellite clusters to achieve coordinates with millimeter-level precision. Unlike traditional tape measures that can sag or be affected by uneven terrain, DGPS is completely error-proof and aligns perfectly with public state land registries."
    },
    {
      q: "How long does a standard 5-acre boundary survey take to complete?",
      a: "On-site GPS profiling and coordinate setting typically take 3 to 5 hours. Following field collection, our engineering desk processes the data and generates official certified CAD boundary layout drawings within 24 to 48 hours."
    },
    {
      q: "Do you assist with getting municipal approvals (HMDA / DTCP)?",
      a: "Yes! We specialize in producing layout drafts that conform strictly to the latest regulatory formats required by TS-bPASS, APDPMS, HMDA, and DTCP. We stake out boundaries and provide verified drawings for quick approval."
    },
    {
      q: "What documents do I need to provide before the survey begins?",
      a: "It is recommended to share copy records of the land registry title deed, revenue Tippon sheets, and any existing sketch mapping (FMB). This helps our engineering desk overlay revenue boundaries over current physical GPS data."
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">

      {/* 1. HERO SECTION (White Corporate Theme) */}
      <section className="relative min-h-[90vh] bg-white dark:bg-zinc-950 flex items-center overflow-hidden border-b border-slate-100 dark:border-zinc-900">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#0f4c81_1px,transparent_1px),linear-gradient(to_bottom,#0f4c81_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Decorative dynamic ambient blobs */}
        <div className="absolute top-1/4 right-[-10%] w-96 h-96 bg-blue-100/40 rounded-full filter blur-3xl opacity-70 animate-pulse pointer-events-none dark:bg-blue-950/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Hero Text content column */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-blue-50 text-primary px-4 py-1.5 rounded-full border border-blue-100 text-xs font-bold tracking-wider uppercase dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
              >
                <Compass className="animate-spin-slow text-blue-600 dark:text-blue-400" size={14} />
                <span>Certified Engineering Surveyors</span>
              </motion.div>

              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-zinc-50"
                >
                  {settings.hero_title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-lg sm:text-xl text-slate-600 dark:text-zinc-300 leading-relaxed font-normal"
                >
                  {settings.hero_subtitle}
                </motion.p>
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/book-survey"
                  className="flex items-center space-x-2 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
                >
                  <span>{settings.hero_primary_btn}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center space-x-2 px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-all text-sm dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <span>{settings.hero_secondary_btn}</span>
                </Link>
              </motion.div>
            </div>

            {/* Hero Premium illustration/graphic column */}
            <div className="lg:col-span-5 relative flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="w-full max-w-[450px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white dark:border-zinc-900 bg-slate-100"
              >
                {/* Fallback pattern design background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                      <Cpu size={40} />
                    </div>
                    <p className="font-extrabold text-lg text-slate-800 dark:text-zinc-200">ISO Standard Mapping</p>
                    <p className="text-xs text-slate-500 max-w-[250px] mx-auto">High-frequency RTK coordinates verified with CAD topography overlays.</p>
                  </div>
                </div>
                {/* Real image overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${settings.hero_image || settings.hero_image_url || '/images/hero_bg.png'}')` }}
                />
                <div className="absolute bottom-6 left-6 right-6 p-4 glass rounded-xl text-left border border-white/20">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TELANGANA & AP REGION</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">Direct Land Surveying using base DGPS stations & robotic CAD levels.</p>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CLIENT LOGOS STRIP */}
      <section className="bg-white dark:bg-zinc-950 py-8 border-b border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-xs text-slate-400 uppercase tracking-widest font-extrabold mb-6">Trusted by real estate developers, infra groups and farmers</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center opacity-65 grayscale hover:opacity-100 transition-opacity">
            <div className="font-black text-slate-400 text-lg tracking-wider font-mono">HMDA DEVELOPERS</div>
            <div className="font-black text-slate-400 text-lg tracking-wider font-mono">DTCP BUILDERS</div>
            <div className="font-black text-slate-400 text-lg tracking-wider font-mono">TELANGANA INFRA</div>
            <div className="font-black text-slate-400 text-lg tracking-wider font-mono">AP SURVEY ASSOC</div>
            <div className="font-black text-slate-400 text-lg tracking-wider font-mono">HYD TECH LANDS</div>
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC SERVICES LIST SECTION */}
      <section className="py-20 bg-slate-50 dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50">Our Professional Services</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-slate-500 dark:text-zinc-400">
              Select a service card to view full technical specification, equipment details, processes, and sample photos.
            </p>
          </div>

          {services.length === 0 ? (
            <div className="flex items-center justify-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedService(service)}
                  className="group relative cursor-pointer bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all p-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Service Graphic */}
                    <div className="h-44 w-full rounded-xl bg-slate-100 dark:bg-zinc-800 overflow-hidden relative">
                      {(service.image || service.image_url) ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{ backgroundImage: `url('${service.image || service.image_url}')` }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-600/5 text-blue-600">
                          <Layers size={36} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                      <span className="absolute bottom-3 left-4 text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded shadow-sm">
                        SERVICE #{index + 1}
                      </span>
                      
                      {/* Admin change/delete photo overlay */}
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex space-x-1.5 z-10">
                          <label 
                            className="p-1.5 bg-slate-900/80 backdrop-blur-sm text-white rounded-lg hover:bg-slate-800 transition cursor-pointer shadow border border-white/10"
                            title="Replace Illustration"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleUpdateServiceImage(service, e.target.files[0])}
                            />
                            <Camera size={14} />
                          </label>
                          {(service.image || service.image_url) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteServiceImage(service);
                              }}
                              className="p-1.5 bg-red-650/90 hover:bg-red-700 text-white rounded-lg transition shadow border border-red-500/20"
                              title="Delete Illustration"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2 text-left">
                      <h3 className="font-extrabold text-lg group-hover:text-primary dark:group-hover:text-blue-400 transition-colors line-clamp-1 text-slate-900 dark:text-zinc-50">
                        {service.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-3">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-primary dark:text-blue-400 font-bold mt-5 justify-end">
                    <span>View Specifications</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 5. BEFORE/AFTER SURVEY INTERACTIVE COMPARISON GALLERY */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50">Before / After Survey Comparison</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-slate-500 dark:text-zinc-400 text-sm">
              Drag the divider line left and right to compare raw, unmapped property plots (Before) vs. our DGPS-coordinates layout demarcation map (After).
            </p>
          </div>

          {/* Interactive slider frame */}
          <div className="flex justify-center">
            <div
              className="relative w-full max-w-[800px] aspect-[16/9] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-zinc-800 cursor-ew-resize select-none"
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              {/* After: demarcated layout (Full background) */}
              <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                {/* Fallback Graphic grid */}
                <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-8">
                  <div className="w-full h-full border-2 border-emerald-500/30 rounded bg-emerald-500/5 relative">
                    <div className="absolute top-1/4 left-1/4 px-2 py-1 bg-emerald-500 text-white font-mono text-[10px] rounded">Plot #04: Verified (34.20m x 25.10m)</div>
                    <div className="absolute bottom-1/4 right-1/4 px-2 py-1 bg-emerald-500 text-white font-mono text-[10px] rounded">Plot #05: Verified (34.20m x 25.10m)</div>
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 border-collapse border border-emerald-500/20" />
                  </div>
                </div>
                {/* Visual Representation Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('/images/gallery/layout_demarcation.png')` }}
                />
                <span className="absolute bottom-4 right-4 bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded shadow">
                  AFTER: Demarcated layout boundary mapping
                </span>
              </div>

              {/* Before: unmapped raw land (Clipped overlay) */}
              <div
                className="absolute inset-0 bg-slate-300 pointer-events-none transition-all duration-75"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              >
                {/* Fallback Graphic before */}
                <div className="absolute inset-0 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                  <p className="text-slate-400 font-extrabold text-xl">RAW SITE LAND</p>
                </div>
                {/* Visual Representation Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('/images/gallery/drone_mapping.png')` }}
                />
                <span className="absolute bottom-4 left-4 bg-red-600 text-white font-bold text-xs px-3 py-1 rounded shadow">
                  BEFORE: Unmapped land / boundary confusion
                </span>
              </div>

              {/* Slider boundary line handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg flex items-center justify-center cursor-ew-resize pointer-events-none"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold">
                  ↔
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section className="py-20 bg-slate-50 dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50">Client Testimonials</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-slate-500 dark:text-zinc-400 text-sm">
              Hear directly from real estate layout developers, agricultural property owners, and municipal agencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.length === 0 ? (
              // Fallback dummy testimonials if not loaded
              [1, 2, 3].map((num) => (
                <div key={num} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-sm text-left flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-slate-600 dark:text-zinc-300 italic text-sm leading-relaxed">
                      "Deccan Digital Surveys did an amazing job resolving our property boundaries in Siddipet. Precision DGPS coordinates saved us weeks of legal disputes."
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-850">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs">U</div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Lokesh Goud</h4>
                      <p className="text-[10px] text-slate-400">Property Owner</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              testimonials.map((t) => (
                <div key={t.id} className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-sm text-left flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex text-amber-500">
                      {[...Array(Math.min(5, Math.max(1, parseInt(t.rating) || 5)))].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-slate-600 dark:text-zinc-300 italic text-sm leading-relaxed relative">
                      <Quote className="absolute -top-3 -left-3 text-slate-100 dark:text-zinc-800 -z-0" size={32} />
                      <span className="relative z-10">"{t.review_text}"</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    {(t.image || t.image_url) ? (
                      <img src={t.image || t.image_url} alt={t.client_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-600/10 text-primary rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {(t.client_name || 'C').charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{t.client_name}</h4>
                      <p className="text-[10px] text-slate-400">{t.role || 'Client'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 7. TEAM MEMBERS SECTION */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50">Our Professional Team</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-slate-500 dark:text-zinc-400 text-sm">
              We employ certified civil boundary surveyors and DGPS instrument experts with years of field expertise.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {team.length === 0 ? (
              // Fallback team
              [1, 2].map((num) => (
                <div key={num} className="bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 overflow-hidden max-w-[280px] w-full p-4 space-y-4 shadow-sm">
                  <div className="h-48 w-full bg-slate-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                    <User size={48} className="text-slate-400" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-extrabold text-slate-900 dark:text-white">Survey Engineer</h4>
                    <p className="text-xs text-slate-400">DGPS Field Specialist</p>
                  </div>
                </div>
              ))
            ) : (
              team.map((member) => (
                <div key={member.id} className="bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 overflow-hidden max-w-[320px] w-full p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow text-left">
                  <div className="h-56 w-full bg-slate-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center overflow-hidden relative">
                    <User size={64} className="text-slate-300 absolute" />
                    {(member.image || member.image_url) && (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${member.image || member.image_url}')` }} />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{member.name}</h4>
                    <p className="text-xs text-primary dark:text-blue-400 font-bold uppercase tracking-wider">{member.role}</p>
                    {member.bio && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-zinc-800/50">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION SECTION */}
      <section className="py-20 bg-slate-50 dark:bg-zinc-900/40 border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50 flex items-center justify-center space-x-2">
              <HelpCircle className="text-primary dark:text-blue-400" size={32} />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            <p className="text-slate-500 dark:text-zinc-400 text-sm">
              Answers to standard questions about our surveying procedures, accuracy tolerances, and legal map registries.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === fIdx ? -1 : fIdx)}
                  className="w-full py-5 px-6 flex items-center justify-between font-bold text-slate-800 dark:text-zinc-100 hover:text-primary dark:hover:text-blue-400 text-left transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform text-slate-400 ${openFaq === fIdx ? 'rotate-180 text-primary' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === fIdx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-6 text-slate-500 dark:text-zinc-400 text-sm leading-relaxed border-t border-slate-100/50 dark:border-zinc-800/50 pt-4 text-left">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. MODAL SPECIFICATION DETAILS OVERLAY */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] flex flex-col"
            >

              {/* Modal Banner */}
              <div className="relative h-56 md:h-72 shrink-0 bg-slate-100">
                {selectedService.image_url && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${selectedService.image_url}')` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-950/70 text-white rounded-full hover:bg-slate-900/90 transition shadow border border-white/10"
                >
                  <X size={18} />
                </button>
                <div className="absolute bottom-6 left-6 text-left">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">{selectedService.title}</h2>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-1">
                    Deccan Digital Surveys Technical Specification
                  </p>
                </div>
              </div>

              {/* Scrollable details */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-left">

                {/* Description */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Service Overview</h3>
                  <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed">
                    {selectedService.detail_text}
                  </p>
                </div>

                {/* Technical Specs */}
                {selectedService.technical_specifications && (
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-xl border border-blue-100/30 dark:border-blue-900/20 text-xs">
                    <h4 className="font-extrabold text-primary dark:text-blue-400 uppercase tracking-wider mb-2">Technical Specifications</h4>
                    <p className="text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
                      {selectedService.technical_specifications}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Process steps */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Survey Process Steps</h3>
                    <ul className="space-y-2.5">
                      {selectedService.process.split(';').map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-zinc-300">
                          <span className="flex items-center justify-center bg-primary/10 text-primary dark:bg-blue-400/10 dark:text-blue-400 h-5 w-5 rounded-full text-xs font-bold shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span>{step.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Key Value Benefits</h3>
                    <ul className="space-y-2.5">
                      {selectedService.benefits.split(';').map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-zinc-300">
                          <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                          <span>{benefit.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Equipment */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl gap-4 border border-slate-200/50 dark:border-zinc-850">
                  <div className="flex items-start space-x-2">
                    <Cpu className="text-primary dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                    <div className="text-xs">
                      <p className="text-slate-450 font-bold uppercase tracking-wider">Surveying Instruments & Tech</p>
                      <p className="text-slate-600 dark:text-zinc-300 font-medium mt-0.5">
                        {selectedService.equipment} {selectedService.equipment_details ? `(${selectedService.equipment_details})` : ''}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/book-survey?type=${encodeURIComponent(selectedService.title)}`}
                    onClick={() => setSelectedService(null)}
                    className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition text-xs shadow shrink-0"
                  >
                    <Calendar size={14} />
                    <span>Book This Survey</span>
                  </Link>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Onboarding />

    </div>
  );
}
