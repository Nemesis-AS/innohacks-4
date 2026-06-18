"use client";

import { useEffect, useRef } from "react";

const NOISE_RESOLUTION = 96; // low-res grid, scaled up via CSS for a chunky, dithered void look

/** Static procedural noise resembling Minecraft's void — generated once on mount, no animation. */
export function VoidNoiseBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = NOISE_RESOLUTION;
    canvas.height = NOISE_RESOLUTION;

    const imageData = ctx.createImageData(NOISE_RESOLUTION, NOISE_RESOLUTION);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const shade = 6 + Math.floor(Math.random() * 14);
      imageData.data[i] = shade;
      imageData.data[i + 1] = shade;
      imageData.data[i + 2] = shade + 4; // faint purple-blue tint
      imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 h-full w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
