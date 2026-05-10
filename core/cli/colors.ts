// Raw ANSI helpers. Zero deps, no chalk. Respects NO_COLOR and non-TTY stdout.

const enabled = (() => {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return process.stdout.isTTY ?? false;
})();

const wrap = (open: number, close: number) => (s: string) =>
  enabled ? `\x1b[${open}m${s}\x1b[${close}m` : s;

export const reset = "\x1b[0m";

export const bold = wrap(1, 22);
export const dim = wrap(2, 22);
export const italic = wrap(3, 23);
export const underline = wrap(4, 24);

export const black = wrap(30, 39);
export const red = wrap(31, 39);
export const green = wrap(32, 39);
export const yellow = wrap(33, 39);
export const blue = wrap(34, 39);
export const magenta = wrap(35, 39);
export const cyan = wrap(36, 39);
export const white = wrap(37, 39);
export const gray = wrap(90, 39);

export const bgBlue = wrap(44, 49);

export const ok = (s: string) => green(s);
export const warn = (s: string) => yellow(s);
export const err = (s: string) => red(s);
export const muted = (s: string) => gray(s);
export const accent = (s: string) => cyan(s);

export function hr(width = 60, char = "─"): string {
  return muted(char.repeat(width));
}
