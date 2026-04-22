import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hoggax Partners",
    short_name: "Partners",
    description: "Portal de cotización de garantías Hoggax para partners.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#FF366C",
    icons: [
      {
        src: "/hoggax-logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

