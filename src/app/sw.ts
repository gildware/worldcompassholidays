/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const neverCache: typeof defaultCache = [
  {
    matcher({ url }) {
      return url.pathname.startsWith("/admin");
    },
    handler: new NetworkOnly(),
  },
  {
    matcher({ url }) {
      return url.pathname.startsWith("/api/");
    },
    handler: new NetworkOnly(),
    method: "POST",
  },
  {
    matcher({ url }) {
      return url.pathname.startsWith("/api/");
    },
    handler: new NetworkOnly(),
    method: "PUT",
  },
  {
    matcher({ url }) {
      return url.pathname.startsWith("/api/");
    },
    handler: new NetworkOnly(),
    method: "PATCH",
  },
  {
    matcher({ url }) {
      return url.pathname.startsWith("/api/");
    },
    handler: new NetworkOnly(),
    method: "DELETE",
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...neverCache, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
