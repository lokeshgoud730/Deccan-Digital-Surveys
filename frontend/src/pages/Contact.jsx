import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { logVisitor } from '../api';
import { Phone, MapPin, Compass, MessageSquare, Check, ArrowRight, Loader, Mail } from 'lucide-react';

export default function Contact() {
  // Enquiry form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // Statuses
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Log visitor hit
    logVisitor('Contact');
  }, []);

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFormLoading(true);

    try {
      await api.post('/enquiry/', { name, phone, email, message });
      setSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to submit enquiry. Ensure your fields are correct.');
    } finally {
      setFormLoading(false);
    }
  };

  const surveyors = [
    { name: "Bharath", role: "Survey Consultant", phone: "7842475424", wa: "917842475424" },
    { name: "B. Venu", role: "Field Specialist", phone: "7893393144", wa: "917893393144" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50 font-sans"
        >
          Contact Our Team
        </motion.h1>
        <div className="h-1.5 w-24 bg-survey-gold mx-auto rounded-full" />
        <p className="text-slate-500 dark:text-zinc-400">
          Get in touch with Deccan Digital Surveys for immediate quotations, site visits, or layout approval consultation.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start text-left">
        
        {/* Left Column: Contact details + Branch Locations */}
        <div className="space-y-8">
          
          {/* Surveyors info cards */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 font-sans border-b border-slate-200 dark:border-zinc-800 pb-2">
              Our Surveyors
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {surveyors.map((sur, idx) => (
                <div key={idx} className="p-5 glass border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm space-y-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-zinc-50">{sur.name}</h3>
                    <p className="text-xs text-survey-gold font-bold uppercase tracking-wider">{sur.role}</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/50 text-sm">
                    {/* Call now button */}
                    <a 
                      href={`tel:+91${sur.phone}`}
                      className="flex items-center space-x-2 text-slate-600 dark:text-zinc-300 hover:text-primary dark:hover:text-survey-gold font-semibold transition"
                    >
                      <Phone size={14} className="text-primary dark:text-survey-gold" />
                      <span>+91 {sur.phone}</span>
                    </a>
                    {/* WhatsApp now link */}
                    <a 
                      href={`https://wa.me/${sur.wa}?text=Hi%20${sur.name},%20I%20need%20information%20about%20a%20survey.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-slate-600 dark:text-zinc-300 hover:text-emerald-500 font-semibold transition"
                    >
                      <MessageSquare size={14} className="text-emerald-500" />
                      <span>WhatsApp Chat</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch Offices & Regional coverage */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 font-sans border-b border-slate-200 dark:border-zinc-800 pb-2">
              Regional Branch Offices
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-zinc-300">
              <div className="flex items-start space-x-3 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200/50 dark:border-zinc-800/20">
                <MapPin size={18} className="text-survey-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-100">Siddipet Branch</p>
                  <p className="text-xs text-slate-400 mt-0.5">Beside Collectorate Office, Siddipet, Telangana 502103</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200/50 dark:border-zinc-800/20">
                <MapPin size={18} className="text-survey-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-100">Jangaon Branch</p>
                  <p className="text-xs text-slate-400 mt-0.5">Court Road, Near Bus Stand, Jangaon, Telangana 506167</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 p-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
              <Compass size={16} className="text-survey-gold animate-spin-slow shrink-0" />
              <span>Providing Professional Surveying Services Nationwide Across India.</span>
            </div>
          </div>

        </div>

        {/* Right Column: Inquiry Message Form */}
        <div className="space-y-6">
          <div className="p-8 glass border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-md space-y-6 relative overflow-hidden">
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 font-sans">
              Send Online Enquiry
            </h2>
            
            <AnimatePresence mode="wait">
              {!success ? (
                <form onSubmit={handleEnquiry} className="space-y-4 text-sm relative z-10">
                  
                  {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter name"
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 7842475424"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="optional"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Enquiry Details</label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your questions, requirements, or parcel dimensions here..."
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      rows={4}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white dark:bg-survey-gold dark:text-slate-950 dark:hover:bg-amber-500 font-bold rounded-xl transition shadow flex items-center justify-center space-x-1.5"
                  >
                    {formLoading ? <Loader className="animate-spin" size={16} /> : <span>Send Enquiry</span>}
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center space-y-4"
                >
                  <div className="inline-flex p-2 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                    <Check size={28} />
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-zinc-50">Enquiry Received</h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    Thank you. We have received your inquiry. A surveyor will get in touch with you shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-xs text-primary dark:text-survey-gold font-bold underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>

      {/* Styled Interactive Maps Section (Corporate Mock) */}
      <section className="glass rounded-3xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-lg text-center p-8 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 font-sans">
          Serving All Districts in Telangana, Andhra Pradesh & Adjoining States
        </h2>
        <div className="h-[300px] w-full rounded-2xl overflow-hidden bg-slate-900 relative border border-slate-200/50 dark:border-zinc-800">
          {/* Iframe with beautiful styled maps */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.2858169123846!2d78.4722247!3d17.4364426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9a0d24c08479%3A0xe1005a7698501ab6!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) grayscale(30%)" }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps Location Deccan Digital Surveys"
          />
        </div>
      </section>

    </div>
  );
}
