"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { roles, num } from "./experience-data";
import ExperienceList from "./experience-list";
import styles from "../page.module.css";

export type ExperienceVariant = "roster" | "stage" | "classic";

const EASE = [0.25, 1, 0.5, 1] as [number, number, number, number];

const intro =
  "Three years, three chapters — automotive platforms, cultural infrastructure, and independent client work.";

// shared "currently here" marker — the dormant lime accent, finally alive
function Now() {
  return (
    <span className={styles.expNow}>
      <span className={styles.expNowDot} aria-hidden="true" />
      Now
    </span>
  );
}

function Head() {
  return (
    <header className={styles.expHead}>
      <span className={styles.sideLabel}>Experience</span>
      <p className={styles.expIntro}>{intro}</p>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   VARIANT: ROSTER — static giant-type index with a wipe-fill reveal
   Names sit still as oversized stroked outlines; hover/focus fills the active
   name left-to-right (lime for the current role) and drops a detail tray.
   ───────────────────────────────────────────────────────────────────────── */
function RosterIndex() {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);

  return (
    <section id="experience" className={`${styles.expSection} ${styles.expRoster}`}>
      <Head />
      <ul className={styles.rosterList}>
        {roles.map((r, i) => {
          const isActive = active === i;
          return (
            <li
              key={r.company}
              className={styles.rosterItem}
              data-active={isActive}
              data-current={!!r.current}
            >
              <button
                type="button"
                className={styles.rosterBar}
                aria-label={`${r.company} — ${r.role}, ${r.period}`}
                aria-expanded={isActive}
                aria-controls={`roster-tray-${i}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              >
                <span className={styles.rosterIndex}>{num(i)}</span>
                <span className={styles.rosterMain}>
                  <span className={styles.rosterName}>
                    <span className={styles.rosterNameBase}>{r.company}</span>
                    <span className={styles.rosterNameFill} aria-hidden="true">
                      {r.company}
                    </span>
                  </span>
                  <span className={styles.rosterMeta}>
                    {r.role}&nbsp;·&nbsp;{r.period} {r.current && <Now />}
                  </span>
                </span>
                <span className={styles.rosterYear} aria-hidden="true">
                  {r.start}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    id={`roster-tray-${i}`}
                    className={styles.rosterTray}
                    initial={{ height: 0, opacity: reduce ? 0 : 1 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: reduce ? 0 : 1 }}
                    transition={{ duration: reduce ? 0.2 : 0.42, ease: EASE }}
                  >
                    <div className={styles.rosterTrayInner}>
                      <p className={styles.rosterLead}>{r.highlight}</p>
                      <ul className={styles.rosterKeywords}>
                        {r.keywords.map((k) => (
                          <li key={k} className={styles.rosterKeyword}>
                            {k}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   VARIANT: STAGE — ghost-year focus stage
   A colossal outlined year bleeds off-canvas behind the active role; the
   stage swaps with a clip + stagger reveal as you move through the index.
   ───────────────────────────────────────────────────────────────────────── */
function GhostStage() {
  const reduce = useReducedMotion() ?? false;
  const [sel, setSel] = useState(0);
  const r = roles[sel];

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

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.6, ease: EASE } },
  };

  return (
    <section id="experience" className={`${styles.expSection} ${styles.expStageSection}`}>
      <Head />
      <div className={styles.stWrap}>
        <ol className={styles.stIndex}>
          {roles.map((role, i) => (
            <li key={role.company}>
              <button
                type="button"
                className={styles.stItem}
                data-active={sel === i}
                aria-pressed={sel === i}
                onPointerEnter={() => setSel(i)}
                onClick={() => setSel(i)}
              >
                <span className={styles.stItemNum}>{num(i)}</span>
                <span className={styles.stItemName}>{role.company}</span>
                <span className={styles.stItemPeriod}>{role.start}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className={styles.stStage}>
          <AnimatePresence mode="wait">
            <motion.div key={sel} className={styles.stStageInner} initial="hidden" animate="visible" exit="exit">
              <motion.span className={styles.stGhost} aria-hidden="true" variants={ghost}>
                {r.start}
              </motion.span>
              <motion.div className={styles.stContent} variants={stage}>
                <motion.span className={styles.stMeta} variants={item}>
                  {r.role}&nbsp;·&nbsp;{r.period} {r.current && <Now />}
                </motion.span>
                <motion.h3 className={styles.stCompany} variants={item}>
                  {r.company}
                </motion.h3>
                <motion.p className={styles.stLead} variants={item}>
                  {r.highlight}
                </motion.p>
                <motion.ul className={styles.stKeywords} variants={item}>
                  {r.keywords.map((k) => (
                    <li key={k} className={styles.stKeyword}>
                      {k}
                    </li>
                  ))}
                </motion.ul>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   VARIANT: CLASSIC — the prior editorial accordion (kept as a fallback)
   ───────────────────────────────────────────────────────────────────────── */
function Classic() {
  return (
    <section className={styles.about} id="experience">
      <div className={styles.aboutLeft}>
        <h2 className={styles.sideLabel}>Experience</h2>
        <p className={styles.expFraming}>{intro}</p>
        <span className={styles.aboutSince}>Since 2023&nbsp;·&nbsp;Cluj&#8209;Napoca</span>
      </div>
      <div className={styles.aboutRight}>
        <ExperienceList variant="editorial" />
      </div>
    </section>
  );
}

export default function Experience({ variant = "roster" }: { variant?: ExperienceVariant }) {
  if (variant === "stage") return <GhostStage />;
  if (variant === "classic") return <Classic />;
  return <RosterIndex />;
}
