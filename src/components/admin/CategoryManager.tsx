import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Layers, Image as ImageIcon, Sliders } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { ImageUploader } from '../ImageUploader';
import { CategoryCarouselManager } from './CategoryCarouselManager';

interface CategoryManagerProps {
  onSuccess: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ onSuccess }) => {
  const { categories, products, saveCategory, deleteCategory } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'carousel'>('categories');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAddModal = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name_ar: '',
      name_en: '',
      slug: '',
      description_ar: '',
      description_en: '',
      image_path: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      sort_order: categories.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory({ ...cat });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.name_ar.trim()) {
      alert('يرجى إدخال اسم التصنيف بالعربية');
      return;
    }

    // Auto-generate slug if empty
    const slug = editingCategory.slug || editingCategory.name_en.toLowerCase().replace(/\s+/g, '-') || `cat-${Date.now()}`;

    saveCategory({
      ...editingCategory,
      slug,
    });

    setIsModalOpen(false);
    setEditingCategory(null);
    onSuccess();
  };

  const handleDelete = (cat: Category) => {
    const productsInCat = products.filter((p) => p.category_id === cat.id);
    const confirmMessage = productsInCat.length > 0
      ? `تنبيه: هذا القسم يحتوي على (${productsInCat.length}) منتج. هل أنت متأكد من رغبتك في حذف قسم "${cat.name_ar}"؟`
      : `هل أنت متأكد من حذف قسم "${cat.name_ar}"؟`;

    if (confirm(confirmMessage)) {
      deleteCategory(cat.id);
      onSuccess();
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-[#F4ECE2] rounded-[16px] border border-[#E5D8C9] w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold transition-all ${
            activeSubTab === 'categories'
              ? 'bg-[#2F2B28] text-white shadow-xs'
              : 'text-[#6F584A] hover:bg-[#E7D4BC]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#C6A36A]" />
          <span>إدارة الأقسام والكتالوج ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('carousel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold transition-all ${
            activeSubTab === 'carousel'
              ? 'bg-[#2F2B28] text-white shadow-xs'
              : 'text-[#6F584A] hover:bg-[#E7D4BC]'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#C6A36A]" />
          <span>تخصيص كورسيل التصنيفات المتحرك (Carousel)</span>
        </button>
      </div>

      {activeSubTab === 'carousel' ? (
        <CategoryCarouselManager onSuccess={onSuccess} />
      ) : (
        <>
          {/* Header and Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-[#C6A36A]" />
            <h3 className="text-base font-bold text-[#6F584A] font-heading">
              إدارة التصنيفات والأقسام ({categories.length})
            </h3>
          </div>
          <p className="text-xs text-[#7C736D]">
            يمكنك هنا تعديل وحذف الأقسام الحالية بالكامل، أو إضافة أقسام جديدة مع رفع صور مخصصة من جهازك.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold shadow-xs transition-colors shrink-0 border border-[#4A3E37]"
        >
          <Plus className="w-4 h-4 text-[#C6A36A]" />
          <span>إضافة تصنيف جديد</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-[24px] border border-[#E5D8C9] overflow-hidden shadow-2xs">
        <table className="w-full text-right text-xs">
          <thead className="bg-[#F4ECE2] text-[#6F584A] font-bold">
            <tr>
              <th className="p-4">التصنيف والصورة</th>
              <th className="p-4">الاسم بالإنجليزية</th>
              <th className="p-4">الرابط الفرعي (Slug)</th>
              <th className="p-4">المنتجات المرتبطة</th>
              <th className="p-4">الترتيب</th>
              <th className="p-4">الحالة</th>
              <th className="p-4 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5D8C9]">
            {categories.map((cat) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              return (
                <tr key={cat.id} className="hover:bg-[#FBF8F3] transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={cat.image_path}
                      alt={cat.name_ar}
                      className="w-12 h-12 rounded-[12px] object-cover bg-[#F7F1E8] border border-[#E7D4BC] shrink-0"
                    />
                    <div>
                      <span className="font-bold text-[#2F2B28] block text-sm">{cat.name_ar}</span>
                      {cat.description_ar && (
                        <span className="text-[11px] text-[#7C736D] line-clamp-1">
                          {cat.description_ar}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[#5F5751] font-sans">{cat.name_en || '-'}</td>
                  <td className="p-4 font-mono text-[11px] text-[#7C736D]">{cat.slug}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#F4ECE2] text-[#6F584A] font-bold text-[11px]">
                      {count} منتج
                    </span>
                  </td>
                  <td className="p-4 font-mono font-semibold text-[#8A7465]">{cat.sort_order}</td>
                  <td className="p-4">
                    {cat.is_active ? (
                      <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                        نشط ومفعل
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold">
                        معطل
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-2 rounded-[10px] bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC] transition-colors"
                        title="تعديل التصنيف"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-2 rounded-[10px] bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                        title="حذف التصنيف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </>
      )}

      {/* MODAL: ADD / EDIT CATEGORY */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 text-right border border-[#E5D8C9] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5D8C9] mb-4">
              <h3 className="text-base font-bold text-[#6F584A] font-heading">
                {editingCategory.name_ar ? `تعديل قسم: ${editingCategory.name_ar}` : 'إضافة تصنيف جديد للمتجر'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4ECE2] text-[#6F584A] flex items-center justify-center hover:bg-[#E7D4BC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">اسم القسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name_ar}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name_ar: e.target.value })}
                  placeholder="مثال: حقائب فاخرة، عطور نيش، عبايات"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">اسم القسم بالإنجليزية</label>
                <input
                  type="text"
                  value={editingCategory.name_en}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
                  placeholder="e.g. Luxury Handbags, Niche Fragrances"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">الرابط الفرعي (Slug)</label>
                <input
                  type="text"
                  value={editingCategory.slug}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="cat-luxury-bags"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] font-mono text-[11px]"
                  dir="ltr"
                />
              </div>

              {/* Image Uploader for Category with device upload */}
              <div>
                <ImageUploader
                  value={editingCategory.image_path}
                  onChange={(url) => setEditingCategory({ ...editingCategory, image_path: url })}
                  label="صورة القسم (من الجهاز أو رابط)"
                  aspectRatioHint="يفضل نسبة عرضية أو مربعة 1:1"
                  maxDimension={800}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2F2B28] mb-1">وصف القسم بالعربية</label>
                <textarea
                  rows={2}
                  value={editingCategory.description_ar}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description_ar: e.target.value })}
                  placeholder="مقتنيات مختارة بعناية للمناسبات والأناقة اليومية..."
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#C6A36A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-[#2F2B28] mb-1">ترتيب الظهور</label>
                  <input
                    type="number"
                    value={editingCategory.sort_order}
                    onChange={(e) => setEditingCategory({ ...editingCategory, sort_order: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                    dir="ltr"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="catActiveToggle"
                    checked={editingCategory.is_active}
                    onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                    className="w-4 h-4 accent-[#6F584A]"
                  />
                  <label htmlFor="catActiveToggle" className="font-semibold text-[#2F2B28] cursor-pointer">
                    تفعيل القسم وعرضه بالمتجر
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5D8C9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[#7C736D] hover:text-[#2F2B28]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2F2B28] hover:bg-[#231F1D] text-white font-bold rounded-[12px] shadow-xs border border-[#4A3E37]"
                >
                  <Check className="w-4 h-4 text-[#C6A36A]" />
                  <span>حفظ بيانات القسم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
