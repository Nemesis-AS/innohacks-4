import type { ReactNode } from "react";
import bookBg from "@/assets/book_bg.png";

type BookPageProps = {
  /** Mirror the page horizontally so its stitched spine edge faces the other way — use on the left page of a spread so both spines meet in the middle. */
  flip?: boolean;
  className?: string;
  children?: ReactNode;
};

/** A single page from the open book asset, stretched to fill its container, with content laid over the parchment. */
export function BookPage({ flip = false, className = "", children }: BookPageProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bookBg.src})`,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          transform: flip ? "scaleX(-1)" : undefined,
        }}
      />
      {/* The parchment asset's painted border eats a lot of a phone's width, so the
          inset steps up with the breakpoint rather than starting at desktop size. */}
      <div className="relative z-10 flex h-full flex-col gap-3 px-7 py-9 sm:px-10 sm:py-12 md:px-14 md:py-16">
        {children}
      </div>
    </div>
  );
}
