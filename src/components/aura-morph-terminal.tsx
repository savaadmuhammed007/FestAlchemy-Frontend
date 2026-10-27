"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import "./aura-morph-terminal.css";

export interface AuraMorphTerminalProps extends React.ComponentPropsWithoutRef<"div"> {
  primaryColor?: string;
  secondaryColor?: string;
  bgColor?: string;
  terminalText?: string[];
  pillText?: string;
  systemTitle?: string;
  lineDelay?: number;
  onLaunch?: () => void;
  onComplete?: () => void;
  onLineScanned?: (index: number, line: string) => void;
  isExpandedControlled?: boolean;
}

const DEFAULT_TERMINAL_TEXT = [
  "INITIALIZING KERNEL...",
  "BYPASSING SECURITY PROTOCOLS...",
  "ACCESS GRANTED.",
  "ESTABLISHING SECURE CONNECTION...",
  "UPLINK READY.",
];

export function AuraMorphTerminal({
  primaryColor = "#ff1a1a",
  secondaryColor = "#b30f0f",
  bgColor = "#050505",
  terminalText = DEFAULT_TERMINAL_TEXT,
  pillText = "ACTIVATE AURA",
  systemTitle = "EDUFENSTA.SYS // PRODUCTION DEPLOYMENT v2.6",
  lineDelay = 380,
  onLaunch,
  onComplete,
  onLineScanned,
  isExpandedControlled,
  className = "",
  style,
  ...props
}: AuraMorphTerminalProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = isExpandedControlled !== undefined ? isExpandedControlled : internalExpanded;
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring for parallax
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transforms
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const translateZLayer1 = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const translateZLayer2 = useTransform(smoothY, [-0.5, 0.5], [-30, 30]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isExpanded) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (!isExpanded) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  // Typewriter effect for terminal text
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    if (!isExpanded) {
      setVisibleLines(0);
      return;
    }

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < terminalText.length) {
        currentLine += 1;
        setVisibleLines(currentLine);
        if (onLineScanned && terminalText[currentLine - 1]) {
          onLineScanned(currentLine - 1, terminalText[currentLine - 1]);
        }
      } else {
        clearInterval(interval);
        if (onComplete) {
          const timeout = setTimeout(() => {
            onComplete();
          }, 600);
          return () => clearTimeout(timeout);
        }
      }
    }, lineDelay);

    return () => clearInterval(interval);
  }, [isExpanded, terminalText, lineDelay, onLineScanned, onComplete]);

  // Auto-scroll terminal lines as they appear
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const expandTerminal = () => {
    setVisibleLines(0);
    setInternalExpanded(true);
    if (onLaunch) {
      onLaunch();
    }
  };

  const closeTerminal = () => {
    setVisibleLines(0);
    setInternalExpanded(false);
  };

  return (
    <div
      className={`amt-wrapper perspective-1000 ${className}`}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "440px",
        perspective: "1000px",
        padding: "1rem 0",
        ...style,
      }}
      {...props}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="pill"
            layoutId="aura-container"
            onClick={expandTerminal}
            autoFocus
            aria-label="Initiate Launch"
            aria-expanded={isExpanded}
            className="amt-pill-button group"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.45rem 3.8rem",
              borderRadius: "9999px",
              cursor: "pointer",
              overflow: "hidden",
              outline: "none",
              border: "1px solid rgba(255,255,255,0.24)",
              background: `linear-gradient(135deg, ${bgColor}, #121524)`,
              boxShadow: `0 0 55px -5px ${primaryColor}75, inset 0 0 25px ${secondaryColor}30`,
              zIndex: 10,
              userSelect: "none",
            }}
            whileHover={{ scale: 1.05, boxShadow: `0 0 75px 5px ${primaryColor}95, inset 0 0 32px ${secondaryColor}50` }}
            whileTap={{ scale: 0.96 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
          >
            {/* Animated Gradient Border */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                background: `linear-gradient(90deg, ${primaryColor}, #ffffff, ${secondaryColor}, ${primaryColor})`,
                backgroundSize: "200% 100%",
                borderRadius: "inherit",
                padding: "2px",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                opacity: 0.85,
              }}
              animate={{
                backgroundPosition: ["0% 0%", "200% 0%"]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Glowing Aura Effect */}
            <div
              style={{
                position: "absolute",
                inset: "-8px",
                zIndex: 0,
                opacity: 0.4,
                filter: "blur(18px)",
                background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                pointerEvents: "none",
              }}
            />

            <span
              style={{
                position: "relative",
                zIndex: 10,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: "1.15rem",
                letterSpacing: "0.18em",
                fontWeight: 800,
                color: "#ffffff",
                textShadow: `0 0 16px ${primaryColor}, 0 2px 6px rgba(0,0,0,0.9)`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.85rem",
                textTransform: "uppercase",
                textAlign: "center",
                lineHeight: 1.3,
              }}
            >
              {pillText}
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="terminal"
            layoutId="aura-container"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            data-amt-terminal
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "46rem",
              minHeight: "26rem",
              height: "auto",
              borderRadius: "1rem",
              overflow: "hidden",
              cursor: "crosshair",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              background: `linear-gradient(180deg, ${bgColor}ee, #05070cee)`,
              backdropFilter: "blur(24px)",
              boxShadow: `0 30px 65px -15px rgba(0, 0, 0, 0.8), 0 0 45px -8px ${primaryColor}40`,
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              zIndex: 20,
            }}
            initial={{ borderRadius: 9999, scale: 0.92, opacity: 0 }}
            animate={{ borderRadius: 16, scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.18, duration: 0.7 }}
          >
            {/* Background Noise Texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                opacity: 0.15,
                pointerEvents: "none",
                mixBlendMode: "overlay",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Top Bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2.75rem",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                padding: "0 1.25rem",
                zIndex: 30,
                justifyContent: "space-between",
                transform: "translateZ(10px)",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTerminal();
                  }}
                  autoFocus
                  aria-label="Close Terminal"
                  title="Close Terminal"
                  style={{
                    width: "0.75rem",
                    height: "0.75rem",
                    borderRadius: "9999px",
                    backgroundColor: "#ef4444",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    boxShadow: "0 0 6px rgba(239, 68, 68, 0.6)",
                  }}
                />
                <div
                  style={{
                    width: "0.75rem",
                    height: "0.75rem",
                    borderRadius: "9999px",
                    backgroundColor: "#f59e0b",
                    boxShadow: "0 0 6px rgba(245, 158, 11, 0.5)",
                  }}
                />
                <div
                  style={{
                    width: "0.75rem",
                    height: "0.75rem",
                    borderRadius: "9999px",
                    backgroundColor: "#10b981",
                    boxShadow: "0 0 6px rgba(16, 185, 129, 0.6)",
                  }}
                />
              </div>

              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.5)",
                  letterSpacing: "0.14em",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                {systemTitle}
              </div>
            </div>

            {/* Laser Scanner Line Effect */}
            <motion.div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: "2px",
                zIndex: 10,
                pointerEvents: "none",
                background: `linear-gradient(90deg, transparent, ${primaryColor}, #ffffff, ${secondaryColor}, transparent)`,
                boxShadow: `0 0 16px ${primaryColor}, 0 0 24px ${secondaryColor}`,
              }}
              animate={{
                top: ["12%", "88%", "12%"],
                opacity: [0.2, 0.85, 0.2]
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Content Area */}
            <div
              style={{
                position: "relative",
                zIndex: 20,
                padding: "4.5rem 1.75rem 3.5rem 1.75rem",
                minHeight: "26rem",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: "0.85rem",
                transform: "translateZ(30px)",
              }}
            >
              {/* Floating Hologram Node (Parallax Layer 1) */}
              <motion.div
                style={{
                  position: "absolute",
                  top: "4rem",
                  right: "1.75rem",
                  width: "4.25rem",
                  height: "4.25rem",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(12px)",
                  x: translateZLayer1,
                  y: translateZLayer2,
                  background: `radial-gradient(circle, ${secondaryColor}25 0%, transparent 75%)`,
                  boxShadow: `0 0 20px ${secondaryColor}20`,
                }}
              >
                <motion.div
                  style={{
                    width: "0.6rem",
                    height: "0.6rem",
                    borderRadius: "9999px",
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 12px ${primaryColor}`
                  }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>

              {/* Terminal Text Lines */}
              <div
                ref={terminalScrollRef}
                className="amt-terminal-lines"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.55rem",
                  maxHeight: "220px",
                  paddingRight: "0.5rem",
                }}
              >
                {terminalText.map((line, index) => {
                  const isVisible = index < visibleLines;
                  const isLatest = index === visibleLines - 1;
                  const isSuccessLine = line.includes("100%") || line.includes("OK") || line.includes("LIVE") || line.includes("GRANTED") || line.includes("SUCCESSFUL");

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{
                        opacity: isVisible ? 1 : 0,
                        x: isVisible ? 0 : -12,
                      }}
                      transition={{ duration: 0.28 }}
                      className="amt-line-item"
                      style={{
                        display: isVisible ? "flex" : "none",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        className="amt-line-index"
                        style={{
                          color: "rgba(255, 255, 255, 0.35)",
                          flexShrink: 0,
                          fontSize: "0.75rem",
                        }}
                      >
                        [{String(index + 1).padStart(2, "0")}]
                      </span>
                      <span
                        className="amt-line-content"
                        style={{
                          color: isSuccessLine ? "#34d399" : isLatest ? "#ffffff" : "rgba(255, 255, 255, 0.85)",
                          fontWeight: isSuccessLine || isLatest ? 600 : 400,
                          textShadow: isSuccessLine
                            ? "0 0 8px rgba(52, 211, 153, 0.5)"
                            : isLatest
                            ? `0 0 8px ${primaryColor}70`
                            : "none",
                        }}
                      >
                        {line}
                      </span>
                    </motion.div>
                  );
                })}

                {/* Blinking Cursor at bottom of stream */}
                {visibleLines > 0 && (
                  <motion.div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "0.25rem",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span style={{ color: "rgba(255, 255, 255, 0.35)", fontSize: "0.75rem" }}>
                      [{String(Math.min(visibleLines + 1, terminalText.length + 1)).padStart(2, "0")}]
                    </span>
                    <span style={{ color: primaryColor, fontWeight: 700 }}>$</span>
                    <motion.div
                      style={{
                        width: "8px",
                        height: "15px",
                        backgroundColor: primaryColor,
                        boxShadow: `0 0 8px ${primaryColor}`,
                      }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                )}
              </div>

              {/* Decorative Tech Footer Elements */}
              <div
                style={{
                  position: "absolute",
                  bottom: "1rem",
                  left: "1.75rem",
                  right: "1.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  opacity: 0.55,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.06em",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: "0.75rem",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: "3px",
                          height: "10px",
                          backgroundColor: i <= Math.ceil((visibleLines / (terminalText.length || 1)) * 6)
                            ? primaryColor
                            : "rgba(255, 255, 255, 0.15)",
                          transition: "background-color 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    SCAN: {visibleLines} / {terminalText.length} COMPLETE
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: secondaryColor, fontWeight: 600 }}>TLS 1.3 / ENCRYPTED</div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>edufensta // PROD</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default AuraMorphTerminal;
