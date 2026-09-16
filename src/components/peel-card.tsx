"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";

export interface RindPeelCardProps extends React.ComponentPropsWithoutRef<"div"> {
  width?: string | number;
  height?: string | number;
  minHeight?: string | number;
  borderRadius?: string | number;
  
  revealTitle?: string;
  revealDesc?: string;
  revealBg?: string;
  revealTextColor?: string;
  revealDescColor?: string;

  peelCategory?: string;
  peelTitle?: string;
  peelHint?: string;
  peelArrow?: string;
  peelBg?: string;
  peelTextColor?: string;
  peelCategoryColor?: string;
  peelHintColor?: string;
  peelArrowColor?: string;
  peelStripeColor?: string;
  borderColor?: string;

  children?: React.ReactNode;
  peelChildren?: React.ReactNode;
  revealChildren?: React.ReactNode;
  onPeelChange?: (isPeeled: boolean) => void;
}

export const RindPeelCard = React.forwardRef<HTMLDivElement, RindPeelCardProps>(
  (
    {
      width = "100%",
      height = "auto",
      minHeight = 240,
      borderRadius = "12px",
      
      revealTitle = "Official Winners",
      revealDesc = "Top 3 champions declared.",
      revealBg = "#080808",
      revealTextColor = "#f5f5f0",
      revealDescColor = "#888888",

      peelCategory = "Event",
      peelTitle = "Program Name",
      peelHint = "Hover or tap to reveal",
      peelArrow = "↑",
      peelBg = "#0c0c0c",
      peelTextColor = "#f5f5f0",
      peelCategoryColor = "#ff1a1a",
      peelHintColor = "#777777",
      peelArrowColor = "#ff1a1a",
      peelStripeColor = "#ff1a1a",
      borderColor = "rgba(255, 26, 26, 0.3)",

      children,
      peelChildren,
      revealChildren,
      onPeelChange,
      className = "",
      style,
      onClick,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLDivElement | null>) || internalRef;
    const peelRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [isPeeled, setIsPeeled] = useState(false);

    const openPeel = () => {
      if (peelRef.current) {
        gsap.to(peelRef.current, {
          scaleY: 0,
          transformOrigin: "top center",
          duration: 0.45,
          ease: "power3.inOut",
        });
      }
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.35,
          delay: 0.2,
          ease: "power2.out",
        });
      }
      setIsPeeled(true);
      onPeelChange?.(true);
    };

    const closePeel = () => {
      if (peelRef.current) {
        gsap.to(peelRef.current, {
          scaleY: 1,
          duration: 0.45,
          ease: "power3.inOut",
        });
      }
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          opacity: 0,
          y: 12,
          duration: 0.25,
          ease: "power2.in",
        });
      }
      setIsPeeled(false);
      onPeelChange?.(false);
    };

    const handleEnter = () => {
      openPeel();
    };

    const handleLeave = () => {
      closePeel();
    };

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // If clicking directly on a button or link inside reveal layer, let that action happen
      const target = e.target as HTMLElement;
      if (target.closest('button, a, .peel-action-btn')) {
        onClick?.(e);
        return;
      }
      // Toggle peel on click/tap
      if (isPeeled) {
        closePeel();
      } else {
        openPeel();
      }
      onClick?.(e);
    };

    return (
      <div
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        className={`peel-card-root ${className}`}
        style={{
          position: "relative",
          cursor: "pointer",
          overflow: "hidden",
          width,
          height,
          minHeight,
          borderRadius,
          border: `1px solid ${borderColor}`,
          backgroundColor: revealBg,
          outline: "none",
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      >
        {/* Inner content revealed under peel */}
        <div
          ref={contentRef}
          className="peel-card-reveal"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "1.5rem",
            backgroundColor: revealBg,
            boxSizing: "border-box",
            opacity: 0,
            transform: "translateY(12px)",
            zIndex: 5,
          }}
        >
          {revealChildren ? (
            revealChildren
          ) : (
            <>
              <div>
                <p
                  style={{
                    fontFamily: "var(--ef-font-display, 'Bebas Neue', sans-serif)",
                    fontSize: "1.6rem",
                    textTransform: "uppercase",
                    color: revealTextColor,
                    margin: "0 0 0.5rem 0",
                    lineHeight: 1.1,
                  }}
                >
                  {revealTitle}
                </p>
                <p
                  style={{
                    fontFamily: "var(--ef-font-body, 'Space Grotesk', sans-serif)",
                    fontSize: "0.85rem",
                    color: revealDescColor,
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {revealDesc}
                </p>
              </div>
            </>
          )}
        </div>

        {/* The "rind" peel layer (covers the card until hovered or tapped) */}
        <div
          ref={peelRef}
          className="peel-card-rind"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "1.5rem",
            transformOrigin: "top center",
            backgroundColor: peelBg,
            boxSizing: "border-box",
            zIndex: 10,
          }}
        >
          {peelChildren || children ? (
            peelChildren || children
          ) : (
            <>
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: peelCategoryColor,
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  {peelCategory}
                </p>
                <p
                  style={{
                    fontFamily: "var(--ef-font-display, 'Bebas Neue', sans-serif)",
                    fontSize: "1.8rem",
                    textTransform: "uppercase",
                    color: peelTextColor,
                    margin: 0,
                    lineHeight: 1.15,
                  }}
                >
                  {peelTitle}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "auto",
                  paddingTop: "1.25rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: peelHintColor,
                    textTransform: "uppercase",
                  }}
                >
                  {peelHint}
                </span>
                <span
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: peelArrowColor,
                  }}
                >
                  {peelArrow}
                </span>
              </div>
            </>
          )}

          {/* Rind stripe */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "3px",
              backgroundColor: peelStripeColor,
            }}
          />
        </div>
      </div>
    );
  }
);

RindPeelCard.displayName = "RindPeelCard";
export default RindPeelCard;
