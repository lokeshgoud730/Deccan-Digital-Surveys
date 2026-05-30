import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { ArrowRight, CheckCircle, Cpu, Calendar, X, Compass, Search } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Log visitor hit
    api.post('/log-visitor/', { page: 'Services' }).catch(() => {});

    // Fetch services from API
    api.get('/services/')
      .then((res) => {
        setServices(res.data);
        setLoading(false);

        // If there is a slug query in URL, auto-select it
        const slug = searchParams.get('select');
        if (slug) {
          const matched = res.data.find(s => s.slug === slug);
          if (matched) setSelectedService(matched);
        }
      })
      .catch((err) => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, [searchParams]);

  // Filter services by search box
  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Title */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50 font-sans"
        >
          Surveying Services
        </motion.h1>
        <div className="h-1.5 w-24 bg-survey-gold mx-auto rounded-full" />
        <p className="text-slate-500 dark:text-zinc-400">
          Deccan Digital Surveys delivers high-precision measurements matching strict engineering tolerances and regulatory guidelines.
        </p>
      </section>

      {/* Search Input bar */}
      <div className="max-w-md mx-auto relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services (e.g. land, layout, contour)..."
          className="block w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-survey-gold" />
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredServices.map((service, index) => (
            <motion.div
              layout
              key={service.id}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={() => setSelectedService(service)}
              className="group relative cursor-pointer glass border border-slate-200/60 dark:border-zinc-800/60 rounded-xl overflow-hidden shadow hover:shadow-lg dark:hover:shadow-zinc-950/40 p-5 flex flex-col justify-between text-left"
            >
              <div className="space-y-4">
                {/* Image block */}
                <div className="h-44 w-full rounded-lg bg-cover bg-center overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${service.image_url}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                </div>
                
                {/* Details */}
                <div className="space-y-2">
                  <h3 className="font-extrabold text-xl group-hover:text-primary dark:group-hover:text-survey-gold transition-colors line-clamp-1 text-slate-900 dark:text-zinc-50 font-sans">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-3">
                    {service.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-primary dark:text-survey-gold font-bold mt-4 justify-end">
                <span>View Specification</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
          
          {filteredServices.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No services found matching "{searchQuery}"
            </div>
          )}
        </motion.div>
      )}

      {/* MODAL VIEW FOR A SELECT OPTION */}
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
              
              {/* Modal Banner */}
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
                    Survey Specifications Code
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-left">
                
                {/* Specification detail */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Service Detail</h3>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base">
                    {selectedService.detail_text}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Step list */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Execution Steps</h3>
                    <ul className="space-y-2">
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

                  {/* Benefit list */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Technical Benefits</h3>
                    <ul className="space-y-2">
                      {selectedService.benefits.split(';').map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-zinc-300">
                          <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                          <span>{benefit.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Equipment tag */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl gap-4 border border-slate-200/50 dark:border-zinc-800/30">
                  <div className="flex items-start space-x-2">
                    <Cpu className="text-primary dark:text-survey-gold shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Calibrated Instruments</p>
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
