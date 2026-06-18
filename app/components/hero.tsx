"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import Clock from "../clock";
import ProjectsCanvas from "./projects-canvas";
import { projects, projectImages, num } from "./projects-data";
import { onLoaderReady } from "./loader-ready";
import styles from "../page.module.css";

/* Hero with the work merged in — balanced φ 2-col: copy + info LEFT, selected
   work RIGHT. One `variant` prop swaps how the work reads:
     "carousel" → editorial card carousel (rhymes with the Services carousel)
     "featured" → one large glitch preview (ProjectsCanvas) + name switcher */

export type HeroVariant = "carousel" | "featured" | "index" | "filmstrip" | "ghost" | "bento";
// bento entrance characters — swap via the `anim` prop to compare them live
export type BentoAnim = "rise" | "scale" | "blur" | "wipe";

const TITLE = "Frontend Developer";
const LEAD =
  "Storefronts, e-commerce, SaaS interfaces, landing pages, and the CMS behind them.";
const LOCATION = "Cluj‑Napoca, Romania";

const STATS = [
  { num: "4+", label: "Years of experience" },
  { num: "15+", label: "Projects shipped" },
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

// ── bento: per-cell entrance character (swapped by the `anim` prop) ──────────
// Each returns the same hidden/visible contract so the grid's stagger drives any
// of them. Reduced-motion collapses every character to a plain opacity fade.
const cell = (anim: BentoAnim, reduce: boolean): Variants => {
  if (reduce) return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.25 } } };
  switch (anim) {
    case "scale": // pop from 0.96 with a spring settle — tactile, physical
      return {
        hidden: { opacity: 0, scale: 0.96 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 110, damping: 20, mass: 1.1 } },
      };
    case "blur": // fade from soft blur + slight rise — atmospheric depth
      return {
        hidden: { opacity: 0, y: 16, filter: "blur(14px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.1, ease: EASE } },
      };
    case "wipe": // top-down clip-path reveal — architectural, deliberate
      return {
        hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
        visible: { opacity: 1, clipPath: "inset(0 0 0% 0)", transition: { duration: 1.1, ease: EASE } },
      };
    case "rise": // fade + travel up — clean editorial cadence (default)
    default:
      return {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
      };
  }
};

const bentoStagger = (reduce: boolean): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: reduce ? 0 : 0.14, delayChildren: reduce ? 0 : 0.1 } },
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

// ── variant B: FILMSTRIP — full-height 50vw work panel, transform-track slider ──
// The carousel is a translateY track (CSS transition), NOT native scroll — so the
// transition is a guaranteed smooth SLIDE that snap can't hijack into a jump.
// The image rides a slightly slower plane than the track (parallax-on-slide).
// Wheel/keys/touch/dots all just set the active index; autoplay ping-pongs.
const SCROLL_MS = 900;        // slide duration (ms) — higher = slower
const AUTO_MS = 4200;         // autoplay dwell per card (ms) — higher = slower
const AUTO_COOLDOWN = 9000;   // pause autoplay this long after a manual nudge (ms)
const SLIDE_PARALLAX = 0;     // % the image lags the slide (depth); 0 = no parallax
const SLIDE_SCALE = 1;        // overscan to cover the lag (≥ 1 + 2·PARALLAX/100); 1 = no zoom
const SLIDE_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

function FilmstripHero({ reduce }: { reduce: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);
  const activeRef = useRef(0);
  const hoverRef = useRef(false);    // autoplay paused while pointer/focus is inside
  const resumeAtRef = useRef(0);     // autoplay paused until this timestamp (manual nudge)
  const dirRef = useRef(1);          // autoplay direction (ping-pong)
  const touchRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const last = projects.length - 1;

  // page-scroll plane offset — copy rides a shallower plane than the panel
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -64]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.25]);

  const nudge = () => { resumeAtRef.current = performance.now() + AUTO_COOLDOWN; };

  const goTo = (i: number) => {
    const c = Math.min(last, Math.max(0, i));
    activeRef.current = c;
    setActive(c);
  };
  const step = (dir: 1 | -1) => goTo(activeRef.current + dir);

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); nudge(); step(1); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); nudge(); step(-1); }
  };

  // touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchRef.current = e.touches[0].clientY; nudge(); };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchRef.current == null) return;
    const dy = e.changedTouches[0].clientY - touchRef.current;
    if (Math.abs(dy) > 40) step(dy < 0 ? 1 : -1);
    touchRef.current = null;
  };

  // route the mouse wheel into one slide per gesture; release at the ends
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp || reduce) return;
    const onWheel = (e: WheelEvent) => {
      const down = e.deltaY > 0;
      if ((down && activeRef.current === last) || (!down && activeRef.current === 0)) return;
      e.preventDefault();
      if (wheelLockRef.current || Math.abs(e.deltaY) < 4) return;
      wheelLockRef.current = true;
      nudge();
      step(down ? 1 : -1);
      window.setTimeout(() => { wheelLockRef.current = false; }, SCROLL_MS);
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // autoplay — ping-pong; idle while hovered/focused, in cooldown, or tab hidden
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      if (hoverRef.current || document.hidden || performance.now() < resumeAtRef.current) return;
      let next = activeRef.current + dirRef.current;
      if (next > last) { dirRef.current = -1; next = activeRef.current - 1; }
      else if (next < 0) { dirRef.current = 1; next = activeRef.current + 1; }
      goTo(next);
    }, AUTO_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const slideT = reduce ? undefined : `transform ${SCROLL_MS}ms ${SLIDE_EASE}`;

  return (
    <section className={`${styles.hero2} ${styles.hf}`} id="projects" ref={sectionRef}>
      <motion.div className={styles.hfLeft} style={{ y: copyY, opacity: copyOpacity }}>
        <motion.div className={styles.h2Copy} variants={stagger(reduce)} initial="hidden" animate="visible">
          <motion.h1 className={styles.h2Title} variants={item(reduce)}>{TITLE}</motion.h1>
          <motion.div className={styles.hxCtas} variants={item(reduce)}>
            <a href="#contact" className={styles.hxCtaPrimary}>Get in touch</a>
            <a href="#experience" className={styles.hxCtaGhost}>See experience</a>
          </motion.div>
        </motion.div>

        <motion.div className={styles.hfFoot} variants={item(reduce)} initial="hidden" animate="visible">
          <p className={styles.h2Lead}>{LEAD}</p>
          <div className={styles.h2Meta}>
            <div className={styles.hxStats}>
              {STATS.map((s) => (
                <div key={s.num} className={styles.hxStat}>
                  <span className={styles.hxStatNum}>{s.num}</span>
                  <span className={styles.hxStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
            <span className={styles.hxMeta}>{LOCATION}&nbsp;·&nbsp;<Clock /></span>
          </div>
        </motion.div>
      </motion.div>

      <div
        className={styles.hfPanel}
        onPointerEnter={() => { hoverRef.current = true; }}
        onPointerLeave={() => { hoverRef.current = false; }}
        onPointerDown={nudge}
        onFocusCapture={() => { hoverRef.current = true; }}
        onBlurCapture={() => { hoverRef.current = false; }}
      >
        <span className={`${styles.sideLabel} ${styles.hfPanelLabel}`}>Selected work</span>

        <div
          className={styles.hfViewport}
          ref={viewportRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={styles.hfTrack}
            style={{ transform: `translateY(${-active * 100}%)`, transition: slideT }}
          >
            {projects.map((p, i) => (
              <article key={p.name} className={styles.hfTile}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  draggable={false}
                  style={
                    reduce
                      ? undefined
                      : {
                          transform: `translateY(${(active - i) * SLIDE_PARALLAX}%) scale(${SLIDE_SCALE})`,
                          transition: `transform ${SCROLL_MS}ms ${SLIDE_EASE}`,
                        }
                  }
                />
                <div className={styles.hfTileMeta}>
                  <span className={styles.hfTileName}>{p.name}</span>
                  <span className={styles.hfTileTag}>{p.tag}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <nav className={styles.hfDots} aria-label="Selected work" onKeyDown={onKeyNav}>
          <button
            type="button"
            className={styles.hfChevron}
            aria-label="Previous work"
            onClick={() => { nudge(); step(-1); }}
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
              onClick={() => { nudge(); goTo(i); }}
            >
              {num(i)}
            </button>
          ))}
          <button
            type="button"
            className={styles.hfChevron}
            aria-label="Next work"
            onClick={() => { nudge(); step(1); }}
            disabled={active === last}
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

// ── variant D: BENTO — product identity + statement headline + φ bento grid ──
// Adapted from the reference portfolio: a top identity card (avatar · name ·
// role), an inviting statement headline, and a bento grid. The big media tile
// hover-swaps through projects; the process card rhymes with the rest of the
// site's Launch→Feedback→Refine cadence.
const PROCESS = ["Build", "Ship", "Refine"] as const;

function BentoHero({ reduce, anim }: { reduce: boolean; anim: BentoAnim }) {
  const cellV = cell(anim, reduce);
  // shared hover lift on every cell — subtle, never on the headline
  const hover = reduce ? undefined : { y: -4, transition: { duration: 0.25, ease: EASE } };

  // hold the intro until the loader overlay has fully cleared the hero
  const [started, setStarted] = useState(false);
  useEffect(() => onLoaderReady(() => setStarted(true)), []);

  // feature image — settles in (gentle zoom-out) as the media tile reveals;
  // a child of the cell, so the grid stagger drives it. Intro only, plays once.
  const mediaImg: Variants = reduce
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { scale: 1.08 }, visible: { scale: 1, transition: { duration: 1.6, ease: EASE, delay: 0.2 } } };

  // process pills — idle Build→Ship→Refine cadence, expressed as motion
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setPhase((p) => (p + 1) % PROCESS.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <section className={`${styles.hero2} ${styles.hb}`} id="projects">
      <motion.div
        className={styles.hbInner}
        variants={stagger(reduce)}
        initial="hidden"
        animate={started ? "visible" : "hidden"}
      >
        <motion.div className={styles.hbLede} variants={cellV}>
          <h1 className={styles.h2Title}>Let&apos;s build it together.</h1>
          <div className={styles.hbActions}>
            <div className={styles.hxCtas}>
              <a href="#contact" className={styles.hxCtaPrimary}>Get in touch</a>
              <a href="#experience" className={styles.hxCtaGhost}>See experience</a>
            </div>
          </div>
        </motion.div>

        <motion.div className={styles.hbBento} variants={bentoStagger(reduce)}>
          {/* media — featured work: Urbanlab */}
          <motion.div className={`${styles.hbCell} ${styles.hbMedia}`} variants={cellV} whileHover={hover}>
            <motion.img
              src="/urbanlab.png"
              alt="Urbanlab Heritage — interactive heritage map"
              className={styles.hbMediaImg}
              draggable={false}
              variants={mediaImg}
            />
            <div className={styles.hbMediaBar}>
              <span className={styles.hbMediaName}>Urbanlab Heritage</span>
              <span className={styles.hbMediaTag}>Interactive map</span>
            </div>
          </motion.div>

          {/* craft caption */}
          <motion.div className={`${styles.hbCell} ${styles.hbCraft}`} variants={cellV} whileHover={hover}>
            <p className={styles.hbCraftText}>
              I build <strong>storefronts, multi-step flows and CMS-driven
              sites</strong> — responsive interfaces hand-coded in HTML, CSS,
              PostCSS and JavaScript, translated straight from Figma.
            </p>
          </motion.div>

          {/* stats */}
          <motion.div className={`${styles.hbCell} ${styles.hbStatsCell}`} variants={cellV} whileHover={hover}>
            <span className={styles.hbCellLabel}>By the numbers</span>
            <div className={styles.hxStats}>
              {STATS.map((s) => (
                <div key={s.num} className={styles.hxStat}>
                  <span className={styles.hxStatNum}>{s.num}</span>
                  <span className={styles.hxStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* process — Launch→Feedback→Refine cadence */}
          <motion.div className={`${styles.hbCell} ${styles.hbProcess}`} variants={cellV} whileHover={hover}>
            <div className={styles.hbProcessTop}>
              <span className={styles.hbCellLabel}>How I work</span>
              <p className={styles.hbProcessText}>
                Continuously evolving post-launch, guided by feedback to keep a
                user-focused, maintainable build.
              </p>
            </div>
            <div className={styles.hbSteps}>
              {PROCESS.map((s, i) => (
                <span key={s} className={styles.hbStep} data-active={i === phase}>
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function Hero({ variant = "index", anim = "rise" }: { variant?: HeroVariant; anim?: BentoAnim }) {
  const reduce = useReducedMotion() ?? false;
  if (variant === "featured") return <FeaturedHero reduce={reduce} />;
  if (variant === "carousel") return <CarouselHero reduce={reduce} />;
  if (variant === "filmstrip") return <FilmstripHero reduce={reduce} />;
  if (variant === "ghost") return <GhostHero reduce={reduce} />;
  if (variant === "bento") return <BentoHero reduce={reduce} anim={anim} />;
  return <IndexHero reduce={reduce} />;
}
