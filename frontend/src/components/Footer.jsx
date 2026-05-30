import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Compass, Landmark } from 'lucide-react';
import logo from '../assets/logo.svg';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-zinc-950 border-t border-slate-800 dark:border-zinc-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="h-10 w-10 bg-slate-800 rounded-full p-1" />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-wider text-white uppercase leading-none font-sans">
                  Deccan Digital
                </span>
                <span className="text-xs text-survey-gold font-semibold tracking-widest font-sans uppercase">
                  Surveys
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Leading precision land surveying company providing DGPS, layout planning, mapping, and road survey services across India.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Compass size={14} className="text-survey-gold animate-spin-slow" />
              <span>Precision is Our Priority</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-survey-gold pl-2">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-survey-gold transition">About Us</Link></li>
              <li><Link to="/services" className="hover:text-survey-gold transition">Our Services</Link></li>
              <li><Link to="/gallery" className="hover:text-survey-gold transition">Project Gallery</Link></li>
              <li><Link to="/experience" className="hover:text-survey-gold transition">Experience & Milestones</Link></li>
              <li><Link to="/book-survey" className="hover:text-survey-gold transition font-medium text-survey-gold">Book a Surveyor</Link></li>
            </ul>
          </div>

          {/* Branch Offices & Coverage */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-survey-gold pl-2">
              Branch Offices
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="text-survey-gold mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Siddipet Branch</p>
                  <p className="text-xs text-slate-400">Telangana, India</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="text-survey-gold mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Jangaon Branch</p>
                  <p className="text-xs text-slate-400">Telangana, India</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2 text-xs text-slate-400 border-t border-slate-800">
                <Landmark size={14} className="text-survey-gold shrink-0" />
                <span>Serving Nationwide Across India</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-survey-gold pl-2">
              Contact Surveyors
            </h3>
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <p className="font-semibold text-slate-200">Bharath (Surveyor)</p>
                <a href="tel:+917842475424" className="flex items-center space-x-2 text-slate-400 hover:text-survey-gold transition">
                  <Phone size={14} />
                  <span>+91 7842475424</span>
                </a>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-200">B. Venu (Surveyor)</p>
                <a href="tel:+917893393144" className="flex items-center space-x-2 text-slate-400 hover:text-survey-gold transition">
                  <Phone size={14} />
                  <span>+91 7893393144</span>
                </a>
              </div>
              <div className="pt-2">
                <Link to="/login" className="text-xs text-slate-500 hover:text-slate-400 underline">
                  Admin Login
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center">
          <p>&copy; {currentYear} Deccan Digital Surveys. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built with React, Tailwind & Django REST</p>
        </div>
      </div>
    </footer>
  );
}
