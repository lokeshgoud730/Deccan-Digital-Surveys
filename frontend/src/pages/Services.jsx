import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { supabase, logVisitor } from '../api';
import { ArrowRight, CheckCircle, Cpu, Calendar, X, Compass, Search, Camera, Trash2 } from 'lucide-react';

export const FALLBACK_SERVICES = [
  {
    id: 1,
    title: 'Land Survey',
    slug: 'land-survey',
    description: 'Boundary definition, ownership mapping, and topographic mapping for rural and urban lands.',
    detail_text: 'Our Land Surveying service provides accurate boundary demarcation using state-of-the-art DGPS and Total Station equipment. We resolve property boundary disputes, establish clear ownership lines, and provide certified maps suitable for legal registration and property records.',
    process: 'Historical document analysis; Site reconnaissance; Boundary measurement with GPS/DGPS; Precision Total Station mapping; Draft preparation; Certified map delivery.',
    benefits: 'Resolves boundary disputes; Assures precise land area calculations; Required for legal sales and mortgages; Prevents future encroachment issues.',
    equipment: 'CHNAV DGPS Receiver, Leica Flexline TS07 Total Station',
    image_url: '/images/services/land_survey.png',
    technical_specifications: 'Accuracy: Horizontal +/- 8mm + 1ppm, Vertical +/- 15mm + 1ppm; Coordinate System: UTM / WGS84 or local grid system.',
    equipment_details: 'CHCNAV i90 IMU-RTK GNSS Receiver, Leica FlexLine TS07 reflectorless total station.',
    sample_photos_json: '[]'
  },
  {
    id: 2,
    title: 'Layout Survey (DTCP, HMDA, YTDA, Farm Lands)',
    slug: 'layout-survey',
    description: 'Precision plotting, demarcations, and layout designs matching DTCP, HMDA, and YTDA guidelines.',
    detail_text: 'We offer complete layout planning and physical demarcation services matching strict urban development authority standards. Whether you are developing commercial plots, residential areas, or farm lands, we ensure every plot is aligned precisely with regulatory codes.',
    process: 'Boundary verification; Plan design matching authority rules; Physical staking of roads and plots; Boundary stone markings; Approval drawing creation.',
    benefits: 'Ensures quick approvals from HMDA, DTCP, or YTDA; Maximum layout efficiency; Clear physical identification of plots for buyers.',
    equipment: 'Trimble R12 DGPS, Leica Total Station',
    image_url: '/images/services/layout_survey.png',
    technical_specifications: 'Design Standards: Conforms to HMDA/DTCP layout zoning bylaws. Point Staking Tolerance: +/- 5mm.',
    equipment_details: 'Trimble R12 GNSS system with Trimble Access controller.',
    sample_photos_json: '[]'
  },
  {
    id: 3,
    title: 'Tippon Survey',
    slug: 'tippon-survey',
    description: 'Verification, measurement, and resolution of agricultural land matching government land records (Tippon).',
    detail_text: 'Tippon surveys involve validating current land physical boundaries against historic land revenue records (Tippon maps). This is critical for resolving legacy ownership disputes in rural farming communities and matching layout coordinates with public registry datasets.',
    process: 'Collection of government Tippon sheets; DGPS positioning of key coordinate points; Comparison of revenue dimensions with actual dimensions; Correction reporting and map updates.',
    benefits: 'Legal protection against title disputes; Accurate correction of land area records; Resolves ancestral boundary confusion.',
    equipment: 'High-precision DGPS, Handheld Laser Distance Meters',
    image_url: '/images/services/tippon_survey.png',
    technical_specifications: 'Record Alignment: Legacy revenue chain conversion mapping to WGS84 coordinate systems.',
    equipment_details: 'South Galaxy G1 DGPS, Leica DISTO D2 laser meters.',
    sample_photos_json: '[]'
  },
  {
    id: 4,
    title: 'Canal Survey',
    slug: 'canal-survey',
    description: 'Hydrographic tracking, route optimization, and contouring for canal networks and irrigation layouts.',
    detail_text: 'Precision contour mapping and hydrographic data collection for canal alignment, widening, or desiltation works. We map cross-sections and calculate exact volume capacities to support engineering hydraulics and flow management.',
    process: 'Baseline alignment staking; Cross-section leveling at regular intervals; Long-section profile generation; Silt volume calculations.',
    benefits: 'Optimized hydraulic flow; Prevents overflow risks; Accurate estimation of excavation/silt removal volumes.',
    equipment: 'Auto Levels, Leica Total Stations, RTK DGPS',
    image_url: '/images/services/canal_survey.png',
    technical_specifications: 'Vertical Level Accuracy: +/- 1.5mm double-run leveling per km.',
    equipment_details: 'Sokkia B40A automatic levels, Leica TS07 Total Station.',
    sample_photos_json: '[]'
  },
  {
    id: 5,
    title: 'Municipal Survey',
    slug: 'municipal-survey',
    description: 'Boundary verification, property tax mapping, and road alignment layout surveys for municipal authorities.',
    detail_text: 'We assist city governments and local corporations in mapping urban assets, verifying property boundaries for tax assessments, and aligning public utilities like sewerage pipelines and roads.',
    process: 'Urban base map creation; Property boundary digitization; Geographic Information System (GIS) data matching; Road alignment surveying.',
    benefits: 'Increases property tax collections; Avoids public land encroachment; Streamlines municipal utility development.',
    equipment: 'Trimble S5 Robotic Total Station, GIS Data Controllers',
    image_url: '/images/services/municipal_survey.png',
    technical_specifications: 'Feature Mapping Tolerance: Class 1 Surveying Standard (+/- 10mm).',
    equipment_details: 'Trimble S5 Robotic Total Station, Trimble TSC7 controller.',
    sample_photos_json: '[]'
  },
  {
    id: 6,
    title: 'Municipal Plans',
    slug: 'municipal-plans',
    description: 'Creation of master plans, layout drafts, and structural layouts conforming to municipal planning rules.',
    detail_text: 'Providing complete drawing sets, setback verification, and building height documentation matching local municipal corporation bylaws. Essential for obtaining construction permits and commercial occupancy certificates.',
    process: 'Site physical verification; CAD drafting of site plan and floor layouts; Building code compliance review; Digital submission package compilation.',
    benefits: 'Fast-tracked building permission approvals; Avoids code violations and fines; High-precision CAD drafts.',
    equipment: 'CAD Software, Laser Measures, Handheld GPS',
    image_url: '/images/services/municipal_plans.png',
    technical_specifications: 'CAD Output formats: DWG, DXF, PDF conforming to APDPMS/TS-bPASS formats.',
    equipment_details: 'AutoCAD Map 3D, high-performance workstation computing.',
    sample_photos_json: '[]'
  },
  {
    id: 7,
    title: 'Gram Panchayat Plans',
    slug: 'gram-panchayat-plans',
    description: 'Rural planning layouts, public utility mapping, and layout submissions matching Gram Panchayat codes.',
    detail_text: 'Specialized layouts and zoning maps tailored for rural Gram Panchayats. We help rural landowners divide fields, build houses, or construct commercial complexes while ensuring compliance with rural zoning rules.',
    process: 'Local village map matching; Plot boundary demarcation; Road width verification; Gram Panchayat format drawings.',
    benefits: 'Ensures legal permissions in rural sectors; Affordable plans; Avoids local government disputes.',
    equipment: 'GPS, Precision Survey Tapes, Total Stations',
    image_url: '/images/services/panchayat_plans.png',
    technical_specifications: 'Zoning regulations matching rural village planning formats.',
    equipment_details: 'Garmin GPSMAP 64csx, high-precision steel measurement bands.',
    sample_photos_json: '[]'
  },
  {
    id: 8,
    title: 'Earth Work Quantities',
    slug: 'earth-work-quantities',
    description: 'Cut-and-fill volume estimations, soil grading profile layouts, and material quantity takeoffs.',
    detail_text: 'Precision calculation of soil volume to be excavated (cut) or filled to achieve a desired grade. Essential for infrastructure planning, mining operations, and large venture site developments.',
    process: 'Pre-excavation contour mapping; Post-excavation/grading surveys; 3D surface model comparisons in CAD; Volume calculation report production.',
    benefits: 'Saves excavation costs; Verification of contractor invoices; Precise material billing.',
    equipment: 'Contour DGPS, Drone Lidar, CAD Surface Modeling Software',
    image_url: '/images/services/earthwork.png',
    technical_specifications: 'Volume estimation error margin: < 2.5% calculated via tin volume surfaces.',
    equipment_details: 'DJI Matrice 300 RTK with L1 Lidar sensor, Civil 3D software.',
    sample_photos_json: '[]'
  },
  {
    id: 9,
    title: 'Pipeline Survey',
    slug: 'pipeline-survey',
    description: 'Route selection, profiles, contouring, and alignment staking for water, gas, and sewage pipelines.',
    detail_text: 'Route selection, mapping, and staking for transmission lines and utility conduits. We survey right-of-weight boundaries, compile profile elevation drawings, and identify terrain challenges to guarantee safe installation.',
    process: 'Feasibility route study; High-precision corridor topographic survey; Obstacle identification; Centerline staking and easement mapping.',
    benefits: 'Avoids underground hazards; Optimal slope alignments; Clear right-of-way permissions.',
    equipment: 'Pipe Locators, RTK DGPS, Digital Levels',
    image_url: '/images/services/pipeline_survey.png',
    technical_specifications: 'Utility Depth Verification: Up to 3 meters with Ground Penetrating Radar integration.',
    equipment_details: 'RD8100 precision utility locator, Leica NA724 levels.',
    sample_photos_json: '[]'
  },
  {
    id: 10,
    title: 'Grid and Contour Survey',
    slug: 'grid-and-contour-survey',
    description: 'Topographic map generation, elevation contours, and grid level tracking for design construction.',
    detail_text: 'Detailed level mapping using a grid system to determine elevations, slope characteristics, and water flow patterns on a property. Necessary before any high-rise building or heavy manufacturing plant architecture can be drafted.',
    process: 'Grid layout staking; Elevation readings at grid intersections; Coordinate contour interpolation; 3D elevation map generation.',
    benefits: 'Crucial for drainage planning; Prevents building structural issues; Complete 3D visualization of terrain.',
    equipment: 'Auto Levels, Leica TS07, Trimble DGPS',
    image_url: '/images/services/contour_survey.png',
    technical_specifications: 'Grid Intervals: 5m, 10m, or 20m configurations. Contour intervals: 0.5m, 1m elevation curves.',
    equipment_details: 'CHCNAV i90 DGPS, Sokkia levels, Civil 3D rendering engine.',
    sample_photos_json: '[]'
  },
  {
    id: 11,
    title: 'Road and Rail Survey',
    slug: 'road-and-rail-survey',
    description: 'High-precision geometric alignment, profiles, and structural cross-section mapping for transit links.',
    detail_text: 'Aligning highways, streets, and railways according to engineering designs. We perform alignment staking, curve setting, slope staking, and post-construction quality control to ensure strict adherence to safety specifications.',
    process: 'Establishment of permanent survey benchmarks; Centerline mapping; Cross-section detailing; Structural setting out (bridges, culverts).',
    benefits: 'Ensures transit safety and design compliance; Minimizes construction errors; Optimizes logistics alignment.',
    equipment: 'Robotic Total Stations, DGPS, High Precision Digital Levels',
    image_url: '/images/services/road_rail_survey.png',
    technical_specifications: 'Profile accuracy: +/- 2mm vertical control accuracy.',
    equipment_details: 'Leica TS16 Robotic Total Station, Trimble DGPS.',
    sample_photos_json: '[]'
  },
  {
    id: 12,
    title: 'Venture Developments',
    slug: 'venture-developments',
    description: 'Comprehensive mapping, plot markings, infrastructure layout, and grading designs for gated communities.',
    detail_text: 'Full-scale layout services for real estate promoters and construction firms. We manage the entire survey cycle from boundary surveying and contour leveling to utility staking, road profiling, and plot numbering.',
    process: 'Boundary verification; Topographic contour mapping; Road network planning; Drainage flow staking; Individual plot markings.',
    benefits: 'Speeds up project marketing; Clear visual layout for potential buyers; Integrated utility planning.',
    equipment: 'DGPS, Drone Mapping, Dual Leica Total Stations',
    image_url: '/images/services/venture_development.png',
    technical_specifications: 'Integrated community layout matching state regulatory design standards.',
    equipment_details: 'DJI Phantom 4 RTK, Leica Flexline TS07 Total Station, Trimble DGPS receivers.',
    sample_photos_json: '[]'
  }
];
import Skeleton from '../components/Skeleton';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const handleUpdateServiceImage = async (service, file, updateModal = false) => {
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
      if (updateModal) {
        setSelectedService(res.data);
      }
      alert('Photo successfully updated!');
    } catch (err) {
      alert('Failed to update photo: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteServiceImage = async (service, updateModal = false) => {
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
      if (updateModal) {
        setSelectedService(res.data);
      }
      alert('Photo successfully deleted!');
    } catch (err) {
      alert('Failed to delete photo: ' + (err.response?.data?.detail || err.message));
    }
  };

  useEffect(() => {
    // Log visitor hit
    logVisitor('Services');

    // Fetch services from Supabase (only required columns)
    setLoading(true);
    supabase.from('service_content')
      .select('id, title, slug, description, detail_text, process, benefits, equipment, image_url, technical_specifications, equipment_details, sample_photos_json')
      .order('id', { ascending: true })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          console.warn('Supabase service_content query failed or empty, using fallbacks.');
          setServices(FALLBACK_SERVICES);

          // Auto-select slug if query in URL
          const slug = searchParams.get('select');
          if (slug) {
            const matched = FALLBACK_SERVICES.find(s => s.slug === slug);
            if (matched) setSelectedService(matched);
          }
        } else {
          setServices(data);

          // Auto-select slug if query in URL
          const slug = searchParams.get('select');
          if (slug) {
            const matched = data.find(s => s.slug === slug);
            if (matched) setSelectedService(matched);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching services:', err);
        setServices(FALLBACK_SERVICES);
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
        <div className="w-full pt-8">
          <Skeleton type="card" count={6} />
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
              className="group relative cursor-pointer glass border border-slate-200/60 dark:border-zinc-800/60 rounded-xl overflow-hidden shadow hover:shadow-lg dark:hover:shadow-zinc-950/40 px-4 py-6 flex flex-col justify-between text-left"
            >
              <div className="space-y-4">
                {/* Image block */}
                  <div className="h-44 w-full rounded-lg bg-cover bg-center overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
                    <img 
                      src={service.image || service.image_url}
                      alt={service.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    
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
                <img 
                  src={selectedService.image || selectedService.image_url}
                  alt={selectedService.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                
                {/* Admin controls for modal banner photo */}
                {isAdmin && (
                  <div className="absolute top-4 left-4 flex space-x-2 z-10">
                    <label className="flex items-center space-x-1 px-3 py-1.5 bg-slate-950/70 hover:bg-slate-900/90 text-white rounded-lg text-xs font-bold cursor-pointer border border-white/10 transition shadow">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleUpdateServiceImage(selectedService, e.target.files[0], true)}
                      />
                      <Camera size={12} />
                      <span>Change Photo</span>
                    </label>
                    {(selectedService.image || selectedService.image_url) && (
                      <button
                        onClick={() => handleDeleteServiceImage(selectedService, true)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-red-650/90 hover:bg-red-700 text-white rounded-lg text-xs font-bold border border-red-500/20 transition shadow"
                        title="Delete photo"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}

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

                {/* Technical Specifications */}
                {selectedService.technical_specifications && (
                  <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-4">
                    <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Technical Specifications</h3>
                    <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                      {selectedService.technical_specifications}
                    </p>
                  </div>
                )}

                {/* Detailed Equipment Specifications */}
                {selectedService.equipment_details && (
                  <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-4">
                    <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Detailed Equipment Specifications</h3>
                    <p className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                      {selectedService.equipment_details}
                    </p>
                  </div>
                )}

                {/* Sample Photos Grid */}
                {(() => {
                  let photos = [];
                  if (selectedService.sample_photos_json) {
                    try {
                      photos = JSON.parse(selectedService.sample_photos_json);
                    } catch (e) {
                      console.error("Error parsing sample_photos_json:", e);
                    }
                  }
                  if (photos && photos.length > 0) {
                    return (
                      <div className="space-y-3 border-t border-slate-100 dark:border-zinc-800 pt-4">
                        <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Field Work & Sample Photos</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {photos.map((photo, pIdx) => (
                            <div key={pIdx} className="group/photo relative border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-800/30 shadow-sm">
                              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-zinc-900 relative">
                                <img 
                                  src={photo.url} 
                                  alt={photo.caption || "Sample Survey Photo"}
                                  className="object-cover w-full h-full transition-transform duration-300 group-hover/photo:scale-105"
                                />
                              </div>
                              {photo.caption && (
                                <div className="p-3 bg-white dark:bg-zinc-900 text-xs text-slate-600 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/45">
                                  {photo.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
