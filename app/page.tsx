import Image from "next/image";
import styles from "./page.module.css";
import Clock from "./clock";
import Nav from "./nav";
import Hero from "./components/hero";
import ServicesCarousel from "./services-carousel";
import ContactForm from "./components/contact-form";
import Experience from "./components/experience";

export default function Home() {
  return (
    <div className={styles.page} id="top">

      {/* ─── Availability badge — fixed left edge ──────────────────────────── */}
      <aside className={styles.availBadge} aria-label="Availability status">
        <span className={styles.availDot} aria-hidden="true" />
        <span className={styles.availText}>Available for work</span>
      </aside>

      {/* ─── Header ─────────────────────────────────────────────────────────
          Atomic grid: [wordmark] [center nav] [meta]
          Golden: 1fr auto 1fr
      ──────────────────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <a href="#top" className={styles.logo} aria-label="Roman Robert — home">
          <span className={styles.logoAvatar} aria-hidden="true">
            <Image
              src="/robertt.png"
              alt=""
              width={42}
              height={42}
              className={styles.logoAvatarImg}
            />
          </span>
          <span className={styles.logoText}>
            <span className={styles.logoName}>Roman Robert</span>
            <span className={styles.logoRole}>Frontend Developer</span>
          </span>
        </a>
        <Nav />
      </header>

      <main>
        {/* ─── Hero (work merged in) ──────────────────────────────────────────
            Swap the whole selected-work treatment via the `variant` prop
            (anchors #projects for the nav). Off-axis editorial variants push
            copy to the golden 19% offset to match the rest of the site:
              "index"    → vertical name index (wipe-fill) + big swapping preview ← default
              "filmstrip"→ copy rail + vertical scroll-snap of big portrait tiles
              "ghost"    → colossal off-canvas index numeral behind a big preview
              "carousel" → (original) horizontal editorial card carousel
              "featured" → (original) one large glitch preview + name switcher
              "bento"    → product identity (avatar·name·role) + statement
                           headline + φ bento grid (hover-swap media · craft ·
                           stats · process)
        ──────────────────────────────────────────────────────────────────── */}
        {/* ─── Depth — design principles used in the hero ─────────────────────
            (graphic/UX depth cues, not post-processing effects)
              1. Occlusion / overlap — nearer elements cross IN FRONT of farther
                 ones. The heading overlaps the work card; what covers, is closer.
              2. Cast shadow — the heading casts a glyph-shaped shadow onto the
                 card it overlaps (contact shadow ⇒ "floating above").
              3. Elevation — the card sits on a layered, directional shadow
                 (tight contact → broad ambient) ⇒ reads as lifted off the page.
              4. Atmospheric perspective — distant things lose contrast + focus;
                 the far project numeral is faint + blurred ⇒ pushed back.
              5. Scale contrast — huge heading/numeral vs. small captions sets a
                 near/far reading and a clear hierarchy.
              6. Consistent light source — every shadow falls one way (top-down),
                 so the layers read as one coherent space.
              7. Figure–ground — value + spacing separate subject from ground.
              8. Motion parallax — layers move at different rates against the
                 user's scroll (never autonomous "shaking") ⇒ a real depth cue.
        ──────────────────────────────────────────────────────────────────── */}
        {/* `anim` swaps the bento's entrance character (compare them live):
              "rise"  → fade + travel up, clean editorial cadence ← default
              "scale" → spring pop from 0.96, tactile
              "blur"  → fade from soft blur, atmospheric depth
              "wipe"  → top-down clip-path reveal, architectural */}
        <Hero variant="bento" anim="blur" />

        {/* ─── What I do ──────────────────────────────────────────────────────
            Full-width section, horizontal card carousel + copy below
        ──────────────────────────────────────────────────────────────────── */}
        <section className={styles.services}>
          <span className={styles.sideLabel}>Types of services</span>
          <h2 className={styles.servicesTitle}>What I do</h2>
          <ServicesCarousel />
          <div className={styles.servicesCopy}>
            <p className={styles.servicesLead}>
              I craft responsive, high-performance interfaces — translating
              design into production-ready, accessible code.
            </p>
            <p className={styles.servicesSub}>
              3+ years across SaaS platforms, storefronts, and interactive
              data-driven applications. Cross-functional teams, CMS integrations,
              and design-to-code workflows.
            </p>
          </div>
        </section>

        {/* ─── Experience ─────────────────────────────────────────────────────
            Swap the whole treatment via the `variant` prop:
              "classic" → elevated editorial accordion (ghost years + live lime) ← default
              "stage"   → colossal off-canvas year numeral, clip/stagger swaps
              "roster"  → giant stroked-outline names, left-to-right wipe-fill
        ──────────────────────────────────────────────────────────────────── */}
        <Experience variant="classic" />

        {/* ─── CTA / Footer ───────────────────────────────────────────────────
            Mirrors atomic footer: wordmark · "We are ready…" · contacts
        ──────────────────────────────────────────────────────────────────── */}
        <section className={styles.cta} id="contact">


          <div className={styles.ctaMain}>
            <h2 className={styles.ctaTitle}>
              I&apos;m ready to discuss
              <br />
              your project
            </h2>

            <div className={styles.ctaContact}>
              <span className={styles.ctaContactLabel}>Contacts</span>
              <a href="mailto:hello@romanrobert.com" className={styles.ctaEmail}>
                hello@romanrobert.com
              </a>
              <div className={styles.ctaSocials}>
                <a
                  href="https://linkedin.com/in/iromanrobert"
                  className={styles.socialBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >In</a>
                <a
                  href="https://www.romanrobert.com"
                  className={styles.socialBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                >↗</a>
                <a
                  href="tel:+40729620081"
                  className={styles.socialBtn}
                  aria-label="Phone"
                >Tel</a>
              </div>
              <span className={styles.ctaLocalTime}>
                Cluj&#8209;Napoca, Romania&nbsp;·&nbsp;<Clock />
              </span>
            </div>
          </div>

          <ContactForm />

        </section>
      </main>
    </div>
  );
}
