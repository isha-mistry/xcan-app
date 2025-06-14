import IndividualDAO from "@/components/IndividualDAO/SpecificDAO";
import PageNotFound from "@/components/PageNotFound/PageNotFound";
import React from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { DEFAULT_METADATA } from "@/utils/metadataUtils";
import WalletWrapper from "@/components/WalletWrapper";

// const metadataConfig: any = {
//   optimism: {
//     title: "Optimism Collective",
//     description:
//       "Explore Optimism Collective's delegates list on Chora Club. Connect with experienced Web3 delegates on the Optimism network, book sessions, and grow your knowledge in the decentralized ecosystem.",
//     image:
//       "https://gateway.lighthouse.storage/ipfs/QmcgZPNuhxxfxgrB78cLb4nYCJhYpSPFsJKvj3Z5AY5kKe",
//   },
//   arbitrum: {
//     title: "Arbitrum DAO",
//     description:
//       "Explore Arbitrum DAO's delegates list on Chora Club. Connect with experienced Web3 delegates on the Arbitrum network, book sessions, and grow your knowledge in the decentralized ecosystem.",
//     image:
//       "https://gateway.lighthouse.storage/ipfs/QmPE5oSYhm2e5hDCG6Bdgb6ACp2iYwLhTq2Xdd4divRyJJ",
//   },
//   letsgrowdao: {
//     title: "Let's Grow DAO",
//     description:
//       "Explore Optimism Collective's delegates list on Chora Club. Connect with experienced Web3 delegates on the Optimism network, book sessions, and grow your knowledge in the decentralized ecosystem.",
//     image:
//       "https://gateway.lighthouse.storage/ipfs/QmcgZPNuhxxfxgrB78cLb4nYCJhYpSPFsJKvj3Z5AY5kKe",
//   },
// };

// export async function generateMetadata(
//   { params }: { params: { daoDelegates: string } },
//   parent: ResolvingMetadata
// ): Promise<Metadata> {
//   const { daoDelegates } = params;
//   const delegateMetadata = metadataConfig[daoDelegates];

//   if (!delegateMetadata) {
//     // Handle the case where the DAO delegate is not found
//     return DEFAULT_METADATA;
//   }

//   return {
//     metadataBase: new URL("https://inorbit-edu.vercel.app/"),
//     title: "Inorbit",
//     description: "Discover. Learn. Engage.",
//     openGraph: {
//       title: delegateMetadata.title,
//       description: delegateMetadata.description,
//       url: `https://inorbit-edu.vercel.app/${daoDelegates}`,
//       siteName: "Inorbit",
//       images: [
//         {
//           url: delegateMetadata.image,
//           width: 800,
//           height: 600,
//           alt: "img",
//         },
//         {
//           url: delegateMetadata.image,
//           width: 1800,
//           height: 1600,
//           alt: "img",
//         },
//       ],
//       locale: "en_US",
//       type: "website",
//     },
//   };
// }

function page({ params }: { params: { daoDelegates: string } }) {
  return (
    <WalletWrapper>
      <div>
        {/* {metadataConfig[params.daoDelegates] ? ( */}
        <IndividualDAO props={params} />
        {/* ) : (
        <PageNotFound />
      )} */}
      </div>
    </WalletWrapper>
  );
}

export default page;
