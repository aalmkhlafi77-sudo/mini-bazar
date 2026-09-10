import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import fs from 'fs';

const PROJECT_ID = 'ai-studio-minibazaar-test';

describe('Real Firebase Rules Integration Testing (Firestore & Storage)', () => {
  let testEnv: RulesTestEnvironment | null = null;
  let emulatorAvailable = false;

  beforeAll(async () => {
    try {
      const firestoreRules = fs.readFileSync('firestore.rules', 'utf8');
      const storageRules = fs.readFileSync('storage.rules', 'utf8');

      testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
          rules: firestoreRules,
          host: '127.0.0.1',
          port: 8080,
        },
        storage: {
          rules: storageRules,
          host: '127.0.0.1',
          port: 9199,
        },
      });
      emulatorAvailable = true;
    } catch (err: any) {
      emulatorAvailable = false;
      throw new Error(
        'محاكيات Firebase Emulator غير متاحة في البيئة الحالية (السبب: يتطلب تشغيل firebase emulators توفر Java Runtime وهو غير مثبت في الحاوية). لا يمكن تشغيل اختبارات المحاكي الحية محلياً ولا يتم عرضها كأنها نجحت بوضع Skip.'
      );
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (!emulatorAvailable || !testEnv) {
      throw new Error('Firebase Emulator testEnv غير متوفر.');
    }
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
  });

  describe('1. Firestore Catalog (Products, Categories, Brands)', () => {
    it('Guest (unauthenticated) CAN read products', async () => {
      const guestDb = testEnv.unauthenticatedContext().firestore();
      const productRef = doc(guestDb, 'products', 'prod_1');
      await assertSucceeds(getDoc(productRef));
    });

    it('Guest (unauthenticated) CANNOT create, update or delete products', async () => {
      const guestDb = testEnv.unauthenticatedContext().firestore();
      const productRef = doc(guestDb, 'products', 'prod_1');
      await assertFails(setDoc(productRef, { name_ar: 'عطر مسك' }));
      await assertFails(updateDoc(productRef, { name_ar: 'عطر مسك معدل' }));
      await assertFails(deleteDoc(productRef));
    });

    it('Regular Authenticated User (NO admin claim) CANNOT create, update or delete products', async () => {
      const userDb = testEnv.authenticatedContext('user_regular_456', {}).firestore();
      const productRef = doc(userDb, 'products', 'prod_1');
      await assertFails(setDoc(productRef, { name_ar: 'عطر عود' }));
      await assertFails(updateDoc(productRef, { name_ar: 'تعديل غير مصرح' }));
      await assertFails(deleteDoc(productRef));
    });

    it('Admin User (WITH custom claim admin: true) CAN create, update and delete products', async () => {
      const adminDb = testEnv.authenticatedContext('admin_user_789', { admin: true }).firestore();
      const productRef = doc(adminDb, 'products', 'prod_1');
      
      // Create product
      await assertSucceeds(
        setDoc(productRef, {
          name_ar: 'عطر فاخر',
          images: [],
        })
      );

      // Update product
      await assertSucceeds(
        updateDoc(productRef, {
          name_ar: 'عطر فاخر معدل',
        })
      );

      // Delete product
      await assertSucceeds(deleteDoc(productRef));
    });
  });

  describe('2. Firestore Orders (Creation, Protection & Restriction)', () => {
    const validOrder = {
      id: 'order_100',
      order_number: 'ORD-100',
      customer_name_snapshot: 'أحمد المخلافي',
      customer_phone_snapshot: '+966500000000',
      customer_email_snapshot: 'client@example.com',
      address_snapshot: {
        country: 'SA',
        city: 'الرياض',
        district: 'العليا',
        street: 'شارع الملك فهد',
      },
      subtotal: 200,
      delivery_fee: 25,
      discount_total: 0,
      grand_total: 225,
      delivery_method_snapshot: { id: 'd1', name_ar: 'توصيل قياسي' },
      payment_method_snapshot: { id: 'p1', name_ar: 'الدفع عند الاستلام' },
      status: 'new',
      notes: 'تسليم في المساء',
      items: [{ product_id: 'p1', quantity: 1, unit_price: 200 }],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it('Guest (unauthenticated) CAN create a valid order matching schema', async () => {
      const guestDb = testEnv.unauthenticatedContext().firestore();
      const orderRef = doc(guestDb, 'orders', 'order_100');
      await assertSucceeds(setDoc(orderRef, validOrder));
    });

    it('Guest (unauthenticated) CANNOT create an invalid order (excessive grand_total or unknown fields)', async () => {
      const guestDb = testEnv.unauthenticatedContext().firestore();
      
      // Order with unknown/malicious field injected
      const maliciousOrderRef = doc(guestDb, 'orders', 'order_bad_1');
      await assertFails(
        setDoc(maliciousOrderRef, {
          ...validOrder,
          id: 'order_bad_1',
          injected_admin_override: true,
        })
      );

      // Order with negative grand_total
      const negativeTotalRef = doc(guestDb, 'orders', 'order_bad_2');
      await assertFails(
        setDoc(negativeTotalRef, {
          ...validOrder,
          id: 'order_bad_2',
          grand_total: -50,
        })
      );
    });

    it('Guest (unauthenticated) CANNOT read, update or delete any orders', async () => {
      // Seed order via admin
      const adminDb = testEnv.authenticatedContext('admin_user_789', { admin: true }).firestore();
      await setDoc(doc(adminDb, 'orders', 'order_100'), validOrder);

      const guestDb = testEnv.unauthenticatedContext().firestore();
      const orderRef = doc(guestDb, 'orders', 'order_100');

      await assertFails(getDoc(orderRef));
      await assertFails(updateDoc(orderRef, { status: 'cancelled' }));
      await assertFails(deleteDoc(orderRef));
    });

    it('Regular Authenticated User (NO admin claim) CANNOT read, update or delete any orders', async () => {
      const userDb = testEnv.authenticatedContext('user_regular_456', {}).firestore();
      const orderRef = doc(userDb, 'orders', 'order_100');

      await assertFails(getDoc(orderRef));
      await assertFails(updateDoc(orderRef, { status: 'confirmed' }));
      await assertFails(deleteDoc(orderRef));
    });

    it('Admin User (WITH custom claim admin: true) CAN read, update and delete orders', async () => {
      const adminDb = testEnv.authenticatedContext('admin_user_789', { admin: true }).firestore();
      const orderRef = doc(adminDb, 'orders', 'order_100');

      await assertSucceeds(setDoc(orderRef, validOrder));
      await assertSucceeds(getDoc(orderRef));
      await assertSucceeds(updateDoc(orderRef, { status: 'confirmed' }));
      await assertSucceeds(deleteDoc(orderRef));
    });
  });

  describe('3. Firebase Storage (Images, MIME Types, 5MB Limit)', () => {
    const validImageBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]); // Small JPEG header
    const validImageMetadata = { contentType: 'image/jpeg' };

    it('Guest and Regular User CANNOT upload files to Storage', async () => {
      const guestStorage = testEnv.unauthenticatedContext().storage();
      const guestFileRef = ref(guestStorage, 'uploads/products/image1.jpg');
      await assertFails(uploadBytes(guestFileRef, validImageBytes, validImageMetadata));

      const userStorage = testEnv.authenticatedContext('user_regular_456', {}).storage();
      const userFileRef = ref(userStorage, 'uploads/products/image2.jpg');
      await assertFails(uploadBytes(userFileRef, validImageBytes, validImageMetadata));
    });

    it('Admin User (WITH custom claim admin: true) CAN upload valid raster images <= 5MB', async () => {
      const adminStorage = testEnv.authenticatedContext('admin_user_789', { admin: true }).storage();
      const fileRef = ref(adminStorage, 'uploads/products/banner.jpg');
      await assertSucceeds(uploadBytes(fileRef, validImageBytes, validImageMetadata));
    });

    it('Admin User CANNOT upload executable, SVG, or disallowed MIME types', async () => {
      const adminStorage = testEnv.authenticatedContext('admin_user_789', { admin: true }).storage();

      // SVG attempt (XSS prevention)
      const svgRef = ref(adminStorage, 'uploads/products/vector.svg');
      await assertFails(uploadBytes(svgRef, validImageBytes, { contentType: 'image/svg+xml' }));

      // Executable / Script attempt
      const exeRef = ref(adminStorage, 'uploads/products/payload.exe');
      await assertFails(uploadBytes(exeRef, validImageBytes, { contentType: 'application/x-msdownload' }));

      // HTML file attempt
      const htmlRef = ref(adminStorage, 'uploads/products/page.html');
      await assertFails(uploadBytes(htmlRef, validImageBytes, { contentType: 'text/html' }));
    });

    it('Admin User CANNOT upload files exceeding 5 MB limit', async () => {
      const adminStorage = testEnv.authenticatedContext('admin_user_789', { admin: true }).storage();
      const fileRef = ref(adminStorage, 'uploads/products/large.jpg');

      // 5.5 MB payload
      const largeBytes = new Uint8Array(5.5 * 1024 * 1024);
      await assertFails(uploadBytes(fileRef, largeBytes, validImageMetadata));
    });
  });
});
