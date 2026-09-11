# Security Specification: mini-bazar

## 1. System Overview & Invariants
- **Platform**: Web (React 19 + Vite + Tailwind CSS + Firebase).
- **Persistence Layer**: Cloud Firestore (Project: `inner-abstraction-x1ttq`, Database: `ai-studio-minibazaar-8804aa4a-babc-465a-a062-433fc4c3ee49`).
- **Media Storage**: Firebase Storage (Bucket: `inner-abstraction-x1ttq.firebasestorage.app`).
- **Identity & Access**: Firebase Authentication for administrators; anonymous/public browsing for customers.

### Core Invariants:
1. **Catalog Read Access**: Any user (guest or authenticated) can read active categories, brands, products, hero slides, and public store settings.
2. **Catalog Mutation Authority**: Only authenticated administrators (`request.auth != null`) can create, update, or delete products, categories, brands, hero slides, or store settings.
3. **Order Placement**: Any visitor can create a new customer order. Once created, orders can only be updated, status-changed, or viewed in bulk by authenticated administrators.
4. **No Base64 Payload Injections**: Images in database documents must be valid HTTPS URLs (referencing Firebase Storage or approved CDN assets), never massive Base64 strings that risk hitting the 1MB Firestore document limit.
5. **No Blind Default Re-seeding**: An empty collection in Firestore is a valid, intentional state (e.g. an administrator clearing out seasonal categories or products) and must never trigger a client-side database reset.
6. **No Client-Forged Admin Role**: Admin privileges must be determined by valid Firebase Authentication session tokens (`request.auth != null` with admin claims or designated admin email/uid), never a mutable localStorage flag.

---

## 2. The "Dirty Dozen" Threat Payloads (Red Team Test Matrix)

| ID | Attack Vector / Payload | Target Resource | Expected Behavior |
|---|---|---|---|
| **P-01** | Unauthenticated `setDoc` on `/products/malicious-prod` with arbitrary price & title | `/products/{id}` | **PERMISSION_DENIED** (403) |
| **P-02** | Unauthenticated `deleteDoc` on `/categories/{id}` or batch-wiping `/hero_slides` | `/categories/{id}`, `/hero_slides/{id}` | **PERMISSION_DENIED** (403) |
| **P-03** | Shadow update injecting arbitrary fields (`role: 'superadmin'`, `isAdmin: true`) | `/store_settings/general` | **PERMISSION_DENIED** (403) |
| **P-04** | Client setting `localStorage.setItem('mb_admin_auth_session', '{"isAuthenticated": true}')` and attempting write | All protected collections | **REJECTED BY FIRESTORE RULES** |
| **P-05** | Guest attempting to read all `/orders` or customer PII documents | `/orders` collection query | **PERMISSION_DENIED** (403) |
| **P-06** | Creating order with missing customer contact details or invalid price structure | `/orders/{orderId}` | **PERMISSION_DENIED** (403) |
| **P-07** | Attacker modifying order status from `pending` to `delivered` without auth | `/orders/{orderId}` | **PERMISSION_DENIED** (403) |
| **P-08** | Writing a 2MB Base64 string directly into a product document | `/products/{id}` | **PERMISSION_DENIED** (String size limit guard) |
| **P-09** | Writing a 2MB Base64 string into `hero_slides` | `/hero_slides/{id}` | **PERMISSION_DENIED** (String size limit guard) |
| **P-10** | Path variable poisoning with 10KB string ID `/{collection}/{poisonedId}` | All collections | **PERMISSION_DENIED** (ID length & regex guard) |
| **P-11** | Unauthenticated write to `/admin_credentials` | `/admin_credentials/{id}` | **PERMISSION_DENIED** (403) |
| **P-12** | Client query requesting `store_settings` mutation while unauthenticated | `/store_settings/{docId}` | **PERMISSION_DENIED** (403) |

---

## 3. RBAC Architecture
- **Public Visitor**:
  - `products`: `read` allowed. `write` denied.
  - `categories`: `read` allowed. `write` denied.
  - `brands`: `read` allowed. `write` denied.
  - `hero_slides`: `read` allowed. `write` denied.
  - `store_settings`: `read` allowed. `write` denied.
  - `orders`: `create` allowed with schema validation. `read` (list/get other users' orders) denied. `update`/`delete` denied.
  - `admin_credentials` & internal security: All access denied.
- **Authenticated Administrator**:
  - `products`: Full `read`, `write`.
  - `categories`: Full `read`, `write`.
  - `brands`: Full `read`, `write`.
  - `hero_slides`: Full `read`, `write`.
  - `store_settings`: Full `read`, `write`.
  - `orders`: Full `read`, `write`.
