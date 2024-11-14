import Image, { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import React from "react";
import Link from "next/link";
interface Article {
  title: string;
  description: string;
  link: string;
  image: StaticImageData;
}

interface ArticleCardProps {
  article: Article;
  index: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index }) => {
  return (
    <Link href={article.link || ""} passHref target="_blank" className="z-10">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer"
      >
        <div className="relative overflow-hidden">
          <div className="w-full">
            <Image
              src={article.image}
              alt=""
              className="object-cover w-full transform transition-transform duration-300"
            />
          </div>
        </div>

        <div className="p-6 md:p-4 1.3lg:p-6 flex flex-col h-full">
          <h3 className="font-semibold mb-3 text-gray-800 text-left line-clamp-2 hover:text-blue-600">
            {article.title}
          </h3>

          <div className="text-gray-600 text-[13px] text-left">
            <p className="line-clamp-3">{article.description}</p>
            <motion.span
              whileHover={{ x: 5 }}
              className="text-blue-600 inline-block mt-2 cursor-pointer hover:text-blue-700"
            >
              ...read more
            </motion.span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ArticleCard;
