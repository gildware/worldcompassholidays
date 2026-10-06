import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GoTrip home components are symlinked from the sibling template folder.
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
  env: {
    NEXT_PUBLIC_MAP_API_KEY: process.env.MAP_API_KEY ?? "",
  },
  output: "standalone",
  transpilePackages: ["ckeditor5", "@ckeditor/ckeditor5-react"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Destination (and future) image uploads via server actions.
  experimental: {
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
