import { List, showToast, Toast } from "@raycast/api";
import { Component, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    showToast({
      style: Toast.Style.Failure,
      title: "Something went wrong",
      message: "An unexpected error occurred. Please try again.",
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <List>
          <List.Item
            title="Error"
            subtitle="Something went wrong. Please try again."
            icon={{ source: "⚠️" }}
          />
        </List>
      );
    }

    return this.props.children;
  }
}
