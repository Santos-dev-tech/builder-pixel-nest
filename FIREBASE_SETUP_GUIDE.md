# Firebase Integration Guide for StyleCo E-commerce

This guide will help you set up Firebase for your StyleCo e-commerce application, including Firestore database, authentication, and hosting.

## 🎯 What Firebase Provides

Your e-commerce app will use Firebase for:

- **Firestore Database** - Store products, orders, and user data
- **Authentication** - User login/registration (optional)
- **Hosting** - Deploy your website
- **Storage** - Store product images (optional)

## 📋 Prerequisites

1. Google account
2. Node.js installed on your computer
3. Firebase CLI (we'll install this)

## 🚀 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console

1. Visit [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `styleco-ecommerce` (or your preferred name)
4. Choose whether to enable Google Analytics (recommended)
5. Select Analytics account or create new one
6. Click **"Create project"**

### 1.2 Enable Firestore Database

1. In your Firebase project, click **"Firestore Database"** in the sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll secure it later)
4. Choose a location close to your users (e.g., `us-central` for North America)
5. Click **"Done"**

### 1.3 Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click **"Web"** icon (`</>`)
4. Enter app nickname: `StyleCo Web App`
5. Check **"Also set up Firebase Hosting"**
6. Click **"Register app"**
7. **Copy the configuration object** - you'll need this!

It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyABC123...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

## 🔧 Step 2: Configure Your Application

### 2.1 Create Environment File

In your project root, create a `.env` file:

```bash
# Copy from .env.example
cp .env.example .env
```

### 2.2 Add Firebase Configuration

Edit the `.env` file and replace the Firebase values with yours:

```env
# Firebase Configuration - Replace with your values!
VITE_FIREBASE_API_KEY=AIzaSyABC123...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# M-Pesa Configuration (keep existing values for now)
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

### 2.3 Test the Connection

1. **Restart your development server:**

   ```bash
   npm run dev
   ```

2. **Open your browser** to your app
3. **Add items to cart** - they should now save to Firebase!
4. **Check Firestore Console** - you should see data appearing

## 📊 Step 3: Set Up Firestore Collections

Your app will automatically create these collections:

### Products Collection (`products`)

```javascript
{
  name: "Classic Cotton Tee",
  description: "Comfortable cotton t-shirt...",
  price: 29.99,
  salePrice: 24.99, // optional
  images: ["https://..."],
  category: "T-Shirts",
  sizes: ["S", "M", "L", "XL"],
  colors: ["Black", "White"],
  inStock: true,
  featured: true,
  inventory: 50,
  sku: "CT001",
  tags: ["cotton", "casual"],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Orders Collection (`orders`)

```javascript
{
  orderNumber: "ORD-1234567890-AB12C",
  customerInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "254712345678",
    address: "123 Main St",
    city: "Nairobi"
  },
  items: [
    {
      productId: "product_id",
      product: { /* product details */ },
      size: "M",
      color: "Black",
      quantity: 2
    }
  ],
  subtotal: 59.98,
  shipping: 5.99,
  tax: 5.28,
  totalAmount: 71.25,
  status: "pending", // pending, processing, shipped, delivered, cancelled
  paymentMethod: "mpesa",
  paymentStatus: "completed",
  mpesaDetails: {
    checkoutRequestId: "ws_CO_...",
    mpesaReceiptNumber: "MPE123456",
    transactionDate: "20240101120000"
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## �� Step 4: Secure Your Database

### 4.1 Basic Security Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - read for everyone, write for admins only
    match /products/{productId} {
      allow read: if true;
      // For now, allow write to anyone. In production, restrict to admins
      allow write: if true;
    }

    // Orders - customers can create, read their own orders
    match /orders/{orderId} {
      allow create: if true;
      allow read: if true; // In production, restrict to order owner or admin
      allow update: if true; // In production, restrict to admins
    }

    // Categories - read for everyone
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if true; // In production, restrict to admins
    }
  }
}
```

3. Click **"Publish"**

### 4.2 Production Security (Later)

For production, you'll want to:

- Add user authentication
- Restrict write access to admins only
- Allow users to only read their own orders
- Add data validation rules

## 🚀 Step 5: Deploy to Firebase Hosting

### 5.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 5.2 Login to Firebase

```bash
firebase login
```

### 5.3 Initialize Firebase Hosting

```bash
firebase init hosting
```

Choose:

- **Use an existing project** → Select your project
- **Public directory:** `dist/spa`
- **Single-page app:** `Yes`
- **Overwrite index.html:** `No`

### 5.4 Build and Deploy

```bash
# Build the application
npm run build:client

# Deploy to Firebase
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

## 📱 Step 6: Test Everything

### 6.1 Test Products

1. Visit your deployed site
2. Products should load from Firebase
3. Add items to cart

### 6.2 Test Orders

1. Go through the checkout process
2. Complete a mock M-Pesa payment
3. Check Firestore → `orders` collection for the new order

### 6.3 Test Data Persistence

1. Add items to cart
2. Refresh the page
3. Cart should persist (stored in localStorage)
4. Complete an order
5. Order should appear in Firestore

## 🛠 Step 7: Add Your Products

### 7.1 Manual Entry (Firebase Console)

1. Go to Firestore Console
2. Click **"orders"** collection
3. Click **"Add document"**
4. Add product data manually

### 7.2 Programmatic Entry

The app automatically adds demo products. To add your own:

1. Create a product management page (optional)
2. Use the `ProductService.createProduct()` method
3. Upload product images to Firebase Storage (optional)

## 🔧 Advanced Features (Optional)

### User Authentication

```bash
# Enable in Firebase Console
Authentication → Sign-in method → Email/Password
```

### Image Storage

```bash
# Enable in Firebase Console
Storage → Get started
```

### Analytics

```bash
# Already enabled if you chose it during setup
Analytics → Dashboard
```

## 🆘 Troubleshooting

### Common Issues

**1. "Firebase not configured" message**

- Check your `.env` file has correct values
- Restart development server after changing `.env`
- Make sure variable names start with `VITE_`

**2. Permission denied errors**

- Check Firestore security rules
- Make sure rules allow read/write access

**3. Products not loading**

- Check browser console for errors
- Verify Firebase config in console
- Check Firestore rules

**4. Build/deployment failures**

- Run `npm run build:client` to check for errors
- Make sure all environment variables are set
- Check Firebase CLI is logged in: `firebase whoami`

### Debug Commands

```bash
# Check Firebase CLI login
firebase whoami

# Test Firebase config
npm run dev
# Then check browser console

# View Firestore data
# Go to Firebase Console → Firestore
```

## 📚 Next Steps

1. **Add Authentication** - Let users create accounts
2. **Add Admin Panel** - Manage products and orders
3. **Image Upload** - Let admins upload product images
4. **Email Notifications** - Send order confirmations
5. **Inventory Management** - Track stock levels
6. **Analytics** - Monitor sales and user behavior

## 🔐 Security Checklist for Production

- [ ] Set up proper Firestore security rules
- [ ] Enable user authentication
- [ ] Restrict admin operations
- [ ] Set up environment variables on hosting platform
- [ ] Enable HTTPS (Firebase Hosting does this automatically)
- [ ] Set up backup for Firestore data
- [ ] Monitor usage and costs
- [ ] Set up alerts for unusual activity

## 💰 Cost Management

Firebase offers generous free tiers:

- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Hosting**: 10GB storage, 360MB/day transfer
- **Functions**: 2M invocations/month

Monitor usage in Firebase Console → Usage tab.

## 📞 Support

- **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Firebase Support**: [firebase.google.com/support](https://firebase.google.com/support)
- **Stack Overflow**: Tag questions with `firebase` and `firestore`

---

🎉 **Congratulations!** Your e-commerce app is now powered by Firebase!
