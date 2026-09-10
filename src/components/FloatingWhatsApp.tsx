import React, { useState, useEffect } from 'react';
import { X, ArrowUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FloatingWhatsApp: React.FC = () => {
  const { storeSettings } = useStore();
  const [showTooltip, setShowTooltip] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const phone = storeSettings.whatsapp_number.replace(/\D/g, '');
  const customMessage =
    storeSettings.whatsapp_default_message ||
    'مرحباً بوتيك ميني بازار، أود الاستفسار عن المقتنيات الفاخرة والمساعدة في الطلب.';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(customMessage)}`;

  const badgeText = storeSettings.whatsapp_tooltip_badge_text || 'متصلون لمساعدتك';
  const hoverLabel = storeSettings.whatsapp_button_hover_text || 'واتساب ميني بازار';
  const isTooltipEnabled = storeSettings.whatsapp_tooltip_enabled !== false;

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating WhatsApp Action (Bottom Left, adjusted for Mobile Bottom Nav) */}
      <aside
        aria-label="خدمة عملاء واتساب"
        className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 flex flex-col items-start gap-2 font-sans select-none"
      >
        {/* Online Status Badge Tooltip */}
        {isTooltipEnabled && showTooltip && (
          <div className="relative bg-[#2F2B28] text-white px-3 py-1.5 rounded-full shadow-lg border border-[#4A3E37] flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]" />
            </span>

            <span className="text-[11px] font-semibold text-[#F5E9D8] whitespace-nowrap">
              {badgeText}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="w-4 h-4 rounded-full text-[#C4B7AC] hover:text-white flex items-center justify-center transition-colors ml-0.5"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Floating WhatsApp Circular Button */}
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="group relative w-12 h-12 rounded-full bg-[#2F2B28] hover:bg-[#231F1D] text-white shadow-[0_4px_16px_rgba(0,0,0,0.35),0_0_12px_rgba(37,211,102,0.25)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.45),0_0_18px_rgba(37,211,102,0.4)] border border-[#4A3E37] hover:border-[#25D366]/60 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label={hoverLabel}
          title={hoverLabel}
        >
          {/* Authentic WhatsApp Crisp Vector Icon */}
          <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              className="w-full h-full drop-shadow-xs"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              {/* WhatsApp Green Speech Bubble with Tail */}
              <path
                d="M16 2.5C8.544 2.5 2.5 8.544 2.5 16c0 2.45.656 4.747 1.8 6.728L2.5 29.5l7.008-1.767A13.43 13.43 0 0016 29.5c7.456 0 13.5-6.044 13.5-13.5S23.456 2.5 16 2.5z"
                fill="#25D366"
              />
              {/* Crisp White Phone Receiver */}
              <path
                d="M22.5 18.73c-.36-.18-2.13-1.05-2.46-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.9-1.79-1.07-.95-1.8-2.13-2.01-2.49-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.61-.81-.62-.21-.01-.45-.01-.69-.01-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3 0 1.77 1.29 3.48 1.47 3.72.18.24 2.54 3.88 6.15 5.44.86.37 1.53.59 2.05.76.86.28 1.65.24 2.27.14.69-.1 2.13-.87 2.43-1.71.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          {/* Desktop Hover Tooltip */}
          <span className="hidden sm:group-hover:inline-block absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-[#2F2B28] text-[#F5E9D8] text-[11px] font-semibold whitespace-nowrap shadow-md border border-[#4A3E37] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30">
            {hoverLabel}
          </span>
        </a>
      </aside>

      {/* Floating Scroll-to-Top Button (Bottom Right, adjusted for Mobile Bottom Nav) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 w-11 h-11 rounded-full bg-[#2F2B28] hover:bg-[#231F1D] text-[#C6A36A] hover:text-[#F5E9D8] border border-[#4A3E37] hover:border-[#C6A36A] flex items-center justify-center shadow-xl active:scale-95 transition-all duration-300 animate-in fade-in slide-in-from-bottom"
          aria-label="العودة لأعلى الصفحة"
          title="العودة لأعلى الصفحة"
        >
          <ArrowUp className="w-5 h-5 text-[#C6A36A]" />
        </button>
      )}
    </>
  );
};
