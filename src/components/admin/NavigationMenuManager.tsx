import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Link2,
  Home,
  Layers,
  Tag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { NavigationItem, NavigationItemType } from '../../types';

export const NavigationMenuManager: React.FC = () => {
  const { storeSettings, updateStoreSettings, categories } = useStore();

  const [items, setItems] = useState<NavigationItem[]>(
    storeSettings.navigation_items || []
  );

  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state when storeSettings changes
  React.useEffect(() => {
    if (storeSettings.navigation_items) {
      setItems(storeSettings.navigation_items);
    }
  }, [storeSettings.navigation_items]);

  const saveItems = (updated: NavigationItem[]) => {
    setItems(updated);
    updateStoreSettings({ navigation_items: updated });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate sort_order
    const reordered = newItems.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    saveItems(reordered);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنتِ متأكدة من رغبتك في حذف هذا العنصر من القائمة؟')) {
      const filtered = items.filter((it) => it.id !== id);
      saveItems(filtered);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = items.map((it) =>
      it.id === id ? { ...it, is_active: !it.is_active } : it
    );
    saveItems(updated);
  };

  const handleOpenAdd = () => {
    setEditingItem({
      id: `nav-${Date.now()}`,
      title_ar: '',
      type: 'category',
      category_id: categories[0]?.id || '',
      badge: '',
      is_active: true,
      sort_order: items.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NavigationItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const exists = items.some((it) => it.id === editingItem.id);
    let updated: NavigationItem[];
    if (exists) {
      updated = items.map((it) => (it.id === editingItem.id ? editingItem : it));
    } else {
      updated = [...items, editingItem];
    }
    saveItems(updated);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleRestoreDefaults = () => {
    if (confirm('هل ترغبين في استعادة القائمة الرئيسية الأصلية للمتجر؟')) {
      const defaults: NavigationItem[] = [
        { id: 'nav-home', title_ar: 'الرئيسية', type: 'home', is_active: true, sort_order: 1 },
        { id: 'nav-bags', title_ar: 'الحقائب الفاخرة', type: 'category', category_id: 'cat-bags', is_active: true, sort_order: 2 },
        { id: 'nav-watches', title_ar: 'الساعات الأنيقة', type: 'category', category_id: 'cat-watches', is_active: true, sort_order: 3 },
        { id: 'nav-eyewear', title_ar: 'النظارات الشمسية', type: 'category', category_id: 'cat-eyewear', is_active: true, sort_order: 4 },
        { id: 'nav-perfumes', title_ar: 'العطور الاستثنائية', type: 'category', category_id: 'cat-perfumes', is_active: true, sort_order: 5 },
        { id: 'nav-accessories', title_ar: 'الهدايا والإكسسوارات', type: 'category', category_id: 'cat-accessories', is_active: true, sort_order: 6 },
        { id: 'nav-offers', title_ar: 'العروض الحصرية', type: 'offers', badge: 'خصومات', is_active: true, sort_order: 7 },
      ];
      saveItems(defaults);
    }
  };

  const getItemTypeIcon = (type: NavigationItemType) => {
    switch (type) {
      case 'home':
        return <Home className="w-3.5 h-3.5 text-[#8A7465]" />;
      case 'category':
        return <Layers className="w-3.5 h-3.5 text-[#C6A36A]" />;
      case 'offers':
        return <Tag className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Link2 className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getItemTypeLabel = (type: NavigationItemType) => {
    switch (type) {
      case 'home':
        return 'الرئيسية';
      case 'category':
        return 'قسم منتجات';
      case 'offers':
        return 'عروض حصرية';
      default:
        return 'رابط مخصص';
    }
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5D8C9]">
        <div>
          <div className="flex items-center gap-2">
            <Menu className="w-4 h-4 text-[#C6A36A]" />
            <h3 className="text-base font-bold text-[#6F584A] font-heading">
              إدارة عناصر القائمة الرئيسية ومسمياتها
            </h3>
          </div>
          <p className="text-xs text-[#7C736D] mt-1">
            تحكمي بالروابط الظاهرة في أعلى المتجر وشاشة الموبايل، تعديل التسميات، الشارات الترويجية، والترتيب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] text-xs font-semibold transition-colors"
            title="استعادة القائمة الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">استعادة الافتراضي</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold border border-[#4A3E37] shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C6A36A]" />
            <span>إضافة رابط للقائمة</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#7C736D] bg-[#FBF8F3] rounded-[16px] border border-dashed border-[#D9C1A7]">
            لم يتم إضافة أي روابط بعد. اضغطي على "استعادة الافتراضي" أو "إضافة رابط".
          </div>
        ) : (
          items.map((item, index) => {
            const linkedCat = categories.find((c) => c.id === item.category_id);

            return (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[16px] border transition-all ${
                  item.is_active
                    ? 'bg-[#FBF8F3] border-[#E7D4BC]'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                {/* Left info */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1 rounded text-[#8A7465] hover:bg-[#E7D4BC] disabled:opacity-30 disabled:hover:bg-transparent"
                      title="تحريك لأعلى"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 rounded text-[#8A7465] hover:bg-[#E7D4BC] disabled:opacity-30 disabled:hover:bg-transparent"
                      title="تحريك لأسفل"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2 rounded-[10px] bg-white border border-[#E5D8C9]">
                    {getItemTypeIcon(item.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#2F2B28]">
                        {item.title_ar}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#C6A36A]/20 text-[#8A7465] border border-[#C6A36A]/40">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#7C736D] mt-0.5">
                      <span>{getItemTypeLabel(item.type)}</span>
                      {item.type === 'category' && linkedCat && (
                        <span>• مربوط بـ: {linkedCat.name_ar}</span>
                      )}
                      {item.type === 'custom' && item.url && (
                        <span dir="ltr" className="text-[10px] truncate max-w-[180px]">
                          • {item.url}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item.id)}
                    className={`px-2.5 py-1 rounded-[8px] text-[11px] font-semibold transition-colors ${
                      item.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {item.is_active ? 'نشط' : 'معطل'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-[8px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A]"
                    title="تعديل"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-[8px] bg-rose-50 hover:bg-rose-100 text-rose-700"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADD / EDIT MENU ITEM */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 text-right border border-[#E5D8C9] shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5D8C9]">
              <h3 className="text-base font-bold text-[#6F584A] font-heading">
                {items.some((it) => it.id === editingItem.id)
                  ? 'تعديل عنصر في القائمة'
                  : 'إضافة رابط جديد للقائمة'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#2F2B28]">
                  مسمى العنصر (بالعربية) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title_ar}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, title_ar: e.target.value })
                  }
                  placeholder="مثال: الحقائب الفاخرة، أحدث الواصلين..."
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#2F2B28]">نوع الرابط *</label>
                <select
                  value={editingItem.type}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      type: e.target.value as NavigationItemType,
                    })
                  }
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                >
                  <option value="home">صفحة البداية / الرئيسية</option>
                  <option value="category">قسم منتجات من التصنيفات</option>
                  <option value="offers">العروض الحصرية والتخفيضات</option>
                  <option value="custom">رابط مخصص أو خارجي</option>
                </select>
              </div>

              {editingItem.type === 'category' && (
                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">
                    اختر القسم المرتبط
                  </label>
                  <select
                    value={editingItem.category_id || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, category_id: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editingItem.type === 'custom' && (
                <div>
                  <label className="block font-semibold mb-1 text-[#2F2B28]">
                    الرابط المخصص (URL أو وسم #)
                  </label>
                  <input
                    type="text"
                    value={editingItem.url || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, url: e.target.value })
                    }
                    placeholder="مثال: https://... أو #products-section"
                    dir="ltr"
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-[#2F2B28]">
                  شارة مميزة (Badge اختياري)
                </label>
                <input
                  type="text"
                  value={editingItem.badge || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, badge: e.target.value })
                  }
                  placeholder="مثال: جديد، حصري، خصم 20%"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="navActiveToggle"
                  checked={editingItem.is_active}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, is_active: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#2F2B28]"
                />
                <label htmlFor="navActiveToggle" className="font-semibold text-[#2F2B28]">
                  تفعيل وظهور هذا العنصر في القائمة
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E5D8C9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[#7C736D]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2F2B28] text-white font-bold rounded-[12px] hover:bg-[#231F1D]"
                >
                  حفظ وتثبيت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
