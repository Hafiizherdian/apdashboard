import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dashboard Action Plan",
    short_name: "AP",
    description: "Dashboard untuk monitoring action plan",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6fb",
    theme_color: "#1c9706",
    icons: [
      {
        src: "/icon-192x192.png", // Teks '/public' dihapus
        sizes: "192x192",
        type: "image/png",
        purpose: "any", // Digunakan untuk shortcut biasa
      },
      {
        src: "/icon-192x192.png", 
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable", // Memberitahu Android bahwa icon ini aman untuk dipotong/diubah bentuknya
      },
      {
        src: "/icon-512x512.png", // Teks '/public' dihapus
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}