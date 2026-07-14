import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "살림장부",
    short_name: "살림장부",
    description: "입금과 출금을 쉽고 편하게 기록하는 우리 가족 장부",
    id: "/",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    lang: "ko-KR",
    background_color: "#f4f7f9",
    theme_color: "#f4f7f9",
    icons: [
      {
        src: "/icons/cashbook-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/cashbook-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/cashbook-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
