// Copied from final JS bundle, but original source is at https://github.com/cocopon/tweakpane/tree/main/packages/tweakpane/src/main/sass
export const tweakpaneCSS = `
.tp-tbiv_b,
.tp-coltxtv_ms,
.tp-colswv_b,
.tp-ckbv_i,
.tp-sglv_i,
.tp-mllv_i,
.tp-grlv_g,
.tp-txtv_i,
.tp-p2dpv_p,
.tp-colswv_sw,
.tp-rotv_b,
.tp-fldv_b,
.tp-p2dv_b,
.tp-btnv_b,
.tp-lstv_s {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: rgba(0, 0, 0, 0);
  border-width: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  margin: 0;
  outline: none;
  padding: 0
}

.tp-p2dv_b,
.tp-btnv_b,
.tp-lstv_s {
  background-color: var(--btn-bg);
  border-radius: var(--bld-br);
  color: var(--btn-fg);
  cursor: pointer;
  display: block;
  font-weight: bold;
  height: var(--cnt-usz);
  line-height: var(--cnt-usz);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.tp-p2dv_b:hover,
.tp-btnv_b:hover,
.tp-lstv_s:hover {
  background-color: var(--btn-bg-h)
}

.tp-p2dv_b:focus,
.tp-btnv_b:focus,
.tp-lstv_s:focus {
  background-color: var(--btn-bg-f)
}

.tp-p2dv_b:active,
.tp-btnv_b:active,
.tp-lstv_s:active {
  background-color: var(--btn-bg-a)
}

.tp-p2dv_b:disabled,
.tp-btnv_b:disabled,
.tp-lstv_s:disabled {
  opacity: .5
}

.tp-rotv_c>.tp-cntv.tp-v-lst,
.tp-tbpv_c>.tp-cntv.tp-v-lst,
.tp-fldv_c>.tp-cntv.tp-v-lst {
  margin-bottom: calc(-1*var(--cnt-vp))
}

.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_c,
.tp-tbpv_c>.tp-fldv.tp-v-lst .tp-fldv_c,
.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_c {
  border-bottom-left-radius: 0
}

.tp-rotv_c>.tp-fldv.tp-v-lst .tp-fldv_b,
.tp-tbpv_c>.tp-fldv.tp-v-lst .tp-fldv_b,
.tp-fldv_c>.tp-fldv.tp-v-lst .tp-fldv_b {
  border-bottom-left-radius: 0
}

.tp-rotv_c>*:not(.tp-v-fst),
.tp-tbpv_c>*:not(.tp-v-fst),
.tp-fldv_c>*:not(.tp-v-fst) {
  margin-top: var(--cnt-usp)
}

.tp-rotv_c>.tp-sprv:not(.tp-v-fst),
.tp-tbpv_c>.tp-sprv:not(.tp-v-fst),
.tp-fldv_c>.tp-sprv:not(.tp-v-fst),
.tp-rotv_c>.tp-cntv:not(.tp-v-fst),
.tp-tbpv_c>.tp-cntv:not(.tp-v-fst),
.tp-fldv_c>.tp-cntv:not(.tp-v-fst) {
  margin-top: var(--cnt-vp)
}

.tp-rotv_c>.tp-sprv+*:not(.tp-v-hidden),
.tp-tbpv_c>.tp-sprv+*:not(.tp-v-hidden),
.tp-fldv_c>.tp-sprv+*:not(.tp-v-hidden),
.tp-rotv_c>.tp-cntv+*:not(.tp-v-hidden),
.tp-tbpv_c>.tp-cntv+*:not(.tp-v-hidden),
.tp-fldv_c>.tp-cntv+*:not(.tp-v-hidden) {
  margin-top: var(--cnt-vp)
}

.tp-rotv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,
.tp-tbpv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,
.tp-fldv_c>.tp-sprv:not(.tp-v-hidden)+.tp-sprv,
.tp-rotv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,
.tp-tbpv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv,
.tp-fldv_c>.tp-cntv:not(.tp-v-hidden)+.tp-cntv {
  margin-top: 0
}

.tp-tbpv_c>.tp-cntv,
.tp-fldv_c>.tp-cntv {
  margin-left: 4px
}

.tp-tbpv_c>.tp-fldv>.tp-fldv_b,
.tp-fldv_c>.tp-fldv>.tp-fldv_b {
  border-top-left-radius: var(--bld-br);
  border-bottom-left-radius: var(--bld-br)
}

.tp-tbpv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b,
.tp-fldv_c>.tp-fldv.tp-fldv-expanded>.tp-fldv_b {
  border-bottom-left-radius: 0
}

.tp-tbpv_c .tp-fldv>.tp-fldv_c,
.tp-fldv_c .tp-fldv>.tp-fldv_c {
  border-bottom-left-radius: var(--bld-br)
}

.tp-tbpv_c>.tp-cntv+.tp-fldv>.tp-fldv_b,
.tp-fldv_c>.tp-cntv+.tp-fldv>.tp-fldv_b {
  border-top-left-radius: 0
}

.tp-tbpv_c>.tp-cntv+.tp-tabv>.tp-tabv_t,
.tp-fldv_c>.tp-cntv+.tp-tabv>.tp-tabv_t {
  border-top-left-radius: 0
}

.tp-tbpv_c>.tp-tabv>.tp-tabv_t,
.tp-fldv_c>.tp-tabv>.tp-tabv_t {
  border-top-left-radius: var(--bld-br)
}

.tp-tbpv_c .tp-tabv>.tp-tabv_c,
.tp-fldv_c .tp-tabv>.tp-tabv_c {
  border-bottom-left-radius: var(--bld-br)
}

.tp-rotv_b,
.tp-fldv_b {
  background-color: var(--cnt-bg);
  color: var(--cnt-fg);
  cursor: pointer;
  display: block;
  height: calc(var(--cnt-usz) + 4px);
  line-height: calc(var(--cnt-usz) + 4px);
  overflow: hidden;
  padding-left: var(--cnt-hp);
  padding-right: calc(4px + var(--cnt-usz) + var(--cnt-hp));
  position: relative;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  transition: border-radius .2s ease-in-out .2s
}

.tp-rotv_b:hover,
.tp-fldv_b:hover {
  background-color: var(--cnt-bg-h)
}

.tp-rotv_b:focus,
.tp-fldv_b:focus {
  background-color: var(--cnt-bg-f)
}

.tp-rotv_b:active,
.tp-fldv_b:active {
  background-color: var(--cnt-bg-a)
}

.tp-rotv_b:disabled,
.tp-fldv_b:disabled {
  opacity: .5
}

.tp-rotv_m,
.tp-fldv_m {
  background: linear-gradient(to left, var(--cnt-fg), var(--cnt-fg) 2px, transparent 2px, transparent 4px, var(--cnt-fg) 4px);
  border-radius: 2px;
  bottom: 0;
  content: "";
  display: block;
  height: 6px;
  right: calc(var(--cnt-hp) + (var(--cnt-usz) + 4px - 6px)/2 - 2px);
  margin: auto;
  opacity: .5;
  position: absolute;
  top: 0;
  transform: rotate(90deg);
  transition: transform .2s ease-in-out;
  width: 6px
}

.tp-rotv.tp-rotv-expanded .tp-rotv_m,
.tp-fldv.tp-fldv-expanded>.tp-fldv_b>.tp-fldv_m {
  transform: none
}

.tp-rotv_c,
.tp-fldv_c {
  box-sizing: border-box;
  height: 0;
  opacity: 0;
  overflow: hidden;
  padding-bottom: 0;
  padding-top: 0;
  position: relative;
  transition: height .2s ease-in-out, opacity .2s linear, padding .2s ease-in-out
}

.tp-rotv.tp-rotv-cpl:not(.tp-rotv-expanded) .tp-rotv_c,
.tp-fldv.tp-fldv-cpl:not(.tp-fldv-expanded)>.tp-fldv_c {
  display: none
}

.tp-rotv.tp-rotv-expanded .tp-rotv_c,
.tp-fldv.tp-fldv-expanded>.tp-fldv_c {
  opacity: 1;
  padding-bottom: var(--cnt-vp);
  padding-top: var(--cnt-vp);
  transform: none;
  overflow: visible;
  transition: height .2s ease-in-out, opacity .2s linear .2s, padding .2s ease-in-out
}

.tp-txtv_i,
.tp-p2dpv_p,
.tp-colswv_sw {
  background-color: var(--in-bg);
  border-radius: var(--bld-br);
  box-sizing: border-box;
  color: var(--in-fg);
  font-family: inherit;
  height: var(--cnt-usz);
  line-height: var(--cnt-usz);
  min-width: 0;
  width: 100%
}

.tp-txtv_i:hover,
.tp-p2dpv_p:hover,
.tp-colswv_sw:hover {
  background-color: var(--in-bg-h)
}

.tp-txtv_i:focus,
.tp-p2dpv_p:focus,
.tp-colswv_sw:focus {
  background-color: var(--in-bg-f)
}

.tp-txtv_i:active,
.tp-p2dpv_p:active,
.tp-colswv_sw:active {
  background-color: var(--in-bg-a)
}

.tp-txtv_i:disabled,
.tp-p2dpv_p:disabled,
.tp-colswv_sw:disabled {
  opacity: .5
}

.tp-lstv,
.tp-coltxtv_m {
  position: relative
}

.tp-lstv_s {
  padding: 0 20px 0 4px;
  width: 100%
}

.tp-lstv_m,
.tp-coltxtv_mm {
  bottom: 0;
  margin: auto;
  pointer-events: none;
  position: absolute;
  right: 2px;
  top: 0
}

.tp-lstv_m svg,
.tp-coltxtv_mm svg {
  bottom: 0;
  height: 16px;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  width: 16px
}

.tp-lstv_m svg path,
.tp-coltxtv_mm svg path {
  fill: currentColor
}

.tp-sglv_i,
.tp-mllv_i,
.tp-grlv_g {
  background-color: var(--mo-bg);
  border-radius: var(--bld-br);
  box-sizing: border-box;
  color: var(--mo-fg);
  height: var(--cnt-usz);
  scrollbar-color: currentColor rgba(0, 0, 0, 0);
  scrollbar-width: thin;
  width: 100%
}

.tp-sglv_i::-webkit-scrollbar,
.tp-mllv_i::-webkit-scrollbar,
.tp-grlv_g::-webkit-scrollbar {
  height: 8px;
  width: 8px
}

.tp-sglv_i::-webkit-scrollbar-corner,
.tp-mllv_i::-webkit-scrollbar-corner,
.tp-grlv_g::-webkit-scrollbar-corner {
  background-color: rgba(0, 0, 0, 0)
}

.tp-sglv_i::-webkit-scrollbar-thumb,
.tp-mllv_i::-webkit-scrollbar-thumb,
.tp-grlv_g::-webkit-scrollbar-thumb {
  background-clip: padding-box;
  background-color: currentColor;
  border: rgba(0, 0, 0, 0) solid 2px;
  border-radius: 4px
}

.tp-pndtxtv,
.tp-coltxtv_w {
  display: flex
}

.tp-pndtxtv_a,
.tp-coltxtv_c {
  width: 100%
}

.tp-pndtxtv_a+.tp-pndtxtv_a,
.tp-coltxtv_c+.tp-pndtxtv_a,
.tp-pndtxtv_a+.tp-coltxtv_c,
.tp-coltxtv_c+.tp-coltxtv_c {
  margin-left: 2px
}

.tp-rotv {
  --bs-bg: var(--tp-base-background-color, hsl(230, 7%, 17%));
  --bs-br: var(--tp-base-border-radius, 6px);
  --bs-ff: var(--tp-base-font-family, Roboto Mono, Source Code Pro, Menlo, Courier, monospace);
  --bs-sh: var(--tp-base-shadow-color, rgba(0, 0, 0, 0.2));
  --bld-br: var(--tp-blade-border-radius, 2px);
  --bld-hp: var(--tp-blade-horizontal-padding, 4px);
  --bld-vw: var(--tp-blade-value-width, 160px);
  --btn-bg: var(--tp-button-background-color, hsl(230, 7%, 70%));
  --btn-bg-a: var(--tp-button-background-color-active, #d6d7db);
  --btn-bg-f: var(--tp-button-background-color-focus, #c8cad0);
  --btn-bg-h: var(--tp-button-background-color-hover, #bbbcc4);
  --btn-fg: var(--tp-button-foreground-color, hsl(230, 7%, 17%));
  --cnt-bg: var(--tp-container-background-color, rgba(187, 188, 196, 0.1));
  --cnt-bg-a: var(--tp-container-background-color-active, rgba(187, 188, 196, 0.25));
  --cnt-bg-f: var(--tp-container-background-color-focus, rgba(187, 188, 196, 0.2));
  --cnt-bg-h: var(--tp-container-background-color-hover, rgba(187, 188, 196, 0.15));
  --cnt-fg: var(--tp-container-foreground-color, hsl(230, 7%, 75%));
  --cnt-hp: var(--tp-container-horizontal-padding, 4px);
  --cnt-vp: var(--tp-container-vertical-padding, 4px);
  --cnt-usp: var(--tp-container-unit-spacing, 4px);
  --cnt-usz: var(--tp-container-unit-size, 20px);
  --in-bg: var(--tp-input-background-color, rgba(187, 188, 196, 0.1));
  --in-bg-a: var(--tp-input-background-color-active, rgba(187, 188, 196, 0.25));
  --in-bg-f: var(--tp-input-background-color-focus, rgba(187, 188, 196, 0.2));
  --in-bg-h: var(--tp-input-background-color-hover, rgba(187, 188, 196, 0.15));
  --in-fg: var(--tp-input-foreground-color, hsl(230, 7%, 75%));
  --lbl-fg: var(--tp-label-foreground-color, rgba(187, 188, 196, 0.7));
  --mo-bg: var(--tp-monitor-background-color, rgba(0, 0, 0, 0.2));
  --mo-fg: var(--tp-monitor-foreground-color, rgba(187, 188, 196, 0.7));
  --grv-fg: var(--tp-groove-foreground-color, rgba(187, 188, 196, 0.1))
}

.tp-btnv_b {
  width: 100%
}

.tp-btnv_t {
  text-align: center
}

.tp-ckbv_l {
  display: block;
  position: relative
}

.tp-ckbv_i {
  left: 0;
  opacity: 0;
  position: absolute;
  top: 0
}

.tp-ckbv_w {
  background-color: var(--in-bg);
  border-radius: var(--bld-br);
  cursor: pointer;
  display: block;
  height: var(--cnt-usz);
  position: relative;
  width: var(--cnt-usz)
}

.tp-ckbv_w svg {
  display: block;
  height: 16px;
  inset: 0;
  margin: auto;
  opacity: 0;
  position: absolute;
  width: 16px
}

.tp-ckbv_w svg path {
  fill: none;
  stroke: var(--in-fg);
  stroke-width: 2
}

.tp-ckbv_i:hover+.tp-ckbv_w {
  background-color: var(--in-bg-h)
}

.tp-ckbv_i:focus+.tp-ckbv_w {
  background-color: var(--in-bg-f)
}

.tp-ckbv_i:active+.tp-ckbv_w {
  background-color: var(--in-bg-a)
}

.tp-ckbv_i:checked+.tp-ckbv_w svg {
  opacity: 1
}

.tp-ckbv.tp-v-disabled .tp-ckbv_w {
  opacity: .5
}

.tp-colv {
  position: relative
}

.tp-colv_h {
  display: flex
}

.tp-colv_s {
  flex-grow: 0;
  flex-shrink: 0;
  width: var(--cnt-usz)
}

.tp-colv_t {
  flex: 1;
  margin-left: 4px
}

.tp-colv_p {
  height: 0;
  margin-top: 0;
  opacity: 0;
  overflow: hidden;
  transition: height .2s ease-in-out, opacity .2s linear, margin .2s ease-in-out
}

.tp-colv.tp-colv-expanded.tp-colv-cpl .tp-colv_p {
  overflow: visible
}

.tp-colv.tp-colv-expanded .tp-colv_p {
  margin-top: var(--cnt-usp);
  opacity: 1
}

.tp-colv .tp-popv {
  left: calc(-1*var(--cnt-hp));
  right: calc(-1*var(--cnt-hp));
  top: var(--cnt-usz)
}

.tp-colpv_h,
.tp-colpv_ap {
  margin-left: 6px;
  margin-right: 6px
}

.tp-colpv_h {
  margin-top: var(--cnt-usp)
}

.tp-colpv_rgb {
  display: flex;
  margin-top: var(--cnt-usp);
  width: 100%
}

.tp-colpv_a {
  display: flex;
  margin-top: var(--cnt-vp);
  padding-top: calc(var(--cnt-vp) + 2px);
  position: relative
}

.tp-colpv_a::before {
  background-color: var(--grv-fg);
  content: "";
  height: 2px;
  left: calc(-1*var(--cnt-hp));
  position: absolute;
  right: calc(-1*var(--cnt-hp));
  top: 0
}

.tp-colpv.tp-v-disabled .tp-colpv_a::before {
  opacity: .5
}

.tp-colpv_ap {
  align-items: center;
  display: flex;
  flex: 3
}

.tp-colpv_at {
  flex: 1;
  margin-left: 4px
}

.tp-svpv {
  border-radius: var(--bld-br);
  outline: none;
  overflow: hidden;
  position: relative
}

.tp-svpv.tp-v-disabled {
  opacity: .5
}

.tp-svpv_c {
  cursor: crosshair;
  display: block;
  height: calc(var(--cnt-usz)*4);
  width: 100%
}

.tp-svpv_m {
  border-radius: 100%;
  border: rgba(255, 255, 255, .75) solid 2px;
  box-sizing: border-box;
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));
  height: 12px;
  margin-left: -6px;
  margin-top: -6px;
  pointer-events: none;
  position: absolute;
  width: 12px
}

.tp-svpv:focus .tp-svpv_m {
  border-color: #fff
}

.tp-hplv {
  cursor: pointer;
  height: var(--cnt-usz);
  outline: none;
  position: relative
}

.tp-hplv.tp-v-disabled {
  opacity: .5
}

.tp-hplv_c {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAABCAYAAABubagXAAAAQ0lEQVQoU2P8z8Dwn0GCgQEDi2OK/RBgYHjBgIpfovFh8j8YBIgzFGQxuqEgPhaDOT5gOhPkdCxOZeBg+IDFZZiGAgCaSSMYtcRHLgAAAABJRU5ErkJggg==);
  background-position: left top;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border-radius: 2px;
  display: block;
  height: 4px;
  left: 0;
  margin-top: -2px;
  position: absolute;
  top: 50%;
  width: 100%
}

.tp-hplv_m {
  border-radius: var(--bld-br);
  border: rgba(255, 255, 255, .75) solid 2px;
  box-shadow: 0 0 2px rgba(0, 0, 0, .1);
  box-sizing: border-box;
  height: 12px;
  left: 50%;
  margin-left: -6px;
  margin-top: -6px;
  pointer-events: none;
  position: absolute;
  top: 50%;
  width: 12px
}

.tp-hplv:focus .tp-hplv_m {
  border-color: #fff
}

.tp-aplv {
  cursor: pointer;
  height: var(--cnt-usz);
  outline: none;
  position: relative;
  width: 100%
}

.tp-aplv.tp-v-disabled {
  opacity: .5
}

.tp-aplv_b {
  background-color: #fff;
  background-image: linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);
  background-size: 4px 4px;
  background-position: 0 0, 2px 2px;
  border-radius: 2px;
  display: block;
  height: 4px;
  left: 0;
  margin-top: -2px;
  overflow: hidden;
  position: absolute;
  top: 50%;
  width: 100%
}

.tp-aplv_c {
  inset: 0;
  position: absolute
}

.tp-aplv_m {
  background-color: #fff;
  background-image: linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);
  background-size: 12px 12px;
  background-position: 0 0, 6px 6px;
  border-radius: var(--bld-br);
  box-shadow: 0 0 2px rgba(0, 0, 0, .1);
  height: 12px;
  left: 50%;
  margin-left: -6px;
  margin-top: -6px;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  top: 50%;
  width: 12px
}

.tp-aplv_p {
  border-radius: var(--bld-br);
  border: rgba(255, 255, 255, .75) solid 2px;
  box-sizing: border-box;
  inset: 0;
  position: absolute
}

.tp-aplv:focus .tp-aplv_p {
  border-color: #fff
}

.tp-colswv {
  background-color: #fff;
  background-image: linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), linear-gradient(to top right, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%);
  background-size: 10px 10px;
  background-position: 0 0, 5px 5px;
  border-radius: var(--bld-br);
  overflow: hidden
}

.tp-colswv.tp-v-disabled {
  opacity: .5
}

.tp-colswv_sw {
  border-radius: 0
}

.tp-colswv_b {
  cursor: pointer;
  display: block;
  height: var(--cnt-usz);
  left: 0;
  position: absolute;
  top: 0;
  width: var(--cnt-usz)
}

.tp-colswv_b:focus::after {
  border: rgba(255, 255, 255, .75) solid 2px;
  border-radius: var(--bld-br);
  content: "";
  display: block;
  inset: 0;
  position: absolute
}

.tp-coltxtv {
  display: flex;
  width: 100%
}

.tp-coltxtv_m {
  margin-right: 4px
}

.tp-coltxtv_ms {
  border-radius: var(--bld-br);
  color: var(--lbl-fg);
  cursor: pointer;
  height: var(--cnt-usz);
  line-height: var(--cnt-usz);
  padding: 0 18px 0 4px
}

.tp-coltxtv_ms:hover {
  background-color: var(--in-bg-h)
}

.tp-coltxtv_ms:focus {
  background-color: var(--in-bg-f)
}

.tp-coltxtv_ms:active {
  background-color: var(--in-bg-a)
}

.tp-coltxtv_mm {
  color: var(--lbl-fg)
}

.tp-coltxtv.tp-v-disabled .tp-coltxtv_mm {
  opacity: .5
}

.tp-coltxtv_w {
  flex: 1
}

.tp-dfwv {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 256px
}

.tp-fldv {
  position: relative
}

.tp-fldv_t {
  padding-left: 4px
}

.tp-fldv_b:disabled .tp-fldv_m {
  display: none
}

.tp-fldv_c {
  padding-left: 4px
}

.tp-fldv_i {
  bottom: 0;
  color: var(--cnt-bg);
  left: 0;
  overflow: hidden;
  position: absolute;
  top: calc(var(--cnt-usz) + 4px);
  width: max(var(--bs-br), 4px)
}

.tp-fldv_i::before {
  background-color: currentColor;
  bottom: 0;
  content: "";
  left: 0;
  position: absolute;
  top: 0;
  width: 4px
}

.tp-fldv_b:hover+.tp-fldv_i {
  color: var(--cnt-bg-h)
}

.tp-fldv_b:focus+.tp-fldv_i {
  color: var(--cnt-bg-f)
}

.tp-fldv_b:active+.tp-fldv_i {
  color: var(--cnt-bg-a)
}

.tp-fldv.tp-v-disabled>.tp-fldv_i {
  opacity: .5
}

.tp-grlv {
  position: relative
}

.tp-grlv_g {
  display: block;
  height: calc(var(--cnt-usz)*3)
}

.tp-grlv_g polyline {
  fill: none;
  stroke: var(--mo-fg);
  stroke-linejoin: round
}

.tp-grlv_t {
  margin-top: -4px;
  transition: left .05s, top .05s;
  visibility: hidden
}

.tp-grlv_t.tp-grlv_t-a {
  visibility: visible
}

.tp-grlv_t.tp-grlv_t-in {
  transition: none
}

.tp-grlv.tp-v-disabled .tp-grlv_g {
  opacity: .5
}

.tp-grlv .tp-ttv {
  background-color: var(--mo-fg)
}

.tp-grlv .tp-ttv::before {
  border-top-color: var(--mo-fg)
}

.tp-lblv {
  align-items: center;
  display: flex;
  line-height: 1.3;
  padding-left: var(--cnt-hp);
  padding-right: var(--cnt-hp)
}

.tp-lblv.tp-lblv-nol {
  display: block
}

.tp-lblv_l {
  color: var(--lbl-fg);
  flex: 1;
  -webkit-hyphens: auto;
  hyphens: auto;
  overflow: hidden;
  padding-left: 4px;
  padding-right: 16px
}

.tp-lblv.tp-v-disabled .tp-lblv_l {
  opacity: .5
}

.tp-lblv.tp-lblv-nol .tp-lblv_l {
  display: none
}

.tp-lblv_v {
  align-self: flex-start;
  flex-grow: 0;
  flex-shrink: 0;
  width: var(--bld-vw)
}

.tp-lblv.tp-lblv-nol .tp-lblv_v {
  width: 100%
}

.tp-lstv_s {
  padding: 0 20px 0 var(--bld-hp);
  width: 100%
}

.tp-lstv_m {
  color: var(--btn-fg)
}

.tp-sglv_i {
  padding-left: var(--bld-hp);
  padding-right: var(--bld-hp)
}

.tp-sglv.tp-v-disabled .tp-sglv_i {
  opacity: .5
}

.tp-mllv_i {
  display: block;
  height: calc(var(--cnt-usz)*3);
  line-height: var(--cnt-usz);
  padding-left: var(--bld-hp);
  padding-right: var(--bld-hp);
  resize: none;
  white-space: pre
}

.tp-mllv.tp-v-disabled .tp-mllv_i {
  opacity: .5
}

.tp-p2dv {
  position: relative
}

.tp-p2dv_h {
  display: flex
}

.tp-p2dv_b {
  height: var(--cnt-usz);
  margin-right: 4px;
  position: relative;
  width: var(--cnt-usz)
}

.tp-p2dv_b svg {
  display: block;
  height: 16px;
  left: 50%;
  margin-left: -8px;
  margin-top: -8px;
  position: absolute;
  top: 50%;
  width: 16px
}

.tp-p2dv_b svg path {
  stroke: currentColor;
  stroke-width: 2
}

.tp-p2dv_b svg circle {
  fill: currentColor
}

.tp-p2dv_t {
  flex: 1
}

.tp-p2dv_p {
  height: 0;
  margin-top: 0;
  opacity: 0;
  overflow: hidden;
  transition: height .2s ease-in-out, opacity .2s linear, margin .2s ease-in-out
}

.tp-p2dv.tp-p2dv-expanded .tp-p2dv_p {
  margin-top: var(--cnt-usp);
  opacity: 1
}

.tp-p2dv .tp-popv {
  left: calc(-1*var(--cnt-hp));
  right: calc(-1*var(--cnt-hp));
  top: var(--cnt-usz)
}

.tp-p2dpv {
  padding-left: calc(var(--cnt-usz) + 4px)
}

.tp-p2dpv_p {
  cursor: crosshair;
  height: 0;
  overflow: hidden;
  padding-bottom: 100%;
  position: relative
}

.tp-p2dpv.tp-v-disabled .tp-p2dpv_p {
  opacity: .5
}

.tp-p2dpv_g {
  display: block;
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%
}

.tp-p2dpv_ax {
  opacity: .1;
  stroke: var(--in-fg);
  stroke-dasharray: 1
}

.tp-p2dpv_l {
  opacity: .5;
  stroke: var(--in-fg);
  stroke-dasharray: 1
}

.tp-p2dpv_m {
  border: var(--in-fg) solid 1px;
  border-radius: 50%;
  box-sizing: border-box;
  height: 4px;
  margin-left: -2px;
  margin-top: -2px;
  position: absolute;
  width: 4px
}

.tp-p2dpv_p:focus .tp-p2dpv_m {
  background-color: var(--in-fg);
  border-width: 0
}

.tp-popv {
  background-color: var(--bs-bg);
  border-radius: var(--bs-br);
  box-shadow: 0 2px 4px var(--bs-sh);
  display: none;
  max-width: var(--bld-vw);
  padding: var(--cnt-vp) var(--cnt-hp);
  position: absolute;
  visibility: hidden;
  z-index: 1000
}

.tp-popv.tp-popv-v {
  display: block;
  visibility: visible
}

.tp-sldv.tp-v-disabled {
  opacity: .5
}

.tp-sldv_t {
  box-sizing: border-box;
  cursor: pointer;
  height: var(--cnt-usz);
  margin: 0 6px;
  outline: none;
  position: relative
}

.tp-sldv_t::before {
  background-color: var(--in-bg);
  border-radius: 1px;
  content: "";
  display: block;
  height: 2px;
  inset: 0;
  margin: auto;
  position: absolute
}

.tp-sldv_k {
  height: 100%;
  left: 0;
  position: absolute;
  top: 0
}

.tp-sldv_k::before {
  background-color: var(--in-fg);
  border-radius: 1px;
  content: "";
  display: block;
  height: 2px;
  inset: 0;
  margin-bottom: auto;
  margin-top: auto;
  position: absolute
}

.tp-sldv_k::after {
  background-color: var(--btn-bg);
  border-radius: var(--bld-br);
  bottom: 0;
  content: "";
  display: block;
  height: 12px;
  margin-bottom: auto;
  margin-top: auto;
  position: absolute;
  right: -6px;
  top: 0;
  width: 12px
}

.tp-sldv_t:hover .tp-sldv_k::after {
  background-color: var(--btn-bg-h)
}

.tp-sldv_t:focus .tp-sldv_k::after {
  background-color: var(--btn-bg-f)
}

.tp-sldv_t:active .tp-sldv_k::after {
  background-color: var(--btn-bg-a)
}

.tp-sldtxtv {
  display: flex
}

.tp-sldtxtv_s {
  flex: 2
}

.tp-sldtxtv_t {
  flex: 1;
  margin-left: 4px
}

.tp-tabv {
  position: relative
}

.tp-tabv_t {
  align-items: flex-end;
  color: var(--cnt-bg);
  display: flex;
  overflow: hidden;
  position: relative
}

.tp-tabv_t:hover {
  color: var(--cnt-bg-h)
}

.tp-tabv_t:has(*:focus) {
  color: var(--cnt-bg-f)
}

.tp-tabv_t:has(*:active) {
  color: var(--cnt-bg-a)
}

.tp-tabv_t::before {
  background-color: currentColor;
  bottom: 0;
  content: "";
  height: 2px;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0
}

.tp-tabv.tp-v-disabled .tp-tabv_t::before {
  opacity: .5
}

.tp-tabv.tp-tabv-nop .tp-tabv_t {
  height: calc(var(--cnt-usz) + 4px);
  position: relative
}

.tp-tabv.tp-tabv-nop .tp-tabv_t::before {
  background-color: var(--cnt-bg);
  bottom: 0;
  content: "";
  height: 2px;
  left: 0;
  position: absolute;
  right: 0
}

.tp-tabv_i {
  bottom: 0;
  color: var(--cnt-bg);
  left: 0;
  overflow: hidden;
  position: absolute;
  top: calc(var(--cnt-usz) + 4px);
  width: max(var(--bs-br), 4px)
}

.tp-tabv_i::before {
  background-color: currentColor;
  bottom: 0;
  content: "";
  left: 0;
  position: absolute;
  top: 0;
  width: 4px
}

.tp-tabv_t:hover+.tp-tabv_i {
  color: var(--cnt-bg-h)
}

.tp-tabv_t:has(*:focus)+.tp-tabv_i {
  color: var(--cnt-bg-f)
}

.tp-tabv_t:has(*:active)+.tp-tabv_i {
  color: var(--cnt-bg-a)
}

.tp-tabv.tp-v-disabled>.tp-tabv_i {
  opacity: .5
}

.tp-tbiv {
  flex: 1;
  min-width: 0;
  position: relative
}

.tp-tbiv+.tp-tbiv {
  margin-left: 2px
}

.tp-tbiv+.tp-tbiv.tp-v-disabled::before {
  opacity: .5
}

.tp-tbiv_b {
  display: block;
  padding-left: calc(var(--cnt-hp) + 4px);
  padding-right: calc(var(--cnt-hp) + 4px);
  position: relative;
  width: 100%
}

.tp-tbiv_b:disabled {
  opacity: .5
}

.tp-tbiv_b::before {
  background-color: var(--cnt-bg);
  content: "";
  inset: 0 0 2px;
  pointer-events: none;
  position: absolute
}

.tp-tbiv_b:hover::before {
  background-color: var(--cnt-bg-h)
}

.tp-tbiv_b:focus::before {
  background-color: var(--cnt-bg-f)
}

.tp-tbiv_b:active::before {
  background-color: var(--cnt-bg-a)
}

.tp-tbiv_t {
  color: var(--cnt-fg);
  height: calc(var(--cnt-usz) + 4px);
  line-height: calc(var(--cnt-usz) + 4px);
  opacity: .5;
  overflow: hidden;
  position: relative;
  text-overflow: ellipsis
}

.tp-tbiv.tp-tbiv-sel .tp-tbiv_t {
  opacity: 1
}

.tp-tbpv_c {
  padding-bottom: var(--cnt-vp);
  padding-left: 4px;
  padding-top: var(--cnt-vp)
}

.tp-txtv {
  position: relative
}

.tp-txtv_i {
  padding-left: var(--bld-hp);
  padding-right: var(--bld-hp)
}

.tp-txtv.tp-txtv-fst .tp-txtv_i {
  border-bottom-right-radius: 0;
  border-top-right-radius: 0
}

.tp-txtv.tp-txtv-mid .tp-txtv_i {
  border-radius: 0
}

.tp-txtv.tp-txtv-lst .tp-txtv_i {
  border-bottom-left-radius: 0;
  border-top-left-radius: 0
}

.tp-txtv.tp-txtv-num .tp-txtv_i {
  text-align: right
}

.tp-txtv.tp-txtv-drg .tp-txtv_i {
  opacity: .3
}

.tp-txtv_k {
  cursor: pointer;
  height: 100%;
  left: calc(var(--bld-hp) - 5px);
  position: absolute;
  top: 0;
  width: 12px
}

.tp-txtv_k::before {
  background-color: var(--in-fg);
  border-radius: 1px;
  bottom: 0;
  content: "";
  height: calc(var(--cnt-usz) - 4px);
  left: 50%;
  margin-bottom: auto;
  margin-left: -1px;
  margin-top: auto;
  opacity: .1;
  position: absolute;
  top: 0;
  transition: border-radius .1s, height .1s, transform .1s, width .1s;
  width: 2px
}

.tp-txtv_k:hover::before,
.tp-txtv.tp-txtv-drg .tp-txtv_k::before {
  opacity: 1
}

.tp-txtv.tp-txtv-drg .tp-txtv_k::before {
  border-radius: 50%;
  height: 4px;
  transform: translateX(-1px);
  width: 4px
}

.tp-txtv_g {
  bottom: 0;
  display: block;
  height: 8px;
  left: 50%;
  margin: auto;
  overflow: visible;
  pointer-events: none;
  position: absolute;
  top: 0;
  visibility: hidden;
  width: 100%
}

.tp-txtv.tp-txtv-drg .tp-txtv_g {
  visibility: visible
}

.tp-txtv_gb {
  fill: none;
  stroke: var(--in-fg);
  stroke-dasharray: 1
}

.tp-txtv_gh {
  fill: none;
  stroke: var(--in-fg)
}

.tp-txtv .tp-ttv {
  margin-left: 6px;
  visibility: hidden
}

.tp-txtv.tp-txtv-drg .tp-ttv {
  visibility: visible
}

.tp-ttv {
  background-color: var(--in-fg);
  border-radius: var(--bld-br);
  color: var(--bs-bg);
  padding: 2px 4px;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, -100%)
}

.tp-ttv::before {
  border-color: var(--in-fg) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0);
  border-style: solid;
  border-width: 2px;
  box-sizing: border-box;
  content: "";
  font-size: .9em;
  height: 4px;
  left: 50%;
  margin-left: -2px;
  position: absolute;
  top: 100%;
  width: 4px
}

.tp-rotv {
  background-color: var(--bs-bg);
  border-radius: var(--bs-br);
  box-shadow: 0 2px 4px var(--bs-sh);
  font-family: var(--bs-ff);
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  text-align: left
}

.tp-rotv_b {
  border-bottom-left-radius: var(--bs-br);
  border-bottom-right-radius: var(--bs-br);
  border-top-left-radius: var(--bs-br);
  border-top-right-radius: var(--bs-br);
  padding-left: calc(4px + var(--cnt-usz) + var(--cnt-hp));
  text-align: center
}

.tp-rotv.tp-rotv-expanded .tp-rotv_b {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  transition-delay: 0s;
  transition-duration: 0s
}

.tp-rotv.tp-rotv-not>.tp-rotv_b {
  display: none
}

.tp-rotv_b:disabled .tp-rotv_m {
  display: none
}

.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_c {
  border-bottom-left-radius: var(--bs-br);
  border-bottom-right-radius: var(--bs-br)
}

.tp-rotv_c>.tp-fldv.tp-v-lst>.tp-fldv_i {
  border-bottom-left-radius: var(--bs-br)
}

.tp-rotv_c>.tp-fldv.tp-v-lst:not(.tp-fldv-expanded)>.tp-fldv_b {
  border-bottom-left-radius: var(--bs-br);
  border-bottom-right-radius: var(--bs-br)
}

.tp-rotv_c>.tp-fldv.tp-v-lst.tp-fldv-expanded>.tp-fldv_b {
  transition-delay: 0s;
  transition-duration: 0s
}

.tp-rotv_c .tp-fldv.tp-v-vlst:not(.tp-fldv-expanded)>.tp-fldv_b {
  border-bottom-right-radius: var(--bs-br)
}

.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst {
  margin-top: calc(-1*var(--cnt-vp))
}

.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-fldv.tp-v-fst>.tp-fldv_b {
  border-top-left-radius: var(--bs-br);
  border-top-right-radius: var(--bs-br)
}

.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_c {
  border-bottom-left-radius: var(--bs-br);
  border-bottom-right-radius: var(--bs-br)
}

.tp-rotv_c>.tp-tabv.tp-v-lst>.tp-tabv_i {
  border-bottom-left-radius: var(--bs-br)
}

.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst {
  margin-top: calc(-1*var(--cnt-vp))
}

.tp-rotv.tp-rotv-not .tp-rotv_c>.tp-tabv.tp-v-fst>.tp-tabv_t {
  border-top-left-radius: var(--bs-br);
  border-top-right-radius: var(--bs-br)
}

.tp-rotv.tp-v-disabled,
.tp-rotv .tp-v-disabled {
  pointer-events: none
}

.tp-rotv.tp-v-hidden,
.tp-rotv .tp-v-hidden {
  display: none
}

.tp-sprv_r {
  background-color: var(--grv-fg);
  border-width: 0;
  display: block;
  height: 2px;
  margin: 0;
  width: 100%
}

.tp-sprv.tp-v-disabled .tp-sprv_r {
  opacity: .5
}
`.replace(/\r?\n\s+/g, "");
