import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { EVENT } from "@/util/event";

export const alt = `${EVENT.name} — ${EVENT.dates} at ${EVENT.venue.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (...parts: string[]) => readFile(join(process.cwd(), "assets", ...parts));
const dataUri = (buf: Buffer) => `data:image/png;base64,${buf.toString("base64")}`;

export default async function OpengraphImage() {
  const [logo, grass, dirt, minecraft, minecraftBold] = await Promise.all([
    asset("logo.png"),
    asset("grass.png"),
    asset("dirt.png"),
    asset("fonts", "Minecraft.otf"),
    asset("fonts", "Minecraft-Bold.otf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // Dusk stops from the hero's sky ramp: deep night overhead falling to a sunset horizon.
          backgroundImage: "linear-gradient(180deg, rgb(4, 6, 20) 0%, rgb(40, 30, 90) 62%, rgb(180, 90, 70) 100%)",
          fontFamily: "Minecraft",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 10,
            color: "#f5ead0",
            opacity: 0.75,
            textShadow: "3px 3px 0 rgba(0,0,0,0.55)",
          }}
        >
          INNOGEEKS PRESENTS
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element -- satori renders raw <img>; next/image is unavailable here. */}
        <img src={dataUri(logo)} alt="" width={900} height={237} style={{ marginTop: 28 }} />

        <div
          style={{
            marginTop: 24,
            fontSize: 46,
            fontWeight: 700,
            color: "#ffd479",
            textShadow: "4px 4px 0 rgba(0,0,0,0.6)",
          }}
        >
          {EVENT.dates}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 28,
            color: "#f5ead0",
            textShadow: "3px 3px 0 rgba(0,0,0,0.55)",
          }}
        >
          {`${EVENT.venue.name} · ${EVENT.venue.city}`}
        </div>

        {/* Ground strip: a grass row over dirt, tiled at 42px so the pixels stay crisp. */}
        <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, right: 0, height: 84 }}>
          <div style={{ flex: 1, backgroundImage: `url(${dataUri(grass)})`, backgroundSize: "42px 42px" }} />
        </div>
        <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, right: 0, height: 42 }}>
          <div style={{ flex: 1, backgroundImage: `url(${dataUri(dirt)})`, backgroundSize: "42px 42px" }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Minecraft", data: minecraft, weight: 400, style: "normal" },
        { name: "Minecraft", data: minecraftBold, weight: 700, style: "normal" },
      ],
    },
  );
}
