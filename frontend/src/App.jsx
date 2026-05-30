import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Experience from './pages/Experience';
import BookSurvey from './pages/BookSurvey';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50">
          {/* Header Navbar */}
          <Navbar />

          {/* Main Workspace content */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/book-survey" element={<BookSurvey />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Dashboard Protected Route */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>

          {/* Floating WhatsApp Action Button */}
          <WhatsAppButton />

          {/* Footer Information */}
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}
