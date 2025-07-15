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
import { db, isFirebaseConfigured } from "./firebase";

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  tags: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id?: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";

// Demo products for when Firebase isn't configured
const DEMO_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Classic Cotton Tee",
    description:
      "A comfortable and stylish cotton t-shirt perfect for everyday wear.",
    price: 29.99,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=600&fit=crop",
    ],
    category: "T-Shirts",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White", "Navy", "Gray"],
    inStock: true,
    featured: true,
    tags: ["basic", "cotton", "casual"],
  },
  {
    id: "2",
    name: "Slim Fit Jeans",
    description: "Modern slim-fit jeans with a contemporary silhouette.",
    price: 79.99,
    salePrice: 59.99,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506629905607-e48883e9f8a8?w=500&h=600&fit=crop",
    ],
    category: "Jeans",
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["Dark Blue", "Light Blue", "Black"],
    inStock: true,
    featured: true,
    tags: ["denim", "slim-fit", "casual"],
  },
  {
    id: "3",
    name: "Wool Blend Sweater",
    description: "Cozy wool blend sweater perfect for cooler weather.",
    price: 89.99,
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=600&fit=crop",
    ],
    category: "Sweaters",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "Navy", "Gray", "Brown"],
    inStock: true,
    featured: false,
    tags: ["wool", "warm", "winter"],
  },
  {
    id: "4",
    name: "Summer Dress",
    description: "Light and airy summer dress perfect for warm days.",
    price: 69.99,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=600&fit=crop",
    ],
    category: "Dresses",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Blue", "Pink", "Yellow"],
    inStock: true,
    featured: true,
    tags: ["summer", "light", "casual"],
  },
  {
    id: "5",
    name: "Leather Jacket",
    description: "Classic leather jacket for a timeless look.",
    price: 199.99,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&h=600&fit=crop",
    ],
    category: "Jackets",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Brown"],
    inStock: true,
    featured: true,
    tags: ["leather", "classic", "outerwear"],
  },
  {
    id: "6",
    name: "Athletic Shorts",
    description: "Comfortable athletic shorts for workouts and casual wear.",
    price: 39.99,
    images: [
      "https://images.unsplash.com/photo-1506629905607-e48883e9f8a8?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&h=600&fit=crop",
    ],
    category: "Shorts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Gray", "Red"],
    inStock: true,
    featured: false,
    tags: ["athletic", "comfortable", "casual"],
  },
];

export class ProductService {
  // Product management
  static async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ) {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase not configured");
    }

    try {
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  static async getProduct(productId: string): Promise<Product | null> {
    // Return demo product if Firebase not configured
    if (!isFirebaseConfigured()) {
      return DEMO_PRODUCTS.find((p) => p.id === productId) || null;
    }

    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting product:", error);
      throw error;
    }
  }

  static async getAllProducts(): Promise<Product[]> {
    // Return demo products if Firebase not configured
    if (!isFirebaseConfigured()) {
      return DEMO_PRODUCTS;
    }

    try {
      const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error("Error getting products:", error);
      throw error;
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    // Return demo featured products if Firebase not configured
    if (!isFirebaseConfigured()) {
      return DEMO_PRODUCTS.filter((p) => p.featured);
    }

    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("featured", "==", true),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error("Error getting featured products:", error);
      throw error;
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    // Return demo products by category if Firebase not configured
    if (!isFirebaseConfigured()) {
      return DEMO_PRODUCTS.filter((p) => p.category === category);
    }

    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("category", "==", category),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error("Error getting products by category:", error);
      throw error;
    }
  }

  static async searchProducts(searchTerm: string): Promise<Product[]> {
    // Simple search in demo products if Firebase not configured
    if (!isFirebaseConfigured()) {
      const term = searchTerm.toLowerCase();
      return DEMO_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags.some((tag) => tag.toLowerCase().includes(term)),
      );
    }

    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple name search
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }

  static async updateProduct(productId: string, updates: Partial<Product>) {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase not configured");
    }

    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  static async deleteProduct(productId: string) {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase not configured");
    }

    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, productId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }

  // Utility methods
  static getCategories(): string[] {
    return ["T-Shirts", "Jeans", "Sweaters", "Dresses", "Jackets", "Shorts"];
  }

  static getSizes(): string[] {
    return ["XS", "S", "M", "L", "XL", "XXL"];
  }

  static getColors(): string[] {
    return ["Black", "White", "Navy", "Gray", "Brown", "Blue", "Red", "Green"];
  }
}

// Shopping cart utility functions (using local storage for demo)
export class CartService {
  private static CART_KEY = "shopping_cart";

  static getCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    const cart = localStorage.getItem(this.CART_KEY);
    return cart ? JSON.parse(cart) : [];
  }

  static addToCart(item: Omit<CartItem, "id">): void {
    const cart = this.getCart();
    const existingItem = cart.find(
      (cartItem) =>
        cartItem.productId === item.productId &&
        cartItem.size === item.size &&
        cartItem.color === item.color,
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      const newItem: CartItem = {
        ...item,
        id: Date.now().toString(),
      };
      cart.push(newItem);
    }

    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  }

  static updateCartItem(itemId: string, updates: Partial<CartItem>): void {
    const cart = this.getCart();
    const itemIndex = cart.findIndex((item) => item.id === itemId);

    if (itemIndex !== -1) {
      cart[itemIndex] = { ...cart[itemIndex], ...updates };
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    }
  }

  static removeFromCart(itemId: string): void {
    const cart = this.getCart();
    const updatedCart = cart.filter((item) => item.id !== itemId);
    localStorage.setItem(this.CART_KEY, JSON.stringify(updatedCart));
  }

  static clearCart(): void {
    localStorage.removeItem(this.CART_KEY);
  }

  static getCartTotal(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
  }

  static getCartItemsCount(): number {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
}
