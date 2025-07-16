import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// Check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  const hasValidApiKey =
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key" &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "your-api-key";

  const hasValidProjectId =
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== "demo-project" &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== "your-project-id";

  return !!(hasValidApiKey && hasValidProjectId);
};

// Firebase configuration with fallback values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

// Initialize Firebase only if properly configured
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  if (isFirebaseConfigured()) {
    console.log("🔥 Initializing Firebase with real configuration");
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Test the connection
    console.log("📡 Testing Firebase connection...");
  } else {
    console.log("🎭 Firebase not configured - running in demo mode");
    console.log("📖 See FIREBASE_AUTH_SETUP.md for setup instructions");
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  console.log("🎭 Falling back to demo mode");
  console.log("💡 This might be due to:");
  console.log("  - Network connectivity issues");
  console.log("  - Invalid Firebase configuration");
  console.log("  - Firebase project doesn't exist");
  app = null;
  db = null;
  auth = null;
}

// Safe exports with fallback handling
export { app, db, auth };

// Export a function to safely get Firebase services
export const getFirebaseServices = () => {
  if (!isFirebaseConfigured() || !app || !db || !auth) {
    throw new Error("Firebase not configured - running in demo mode");
  }
  return { app, db, auth };
};

// Admin users list (in production, store this in Firestore with proper security)
export const ADMIN_EMAILS = [
  "kerosicarl@gmail.com", // Main admin user
  "admin@sznbyondieki.com", // Default admin email
  "owner@sznbyondieki.com", // Add more admin emails here
  // Add other admin emails here
];

export const isAdminUser = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Helper function to check if Firebase services are available
export const isFirebaseAvailable = (): boolean => {
  return !!(app && db && auth && isFirebaseConfigured());
};

// Test Firebase connection with retry logic
export const testFirebaseConnection = async (): Promise<boolean> => {
  if (!isFirebaseAvailable()) {
    return false;
  }

  try {
    // Try a simple Firestore operation to test connectivity
    const { doc, getDoc } = await import("firebase/firestore");
    const testDoc = doc(db, "test", "connection");
    await getDoc(testDoc);
    console.log("✅ Firebase connection test successful");
    return true;
  } catch (error) {
    console.warn("❌ Firebase connection test failed:", error.message);
    if (error.message?.includes("Failed to fetch")) {
      console.log(
        "🌐 Network connectivity issue - Firebase servers may be unreachable",
      );
    }
    return false;
  }
};

export default app;
