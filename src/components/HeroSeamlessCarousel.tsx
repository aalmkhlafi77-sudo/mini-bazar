import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Sparkles, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HeroSlide } from '../types';

export const HeroSeamlessCarousel: React.FC = () => {
  const { heroSlides, themeSettings, setActiveView } = useStore();
  const visibleSlides = heroSlides.filter((s) => s.is_visible);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1); // 1 = forward, -1 = backward
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = visibleSlides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    if (index === currentIndex || totalSlides <= 1) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Autoplay management with pause on hover/focus
  useEffect(() => {
    if (!themeSettings.carousel_autoplay || isPaused || totalSlides <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, themeSettings.carousel_interval || 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, isPaused, themeSettings.carousel_autoplay, themeSettings.carousel_interval, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        nextSlide();
      } else if (e.key === 'ArrowRight') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (totalSlides === 0) return null;

  const slide: HeroSlide = visibleSlides[currentIndex] || visibleSlides[0];

  // Motion variants for smooth RTL-aware transition
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 250, damping: 28 },
        opacity: { duration: 0.45 },
      },
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 250, damping: 28 },
        opacity: { duration: 0.35 },
      },
    }),
  };

  const handleCtaClick = (url: string) => {
    if (url.startsWith('#')) {
      const el = document.querySelector(url);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setActiveView('store');
    }
  };

  const isPulsingActive =
    themeSettings.hero_pulse_animation !== false && slide.pulse_animation !== false;

  const isFullBackground =
    slide.layout_type === 'full_background' ||
    Boolean(slide.background_image && slide.layout_type !== 'split');

  const fullBgImage = slide.background_image || (isFullBackground ? slide.desktop_image : undefined);

  // Overlay opacity calculation
  const overlayPercent = slide.overlay_opacity !== undefined ? slide.overlay_opacity : (isFullBackground ? 40 : 15);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#FBF8F3] border-b border-[#E5D8C9]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="معرض ميني بازار الرئيسي"
    >
      {/* Full-width Animated Background Canvas */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Base background color/gradient */}
        <div
          className="absolute inset-0 w-full h-full transition-colors duration-700"
          style={{
            background: slide.background_value || '#FBF8F3',
          }}
        />

        {/* Full-width Image Background */}
        {fullBgImage && (
          <motion.div
            key={`hero-bg-${slide.id}`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: isPulsingActive ? [-15, 15, -15] : 0,
              scale: isPulsingActive ? [1.02, 1.05, 1.02] : 1,
            }}
            transition={{
              opacity: { duration: 0.6 },
              x: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={fullBgImage}
              alt=""
              className={`w-full h-full object-${slide.image_fit || 'cover'} transform ${
                slide.background_blur ? 'filter blur-[8px]' : ''
              }`}
            />

            {/* Smart Overlay for High Contrast and Pristine Readability */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                backgroundColor: '#2F2B28',
                opacity: overlayPercent / 100,
              }}
            />

            {/* Gradient Scrim for Split or Full backgrounds */}
            {isFullBackground ? (
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-[#FBF8F3]/90 via-[#FBF8F3]/60 to-[#FBF8F3]/90" />
            )}
          </motion.div>
        )}

        {/* Ambient Pulsating Golden Glow Orbs */}
        {isPulsingActive && !isFullBackground && (
          <>
            <motion.div
              animate={{
                x: [-40, 40, -40],
                y: [-15, 15, -15],
                scale: [1, 1.18, 1],
                opacity: [0.25, 0.45, 0.25],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-1/4 right-1/4 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full bg-gradient-to-br from-[#C6A36A]/20 to-[#E7D4BC]/10 filter blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{
                x: [40, -40, 40],
                y: [15, -15, 15],
                scale: [1.15, 0.95, 1.15],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute bottom-1/4 left-1/4 w-80 sm:w-[32rem] h-80 sm:h-[32rem] rounded-full bg-gradient-to-tr from-[#6F584A]/15 to-[#D4AF37]/15 filter blur-3xl pointer-events-none"
            />
          </>
        )}
      </div>

      {/* Main Slides Carousel Container with Touch & Drag Support */}
      <div className="relative min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] w-full flex items-center z-10">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, { offset, velocity }) => {
              if (offset.x > 60 || velocity.x > 350) {
                prevSlide();
              } else if (offset.x < -60 || velocity.x < -350) {
                nextSlide();
              }
            }}
            className="absolute inset-0 w-full h-full flex items-center justify-center px-4 sm:px-12 lg:px-20 cursor-grab active:cursor-grabbing"
          >
            <div className="max-w-7xl w-full mx-auto py-10">
              {/* Full Background Mode Layout */}
              {isFullBackground ? (
                <div
                  className={`max-w-2xl text-right z-10 ${
                    slide.text_alignment === 'center'
                      ? 'mx-auto text-center'
                      : 'ml-auto'
                  }`}
                >
                  {/* Badge */}
                  {slide.badge_ar && (
                    <div
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-md backdrop-blur-md"
                      style={{
                        backgroundColor: slide.badge_bg || '#2F2B28',
                        color: slide.badge_color || '#C6A36A',
                        borderColor: '#C6A36A',
                        borderWidth: '1px',
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C6A36A]" />
                      <span>{slide.badge_ar}</span>
                    </div>
                  )}

                  {/* Main Heading */}
                  <h1
                    className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.2] font-heading mb-4 drop-shadow-md"
                    style={{
                      color: slide.title_color || '#FFFFFF',
                    }}
                  >
                    {slide.title_ar}
                  </h1>

                  {/* Subtitle / Description */}
                  <p
                    className="text-base sm:text-xl leading-relaxed mb-8 max-w-xl drop-shadow-sm font-medium"
                    style={{
                      color: slide.description_color || '#F5E9D8',
                    }}
                  >
                    {slide.description_ar}
                  </p>

                  {/* Call to Actions */}
                  <div
                    className={`flex flex-wrap items-center gap-3.5 ${
                      slide.text_alignment === 'center' ? 'justify-center' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleCtaClick(slide.primary_button_url)}
                      style={{
                        backgroundColor: slide.button_bg || '#C6A36A',
                        color: slide.button_text_color || '#2F2B28',
                      }}
                      className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-[14px] font-bold text-sm shadow-xl transition-all active:scale-95 border border-[#C6A36A] group hover:brightness-110"
                    >
                      <span>{slide.primary_button_text}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>

                    {slide.secondary_button_text && (
                      <button
                        onClick={() => handleCtaClick(slide.secondary_button_url || '#')}
                        style={{
                          backgroundColor: slide.secondary_button_bg || 'rgba(255,255,255,0.15)',
                          color: slide.secondary_button_text_color || '#FFFFFF',
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[14px] font-semibold text-sm border border-white/40 backdrop-blur-md transition-all active:scale-95 hover:bg-white/25"
                      >
                        <span>{slide.secondary_button_text}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Split Layout Mode (Text + Visual Card) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Text Side (RTL Right side) */}
                  <div className="lg:col-span-6 flex flex-col items-start text-right z-10">
                    {/* Badge */}
                    {slide.badge_ar && (
                      <div
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-2xs transition-colors"
                        style={{
                          backgroundColor: slide.badge_bg || '#F4ECE2',
                          color: slide.badge_color || '#8A7465',
                          borderColor: '#D9C1A7',
                          borderWidth: '1px',
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#C6A36A]" />
                        <span>{slide.badge_ar}</span>
                      </div>
                    )}

                    {/* Main Heading */}
                    <h1
                      className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.25] font-heading mb-4 transition-colors"
                      style={{
                        color: slide.title_color || '#2F2B28',
                      }}
                    >
                      {slide.title_ar}
                    </h1>

                    {/* Subtitle / Description */}
                    <p
                      className="text-base sm:text-lg leading-relaxed max-w-xl mb-8 transition-colors"
                      style={{
                        color: slide.description_color || '#5F5751',
                      }}
                    >
                      {slide.description_ar}
                    </p>

                    {/* Call to Actions */}
                    <div className="flex flex-wrap items-center gap-3.5">
                      <button
                        onClick={() => handleCtaClick(slide.primary_button_url)}
                        style={{
                          backgroundColor: slide.button_bg || '#2F2B28',
                          color: slide.button_text_color || '#F5E9D8',
                        }}
                        className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[14px] font-bold text-sm shadow-md transition-all active:scale-95 border border-[#4A3E37] group hover:brightness-110"
                      >
                        <span>{slide.primary_button_text}</span>
                        <ArrowUpRight className="w-4 h-4 text-[#C6A36A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>

                      {slide.secondary_button_text && (
                        <button
                          onClick={() => handleCtaClick(slide.secondary_button_url || '#')}
                          style={{
                            backgroundColor: slide.secondary_button_bg || '#F4ECE2',
                            color: slide.secondary_button_text_color || '#6F584A',
                          }}
                          className="inline-flex items-center gap-2 px-5 py-3.5 rounded-[14px] font-semibold text-sm border border-[#D9C1A7] transition-all active:scale-95 hover:brightness-95"
                        >
                          <span>{slide.secondary_button_text}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Showcase Side (Left side in RTL) */}
                  <div className="lg:col-span-6 relative flex justify-center items-center">
                    <div className="relative w-full max-w-[480px] aspect-4/3 sm:aspect-1/1 rounded-[28px] overflow-hidden shadow-2xl border-4 border-white bg-[#F4ECE2]/40 flex items-center justify-center p-2">
                      <img
                        src={slide.desktop_image}
                        alt={slide.title_ar}
                        className={`w-full h-full object-${slide.image_fit || 'contain'} transform hover:scale-105 transition-transform duration-700`}
                        loading="eager"
                      />
                      {/* Subtle luxury gradient vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

                      {/* Micro floating luxury seal */}
                      <div className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-md rounded-[16px] px-3.5 py-2 border border-[#E7D4BC] shadow-md flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#C6A36A] animate-pulse" />
                        <span className="text-xs font-bold text-[#6F584A]">
                          مختارات حصرية أصلية 100%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrows (Right & Left Shift) */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="إزاحة يمين - الشريحة السابقة"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#6F584A] border border-[#E7D4BC] shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#2F2B28]" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="إزاحة يسار - الشريحة التالية"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#6F584A] border border-[#E7D4BC] shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#2F2B28]" />
            </button>
          </>
        )}

        {/* Carousel Slide Indicators */}
        {totalSlides > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/70 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#E7D4BC] shadow-2xs">
            {visibleSlides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToSlide(idx)}
                aria-label={`انتقال للشريحة ${idx + 1}`}
                className={`transition-all rounded-full ${
                  idx === currentIndex
                    ? 'w-7 h-2 bg-[#2F2B28]'
                    : 'w-2 h-2 bg-[#D9C1A7] hover:bg-[#8A7465]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
