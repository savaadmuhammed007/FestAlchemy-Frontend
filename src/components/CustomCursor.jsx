import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor — A creative dual-circle cursor with glow trail.
 * Renders a small solid dot (inner) and a larger ring (outer) that
 * follows the mouse with an elastic spring effect.
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

  useEffect(() => {
    // Skip on touch-only devices
    if ('ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches) return;

    const onMouseMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }

      // Check if hovering a clickable element
      const target = e.target;
      const clickable = target.closest('a, button, [role="button"], input, select, textarea, label, [onclick], .rs-event-card, .ts-table-row');
      setIsPointer(!!clickable);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsHidden(true);
    const onMouseEnter = () => setIsHidden(false);

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

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
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
        className={`custom-cursor-trail ${isHidden ? 'custom-cursor--hidden' : ''} ${isPointer ? 'custom-cursor-trail--pointer' : ''}`}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${isHidden ? 'custom-cursor--hidden' : ''} ${isPointer ? 'custom-cursor-ring--pointer' : ''} ${isClicking ? 'custom-cursor-ring--click' : ''}`}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        className={`custom-cursor-dot ${isHidden ? 'custom-cursor--hidden' : ''} ${isPointer ? 'custom-cursor-dot--pointer' : ''} ${isClicking ? 'custom-cursor-dot--click' : ''}`}
      />
    </>
  );
}
