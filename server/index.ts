import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleStkPush,
  handleMpesaCallback,
  handleStkQuery,
  handleMpesaTest,
} from "./routes/mpesa";
import {
  handleMockStkPush,
  handleMockCallback,
  handleMockQuery,
  handleMockTest,
  handleMockOrders,
} from "./routes/mpesa-mock";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Determine if we should use real M-Pesa or mock service
  const useRealMpesa =
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_CONSUMER_KEY !== "your-consumer-key" &&
    process.env.MPESA_CONSUMER_SECRET !== "your-consumer-secret";

  if (useRealMpesa) {
    console.log("🔄 Using real M-Pesa API");
    // Real M-Pesa payment routes
    app.post("/api/mpesa/stkpush", handleStkPush);
    app.post("/api/mpesa/callback", handleMpesaCallback);
    app.get("/api/mpesa/query/:checkoutRequestId", handleStkQuery);
    app.get("/api/mpesa/test", handleMpesaTest);
  } else {
    console.log("🎭 Using mock M-Pesa service for development");
    // Mock M-Pesa payment routes for development
    app.post("/api/mpesa/stkpush", handleMockStkPush);
    app.post("/api/mpesa/callback", handleMockCallback);
    app.get("/api/mpesa/query/:checkoutRequestId", handleMockQuery);
    app.get("/api/mpesa/test", handleMockTest);
    app.get("/api/mpesa/orders", handleMockOrders); // Debug endpoint
  }

  return app;
}
