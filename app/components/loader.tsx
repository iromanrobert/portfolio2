"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";
import styles from "../page.module.css";
import { markLoaderReady } from "./loader-ready";

const ease = [0.25, 1, 0.5, 1] as [number, number, number, number];

const MIN_MS = 1800; // minimum on-screen time — avoids a flash on fast/cached loads
const MAX_MS = 7000; // hard cap — a stalled asset never traps the user on the loader

export default function Loader() {
  const [done, setDone] = useState(false);

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
          setDone(true);
          // hand off before the curtain fully clears (exit is 1.4s) so the hero
          // intro is cresting as the overlay lifts, not after it
          window.setTimeout(markLoaderReady, 950);
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
    <AnimatePresence>
      {!done && (
        <motion.div
          className={styles.loader}
          initial={{ clipPath: "circle(150% at 50% 50%)" }}
          exit={{ clipPath: "circle(35vh at 50% -30%)", opacity: 0 }}
          transition={{
            clipPath: { duration: 1.4, ease },
            opacity:   { duration: 0.1, delay: 0.7 },
          }}
        >
          <div className={styles.loaderInner}>
            {/* Logo — drawn left to right via clip-path */}
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1.8, ease, delay: 0.15 }}
            >
              <Image
                src="/romanrobert.svg"
                alt="Roman Robert"
                width={444}
                height={60}
                priority
                className={styles.loaderLogo}
              />
            </motion.div>

            {/* Counter — below logo */}
            <motion.span
              className={styles.loaderCount}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              {rounded}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
