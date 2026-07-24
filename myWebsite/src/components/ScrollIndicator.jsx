import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// Minimum height of the pill so a short indicator is still visible/grabbable.
const MIN_THUMB = 44;
// How long the pill lingers after scrolling/holding stops before fading out.
const HIDE_DELAY = 900;
// A press must last this long to count as "held" (avoids flashing on quick clicks).
const HOLD_THRESHOLD = 140;

// A custom, on-demand scroll position indicator. It renders a grey pill on
// the right edge that only appears while the page is scrolling or the pointer is
// held down, and fades away when the page is idle. The pill reflects the current
// scroll position and can be dragged to scroll. The native page scrollbar is
// hidden globally (see App.css); this replaces it. The pill starts below the
// navbar via a top offset derived from the navbar's measured height.
export default function ScrollIndicator() {
  const location = useLocation();
  const [thumb, setThumb] = useState({ top: 0, height: MIN_THUMB, show: false });

  const showRef = useRef(false);
  const heldRef = useRef(false);
  const dragRef = useRef(null);
  const hideTimer = useRef(null);
  const holdTimer = useRef(null);
  const rafRef = useRef(0);
  const geomRef = useRef({ trackTop: 0, trackHeight: 0, thumbHeight: MIN_THUMB, maxScroll: 0 });

  useEffect(() => {
    const nav = document.querySelector(".navbar");

    const computeGeom = () => {
      const navH = nav ? nav.getBoundingClientRect().height : 0;
      const trackTop = navH + 8;
      const trackHeight = Math.max(0, window.innerHeight - trackTop - 8);
      const docH = document.documentElement.scrollHeight;
      const maxScroll = Math.max(0, docH - window.innerHeight);
      const viewFrac = docH > 0 ? window.innerHeight / docH : 1;
      const thumbHeight = Math.min(trackHeight, Math.max(MIN_THUMB, trackHeight * viewFrac));
      geomRef.current = { trackTop, trackHeight, thumbHeight, maxScroll };
    };

    const positionThumb = () => {
      const { trackTop, trackHeight, thumbHeight, maxScroll } = geomRef.current;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const frac = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      const top = trackTop + frac * (trackHeight - thumbHeight);
      setThumb({ top, height: thumbHeight, show: showRef.current && maxScroll > 0 });
    };

    const scheduleUpdate = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        computeGeom();
        positionThumb();
      });
    };

    const clearHide = () => {
      if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    };
    const hideNow = () => {
      if (heldRef.current || dragRef.current) return;
      showRef.current = false;
      setThumb((t) => ({ ...t, show: false }));
    };
    const scheduleHide = () => {
      clearHide();
      hideTimer.current = setTimeout(hideNow, HIDE_DELAY);
    };
    const show = () => {
      showRef.current = true;
      scheduleUpdate();
    };

    const onScroll = () => { show(); scheduleHide(); };
    const onResize = () => { computeGeom(); positionThumb(); };

    const onPointerDown = () => {
      heldRef.current = true;
      clearHide();
      if (holdTimer.current) clearTimeout(holdTimer.current);
      holdTimer.current = setTimeout(() => {
        if (heldRef.current) show();
      }, HOLD_THRESHOLD);
    };
    const onPointerUp = () => {
      heldRef.current = false;
      if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
      scheduleHide();
    };

    computeGeom();
    positionThumb();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      clearHide();
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Content height differs per page, so recompute geometry after navigation.
  useEffect(() => {
    const id = setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
    return () => clearTimeout(id);
  }, [location.pathname]);

  // Drag the pill to scroll the page.
  const onThumbPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      startY: e.clientY,
      startScroll: window.scrollY || document.documentElement.scrollTop,
    };
    heldRef.current = true;
    showRef.current = true;
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    setThumb((t) => ({ ...t, show: geomRef.current.maxScroll > 0 }));

    const move = (ev) => {
      const { trackHeight, thumbHeight, maxScroll } = geomRef.current;
      const denom = trackHeight - thumbHeight;
      if (denom <= 0 || maxScroll <= 0) return;
      const delta = ev.clientY - dragRef.current.startY;
      const next = dragRef.current.startScroll + (delta / denom) * maxScroll;
      window.scrollTo(0, Math.min(maxScroll, Math.max(0, next)));
    };
    const up = () => {
      dragRef.current = null;
      heldRef.current = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        if (heldRef.current || dragRef.current) return;
        showRef.current = false;
        setThumb((t) => ({ ...t, show: false }));
      }, HIDE_DELAY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("pointercancel", up, { passive: true });
  };

  return (
    <div className={`scroll-indicator${thumb.show ? " is-visible" : ""}`} aria-hidden="true">
      <div
        className="scroll-indicator-thumb"
        style={{ top: `${thumb.top}px`, height: `${thumb.height}px` }}
        onPointerDown={onThumbPointerDown}
      />
    </div>
  );
}
