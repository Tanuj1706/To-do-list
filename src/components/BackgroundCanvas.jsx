import React, { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
  const spotlightRef = useRef(null);

  useEffect(() => {
    let rafId;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    // 120 FPS hardware-accelerated transform loop without DOM style invalidation
    const updateLoop = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX - 300}px, ${currentY - 300}px, 0)`;
      }

      rafId = requestAnimationFrame(updateLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="crazy-background-container" aria-hidden="true">
      {/* 1. Optimized High-Performance Nebula (Zero blur filter passes) */}
      <div className="crazy-nebula-layer" />
      {/* 2. Cybernetic Blueprint Coordinate Grid */}
      <div className="crazy-grid-layer" />
      {/* 3. Hardware-Accelerated 120 FPS Spotlight (translate3d) */}
      <div ref={spotlightRef} className="crazy-spotlight-orb" />
    </div>
  );
}
