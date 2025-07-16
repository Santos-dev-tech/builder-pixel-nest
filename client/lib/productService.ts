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
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured, isFirebaseAvailable } from "./firebase";

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
  inventory?: number;
  sku?: string;
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
  orderNumber: string;
  userId?: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode?: string;
  };
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "mpesa" | "card" | "cash";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  mpesaDetails?: {
    checkoutRequestId: string;
    merchantRequestId: string;
    mpesaReceiptNumber?: string;
    transactionDate?: string;
  };
  createdAt?: any;
  updatedAt?: any;
}

const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";
const CATEGORIES_COLLECTION = "categories";

// Demo products for when Firebase isn't configured
const DEMO_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Classic Cotton Tee",
    description:
      "A comfortable and stylish cotton t-shirt perfect for everyday wear. Made from premium 100% organic cotton with a relaxed fit.",
    price: 2999,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=600&fit=crop",
    ],
    category: "T-Shirts",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White", "Navy", "Gray"],
    inStock: true,
    featured: true,
    inventory: 50,
    sku: "CT001",
    tags: ["basic", "cotton", "casual"],
  },
  {
    id: "2",
    name: "Slim Fit Jeans",
    description:
      "Modern slim-fit jeans with a contemporary silhouette. Crafted from premium denim with stretch for comfort.",
    price: 7999,
    salePrice: 5999,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506629905607-e48883e9f8a8?w=500&h=600&fit=crop",
    ],
    category: "Jeans",
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["Dark Blue", "Light Blue", "Black"],
    inStock: true,
    featured: true,
    inventory: 30,
    sku: "SF002",
    tags: ["denim", "slim-fit", "casual"],
  },
  {
    id: "3",
    name: "Wool Blend Sweater",
    description:
      "Cozy wool blend sweater perfect for cooler weather. Luxurious feel with excellent warmth retention.",
    price: 8999,
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=600&fit=crop",
    ],
    category: "Sweaters",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "Navy", "Gray", "Brown"],
    inStock: true,
    featured: false,
    inventory: 25,
    sku: "WB003",
    tags: ["wool", "warm", "winter"],
  },
  {
    id: "4",
    name: "Summer Dress",
    description:
      "Light and airy summer dress perfect for warm days. Flowy design with breathable fabric.",
    price: 6999,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=600&fit=crop",
    ],
    category: "Dresses",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Blue", "Pink", "Yellow"],
    inStock: true,
    featured: true,
    inventory: 20,
    sku: "SD004",
    tags: ["summer", "light", "casual"],
  },
  {
    id: "5",
    name: "Leather Jacket",
    description:
      "Classic leather jacket for a timeless look. Premium genuine leather with vintage styling.",
    price: 19999,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500&h=600&fit=crop",
    ],
    category: "Jackets",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Brown"],
    inStock: true,
    featured: true,
    inventory: 15,
    sku: "LJ005",
    tags: ["leather", "classic", "outerwear"],
  },
  {
    id: "6",
    name: "Athletic Shorts",
    description:
      "Comfortable athletic shorts for workouts and casual wear. Moisture-wicking fabric with elastic waistband.",
    price: 3999,
    images: [
      "https://images.unsplash.com/photo-1506629905607-e48883e9f8a8?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=500&h=600&fit=crop",
    ],
    category: "Shorts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Gray", "Red"],
    inStock: true,
    featured: false,
    inventory: 40,
    sku: "AS006",
    tags: ["athletic", "comfortable", "casual"],
  },
];

export class ProductService {
  // Initialize demo products in Firebase (run once)
  static async initializeDemoProducts(): Promise<boolean> {
    if (!isFirebaseAvailable()) {
      console.log(
        "Firebase not configured, skipping demo product initialization",
      );
      return false;
    }

    try {
      const batch = writeBatch(db);

      for (const product of DEMO_PRODUCTS) {
        const productRef = doc(collection(db, PRODUCTS_COLLECTION));
        const productData = {
          ...product,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        delete productData.id; // Remove the demo ID
        batch.set(productRef, productData);
      }

      await batch.commit();
      console.log("Demo products initialized in Firebase");
      return true;
    } catch (error) {
      console.error("Error initializing demo products:", error);
      return false;
    }
  }

  // Product management
  static async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    if (!isFirebaseAvailable()) {
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
    if (!isFirebaseAvailable()) {
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
    if (!isFirebaseAvailable()) {
      return DEMO_PRODUCTS;
    }

    try {
      const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      // If no products found, try to initialize demo products but don't fail if permissions are insufficient
      if (products.length === 0) {
        try {
          await this.initializeDemoProducts();
          // If successful, return demo products
          return DEMO_PRODUCTS;
        } catch (initError) {
          console.log(
            "Could not initialize demo products (insufficient permissions), using local demo data:",
            initError,
          );
          // Return local demo products as fallback
          return DEMO_PRODUCTS;
        }
      }

      return products;
    } catch (error) {
      console.error("Error getting products:", error);
      // Return demo products as fallback
      return DEMO_PRODUCTS;
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    // Return demo featured products if Firebase not configured
    if (!isFirebaseAvailable()) {
      return DEMO_PRODUCTS.filter((p) => p.featured);
    }

    try {
      // Use simple query without orderBy to avoid index requirement
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("featured", "==", true),
      );
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      // Sort client-side by createdAt if available
      products.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });

      // If no featured products found, return demo featured products
      if (products.length === 0) {
        return DEMO_PRODUCTS.filter((p) => p.featured);
      }

      return products;
    } catch (error) {
      console.error("Error getting featured products:", error);
      return DEMO_PRODUCTS.filter((p) => p.featured);
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    // Return demo products by category if Firebase not configured
    if (!isFirebaseAvailable()) {
      return DEMO_PRODUCTS.filter((p) => p.category === category);
    }

    try {
      // Use simple query without orderBy to avoid index requirement
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("category", "==", category),
      );
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      // Sort client-side by createdAt if available
      products.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });

      return products;
    } catch (error) {
      console.error("Error getting products by category:", error);
      return DEMO_PRODUCTS.filter((p) => p.category === category);
    }
  }

  static async searchProducts(searchTerm: string): Promise<Product[]> {
    // Simple search in demo products if Firebase not configured
    if (!isFirebaseAvailable()) {
      const term = searchTerm.toLowerCase();
      return DEMO_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags.some((tag) => tag.toLowerCase().includes(term)),
      );
    }

    try {
      // Get all products and filter client-side (for better search)
      const allProducts = await this.getAllProducts();
      const term = searchTerm.toLowerCase();
      return allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.tags.some((tag) => tag.toLowerCase().includes(term)) ||
          p.category.toLowerCase().includes(term),
      );
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }

  static async updateProduct(productId: string, updates: Partial<Product>) {
    if (!isFirebaseAvailable()) {
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
    if (!isFirebaseAvailable()) {
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

// Order Service
export class OrderService {
  static async createOrder(
    orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    if (!isFirebaseAvailable()) {
      console.log("Firebase not configured, order saved to local storage");
      const orderId = Date.now().toString();
      const order = {
        ...orderData,
        id: orderId,
        orderNumber: `ORD-${orderId}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(`order_${orderId}`, JSON.stringify(order));
      return orderId;
    }

    try {
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        ...orderData,
        orderNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    if (!isFirebaseAvailable()) {
      const order = localStorage.getItem(`order_${orderId}`);
      return order ? JSON.parse(order) : null;
    }

    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Order;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting order:", error);
      throw error;
    }
  }

  static async updateOrder(orderId: string, updates: Partial<Order>) {
    if (!isFirebaseAvailable()) {
      const order = localStorage.getItem(`order_${orderId}`);
      if (order) {
        const updatedOrder = {
          ...JSON.parse(order),
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`order_${orderId}`, JSON.stringify(updatedOrder));
      }
      return;
    }

    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }

  static async getOrdersByEmail(email: string): Promise<Order[]> {
    if (!isFirebaseAvailable()) {
      // Get all orders from localStorage for demo
      const orders: Order[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("order_")) {
          const order = JSON.parse(localStorage.getItem(key)!);
          if (order.customerInfo.email === email) {
            orders.push(order);
          }
        }
      }
      return orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where("customerInfo.email", "==", email),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
    } catch (error) {
      console.error("Error getting orders by email:", error);
      return [];
    }
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
