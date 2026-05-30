import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { Calendar, User, Phone, Mail, MapPin, AlignLeft, Info, CheckCircle2, ChevronRight, Loader } from 'lucide-react';

export default function BookSurvey() {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  
  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [surveyType, setSurveyType] = useState('Land Survey');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [surveyDate, setSurveyDate] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Statuses
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Log visitor hit
    api.post('/log-visitor/', { page: 'Book Survey' }).catch(() => {});

    // Fetch services to populate dropdown
    api.get('/services/')
      .then((res) => {
        setServices(res.data);
        // Pre-select service from URL param if exists
        const preSelect = searchParams.get('type');
        if (preSelect) {
          setSurveyType(preSelect);
        } else if (res.data.length > 0) {
          setSurveyType(res.data[0].title);
        }
      })
      .catch((err) => {
        console.error('Error fetching services list:', err);
      });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFormLoading(true);

    const payload = {
      customer_name: customerName,
      mobile_number: mobileNumber,
      email: email,
      survey_type: surveyType,
      property_location: propertyLocation,
      survey_date: surveyDate,
      additional_notes: additionalNotes,
    };

    try {
      await api.post('/bookings/', payload);
      setSuccess(true);
      // Reset form fields
      setCustomerName('');
      setMobileNumber('');
      setEmail('');
      setPropertyLocation('');
      setSurveyDate('');
      setAdditionalNotes('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Something went wrong. Please check your inputs and try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      
      {/* Page Title */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50 font-sans"
        >
          Book a Survey
        </motion.h1>
        <div className="h-1.5 w-24 bg-survey-gold mx-auto rounded-full" />
        <p className="text-slate-500 dark:text-zinc-400">
          Request precision boundary plotting, layout stakings, or elevation drawings. Our surveyor team will reach out within 24 hours.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 text-left max-w-5xl mx-auto items-start">
        
        {/* Left Column: Form Info / Side Banner (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 glass border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-zinc-50 font-sans">
              Survey Booking Info
            </h3>
            
            <div className="space-y-4 text-sm text-slate-600 dark:text-zinc-300">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 dark:bg-survey-gold/10 text-primary dark:text-survey-gold rounded-lg mt-0.5">
                  <Info size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-100">Step 1: Booking Request</p>
                  <p className="text-xs text-slate-400 mt-0.5">Fill out your contact coordinate specifics and selected survey type.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 dark:bg-survey-gold/10 text-primary dark:text-survey-gold rounded-lg mt-0.5">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-100">Step 2: Date Scheduling</p>
                  <p className="text-xs text-slate-400 mt-0.5">Provide a tentative date. Our surveyors will check equipment loads and call to confirm timings.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 dark:bg-survey-gold/10 text-primary dark:text-survey-gold rounded-lg mt-0.5">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-100">Step 3: Precision Deployment</p>
                  <p className="text-xs text-slate-400 mt-0.5">We set up DGPS base stations locally on your field and plot out points with millimeter accuracy.</p>
                </div>
              </div>
            </div>

            {/* Quick Contact links */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 text-xs space-y-2 text-slate-400">
              <p className="font-semibold text-slate-600 dark:text-zinc-300">Need Immediate Help?</p>
              <p>Call Surveyor Bharath: <a href="tel:+917842475424" className="text-primary dark:text-survey-gold hover:underline font-bold">+91 7842475424</a></p>
              <p>Call Surveyor Venu: <a href="tel:+917893393144" className="text-primary dark:text-survey-gold hover:underline font-bold">+91 7893393144</a></p>
            </div>

          </div>
        </div>

        {/* Right Column: Form Block (3 Columns) */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass border border-slate-200 dark:border-zinc-800 p-8 rounded-2xl shadow-md space-y-6"
              >
                <h3 className="font-extrabold text-2xl text-slate-900 dark:text-zinc-50 font-sans">
                  Schedule Survey Form
                </h3>
                
                {errorMsg && (
                  <div className="p-3.5 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-lg text-sm">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                  {/* Name field */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Customer Name</label>
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
                        className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                          <Phone size={16} />
                        </span>
                        <input
                          type="tel"
                          required
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="e.g. 7842475424"
                          className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Email Address</label>
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
                          className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Survey Type & Date Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Survey Type</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          list="survey-options"
                          value={surveyType}
                          onChange={(e) => setSurveyType(e.target.value)}
                          placeholder="Land Survey"
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <datalist id="survey-options">
                          <option value="Land Survey" />
                          <option value="Layout Survey" />
                          <option value="Tippon Survey" />
                          <option value="Canal Survey" />
                          <option value="Municipal Survey" />
                          <option value="Municipal Plans" />
                          <option value="Gram Panchayat Plans" />
                          <option value="Earth Work Quantities" />
                          <option value="Pipeline Survey" />
                          <option value="Grid and Contour Survey" />
                          <option value="Road and Rail Survey" />
                          <option value="Venture Developments" />
                        </datalist>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Preferred Date</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                          <Calendar size={16} />
                        </span>
                        <input
                          type="date"
                          required
                          value={surveyDate}
                          onChange={(e) => setSurveyDate(e.target.value)}
                          className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location field */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Property Location</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 pt-2.5 flex items-start text-slate-400">
                        <MapPin size={16} />
                      </span>
                      <textarea
                        required
                        value={propertyLocation}
                        onChange={(e) => setPropertyLocation(e.target.value)}
                        placeholder="Provide details e.g. Survey No, Village, Mandal, District"
                        className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={2.5}
                      />
                    </div>
                  </div>

                  {/* Notes field */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Additional Notes</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 pt-2.5 flex items-start text-slate-400">
                        <AlignLeft size={16} />
                      </span>
                      <textarea
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Provide terrain info, parcel sizes, or target approval authorities (e.g. HMDA)."
                        className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={2.5}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white dark:bg-survey-gold dark:text-slate-950 dark:hover:bg-amber-500 font-bold rounded-xl transition shadow flex items-center justify-center space-x-1.5"
                  >
                    {formLoading ? <Loader className="animate-spin" size={16} /> : <span>Submit Request</span>}
                  </button>
                </form>

              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass border border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/10 p-8 rounded-2xl shadow-lg text-center space-y-6"
              >
                <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-2xl text-slate-900 dark:text-zinc-50">
                    Booking Successful!
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">
                    Thank you. Your request was successfully logged in the Deccan database. A confirmation email has been triggered, and our surveyors will call you shortly on the mobile number provided.
                  </p>
                </div>
                
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 bg-primary dark:bg-survey-gold text-white dark:text-slate-950 font-semibold rounded-lg hover:opacity-90 transition text-sm"
                >
                  Book Another Survey
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
