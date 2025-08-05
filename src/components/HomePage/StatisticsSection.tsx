"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Users, Award, Video, Clock, TrendingUp, Star, Link } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface StatisticsData {
  totalUsers: number;
  totalNFTs: number;
  totalSessions: number;
  totalOfficeHours: number;
  usersWithSocials: number;
  totalNFTsMinted: number;
}

const StatisticsSection = () => {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();

      if (data.success) {
        console.log("stats: ",data.data);
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Users Onboarded",
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      gradient: "from-blue-500 to-blue-600",
      description: "Active community members"
    },
    {
      title: "NFTs Claimed",
      value: stats?.totalNFTsMinted || 0,
      icon: <Award className="w-6 h-6" />,
      gradient: "from-green-500 to-green-600",
      description: "Total achievements unlocked"
    },
    {
      title: "Social Connected",
      value: stats?.usersWithSocials || 0,
      icon: <Link className="w-6 h-6" />,
      gradient: "from-purple-500 to-purple-600",
      description: "Users with social profiles"
    },
    {
      title: "Unique NFT Holders",
      value: stats?.totalNFTs || 0,
      icon: <Award className="w-6 h-6" />,
      gradient: "from-orange-500 to-orange-600",
      description: "Users who claimed NFTs"
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

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-shade-400 to-blue-shade-300">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-dark-text-secondary mt-4">Loading statistics...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-shade-400 to-blue-shade-300">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
            <span className="text-white font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Platform Statistics
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Growing Together
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join thousands of learners and experts who are already part of our thriving community
          </p>
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-full hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                    {card.icon}
                  </div>
                  <Star className="w-5 h-5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="mb-2">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-white"
                  >
                    <AnimatedCounter value={card.value} duration={1.5} />+
                  </motion.div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {card.title}
                </h3>

                <p className="text-blue-100 text-sm">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

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