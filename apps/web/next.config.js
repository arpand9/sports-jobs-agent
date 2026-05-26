const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@sportshire/db", "@sportshire/shared", "@sportshire/services"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

module.exports = nextConfig;
