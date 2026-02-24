"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Users, Award, Video, Clock, TrendingUp, Star, Link, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import AnimatedCounter from "./AnimatedCounter";

interface StatisticsData {
  totalUsers: number;
  totalNFTs: number;
  totalSessions: number;
  totalOfficeHours: number;
  usersWithSocials: number;
  usersWithGithub: number;
  totalNFTsMinted: number;
  totalOrbitChains: number;
  totalAdvocates: number;
}

interface CachedStatistics {
  data: StatisticsData;
  timestamp: number;
}

type StatCard = {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  clickable?: boolean;
  route?: string;
} | {
  title: string;
  valueText: string;
  icon: React.ReactNode;
  description: string;
  clickable?: boolean;
  route?: string;
};

const CACHE_KEY = "inorbit_statistics";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Safe localStorage wrapper
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // Ignore errors
      }
    }
  },
};

const StatisticsSection = () => {
  const router = useRouter();
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatistics = useCallback(async (isBackgroundRefresh = false) => {
    if (isBackgroundRefresh) {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();

      if (data.success) {
        console.log("stats: ", data.data);
        setStats(data.data);

        // Cache the data
        const cacheData: CachedStatistics = {
          data: data.data,
          timestamp: Date.now(),
        };
        safeLocalStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Load cached data immediately
  useEffect(() => {
    const cachedData = safeLocalStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsed: CachedStatistics = JSON.parse(cachedData);
        const now = Date.now();

        // Check if cache is still valid
        if (now - parsed.timestamp < CACHE_DURATION) {
          setStats(parsed.data);
          setLoading(false);
          // Still fetch fresh data in background
          fetchStatistics(true);
          return;
        }
      } catch (e) {
        // Invalid cache, continue to fetch
      }
    }

    // No valid cache, fetch immediately
    fetchStatistics(false);
  }, [fetchStatistics]);

  const statsCards: StatCard[] = [
    {
      title: "Devs under training",
      value: stats?.usersWithGithub || 0,
      icon: <Users className="w-6 h-6 text-blue-400" />,
      description: "Devs with GitHub connected"
    },
    {
      title: "Devs trained",
      value: stats?.totalNFTs || 0,
      icon: <Award className="w-6 h-6 text-orange-400" />,
      description: "Unique NFT holders"
    },
    {
      title: "Certificates claimed as NFT",
      value: stats?.totalNFTsMinted || 0,
      icon: <Award className="w-6 h-6 text-green-400" />,
      description: "NFT minted"
    },
    {
      title: "Orbit chains launched",
      value: stats?.totalOrbitChains || 0,
      icon: <Link className="w-6 h-6 text-purple-400" />,
      description: "Total deployed chains",
      clickable: true,
      route: "/orbit-chains"
    },
    {
      title: "Stylus Advocates Trained",
      value: stats?.totalAdvocates || 0,
      icon: <GraduationCap className="w-6 h-6 text-cyan-400" />,
      description: "Certified Stylus advocates"
    }
    // Commented out for now
    // {
    //   title: "Live Sessions",
    //   value: stats?.totalSessions || 0,
    //   icon: <Video className="w-6 h-6" />,
    //   gradient: "from-purple-500 to-purple-600",
    //   description: "Expert-led sessions"
    // },
    // {
    //   title: "Expert Hours",
    //   value: stats?.totalOfficeHours || 0,
    //   icon: <Clock className="w-6 h-6" />,
    //   gradient: "from-orange-500 to-orange-600",
    //   description: "One-on-one mentoring"
    // }
  ];

  // Skeleton Loader Component
  const StatCardSkeleton = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 h-full"
    >
      {/* Icon skeleton */}
      <div className="mb-6 flex items-start justify-between">
        <div className="p-3 rounded-xl bg-white/10 border border-white/20">
          <div className="w-6 h-6 bg-white/20 rounded animate-pulse" />
        </div>
        <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
      </div>

      {/* Value skeleton */}
      <div className="mb-4">
        <div className="h-16 bg-white/20 rounded-lg animate-pulse mb-2" />
      </div>

      {/* Title skeleton */}
      <div className="h-6 bg-white/20 rounded animate-pulse mb-2 w-3/4" />

      {/* Description skeleton */}
      <div className="h-4 bg-white/10 rounded animate-pulse w-full" />
      <div className="h-4 bg-white/10 rounded animate-pulse w-2/3 mt-2" />
    </motion.div>
  );

  return (
    <section className="py-20 bg-[#07090D] relative overflow-hidden">
      {/* Background Pattern - Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-2 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-blue-100 font-bold text-[10px] uppercase tracking-[0.2em]">
              Platform Statistics
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-unbounded font-black mb-4 text-white tracking-[-0.04em]">
            Growing Together
          </h2>
          <p className="text-base md:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed font-medium">
            Join thousands of learners and experts who are already part of our thriving community
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <div className="relative">
          {/* Background Decorative Blobs */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {loading ? (
              // Show skeleton loaders while loading
              Array.from({ length: 5 }).map((_, index) => (
                <StatCardSkeleton key={`skeleton-${index}`} index={index} />
              ))
            ) : (
              // Show actual stats cards
              statsCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{
                    y: -8,
                    scale: 1.01,
                    transition: { duration: 0.4, ease: "easeOut" }
                  }}
                  onClick={() => {
                    if ("clickable" in card && card.clickable && "route" in card && card.route) {
                      router.push(card.route);
                    }
                  }}
                  className={`group relative bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 h-full hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-500 overflow-hidden ${"clickable" in card && card.clickable ? "cursor-pointer" : ""
                    }`}
                >
                  {/* Inner Glow Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon with accent */}
                  <div className="relative z-10 mb-6 flex items-start justify-between">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all duration-500">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {card.icon}
                      </div>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="relative z-10 mb-4">
                    {"valueText" in card && card.valueText ? (
                      <div className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tighter">
                        {String(card.valueText)}
                      </div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-3xl lg:text-4xl font-black font-mono text-white mb-1 leading-none tracking-tighter"
                      >
                        <AnimatedCounter value={"value" in card ? card.value : 0} duration={2} />
                        <span className="text-xl font-medium text-blue-400 ml-0.5">+</span>
                      </motion.div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="relative z-10 font-unbounded text-sm font-bold text-white/70 mb-2 group-hover:text-white transition-colors uppercase tracking-wider">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="relative z-10 text-white/30 text-[11px] font-medium leading-relaxed group-hover:text-white/50 transition-colors">
                    {card.description}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Refresh indicator */}
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-6"
          >
            <p className="text-blue-100 text-sm flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-100 border-t-transparent rounded-full animate-spin" />
              Refreshing statistics...
            </p>
          </motion.div>
        )}

        {/* Additional Stats Row */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                <AnimatedCounter value={stats?.totalSessions || 0} duration={1.5} />
              </div>
              <p className="text-blue-100">Total Sessions Created</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                <AnimatedCounter value={stats?.totalOfficeHours || 0} duration={1.5} />
              </div>
              <p className="text-blue-100">Total Office Hours</p>
            </div>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
};

export default StatisticsSection; 