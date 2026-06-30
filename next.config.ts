import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  serverExternalPackages: ['fs'],
  outputFileTracingIncludes: {
    '/api/books/**': ['./src/assets/Being-Backend-Prodigy/**/*'],
  },
};

export default nextConfig;

