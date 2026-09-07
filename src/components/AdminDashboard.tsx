import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Sliders,
  Sparkles,
  Plus,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  FileText,
  Printer,
  Eye,
  RotateCcw,
  Save,
  MessageCircle,
  ChevronDown,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  Layers,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, Product, HeroSlide } from '../types';
import { CategoryManager } from './admin/CategoryManager';
import { ProductModal } from './admin/ProductModal';
import { LogoCustomizer } from './admin/LogoCustomizer';
import { ImageUploader } from './ImageUploader';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    products,
    categories,
    updateOrderStatus,
    addManualOrder,
    saveProduct,
    deleteProduct,
    heroSlides,
    updateHeroSlides,
    storeSettings,
    updateStoreSettings,
    themeSettings,
    updateThemeSettings,
    publishCustomization,
    hasUnpublishedChanges,
    restoreDefaultCustomization,
    setActiveView,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'categories' | 'customize'>('overview');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [newStatusToApply, setNewStatusToApply] = useState<OrderStatus>('confirmed');

  // Manual WhatsApp Order Modal
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualCity, setManualCity] = useState('الرياض');
  const [manualDistrict, setManualDistrict] = useState('');
  const [manualSelectedProductId, setManualSelectedProductId] = useState(products[0]?.id || '');
  const [manualPrice, setManualPrice] = useState(products[0]?.price || 350);

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Edit Slide Modal
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);

  // Success toast
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Stats calculation
  const totalRevenue = orders.reduce((acc, o) => acc + o.grand_total, 0);
  const newOrdersCount = orders.filter((o) => o.status === 'new').length;
  const activeProductsCount = products.filter((p) => p.is_active).length;

  const handleUpdateStatus = () => {
    if (!selectedOrderForDetail) return;
    updateOrderStatus(selectedOrderForDetail.id, newStatusToApply, statusChangeNote);
    setStatusChangeNote('');
    setSelectedOrderForDetail((prev) => (prev ? { ...prev, status: newStatusToApply } : null));
    triggerToast();
  };

  const triggerToast = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenProduct = products.find((p) => p.id === manualSelectedProductId) || products[0];

    addManualOrder({
      customer_name_snapshot: manualCustomerName,
      customer_phone_snapshot: manualCustomerPhone,
      address_snapshot: {
        country: 'المملكة العربية السعودية',
        city: manualCity,
        district: manualDistrict || 'وسط المدينة',
        street: 'شارع عام',
      },
      subtotal: Number(manualPrice),
      delivery_fee: 35,
      items: [
        {
          product_id: chosenProduct.id,
          product_name_snapshot: chosenProduct.name_ar,
          sku_snapshot: chosenProduct.sku,
          unit_price: Number(manualPrice),
          quantity: 1,
          line_total: Number(manualPrice),
          image_snapshot: chosenProduct.images[0]?.path,
        },
      ],
    });

    setIsManualOrderModalOpen(false);
    setManualCustomerName('');
    setManualCustomerPhone('');
    triggerToast();
  };

  const handleSaveSlideForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    const existingIndex = heroSlides.findIndex((s) => s.id === editingSlide.id);
    let updated: HeroSlide[];
    if (existingIndex > -1) {
      updated = [...heroSlides];
      updated[existingIndex] = editingSlide;
    } else {
      updated = [...heroSlides, editingSlide];
    }
    updateHeroSlides(updated);
    setIsSlideModalOpen(false);
    setEditingSlide(null);
    triggerToast();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">جديد</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">مؤكد</span>;
      case 'preparing':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">قيد التجهيز</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">خرج للتوصيل</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-800">تم التسليم</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">ملغي</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto text-right">
      {/* Save Notification Toast */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#607866] text-white px-5 py-3 rounded-[16px] shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4" />
          <span>تم حفظ التعديلات واعتماد البيانات بنجاح</span>
        </div>
      )}

      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5D8C9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C6A36A] animate-pulse" />
            <span className="text-xs font-bold text-[#C6A36A]">نظام الإدارة الفاخر المعتمد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#6F584A] font-heading">
            لوحة إدارة وتخصيص ميني بازار
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {hasUnpublishedChanges && (
            <span className="text-xs font-semibold text-[#B68A45] bg-[#FFF8EE] px-3 py-1.5 rounded-full border border-[#B68A45]/30">
              يوجد مسودات غير منشورة
            </span>
          )}

          <button
            onClick={() => {
              publishCustomization();
              triggerToast();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] text-xs font-bold shadow-xs transition-all active:scale-95 border border-[#4A3E37]"
          >
            <Save className="w-4 h-4 text-[#C6A36A]" />
            <span>نشر التغييرات على المتجر</span>
          </button>

          <button
            onClick={() => setActiveView('store')}
            className="px-4 py-2.5 rounded-[14px] bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#2F2B28] text-xs font-semibold"
          >
            معاينة المتجر
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 border-b border-[#E5D8C9]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-bold transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#2F2B28] text-white shadow-2xs'
              : 'bg-[#F4ECE2] text-[#5F5751] hover:bg-[#E7D4BC]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>نظرة عامة ومؤشرات</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-bold transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'bg-[#2F2B28] text-white shadow-2xs'
              : 'bg-[#F4ECE2] text-[#5F5751] hover:bg-[#E7D4BC]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>إدارة الطلبات ({orders.length})</span>
          {newOrdersCount > 0 && (
            <span className="bg-[#C6A36A] text-[#2F2B28] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {newOrdersCount} جديد
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-bold transition-all shrink-0 ${
            activeTab === 'products'
              ? 'bg-[#2F2B28] text-white shadow-2xs'
              : 'bg-[#F4ECE2] text-[#5F5751] hover:bg-[#E7D4BC]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>الكتالوج والمنتجات ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-bold transition-all shrink-0 ${
            activeTab === 'categories'
              ? 'bg-[#2F2B28] text-white shadow-2xs'
              : 'bg-[#F4ECE2] text-[#5F5751] hover:bg-[#E7D4BC]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>إدارة التصنيفات ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customize')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-xs font-bold transition-all shrink-0 ${
            activeTab === 'customize'
              ? 'bg-[#2F2B28] text-white shadow-2xs'
              : 'bg-[#F4ECE2] text-[#5F5751] hover:bg-[#E7D4BC]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>تخصيص الهوية والواجهة</span>
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-[22px] border border-[#E5D8C9] shadow-2xs">
              <span className="text-xs text-[#7C736D] block mb-1">إجمالي المبيعات المعتمدة</span>
              <span className="text-2xl font-bold text-[#6F584A] font-heading" dir="ltr">
                {totalRevenue.toLocaleString()} <span className="text-xs font-normal text-[#8A7465]">ر.س</span>
              </span>
            </div>

            <div className="bg-white p-5 rounded-[22px] border border-[#E5D8C9] shadow-2xs">
              <span className="text-xs text-[#7C736D] block mb-1">عدد الطلبات المسجلة</span>
              <span className="text-2xl font-bold text-[#2F2B28] font-heading">
                {orders.length} <span className="text-xs text-[#7C736D]">طلب</span>
              </span>
            </div>

            <div className="bg-white p-5 rounded-[22px] border border-[#E5D8C9] shadow-2xs">
              <span className="text-xs text-[#7C736D] block mb-1">الطلبات الجديدة غير المعالجة</span>
              <span className="text-2xl font-bold text-[#B4574A] font-heading">
                {newOrdersCount} <span className="text-xs text-[#7C736D]">طلب</span>
              </span>
            </div>

            <div className="bg-white p-5 rounded-[22px] border border-[#E5D8C9] shadow-2xs">
              <span className="text-xs text-[#7C736D] block mb-1">المنتجات النشطة في الكتالوج</span>
              <span className="text-2xl font-bold text-[#607866] font-heading">
                {activeProductsCount} <span className="text-xs text-[#7C736D]">منتج</span>
              </span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-[#F7F1E8] p-6 rounded-[24px] border border-[#E7D4BC] flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#6F584A] font-heading mb-1">
                الإجراءات السريعة
              </h3>
              <p className="text-xs text-[#7C736D]">
                إدخال طلب واتساب يدوي أو إضافة قطع جديدة للكتالوج.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsManualOrderModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#25D366] text-white text-xs font-bold shadow-xs hover:bg-[#1EBE5D]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إدخال طلب يدوي من واتساب</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct({
                    id: `prod-${Date.now()}`,
                    category_id: categories[0]?.id || 'cat-bags',
                    name_ar: '',
                    name_en: '',
                    slug: '',
                    sku: `MB-NEW-${Math.floor(100 + Math.random() * 900)}`,
                    short_description_ar: '',
                    short_description_en: '',
                    description_ar: '',
                    description_en: '',
                    price: 299,
                    compare_at_price: 399,
                    availability_status: 'available',
                    is_featured: true,
                    is_new: true,
                    is_best_seller: false,
                    is_active: true,
                    sort_order: products.length + 1,
                    rating: 5.0,
                    reviews_count: 1,
                    images: [
                      {
                        id: `img-${Date.now()}`,
                        product_id: '',
                        path: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
                        alt_text_ar: 'صورة المنتج',
                        alt_text_en: 'Product image',
                        sort_order: 1,
                        is_primary: true,
                      },
                    ],
                    variants: [],
                  });
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold shadow-xs border border-[#4A3E37]"
              >
                <Plus className="w-4 h-4 text-[#C6A36A]" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-[24px] border border-[#E5D8C9] p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-[#2F2B28] font-heading mb-4">
              أحدث طلبات الزبائن
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F4ECE2] text-[#2F2B28] font-bold">
                  <tr>
                    <th className="p-3">رقم الطلب</th>
                    <th className="p-3">العميل</th>
                    <th className="p-3">المدينة</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">المصدر</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-left">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D8C9]">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-[#FBF8F3]">
                      <td className="p-3 font-mono font-bold text-[#2F2B28]">{order.order_number}</td>
                      <td className="p-3 font-semibold text-[#2F2B28]">{order.customer_name_snapshot}</td>
                      <td className="p-3 text-[#5F5751]">{order.address_snapshot.city}</td>
                      <td className="p-3 font-bold text-[#2F2B28]" dir="ltr">{order.grand_total} ر.س</td>
                      <td className="p-3 text-[#8A7465]">
                        {order.source === 'whatsapp' ? 'واتساب' : 'المتجر'}
                      </td>
                      <td className="p-3">{getStatusBadge(order.status)}</td>
                      <td className="p-3 text-left">
                        <button
                          onClick={() => {
                            setSelectedOrderForDetail(order);
                            setNewStatusToApply(order.status);
                            setActiveTab('orders');
                          }}
                          className="px-3 py-1 bg-[#F4ECE2] text-[#2F2B28] rounded-[8px] font-semibold hover:bg-[#E7D4BC]"
                        >
                          عرض وتعديل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Filter pills & manual order trigger */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOrderStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                  orderStatusFilter === 'all'
                    ? 'bg-[#2F2B28] text-white shadow-2xs border border-[#4A3E37]'
                    : 'bg-[#F4ECE2] text-[#5F5751]'
                }`}
              >
                الكل ({orders.length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('new')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                  orderStatusFilter === 'new'
                    ? 'bg-[#2F2B28] text-white shadow-2xs border border-[#4A3E37]'
                    : 'bg-[#F4ECE2] text-[#5F5751]'
                }`}
              >
                جديد ({orders.filter((o) => o.status === 'new').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('confirmed')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                  orderStatusFilter === 'confirmed'
                    ? 'bg-[#2F2B28] text-white shadow-2xs border border-[#4A3E37]'
                    : 'bg-[#F4ECE2] text-[#5F5751]'
                }`}
              >
                مؤكد
              </button>
              <button
                onClick={() => setOrderStatusFilter('preparing')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                  orderStatusFilter === 'preparing'
                    ? 'bg-[#2F2B28] text-white shadow-2xs border border-[#4A3E37]'
                    : 'bg-[#F4ECE2] text-[#5F5751]'
                }`}
              >
                قيد التجهيز
              </button>
              <button
                onClick={() => setOrderStatusFilter('delivered')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                  orderStatusFilter === 'delivered'
                    ? 'bg-[#2F2B28] text-white shadow-2xs border border-[#4A3E37]'
                    : 'bg-[#F4ECE2] text-[#5F5751]'
                }`}
              >
                تم التسليم
              </button>
            </div>

            <button
              onClick={() => setIsManualOrderModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إدخال طلب واتساب</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-[24px] border border-[#E5D8C9] overflow-hidden shadow-2xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F4ECE2] text-[#6F584A] font-bold">
                <tr>
                  <th className="p-3.5">رقم الطلب</th>
                  <th className="p-3.5">العميل والجوال</th>
                  <th className="p-3.5">المدينة والتوصيل</th>
                  <th className="p-3.5">المنتجات</th>
                  <th className="p-3.5">المجموع</th>
                  <th className="p-3.5">طريقة الدفع</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-left">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D8C9]">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FBF8F3]">
                    <td className="p-3.5 font-mono font-bold text-[#6F584A]">{ord.order_number}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-[#2F2B28] block">{ord.customer_name_snapshot}</span>
                      <span className="text-[11px] text-[#7C736D]" dir="ltr">{ord.customer_phone_snapshot}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[#2F2B28] block">{ord.address_snapshot.city}</span>
                      <span className="text-[11px] text-[#7C736D]">{ord.delivery_method_snapshot.name_ar}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[#2F2B28] font-medium">{ord.items.length} قطع</span>
                    </td>
                    <td className="p-3.5 font-bold text-[#6F584A]" dir="ltr">{ord.grand_total} ر.س</td>
                    <td className="p-3.5 text-[#7C736D]">{ord.payment_method_snapshot.name_ar}</td>
                    <td className="p-3.5">{getStatusBadge(ord.status)}</td>
                    <td className="p-3.5 text-left">
                      <button
                        onClick={() => {
                          setSelectedOrderForDetail(ord);
                          setNewStatusToApply(ord.status);
                        }}
                        className="px-3 py-1.5 bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] rounded-[8px] font-bold"
                      >
                        إدارة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Order Detail Drawer / Card */}
          {selectedOrderForDetail && (
            <div className="bg-white rounded-[24px] border-2 border-[#C6A36A] p-6 shadow-md animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5D8C9] mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-[#6F584A]">
                    {selectedOrderForDetail.order_number}
                  </span>
                  {getStatusBadge(selectedOrderForDetail.status)}
                </div>

                <button
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="text-xs text-[#8A7465] hover:text-[#2F2B28]"
                >
                  إغلاق التفاصيل
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-[#FBF8F3] p-4 rounded-[16px] text-xs space-y-1">
                  <span className="font-bold text-[#6F584A] block mb-2">المستلم والعنوان:</span>
                  <p className="font-semibold">{selectedOrderForDetail.customer_name_snapshot}</p>
                  <p dir="ltr" className="text-[#5F5751]">{selectedOrderForDetail.customer_phone_snapshot}</p>
                  <p className="text-[#7C736D]">
                    {selectedOrderForDetail.address_snapshot.city}، {selectedOrderForDetail.address_snapshot.district}، {selectedOrderForDetail.address_snapshot.street}
                  </p>
                  {selectedOrderForDetail.customer_notes && (
                    <p className="text-[#C6A36A] font-semibold mt-2">
                      ملاحظة العميل: {selectedOrderForDetail.customer_notes}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div className="bg-[#FBF8F3] p-4 rounded-[16px] text-xs space-y-2">
                  <span className="font-bold text-[#6F584A] block mb-2">الأصناف المعتمدة:</span>
                  {selectedOrderForDetail.items.map((it, i) => (
                    <div key={i} className="flex justify-between border-b border-[#E5D8C9] pb-1 last:border-none">
                      <span>{it.product_name_snapshot} × {it.quantity}</span>
                      <span className="font-bold" dir="ltr">{it.line_total} ر.س</span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-[#6F584A]">
                    <span>المجموع:</span>
                    <span dir="ltr">{selectedOrderForDetail.grand_total} ر.س</span>
                  </div>
                </div>

                {/* Status Update Form */}
                <div className="bg-[#F4ECE2]/80 p-4 rounded-[16px] text-xs space-y-3">
                  <span className="font-bold text-[#6F584A] block">تغيير حالة الطلب:</span>
                  <select
                    value={newStatusToApply}
                    onChange={(e) => setNewStatusToApply(e.target.value as OrderStatus)}
                    className="w-full bg-white border border-[#D9C1A7] rounded-[10px] p-2 text-xs"
                  >
                    <option value="new">جديد</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="preparing">قيد التجهيز</option>
                    <option value="out_for_delivery">خرج للتوصيل</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>

                  <input
                    type="text"
                    placeholder="ملاحظة التغيير (تسجل في السجل)..."
                    value={statusChangeNote}
                    onChange={(e) => setStatusChangeNote(e.target.value)}
                    className="w-full bg-white border border-[#D9C1A7] rounded-[10px] p-2 text-xs"
                  />

                  <button
                    onClick={handleUpdateStatus}
                    className="w-full py-2 bg-[#2F2B28] hover:bg-[#231F1D] text-white rounded-[10px] font-bold text-xs border border-[#4A3E37]"
                  >
                    اعتماد الحالة وتسجيلها
                  </button>
                </div>
              </div>

              {/* Status Change Audit Logs */}
              <div className="border-t border-[#E5D8C9] pt-4">
                <span className="text-xs font-bold text-[#8A7465] block mb-2">
                  سجل التغييرات والتدقيق للطلب (Audit Log):
                </span>
                <div className="space-y-1.5 text-xs text-[#7C736D]">
                  {selectedOrderForDetail.logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 bg-[#FBF8F3] p-2 rounded-[8px]">
                      <Clock className="w-3.5 h-3.5 text-[#C6A36A] shrink-0" />
                      <span className="font-semibold text-[#2F2B28]">{log.note}</span>
                      <span className="text-[10px] text-[#8A7465] mr-auto">
                        بواسطة: {log.changed_by} ({new Date(log.created_at).toLocaleTimeString('ar-SA')})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PRODUCTS CATALOG TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#6F584A] font-heading">
              قائمة المنتجات بالكتالوج ({products.length})
            </h3>

            <button
              onClick={() => {
                setEditingProduct({
                  id: `prod-${Date.now()}`,
                  category_id: categories[0]?.id || 'cat-bags',
                  name_ar: '',
                  name_en: '',
                  slug: '',
                  sku: `MB-NEW-${Math.floor(100 + Math.random() * 900)}`,
                  short_description_ar: '',
                  short_description_en: '',
                  description_ar: '',
                  description_en: '',
                  price: 299,
                  compare_at_price: 399,
                  availability_status: 'available',
                  is_featured: true,
                  is_new: true,
                  is_best_seller: false,
                  is_active: true,
                  sort_order: products.length + 1,
                  rating: 5.0,
                  reviews_count: 1,
                  images: [
                    {
                      id: `img-${Date.now()}`,
                      product_id: '',
                      path: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
                      alt_text_ar: 'صورة المنتج',
                      alt_text_en: 'Product image',
                      sort_order: 1,
                      is_primary: true,
                    },
                  ],
                  variants: [],
                });
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-[12px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold shadow-xs border border-[#4A3E37]"
            >
              <Plus className="w-4 h-4 text-[#C6A36A]" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>

          <div className="bg-white rounded-[24px] border border-[#E5D8C9] overflow-hidden shadow-2xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F4ECE2] text-[#2F2B28] font-bold">
                <tr>
                  <th className="p-3.5">المنتج</th>
                  <th className="p-3.5">القسم</th>
                  <th className="p-3.5">الرمز (SKU)</th>
                  <th className="p-3.5">السعر</th>
                  <th className="p-3.5">حالة التوفر</th>
                  <th className="p-3.5 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D8C9]">
                {products.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <tr key={p.id} className="hover:bg-[#FBF8F3]">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={p.images[0]?.path}
                          alt={p.name_ar}
                          className="w-12 h-12 rounded-[10px] object-cover bg-[#F7F1E8] border border-[#E7D4BC] shrink-0"
                        />
                        <div>
                          <span className="font-bold text-[#2F2B28] block line-clamp-1">{p.name_ar}</span>
                          <span className="text-[10px] text-[#7C736D]">{p.variants.length} خيارات متغيرات</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-[#5F5751]">{cat?.name_ar || '-'}</td>
                      <td className="p-3.5 font-mono text-[#7C736D]">{p.sku}</td>
                      <td className="p-3.5 font-bold text-[#6F584A]" dir="ltr">{p.price} ر.س</td>
                      <td className="p-3.5">
                        {p.availability_status === 'available' ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">متوفر</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">نافد</span>
                        )}
                      </td>
                      <td className="p-3.5 text-left space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 rounded bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف ${p.name_ar}؟`)) {
                              deleteProduct(p.id);
                              triggerToast();
                            }
                          }}
                          className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CATEGORIES MANAGEMENT TAB */}
      {activeTab === 'categories' && (
        <CategoryManager onSuccess={triggerToast} />
      )}

      {/* 5. CUSTOMIZATION & THEME STUDIO TAB */}
      {activeTab === 'customize' && (
        <div className="space-y-8">
          {/* Custom Logo Uploader & Emblem Settings */}
          <LogoCustomizer />

          {/* Store Info & WhatsApp Settings */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs">
            <h3 className="text-base font-bold text-[#6F584A] font-heading mb-4">
              بيانات الهوية والتواصل المباشر
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#5F5751] mb-1">اسم المتجر (بالعربية)</label>
                <input
                  type="text"
                  value={storeSettings.store_name_ar}
                  onChange={(e) => updateStoreSettings({ store_name_ar: e.target.value })}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5F5751] mb-1">العبارة التعريفية (الشعار اللفظي)</label>
                <input
                  type="text"
                  value={storeSettings.tagline_ar}
                  onChange={(e) => updateStoreSettings({ tagline_ar: e.target.value })}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5F5751] mb-1">رقم واتساب المبيعات</label>
                <input
                  type="text"
                  value={storeSettings.whatsapp_number}
                  onChange={(e) => updateStoreSettings({ whatsapp_number: e.target.value })}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  dir="ltr"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#5F5751] mb-1">نص شريط الإعلان العلوي</label>
                <input
                  type="text"
                  value={storeSettings.announcement_bar_text_ar}
                  onChange={(e) => updateStoreSettings({ announcement_bar_text_ar: e.target.value })}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="announcementVisible"
                  checked={storeSettings.announcement_bar_visible}
                  onChange={(e) => updateStoreSettings({ announcement_bar_visible: e.target.checked })}
                  className="w-4 h-4 accent-[#6F584A]"
                />
                <label htmlFor="announcementVisible" className="font-semibold text-[#2F2B28]">
                  إظهار شريط الإعلان الفاخر
                </label>
              </div>
            </div>
          </div>

          {/* Hero Seamless Carousel Slides Manager */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E5D8C9] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#6F584A] font-heading">
                  إدارة شرائح الهيرو الدائري المتصل (Seamless Carousel)
                </h3>
                <p className="text-xs text-[#7C736D]">
                  التحكم في الصور والعناوين والأزرار مع خاصية الدوران المستمر دون قفزات.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingSlide({
                    id: `slide-${Date.now()}`,
                    title_ar: 'عنوان الشريحة الجديدة',
                    title_en: 'New Slide Title',
                    description_ar: 'وصف مختصر للأناقة والمقتنيات الفاخرة.',
                    description_en: 'Luxury curated description.',
                    badge_ar: 'مختارات حصرية',
                    desktop_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
                    mobile_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
                    primary_button_text: 'تسوّقي الآن',
                    primary_button_url: '#products-section',
                    text_alignment: 'right',
                    background_type: 'color',
                    background_value: '#FBF8F3',
                    is_visible: true,
                    sort_order: heroSlides.length + 1,
                  });
                  setIsSlideModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-[#2F2B28] hover:bg-[#231F1D] text-white text-xs font-bold border border-[#4A3E37]"
              >
                <Plus className="w-3.5 h-3.5 text-[#C6A36A]" />
                <span>إضافة شريحة</span>
              </button>
            </div>

            {/* Carousel Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] mb-6 text-xs">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoplayToggle"
                  checked={themeSettings.carousel_autoplay}
                  onChange={(e) => updateThemeSettings({ carousel_autoplay: e.target.checked })}
                  className="w-4 h-4 accent-[#2F2B28]"
                />
                <label htmlFor="autoplayToggle" className="font-semibold text-[#2F2B28]">
                  تفعيل التشغيل التلقائي للدوران (Autoplay)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="heroPulseToggle"
                  checked={themeSettings.hero_pulse_animation !== false}
                  onChange={(e) => updateThemeSettings({ hero_pulse_animation: e.target.checked })}
                  className="w-4 h-4 accent-[#2F2B28]"
                />
                <label htmlFor="heroPulseToggle" className="font-semibold text-[#2F2B28]">
                  حركة الهيرو النابضة وإزاحة كامل العرض
                </label>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[#5F5751]">سرعة الانتقال:</span>
                <input
                  type="range"
                  min="2500"
                  max="8000"
                  step="500"
                  value={themeSettings.carousel_interval}
                  onChange={(e) => updateThemeSettings({ carousel_interval: Number(e.target.value) })}
                  className="accent-[#2F2B28]"
                />
                <span className="font-bold text-[#6F584A]">{themeSettings.carousel_interval / 1000} ثانية</span>
              </div>
            </div>

            {/* Slides List */}
            <div className="space-y-3">
              {heroSlides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[16px] border border-[#E7D4BC] bg-[#FBF8F3]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={slide.desktop_image}
                      alt={slide.title_ar}
                      className="w-16 h-16 rounded-[12px] object-cover border border-[#E5D8C9]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#2F2B28]">{slide.title_ar}</span>
                        {slide.badge_ar && (
                          <span className="text-[10px] font-semibold bg-[#F4ECE2] text-[#8A7465] px-2 py-0.5 rounded-full border border-[#D9C1A7]">
                            {slide.badge_ar}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#7C736D] line-clamp-1 mt-0.5">
                        {slide.description_ar}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const updated = heroSlides.map((s) =>
                          s.id === slide.id ? { ...s, is_visible: !s.is_visible } : s
                        );
                        updateHeroSlides(updated);
                      }}
                      className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold ${
                        slide.is_visible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {slide.is_visible ? 'ظاهرة' : 'مخفية'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingSlide(slide);
                        setIsSlideModalOpen(true);
                      }}
                      className="p-2 rounded-[10px] bg-[#F4ECE2] text-[#6F584A] hover:bg-[#E7D4BC]"
                      title="تعديل الشريحة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {heroSlides.length > 1 && (
                      <button
                        onClick={() => {
                          const updated = heroSlides.filter((s) => s.id !== slide.id);
                          updateHeroSlides(updated);
                        }}
                        className="p-2 rounded-[10px] bg-red-50 text-red-700 hover:bg-red-100"
                        title="حذف الشريحة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publishing & Restore Defaults Actions */}
          <div className="flex items-center justify-between p-6 rounded-[20px] bg-[#F7F1E8] border border-[#E7D4BC]">
            <button
              onClick={() => {
                if (confirm('هل ترغبين في استعادة القيم الافتراضية الأصلية لنظام الهوية؟')) {
                  restoreDefaultCustomization();
                  triggerToast();
                }
              }}
              className="flex items-center gap-2 text-xs font-bold text-[#8A7465] hover:text-[#6F584A]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>استعادة الإعدادات الافتراضية للهوية</span>
            </button>

            <button
              onClick={() => {
                publishCustomization();
                triggerToast();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-[#2F2B28] hover:bg-[#231F1D] text-[#F5E9D8] text-xs font-bold shadow-md active:scale-98 transition-all border border-[#4A3E37]"
            >
              <Save className="w-4 h-4 text-[#C6A36A]" />
              <span>نشر المسودة المعتمدة للواجهة</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL WHATSAPP ORDER */}
      {isManualOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 text-right border border-[#E5D8C9] shadow-2xl">
            <h3 className="text-base font-bold text-[#6F584A] font-heading mb-4">
              إدخال وتثبيت طلب واتساب يدوي
            </h3>

            <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">اسم العميل</label>
                <input
                  type="text"
                  required
                  value={manualCustomerName}
                  onChange={(e) => setManualCustomerName(e.target.value)}
                  placeholder="مثال: منيرة الصالح"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">رقم هاتف الواتساب</label>
                <input
                  type="tel"
                  required
                  value={manualCustomerPhone}
                  onChange={(e) => setManualCustomerPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">المدينة</label>
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">الحي</label>
                  <input
                    type="text"
                    value={manualDistrict}
                    onChange={(e) => setManualDistrict(e.target.value)}
                    placeholder="مثال: النخيل"
                    className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">المنتج المتفق عليه عبر واتساب</label>
                <select
                  value={manualSelectedProductId}
                  onChange={(e) => {
                    setManualSelectedProductId(e.target.value);
                    const pr = products.find((p) => p.id === e.target.value);
                    if (pr) setManualPrice(pr.price);
                  }}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_ar} ({p.price} ر.س)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">السعر المعتمد (ر.س)</label>
                <input
                  type="number"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FBF8F3] border border-[#D9C1A7] rounded-[10px]"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5D8C9]">
                <button
                  type="button"
                  onClick={() => setIsManualOrderModalOpen(false)}
                  className="px-4 py-2 text-[#7C736D]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#25D366] text-white font-bold rounded-[12px]"
                >
                  تثبيت الطلب وحفظه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT (WITH VARIANTS & ATTRIBUTES & IMAGE UPLOADER) */}
      {isProductModalOpen && editingProduct && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={(p) => {
            saveProduct(p);
            setIsProductModalOpen(false);
            setEditingProduct(null);
            triggerToast();
          }}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* MODAL: EDIT HERO SLIDE */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 text-right border border-[#E5D8C9] shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5D8C9]">
              <div>
                <h3 className="text-base font-bold text-[#2F2B28] font-heading">
                  إعدادات وتخصيص شريحة الهيرو
                </h3>
                <p className="text-[11px] text-[#7C736D]">
                  التحكم الكامل بالنصوص والألوان، صور العرض والخلفية، وتأثيرات الحركة النابضة
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F4ECE2] hover:bg-[#E7D4BC] text-[#6F584A] flex items-center justify-center transition-transform active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlideForm} className="space-y-4 text-xs">
              {/* قسم النصوص والألوان */}
              <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
                <h4 className="font-bold text-[#2F2B28] text-xs flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C6A36A]" />
                  <span>تعديل النصوص وألوانها</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">العنوان الرئيسي للشريحة</label>
                    <input
                      type="text"
                      required
                      value={editingSlide.title_ar}
                      onChange={(e) => setEditingSlide({ ...editingSlide, title_ar: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">لون العنوان</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingSlide.title_color || '#2F2B28'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, title_color: e.target.value })}
                        className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={editingSlide.title_color || '#2F2B28'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, title_color: e.target.value })}
                        className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">وصف الشريحة</label>
                    <textarea
                      rows={2}
                      value={editingSlide.description_ar}
                      onChange={(e) => setEditingSlide({ ...editingSlide, description_ar: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">لون الوصف</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingSlide.description_color || '#5F5751'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, description_color: e.target.value })}
                        className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={editingSlide.description_color || '#5F5751'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, description_color: e.target.value })}
                        className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">شارة الشريحة (Badge)</label>
                    <input
                      type="text"
                      value={editingSlide.badge_ar || ''}
                      onChange={(e) => setEditingSlide({ ...editingSlide, badge_ar: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                      placeholder="مثال: مختارات حصرية"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">لون نص الشارة</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingSlide.badge_color || '#8A7465'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, badge_color: e.target.value })}
                        className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={editingSlide.badge_color || '#8A7465'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, badge_color: e.target.value })}
                        className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">خلفية الشارة</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingSlide.badge_bg || '#F4ECE2'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, badge_bg: e.target.value })}
                        className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={editingSlide.badge_bg || '#F4ECE2'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, badge_bg: e.target.value })}
                        className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* قسم أزرار الدعوة للإجراء (CTA Buttons) */}
              <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-3">
                <h4 className="font-bold text-[#2F2B28] text-xs mb-2">أزرار الشريحة (CTA)</h4>
                
                {/* الزر الأساسي */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">نص الزر الأساسي</label>
                    <input
                      type="text"
                      value={editingSlide.primary_button_text}
                      onChange={(e) => setEditingSlide({ ...editingSlide, primary_button_text: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">رابط الزر</label>
                    <input
                      type="text"
                      value={editingSlide.primary_button_url}
                      onChange={(e) => setEditingSlide({ ...editingSlide, primary_button_url: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">خلفية الزر</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={editingSlide.button_bg || '#2F2B28'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, button_bg: e.target.value })}
                        className="w-8 h-8 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={editingSlide.button_bg || '#2F2B28'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, button_bg: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#D9C1A7] rounded-[8px] text-[10px] font-mono text-left"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">لون نص الزر</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={editingSlide.button_text_color || '#F5E9D8'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, button_text_color: e.target.value })}
                        className="w-8 h-8 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={editingSlide.button_text_color || '#F5E9D8'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, button_text_color: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#D9C1A7] rounded-[8px] text-[10px] font-mono text-left"
                      />
                    </div>
                  </div>
                </div>

                {/* الزر الثانوي */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E5D8C9]">
                  <div>
                    <label className="block font-semibold mb-1">نص الزر الثانوي (اختياري)</label>
                    <input
                      type="text"
                      value={editingSlide.secondary_button_text || ''}
                      onChange={(e) => setEditingSlide({ ...editingSlide, secondary_button_text: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">رابط الزر الثانوي</label>
                    <input
                      type="text"
                      value={editingSlide.secondary_button_url || ''}
                      onChange={(e) => setEditingSlide({ ...editingSlide, secondary_button_url: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#D9C1A7] rounded-[10px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">خلفية الثانوي</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={editingSlide.secondary_button_bg || '#F4ECE2'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, secondary_button_bg: e.target.value })}
                        className="w-8 h-8 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={editingSlide.secondary_button_bg || '#F4ECE2'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, secondary_button_bg: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#D9C1A7] rounded-[8px] text-[10px] font-mono text-left"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">لون نص الثانوي</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={editingSlide.secondary_button_text_color || '#6F584A'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, secondary_button_text_color: e.target.value })}
                        className="w-8 h-8 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={editingSlide.secondary_button_text_color || '#6F584A'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, secondary_button_text_color: e.target.value })}
                        className="w-full p-1.5 bg-white border border-[#D9C1A7] rounded-[8px] text-[10px] font-mono text-left"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* قسم الصور والخلفية والحركة النابضة */}
              <div className="p-4 rounded-[16px] bg-[#FBF8F3] border border-[#E7D4BC] space-y-4">
                <h4 className="font-bold text-[#2F2B28] text-xs mb-2">التحكم بالصور وخلفية الهيرو</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <ImageUploader
                      value={editingSlide.desktop_image}
                      onChange={(url) => setEditingSlide({ ...editingSlide, desktop_image: url, mobile_image: url })}
                      label="صورة البنر الرئيسية للمنتج / العرض"
                      aspectRatioHint="أبعاد مربعة 1:1 أو 4:3"
                      maxDimension={1600}
                    />
                  </div>
                  <div>
                    <ImageUploader
                      value={editingSlide.background_image || ''}
                      onChange={(url) => setEditingSlide({ ...editingSlide, background_image: url })}
                      label="صورة الخلفية العريضة المتحركة (اختيارية)"
                      aspectRatioHint="أبعاد بانورامية 16:9 للخلفية النابضة"
                      maxDimension={1920}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5D8C9]">
                  <div>
                    <label className="block font-semibold mb-1">لون أو تدرج الخلفية</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editingSlide.background_value?.startsWith('#') ? editingSlide.background_value : '#FBF8F3'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, background_value: e.target.value })}
                        className="w-9 h-9 p-0.5 rounded-[8px] border border-[#D9C1A7] cursor-pointer bg-white"
                      />
                      <input
                        type="text"
                        value={editingSlide.background_value || '#FBF8F3'}
                        onChange={(e) => setEditingSlide({ ...editingSlide, background_value: e.target.value })}
                        className="w-full p-2 bg-white border border-[#D9C1A7] rounded-[8px] text-[11px] font-mono text-left"
                        placeholder="#FBF8F3"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="slidePulseAnimation"
                      checked={editingSlide.pulse_animation !== false}
                      onChange={(e) => setEditingSlide({ ...editingSlide, pulse_animation: e.target.checked })}
                      className="w-4 h-4 accent-[#2F2B28]"
                    />
                    <label htmlFor="slidePulseAnimation" className="font-semibold text-[#2F2B28] cursor-pointer">
                      تفعيل الحركة النابضة والإزاحة الأفقية لهذه الشريحة
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5D8C9]">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2 text-[#7C736D]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2F2B28] hover:bg-[#231F1D] text-white font-bold rounded-[12px] border border-[#4A3E37] shadow-sm transition-all"
                >
                  حفظ الشريحة واعتماد التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
