import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone: servidor Node mínimo, ideal para Docker
  output: "standalone",
  // Necessário para ler data/filamentos.csv em runtime (Vercel)
  outputFileTracingIncludes: {
    "/": ["./data/**/*"],
  },
};

export default nextConfig;
