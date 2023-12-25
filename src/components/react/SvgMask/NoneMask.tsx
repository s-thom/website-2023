interface NoneMaskProps {
  id: string;
  width: number;
  height: number;
  maskId?: string;
}

export function NoneMask({ id, width, height, maskId }: NoneMaskProps) {
  return (
    <mask id={id}>
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="#FFFFFF"
        mask={maskId ? `url(#${maskId})` : ""}
      />
    </mask>
  );
}
