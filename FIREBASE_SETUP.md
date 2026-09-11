# دليل ربط وتكوين مشروع Firebase المستقل

يحتاج كل عميل أو مستقل لنشر هذا التطبيق إلى ربطه بمشروع Firebase الخاص به. يرجى اتباع الخطوات البسيطة التالية بدقة:

## 1. إنشاء مشروع Firebase جديد وتسجيل تطبيق ويب (Web App)
1. انتقل إلى [لوحة تحكم Firebase Console](https://console.firebase.google.com/).
2. أنشئ مشروعاً جديداً (Project) أو اختر مشروعاً قائماً.
3. من لوحة تحكم المشروع، أضف تطبيق ويب جديد (Web App `</>`) واحفظ إعدادات التهيئة (Firebase Web Config).
4. فعّل **Authentication** (مصادقة المستخدمين - البريد الإلكتروني وكلمة المرور).
5. أنشئ قاعدة بيانات **Cloud Store** (Firestore Database).

## 2. تحديد الإعدادات المطلوبة بدقة وعدم الخلط بينها:
* **معرف مشروع Firebase (Firebase Project ID):** هو معرف المشروع الفريد (مثال: `my-project-xyz`).
* **معرف قاعدة بيانات Firestore (Firestore Database ID):** هو اسم قاعدة البيانات في Firestore (القيمة الافتراضية هي `(default)` أو أي معرف مخصص قمت بإنشائه).
* **معرف تطبيق الويب (Firebase Web App ID):** هو معرف التطبيق الفريد الذي يبدأ عادةً بـ `1:xxxx:web:xxxx`.

## 3. تكوين التطبيق:
قم بتعبئة هذه البيانات في ملف `firebase-applet-config.json` في جذر المشروع أو عبر متغيرات البيئة في `.env`:

```json
{
  "projectId": "your-firebase-project-id",
  "appId": "1:000000000000:web:0000000000000000000000",
  "apiKey": "your-firebase-api-key",
  "authDomain": "your-firebase-project-id.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-firebase-project-id.firebasestorage.app",
  "messagingSenderId": "000000000000"
}
```

> **ملاحظة أمنية هامة:** لا تقم أبداً بإنشاء أو تضمين أي مفاتيح حسابات الخدمة (`Service Account Keys`) في جانب العميل أو في المستودع.
