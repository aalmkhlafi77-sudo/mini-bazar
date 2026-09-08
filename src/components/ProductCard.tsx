import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Check, AlertCircle, MessageCircle } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    categories,
    brands,
    setSelectedProduct,
    setSelectedBrand,
    storeSettings,
  } = useStore();

  const safeVariants = Array.isArray(product?.variants) && product.variants.length > 0 ? product.variants : [];
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    safeVariants.find((v) => v.is_default)?.id || safeVariants[0]?.id || ''
  );
  const [justAdded, setJustAdded] = useState(false);

  const activeVariant: ProductVariant | undefined =
    safeVariants.find((v) => v.id === selectedVariantId) || safeVariants[0];

  const isFavorited = product?.id ? isInWishlist(product.id) : false;
  const category = categories.find((c) => c.id === product?.category_id);
  const brand = brands.find((b) => b.id === product?.brand_id);
  const isAvailable = (activeVariant?.availability_status ?? product?.availability_status) === 'available';

  const activePrice = activeVariant?.price ?? product?.price ?? 0;
  const activeComparePrice = activeVariant?.compare_at_price ?? product?.compare_at_price;

  // Displayed image: prefer chosen variant image, fallback to primary product image or placeholder
  const displayImage =
    activeVariant?.image_path ||
    (Array.isArray(product?.images) && product.images[0]?.path) ||
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80';

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = (storeSettings?.whatsapp_number || '+966500000000').replace(/\D/g, '');
    const message = encodeURIComponent(
      `مرحباً ميني بازار، أود الاستفسار عن توفر منتج: ${product?.name_ar || ''} (الخيار: ${activeVariant?.name_ar || ''})`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product || !isAvailable) return;
    try {
      addToCart(product, activeVariant?.id, 1, false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error('Error adding to cart from ProductCard:', err);
    }
  };

  const handleVariantSelect = (e: React.MouseEvent, variantId: string) => {
    e.preventDefault();
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
          {product?.is_new && (
            <span className="bg-[#2F2B28] text-[#F5E9D8] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-[#4A3E37]">
              وصل حديثاً
            </span>
          )}
          {product?.is_best_seller && (
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
            if (product?.id) toggleWishlist(product.id);
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
        {activeVariant && safeVariants.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-2xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
            {activeVariant.color_code && (
              <span
                className="w-2 h-2 rounded-full border border-white shrink-0"
                style={{ backgroundColor: activeVariant.color_code }}
              />
            )}
            <span>{activeVariant.name_ar || activeVariant.name_en}</span>
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
        {/* Category & Brand & Rating */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {brand && storeSettings?.brand_settings?.show_on_product_card !== false && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBrand(brand.id);
                  const el = document.getElementById('products-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#6F584A] bg-[#F4ECE2] hover:bg-[#E7D4BC] px-2 py-0.5 rounded-[8px] border border-[#E7D4BC] truncate transition-colors cursor-pointer shrink-0"
                title={`تصفية حسب براند ${brand.name_ar}${brand.name_en ? ` (${brand.name_en})` : ''}`}
              >
                {/* Logo in 'both' or 'logo_only' */}
                {storeSettings?.brand_settings?.display_mode !== 'name_only' && brand.logo_path && (
                  <img
                    src={brand.logo_path}
                    alt={brand.name_ar}
                    className="w-4 h-4 rounded-full object-contain bg-white shrink-0 border border-[#E5D8C9]"
                  />
                )}
                {/* Name in 'both' or 'name_only' */}
                {storeSettings?.brand_settings?.display_mode !== 'logo_only' && (
                  <span className="truncate">{brand.name_ar}</span>
                )}
              </span>
            )}
            <span className="text-[11px] font-semibold text-[#C6A36A] uppercase tracking-wider truncate">
              {category?.name_ar || 'مختارات ميني بازار'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#8A7465] shrink-0">
            <Star className="w-3.5 h-3.5 fill-[#C6A36A] text-[#C6A36A]" />
            <span className="font-bold text-[#2F2B28]">{(Number(product?.rating) || 5.0).toFixed(1)}</span>
            <span className="text-[#7C736D]">({product?.reviews_count || 0})</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-sm sm:text-base font-bold text-[#2F2B28] font-heading group-hover:text-[#6F584A] transition-colors line-clamp-2 min-h-[2.75rem] mb-1.5 leading-snug">
          {product?.name_ar || product?.name_en || 'منتج ميني بازار'}
        </h3>

        {/* Color Swatches Picker on the card: strictly colored circles without text */}
        {safeVariants.length > 1 && (
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-[11px] text-[#8A7465] font-medium shrink-0">اللون:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {safeVariants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                const vName = v.name_ar || v.name_en || '';
                // Determine color swatch: prefer color_code, or fallback to distinctive luxury tone
                const swatchBg =
                  v.color_code ||
                  (vName.includes('ذهب') || vName.includes('ذهبي')
                    ? '#D4AF37'
                    : vName.includes('روز')
                    ? '#B76E79'
                    : vName.includes('أسود')
                    ? '#222222'
                    : vName.includes('عسلي')
                    ? '#C58F49'
                    : vName.includes('بيج') || vName.includes('عاجي')
                    ? '#E6D7C3'
                    : '#8A7465');

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => handleVariantSelect(e, v.id)}
                    title={`${vName} — ${v.price || activePrice} ر.س`}
                    aria-label={vName}
                    className={`relative w-5 h-5 rounded-full transition-all duration-200 shrink-0 ${
                      isSelected
                        ? 'ring-2 ring-[#C6A36A] ring-offset-2 ring-offset-white scale-110 shadow-xs'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: swatchBg }}
                  >
                    <span className="sr-only">{vName}</span>
                    {/* Border to ensure lighter swatches are well-defined */}
                    <span className="absolute inset-0 rounded-full border border-black/20 pointer-events-none" />
                  </button>
                );
              })}
            </div>
            {activeVariant && (
              <span className="text-[11px] text-[#5F5751] font-semibold truncate max-w-[120px]">
                {activeVariant.name_ar || activeVariant.name_en}
              </span>
            )}
          </div>
        )}

        {/* Short description */}
        <p className="text-xs text-[#7C736D] line-clamp-1 mb-2">
          {product?.short_description_ar || product?.description_ar || ''}
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
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          {isAvailable ? (
            <button
              type="button"
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
