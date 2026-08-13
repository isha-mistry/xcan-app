import path from "path";
import sharp from "sharp";

export const CERTIFICATE_WIDTH = 2000;
export const CERTIFICATE_HEIGHT = 1414;

/** Baseline Y for the recipient name, just above the printed underline. */
export const NAME_Y = 658;
export const NAME_FONT_SIZE = 54;
export const NAME_MAX_WIDTH = 1000;

/** Baseline Y for the pod name, in the gap between the two body-copy lines. */
export const POD_NAME_Y = 825;
export const POD_NAME_FONT_SIZE = 38;
export const POD_NAME_MAX_WIDTH = 1100;

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "images",
  "showcase_certificate.png",
);

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function fitFontSize(
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize = 22,
) {
  let size = maxSize;
  while (size > minSize && text.length * size * 0.55 > maxWidth) {
    size -= 2;
  }
  return size;
}

export function certificateFileName(memberName: string) {
  const slug = memberName
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `Certificate-${slug || "Participant"}.png`;
}

export async function renderShowcaseCertificate(opts: {
  memberName: string;
  podName: string;
}) {
  const name = opts.memberName.trim() || "Participant";
  const podName = opts.podName.trim() || "Builder Pod";
  const nameSize = fitFontSize(name, NAME_MAX_WIDTH, NAME_FONT_SIZE);
  const podSize = fitFontSize(podName, POD_NAME_MAX_WIDTH, POD_NAME_FONT_SIZE);

  const svg = `
    <svg width="${CERTIFICATE_WIDTH}" height="${CERTIFICATE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="${CERTIFICATE_WIDTH / 2}"
        y="${NAME_Y}"
        text-anchor="middle"
        font-family="Georgia, 'Times New Roman', Times, serif"
        font-size="${nameSize}"
        font-weight="700"
        fill="#111111"
      >${escapeXml(name)}</text>
      <text
        x="${CERTIFICATE_WIDTH / 2}"
        y="${POD_NAME_Y}"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${podSize}"
        font-weight="600"
        fill="#111111"
      >${escapeXml(podName)}</text>
    </svg>
  `;

  return sharp(TEMPLATE_PATH)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}
