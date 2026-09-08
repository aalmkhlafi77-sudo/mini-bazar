import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminCredentials,
  Brand,
  Category,
  Product,
  ProductVariant,
  CartItem,
  Order,
  OrderStatus,
  HeroSlide,
  StoreSettings,
  ThemeSettings,
  DeliveryMethod,
  PaymentMethod,
  CustomerAddress,
} from '../types';
import {
  initialBrands,
  initialCategories,
  initialProducts,
  initialHeroSlides,
  initialDeliveryMethods,
  initialPaymentMethods,
  initialStoreSettings,
  initialThemeSettings,
  initialAdminCredentials,
} from '../data/initialData';
import {
  computeSaltedHashSync,
  verifySaltedHashSync,
  generateRandomSalt,
} from '../utils/security';
import { safeStorage } from '../utils/safeStorage';
import {
  listenToProducts,
  listenToCategories,
  listenToBrands,
  listenToOrders,
  listenToStoreSettings,
  saveProductToCloud,
  deleteProductFromCloud,
  saveCategoryToCloud,
  deleteCategoryFromCloud,
  saveBrandToCloud,
  deleteBrandFromCloud,
  saveOrderToCloud,
  updateOrderInCloud,
  publishSettingsToCloud,
  seedInitialFirestoreData,
} from '../utils/firebaseSync';

export interface CartNotificationData {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

interface StoreContextType {
  // Admin Authentication & Security
  adminCredentials: AdminCredentials;
  isAdminAuthenticated: boolean;
  loginAdmin: (username: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logoutAdmin: () => void;
  recoverAdminPassword: (params: {
    identifier: string;
    securityAnswer?: string;
    recoveryPin?: string;
    newPassword: string;
  }) => { success: boolean; error?: string };
  updateAdminUsername: (newUsername: string) => { success: boolean; error?: string };
  updateAdminPassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
  updateAdminSecurity: (securityData: {
    security_question?: string;
    security_answer?: string;
    recovery_email?: string;
    recovery_pin?: string;
  }) => { success: boolean; error?: string };
  resetAdminCredentialsToDefault: () => void;

  // Catalog & Navigation
  categories: Category[];
  brands: Brand[];
  products: Product[];
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedBrand: string | null;
  setSelectedBrand: (brandId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string, quantity?: number, openDrawer?: boolean) => void;
  updateCartQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  lastAddedNotification: CartNotificationData | null;
  clearLastAddedNotification: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Delivery & Payment
  deliveryMethods: DeliveryMethod[];
  paymentMethods: PaymentMethod[];

  // Orders
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: CustomerAddress;
    deliveryMethodId: string;
    paymentMethodId: string;
    customerNotes?: string;
    bankTransferReceipt?: string;
    bankTransferConfirmed?: boolean;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note: string) => void;
  verifyBankTransferReceipt: (orderId: string, verified: boolean, notes?: string) => void;
  addManualOrder: (order: Partial<Order>) => void;

  // Hero Carousel & Customization
  heroSlides: HeroSlide[];
  updateHeroSlides: (slides: HeroSlide[]) => void;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  themeSettings: ThemeSettings;
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  publishCustomization: () => void;
  hasUnpublishedChanges: boolean;
  restoreDefaultCustomization: () => void;

  // View state navigation
  activeView: 'store' | 'product' | 'checkout' | 'order-success' | 'wishlist' | 'admin' | 'policy';
  setActiveView: (view: 'store' | 'product' | 'checkout' | 'order-success' | 'wishlist' | 'admin' | 'policy') => void;
  activePolicy: string | null;
  openPolicy: (policyKey: string) => void;

  // Product & Category Administration
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  saveBrand: (brand: Brand) => void;
  deleteBrand: (brandId: string) => void;

  // Language
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Admin Credentials & Authentication State with automatic security migration
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    const saved = safeStorage.getItem('mb_admin_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatic security migration: if legacy plaintext exists, hash it immediately
        if (parsed.password && !parsed.password_hash) {
          const passSalt = generateRandomSalt(16);
          const answerSalt = generateRandomSalt(16);
          const pinSalt = generateRandomSalt(16);

          const secured: AdminCredentials = {
            username: parsed.username || 'admin',
            password_hash: computeSaltedHashSync(parsed.password, passSalt),
            password_salt: passSalt,
            security_question: parsed.security_question || 'ما هو اسم المتجر بالعربية؟',
            security_answer_hash: computeSaltedHashSync(parsed.security_answer || 'ميني بازار', answerSalt),
            security_answer_salt: answerSalt,
            recovery_email: parsed.recovery_email || 'admin@minibazaar.com',
            recovery_pin_hash: computeSaltedHashSync(parsed.recovery_pin || '2026', pinSalt),
            recovery_pin_salt: pinSalt,
            last_updated: new Date().toISOString(),
          };
          safeStorage.setItem('mb_admin_credentials', JSON.stringify(secured));
          return secured;
        }
        return {
          ...initialAdminCredentials,
          ...parsed,
        };
      } catch {
        return initialAdminCredentials;
      }
    }
    return initialAdminCredentials;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const localSession = safeStorage.getItem('mb_admin_auth_session');
    const tempSession = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mb_admin_auth_session') : null;
    return Boolean(localSession || tempSession);
  });

  // State initialization with safeStorage fallback
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = safeStorage.getItem('mb_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = safeStorage.getItem('mb_brands');
    return saved ? JSON.parse(saved) : initialBrands;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = safeStorage.getItem('mb_products');
    if (!saved) return initialProducts;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return initialProducts;
      return parsed.map((p, idx) => ({
        ...p,
        id: p.id || `prod-${idx + 1}`,
        name_ar: p.name_ar || 'منتج ميني بازار',
        name_en: p.name_en || '',
        price: typeof p.price === 'number' ? p.price : 0,
        compare_at_price: typeof p.compare_at_price === 'number' ? p.compare_at_price : undefined,
        rating: typeof p.rating === 'number' ? p.rating : 5.0,
        reviews_count: typeof p.reviews_count === 'number' ? p.reviews_count : 0,
        availability_status: p.availability_status || 'available',
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [
          {
            id: `img-${p.id || idx}-def`,
            product_id: p.id,
            path: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
            alt_text_ar: p.name_ar || 'منتج ميني بازار',
            alt_text_en: p.name_en || 'Mini Bazaar Product',
            sort_order: 1,
            is_primary: true
          }
        ],
        variants: Array.isArray(p.variants) && p.variants.length > 0 ? p.variants.map((v: any, vIdx: number) => ({
          ...v,
          id: v.id || `var-${p.id}-${vIdx}`,
          name_ar: v.name_ar || 'الخيار الافتراضي',
          name_en: v.name_en || '',
          price: typeof v.price === 'number' ? v.price : (typeof p.price === 'number' ? p.price : 0),
          availability_status: v.availability_status || 'available'
        })) : [
          {
            id: `var-default-${p.id || idx}`,
            product_id: p.id || `prod-${idx + 1}`,
            name_ar: 'الخيار الافتراضي',
            name_en: 'Default',
            sku: p.sku || 'MB-DEF',
            price: typeof p.price === 'number' ? p.price : 0,
            availability_status: p.availability_status || 'available',
            is_default: true,
            sort_order: 1
          }
        ]
      }));
    } catch {
      return initialProducts;
    }
  });

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    const saved = safeStorage.getItem('mb_hero_slides');
    return saved ? JSON.parse(saved) : initialHeroSlides;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = safeStorage.getItem('mb_store_settings');
    if (!saved) return initialStoreSettings;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...initialStoreSettings,
        ...parsed,
        brand_settings: {
          ...initialStoreSettings.brand_settings,
          ...(parsed.brand_settings || {}),
        },
        social_links: parsed.social_links || initialStoreSettings.social_links,
        navigation_items: parsed.navigation_items || initialStoreSettings.navigation_items,
        footer_columns: parsed.footer_columns || initialStoreSettings.footer_columns,
      };
    } catch {
      return initialStoreSettings;
    }
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = safeStorage.getItem('mb_theme_settings');
    return saved ? JSON.parse(saved) : initialThemeSettings;
  });

  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  // Delivery & Payment options
  const [deliveryMethods] = useState<DeliveryMethod[]>(initialDeliveryMethods);
  const [paymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);

  // Cart & Wishlist with rigorous sanitization
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = safeStorage.getItem('mb_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Clean up and validate every item to ensure no undefined products or corrupt properties
      return parsed.filter(
        (item): item is CartItem =>
          Boolean(item && item.product && typeof item.product === 'object' && item.product.id)
      );
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem('mb_wishlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = safeStorage.getItem('mb_orders');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'ord-1001',
            order_number: 'MB-2026-9401',
            customer_name_snapshot: 'سارة عبد الرحمن آل سعود',
            customer_phone_snapshot: '+966509876543',
            customer_email_snapshot: 'sarah.al@example.com',
            address_snapshot: {
              country: 'المملكة العربية السعودية',
              city: 'الرياض',
              district: 'حي حطين',
              street: 'شارع الأمير محمد بن سلمان',
              building: 'فيلا 14',
              notes: 'يرجى الاتصال قبل الوصول بـ 15 دقيقة والتغليف الفاخر الخاص بالهدايا.',
            },
            subtotal: 628,
            delivery_fee: 35,
            discount_total: 0,
            grand_total: 663,
            delivery_method_snapshot: initialDeliveryMethods[0],
            payment_method_snapshot: initialPaymentMethods[0],
            status: 'confirmed',
            source: 'web',
            placed_at: new Date(Date.now() - 3600000 * 5).toISOString(),
            items: [
              {
                product_id: 'prod-1',
                variant_id: 'var-1-1',
                product_name_snapshot: 'حقيبة يد ليدي باج عاجية بلمسة ذهبية',
                variant_name_snapshot: 'عاجي طبيعي / بيج فاتح',
                sku_snapshot: 'MB-BAG-001-IVR',
                unit_price: 349,
                quantity: 1,
                line_total: 349,
                image_snapshot: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
              },
              {
                product_id: 'prod-3',
                variant_id: 'var-3-1',
                product_name_snapshot: 'عطر لوميير المركز — زهور البرغموت والعنبر الدافئ',
                variant_name_snapshot: 'حجم 100 مل مركز',
                sku_snapshot: 'MB-PRF-003-100',
                unit_price: 279,
                quantity: 1,
                line_total: 279,
                image_snapshot: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
              },
            ],
            logs: [
              {
                id: 'log-1',
                order_id: 'ord-1001',
                from_status: 'new',
                to_status: 'confirmed',
                note: 'تم تأكيد استلام إيصال التحويل البنكي وتجهيز كرتون الإهداء الفاخر.',
                changed_by: 'المدير العام (مشرف ميني بازار)',
                created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
              },
            ],
          },
        ];
  });

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [lastAddedNotification, setLastAddedNotification] = useState<CartNotificationData | null>(null);

  const clearLastAddedNotification = () => {
    setLastAddedNotification(null);
  };

  // Navigation & View State
  const [activeView, setActiveView] = useState<'store' | 'product' | 'checkout' | 'order-success' | 'wishlist' | 'admin' | 'policy'>('store');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  // Persistence to storage with robust safeStorage guards
  useEffect(() => {
    try {
      safeStorage.setItem('mb_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart to storage:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      safeStorage.setItem('mb_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to storage:', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      safeStorage.setItem('mb_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to storage:', e);
    }
  }, [orders]);

  // ================= CLOUD FIRESTORE SYNCHRONIZATION =================
  useEffect(() => {
    // 1. Initial Cloud Seeding (if database is empty)
    seedInitialFirestoreData();

    // 2. Real-time Products Sync
    const unsubProducts = listenToProducts((cloudProducts) => {
      if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
        setProducts(cloudProducts);
        safeStorage.setItem('mb_products', JSON.stringify(cloudProducts));
      }
    });

    // 3. Real-time Categories Sync
    const unsubCategories = listenToCategories((cloudCategories) => {
      if (Array.isArray(cloudCategories) && cloudCategories.length > 0) {
        setCategories(cloudCategories);
        safeStorage.setItem('mb_categories', JSON.stringify(cloudCategories));
      }
    });

    // 4. Real-time Brands Sync
    const unsubBrands = listenToBrands((cloudBrands) => {
      if (Array.isArray(cloudBrands) && cloudBrands.length > 0) {
        setBrands(cloudBrands);
        safeStorage.setItem('mb_brands', JSON.stringify(cloudBrands));
      }
    });

    // 5. Real-time Orders Sync
    const unsubOrders = listenToOrders((cloudOrders) => {
      if (Array.isArray(cloudOrders)) {
        setOrders(cloudOrders);
        safeStorage.setItem('mb_orders', JSON.stringify(cloudOrders));
      }
    });

    // 6. Real-time Store Settings & Customization Sync
    const unsubSettings = listenToStoreSettings((cloudData) => {
      if (cloudData.storeSettings) {
        setStoreSettings(cloudData.storeSettings);
        safeStorage.setItem('mb_store_settings', JSON.stringify(cloudData.storeSettings));
      }
      if (cloudData.themeSettings) {
        setThemeSettings(cloudData.themeSettings);
        safeStorage.setItem('mb_theme_settings', JSON.stringify(cloudData.themeSettings));
      }
      if (cloudData.heroSlides && cloudData.heroSlides.length > 0) {
        setHeroSlides(cloudData.heroSlides);
        safeStorage.setItem('mb_hero_slides', JSON.stringify(cloudData.heroSlides));
      }
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBrands();
      unsubOrders();
      unsubSettings();
    };
  }, []);

  // Cart operations with comprehensive safety guards
  const addToCart = (product: Product, variantId?: string, quantity: number = 1, openDrawer: boolean = false) => {
    if (!product || !product.id) return;

    try {
      const safeProductVariants = Array.isArray(product.variants) && product.variants.length > 0
        ? product.variants
        : [
            {
              id: `var-default-${product.id}`,
              product_id: product.id,
              name_ar: 'الخيار الافتراضي',
              name_en: 'Default',
              sku: product.sku || 'MB-DEF',
              price: typeof product.price === 'number' ? product.price : 0,
              compare_at_price: product.compare_at_price,
              availability_status: product.availability_status || 'available',
              is_default: true,
              sort_order: 1,
            },
          ];

      const selectedVariant = variantId
        ? safeProductVariants.find((v) => v.id === variantId) || safeProductVariants[0]
        : safeProductVariants.find((v) => v.is_default) || safeProductVariants[0];

      const safeQuantity = typeof quantity === 'number' && quantity > 0 ? Math.floor(quantity) : 1;

      // Safe lightweight product copy to avoid storage bloat
      const cleanProduct: Product = {
        id: product.id,
        category_id: product.category_id,
        brand_id: product.brand_id,
        name_ar: product.name_ar || 'منتج ميني بازار',
        name_en: product.name_en || '',
        short_description_ar: product.short_description_ar || '',
        short_description_en: product.short_description_en || '',
        description_ar: product.description_ar || '',
        description_en: product.description_en || '',
        slug: product.slug || product.id,
        sku: product.sku || 'MB-ITEM',
        price: typeof product.price === 'number' ? product.price : 0,
        compare_at_price: product.compare_at_price,
        availability_status: product.availability_status || 'available',
        is_featured: Boolean(product.is_featured),
        is_new: Boolean(product.is_new),
        is_best_seller: Boolean(product.is_best_seller),
        is_active: product.is_active ?? true,
        sort_order: product.sort_order || 1,
        rating: product.rating || 5,
        reviews_count: product.reviews_count || 1,
        images: Array.isArray(product.images) && product.images.length > 0
          ? [product.images[0]]
          : [
              {
                id: `def-img-${product.id}`,
                product_id: product.id,
                path: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
                alt_text_ar: product.name_ar || 'منتج',
                alt_text_en: product.name_en || 'Product',
                sort_order: 1,
                is_primary: true,
              },
            ],
        variants: safeProductVariants,
      };

      const cleanVariant = selectedVariant
        ? {
            ...selectedVariant,
            price: typeof selectedVariant.price === 'number' ? selectedVariant.price : cleanProduct.price,
            name_ar: selectedVariant.name_ar || 'الخيار الافتراضي',
          }
        : undefined;

      setCart((prev) => {
        const safePrev = Array.isArray(prev)
          ? prev.filter((item) => Boolean(item && item.product && item.product.id))
          : [];

        const existingIndex = safePrev.findIndex(
          (item) =>
            item.product.id === cleanProduct.id &&
            (item.variant?.id ?? 'default') === (cleanVariant?.id ?? 'default')
        );

        if (existingIndex > -1) {
          const updated = [...safePrev];
          const currentQty = typeof updated[existingIndex].quantity === 'number' ? updated[existingIndex].quantity : 1;
          updated[existingIndex] = {
            ...updated[existingIndex],
            product: cleanProduct,
            variant: cleanVariant,
            quantity: currentQty + safeQuantity,
          };
          return updated;
        } else {
          return [...safePrev, { product: cleanProduct, variant: cleanVariant, quantity: safeQuantity }];
        }
      });

      // Show floating luxury feedback toast
      setLastAddedNotification({
        product: cleanProduct,
        variant: cleanVariant,
        quantity: safeQuantity,
      });

      // Only open cart drawer if explicitly requested (e.g. from modal or checkout CTA)
      if (openDrawer) {
        setIsCartOpen(true);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const updateCartQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (!productId) return;
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      (Array.isArray(prev) ? prev : [])
        .filter((item) => Boolean(item && item.product && item.product.id))
        .map((item) => {
          if (
            item.product.id === productId &&
            (item.variant?.id ?? 'default') === (variantId ?? 'default')
          ) {
            return { ...item, quantity };
          }
          return item;
        })
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    if (!productId) return;
    setCart((prev) =>
      (Array.isArray(prev) ? prev : [])
        .filter((item) => Boolean(item && item.product && item.product.id))
        .filter(
          (item) =>
            !(
              item.product.id === productId &&
              (item.variant?.id ?? 'default') === (variantId ?? 'default')
            )
        )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = Array.isArray(cart)
    ? cart.reduce((acc, item) => {
        if (!item || !item.product) return acc;
        const price =
          typeof item.variant?.price === 'number'
            ? item.variant.price
            : typeof item.product.price === 'number'
            ? item.product.price
            : 0;
        const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
        return acc + price * qty;
      }, 0)
    : 0;

  const cartCount = Array.isArray(cart)
    ? cart.reduce((acc, item) => {
        if (!item || !item.product) return acc;
        const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
        return acc + qty;
      }, 0)
    : 0;

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Order creation (Secure Calculation & Snapshotting)
  const createOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address: CustomerAddress;
    deliveryMethodId: string;
    paymentMethodId: string;
    customerNotes?: string;
    bankTransferReceipt?: string;
    bankTransferConfirmed?: boolean;
  }): Promise<Order> => {
    // Re-verify prices and stock from current catalog state
    const deliveryMethod =
      deliveryMethods.find((d) => d.id === orderData.deliveryMethodId) || deliveryMethods[0];
    const paymentMethod =
      paymentMethods.find((p) => p.id === orderData.paymentMethodId) || paymentMethods[0];

    const orderItems = cart.map((item) => {
      // Re-fetch product from products state to prevent frontend price manipulation
      const liveProduct = products.find((p) => p.id === item.product.id) || item.product;
      const liveVariant = item.variant
        ? liveProduct.variants.find((v) => v.id === item.variant?.id) || item.variant
        : undefined;

      const unitPrice = liveVariant?.price ?? liveProduct.price;
      const lineTotal = unitPrice * item.quantity;

      return {
        product_id: liveProduct.id,
        variant_id: liveVariant?.id,
        product_name_snapshot: liveProduct.name_ar,
        variant_name_snapshot: liveVariant?.name_ar,
        sku_snapshot: liveVariant?.sku || liveProduct.sku,
        unit_price: unitPrice,
        quantity: item.quantity,
        line_total: lineTotal,
        image_snapshot: liveVariant?.image_path || liveProduct.images[0]?.path,
      };
    });

    const calculatedSubtotal = orderItems.reduce((acc, item) => acc + item.line_total, 0);
    const calculatedDeliveryFee = deliveryMethod.fee;
    const discount = 0;
    const grandTotal = calculatedSubtotal + calculatedDeliveryFee - discount;

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MB-2026-${randomNum}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_name_snapshot: orderData.customerName,
      customer_phone_snapshot: orderData.customerPhone,
      customer_email_snapshot: orderData.customerEmail,
      address_snapshot: orderData.address,
      subtotal: calculatedSubtotal,
      delivery_fee: calculatedDeliveryFee,
      discount_total: discount,
      grand_total: grandTotal,
      delivery_method_snapshot: deliveryMethod,
      payment_method_snapshot: paymentMethod,
      status: 'new',
      customer_notes: orderData.customerNotes,
      source: 'web',
      placed_at: new Date().toISOString(),
      bank_transfer_receipt: orderData.bankTransferReceipt,
      bank_transfer_confirmed: Boolean(orderData.bankTransferConfirmed),
      bank_transfer_verified: false,
      items: orderItems,
      logs: [
        {
          id: `log-${Date.now()}`,
          order_id: `ord-${Date.now()}`,
          from_status: 'new',
          to_status: 'new',
          note: 'تم إنشاء الطلب بنجاح عبر المتجر الإلكتروني وحفظ النسخة المعتمدة للأسعار والمواصفات.',
          changed_by: 'نظام ميني بازار المركزي',
          created_at: new Date().toISOString(),
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    clearCart();
    setActiveView('order-success');
    
    // Persist new order to cloud Firestore
    saveOrderToCloud(newOrder);
    
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note: string) => {
    let updatedOrder: Order | null = null;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newLog = {
            id: `log-${Date.now()}`,
            order_id: orderId,
            from_status: ord.status,
            to_status: newStatus,
            note: note || `تم تغيير حالة الطلب إلى "${newStatus}"`,
            changed_by: 'المدير المسؤول (لوحة التحكم)',
            created_at: new Date().toISOString(),
          };
          updatedOrder = {
            ...ord,
            status: newStatus,
            logs: [newLog, ...ord.logs],
          };
          return updatedOrder;
        }
        return ord;
      })
    );

    if (updatedOrder) {
      updateOrderInCloud(orderId, updatedOrder);
    }
  };

  const verifyBankTransferReceipt = (orderId: string, verified: boolean, notes?: string) => {
    let updatedOrder: Order | null = null;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const newLog = {
            id: `log-${Date.now()}`,
            order_id: orderId,
            from_status: ord.status,
            to_status: verified && ord.status === 'new' ? ('confirmed' as OrderStatus) : ord.status,
            note: verified
              ? `تم التحقق والمطابقة مع البنك بنجاح${notes ? ` (ملاحظة: ${notes})` : ''}`
              : `تم إلغاء تأكيد مطابقة الحوالة البنكية${notes ? ` (ملاحظة: ${notes})` : ''}`,
            changed_by: 'المدير المالي (لوحة التحكم)',
            created_at: new Date().toISOString(),
          };
          updatedOrder = {
            ...ord,
            bank_transfer_verified: verified,
            bank_transfer_verified_at: verified ? new Date().toISOString() : undefined,
            bank_transfer_notes: notes ?? ord.bank_transfer_notes,
            status: verified && ord.status === 'new' ? 'confirmed' : ord.status,
            logs: [newLog, ...ord.logs],
          };
          return updatedOrder;
        }
        return ord;
      })
    );

    if (updatedOrder) {
      updateOrderInCloud(orderId, updatedOrder);
    }
  };

  const addManualOrder = (orderData: Partial<Order>) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MB-WA-${randomNum}`;
    const newOrder: Order = {
      id: `ord-manual-${Date.now()}`,
      order_number: orderNumber,
      customer_name_snapshot: orderData.customer_name_snapshot || 'عميل واتساب',
      customer_phone_snapshot: orderData.customer_phone_snapshot || '+966500000000',
      customer_email_snapshot: orderData.customer_email_snapshot,
      address_snapshot: orderData.address_snapshot || {
        country: 'المملكة العربية السعودية',
        city: 'الرياض',
        district: 'وسط المدينة',
        street: 'شارع عام',
      },
      subtotal: orderData.subtotal || 350,
      delivery_fee: orderData.delivery_fee || 35,
      discount_total: orderData.discount_total || 0,
      grand_total: (orderData.subtotal || 350) + (orderData.delivery_fee || 35),
      delivery_method_snapshot: orderData.delivery_method_snapshot || deliveryMethods[0],
      payment_method_snapshot: orderData.payment_method_snapshot || paymentMethods[0],
      status: 'confirmed',
      customer_notes: orderData.customer_notes || 'طلب وارد ومؤكد مباشرة عبر تطبيق الواتساب',
      source: 'whatsapp',
      placed_at: new Date().toISOString(),
      items: orderData.items || [],
      logs: [
        {
          id: `log-${Date.now()}`,
          order_id: `ord-manual-${Date.now()}`,
          from_status: 'new',
          to_status: 'confirmed',
          note: 'تم إدخال وتثبيت الطلب يدوياً بواسطة فريق خدمة عملاء الواتساب.',
          changed_by: 'خدمة عملاء واتساب ميني بازار',
          created_at: new Date().toISOString(),
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    saveOrderToCloud(newOrder);
  };

  // Customization & Settings Management
  const updateHeroSlides = (newSlides: HeroSlide[]) => {
    setHeroSlides(newSlides);
    setHasUnpublishedChanges(true);
  };

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
    setHasUnpublishedChanges(true);
  };

  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setThemeSettings((prev) => ({ ...prev, ...newSettings }));
    setHasUnpublishedChanges(true);
  };

  const publishCustomization = () => {
    safeStorage.setItem('mb_hero_slides', JSON.stringify(heroSlides));
    safeStorage.setItem('mb_store_settings', JSON.stringify(storeSettings));
    safeStorage.setItem('mb_theme_settings', JSON.stringify(themeSettings));
    setHasUnpublishedChanges(false);
    
    // Publish settings & slides to cloud Firestore for all devices
    publishSettingsToCloud(storeSettings, themeSettings, heroSlides);
  };

  const restoreDefaultCustomization = () => {
    setHeroSlides(initialHeroSlides);
    setStoreSettings(initialStoreSettings);
    setThemeSettings(initialThemeSettings);
    safeStorage.removeItem('mb_hero_slides');
    safeStorage.removeItem('mb_store_settings');
    safeStorage.removeItem('mb_theme_settings');
    setHasUnpublishedChanges(false);
    
    publishSettingsToCloud(initialStoreSettings, initialThemeSettings, initialHeroSlides);
  };

  // Product CRUD
  const saveProduct = (productToSave: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === productToSave.id);
      let updated: Product[];
      if (idx > -1) {
        updated = [...prev];
        updated[idx] = productToSave;
      } else {
        updated = [productToSave, ...prev];
      }
      safeStorage.setItem('mb_products', JSON.stringify(updated));
      return updated;
    });
    // Persist product to cloud Firestore
    saveProductToCloud(productToSave);
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      safeStorage.setItem('mb_products', JSON.stringify(updated));
      return updated;
    });
    // Delete product from cloud Firestore
    deleteProductFromCloud(productId);
  };

  // Category CRUD
  const saveCategory = (categoryToSave: Category) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === categoryToSave.id);
      let updated: Category[];
      if (idx > -1) {
        updated = [...prev];
        updated[idx] = categoryToSave;
      } else {
        updated = [...prev, categoryToSave];
      }
      safeStorage.setItem('mb_categories', JSON.stringify(updated));
      return updated;
    });
    // Persist category to cloud Firestore
    saveCategoryToCloud(categoryToSave);
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== categoryId);
      safeStorage.setItem('mb_categories', JSON.stringify(updated));
      return updated;
    });
    // Delete category from cloud Firestore
    deleteCategoryFromCloud(categoryId);
  };

  // Brand CRUD
  const saveBrand = (brandToSave: Brand) => {
    setBrands((prev) => {
      const idx = prev.findIndex((b) => b.id === brandToSave.id);
      let updated: Brand[];
      if (idx > -1) {
        updated = [...prev];
        updated[idx] = brandToSave;
      } else {
        updated = [...prev, brandToSave];
      }
      safeStorage.setItem('mb_brands', JSON.stringify(updated));
      return updated;
    });
    // Persist brand to cloud Firestore
    saveBrandToCloud(brandToSave);
  };

  const deleteBrand = (brandId: string) => {
    setBrands((prev) => {
      const updated = prev.filter((b) => b.id !== brandId);
      safeStorage.setItem('mb_brands', JSON.stringify(updated));
      return updated;
    });
    // Delete brand from cloud Firestore
    deleteBrandFromCloud(brandId);
  };

  // Policy modal/view
  const openPolicy = (policyKey: string) => {
    setActivePolicy(policyKey);
    setActiveView('policy');
  };

  // ================= ADMIN AUTHENTICATION & SECURITY =================
  const loginAdmin = (username: string, password: string, rememberMe = true) => {
    const trimmedUsername = username.trim().toLowerCase();
    const storedUsername = adminCredentials.username.trim().toLowerCase();

    // Verify username match
    if (trimmedUsername !== storedUsername) {
      return {
        success: false,
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً.',
      };
    }

    // Verify salted cryptographic hash
    const isPasswordValid = verifySaltedHashSync(
      password,
      adminCredentials.password_hash,
      adminCredentials.password_salt
    );

    if (isPasswordValid) {
      setIsAdminAuthenticated(true);
      const sessionData = JSON.stringify({
        isAuthenticated: true,
        username: adminCredentials.username,
        loggedInAt: new Date().toISOString(),
      });

      if (rememberMe) {
        safeStorage.setItem('mb_admin_auth_session', sessionData);
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('mb_admin_auth_session');
      } else {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('mb_admin_auth_session', sessionData);
        safeStorage.removeItem('mb_admin_auth_session');
      }
      return { success: true };
    }

    return {
      success: false,
      error: 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً.',
    };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    safeStorage.removeItem('mb_admin_auth_session');
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('mb_admin_auth_session');
  };

  const recoverAdminPassword = (params: {
    identifier: string;
    securityAnswer?: string;
    recoveryPin?: string;
    newPassword: string;
  }) => {
    const { identifier, securityAnswer, recoveryPin, newPassword } = params;
    const cleanId = identifier.trim().toLowerCase();
    const storedUser = adminCredentials.username.trim().toLowerCase();
    const storedEmail = adminCredentials.recovery_email.trim().toLowerCase();

    // Check identifier
    const isIdMatch = cleanId === storedUser || cleanId === storedEmail;
    if (!isIdMatch) {
      return {
        success: false,
        error: 'اسم المستخدم أو البريد الإلكتروني المدخل غير مسجل في النظام.',
      };
    }

    // Check verification using salted hashes
    const isAnswerMatch =
      Boolean(securityAnswer) &&
      verifySaltedHashSync(
        securityAnswer!,
        adminCredentials.security_answer_hash,
        adminCredentials.security_answer_salt
      );

    const isPinMatch =
      Boolean(recoveryPin) &&
      verifySaltedHashSync(
        recoveryPin!,
        adminCredentials.recovery_pin_hash,
        adminCredentials.recovery_pin_salt
      );

    if (!isAnswerMatch && !isPinMatch) {
      return {
        success: false,
        error: 'إجابة سؤال الأمان أو رمز الأمان للاسترداد غير متطابق. يرجى إعادة التحقق.',
      };
    }

    if (!newPassword || newPassword.length < 4) {
      return {
        success: false,
        error: 'كلمة المرور الجديدة يجب أن تحتوي على 4 خانات على الأقل.',
      };
    }

    // Generate new cryptographic salt and hash for new password
    const newPassSalt = generateRandomSalt(16);
    const updated: AdminCredentials = {
      ...adminCredentials,
      password_hash: computeSaltedHashSync(newPassword, newPassSalt),
      password_salt: newPassSalt,
      last_updated: new Date().toISOString(),
    };

    // Remove any legacy plaintext fields
    delete updated.password;
    delete updated.security_answer;
    delete updated.recovery_pin;

    setAdminCredentials(updated);
    safeStorage.setItem('mb_admin_credentials', JSON.stringify(updated));
    setIsAdminAuthenticated(true);
    safeStorage.setItem(
      'mb_admin_auth_session',
      JSON.stringify({
        isAuthenticated: true,
        username: updated.username,
        loggedInAt: new Date().toISOString(),
      })
    );

    return { success: true };
  };

  const updateAdminUsername = (newUsername: string) => {
    const trimmed = newUsername.trim();
    if (!trimmed || trimmed.length < 3) {
      return { success: false, error: 'اسم المستخدم يجب ألا يقل عن 3 أحرف.' };
    }

    const updated: AdminCredentials = {
      ...adminCredentials,
      username: trimmed,
      last_updated: new Date().toISOString(),
    };

    // Remove legacy plaintext fields
    delete updated.password;
    delete updated.security_answer;
    delete updated.recovery_pin;

    setAdminCredentials(updated);
    safeStorage.setItem('mb_admin_credentials', JSON.stringify(updated));

    // Update active session username
    const currentSession = safeStorage.getItem('mb_admin_auth_session') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mb_admin_auth_session') : null);
    if (currentSession) {
      const parsed = JSON.parse(currentSession);
      const newSession = JSON.stringify({ ...parsed, username: trimmed });
      if (safeStorage.getItem('mb_admin_auth_session')) {
        safeStorage.setItem('mb_admin_auth_session', newSession);
      } else if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('mb_admin_auth_session', newSession);
      }
    }

    return { success: true };
  };

  const updateAdminPassword = (currentPassword: string, newPassword: string) => {
    const isCurrentValid = verifySaltedHashSync(
      currentPassword,
      adminCredentials.password_hash,
      adminCredentials.password_salt
    );

    if (!isCurrentValid) {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة.' };
    }

    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'كلمة المرور الجديدة يجب أن تتكون من 4 خانات على الأقل.' };
    }

    const newPassSalt = generateRandomSalt(16);
    const updated: AdminCredentials = {
      ...adminCredentials,
      password_hash: computeSaltedHashSync(newPassword, newPassSalt),
      password_salt: newPassSalt,
      last_updated: new Date().toISOString(),
    };

    // Remove legacy plaintext fields
    delete updated.password;
    delete updated.security_answer;
    delete updated.recovery_pin;

    setAdminCredentials(updated);
    safeStorage.setItem('mb_admin_credentials', JSON.stringify(updated));

    return { success: true };
  };

  const updateAdminSecurity = (securityData: {
    security_question?: string;
    security_answer?: string;
    recovery_email?: string;
    recovery_pin?: string;
  }) => {
    let newAnswerHash = adminCredentials.security_answer_hash;
    let newAnswerSalt = adminCredentials.security_answer_salt;
    if (securityData.security_answer && securityData.security_answer.trim()) {
      newAnswerSalt = generateRandomSalt(16);
      newAnswerHash = computeSaltedHashSync(securityData.security_answer, newAnswerSalt);
    }

    let newPinHash = adminCredentials.recovery_pin_hash;
    let newPinSalt = adminCredentials.recovery_pin_salt;
    if (securityData.recovery_pin && securityData.recovery_pin.trim()) {
      newPinSalt = generateRandomSalt(16);
      newPinHash = computeSaltedHashSync(securityData.recovery_pin, newPinSalt);
    }

    const updated: AdminCredentials = {
      ...adminCredentials,
      security_question: securityData.security_question ?? adminCredentials.security_question,
      security_answer_hash: newAnswerHash,
      security_answer_salt: newAnswerSalt,
      recovery_email: securityData.recovery_email ?? adminCredentials.recovery_email,
      recovery_pin_hash: newPinHash,
      recovery_pin_salt: newPinSalt,
      last_updated: new Date().toISOString(),
    };

    // Remove legacy plaintext fields
    delete updated.password;
    delete updated.security_answer;
    delete updated.recovery_pin;

    setAdminCredentials(updated);
    safeStorage.setItem('mb_admin_credentials', JSON.stringify(updated));

    return { success: true };
  };

  const resetAdminCredentialsToDefault = () => {
    setAdminCredentials(initialAdminCredentials);
    safeStorage.setItem('mb_admin_credentials', JSON.stringify(initialAdminCredentials));
  };

  return (
    <StoreContext.Provider
      value={{
        adminCredentials,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        recoverAdminPassword,
        updateAdminUsername,
        updateAdminPassword,
        updateAdminSecurity,
        resetAdminCredentialsToDefault,

        categories,
        brands,
        products,
        selectedCategory,
        setSelectedCategory,
        selectedBrand,
        setSelectedBrand,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,

        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        lastAddedNotification,
        clearLastAddedNotification,

        wishlist,
        toggleWishlist,
        isInWishlist,

        deliveryMethods,
        paymentMethods,

        orders,
        currentOrder,
        createOrder,
        updateOrderStatus,
        verifyBankTransferReceipt,
        addManualOrder,

        heroSlides,
        updateHeroSlides,
        storeSettings,
        updateStoreSettings,
        themeSettings,
        updateThemeSettings,
        publishCustomization,
        hasUnpublishedChanges,
        restoreDefaultCustomization,

        activeView,
        setActiveView,
        activePolicy,
        openPolicy,

        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        saveBrand,
        deleteBrand,

        language,
        setLanguage,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
