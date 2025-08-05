/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Node.js core modules
        fs: false,
        net: false,
        tls: false,
        path: false,
        crypto: false,
        dns: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        url: false,
        assert: false,
        os: false,
        child_process: false,
        
        // Additional modules that might cause issues
        buffer: false,
        events: false
      };
    }
    return config;
  },
  // Disable server-side rendering for problematic components if needed
  reactStrictMode: true,
  // Optional: Add transpilation for specific packages
  transpilePackages: ['nodemailer', 'ejs'],
  // Copy email templates to production build
  experimental: {
    outputFileTracingRoot: process.cwd(),
  },
  // Ensure email templates are included in the build
  output: 'standalone',
  // Copy static files
  async rewrites() {
    return [];
  },
  // Copy email templates to the build output
  async headers() {
    return [];
  }
};

export default nextConfig;
