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
  usersWithGithub: number;
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
        console.log("stats: ", data.data);
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
      valueText: "Coming soon",
      icon: <Link className="w-6 h-6 text-purple-400" />,
      description: ""
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
    <section className="py-24 bg-gradient-to-b from-blue-shade-400 via-blue-shade-300 to-blue-shade-400 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-block bg-dark-tertiary/80 backdrop-blur-sm border border-white/20 px-8 py-3 rounded-full mb-8">
            <span className="text-white font-semibold flex items-center justify-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Platform Statistics
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Growing Together
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
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
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 h-full hover:bg-white/15 hover:border-white/30 transition-all duration-300"
            >
              {/* Icon with accent */}
              <div className="mb-6 flex items-start justify-between">
                <div className="p-3 rounded-xl bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors">
                  {card.icon}
                </div>
                <Star className="w-5 h-5 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Value */}
              <div className="mb-4">
                {"valueText" in card ? (
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {card.valueText}
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 leading-none"
                  >
                    <AnimatedCounter value={card.value} duration={1.5} />
                    <span className="text-3xl md:text-4xl">+</span>
                  </motion.div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-blue-100 text-sm leading-relaxed">
                {card.description}
              </p>
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