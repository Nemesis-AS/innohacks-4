"use client";

import { motion } from "motion/react";
import { useEffect } from "react";

const HACKATHON_SLUG = "innohacks-4";
const SDK_SRC = "https://apply.devfolio.co/v2/sdk.js";

/**
 * "Apply with Devfolio" CTA. The SDK replaces the empty `.apply-button` div with
 * the real button, and only once the hackathon is verified on Devfolio — until
 * then this renders as nothing.
 */
export function DevfolioButton() {
  useEffect(() => {
    // The SDK hydrates every .apply-button on the page at load, so a single copy
    // is enough no matter how many buttons mount.
    if (document.querySelector(`script[src="${SDK_SRC}"]`)) return;

    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return (
    <motion.div
      className="pointer-events-auto"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12 }}
    >
      <div
        className="apply-button"
        data-hackathon-slug={HACKATHON_SLUG}
        data-button-theme="light"
        style={{ height: 44, width: 312 }}
      />
    </motion.div>
  );
}
