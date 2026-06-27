'use client';

import { useEffect } from 'react';

/**
 * GlobalTextareaAutoGrow
 *
 * Attaches auto-grow behavior to EVERY <textarea> in the document,
 * on this page and any added later (via MutationObserver).
 *
 * - On input: textarea height shrinks to auto then grows to scrollHeight.
 * - On mount / value change (observed via attributes): initial resize.
 * - Respects existing inline styles; only manages height + overflowY.
 * - Works across admin and user side forms without per-file edits.
 *
 * Description-class fields (`.desc-word-like`) get a larger min-height.
 */

function grow(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  const min = el.classList.contains('desc-word-like') ? 132 : 0;
  const next = Math.max(el.scrollHeight, min);
  el.style.height = `${next}px`;
  el.style.overflowY = 'hidden';
}

function attach(el: HTMLTextAreaElement) {
  // Skip elements already managed by AutoGrowTextarea (which has its own logic)
  if ((el as HTMLTextAreaElement & { _ag?: boolean })._ag) return;
  if (el.dataset.autoGrow === 'false') return;
  (el as HTMLTextAreaElement & { _ag?: boolean })._ag = true;

  // Ensure resize is disabled so our JS controls height
  el.style.resize = 'none';
  el.style.overflowY = 'hidden';

  // Initial sizing — wait a tick so layout/fonts are ready
  grow(el);
  requestAnimationFrame(() => grow(el));

  el.addEventListener('input', () => grow(el));
}

function process(root: ParentNode) {
  root.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(attach);
}

export default function GlobalTextareaAutoGrow() {
  useEffect(() => {
    process(document);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as HTMLElement;
          if (el.tagName === 'TEXTAREA') attach(el as HTMLTextAreaElement);
          else process(el);
        });
        // Also re-grow textareas whose value/attributes changed externally
        if (m.type === 'attributes' && m.target instanceof HTMLTextAreaElement) {
          grow(m.target);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value'],
    });

    // Re-run on window resize (container widths change → scrollHeight changes)
    const onResize = () => document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(grow);
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return null;
}
