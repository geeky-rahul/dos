import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const {
  FIREBASE_SERVICE_ACCOUNT,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function detectProjectId() {
  if (FIREBASE_PROJECT_ID) return FIREBASE_PROJECT_ID;
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;

  if (FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
      if (serviceAccount.project_id) return serviceAccount.project_id;
    } catch (err) {
      console.warn('Invalid FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
    }
  }

  try {
    const googleServicesPath = path.resolve(
      __dirname,
      '../../../frontend/android/app/google-services.json',
    );
    if (fs.existsSync(googleServicesPath)) {
      const json = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
      const projectId = json?.project_info?.project_id;
      if (projectId) return projectId;
    }
  } catch (err) {
    console.warn('Failed to read google-services.json:', err.message);
  }

  return null;
}

const projectId = detectProjectId();

if (!admin.apps.length) {
  if (FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId || undefined,
    });
  } else if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      projectId: FIREBASE_PROJECT_ID,
    });
  } else {
    // Fallback for emulator/ADC setups.
    admin.initializeApp({
      projectId: projectId || undefined,
    });
  }
}

export default admin;
