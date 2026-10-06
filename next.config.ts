import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fluent-ffmpeg", "@ffmpeg-installer/ffmpeg"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
