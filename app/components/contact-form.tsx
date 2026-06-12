"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@lordicon/react";
import styles from "../page.module.css";
import linkIcon from "../icons/link.json";

const spring   = { type: "spring" as const, stiffness: 400, damping: 30 };
const fillEase = { type: "spring" as const, stiffness: 360, damping: 38 };

// ─── toast ─────────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      className={styles.toast}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0  }}
      exit={{    opacity: 0, x: 16 }}
      transition={spring}
    >
      <div className={styles.toastLeft}>
        <span className={styles.toastDot} aria-hidden="true" />
        <span className={styles.toastText}>{message}</span>
      </div>
      <button className={styles.toastClose} onClick={onDismiss} aria-label="Dismiss">×</button>
    </motion.div>
  );
}

// ─── field ──────────────────────────────────────────────────────────────────
function Field({
  label, type = "text", value, onChange, disabled, required, textarea = false,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; disabled: boolean;
  required: boolean; textarea?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const floating    = focused || value.length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlers = {
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
  };

  const handleTextareaChange = (v: string) => {
    onChange(v);
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
  };

  return (
    <div className={styles.contactField}>
      <div className={styles.contactFieldBody}>
        <motion.label
          className={styles.contactLabel}
          animate={
            floating
              ? { y: 0,  scale: 0.72, color: "rgba(237,237,237,0.9)" }
              : { y: 22, scale: 1,    color: "rgba(138,138,138,1)"   }
          }
          transition={spring}
          style={{ transformOrigin: "left center" }}
        >
          {label}
        </motion.label>

        {textarea ? (
          <textarea
            ref={textareaRef}
            className={styles.contactInput}
            value={value}
            onChange={e => handleTextareaChange(e.target.value)}
            disabled={disabled}
            required={required}
            rows={2}
            {...handlers}
          />
        ) : (
          <input
            type={type}
            className={styles.contactInput}
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            {...handlers}
          />
        )}
      </div>

      <div className={styles.contactTrack}>
        <motion.div
          className={styles.contactFill}
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={fillEase}
          style={{ transformOrigin: "left" }}
        />
      </div>
    </div>
  );
}

// ─── form ───────────────────────────────────────────────────────────────────
type FormState = "idle" | "loading" | "error";

export default function ContactForm() {
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [message,   setMessage]   = useState("");
  const [state,     setState]     = useState<FormState>("idle");
  const [errMsg,    setErrMsg]    = useState("");
  const [toast,     setToast]     = useState<string | null>(null);
  const iconRef = useRef<Player>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrMsg("");

    try {
      const res  = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrMsg(data.error ?? "Something went wrong.");
        setState("error");
      } else {
        setToast(`Message sent, ${name}. I'll be in touch shortly.`);
        setState("idle");
        setName(""); setEmail(""); setMessage("");
      }
    } catch {
      setErrMsg("Something went wrong. Please try again.");
      setState("error");
    }
  };

  const busy = state === "loading";

  return (
    <>
      <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
        <div className={styles.contactRow}>
          <Field label="What is your name?" value={name}  onChange={setName}  disabled={busy} required />
          <Field label="Your email" type="email" value={email} onChange={setEmail} disabled={busy} required />
        </div>

        <div className={styles.contactMessageWrap}>
          <Field label="Tell us about your project" value={message} onChange={setMessage} disabled={busy} required textarea />
          <motion.button
            type="submit"
            className={styles.contactSubmit}
            disabled={busy}
            whileHover={busy ? {} : { x: 5 }}
            whileTap={busy  ? {} : { x: 2 }}
            transition={spring}
            onHoverStart={() => iconRef.current?.playFromBeginning()}
          >
            {busy ? "Sending" : "Send"}
            <Player ref={iconRef} icon={linkIcon} size={20} colorize="#000000" />
          </motion.button>
        </div>

        {state === "error" && (
          <p className={styles.contactError}>{errMsg}</p>
        )}
      </form>

      <AnimatePresence>
        {toast && (
          <Toast message={toast} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
