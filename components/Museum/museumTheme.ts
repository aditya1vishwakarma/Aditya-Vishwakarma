/**
 * Light and dark looks for the museum view. The shelving itself is the same
 * hinoki in both; what changes is the wall behind it, the glass panes over
 * it and the type.
 */

export type ThemeMode = 'light' | 'dark';

export interface MuseumTheme {
  mode: ThemeMode;
  /** The page, the canvas clear colour and Safari's chrome. */
  pageBg: string;
  /** The wall: its colour low down, and higher up where the light gathers. */
  backdropLow: string;
  backdropHigh: string;
  /** The wash that fades the shelves back while a piece is open. */
  veil: string;
  shadow: string;
  shadowOpacity: number;
  /** Type: titles and links, body copy, and quiet secondary text. */
  text: string;
  textBody: string;
  textMuted: string;
  /** Frosted glass for the popover and the selected card. */
  glass: string;
  /** The glass as it renders over this wall — for the popover's solid caret. */
  glassFace: string;
  /** The glass's bevelled rim: a highlight along the top, a little depth below. */
  glassEdge: string;
  /** The frosted pill behind Home, the info button and this toggle. */
  pill: string;
  /** The slider rail and its thumb. */
  rail: string;
  thumb: string;
}

export const THEMES: Record<ThemeMode, MuseumTheme> = {
  light: {
    mode: 'light',
    pageBg: '#F1EBE0',
    backdropLow: '#E7DECF',
    backdropHigh: '#F8F3EA',
    veil: '#F4EFE7',
    shadow: '#6E4F33',
    shadowOpacity: 0.13,
    text: '#333333',
    textBody: '#847D72',
    textMuted: 'rgba(51, 51, 51, 0.45)',
    glass: 'rgba(251, 250, 248, 0.60)',
    glassFace: '#FBF6EF',
    // The ring view's GLASS_EDGE.
    glassEdge: 'inset 0 1px 1px rgba(255,255,255,0.55), inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 -12px 26px -20px rgba(0,0,0,0.22)',
    pill: 'border-charcoal/10 bg-white/50 text-charcoal hover:border-charcoal/20 hover:bg-white/60',
    rail: 'bg-charcoal/15 group-hover:bg-charcoal/25',
    thumb: 'bg-charcoal/65 group-hover:bg-charcoal/85 group-focus-visible:bg-charcoal/85',
  },
  dark: {
    mode: 'dark',
    pageBg: '#363C44',
    backdropLow: '#30353C',
    backdropHigh: '#454C56',
    veil: '#2C3138',
    shadow: '#0B0D10',
    shadowOpacity: 0.3,
    text: '#F3EDE2',
    textBody: 'rgba(243, 237, 226, 0.68)',
    textMuted: 'rgba(243, 237, 226, 0.45)',
    glass: 'rgba(38, 42, 49, 0.62)',
    glassFace: '#2E333A',
    // Same rim, turned down — at full strength it reads as a white border on slate.
    glassEdge: 'inset 0 1px 1px rgba(255,255,255,0.10), inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 -12px 26px -20px rgba(0,0,0,0.45)',
    pill: 'border-white/10 bg-[#2A2F36]/60 text-[#F3EDE2] hover:border-white/20 hover:bg-[#2A2F36]/75',
    rail: 'bg-[#F3EDE2]/15 group-hover:bg-[#F3EDE2]/25',
    thumb: 'bg-[#F3EDE2]/70 group-hover:bg-[#F3EDE2]/90 group-focus-visible:bg-[#F3EDE2]/90',
  },
};

const STORE_KEY = 'museum-theme';

/** The viewer's last choice, if this browser kept it. Dark unless they've chosen light. */
export function storedTheme(): ThemeMode {
  try {
    return localStorage.getItem(STORE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function storeTheme(mode: ThemeMode) {
  try {
    localStorage.setItem(STORE_KEY, mode);
  } catch {
    // Private windows and blocked storage: the toggle still works, it just won't be remembered.
  }
}
