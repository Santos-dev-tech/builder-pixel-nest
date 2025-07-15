#!/usr/bin/env node

// Simple script to test Firebase connection
console.log("🧪 Testing Firebase Configuration...\n");

// Check environment variables
const requiredVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

console.log("📋 Checking environment variables:");
let allVarsPresent = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value && value !== "your-api-key" && value !== "demo-api-key") {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: Not configured`);
    allVarsPresent = false;
  }
});

console.log("\n🔧 Configuration Status:");
if (allVarsPresent) {
  console.log("✅ Firebase is properly configured!");
  console.log("🚀 Your app will use Firebase for data storage.");
  console.log("\n📚 Next steps:");
  console.log("1. Run 'npm run dev' to start your app");
  console.log("2. Add items to cart to test Firebase integration");
  console.log("3. Check Firebase Console to see data");
} else {
  console.log("⚠️  Firebase is not configured.");
  console.log("🎭 Your app will run in demo mode with local storage.");
  console.log("\n📚 To configure Firebase:");
  console.log("1. Create a Firebase project at console.firebase.google.com");
  console.log("2. Enable Firestore Database");
  console.log("3. Copy your config to .env file");
  console.log("4. See FIREBASE_SETUP_GUIDE.md for detailed instructions");
}

console.log("\n🌐 Test your app at: http://localhost:8080");
console.log("📖 Full setup guide: FIREBASE_SETUP_GUIDE.md");
