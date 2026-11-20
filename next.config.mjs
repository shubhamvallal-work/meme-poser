const basePath = process.env.NODE_ENV === "production" ? "/meme-poser" : "";

const nextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
