/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  // Enable Turbopack
  experimental: {
    turbo: {},
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "isomorphic-furyroad.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  transpilePackages: ["core"],
};

