
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
    NEXT_PUBLIC_ADSENSE_PUB_ID: 'ca-pub-5415253457910957',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pagead2.googlesyndication.com',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      "6000-firebase-studio-1759119250765.cluster-ulqnojp5endvgve6krhe7klaws.cloudworkstations.dev"
    ]
  }
};

export default nextConfig;
