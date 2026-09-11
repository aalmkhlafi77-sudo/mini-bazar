# دليل إعداد خدمة رفع الصور الدائمة والآمنة على Hostinger Business

يوثّق هذا الدليل خطوات نشر وتأمين خدمة رفع وتخزين الصور الدائمة لمتجر **ميني بازار (Mini Bazaar)** على استضافة **Hostinger Business** باستخدام نقطة النهاية PHP الموحدة (`public/api/upload.php`) ومجلد التخزين الآمن `uploads/` مع تفعيل التحقق الأمني من هوية وصلاحيات المشرفين عبر **Firebase Authentication** و **Admin Custom Claims**.

---

## 1. المعمارية وآلية التحقق الأمني (Security Architecture)

1. **الواجهة الأمامية (Frontend - React):**
   - يقوم المكون `ImageUploader` باختيار الصورة من (ملفات الجهاز، معرض الصور، أو الكاميرا المباشرة).
   - يفحص الحجم مسبقاً (حد أقصى 5 ميجابايت) والتوقيع الثنائي (Magic Bytes).
   - يستخرج رمز **Firebase ID Token** للمستخدم الحالي ويرسله في ترويسة الطلب:
     `Authorization: Bearer <FIREBASE_ID_TOKEN>`
   - يرسل الصورة إلى نقطة النهاية المحددة في `VITE_UPLOAD_ENDPOINT` (القيمة الافتراضية: `/api/upload.php`) بصيغة `multipart/form-data`.

2. **خادم المعالجة والمصادقة (PHP Endpoint - `public/api/upload.php`):**
   - **التحقق من الهوية (Authentication):**
     - يستخرج رمز الـ JWT من ترويسة `Authorization`.
     - يجلب شهادات التوقيع الرسمية لـ Google Firebase عبر `https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com` مع كاش محلي مؤقت لمدة 6 ساعات.
     - يتحقق من توقيع الرمز بخوارزمية `RS256` عبر `openssl_verify`.
     - يتحقق من صحة الحقول:
       - `aud` يطابق معرف المشروع `FIREBASE_PROJECT_ID` (الافتراضي: `inner-abstraction-x1ttq`).
       - `iss` يطابق `https://securetoken.google.com/<FIREBASE_PROJECT_ID>`.
       - صلاحية الرمز `exp` غير منتهية و `auth_time` صحيح.
   - **التحقق من الصلاحيات (RBAC & Admin Custom Claim):**
     - يتحقق من احتواء الرمز على المطالبة المخصصة: `admin: true`.
     - إذا لم يكن المستخدم مشرفاً، يتم رفض الطلب فوراً برمز **HTTP 403 Forbidden**:
       `{"success": false, "error": "عذراً، رفع وتخزين الصور مقتصر على المشرفين والمسؤولين المصرح لهم فقط."}`
     - إذا لم يتم إرسال الرمز أو كان غير صالح، يُرفض برمز **HTTP 401 Unauthorized**.

3. **التحقق من سلامة الملف وحفظه:**
   - فحص الحجم (أقل من أو يساوي 5MB).
   - فحص التوقيع الثنائي ونوع MIME الفعلي باستخدام `FileInfo` و `getimagesize()`.
   - قبول حصراً: **JPEG**, **PNG**, **WebP**, **GIF**.
   - رفض قاطع لملفات **SVG** (لحماية التطبيق من ثغرات XSS) وملفات **BMP** و **HEIC/HEIF**.
   - توليد اسم عشوائي مشفر غير قابل للتخمين (`bin2hex(random_bytes(16))`).
   - حفظ الملف في المجلد المنظم `uploads/YYYY/MM/` بأذونات `0644`.

4. **حفظ الرابط في Firestore:**
   - بعد نجاح الرفع، يُحفظ الرابط الدائم فقط في وثيقة Firestore.
   - يُمنع تخزين أي سلاسل Base64 أو روابط Blob مؤقتة.

---

## 2. الهيكلية ومصدر الملف الرسمي للنشر

الملف المصدري الرسمي والمعتمد الوحيد لنقطة النهاية هو:
`/public/api/upload.php`

عند تنفيذ أمر بناء التطبيق:
```bash
npm run build
```
يقوم Vite تلقائياً بنسخ كافة محتويات مجلد `public/` إلى مجلد `dist/` بما فيها `dist/api/upload.php` وملفات `.htaccess`.

عند رفع محتويات مجلد `dist/` إلى `public_html` في استضافة Hostinger، تصبح الهيكلية كالتالي:

```text
public_html/
│
├── index.html                    # واجهة المتجر الرئيسية
├── assets/                       # ملفات JS و CSS المجمعة
│
├── api/
│   └── upload.php                # نقطة النهاية لمعالجة ومصادقة ورفع الصور
│
├── uploads/                      # مجلد حفظ الصور المرفوعة
│   ├── .htaccess                 # جدار الحماية الصارم لمنع تشغيل أي سكريبتات
│   └── 2026/
│       └── 09/
│           └── 4f9e8a7b...1c.jpg # الصور المرفوعة بأسماء عشوائية
│
└── .htaccess                     # إعدادات SPA Routing و HTTPS و CORS
```

---

## 3. تعيين صلاحية المشرف (Admin Claim) للمستخدم الأول

لا يمكن للمستخدم العادي رفع الصور إلا إذا تم منحه المطالبة المخصصة `admin: true` في حسابه على Firebase Auth.

### الطريقة المعتمدة عبر سكربت Node.js (`scripts/set-admin-claim.mjs`):

1. قم بتنزيل مفتاح حساب الخدمة (Service Account Key) من لوحة تحكم Firebase:
   - **Project Settings** > **Service Accounts** > **Generate new private key**.
2. عيّن مسار المفتاح في بيئة التشغيل:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
   ```
3. شغّل السكربت بتحديد البريد الإلكتروني أو الـ UID للمشرف:
   ```bash
   node scripts/set-admin-claim.mjs a.almkhlafi77@gmail.com
   ```
4. الاستجابة الناجحة:
   ```text
   🔍 Found user: a.almkhlafi77@gmail.com (UID: xxxxxxxxxxxxxxxx)
   ✅ Success! Custom claim { admin: true } assigned to a.almkhlafi77@gmail.com.
   ℹ️ The user should re-login or refresh their ID token to receive the updated claim.
   ```
5. يجب على المشرف تسجيل الخروج ثم تسجيل الدخول مرة أخرى في لوحة إدارة المتجر لتجديد الـ Token وتضمين صلاحية `admin: true`.

---

## 4. إعدادات PHP الموصى بها في لوحة تحكم Hostinger (hPanel)

1. ادخل إلى **hPanel** > **Websites** > اختر موقعك.
2. انتقل إلى **Advanced** > **PHP Configuration**.
3. **إصدار PHP:** `PHP 8.1` أو `PHP 8.2` أو `PHP 8.3`.
4. **الامتدادات المطلوبة (PHP Extensions):**
   - `openssl` (للتحقق من توقيع RS256 لشهادات Google).
   - `curl` أو `allow_url_fopen` (لجلب شهادات Google العامة).
   - `fileinfo` (لفحص تواقيع الملفات ونوع MIME).
   - `gd` (لقراءة أبعاد وتكامل الصور).
   - `json` (لتوليد استجابات JSON).
5. **خيارات PHP (PHP Options):**
   - `upload_max_filesize`: `10M` أو أعلى.
   - `post_max_size`: `12M` أو أعلى.
   - `memory_limit`: `256M` أو أعلى.

---

## 5. تأمين مجلد الرفع `uploads/` ضد الاختراق (`.htaccess`)

ملف `public/uploads/.htaccess` يمنع منعاً باتاً تشغيل أي سكريبت خادم أو تصفح المجلد:

```apache
# تعطيل تشغيل برمجيات الخادم وتصفح المجلدات
Options -ExecCGI -Indexes

# منع استدعاء أو تشغيل أي ملف برمجي نهائياً
<FilesMatch "(?i)\.(php|php3|php4|php5|php7|php8|phtml|phps|cgi|pl|py|sh|bash|exe|asp|aspx|jsp|shtml)$">
    Order Deny,Allow
    Deny from all
</FilesMatch>

# السماح فقط بقراءة وعرض امتدادات الصور الصالحة
<FilesMatch "(?i)\.(jpe?g|png|webp|gif)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>

# إيقاف محرك PHP تماماً داخل مجلد الرفع
<IfModule mod_php.c>
    php_flag engine off
</IfModule>
<IfModule mod_php7.c>
    php_flag engine off
</IfModule>
<IfModule mod_php8.c>
    php_flag engine off
</IfModule>
```

---

## 6. اختبار نقطة النهاية (Testing & Validation)

### 1. اختبار رفض الزائر غير المسجل (HTTP 401):
```bash
curl -X POST -F "image=@test.jpg" https://your-domain.com/api/upload.php
```
**الاستجابة:**
```json
{"success":false,"error":"غير مصرح: يرجى تسجيل الدخول أولاً كمسؤول لرفع الصور."}
```

### 2. اختبار رفض المستخدم العادي غير المشرف (HTTP 403):
```bash
curl -X POST \
  -H "Authorization: Bearer <REGULAR_USER_TOKEN>" \
  -F "image=@test.jpg" \
  https://your-domain.com/api/upload.php
```
**الاستجابة:**
```json
{"success":false,"error":"عذراً، رفع وتخزين الصور مقتصر على المشرفين والمسؤولين المصرح لهم فقط."}
```

### 3. اختبار قبول المشرف المصرح له (HTTP 200):
```bash
curl -X POST \
  -H "Authorization: Bearer <ADMIN_USER_TOKEN>" \
  -F "image=@product.jpg" \
  https://your-domain.com/api/upload.php
```
**الاستجابة:**
```json
{
  "success": true,
  "url": "/uploads/2026/09/a1b2c3d4e5f60718293a4b5c6d7e8f90.jpg",
  "full_url": "https://your-domain.com/uploads/2026/09/a1b2c3d4e5f60718293a4b5c6d7e8f90.jpg",
  "filename": "a1b2c3d4e5f60718293a4b5c6d7e8f90.jpg",
  "mime": "image/jpeg",
  "format": "jpg",
  "size": 245890,
  "width": 1200,
  "height": 800
}
```

### 4. اختبار رفض صيغ SVG أو ملفات أكبر من 5MB:
```bash
curl -X POST \
  -H "Authorization: Bearer <ADMIN_USER_TOKEN>" \
  -F "image=@malicious.svg" \
  https://your-domain.com/api/upload.php
```
**الاستجابة:**
```json
{"success":false,"error":"صيغة SVG غير مدعومة نهائياً لأسباب أمنية وتوافقية. يرجى استخدام صور JPEG أو PNG أو WebP أو GIF."}
```
