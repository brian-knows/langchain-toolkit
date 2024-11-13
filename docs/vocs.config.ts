import { defineConfig } from "vocs";

export default defineConfig({
  title: "@brian-ai/langchain",
  theme: {
    accentColor: "#3b82f6",
  },
  topNav: [
    {
      text: "Brian App",
      link: "https://brianknows.org",
    },
    {
      text: "v1.0.6",
      link: "https://www.npmjs.com/package/@brian-ai/langchain",
    },
  ],
  editLink: {
    pattern:
      "https://github.com/brian-knows/langchain-toolkit/docs/docs/pages/:path",
    text: "Suggest changes to this page",
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/brian-knows/langchain-toolkit",
    },
    {
      icon: "x",
      link: "https://x.com/BrianKnowsAI",
    },
  ],
  sidebar: [
    {
      text: "Getting Started",
      link: "/getting-started",
    },
  ],
});
