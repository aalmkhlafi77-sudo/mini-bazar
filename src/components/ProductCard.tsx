import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, categories, setSelectedProduct, storeSettings } = useStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants.find((v) => v.is_default)?.id || product.variants[0]?.id || ''
  );
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant: ProductVariant | undefined =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const isFavorited = isInWishlist(product.id);
  const category = categories.find((c) => c.id === product.category_id);
  const isAvailable = (activeVariant?.availability_status ?? product.availability_status) === 'available';

  const activePrice = activeVariant?.price ?? product.price;
  const activeComparePrice = activeVariant?.compare_at_price ?? product.compare_at_price;

  // Displayed image: prefer chosen variant image, fallback to primary product image
  const displayImage = activeVariant?.image_path || product.images[0]?.path;

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = storeSettings.whatsapp_number.replace(/\D/g, '');
    const message = encodeURIComponent(
      `مرحباً ميني بازار، أود الاستفسار عن توفر منتج: ${product.name_ar} (الخيار: ${activeVariant?.name_ar || ''})`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    addToCart(product, activeVariant?.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleVariantSelect = (e: React.MouseEvent, variantId: string) => {
    e.stopPropagation();
    setSelectedVariantId(variantId);
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative flex flex-col h-full bg-white rounded-[20px] border border-[#E5D8C9] hover:border-[#C6A36A] shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setSelectedProduct(product);
        }
      }}
    >
      {/* 1. Image Container with Badges and Wishlist button */}
      <div className="relative w-full aspect-4/3 sm:aspect-1/1 overflow-hidden bg-[#F7F1E8]">
        <img
          src={displayImage}
          alt={activeVariant?.name_ar || product.name_ar}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500"
          loading="lazy"
        />

        {/* Badges Top Right (RTL) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          {product.is_new && (
            <span className="bg-[#2F2B28] text-[#F5E9D8] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-[#4A3E37]">
              وصل حديثاً
            </span>
          )}
          {product.is_best_seller && (
            <span className="bg-[#C6A36A] text-[#2F2B28] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
              الأكثر طلباً
            </span>
          )}
          {activeComparePrice && activeComparePrice > activePrice && (
            <span className="bg-[#B4574A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              وفر {activeComparePrice - activePrice} ر.س
            </span>
          )}
        </div>

        {/* Wishlist Top Left (RTL) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isFavorited ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#6F584A] shadow-sm flex items-center justify-center transition-transform active:scale-90 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited ? 'fill-[#B4574A] text-[#B4574A]' : 'text-[#8A7465]'
            }`}
          />
        </button>

        {/* Selected Variant pill tag over image */}
        {activeVariant && product.variants.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-2xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
            {activeVariant.color_code && (
              <span
                className="w-2 h-2 rounded-full border border-white shrink-0"
                style={{ backgroundColor: activeVariant.color_code }}
              />
            )}
            <span>{activeVariant.name_ar}</span>
          </div>
        )}

        {/* Availability Badge Overlay if out of stock */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center z-15">
            <span className="bg-[#B4574A] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              نفدت الكمية حالياً
            </span>
          </div>
        )}
      </div>

      {/* 2. Content Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 text-right">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-semibold text-[#C6A36A] uppercase tracking-wider">
            {category?.name_ar || 'مختارات ميني بازار'}
          </span>

          <div className="flex items-center gap-1 text-[11px] text-[#8A7465]">
            <Star className="w-3.5 h-3.5 fill-[#C6A36A] text-[#C6A36A]" />
            <span className="font-bold text-[#2F2B28]">{product.rating.toFixed(1)}</span>
            <span className="text-[#7C736D]">({product.reviews_count})</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-sm sm:text-base font-bold text-[#2F2B28] font-heading group-hover:text-[#6F584A] transition-colors line-clamp-2 min-h-[2.75rem] mb-1.5 leading-snug">
          {product.name_ar}
        </h3>

        {/* Color Swatches Picker on the card: strictly colored circles without text */}
        {product.variants.length > 1 && (
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-[11px] text-[#8A7465] font-medium shrink-0">اللون:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.variants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                // Determine color swatch: prefer color_code, or fallback to distinctive luxury tone
                const swatchBg =
                  v.color_code ||
                  (v.name_ar.includes('ذهب') || v.name_ar.includes('ذهبي')
                    ? '#D4AF37'
                    : v.name_ar.includes('روز')
                    ? '#B76E79'
                    : v.name_ar.includes('أسود')
                    ? '#222222'
                    : v.name_ar.includes('عسلي')
                    ? '#C58F49'
                    : v.name_ar.includes('بيج') || v.name_ar.includes('عاجي')
                    ? '#E6D7C3'
                    : '#8A7465');

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => handleVariantSelect(e, v.id)}
                    title={`${v.name_ar} — ${v.price} ر.س`}
                    aria-label={v.name_ar}
                    className={`relative w-5 h-5 rounded-full transition-all duration-200 shrink-0 ${
                      isSelected
                        ? 'ring-2 ring-[#C6A36A] ring-offset-2 ring-offset-white scale-110 shadow-xs'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: swatchBg }}
                  >
                    <span className="sr-only">{v.name_ar}</span>
                    {/* Border to ensure lighter swatches are well-defined */}
                    <span className="absolute inset-0 rounded-full border border-black/20 pointer-events-none" />
                  </button>
                );
              })}
            </div>
            {activeVariant && (
              <span className="text-[11px] text-[#5F5751] font-semibold truncate max-w-[120px]">
                {activeVariant.name_ar}
              </span>
            )}
          </div>
        )}

        {/* Short description */}
        <p className="text-xs text-[#7C736D] line-clamp-1 mb-2">
          {product.short_description_ar}
        </p>

        {/* Price Row */}
        <div className="mt-auto pt-2.5 border-t border-[#F4ECE2] flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-bold text-[#2F2B28] font-heading" dir="ltr">
              {activePrice} <span className="text-xs font-medium text-[#8A7465]">ر.س</span>
            </span>
            {activeComparePrice && activeComparePrice > activePrice && (
              <span className="text-xs text-[#7C736D] line-through" dir="ltr">
                {activeComparePrice} ر.س
              </span>
            )}
          </div>

          <div className="text-[11px] font-medium flex items-center gap-1">
            {isAvailable ? (
              <span className="text-[#607866] flex items-center gap-0.5">
                <Check className="w-3 h-3" />
                <span>متوفر</span>
              </span>
            ) : (
              <span className="text-[#B4574A] flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" />
                <span>طلب مسبق</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Bottom Action Button (Fixed Bottom - Unified identity #2F2B28 with exact text "أضف إلى السلة") */}
        <div className="mt-3">
          {isAvailable ? (
            <button
              onClick={handleAddToCartClick}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[14px] font-bold text-xs transition-all duration-200 shadow-2xs group/btn active:scale-98 border border-[#4A3E37] ${
                justAdded
                  ? 'bg-[#3F5042] text-white'
                  : 'bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 text-[#C6A36A]" />
                  <span>تمت الإضافة للسلة بنجاح ✓</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#C6A36A] group-hover/btn:scale-110 transition-transform" />
                  <span>أضف إلى السلة</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleWhatsAppInquiry}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[14px] bg-[#F7F1E8] hover:bg-[#E7D4BC] text-[#8A7465] font-semibold text-xs border border-[#D9C1A7] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>تواصل عبر واتساب للتوفير</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
