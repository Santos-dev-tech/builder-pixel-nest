import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";

interface FirebaseErrorBoundaryProps {
  children: React.ReactNode;
}

interface FirebaseErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class FirebaseErrorBoundary extends React.Component<
  FirebaseErrorBoundaryProps,
  FirebaseErrorBoundaryState
> {
  constructor(props: FirebaseErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FirebaseErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Firebase Error Boundary caught an error:", error, errorInfo);
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                Firebase Configuration Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  There was an issue connecting to Firebase. This might be due
                  to:
                </p>
                <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                  <li>• Invalid Firebase configuration</li>
                  <li>• Network connectivity issues</li>
                  <li>• Firebase service unavailability</li>
                  <li>• Missing environment variables</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={this.handleRefresh}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </Button>

                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="w-full"
                >
                  Continue in Demo Mode
                </Button>

                <Button
                  variant="ghost"
                  onClick={() =>
                    window.open("/FIREBASE_AUTH_SETUP.md", "_blank")
                  }
                  className="w-full text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Setup Guide
                </Button>
              </div>

              {this.state.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-xs text-red-600 font-mono">
                    Error: {this.state.error.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
