"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, type TargetAndTransition } from "framer-motion";
import styles from "../page.module.css";
import { markLoaderReady } from "./loader-ready";

const ease        = [0.25, 1, 0.5, 1] as [number, number, number, number];
const curtainEase = [0.76, 0, 0.24, 1] as [number, number, number, number]; // wipe

const MIN_MS = 1800; // minimum on-screen time — avoids a flash on fast/cached loads
const MAX_MS = 7000; // hard cap — a stalled asset never traps the user on the loader

// Curtain exit styles — pass one to <Loader curtain="…" /> (default "wipe-down").
export type CurtainVariant =
  | "wipe-down"   // clip reveal, top → bottom (default)
  | "wipe-up"     // clip reveal, bottom → top
  | "wipe-left"   // clip reveal, right → left
  | "wipe-right"  // clip reveal, left → right
  | "venetian"    // clip opens from the horizontal center line
  | "barn"        // clip opens from the vertical center line
  | "iris"        // circle collapses to the center
  | "iris-corner" // circle collapses toward the top edge
  | "lift"        // whole panel slides up
  | "drop"        // whole panel slides down
  | "slide-left"  // whole panel slides left
  | "slide-right" // whole panel slides right
  | "zoom"        // panel scales up + fades
  | "diagonal"    // clip collapses to the top-right corner
  | "split-v"     // two halves part vertically
  | "split-h"     // two halves part horizontally
  | "blinds"      // vertical strips drop in sequence
  | "two-tone";   // accent panel trails the main panel

// Returns the curtain's motion node(s) for the given variant. Lives inside the
// loader's <AnimatePresence>, so each node's `exit` drives the reveal.
function curtainNodes(variant: CurtainVariant) {
  const clip = (exit: string, dur = 1.05) => (
    <motion.div
      key="c"
      className={styles.loader}
      initial={{ clipPath: "inset(0 0 0 0)" }}
      exit={{ clipPath: exit }}
      transition={{ clipPath: { duration: dur, ease: curtainEase } }}
    />
  );
  const xform = (exit: TargetAndTransition, dur = 1.0) => (
    <motion.div key="c" className={styles.loader} exit={exit} transition={{ duration: dur, ease: curtainEase }} />
  );
  const circle = (exit: string) => (
    <motion.div
      key="c"
      className={styles.loader}
      initial={{ clipPath: "circle(150% at 50% 50%)" }}
      exit={{ clipPath: exit }}
      transition={{ clipPath: { duration: 1.1, ease: curtainEase } }}
    />
  );

  switch (variant) {
    case "wipe-down":   return clip("inset(100% 0 0 0)");
    case "wipe-up":     return clip("inset(0 0 100% 0)");
    case "wipe-left":   return clip("inset(0 0 0 100%)");
    case "wipe-right":  return clip("inset(0 100% 0 0)");
    case "venetian":    return clip("inset(50% 0 50% 0)");
    case "barn":        return clip("inset(0 50% 0 50%)");
    case "iris":        return circle("circle(0% at 50% 50%)");
    case "iris-corner": return circle("circle(0% at 50% 0%)");
    case "lift":        return xform({ y: "-100%" });
    case "drop":        return xform({ y: "100%" });
    case "slide-left":  return xform({ x: "-100%" });
    case "slide-right": return xform({ x: "100%" });
    case "zoom":        return xform({ scale: 1.12, opacity: 0 }, 0.75);
    case "diagonal":
      return (
        <motion.div
          key="c"
          className={styles.loader}
          initial={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
          exit={{ clipPath: "polygon(100% 0, 100% 0, 100% 0, 100% 0)" }}
          transition={{ clipPath: { duration: 1.05, ease: curtainEase } }}
        />
      );
    case "split-v":
      return [
        <motion.div key="t" className={`${styles.curtainHalf} ${styles.curtainHalfTop}`}    exit={{ y: "-100%" }} transition={{ duration: 1.0, ease: curtainEase }} />,
        <motion.div key="b" className={`${styles.curtainHalf} ${styles.curtainHalfBottom}`} exit={{ y: "100%" }}  transition={{ duration: 1.0, ease: curtainEase }} />,
      ];
    case "split-h":
      return [
        <motion.div key="l" className={`${styles.curtainHalfV} ${styles.curtainHalfLeft}`}  exit={{ x: "-100%" }} transition={{ duration: 1.0, ease: curtainEase }} />,
        <motion.div key="r" className={`${styles.curtainHalfV} ${styles.curtainHalfRight}`} exit={{ x: "100%" }}  transition={{ duration: 1.0, ease: curtainEase }} />,
      ];
    case "blinds":
      return Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={i}
          className={styles.curtainStrip}
          style={{ left: `${(i * 100) / 6}%`, width: `${100 / 6}%` }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.7, ease: curtainEase, delay: i * 0.08 }}
        />
      ));
    case "two-tone":
      return [
        <motion.div
          key="accent"
          className={styles.loader}
          style={{ background: "var(--text)", zIndex: 9998 }}
          initial={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: "inset(100% 0 0 0)" }}
          transition={{ clipPath: { duration: 1.05, ease: curtainEase, delay: 0.12 } }}
        />,
        <motion.div
          key="main"
          className={styles.loader}
          initial={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: "inset(100% 0 0 0)" }}
          transition={{ clipPath: { duration: 1.05, ease: curtainEase } }}
        />,
      ];
    default:
      return null;
  }
}

export default function Loader({ curtain = "wipe-down" }: { curtain?: CurtainVariant }) {
  const [lifted, setLifted] = useState(false); // curtain wipes away, counter dissolves
  const [gone, setGone] = useState(false);      // stage unmounted

  const count   = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));

  useEffect(() => {
    const start = performance.now();
    let finished = false;
    let maxId = 0;

    // ease toward 90% while we wait for the real page load; the final 10% is
    // reserved for the moment load actually fires
    const ctrl = animate(count, 90, { duration: MIN_MS / 1000, ease });

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(maxId);
      animate(count, 100, {
        duration: 0.4,
        ease,
        onComplete: () => {
          setLifted(true);                                  // curtain + counter exit
          window.setTimeout(markLoaderReady, 100);          // hand off shortly after
                                                            // the curtain starts wiping
                                                            // so the hero intro is
                                                            // revealed mid-animation
          window.setTimeout(() => setGone(true), 700);      // unmount once dissolved
        },
      });
    };

    // complete once the page has loaded, but never before MIN_MS has elapsed
    const onReady = () => {
      window.setTimeout(finish, Math.max(0, MIN_MS - (performance.now() - start)));
    };

    maxId = window.setTimeout(finish, MAX_MS);

    if (document.readyState === "complete") onReady();
    else window.addEventListener("load", onReady, { once: true });

    return () => {
      ctrl.stop();
      window.clearTimeout(maxId);
      window.removeEventListener("load", onReady);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Curtain — exit animation chosen by the `curtain` prop */}
      <AnimatePresence>{!lifted && curtainNodes(curtain)}</AnimatePresence>

      {/* Stage — big counter */}
      <AnimatePresence>
        {!gone && (
          <motion.div
            className={styles.loaderStage}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease }}
          >
            <motion.div
              className={styles.loaderCount}
              initial={{ opacity: 0, filter: "blur(14px)", y: 24 }}
              animate={
                lifted
                  ? { opacity: 0, filter: "blur(12px)", scale: 1.18, y: -14 }
                  : { opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }
              }
              transition={{ duration: lifted ? 0.5 : 0.7, ease, delay: lifted ? 0 : 0.15 }}
            >
              <motion.span>{rounded}</motion.span>
              <span className={styles.loaderPercent}>%</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
