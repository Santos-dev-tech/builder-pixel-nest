# Deployment Troubleshooting Guide

This guide helps you fix common deployment issues with your StyleCo e-commerce application.

## 🚨 **Common Deployment Errors**

### 1. Firebase 400 Bad Request Errors

**Problem**: App tries to connect to Firebase with placeholder values like "your-project-id"

**Solution**:

```bash
# 1. Set up proper Firebase configuration
cp .env.example .env

# 2. Add your real Firebase config to .env
VITE_FIREBASE_API_KEY=your-real-api-key
VITE_FIREBASE_PROJECT_ID=your-real-project-id
# ... other Firebase config values

# 3. Rebuild and redeploy
npm run build:client
```

### 2. Environment Variables Not Loading

**Problem**: Environment variables work locally but not in production

**Solution for Different Platforms**:

#### Netlify:

1. Go to Site settings → Environment variables
2. Add all `VITE_FIREBASE_*` variables
3. Redeploy

#### Vercel:

1. Go to Project settings → Environment Variables
2. Add all `VITE_FIREBASE_*` variables
3. Redeploy

#### Firebase Hosting:

```bash
# Use .env.production file
VITE_FIREBASE_API_KEY=your-production-key
VITE_FIREBASE_PROJECT_ID=your-production-project

# Build and deploy
npm run build:client
firebase deploy --only hosting
```

### 3. Firebase Version Compatibility Issues

**Problem**: Firebase SDK version conflicts

**Solution**:

```bash
# Update to latest Firebase
npm install firebase@latest

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build:client
```

## ✅ **Quick Fixes**

### Fix 1: Enable Demo Mode for Deployment

If you want to deploy without Firebase configuration:

1. **Ensure placeholder values trigger demo mode**:

   ```env
   # Use these values to force demo mode
   VITE_FIREBASE_API_KEY=demo-api-key
   VITE_FIREBASE_PROJECT_ID=demo-project
   ```

2. **Verify demo mode is working**:
   ```bash
   npm run firebase:test
   # Should show "Firebase is not configured" message
   ```

### Fix 2: Conditional Firebase Initialization

The app now safely handles Firebase initialization:

```typescript
// Firebase only initializes with valid config
if (isFirebaseConfigured()) {
  // Real Firebase
} else {
  // Demo mode with localStorage
}
```

### Fix 3: Error Boundary Protection

The app includes error boundaries to catch Firebase errors:

- Graceful fallback to demo mode
- User-friendly error messages
- Retry mechanisms

## 🔧 **Production Deployment Steps**

### Step 1: Prepare Environment

```bash
# 1. Set up production Firebase project
# 2. Get production Firebase config
# 3. Update production environment variables
```

### Step 2: Configure Build

```bash
# Update package.json if needed
npm install

# Test build locally
npm run build:client
npm run start
```

### Step 3: Deploy

#### Option A: Firebase Hosting

```bash
npm run deploy:firebase
```

#### Option B: Netlify

```bash
# Build
npm run build:client

# Deploy dist/spa folder
# Set environment variables in Netlify dashboard
```

#### Option C: Vercel

```bash
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# Auto-deploy on push
```

## 🐛 **Debugging Deployment Issues**

### Check 1: Environment Variables

```bash
# Test locally first
npm run firebase:test

# Check if variables are loaded
echo $VITE_FIREBASE_API_KEY
```

### Check 2: Build Output

```bash
# Check if build includes correct config
npm run build:client
grep -r "firebase" dist/spa/assets/

# Should not contain placeholder values in production
```

### Check 3: Network Requests

1. Open browser dev tools
2. Go to Network tab
3. Look for failed Firebase requests
4. Check if URLs contain placeholder values

### Check 4: Console Errors

1. Open browser console
2. Look for Firebase errors
3. Check initialization messages:
   - "🔥 Initializing Firebase with real configuration" ✅
   - "🎭 Firebase not configured - running in demo mode" ⚠️
   - "❌ Firebase initialization failed" ❌

## 📱 **Platform-Specific Deployment**

### Netlify Deployment

1. **Connect Repository**:

   - GitHub → Netlify
   - Auto-deploy on push

2. **Build Settings**:

   ```
   Build command: npm run build:client
   Publish directory: dist/spa
   ```

3. **Environment Variables**:
   ```
   VITE_FIREBASE_API_KEY = your-api-key
   VITE_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = your-project-id
   VITE_FIREBASE_STORAGE_BUCKET = your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID = your-sender-id
   VITE_FIREBASE_APP_ID = your-app-id
   ```

### Vercel Deployment

1. **Import Project**: GitHub ��� Vercel
2. **Build Settings**: Auto-detected
3. **Environment Variables**: Same as Netlify

### Firebase Hosting

1. **Initialize**:

   ```bash
   npm run firebase:init
   ```

2. **Deploy**:
   ```bash
   npm run deploy:firebase
   ```

## 🛡️ **Security Checklist**

### Production Security

- [ ] Remove demo/placeholder values
- [ ] Set proper Firestore security rules
- [ ] Enable only necessary Firebase services
- [ ] Set up proper admin access controls
- [ ] Monitor Firebase usage and costs

### Environment Variables

- [ ] All `VITE_FIREBASE_*` variables set
- [ ] No placeholder values in production
- [ ] Secure storage of environment variables
- [ ] Different configs for staging/production

## 📊 **Monitoring & Maintenance**

### Check Application Health

1. **Firebase Console**: Monitor usage, errors, authentication
2. **Browser Console**: Check for runtime errors
3. **Network Tab**: Verify API calls are working
4. **User Reports**: Monitor customer feedback

### Regular Maintenance

- Update Firebase SDK regularly
- Monitor Firestore usage and costs
- Review security rules periodically
- Backup important data

## 🆘 **Emergency Fixes**

### If Deployment is Completely Broken

1. **Quick Rollback**:

   ```bash
   # Deploy previous working version
   git checkout last-working-commit
   npm run build:client
   # Deploy
   ```

2. **Force Demo Mode**:

   ```env
   # Temporarily disable Firebase
   VITE_FIREBASE_API_KEY=demo-api-key
   VITE_FIREBASE_PROJECT_ID=demo-project
   ```

3. **Check Service Status**:
   - Firebase Status: [status.firebase.google.com](https://status.firebase.google.com)
   - Your hosting provider status page

### Contact Information

- Firebase Support: [firebase.google.com/support](https://firebase.google.com/support)
- Documentation: Review `FIREBASE_AUTH_SETUP.md`

---

🚀 **Remember**: Always test in a staging environment before deploying to production!
