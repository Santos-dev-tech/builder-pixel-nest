import { useState, useEffect } from "react";
import {
  OrderService,
  ProductService,
  type Order,
  type Product,
} from "@/lib/productService";
import { AdminService, type AdminStats } from "@/lib/adminService";
import { AuthService } from "@/lib/authService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  DollarSign,
  Phone,
  MapPin,
  Eye,
  Shield,
  Download,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ShoppingBag,
  Star,
  StarOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FirebaseStatus } from "@/components/FirebaseStatus";
import { AdminSetup } from "@/components/AdminSetup";

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    salePrice: 0,
    images: [""],
    category: "",
    sizes: [],
    colors: [],
    inStock: true,
    featured: false,
    tags: [],
    inventory: 0,
    sku: "",
  });

  useEffect(() => {
    initializeAdmin();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);

  const initializeAdmin = async () => {
    setLoading(true);
    try {
      // Check if user is admin
      const adminStatus = await AdminService.isCurrentUserAdmin();
      setIsAdmin(adminStatus);

      if (adminStatus) {
        await loadOrders();
        await loadProducts();
        await loadStats();
      }
    } catch (error) {
      console.error("Error initializing admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const adminStats = await AdminService.getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const filterOrders = () => {
    if (!searchTerm) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.customerInfo.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.customerInfo.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.customerInfo.phone.includes(searchTerm),
    );
    setFilteredOrders(filtered);
  };

  const loadOrders = async () => {
    try {
      const allOrders = await AdminService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const allProducts = await ProductService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order["status"],
  ) => {
    try {
      await AdminService.updateOrderStatus(orderId, status);
      await loadOrders(); // Refresh orders
      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const handleExportOrders = () => {
    AdminService.downloadOrdersCSV(
      filteredOrders,
      `szn_orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: 0,
      salePrice: 0,
      images: [""],
      category: "",
      sizes: [],
      colors: [],
      inStock: true,
      featured: false,
      tags: [],
      inventory: 0,
      sku: "",
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleProductSubmit = async () => {
    try {
      console.log("Starting product submission...");
      console.log("Product form data:", productForm);

      // Validate form
      if (
        !productForm.name ||
        !productForm.description ||
        !productForm.price ||
        !productForm.category
      ) {
        alert(
          "Please fill in all required fields:\n- Product Name\n- Description\n- Price\n- Category",
        );
        return;
      }

      // Check if price is valid
      if (productForm.price <= 0) {
        alert("Please enter a valid price greater than 0");
        return;
      }

      const productData = {
        ...productForm,
        price: Number(productForm.price),
        salePrice:
          productForm.salePrice && productForm.salePrice > 0
            ? Number(productForm.salePrice)
            : undefined,
        inventory: Number(productForm.inventory) || 0,
        images: productForm.images?.filter((img) => img.trim()) || [],
        sizes: productForm.sizes || [],
        colors: productForm.colors || [],
        tags: productForm.tags || [],
      };

      console.log("Processed product data:", productData);

      if (editingProduct?.id) {
        console.log("Updating existing product...");
        await ProductService.updateProduct(editingProduct.id, productData);
        alert("Product updated successfully!");
      } else {
        console.log("Creating new product...");
        const productId = await ProductService.createProduct(
          productData as Omit<Product, "id" | "createdAt" | "updatedAt">,
        );
        console.log("Product created with ID:", productId);
        alert("Product created successfully!");
      }

      console.log("Reloading products...");
      await loadProducts();
      resetProductForm();
      console.log("Product submission completed!");
    } catch (error) {
      console.error("Error saving product:", error);
      if (error.message?.includes("Firebase not configured")) {
        alert(
          "Firebase is not properly configured. Please check your Firebase setup or try again when the connection is ready.",
        );
      } else if (error.message?.includes("permission")) {
        alert(
          "Permission denied. Please make sure you're logged in as an admin and have proper Firebase permissions.",
        );
      } else {
        alert(`Failed to save product: ${error.message || "Unknown error"}`);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || 0,
      images: product.images,
      category: product.category,
      sizes: product.sizes,
      colors: product.colors,
      inStock: product.inStock,
      featured: product.featured,
      tags: product.tags,
      inventory: product.inventory || 0,
      sku: product.sku || "",
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await ProductService.deleteProduct(productId);
        alert("Product deleted successfully!");
        await loadProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleToggleProductFeatured = async (product: Product) => {
    try {
      await ProductService.updateProduct(product.id!, {
        featured: !product.featured,
      });
      await loadProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  const addImageField = () => {
    setProductForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), ""],
    }));
  };

  const updateImageField = (index: number, value: string) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images?.map((img, i) => (i === index ? value : img)) || [],
    }));
  };

  const removeImageField = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateArrayField = (
    field: "sizes" | "colors" | "tags",
    value: string,
  ) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setProductForm((prev) => ({
      ...prev,
      [field]: items,
    }));
  };

  const formatPrice = (price: number) => {
    return `KSh ${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Show admin setup if user is not admin
  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-24 w-24 mx-auto text-orange-500 mb-8" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Access Required
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            You need admin privileges to access this page. Create an admin
            account or sign in with existing admin credentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowAdminSetup(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Shield className="h-4 w-4 mr-2" />
              Create Admin Account
            </Button>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
            </Link>
          </div>
          <AdminSetup
            isOpen={showAdminSetup}
            onClose={() => setShowAdminSetup(false)}
            onSuccess={() => {
              initializeAdmin();
            }}
          />
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">
                Order Details
              </h1>
            </div>
            <FirebaseStatus />
          </div>

          {/* Order Details */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order {selectedOrder.orderNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <Badge
                        className={getPaymentStatusColor(
                          selectedOrder.paymentStatus,
                        )}
                      >
                        {selectedOrder.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium">
                        {selectedOrder.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.product.name}</h3>
                          <p className="text-sm text-gray-600">
                            Size: {item.size} | Color: {item.color}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPrice(
                              (item.product.salePrice || item.product.price) *
                                item.quantity,
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(
                              item.product.salePrice || item.product.price,
                            )}{" "}
                            each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer & Payment Info */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">
                      {selectedOrder.customerInfo.firstName}{" "}
                      {selectedOrder.customerInfo.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.customerInfo.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {selectedOrder.customerInfo.phone}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="text-sm">
                      <p>{selectedOrder.customerInfo.address}</p>
                      <p>
                        {selectedOrder.customerInfo.city}
                        {selectedOrder.customerInfo.postalCode &&
                          `, ${selectedOrder.customerInfo.postalCode}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatPrice(selectedOrder.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(selectedOrder.tax)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* M-Pesa Details */}
              {selectedOrder.mpesaDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>M-Pesa Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Checkout Request ID</p>
                      <p className="font-mono text-xs break-all">
                        {selectedOrder.mpesaDetails.checkoutRequestId}
                      </p>
                    </div>
                    {selectedOrder.mpesaDetails.mpesaReceiptNumber && (
                      <div>
                        <p className="text-gray-600">Receipt Number</p>
                        <p className="font-semibold">
                          {selectedOrder.mpesaDetails.mpesaReceiptNumber}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <FirebaseStatus />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            onClick={() => setActiveTab("orders")}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Orders
          </Button>
          <Button
            variant={activeTab === "products" ? "default" : "ghost"}
            onClick={() => setActiveTab("products")}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Products
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.totalOrders || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(stats?.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Customers</p>
                  <p className="text-2xl font-bold">
                    {stats?.totalCustomers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    This Month
                  </p>
                  <p className="text-2xl font-bold">
                    {stats?.thisMonthOrders || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section */}
        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Orders Management</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleExportOrders}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={loadOrders} variant="outline" size="sm">
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders by number, customer name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <Button
                  onClick={() => setShowAdminSetup(true)}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-600"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Setup
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 mb-2">No orders found</p>
                  <p className="text-sm text-gray-500">
                    Orders will appear here when customers make purchases
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">
                              {order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {order.customerInfo.firstName}{" "}
                              {order.customerInfo.lastName} •{" "}
                              {order.customerInfo.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.items.length} items
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getPaymentStatusColor(
                              order.paymentStatus,
                            )}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Products Section */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Product Form Modal */}
            {showProductForm && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </CardTitle>
                    <Button variant="ghost" onClick={resetProductForm}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Product Name *
                      </label>
                      <Input
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        SKU
                      </label>
                      <Input
                        value={productForm.sku}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            sku: e.target.value,
                          }))
                        }
                        placeholder="Enter SKU"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description *
                    </label>
                    <Textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter product description"
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Price (KSh) *
                      </label>
                      <Input
                        type="number"
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            price: Number(e.target.value),
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Sale Price (KSh)
                      </label>
                      <Input
                        type="number"
                        value={productForm.salePrice}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            salePrice: Number(e.target.value),
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Inventory
                      </label>
                      <Input
                        type="number"
                        value={productForm.inventory}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            inventory: Number(e.target.value),
                          }))
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category *
                    </label>
                    <Select
                      value={productForm.category}
                      onValueChange={(value) =>
                        setProductForm((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <option value="">Select category</option>
                      {ProductService.getCategories().map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Sizes (comma separated)
                      </label>
                      <Input
                        value={productForm.sizes?.join(", ")}
                        onChange={(e) =>
                          updateArrayField("sizes", e.target.value)
                        }
                        placeholder="S, M, L, XL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Colors (comma separated)
                      </label>
                      <Input
                        value={productForm.colors?.join(", ")}
                        onChange={(e) =>
                          updateArrayField("colors", e.target.value)
                        }
                        placeholder="Black, White, Blue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tags (comma separated)
                      </label>
                      <Input
                        value={productForm.tags?.join(", ")}
                        onChange={(e) =>
                          updateArrayField("tags", e.target.value)
                        }
                        placeholder="summer, casual, trending"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Images
                    </label>
                    <div className="space-y-2">
                      {productForm.images?.map((image, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={image}
                            onChange={(e) =>
                              updateImageField(index, e.target.value)
                            }
                            placeholder="Enter image URL"
                          />
                          {productForm.images!.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeImageField(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addImageField}
                      >
                        Add Image
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={productForm.inStock}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            inStock: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm font-medium">In Stock</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={productForm.featured}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            featured: e.target.checked,
                          }))
                        }
                        className="rounded"
                      />
                      <span className="text-sm font-medium">
                        Featured Product
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleProductSubmit}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {editingProduct ? "Update Product" : "Create Product"}
                    </Button>
                    <Button variant="outline" onClick={resetProductForm}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Product Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowProductForm(true)}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                    <Button onClick={loadProducts} variant="outline" size="sm">
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 mx-auto mb-4">
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 mb-2">No products found</p>
                    <p className="text-sm text-gray-500">
                      Start by adding your first product
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={product.images[0] || "/placeholder-image.jpg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-sm">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleToggleProductFeatured(product)
                                }
                                className="p-1 h-auto"
                              >
                                {product.featured ? (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                ) : (
                                  <StarOff className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs text-gray-600 line-clamp-2">
                            {product.description}
                          </p>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            <Badge
                              variant={
                                product.inStock ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              {product.salePrice ? (
                                <>
                                  <span className="text-sm font-bold text-orange-600">
                                    KSh {product.salePrice}
                                  </span>
                                  <span className="text-xs text-gray-500 line-through ml-1">
                                    KSh {product.price}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm font-bold">
                                  KSh {product.price}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Stock: {product.inventory || 0}
                            </div>
                          </div>

                          <div className="flex gap-1 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id!)}
                              className="flex-1 text-xs text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AdminSetup
        isOpen={showAdminSetup}
        onClose={() => setShowAdminSetup(false)}
        onSuccess={() => {
          initializeAdmin();
        }}
      />
    </div>
  );
}
