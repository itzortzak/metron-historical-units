import type { NextConfig } from "next";

const isGitHubPages = process.env.METRON_GITHUB_PAGES === "true";
const githubPagesBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? "/metron-historical-units";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        basePath: githubPagesBasePath,
        trailingSlash: true,
        images: { unoptimized: true },
        typescript: { tsconfigPath: "tsconfig.pages.json" },
      }
    : {}),
};

export default nextConfig;
