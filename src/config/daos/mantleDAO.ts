import mantle_logo from "@/assets/images/daos/Mantledaologo.png"

export const mantle = {
    title: "Mantle",
    dao_name: "mantle",
    chain_name: "Mantle Network",
    description:
      "Mantle DAO governs the Mantle Network, a modular Ethereum Layer 2 scaling solution designed to enhance performance, security, and data availability. Utilizing Optimistic Rollups and innovative data availability solutions, Mantle aims to drive capital efficiency in the on-chain economy. The DAO empowers MNT token holders to participate in decision-making processes, shaping the strategic direction of the ecosystem.",
    contract_address: "",
    number_of_delegates: "589",
    token_name: "MNT",
    logo: mantle_logo,
    links: {
      forum: "https://forum.mantle.xyz/",
      website: "https://www.mantle.xyz/",
      docs: "https://docs.mantle.xyz/",
      block_explorer: "https://explorer.mantle.xyz/",
      twitter_profile: "https://twitter.com/0xMantle",
      governance_twitter_profile: "https://twitter.com/MantleGovernance",
    },
    api_links: {
      subgraph: {
        past_votes:
          "https://api.thegraph.com/subgraphs/name/mantle/dao-voting",
      },
      delegates_list: "https://delegates.mantle.xyz/",
    },
  };
  