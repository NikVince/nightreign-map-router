/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...other config options...
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new (require('webpack')).IgnorePlugin({
          resourceRegExp: /^konva$|^react-konva$/,
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
