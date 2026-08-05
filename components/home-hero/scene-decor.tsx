"use client";

import { OakTree } from "./oak-tree";

/** Oak tree on the grass, off to the right of the hero content. */
export function SceneDecor() {
  return (
    <div className="absolute inset-x-0 bottom-16 z-[5] flex justify-end pointer-events-none pl-[6%] pr-[2%] md:pl-[10%] md:pr-[4%]">
      <div className="flex items-end gap-2 md:gap-4">
        <OakTree className="select-none" />
      </div>
    </div>
  );
}
