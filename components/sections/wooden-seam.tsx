import WoodenSeamImg from "@/assets/wooden_seam.png";

export default function WoodenSeam() {
  return (
    <div className="h-0">
      <div
        className="z-10 pointer-events-none w-full aspect-[1266/110] -translate-y-1/2 bg-no-repeat"
        style={{
          backgroundImage: `url("${WoodenSeamImg.src}")`,
          backgroundSize: "100% 100%",
        }}
      ></div>
    </div>
  );
}
