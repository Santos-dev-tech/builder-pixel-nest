# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for user login storage and admin account management in your StyleCo e-commerce application.

## 🔥 **Step 1: Enable Firebase Authentication**

### 1.1 Go to Firebase Console

1. Visit [console.firebase.google.com](https://console.firebase.google.com)
2. Select your StyleCo project
3. In the sidebar, click **"Authentication"**
4. Click **"Get started"**

### 1.2 Enable Sign-in Methods

1. Go to **"Sign-in method"** tab
2. Enable **"Email/Password"**:
   - Click on **"Email/Password"**
   - Toggle **"Enable"** to ON
   - Click **"Save"**

### 1.3 Configure Authorized Domains

1. In **"Sign-in method"** tab, scroll to **"Authorized domains"**
2. Add your domains:
   - `localhost` (for development)
   - `your-domain.com` (for production)
   - Your Firebase hosting domain (auto-added)

## 🔧 **Step 2: Update Your Firebase Configuration**

### 2.1 Get Your Firebase Config

1. Go to **Project Settings** ⚙️
2. Scroll to **"Your apps"** section
3. Copy your Firebase configuration

### 2.2 Update Your .env File

Replace the placeholder values in your `.env` file:

```env
# Firebase Configuration - Replace with your actual values
VITE_FIREBASE_API_KEY=AIzaSyABC123...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 2.3 Restart Your Development Server

```bash
npm run dev
```

## 👤 **Step 3: Create Admin Account**

### 3.1 Access Admin Setup

1. Open your app at `http://localhost:8080`
2. Go to `/admin` page
3. You'll see "Admin Access Required" page
4. Click **"Create Admin Account"**

### 3.2 Create Your Admin User

1. Fill in the admin details:
   - **First Name**: Your first name
   - **Last Name**: Your last name
   - **Email**: `admin@styleco.com` (or your preferred admin email)
   - **Password**: Choose a strong password (minimum 6 characters)
2. Click **"Create Admin Account"**
3. Save the credentials securely!

### 3.3 Update Admin Email List

In `client/lib/firebase.ts`, update the admin emails:

```typescript
export const ADMIN_EMAILS = [
  "admin@styleco.com", // Your admin email
  "owner@styleco.com", // Add more admin emails
  // Add other admin emails here
];
```

## 🔐 **Step 4: Set Up Firestore Security Rules**

### 4.1 Basic Security Rules

In Firebase Console, go to **Firestore Database** → **Rules** and update:

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
        request.auth.token.email in ['admin@styleco.com'];
    }

    // Orders - users can create, admins can read/update all
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null &&
        (request.auth.token.email in ['admin@styleco.com'] ||
         request.auth.uid == resource.data.userId);
    }

    // Admin-only collections
    match /admin/{document} {
      allow read, write: if request.auth != null &&
        request.auth.token.email in ['admin@styleco.com'];
    }
  }
}
```

### 4.2 Click **"Publish"** to save the rules

## 🧪 **Step 5: Test Your Setup**

### 5.1 Test Firebase Connection

```bash
npm run firebase:test
```

### 5.2 Test User Registration

1. Go to your app homepage
2. Click the user icon → **"Sign In / Sign Up"**
3. Create a test user account
4. Verify the user appears in Firebase Console → Authentication → Users

### 5.3 Test Admin Access

1. Sign in with your admin account
2. Go to `/admin` page
3. You should see the admin dashboard with orders and statistics

### 5.4 Test Order Management

1. Create a test order (add items to cart and checkout)
2. Go to admin panel
3. Verify the order appears in the orders list
4. Test updating order status

## 📊 **Admin Dashboard Features**

Your admin dashboard now includes:

### **Order Management**

- View all orders with customer details
- Search orders by customer name, email, phone, or order number
- Update order status (pending, processing, shipped, delivered, cancelled)
- Export orders to CSV for reporting

### **Statistics**

- Total orders and revenue
- Customer count
- Monthly statistics
- Order status breakdown

### **User Management**

- View all registered users
- Admin role management
- User authentication tracking

## 🔑 **Admin Credentials Management**

### Default Admin Account

- **Email**: `admin@styleco.com`
- **Password**: `Admin@2024` (change this!)

### Adding More Admins

1. Update `ADMIN_EMAILS` array in `client/lib/firebase.ts`
2. Create new admin accounts using the Admin Setup
3. Update Firestore security rules if needed

### Security Best Practices

- Change default admin password immediately
- Use strong passwords for admin accounts
- Regularly review admin access
- Monitor admin activity in Firebase Console

## 🚀 **Step 6: Deploy to Production**

### 6.1 Update Production Config

```env
# Production Firebase Config
VITE_FIREBASE_API_KEY=your-production-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 6.2 Update Security Rules for Production

- Remove test emails from admin lists
- Add proper admin emails
- Tighten security rules as needed

### 6.3 Deploy

```bash
npm run build:client
firebase deploy --only hosting
```

## 🛠 **Troubleshooting**

### Common Issues

**1. "Firebase not configured" message**

- Check your `.env` file has correct values
- Restart development server
- Ensure environment variables start with `VITE_`

**2. Authentication not working**

- Verify Email/Password is enabled in Firebase Console
- Check your domain is in authorized domains list
- Ensure Firebase Auth is enabled for your project

**3. Admin access denied**

- Verify your email is in `ADMIN_EMAILS` array
- Check Firestore security rules
- Ensure you're signed in with admin account

**4. Orders not appearing in admin panel**

- Check Firestore security rules allow admin access
- Verify orders are being created in Firestore
- Check browser console for errors

### Debug Commands

```bash
# Test Firebase configuration
npm run firebase:test

# Check Firebase connection in browser console
# Go to your app and check browser dev tools console

# View Firestore data
# Firebase Console → Firestore Database
```

## 📱 **Next Steps**

1. **Email Notifications**: Set up email confirmations for orders
2. **Advanced Admin Features**: Add inventory management, product management
3. **Customer Portal**: Let customers track their orders
4. **Analytics**: Integrate Google Analytics for deeper insights
5. **Mobile App**: Consider React Native app with same Firebase backend

## 🆘 **Support**

- **Firebase Documentation**: [firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
- **Firestore Security**: [firebase.google.com/docs/firestore/security](https://firebase.google.com/docs/firestore/security)
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)

---

🎉 **Congratulations!** Your StyleCo app now has complete user authentication and admin management powered by Firebase!
