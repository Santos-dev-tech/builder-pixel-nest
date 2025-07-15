import { useState, useEffect } from "react";
import { CartService, OrderService, type CartItem } from "@/lib/productService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<
    "cart" | "checkout" | "payment"
  >("cart");
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const items = CartService.getCart();
    setCartItems(items);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    CartService.updateCartItem(itemId, { quantity: newQuantity });
    loadCart();
  };

  const removeItem = (itemId: string) => {
    CartService.removeFromCart(itemId);
    loadCart();
  };

  const clearCart = () => {
    CartService.clearCart();
    loadCart();
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getShipping = () => {
    const subtotal = getSubtotal();
    return subtotal > 50 ? 0 : 5.99;
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getTotal = () => {
    return getSubtotal() + getShipping() + getTax();
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      formData.address &&
      formData.city
    );
  };

  const proceedToCheckout = () => {
    setCheckoutStep("checkout");
  };

  const proceedToPayment = () => {
    if (isFormValid()) {
      setCheckoutStep("payment");
    }
  };

  const processPayment = async () => {
    setIsCheckingOut(true);
    try {
      if (paymentMethod === "mpesa") {
        await processMpesaPayment();
      } else {
        await processCardPayment();
      }
    } catch (error) {
      console.error("Payment failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again.";
      alert(errorMessage);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const processMpesaPayment = async () => {
    // Validate phone number format for M-Pesa
    let phone = formData.phone.replace(/\s+/g, ""); // Remove spaces
    if (phone.startsWith("0")) {
      phone = "254" + phone.substring(1); // Convert 07XX to 254XX
    } else if (!phone.startsWith("254")) {
      throw new Error(
        "Phone number must be in format 254XXXXXXXXX or 07XXXXXXXX",
      );
    }

    if (!/^254\d{9}$/.test(phone)) {
      throw new Error(
        "Please enter a valid Kenyan phone number (254XXXXXXXXX)",
      );
    }

    const paymentData = {
      amount: Math.round(getTotal()),
      phone: phone,
      description: `StyleCo Order - ${cartItems.length} items`,
      orderData: {
        items: cartItems,
        customerInfo: formData,
        total: getTotal(),
      },
    };

    try {
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "M-Pesa payment failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success) {
        // Create order in Firebase/localStorage
        try {
          const orderId = await OrderService.createOrder({
            customerInfo: formData,
            items: cartItems,
            subtotal: getSubtotal(),
            shipping: getShipping(),
            tax: getTax(),
            totalAmount: getTotal(),
            status: "pending",
            paymentMethod: "mpesa",
            paymentStatus: "pending",
            mpesaDetails: {
              checkoutRequestId: result.checkoutRequestId,
              merchantRequestId: result.merchantRequestId,
            },
          });

          console.log("Order created with ID:", orderId);
        } catch (orderError) {
          console.error("Failed to create order:", orderError);
        }

        // Show success message
        const successMessage =
          result.environment === "mock"
            ? "✅ Mock M-Pesa payment successful! Order created. (This is a demo - no real money was charged)"
            : "📱 M-Pesa payment request sent! Check your phone to complete payment. Your order has been created.";

        alert(successMessage);

        // Clear cart after successful payment request
        CartService.clearCart();
        loadCart();
        // Reset to cart step
        setCheckoutStep("cart");
      } else {
        throw new Error(result.message || "M-Pesa payment failed");
      }
    } catch (fetchError) {
      console.error("M-Pesa fetch error:", fetchError);
      throw fetchError;
    }
  };

  const processCardPayment = async () => {
    // Placeholder for card payment integration
    alert("Card payment integration would go here (Stripe, PayPal, etc.)");
  };

  const formatPrice = (price: number) => {
    return `KSh ${price.toFixed(2)}`;
  };

  if (cartItems.length === 0 && checkoutStep === "cart") {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-8" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Continue Shopping
            </Button>
          </Link>
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
                Back to Shop
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {checkoutStep === "cart" && "Shopping Cart"}
              {checkoutStep === "checkout" && "Checkout"}
              {checkoutStep === "payment" && "Payment"}
            </h1>
          </div>
          {checkoutStep === "cart" && cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center ${checkoutStep === "cart" ? "text-orange-500" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${checkoutStep === "cart" ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300"}`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Cart</span>
            </div>
            <div className="w-16 h-px bg-gray-300" />
            <div
              className={`flex items-center ${checkoutStep === "checkout" ? "text-orange-500" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${checkoutStep === "checkout" ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300"}`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Checkout</span>
            </div>
            <div className="w-16 h-px bg-gray-300" />
            <div
              className={`flex items-center ${checkoutStep === "payment" ? "text-orange-500" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${checkoutStep === "payment" ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300"}`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {checkoutStep === "cart" && (
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} | Color: {item.color}
                        </p>
                        <div className="flex items-center mt-2">
                          {item.product.salePrice ? (
                            <>
                              <span className="font-bold text-orange-500">
                                {formatPrice(item.product.salePrice)}
                              </span>
                              <span className="text-sm text-gray-500 line-through ml-2">
                                {formatPrice(item.product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-gray-900">
                              {formatPrice(item.product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {checkoutStep === "checkout" && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number * (for M-Pesa)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="0712345678 or 254712345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter your Safaricom number (e.g., 0712345678)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) =>
                          handleInputChange("postalCode", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {checkoutStep === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === "mpesa"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPaymentMethod("mpesa")}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={paymentMethod === "mpesa"}
                          onChange={() => setPaymentMethod("mpesa")}
                          className="text-orange-500"
                        />
                        <Smartphone className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold">M-Pesa</h3>
                          <p className="text-sm text-gray-600">
                            Pay with M-Pesa using your phone number
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === "card"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="text-orange-500"
                        />
                        <CreditCard className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">Credit/Debit Card</h3>
                          <p className="text-sm text-gray-600">
                            Pay with Visa, Mastercard, or other cards
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-blue-700">
                      🎭 <strong>Demo Mode:</strong> This is using a mock M-Pesa
                      service for testing. No real money will be charged.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Items ({cartItems.length})</span>
                        <span>{formatPrice(getSubtotal())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>
                          {getShipping() === 0
                            ? "Free"
                            : formatPrice(getShipping())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatPrice(getTax())}</span>
                      </div>
                      <div className="border-t pt-1 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{formatPrice(getTotal())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {getShipping() === 0
                        ? "Free"
                        : formatPrice(getShipping())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatPrice(getTax())}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(getTotal())}</span>
                    </div>
                  </div>
                </div>

                {getSubtotal() < 50 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Add {formatPrice(50 - getSubtotal())} more for free
                      shipping!
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {checkoutStep === "cart" && (
                    <Button
                      onClick={proceedToCheckout}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  )}

                  {checkoutStep === "checkout" && (
                    <>
                      <Button
                        onClick={proceedToPayment}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={!isFormValid()}
                      >
                        Continue to Payment
                      </Button>
                      <Button
                        onClick={() => setCheckoutStep("cart")}
                        variant="outline"
                        className="w-full"
                      >
                        Back to Cart
                      </Button>
                    </>
                  )}

                  {checkoutStep === "payment" && (
                    <>
                      <Button
                        onClick={processPayment}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={isCheckingOut}
                      >
                        {isCheckingOut
                          ? "Processing..."
                          : `Pay ${formatPrice(getTotal())}`}
                      </Button>
                      <Button
                        onClick={() => setCheckoutStep("checkout")}
                        variant="outline"
                        className="w-full"
                      >
                        Back to Checkout
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
