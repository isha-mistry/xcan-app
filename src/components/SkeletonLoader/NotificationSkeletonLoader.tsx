import React from "react";
import { motion } from "framer-motion";

const NotificationSkeletonLoader = () => {
  return (
    <div className="space-y-4 w-full mx-auto">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="relative overflow-hidden bg-white/[0.03] backdrop-blur-md border border-white/10 p-5 rounded-[24px] flex items-center gap-5 group"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent"></div>

          {/* Icon Skeleton */}
          <div className="relative">
            <div className="size-12 rounded-[16px] bg-white/5 border border-white/10 animate-pulse"></div>
            <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-white/10 border-2 border-[#0B0B0B] animate-pulse"></div>
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-4 bg-white/10 rounded-full w-32 animate-pulse"></div>
              <div className="size-1 rounded-full bg-white/20"></div>
              <div className="h-3 bg-white/5 rounded-full w-20 animate-pulse"></div>
            </div>
            <div className="h-5 bg-white/10 rounded-lg w-full max-w-md animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded-lg w-full max-w-sm animate-pulse"></div>
          </div>

          {/* Action/Time Skeleton */}
          <div className="hidden sm:flex flex-col items-end gap-2">
            <div className="h-8 w-24 bg-primary/10 border border-primary/20 rounded-xl animate-pulse"></div>
            <div className="h-3 w-16 bg-white/5 rounded-full animate-pulse"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NotificationSkeletonLoader;
