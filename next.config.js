/** @type {import('next').NextConfig} */
const nextConfig = {
  // Needed for Three.js / R3F ESM packages
  transpilePackages: ["three"],

  // Webpack config for Three.js shader files
  webpack(config) {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ["raw-loader", "glslify-loader"],
    });
    return config;
  },
};

module.exports = nextConfig;
