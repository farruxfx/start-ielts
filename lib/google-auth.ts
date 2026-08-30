/**
 * Google Identity Services (GIS) — client-side Google Sign-In utility.
 *
 * Flow:
 * 1. Load the GIS script
 * 2. Initialize with the Client ID
 * 3. User clicks "Sign in with Google"
 * 4. Google handles the OAuth flow
 * 5. We get user info (email, name, picture) back
 * 6. Store in localStorage mock auth
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tout_click?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

export interface CredentialResponse {
  credential: string;
  select_by: string;
}

const GOOGLE_CLIENT_ID = '517488937450-k8p8asqduv8ofsde73r4pgkkivienpmj.apps.googleusercontent.com';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let scriptLoaded = false;
let scriptLoading = false;

/**
 * Load the Google Identity Services script
 */
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (scriptLoaded) {
      resolve();
      return;
    }

    if (document.getElementById('google-gsi-script')) {
      scriptLoaded = true;
      resolve();
      return;
    }

    if (scriptLoading) {
      // Wait for existing load attempt
      const check = setInterval(() => {
        if (scriptLoaded) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    scriptLoading = true;
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
    };
    script.onerror = () => {
      scriptLoading = false;
      reject(new Error('Failed to load Google Identity Services'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Decode a Google JWT token to get user info (without verification — for client-side use only)
 */
export function decodeGoogleToken(token: string): GoogleUserInfo {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      email: payload.email || '',
      name: payload.name || payload.given_name || 'Google User',
      picture: payload.picture || '',
      sub: payload.sub || '',
    };
  } catch {
    throw new Error('Failed to decode Google token');
  }
}

/**
 * Initialize Google Sign-In and render a button in the given element
 */
export function initGoogleSignIn(
  container: HTMLElement,
  onSuccess: (user: GoogleUserInfo) => void,
  onError?: (error: string) => void
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      await loadGoogleScript();

      if (!window.google?.accounts?.id) {
        reject(new Error('Google Identity Services not available'));
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: CredentialResponse) => {
          if (response.credential) {
            try {
              const user = decodeGoogleToken(response.credential);
              onSuccess(user);
            } catch (err) {
              onError?.(err instanceof Error ? err.message : 'Google sign-in failed');
            }
          } else {
            onError?.('No credential received from Google');
          }
        },
        auto_select: false,
        cancel_on_tout_click: true,
      });

      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: container.offsetWidth || 300,
      });

      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Trigger Google One Tap prompt (no button needed)
 */
export function promptGoogleOneTap(
  onSuccess: (user: GoogleUserInfo) => void,
  onError?: (error: string) => void
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      await loadGoogleScript();

      if (!window.google?.accounts?.id) {
        reject(new Error('Google Identity Services not available'));
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: CredentialResponse) => {
          if (response.credential) {
            try {
              const user = decodeGoogleToken(response.credential);
              onSuccess(user);
            } catch (err) {
              onError?.(err instanceof Error ? err.message : 'Google sign-in failed');
            }
          } else {
            onError?.('No credential received from Google');
          }
        },
        auto_select: true,
      });

      window.google.accounts.id.prompt();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
