import React, { useEffect } from 'react';
import { ShoppingBag, ArrowLeft, X, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartNotificationToast: React.FC = () => {
  const {
    lastAddedNotification,
    clearLastAddedNotification,
    setIsCartOpen,
    setActiveView,
  } = useStore();

  useEffect(() => {
    if (!lastAddedNotification) return;

    const timer = setTimeout(() => {
      clearLastAddedNotification();
    }, 4500);

    return () => clearTimeout(timer);
  }, [lastAddedNotification, clearLastAddedNotification]);

  if (!lastAddedNotification) return null;

  const { product, variant, quantity } = lastAddedNotification;
  const imageSrc =
    variant?.image_path ||
    (Array.isArray(product.images) && product.images[0]?.path) ||
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=200&q=80';

  const price = variant?.price ?? product.price ?? 0;

  return (
    <div
      role="alert"
      dir="rtl"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-45 max-w-md w-[calc(100%-2rem)] sm:w-auto bg-[#2F2B28] text-white rounded-[20px] p-3.5 shadow-2xl border border-[#C6A36A]/40 animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans"
    >
      <div className="flex items-center gap-3">
        {/* Product Thumbnail */}
        <div className="w-12 h-12 rounded-[12px] bg-white/10 overflow-hidden shrink-0 border border-white/15">
          <img
            src={imageSrc}
            alt={product.name_ar}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Message and info */}
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center gap-1.5 text-xs text-[#C6A36A] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
            <span>تمت الإضافة إلى السلة بنجاح</span>
          </div>
          <p className="text-xs font-semibold text-[#F5E9D8] truncate mt-0.5">
            {product.name_ar} {variant ? `(${variant.name_ar})` : ''} {quantity > 1 ? `× ${quantity}` : ''}
          </p>
          <span className="text-[11px] text-[#D9C1A7]" dir="ltr">
            {price * quantity} ر.س
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              clearLastAddedNotification();
              setIsCartOpen(true);
            }}
            className="flex items-center gap-1 bg-[#C6A36A] hover:bg-[#B39158] text-[#2F2B28] text-xs font-bold py-1.5 px-2.5 rounded-xl transition-all active:scale-95 shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>عرض السلة</span>
          </button>

          <button
            onClick={clearLastAddedNotification}
            className="text-white/60 hover:text-white p-1 rounded-lg transition-colors"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
