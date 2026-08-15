import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Total number of frames in the sequence (ezgif-frame-001.jpg to ezgif-frame-300.jpg)
 */
const TOTAL_FRAMES = 300;

/**
 * Format frame number to 3-digit string (e.g., 1 -> '001', 42 -> '042')
 */
const formatFrameIndex = (index) => {
  return String(index).padStart(3, '0');
};

/**
 * Generate asset URL for a given frame index
 */
const getFrameUrl = (index) => {
  const safeIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(index)));
  return `/sequence/ezgif-frame-${formatFrameIndex(safeIndex)}.jpg`;
};

export default function CinematicSequence({
  scrollProgress = 0,
  onLoadedProgress = null,
  className = '',
}) {
  const canvasRef = useRef(null);
  const imagesCacheRef = useRef(new Map());
  const currentFrameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const rafIdRef = useRef(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [loadPercent, setLoadPercent] = useState(0);

  // Helper to draw an image onto canvas with cover fit & subtle atmospheric vignette
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesCacheRef.current.get(frameIndex);
    if (!img || !img.complete || img.naturalWidth === 0) {
      // If target frame not loaded yet, find closest loaded frame
      let closest = null;
      let minDiff = Infinity;
      imagesCacheRef.current.forEach((cachedImg, idx) => {
        if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
          const diff = Math.abs(idx - frameIndex);
          if (diff < minDiff) {
            minDiff = diff;
            closest = cachedImg;
          }
        }
      });
      if (closest) {
        renderImageToCanvas(ctx, canvas, closest);
      }
      return;
    }

    renderImageToCanvas(ctx, canvas, img);
  }, []);

  const renderImageToCanvas = (ctx, canvas, img) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Calculate aspect ratios for "object-fit: cover"
    const canvasRatio = width / height;
    const imgRatio = imgW / imgH;

    let renderW, renderH, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderW = width;
      renderH = width / imgRatio;
      offsetX = 0;
      offsetY = (height - renderH) / 2;
    } else {
      renderH = height;
      renderW = height * imgRatio;
      offsetX = (width - renderW) / 2;
      offsetY = 0;
    }

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Draw the main frame
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

    // Ambient top-to-bottom subtle cinematic vignette
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(12, 8, 11, 0.45)');
    gradient.addColorStop(0.2, 'rgba(12, 8, 11, 0.05)');
    gradient.addColorStop(0.75, 'rgba(12, 8, 11, 0.15)');
    gradient.addColorStop(1, 'rgba(12, 8, 11, 0.85)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  };

  // Resize canvas to full viewport with DPR
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    drawFrame(Math.round(currentFrameRef.current));
  }, [drawFrame]);

  // Progressive Preloading Engine
  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;

    const updateProgress = () => {
      const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
      setLoadPercent(pct);
      if (onLoadedProgress) onLoadedProgress(pct);
    };

    const loadImage = (index) => {
      return new Promise((resolve) => {
        if (imagesCacheRef.current.has(index)) {
          resolve(imagesCacheRef.current.get(index));
          return;
        }
        const img = new Image();
        img.src = getFrameUrl(index);
        img.onload = () => {
          if (!isCancelled) {
            imagesCacheRef.current.set(index, img);
            loadedCount++;
            updateProgress();
            if (index === 1 && !initialLoaded) {
              setInitialLoaded(true);
              drawFrame(1);
            }
          }
          resolve(img);
        };
        img.onerror = () => {
          if (!isCancelled) {
            loadedCount++;
            updateProgress();
          }
          resolve(null);
        };
      });
    };

    // Stage 1: Load key initial frames first (Frame 1 to 20 + every 10th frame)
    const priorityFrames = [];
    for (let i = 1; i <= Math.min(25, TOTAL_FRAMES); i++) {
      priorityFrames.push(i);
    }
    for (let i = 30; i <= TOTAL_FRAMES; i += 10) {
      priorityFrames.push(i);
    }

    Promise.all(priorityFrames.map(loadImage)).then(() => {
      if (isCancelled) return;
      setInitialLoaded(true);
      drawFrame(1);

      // Stage 2: Load remaining frames in small batches
      const remainingFrames = [];
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        if (!priorityFrames.includes(i)) {
          remainingFrames.push(i);
        }
      }

      // Chunked background loading to keep main thread completely unblocked
      const chunkSize = 12;
      let currentChunk = 0;

      const loadNextChunk = () => {
        if (isCancelled || currentChunk * chunkSize >= remainingFrames.length) return;
        const batch = remainingFrames.slice(
          currentChunk * chunkSize,
          (currentChunk + 1) * chunkSize
        );
        Promise.all(batch.map(loadImage)).then(() => {
          currentChunk++;
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(loadNextChunk, { timeout: 100 });
          } else {
            setTimeout(loadNextChunk, 35);
          }
        });
      };

      loadNextChunk();
    });

    return () => {
      isCancelled = true;
    };
  }, [drawFrame, initialLoaded, onLoadedProgress]);

  // Window resize handler
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Map scrollProgress (0 to 1) to target frame (1 to TOTAL_FRAMES)
  useEffect(() => {
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
    const target = 1 + clampedProgress * (TOTAL_FRAMES - 1);
    targetFrameRef.current = target;
  }, [scrollProgress]);

  // Smooth LERP (Linear Interpolation) animation loop
  useEffect(() => {
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const animateLoop = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.05) {
        // High responsive lerp factor for instant tactile feel
        const next = lerp(current, target, 0.22);
        currentFrameRef.current = next;
        drawFrame(Math.round(next));
      } else if (Math.round(current) !== Math.round(target)) {
        currentFrameRef.current = target;
        drawFrame(Math.round(target));
      }

      rafIdRef.current = requestAnimationFrame(animateLoop);
    };

    rafIdRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [drawFrame]);

  return (
    <div className={`cinematic-canvas-wrapper ${className}`}>
      <canvas
        ref={canvasRef}
        className="cinematic-canvas"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
        }}
      />

      {/* Dark overlay for enhanced image depth and text readability */}
      <div className="cinematic-dark-overlay" />

      {/* Subtle top & bottom edge blends */}
      <div className="cinematic-edge-overlay cinematic-edge-overlay--top" />
      <div className="cinematic-edge-overlay cinematic-edge-overlay--bottom" />

      {/* Minimalistic ambient loader indicator until full sequence cached */}
      {loadPercent < 100 && (
        <div className="cinematic-loader-bar">
          <div
            className="cinematic-loader-progress"
            style={{ width: `${loadPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
