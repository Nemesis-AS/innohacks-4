"use client";

import { motion } from "motion/react";
import playerImg from "@/assets/player.svg";
import { OakTree } from "./oak-tree";

/**
 * Oak tree and player standee on the grass, off to the right of the hero content.
 * Gentle idle motion (player bob) so the scene doesn't feel static.
 */
export function SceneDecor() {
  return (
    <div className="absolute inset-x-0 bottom-16 z-[5] flex justify-end pointer-events-none pl-[6%] pr-[2%] md:pl-[10%] md:pr-[4%]">
      <div className="flex items-end gap-2 md:gap-4">
        <motion.img
          src={playerImg.src}
          alt=""
          className="h-[14vh] max-h-32 min-h-20 w-auto select-none"
          style={{ imageRendering: "pixelated" }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <OakTree className="select-none" />
      </div>
    </div>
  );
}
