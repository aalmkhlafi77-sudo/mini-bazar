# الدليل الأمني المعماري لمتجر ميني بازار (Mini Bazaar Security Guide)

## 1. نموذج الصلاحيات وإدارة المشرفين (Firebase Custom Claims)

يعتمد النظام على **Firebase Custom Claims** الرسمية لتقييد الصلاحيات الحساسة في خوادم Google بدلاً من الاعتماد على مجرد فحص حالة تسجيل الدخول (`request.auth != null`).

### دالة التحقق في قواعد الأمان (`firestore.rules` و `storage.rules`):
```javascript
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
```

---

## 2. خطوات تعيين أول مشرف وتفعيل الصلاحيات (Admin Claim Provisioning)

السكربت مخصص للتشغيل في بيئة سحابية آمنة (CLI / Cloud Function / Node.js Server) ولا يتم تشغيله تلقائياً أثناء البناء أو النشر، ولا يحتوي تطبيق React على أي مفاتيح سرية (Zero Service Accounts in Frontend).

### خطوات التشغيل:
1. قم بتوفير مفتاح حساب الخدمة (Service Account) أو تشغيل البيئة مع Google Application Default Credentials (ADC).
2. نفّذ الأمر التالي عبر الطرفية:
   ```bash
   node scripts/set-admin-claim.mjs admin@minibazaar.com
   # أو بواسطة UID:
   node scripts/set-admin-claim.mjs YOUR_ADMIN_FIREBASE_UID
   ```
3. **تجديد الجلسة (مهم جداً):**
   - بعد تعيين الـ Custom Claim، يجب على المشرف **تسجيل الخروج ثم تسجيل الدخول مجدداً** أو استدعاء `auth.currentUser.getIdToken(true)` لتحديث توكن المصادقة (ID Token) وحمله لخاصية `admin: true`.

---

## 3. حماية الطلبات والدفع (Orders Security Architecture)

### في النسخة التجريبية (Demo Mode):
- يُسمح للزوار بإنشاء وثيقة طلب (`create`) بشرط تطابق الحقول المفروضة (`customer_name_snapshot`, `customer_phone_snapshot`, `grand_total >= 0 && grand_total <= 10000000`).
- **يُحظر تماماً على الزوار والمستخدمين العاديين قراءة (`read`) أو تعديل (`update`) أو حذف (`delete`) أي طلب.**

### في بيئة الإنتاج التجاري الفعلي (Production Architecture):
- لا تستطيع قواعد Firestore التحقق من مطابقة أسعار بنود السلة مع أسعار المنتجات في قاعدة البيانات دون تكلفة قراءة إضافية.
- لذلك في الإنتاج، يجب استخدام **Cloud Function / Secure Backend Endpoint** موثوقة (مثل `POST /api/orders` أو `onCall createOrder`):
  1. استلام معرفات المنتجات والكميات من العميل.
  2. قراءة الأسعار المعتمدة مباشرة من Firestore على الخادم.
  3. حساب الإجمالي وقيمة الشحن والخصومات بشكل موثوق وخالٍ من التلاعب.
  4. إنشاء وثيقة الطلب بحالة `pending_payment` وتمرير الدفع لبوابة الدفع الإلكتروني.

---

## 4. الشرائح المخفية ومسودات الحملات (Hero Slides Architecture)

- **الوضع الحالي:** الشرائح المنشورة تحمل خاصية `is_visible: true` ويتم عرضها في الواجهة للزوار.
- **إخفاء العرض:** الشريحة التي تحمل `is_visible: false` لا يتم تضمينها في عارض الشرائح (`filter(s => s.is_visible)`).
- **المسودات الحساسة غير المنشورة:** إذا كانت هناك حملات مستقبلية تتضمن سرية تجارية قبل إطلاقها، يُنصح بحفظها في مجموعة منفصلة مخصصة للمشرفين مثل `admin_hero_drafts` (بقاعدة `allow read: if isAdmin();`) ونقلها إلى `hero_slides` عند موعد الإطلاق العام.

---

## 5. قواعد Firebase Storage

تفرض `storage.rules`:
- القراءة عامة للصور المنشورة في `/uploads/` و `/images/`.
- الرفع والتعديل والحذف محصور فقط بالمشرفين أصحاب Claim `admin: true`.
- حصر نوع الملفات المرفوعة بالصور فقط (`image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`).
- تحديد الحد الأقصى لحجم الملف بـ **5 ميجابايت** لكل صورة ومنع رفع أي ملفات تنفيذية أو غير مصرح بها.

---

## 6. أوامر فحص واختبار الأمان

```bash
# تشغيل مجموعة اختبارات الأمان لقواعد Firestore و Storage:
npm run test:rules
```
