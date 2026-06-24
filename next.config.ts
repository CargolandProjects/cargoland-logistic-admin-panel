import type { NextConfig } from "next";

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "https://dev.cargoland.africa";

const nextConfig: NextConfig = {
  async rewrites() {
    // Same-origin proxy to the Cargoland backend so browser calls avoid CORS.
    // Client baseURL is `/api/cargoland`; requests are forwarded (with the
    // Authorization header) to the real API origin.
    return [
      {
        source: "/api/cargoland/:path*",
        destination: `${BACKEND_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
