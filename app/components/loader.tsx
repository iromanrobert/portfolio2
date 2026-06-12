"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";
import styles from "../page.module.css";

const ease = [0.25, 1, 0.5, 1] as [number, number, number, number];

export default function Loader() {
  const [done, setDone] = useState(false);

  const count   = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));

  useEffect(() => {
    const ctrl = animate(count, 100, {
      duration: 2.2,
      ease,
      onComplete: () => setDone(true),
    });

    return ctrl.stop;
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
