"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const trickleRef = useRef(null);

  const startProgress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (trickleRef.current) clearInterval(trickleRef.current);

    setVisible(true);
    setProgress(25);

    trickleRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(trickleRef.current);
          return 85;
        }
        return prev + Math.floor(Math.random() * 12 + 6);
      });
    }, 100);
  };

  const completeProgress = () => {
    if (trickleRef.current) clearInterval(trickleRef.current);
    setProgress(100);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 180);
  };

  // Complete progress on pathname change
  useEffect(() => {
    completeProgress();
  }, [pathname]);

  // Global click listener on internal links
  useEffect(() => {
    function handleClick(e) {
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        href !== pathname &&
        link.target !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        startProgress();
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (trickleRef.current) clearInterval(trickleRef.current);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-1 bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#6633CC] via-[#F58220] to-[#6633CC] shadow-[0_0_10px_#F58220,0_0_5px_#6633CC] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "150ms" : "180ms",
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}

