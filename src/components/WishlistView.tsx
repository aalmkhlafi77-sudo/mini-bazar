import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Heart, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, products, setActiveView, setSelectedCategory } = useStore();

  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="py-10 px-4 sm:px-8 max-w-7xl mx-auto min-h-[60vh] font-sans text-right">
      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#E5D8C9] pb-6">
        <div>
          <button
            onClick={() => setActiveView('store')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8A7465] hover:text-[#2F2B28] mb-2 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للمتجر</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C6A36A] mb-1">
            <Heart className="w-4 h-4 fill-current text-[#B4574A]" />
            <span>قائمتك المفضلة</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2F2B28] font-heading">
            المقتنيات المحفوظة ({favoriteProducts.length})
          </h1>
        </div>

        {favoriteProducts.length > 0 && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setActiveView('store');
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#2F2B28] text-[#F5E9D8] hover:bg-[#231F1D] text-xs font-semibold shadow-xs transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-[#C6A36A]" />
            <span>متابعة التسوق واستعراض المزيد</span>
          </button>
        )}
      </div>

      {/* Wishlist Items Grid or Empty State */}
      {favoriteProducts.length === 0 ? (
        <div className="bg-[#FBF8F3] border border-[#E5D8C9] rounded-[24px] p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#F4ECE2] text-[#B4574A] flex items-center justify-center mx-auto mb-4 border border-[#D9C1A7]">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#2F2B28] mb-2 font-heading">
            قائمة المفضلة فارغة حالياً
          </h2>
          <p className="text-xs sm:text-sm text-[#7C736D] mb-6 leading-relaxed">
            لم تقومي بحفظ أي قطعة بعد. تصفحي مجموعاتنا الفاخرة واضغطي على رمز القلب لحفظ مقتنياتك المفضلة والعودة إليها في أي وقت.
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setActiveView('store');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2F2B28] text-[#F5E9D8] hover:bg-[#231F1D] text-sm font-semibold transition-all shadow-md active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#C6A36A]" />
            <span>استكشاف تشكيلة ميني بازار</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
