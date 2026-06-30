import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: tell Next.js THIS directory is the workspace root,
  // not the parent /home/harsh/ where a stray lockfile exists.
  outputFileTracingRoot: resolve(__dirname),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "covers.openlibrary.org" }],
  },
};

export default nextConfig;
