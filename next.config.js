/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { nextRuntime, webpack }) => {
    // Next.js bundles ua-parser-js into the edge runtime (used internally by
    // next/server's NextRequest) even when unused. That module references
    // __dirname, which doesn't exist on Vercel's edge runtime and crashes
    // middleware with "ReferenceError: __dirname is not defined".
    // See https://github.com/vercel/next.js/issues/53968
    if (nextRuntime === "edge") {
      config.plugins.push(
        new webpack.DefinePlugin({
          __dirname: JSON.stringify("/"),
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
