import letsGrow_logo from "@/assets/images/daos/letsGrow.jpg";

export const letsgrowdao = {
  title: "Let's Grow DAO",
  dao_name: "letsgrowdao",
  chain_name: "Optimism",
  description:
    "Let's Grow DAO is a decentralized autonomous organization (DAO) dedicated to fostering the growth and unity of the Regen Movement through the development and support of public goods. It aims to connect individuals, projects, and resources within the regenerative ecosystem, leveraging Web3 principles to create accessible tools, knowledge, and funding mechanisms that empower the adoption of regenerative practices and contribute to a more sustainable and equitable future for all.",
  contract_address: "",
  number_of_delegates: "21",
  token_name: "LGD",
  logo: letsGrow_logo,
  links: {
    // forum: "https://gov.optimism.io/",
    website: "https://www.letsgrow.network/",
    docs: "https://garden.letsgrow.network/page-8020229466123785",
    // block_explorer: "https://optimistic.etherscan.io/",
    twitter_profile: "https://twitter.com/LetsGrowDAO",
    // governance_twitter_profile: "https://twitter.com/OptimismGov",
  },
  api_links: {
    subgraph: {
      past_votes:
        "https://api.thegraph.com/subgraphs/name/show-karma/dao-onchain-voting-optimism",
    },
    delegates_list: "delegates_list_url",
  },
};
