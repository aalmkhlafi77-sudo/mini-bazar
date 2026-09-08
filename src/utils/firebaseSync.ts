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

      // 4. Seed Global Settings & Slides
      const settingsDoc = doc(db, 'store_settings', 'global');
      batch.set(settingsDoc, {
        storeSettings: initialStoreSettings,
        themeSettings: initialThemeSettings,
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
    const settingsDocRef = doc(db, 'store_settings', 'global');
    return onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback({
            storeSettings: data.storeSettings,
            themeSettings: data.themeSettings,
            heroSlides: data.heroSlides,
          });
        } else {
          seedInitialFirestoreData();
        }
      },
      (error) => {
        console.warn('Store settings sync error:', error);
      }
    );
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

export async function publishSettingsToCloud(
  storeSettings: StoreSettings,
  themeSettings: ThemeSettings,
  heroSlides: HeroSlide[]
) {
  try {
    const settingsDoc = doc(db, 'store_settings', 'global');
    await setDoc(
      settingsDoc,
      {
        storeSettings: JSON.parse(JSON.stringify(storeSettings)),
        themeSettings: JSON.parse(JSON.stringify(themeSettings)),
        heroSlides: JSON.parse(JSON.stringify(heroSlides)),
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to publish settings to Firestore:', error);
  }
}
