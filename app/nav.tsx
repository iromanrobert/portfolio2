"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedLink from "./components/animated-link";
import styles from "./page.module.css";

const links = [
  { href: "#projects",   label: "Projects"   },
  { href: "#experience", label: "Experience" },
  { href: "#contact",    label: "Contact"    },
];

const ease = [0.25, 1, 0.5, 1] as [number, number, number, number];

const overlayVariants = {
  hidden:  { clipPath: "circle(0% at 100% 0%)" },
  visible: { clipPath: "circle(150% at 100% 0%)", transition: { duration: 0.85, ease } },
  exit:    { clipPath: "circle(0% at 100% 0%)", transition: { duration: 0.5, ease } },
};

const listVariants = {
  hidden:  { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export default function Nav() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const header = document.querySelector("header");
    const onScroll = () => {
      header?.setAttribute("data-scrolled", String(window.scrollY > 10));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers = links.map(({ href }) => {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (!el) return null;

      const io = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(href); },
        { rootMargin: "0px 0px -50% 0px", threshold: 0 },
      );
      io.observe(el);
      return io;
    });

    return () => observers.forEach(io => io?.disconnect());
  }, []);

  // Drive the header's "menu open" visual state, and lock the page in
  // place while the overlay is open. Plain `overflow: hidden` on body
  // doesn't reliably stop touch-scrolling on mobile, so we pin the body
  // at its current scroll offset and restore it on close.
  useEffect(() => {
    const header = document.querySelector("header");
    header?.setAttribute("data-menu-open", String(open));
    if (!open) return;

    const { body } = document;
    const scrollY = window.scrollY;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";

    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);

    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className={styles.navGroup}>
        <nav className={styles.nav} aria-label="Primary">
          {links.map(({ href, label }) => (
            <AnimatedLink
              key={href}
              href={href}
              className={`${styles.navLink} ${active === href ? styles.navLinkActive : active ? styles.navLinkDim : ""}`}
            >
              {label}
            </AnimatedLink>
          ))}
        </nav>

        <motion.button
          type="button"
          className={styles.navToggle}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(true)}
        >
          <span className={styles.navToggleLine} style={{ transform: "translateY(-4px)" }} />
          <span className={styles.navToggleLine} style={{ transform: "translateY(4px)" }} />
        </motion.button>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-nav"
              className={styles.navOverlay}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div className={styles.navOverlayHead} variants={itemVariants}>
                <a
                  href="#top"
                  className={styles.navOverlayLogo}
                  aria-label="Roman Robert — home"
                  onClick={() => setOpen(false)}
                >
                  <Image src="/romanrobert.svg" alt="Roman Robert" width={100} height={14} />
                </a>

                <motion.button
                  type="button"
                  className={styles.navOverlayClose}
                  aria-label="Close menu"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.navOverlayCloseLine} />
                  <span className={styles.navOverlayCloseLine} />
                </motion.button>
              </motion.div>

              <motion.ul
                className={styles.navOverlayList}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {links.map(({ href, label }, i) => (
                  <motion.li key={href} className={styles.navOverlayItem} variants={itemVariants}>
                    <motion.a
                      href={href}
                      className={`${styles.navOverlayLink} ${active === href ? styles.navOverlayLinkActive : ""}`}
                      whileTap={{ x: 12 }}
                      transition={{ duration: 0.2, ease }}
                      onClick={() => setOpen(false)}
                    >
                      <span className={styles.navOverlayNum}>{String(i + 1).padStart(2, "0")}</span>
                      {label}
                    </motion.a>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div className={styles.navOverlayFoot} variants={itemVariants}>
                <span className={styles.aboutMetaItem}>
                  <span className={styles.aboutMetaKey}>Email</span>
                  <a href="mailto:hello@romanrobert.com" className={styles.navOverlayEmail}>
                    hello@romanrobert.com
                  </a>
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
