import { Component, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryInner extends Component<Props & { t: (key: string) => string }, State> {
  constructor(props: Props & { t: (key: string) => string }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="card text-center max-w-md">
            <div className="text-red-400 text-4xl mb-4">!</div>
            <h2 className="text-lg font-semibold mb-2">{t('common.somethingWentWrong')}</h2>
            <p className="text-dark-muted text-sm mb-4">
              {this.state.error?.message || t('common.unexpectedError')}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-primary"
            >
              {t('common.tryAgain')}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function ErrorBoundary({ children, fallback }: Props) {
  const { t } = useTranslation();
  return <ErrorBoundaryInner t={t} fallback={fallback}>{children}</ErrorBoundaryInner>;
}
