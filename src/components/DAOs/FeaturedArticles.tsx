import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IoArrowForward } from "react-icons/io5";
import article1 from "@/assets/images/feature-article/article1.png";
import article2 from "@/assets/images/feature-article/article2.png";
import article3 from "@/assets/images/feature-article/article3.png";
import ArticleCard from "./ArticleCard";

function FeaturedArticles() {
  const articles = [
    {
      title: "How to Get Involved with DAOs: A Beginner's Guide",
      description:
        "Decentralized Autonomous Organizations (DAOs) are revolutionizing the world of blockchain and cryptocurrencies. These organizations are run by code, without a centralized authority, and governed by token holders who make collective decisions on various proposals. DAOs are gaining popularity due to their decentralized nature, transparency, and democratic governance.",
      link: "https://mirror.xyz/0x30d644CBf785167D8CaBcB35602959E19D9004Db/IfqhHYb0A-VTP2AuyhobSVH-N50iI6S22wfJitLc9CY",
      image: article1,
    },
    {
      title: "Understanding Proposals and Voting Mechanisms in DAOs",
      description:
        "Decentralized Autonomous Organizations, known as DAOs, have emerged as innovative entities in the world of digital governance. Unlike traditional organizations where power is concentrated in the hands of a select few, DAOs distribute decision-making authority among their participants.",
      link: "https://mirror.xyz/0x30d644CBf785167D8CaBcB35602959E19D9004Db/fH-2OeNYzqhRqUtMfCx74AVUtm8KitxAIfzXIDvTAV0",
      image: article2,
    },
    {
      title: "Crafting Effective DAO Proposals for Community Success",
      description:
        "Decentralized Autonomous Organizations (DAOs) empower communities to collaborate and make decisions without traditional hierarchical structures. At the heart of DAOs lie proposals—formalized ideas presented to the community for consideration and action.",
      link: "https://mirror.xyz/0x30d644CBf785167D8CaBcB35602959E19D9004Db/rfX3WLg-Ec20h-eES2DyycmelKC-bZpk4u_hYd_zYNc",
      image: article3,
    },
  ];

  const [isButtonHovered, setIsButtonHovered] = useState(false);
  return (
    <div className="w-full px-4 md:px-6 lg:px-14 pb-16 mt-8 font-poppins">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-[#3737d5] font-medium text-2xl xs:text-3xl md:text-4xl mb-8 flex justify-center"
      >
        Featured Articles
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:w-[95%] 2md:w-[85%] gap-6 2xl:w-[65%] mx-auto mb-5"
      >
        {articles.map((article, index) => (
          <ArticleCard key={index} article={article} index={index} />
        ))}
      </motion.div>
      <div className="flex justify-center">
        <Link
          href="https://mirror.xyz/0x30d644CBf785167D8CaBcB35602959E19D9004Db"
          className="mt-4 "
          target="_blank"
        >
          <motion.button
            className="w-[200px] bg-gradient-to-r from-[#3b82f6] to-[#31316d] text-white font-medium py-2.5 px-4 rounded-3xl overflow-hidden relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            <div className="flex items-center justify-center space-x-2">
              <motion.span
                animate={{ x: isButtonHovered ? -10 : 0 }}
                transition={{ duration: 0.3 }}
              >
                Read More
              </motion.span>
              <motion.div
                animate={{
                  x: isButtonHovered ? 5 : 0,
                  opacity: isButtonHovered ? 1 : 0.7,
                }}
                transition={{ duration: 0.3 }}
              >
                <IoArrowForward size={20} />
              </motion.div>
            </div>
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
export default FeaturedArticles;
