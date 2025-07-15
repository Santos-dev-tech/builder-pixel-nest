import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface User {
  id?: string;
  name: string;
  email: string;
  createdAt?: any;
  updatedAt?: any;
  preferences?: Record<string, any>;
}

export interface UserData {
  id?: string;
  userId: string;
  data: Record<string, any>;
  createdAt?: any;
  updatedAt?: any;
}

const USERS_COLLECTION = "users";
const USER_DATA_COLLECTION = "userData";

export class UserService {
  // User management
  static async createUser(
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
  ) {
    try {
      const docRef = await addDoc(collection(db, USERS_COLLECTION), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>) {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where("email", "==", email),
        limit(1),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  }

  // User data management (for storing app-specific data)
  static async saveUserData(userId: string, data: Record<string, any>) {
    try {
      const docRef = await addDoc(collection(db, USER_DATA_COLLECTION), {
        userId,
        data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  }

  static async getUserData(userId: string): Promise<UserData[]> {
    try {
      const q = query(
        collection(db, USER_DATA_COLLECTION),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserData[];
    } catch (error) {
      console.error("Error getting user data:", error);
      throw error;
    }
  }

  static async updateUserData(dataId: string, updates: Partial<UserData>) {
    try {
      const docRef = doc(db, USER_DATA_COLLECTION, dataId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  }

  static async deleteUserData(dataId: string) {
    try {
      const docRef = doc(db, USER_DATA_COLLECTION, dataId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting user data:", error);
      throw error;
    }
  }

  // Utility methods
  static async getAllUsers(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  static async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple name/email search
      const q = query(
        collection(db, USERS_COLLECTION),
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff"),
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }
}
