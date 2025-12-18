import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "local-origin.dev",
    "*.local-origin.dev",
    "https://laughterless-tran-smallish.ngrok-free.dev",
    "http://laughterless-tran-smallish.ngrok-free.dev",
    "https://*.ngrok-free.dev",
    "http://*.ngrok-free.dev",
  ],
};



export default nextConfig;
