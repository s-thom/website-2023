import { trim } from "../util/trim";

interface CreateNoneMaskOptions {
  id: string;
  width: number;
  height: number;
  maskId?: string;
}

export function createNoneMask({
  id,
  width,
  height,
  maskId,
}: CreateNoneMaskOptions) {
  return trim`
    <mask id="${id}">
      <rect
        x='0'
        y='0'
        width="${width}"
        height="${height}"
        fill='#FFFFFF'
        mask="${maskId ? `url(#${maskId})` : ""}"
      />
    </mask>
  `;
}
