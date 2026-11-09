import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/visa", destination: "/visa-services", permanent: true }];
  },
  env: {
    NEXT_PUBLIC_MAP_API_KEY: process.env.MAP_API_KEY ?? "",
  },
  output: "standalone",
  transpilePackages: ["ckeditor5", "@ckeditor/ckeditor5-react"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Next 16 treats localhost vs 127.0.0.1 as different origins. Without this,
  // HMR WebSockets fail and (with reactDebugChannel) hydration hangs forever —
  // SSR HTML shows but every client button is dead.
  allowedDevOrigins: ["127.0.0.1", "192.168.1.7"],
  // Destination (and future) image uploads via server actions.
  experimental: {
    // Do not block hydrateRoot on the HMR-fed React debug channel.
    reactDebugChannel: false,
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Seed placeholders are SVG; Cloudinary uploads will be raster.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
