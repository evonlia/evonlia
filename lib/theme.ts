export type Theme = "dark" | "light";
export const THEME_KEY = "evonlia-theme";

/** Puts the theme on <html> and remembers it. Dark is the default look of the site. */
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}

/** Runs in <head> before the page paints, so a saved light choice never flashes dark first. */
export const themeScript = `(function(){try{if(localStorage.getItem("${THEME_KEY}")==="light")document.documentElement.dataset.theme="light"}catch(e){}})();`;
