/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

let withPWA = (config) => config;
try {
  withPWA = require("next-pwa")({
    dest: "public",
    disable: !isProd,
    register: true,
    skipWaiting: true
  });
} catch (e) {
  // If next-pwa is not installed yet, app still runs without PWA.
  // Once you install dependencies locally, PWA becomes active in production.
}

const nextConfig = {
  reactStrictMode: true
};

module.exports = withPWA(nextConfig);
