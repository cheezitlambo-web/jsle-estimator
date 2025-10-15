/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Let the app deploy even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
  // If type-checking ever blocks builds, uncomment the next block (not recommended long-term):
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
};

module.exports = nextConfig;
