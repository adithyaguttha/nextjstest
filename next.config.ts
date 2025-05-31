import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['ehzindoarppdatdqytyr.supabase.co'],
    // allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  },
  
};

export default nextConfig;
