import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { Compass, CheckCircle, ShieldCheck, Cpu, ArrowRight, X, Phone, Calendar, Info } from 'lucide-react';

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    // Log visitor hit
    api.post('/log-visitor/', { page: 'Home' }).catch(() => {});

    // Fetch services data from backend
    api.get('/services/')
      .then((res) => {
        setServices(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-slate-950 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] scale-105"
          style={{ backgroundImage: `url('/images/hero_bg.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        
        {/* Grid Decorative Lines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full py-20 text-left">
          <div className="max-w-3xl space-y-6">
            
            {/* Animated Badging */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-survey-gold/20 text-survey-gold px-4 py-1.5 rounded-full border border-survey-gold/30 text-sm font-semibold tracking-wider uppercase font-sans"
            >
              <Compass className="animate-spin-slow" size={16} />
              <span>ISRO-coordinate mapped Precision</span>
            </motion.div>

            {/* Main Hero Header */}
            <motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none"
            >
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Deccan Digital Surveys</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-2xl text-slate-300 font-sans"
            >
              Professional Surveying Services Across India. Precision layout plotting, DGPS boundary resolution, and GIS mapping.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Link
                to="/book-survey"
                className="flex items-center space-x-2 px-8 py-3.5 bg-survey-gold text-slate-950 font-bold rounded-lg shadow-lg hover:bg-amber-500 hover:scale-105 transition-all"
              >
                <span>Book Survey</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/services"
                className="flex items-center space-x-2 px-8 py-3.5 bg-slate-800/80 backdrop-blur border border-slate-700 font-semibold rounded-lg hover:bg-slate-700/80 transition-all"
              >
                <span>Our Services</span>
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. VALUE PROPS (Info cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4 p-6 glass rounded-xl border border-slate-200/50 dark:border-zinc-800/50 shadow">
            <ShieldCheck className="text-primary dark:text-survey-gold shrink-0 mt-1" size={32} />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-50">Legal Standards Compliance</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                We design and stamp maps conforming to DTCP, HMDA, YTDA, and local revenue record systems.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-6 glass rounded-xl border border-slate-200/50 dark:border-zinc-800/50 shadow">
            <Cpu className="text-primary dark:text-survey-gold shrink-0 mt-1" size={32} />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-50">Cutting-Edge Instruments</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Sub-centimeter accuracy via multi-frequency GNSS DGPS receivers, lasers, and robotic Total Stations.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-6 glass rounded-xl border border-slate-200/50 dark:border-zinc-800/50 shadow">
            <CheckCircle className="text-primary dark:text-survey-gold shrink-0 mt-1" size={32} />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-50">Proven Track Record</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Over 1,200 layouts plotted and verified across key rural, industrial, and urban development corridors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50">Our Professional Services</h2>
          <div className="h-1.5 w-24 bg-survey-gold mx-auto rounded-full" />
          <p className="text-slate-500 dark:text-zinc-400">
            Select a service to view full technical specification, equipment details, processes, and sample photos.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-survey-gold" />
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                onClick={() => setSelectedService(service)}
                className="group relative cursor-pointer glass border border-slate-200/60 dark:border-zinc-800/60 rounded-xl overflow-hidden shadow hover:shadow-lg dark:hover:shadow-zinc-950/40 p-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Service Graphic */}
                  <div className="h-40 w-full rounded-lg bg-cover bg-center overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('${service.image_url}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    <span className="absolute bottom-2 left-3 text-xs bg-survey-gold text-slate-950 font-bold px-2 py-0.5 rounded shadow">
                      #{index + 1}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2 text-left">
                    <h3 className="font-extrabold text-xl group-hover:text-primary dark:group-hover:text-survey-gold transition-colors line-clamp-1 text-slate-900 dark:text-zinc-50">
                      {service.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-3">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-primary dark:text-survey-gold font-bold mt-4 justify-end">
                  <span>View Details</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 4. MODAL OVERLAY FOR SELECTED SERVICE */}
      <AnimatePresence>
        {selectedService && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 max-h-[90vh] flex flex-col"
            >
              
              {/* Modal Header Banner */}
              <div className="relative h-60 md:h-80 shrink-0">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${selectedService.image_url}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-950/70 text-white rounded-full hover:bg-slate-900/90 transition shadow border border-white/10"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-6 left-6 text-left">
                  <h2 className="text-2xl md:text-4xl font-extrabold text-white">{selectedService.title}</h2>
                  <p className="text-xs md:text-sm text-survey-gold font-semibold uppercase tracking-wider mt-1">
                    Deccan Digital Surveys Specification
                  </p>
                </div>
              </div>

              {/* Modal Content Scrollable Area */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-left">
                
                {/* Detailed Narrative */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Service Overview</h3>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {selectedService.detail_text}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Process steps */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Survey Process</h3>
                    <ul className="space-y-2.5">
                      {selectedService.process.split(';').map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-zinc-300">
                          <span className="flex items-center justify-center bg-primary/10 text-primary dark:bg-survey-gold/10 dark:text-survey-gold h-5 w-5 rounded-full text-xs font-bold shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span>{step.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Key Benefits</h3>
                    <ul className="space-y-2.5">
                      {selectedService.benefits.split(';').map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-zinc-300">
                          <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                          <span>{benefit.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Equipment & CTA row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl gap-4 border border-slate-200/50 dark:border-zinc-800/30">
                  <div className="flex items-start space-x-2">
                    <Cpu className="text-primary dark:text-survey-gold shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Survey Instruments</p>
                      <p className="text-sm text-slate-600 dark:text-zinc-300 font-medium">
                        {selectedService.equipment}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/book-survey?type=${encodeURIComponent(selectedService.title)}`}
                    onClick={() => setSelectedService(null)}
                    className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white dark:bg-survey-gold dark:text-slate-950 dark:hover:bg-amber-500 font-bold rounded-lg transition shrink-0"
                  >
                    <Calendar size={16} />
                    <span>Book This Survey</span>
                  </Link>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
