"use client";

import styles from "../page.module.css";

// Full-bleed auto-scrolling film-strip of work — the atomic banner slot.
// Real UrbanLab captures lead; the rest reuse the project placeholders
// (swap in real screenshots later). The list is rendered twice so the
// CSS marquee loops seamlessly.
type Shot = { name: string; tag: string; image: string };

const shots: Shot[] = [
  { name: "UrbanLab Heritage", tag: "Interactive map", image: "/urbanlab-home.png" },
  { name: "UrbanLab Building",  tag: "Details · 3D",    image: "/urbanlab-details.png" },
  { name: "Carmatik Storefronts", tag: "Dealership SaaS", image: "https://picsum.photos/seed/carmatik/900/700" },
  { name: "Insurance Module",     tag: "Multi-step flow", image: "https://picsum.photos/seed/insurance/900/700" },
  { name: "AI Chat Assistant",    tag: "Conversational UI", image: "https://picsum.photos/seed/aichat/900/700" },
  { name: "Sales Funnels",        tag: "Conversion",      image: "https://picsum.photos/seed/funnels/900/700" },
  { name: "CMS Websites",         tag: "Webflow · CMS",   image: "https://picsum.photos/seed/cmsdev/900/700" },
];

function Card({ name, tag, image }: Shot) {
  return (
    <article className={styles.stripCard}>
      <img src={image} alt={name} className={styles.stripImg} draggable={false} />
      <div className={styles.stripMeta}>
        <span className={styles.stripName}>{name}</span>
        <span className={styles.stripTag}>{tag}</span>
      </div>
    </article>
  );
}

export default function MapSection() {
  return (
    <section className={styles.strip} aria-label="Selected work">
      <span className={styles.stripLabel}>Work · in motion</span>

      <div className={styles.stripViewport}>
        <div className={styles.stripTrack}>
          {shots.map((s) => <Card key={s.name} {...s} />)}
          {/* duplicate for the seamless loop */}
          {shots.map((s) => <Card key={`${s.name}-dup`} {...s} />)}
        </div>
      </div>
    </section>
  );
}
