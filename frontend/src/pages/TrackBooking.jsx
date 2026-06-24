import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calendar, MapPin, ClipboardList, CheckCircle, Clock, 
  User, ShieldCheck, Download, Star, Sparkles, Loader, AlertCircle 
} from 'lucide-react';
import api from '../api';

export default function TrackBooking() {
  const [bookingId, setBookingId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  // Reviews submission state
  const [clientName, setClientName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!bookingId || !phoneNumber) return;

    setLoading(true);
    setError('');
    setBooking(null);
    setReviewSuccess(false);

    try {
      const res = await api.get('/bookings/track/', {
        params: { id: bookingId, phone: phoneNumber }
      });
      setBooking(res.data);
      setClientName(res.data.customer_name || '');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'No booking record found matching these details. Please verify your ID and phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (type) => {
    try {
      const res = await api.get(`/bookings/${booking.id}/${type}/?phone=${encodeURIComponent(phoneNumber)}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `booking_${booking.id}_${type.replace('-pdf', '')}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to retrieve PDF: ' + err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      await api.post('/testimonials/', {
        client_name: clientName,
        role: `Client (Survey by ${booking.surveyor_name || 'DDS Surveyor'})`,
        review_text: reviewText,
        rating: rating
      });
      setReviewSuccess(true);
      setReviewText('');
    } catch (err) {
      alert('Failed to submit review: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Status mapping to timeline index
  const statusSteps = [
    { key: 'PENDING', label: 'Pending', desc: 'Booking received, awaiting verification' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Survey details verified, schedule locked' },
    { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Surveyor team conducting field measurements' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Observations processed, maps finalized' }
  ];

  const getActiveStepIndex = (status) => {
    if (status === 'CANCELLED') return -1;
    return statusSteps.findIndex(step => step.key === status);
  };

  const activeIndex = booking ? getActiveStepIndex(booking.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-8 font-sans">
      
      {/* Header and intro */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest font-extrabold px-3 py-1 bg-primary/10 text-primary dark:bg-survey-gold/10 dark:text-survey-gold rounded-full">
          Customer Portal
        </span>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Track Your Land Survey
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-lg mx-auto">
          Enter your Booking ID and registered Mobile Number to track status, download maps/reports, and rate your surveyor.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 md:p-8 rounded-3xl shadow-xl space-y-6 max-w-2xl mx-auto glass relative overflow-hidden">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-650 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                Booking ID
              </label>
              <input
                type="text"
                required
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g. 24"
                id="booking-id-input"
                className="w-full px-4 py-3 rounded-xl border border-slate-250 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-650 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                Registered Phone Number
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9000000000"
                id="phone-number-input"
                className="w-full px-4 py-3 rounded-xl border border-slate-250 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            id="track-search-btn"
            className="w-full py-3.5 bg-primary hover:bg-opacity-90 dark:bg-blue-600 text-white font-extrabold rounded-xl transition shadow-lg flex items-center justify-center space-x-2 text-sm focus:outline-none"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                <span>Searching Records...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Track Survey Status</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-2xl flex items-start space-x-3 text-red-700 dark:text-red-400 text-xs"
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}
      </div>

      {/* Search results display */}
      <AnimatePresence mode="wait">
        {booking && (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Survey summary metadata card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-3xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requester Name</span>
                <p className="font-extrabold text-base text-slate-805 dark:text-zinc-100">{booking.customer_name}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{booking.email}</p>
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Survey Specifications</span>
                <p className="font-extrabold text-base text-slate-805 dark:text-zinc-100">{booking.survey_type}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>Proposed Date: {booking.survey_date}</span>
                </p>
              </div>
              <div className="space-y-1 text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Site Location</span>
                <p className="font-bold text-xs text-slate-805 dark:text-zinc-150 line-clamp-2 leading-relaxed" title={booking.property_location}>
                  {booking.property_location}
                </p>
                {booking.coordinates && (
                  <p className="text-[10px] text-primary dark:text-blue-400 font-mono flex items-center space-x-0.5">
                    <MapPin size={10} />
                    <span>GPS: {booking.coordinates}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Tracking timeline */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 md:p-8 rounded-3xl shadow-md text-center space-y-6">
              <h3 className="font-extrabold text-base flex items-center space-x-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <ClipboardList size={18} className="text-primary dark:text-blue-400" />
                <span>Real-Time Survey Progression Tracking</span>
              </h3>

              {booking.status === 'CANCELLED' ? (
                <div className="py-8 text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
                    <AlertCircle size={24} />
                  </div>
                  <h4 className="font-black text-lg text-slate-900 dark:text-white">Survey Status: CANCELLED</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    This survey reservation has been cancelled by Deccan Digital Surveys. Please contact support at +91 90000 00000 for more information.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 relative">
                  
                  {/* Graphical timeline connector line */}
                  <div className="hidden md:block absolute top-[28px] left-[12.5%] right-[12.5%] h-[2.5px] bg-slate-100 dark:bg-zinc-800 -z-1" />
                  
                  {statusSteps.map((step, idx) => {
                    const isPassed = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                      <div key={step.key} className="space-y-3 relative z-10">
                        {/* Status node */}
                        <div className="flex justify-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-md transition duration-300 ${
                            isCurrent ? 'bg-primary dark:bg-blue-600 text-white ring-4 ring-primary/20 dark:ring-blue-600/20 scale-110' :
                            isPassed ? 'bg-emerald-500 text-white' :
                            'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                          }`}>
                            {isPassed ? (
                              <CheckCircle size={18} />
                            ) : (
                              <Clock size={16} />
                            )}
                          </div>
                        </div>

                        {/* Status description */}
                        <div className="text-center space-y-1">
                          <p className={`font-bold text-sm ${isCurrent ? 'text-primary dark:text-blue-400 font-extrabold' : 'text-slate-800 dark:text-zinc-200'}`}>
                            {step.label}
                          </p>
                          <p className="text-[10px] text-slate-400 leading-normal px-2">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed status - download maps & rate surveyor */}
            {booking.status === 'COMPLETED' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Download PDF section */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-3xl shadow-md space-y-4 text-left flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base flex items-center space-x-2 text-slate-900 dark:text-white">
                      <ShieldCheck size={18} className="text-emerald-500" />
                      <span>Download Final Deliverables</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Your survey reports, tax invoice billing details, and receipt are signed, finalized, and ready for official revenue department filings.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 pt-4">
                    <button
                      onClick={() => handleDownloadPDF('receipt-pdf')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-805/40 dark:hover:bg-zinc-800 text-slate-750 dark:text-zinc-200 rounded-xl transition border border-slate-200/50 dark:border-zinc-800/40 text-xs font-bold"
                    >
                      <span className="flex items-center space-x-2">
                        <Download size={14} className="text-primary dark:text-blue-400" />
                        <span>Acknowledge Receipt</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-200/70 dark:bg-zinc-800 text-slate-500 rounded font-mono">PDF</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPDF('report-pdf')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-805/40 dark:hover:bg-zinc-800 text-slate-750 dark:text-zinc-200 rounded-xl transition border border-slate-200/50 dark:border-zinc-800/40 text-xs font-bold"
                    >
                      <span className="flex items-center space-x-2">
                        <Download size={14} className="text-primary dark:text-blue-400" />
                        <span>Official Survey Report</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-200/70 dark:bg-zinc-800 text-slate-500 rounded font-mono">PDF</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPDF('invoice-pdf')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-805/40 dark:hover:bg-zinc-800 text-slate-750 dark:text-zinc-200 rounded-xl transition border border-slate-200/50 dark:border-zinc-800/40 text-xs font-bold"
                    >
                      <span className="flex items-center space-x-2">
                        <Download size={14} className="text-primary dark:text-blue-400" />
                        <span>Tax Invoice / Bill</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-200/70 dark:bg-zinc-800 text-slate-500 rounded font-mono">PDF</span>
                    </button>
                  </div>
                </div>

                {/* Rating surveyor section */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-3xl shadow-md space-y-4 text-left">
                  {booking.surveyor_name ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-base flex items-center space-x-2 text-slate-900 dark:text-white">
                          <Sparkles size={16} className="text-survey-gold" />
                          <span>Rate Assigned Surveyor</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Please take a moment to provide feedback for your field surveyor. Your response will be published to our testimonials directory.
                        </p>
                      </div>

                      {/* Surveyor details card */}
                      <div className="p-3 bg-slate-50 dark:bg-zinc-805/30 border border-slate-250/50 dark:border-zinc-800/40 rounded-2xl flex items-center space-x-3 text-xs">
                        <div className="h-9 w-9 rounded-full bg-primary/10 dark:bg-blue-600/10 text-primary dark:text-blue-400 flex items-center justify-center font-bold text-sm uppercase">
                          {booking.surveyor_name.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-800 dark:text-zinc-150">{booking.surveyor_name}</p>
                          <p className="text-[10px] text-slate-450 dark:text-zinc-400">{booking.surveyor_role || 'Field Engineer'}</p>
                        </div>
                      </div>

                      {/* Review form */}
                      {reviewSuccess ? (
                        <motion.div 
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/50 dark:border-emerald-900/30 rounded-2xl text-center space-y-2 text-emerald-800 dark:text-emerald-400"
                        >
                          <CheckCircle size={24} className="mx-auto" />
                          <h4 className="font-bold text-xs">Feedback Submitted Successfully!</h4>
                          <p className="text-[10px] opacity-80 leading-normal">
                            Thank you for your review. Your response helps us maintain DGPS land surveying quality standards.
                          </p>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleReviewSubmit} className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Your Name</label>
                            <input
                              type="text"
                              required
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                            />
                          </div>

                          {/* Star Selector */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Rating</label>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const active = (hoverRating || rating) >= star;
                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform active:scale-90"
                                  >
                                    <Star 
                                      size={20} 
                                      className={`${
                                        active 
                                          ? 'fill-survey-gold text-survey-gold' 
                                          : 'text-slate-300 dark:text-zinc-700'
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Review Comments</label>
                            <textarea
                              required
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                              placeholder="Describe your DGPS site boundary survey experience..."
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                              rows={3.5}
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5"
                          >
                            {submittingReview ? (
                              <Loader size={12} className="animate-spin" />
                            ) : (
                              <span>Submit Rating & Review</span>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      No surveyor was assigned to this booking. Rating surveyor is disabled.
                    </div>
                  )}
                </div>

              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
