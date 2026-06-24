import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Compass, Cpu, FileText, Lock, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if onboarding was already shown
    const hasSeenTour = localStorage.getItem('dds_onboarding_seen');
    if (!hasSeenTour) {
      // Show onboarding tour automatically for new visitors after 1.5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('dds_onboarding_seen', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const steps = [
    {
      title: "Welcome to Deccan Digital Surveys",
      description: "Explore our new AI-powered Surveying & Booking platform. Designed to offer maximum accuracy, efficiency, and flexibility.",
      icon: <Compass className="text-blue-500 w-12 h-12" />,
      highlight: "AI-Powered Survey Platform"
    },
    {
      title: "AI-Powered Survey Planner",
      description: "Answer basic questions about your land, receive real-time bilingual (English/Telugu) AI suggestions, pinpoint coordinates on a map, and upload deeds to request quotes instantly.",
      icon: <Cpu className="text-emerald-500 w-12 h-12" />,
      highlight: "Interactive 5-step Planner"
    },
    {
      title: "Track & Download PDF Deliverables",
      description: "No signup required for visitors! Simply input your phone number on our tracking page to download official Booking Receipts, Technical Reports, and Tax Invoices.",
      icon: <FileText className="text-amber-500 w-12 h-12" />,
      highlight: "On-the-fly PDF Generation"
    },
    {
      title: "Secure Admin & CMS Dashboard",
      description: "Only administrators require authentication. Through HttpOnly cookie-based JWT protection, admins manage CMS copy text, assign field surveyors, verify coordinates, and review dashboard analytics.",
      icon: <Lock className="text-indigo-500 w-12 h-12" />,
      highlight: "HttpOnly JWT Protection"
    }
  ];

  if (!isOpen) {
    // Return a floating help button to restart the tour anytime
    return (
      <button
        onClick={() => {
          setCurrentStep(0);
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group flex items-center space-x-2"
        title="Start Platform Tour"
      >
        <Sparkles className="text-primary dark:text-blue-400 w-5 h-5 animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-bold text-slate-700 dark:text-zinc-200 whitespace-nowrap">
          Explore Features
        </span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden"
        >
          {/* Top colored bar */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="p-8 space-y-6 text-center">
            {/* Step Icon */}
            <motion.div
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex justify-center"
            >
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl">
                {steps[currentStep].icon}
              </div>
            </motion.div>

            {/* Step Content */}
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-primary/10 dark:bg-blue-400/10 text-primary dark:text-blue-400 text-[10px] font-bold tracking-widest uppercase rounded-full">
                {steps[currentStep].highlight}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-zinc-50 leading-snug">
                {steps[currentStep].title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Step Progress Dots */}
            <div className="flex justify-center space-x-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-primary dark:bg-blue-400' : 'w-1.5 bg-slate-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800/60">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                  currentStep === 0
                    ? 'text-slate-300 dark:text-zinc-700 cursor-not-allowed'
                    : 'text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                onClick={handleClose}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                Skip Tour
              </button>

              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-100 dark:text-slate-900 text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <span>{currentStep === steps.length - 1 ? "Finish" : "Next"}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
