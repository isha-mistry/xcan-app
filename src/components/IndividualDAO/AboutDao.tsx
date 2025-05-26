import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaGithub,
  FaGlobe,
  FaBalanceScale,
  FaBook,
  FaDiscord,
  FaUsers,
  FaSatelliteDish,
  FaGuilded,
  FaTelegramPlane,
} from "react-icons/fa";
import { FaBridge, FaXTwitter } from "react-icons/fa6";
import { GoMirror } from "react-icons/go";
import { SiHiveBlockchain } from "react-icons/si";
import about from "../../utils/about_dao.json";
import { IconType } from "react-icons";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { RiRecordCircleFill } from "react-icons/ri";

// Define types for your data to ensure type safety
interface MissionAndVision {
  mission?: string;
  vision?: string[];
}

interface Technology {
  description?: string;
  features?: (string | { name: string; description: string })[];
}

interface GovernanceAndDAOStructure {
  description?: string;
  elements?: { name: string; details: string }[];
  houses?: { name: string; details: string }[];
}

interface CommunityAndResources {
  website?: string;
  dashboard?: string;
  governance?: string;
  communityHub?: string;
  warpcast?: string;
  LGLJoinVideo?: string;
  manifesto?: string;
  guild?: string;
  telegram?: string;
  forum?: string;
  bridge?: string;
  docs?: string;
  mirror?: string;
  github?: string;
  discord?: string;
  block_explorer?: string;
  twitter?: {
    optimism?: string;
    gov?: string;
    arbitrum?: string;
    dao?: string;
    letsgrowdao?: string;
  };
}
interface Values {
  value?: { title: string; description: string }[];
}

interface DaoData {
  introduction?: string;
  display_text?: string;
  mission_and_vision?: MissionAndVision;
  technology?: Technology;
  values?: Values;
  governance_and_dao_structure?: GovernanceAndDAOStructure;
  community_and_resources?: CommunityAndResources;
}

// Define a type for your JSON data
interface AboutData {
  [key: string]: DaoData;
}

// Define types for your links
interface LinkData {
  name: string;
  href?: string;
  icon: IconType;
  color: string;
}

const AboutDao = ({ props }: { props: string }) => {
  // Explicitly cast `about` to the `AboutData` type
  const aboutData = about as AboutData;
  const text = aboutData[props];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  // Conditionally define the links based on the presence of community_and_resources
  const links: LinkData[] = text?.community_and_resources
    ? [
        {
          name: "Website",
          href: text.community_and_resources.website,
          icon: FaGlobe,
          color: "text-blue-500",
        },
        {
          name: "Dashboard",
          href: text.community_and_resources.dashboard,
          icon: MdOutlineDashboardCustomize,
          color: "text-purple-600",
        },
        {
          name: "Community Hub",
          href: text.community_and_resources.communityHub,
          icon: FaUsers,
          color: "text-[#000]",
        },
        {
          name: "Warpcast",
          href: text.community_and_resources.warpcast,
          icon: FaSatelliteDish,
          color: "text-purple-600",
        },
        {
          name: "Guild",
          href: text.community_and_resources.guild,
          icon: FaGuilded,
          color: "text-[#000]",
        },
        {
          name: "Manifesto",
          href: text.community_and_resources.manifesto,
          icon: IoDocumentText,
          color: "text-yellow-500",
        },
        {
          name: "LGL Join Video",
          href: text.community_and_resources.LGLJoinVideo,
          icon: RiRecordCircleFill,
          color: "text-blue-600",
        },
        {
          name: "Telegram",
          href: text.community_and_resources.telegram,
          icon: FaTelegramPlane,
          color: "text-blue-500",
        },
        {
          name: "Governance",
          href: text.community_and_resources.governance,
          icon: FaBalanceScale,
          color: "text-purple-600",
        },
        {
          name: "Forum",
          href: text.community_and_resources.forum,
          icon: FaEnvelope,
          color: "text-[#36b0f7]",
        },
        {
          name: "Bridge",
          href: text.community_and_resources.bridge,
          icon: FaBridge,
          color: "text-[#000]",
        },
        {
          name: "Docs",
          href: text.community_and_resources.docs,
          icon: FaBook,
          color: "text-gray-700",
        },
        {
          name: "Mirror",
          href: text.community_and_resources.mirror,
          icon: GoMirror,
          color: "text-[#000]",
        },
        {
          name: "Github",
          href: text.community_and_resources.github,
          icon: FaGithub,
          color: "text-[#000]",
        },
        {
          name: "Discord",
          href: text.community_and_resources.discord,
          icon: FaDiscord,
          color: "text-[#5865F2]",
        },
        {
          name: "Block Explorer",
          href: text.community_and_resources.block_explorer,
          icon: SiHiveBlockchain,
          color: "text-[#000]",
        },
        {
          name: "Twitter",
          href: text.community_and_resources.twitter?.optimism,
          icon: FaXTwitter,
          color: "text-[#1DA1F2]",
        },
        {
          name: "Gov Twitter",
          href: text.community_and_resources.twitter?.gov,
          icon: FaXTwitter,
          color: "text-[#1DA1F2]",
        },
        {
          name: "Twitter",
          href: text.community_and_resources.twitter?.arbitrum,
          icon: FaXTwitter,
          color: "text-[#1DA1F2]",
        },
        {
          name: "Dao Twitter",
          href: text.community_and_resources.twitter?.dao,
          icon: FaXTwitter,
          color: "text-[#1DA1F2]",
        },
        {
          name: "Twitter",
          href: text.community_and_resources.twitter?.letsgrowdao,
          icon: FaXTwitter,
          color: "text-[#1DA1F2]",
        },
      ].filter((link) => link.href)
    : []; // Filter out links with no href

  const renderTechnologyFeatures = () => {
    if (!text?.technology?.features) return null;

    return (
      <ul className="space-y-4">
        {
          text.technology.features
            .map((item, index) => {
              // Type guard to check if item is a string or an object
              if (typeof item === "string") {
                return (
                  <li key={index} className="flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-200">{item}</span>
                  </li>
                );
              }

              // Handle object case
              if (
                typeof item === "object" &&
                "name" in item &&
                "description" in item
              ) {
                return (
                  <li key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-600">{item.name}</h4>
                    <p className="text-gray-200">{item.description}</p>
                  </li>
                );
              }

              // Return null for unhandled types
              return null;
            })
            .filter(Boolean) // Remove any null values
        }
      </ul>
    );
  };

  return (
    <div className="container mx-auto md:px-4 py-12">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center text-blue-shade-200"
        {...fadeInUp}
      >
        About {text?.display_text}
      </motion.h1>

      <motion.section className="mb-16" {...fadeInUp}>
        <h2 className="text-3xl font-semibold mb-6 text-blue-400">
          Mission and Vision
        </h2>
        <div className="bg-[#46464645] shadow-lg rounded-xl p-5 md:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-400">
              Mission:
            </h3>
            <p className="text-gray-200">{text?.mission_and_vision?.mission}</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-blue-400">
              Vision:
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              {text?.mission_and_vision?.vision?.map((item, index) => (
                <li key={index} className="text-gray-200">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>

      {text?.technology && (
        <motion.section className="mb-16" {...fadeInUp}>
          <h2 className="text-3xl font-semibold mb-6 text-blue-400">
            Technology
          </h2>
          <div className="bg-[#46464645] shadow-lg rounded-xl p-5 md:p-8">
            <p className="text-gray-200 mb-4">
              {text?.technology?.description}
            </p>
            {renderTechnologyFeatures()}
          </div>
        </motion.section>
      )}

      {text?.governance_and_dao_structure && (
        <motion.section className="mb-16" {...fadeInUp}>
          <h2 className="text-3xl font-semibold mb-6 text-blue-400">
            Governance and DAO Structure
          </h2>
          <div className="bg-[#46464645] shadow-lg rounded-xl p-5 md:p-8">
            <p className="text-gray-200 mb-4">
              {text?.governance_and_dao_structure?.description}
            </p>
            <ul className="space-y-4">
              {text?.governance_and_dao_structure?.elements
                ? text.governance_and_dao_structure.elements.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="border-l-4 border-purple-500 pl-4"
                      >
                        <h4 className="font-semibold text-purple-600">
                          {item.name}
                        </h4>
                        <p className="text-gray-200">{item.details}</p>
                      </li>
                    )
                  )
                : text?.governance_and_dao_structure?.houses
                ? text.governance_and_dao_structure.houses.map(
                    (item, index) => (
                      <li
                        key={index}
                        className="border-l-4 border-purple-500 pl-4"
                      >
                        <h4 className="font-semibold text-purple-600">
                          {item.name}
                        </h4>
                        <p className="text-gray-200">{item.details}</p>
                      </li>
                    )
                  )
                : null}
            </ul>
          </div>
        </motion.section>
      )}

      {text?.values && (
        <motion.section className="mb-16" {...fadeInUp}>
          <h2 className="text-3xl font-semibold mb-6 text-blue-800">Values</h2>
          <div className="bg-[#D9D9D945] shadow-lg rounded-xl p-5 md:p-8">
            {/* <p className="text-gray-700 mb-4">
            {text?.governance_and_dao_structure?.description}
          </p> */}
            <ul className="space-y-4">
              {/* {text?.values ? ( */}
              {text.values.value?.map((item, index) => (
                <li key={index} className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-600">
                    {item.title}
                  </h4>
                  <p className="text-gray-200">{item.description}</p>
                </li>
              ))}
              {/* ) : text?.governance_and_dao_structure?.houses ? (
              text.governance_and_dao_structure.houses.map((item, index) => (
                <li key={index} className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-600">{item.name}</h4>
                  <p className="text-gray-700">{item.details}</p>
                </li>
              ))
            ) : null} */}
            </ul>
          </div>
        </motion.section>
      )}

      <motion.section {...fadeInUp}>
        <h2 className="text-3xl font-semibold mb-6 text-blue-400">
          Community and Resources
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <motion.div
                className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <link.icon className={`${link.color} text-2xl`} />
                <span className="text-gray-700 font-medium">{link.name}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default AboutDao;
