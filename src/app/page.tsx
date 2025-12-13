"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Users, Video, Star, User, Sparkles, Zap, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import StatisticsSection from "@/components/HomePage/StatisticsSection";
import DarkVeil from "@/components/HomePage/DarkVeil";

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
    <main className="min-h-screen bg-dark-primary font-robotoMono relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={2}
          noiseIntensity={0.02}
          scanlineIntensity={0.1}
          speed={1.5}
          scanlineFrequency={2.0}
          warpAmount={0.3}
          resolutionScale={1}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-blue-shade-400/50 via-blue-shade-300/40 to-dark-primary/70 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] pb-20 flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block bg-dark-tertiary/80 backdrop-blur-sm border border-blue-shade-100/30 px-8 py-3 rounded-full mb-8"
              >
                <span className="text-blue-200 font-medium flex items-center justify-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5" />
                  Join Our Growing Community
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-dark-text-primary"
              >
                Welcome Xcan
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl text-dark-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                Your platform for meaningful expert sessions and lectures. Connect, learn, and grow with our community of experts and learners.
              </motion.p>
            </motion.div>

            {/* Feature Highlights - Vertical Stack */}
            {/* <div className="space-y-4 mb-12">
              Live Lectures
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="group bg-dark-tertiary border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-blue-500 border-2 border-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Video className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Live Lectures
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      Join real-time sessions with industry experts and get your questions answered instantly.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="group bg-dark-tertiary border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-green-500 border-2 border-green-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Personalized Expert Sessions
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      Schedule one-on-one time with mentors for personalized guidance and support.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="group bg-dark-tertiary border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-blue-500 border-2 border-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Community Learning
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      Connect with peers, share experiences, and grow together in a supportive environment.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div> */}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-shade-100 to-blue-shade-200 text-white px-10 py-5 rounded-full font-semibold hover:from-blue-shade-200 hover:to-blue-shade-300 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-blue-shade-100/40 text-lg"
                href={`https://modules.xcan.dev/`}
                target="_blank"
              >
                <Star className="w-6 h-6" />
                Get Started
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-dark-tertiary/90 backdrop-blur-md border-2 border-white/20 text-dark-text-primary px-10 py-5 rounded-full font-semibold hover:bg-dark-accent/90 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl text-lg"
                onClick={handleProfileClick}
              >
                <User className="w-6 h-6" />
                {authenticated && address ? 'Go to Profile' : 'Explore Dashboard'}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <div className="relative z-10">
        <StatisticsSection />
      </div>

      {/* Features Section - Differentiated Design */}
      <section className="relative z-10 py-24 bg-dark-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="inline-block bg-dark-tertiary/80 backdrop-blur-sm border border-blue-shade-100/30 px-8 py-3 rounded-full mb-8">
              <span className="text-blue-200 font-semibold flex items-center justify-center gap-2 text-lg">
                <Zap className="w-5 h-5" />
                Platform Capabilities
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-dark-text-primary">
              Powerful Features
            </h2>
            <p className="text-xl md:text-2xl text-dark-text-secondary max-w-3xl mx-auto leading-relaxed">
              Everything you need to learn, connect, and grow in one comprehensive platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sessions Feature - Blue */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-dark-tertiary border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300"
            >
              {/* Large faded background icon */}
              <div className="absolute top-4 right-4 w-32 h-32 opacity-10 group-hover:opacity-15 transition-opacity">
                <Video className="w-full h-full text-blue-500" />
              </div>

              <div className="relative">
                {/* Small icon container with connecting line */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Live Lectures
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Join interactive sessions with experts and community members in real-time.
                </p>
              </div>
            </motion.div>

            {/* Office Hours Feature - Green */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="group relative bg-dark-tertiary border border-white/10 rounded-2xl p-8 hover:border-green-500/30 transition-all duration-300"
            >
              {/* Large faded background icon */}
              <div className="absolute top-4 right-4 w-32 h-32 opacity-10 group-hover:opacity-15 transition-opacity">
                <Clock className="w-full h-full text-green-500" />
              </div>

              <div className="relative">
                {/* Small icon container with connecting line */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Expert Sessions
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Schedule one-on-one time with mentors and experts for personalized guidance.
                </p>
              </div>
            </motion.div>

            {/* Calendar Feature - Purple */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8 }}
              className="group relative bg-dark-tertiary border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300"
            >
              {/* Large faded background icon */}
              <div className="absolute top-4 right-4 w-32 h-32 opacity-10 group-hover:opacity-15 transition-opacity">
                <Calendar className="w-full h-full text-purple-500" />
              </div>

              <div className="relative">
                {/* Small icon container with connecting line */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Easy Scheduling
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Book and manage your sessions with our intuitive calendar system.
                </p>
              </div>
            </motion.div>

            {/* Community Feature - Cyan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -8 }}
              className="group relative bg-dark-tertiary border border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300"
            >
              {/* Large faded background icon */}
              <div className="absolute top-4 right-4 w-32 h-32 opacity-10 group-hover:opacity-15 transition-opacity">
                <Users className="w-full h-full text-cyan-500" />
              </div>

              <div className="relative">
                {/* Small icon container with connecting line */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Community
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Connect with like-minded individuals and grow together in a supportive environment.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-dark-primary via-blue-shade-400 to-dark-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block bg-gradient-to-r from-blue-shade-100/20 to-purple-500/20 backdrop-blur-sm border border-blue-shade-100/30 px-6 py-2.5 rounded-full mb-8"
            >
              <span className="text-blue-200 font-medium flex items-center justify-center gap-2">
                <Globe className="w-4 h-4" />
                Join the Revolution
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-bold text-dark-text-primary mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-dark-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Join our community today and start participating in expert sessions and lectures. Transform your learning journey with us.
            </p>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-shade-100 to-blue-shade-200 text-white px-10 py-5 rounded-full font-semibold hover:from-blue-shade-200 hover:to-blue-shade-300 transition-all duration-300 shadow-2xl shadow-blue-shade-100/40 text-lg"
              href={`https://modules.xcan.dev/`}
              target="_blank"
            >
              <Star className="w-6 h-6" />
              Get Started Now
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
