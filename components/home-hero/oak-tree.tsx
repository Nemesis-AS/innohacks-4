"use client";

import { motion } from "motion/react";
import oakLeavesTexture from "@/assets/oak_leaves.png";
import oakLogTexture from "@/assets/oak_log.png";

// 0 = empty, 1 = leaves, 2 = log — a small hand-authored oak tree built from block tiles.
const TREE_GRID = [
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 2, 0, 0],
  [0, 0, 2, 0, 0],
  [0, 0, 2, 0, 0],
];

const BLOCK_SIZE = 64; // same block size used across the site (floating island, transitions, etc.)
const COLS = TREE_GRID[0].length;
const ROWS = TREE_GRID.length;

/** Small oak tree composed from log/leaves block tiles, gently swaying. */
export function OakTree({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      style={{
        width: COLS * BLOCK_SIZE,
        height: ROWS * BLOCK_SIZE,
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, ${BLOCK_SIZE}px)`,
        gridTemplateRows: `repeat(${ROWS}, ${BLOCK_SIZE}px)`,
        transformOrigin: "bottom center",
      }}
      animate={{ rotate: [-1.5, 1.5, -1.5] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {TREE_GRID.flatMap((row, r) =>
        row.map((cell, c) => {
          if (cell === 0) return <div key={`${r}-${c}`} />;
          const texture = cell === 1 ? oakLeavesTexture : oakLogTexture;
          return (
            <div
              key={`${r}-${c}`}
              style={{
                backgroundImage: `url(${texture.src})`,
                backgroundSize: "100% 100%",
                imageRendering: "pixelated",
              }}
            />
          );
        }),
      )}
    </motion.div>
  );
}
