import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export",
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
};
export default config;
