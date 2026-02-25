import React from "react";
import { motion } from "framer-motion";

const RecordedSessionsSkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 py-8 font-robotoMono">
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="relative overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[32px] group"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>

          {/* Thumbnail Skeleton */}
          <div className="w-full h-48 bg-white/5 animate-pulse border-b border-white/10"></div>

          <div className="p-5 space-y-4">
            {/* Badges/Tags Skeleton */}
            <div className="flex gap-3">
              <div className="h-5 bg-white/10 rounded-full w-20 animate-pulse"></div>
              <div className="h-5 bg-white/10 rounded-full w-24 animate-pulse"></div>
            </div>

            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="h-5 bg-white/10 rounded-lg w-full animate-pulse"></div>
              <div className="h-5 bg-white/10 rounded-lg w-2/3 animate-pulse"></div>
            </div>

            {/* User Info Skeleton */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-white/10 animate-pulse"></div>
                <div className="h-4 bg-white/5 rounded-full w-24 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-white/10 animate-pulse"></div>
                <div className="h-4 bg-white/5 rounded-full w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RecordedSessionsSkeletonLoader;

