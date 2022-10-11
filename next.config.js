/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ["rb.gy", "lh3.googleusercontent.com"]
  }
}

module.exports = nextConfig
