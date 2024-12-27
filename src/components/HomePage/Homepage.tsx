"use client"
import React, { useState } from 'react'
import { motion } from "framer-motion"
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
  return (
    <>
    <PageBackgroundPattern />
    <div className="h-[calc(100vh-60px)] w-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
    <div className="flex flex-col 1.5md:flex-row max-w-6xl mx-auto gap-8 items-center 1.5md:h-[400px]">
      {/* Left Card - Join as Delegate */}
      <div className="flex items-center group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg h-full transition-all duration-700 ease-in-out hover:shadow-2xl hover:transform hover:scale-105">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent transition-opacity duration-500"></div>
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent transition-opacity duration-500"></div>
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
  <>
  </>
  </>
  )
}

export default Homepage
