import type { NextConfig } from 'next';
import dotenv from 'dotenv';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const envFileName = `.env.${env}`;
console.log(`Env filename: ${envFileName}`);
dotenv.config({ path: path.resolve(__dirname, `../../${envFileName}`) });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/innogram-files/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
