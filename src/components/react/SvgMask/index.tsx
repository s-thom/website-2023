import type { ReactNode } from "react";
import seedrandom from "seedrandom";
import { IconMask, type IconType as InnerIconType } from "./IconMask.tsx";
import { NoneMask } from "./NoneMask.tsx";
import { WaveMask } from "./WaveMask.tsx";

export type MaskType = "none" | "waves";
export type IconType = "none" | InnerIconType;

export interface SvgMaskProps extends React.PropsWithChildren {
  id: string;
  seed: string;
  width: number;
  height: number;
  maskType: MaskType;
  iconType: IconType;
  className?: string;
}

export function SvgMask({
  id,
  seed,
  width,
  height,
  maskType,
  iconType,
  children,
  className,
}: SvgMaskProps) {
  const random = seedrandom(seed);

  let iconMask: ReactNode;
  const iconMaskId = `${id}-icon`;
  switch (iconType) {
    case "none":
      iconMask = <NoneMask id={iconMaskId} height={height} width={width} />;
      break;
    default:
      iconMask = (
        <IconMask
          id={`${id}-icon`}
          random={random}
          iconMaskId={iconType}
          width={width}
          height={height}
          minIconSize={height * 0.75}
          maxIconSize={height}
        />
      );
  }

  let backgroundMask: ReactNode;
  switch (maskType) {
    case "waves":
      backgroundMask = (
        <WaveMask
          id={id}
          random={random}
          width={width}
          height={height}
          numDisplacements={2}
          pathCount={7}
          maskId={iconMaskId}
          animation={{ durationSeconds: 60, numKeyframes: 4 }}
        />
      );
      break;
    case "none":
    default:
      backgroundMask = (
        <NoneMask
          id={iconMaskId}
          height={height}
          width={width}
          maskId={iconMaskId}
        />
      );
      break;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ minWidth: `${width}px` }}
      preserveAspectRatio="xMidYMid"
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <style>{`
        .mask-layer {
          fill: rgba(255, 255, 255, 0.4);
        }
      `}</style>
      {iconMask}
      {backgroundMask}
      <foreignObject
        x="0"
        y="0"
        width={width}
        height={height}
        mask={`url(#${id})`}
      >
        {children}
      </foreignObject>
    </svg>
  );
}
