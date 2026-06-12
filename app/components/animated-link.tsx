"use client";

import { motion } from "framer-motion";

const transition = {
  duration: 0.5,
  ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
};

interface AnimatedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export default function AnimatedLink({
  href,
  children,
  className,
  labelClassName,
}: AnimatedLinkProps) {
  return (
    <motion.a
      href={href}
      className={className}
      style={{ display: "inline-block", overflow: "hidden" }}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <span style={{ display: "block", position: "relative" }}>
        <motion.span
          className={labelClassName}
          style={{ display: "block", transformOrigin: "left center" }}
          variants={{
            rest: { y: "0%", skewY: 0 },
            hover: { y: "-115%", skewY: -5 },
          }}
          transition={transition}
        >
          {children}
        </motion.span>
        <motion.span
          className={labelClassName}
          style={{
            display: "block",
            position: "absolute",
            top: 0,
            left: 0,
            transformOrigin: "left center",
          }}
          variants={{
            rest: { y: "115%", skewY: 5 },
            hover: { y: "0%", skewY: 0 },
          }}
          transition={transition}
        >
          {children}
        </motion.span>
      </span>
    </motion.a>
  );
}
