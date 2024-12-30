"use client"
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight } from 'lucide-react'
import Link from "next/link"
import PageBackgroundPattern from '../ComponentUtils/PageBackgroundPattern'
import { IoArrowForward } from 'react-icons/io5'
import delegate from '@/assets/images/Homepage/daos.svg'
import user from '@/assets/images/Homepage/human.svg'
import Image from 'next/image'
const Homepage = () => {
     const [isButtonHovered, setIsButtonHovered] = useState(false);
     const [isButtonHoveredTwo, setIsButtonHoveredTwo] = useState(false);
     const [currentIndex, setCurrentIndex] = useState(0);

  const features = [
    {
      title: "Share on Warpcast",
      description: "Share your delegate profile on Warpcast with a single click and attract delegations effortlessly.",
      buttonText: "Generate Link"
    },
    {
      title: "Build Your Credibility",
      description: "Earn attestations for every session you host or attend.",
      buttonText: "Book Session"
    },
    {
      title: "Turn Sessions into Earnings",
      description: "As a Delegate Host impactful sessions and earn every time someone mints your session NFT.",
      buttonText: "Schedule Now"
    },
    {
      title: "Grow and Earn More",
      description: "Refer creators or users to Chora Club and earn rewards for every mint and engagement.",
      buttonText: "Learn How to Earn"
    }
  ];

   // Auto-rotate every 5 seconds
   useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Handle dot navigation
  const handleDotClick = (index:number) => {
    setCurrentIndex(index);
  };
  return (
    <div className='h-[calc(100vh-60px)]'>
    <PageBackgroundPattern />
    <div className='flex flex-col justify-between h-full'>

    <div className="h-[calc(70vh-60px)] w-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
    <div className="flex flex-col 1.5md:flex-row max-w-6xl mx-auto gap-8 items-center 1.5md:h-[400px]">
      {/* Left Card - Join as Delegate */}
      <div className="flex items-center group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg h-full transition-all duration-700 ease-in-out hover:shadow-2xl hover:transform hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <Image src={delegate} alt="" className="size-28"/>
          <h2 className="text-2xl font-bold text-gray-800">Join as Delegate</h2>
          <p className="text-gray-600 max-w-sm">
            Become a delegate and help shape the future of decentralized governance. Lead, propose, and make impactful decisions.
          </p>
          <Link
          href="https://mirror.xyz/0x30d644CBf785167D8CaBcB35602959E19D9004Db"
          className="mt-4 "
          target="_blank"
        >
          <motion.button
            className="w-[200px] bg-gradient-to-r from-[#3b82f6] to-[#31316d] text-white font-medium py-2.5 px-4 rounded-3xl overflow-hidden relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            <div className="flex items-center justify-center space-x-2">
              <motion.span
                animate={{ x: isButtonHovered ? -10 : 0 }}
                transition={{ duration: 0.3 }}
              >
                Get Started
              </motion.span>
              <motion.div
                animate={{
                  x: isButtonHovered ? 5 : 0,
                  opacity: isButtonHovered ? 1 : 0.7,
                }}
                transition={{ duration: 0.3 }}
              >
                <IoArrowForward size={20} />
              </motion.div>
            </div>
          </motion.button>
        </Link>
        </div>
      </div>

      {/* Right Card - Join as User */}
      <div className="flex items-center group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg h-full transition-all duration-700 ease-in-out hover:shadow-2xl hover:transform hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <Image src={user} alt="" className="size-28"/>
          <h2 className="text-2xl font-bold text-gray-800">Join as User</h2>
          <p className="text-gray-600 max-w-sm">
            Participate in governance, vote on proposals, and be part of a thriving decentralized community.
          </p>
          <Link
          href="https://mirror.xyz/0x30d644CBf785167D8CaBcB35602959E19D9004Db"
          className="mt-4 "
          target="_blank"
        >
          <motion.button
            className="w-[200px] bg-gradient-to-r from-[#3b82f6] to-[#31316d] text-white font-medium py-2.5 px-4 rounded-3xl overflow-hidden relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setIsButtonHoveredTwo(true)}
            onMouseLeave={() => setIsButtonHoveredTwo(false)}
          >
            <div className="flex items-center justify-center space-x-2">
              <motion.span
                animate={{ x: isButtonHoveredTwo ? -10 : 0 }}
                transition={{ duration: 0.3 }}
              >
                Get Started
              </motion.span>
              <motion.div
                animate={{
                  x: isButtonHoveredTwo ? 5 : 0,
                  opacity: isButtonHoveredTwo ? 1 : 0.7,
                }}
                transition={{ duration: 0.3 }}
              >
                <IoArrowForward size={20} />
              </motion.div>
            </div>
          </motion.button>
        </Link>
        </div>
      </div>
    </div>
  </div>

  {/* carousel */}
  <div className="relative h-[30vh] w-full overflow-hidden bg-gradient-to-br from-indigo-50 to-transparent">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 1000 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -1000 }}
          transition={{ duration: 0.5 }}
          className="h-full w-full"
        >
          <div className="flex h-full w-full items-center justify-center px-4">
            <div className="max-w-4xl w-full  rounded-xl  p-8">
              <div className="flex items-center text-center space-y-4 justify-between">
                <h2 className="text-6xl max-w-[330px] font-bold text-gray-800">
                  {features[currentIndex].title}
                </h2>
                <div className='flex flex-col items-center'>
                <p className="text-gray-600 max-w-md">
                  {features[currentIndex].description}
                </p>
                <button className="mt-4 w-fit bg-gradient-to-r from-[#3b82f6] to-[#31316d] text-white font-medium py-2.5 px-6 rounded-full hover:scale-105 transition-transform duration-200">
                  {features[currentIndex].buttonText}
                </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-blue-600 w-6'
                : 'bg-gray-400 hover:bg-gray-600'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  </div>
  </div>
  )
}

export default Homepage
