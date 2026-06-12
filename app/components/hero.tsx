"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import Clock from "../clock";
import ProjectsCanvas from "./projects-canvas";
import { projects, projectImages, num } from "./projects-data";
import styles from "../page.module.css";

/* Hero with the work merged in — balanced φ 2-col: copy + info LEFT, selected
   work RIGHT. One `variant` prop swaps how the work reads:
     "carousel" → editorial card carousel (rhymes with the Services carousel)
     "featured" → one large glitch preview (ProjectsCanvas) + name switcher */

export type HeroVariant = "carousel" | "featured" | "index" | "filmstrip" | "ghost";

const TITLE = "Your design deserves code that keeps up.";
const LEAD =
  "I build the fast, accessible front end behind storefronts, CMS sites, and complex flows — so what your users see matches what your designers drew, pixel for pixel.";
const LOCATION = "Cluj‑Napoca, Romania";

const STATS = [
  { num: "3+", label: "Years of experience" },
  { num: "10+", label: "Storefronts shipped" },
] as const;

const EASE = [0.25, 1, 0.5, 1] as [number, number, number, number];
const slideSpring = { type: "spring" as const, stiffness: 260, damping: 38, mass: 1 };

const stagger = (reduce: boolean): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: reduce ? 0 : 0.07, delayChildren: reduce ? 0 : 0.04 } },
});

const item = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 14 },
  visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.25 : 0.55, ease: EASE } },
});

// ── copy column (constant) ──────────────────────────────────────────────────
function Copy({ reduce }: { reduce: boolean }) {
  return (
    <motion.div className={styles.hxCopy} variants={stagger(reduce)} initial="hidden" animate="visible">
      <motion.span className={styles.hxAvail} variants={item(reduce)}>
        <span className={styles.hxAvailDot} aria-hidden="true" />
        Available for work
      </motion.span>
      <motion.h1 className={styles.hxTitle} variants={item(reduce)}>{TITLE}</motion.h1>
      <motion.p className={styles.hxLead} variants={item(reduce)}>{LEAD}</motion.p>
      <motion.div className={styles.hxCtas} variants={item(reduce)}>
        <a href="#contact" className={styles.hxCtaPrimary}>Get in touch</a>
        <a href="#experience" className={styles.hxCtaGhost}>See experience</a>
      </motion.div>
      <motion.div className={styles.hxCopyMeta} variants={item(reduce)}>
        <div className={styles.hxStats}>
          {STATS.map((s) => (
            <div key={s.num} className={styles.hxStat}>
              <span className={styles.hxStatNum}>{s.num}</span>
              <span className={styles.hxStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
        <span className={styles.hxMeta}>{LOCATION}&nbsp;·&nbsp;<Clock /></span>
      </motion.div>
    </motion.div>
  );
}

function WorkHead({ children }: { children?: React.ReactNode }) {
  return (
    <div className={styles.hxWorkHead}>
      <span className={styles.hxWorkLabel}>Selected work</span>
      {children}
    </div>
  );
}

// ── variant: CAROUSEL — editorial card carousel ─────────────────────────────
function CarouselHero({ reduce }: { reduce: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  const scroll = (dir: 1 | -1) => {
    const inner = innerRef.current;
    const track = trackRef.current;
    if (!inner || !track) return;
    const card = inner.querySelector<HTMLElement>("[data-card]");
    const gap = parseFloat(getComputedStyle(inner).columnGap || "0") || 0;
    const step = card ? card.offsetWidth + gap : 280;
    const max = Math.max(0, inner.scrollWidth - track.clientWidth);
    setOffset((prev) => Math.min(max, Math.max(0, prev + dir * step)));
  };

  return (
    <section className={`${styles.hero} ${styles.hxWork} ${styles.hxCarousel}`}>
      <Copy reduce={reduce} />

      <motion.div
        className={styles.hxWorkPanel}
        id="projects"
        variants={item(reduce)}
        initial="hidden"
        animate="visible"
      >
        <WorkHead>
          <div className={styles.hxWorkNav}>
            <button type="button" className={styles.hxWorkNavBtn} aria-label="Previous work" onClick={() => scroll(-1)}>←</button>
            <button type="button" className={styles.hxWorkNavBtn} aria-label="Next work" onClick={() => scroll(1)}>→</button>
          </div>
        </WorkHead>

        <div className={styles.hxCarTrack} ref={trackRef}>
          <motion.div className={styles.hxCarInner} ref={innerRef} animate={{ x: -offset }} transition={slideSpring}>
            {projects.map((p, i) => (
              <article key={p.name} data-card className={styles.hxCard}>
                <div className={styles.hxCardImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt={p.name} draggable={false} />
                </div>
                <div className={styles.hxCardMeta}>
                  <span className={styles.hxCardName}>{p.name}</span>
                  <span className={styles.hxCardTag}>{p.tag}</span>
                  <span className={styles.hxCardNum}>{num(i)}</span>
                </div>
              </article>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ── variant: FEATURED — one large glitch preview + name switcher ────────────
function FeaturedHero({ reduce }: { reduce: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <section className={`${styles.hero} ${styles.hxWork} ${styles.hxFeatured}`}>
      <Copy reduce={reduce} />

      <motion.div
        className={styles.hxWorkPanel}
        id="projects"
        variants={item(reduce)}
        initial="hidden"
        animate="visible"
      >
        <WorkHead />
        <div className={styles.hxFeatureMedia} aria-hidden="true">
          <ProjectsCanvas images={projectImages} active={active} effect="wave-glitch" />
        </div>
        <div className={styles.hxFeatureBar}>
          <span className={styles.hxFeatureName}>{projects[active].name}</span>
          <span className={styles.hxFeatureTag}>{projects[active].tag}</span>
        </div>
        <ol className={styles.hxSwitch}>
          {projects.map((p, i) => (
            <li key={p.name}>
              <button
                type="button"
                className={styles.hxSwitchBtn}
                data-active={active === i}
                aria-pressed={active === i}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <span className={styles.hxNameIndex}>{num(i)}</span>
                {p.name}
              </button>
            </li>
          ))}
        </ol>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   V2 variants — off-axis editorial (golden 19% offset + side label), rhyming
   with the Services offset and the Experience roster/stage. Shared copy + meta.
   ════════════════════════════════════════════════════════════════════════════ */

// title + lead + CTAs (the "Available for work" pill already lives in the
// page's fixed left-edge badge — no duplicate here)
function Intro({ reduce }: { reduce: boolean }) {
  return (
    <motion.div className={styles.h2Copy} variants={stagger(reduce)} initial="hidden" animate="visible">
      <motion.h1 className={styles.h2Title} variants={item(reduce)}>{TITLE}</motion.h1>
      <motion.p className={styles.h2Lead} variants={item(reduce)}>{LEAD}</motion.p>
      <motion.div className={styles.hxCtas} variants={item(reduce)}>
        <a href="#contact" className={styles.hxCtaPrimary}>Get in touch</a>
        <a href="#experience" className={styles.hxCtaGhost}>See experience</a>
      </motion.div>
    </motion.div>
  );
}

function MetaRow({ reduce }: { reduce: boolean }) {
  return (
    <motion.div className={styles.h2Meta} variants={item(reduce)} initial="hidden" animate="visible">
      <div className={styles.hxStats}>
        {STATS.map((s) => (
          <div key={s.num} className={styles.hxStat}>
            <span className={styles.hxStatNum}>{s.num}</span>
            <span className={styles.hxStatLabel}>{s.label}</span>
          </div>
        ))}
      </div>
      <span className={styles.hxMeta}>{LOCATION}&nbsp;·&nbsp;<Clock /></span>
    </motion.div>
  );
}

function SideLabel() {
  return <span className={`${styles.sideLabel} ${styles.h2Label}`}>Selected work</span>;
}

// ── variant A: INDEX — vertical name index (wipe-fill) + one big swapping preview ──
function IndexHero({ reduce }: { reduce: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <section className={`${styles.hero2} ${styles.hi}`} id="projects">
      <SideLabel />
      <Intro reduce={reduce} />

      <div className={styles.hiBody}>
        <ol className={styles.hiList}>
          {projects.map((p, i) => (
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
          {projects.map((p, i) => (
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

      <MetaRow reduce={reduce} />
    </section>
  );
}

// ── variant B: FILMSTRIP — canon-composed hero, full-height 50vw work panel ──
// Composition follows the Van de Graaf canon (asymmetric 1/9·2/9 margins).
// Depth: elevated panel (cast shadow) + layered light/vignette + parallax —
// the image drifts slower than the carousel scroll, and the copy rides a
// shallower plane than the panel as the page scrolls. All disabled on reduce.
function FilmstripHero({ reduce }: { reduce: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<(HTMLElement | null)[]>([]);
  const imgsRef = useRef<(HTMLImageElement | null)[]>([]);
  const rafRef = useRef(0);
  const [active, setActive] = useState(0);

  // page-scroll plane offset — copy rides a shallower plane than the panel
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -64]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.25]);

  const goTo = (i: number) => {
    tilesRef.current[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  const step = (dir: 1 | -1) => goTo(Math.min(projects.length - 1, Math.max(0, active + dir)));

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  };

  // active = tile nearest panel centre; image parallaxes against its offset
  const measure = () => {
    const strip = stripRef.current;
    if (!strip) return;
    const panelH = strip.clientHeight;
    const mid = strip.scrollTop + panelH / 2;
    let best = 0;
    let bestDist = Infinity;
    tilesRef.current.forEach((t, i) => {
      if (!t) return;
      const dist = t.offsetTop + t.offsetHeight / 2 - mid;
      if (Math.abs(dist) < bestDist) { bestDist = Math.abs(dist); best = i; }
      const img = imgsRef.current[i];
      if (img && !reduce) {
        const frac = Math.max(-1, Math.min(1, dist / panelH));
        img.style.transform = `translateY(${(-frac * 16).toFixed(2)}%) scale(1.36)`;
      }
    });
    setActive(best);
  };

  const onScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      measure();
    });
  };

  useEffect(() => {
    measure();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={`${styles.hero2} ${styles.hf}`} id="projects" ref={sectionRef}>
      <motion.div className={styles.hfLeft} style={{ y: copyY, opacity: copyOpacity }}>
        <Intro reduce={reduce} />
        <MetaRow reduce={reduce} />
      </motion.div>

      <div className={styles.hfPanel}>
        <span className={`${styles.sideLabel} ${styles.hfPanelLabel}`}>Selected work</span>

        <div className={styles.hfStrip} ref={stripRef} onScroll={onScroll}>
          {projects.map((p, i) => (
            <article
              key={p.name}
              ref={(el) => { tilesRef.current[i] = el; }}
              className={styles.hfTile}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.name}
                draggable={false}
                ref={(el) => { imgsRef.current[i] = el; }}
              />
              <div className={styles.hfTileMeta}>
                <span className={styles.hfTileName}>{p.name}</span>
                <span className={styles.hfTileTag}>{p.tag}</span>
              </div>
            </article>
          ))}
        </div>

        <nav className={styles.hfDots} aria-label="Selected work" onKeyDown={onKeyNav}>
          <button
            type="button"
            className={styles.hfChevron}
            aria-label="Previous work"
            onClick={() => step(-1)}
            disabled={active === 0}
          >
            ↑
          </button>
          {projects.map((p, i) => (
            <button
              key={p.name}
              type="button"
              className={styles.hfDot}
              data-active={active === i}
              aria-current={active === i}
              aria-label={`View ${p.name}`}
              onClick={() => goTo(i)}
            >
              {num(i)}
            </button>
          ))}
          <button
            type="button"
            className={styles.hfChevron}
            aria-label="Next work"
            onClick={() => step(1)}
            disabled={active === projects.length - 1}
          >
            ↓
          </button>
        </nav>
      </div>
    </section>
  );
}

// ── variant C: GHOST — colossal off-canvas index numeral behind a big preview ──
function GhostHero({ reduce }: { reduce: boolean }) {
  const [sel, setSel] = useState(0);
  const p = projects[sel];

  const stage: Variants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } }, exit: { opacity: 0, transition: { duration: 0.12 } } }
    : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, ease: EASE, staggerChildren: 0.07, delayChildren: 0.08 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      };

  const ghost: Variants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
        visible: { opacity: 1, clipPath: "inset(0 0 0% 0)", transition: { duration: 0.8, ease: EASE } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      };

  const itm: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.6, ease: EASE } },
  };

  return (
    <section className={`${styles.hero2} ${styles.hg}`} id="projects">
      <div className={styles.hgLeft}>
        <SideLabel />
        <Intro reduce={reduce} />
        <ol className={styles.hgIndex}>
          {projects.map((proj, i) => (
            <li key={proj.name}>
              <button
                type="button"
                className={styles.hgItem}
                data-active={sel === i}
                aria-pressed={sel === i}
                onPointerEnter={() => setSel(i)}
                onFocus={() => setSel(i)}
                onClick={() => setSel(i)}
              >
                <span className={styles.hgItemNum}>{num(i)}</span>
                <span className={styles.hgItemName}>{proj.name}</span>
              </button>
            </li>
          ))}
        </ol>
        <MetaRow reduce={reduce} />
      </div>

      <div className={styles.hgStage}>
        <AnimatePresence mode="wait">
          <motion.div key={sel} className={styles.hgStageInner} initial="hidden" animate="visible" exit="exit">
            <motion.span className={styles.hgGhost} aria-hidden="true" variants={ghost}>
              {num(sel)}
            </motion.span>
            <motion.div className={styles.hgMedia} variants={stage}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} draggable={false} />
            </motion.div>
            <motion.div className={styles.hgBar} variants={itm}>
              <span className={styles.hgName}>{p.name}</span>
              <span className={styles.hgTag}>{p.tag}</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default function Hero({ variant = "index" }: { variant?: HeroVariant }) {
  const reduce = useReducedMotion() ?? false;
  if (variant === "featured") return <FeaturedHero reduce={reduce} />;
  if (variant === "carousel") return <CarouselHero reduce={reduce} />;
  if (variant === "filmstrip") return <FilmstripHero reduce={reduce} />;
  if (variant === "ghost") return <GhostHero reduce={reduce} />;
  return <IndexHero reduce={reduce} />;
}
