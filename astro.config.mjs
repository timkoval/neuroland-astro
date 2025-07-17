// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
// import react from "@astrojs/react";
import icon from "astro-icon";
// import partytown from "@astrojs/partytown";
import { remarkWikiLink } from "./src/plugins/remark-wiki-link";

// https://astro.build/config
export default defineConfig({
  site: "https://timkoval.rs",
  build: {
    format: "file",
  },
  vite: {
    ssr: {
      noExternal: [
        "mermaid",
      ],
    },
  },
  image: {
    domains: ["res.cloudinary.com"],
  },
  integrations: [
    mdx({
      remarkPlugins: [remarkWikiLink],
      shikiConfig: {
        theme: "night-owl",
        wrap: true,
      },
      extendMarkdownConfig: true, // Inherit Markdown settings, including GFM
      gfm: true, //
    }),
    // partytown({
    //   config: {
    //     forward: ["dataLayer.push"],
    //   },
    // }),
    // react(),
    icon(),
  ],
});
