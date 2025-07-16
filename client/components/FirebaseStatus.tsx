import { useState, useEffect } from "react";
import { isFirebaseConfigured, isFirebaseAvailable } from "@/lib/firebase";
import { ProductService } from "@/lib/productService";
import { Badge } from "@/components/ui/badge";
import { Database, CloudOff, CheckCircle, AlertTriangle } from "lucide-react";

export function FirebaseStatus() {
  const [status, setStatus] = useState<
    "checking" | "connected" | "demo" | "error"
  >("checking");
  const [productCount, setProductCount] = useState<number>(0);

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    try {
      if (isFirebaseAvailable()) {
        // Firebase is properly configured and available
        try {
          const products = await ProductService.getAllProducts();
          setProductCount(products.length);
          setStatus("connected");
        } catch (error) {
          console.error("Firebase connection test failed:", error);
          if (error.message?.includes("Failed to fetch")) {
            console.log("🌐 Network connectivity issue detected");
          }
          const products = await ProductService.getAllProducts(); // This will return demo products
          setProductCount(products.length);
          setStatus("error");
        }
      } else if (isFirebaseConfigured()) {
        // Firebase is configured but not available (error state)
        const products = await ProductService.getAllProducts();
        setProductCount(products.length);
        setStatus("error");
      } else {
        // Using demo mode (not configured)
        const products = await ProductService.getAllProducts();
        setProductCount(products.length);
        setStatus("demo");
      }
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      setProductCount(6); // Default demo product count
      setStatus("error");
    }
  };

  if (status === "checking") {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Database className="h-3 w-3 animate-spin" />
        Connecting...
      </Badge>
    );
  }

  if (status === "connected") {
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-500">
        <CheckCircle className="h-3 w-3" />
        Firebase Connected ({productCount} products)
      </Badge>
    );
  }

  if (status === "error") {
    return (
      <Badge
        variant="secondary"
        className="flex items-center gap-1 bg-yellow-500"
      >
        <AlertTriangle className="h-3 w-3" />
        Firebase Error - Demo Mode ({productCount} products)
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500">
      <CloudOff className="h-3 w-3" />
      Demo Mode ({productCount} products)
    </Badge>
  );
}
