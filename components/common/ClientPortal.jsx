"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ClientPortal({ children, lockScroll = true }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!lockScroll) return;

    // Lock body and dashboard main-scroll-container scroll
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const scroller = document.getElementById("main-scroll-container");
    const prevScrollerOverflow = scroller ? scroller.style.overflowY : "";
    if (scroller) {
      scroller.style.overflowY = "hidden";
    }

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      if (scroller) {
        scroller.style.overflowY = prevScrollerOverflow;
      }
    };
  }, [lockScroll]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}

