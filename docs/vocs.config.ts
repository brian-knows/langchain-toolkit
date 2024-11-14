import { defineConfig } from "vocs";

export default defineConfig({
  title: "@brian-ai/langchain",
  theme: {
    accentColor: "#3b82f6",
  },
  topNav: [
    {
      text: "Brian",
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
      text: "🚀 Getting Started",
      link: "/getting-started",
    },
    {
      text: "📕 Guidelines",
      link: "/guidelines",
    },
    {
      text: "🛠️ Toolkits",
      collapsed: false,
      items: [
        {
          text: "Brian Toolkit",
          link: "/toolkits/brian",
        },
        {
          text: "CDP Toolkit",
          link: "/toolkits/cdp",
        },
        {
          text: "Starknet Toolkit",
          link: "/toolkits/starknet",
        },
      ],
    },
    {
      text: "🤖 Agents",
      collapsed: false,
      items: [
        {
          text: "Brian Agent",
          link: "/agents/brian",
        },
        {
          text: "CDP Agent",
          link: "/agents/cdp",
        },
        {
          text: "Starknet Agent",
          link: "/agents/starknet",
        },
      ],
    },
    {
      text: "💬 XMTP Support",
      link: "/xmtp",
    },
    {
      text: "🔷 ENS Support",
      link: "/ens",
    },
  ],
});
