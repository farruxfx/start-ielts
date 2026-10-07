'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Copy / screenshot protection — ACTIVE ONLY DURING TESTS.
 *
 * "In-test" routes: listening & reading runner pages, mock exam, writing
 * test and /test/[code]. Everywhere else (dashboard, pricing, settings,
 * admin, payment instructions, ...) copying works normally — the previous
 * global clipboard override that broke every "Copy" button is gone.
 */
const TEST_PATH_PREFIXES = ['/listening/', '/reading/', '/mock-exam/', '/writing/test/', '/test/'];

export function CopyProtection() {
  const pathname = usePathname() || '';
  const inTest = TEST_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    // Outside tests: no restrictions at all.
    if (!inTest) return;

    const isEditable = (el: EventTarget | null): boolean => {
      const t = el as HTMLElement | null;
      if (!t) return false;
      const tag = t.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || !!t.isContentEditable;
    };

    // Disable right-click context menu inside tests
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for copying, printing, saving, viewing source
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = (navigator.platform || '').toUpperCase().includes('MAC');
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();

      // Ctrl/Cmd + C/X/A/P/S/U/J — copy, cut, select-all, print, save, view-source, downloads
      if (ctrl && !e.shiftKey && ['c', 'x', 'a', 'p', 's', 'u', 'j'].includes(key)) {
        e.preventDefault();
        return false;
      }

      // Ctrl/Cmd + V — paste is pointless in tests, block it
      if (ctrl && key === 'v') {
        e.preventDefault();
        return false;
      }

      // DevTools shortcuts
      if (ctrl && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Print Screen — best-effort clipboard clear
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        try { navigator.clipboard?.writeText('').catch(() => {}); } catch { /* ignore */ }
        return false;
      }
    };

    // Disable drag on images and text
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection via mouse (inputs still selectable)
    const handleSelectStart = (e: Event) => {
      if (isEditable(e.target)) return true;
      e.preventDefault();
      return false;
    };

    // Block copying of the selected test content
    const handleCopy = (e: ClipboardEvent) => {
      if (isEditable(e.target)) return true;
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    document.addEventListener('copy', handleCopy, true);

    // Test-only user-select lock (iframe content already handled by the runner).
    const style = document.createElement('style');
    style.id = 'copy-guard-style';
    style.textContent =
      '.copy-guard-active *:not(input):not(textarea):not([contenteditable="true"]) ' +
      '{ -webkit-user-select: none !important; -moz-user-select: none !important; ' +
      '-ms-user-select: none !important; user-select: none !important; }';
    document.head.appendChild(style);
    document.body.classList.add('copy-guard-active');

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      document.removeEventListener('copy', handleCopy, true);
      document.body.classList.remove('copy-guard-active');
      document.getElementById('copy-guard-style')?.remove();
    };
  }, [inTest]);

  return null;
}
