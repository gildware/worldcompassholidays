"use client";

import Aos from "aos";
import { useEffect } from "react";
import { Provider } from "react-redux";
import ScrollTop from "@/components/common/ScrollTop";
import { store } from "@/store/store";

export function GoTripFrame({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    Aos.init({ duration: 1200, once: true });
    void import("bootstrap/dist/js/bootstrap.bundle.min.js");
    const timeout = window.setTimeout(() => Aos.refresh(), 500);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <Provider store={store}>
      <div className="gotrip-page">
        <main>
          {children}
          <ScrollTop />
        </main>
      </div>
    </Provider>
  );
}
