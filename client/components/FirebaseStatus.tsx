import { useState, useEffect } from "react";
import { isFirebaseConfigured, isFirebaseAvailable } from "@/lib/firebase";
import { ProductService } from "@/lib/productService";
import { Badge } from "@/components/ui/badge";
import { Database, CloudOff, CheckCircle, AlertTriangle } from "lucide-react";

export function FirebaseStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "demo">(
    "checking",
  );
  const [productCount, setProductCount] = useState<number>(0);

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    try {
      if (isFirebaseConfigured()) {
        // Try to fetch products to test connection
        const products = await ProductService.getAllProducts();
        setProductCount(products.length);
        setStatus("connected");
      } else {
        // Using demo mode
        const products = await ProductService.getAllProducts();
        setProductCount(products.length);
        setStatus("demo");
      }
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      setStatus("demo");
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

  return (
    <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500">
      <CloudOff className="h-3 w-3" />
      Demo Mode ({productCount} products)
    </Badge>
  );
}
