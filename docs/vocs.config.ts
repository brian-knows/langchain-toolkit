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
      text: "v1.2.9",
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
      text: "📄 Changelog",
      link: "/changelog",
    },
    {
      text: "📚 Guides",
      collapsed: false,
      items: [
        {
          text: "Create a basic agent",
          link: "/guides/create-basic-agent",
        },
        {
          text: "ERC20 Deployer Agent",
          link: "/guides/erc20-deploy-agent",
        },
      ],
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
        {
          text: "Farcaster Toolkit",
          link: "/toolkits/farcaster",
        },
        {
          text: "Twitter Toolkit",
          link: "/toolkits/twitter",
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
      text: "📝 Vector Stores",
      collapsed: false,
      items: [
        {
          text: "What are Vector Stores?",
          link: "/vector-stores",
        },
        {
          text: "🟣 Farcaster",
          collapsed: false,
          items: [
            {
              text: "Farcaster Memory Store",
              link: "/vector-stores/farcaster/memory-store",
            },
            {
              text: "Farcaster Supabase Store",
              link: "/vector-stores/farcaster/supabase-store",
            },
          ],
        },
      ],
    },
    {
      text: "🔌 Integrations",
      collapsed: false,
      items: [
        {
          text: "💬 XMTP",
          link: "/integrations/xmtp",
        },
        {
          text: "🔷 ENS",
          link: "/integrations/ens",
        },
        {
          text: "🍦 Gelato",
          link: "/integrations/gelato",
        },
      ],
    },
  ],
});
