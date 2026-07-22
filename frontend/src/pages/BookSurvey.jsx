import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { 
  User, Phone, MapPin, Layers, Loader, CheckCircle2, 
  ArrowRight, Landmark, FileText, Calendar 
} from 'lucide-react';

export default function BookSurvey() {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [acres, setAcres] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');

  // Statuses
  const [formLoading, setFormLoading] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    const parsedAcres = parseFloat(acres);
    if (isNaN(parsedAcres) || parsedAcres <= 0) {
      setErrorMsg('Please enter a valid positive number for Acres to Survey.');
      return;
    }

    setFormLoading(true);

    const bookingData = {
      customer_name: customerName,
      mobile_number: mobileNumber,
      acres: parsedAcres,
      village: village,
      district: district
    };

    try {
      const res = await api.post('/bookings/', bookingData);
      setCreatedBooking(res.data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit booking. Please review your input fields.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-8 bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
      
      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50 tracking-tight leading-none uppercase">
          Book a Survey
        </h1>
        <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        <p className="text-slate-500 dark:text-zinc-400 text-sm max-w-lg mx-auto">
          Provide your land details below to schedule a professional land survey. Our engineers will verify coordinates and follow up to schedule.
        </p>
      </section>

      <div className="max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 sm:p-10 rounded-2xl shadow-xl text-left space-y-6"
            >
              <div className="flex items-center space-x-2 text-primary dark:text-blue-400">
                <Layers size={20} className="text-primary dark:text-blue-400" />
                <h2 className="font-extrabold text-xl">Confirm Survey Booking</h2>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-lg text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-5 text-sm">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 dark:text-zinc-300">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Lokesh Goud"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 dark:text-zinc-300">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500">
                      <Phone size={18} />
                    </span>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. +91 90000 00000"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Acres to Survey */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 dark:text-zinc-300">Acres to Survey</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500">
                      <Layers size={18} />
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={acres}
                      onChange={(e) => setAcres(e.target.value)}
                      placeholder="e.g. 5"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Village */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 dark:text-zinc-300">Village</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500">
                      <Landmark size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Mulugu"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* District */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 dark:text-zinc-300">District</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-zinc-500">
                      <MapPin size={18} />
                    </span>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Siddipet"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-zinc-700 rounded-xl bg-slate-50 dark:bg-zinc-800 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-4 mt-6 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl transition shadow-lg flex items-center justify-center space-x-2 text-base active:scale-[0.98]"
                >
                  {formLoading ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      <span>Recording Booking...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Survey Booking</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="booking-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-zinc-900 border border-emerald-500/20 p-8 rounded-2xl shadow-xl text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center p-4 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                <CheckCircle2 size={48} className="animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-2xl text-slate-900 dark:text-zinc-50 font-sans tracking-tight">
                  Survey Booking Confirmed!
                </h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                  Thank you. Your land survey booking is verified and saved. Our representative will contact you on <span className="font-bold text-slate-800 dark:text-white">{createdBooking?.mobile_number}</span> shortly.
                </p>
              </div>

              {/* Summary details card */}
              <div className="bg-slate-50 dark:bg-zinc-950 p-6 rounded-xl border border-slate-200/50 dark:border-zinc-850 text-left text-xs space-y-3.5">
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-zinc-800/40 pb-2">
                  <span className="text-slate-400 font-semibold uppercase">Booking Ref ID:</span>
                  <span className="font-mono text-sm font-black text-primary dark:text-blue-400">DDS-{createdBooking?.id}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 uppercase text-[9px] font-bold">Client Name:</span>
                    <p className="font-extrabold text-slate-800 dark:text-zinc-200 text-xs">{createdBooking?.customer_name}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 uppercase text-[9px] font-bold">Acres:</span>
                    <p className="font-extrabold text-slate-800 dark:text-zinc-200 text-xs">{createdBooking?.acres} Acres</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-slate-200/50 dark:border-zinc-800/40">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 uppercase text-[9px] font-bold">Village:</span>
                    <p className="font-extrabold text-slate-800 dark:text-zinc-200 text-xs">{createdBooking?.village}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 uppercase text-[9px] font-bold">District:</span>
                    <p className="font-extrabold text-slate-800 dark:text-zinc-200 text-xs">{createdBooking?.district}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center text-sm">
                <Link
                  to={`/track?id=${createdBooking?.id}&phone=${encodeURIComponent(createdBooking?.mobile_number)}`}
                  className="px-5 py-3 bg-primary dark:bg-blue-600 text-white font-semibold rounded-xl hover:opacity-95 shadow transition text-center flex-grow"
                >
                  Track Survey Status
                </Link>
                
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setCustomerName('');
                    setMobileNumber('');
                    setAcres('');
                    setVillage('');
                    setDistrict('');
                    setCreatedBooking(null);
                  }}
                  className="px-5 py-3 border border-slate-300 dark:border-zinc-800 text-slate-650 dark:text-zinc-400 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
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
