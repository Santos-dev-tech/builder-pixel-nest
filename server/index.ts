import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleStkPush,
  handleMpesaCallback,
  handleStkQuery,
  handleMpesaTest,
} from "./routes/mpesa";

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

  // M-Pesa payment routes
  app.post("/api/mpesa/stkpush", handleStkPush);
  app.post("/api/mpesa/callback", handleMpesaCallback);
  app.get("/api/mpesa/query/:checkoutRequestId", handleStkQuery);
  app.get("/api/mpesa/test", handleMpesaTest);

  return app;
}
