import WoodenSeamImg from "@/assets/wooden_seam.png";

export default function WoodenSeam() {
  return (
    <div className="h-0">
      <div
        className="z-10 pointer-events-none h-32 -translate-y-1/2 w-full bg-repeat-x bg-contain"
        style={{
          backgroundImage: `url("${WoodenSeamImg.src}")`,
        }}
      ></div>
    </div>
  );
}
