import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from '../firebase';
import {
  Product,
  Category,
  Brand,
  Order,
  StoreSettings,
  ThemeSettings,
  HeroSlide,
  AdminCredentials,
} from '../types';
import {
  initialCategories,
  initialBrands,
  initialProducts,
  initialHeroSlides,
  initialStoreSettings,
  initialThemeSettings,
  initialAdminCredentials,
} from '../data/initialData';

// Flag to avoid multiple seeding runs
let isSeeding = false;

/**
 * Seed initial catalog, slides, and settings to Firestore if database collections are empty.
 */
export async function seedInitialFirestoreData() {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const productsRef = collection(db, 'products');
    const snap = await getDocs(productsRef);

    if (snap.empty) {
      console.log('🌱 Seeding initial data to Firestore cloud database...');
      const batch = writeBatch(db);

      // 1. Seed Categories
      for (const cat of initialCategories) {
        const catDoc = doc(db, 'categories', cat.id);
        batch.set(catDoc, cat);
      }

      // 2. Seed Brands
      for (const brand of initialBrands) {
        const brandDoc = doc(db, 'brands', brand.id);
        batch.set(brandDoc, brand);
      }

      // 3. Seed Products
      for (const prod of initialProducts) {
        const prodDoc = doc(db, 'products', prod.id);
        batch.set(prodDoc, prod);
      }

      // 4. Seed Global Settings & Slides (split into separate docs to stay under 1MB limit)
      const generalDoc = doc(db, 'store_settings', 'general');
      batch.set(generalDoc, {
        storeSettings: initialStoreSettings,
        updated_at: new Date().toISOString(),
      });

      const themeDoc = doc(db, 'store_settings', 'theme');
      batch.set(themeDoc, {
        themeSettings: initialThemeSettings,
        updated_at: new Date().toISOString(),
      });

      const heroDoc = doc(db, 'store_settings', 'hero');
      batch.set(heroDoc, {
        heroSlides: initialHeroSlides,
        updated_at: new Date().toISOString(),
      });

      // 5. Seed Admin Credentials
      const adminDoc = doc(db, 'admin_credentials', 'primary');
      batch.set(adminDoc, {
        ...initialAdminCredentials,
        updated_at: new Date().toISOString(),
      });

      await batch.commit();
      console.log('✅ Initial cloud database seeding complete.');
    }
  } catch (error) {
    console.warn('Firestore seeding check notice (offline or permission):', error);
  } finally {
    isSeeding = false;
  }
}

// ================= Real-time Listeners =================

export function listenToProducts(callback: (products: Product[]) => void) {
  try {
    const productsRef = collection(db, 'products');
    return onSnapshot(
      productsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Product[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Product);
          });
          // Sort by sort_order or creation
          list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          callback(list);
        } else {
          // If empty, trigger seeding
          seedInitialFirestoreData();
        }
      },
      (error) => {
        console.warn('Products sync snapshot error:', error);
      }
    );
  } catch (e) {
    console.warn('Failed to listen to products:', e);
    return () => {};
  }
}

export function listenToCategories(callback: (categories: Category[]) => void) {
  try {
    const categoriesRef = collection(db, 'categories');
    return onSnapshot(
      categoriesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Category[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Category);
          });
          list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          callback(list);
        }
      },
      (error) => {
        console.warn('Categories sync snapshot error:', error);
      }
    );
  } catch (e) {
    console.warn('Failed to listen to categories:', e);
    return () => {};
  }
}

export function listenToBrands(callback: (brands: Brand[]) => void) {
  try {
    const brandsRef = collection(db, 'brands');
    return onSnapshot(
      brandsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Brand[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Brand);
          });
          list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          callback(list);
        }
      },
      (error) => {
        console.warn('Brands sync snapshot error:', error);
      }
    );
  } catch (e) {
    console.warn('Failed to listen to brands:', e);
    return () => {};
  }
}

export function listenToOrders(callback: (orders: Order[]) => void) {
  try {
    const ordersRef = collection(db, 'orders');
    return onSnapshot(
      ordersRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Order[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Order);
          });
          // Sort by placed_at descending
          list.sort((a, b) => {
            const timeA = new Date(a.placed_at || a.created_at || 0).getTime();
            const timeB = new Date(b.placed_at || b.created_at || 0).getTime();
            return timeB - timeA;
          });
          callback(list);
        }
      },
      (error) => {
        console.warn('Orders sync snapshot error:', error);
      }
    );
  } catch (e) {
    console.warn('Failed to listen to orders:', e);
    return () => {};
  }
}

export function listenToStoreSettings(
  callback: (data: {
    storeSettings?: StoreSettings;
    themeSettings?: ThemeSettings;
    heroSlides?: HeroSlide[];
  }) => void
) {
  try {
    const generalRef = doc(db, 'store_settings', 'general');
    const themeRef = doc(db, 'store_settings', 'theme');
    const heroRef = doc(db, 'store_settings', 'hero');

    let currentStore: StoreSettings | undefined;
    let currentTheme: ThemeSettings | undefined;
    let currentHero: HeroSlide[] | undefined;

    const notify = () => {
      callback({
        storeSettings: currentStore,
        themeSettings: currentTheme,
        heroSlides: currentHero,
      });
    };

    const unsubGeneral = onSnapshot(
      generalRef,
      (docSnap) => {
        if (docSnap.exists()) {
          currentStore = docSnap.data().storeSettings;
          notify();
        } else {
          seedInitialFirestoreData();
        }
      },
      (error) => {
        console.warn('General settings sync error:', error);
      }
    );

    const unsubTheme = onSnapshot(
      themeRef,
      (docSnap) => {
        if (docSnap.exists()) {
          currentTheme = docSnap.data().themeSettings;
          notify();
        }
      },
      (error) => {
        console.warn('Theme settings sync error:', error);
      }
    );

    const unsubHero = onSnapshot(
      heroRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().heroSlides) {
          currentHero = docSnap.data().heroSlides;
          notify();
        }
      },
      (error) => {
        console.warn('Hero settings sync error:', error);
      }
    );

    // Dedicated hero_slides collection listener (each slide is its own document, completely bypassing any 1MB document limit)
    const unsubHeroCol = onSnapshot(
      collection(db, 'hero_slides'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: HeroSlide[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as HeroSlide);
          });
          list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          currentHero = list;
          notify();
        }
      },
      (error) => {
        console.warn('Hero slides collection sync error:', error);
      }
    );

    return () => {
      unsubGeneral();
      unsubTheme();
      unsubHero();
      unsubHeroCol();
    };
  } catch (e) {
    console.warn('Failed to listen to store settings:', e);
    return () => {};
  }
}

// ================= Direct Cloud Mutation Operations =================

export async function saveProductToCloud(product: Product) {
  try {
    const cleanProduct = JSON.parse(JSON.stringify(product));
    const prodDoc = doc(db, 'products', product.id);
    await setDoc(prodDoc, cleanProduct, { merge: true });
  } catch (error) {
    console.error('Failed to save product to Firestore:', error);
  }
}

export async function deleteProductFromCloud(productId: string) {
  try {
    const prodDoc = doc(db, 'products', productId);
    await deleteDoc(prodDoc);
  } catch (error) {
    console.error('Failed to delete product from Firestore:', error);
  }
}

export async function saveCategoryToCloud(category: Category) {
  try {
    const cleanCat = JSON.parse(JSON.stringify(category));
    const catDoc = doc(db, 'categories', category.id);
    await setDoc(catDoc, cleanCat, { merge: true });
  } catch (error) {
    console.error('Failed to save category to Firestore:', error);
  }
}

export async function deleteCategoryFromCloud(categoryId: string) {
  try {
    const catDoc = doc(db, 'categories', categoryId);
    await deleteDoc(catDoc);
  } catch (error) {
    console.error('Failed to delete category from Firestore:', error);
  }
}

export async function saveBrandToCloud(brand: Brand) {
  try {
    const cleanBrand = JSON.parse(JSON.stringify(brand));
    const brandDoc = doc(db, 'brands', brand.id);
    await setDoc(brandDoc, cleanBrand, { merge: true });
  } catch (error) {
    console.error('Failed to save brand to Firestore:', error);
  }
}

export async function deleteBrandFromCloud(brandId: string) {
  try {
    const brandDoc = doc(db, 'brands', brandId);
    await deleteDoc(brandDoc);
  } catch (error) {
    console.error('Failed to delete brand from Firestore:', error);
  }
}

export async function saveOrderToCloud(order: Order) {
  try {
    const cleanOrder = JSON.parse(JSON.stringify(order));
    const orderDoc = doc(db, 'orders', order.id);
    await setDoc(orderDoc, cleanOrder, { merge: true });
  } catch (error) {
    console.error('Failed to save order to Firestore:', error);
  }
}

export async function updateOrderInCloud(orderId: string, updates: Partial<Order>) {
  try {
    const cleanUpdates = JSON.parse(JSON.stringify(updates));
    const orderDoc = doc(db, 'orders', orderId);
    await updateDoc(orderDoc, cleanUpdates);
  } catch (error) {
    console.error('Failed to update order in Firestore:', error);
  }
}

export async function saveHeroSlidesToCloud(heroSlides: HeroSlide[]) {
  try {
    const cleanSlides: HeroSlide[] = JSON.parse(JSON.stringify(heroSlides));

    // 1. Save each slide into its own document in 'hero_slides' collection (zero 1MB document limit risk)
    const writePromises = cleanSlides.map((slide) => {
      const slideDoc = doc(db, 'hero_slides', slide.id);
      return setDoc(slideDoc, slide, { merge: true });
    });
    await Promise.all(writePromises);

    // 2. Clean up removed slides from Firestore collection
    try {
      const snap = await getDocs(collection(db, 'hero_slides'));
      const activeIds = new Set(heroSlides.map((s) => s.id));
      const deletePromises: Promise<void>[] = [];
      snap.forEach((docSnap) => {
        if (!activeIds.has(docSnap.id)) {
          deletePromises.push(deleteDoc(docSnap.ref));
        }
      });
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }
    } catch (cleanErr) {
      console.warn('Hero slides cleanup notice:', cleanErr);
    }

    // 3. Update store_settings/hero as well if size permits
    try {
      const heroDoc = doc(db, 'store_settings', 'hero');
      await setDoc(
        heroDoc,
        {
          heroSlides: cleanSlides,
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (sizeErr) {
      console.warn('store_settings/hero notice (used hero_slides collection instead):', sizeErr);
    }
  } catch (error) {
    console.error('Failed to save hero slides to Firestore:', error);
  }
}

export async function saveStoreSettingsToCloud(storeSettings: Partial<StoreSettings>) {
  try {
    const generalDoc = doc(db, 'store_settings', 'general');
    await setDoc(
      generalDoc,
      {
        storeSettings: JSON.parse(JSON.stringify(storeSettings)),
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save store settings to Firestore:', error);
  }
}

export async function saveThemeSettingsToCloud(themeSettings: Partial<ThemeSettings>) {
  try {
    const themeDoc = doc(db, 'store_settings', 'theme');
    await setDoc(
      themeDoc,
      {
        themeSettings: JSON.parse(JSON.stringify(themeSettings)),
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save theme settings to Firestore:', error);
  }
}

export async function publishSettingsToCloud(
  storeSettings: StoreSettings,
  themeSettings: ThemeSettings,
  heroSlides: HeroSlide[]
) {
  try {
    await Promise.all([
      setDoc(
        doc(db, 'store_settings', 'general'),
        { storeSettings: JSON.parse(JSON.stringify(storeSettings)), updated_at: new Date().toISOString() },
        { merge: true }
      ),
      setDoc(
        doc(db, 'store_settings', 'theme'),
        { themeSettings: JSON.parse(JSON.stringify(themeSettings)), updated_at: new Date().toISOString() },
        { merge: true }
      ),
      saveHeroSlidesToCloud(heroSlides),
    ]);
  } catch (error) {
    console.error('Failed to publish settings to Firestore:', error);
  }
}
