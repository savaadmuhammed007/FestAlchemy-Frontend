import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor — A creative dual-circle cursor with glow trail.
 * Renders a small solid dot (inner) and a larger ring (outer) that
 * follows the mouse with an elastic spring effect.
 * Dynamically switches to vibrant red (#ff1a1a) on the Home page and EduFensta views.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Detect whether current view is the Home / EduFensta page
  const [isRedCursor, setIsRedCursor] = useState(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    return path === '/' || path === '/edufensta' || path === '/ilalhabeeb' || path === '/results' || path === '/team-status';
  });

  useEffect(() => {
    const checkRed = () => {
      const path = window.location.pathname;
      const hasEduClass = typeof document !== 'undefined' && !!document.querySelector('.edufensta-page');
      setIsRedCursor(
        path === '/' ||
        path === '/edufensta' ||
        path === '/ilalhabeeb' ||
        path === '/results' ||
        path === '/team-status' ||
        hasEduClass
      );
    };

    checkRed();
    window.addEventListener('popstate', checkRed);

    // Observe DOM mutations in case route changes via React Router
    const observer = new MutationObserver(checkRed);
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('popstate', checkRed);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Skip on touch-only devices
    if ('ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches) return;

    const onMouseMove = (e) => {
      setIsHidden(false);
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      // Check if hovering a clickable element (including buttons, inputs, modals, popups, etc.)
      const target = e.target;
      if (!target || !(target instanceof Element)) {
        setIsPointer(false);
        return;
      }

      const clickable = target.closest('a, button, [role="button"], input, select, textarea, label, [onclick], .rs-event-card, .ts-table-row, .btn, .confirm-modal-box, .glass-panel, .efr-card, .eft-row, .ef-results__card');
      let isPointerStyle = false;
      try {
        isPointerStyle = window.getComputedStyle(target).cursor === 'pointer';
      } catch (_) {}

      setIsPointer(!!clickable || isPointerStyle);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsHidden(true);
    const onMouseEnter = () => setIsHidden(false);
    const onFocus = () => setIsHidden(false);

    // Smooth ring follow with requestAnimationFrame
    let frameId;
    const animateRing = () => {
      const dx = pos.current.x - ringPos.current.x;
      const dy = pos.current.y - ringPos.current.y;
      ringPos.current.x += dx * 0.15;
      ringPos.current.y += dy * 0.15;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      }
      frameId = requestAnimationFrame(animateRing);
    };
    frameId = requestAnimationFrame(animateRing);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('focus', onFocus);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches) {
    return null;
  }

  return (
    <>
      {/* Glow trail (largest, most blurred) */}
      <div
        ref={trailRef}
        className={`custom-cursor-trail ${isRedCursor ? 'custom-cursor-trail--red' : ''} ${isHidden ? 'custom-cursor--hidden' : ''} ${isPointer ? 'custom-cursor-trail--pointer' : ''}`}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${isRedCursor ? 'custom-cursor-ring--red' : ''} ${isHidden ? 'custom-cursor--hidden' : ''} ${isPointer ? 'custom-cursor-ring--pointer' : ''} ${isClicking ? 'custom-cursor-ring--click' : ''}`}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        className={`custom-cursor-dot ${isRedCursor ? 'custom-cursor-dot--red' : ''} ${isHidden ? 'custom-cursor--hidden' : ''} ${isPointer ? 'custom-cursor-dot--pointer' : ''} ${isClicking ? 'custom-cursor-dot--click' : ''}`}
      />
    </>
  );
}
