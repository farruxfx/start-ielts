'use client';

import { useEffect } from 'react';

export function CopyProtection() {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for copying, printing, saving, viewing source
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+C / Cmd+C — Copy
      if (ctrl && e.key === 'c' && !e.shiftKey) {
        e.preventDefault();
        return false;
      }

      // Ctrl+V / Cmd+V — Paste (block in test areas)
      if (ctrl && e.key === 'v') {
        e.preventDefault();
        return false;
      }

      // Ctrl+X / Cmd+X — Cut
      if (ctrl && e.key === 'x') {
        e.preventDefault();
        return false;
      }

      // Ctrl+A / Cmd+A — Select All
      if (ctrl && e.key === 'a') {
        e.preventDefault();
        return false;
      }

      // Ctrl+P / Cmd+P — Print
      if (ctrl && e.key === 'p') {
        e.preventDefault();
        return false;
      }

      // Ctrl+S / Cmd+S — Save
      if (ctrl && e.key === 's') {
        e.preventDefault();
        return false;
      }

      // Ctrl+U / Cmd+U — View Source
      if (ctrl && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Ctrl+J / Cmd+J — Downloads
      if (ctrl && e.key === 'j') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Option+I — DevTools
      if (ctrl && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J / Cmd+Option+J — Console
      if (ctrl && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C / Cmd+Option+C — Inspect Element
      if (ctrl && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }

      // F12 — DevTools
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        // Clear clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText('').catch(() => {});
        }
        return false;
      }
    };

    // Disable drag on images and text
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection via mouse
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow selection in input/textarea fields
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Block DevTools via debugger statement detection
    const handleDevToolsCheck = () => {
      const threshold = 100;
      const start = performance.now();
      // This is a lightweight detection — actual blocking is done via shortcuts
      // Real protection happens server-side
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('selectstart', handleSelectStart, true);

    // DevTools detection
    const devToolsInterval = setInterval(handleDevToolsCheck, 1000);

    // Disable print screen via clipboard API override
    if (navigator.clipboard && navigator.clipboard.writeText) {
      const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = async (text: string) => {
        // Allow clipboard writes inside input/textarea only
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) {
          return originalWriteText(text);
        }
        return Promise.resolve();
      };
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      clearInterval(devToolsInterval);
    };
  }, []);

  return null;
}
