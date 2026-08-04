import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const BACKEND_URL = '';

// Helper to upload a file to Supabase Storage
const uploadFile = async (file) => {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
  
  // Upload to the 'survey-media' bucket
  const { data, error } = await supabase.storage
    .from('survey-media')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
    
  if (error) {
    console.error("Storage upload error:", error);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('survey-media')
    .getPublicUrl(fileName);
    
  return publicUrl;
};

// Helper to clean payloads for PostgreSQL compatibility
const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned = { ...obj };
  
  if ('image' in cleaned) {
    cleaned.image_url = cleaned.image;
    delete cleaned.image;
  }
  
  if ('hero_image' in cleaned) {
    cleaned.hero_image_url = cleaned.hero_image;
    delete cleaned.hero_image;
  }
  
  // Strip primary key id if it's sent during inserts or updates
  delete cleaned.id;
  
  return cleaned;
};

// Helper to parse FormData
const parseFormData = async (formData) => {
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.name) {
      const url = await uploadFile(value);
      if (url) {
        if (key === 'image') {
          data['image_url'] = url;
        } else if (key === 'hero_image') {
          data['hero_image_url'] = url;
        } else {
          data[key] = url;
          data[`${key}_url`] = url;
        }
      }
    } else {
      if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      } else {
        if (key === 'image') {
          data['image_url'] = value;
        } else if (key === 'hero_image') {
          data['hero_image_url'] = value;
        } else {
          data[key] = value;
        }
      }
    }
  }
  return data;
};

// Helper: client-side PDF generation
const generateBookingReceipt = (booking) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });
  
  // Header background
  doc.setFillColor(15, 76, 129); // #0f4c81
  doc.rect(0, 0, 612, 100, 'F');
  
  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text("DECCAN DIGITAL SURVEYS", 40, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text("High Precision DGPS & Total Station Land Surveys", 40, 65);
  
  // Receipt title
  doc.setTextColor(18, 18, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text("BOOKING ACKNOWLEDGEMENT RECEIPT", 40, 140);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Issued Date: ${new Date().toISOString().split('T')[0]} | Receipt ID: DDS-REC-${String(booking.id).padStart(4, '0')}`, 40, 160);
  
  // Details border box
  doc.setDrawColor(200, 200, 200);
  doc.rect(40, 190, 532, 180);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Customer Details", 55, 215);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Full Name: ${booking.customer_name}`, 55, 235);
  doc.text(`Mobile Number: ${booking.mobile_number}`, 55, 255);
  doc.text(`Email Address: ${booking.email || 'N/A'}`, 55, 275);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Survey Specifications", 320, 215);
  doc.setFont('helvetica', 'normal');
  doc.text(`Survey Category: ${booking.survey_type || 'Land Survey'}`, 320, 235);
  doc.text(`Proposed Date: ${booking.survey_date || 'TBD'}`, 320, 255);
  doc.text(`Property Coordinates: ${booking.coordinates || 'Not Pinmarked'}`, 320, 275);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Property Physical Location:", 55, 315);
  doc.setFont('helvetica', 'normal');
  const loc = booking.property_location || `Village: ${booking.village || ''}, District: ${booking.district || ''}`;
  doc.text(loc.substring(0, 95), 55, 335);
  if (loc.length > 95) {
    doc.text(loc.substring(95, 190), 55, 350);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("Terms and Guidelines:", 40, 400);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text("1. Please keep original land title deeds, revenue tippon copies, and survey boundary files handy for verification.", 40, 420);
  doc.text("2. Coordinates saved are indicative. Our surveyors will establish official benchmarks using base DGPS stations.", 40, 435);
  doc.text("3. Final price will be estimated post benchmark verification and acreage cross-check.", 40, 450);
  
  // Footer branding
  doc.setDrawColor(15, 76, 129);
  doc.line(40, 720, 572, 720);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Deccan Digital Surveys (HQ Hyderabad, Siddipet, Jangaon) | Support: +91 90000 00000", 40, 735);
  
  return doc.output('blob');
};

const generateBookingReport = (booking) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });
  
  // Header background
  doc.setFillColor(30, 58, 138); // #1e3a8a
  doc.rect(0, 0, 612, 100, 'F');
  
  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text("OFFICIAL FIELD SURVEY REPORT", 40, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text("Deccan Digital Surveys - High Precision Engineering Division", 40, 75);
  
  // Report details
  doc.setTextColor(18, 18, 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`REPORT FOR BOOKING ID: DDS-${booking.id}`, 40, 140);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Survey Date: ${booking.survey_date || 'TBD'} | Generation Date: ${new Date().toISOString().split('T')[0]}`, 40, 160);
  
  // Client & Observations box
  doc.setDrawColor(200, 200, 200);
  doc.rect(40, 180, 532, 220);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Client Specifications", 55, 205);
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer Name: ${booking.customer_name}`, 55, 225);
  doc.text(`Mobile Number: ${booking.mobile_number}`, 55, 245);
  doc.text(`Email Address: ${booking.email || 'N/A'}`, 55, 265);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Observation Details", 320, 205);
  doc.setFont('helvetica', 'normal');
  doc.text(`Survey Type: ${booking.survey_type || 'Land Survey'}`, 320, 225);
  doc.text(`Acreage: ${booking.acres || 'N/A'} Acres`, 320, 245);
  doc.text(`Status: ${booking.status || 'PENDING'}`, 320, 265);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Assigned Surveyor Team", 55, 305);
  doc.setFont('helvetica', 'normal');
  doc.text(`Surveyor Name: ${booking.surveyor_name || 'Assigned Surveyor Staff'}`, 55, 325);
  doc.text(`Designation: ${booking.surveyor_role || 'Lead Field Engineer'}`, 55, 345);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Location coordinates and sketch mapping metadata:", 55, 380);
  doc.setFont('helvetica', 'normal');
  doc.text(`GPS Coordinates: ${booking.coordinates || 'Not Pinmarked'}`, 55, 395);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Field Notes and Technical Summary", 40, 430);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const notes = booking.additional_notes || "No extra survey notes recorded. Demarcation was carried out using RTK Base and Rover setups referencing local government Tippon benchmarks.";
  const lines = doc.splitTextToSize(notes, 530);
  doc.text(lines, 40, 450);
  
  // Footer branding
  doc.setDrawColor(30, 58, 138);
  doc.line(40, 720, 572, 720);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("Official report generated digitally and authenticated by Deccan Digital Surveys engineering systems.", 40, 735);
  
  return doc.output('blob');
};

// Client Chatbot logic
const handleAIChat = (message) => {
  const msgLower = message.toLowerCase();
  const isTelugu = /[\u0c00-\u0c7f]/.test(message) || msgLower.includes("telugu");
  
  if (isTelugu) {
    if (["ధర", "ఖర్చు", "రేటు", "రేట్లు", "ధరలు", "ఖర్చులు", "price", "cost", "charges", "rate"].some(k => msgLower.includes(k))) {
      return "మా సర్వేయింగ్ ఛార్జీలు రూ. 5,000 నుండి ప్రారంభమవుతాయి. మొత్తం ఖర్చు భూమి విస్తీర్ణం, భూభాగం మరియు DGPS లేదా టోటల్ స్టేషన్ పరికరాలు అవసరమా అనే అంశాలపై ఆధారపడి ఉంటుంది. ఖచ్చితమైన ధర కోసం దయచేసి మా బుకింగ్ ఫారమ్‌ను పూరించండి!";
    }
    if (["బుక్", "షెడ్యూల్", "అపాయింట్‌మెంట్", "book", "schedule", "appointment"].some(k => msgLower.includes(k))) {
      return "మీరు నేరుగా ఆన్‌లైన్ లో సర్వేను బుక్ చేసుకోవచ్చు! మెనూలోని 'Book Survey' పేజీకి వెళ్లి, వివరాలను నమోదు చేసి, తేదీని ఎంచుకుని, మ్యాప్‌లో మీ స్థానాన్ని గుర్తించండి. అలాగే మీ ల్యాండ్ డాక్యుమెంట్లు అప్‌లోడ్ చేయండి.";
    }
    if (["సంప్రదించండి", "ఫోన్", "నెంబర్", "కాల్", "ఈమెయిల్", "contact", "phone", "call", "email"].some(k => msgLower.includes(k))) {
      return "మీరు మా ప్రధాన కార్యాలయాన్ని ఫోన్ ద్వారా +91 90000 00000 లేదా ఈమెయిల్ contact@deccandigitalsurveys.com ద్వారా సంప్రదించవచ్చు. మాకు జనగామ మరియు సిద్దిపేటలో ప్రాంతీయ కార్యాలయాలు కూడా ఉన్నాయి.";
    }
    return "నమస్కారం! నేను డెక్కన్ డిజిటల్ సర్వీసెస్ AI సహాయకుడిని. డెక్కన్ డిజిటల్ సర్వీసెస్ ల్యాండ్ బౌండరీ డెమార్కేషన్, లేఅవుట్ అప్రూవల్స్ (HMDA/DTCP), కాంటూర్ మ్యాపింగ్, పైప్‌లైన్/కెనాల్ ఇంజనీరింగ్ లేఅవుట్ సేవలను అందిస్తుంది. సహాయం కోసం మా సపోర్ట్ డెస్క్ +91 90000 00000 ని సంప్రదించండి.";
  } else {
    if (["price", "cost", "charges", "rate"].some(k => msgLower.includes(k))) {
      return "Our surveying charges start from Rs. 5,000. The total cost depends on factors such as the total acreage of the property, terrain, and whether high-precision satellite DGPS or standard Total Station equipment is required. Please fill out our Booking Form to get an accurate quote!";
    }
    if (["book", "schedule", "appointment"].some(k => msgLower.includes(k))) {
      return "You can book a survey directly online! Simply go to our 'Book Survey' page in the top menu, fill out the customer details, choose your preferred date, and upload documents for review.";
    }
    if (["contact", "phone", "call", "email"].some(k => msgLower.includes(k))) {
      return "You can contact us at our main headquarters via Phone at +91 90000 00000 or by email at contact@deccandigitalsurveys.com. We also have regional offices in Jangaon and Siddipet.";
    }
    return "Deccan Digital Surveys specializes in premium land boundary demarcation, layout approvals (HMDA/DTCP), contour mapping, and pipeline/canal engineering layouts. You can contact our support desk at +91 90000 00000 for direct assistance.";
  }
};

const api = {
  get: async (url, config = {}) => {
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    const params = config.params || {};

    // 1. PDF Downloads Interceptor
    const receiptMatch = cleanUrl.match(/^\/bookings\/(\d+)\/receipt$/);
    const reportMatch = cleanUrl.match(/^\/bookings\/(\d+)\/report$/);
    if (receiptMatch || reportMatch) {
      const bookingId = parseInt(receiptMatch ? receiptMatch[1] : reportMatch[1]);
      const { data: booking, error } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
      if (error || !booking) throw new Error("Booking not found");
      
      if (booking.assigned_surveyor) {
        const { data: surveyor } = await supabase.from('team_members').select('*').eq('id', booking.assigned_surveyor).single();
        if (surveyor) {
          booking.surveyor_name = surveyor.name;
          booking.surveyor_role = surveyor.role;
        }
      }
      
      const blob = receiptMatch ? generateBookingReceipt(booking) : generateBookingReport(booking);
      return { data: blob };
    }

    // 2. Bookings Tracking
    if (cleanUrl === '/bookings/track') {
      const bookingId = parseInt(params.id);
      const phone = params.phone;
      const { data: booking, error } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
      if (error || !booking) throw { response: { data: { error: 'No active booking record found matching these parameters.' } } };

      const cleanDbPhone = (booking.mobile_number || '').replace(/\D/g, '').slice(-10);
      const cleanQueryPhone = (phone || '').replace(/\D/g, '').slice(-10);

      if (cleanDbPhone === cleanQueryPhone) {
        if (booking.status === 'COMPLETED' && booking.assigned_surveyor) {
          const { data: surveyor } = await supabase.from('team_members').select('*').eq('id', booking.assigned_surveyor).single();
          if (surveyor) {
            booking.surveyor_name = surveyor.name;
            booking.surveyor_role = surveyor.role;
          }
        }
        return { data: booking };
      } else {
        throw { response: { data: { error: 'No active booking record found matching these parameters.' } } };
      }
    }

    // 3. General Data fetching
    // 3. General Data fetching
    if (cleanUrl === '/settings') {
      try {
        const { data, error } = await supabase.from('website_settings').select('*');
        if (!error && data && data.length > 0) return { data };
      } catch (e) {
        console.warn("website_settings fetch fallback triggered:", e);
      }
      return { data: [{
        id: 1,
        hero_title: "Deccan Digital Surveys",
        hero_subtitle: "Precision DGPS & Total Station Land Surveying Services Across Telangana & Andhra Pradesh",
        hero_primary_btn: "Book Survey",
        hero_secondary_btn: "Contact Us",
        about_description: "Deccan Digital Surveys was founded in 2018 with a vision to revolutionize land measurement in India. By introducing advanced electronic distance measurements and satellite-based coordinates (DGPS/GNSS), we helped eliminate boundaries errors and legal disputes. Over the past 8 years, our team has grown from 2 surveyors to a multidisciplinary engineering team with regional offices in Jangaon and Siddipet.",
        about_mission: "To deliver exceptionally precise, reliable, and technology-driven surveying solutions that facilitate infrastructure growth, secure land ownership, and optimize urban development across India.",
        about_vision: "To be the premier digital surveying agency in India, recognized for integrity, extreme precision, and seamless delivery of layout approvals and engineering maps.",
        stat_experience_years: 8,
        stat_projects_completed: "1,200+",
        stat_clients_served: "950+"
      }] };
    }

    if (cleanUrl === '/services') {
      try {
        const { data, error } = await supabase.from('service_content').select('*').order('id', { ascending: true });
        if (!error && data) return { data };
      } catch (e) {}
      return { data: [] };
    }

    if (cleanUrl === '/testimonials') {
      try {
        const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
        if (!error && data) return { data };
      } catch (e) {}
      return { data: [] };
    }

    if (cleanUrl === '/team') {
      try {
        const { data, error } = await supabase.from('team_members').select('*').order('id', { ascending: true });
        if (!error && data) return { data };
      } catch (e) {}
      return { data: [] };
    }

    if (cleanUrl === '/experience') {
      try {
        const { data, error } = await supabase.from('experience_items').select('*').order('id', { ascending: true });
        if (!error && data) return { data };
      } catch (e) {}
      return { data: [] };
    }

    if (cleanUrl === '/gallery') {
      try {
        const { data, error } = await supabase.from('gallery_images').select('*').order('uploaded_at', { ascending: false });
        if (!error && data) return { data };
      } catch (e) {}
      return { data: [] };
    }

    if (cleanUrl === '/enquiry') {
      try {
        const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
        if (!error && data) return { data };
      } catch (e) {}
      return { data: [] };
    }

    if (cleanUrl === '/bookings') {
      try {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && data) return { data };
      } catch (e) {}
      return { data: [] };
    }

    // 4. Admin Dashboard Metrics
    if (cleanUrl === '/dashboard-overview') {
      try {
        const { count: total_bookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
        
        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);
        const { count: today_bookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString());
        
        const { count: pending_surveys } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');
        const { count: completed_surveys } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED');
        const { count: cancelled_surveys } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'CANCELLED');
        
        const { data: visitors } = await supabase.from('visitor_stats').select('ip_address');
        const unique_ips = new Set((visitors || []).map(v => v.ip_address));
        const total_visitors = unique_ips.size;

        const { count: total_services } = await supabase.from('service_content').select('*', { count: 'exact', head: true });
        const { count: total_gallery_images } = await supabase.from('gallery_images').select('*', { count: 'exact', head: true });

        return {
          data: {
            total_bookings: total_bookings || 0,
            today_bookings: today_bookings || 0,
            pending_surveys: pending_surveys || 0,
            completed_surveys: completed_surveys || 0,
            cancelled_surveys: cancelled_surveys || 0,
            total_visitors: total_visitors || 0,
            total_services: total_services || 0,
            total_gallery_images: total_gallery_images || 0
          }
        };
      } catch (e) {
        console.warn("dashboard-overview fetch fallback triggered:", e);
      }
      return {
        data: {
          total_bookings: 0,
          today_bookings: 0,
          pending_surveys: 0,
          completed_surveys: 0,
          cancelled_surveys: 0,
          total_visitors: 0,
          total_services: 0,
          total_gallery_images: 0
        }
      };
    }

    throw new Error(`Endpoint not found: GET ${cleanUrl}`);
  },

  post: async (url, payload, config = {}) => {
    const cleanUrl = url.replace(/\/$/, '');

    // 1. Storage uploads
    if (cleanUrl === '/uploads') {
      const file = payload.get('file');
      if (!file) throw new Error("No file uploaded");
      const url = await uploadFile(file);
      return { data: { file: url } };
    }

    // 2. Chatbot
    if (cleanUrl === '/ai-chat') {
      const response = handleAIChat(payload.message);
      return { data: { response } };
    }

    // 3. Visitor Logging
    if (cleanUrl === '/log-visitor') {
      let ip = '127.0.0.1';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json').then(r => r.json());
        ip = ipRes.ip || '127.0.0.1';
      } catch (e) {}
      await supabase.from('visitor_stats').insert([{ ip_address: ip, page_visited: payload.page || 'Home' }]);
      return { data: { status: 'logged' } };
    }

    // 4. Supabase Auth Admin Sign-in
    if (cleanUrl === '/token') {
      const { username, password } = payload;
      const email = username.includes('@') ? username : `${username}@deccandigitalsurveys.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw { response: { data: { detail: error.message } } };
      }
      return { data: { session: data.session } };
    }

    if (cleanUrl === '/token/logout') {
      await supabase.auth.signOut();
      return { data: { status: 'logged_out' } };
    }

    if (cleanUrl === '/password-reset') {
      const { email } = payload;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?action=reset`
      });
      if (error) throw { response: { data: { error: error.message } } };
      return { data: { message: 'Password reset link sent.' } };
    }

    if (cleanUrl === '/password-reset/confirm') {
      const { new_password } = payload;
      const { error } = await supabase.auth.updateUser({ password: new_password });
      if (error) throw { response: { data: { error: error.message } } };
      return { data: { message: 'Password updated.' } };
    }

    // 5. General Submissions
    if (cleanUrl === '/bookings') {
      const bookingData = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      
      if (!bookingData.property_location) {
        bookingData.property_location = `Village: ${bookingData.village || ''}, District: ${bookingData.district || ''}`;
      }
      if (!bookingData.survey_type) bookingData.survey_type = 'Land Survey';
      bookingData.status = 'PENDING';
      
      const { data, error } = await supabase.from('bookings').insert([bookingData]).select().single();
      if (error) throw error;
      return { data };
    }

    if (cleanUrl === '/enquiry') {
      const enquiryData = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data, error } = await supabase.from('enquiries').insert([enquiryData]).select().single();
      if (error) throw error;
      return { data };
    }

    if (cleanUrl === '/testimonials') {
      const testimonialData = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data, error } = await supabase.from('testimonials').insert([testimonialData]).select().single();
      if (error) throw error;
      return { data };
    }

    // CMS CRUDs
    if (cleanUrl === '/services') {
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data: row, error } = await supabase.from('service_content').insert([data]).select().single();
      if (error) throw error;
      return { data: row };
    }

    if (cleanUrl === '/gallery') {
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data: row, error } = await supabase.from('gallery_images').insert([data]).select().single();
      if (error) throw error;
      return { data: row };
    }

    if (cleanUrl === '/team') {
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data: row, error } = await supabase.from('team_members').insert([data]).select().single();
      if (error) throw error;
      return { data: row };
    }

    if (cleanUrl === '/experience') {
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data: row, error } = await supabase.from('experience_items').insert([data]).select().single();
      if (error) throw error;
      return { data: row };
    }

    throw new Error(`Endpoint not found: POST ${cleanUrl}`);
  },

  put: async (url, payload, config = {}) => {
    const cleanUrl = url.replace(/\/$/, '');

    // 1. Settings Update
    const settingsMatch = cleanUrl.match(/^\/settings\/(\d+)$/);
    if (settingsMatch) {
      const id = parseInt(settingsMatch[1]);
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data: row, error } = await supabase.from('website_settings').update(data).eq('id', id).select().single();
      if (error) throw error;
      return { data: row };
    }

    // 2. Bookings updates
    const bookingMatch = cleanUrl.match(/^\/bookings\/(\d+)$/);
    if (bookingMatch) {
      const id = parseInt(bookingMatch[1]);
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      
      delete data.surveyor_name;
      delete data.surveyor_role;

      const { data: row, error } = await supabase.from('bookings').update(data).eq('id', id).select().single();
      if (error) throw error;
      return { data: row };
    }

    // 3. Service updates by slug
    const serviceMatch = cleanUrl.match(/^\/services\/([a-zA-Z0-9_-]+)$/);
    if (serviceMatch) {
      const slug = serviceMatch[1];
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data: row, error } = await supabase.from('service_content').update(data).eq('slug', slug).select().single();
      if (error) throw error;
      return { data: row };
    }

    // 4. Gallery updates
    const galleryMatch = cleanUrl.match(/^\/gallery\/(\d+)$/);
    if (galleryMatch) {
      const id = parseInt(galleryMatch[1]);
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data: row, error } = await supabase.from('gallery_images').update(data).eq('id', id).select().single();
      if (error) throw error;
      return { data: row };
    }

    // 5. Team updates
    const teamMatch = cleanUrl.match(/^\/team\/(\d+)$/);
    if (teamMatch) {
      const id = parseInt(teamMatch[1]);
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data: row, error } = await supabase.from('team_members').update(data).eq('id', id).select().single();
      if (error) throw error;
      return { data: row };
    }

    // 6. Testimonial updates
    const testimonialMatch = cleanUrl.match(/^\/testimonials\/(\d+)$/);
    if (testimonialMatch) {
      const id = parseInt(testimonialMatch[1]);
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data: row, error } = await supabase.from('testimonials').update(data).eq('id', id).select().single();
      if (error) throw error;
      return { data: row };
    }

    // 7. Experience updates
    const experienceMatch = cleanUrl.match(/^\/experience\/(\d+)$/);
    if (experienceMatch) {
      const id = parseInt(experienceMatch[1]);
      const data = cleanObject(payload instanceof FormData ? await parseFormData(payload) : payload);
      const { data: row, error } = await supabase.from('experience_items').update(data).eq('id', id).select().single();
      if (error) throw error;
      return { data: row };
    }

    throw new Error(`Endpoint not found: PUT ${cleanUrl}`);
  },

  delete: async (url, config = {}) => {
    const cleanUrl = url.replace(/\/$/, '');

    const bookingMatch = cleanUrl.match(/^\/bookings\/(\d+)$/);
    if (bookingMatch) {
      const id = parseInt(bookingMatch[1]);
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      return { data: { success: true } };
    }

    const enquiryMatch = cleanUrl.match(/^\/enquiry\/(\d+)$/);
    if (enquiryMatch) {
      const id = parseInt(enquiryMatch[1]);
      const { error } = await supabase.from('enquiries').delete().eq('id', id);
      if (error) throw error;
      return { data: { success: true } };
    }

    const serviceMatch = cleanUrl.match(/^\/services\/([a-zA-Z0-9_-]+)$/);
    if (serviceMatch) {
      const slug = serviceMatch[1];
      const { error } = await supabase.from('service_content').delete().eq('slug', slug);
      if (error) throw error;
      return { data: { success: true } };
    }

    const galleryMatch = cleanUrl.match(/^\/gallery\/(\d+)$/);
    if (galleryMatch) {
      const id = parseInt(galleryMatch[1]);
      const { error } = await supabase.from('gallery_images').delete().eq('id', id);
      if (error) throw error;
      return { data: { success: true } };
    }

    const teamMatch = cleanUrl.match(/^\/team\/(\d+)$/);
    if (teamMatch) {
      const id = parseInt(teamMatch[1]);
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      return { data: { success: true } };
    }

    const testimonialMatch = cleanUrl.match(/^\/testimonials\/(\d+)$/);
    if (testimonialMatch) {
      const id = parseInt(testimonialMatch[1]);
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      return { data: { success: true } };
    }

    const experienceMatch = cleanUrl.match(/^\/experience\/(\d+)$/);
    if (experienceMatch) {
      const id = parseInt(experienceMatch[1]);
      const { error } = await supabase.from('experience_items').delete().eq('id', id);
      if (error) throw error;
      return { data: { success: true } };
    }

    throw new Error(`Endpoint not found: DELETE ${cleanUrl}`);
  }
};

export default api;
