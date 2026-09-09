import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "**/sqlite3-worker1.mjs": {
        loaders: [
          {
            loader: path.resolve("scripts/sqlite-turbopack-loader.cjs"),
          },
        ],
      },
    },
  },
};

export default nextConfig;
