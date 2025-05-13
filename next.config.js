/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  // Static rendering configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimize for CSR
  experimental: {
    // Properly configure server actions
    serverActions: {
      allowedOrigins: ["localhost:3000"],
      bodySizeLimit: "2mb",
    },
  },

  // Configure Turbopack (since it's now stable)
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js"],
  },

  // Static image configuration
  images: {
    domains: ["lh3.googleusercontent.com"],
    unoptimized: true,
    loader: "custom",
    loaderFile: "./src/image-loader.js",
  },

  // Force CSR behavior
  pageExtensions: ["tsx", "ts"],

  // Properly typed async rewrites
  async rewrites() {
    return Promise.resolve({
      beforeFiles: [
        {
          source: "/:path*",
          has: [{ type: "query", key: "csr", value: "true" }],
          destination: "/:path*?__nextCSR=true",
        },
      ],
    });
  },
};

export default config;
