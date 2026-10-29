'use client';

// ═══════════════════════════════════════════════════════════════════════
//  CAPTCHA WIDGET — self-hosted bot guard for signup / signin forms.
//
//  Renders the server-generated SVG challenge, collects the answer and
//  verifies it against POST /api/captcha when the parent form calls
//  ref.verify(). On failure it auto-refreshes and returns false.
// ═══════════════════════════════════════════════════════════════════════

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { RefreshCw, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export interface CaptchaHandle {
  /** Verifies the answer server-side; resolves true on success, false on failure. */
  verify: () => Promise<boolean>;
  /** True when the user has typed a non-empty answer. */
  hasAnswer: boolean;
}

interface CaptchaWidgetProps {
  label?: string;
}

export const CaptchaWidget = forwardRef<CaptchaHandle, CaptchaWidgetProps>(
  function CaptchaWidget({ label = 'Tekshiruv: rasmdagi kodni kiriting' }, ref) {
    const [svg, setSvg] = useState<string | null>(null);
    const [token, setToken] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCaptcha = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/captcha', { cache: 'no-store' });
        const data = await res.json();
        if (res.ok) {
          setSvg(data.svg);
          setToken(data.token);
          setAnswer('');
        } else {
          setError(data.error || 'Captcha yuklanmadi');
        }
      } catch {
        setError('Captcha yuklanmadi');
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchCaptcha();
    }, [fetchCaptcha]);

    const verify = useCallback(async (): Promise<boolean> => {
      if (!token || !answer.trim()) {
        setError("Captcha javobini kiriting");
        return false;
      }
      setVerifying(true);
      setError(null);
      try {
        const res = await fetch('/api/captcha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, answer }),
        });
        const data = await res.json();
        if (res.ok && data.ok) return true;
        setError(data.error || "Captcha javobi noto'g'ri — yangisini tanlang");
        fetchCaptcha(); // token consumed / invalid → fresh challenge
        return false;
      } catch {
        setError('Captcha tekshirishda xatolik');
        return false;
      } finally {
        setVerifying(false);
      }
    }, [token, answer, fetchCaptcha]);

    useImperativeHandle(ref, () => ({ verify, hasAnswer: answer.trim().length > 0 }), [verify, answer]);

    return (
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {label}
        </label>

        <div className="flex items-center gap-2">
          <div className="flex h-14 min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-border bg-muted/30 px-2">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : svg ? (
              // Server-trusted SVG (static text/noise markup, no user input)
              <div className="h-full w-full [&>svg]:h-full [&>svg]:w-auto" dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
              <span className="text-xs text-muted-foreground">yuklanmadi</span>
            )}
          </div>
          <button
            type="button"
            onClick={fetchCaptcha}
            disabled={loading}
            title="Yangi rasmlisini olish"
            aria-label="Captcha yangilash"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted/40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          placeholder="5 ta harf/raqam"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setError(null);
          }}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase tracking-wider ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-invalid={!!error}
        />

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
        {verifying && <p className="text-xs text-muted-foreground">Tekshirilyapti...</p>}
      </div>
    );
  },
);
