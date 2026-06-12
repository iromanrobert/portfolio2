"use client";

import { useState, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import styles from "../page.module.css";

type Role = {
  company: string;
  role: string;
  period: string;
  start: string; // year used as the oversized ghost numeral on each row
  current?: boolean;
  highlight: string;
  bullets: string[];
  keywords: string[]; // concise editorial items — mirrors the service modal list
};

const roles: Role[] = [
  {
    company: "Carmatik",
    role: "Frontend Developer",
    period: "Mar 2025 — Present",
    start: "2025",
    current: true,
    highlight:
      "Built a 5-step B2C insurance flow on carmatik.ro — private and business logic, multi-provider offers, and Netopia checkout.",
    bullets: [
      "Develop and maintain 10+ dealership storefronts on a Java/JSP backend — both fully custom builds and configurable base templates (home, PLP, PDP, contact, buyback, lead capture).",
      "Integrate forms with backend APIs and a backoffice CMS, keeping data flowing reliably between the frontend and platform services.",
      "Prototyped an AI chat assistant at a company hackathon that queries dealership data and renders results as interactive Chart.js visualisations with persistent history.",
      "Design UI in Figma and translate full specs into responsive HTML, CSS, PostCSS and vanilla JS; contribute to two-way code reviews.",
    ],
    keywords: ["10+ Dealership Storefronts", "B2C Insurance Flow", "Backoffice CMS Integration", "AI Chat Assistant"],
  },
  {
    company: "Urbanlab",
    role: "Frontend Developer (NGO)",
    period: "Mar 2024 — Mar 2025",
    start: "2024",
    highlight:
      "Built an interactive heritage map of the Jiu Valley spanning 4 cities, with interactive 3D building models.",
    bullets: [
      "Mapped heritage buildings across SVG-based city maps for Uricani, Lupeni, Vulcan/Aninoasa and Petroșani on urbanlab.ro.",
      "Drove relative-positioned map pins from Webflow CMS collections, so editors add new buildings and cities without developer involvement.",
      "Created building detail pages with Google Model Viewer for interactive 3D rendering, historical context and imagery.",
      "Designed a scroll-driven narrative guiding users through the valley's heritage city by city; owned frontend and CMS architecture end-to-end.",
    ],
    keywords: ["Interactive Heritage Map", "Webflow CMS Architecture", "3D Model Viewer", "Scroll-Driven Narrative"],
  },
  {
    company: "Various Clients",
    role: "Freelance Frontend Developer",
    period: "Jan 2023 — Mar 2025",
    start: "2023",
    highlight:
      "Delivered end-to-end web projects across multiple industries, plus hand-coded conversion funnels for Simplify Creative Agency.",
    bullets: [
      "Delivered end-to-end web projects across healthcare, wellness and other industries using Webflow, HTML, CSS and JavaScript.",
      "Built CMS-driven sites with dynamic pages, e-commerce, booking integrations, blogs and lead-capture forms.",
      "Collaborated remotely with designers and marketing teams, translating brand identities into responsive, performant interfaces.",
    ],
    keywords: ["End-to-End Delivery", "Conversion Funnels", "E-commerce & Booking", "Brand-to-Code"],
  },
];

export type ExperienceVariant = "editorial" | "masterDetail" | "timeline" | "tabs";

const EASE = [0.25, 1, 0.5, 1] as [number, number, number, number];
const EASE_MASK = [0.76, 0, 0.24, 1] as [number, number, number, number];
const MASK_T = { duration: 0.5, ease: EASE_MASK };

const idx = (i: number) => String(i + 1).padStart(2, "0");

// ── reduced-motion-aware variant factories ──────────────────────────────────
// All large transforms collapse to opacity-only (or instant) when the user
// prefers reduced motion.
const detailVariants = (reduce: boolean): Variants => ({
  hidden: { height: 0, opacity: reduce ? 0 : 1 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: reduce
      ? { duration: 0.2 }
      : { height: { duration: 0.5, ease: EASE }, staggerChildren: 0.07, delayChildren: 0.12 },
  },
  exit: { height: 0, opacity: reduce ? 0 : 1, transition: { duration: reduce ? 0.15 : 0.3, ease: EASE } },
});

const itemVariants = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 14 },
  visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.5, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
});

const ulVariants = (reduce: boolean): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: reduce ? 0 : 0.07 } },
});

// section entrance — rows reveal as they scroll into view
const listVariants = (reduce: boolean): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
});

const rowVariants = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 18 },
  visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.6, ease: EASE } },
});

const inView = { once: true, margin: "0px 0px -12% 0px" } as const;

// ── signature mask/skew reveal (mirrors AnimatedLink) ───────────────────────
function SkewName({ children, className }: { children: string; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <span className={className} style={{ display: "block" }}>{children}</span>;
  }
  return (
    <span style={{ display: "block", position: "relative", overflow: "hidden" }}>
      <motion.span
        className={className}
        style={{ display: "block", transformOrigin: "left center" }}
        variants={{ rest: { y: "0%", skewY: 0 }, hover: { y: "-115%", skewY: -5 } }}
        transition={MASK_T}
      >
        {children}
      </motion.span>
      <motion.span
        className={className}
        style={{ display: "block", position: "absolute", top: 0, left: 0, width: "100%", transformOrigin: "left center" }}
        variants={{ rest: { y: "115%", skewY: 5 }, hover: { y: "0%", skewY: 0 } }}
        transition={MASK_T}
        aria-hidden="true"
      >
        {children}
      </motion.span>
    </span>
  );
}

// quiet "currently here" marker for the active role
function NowTag() {
  return (
    <span className={styles.nowTag}>
      <span className={styles.nowDot} aria-hidden="true" />
      Now
    </span>
  );
}

// role period, swapping the trailing "Present" for the Now marker
function Period({ role }: { role: Role }) {
  if (!role.current) return <>{role.period}</>;
  return (
    <>
      {role.period.replace("Present", "")}
      <NowTag />
    </>
  );
}

// detail body shared by the accordion variants
function DetailBody({ role, withHighlight, className, id }: { role: Role; withHighlight: boolean; className?: string; id?: string }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.div
      id={id}
      className={`${styles.expDetailWrap} ${className ?? ""}`}
      variants={detailVariants(reduce)}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {withHighlight && (
        <motion.p className={styles.expHighlight} variants={itemVariants(reduce)}>
          {role.highlight}
        </motion.p>
      )}
      <motion.ul className={styles.expBullets} variants={ulVariants(reduce)}>
        {role.bullets.map((b) => (
          <motion.li key={b} variants={itemVariants(reduce)}>
            {b}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

// ── variant: EDITORIAL ──────────────────────────────────────────────────────
function EditorialList() {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <motion.ol
      className={styles.edList}
      variants={listVariants(reduce)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
    >
      {roles.map((r, i) => {
        const isOpen = open === i;
        return (
          <motion.li
            key={r.company}
            className={styles.edItem}
            data-open={isOpen}
            data-current={!!r.current}
            variants={rowVariants(reduce)}
          >
            <h3 className={styles.edHeading}>
              <motion.button
                type="button"
                className={styles.edHeader}
                initial="rest"
                animate="rest"
                whileHover="hover"
                aria-expanded={isOpen}
                aria-controls={`exp-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className={styles.edIndex}>{idx(i)}</span>
                <span className={styles.edHeadText}>
                  <SkewName className={styles.edName}>{r.company}</SkewName>
                  <span className={styles.edSub}>
                    <span className={styles.edRole}>{r.role}</span>
                    <span className={styles.edSep} aria-hidden="true">·</span>
                    <span className={styles.edPeriod}>
                      <Period role={r} />
                    </span>
                  </span>
                </span>
                <span className={styles.edYear} aria-hidden="true">
                  {r.start}
                </span>
                <motion.span
                  className={styles.edToggle}
                  aria-hidden="true"
                  animate={{ rotate: isOpen ? 135 : 0 }}
                  transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                >
                  +
                </motion.span>
              </motion.button>
            </h3>
            {/* highlight stays visible while collapsed — all three roles scan without a click */}
            <p className={styles.edLead}>{r.highlight}</p>
            <AnimatePresence initial={false}>
              {isOpen && <DetailBody role={r} withHighlight={false} className={styles.edDetail} id={`exp-panel-${i}`} />}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}

// ── variant: MASTER–DETAIL ──────────────────────────────────────────────────
const panelVariants = (reduce: boolean): Variants => ({
  hidden: reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)", opacity: 0 },
  visible: reduce
    ? { opacity: 1, transition: { duration: 0.2, staggerChildren: 0 } }
    : {
        clipPath: "inset(0 0 0% 0)",
        opacity: 1,
        transition: { clipPath: { duration: 0.6, ease: EASE }, opacity: { duration: 0.3 }, staggerChildren: 0.06, delayChildren: 0.2 },
      },
  exit: { opacity: 0, transition: { duration: 0.15 } },
});

function MasterDetail() {
  const reduce = useReducedMotion() ?? false;
  const [selected, setSelected] = useState(0);
  const r = roles[selected];
  return (
    <div className={styles.mdWrap}>
      <motion.ol
        className={styles.mdList}
        variants={listVariants(reduce)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
      >
        {roles.map((role, i) => (
          <motion.li key={role.company} variants={rowVariants(reduce)}>
            <motion.button
              type="button"
              className={styles.mdRow}
              data-active={selected === i}
              initial="rest"
              animate="rest"
              whileHover="hover"
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              <span className={styles.mdIndex}>{idx(i)}</span>
              <SkewName className={styles.mdName}>{role.company}</SkewName>
            </motion.button>
          </motion.li>
        ))}
      </motion.ol>

      <div className={styles.mdPanel}>
        <AnimatePresence mode="wait">
          <motion.div key={selected} variants={panelVariants(reduce)} initial="hidden" animate="visible" exit="exit">
            <motion.span className={styles.mdPanelMeta} variants={itemVariants(reduce)}>
              {r.role}&nbsp;·&nbsp;<Period role={r} />
            </motion.span>
            <motion.p className={styles.expHighlight} variants={itemVariants(reduce)}>
              {r.highlight}
            </motion.p>
            <motion.ul className={styles.expBullets} variants={ulVariants(reduce)}>
              {r.bullets.map((b) => (
                <motion.li key={b} variants={itemVariants(reduce)}>
                  {b}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── variant: TIMELINE ───────────────────────────────────────────────────────
function Timeline() {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <motion.ol
      className={styles.expList}
      variants={listVariants(reduce)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
    >
      {roles.map((r, i) => {
        const isOpen = open === i;
        return (
          <motion.li key={r.company} className={styles.expEntry} data-open={isOpen} variants={rowVariants(reduce)}>
            <motion.button
              type="button"
              className={styles.expHeader}
              initial="rest"
              animate="rest"
              whileHover="hover"
              aria-expanded={isOpen}
              aria-controls={`exp-panel-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className={styles.expHeadText}>
                <SkewName className={styles.expName}>{r.company}</SkewName>
                <span className={styles.expMeta}>
                  <span className={styles.expIndex}>{idx(i)}</span>
                  {r.role}&nbsp;·&nbsp;<Period role={r} />
                </span>
              </span>
              <motion.span
                className={styles.expToggle}
                aria-hidden="true"
                animate={{ rotate: isOpen ? 135 : 0 }}
                transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
              >
                +
              </motion.span>
            </motion.button>

            <p className={styles.expHighlight}>{r.highlight}</p>

            <AnimatePresence initial={false}>
              {isOpen && <DetailBody role={r} withHighlight={false} id={`exp-panel-${i}`} />}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}

// ── variant: TABS ───────────────────────────────────────────────────────────
// WAI-ARIA tabs: roving tabindex, arrow/Home/End navigation, selection follows
// focus. The active indicator slides between tabs via shared-layout animation.
const tabPanelVariants = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduce
      ? { duration: 0.2 }
      : { duration: 0.4, ease: EASE, staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
});

function Tabs() {
  const reduce = useReducedMotion() ?? false;
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const r = roles[selected];

  const onKeyDown = (e: ReactKeyboardEvent, i: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % roles.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + roles.length) % roles.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = roles.length - 1;
    if (next !== null) {
      e.preventDefault();
      setSelected(next);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <div className={styles.tabWrap}>
      <div role="tablist" aria-label="Experience" className={styles.tabStrip}>
        {roles.map((role, i) => {
          const active = selected === i;
          return (
            <button
              key={role.company}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`exp-tab-${i}`}
              aria-selected={active}
              aria-controls={`exp-tabpanel-${i}`}
              tabIndex={active ? 0 : -1}
              className={styles.tab}
              data-active={active}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className={styles.tabIndex}>{idx(i)}</span>
              <span className={styles.tabName}>{role.company}</span>
              {active && (
                <motion.span
                  layoutId="expTabIndicator"
                  className={styles.tabIndicator}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`exp-tabpanel-${selected}`}
        aria-labelledby={`exp-tab-${selected}`}
        className={styles.tabPanel}
        tabIndex={0}
      >
        <AnimatePresence mode="wait">
          <motion.div key={selected} variants={tabPanelVariants(reduce)} initial="hidden" animate="visible" exit="exit">
            <motion.span className={styles.tabPanelMeta} variants={itemVariants(reduce)}>
              {idx(selected)} / {String(roles.length).padStart(2, "0")}
              &nbsp;&nbsp;·&nbsp;&nbsp;{r.role}&nbsp;·&nbsp;<Period role={r} />
            </motion.span>
            <motion.p className={styles.tabLead} variants={itemVariants(reduce)}>
              {r.highlight}
            </motion.p>
            <motion.ul className={styles.tabKeywords} variants={ulVariants(reduce)}>
              {r.keywords.map((k) => (
                <motion.li key={k} className={styles.tabKeyword} variants={itemVariants(reduce)}>
                  {k}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ExperienceList({ variant = "editorial" }: { variant?: ExperienceVariant }) {
  if (variant === "masterDetail") return <MasterDetail />;
  if (variant === "timeline") return <Timeline />;
  if (variant === "tabs") return <Tabs />;
  return <EditorialList />;
}
