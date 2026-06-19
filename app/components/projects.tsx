"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { projects, num, type Project } from "./projects-data";
import styles from "../page.module.css";

/* Dedicated projects section — echoes the hero's bento language (rounded
   --bg-elev tiles, caption scrim, 01/02 index, hover-lift). One `variant`
   prop swaps the composition:
     "grid"  → plain equal 2×2                                ← default
     "bento" → one tall flagship (φ-major) + a 3-stack rail
     "index" → vertical name index (wipe-fill) + swapping preview
   Shows four projects, flagship (Urbanlab) first. */
export type ProjectsVariant = "grid" | "bento" | "index";

const FEATURED: Project[] = [projects[2], projects[0], projects[1], projects[3]];

const EASE = [0.25, 1, 0.5, 1] as [number, number, number, number];

const stagger = (reduce: boolean): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: reduce ? 0 : 0.05 } },
});

const tileIn = (reduce: boolean): Variants =>
  reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.25 } } }
    : {
        hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
      };

const reveal = {
  initial: "hidden" as const,
  whileInView: "visible" as const,
  viewport: { once: true, amount: 0.2 },
};

function Tile({ p, i, reduce, className }: { p: Project; i: number; reduce: boolean; className?: string }) {
  return (
    <motion.article
      className={`${styles.prTile} ${className ?? ""}`.trim()}
      variants={tileIn(reduce)}
      whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.25, ease: EASE } }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.image} alt={p.name} className={styles.prTileImg} draggable={false} />
      <span className={styles.prTileNum}>{num(i)}</span>
      <div className={styles.prTileBar}>
        <span className={styles.prTileName}>{p.name}</span>
        <span className={styles.prTileTag}>{p.tag}</span>
      </div>
    </motion.article>
  );
}

// ── variant: BENTO — flagship + 3-stack rail ──
function BentoProjects({ reduce }: { reduce: boolean }) {
  return (
    <motion.div className={styles.prBento} variants={stagger(reduce)} {...reveal}>
      <Tile p={FEATURED[0]} i={0} reduce={reduce} className={styles.prBentoFeature} />
      <div className={styles.prBentoRail}>
        {FEATURED.slice(1).map((p, idx) => (
          <Tile key={p.name} p={p} i={idx + 1} reduce={reduce} />
        ))}
      </div>
    </motion.div>
  );
}

// ── variant: GRID — plain equal grid (4×2, all eight) ──
function GridProjects({ reduce }: { reduce: boolean }) {
  return (
    <motion.div className={styles.prGrid} variants={stagger(reduce)} {...reveal}>
      {projects.map((p, i) => (
        <Tile key={p.name} p={p} i={i} reduce={reduce} />
      ))}
    </motion.div>
  );
}

// ── variant: INDEX — name index + swapping preview (reuses the hero .hi* styles) ──
function IndexProjects() {
  const [active, setActive] = useState(0);
  return (
    <div className={styles.hiBody}>
      <ol className={styles.hiList}>
        {FEATURED.map((p, i) => (
          <li key={p.name}>
            <button
              type="button"
              className={styles.hiRow}
              data-active={active === i}
              aria-pressed={active === i}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <span className={styles.hiIndex}>{num(i)}</span>
              <span className={styles.hiName}>
                <span className={styles.hiNameBase}>{p.name}</span>
                <span className={styles.hiNameFill} aria-hidden="true">{p.name}</span>
              </span>
              <span className={styles.hiTag}>{p.tag}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.hiPreview} aria-hidden="true">
        {FEATURED.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.name}
            src={p.image}
            alt=""
            className={styles.hiPreviewImg}
            data-active={active === i}
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}

export default function Projects({ variant = "bento" }: { variant?: ProjectsVariant }) {
  const reduce = useReducedMotion() ?? false;
  const count = variant === "grid" ? projects.length : FEATURED.length;
  return (
    <section className={styles.prSection} id="work">
      <div className={styles.prHead}>
        <h2 className={styles.prTitle}>Selected work</h2>
        <span className={styles.prCount}>{String(count).padStart(2, "0")} projects</span>
      </div>

      {variant === "bento" ? (
        <BentoProjects reduce={reduce} />
      ) : variant === "index" ? (
        <IndexProjects />
      ) : (
        <GridProjects reduce={reduce} />
      )}
    </section>
  );
}
