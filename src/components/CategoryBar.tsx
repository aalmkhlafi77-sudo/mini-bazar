import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles } from 'lucide-react';

export const CategoryBar: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, products } = useStore();

  const getProductCount = (catId: string) => {
    return products.filter((p) => p.category_id === catId && p.is_active).length;
  };

  return (
    <section id="categories-section" className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C6A36A] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مجموعات مختارة بعناية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2F2B28] font-heading">
            تصنيفات ميني بازار الفاخرة
          </h2>
        </div>

        <button
          onClick={() => setSelectedCategory(null)}
          className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
            selectedCategory === null
              ? 'bg-[#2F2B28] text-white border-[#2F2B28] shadow-xs'
              : 'bg-[#F4ECE2] text-[#2F2B28] border-[#D9C1A7] hover:bg-[#E7D4BC]'
          }`}
        >
          عرض جميع الأقسام ({products.length})
        </button>
      </div>

      {/* Categories Horizontal Track */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getProductCount(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
              className={`group relative flex flex-col items-center p-3 rounded-[20px] transition-all text-center border overflow-hidden ${
                isSelected
                  ? 'bg-[#F4ECE2] border-[#C6A36A] ring-2 ring-[#C6A36A]/40 shadow-sm'
                  : 'bg-white hover:bg-[#FBF8F3] border-[#E7D4BC] shadow-2xs hover:shadow-xs'
              }`}
            >
              {/* Category Image */}
              <div className="relative w-full aspect-1/1 rounded-[16px] overflow-hidden mb-3 bg-[#F4ECE2]">
                <img
                  src={cat.image_path}
                  alt={cat.name_ar}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                  {count} قطع
                </span>
              </div>

              {/* Title & Description */}
              <span className={`text-sm font-bold transition-colors font-heading ${
                isSelected ? 'text-[#6F584A]' : 'text-[#2F2B28] group-hover:text-[#6F584A]'
              }`}>
                {cat.name_ar}
              </span>

              <span className="text-[11px] text-[#7C736D] line-clamp-1 mt-0.5">
                {cat.description_ar}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
