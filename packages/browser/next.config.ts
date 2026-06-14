import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@pi-studio/shared"],
  async rewrites() {
    const port = process.env.PI_STUDIO_DAEMON_PORT ?? "7331";
    return [{ source: "/api/:path*", destination: `http://127.0.0.1:${port}/api/:path*` }];
  },
};

export default nextConfig;
