import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["sarkless-margarette-postmeningeal.ngrok-free.dev"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { hostname: "m.media-amazon.com" },
      { hostname: "img.youtube.com" },
      { hostname: "i.ytimg.com" },
      { hostname: "upload.wikimedia.org" },
      { hostname: "res.cloudinary.com" },
      { hostname: "storage.icograms.com" },
      { hostname: "invention.si.edu" },
      { hostname: "www.mac-history.net" },
      { hostname: "cdn.prod.website-files.com" },
      { hostname: "www.cnet.com" },
      { hostname: "i.pinimg.com" },
      { hostname: "pbs.twimg.com" },
      { hostname: "cdn.sanity.io" },
      { hostname: "www.idsa.org" },
      { hostname: "encrypted-tbn0.gstatic.com" },
      { hostname: "media1.tenor.com" },
      { hostname: "media.tenor.com" },
      { hostname: "cobalt.tools" },
    ],
  },
};

export default nextConfig;
