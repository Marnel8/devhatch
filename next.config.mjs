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
  transpilePackages: ['nodemailer', 'ejs']
};

export default nextConfig;
