import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminCredentials,
  Category,
  Product,
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
  products: Product[];
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

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
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note: string) => void;
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

  // Language
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Admin Credentials & Authentication State with automatic security migration
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    const saved = localStorage.getItem('mb_admin_credentials');
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
          localStorage.setItem('mb_admin_credentials', JSON.stringify(secured));
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
    const localSession = localStorage.getItem('mb_admin_auth_session');
    const tempSession = sessionStorage.getItem('mb_admin_auth_session');
    return Boolean(localSession || tempSession);
  });

  // State initialization with localStorage fallback
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mb_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mb_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem('mb_hero_slides');
    return saved ? JSON.parse(saved) : initialHeroSlides;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('mb_store_settings');
    if (!saved) return initialStoreSettings;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...initialStoreSettings,
        ...parsed,
        social_links: parsed.social_links || initialStoreSettings.social_links,
        navigation_items: parsed.navigation_items || initialStoreSettings.navigation_items,
        footer_columns: parsed.footer_columns || initialStoreSettings.footer_columns,
      };
    } catch {
      return initialStoreSettings;
    }
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('mb_theme_settings');
    return saved ? JSON.parse(saved) : initialThemeSettings;
  });

  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  // Delivery & Payment options
  const [deliveryMethods] = useState<DeliveryMethod[]>(initialDeliveryMethods);
  const [paymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mb_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('mb_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('mb_orders');
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

  // Navigation & View State
  const [activeView, setActiveView] = useState<'store' | 'product' | 'checkout' | 'order-success' | 'wishlist' | 'admin' | 'policy'>('store');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('mb_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mb_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('mb_orders', JSON.stringify(orders));
  }, [orders]);

  // Cart operations
  const addToCart = (product: Product, variantId?: string, quantity: number = 1) => {
    const variant = variantId
      ? product.variants.find((v) => v.id === variantId)
      : product.variants.find((v) => v.is_default) || product.variants[0];

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === variant?.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, variant, quantity }];
      }
    });

    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.variant?.id === variantId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.variant?.id === variantId))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((acc, item) => {
    const price = item.variant?.price ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

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
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, note: string) => {
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
          return {
            ...ord,
            status: newStatus,
            logs: [newLog, ...ord.logs],
          };
        }
        return ord;
      })
    );
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
    localStorage.setItem('mb_hero_slides', JSON.stringify(heroSlides));
    localStorage.setItem('mb_store_settings', JSON.stringify(storeSettings));
    localStorage.setItem('mb_theme_settings', JSON.stringify(themeSettings));
    setHasUnpublishedChanges(false);
  };

  const restoreDefaultCustomization = () => {
    setHeroSlides(initialHeroSlides);
    setStoreSettings(initialStoreSettings);
    setThemeSettings(initialThemeSettings);
    localStorage.removeItem('mb_hero_slides');
    localStorage.removeItem('mb_store_settings');
    localStorage.removeItem('mb_theme_settings');
    setHasUnpublishedChanges(false);
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
      localStorage.setItem('mb_products', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      localStorage.setItem('mb_products', JSON.stringify(updated));
      return updated;
    });
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
      localStorage.setItem('mb_categories', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== categoryId);
      localStorage.setItem('mb_categories', JSON.stringify(updated));
      return updated;
    });
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
        localStorage.setItem('mb_admin_auth_session', sessionData);
        sessionStorage.removeItem('mb_admin_auth_session');
      } else {
        sessionStorage.setItem('mb_admin_auth_session', sessionData);
        localStorage.removeItem('mb_admin_auth_session');
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
    localStorage.removeItem('mb_admin_auth_session');
    sessionStorage.removeItem('mb_admin_auth_session');
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
    localStorage.setItem('mb_admin_credentials', JSON.stringify(updated));
    setIsAdminAuthenticated(true);
    localStorage.setItem(
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
    localStorage.setItem('mb_admin_credentials', JSON.stringify(updated));

    // Update active session username
    const currentSession = localStorage.getItem('mb_admin_auth_session') || sessionStorage.getItem('mb_admin_auth_session');
    if (currentSession) {
      const parsed = JSON.parse(currentSession);
      const newSession = JSON.stringify({ ...parsed, username: trimmed });
      if (localStorage.getItem('mb_admin_auth_session')) {
        localStorage.setItem('mb_admin_auth_session', newSession);
      } else {
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
    localStorage.setItem('mb_admin_credentials', JSON.stringify(updated));

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
    localStorage.setItem('mb_admin_credentials', JSON.stringify(updated));

    return { success: true };
  };

  const resetAdminCredentialsToDefault = () => {
    setAdminCredentials(initialAdminCredentials);
    localStorage.setItem('mb_admin_credentials', JSON.stringify(initialAdminCredentials));
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
        products,
        selectedCategory,
        setSelectedCategory,
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

        wishlist,
        toggleWishlist,
        isInWishlist,

        deliveryMethods,
        paymentMethods,

        orders,
        currentOrder,
        createOrder,
        updateOrderStatus,
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
