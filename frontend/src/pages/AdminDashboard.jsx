import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  Calendar, Check, X, Trash2, Mail, Users, Image as ImageIcon, 
  Settings, LogOut, Search, FileText, BarChart2, Plus, Info, Edit, Loader 
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total_bookings: 0,
    total_visitors: 0,
    total_services: 0,
    total_gallery_images: 0,
  });
  
  // Data lists
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [aboutText, setAboutText] = useState({ id: 1, mission: '', vision: '', years_experience: 8, company_history: '' });
  
  // Search & filter
  const [bookingSearch, setBookingSearch] = useState('');
  
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

      const aboutRes = await api.get('/about/');
      if (aboutRes.data.length > 0) {
        setAboutText(aboutRes.data[0]);
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_username');
    navigate('/login');
  };

  // Booking actions
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      const bToUpdate = bookings.find(b => b.id === id);
      const res = await api.put(`/bookings/${id}/`, { ...bToUpdate, status });
      setBookings(bookings.map(b => b.id === id ? res.data : b));
      
      // Update statistics
      const statsRes = await api.get('/dashboard-overview/');
      setStats(statsRes.data);
    } catch (err) {
      alert('Error updating booking status: ' + err.message);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this booking?")) return;
    try {
      await api.delete(`/bookings/${id}/`);
      setBookings(bookings.filter(b => b.id !== id));
      
      // Refresh stats
      const statsRes = await api.get('/dashboard-overview/');
      setStats(statsRes.data);
    } catch (err) {
      alert('Error deleting booking: ' + err.message);
    }
  };

  // Enquiry actions
  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      await api.delete(`/enquiry/${id}/`);
      setEnquiries(enquiries.filter(e => e.id !== id));
    } catch (err) {
      alert('Error deleting enquiry: ' + err.message);
    }
  };

  // About us content update
  const handleUpdateAbout = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await api.put(`/about/${aboutText.id}/`, aboutText);
      setAboutText(res.data);
      alert('About Us page content successfully updated!');
    } catch (err) {
      alert('Failed to update About content: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => 
    b.customer_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.survey_type.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.status.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 text-left">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-50 font-sans">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Logged in as: <span className="font-bold text-primary dark:text-survey-gold">{localStorage.getItem('admin_username') || 'Administrator'}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition self-start sm:self-center text-sm shadow-md"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs list navigation */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-primary text-primary dark:border-survey-gold dark:text-survey-gold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'bookings'
              ? 'border-primary text-primary dark:border-survey-gold dark:text-survey-gold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'content'
              ? 'border-primary text-primary dark:border-survey-gold dark:text-survey-gold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Content Editor
        </button>
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeTab === 'enquiries'
              ? 'border-primary text-primary dark:border-survey-gold dark:text-survey-gold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Customer Enquiries ({enquiries.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-survey-gold" />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Stat badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 glass border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-xl">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-zinc-50">{stats.total_bookings}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Bookings</p>
                  </div>
                </div>

                <div className="p-6 glass border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-zinc-50">{stats.total_visitors}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Visitors</p>
                  </div>
                </div>

                <div className="p-6 glass border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-xl">
                    <Settings size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-zinc-50">{stats.total_services}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Services</p>
                  </div>
                </div>

                <div className="p-6 glass border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 rounded-xl">
                    <ImageIcon size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-zinc-50">{stats.total_gallery_images}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Gallery Photos</p>
                  </div>
                </div>
              </div>

              {/* Overview brief tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recent Bookings summary */}
                <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-50 flex items-center space-x-2">
                    <BarChart2 size={18} className="text-survey-gold" />
                    <span>Recent Survey Bookings</span>
                  </h3>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 uppercase font-semibold">
                          <th className="py-2.5">Customer</th>
                          <th className="py-2.5">Survey Type</th>
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className="border-b border-slate-100 dark:border-zinc-800/40 text-slate-600 dark:text-zinc-300">
                            <td className="py-2.5 font-bold">{b.customer_name}</td>
                            <td className="py-2.5">{b.survey_type}</td>
                            <td className="py-2.5 font-mono">{b.survey_date}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                                b.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400' :
                                'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                              }`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent enquiries summary */}
                <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-50 flex items-center space-x-2">
                    <Mail size={18} className="text-survey-gold" />
                    <span>Recent Customer Enquiries</span>
                  </h3>
                  <div className="space-y-3">
                    {enquiries.slice(0, 3).map((enq) => (
                      <div key={enq.id} className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl text-xs space-y-1.5 border border-slate-200/50 dark:border-zinc-800/20">
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

          {/* TAB 2: BOOKINGS MANAGEMENT */}
          {activeTab === 'bookings' && (
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-6">
              
              {/* Search bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-zinc-50">Manage Booking Database</h3>
                <div className="relative w-full sm:max-w-xs text-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search by name, status, type..."
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Bookings Table list */}
              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 uppercase text-xs font-semibold">
                      <th className="py-3 px-4">Customer Details</th>
                      <th className="py-3 px-4">Survey Details</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Survey Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="border-b border-slate-100 dark:border-zinc-800/40 text-slate-700 dark:text-zinc-300 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                        
                        {/* Customer */}
                        <td className="py-4 px-4 space-y-1">
                          <p className="font-bold text-slate-900 dark:text-zinc-100">{b.customer_name}</p>
                          <p className="text-xs text-slate-400">{b.mobile_number}</p>
                          <p className="text-xs text-slate-400">{b.email}</p>
                        </td>

                        {/* Survey */}
                        <td className="py-4 px-4 space-y-1">
                          <p className="font-bold">{b.survey_type}</p>
                          {b.additional_notes && (
                            <p className="text-xs text-slate-400 italic line-clamp-2 max-w-[200px]" title={b.additional_notes}>
                              "{b.additional_notes}"
                            </p>
                          )}
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4">
                          <p className="text-xs max-w-[200px] line-clamp-2" title={b.property_location}>
                            {b.property_location}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 font-mono font-bold text-xs">{b.survey_date}</td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                            b.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'APPROVED')}
                              className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                              title="Approve Booking"
                              disabled={b.status === 'APPROVED'}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'REJECTED')}
                              className="p-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
                              title="Reject Booking"
                              disabled={b.status === 'REJECTED'}
                            >
                              <X size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition"
                              title="Delete Booking"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                    {filteredBookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: CONTENT EDITOR */}
          {activeTab === 'content' && (
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-6">
              
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-zinc-50 flex items-center space-x-2">
                <Edit size={20} className="text-survey-gold" />
                <span>Customize About Page Content</span>
              </h3>

              <form onSubmit={handleUpdateAbout} className="space-y-4 text-sm max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Company History</label>
                    <textarea
                      required
                      value={aboutText.company_history}
                      onChange={(e) => setAboutText({ ...aboutText, company_history: e.target.value })}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:ring-2 focus:ring-primary"
                      rows={5}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Our Mission</label>
                      <textarea
                        required
                        value={aboutText.mission}
                        onChange={(e) => setAboutText({ ...aboutText, mission: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:ring-2 focus:ring-primary"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Our Vision</label>
                      <textarea
                        required
                        value={aboutText.vision}
                        onChange={(e) => setAboutText({ ...aboutText, vision: e.target.value })}
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:ring-2 focus:ring-primary"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <label className="font-semibold text-slate-700 dark:text-zinc-300">Years of Experience:</label>
                    <input
                      type="number"
                      required
                      value={aboutText.years_experience}
                      onChange={(e) => setAboutText({ ...aboutText, years_experience: parseInt(e.target.value, 10) })}
                      className="w-16 px-2 py-1 border border-slate-300 rounded-md bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow flex items-center space-x-1.5"
                  >
                    {saveLoading ? <Loader className="animate-spin" size={16} /> : <span>Save Content</span>}
                  </button>
                </div>
              </form>

              {/* Dynamic instruction redirect block */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800/20 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-500 dark:text-zinc-300">Dynamic Content Direct Updates:</p>
                <p>1. To upload/delete **Project Gallery** images, edit them directly on the public <Link to="/gallery" className="text-primary dark:text-survey-gold underline font-bold">Gallery Page</Link> while logged in.</p>
                <p>2. To add/delete **Milestones and Statistics**, edit them directly on the public <Link to="/experience" className="text-primary dark:text-survey-gold underline font-bold">Experience Page</Link> while logged in.</p>
              </div>

            </div>
          )}

          {/* TAB 4: ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-6">
              
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-zinc-50">Customer Enquiries</h3>

              <div className="grid grid-cols-1 gap-6">
                {enquiries.map((enq) => (
                  <div 
                    key={enq.id} 
                    className="p-6 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200/50 dark:border-zinc-800/20 shadow-sm relative text-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-zinc-100 text-base">{enq.name}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">Submitted: {new Date(enq.created_at).toLocaleString()}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs">
                        <a 
                          href={`tel:+91${enq.phone}`} 
                          className="px-3 py-1 bg-primary text-white rounded hover:opacity-90 font-semibold"
                        >
                          Call Now (+91 {enq.phone})
                        </a>
                        {enq.email && (
                          <a 
                            href={`mailto:${enq.email}`} 
                            className="px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-700 font-semibold dark:bg-zinc-700"
                          >
                            Email ({enq.email})
                          </a>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-300 leading-relaxed pt-2 border-t border-slate-200/50 dark:border-zinc-800/50">
                      "{enq.message}"
                    </p>

                    <button
                      onClick={() => handleDeleteEnquiry(enq.id)}
                      className="absolute top-4 right-4 p-1.5 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded transition"
                      title="Delete Message"
                    >
                      <Trash2 size={14} />
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

    </div>
  );
}
