/**
 * Enhanced Error Boundary with retry and fallback capabilities
 */
import { Component, ErrorInfo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "./ui/Button";
import Card from "./ui/Card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Log to external service in production
    const isProd = typeof window !== 'undefined' &&
                    (window as any).process?.env?.NODE_ENV === "production";

    if (isProd) {
      // You can integrate with Sentry, LogRocket, etc.
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <ErrorFallback
        error={this.state.error}
        onRetry={this.handleRetry}
        onGoHome={this.handleGoHome}
        retryCount={this.state.retryCount}
      />;
    }

    return this.props.children;
  }
}

function ErrorFallback({
  error,
  onRetry,
  onGoHome,
  retryCount
}: {
  error: Error | null;
  onRetry: () => void;
  onGoHome: () => void;
  retryCount: number;
}) {
  const { t } = useTranslation();

  // Don't show retry button after 3 failed attempts
  const showRetry = retryCount < 3;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-lg w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-red-500/20">
            <AlertCircle className="avatar text-red-400" />
          </div>
        </div>

        <h2 className="text-display-xl font-semibold mb-2">
          {t("common.somethingWentWrong")}
        </h2>

        <p className="text-content-tertiary mb-4">
          {error?.message || t("common.unexpectedError")}
        </p>

        {error?.stack && typeof window !== 'undefined' && (window as any).process?.env?.NODE_ENV === "development" && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-display-xs text-content-tertiary hover:text-content-primary mb-2">
              {t("common.errorDetails")}
            </summary>
            <pre className="bg-surface-primary p-3 rounded-lg text-display-xs overflow-auto max-h-40 text-red-400">
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          {showRetry ? (
            <Button
              onClick={onRetry}
              icon={<RefreshCw className="icon-base" />}
              variant="primary"
            >
              {t("common.tryAgain")}
            </Button>
          ) : (
            <Button
              onClick={onGoHome}
              icon={<Home className="icon-base" />}
              variant="primary"
            >
              {t("common.goHome")}
            </Button>
          )}
        </div>

        {!showRetry && (
          <p className="text-display-xs text-content-tertiary mt-3">
            {t("common.tooManyRetries")}
          </p>
        )}
      </Card>
    </div>
  );
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
