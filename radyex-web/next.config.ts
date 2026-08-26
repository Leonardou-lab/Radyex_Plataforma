import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto explícitamente: sin esto, Turbopack
  // detecta un package-lock.json ajeno más arriba en el árbol de
  // carpetas (fuera de este repo) y lo toma como raíz por error.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
