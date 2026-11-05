import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Directivas CSP optimizadas: sin comodines inseguros (sin 'https:' o 'http:' abiertos)
const scriptSrc = isProd
  ? "'self' 'unsafe-inline'"
  : "'self' 'unsafe-eval' 'unsafe-inline'";

const connectSrc = isProd
  ? "'self'"
  : "'self' ws: wss:";

const cspDirectives = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
  {
    key: "X-XSS-Protection",
    value: "0",
  },
];

const apiCacheHeaders = [
  {
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  },
  {
    key: "Pragma",
    value: "no-cache",
  },
  {
    key: "Expires",
    value: "0",
  },
  {
    key: "Surrogate-Control",
    value: "no-store",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: [
    "192.168.1.215",
    "192.168.1.215:3000",
    "localhost",
    "localhost:3000",
  ],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      { source: "/dashboard", destination: "/" },
      { source: "/inventario", destination: "/" },
      { source: "/pos", destination: "/" },
      { source: "/ventas", destination: "/" },
      { source: "/ordenes", destination: "/" },
      { source: "/cotizaciones", destination: "/" },
      { source: "/creditos", destination: "/" },
      { source: "/contabilidad", destination: "/" },
      { source: "/caja", destination: "/" },
      { source: "/auditoria", destination: "/" },
      { source: "/configuracion", destination: "/" },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: apiCacheHeaders,
      },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
