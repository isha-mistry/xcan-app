"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Users, Video, BookOpen, Award, Star, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import ConnectYourWallet from "@/components/ComponentUtils/ConnectYourWallet";
import { useEffect, useState } from "react";
import { BASE_URL } from "@/config/constants";

export default function Home() {
  const router = useRouter();
  const { address } = useAccount();
  const { authenticated, user } = usePrivy();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [githubLinked, setGithubLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has valid wallet and GitHub
  const hasValidWallet = () => {
    const verifiedWallets = user?.linkedAccounts?.filter((account) => account.type === "wallet")?.map((account) => account.address) || [];
    return Boolean(address && verifiedWallets.includes(address));
  };

  useEffect(() => {
    const checkGithubStatus = async () => {
      if (address) {
        try {
          const response = await fetch(`${BASE_URL}/api/auth/github-status?address=${address}`);
          const data = await response.json();
          setGithubLinked(data.isLinked);
        } catch (error) {
          console.error("Error checking GitHub status:", error);
        }
      }
      setIsLoading(false);
    };

    // If no address, we can stop loading immediately
    if (!address) {
      setIsLoading(false);
    } else {
      checkGithubStatus();
    }
  }, [address]);

  useEffect(() => {
    // Always trigger the event and store in sessionStorage
    if (sessionStorage.getItem("inorbit_connect_prompt") === "hidden") {
      return;
    }
    sessionStorage.setItem("inorbit_connect_prompt", "shown");

    // Don't show modal while loading
    if (isLoading) {
      return;
    }

    // Show modal if not fully connected
    if (!authenticated || !hasValidWallet() || !githubLinked) {
      setShowConnectModal(true);
    } else {
      setShowConnectModal(false);
    }
  }, [authenticated, address, user, githubLinked, isLoading]);

  const handleCloseModal = () => {
    setShowConnectModal(false);
    sessionStorage.setItem("inorbit_connect_prompt", "hidden");
  };

  const handleProfileClick = () => {
    if (!authenticated || !address) {
      setShowConnectModal(true);
    } else {
      router.push(`/profile/${address}?active=info`);
    }
  };

  return (
    <main className="min-h-screen bg-dark-primary font-tektur relative">
      {/* Modal and Blur Overlay */}
      {showConnectModal && !isLoading && (
        <>
          <div className="fixed inset-0 z-40 backdrop-blur-md bg-black/40 transition-all" />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="relative w-full max-w-lg mx-auto">
              <ConnectYourWallet requireGitHub={true} showBg={false} closeModal={handleCloseModal} />
            </div>
          </div>
        </>
      )}
      {/* Hero Section */}
      <section className="min-h-[85vh] py-6 flex items-center justify-center overflow-hidden">
        {/* <div className="inset-0  opacity-50"></div> */}
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
                Welcome Inorbit
              </h1>
              <p className="text-xl text-dark-text-secondary mb-8 max-w-2xl">
                Your platform for meaningful expert sessions and lectures. Connect, learn, and grow with our community of experts and learners.
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
                  Go to Profile
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
