import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let app;

// Check if running in a test environment or local development
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // If service account is provided as environment variable (JSON string)
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // Initialize with default credentials (for local development or emulator)
  app = admin.initializeApp();
}

export default admin;
