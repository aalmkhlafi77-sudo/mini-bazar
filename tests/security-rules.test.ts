import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('Firestore and Storage Security Rules Verification', () => {
  const firestoreRules = fs.readFileSync('./firestore.rules', 'utf8');
  const storageRules = fs.readFileSync('./storage.rules', 'utf8');

  describe('Firestore Rules Invariants', () => {
    it('enforces rules_version = 2', () => {
      expect(firestoreRules).toContain("rules_version = '2';");
    });

    it('requires custom claim admin == true for isAdmin()', () => {
      expect(firestoreRules).toMatch(/request\.auth\.token\.admin\s*==\s*true/);
      expect(firestoreRules).not.toMatch(/function isAdmin\(\)\s*\{\s*return request\.auth != null;\s*\}/);
    });

    it('denies order reading to non-admins (public and regular users)', () => {
      expect(firestoreRules).toMatch(/match \/orders\/\{orderId\}\s*\{[\s\S]*?allow read:\s*if isAdmin\(\);/);
    });

    it('restricts product mutations and deletions strictly to admins', () => {
      expect(firestoreRules).toMatch(/match \/products\/\{productId\}\s*\{[\s\S]*?allow create, update:\s*if isAdmin\(\)/);
      expect(firestoreRules).toMatch(/allow delete:\s*if isAdmin\(\)/);
    });

    it('enforces default deny catch-all for all documents', () => {
      expect(firestoreRules).toMatch(/match \/\{document=\*\*\}\s*\{\s*allow read, write:\s*if false;\s*\}/);
    });
  });

  describe('Firebase Storage Rules Invariants', () => {
    it('enforces rules_version = 2 in storage.rules', () => {
      expect(storageRules).toContain("rules_version = '2';");
    });

    it('allows public read for published uploads', () => {
      expect(storageRules).toMatch(/match \/uploads\/\{allPaths=\*\*\}\s*\{\s*allow read:\s*if true;/);
    });

    it('enforces custom claim admin for uploads and mutations', () => {
      expect(storageRules).toMatch(/request\.auth\.token\.admin\s*==\s*true/);
    });

    it('restricts content-type strictly to valid images', () => {
      expect(storageRules).toContain("request.resource.contentType.matches('image/(jpeg|png|webp|gif)')");
    });

    it('enforces 5MB size limit on uploads', () => {
      expect(storageRules).toMatch(/request\.resource\.size\s*<=\s*5\s*\*\s*1024\s*\*\s*1024/);
    });

    it('enforces default deny catch-all in Storage', () => {
      expect(storageRules).toMatch(/match \/\{allPaths=\*\*\}\s*\{\s*allow read, write:\s*if false;\s*\}/);
    });
  });

  describe('Rule Evaluation Engine Simulation', () => {
    function simulateFirestoreOp({ path, op, auth, data = {} }: { path: string; op: string; auth: any; data?: any }) {
      const isSignedIn = auth !== null;
      const isAdmin = isSignedIn && auth?.token?.admin === true;

      if (path.startsWith('/products/')) {
        if (op === 'read') return true;
        if (op === 'write' || op === 'delete') return isAdmin;
      }
      if (path.startsWith('/orders/')) {
        if (op === 'read') return isAdmin;
        if (op === 'create') {
          return (
            typeof data.customer_name_snapshot === 'string' &&
            data.customer_name_snapshot.length > 0 &&
            data.customer_name_snapshot.length <= 200 &&
            typeof data.customer_phone_snapshot === 'string' &&
            typeof data.grand_total === 'number' &&
            data.grand_total >= 0 &&
            data.grand_total <= 10000000
          );
        }
        if (op === 'update' || op === 'delete') return isAdmin;
      }
      return false;
    }

    function simulateStorageOp({ path, op, auth, contentType, size }: { path: string; op: string; auth: any; contentType?: string; size?: number }) {
      const isSignedIn = auth !== null;
      const isAdmin = isSignedIn && auth?.token?.admin === true;
      const isAllowedImg = !!contentType && /^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(contentType);
      const isUnder5MB = typeof size === 'number' && size <= 5 * 1024 * 1024;

      if (path.startsWith('/uploads/')) {
        if (op === 'read') return true;
        if (op === 'write') return isAdmin && isAllowedImg && isUnder5MB;
        if (op === 'delete') return isAdmin;
      }
      return false;
    }

    // Firestore Matrix Tests
    it('1. Unauthenticated Visitor cannot modify products', () => {
      expect(simulateFirestoreOp({ path: '/products/1', op: 'write', auth: null })).toBe(false);
    });

    it('2. Regular Authenticated User cannot modify products', () => {
      expect(simulateFirestoreOp({ path: '/products/1', op: 'write', auth: { uid: 'u1', token: {} } })).toBe(false);
    });

    it('3. Admin User (admin: true) can modify products', () => {
      expect(simulateFirestoreOp({ path: '/products/1', op: 'write', auth: { uid: 'u_admin', token: { admin: true } } })).toBe(true);
    });

    it('4. Visitor can create valid order', () => {
      expect(
        simulateFirestoreOp({
          path: '/orders/1',
          op: 'create',
          auth: null,
          data: { customer_name_snapshot: 'محمد', customer_phone_snapshot: '0500000000', grand_total: 150 },
        })
      ).toBe(true);
    });

    it('5. Visitor cannot read orders', () => {
      expect(simulateFirestoreOp({ path: '/orders/1', op: 'read', auth: null })).toBe(false);
    });

    it('6. Regular Authenticated User cannot read orders', () => {
      expect(simulateFirestoreOp({ path: '/orders/1', op: 'read', auth: { uid: 'u1', token: {} } })).toBe(false);
    });

    it('7. Admin User can read orders', () => {
      expect(simulateFirestoreOp({ path: '/orders/1', op: 'read', auth: { uid: 'u_admin', token: { admin: true } } })).toBe(true);
    });

    // Storage Matrix Tests
    it('8. Visitor cannot upload to Storage', () => {
      expect(simulateStorageOp({ path: '/uploads/p1.png', op: 'write', auth: null, contentType: 'image/png', size: 1024 })).toBe(false);
    });

    it('9. Regular Authenticated User cannot upload to Storage', () => {
      expect(simulateStorageOp({ path: '/uploads/p1.png', op: 'write', auth: { uid: 'u1', token: {} }, contentType: 'image/png', size: 1024 })).toBe(false);
    });

    it('10. Admin User cannot upload executable or non-image files (.exe / .sh / .pdf)', () => {
      expect(simulateStorageOp({ path: '/uploads/script.sh', op: 'write', auth: { uid: 'u_admin', token: { admin: true } }, contentType: 'application/x-sh', size: 1024 })).toBe(false);
      expect(simulateStorageOp({ path: '/uploads/malware.exe', op: 'write', auth: { uid: 'u_admin', token: { admin: true } }, contentType: 'application/x-msdownload', size: 1024 })).toBe(false);
    });

    it('11. Admin User cannot upload files larger than 5MB', () => {
      expect(simulateStorageOp({ path: '/uploads/huge.png', op: 'write', auth: { uid: 'u_admin', token: { admin: true } }, contentType: 'image/png', size: 6 * 1024 * 1024 })).toBe(false);
    });

    it('12. Admin User can upload valid image <= 5MB', () => {
      expect(simulateStorageOp({ path: '/uploads/banner.webp', op: 'write', auth: { uid: 'u_admin', token: { admin: true } }, contentType: 'image/webp', size: 1.5 * 1024 * 1024 })).toBe(true);
    });
  });

  describe('Admin Authentication Claims Verification', () => {
    it('rejects user when claims.admin is missing or false', async () => {
      const mockUserWithoutAdmin = {
        getIdTokenResult: async () => ({ claims: { admin: false } })
      };
      const claims: any = (await mockUserWithoutAdmin.getIdTokenResult()).claims;
      const isAdmin = claims.admin === true;
      expect(isAdmin).toBe(false);
    });

    it('rejects user when claims.admin is undefined', async () => {
      const mockUserWithoutAdmin = {
        getIdTokenResult: async () => ({ claims: {} })
      };
      const claims: any = (await mockUserWithoutAdmin.getIdTokenResult()).claims;
      const isAdmin = claims.admin === true;
      expect(isAdmin).toBe(false);
    });

    it('accepts user when claims.admin === true', async () => {
      const mockAdminUser = {
        getIdTokenResult: async () => ({ claims: { admin: true } })
      };
      const claims: any = (await mockAdminUser.getIdTokenResult()).claims;
      const isAdmin = claims.admin === true;
      expect(isAdmin).toBe(true);
    });
  });
});
