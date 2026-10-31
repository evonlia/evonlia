"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { makeStore, setLang } from "@/store";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import type { Lang } from "@/lib/i18n";

function LangSync() {
  const lang = useAppSelector((s) => s.ui.lang);
  const dispatch = useAppDispatch();

  // restore saved language once, on the client
  useEffect(() => {
    const saved = localStorage.getItem("evonlia-lang") as Lang | null;
    if (saved === "ar" || saved === "en") dispatch(setLang(saved));
    else if (navigator.language?.toLowerCase().startsWith("ar")) dispatch(setLang("ar"));
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("evonlia-lang", lang); } catch {}
  }, [lang]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }));
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <LangSync />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
