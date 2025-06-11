import type { TextureOptions } from "twgl.js";
import type { SlidersOptionsMap } from "../sliders";

// This file is .gitignored so that changes in development do not get published at all.
// This file (and its imports) get included in the client bundle, so any override shaders
// would get included in the build.

export interface ShaderOverride {
  textures?: TextureOptions[];
  uniforms?: SlidersOptionsMap;
  vertex?: string;
  fragment?: string;
}

const OVERRIDES: Record<string, ShaderOverride> = {};

export function getShaderOverride(id: string): ShaderOverride {
  return OVERRIDES[id] ?? {};
}
