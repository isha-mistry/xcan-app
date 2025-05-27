"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Users, Video, BookOpen, Award, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function Home() {
  const router = useRouter();
  const { address } = useAccount();

  return (
    <main className="min-h-screen bg-dark-primary font-tektur">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] py-6 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-secondary to-dark-primary opacity-50"></div>
        <div className="container mx-auto px-4 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <div className="inline-block bg-blue-shade-400/10 px-4 py-2 rounded-full mb-6">
                <span className="text-blue-shade-100 font-medium">Join Our Growing Community</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-dark-text-primary mb-6 leading-tight">
                Welcome to Arbitrum University
              </h1>
              <p className="text-xl text-dark-text-secondary mb-8 max-w-2xl">
                Your platform for meaningful sessions and office hours. Connect, learn, and grow with our community of experts and learners.
              </p>

              {/* Stats */}
              {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-dark-tertiary p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-shade-100" />
                    <span className="text-dark-text-secondary">Active Users</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-text-primary">10K+</p>
                </div>
                <div className="bg-dark-tertiary p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5 text-green-shade-100" />
                    <span className="text-dark-text-secondary">Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-text-primary">500+</p>
                </div>
                <div className="bg-dark-tertiary p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-shade-300" />
                    <span className="text-dark-text-secondary">Courses</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-text-primary">50+</p>
                </div>
                <div className="bg-dark-tertiary p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span className="text-dark-text-secondary">Experts</span>
                  </div>
                  <p className="text-2xl font-bold text-dark-text-primary">100+</p>
                </div>
              </div> */}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-shade-100 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-shade-300 transition-colors flex items-center justify-center gap-2"
                  onClick={() => router.push(`/profile/${address}?active=info`)}
                >
                  <Star className="w-5 h-5" />
                  Get Started
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-dark-tertiary text-dark-text-primary px-8 py-3 rounded-full font-semibold hover:bg-dark-accent transition-colors flex items-center justify-center gap-2"
                  onClick={() => router.push(`/profile/${address}?active=info`)}
                >
                  <Calendar className="w-5 h-5" />
                  View Schedule
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
                  <div className="bg-blue-shade-400/20 p-3 rounded-lg">
                    <Video className="w-6 h-6 text-blue-shade-100" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Live Interactive Sessions</h3>
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
                    <h3 className="text-xl font-semibold text-dark-text-primary mb-2">Personalized Office Hours</h3>
                    <p className="text-dark-text-secondary">Schedule one-on-one time with mentors for personalized guidance and support.</p>
                  </div>
                </div>
              </div>
              <div className="bg-dark-tertiary p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-shade-300/20 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-blue-shade-300" />
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

      {/* Features Section */}
      <section className="py-20 bg-dark-secondary">
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
                Live Sessions
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
                Office Hours
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
      <section className="py-20 bg-dark-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-dark-text-primary mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            Join our community today and start participating in sessions and office hours.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-shade-100 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-shade-300 transition-colors"
            onClick={() => router.push(`/profile/${address}?active=info`)}
          >
            Get Started
          </motion.button>
        </div>
      </section>
    </main>
  );
}
