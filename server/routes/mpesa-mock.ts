import { RequestHandler } from "express";
import { z } from "zod";

// Mock M-Pesa service for development and testing
// This simulates M-Pesa responses without requiring real credentials

// Validation schemas
const stkPushSchema = z.object({
  amount: z.number().min(1).max(70000),
  phone: z
    .string()
    .regex(/^254\d{9}$/, "Phone number must be in format 254XXXXXXXXX"),
  description: z.string().min(1).max(100),
  orderData: z.object({
    items: z.array(z.any()),
    customerInfo: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      address: z.string(),
      city: z.string(),
      postalCode: z.string().optional(),
    }),
    total: z.number(),
  }),
});

// In-memory storage for demo orders (in production, use a database)
const mockOrders = new Map<string, any>();

// Mock STK Push endpoint
export const handleMockStkPush: RequestHandler = async (req, res) => {
  try {
    // Validate request body
    const validatedData = stkPushSchema.parse(req.body);
    const { amount, phone, description, orderData } = validatedData;

    console.log("Mock M-Pesa STK Push Request:", {
      amount,
      phone,
      description,
      items: orderData.items.length,
    });

    // Generate mock response IDs
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const merchantRequestId = `mr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store order data temporarily
    mockOrders.set(checkoutRequestId, {
      ...orderData,
      amount,
      phone,
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    // Simulate different responses based on phone number for testing
    if (phone === "254708374148") {
      // Test phone number that always fails
      return res.status(400).json({
        success: false,
        message: "STK Push failed",
        code: "400.002.02",
      });
    }

    // Simulate successful STK Push
    res.json({
      success: true,
      message: "STK Push sent successfully",
      checkoutRequestId,
      merchantRequestId,
    });

    // Simulate callback after 5 seconds (successful payment)
    setTimeout(() => {
      console.log(`Mock M-Pesa: Payment successful for ${checkoutRequestId}`);
      const order = mockOrders.get(checkoutRequestId);
      if (order) {
        order.status = "completed";
        order.mpesaReceiptNumber = `MPE${Date.now()}`;
        order.transactionDate = new Date().toISOString();
        mockOrders.set(checkoutRequestId, order);
      }
    }, 5000);
  } catch (error) {
    console.error("Mock STK Push error:", error);

    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};

// Mock callback endpoint (for testing webhook simulation)
export const handleMockCallback: RequestHandler = async (req, res) => {
  try {
    console.log(
      "Mock M-Pesa Callback received:",
      JSON.stringify(req.body, null, 2),
    );

    // In a real implementation, this would be called by Safaricom
    // For demo, we'll just acknowledge receipt
    res.json({ success: true, message: "Callback processed" });
  } catch (error) {
    console.error("Mock callback processing error:", error);
    res
      .status(500)
      .json({ success: false, message: "Callback processing failed" });
  }
};

// Mock query endpoint
export const handleMockQuery: RequestHandler = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    if (!checkoutRequestId) {
      return res.status(400).json({
        success: false,
        message: "CheckoutRequestId is required",
      });
    }

    const order = mockOrders.get(checkoutRequestId);

    if (!order) {
      return res.json({
        success: true,
        data: {
          ResponseCode: "1032",
          ResponseDescription: "Request cancelled by user",
          ResultCode: "1032",
          ResultDesc: "Request cancelled by user",
        },
      });
    }

    // Simulate successful transaction
    res.json({
      success: true,
      data: {
        ResponseCode: "0",
        ResponseDescription:
          "The service request has been accepted successfully",
        ResultCode: order.status === "completed" ? "0" : "1032",
        ResultDesc:
          order.status === "completed"
            ? "The service request is processed successfully."
            : "Request cancelled by user",
      },
    });
  } catch (error) {
    console.error("Mock STK Query error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to query transaction status",
    });
  }
};

// Mock test endpoint
export const handleMockTest: RequestHandler = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Mock M-Pesa service is working",
      environment: "mock",
      note: "This is a mock service for development. Replace with real M-Pesa integration for production.",
      testPhoneNumbers: {
        success: "254708374149 (always succeeds)",
        failure: "254708374148 (always fails)",
        anyOther: "Any other 254XXXXXXXXX number (succeeds)",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mock M-Pesa service error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all mock orders (for debugging)
export const handleMockOrders: RequestHandler = async (req, res) => {
  try {
    const orders = Array.from(mockOrders.entries()).map(([id, order]) => ({
      checkoutRequestId: id,
      ...order,
    }));

    res.json({
      success: true,
      orders: orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get orders",
    });
  }
};
