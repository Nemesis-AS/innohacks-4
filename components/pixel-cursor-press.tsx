"use client";

import { useEffect } from "react";

/**
 * Toggles `is-pressing` on <html> while a mouse button is held, which swaps the
 * pixel cursor for its darkened variant (see the cursor rules in globals.css).
 *
 * The rest of the cursor work is pure CSS — this exists only because there is no
 * `:active`-equivalent for the cursor itself. Renders nothing.
 */
export function PixelCursorPress() {
  useEffect(() => {
    const root = document.documentElement;
    // Touch and pen never show a cursor, so they have nothing to press.
    const press = (event: PointerEvent) => {
      if (event.pointerType === "mouse") root.classList.add("is-pressing");
    };
    // `blur` covers releasing the button outside the window, which fires no
    // pointerup and would otherwise leave the pressed cursor stuck on.
    const release = () => root.classList.remove("is-pressing");

    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);

    return () => {
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
      release();
    };
  }, []);

  return null;
}
