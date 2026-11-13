/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "tesseract.js",
    "sharp",
    "unpdf",
    "mammoth",
    "@xenova/transformers",
    "onnxruntime-node",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  compress: true,
};

export default nextConfig;