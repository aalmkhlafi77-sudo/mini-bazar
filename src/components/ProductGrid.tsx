import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Sparkles, SlidersHorizontal, PackageSearch } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { products, selectedCategory, setSelectedCategory, categories, searchQuery, setSearchQuery } = useStore();
  const [filterType, setFilterType] = useState<'all' | 'best_seller' | 'new'>('all');

  // Filter products by active category, search query, and filter tag
  const filteredProducts = products.filter((p) => {
    if (!p.is_active) return false;
    if (selectedCategory && p.category_id !== selectedCategory) return false;
    if (filterType === 'best_seller' && !p.is_best_seller) return false;
    if (filterType === 'new' && !p.is_new) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNameAr = p.name_ar.toLowerCase().includes(q);
      const matchNameEn = p.name_en.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchDesc = p.description_ar.toLowerCase().includes(q);
      return matchNameAr || matchNameEn || matchSku || matchDesc;
    }

    return true;
  });

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <section id="products-section" className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C6A36A] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مختارات استثنائية</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#2F2B28] font-heading">
            {activeCategoryObj ? activeCategoryObj.name_ar : 'كتالوج المنتجات المختارة'}
          </h2>

          {activeCategoryObj && (
            <p className="text-sm text-[#7C736D] mt-1 max-w-2xl">
              {activeCategoryObj.description_ar}
            </p>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-[#2F2B28] text-white shadow-2xs border border-[#4A3E37]'
                : 'bg-[#F4ECE2] text-[#2F2B28] hover:bg-[#E7D4BC]'
            }`}
          >
            جميع المعروضات ({filteredProducts.length})
          </button>

          <button
            onClick={() => setFilterType('best_seller')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              filterType === 'best_seller'
                ? 'bg-[#2F2B28] text-white shadow-2xs border border-[#4A3E37]'
                : 'bg-[#F4ECE2] text-[#2F2B28] hover:bg-[#E7D4BC]'
            }`}
          >
            الأكثر طلباً
          </button>

          <button
            onClick={() => setFilterType('new')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              filterType === 'new'
                ? 'bg-[#2F2B28] text-white shadow-2xs border border-[#4A3E37]'
                : 'bg-[#F4ECE2] text-[#2F2B28] hover:bg-[#E7D4BC]'
            }`}
          >
            وصل حديثاً
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-[#F7F1E8]/50 rounded-[28px] border border-[#E7D4BC] my-8">
          <div className="w-16 h-16 rounded-full bg-[#F4ECE2] text-[#C6A36A] flex items-center justify-center mx-auto mb-4">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#2F2B28] mb-2 font-heading">
            لم نتمكن من العثور على نتائج مطابقة
          </h3>
          <p className="text-xs text-[#7C736D] max-w-md mx-auto mb-6">
            جربي البحث بكلمات أخرى أو تصفحي أقسام المتجر المختلفة للوصول إلى المنتجات المرغوبة.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                setFilterType('all');
              }}
              className="px-5 py-2.5 rounded-[14px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-semibold shadow-xs"
            >
              عرض كافة المعروضات
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
