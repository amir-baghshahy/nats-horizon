import { Component, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorBoundaryInner({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="card text-center max-w-md">
        <div className="text-red-400 text-4xl mb-4">!</div>
        <h2 className="text-display-lg font-semibold mb-2">
          {t("common.somethingWentWrong")}
        </h2>
        <p className="text-content-tertiary text-display-sm mb-4">
          {error?.message || t("common.unexpectedError")}
        </p>
        <Button onClick={onReset} variant="primary">
          {t("common.tryAgain")}
        </Button>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorBoundaryInner
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
