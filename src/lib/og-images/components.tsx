import { readFile } from "node:fs/promises";
import { join } from "node:path";
import pMemoize from "p-memoize";
import type { GenerateOgImageOptions } from ".";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "./constants";

const ADD_DEBUG_BOXES = false;

const getProfileImageUrl = pMemoize(
  async () =>
    `data:image/jpeg;base64,${await readFile(
      join(process.cwd(), "src/resources/profile-2023.jpg"),
      { encoding: "base64" },
    )}`,
);

function toChildren(...children: any[]) {
  return children.filter(Boolean).flatMap((c) => c);
}

async function SiteContent() {
  const profileImageUrl = await getProfileImageUrl();

  return (
    <div
      style={{
        position: "absolute",
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
      }}
    >
      <img
        src={profileImageUrl}
        width={256}
        height={256}
        style={{ borderRadius: "50%", marginBottom: "32px" }}
      />
      <h1 style={{ fontSize: "56px", margin: "16px", lineHeight: "56px" }}>
        Stuart Thomson
      </h1>
      <p style={{ fontSize: "32px", margin: "8px", lineHeight: "32px" }}>
        Software Developer | Human Being
      </p>
    </div>
  );
}

async function PageContent(title: string) {
  const profileImageUrl = await getProfileImageUrl();

  return (
    <div
      style={{
        position: "absolute",
        width: 800,
        height: 500,
        top: (OG_IMAGE_HEIGHT - 500) / 2,
        left: (OG_IMAGE_WIDTH - 800) / 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={profileImageUrl}
          width={76}
          height={76}
          style={{ borderRadius: "50%", marginRight: "32px" }}
        />
        <h1 style={{ fontSize: "48px", margin: 0 }}>Stuart Thomson</h1>
      </div>
      <h2 style={{ fontSize: "64px", alignSelf: "flex-end", margin: 16 }}>
        {title}
      </h2>
    </div>
  );
}

async function Background(
  backgroundImage: GenerateOgImageOptions["backgroundImage"],
) {
  if (!backgroundImage) {
    return (
      <div
        style={{
          position: "absolute",
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          backgroundColor: "#002355",
        }}
      />
    );
  }

  const backgroundImageUrl = `data:${
    backgroundImage.mimeType
  };base64,${await readFile(backgroundImage.filePath, { encoding: "base64" })}`;

  return toChildren(
    <img
      src={backgroundImageUrl}
      width={OG_IMAGE_WIDTH}
      height={OG_IMAGE_HEIGHT}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        objectFit: "cover",
      }}
    />,
    <div
      style={{
        position: "absolute",
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        backgroundColor: "rgba(0,0,0,0.6)",
      }}
    />,
  );
}

function debugBoxes() {
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 600,
          top: (OG_IMAGE_HEIGHT - 600) / 2,
          left: (OG_IMAGE_WIDTH - 800) / 2,
          border: "2px solid white",
          color: "white",
        }}
      >
        800x600
      </div>
    </div>
  );
}

export async function buildOgImageJsx(options: GenerateOgImageOptions) {
  let content: any;
  switch (options.layout) {
    case "site":
      content = await SiteContent();
      break;
    case "page":
    case "blog":
      content = await PageContent(options.title);
      break;
    default:
  }

  return (
    <div
      style={{
        position: "relative",
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Roboto",
      }}
    >
      {await Background(options.backgroundImage)}
      {content}
      {ADD_DEBUG_BOXES && debugBoxes()}
    </div>
  );
}
