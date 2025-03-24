import letsGrow_logo from "@/assets/images/daos/letsGrow.jpg";

export const letsgrowdao = {
  title: "Let's Grow DAO",
  dao_name: "letsgrowdao",
  chain_name: "Optimism",
  description:
    "Let's Grow DAO is the heart of the Optimism network, an innovative layer 2 solution for faster, cheaper transactions on Ethereum. Think of it as a community-driven engine, where token holders govern upgrades, fees, and the overall direction of the Optimism ecosystem. With a focus on scaling Ethereum effectively and sustainably, Optimism Collective is building a brighter future for blockchain technology.",
  contract_address: "",
  number_of_delegates: "21",
  token_name: "OP",
  logo: letsGrow_logo,
  links: {
    forum: "https://gov.optimism.io/",
    website: "https://www.optimism.io/",
    docs: "https://community.optimism.io/",
    block_explorer: "https://optimistic.etherscan.io/",
    twitter_profile: "https://twitter.com/Optimism",
    governance_twitter_profile: "https://twitter.com/OptimismGov",
  },
  api_links: {
    subgraph: {
      past_votes:
        "https://api.thegraph.com/subgraphs/name/show-karma/dao-onchain-voting-optimism",
    },
    delegates_list: "delegates_list_url",
  },
};
