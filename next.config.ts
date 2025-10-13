import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_ADSENSE_PUB_ID: 'ca-pub-XXXXXXXXXXXXXXXX',
  },
};

export default nextConfig;
