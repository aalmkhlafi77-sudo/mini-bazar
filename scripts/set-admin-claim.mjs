/**
 * يمنح مستخدم Firebase Authentication صلاحية لوحة الإدارة.
 * الاستخدام:
 * node scripts/set-admin-claim.mjs <EMAIL_OR_UID>
 *
 * يتطلب متغير GOOGLE_APPLICATION_CREDENTIALS مشيراً إلى ملف مفتاح الخدمة.
 */

import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
      });
}

const auth = getAuth();

async function setAdminClaim(identifier) {
  if (!identifier) {
    console.error('❌ أدخل البريد الإلكتروني أو UID للمستخدم.');
    process.exit(1);
  }

  try {
    const user = identifier.includes('@')
      ? await auth.getUserByEmail(identifier)
      : await auth.getUser(identifier);

    const existingClaims = user.customClaims ?? {};

    await auth.setCustomUserClaims(user.uid, {
      ...existingClaims,
      admin: true,
      role: 'admin',
    });

    console.log(`✅ مُنحت صلاحية admin للمستخدم: ${user.email} (${user.uid})`);
    console.log('سجّل الخروج ثم الدخول مجدداً لتحديث رمز الجلسة.');
  } catch (error) {
    console.error('❌ تعذر منح صلاحية المشرف:', error.message);
    process.exit(1);
  }
}

await setAdminClaim(process.argv[2]);