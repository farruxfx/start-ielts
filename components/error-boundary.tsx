'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <div className="text-6xl">😵</div>
          <h2 className="text-xl font-bold text-foreground">Xatolik yuz berdi</h2>
          <p className="text-center text-muted-foreground max-w-md">
            {this.state.error?.message || "Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring."}
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
          >
            Qayta urinish
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================
// Inline Error Display Component
// ============================================================

interface InlineErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ message, onRetry, className }: InlineErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 rounded-lg bg-destructive/10 ${className || ''}`}>
      <div className="text-4xl">⚠️</div>
      <p className="text-sm text-destructive text-center">
        {message || "Xatolik yuz berdi"}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Qayta urinish
        </Button>
      )}
    </div>
  );
}

// ============================================================
// Loading States
// ============================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className || ''}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-primary border-t-transparent`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted animate-pulse rounded"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

// ============================================================
// Empty State Component
// ============================================================

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon = '📭', title, description, action, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 p-8 ${className || ''}`}>
      <div className="text-5xl">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
