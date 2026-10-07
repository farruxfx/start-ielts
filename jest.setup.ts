import '@testing-library/jest-dom';
import { webcrypto } from 'crypto';

// jsdom does not implement WebCrypto — lib/session.ts (ECDSA session tokens)
// needs crypto.subtle. Force-inject Node's webcrypto (defineProperty bypasses
// jsdom's read-only global getters).
const g = globalThis as unknown as { crypto?: Crypto };
if (!g.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto as unknown as Crypto,
    configurable: true,
    writable: true,
  });
}

// TextEncoder/TextDecoder may be missing in the jsdom environment.
const gg = globalThis as unknown as Record<string, unknown>;
if (typeof gg.TextEncoder === 'undefined') {
  gg.TextEncoder = require('util').TextEncoder;
}
if (typeof gg.TextDecoder === 'undefined') {
  gg.TextDecoder = require('util').TextDecoder;
}

// jsdom does not implement matchMedia — needed by next-themes / responsive hooks
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

// jsdom does not implement scrollIntoView
if (typeof window !== 'undefined' && !window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
