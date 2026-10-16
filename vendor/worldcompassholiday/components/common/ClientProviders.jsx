"use client";

import Aos from "aos";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "../../store/store";

export default function ClientProviders({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      require("bootstrap/dist/js/bootstrap");
    }
  }, []);

  useEffect(() => {
    Aos.init({
      duration: 1200,
      once: true,
    });
  }, []);

  // Trigger AOS refresh when the user navigates between pages
  useEffect(() => {
    Aos.refresh();

    // In highly dynamic pages (like home_3), Swiper carousels and Next.js Image
    // components take a fraction of a second to fully render their true heights.
    // If AOS calculates the triggers before this, bottom sections get stuck hidden.
    const timeout = setTimeout(() => {
      Aos.refresh();
    }, 500);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return <Provider store={store}>{children}</Provider>;
}
