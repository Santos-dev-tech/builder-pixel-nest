import { RequestHandler } from "express";
import { z } from "zod";

// M-Pesa API configuration
interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  callbackUrl: string;
  environment: "sandbox" | "production";
}

const mpesaConfig: MpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || "your-consumer-key",
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || "your-consumer-secret",
  businessShortCode: process.env.MPESA_BUSINESS_SHORTCODE || "174379",
  passkey:
    process.env.MPESA_PASSKEY ||
    "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  callbackUrl:
    process.env.MPESA_CALLBACK_URL ||
    "https://yourdomain.com/api/mpesa/callback",
  environment:
    (process.env.MPESA_ENVIRONMENT as "sandbox" | "production") || "sandbox",
};

// M-Pesa API URLs
const getApiUrls = (environment: "sandbox" | "production") => {
  if (environment === "production") {
    return {
      oauth:
        "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      stkPush: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    };
  }
  return {
    oauth:
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    stkPush: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  };
};

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

// Helper functions
const generateTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hour}${minute}${second}`;
};

const generatePassword = (
  shortCode: string,
  passkey: string,
  timestamp: string,
): string => {
  const str = shortCode + passkey + timestamp;
  return Buffer.from(str).toString("base64");
};

const getAccessToken = async (): Promise<string> => {
  const auth = Buffer.from(
    `${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`,
  ).toString("base64");
  const urls = getApiUrls(mpesaConfig.environment);

  try {
    const response = await fetch(urls.oauth, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting M-Pesa access token:", error);
    throw new Error("Failed to authenticate with M-Pesa");
  }
};

// STK Push endpoint
export const handleStkPush: RequestHandler = async (req, res) => {
  try {
    // Validate request body
    const validatedData = stkPushSchema.parse(req.body);
    const { amount, phone, description, orderData } = validatedData;

    // Get access token
    const accessToken = await getAccessToken();

    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(
      mpesaConfig.businessShortCode,
      mpesaConfig.passkey,
      timestamp,
    );

    // Prepare STK Push payload
    const stkPushPayload = {
      BusinessShortCode: mpesaConfig.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: mpesaConfig.businessShortCode,
      PhoneNumber: phone,
      CallBackURL: mpesaConfig.callbackUrl,
      AccountReference: `StyleCo-${Date.now()}`,
      TransactionDesc: description,
    };

    // Make STK Push request
    const urls = getApiUrls(mpesaConfig.environment);
    const response = await fetch(urls.stkPush, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPushPayload),
    });

    const responseData = await response.json();

    if (response.ok && responseData.ResponseCode === "0") {
      // Store order data temporarily (in production, use a database)
      // For demo purposes, we'll just log it
      console.log("Order data:", {
        checkoutRequestId: responseData.CheckoutRequestID,
        merchantRequestId: responseData.MerchantRequestID,
        orderData,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: "STK Push sent successfully",
        checkoutRequestId: responseData.CheckoutRequestID,
        merchantRequestId: responseData.MerchantRequestID,
      });
    } else {
      console.error("M-Pesa STK Push failed:", responseData);
      res.status(400).json({
        success: false,
        message: responseData.errorMessage || "STK Push failed",
        code: responseData.ResponseCode,
      });
    }
  } catch (error) {
    console.error("STK Push error:", error);

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

// M-Pesa callback endpoint
export const handleMpesaCallback: RequestHandler = async (req, res) => {
  try {
    console.log("M-Pesa Callback received:", JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const { CheckoutRequestID, MerchantRequestID } = stkCallback;
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];

      // Extract payment details
      const paymentDetails = {
        checkoutRequestId: CheckoutRequestID,
        merchantRequestId: MerchantRequestID,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc,
        amount: callbackMetadata.find((item: any) => item.Name === "Amount")
          ?.Value,
        mpesaReceiptNumber: callbackMetadata.find(
          (item: any) => item.Name === "MpesaReceiptNumber",
        )?.Value,
        transactionDate: callbackMetadata.find(
          (item: any) => item.Name === "TransactionDate",
        )?.Value,
        phoneNumber: callbackMetadata.find(
          (item: any) => item.Name === "PhoneNumber",
        )?.Value,
      };

      console.log("Payment successful:", paymentDetails);

      // Here you would:
      // 1. Update order status in database
      // 2. Send confirmation email to customer
      // 3. Update inventory
      // 4. Trigger any other business logic

      res.json({ success: true, message: "Payment processed successfully" });
    } else {
      // Payment failed
      console.log("Payment failed:", {
        checkoutRequestId: stkCallback.CheckoutRequestID,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc,
      });

      // Handle failed payment
      res.json({ success: true, message: "Payment failure processed" });
    }
  } catch (error) {
    console.error("Callback processing error:", error);
    res
      .status(500)
      .json({ success: false, message: "Callback processing failed" });
  }
};

// Query STK Push status endpoint
export const handleStkQuery: RequestHandler = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    if (!checkoutRequestId) {
      return res.status(400).json({
        success: false,
        message: "CheckoutRequestId is required",
      });
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(
      mpesaConfig.businessShortCode,
      mpesaConfig.passkey,
      timestamp,
    );

    // Prepare query payload
    const queryPayload = {
      BusinessShortCode: mpesaConfig.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    // Make query request (Note: This endpoint might not be available in sandbox)
    const queryUrl =
      mpesaConfig.environment === "production"
        ? "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
        : "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query";

    const response = await fetch(queryUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryPayload),
    });

    const responseData = await response.json();

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("STK Query error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to query transaction status",
    });
  }
};

// Test endpoint to check M-Pesa configuration
export const handleMpesaTest: RequestHandler = async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    res.json({
      success: true,
      message: "M-Pesa configuration is working",
      environment: mpesaConfig.environment,
      businessShortCode: mpesaConfig.businessShortCode,
      hasAccessToken: !!accessToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "M-Pesa configuration error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
