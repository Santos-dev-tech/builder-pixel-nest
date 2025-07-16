# 🔥 Firebase Setup for kerosicarl@gmail.com

This guide will help you configure Firebase to store all your StyleCo data in your Firebase project.

## ✅ **What's Already Done**

I've already updated your admin configuration to include your email:

- ✅ Added `kerosicarl@gmail.com` to admin users list
- ✅ Configured app to use your email for admin access

## 🚀 **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Sign in with `kerosicarl@gmail.com`
3. Click **"Create a project"**
4. Name your project: `styleco-store` (or your preferred name)
5. Enable Google Analytics (recommended)
6. Click **"Create project"**

## 🔧 **Step 2: Enable Required Services**

### 2.1 Enable Authentication

1. In your Firebase project, click **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### 2.2 Create Firestore Database

1. Click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select your preferred location (closest to your customers)
5. Click **"Done"**

### 2.3 Enable Hosting (Optional)

1. Click **"Hosting"**
2. Click **"Get started"**
3. Follow the setup wizard

## 🔑 **Step 3: Get Your Firebase Configuration**

1. In Firebase Console, click the **⚙️ (Settings)** icon
2. Click **"Project settings"**
3. Scroll to **"Your apps"** section
4. Click **"Web app"** (</> icon)
5. Name your app: `StyleCo Store`
6. Check **"Also set up Firebase Hosting"** (optional)
7. Click **"Register app"**
8. **Copy the configuration object** - you'll need it next!

It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyABC123...",
  authDomain: "styleco-store.firebaseapp.com",
  projectId: "styleco-store",
  storageBucket: "styleco-store.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

## 📝 **Step 4: Update Your .env File**

Replace the values in your `.env` file with your actual Firebase configuration:

```env
# Firebase Configuration - Replace with YOUR values from Step 3
VITE_FIREBASE_API_KEY=AIzaSyABC123...
VITE_FIREBASE_AUTH_DOMAIN=styleco-store.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=styleco-store
VITE_FIREBASE_STORAGE_BUCKET=styleco-store.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# M-Pesa Configuration (optional for now)
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

## 🔐 **Step 5: Set Up Firestore Security Rules**

1. In Firebase Console, go to **"Firestore Database"**
2. Click **"Rules"** tab
3. Replace the rules with this configuration:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.token.email in ['kerosicarl@gmail.com', 'admin@styleco.com'];
    }

    // Orders - users can create, admins can read/update all
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null &&
        (request.auth.token.email in ['kerosicarl@gmail.com', 'admin@styleco.com'] ||
         request.auth.uid == resource.data.userId);
    }

    // Admin-only collections
    match /admin/{document} {
      allow read, write: if request.auth != null &&
        request.auth.token.email in ['kerosicarl@gmail.com', 'admin@styleco.com'];
    }
  }
}
```

4. Click **"Publish"**

## 👤 **Step 6: Create Your Admin Account**

1. Restart your development server: `npm run dev`
2. Go to your app (should now show "Firebase connected" status)
3. Click the user icon in the top nav → **"Sign In / Sign Up"**
4. Create your account:
   - **Email**: `kerosicarl@gmail.com`
   - **Password**: Choose a strong password
   - **First Name**: Your first name
   - **Last Name**: Your last name
5. Sign up and verify you can access `/admin` page

## 📊 **What Will Be Stored in Your Firebase**

Once configured, your Firebase will store:

### **Firestore Collections:**

- **`users`** - Customer profiles and admin accounts
- **`orders`** - All customer orders with details
- **`products`** - Product catalog (you can add more products)
- **`admin`** - Admin settings and configurations

### **Authentication:**

- User accounts and login sessions
- Password recovery and email verification
- Admin role management

### **Hosting** (if enabled):

- Your website files
- Static assets and images

## 🧪 **Step 7: Test Everything**

### Test Customer Flow:

1. Create a test customer account
2. Add items to cart
3. Complete checkout with M-Pesa
4. Verify order appears in Firebase Console

### Test Admin Flow:

1. Sign in with `kerosicarl@gmail.com`
2. Go to `/admin` page
3. View orders, customers, and statistics
4. Export data to CSV

### Check Firebase Console:

1. Go to **Firestore Database** → **Data**
2. You should see collections: `users`, `orders`, `products`
3. Click through to see your data

## 🚨 **Important Security Notes**

- **Never commit your `.env` file** to version control
- **Change default passwords** immediately
- **Regularly review admin access** in Firebase Console
- **Monitor usage** in Firebase Console to avoid unexpected charges

## 🆘 **Troubleshooting**

### "Firebase not configured" error:

- Double-check your `.env` values match Firebase Console
- Restart development server
- Check browser console for specific errors

### Admin access denied:

- Ensure you're signed in with `kerosicarl@gmail.com`
- Check Firestore security rules include your email
- Try signing out and back in

### Orders not saving:

- Check Firestore security rules
- Look for errors in browser console
- Verify Firestore is enabled in Firebase Console

## 📱 **Your Admin Dashboard Features**

Once set up, you'll have access to:

- **Order Management**: View, search, and update all orders
- **Customer Analytics**: Track registrations and purchase patterns
- **Revenue Statistics**: Daily, weekly, monthly reports
- **CSV Export**: Download order data for external analysis
- **User Management**: View all registered customers

## 🎉 **You're All Set!**

Once you complete these steps, everything will be stored in your Firebase project at `kerosicarl@gmail.com`. Your customers can:

- Create accounts and sign in
- Place orders with M-Pesa payments
- View their order history

And you can:

- Manage all orders from the admin dashboard
- Track customer analytics
- Export data for business insights
- Scale without worrying about server management

Need help? Check the browser console for error messages or contact support!
