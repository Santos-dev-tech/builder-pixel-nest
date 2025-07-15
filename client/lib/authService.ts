import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  createdAt?: any;
  updatedAt?: any;
}

export class AuthService {
  // Authentication methods
  static async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<UserProfile> {
    if (!isFirebaseConfigured()) {
      // Demo mode - create user in localStorage
      const user: UserProfile = {
        uid: Date.now().toString(),
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("user_profile", JSON.stringify(user));
      localStorage.setItem(
        "auth_user",
        JSON.stringify({ email, uid: user.uid }),
      );
      return user;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`,
      });

      // Create user profile in Firestore
      const userProfile: Omit<UserProfile, "uid"> = {
        firstName,
        lastName,
        email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), userProfile);

      return {
        uid: firebaseUser.uid,
        ...userProfile,
      } as UserProfile;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }

  static async signIn(email: string, password: string): Promise<UserProfile> {
    if (!isFirebaseConfigured()) {
      // Demo mode - check localStorage
      const savedUser = localStorage.getItem("user_profile");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.email === email) {
          localStorage.setItem(
            "auth_user",
            JSON.stringify({ email, uid: user.uid }),
          );
          return user;
        }
      }
      throw new Error("Invalid credentials (demo mode)");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // Get user profile from Firestore
      const userProfile = await this.getUserProfile(firebaseUser.uid);
      if (!userProfile) {
        throw new Error("User profile not found");
      }

      return userProfile;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    if (!isFirebaseConfigured()) {
      // Demo mode - clear localStorage
      localStorage.removeItem("user_profile");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("shopping_cart");
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<UserProfile | null> {
    if (!isFirebaseConfigured()) {
      // Demo mode - get from localStorage
      const savedUser = localStorage.getItem("user_profile");
      return savedUser ? JSON.parse(savedUser) : null;
    }

    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userProfile = await this.getUserProfile(firebaseUser.uid);
          resolve(userProfile);
        } else {
          resolve(null);
        }
      });
    });
  }

  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured()) {
      const savedUser = localStorage.getItem("user_profile");
      return savedUser ? JSON.parse(savedUser) : null;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { uid, ...docSnap.data() } as UserProfile;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  static async updateUserProfile(
    uid: string,
    updates: Partial<UserProfile>,
  ): Promise<void> {
    if (!isFirebaseConfigured()) {
      // Demo mode - update localStorage
      const savedUser = localStorage.getItem("user_profile");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const updatedUser = {
          ...user,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("user_profile", JSON.stringify(updatedUser));
      }
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  // Utility methods
  static onAuthStateChange(callback: (user: UserProfile | null) => void) {
    if (!isFirebaseConfigured()) {
      // Demo mode - check localStorage periodically
      const checkAuth = () => {
        const savedUser = localStorage.getItem("user_profile");
        callback(savedUser ? JSON.parse(savedUser) : null);
      };
      checkAuth();
      return () => {}; // Return empty cleanup function
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await this.getUserProfile(firebaseUser.uid);
        callback(userProfile);
      } else {
        callback(null);
      }
    });
  }

  static isAuthenticated(): boolean {
    if (!isFirebaseConfigured()) {
      return localStorage.getItem("user_profile") !== null;
    }

    return auth.currentUser !== null;
  }

  // Demo helper methods
  static createDemoUser(): UserProfile {
    const demoUser: UserProfile = {
      uid: "demo-user-" + Date.now(),
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "254712345678",
      address: "123 Main Street",
      city: "Nairobi",
      postalCode: "00100",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("user_profile", JSON.stringify(demoUser));
    localStorage.setItem(
      "auth_user",
      JSON.stringify({
        email: demoUser.email,
        uid: demoUser.uid,
      }),
    );

    return demoUser;
  }

  static getDemoUser(): UserProfile | null {
    const savedUser = localStorage.getItem("user_profile");
    if (savedUser) {
      return JSON.parse(savedUser);
    }

    // Create demo user if none exists
    return this.createDemoUser();
  }
}
