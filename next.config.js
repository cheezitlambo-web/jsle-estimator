/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",           // static export (writes to /out)
  images: { unoptimized: true } // friendlier for static/PWA
};

module.exports = nextConfig;
