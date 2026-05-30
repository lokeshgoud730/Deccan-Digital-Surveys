import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = '917842475424'; // Lead surveyor phone number
  const defaultMessage = encodeURIComponent("Hello Deccan Digital Surveys, I would like to enquire about a surveying service.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-110 group cursor-pointer"
      title="Chat on WhatsApp"
    >
      {/* Pulse Rings */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping -z-10 group-hover:hidden" />
      
      {/* Icon */}
      <MessageCircle size={28} className="fill-white stroke-none" />
      
      {/* Tooltip */}
      <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-md whitespace-nowrap dark:bg-zinc-800">
        Chat with us on WhatsApp
      </span>
    </a>
  );
}
