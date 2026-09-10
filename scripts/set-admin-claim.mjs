/**
 * Secure Admin Custom Claim Provisioning Script
 * 
 * Usage:
 *   node scripts/set-admin-claim.mjs <ADMIN_UID_OR_EMAIL>
 * 
 * Requirements:
 *   1. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 *      OR run in a Cloud environment with Default Application Credentials (ADC).
 *   2. NEVER include service account keys or Admin SDK in client-side / React bundle.
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

async function setAdminClaim(targetIdentifier) {
  if (!targetIdentifier) {
    console.error('❌ Error: Please provide an admin UID or Email.');
    console.log('Usage: node scripts/set-admin-claim.mjs <UID_OR_EMAIL>');
    process.exit(1);
  }

  try {
    let user;
    if (targetIdentifier.includes('@')) {
      user = await admin.auth().getUserByEmail(targetIdentifier);
    } else {
      user = await admin.auth().getUser(targetIdentifier);
    }

    console.log(`🔍 Found user: ${user.email} (UID: ${user.uid})`);

    // Assign custom claim: { admin: true }
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      role: 'admin',
    });

    console.log(`✅ Success! Custom claim { admin: true } assigned to ${user.email}.`);
    console.log('ℹ️ The user should re-login or refresh their ID token to receive the updated claim.');
  } catch (error) {
    console.error('❌ Failed to assign admin claim:', error.message);
    process.exit(1);
  }
}

const target = process.argv[2];
setAdminClaim(target);
