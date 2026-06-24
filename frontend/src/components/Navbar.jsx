import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Sun, Moon, Briefcase, FileCheck } from 'lucide-react';
import logo from '../assets/logo.svg';

export default function Navbar() {
  const { darkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Experience', path: '/experience' },
    { name: 'Book Survey', path: '/book-survey' },
    { name: 'Track Survey', path: '/track' },
    { name: 'Contact', path: '/contact' },

  ];

  const isActive = (path) => location.pathname === path;
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-300 glass shadow-md dark:shadow-zinc-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={logo} alt="Deccan Digital Surveys" className="h-10 w-10 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wider text-primary dark:text-zinc-50 uppercase leading-tight font-sans">
                Deccan Digital
              </span>
              <span className="text-xs text-survey-gold font-semibold tracking-widest font-sans uppercase">
                Surveys
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-primary dark:text-survey-gold font-bold'
                    : 'text-slate-600 hover:text-primary dark:text-zinc-300 dark:hover:text-survey-gold'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-survey-gold rounded-full" />
                )}
              </Link>
            ))}

            {/* Quick dashboard shortcut if logged in */}
            {localStorage.getItem('is_admin') === 'true' && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                <Briefcase size={12} />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={20} className="text-survey-gold" /> : <Moon size={20} className="text-primary" />}
            </button>
          </div>

          {/* Mobile menu and toggles */}
          <div className="flex items-center md:hidden space-x-2">
            {/* Theme Toggle for mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={18} className="text-survey-gold" /> : <Moon size={18} className="text-primary" />}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Links Overlay */}
      {isOpen && (
        <div className="md:hidden glass px-2 pt-2 pb-4 space-y-1 shadow-lg border-t border-slate-200/50 dark:border-zinc-800/50">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-primary/10 text-primary dark:bg-survey-gold/10 dark:text-survey-gold font-bold'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {localStorage.getItem('is_admin') === 'true' && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium bg-emerald-600/10 text-emerald-600 dark:text-emerald-400"
            >
              <Briefcase size={16} />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
