import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api, { logVisitor } from '../api';
import { Target, Eye, Award, CheckCircle, Users } from 'lucide-react';

export default function About() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Log visitor hit
    logVisitor('About');

    // Fetch About Us content from Settings CMS
    api.get('/settings/')
      .then((res) => {
        if (res.data.length > 0) {
          const s = res.data[0];
          setAboutData({
            mission: s.about_mission,
            vision: s.about_vision,
            years_experience: s.stat_experience_years,
            company_history: s.about_description
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching about content:', err);
        setLoading(false);
      });
  }, []);

  const fallbackAbout = {
    mission: "To deliver exceptionally precise, reliable, and technology-driven surveying solutions that facilitate infrastructure growth, secure land ownership, and optimize urban development across India.",
    vision: "To be the premier digital surveying agency in India, recognized for integrity, extreme precision, and seamless delivery of layout approvals and engineering maps.",
    years_experience: 8,
    company_history: "Deccan Digital Surveys was founded in 2018 with a vision to revolutionize the traditional land measurement practices in India. By introducing advanced electronic distance measurements and satellite-based coordinates (DGPS/GNSS), we helped eliminate boundaries errors and legal disputes. Over the past 8 years, our team has grown from 2 surveyors to a multidisciplinary engineering team with regional offices in Jangaon and Siddipet."
  };

  const content = aboutData || fallbackAbout;

  const specializations = [
    "Land Surveys & Boundary Demarcations",
    "Layout Surveys & Plot Markings",
    "Government Approvals (DTCP, HMDA, YTDA)",
    "Road and Rail Alignments",
    "Contour & Topographical Mapping",
    "Venture Land Developments",
    "Canal and Pipeline Corridor Surveys"
  ];

  const team = [
    { name: "Bharath", role: "Lead Digital Surveyor", contact: "+91 7842475424", details: "Expert in DGPS GNSS configurations, satellite triangulation, and boundary conflict resolutions." },
    { name: "B. Venu", role: "Field Survey Engineer", contact: "+91 7893393144", details: "Specialist in Total Station plotting, layout contours, and construction setting outs." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      
      {/* 1. Header Hero block */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50"
        >
          About Deccan Digital Surveys
        </motion.h1>
        <div className="h-1.5 w-24 bg-survey-gold mx-auto rounded-full" />
        <p className="text-slate-500 dark:text-zinc-400">
          A leading surveying company providing professional surveying services across India.
        </p>
      </section>

      {/* 2. Main Narrative & Image */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Visual card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-96 rounded-2xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-zinc-800/50 bg-slate-950"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/images/services/land_survey.png')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <div className="absolute bottom-6 left-6 text-left space-y-1">
            <div className="flex items-center space-x-2 text-survey-gold">
              <Award size={20} />
              <span className="font-bold text-lg">{content.years_experience}+ Years of Experience</span>
            </div>
            <p className="text-xs text-slate-300">Pioneering precision coordinate mapping since 2018</p>
          </div>
        </motion.div>

        {/* Story details */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-left"
        >
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 font-sans">Our Journey & Core Values</h2>
          {loading ? (
            <div className="h-4 w-full bg-slate-200 animate-pulse rounded" />
          ) : (
            <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
              {content.company_history}
            </p>
          )}

          {/* List of specialities */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-slate-900 dark:text-zinc-50">Our Areas of Expertise:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {specializations.map((spec, index) => (
                <div key={index} className="flex items-center space-x-2 text-slate-600 dark:text-zinc-300 text-sm">
                  <CheckCircle size={16} className="text-survey-gold shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-8 glass rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 text-left space-y-4 shadow"
        >
          <div className="flex items-center space-x-3 text-primary dark:text-survey-gold">
            <div className="p-3 bg-primary/10 dark:bg-survey-gold/10 rounded-xl">
              <Target size={24} />
            </div>
            <h3 className="text-2xl font-bold">Our Mission</h3>
          </div>
          <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base">
            {content.mission}
          </p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="p-8 glass rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 text-left space-y-4 shadow"
        >
          <div className="flex items-center space-x-3 text-primary dark:text-survey-gold">
            <div className="p-3 bg-primary/10 dark:bg-survey-gold/10 rounded-xl">
              <Eye size={24} />
            </div>
            <h3 className="text-2xl font-bold">Our Vision</h3>
          </div>
          <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base">
            {content.vision}
          </p>
        </motion.div>
      </section>

      {/* 4. Professional Team Section */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-center space-x-2 text-primary dark:text-survey-gold">
            <Users size={20} />
            <span className="font-bold text-sm uppercase tracking-wider">Expert Team</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50">Meet Our Professional Surveyors</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm">
            Fully certified and experienced field technicians using dynamic digital equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member, idx) => (
            <div 
              key={idx} 
              className="p-6 glass rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow flex flex-col justify-between text-left space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900 dark:text-zinc-50">{member.name}</h3>
                    <p className="text-xs text-survey-gold font-bold uppercase tracking-wider">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                  {member.details}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/50 dark:border-zinc-800/50 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Immediate Field Query:</span>
                <a 
                  href={`tel:${member.contact.replace(/\s+/g, '')}`} 
                  className="text-sm font-bold text-primary dark:text-survey-gold hover:underline"
                >
                  {member.contact}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
