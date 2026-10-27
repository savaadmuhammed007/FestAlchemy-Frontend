import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuraMorphTerminal } from '../components/aura-morph-terminal';
import './LaunchPage.css';

const TARGET_URL = "https://festalchemy.in";

const SCAN_LOGS = [
  "INITIALIZING PRODUCTION GATEWAY & SECURITY PROTOCOLS...",
  "RESOLVING DOMAIN DNS: edufensta.in -> 104.21.72.182 [RESOLVED]",
  "VALIDATING CLOUDFLARE EDGE SSL / TLS 1.3 CERTIFICATE... [VALID]",
  "CONNECTING TO POSTGRESQL MULTI-REGION DATABASE NODES... [ONLINE]",
  "VERIFYING FESTIVAL SCHEMAS, SCORING & EVENT MATRICES... [SYNCED]",
  "SCANNING RATE LIMITERS, DDOS FIREWALL & REVERSE PROXIES... [ARMED]",
  "COMPILING OPTIMIZED PRODUCTION ASSETS & MEDIA PIPELINES... [100% OK]",
  "PRE-WARMING ANYCAST CDN CACHES ACROSS 280+ GLOBAL HUBS... [WARMED]",
  "INTEGRITY AUDIT: ALL PRODUCTION SYSTEMS 100% OPERATIONAL",
  ">>> ACCESS GRANTED: EDUFENSTA OFFICIAL WEBSITE IS LIVE! <<<"
];

export default function LaunchPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioCtxRef = useRef(null);

  // Web Audio for subtle cyber feedback
  const playBlip = useCallback((freq = 820, duration = 0.035) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }, []);

  const playSuccessChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      
      const ctx = audioCtxRef.current;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
          } catch (_) {}
        }, idx * 100);
      });
    } catch (_) {}
  }, []);

  // When user clicks the Launch button
  const handleLaunch = () => {
    playBlip(950, 0.06);
  };

  // When each line scans in
  const handleLineScanned = (index) => {
    playBlip(680 + index * 40, 0.03);
  };

  // When scanning finishes: trigger smooth transition to festalchemy.in
  const handleScanComplete = () => {
    playSuccessChime();
    setIsTransitioning(true);

    // Smooth cinematic transition delay before navigating to home page
    setTimeout(() => {
      window.location.href = TARGET_URL;
    }, 1500);
  };

  return (
    <div className="launch-clean-container">
      {/* Subtle Matrix Grid & Ambient Crimson Glow */}
      <div className="launch-grid-overlay" />
      <div className="launch-ambient-glow launch-ambient-glow--crimson" />

      {/* The Centered Launch Control Button & Morphing Terminal */}
      <div className="launch-centered-wrapper">
        <AuraMorphTerminal
          pillText="🚀 LAUNCH EDUFENSTA OFFICIAL WEBSITE"
          primaryColor="#ff1a1a"
          secondaryColor="#b30f0f"
          bgColor="#050505"
          systemTitle="EDUFENSTA.SYS // PRODUCTION SCAN"
          terminalText={SCAN_LOGS}
          lineDelay={650}
          onLaunch={handleLaunch}
          onLineScanned={handleLineScanned}
          onComplete={handleScanComplete}
        />
      </div>

      {/* Smooth Cinematic Transition Overlay to Home Page */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="launch-transition-veil"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.75rem',
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              {/* Big White EduFensta Logo (Without Circle) */}
              <motion.img
                src="/edufensta-logo.png"
                alt="EduFensta"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
                style={{
                  width: 'clamp(220px, 32vw, 380px)',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1) drop-shadow(0 0 30px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 70px rgba(255, 26, 26, 0.75))',
                  userSelect: 'none',
                }}
              />

              {/* Big ENTERING EDUFENSTA Text in EduFensta Bebas Neue font */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5 }}
                style={{
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  fontSize: 'clamp(3.2rem, 8.5vw, 6rem)',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: '#f5f5f0',
                  textShadow: '0 0 35px rgba(255, 255, 255, 0.85), 0 0 75px rgba(255, 26, 26, 0.7)',
                  textAlign: 'center',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                }}
              >
                ENTERING EDUFENSTA
              </motion.div>

              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  fontFamily: "'Space Grotesk', -apple-system, sans-serif",
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#ff1a1a',
                  letterSpacing: '0.25em',
                  textShadow: '0 0 16px rgba(255, 26, 26, 0.85)',
                  textTransform: 'uppercase',
                }}
              >
                OFFICIAL WEBSITE • LIVE
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
