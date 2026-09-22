import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, LoadingSkeleton } from '../error-boundary';

function Bomb(): React.ReactElement {
  throw new Error('Test bomb 💣');
}

describe('ErrorBoundary', () => {
  // React logs thrown errors — silence noise in test output
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Healthy content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Healthy content')).toBeInTheDocument();
  });

  test('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Xatolik yuz berdi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Qayta urinish/i })).toBeInTheDocument();
  });

  test('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom oops</div>}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom oops')).toBeInTheDocument();
  });

  test('retry button resets the error state', () => {
    let shouldThrow = true;
    function Flaky() {
      if (shouldThrow) throw new Error('flaky');
      return <div>Recovered!</div>;
    }

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Xatolik yuz berdi/i)).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: /Qayta urinish/i }));
    expect(screen.getByText('Recovered!')).toBeInTheDocument();
  });
});

describe('LoadingSkeleton', () => {
  test('renders the requested number of lines', () => {
    const { container } = render(<LoadingSkeleton lines={4} />);
    expect(container.querySelectorAll('[data-slot="skeleton"], .animate-pulse')).toHaveLength(4);
  });
});
