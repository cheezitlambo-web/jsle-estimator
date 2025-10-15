/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do NOT set: output: 'export'
  eslint: { ignoreDuringBuilds: true },
  // If you still need to push through type issues on CI, keep this; otherwise remove it:
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
