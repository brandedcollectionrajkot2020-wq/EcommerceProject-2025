/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/images/**",
      },
      {
        protocol: "https",
        hostname: "ecommerce-project-2025.vercel.app",
        pathname: "/api/images/**",
      },
    ],
  },
};

export default nextConfig;
