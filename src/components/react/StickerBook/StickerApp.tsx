import { StickerContainer } from "./StickerContainer.tsx";

export interface StickerAppProps {
  id: string;
}

export function StickerApp({ id }: StickerAppProps) {
  return <StickerContainer id={id} />;
}
