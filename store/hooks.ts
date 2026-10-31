import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "./index";
import { dict } from "@/lib/i18n";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

/** Translations for the current language. */
export function useT() {
  const lang = useAppSelector((s) => s.ui.lang);
  return { lang, t: dict[lang], dir: lang === "ar" ? "rtl" : "ltr" } as const;
}
