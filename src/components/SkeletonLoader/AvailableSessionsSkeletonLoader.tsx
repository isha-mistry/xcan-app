import React from "react";
import { motion } from "framer-motion";

const AvailableSessionsSkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 1.5lg:grid-cols-2 2xl:grid-cols-2 gap-8 py-5 px-6 md:px-10 font-robotoMono">
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="relative overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[32px] p-6 flex flex-col gap-6 group"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>

          <div className="flex gap-6 items-start">
            {/* Avatar Skeleton */}
            <div className="size-28 sm:size-32 shrink-0 rounded-[28px] bg-white/5 border border-white/10 animate-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            </div>

            <div className="flex-1 space-y-4">
              {/* Header Info */}
              <div className="space-y-2">
                <div className="h-6 bg-white/10 rounded-lg w-48 animate-pulse"></div>
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-white/5 rounded-full w-24 animate-pulse"></div>
                  <div className="size-1 rounded-full bg-white/10"></div>
                  <div className="h-4 bg-white/5 rounded-full w-20 animate-pulse"></div>
                </div>
              </div>

              {/* Tags/Categories */}
              <div className="flex flex-wrap gap-2">
                <div className="h-8 bg-white/5 rounded-full w-20 animate-pulse"></div>
                <div className="h-8 bg-white/5 rounded-full w-24 animate-pulse"></div>
                <div className="h-8 bg-white/5 rounded-full w-16 animate-pulse"></div>
              </div>
            </div>

            {/* Price Badge */}
            <div className="hidden sm:block">
              <div className="h-8 w-16 bg-primary/10 border border-primary/20 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Footer/Action Section */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-5 rounded-full bg-white/10 animate-pulse"></div>
              <div className="h-5 bg-white/5 rounded-full w-40 animate-pulse"></div>
            </div>
            <div className="h-12 w-44 bg-primary/20 hover:bg-primary/30 rounded-2xl animate-pulse transition-colors"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AvailableSessionsSkeletonLoader;

