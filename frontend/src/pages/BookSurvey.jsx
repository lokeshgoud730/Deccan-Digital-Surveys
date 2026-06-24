import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { 
  Calendar, User, Phone, Mail, MapPin, AlignLeft, Info, 
  CheckCircle2, ChevronRight, Loader, FileText, Camera, Edit3, Map, Sparkles,
  ArrowLeft, ArrowRight, Download, Check 
} from 'lucide-react';

export default function BookSurvey() {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  
  // Wizard steps: 1 (Survey), 2 (Recommendation), 3 (Map & Files), 4 (Contact & Date), 5 (Confirmation)
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState('');

  // Questionnaire States
  const [landType, setLandType] = useState('Agricultural/Farm');
  const [boundaryIssues, setBoundaryIssues] = useState('No - boundaries are clear');
  const [approvalRequired, setApprovalRequired] = useState('No - personal survey');
  const [parcelSize, setParcelSize] = useState('1 to 5 acres');

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [surveyType, setSurveyType] = useState('Land Survey');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [surveyDate, setSurveyDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [coordinates, setCoordinates] = useState('');
  
  // Files states
  const [landDoc, setLandDoc] = useState(null);
  const [propertyImg, setPropertyImg] = useState(null);
  const [locationSketch, setLocationSketch] = useState(null);

  // File Validation Errors
  const [fileErrors, setFileErrors] = useState({ landDoc: '', propertyImg: '', locationSketch: '' });

  // AI Assistant states
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Statuses
  const [formLoading, setFormLoading] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Map mounting refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Generate Unique Session ID on mount
  useEffect(() => {
    const generatedId = 'ss-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    setSessionId(generatedId);

    // Initialize session in database
    api.post('/survey-sessions/', { session_id: generatedId })
      .catch((err) => console.error('Failed to create survey session:', err));

    // Fetch services to populate list
    api.get('/services/')
      .then((res) => {
        setServices(res.data);
      })
      .catch((err) => console.error('Error fetching services:', err));
  }, []);

  // Initialize and clean up Leaflet Map when entering/exiting Step 3
  useEffect(() => {
    if (step === 3) {
      setTimeout(() => {
        loadLeafletMap();
      }, 100);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [step]);

  const loadLeafletMap = () => {
    if (window.L) {
      initMap();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      initMap();
    };
    document.body.appendChild(script);
  };

  const initMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Hyderabad Center Coordinates
    const initialLat = 17.3850;
    const initialLng = 78.4867;

    const map = window.L.map(mapContainerRef.current).setView([initialLat, initialLng], 11);
    mapRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    setMapLoaded(true);

    // If coordinates already entered, drop pin
    if (coordinates) {
      const parts = coordinates.split(',').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        updateMarker(parts[0], parts[1]);
        map.setView([parts[0], parts[1]], 14);
      }
    }

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      updateMarker(lat, lng);
    });
  };

  const updateMarker = (lat, lng) => {
    const coordsStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    setCoordinates(coordsStr);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = window.L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      markerRef.current = marker;
      
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setCoordinates(`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
      });
    }
  };

  // Run AI Survey recommendation based on questionnaire answers
  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setErrorMsg('');

    const surveyDescription = `Land Type: ${landType}, Boundary Issues: ${boundaryIssues}, Layout Approvals: ${approvalRequired}, Parcel Size: ${parcelSize}`;

    try {
      const res = await api.post('/ai-assistant/', { description: surveyDescription });
      setAiRecommendation(res.data);
      setSurveyType(res.data.recommended_survey || 'Land Survey');

      // Update database session completion status
      await api.patch(`/survey-sessions/${sessionId}/`, {
        completed_at: new Date().toISOString(),
        recommended_service: res.data.recommended_survey || 'Land Survey'
      });

      setStep(2);
    } catch (err) {
      console.error(err);
      setErrorMsg('AI Assistant could not generate a recommendation. Proceeding manually.');
      setSurveyType('Land Survey');
      setStep(2);
    } finally {
      setAiLoading(false);
    }
  };

  // Safe file validations
  const validateFile = (file, fileKey, allowedExtensions) => {
    setFileErrors(prev => ({ ...prev, [fileKey]: '' }));
    if (!file) return true;

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors(prev => ({ ...prev, [fileKey]: 'File size must not exceed 5MB.' }));
      return false;
    }

    const ext = file.name.split('.')[-1] || file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setFileErrors(prev => ({ ...prev, [fileKey]: `Unsupported file type. Allowed: ${allowedExtensions.join(', ')}` }));
      return false;
    }

    return true;
  };

  const handleLandDocChange = (e) => {
    const file = e.target.files[0];
    if (validateFile(file, 'landDoc', ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'])) {
      setLandDoc(file);
    } else {
      setLandDoc(null);
    }
  };

  const handlePropertyImgChange = (e) => {
    const file = e.target.files[0];
    if (validateFile(file, 'propertyImg', ['jpg', 'jpeg', 'png'])) {
      setPropertyImg(file);
    } else {
      setPropertyImg(null);
    }
  };

  const handleLocationSketchChange = (e) => {
    const file = e.target.files[0];
    if (validateFile(file, 'locationSketch', ['pdf', 'jpg', 'jpeg', 'png'])) {
      setLocationSketch(file);
    } else {
      setLocationSketch(null);
    }
  };

  // Submit booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFormLoading(true);

    const formData = new FormData();
    formData.append('customer_name', customerName);
    formData.append('mobile_number', mobileNumber);
    formData.append('email', email);
    formData.append('survey_type', surveyType);
    formData.append('property_location', propertyLocation);
    formData.append('survey_date', surveyDate);
    formData.append('additional_notes', additionalNotes);
    formData.append('coordinates', coordinates);

    if (landDoc) formData.append('land_document', landDoc);
    if (propertyImg) formData.append('property_image', propertyImg);
    if (locationSketch) formData.append('location_sketch', locationSketch);

    try {
      const res = await api.post('/bookings/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCreatedBooking(res.data);

      // Update session conversion status
      await api.patch(`/survey-sessions/${sessionId}/`, {
        is_converted: true
      });

      setStep(5);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit booking. Please review your input fields.');
    } finally {
      setFormLoading(false);
    }
  };

  // Download authenticated ReportLab PDF receipts
  const handleDownloadPDF = async (pdfType) => {
    if (!createdBooking) return;
    try {
      const res = await api.get(`/bookings/${createdBooking.id}/${pdfType}/?phone=${encodeURIComponent(createdBooking.mobile_number)}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `deccan_${pdfType.replace('-pdf', '')}_${createdBooking.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to retrieve PDF: Unauthorized action.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8 bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
      
      {/* 1. Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50 tracking-tight leading-none uppercase">
          AI Survey Planner
        </h1>
        <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-lg mx-auto">
          Complete a quick digital survey about your land plot to receive AI-powered surveying specifications and book verified field layout services.
        </p>
      </section>

      {/* 2. Step Progress Line Indicator */}
      <div className="max-w-3xl mx-auto pt-4 pb-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-[3px] bg-slate-200 dark:bg-zinc-800 -translate-y-1/2 z-0" />
          <div 
            className="absolute left-0 top-1/2 h-[3px] bg-primary dark:bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />

          {[
            { label: 'Survey', stepNum: 1 },
            { label: 'AI Match', stepNum: 2 },
            { label: 'Location', stepNum: 3 },
            { label: 'Schedule', stepNum: 4 },
            { label: 'Done', stepNum: 5 }
          ].map((s) => (
            <div key={s.stepNum} className="relative z-10 flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all duration-300 ${
                step === s.stepNum ? 'bg-primary dark:bg-blue-600 text-white ring-4 ring-primary/20 scale-110' :
                step > s.stepNum ? 'bg-emerald-500 text-white' :
                'bg-slate-200 dark:bg-zinc-800 text-slate-400'
              }`}>
                {step > s.stepNum ? <Check size={14} /> : s.stepNum}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 hidden sm:block ${
                step === s.stepNum ? 'text-primary dark:text-blue-400 font-black' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Multi-Step Form Wrapper */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INTERACTIVE SURVEY QUESTIONNAIRE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 sm:p-8 rounded-2xl shadow-xl text-left space-y-6"
            >
              <div className="flex items-center space-x-2 text-primary dark:text-blue-400">
                <Sparkles className="animate-pulse" size={20} />
                <h2 className="font-extrabold text-xl">Land Survey Questionnaire</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide basic details regarding your land parcel to enable our AI engine to analyze boundaries tolerances, municipal plan guidelines, and recommended GPS configurations.
              </p>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSurveySubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  {/* Q1 */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700 dark:text-zinc-300">1. What is the physical property terrain type?</label>
                    <select
                      value={landType}
                      onChange={(e) => setLandType(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="Agricultural/Farm">Agricultural / Open Farm Land</option>
                      <option value="Residential Plot">Urban Residential Plot</option>
                      <option value="Gated Venture / Layout">Gated Venture / Subdivision Layout</option>
                      <option value="Industrial/Infrastructure">Industrial / Pipeline Corridor</option>
                    </select>
                  </div>

                  {/* Q2 */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700 dark:text-zinc-300">2. Are there active boundary disputes or encroachment conflicts?</label>
                    <select
                      value={boundaryIssues}
                      onChange={(e) => setBoundaryIssues(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="No - boundaries are clear">No - boundary lines are clear</option>
                      <option value="Yes - boundary issues / encroachments">Yes - active dispute / fence lines overlapping</option>
                      <option value="Not sure">Not sure / Unidentified corner stones</option>
                    </select>
                  </div>

                  {/* Q3 */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700 dark:text-zinc-300">3. Do you require governmental/municipal approvals?</label>
                    <select
                      value={approvalRequired}
                      onChange={(e) => setApprovalRequired(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="No - personal survey">No - personal boundary measurement / stake-out</option>
                      <option value="Yes - HMDA / DTCP / YTDA / Panchayat approvals">Yes - DTCP / HMDA / YTDA layout approval plan</option>
                    </select>
                  </div>

                  {/* Q4 */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700 dark:text-zinc-300">4. What is the approximate dimensions or acreage?</label>
                    <select
                      value={parcelSize}
                      onChange={(e) => setParcelSize(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="Less than 1 acre">Less than 1 acre / Plot size</option>
                      <option value="1 to 5 acres">1 to 5 acres</option>
                      <option value="More than 5 acres">More than 5 acres / Extended acreage</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl transition shadow flex items-center justify-center space-x-2 text-sm"
                >
                  {aiLoading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      <span>AI Engine Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Get AI recommendation</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: AI RECOMMENDATION RESULT */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 sm:p-8 rounded-2xl shadow-xl text-left space-y-6"
            >
              <div className="flex items-center space-x-2 text-primary dark:text-blue-400">
                <Sparkles className="animate-pulse" size={22} />
                <h2 className="font-extrabold text-xl">AI Survey Evaluation</h2>
              </div>

              {aiRecommendation ? (
                <div className="space-y-6">
                  {/* Result header */}
                  <div className="p-4 bg-blue-50/50 dark:bg-zinc-850/50 border border-blue-100/30 dark:border-zinc-800 rounded-xl space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Matched Survey Solution</p>
                    <h3 className="text-2xl font-black text-primary dark:text-blue-400 font-sans">{aiRecommendation.recommended_survey}</h3>
                    <p className="text-xs text-slate-500 mt-1">{aiRecommendation.description}</p>
                  </div>

                  {/* Rationale explanation */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Analysis Rationale</h4>
                    <p className="text-sm text-slate-655 dark:text-zinc-300 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-zinc-950/40 p-4 rounded-xl border border-slate-100 dark:border-zinc-800">
                      {aiRecommendation.rationale}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs leading-normal flex items-start space-x-2">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <span>Based on boundary lines overlap or layouts required, high-precision base satellite DGPS and total stations will be dispatched. A downloadable ReportLab PDF detailing this specification will be unlocked post reservation setup.</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-355 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl font-bold transition text-sm flex items-center justify-center space-x-1.5"
                    >
                      <ArrowLeft size={16} />
                      <span>Retake Survey</span>
                    </button>
                    
                    <button
                      onClick={() => setStep(3)}
                      className="flex-grow py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl transition shadow flex items-center justify-center space-x-1.5 text-sm"
                    >
                      <span>Proceed to Book Survey</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-500">Error reading AI response parameters. Please retake the survey.</p>
                  <button onClick={() => setStep(1)} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">Go Back</button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: LOCATION PIN & FILE UPLOADS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 sm:p-8 rounded-2xl shadow-xl text-left space-y-6"
            >
              <h2 className="font-extrabold text-xl text-slate-900 dark:text-zinc-50 border-b border-slate-100 dark:border-zinc-800 pb-3">
                Property Location & Documents
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                {/* Maps Column (2 sections) */}
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Map Coordinates Pinner</label>
                  <div 
                    ref={mapContainerRef} 
                    className="w-full h-56 rounded-xl border border-slate-200 dark:border-zinc-855 bg-slate-100 z-0 relative shadow-inner"
                  />
                  <div className="text-[10px] text-slate-400 leading-normal">
                    Click coordinates above to pinpoint center boundary markings.
                    {coordinates && <p className="font-mono text-xs text-primary dark:text-blue-400 font-bold mt-1">Pinned: {coordinates}</p>}
                  </div>
                </div>

                {/* File Uploads & Address Column (3 sections) */}
                <div className="md:col-span-3 space-y-4 text-xs">
                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Property Location Address</label>
                    <textarea
                      required
                      value={propertyLocation}
                      onChange={(e) => setPropertyLocation(e.target.value)}
                      placeholder="e.g. Survey No. 45, Jangaon Road, Siddipet, Telangana"
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:ring-1 focus:ring-primary focus:outline-none"
                      rows={2.5}
                    />
                  </div>

                  {/* Documents uploads */}
                  <div className="space-y-3.5 pt-2">
                    
                    {/* Doc 1 */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Land Title Deed (PDF/Doc/Image, Max 5MB)</label>
                      <input 
                        type="file" 
                        onChange={handleLandDocChange} 
                        className="block w-full text-xs text-slate-500 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-white hover:file:opacity-90 cursor-pointer"
                      />
                      {fileErrors.landDoc && <p className="text-[10px] text-red-500 font-bold mt-0.5">{fileErrors.landDoc}</p>}
                      {landDoc && <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Selected: {landDoc.name}</p>}
                    </div>

                    {/* Doc 2 */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Property Site Photo (JPEG/PNG, Max 5MB)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handlePropertyImgChange} 
                        className="block w-full text-xs text-slate-500 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-white hover:file:opacity-90 cursor-pointer"
                      />
                      {fileErrors.propertyImg && <p className="text-[10px] text-red-500 font-bold mt-0.5">{fileErrors.propertyImg}</p>}
                      {propertyImg && <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Selected: {propertyImg.name}</p>}
                    </div>

                    {/* Doc 3 */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Location Sketch Map (PDF/Image, Max 5MB)</label>
                      <input 
                        type="file" 
                        onChange={handleLocationSketchChange} 
                        className="block w-full text-xs text-slate-500 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-white hover:file:opacity-90 cursor-pointer"
                      />
                      {fileErrors.locationSketch && <p className="text-[10px] text-red-500 font-bold mt-0.5">{fileErrors.locationSketch}</p>}
                      {locationSketch && <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Selected: {locationSketch.name}</p>}
                    </div>

                  </div>
                </div>
              </div>

              {/* Navigation button rows */}
              <div className="flex gap-4 pt-3 text-sm">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-slate-350 dark:border-zinc-800 text-slate-655 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>AI evaluation</span>
                </button>
                <button
                  onClick={() => {
                    if (!propertyLocation.trim()) {
                      alert('Please provide physical property address details.');
                      return;
                    }
                    setStep(4);
                  }}
                  className="flex-grow py-3 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl transition shadow flex items-center justify-center space-x-1.5"
                >
                  <span>Select Schedule & Contacts</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONTACT INFO & SCHEDULING */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 sm:p-8 rounded-2xl shadow-xl text-left space-y-6"
            >
              <h2 className="font-extrabold text-xl text-slate-900 dark:text-zinc-50 border-b border-slate-100 dark:border-zinc-800 pb-3">
                Customer Contacts & Scheduler
              </h2>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300">Requester Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 dark:bg-zinc-805 dark:border-zinc-700 dark:text-zinc-100 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Phone size={16} />
                      </span>
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="e.g. 9000000000"
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 dark:bg-zinc-805 dark:border-zinc-700 dark:text-zinc-100 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 dark:bg-zinc-805 dark:border-zinc-700 dark:text-zinc-100 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300">Preferred Survey Date</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Calendar size={16} />
                      </span>
                      <input
                        type="date"
                        required
                        value={surveyDate}
                        onChange={(e) => setSurveyDate(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 dark:bg-zinc-805 dark:border-zinc-700 dark:text-zinc-100 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Selected survey type indicator */}
                <div className="p-3 bg-blue-50/50 dark:bg-zinc-850 border border-blue-100/20 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-455 uppercase tracking-wide font-bold">Recommended Survey Solution:</span>
                    <p className="font-extrabold text-primary dark:text-blue-400 text-sm mt-0.5">{surveyType}</p>
                  </div>
                  <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded font-black">AI VERIFIED</span>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300">Additional Project Notes</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Terrain descriptions, boundary markings requested, or reference benchmarks..."
                    className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg bg-slate-50 dark:bg-zinc-805 dark:border-zinc-700 dark:text-zinc-50 focus:ring-1 focus:ring-primary focus:outline-none"
                    rows={2}
                  />
                </div>

                <div className="flex gap-4 pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3.5 border border-slate-350 dark:border-zinc-800 text-slate-655 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-xl font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <ArrowLeft size={16} />
                    <span>Location details</span>
                  </button>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-grow py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl transition shadow flex items-center justify-center space-x-1.5 text-sm"
                  >
                    {formLoading ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        <span>Submitting Booking Request...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Confirm & Lock Booking</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 5: BOOKING CONFIRMATION & PDF TRIGGERS */}
          {step === 5 && createdBooking && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 border border-emerald-500/20 p-8 rounded-2xl shadow-xl text-center space-y-6 max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-955/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                <CheckCircle2 size={48} className="animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-2xl text-slate-900 dark:text-zinc-50 font-sans tracking-tight">
                  Survey Successfully Booked!
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                  Thank you. Your land survey booking is verified and locked. A dispatcher notification has been triggered, and our surveyor will call you on <span className="font-bold text-slate-800 dark:text-white">{createdBooking.mobile_number}</span> shortly.
                </p>
              </div>

              {/* Summary details card */}
              <div className="bg-slate-50 dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-850 text-left text-xs space-y-3.5">
                <div className="flex justify-between items-center border-b border-slate-205/50 dark:border-zinc-800/40 pb-2">
                  <span className="text-slate-400 font-semibold uppercase">Booking ID / Code:</span>
                  <span className="font-mono text-sm font-black text-primary dark:text-blue-400">DDS-{createdBooking.id}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 uppercase text-[9px] font-bold">Survey category:</span>
                    <p className="font-extrabold text-slate-800 dark:text-zinc-200 text-xs">{createdBooking.survey_type}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 uppercase text-[9px] font-bold">Reserved Date:</span>
                    <p className="font-extrabold text-slate-800 dark:text-zinc-200 text-xs">{createdBooking.survey_date}</p>
                  </div>
                </div>

                <div className="space-y-0.5 pt-1.5 border-t border-slate-205/50 dark:border-zinc-800/40">
                  <span className="text-slate-400 uppercase text-[9px] font-bold">Location coordinates:</span>
                  <p className="font-mono text-slate-800 dark:text-zinc-300">{createdBooking.coordinates || 'Not Pinned'}</p>
                </div>
              </div>

              {/* Dynamic PDF downloads */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide text-left">Generated technical deliverables:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    onClick={() => handleDownloadPDF('receipt-pdf')}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-805/40 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-250 rounded-xl transition border border-slate-200/50 dark:border-zinc-800 text-xs font-bold"
                  >
                    <span className="flex items-center space-x-1.5">
                      <Download size={12} className="text-primary dark:text-blue-400" />
                      <span>Receipt</span>
                    </span>
                    <span className="text-[8px] bg-slate-200/70 dark:bg-zinc-800 px-1 rounded text-slate-400">PDF</span>
                  </button>

                  <button
                    onClick={() => handleDownloadPDF('report-pdf')}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-805/40 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-250 rounded-xl transition border border-slate-200/50 dark:border-zinc-800 text-xs font-bold"
                  >
                    <span className="flex items-center space-x-1.5">
                      <Download size={12} className="text-primary dark:text-blue-400" />
                      <span>Report spec</span>
                    </span>
                    <span className="text-[8px] bg-slate-200/70 dark:bg-zinc-800 px-1 rounded text-slate-400">PDF</span>
                  </button>

                  <button
                    onClick={() => handleDownloadPDF('invoice-pdf')}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-805/40 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-250 rounded-xl transition border border-slate-200/50 dark:border-zinc-800 text-xs font-bold"
                  >
                    <span className="flex items-center space-x-1.5">
                      <Download size={12} className="text-primary dark:text-blue-400" />
                      <span>Invoice</span>
                    </span>
                    <span className="text-[8px] bg-slate-200/70 dark:bg-zinc-800 px-1 rounded text-slate-400">PDF</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center text-xs">
                <Link
                  to={`/track?id=${createdBooking.id}&phone=${encodeURIComponent(createdBooking.mobile_number)}`}
                  className="px-5 py-2.5 bg-primary dark:bg-blue-600 text-white font-semibold rounded-lg hover:opacity-95 shadow transition text-center"
                >
                  Track Survey Real-Time
                </Link>
                
                <button
                  onClick={() => {
                    setStep(1);
                    setCreatedBooking(null);
                    setCustomerName('');
                    setMobileNumber('');
                    setEmail('');
                    setPropertyLocation('');
                    setSurveyDate('');
                    setAdditionalNotes('');
                    setCoordinates('');
                    setLandDoc(null);
                    setPropertyImg(null);
                    setLocationSketch(null);
                  }}
                  className="px-5 py-2.5 border border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                >
                  Book another Survey
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
