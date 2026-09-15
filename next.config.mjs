import { withSentryConfig } from '@sentry/nextjs';
import withBundleAnalyzer from '@next/bundle-analyzer';
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',  // Enable bundle analysis
})(
  withPWA({
    pwa: {
      dest: 'public',  // Directory where the PWA assets will be stored
      disable: process.env.NODE_ENV === 'development',  // Disable PWA in development
    },
    experimental: {
      serverComponentsExternalPackages: ['node-cron'],
    },
    // images: {
    //   domains: ['static.vecteezy.com', 'tradecorebucket.s3.eu-west-2.amazonaws.com'],  // Your image domain configuration
    // },
  })
);

// export default nextConfig;

// Export the combined config with image domains separately
export default withSentryConfig(withSentryConfig({
  ...nextConfig,

  images: {
    // Add your S3 bucket domain here
    remotePatterns: [
      { protocol: 'https', hostname: 'static.vecteezy.com' },
      { protocol: 'https', hostname: 'thetradecorebucket.s3.eu-west-2.amazonaws.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'app.tradepeople.co.uk' },
    ],
  },

  // Run `npm run lint` separately; existing lint warnings shouldn't block deploys.
  eslint: {
    ignoreDuringBuilds: true,
  },
}, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "tut-x4",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
}), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "tut-x4",
  project: "ttc",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});