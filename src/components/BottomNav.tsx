import React from 'react';
import { Home, LayoutGrid, Heart, ShoppingBag, User, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const BottomNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    cartCount,
    setIsCartOpen,
    wishlist,
    setSelectedCategory,
  } = useStore();

  const handleHomeClick = () => {
    setSelectedCategory(null);
    setActiveView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStoreClick = () => {
    if (activeView !== 'store') {
      setActiveView('store');
    }
    const el = document.getElementById('products-section') || document.getElementById('categories-bar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleWishlistClick = () => {
    setActiveView('wishlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleAccountClick = () => {
    setActiveView(activeView === 'admin' ? 'store' : 'admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHomeActive = activeView === 'store';
  const isWishlistActive = activeView === 'wishlist';
  const isAdminActive = activeView === 'admin';

  return (
    <nav
      aria-label="قائمة التنقل السفلية للجوال"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBF8F3]/95 backdrop-blur-md border-t border-[#E5D8C9] px-2 py-1.5 shadow-[0_-4px_24px_rgba(47,43,40,0.08)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center justify-around">
        {/* 1. الرئيسية */}
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all relative ${
            isHomeActive ? 'text-[#2F2B28] font-bold' : 'text-[#8A7465] hover:text-[#2F2B28]'
          }`}
          aria-label="الرئيسية"
        >
          <div className="relative p-1">
            <Home className={`w-5 h-5 ${isHomeActive ? 'text-[#C6A36A] stroke-[2.4]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[10px] mt-0.5 whitespace-nowrap ${isHomeActive ? 'text-[#2F2B28] font-bold' : 'text-[#7C736D]'}`}>
            الرئيسية
          </span>
          {isHomeActive && (
            <span className="w-1.5 h-1 rounded-full bg-[#C6A36A] absolute top-0.5" />
          )}
        </button>

        {/* 2. المتجر / الأقسام */}
        <button
          onClick={handleStoreClick}
          className="flex flex-col items-center justify-center py-1 px-1 transition-all text-[#8A7465] hover:text-[#2F2B28]"
          aria-label="المتجر"
        >
          <div className="relative p-1">
            <LayoutGrid className="w-5 h-5 stroke-[1.8] text-[#8A7465]" />
          </div>
          <span className="text-[10px] mt-0.5 whitespace-nowrap text-[#7C736D]">
            المتجر
          </span>
        </button>

        {/* 3. المفضلة */}
        <button
          onClick={handleWishlistClick}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all relative ${
            isWishlistActive ? 'text-[#2F2B28] font-bold' : 'text-[#8A7465] hover:text-[#2F2B28]'
          }`}
          aria-label="المفضلة"
        >
          <div className="relative p-1">
            <Heart className={`w-5 h-5 ${isWishlistActive ? 'text-[#B4574A] fill-[#B4574A] stroke-[2.2]' : 'stroke-[1.8]'}`} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#B4574A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-[#FBF8F3]">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className={`text-[10px] mt-0.5 whitespace-nowrap ${isWishlistActive ? 'text-[#2F2B28] font-bold' : 'text-[#7C736D]'}`}>
            المفضلة
          </span>
          {isWishlistActive && (
            <span className="w-1.5 h-1 rounded-full bg-[#B4574A] absolute top-0.5" />
          )}
        </button>

        {/* 4. السلة */}
        <button
          onClick={handleCartClick}
          className="flex flex-col items-center justify-center py-1 px-1 transition-all relative text-[#8A7465] hover:text-[#2F2B28]"
          aria-label="السلة"
        >
          <div className="relative p-1">
            <ShoppingBag className="w-5 h-5 stroke-[1.8] text-[#8A7465]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#C6A36A] text-[#2F2B28] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-[#FBF8F3]">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 whitespace-nowrap text-[#7C736D]">
            السلة
          </span>
        </button>

        {/* 5. الحساب / الإدارة */}
        <button
          onClick={handleAccountClick}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all relative ${
            isAdminActive ? 'text-[#2F2B28] font-bold' : 'text-[#8A7465] hover:text-[#2F2B28]'
          }`}
          aria-label="الحساب"
        >
          <div className="relative p-1">
            {isAdminActive ? (
              <ShieldCheck className="w-5 h-5 text-[#C6A36A] stroke-[2.2]" />
            ) : (
              <User className="w-5 h-5 stroke-[1.8] text-[#8A7465]" />
            )}
          </div>
          <span className={`text-[10px] mt-0.5 whitespace-nowrap ${isAdminActive ? 'text-[#2F2B28] font-bold' : 'text-[#7C736D]'}`}>
            {isAdminActive ? 'المتجر' : 'الحساب'}
          </span>
          {isAdminActive && (
            <span className="w-1.5 h-1 rounded-full bg-[#C6A36A] absolute top-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
