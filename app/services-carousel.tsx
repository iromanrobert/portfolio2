"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@lordicon/react";
import styles from "./page.module.css";

import codingIcon   from "./icons/coding.json";
import layersIcon   from "./icons/layers.json";
import designIcon   from "./icons/design.json";
import piechartIcon from "./icons/piechart.json";

type Service = {
  title: string;
  blurb: string;
  variant: "blue" | "orange" | "slate" | "indigo";
};

const services: Service[] = [
  {
    title: "Frontend Development",
    blurb: "React, Next.js & TypeScript. Component-driven, responsive, performance-tuned interfaces.",
    variant: "blue",
  },
  {
    title: "CMS Integration",
    blurb: "Webflow & backoffice CMS. Structured content models editors run without a developer.",
    variant: "orange",
  },
  {
    title: "Design-to-Code",
    blurb: "Figma to production — tokens, type scales & states translated pixel-for-pixel, fully responsive.",
    variant: "slate",
  },
  {
    title: "Interactive / Data UIs",
    blurb: "Multi-step flows, payment checkout, Chart.js dashboards & SVG-mapped interactive maps.",
    variant: "indigo",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<Service["variant"], any> = {
  blue:   codingIcon,
  orange: layersIcon,
  slate:  designIcon,
  indigo: piechartIcon,
};

const bgColor: Record<Service["variant"], string> = {
  blue:   "#1d4ed8",
  orange: "#e8551f",
  slate:  "#26262b",
  indigo: "#1e3357",
};

type ServiceDetail = { lead: string; items: string[] };

const serviceDetails: Record<Service["variant"], ServiceDetail> = {
  blue: {
    lead: "Clean, maintainable code built for production — not just prototypes. Interfaces that perform under real load and hold up as the product grows.",
    items: ["React & Next.js", "Performance", "API Integration", "Cross-Browser"],
  },
  orange: {
    lead: "A CMS that editors actually enjoy using. Content structures flexible enough for your team to manage without touching the design.",
    items: ["Webflow", "CMS Architecture", "Dynamic Templates", "Editor Handoff"],
  },
  slate: {
    lead: "I treat Figma as a spec, not a suggestion. Every spacing token, type scale, and interaction state gets translated faithfully — then made responsive.",
    items: ["Figma to Code", "Responsive Layouts", "Micro-interactions", "Design QA"],
  },
  indigo: {
    lead: "The hardest flows to build are the ones that need to feel effortless. Complex logic turned into interfaces users move through without friction.",
    items: ["Multi-step Flows", "Payment Integration", "Data Visualisation", "Interactive Maps"],
  },
};

const sliderSpring = { type: "spring" as const, stiffness: 260, damping: 38, mass: 1 };

const panelVariants = {
  hidden: {
    clipPath: "circle(35vh at 142% 50%)",
    x: 0,
  },
  visible: {
    clipPath: "circle(150% at 100% 50%)",
    x: 0,
    transition: { duration: 1.2, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
  },
  exit: {
    clipPath: "circle(35vh at 142% 50%)",
    x: 0,
    transition: { duration: 1.2, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
  },
};

// Content staggers in after panel opens, swaps out instantly when navigating
const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.35 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] } },
};

// ─── card ─────────────────────────────────────────────────────────────────────
function ServiceCard({
  service,
  index,
  onClick,
}: {
  service: Service;
  index: number;
  onClick: () => void;
}) {
  const playerRef = useRef<Player>(null);
  const hovered   = useRef(false);

  const handleMouseEnter = () => {
    hovered.current = true;
    playerRef.current?.playFromBeginning();
  };
  const handleMouseLeave = () => {
    hovered.current = false;
    playerRef.current?.pause();
  };
  const handleComplete = () => {
    if (hovered.current) playerRef.current?.playFromBeginning();
  };

  return (
    <article
      data-card
      className={`${styles.serviceCard} ${styles[service.variant]}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <div className={styles.watermark} aria-hidden="true">
        <Player
          ref={playerRef}
          icon={iconMap[service.variant]}
          size={280}
          colorize="white"
          onComplete={handleComplete}
        />
      </div>

      <div className={styles.serviceCardTop}>
        <span className={styles.serviceTitle}>{service.title}</span>
        <span className={styles.serviceNum}>{String(index + 1).padStart(2, "0")}</span>
      </div>

      <p className={styles.serviceBlurb}>{service.blurb}</p>
    </article>
  );
}

// ─── modal ────────────────────────────────────────────────────────────────────
function ServiceModal({
  service,
  index,
  onClose,
  onNavigate,
}: {
  service: Service;
  index: number;
  onClose: () => void;
  onNavigate: (dir: 1 | -1) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft")  onNavigate(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onNavigate]);

  const detail = serviceDetails[service.variant];
  const color  = bgColor[service.variant];

  return (
    <>
      <motion.div
        className={styles.modalBackdrop}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      />
      <motion.div
        className={styles.modalPanel}
        style={{ background: color }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={e => e.stopPropagation()}
      >
        {/* Close — always visible, outside the stagger */}
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">×</button>

        {/* Content — re-staggers when service changes */}
        <AnimatePresence mode="wait">
          <motion.div
            key={service.variant}
            className={styles.modalContent}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className={styles.modalWatermark} aria-hidden="true">
              <Player icon={iconMap[service.variant]} size={320} colorize="white" />
            </div>

            <motion.span variants={itemVariants} className={styles.modalNum}>
              {String(index + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
            </motion.span>

            <motion.h2 id="modal-title" variants={itemVariants} className={styles.modalTitle}>
              {service.title}
            </motion.h2>

            <motion.p variants={itemVariants} className={styles.modalLead}>
              {detail.lead}
            </motion.p>

            <motion.ul variants={itemVariants} className={styles.modalList}>
              {detail.items.map(item => (
                <li key={item} className={styles.modalItem}>{item}</li>
              ))}
            </motion.ul>

            <motion.div variants={itemVariants} className={styles.modalFooter}>
              <a href="#contact" className={styles.modalCta} style={{ color }} onClick={onClose}>
                Let&apos;s talk
              </a>
              <div className={styles.modalNav}>
                <button
                  className={styles.modalNavBtn}
                  onClick={() => onNavigate(-1)}
                  aria-label="Previous service"
                >
                  ←
                </button>
                <button
                  className={styles.modalNavBtn}
                  onClick={() => onNavigate(1)}
                  aria-label="Next service"
                >
                  →
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ─── carousel ─────────────────────────────────────────────────────────────────
export default function ServicesCarousel() {
  const innerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<{ service: Service; index: number } | null>(null);

  const scroll = (dir: 1 | -1) => {
    const inner = innerRef.current;
    if (!inner) return;
    const card = inner.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    setOffset(prev => Math.max(0, prev + dir * card.offsetWidth));
  };

  const navigate = (dir: 1 | -1) => {
    setSelected(prev => {
      if (!prev) return null;
      const newIndex = (prev.index + dir + services.length) % services.length;
      return { service: services[newIndex], index: newIndex };
    });
  };

  return (
    <>
      <div className={styles.servicesTrack}>
        <motion.div
          ref={innerRef}
          className={styles.servicesInner}
          animate={{ x: -offset }}
          transition={sliderSpring}
        >
          {services.map((s, i) => (
            <ServiceCard
              key={s.title}
              service={s}
              index={i}
              onClick={() => setSelected({ service: s, index: i })}
            />
          ))}
        </motion.div>
      </div>

      <div className={styles.carouselNav}>
        <button type="button" aria-label="Previous" className={styles.navBtn} onClick={() => scroll(-1)}>
          &#8592;
        </button>
        <button type="button" aria-label="Next" className={styles.navBtn} onClick={() => scroll(1)}>
          &#8594;
        </button>
      </div>

      <AnimatePresence>
        {selected && (
          <ServiceModal
            key="service-modal"
            service={selected.service}
            index={selected.index}
            onClose={() => setSelected(null)}
            onNavigate={navigate}
          />
        )}
      </AnimatePresence>
    </>
  );
}
