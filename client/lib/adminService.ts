import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  db,
  isFirebaseConfigured,
  isFirebaseAvailable,
  isAdminUser,
} from "./firebase";
import { AuthService, type UserProfile } from "./authService";
import { OrderService, type Order } from "./productService";

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "super_admin";
  createdAt: any;
  lastLogin?: any;
}

export class AdminService {
  // Check if current user is admin
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) return false;

      return isAdminUser(currentUser.email);
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  // Get all orders for admin dashboard
  static async getAllOrders(): Promise<Order[]> {
    if (!isFirebaseAvailable()) {
      // Demo mode - get orders from localStorage
      const orders: Order[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("order_")) {
          const order = JSON.parse(localStorage.getItem(key)!);
          orders.push(order);
        }
      }
      return orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];
    } catch (error) {
      console.error("Error getting all orders:", error);
      return [];
    }
  }

  // Get admin statistics
  static async getAdminStats(): Promise<AdminStats> {
    const orders = await this.getAllOrders();
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= thisMonth;
    });

    const completedOrders = orders.filter(
      (order) => order.status === "delivered",
    );
    const pendingOrders = orders.filter(
      (order) => order.status === "pending" || order.status === "processing",
    );

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );

    // Get unique customers
    const uniqueCustomers = new Set(
      orders.map((order) => order.customerInfo.email),
    );

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalCustomers: uniqueCustomers.size,
      pendingOrders: pendingOrders.length,
      completedOrders: completedOrders.length,
      thisMonthOrders: thisMonthOrders.length,
      thisMonthRevenue,
    };
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string,
    status: Order["status"],
  ): Promise<void> {
    if (!isFirebaseAvailable()) {
      // Demo mode - update localStorage
      const order = localStorage.getItem(`order_${orderId}`);
      if (order) {
        const updatedOrder = {
          ...JSON.parse(order),
          status,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`order_${orderId}`, JSON.stringify(updatedOrder));
      }
      return;
    }

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: Order["paymentStatus"],
  ): Promise<void> {
    if (!isFirebaseAvailable()) {
      // Demo mode
      const order = localStorage.getItem(`order_${orderId}`);
      if (order) {
        const updatedOrder = {
          ...JSON.parse(order),
          paymentStatus,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`order_${orderId}`, JSON.stringify(updatedOrder));
      }
      return;
    }

    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        paymentStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<UserProfile[]> {
    if (!isFirebaseAvailable()) {
      // Demo mode - return current user
      const currentUser = await AuthService.getCurrentUser();
      return currentUser ? [currentUser] : [];
    }

    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserProfile[];
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  // Create admin user
  static async createAdminUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    try {
      // First create the user account
      const userProfile = await AuthService.signUp(
        email,
        password,
        firstName,
        lastName,
      );

      // Add admin role (in production, you'd handle this more securely)
      console.log(`Admin user created: ${email}`);
      alert(
        `Admin user created successfully!\nEmail: ${email}\nPassword: ${password}\n\nPlease save these credentials securely.`,
      );
    } catch (error) {
      console.error("Error creating admin user:", error);
      throw error;
    }
  }

  // Search orders
  static async searchOrders(searchTerm: string): Promise<Order[]> {
    const allOrders = await this.getAllOrders();
    const term = searchTerm.toLowerCase();

    return allOrders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerInfo.email.toLowerCase().includes(term) ||
        order.customerInfo.firstName.toLowerCase().includes(term) ||
        order.customerInfo.lastName.toLowerCase().includes(term) ||
        order.customerInfo.phone.includes(term),
    );
  }

  // Get orders by date range
  static async getOrdersByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Order[]> {
    const allOrders = await this.getAllOrders();

    return allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  // Export orders to CSV (simple implementation)
  static exportOrdersToCSV(orders: Order[]): string {
    const headers = [
      "Order Number",
      "Customer Name",
      "Email",
      "Phone",
      "Total Amount",
      "Status",
      "Payment Status",
      "Order Date",
      "Items Count",
    ];

    const csvData = orders.map((order) => [
      order.orderNumber,
      `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
      order.customerInfo.email,
      order.customerInfo.phone,
      order.totalAmount.toFixed(2),
      order.status,
      order.paymentStatus,
      new Date(order.createdAt).toLocaleDateString(),
      order.items.length,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    return csvContent;
  }

  // Download CSV file
  static downloadOrdersCSV(orders: Order[], filename: string = "orders.csv") {
    const csvContent = this.exportOrdersToCSV(orders);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
