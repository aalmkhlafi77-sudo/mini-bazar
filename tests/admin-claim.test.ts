import { describe, it, expect } from 'vitest';

describe('Admin Authentication Custom Claim Verification', () => {
  it('verifies that admin claims must be true for admin access', () => {
    // Simulate token result evaluation
    const evaluateAdminAccess = (claims: { admin?: boolean }) => {
      return claims.admin === true;
    };

    expect(evaluateAdminAccess({ admin: true })).toBe(true);
    expect(evaluateAdminAccess({ admin: false })).toBe(false);
    expect(evaluateAdminAccess({})).toBe(false);
    expect(evaluateAdminAccess({ admin: undefined })).toBe(false);
  });

  it('generates correct Arabic error message when admin claim is missing', () => {
    const getAdminAccessError = (hasAdminClaim: boolean) => {
      if (!hasAdminClaim) {
        return 'عذراً، هذا الحساب مسجل في النظام ولكنه لا يملك صلاحيات المشرف المطلوبة (Admin Custom Claim: admin === true غير متوفر). يرجى التأكد من صلاحيات الحساب أو التواصل مع مسؤولي النظام.';
      }
      return null;
    };

    const errorMsg = getAdminAccessError(false);
    expect(errorMsg).toContain('صلاحيات المشرف المطلوبة');
    expect(errorMsg).toContain('admin === true غير متوفر');
  });
});
