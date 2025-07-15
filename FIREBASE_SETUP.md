# Firebase Setup Guide

This app is configured to use Firebase for hosting and user data storage with Firestore.

## Prerequisites

1. Install Firebase CLI globally:

   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

## Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select an existing one
3. Enable Firestore Database:
   - Go to "Firestore Database" in the sidebar
   - Click "Create database"
   - Choose your security rules (start in test mode for development)
   - Select a location for your database

## Environment Configuration

1. In Firebase Console, go to Project Settings → General → Your apps
2. Click "Add app" and select Web (if you haven't already)
3. Copy the Firebase configuration object
4. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```
5. Fill in your Firebase configuration values in the `.env` file

## Local Development

1. Start the development server:

   ```bash
   npm run dev
   ```

2. The app will run on `http://localhost:8080` and connect to your Firebase project

## Deployment to Firebase Hosting

1. Initialize Firebase hosting (only needed once):

   ```bash
   npm run firebase:init
   ```

   - Select "Hosting" when prompted
   - Choose your Firebase project
   - Set public directory to `dist/spa`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

2. Build and deploy:

   ```bash
   npm run deploy:firebase
   ```

3. Your app will be available at `https://your-project-id.web.app`

## Firestore Security Rules

For production, update your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Example rules - customize based on your needs
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }

    match /userData/{document} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Key Features

- **User Management**: Create, read, update, and delete users
- **Real-time Data**: Uses Firestore for real-time data synchronization
- **Scalable**: Firebase automatically scales with your app
- **Secure**: Built-in security rules and authentication support

## Adding Authentication (Optional)

To add user authentication:

1. Enable Authentication in Firebase Console
2. Choose sign-in methods (Email/Password, Google, etc.)
3. Use the `auth` instance from `client/lib/firebase.ts`
4. Implement sign-in/sign-up components

## Cost Considerations

Firebase has generous free tiers:

- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Hosting**: 10GB storage, 360MB/day transfer
- **Authentication**: Unlimited for most providers

Monitor usage in the Firebase Console to avoid unexpected charges.
