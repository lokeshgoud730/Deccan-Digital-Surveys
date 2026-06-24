import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { 
  Calendar, Check, X, Trash2, Mail, Users, Image as ImageIcon, 
  Settings, LogOut, Search, FileText, BarChart2, Plus, Info, Edit, 
  Loader, Eye, Download, CheckCircle, HelpCircle, Star, Layers, Clipboard, ShieldAlert 
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Stats counters
  const [stats, setStats] = useState({
    total_bookings: 0,
    today_bookings: 0,
    pending_surveys: 0,
    completed_surveys: 0,
    cancelled_surveys: 0,
    total_visitors: 0,
    total_services: 0,
    total_gallery_images: 0,
  });
  
  // Data lists
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  
  // CMS Website settings state
  const [websiteSettings, setWebsiteSettings] = useState({
    id: 1,
    hero_title: "",
    hero_subtitle: "",
    hero_primary_btn: "",
    hero_secondary_btn: "",
    about_description: "",
    about_mission: "",
    about_vision: "",
    stat_experience_years: 8,
    stat_projects_completed: "",
    stat_clients_served: ""
  });

  // Services Edit CRUD state
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '', slug: '', description: '', detail_text: '',
    process: '', benefits: '', equipment: '', technical_specifications: '',
    equipment_details: ''
  });
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [servicePhotos, setServicePhotos] = useState([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [deletePrimaryImage, setDeletePrimaryImage] = useState(false);


  // Gallery Edit CRUD state
  const [showAddGalleryForm, setShowAddGalleryForm] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '', description: '', category: 'General'
  });
  const [galleryImageFile, setGalleryImageFile] = useState(null);

  // Team Edit CRUD state
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: '', role: '', bio: ''
  });
  const [teamImageFile, setTeamImageFile] = useState(null);

  // Testimonials Edit CRUD state
  const [showAddTestimonialForm, setShowAddTestimonialForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    client_name: '', role: '', review_text: '', rating: 5
  });
  const [testimonialImageFile, setTestimonialImageFile] = useState(null);

  // Selected booking modal state
  const [viewingBooking, setViewingBooking] = useState(null);
  
  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Loadings
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    // Log visitor hit
    api.post('/log-visitor/', { page: 'Admin Dashboard' }).catch(() => {});
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/dashboard-overview/');
      setStats(statsRes.data);

      const bookingsRes = await api.get('/bookings/');
      setBookings(bookingsRes.data);

      const enquiriesRes = await api.get('/enquiry/');
      setEnquiries(enquiriesRes.data);

      const servicesRes = await api.get('/services/');
      setServices(servicesRes.data);

      const settingsRes = await api.get('/settings/');
      if (settingsRes.data && settingsRes.data.length > 0) {
        setWebsiteSettings(settingsRes.data[0]);
      }

      const galleryRes = await api.get('/gallery/');
      setGallery(galleryRes.data);

      const teamRes = await api.get('/team/');
      setTeam(teamRes.data);

      const testimonialsRes = await api.get('/testimonials/');
      setTestimonials(testimonialsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/token/logout/');
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('is_admin');
    localStorage.removeItem('admin_username');
    navigate('/login');
  };

  // Booking updates
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      const bToUpdate = bookings.find(b => b.id === id);
      const res = await api.put(`/bookings/${id}/`, { ...bToUpdate, status });
      setBookings(bookings.map(b => b.id === id ? res.data : b));
      if (viewingBooking && viewingBooking.id === id) {
        setViewingBooking(res.data);
      }
      
      // Refresh stats
      const statsRes = await api.get('/dashboard-overview/');
      setStats(statsRes.data);
    } catch (err) {
      alert('Error updating booking status: ' + err.message);
    }
  };

  const handleUpdateBookingSurveyor = async (id, surveyorId) => {
    try {
      const bToUpdate = bookings.find(b => b.id === id);
      const res = await api.put(`/bookings/${id}/`, { ...bToUpdate, assigned_surveyor: surveyorId ? parseInt(surveyorId) : null });
      setBookings(bookings.map(b => b.id === id ? res.data : b));
      if (viewingBooking && viewingBooking.id === id) {
        setViewingBooking(res.data);
      }
      alert('Surveyor successfully assigned!');
    } catch (err) {
      alert('Error assigning surveyor: ' + err.message);
    }
  };

  const handleFastCompleteBooking = async (booking) => {
    if (!booking.assigned_surveyor) {
      alert("Please assign a surveyor first before marking this survey as COMPLETED.");
      setViewingBooking(booking);
      return;
    }
    if (!window.confirm(`Mark survey for ${booking.customer_name} as COMPLETED?`)) return;
    await handleUpdateBookingStatus(booking.id, 'COMPLETED');
    alert("Survey successfully marked as COMPLETED!");
  };


  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this booking?")) return;
    try {
      await api.delete(`/bookings/${id}/`);
      setBookings(bookings.filter(b => b.id !== id));
      if (viewingBooking && viewingBooking.id === id) {
        setViewingBooking(null);
      }
      // Refresh stats
      const statsRes = await api.get('/dashboard-overview/');
      setStats(statsRes.data);
    } catch (err) {
      alert('Error deleting booking: ' + err.message);
    }
  };

  // Enquiry deletion
  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer enquiry?")) return;
    try {
      await api.delete(`/enquiry/${id}/`);
      setEnquiries(enquiries.filter(e => e.id !== id));
    } catch (err) {
      alert('Error deleting enquiry: ' + err.message);
    }
  };

  // Save Website CMS settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await api.put(`/settings/${websiteSettings.id}/`, websiteSettings);
      setWebsiteSettings(res.data);
      alert('Website CMS Settings successfully updated!');
    } catch (err) {
      alert('Failed to save website settings: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // CRUD Services
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceForm({
      title: '', slug: '', description: '', detail_text: '',
      process: '', benefits: '', equipment: '', technical_specifications: '',
      equipment_details: ''
    });
    setServicePhotos([]);
    setServiceImageFile(null);
    setDeletePrimaryImage(false);
    setShowAddServiceForm(true);
  };

  const handleOpenEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      slug: service.slug,
      description: service.description,
      detail_text: service.detail_text,
      process: service.process,
      benefits: service.benefits,
      equipment: service.equipment,
      technical_specifications: service.technical_specifications || '',
      equipment_details: service.equipment_details || ''
    });
    
    let photos = [];
    if (service.sample_photos_json) {
      try {
        photos = JSON.parse(service.sample_photos_json);
      } catch (e) {
        console.error("Error parsing sample photos:", e);
      }
    }
    setServicePhotos(photos);
    setServiceImageFile(null);
    setDeletePrimaryImage(false);
    setShowAddServiceForm(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    const formData = new FormData();
    Object.keys(serviceForm).forEach(key => {
      formData.append(key, serviceForm[key]);
    });
    formData.append('sample_photos_json', JSON.stringify(servicePhotos));
    if (serviceImageFile) {
      formData.append('image', serviceImageFile);
    } else if (deletePrimaryImage) {
      formData.append('image', '');
    }

    try {
      if (editingService) {
        await api.put(`/services/${editingService.slug}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Service successfully updated!');
      } else {
        await api.post(`/services/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('New Service successfully created!');
      }
      setShowAddServiceForm(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to save service: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteService = async (slug) => {
    if (!window.confirm("Are you sure you want to permanently delete this service?")) return;
    try {
      await api.delete(`/services/${slug}/`);
      setServices(services.filter(s => s.slug !== slug));
    } catch (err) {
      alert('Error deleting service: ' + err.message);
    }
  };

  // CRUD Gallery
  const handleOpenAddGallery = () => {
    setEditingGallery(null);
    setGalleryForm({ title: '', description: '', category: 'Land' });
    setGalleryImageFile(null);
    setShowAddGalleryForm(true);
  };

  const handleOpenEditGallery = (item) => {
    setEditingGallery(item);
    setGalleryForm({
      title: item.title,
      description: item.description || '',
      category: item.category || 'Land'
    });
    setGalleryImageFile(null);
    setShowAddGalleryForm(true);
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    const formData = new FormData();
    formData.append('title', galleryForm.title);
    formData.append('description', galleryForm.description);
    formData.append('category', galleryForm.category);
    if (galleryImageFile) {
      formData.append('image', galleryImageFile);
    }

    try {
      if (editingGallery) {
        await api.put(`/gallery/${editingGallery.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Gallery image successfully updated!');
      } else {
        if (!galleryImageFile) {
          alert('Please select an image file to upload.');
          setSaveLoading(false);
          return;
        }
        await api.post(`/gallery/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('New gallery image successfully uploaded!');
      }
      setShowAddGalleryForm(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to save gallery item: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this gallery item?")) return;
    try {
      await api.delete(`/gallery/${id}/`);
      setGallery(gallery.filter(g => g.id !== id));
    } catch (err) {
      alert('Error deleting gallery item: ' + err.message);
    }
  };

  // CRUD Team
  const handleOpenAddTeam = () => {
    setEditingTeam(null);
    setTeamForm({ name: '', role: '', bio: '' });
    setTeamImageFile(null);
    setShowAddTeamForm(true);
  };

  const handleOpenEditTeam = (item) => {
    setEditingTeam(item);
    setTeamForm({
      name: item.name,
      role: item.role,
      bio: item.bio || ''
    });
    setTeamImageFile(null);
    setShowAddTeamForm(true);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    const formData = new FormData();
    formData.append('name', teamForm.name);
    formData.append('role', teamForm.role);
    formData.append('bio', teamForm.bio);
    if (teamImageFile) {
      formData.append('image', teamImageFile);
    }

    try {
      if (editingTeam) {
        await api.put(`/team/${editingTeam.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Team member successfully updated!');
      } else {
        if (!teamImageFile) {
          alert('Please select an image file to upload.');
          setSaveLoading(false);
          return;
        }
        await api.post(`/team/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('New team member successfully created!');
      }
      setShowAddTeamForm(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to save team member: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) return;
    try {
      await api.delete(`/team/${id}/`);
      setTeam(team.filter(t => t.id !== id));
    } catch (err) {
      alert('Error deleting team member: ' + err.message);
    }
  };

  // CRUD Testimonials
  const handleOpenAddTestimonial = () => {
    setEditingTestimonial(null);
    setTestimonialForm({ client_name: '', role: '', review_text: '', rating: 5 });
    setTestimonialImageFile(null);
    setShowAddTestimonialForm(true);
  };

  const handleOpenEditTestimonial = (item) => {
    setEditingTestimonial(item);
    setTestimonialForm({
      client_name: item.client_name,
      role: item.role || '',
      review_text: item.review_text,
      rating: item.rating
    });
    setTestimonialImageFile(null);
    setShowAddTestimonialForm(true);
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    const formData = new FormData();
    formData.append('client_name', testimonialForm.client_name);
    formData.append('role', testimonialForm.role);
    formData.append('review_text', testimonialForm.review_text);
    formData.append('rating', testimonialForm.rating);
    if (testimonialImageFile) {
      formData.append('image', testimonialImageFile);
    }

    try {
      if (editingTestimonial) {
        await api.put(`/testimonials/${editingTestimonial.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Testimonial successfully updated!');
      } else {
        await api.post(`/testimonials/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('New testimonial successfully created!');
      }
      setShowAddTestimonialForm(false);
      loadDashboardData();
    } catch (err) {
      alert('Failed to save testimonial: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await api.delete(`/testimonials/${id}/`);
      setTestimonials(testimonials.filter(t => t.id !== id));
    } catch (err) {
      alert('Error deleting testimonial: ' + err.message);
    }
  };

  // Helper method: fetch and download PDF files securely using authenticated api requests (as blobs)
  const handleDownloadPDF = async (bookingId, reportType) => {
    // reportType: 'receipt-pdf', 'report-pdf', 'invoice-pdf'
    try {
      const response = await api.get(`/bookings/${bookingId}/${reportType}/`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Error downloading PDF report: ' + (err.response?.statusText || err.message));
    }
  };

  // Search & Filter bookings logic
  const filteredBookings = bookings.filter(b => {
    const query = searchQuery.toLowerCase();
    const matchQuery = 
      b.customer_name.toLowerCase().includes(query) ||
      b.mobile_number.includes(query) ||
      b.survey_type.toLowerCase().includes(query);
    
    if (statusFilter === 'All') return matchQuery;
    return matchQuery && b.status === statusFilter;
  });

  // SVG Chart: calculate count of bookings per month for the current year
  const getMonthlyStats = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = Array(12).fill(0);
    
    bookings.forEach(b => {
      if (b.survey_date) {
        const dateObj = new Date(b.survey_date);
        if (dateObj.getFullYear() === 2026 || dateObj.getFullYear() === 2025) { // current years
          counts[dateObj.getMonth()] += 1;
        }
      }
    });

    const maxCount = Math.max(...counts, 4); // baseline divisor
    return months.map((m, idx) => ({
      month: m,
      count: counts[idx],
      height: (counts[idx] / maxCount) * 120 // max height in SVG is 120
    }));
  };

  const chartData = getMonthlyStats();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 text-left text-slate-900 dark:text-zinc-50">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-50 font-sans">
            Admin Dashboard & CMS
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Secure admin mode: <span className="font-bold text-primary dark:text-blue-400">{localStorage.getItem('admin_username') || 'Administrator'}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition self-start sm:self-center text-sm shadow-md"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-455'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'bookings'
              ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-455'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('cms_settings')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'cms_settings'
              ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-455'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          CMS Settings
        </button>
        <button
          onClick={() => setActiveTab('cms_services')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'cms_services'
              ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-455'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          Manage Services ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('cms_gallery')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'cms_gallery'
              ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-455'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          Manage Gallery ({gallery.length})
        </button>
        <button
          onClick={() => setActiveTab('cms_team')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'cms_team'
              ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-455'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          Manage Team ({team.length})
        </button>
        <button
          onClick={() => setActiveTab('cms_testimonials')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'cms_testimonials'
              ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-455'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          Manage Testimonials ({testimonials.length})
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'enquiries'
              ? 'border-primary text-primary dark:border-blue-400 dark:text-blue-455'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          Customer Enquiries ({enquiries.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Booking Analytics boxes */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
                  Booking Database Counters
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <button 
                    onClick={() => { setActiveTab('bookings'); setStatusFilter('All'); }}
                    className="p-5 bg-white dark:bg-zinc-900 border border-slate-200/50 hover:border-primary/50 dark:border-zinc-800/50 dark:hover:border-blue-400/55 rounded-2xl shadow-sm text-center transition hover:shadow cursor-pointer focus:outline-none"
                  >
                    <p className="text-3xl font-black text-slate-900 dark:text-zinc-50">{stats.total_bookings}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Total Bookings</p>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('bookings'); setStatusFilter('All'); }}
                    className="p-5 bg-white dark:bg-zinc-900 border border-slate-200/50 hover:border-primary/50 dark:border-zinc-800/50 dark:hover:border-blue-400/55 rounded-2xl shadow-sm text-center transition hover:shadow cursor-pointer focus:outline-none"
                  >
                    <p className="text-3xl font-black text-blue-605 dark:text-blue-400">{stats.today_bookings}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Today's Bookings</p>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('bookings'); setStatusFilter('PENDING'); }}
                    className="p-5 bg-white dark:bg-zinc-900 border border-slate-200/50 hover:border-primary/50 dark:border-zinc-800/50 dark:hover:border-blue-400/55 rounded-2xl shadow-sm text-center transition hover:shadow cursor-pointer focus:outline-none"
                  >
                    <p className="text-3xl font-black text-amber-500">{stats.pending_surveys}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Pending Surveys</p>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('bookings'); setStatusFilter('COMPLETED'); }}
                    className="p-5 bg-white dark:bg-zinc-900 border border-slate-200/50 hover:border-primary/50 dark:border-zinc-800/50 dark:hover:border-blue-400/55 rounded-2xl shadow-sm text-center transition hover:shadow cursor-pointer focus:outline-none"
                  >
                    <p className="text-3xl font-black text-emerald-600">{stats.completed_surveys}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Completed</p>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('bookings'); setStatusFilter('CANCELLED'); }}
                    className="p-5 bg-white dark:bg-zinc-900 border border-slate-200/50 hover:border-primary/50 dark:border-zinc-800/50 dark:hover:border-blue-400/55 rounded-2xl shadow-sm text-center transition hover:shadow cursor-pointer focus:outline-none col-span-2 lg:col-span-1"
                  >
                    <p className="text-3xl font-black text-red-500">{stats.cancelled_surveys}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Cancelled</p>
                  </button>
                </div>
              </div>

              {/* AI Survey Planner Analytics */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
                  AI Survey Planner Analytics
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm text-center">
                    <p className="text-3xl font-black text-slate-900 dark:text-zinc-50">{stats.total_survey_sessions || 0}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Total Planner Sessions</p>
                  </div>
                  <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm text-center">
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{stats.today_survey_sessions || 0}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Today's Sessions</p>
                  </div>
                  <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm text-center">
                    <p className="text-3xl font-black text-emerald-600">{stats.survey_completion_rate || 0}%</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Completion Rate</p>
                  </div>
                  <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm text-center">
                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.survey_conversion_rate || 0}%</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mt-1">Conversion Rate</p>
                  </div>
                </div>
              </div>

              {/* Chart & Recent Layout grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Monthly Booking SVG Chart */}
                <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base flex items-center space-x-2">
                    <BarChart2 size={18} className="text-primary" />
                    <span>Monthly Booking Analytics</span>
                  </h3>
                  
                  {/* SVG Bar Chart container */}
                  <div className="w-full overflow-x-auto pt-4">
                    <svg viewBox="0 0 540 180" className="w-full min-w-[500px] h-[180px]">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="520" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-zinc-800" />
                      <line x1="40" y1="60" x2="520" y2="60" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-zinc-800" />
                      <line x1="40" y1="100" x2="520" y2="100" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-zinc-800" />
                      <line x1="40" y1="140" x2="520" y2="140" stroke="#94a3b8" strokeWidth="1" className="dark:stroke-zinc-700" />
                      
                      {/* Bars & Labels */}
                      {chartData.map((d, i) => {
                        const barWidth = 24;
                        const gap = 16;
                        const x = 40 + i * (barWidth + gap) + 10;
                        const y = 140 - d.height;
                        
                        return (
                          <g key={d.month} className="group cursor-pointer">
                            <title>{`${d.month}: ${d.count} Bookings`}</title>
                            {/* Bar */}
                            <rect 
                              x={x} 
                              y={y} 
                              width={barWidth} 
                              height={d.height} 
                              rx="3"
                              className="fill-primary dark:fill-blue-400 hover:fill-blue-500 transition-colors duration-200"
                            />
                            {/* Value label on top of bar */}
                            {d.count > 0 && (
                              <text 
                                x={x + barWidth/2} 
                                y={y - 5} 
                                textAnchor="middle" 
                                className="text-[10px] font-bold fill-slate-700 dark:fill-zinc-350"
                              >
                                {d.count}
                              </text>
                            )}
                            {/* Month Label */}
                            <text 
                              x={x + barWidth/2} 
                              y="160" 
                              textAnchor="middle" 
                              className="text-[10px] font-bold fill-slate-400 dark:fill-zinc-500"
                            >
                              {d.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Popular Services rankings list */}
                <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base flex items-center space-x-2">
                    <Layers size={18} className="text-primary" />
                    <span>Popular Services</span>
                  </h3>
                  <div className="space-y-3">
                    {(stats.popular_services || []).map((svc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl text-xs border border-slate-200/50 dark:border-zinc-800/20">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-400">#{idx + 1}</span>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{svc.survey_type || "Unknown"}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary dark:bg-blue-400/10 dark:text-blue-400 font-bold rounded">
                          {svc.count} {svc.count === 1 ? 'booking' : 'bookings'}
                        </span>
                      </div>
                    ))}
                    {(!stats.popular_services || stats.popular_services.length === 0) && (
                      <p className="text-slate-500 text-xs py-8 text-center">No service data available.</p>
                    )}
                  </div>
                </div>

                {/* Quick enquiries log */}
                <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base flex items-center space-x-2">
                    <Mail size={18} className="text-primary" />
                    <span>Recent Customer Enquiries</span>
                  </h3>
                  <div className="space-y-3">
                    {enquiries.slice(0, 3).map((enq) => (
                      <div key={enq.id} className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl text-xs space-y-2 border border-slate-200/50 dark:border-zinc-800/20">
                        <div className="flex justify-between font-bold text-slate-800 dark:text-zinc-200">
                          <span>{enq.name} ({enq.phone})</span>
                          <span className="text-[10px] font-normal text-slate-400 font-mono">
                            {new Date(enq.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-zinc-400 line-clamp-2">{enq.message}</p>
                      </div>
                    ))}
                    {enquiries.length === 0 && (
                      <p className="text-slate-500 text-xs py-8 text-center">No recent messages.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: BOOKINGS LIST DATABASE */}
          {activeTab === 'bookings' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-6">
              
              {/* Search & Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-extrabold text-lg">Manage Booking Records</h3>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status filter dropdown */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-250 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 text-xs focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  {/* Search query box */}
                  <div className="relative text-xs">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, phone, type..."
                      className="pl-8 pr-3 py-2 border border-slate-250 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 font-extrabold uppercase">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Survey Details</th>
                      <th className="py-3 px-4">Proposed Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="border-b border-slate-100 dark:border-zinc-800/40 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                        <td className="py-4 px-4 font-mono font-bold text-slate-400">#{b.id}</td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900 dark:text-zinc-100">{b.customer_name}</p>
                          <p className="text-[10px] text-slate-400">{b.mobile_number} | {b.email}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800 dark:text-zinc-200">{b.survey_type}</p>
                          <p className="text-[10px] text-slate-450 line-clamp-1">{b.property_location}</p>
                        </td>
                        <td className="py-4 px-4 font-mono">{b.survey_date}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400' :
                            b.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400' :
                            b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                            b.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setViewingBooking(b)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-205 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded"
                              title="View details & PDFs"
                            >
                              <Eye size={12} />
                            </button>
                            
                            {b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleFastCompleteBooking(b)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                                title="Quick Complete Survey"
                              >
                                <Check size={12} />
                              </button>
                            )}

                            
                            {/* Fast status modifiers dropdown */}
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                              className="px-1 py-0.5 border border-slate-200 rounded text-[10px] bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>

                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded"
                              title="Delete Record"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No booking database records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: WEBSITE SETTINGS CMS */}
          {activeTab === 'cms_settings' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-extrabold text-lg flex items-center space-x-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <Settings size={18} className="text-primary" />
                <span>Global CMS Website settings</span>
              </h3>
              
              <form onSubmit={handleSaveSettings} className="space-y-5 text-sm max-w-4xl">
                
                {/* Hero CMS block */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-850/50 rounded-xl space-y-4 border border-slate-200/50 dark:border-zinc-800/30">
                  <h4 className="font-extrabold text-xs text-primary uppercase tracking-widest">Hero Section Editor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Hero Title</label>
                      <input
                        type="text"
                        required
                        value={websiteSettings.hero_title}
                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, hero_title: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-305 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Hero Subtitle</label>
                      <input
                        type="text"
                        required
                        value={websiteSettings.hero_subtitle}
                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, hero_subtitle: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-305 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Primary CTA Button</label>
                      <input
                        type="text"
                        required
                        value={websiteSettings.hero_primary_btn}
                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, hero_primary_btn: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-305 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Secondary CTA Button</label>
                      <input
                        type="text"
                        required
                        value={websiteSettings.hero_secondary_btn}
                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, hero_secondary_btn: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-305 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>
                  </div>
                </div>

                {/* About Content CMS block */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-850/50 rounded-xl space-y-4 border border-slate-200/50 dark:border-zinc-800/30">
                  <h4 className="font-extrabold text-xs text-primary uppercase tracking-widest">About Section & Corporate Mission</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Company Description History</label>
                      <textarea
                        required
                        value={websiteSettings.about_description}
                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, about_description: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-305 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Corporate Mission Statement</label>
                        <textarea
                          required
                          value={websiteSettings.about_mission}
                          onChange={(e) => setWebsiteSettings({ ...websiteSettings, about_mission: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-305 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                          rows={2.5}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Corporate Vision Statement</label>
                        <textarea
                          required
                          value={websiteSettings.about_vision}
                          onChange={(e) => setWebsiteSettings({ ...websiteSettings, about_vision: e.target.value })}
                          className="block w-full px-3 py-2 border border-slate-305 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                          rows={2.5}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience stats CMS block */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-850/50 rounded-xl space-y-4 border border-slate-200/50 dark:border-zinc-800/30">
                  <h4 className="font-extrabold text-xs text-primary uppercase tracking-widest">Experience Counters Editor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        required
                        value={websiteSettings.stat_experience_years}
                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, stat_experience_years: parseInt(e.target.value, 10) })}
                        className="block w-full px-3 py-2 border border-slate-305 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Completed Projects (Count Badge)</label>
                      <input
                        type="text"
                        required
                        value={websiteSettings.stat_projects_completed}
                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, stat_projects_completed: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-305 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Clients Served (Count Badge)</label>
                      <input
                        type="text"
                        required
                        value={websiteSettings.stat_clients_served}
                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, stat_clients_served: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-305 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow flex items-center space-x-1.5"
                  >
                    {saveLoading ? <Loader className="animate-spin" size={16} /> : <span>Publish CMS Changes</span>}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 4: CMS SERVICES MANAGER */}
          {activeTab === 'cms_services' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-6">
              
              {!showAddServiceForm ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-lg flex items-center space-x-2">
                      <Layers size={18} className="text-primary" />
                      <span>Manage Services Content</span>
                    </h3>
                    <button
                      onClick={handleOpenAddService}
                      className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Create Service Page</span>
                    </button>
                  </div>

                  {/* Services listing table */}
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 font-extrabold uppercase">
                          <th className="py-2.5 px-4">Title / Slug</th>
                          <th className="py-2.5 px-4">Short Description</th>
                          <th className="py-2.5 px-4">Instruments</th>
                          <th className="py-2.5 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map(s => (
                          <tr key={s.id} className="border-b border-slate-100 dark:border-zinc-800/40 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                            <td className="py-3.5 px-4 font-bold">
                              <p className="text-slate-900 dark:text-zinc-100">{s.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono">slug: {s.slug}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 max-w-[250px] line-clamp-1 mt-2" title={s.description}>
                              {s.description}
                            </td>
                            <td className="py-3.5 px-4 font-medium">{s.equipment}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleOpenEditService(s)}
                                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                  title="Edit service details"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(s.slug)}
                                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded"
                                  title="Delete Service"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Service form editor */}
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {editingService ? `Edit Service: ${editingService.title}` : "Create New Service Page"}
                    </h3>
                    <button
                      onClick={() => setShowAddServiceForm(false)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:opacity-80 rounded-lg text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveService} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Service Title</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                        placeholder="e.g. DGPS Boundary Demarcation"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Service Slug (Automatic)</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.slug}
                        onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                        placeholder="dgps-boundary"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Short Description (for homepage card)</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        placeholder="One-line card summary..."
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Detailed Spec Overview Narrative</label>
                      <textarea
                        required
                        value={serviceForm.detail_text}
                        onChange={(e) => setServiceForm({ ...serviceForm, detail_text: e.target.value })}
                        placeholder="Full technical overview of this service..."
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Survey Process steps (semicolon ; separated)</label>
                      <textarea
                        required
                        value={serviceForm.process}
                        onChange={(e) => setServiceForm({ ...serviceForm, process: e.target.value })}
                        placeholder="Reconnaissance; Benchmark verification; Point staking; Map drafting"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Key Value Benefits (semicolon ; separated)</label>
                      <textarea
                        required
                        value={serviceForm.benefits}
                        onChange={(e) => setServiceForm({ ...serviceForm, benefits: e.target.value })}
                        placeholder="Guarantees legal protection; Prevents encroachments; Conforms to DTCP bylaws"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Summary Instruments (comma separated)</label>
                      <input
                        type="text"
                        required
                        value={serviceForm.equipment}
                        onChange={(e) => setServiceForm({ ...serviceForm, equipment: e.target.value })}
                        placeholder="Trimble DGPS, Leica Total Station"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Service Illustration / Photo</label>
                      {editingService && (editingService.image || editingService.image_url) && !deletePrimaryImage && (
                        <div className="mb-2 relative w-32 h-20 rounded overflow-hidden border border-slate-200 dark:border-zinc-800">
                          <img 
                            src={editingService.image || editingService.image_url} 
                            alt="Current main"
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to remove this service's main illustration?")) {
                                setDeletePrimaryImage(true);
                              }
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-md"
                            title="Delete current main image"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                      {deletePrimaryImage && (
                        <div className="mb-2 text-xs text-amber-500 font-bold flex items-center space-x-1">
                          <span>Primary photo marked for deletion on save.</span>
                          <button
                            type="button"
                            onClick={() => setDeletePrimaryImage(false)}
                            className="text-primary hover:underline font-bold"
                          >
                            Undo
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setServiceImageFile(e.target.files?.[0] || null);
                          if (e.target.files?.[0]) {
                            setDeletePrimaryImage(false);
                          }
                        }}
                        className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-primary dark:file:bg-zinc-800 dark:file:text-white cursor-pointer"
                      />
                    </div>


                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-105 dark:border-zinc-800 pt-4">
                      <div>
                        <h4 className="font-extrabold text-xs text-primary uppercase tracking-widest mb-2">Technical Specifications Details</h4>
                        <textarea
                          value={serviceForm.technical_specifications}
                          onChange={(e) => setServiceForm({ ...serviceForm, technical_specifications: e.target.value })}
                          placeholder="e.g. Accuracy tolerance limits, UTM zone grids..."
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                          rows={3.5}
                        />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-primary uppercase tracking-widest mb-2">Detailed Equipment Specs</h4>
                        <textarea
                          value={serviceForm.equipment_details}
                          onChange={(e) => setServiceForm({ ...serviceForm, equipment_details: e.target.value })}
                          placeholder="e.g. Leica Flexline TS07 Reflectorless, accuracy +/- 1mm..."
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                          rows={3.5}
                        />
                      </div>
                    </div>

                    {/* Sample Photos Manager */}
                    <div className="md:col-span-2 border-t border-slate-200 dark:border-zinc-800 pt-4 space-y-4 text-left">
                      <h4 className="font-extrabold text-xs text-primary uppercase tracking-widest">Manage Service Sample Photos</h4>
                      
                      {/* List of current sample photos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {servicePhotos.map((photo, pIdx) => (
                          <div key={pIdx} className="relative border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-800/20 p-3 space-y-2">
                            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-zinc-900 relative">
                              <img 
                                src={photo.url} 
                                alt={photo.caption || "Sample photo"}
                                className="object-cover w-full h-full"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm("Remove this sample photo?")) {
                                    setServicePhotos(servicePhotos.filter((_, i) => i !== pIdx));
                                  }
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-md"
                                title="Remove photo"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={photo.caption || ''}
                              onChange={(e) => {
                                const newPhotos = [...servicePhotos];
                                newPhotos[pIdx] = { ...newPhotos[pIdx], caption: e.target.value };
                                setServicePhotos(newPhotos);
                              }}
                              placeholder="Photo caption/text..."
                              className="block w-full px-2 py-1 text-xs border border-slate-350 rounded bg-white dark:bg-zinc-800 dark:border-zinc-750 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Add photo controls */}
                      <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200/50 dark:border-zinc-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700 dark:text-zinc-350">Upload New Sample Photo</p>
                          <p className="text-[10px] text-slate-400">Select an image file from your device to upload as a sample photo for this service page.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {photoUploading ? (
                            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-bold">
                              <Loader size={14} className="animate-spin" />
                              <span>Uploading...</span>
                            </div>
                          ) : (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setPhotoUploading(true);
                                const uploadData = new FormData();
                                uploadData.append('file', file);
                                
                                try {
                                  const res = await api.post('/uploads/', uploadData, {
                                    headers: { 'Content-Type': 'multipart/form-data' }
                                  });
                                  setServicePhotos([...servicePhotos, { url: res.data.file, caption: '' }]);
                                } catch (err) {
                                  alert('Upload failed: ' + (err.response?.data?.detail || err.message));
                                } finally {
                                  setPhotoUploading(false);
                                  e.target.value = ''; // clear input
                                }
                              }}
                              className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-primary dark:file:bg-zinc-800 dark:file:text-white cursor-pointer"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowAddServiceForm(false)}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 rounded-lg font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow"
                      >
                        {saveLoading ? <Loader className="animate-spin" size={16} /> : <span>Publish Service CMS</span>}
                      </button>
                    </div>

                  </form>
                </div>
              )}

            </div>
          )}

          {/* TAB: CMS GALLERY MANAGER */}
          {activeTab === 'cms_gallery' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-6">
              {!showAddGalleryForm ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-lg flex items-center space-x-2">
                      <ImageIcon size={18} className="text-primary" />
                      <span>Manage Gallery Content</span>
                    </h3>
                    <button
                      onClick={handleOpenAddGallery}
                      className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Upload Gallery Image</span>
                    </button>
                  </div>

                  {/* Gallery Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gallery.map(item => (
                      <div key={item.id} className="bg-slate-50 dark:bg-zinc-805/40 rounded-2xl border border-slate-200/50 dark:border-zinc-800/20 overflow-hidden shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="h-44 w-full bg-slate-200 dark:bg-zinc-800 overflow-hidden relative">
                            {(item.image || item.image_url) ? (
                              <img 
                                src={item.image || item.image_url} 
                                alt={item.title} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <ImageIcon size={32} />
                              </div>
                            )}
                            <span className="absolute top-3 right-3 text-[10px] bg-slate-900/80 backdrop-blur-sm text-white font-bold px-2 py-0.5 rounded shadow">
                              {item.category || 'General'}
                            </span>
                          </div>
                          <div className="p-4 space-y-2 text-left">
                            <h4 className="font-extrabold text-base text-slate-900 dark:text-zinc-100 line-clamp-1">{item.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">{item.description || 'No description provided.'}</p>
                          </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditGallery(item)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center space-x-1 font-bold"
                            title="Edit details/replace photo"
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGallery(item.id)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs flex items-center space-x-1 font-bold"
                            title="Delete photo"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {gallery.length === 0 && (
                      <div className="col-span-full py-16 text-center text-slate-500">
                        No gallery images found. Upload a new photo above.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {editingGallery ? `Edit Gallery Item: ${editingGallery.title}` : "Upload New Gallery Image"}
                    </h3>
                    <button
                      onClick={() => setShowAddGalleryForm(false)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:opacity-80 rounded-lg text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveGallery} className="space-y-4 text-sm max-w-2xl text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Image Title</label>
                      <input
                        type="text"
                        required
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        placeholder="e.g. Siddipet Site Survey Layout Map"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Category</label>
                      <select
                        value={galleryForm.category}
                        onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      >
                        <option value="Land">Land</option>
                        <option value="Layout">Layout</option>
                        <option value="Road & Rail">Road & Rail</option>
                        <option value="Drone Mapping">Drone Mapping</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Description (Optional)</label>
                      <textarea
                        value={galleryForm.description}
                        onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                        placeholder="Brief notes about the photo..."
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        {editingGallery ? "Replace Photo (Leave blank to keep existing)" : "Select Photo File"}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setGalleryImageFile(e.target.files[0])}
                        className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-primary dark:file:bg-zinc-800 dark:file:text-white cursor-pointer"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowAddGalleryForm(false)}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 rounded-lg font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow"
                      >
                        {saveLoading ? <Loader className="animate-spin" size={16} /> : <span>{editingGallery ? "Save Changes" : "Upload Image"}</span>}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: CMS TEAM MANAGER */}
          {activeTab === 'cms_team' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-6">
              {!showAddTeamForm ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-lg flex items-center space-x-2">
                      <Users size={18} className="text-primary" />
                      <span>Manage Team Members</span>
                    </h3>
                    <button
                      onClick={handleOpenAddTeam}
                      className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Add Team Member</span>
                    </button>
                  </div>

                  {/* Team Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {team.map(member => (
                      <div key={member.id} className="bg-slate-50 dark:bg-zinc-805/40 rounded-2xl border border-slate-200/50 dark:border-zinc-800/20 overflow-hidden shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="h-48 w-full bg-slate-200 dark:bg-zinc-800 overflow-hidden relative">
                            {(member.image || member.image_url) ? (
                              <img 
                                src={member.image || member.image_url} 
                                alt={member.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <User size={48} />
                              </div>
                            )}
                          </div>
                          <div className="p-4 space-y-2 text-left">
                            <h4 className="font-extrabold text-base text-slate-900 dark:text-zinc-100">{member.name}</h4>
                            <p className="text-xs text-primary dark:text-blue-400 font-bold uppercase tracking-wider">{member.role}</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-3">{member.bio || 'No bio provided.'}</p>
                          </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditTeam(member)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center space-x-1 font-bold"
                            title="Edit details/replace photo"
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(member.id)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs flex items-center space-x-1 font-bold"
                            title="Remove member"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {team.length === 0 && (
                      <div className="col-span-full py-16 text-center text-slate-500">
                        No team members registered. Add one above.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {editingTeam ? `Edit Team Member: ${editingTeam.name}` : "Add New Team Member"}
                    </h3>
                    <button
                      onClick={() => setShowAddTeamForm(false)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:opacity-80 rounded-lg text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveTeam} className="space-y-4 text-sm max-w-2xl text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={teamForm.name}
                        onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Role / Designation</label>
                      <input
                        type="text"
                        required
                        value={teamForm.role}
                        onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                        placeholder="e.g. DGPS Field Specialist"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Short Biography</label>
                      <textarea
                        value={teamForm.bio}
                        onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                        placeholder="Brief experience details..."
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                        rows={3.5}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        {editingTeam ? "Replace Profile Image (Leave blank to keep existing)" : "Select Profile Image"}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setTeamImageFile(e.target.files[0])}
                        className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-primary dark:file:bg-zinc-800 dark:file:text-white cursor-pointer"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowAddTeamForm(false)}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 rounded-lg font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow"
                      >
                        {saveLoading ? <Loader className="animate-spin" size={16} /> : <span>{editingTeam ? "Save Changes" : "Create Team Member"}</span>}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB: CMS TESTIMONIALS MANAGER */}
          {activeTab === 'cms_testimonials' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-6">
              {!showAddTestimonialForm ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-lg flex items-center space-x-2">
                      <HelpCircle size={18} className="text-primary" />
                      <span>Manage Testimonials</span>
                    </h3>
                    <button
                      onClick={handleOpenAddTestimonial}
                      className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Add Testimonial</span>
                    </button>
                  </div>

                  {/* Testimonial List Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map(t => (
                      <div key={t.id} className="bg-slate-50 dark:bg-zinc-805/40 rounded-2xl border border-slate-200/50 dark:border-zinc-800/20 overflow-hidden shadow-sm p-5 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex text-amber-500">
                            {[...Array(Math.min(5, Math.max(1, parseInt(t.rating) || 5)))].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-zinc-350 italic text-left leading-relaxed">"{t.review_text}"</p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {(t.image || t.image_url) ? (
                              <img 
                                src={t.image || t.image_url} 
                                alt={t.client_name} 
                                className="w-9 h-9 rounded-full object-cover shrink-0" 
                              />
                            ) : (
                              <div className="w-9 h-9 bg-blue-600/10 text-primary rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                {(t.client_name || 'C').charAt(0)}
                              </div>
                            )}
                            <div className="text-left">
                              <h4 className="font-extrabold text-xs text-slate-900 dark:text-zinc-50">{t.client_name}</h4>
                              <p className="text-[9px] text-slate-450">{t.role || 'Client'}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleOpenEditTestimonial(t)}
                              className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                              title="Edit testimonial / photo"
                            >
                              <Edit size={10} />
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(t.id)}
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
                              title="Delete review"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {testimonials.length === 0 && (
                      <div className="col-span-full py-16 text-center text-slate-500">
                        No testimonials saved. Add one above.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      {editingTestimonial ? `Edit Testimonial from: ${editingTestimonial.client_name}` : "Add New Testimonial"}
                    </h3>
                    <button
                      onClick={() => setShowAddTestimonialForm(false)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:opacity-80 rounded-lg text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveTestimonial} className="space-y-4 text-sm max-w-2xl text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Client Name</label>
                      <input
                        type="text"
                        required
                        value={testimonialForm.client_name}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, client_name: e.target.value })}
                        placeholder="e.g. S. Venkatesh"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Client Role / Profession</label>
                      <input
                        type="text"
                        required
                        value={testimonialForm.role}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                        placeholder="e.g. Real Estate Developer"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Review Text</label>
                      <textarea
                        required
                        value={testimonialForm.review_text}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, review_text: e.target.value })}
                        placeholder="What did the client say about our surveying services..."
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                        rows={3.5}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Rating (1 to 5 Stars)</label>
                      <select
                        value={testimonialForm.rating}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value, 10) })}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700"
                      >
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">
                        {editingTestimonial ? "Replace Client Photo (Leave blank to keep existing)" : "Select Client Photo"}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setTestimonialImageFile(e.target.files[0])}
                        className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-primary dark:file:bg-zinc-800 dark:file:text-white cursor-pointer"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setShowAddTestimonialForm(false)}
                        className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 rounded-lg font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saveLoading}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow"
                      >
                        {saveLoading ? <Loader className="animate-spin" size={16} /> : <span>{editingTestimonial ? "Save Changes" : "Create Testimonial"}</span>}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CUSTOMER ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm space-y-6">
              <h3 className="font-extrabold text-lg">Customer Contact Messages</h3>
              <div className="grid grid-cols-1 gap-6">
                {enquiries.map((enq) => (
                  <div 
                    key={enq.id} 
                    className="p-5 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200/50 dark:border-zinc-800/20 shadow-sm relative text-xs space-y-3 text-left"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">{enq.name}</h4>
                        <p className="text-[10px] text-slate-450 font-mono mt-0.5">Submitted: {new Date(enq.created_at).toLocaleString()}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <a 
                          href={`tel:+91${enq.phone}`} 
                          className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 font-bold"
                        >
                          Call ({enq.phone})
                        </a>
                        {enq.email && (
                          <a 
                            href={`mailto:${enq.email}`} 
                            className="px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-700 font-bold dark:bg-zinc-700"
                          >
                            Email ({enq.email})
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-650 dark:text-zinc-350 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-zinc-800/50 italic">
                      "{enq.message}"
                    </p>

                    <button
                      onClick={() => handleDeleteEnquiry(enq.id)}
                      className="absolute top-4 right-4 p-1.5 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition"
                      title="Delete Message"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                
                {enquiries.length === 0 && (
                  <p className="text-slate-500 py-16 text-center">No customer enquiries received yet.</p>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* BOOKING VIEW DETAILS MODAL */}
      <AnimatePresence>
        {viewingBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl text-left text-sm flex flex-col max-h-[90vh]"
            >
              {/* Modal header */}
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-850">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Booking Details #DDS-{viewingBooking.id}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Submitted: {new Date(viewingBooking.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setViewingBooking(null)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-850 rounded-full transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable details */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Details layout grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Details</h4>
                    <p className="font-bold text-slate-900 dark:text-zinc-100 mt-1">{viewingBooking.customer_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Phone: {viewingBooking.mobile_number}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Email: {viewingBooking.email}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Survey Specifications</h4>
                    <p className="font-bold text-slate-900 dark:text-zinc-100 mt-1">{viewingBooking.survey_type}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Proposed Date: {viewingBooking.survey_date}</p>
                    <p className="text-xs text-primary dark:text-blue-400 font-bold mt-0.5">Coordinates: {viewingBooking.coordinates || 'Not Pinned'}</p>
                  </div>
                </div>

                {/* Location & Notes */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Property Address</h4>
                    <p className="text-slate-600 dark:text-zinc-350 text-xs mt-1 leading-relaxed bg-slate-50 dark:bg-zinc-805/50 p-2.5 rounded-lg border border-slate-200/50 dark:border-zinc-800/30">
                      {viewingBooking.property_location}
                    </p>
                  </div>
                  {viewingBooking.additional_notes && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase">Customer Notes</h4>
                      <p className="text-slate-600 dark:text-zinc-350 text-xs mt-1 leading-relaxed bg-slate-50 dark:bg-zinc-805/50 p-2.5 rounded-lg border border-slate-200/50 dark:border-zinc-800/30 italic">
                        "{viewingBooking.additional_notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Uploaded Documents details */}
                <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Uploaded Attachments</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    
                    {/* Land doc */}
                    <div className="p-3 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs bg-slate-50/50">
                      <div className="space-y-0.5">
                        <p className="font-bold">Land Document</p>
                        <p className="text-[10px] text-slate-450">{viewingBooking.land_document ? "Attached File" : "Missing"}</p>
                      </div>
                      {viewingBooking.land_document && (
                        <a
                          href={`http://127.0.0.1:8000${viewingBooking.land_document}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-primary hover:bg-slate-200 rounded"
                          title="Open land document"
                        >
                          <Eye size={14} />
                        </a>
                      )}
                    </div>

                    {/* Property Image */}
                    <div className="p-3 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs bg-slate-50/50">
                      <div className="space-y-0.5">
                        <p className="font-bold">Property Image</p>
                        <p className="text-[10px] text-slate-450">{viewingBooking.property_image ? "Attached File" : "Missing"}</p>
                      </div>
                      {viewingBooking.property_image && (
                        <a
                          href={`http://127.0.0.1:8000${viewingBooking.property_image}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-primary hover:bg-slate-200 rounded"
                          title="Open property image"
                        >
                          <Eye size={14} />
                        </a>
                      )}
                    </div>

                    {/* Location Sketch */}
                    <div className="p-3 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs bg-slate-50/50">
                      <div className="space-y-0.5">
                        <p className="font-bold">Location Sketch</p>
                        <p className="text-[10px] text-slate-450">{viewingBooking.location_sketch ? "Attached File" : "Missing"}</p>
                      </div>
                      {viewingBooking.location_sketch && (
                        <a
                          href={`http://127.0.0.1:8000${viewingBooking.location_sketch}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-primary hover:bg-slate-200 rounded"
                          title="Open location sketch map"
                        >
                          <Eye size={14} />
                        </a>
                      )}
                    </div>

                  </div>
                </div>

                {/* PDF generation options */}
                <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Administrative Document Reports (PDF)</h4>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handleDownloadPDF(viewingBooking.id, 'receipt-pdf')}
                      className="flex items-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 font-bold rounded-lg text-xs transition"
                    >
                      <Download size={12} />
                      <span>Receipt Receipt</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(viewingBooking.id, 'report-pdf')}
                      className="flex items-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 font-bold rounded-lg text-xs transition"
                    >
                      <Download size={12} />
                      <span>Survey Report</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(viewingBooking.id, 'invoice-pdf')}
                      className="flex items-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-200 font-bold rounded-lg text-xs transition"
                    >
                      <Download size={12} />
                      <span>Tax Invoice</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Modal footer status updates */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-850 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500">Status Update:</span>
                    <select
                      value={viewingBooking.status}
                      onChange={(e) => handleUpdateBookingStatus(viewingBooking.id, e.target.value)}
                      className="px-2.5 py-1 border border-slate-250 rounded-lg text-xs bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500">Assign Surveyor:</span>
                    <select
                      value={viewingBooking.assigned_surveyor || ""}
                      onChange={(e) => handleUpdateBookingSurveyor(viewingBooking.id, e.target.value)}
                      className="px-2.5 py-1 border border-slate-250 rounded-lg text-xs bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none"
                    >
                      <option value="">-- Unassigned --</option>
                      {team.map(member => (
                        <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  {viewingBooking.status !== 'COMPLETED' && viewingBooking.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleFastCompleteBooking(viewingBooking)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow"
                    >
                      Complete Survey
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBooking(viewingBooking.id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition"
                  >
                    Delete Record
                  </button>
                  <button
                    onClick={() => setViewingBooking(null)}
                    className="px-4 py-1.5 bg-slate-250 text-slate-800 font-bold rounded-lg text-xs hover:opacity-80 transition"
                  >
                    Close
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
