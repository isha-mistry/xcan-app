"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Users, Video, BookOpen, Award, Star, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import StatisticsSection from "@/components/HomePage/StatisticsSection";

export default function Home() {
  const router = useRouter();
  const { address } = useAccount();
  const { authenticated } = usePrivy();

  const handleProfileClick = () => {
    if (!authenticated || !address) {
      router.push('/dashboard');
    } else {
      router.push(`/profile/${address}?active=info`);
    }
  };

  return (
    <main className="min-h-screen bg-dark-primary font-tektur relative">
      {/* Hero Section */}
      <section className="min-h-[85vh] py-6 flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <div className="inline-block bg-blue-950 px-4 py-2 rounded-full mb-6">
                <span className="text-blue-200 font-medium">Join Our Growing Community</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-dark-text-primary mb-6 leading-tight">
                Welcome Xcan
              </h1>
              <p className="text-xl text-dark-text-secondary mb-8 max-w-2xl">
                Your platform for meaningful expert sessions and lectures. Connect, learn, and grow with our community of experts and learners.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-shade-100 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-shade-300 transition-colors flex items-center justify-center gap-2"
                  href={`https://inorbit-modules.vercel.app/`}
                  target="_blank"
                >
                  <Star className="w-5 h-5" />
                  Get Started
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-dark-tertiary text-dark-text-primary px-8 py-3 rounded-full font-semibold hover:bg-dark-accent transition-colors flex items-center justify-center gap-2"
                  onClick={handleProfileClick}
                >
                  <User className="w-5 h-5" />
                  {authenticated && address ? 'Go to Profile' : 'Explore Dashboard'}
                </motion.button>
              </div>
            </motion.div>

            {/* Right Content - Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 gap-4"
            >
              <div className="bg-dark-tertiary p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-900/50 p-3 rounded-lg">
                    <Video className="w-6 h-6 text-blue-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Live Lectures</h3>
                    <p className="text-dark-text-secondary">Join real-time sessions with industry experts and get your questions answered instantly.</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-tertiary p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="bg-green-shade-100/20 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-green-shade-100" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Personalized Expert Sessions</h3>
                    <p className="text-dark-text-secondary">Schedule one-on-one time with mentors for personalized guidance and support.</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-tertiary p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-900/50 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-blue-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Community Learning</h3>
                    <p className="text-dark-text-secondary">Connect with peers, share experiences, and grow together in a supportive environment.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <StatisticsSection />

      {/* Features Section */}
      <section className="py-20 bg-blue-shade-400">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-dark-text-primary text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Sessions Feature */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-dark-tertiary p-6 rounded-xl shadow-lg"
            >
              <div className="bg-blue-shade-400 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-2">
                Live Lectures
              </h3>
              <p className="text-dark-text-secondary">
                Join interactive sessions with experts and community members.
              </p>
            </motion.div>

            {/* Office Hours Feature */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-dark-tertiary p-6 rounded-xl shadow-lg"
            >
              <div className="bg-green-shade-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-2">
                Expert Sessions
              </h3>
              <p className="text-dark-text-secondary">
                Schedule one-on-one time with mentors and experts.
              </p>
            </motion.div>

            {/* Calendar Feature */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-dark-tertiary p-6 rounded-xl shadow-lg"
            >
              <div className="bg-blue-shade-300 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-2">
                Easy Scheduling
              </h3>
              <p className="text-dark-text-secondary">
                Book and manage your sessions with our intuitive calendar.
              </p>
            </motion.div>

            {/* Community Feature */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-dark-tertiary p-6 rounded-xl shadow-lg"
            >
              <div className="bg-blue-shade-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-2">
                Community
              </h3>
              <p className="text-dark-text-secondary">
                Connect with like-minded individuals and grow together.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-shade-300">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-dark-text-primary mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            Join our community today and start participating in expert sessions and lectures.
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-shade-100 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-shade-300 transition-colors"
            href={`https://inorbit-modules.vercel.app/`}
            target="_blank"
          >
            Get Started
          </motion.a>
        </div>
      </section>
    </main>
  );
}
