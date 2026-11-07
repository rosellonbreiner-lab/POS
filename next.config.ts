import type { NextConfig } from "next";
import os from "os";

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
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
        {
          key: "Cross-Origin-Opener-Policy",
          value: "same-origin",
        },
        {
          key: "Cross-Origin-Resource-Policy",
          value: "same-origin",
        },
      ]
    : []),
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

// Detectar dinámicamente todas las IPs locales activas para permitir HMR y conexiones desde celular
const devOrigins: string[] = [
  "localhost",
  "localhost:3000",
  "127.0.0.1",
  "127.0.0.1:3000",
  "*.trycloudflare.com",
];

try {
  const ifaces = os.networkInterfaces();
  for (const ifName in ifaces) {
    const ifList = ifaces[ifName];
    if (ifList) {
      for (const item of ifList) {
        if (item.family === "IPv4" && !item.internal) {
          devOrigins.push(item.address);
          devOrigins.push(`${item.address}:3000`);
        }
      }
    }
  }
} catch {
  // Fallback silencioso si os.networkInterfaces no está disponible
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: devOrigins,
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
