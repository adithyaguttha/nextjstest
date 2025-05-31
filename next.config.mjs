/** @type { import('next').NextConfig } */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ehzindoarppdatdqytyr.supabase.co' },
      { protocol: 'https', hostname: 'ui-avatars.com' }
    ]
  }
};

export default nextConfig; 